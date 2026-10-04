import base64
import hashlib
import logging
import secrets
import time
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlencode, urlparse

import httpx
from sqlalchemy.exc import SQLAlchemyError
from cryptography.fernet import Fernet
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import text

from app.core.config import settings
from app.database.db import get_db

logger = logging.getLogger("copyforge.linkedin")
router = APIRouter()

LINKEDIN_AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"
LINKEDIN_SCOPES = ("openid", "profile", "email", "w_member_social")
SESSION_COOKIE = "copyforge_linkedin_session"
STATE_TTL_SECONDS = 600
SESSION_TTL_SECONDS = 30 * 24 * 60 * 60


def _oauth_enabled() -> bool:
    return settings.LINKEDIN_CONFIGURED and _valid_redirect_uri(settings.LINKEDIN_REDIRECT_URI)


def _hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _token_cipher() -> Fernet:
    key = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(key))


def _frontend_redirect(
    result: str,
    reason: str | None = None,
    session_id: str | None = None,
) -> RedirectResponse:
    params = {"linkedin": result}
    if reason:
        params["reason"] = reason
    destination = f"{settings.FRONTEND_ORIGIN}/social/linkedin?{urlencode(params)}"
    if session_id:
        destination = f"{destination}#session={session_id}"
    return RedirectResponse(destination, status_code=302)


def _valid_redirect_uri(value: str) -> bool:
    try:
        parsed = urlparse(value)
        hostname = parsed.hostname
        port = parsed.port
    except ValueError:
        return False
    local_http = hostname in {"localhost", "127.0.0.1"}
    return (
        parsed.scheme in {"http", "https"}
        and bool(hostname)
        and (parsed.scheme == "https" or local_http)
        and (port is None or 1 <= port <= 65535)
        and parsed.path == "/auth/linkedin/callback"
        and not parsed.query
        and not parsed.username
        and not parsed.password
        and not parsed.fragment
    )


async def _store_state(state: str, session_hash: str) -> None:
    now = int(time.time())
    async with get_db() as db:
        await db.execute(
            text("DELETE FROM oauth_states WHERE expires_at <= :now"),
            {"now": now},
        )
        await db.execute(
            text(
                """
                INSERT INTO oauth_states (provider, state_hash, session_hash, expires_at)
                VALUES ('linkedin', :state_hash, :session_hash, :expires_at)
                """
            ),
            {
                "state_hash": _hash(state),
                "session_hash": session_hash,
                "expires_at": now + STATE_TTL_SECONDS,
            },
        )


async def _consume_state(state: str) -> str | None:
    now = int(time.time())
    async with get_db() as db:
        row = (
            await db.execute(
                text(
                    """
                    DELETE FROM oauth_states
                    WHERE provider = 'linkedin' AND state_hash = :state_hash
                    RETURNING session_hash, expires_at
                    """
                ),
                {"state_hash": _hash(state)},
            )
        ).mappings().first()
    if row is None or int(row["expires_at"]) <= now:
        return None
    return str(row["session_hash"])


