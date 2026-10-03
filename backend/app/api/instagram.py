import logging
import secrets
import time
from datetime import datetime, timezone
from urllib.parse import urlencode, urlparse

import httpx
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import text

from app.api.linkedin import (
    SESSION_COOKIE,
    SESSION_TTL_SECONDS,
    _hash,
    _request_session_id,
    _token_cipher,
)
from app.core.config import settings
from app.database.db import get_db

logger = logging.getLogger("copyforge.instagram")
router = APIRouter()
STATE_TTL_SECONDS = 600
AUTHORIZE_URL = "https://www.instagram.com/oauth/authorize"
TOKEN_URL = "https://api.instagram.com/oauth/access_token"
LONG_LIVED_TOKEN_URL = "https://graph.instagram.com/access_token"
PROFILE_URL = "https://graph.instagram.com/me"
SCOPES = ("instagram_business_basic", "instagram_business_content_publish")


def _frontend_redirect(
    result: str,
    reason: str | None = None,
    session_id: str | None = None,
) -> RedirectResponse:
    query = {"instagram": result}
    if reason:
        query["reason"] = reason
    destination = f"{settings.FRONTEND_ORIGIN}/social/instagram?{urlencode(query)}"
    if session_id:
        destination = f"{destination}#session={session_id}"
    return RedirectResponse(destination, status_code=302)


async def _active_user_id(session_id: str | None) -> str | None:
    if not session_id:
        return None
    async with get_db() as db:
        row = (
            await db.execute(
                text(
                    """
                    SELECT user_id FROM user_sessions
                    WHERE session_hash = :session_hash AND expires_at > :now
                    """
                ),
                {"session_hash": _hash(session_id), "now": int(time.time())},
            )
        ).first()
    return str(row[0]) if row else None


@router.get("/auth/instagram")
async def start_instagram_oauth(request: Request):
    if not settings.META_CONFIGURED:
        return _frontend_redirect("not_configured")
    session_id = _request_session_id(request)
    user_id = await _active_user_id(session_id)
    if not session_id or not user_id:
        return _frontend_redirect("failed", "sign_in_required")

    state = secrets.token_urlsafe(32)
    async with get_db() as db:
        await db.execute(
            text("DELETE FROM oauth_states WHERE expires_at <= :now"),
            {"now": int(time.time())},
        )
        await db.execute(
            text(
                """
                INSERT INTO oauth_states (provider, state_hash, session_hash, expires_at)
                VALUES ('instagram', :state_hash, :session_hash, :expires_at)
                """
            ),
            {
                "state_hash": _hash(state),
                "session_hash": _hash(session_id),
                "expires_at": int(time.time()) + STATE_TTL_SECONDS,
            },
        )
    query = urlencode({
        "client_id": settings.META_APP_ID,
        "redirect_uri": settings.META_REDIRECT_URI,
        "response_type": "code",
        "scope": ",".join(SCOPES),
        "state": state,
        "enable_fb_login": "0",
        "force_authentication": "1",
    })
    response = RedirectResponse(f"{AUTHORIZE_URL}?{query}", status_code=302)
    response.set_cookie(
        SESSION_COOKIE,
        session_id,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=SESSION_TTL_SECONDS,
        path="/",
    )
    return response


async def _consume_state(state: str, session_hash: str) -> bool:
    async with get_db() as db:
        row = (
            await db.execute(
                text(
                    """
                    DELETE FROM oauth_states
                    WHERE provider = 'instagram' AND state_hash = :state_hash
                    RETURNING session_hash, expires_at
                    """
                ),
                {"state_hash": _hash(state)},
            )
        ).mappings().first()
    return bool(
        row
        and int(row["expires_at"]) > int(time.time())
        and secrets.compare_digest(str(row["session_hash"]), session_hash)
    )


