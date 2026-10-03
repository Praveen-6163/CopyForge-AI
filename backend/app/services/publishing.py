import base64
import hashlib
import logging
import time
from typing import Any

import httpx
from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import text

from app.core.config import settings
from app.database.db import get_db

logger = logging.getLogger("copyforge.publishing")


class PublishingError(Exception):
    pass


def _token_cipher() -> Fernet:
    key = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(key))


async def publish_post(post: dict[str, Any]) -> str:
    if not post["content"].strip():
        raise PublishingError("Post content cannot be empty.")

    if post["platform"] == "linkedin":
        return await _publish_linkedin(post)
    if post["platform"] == "instagram":
        return await _publish_instagram(post)
    raise PublishingError("Publishing is not supported for this platform.")


async def _account_token(user_id: str, platform: str) -> tuple[str, str]:
    async with get_db() as db:
        account = (
            await db.execute(
                text(
                    """
                    SELECT provider_user_id, access_token_ciphertext, token_expires_at
                    FROM social_accounts
                    WHERE user_id = :user_id AND platform = :platform
                    """
                ),
                {"user_id": user_id, "platform": platform},
            )
        ).first()
    if not account:
        raise PublishingError(f"Connect {platform.title()} before publishing.")
    if int(account[2]) <= int(time.time()):
        raise PublishingError(f"The {platform.title()} access token has expired. Reconnect it.")
    try:
        token = _token_cipher().decrypt(str(account[1]).encode("ascii")).decode("utf-8")
    except InvalidToken as error:
        logger.error("Could not decrypt a stored %s credential.", platform)
        raise PublishingError("The stored social account credential could not be used.") from error
    return str(account[0]), token


async def _publish_linkedin(post: dict[str, Any]) -> str:
    member_id, token = await _account_token(post["user_id"], "linkedin")
    body = {
        "author": f"urn:li:person:{member_id}",
        "commentary": post["content"],
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.linkedin.com/rest/posts",
                json=body,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "LinkedIn-Version": settings.LINKEDIN_API_VERSION,
                    "X-Restli-Protocol-Version": "2.0.0",
                },
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as error:
        logger.warning("LinkedIn publishing returned HTTP %s.", error.response.status_code)
        if error.response.status_code == 401:
            raise PublishingError("LinkedIn rejected the access token. Reconnect the account.") from error
        if error.response.status_code == 403:
            raise PublishingError("LinkedIn did not grant the required publishing permission.") from error
        raise PublishingError("LinkedIn could not publish this post.") from error
    except httpx.RequestError as error:
        logger.warning("Could not reach the LinkedIn publishing API.")
        raise PublishingError("LinkedIn could not be reached. The post was not published.") from error

    post_id = response.headers.get("x-restli-id") or response.headers.get("X-RestLi-Id")
    if not post_id:
        logger.error("LinkedIn accepted a post without returning a post identifier.")
        raise PublishingError("LinkedIn did not confirm the published post URL.")
    return f"https://www.linkedin.com/feed/update/{post_id}"


async def _publish_instagram(post: dict[str, Any]) -> str:
    if not post.get("image_url") or not post["image_url"].startswith("https://"):
        raise PublishingError("Instagram publishing requires a publicly accessible HTTPS image.")
    account_id, token = await _account_token(post["user_id"], "instagram")
    base_url = f"https://graph.instagram.com/{settings.META_GRAPH_API_VERSION}/{account_id}"
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            media_response = await client.post(
                f"{base_url}/media",
                data={
                    "image_url": post["image_url"],
                    "caption": post["content"],
                    "access_token": token,
                },
            )
            media_response.raise_for_status()
            creation_id = media_response.json().get("id")
            if not isinstance(creation_id, str) or not creation_id:
                raise PublishingError("Instagram did not return a media container ID.")
            publish_response = await client.post(
                f"{base_url}/media_publish",
                data={"creation_id": creation_id, "access_token": token},
            )
            publish_response.raise_for_status()
            media_id = publish_response.json().get("id")
            if not isinstance(media_id, str) or not media_id:
                raise PublishingError("Instagram did not confirm the published media.")
            permalink_response = await client.get(
                f"https://graph.instagram.com/{settings.META_GRAPH_API_VERSION}/{media_id}",
                params={"fields": "permalink", "access_token": token},
            )
            permalink_response.raise_for_status()
            permalink = permalink_response.json().get("permalink")
            if not isinstance(permalink, str) or not permalink.startswith("https://"):
                raise PublishingError("Instagram did not return the published post URL.")
            return permalink
    except httpx.HTTPStatusError as error:
        logger.warning("Instagram publishing returned HTTP %s.", error.response.status_code)
        raise PublishingError("Instagram could not publish this post. Check account permissions and image URL.") from error
    except httpx.RequestError as error:
        logger.warning("Could not reach the Instagram publishing API.")
        raise PublishingError("Instagram could not be reached. The post was not published.") from error