async def _save_connection(
    session_hash: str,
    profile: dict[str, Any],
    access_token: str,
    token_expires_at: int,
    scopes: str = "openid profile email w_member_social",
) -> None:
    member_id = profile.get("sub")
    display_name = profile.get("name")
    if not isinstance(member_id, str) or not member_id or not isinstance(display_name, str) or not display_name:
        raise ValueError("LinkedIn did not return the required member profile.")

    picture = profile.get("picture")
    profile_image = picture if isinstance(picture, str) and picture.startswith("https://") else None
    encrypted_token = _token_cipher().encrypt(access_token.encode("utf-8")).decode("ascii")
    connected_at = datetime.now(timezone.utc).isoformat()

    async with get_db() as db:
        await db.execute(
            text(
                """
                INSERT INTO users (id, linkedin_member_id, display_name, created_at)
                VALUES (:user_id, :member_id, :display_name, :created_at)
                ON CONFLICT(id) DO UPDATE SET
                    display_name = excluded.display_name
                """
            ),
            {
                "user_id": member_id,
                "member_id": member_id,
                "display_name": display_name,
                "created_at": connected_at,
            },
        )
        await db.execute(
            text(
                """
                INSERT INTO social_accounts (
                    user_id, platform, provider_user_id, display_name, profile_image,
                    access_token_ciphertext, token_expires_at, connected_at, scopes
                ) VALUES (
                    :user_id, 'linkedin', :provider_user_id, :display_name, :profile_image,
                    :access_token_ciphertext, :token_expires_at, :connected_at, :scopes
                )
                ON CONFLICT(user_id, platform) DO UPDATE SET
                    provider_user_id = excluded.provider_user_id,
                    display_name = excluded.display_name,
                    profile_image = excluded.profile_image,
                    access_token_ciphertext = excluded.access_token_ciphertext,
                    token_expires_at = excluded.token_expires_at,
                    connected_at = excluded.connected_at,
                    scopes = excluded.scopes
                """
            ),
            {
                "user_id": member_id,
                "provider_user_id": member_id,
                "display_name": display_name,
                "profile_image": profile_image,
                "access_token_ciphertext": encrypted_token,
                "token_expires_at": token_expires_at,
                "connected_at": connected_at,
                "scopes": scopes,
            },
        )
        await db.execute(
            text(
                """
                INSERT INTO user_sessions (session_hash, user_id, expires_at, created_at)
                VALUES (:session_hash, :user_id, :expires_at, :created_at)
                ON CONFLICT(session_hash) DO UPDATE SET
                    user_id = excluded.user_id,
                    expires_at = excluded.expires_at
                """
            ),
            {
                "session_hash": session_hash,
                "user_id": member_id,
                "expires_at": int(time.time() + SESSION_TTL_SECONDS),
                "created_at": connected_at,
            },
        )
        await db.execute(
            text(
                """
                INSERT INTO linkedin_connections (
                    session_hash, provider, member_id, display_name, profile_image,
                    access_token_ciphertext, token_expires_at, connected_at, scopes
                ) VALUES (
                    :session_hash, 'linkedin', :member_id, :display_name, :profile_image,
                    :access_token_ciphertext, :token_expires_at, :connected_at, :scopes
                )
                ON CONFLICT(session_hash) DO UPDATE SET
                    provider = excluded.provider,
                    member_id = excluded.member_id,
                    display_name = excluded.display_name,
                    profile_image = excluded.profile_image,
                    access_token_ciphertext = excluded.access_token_ciphertext,
                    token_expires_at = excluded.token_expires_at,
                    connected_at = excluded.connected_at,
                    scopes = excluded.scopes
                """
            ),
            {
                "session_hash": session_hash,
                "member_id": member_id,
                "display_name": display_name,
                "profile_image": profile_image,
                "access_token_ciphertext": encrypted_token,
                "token_expires_at": token_expires_at,
                "connected_at": connected_at,
                "scopes": scopes,
            },
        )


async def _connection_for_session(session_hash: str) -> tuple[Any, ...] | None:
    async with get_db() as db:
        row = (
            await db.execute(
                text(
                    """
                    SELECT provider, member_id, display_name, profile_image,
                           token_expires_at, connected_at, scopes
                    FROM linkedin_connections WHERE session_hash = :session_hash
                    """
                ),
                {"session_hash": session_hash},
            )
        ).first()
        return tuple(row) if row else None