@router.get("/auth/instagram/callback")
async def instagram_oauth_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    session_id = request.cookies.get(SESSION_COOKIE)
    if not session_id or not state or not await _consume_state(state, _hash(session_id)):
        return _frontend_redirect("failed", "state")
    if error or not code:
        return _frontend_redirect("failed", "authorization")
    user_id = await _active_user_id(session_id)
    if not user_id:
        return _frontend_redirect("failed", "sign_in_required")

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            short_token_response = await client.post(
                TOKEN_URL,
                data={
                    "client_id": settings.META_APP_ID,
                    "client_secret": settings.META_APP_SECRET,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.META_REDIRECT_URI,
                    "code": code,
                },
            )
            short_token_response.raise_for_status()
            short_token_data = short_token_response.json()
            short_token = short_token_data.get("access_token")
            if not isinstance(short_token, str) or not short_token:
                return _frontend_redirect("failed", "token")

            long_token_response = await client.get(
                LONG_LIVED_TOKEN_URL,
                params={
                    "grant_type": "ig_exchange",
                    "client_secret": settings.META_APP_SECRET,
                    "access_token": short_token,
                },
            )
            long_token_response.raise_for_status()
            long_token_data = long_token_response.json()
            access_token = long_token_data.get("access_token")
            expires_in = long_token_data.get("expires_in")
            if (
                not isinstance(access_token, str)
                or not access_token
                or not isinstance(expires_in, (int, float))
                or expires_in <= 0
            ):
                return _frontend_redirect("failed", "token")

            profile_response = await client.get(
                PROFILE_URL,
                params={"fields": "user_id,username", "access_token": access_token},
            )
            profile_response.raise_for_status()
            profile = profile_response.json()
            instagram_user_id = profile.get("user_id")
            username = profile.get("username")
            if not isinstance(instagram_user_id, (str, int)) or not isinstance(username, str):
                return _frontend_redirect("failed", "profile")

        encrypted_token = _token_cipher().encrypt(access_token.encode("utf-8")).decode("ascii")
        connected_at = datetime.now(timezone.utc).isoformat()
        async with get_db() as db:
            await db.execute(
                text(
                    """
                    INSERT INTO social_accounts (
                        user_id, platform, provider_user_id, display_name, profile_image,
                        access_token_ciphertext, token_expires_at, connected_at
                    ) VALUES (
                        :user_id, 'instagram', :provider_user_id, :display_name, NULL,
                        :access_token_ciphertext, :token_expires_at, :connected_at
                    )
                    ON CONFLICT(user_id, platform) DO UPDATE SET
                        provider_user_id = excluded.provider_user_id,
                        display_name = excluded.display_name,
                        access_token_ciphertext = excluded.access_token_ciphertext,
                        token_expires_at = excluded.token_expires_at,
                        connected_at = excluded.connected_at
                    """
                ),
                {
                    "user_id": user_id,
                    "provider_user_id": str(instagram_user_id),
                    "display_name": username,
                    "access_token_ciphertext": encrypted_token,
                    "token_expires_at": int(time.time() + expires_in),
                    "connected_at": connected_at,
                },
            )
        return _frontend_redirect("connected", session_id=session_id)
    except httpx.TimeoutException:
        logger.warning("Instagram OAuth request timed out.")
        return _frontend_redirect("failed", "network")
    except httpx.HTTPStatusError as error:
        logger.warning("Instagram OAuth provider returned HTTP %s.", error.response.status_code)
        return _frontend_redirect("failed", "provider")
    except httpx.RequestError:
        logger.warning("Instagram OAuth provider request failed.")
        return _frontend_redirect("failed", "network")
    except (ValueError, TypeError):
        logger.warning("Instagram OAuth provider returned an invalid response.")
        return _frontend_redirect("failed", "provider")


@router.get("/api/social/instagram/status")
async def instagram_status(request: Request):
    session_id = _request_session_id(request)
    user_id = await _active_user_id(session_id)
    result = {"configured": settings.META_CONFIGURED, "connected": False}
    if not user_id:
        return JSONResponse(result)
    async with get_db() as db:
        row = (
            await db.execute(
                text(
                    """
                    SELECT provider_user_id, display_name, profile_image,
                           token_expires_at, connected_at
                    FROM social_accounts
                    WHERE user_id = :user_id AND platform = 'instagram'
                    """
                ),
                {"user_id": user_id},
            )
        ).first()
    if not row:
        return JSONResponse(result)
    if int(row[3]) <= int(time.time()):
        return JSONResponse({**result, "error": "token_expired"})
    result.update({
        "connected": True,
        "provider": "instagram",
        "member_id": str(row[0]),
        "display_name": str(row[1]),
        "profile_image": row[2],
        "token_expires_at": int(row[3]),
        "connected_at": str(row[4]),
    })
    return JSONResponse(result)


@router.post("/api/social/instagram/disconnect")
async def disconnect_instagram(request: Request):
    if request.headers.get("origin") not in settings.CORS_ALLOWED_ORIGINS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The request origin is not allowed.",
        )
    user_id = await _active_user_id(_request_session_id(request))
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in to continue.")
    async with get_db() as db:
        await db.execute(
            text(
                "DELETE FROM social_accounts "
                "WHERE user_id = :user_id AND platform = 'instagram'"
            ),
            {"user_id": user_id},
        )
    return JSONResponse({"disconnected": True})