@router.get("/auth/linkedin")
async def start_linkedin_oauth(request: Request) -> RedirectResponse:
    if not _oauth_enabled():
        return _frontend_redirect("not_configured")

    session_id = request.cookies.get(SESSION_COOKIE)
    if not session_id or len(session_id) > 128:
        session_id = secrets.token_urlsafe(32)
    session_hash = _hash(session_id)
    state = secrets.token_urlsafe(32)
    await _store_state(state, session_hash)

    query = urlencode({
        "response_type": "code",
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
        "state": state,
        "scope": " ".join(LINKEDIN_SCOPES),
    })
    response = RedirectResponse(f"{LINKEDIN_AUTHORIZE_URL}?{query}", status_code=302)
    response.set_cookie(
        SESSION_COOKIE,
        session_id,
        httponly=True,
        secure=settings.LINKEDIN_COOKIE_SECURE,
        samesite="none" if settings.LINKEDIN_COOKIE_SECURE else "lax",
        max_age=SESSION_TTL_SECONDS,
        path="/",
    )
    return response


@router.get("/auth/linkedin/callback")
async def linkedin_oauth_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> RedirectResponse:
    session_id = request.cookies.get(SESSION_COOKIE)
    if not session_id or not state:
        return _frontend_redirect("failed", "state")

    session_hash = await _consume_state(state)
    if not session_hash or not secrets.compare_digest(session_hash, _hash(session_id)):
        return _frontend_redirect("failed", "state")

    if error:
        if error in {"user_cancelled_login", "user_cancelled_authorize"}:
            return _frontend_redirect("cancelled")
        if error == "redirect_uri_mismatch":
            return _frontend_redirect("failed", "redirect_uri")
        return _frontend_redirect("failed", "authorization")
    if not code:
        return _frontend_redirect("failed", "code")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            token_response = await client.post(
                LINKEDIN_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
                    "client_id": settings.LINKEDIN_CLIENT_ID,
                    "client_secret": settings.LINKEDIN_CLIENT_SECRET,
                },
                headers={"Accept": "application/json"},
            )
            token_response.raise_for_status()
            token_data = token_response.json()
            if not isinstance(token_data, dict):
                return _frontend_redirect("failed", "token")
            access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in")
            if not isinstance(access_token, str) or not access_token:
                return _frontend_redirect("failed", "token")
            if not isinstance(expires_in, (int, float)) or expires_in <= 0:
                return _frontend_redirect("failed", "token")

            profile_response = await client.get(
                LINKEDIN_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            )
            profile_response.raise_for_status()
            profile = profile_response.json()
            if not isinstance(profile, dict):
                return _frontend_redirect("failed", "profile")
            if not isinstance(profile.get("sub"), str) or not isinstance(profile.get("name"), str):
                return _frontend_redirect("failed", "profile")

            scope_granted = str(token_data.get("scope", ""))
            await _save_connection(
                session_hash,
                profile,
                access_token,
                int(time.time() + expires_in),
                scopes=scope_granted,
            )
        return _frontend_redirect("connected", session_id=session_id)
    except httpx.TimeoutException:
        logger.warning("LinkedIn OAuth request timed out.")
        return _frontend_redirect("failed", "network")
    except httpx.HTTPStatusError as exc:
        status_code = exc.response.status_code
        if status_code == 403:
            reason = "permissions"
        elif status_code == 401:
            reason = "token"
        elif status_code == 400:
            reason = "code"
        else:
            reason = "provider"
        logger.warning("LinkedIn OAuth provider returned HTTP %s.", status_code)
        return _frontend_redirect("failed", reason)
    except (httpx.RequestError, ValueError):
        logger.warning("LinkedIn OAuth provider request failed.")
        return _frontend_redirect("failed", "provider")
    except SQLAlchemyError:
        raise
    except Exception:
        logger.error("Could not save the LinkedIn connection.")
        return _frontend_redirect("failed", "storage")


def _request_session_id(request: Request) -> str | None:
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        session_id = authorization[7:].strip()
    else:
        session_id = request.cookies.get(SESSION_COOKIE)
    if not session_id or len(session_id) > 128:
        return None
    return session_id


async def _linkedin_status_payload(session_id: str | None) -> dict[str, Any]:
    if not _oauth_enabled():
        return {
            "configured": False,
            "connected": False,
            "posting_permission": False,
            "token_available": False,
            "token_expired": False,
        }
    if not session_id:
        return {
            "configured": True,
            "connected": False,
            "posting_permission": False,
            "token_available": False,
            "token_expired": False,
        }

    row = await _connection_for_session(_hash(session_id))
    if row is None:
        return {
            "configured": True,
            "connected": False,
            "posting_permission": False,
            "token_available": False,
            "token_expired": False,
        }
    provider, member_id, display_name, profile_image, token_expires_at, connected_at, scopes = row
    token_expired = int(token_expires_at) <= int(time.time())
    scopes_str = str(scopes or "")
    has_posting_permission = ("w_member_social" in scopes_str) if scopes_str else True

    if token_expired:
        return {
            "configured": True,
            "connected": False,
            "provider": provider,
            "member_id": member_id,
            "display_name": display_name,
            "member_name": display_name,
            "profile_image": profile_image,
            "posting_permission": has_posting_permission,
            "token_available": True,
            "token_expired": True,
            "error": "token_expired",
        }

    return {
        "configured": True,
        "connected": True,
        "provider": provider,
        "member_id": member_id,
        "display_name": display_name,
        "member_name": display_name,
        "profile_image": profile_image,
        "token_expires_at": int(token_expires_at),
        "connected_at": connected_at,
        "posting_permission": has_posting_permission,
        "token_available": True,
        "token_expired": False,
    }


@router.get("/api/social/linkedin/status")
async def linkedin_status(request: Request) -> JSONResponse:
    return JSONResponse(await _linkedin_status_payload(_request_session_id(request)))


@router.post("/api/social/linkedin/test-post")
async def linkedin_test_post(request: Request) -> JSONResponse:
    session_id = _request_session_id(request)
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="LinkedIn authorization expired. Please reconnect LinkedIn.",
        )
    status_payload = await _linkedin_status_payload(session_id)
    if not status_payload.get("connected") or status_payload.get("token_expired"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="LinkedIn authorization expired. Please reconnect LinkedIn.",
        )
    if not status_payload.get("posting_permission"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="LinkedIn posting permission is missing. Please reconnect and approve posting access.",
        )

    member_id = status_payload.get("member_id")
    if not member_id:
        raise HTTPException(status_code=401, detail="LinkedIn member ID not found.")

    from app.services.publishing import publish_post, PublishingError

    test_post_data = {
        "user_id": member_id,
        "platform": "linkedin",
        "content": "Test post from CopyForge AI 🚀\n\nThis is a real LinkedIn API publishing test.",
    }
    try:
        published_url = await publish_post(test_post_data)
    except PublishingError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    post_id = published_url.rstrip("/").split("/")[-1]
    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "http_status": 201,
            "external_post_id": post_id,
            "published_url": published_url,
            "message": "Successfully published test post to LinkedIn.",
        },
    )


@router.get("/api/social/accounts")
async def social_accounts(request: Request) -> JSONResponse:
    linkedin = await _linkedin_status_payload(_request_session_id(request))
    return JSONResponse({"accounts": [linkedin]})


@router.post("/api/social/linkedin/disconnect")
async def disconnect_linkedin(
    request: Request,
) -> JSONResponse:
    if request.headers.get("origin") not in settings.CORS_ALLOWED_ORIGINS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The request origin is not allowed.",
        )
    session_id = _request_session_id(request)
    if session_id:
        async with get_db() as db:
            account = (
                await db.execute(
                    text(
                        "SELECT member_id FROM linkedin_connections WHERE session_hash = :session_hash"
                    ),
                    {"session_hash": _hash(session_id)},
                )
            ).first()
            await db.execute(
                text("DELETE FROM linkedin_connections WHERE session_hash = :session_hash"),
                {"session_hash": _hash(session_id)},
            )
            if account:
                await db.execute(
                    text(
                        "DELETE FROM social_accounts "
                        "WHERE user_id = :user_id AND platform = 'linkedin'"
                    ),
                    {"user_id": account[0]},
                )
    return JSONResponse({"disconnected": True})
