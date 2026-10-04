import asyncio
import base64
import datetime
import json
import logging
import re
import uuid
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import Response
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.auth import require_user
from app.core.config import settings
from app.database.db import get_db
from app.schemas.platform import (
    AutomationSettings,
    ImageGenerationRequest,
    PostCreate,
    TrendItemResponse,
)
from app.services.ai_service import AIProviderNotConfigured, ai_service
from app.services.gemini_service import AIProviderError, gemini_service
from app.services.history_service import history_service
from app.services.publishing import PublishingError, publish_post
from app.services.trend_service import trend_service
from app.services.validation_service import validation_service

logger = logging.getLogger("copyforge.platform")
router = APIRouter(prefix="/api")

UTC = datetime.timezone.utc
SUPPORTED_STATUSES = {"draft", "awaiting_approval", "scheduled", "publishing", "published", "failed"}
IMAGE_SIZES = {"1:1": "1024x1024", "16:9": "1536x1024", "4:5": "1024x1536"}


class ImageProviderError(Exception):
    def __init__(self, detail: str, status_code: int = 502) -> None:
        super().__init__(detail)
        self.status_code = status_code


def _now() -> datetime.datetime:
    return datetime.datetime.now(UTC)


def _utc_iso(value: datetime.datetime | None, timezone_name: str) -> str | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=_validate_timezone(timezone_name))
    return value.astimezone(UTC).isoformat()


def _post_dict(row) -> dict:
    result = dict(row)
    hashtags_json = result.pop("hashtags_json", "[]")
    result["hashtags"] = json.loads(hashtags_json) if isinstance(hashtags_json, str) else (hashtags_json or [])
    return result


def _validate_timezone(name: str) -> ZoneInfo:
    try:
        return ZoneInfo(name)
    except (ZoneInfoNotFoundError, ValueError) as error:
        raise HTTPException(status_code=422, detail="Choose a valid IANA timezone.") from error


def _next_daily_run(posting_time: str, timezone_name: str) -> str:
    zone = _validate_timezone(timezone_name)
    hour, minute = (int(part) for part in posting_time.split(":"))
    local_now = _now().astimezone(zone)
    candidate = datetime.datetime.combine(
        local_now.date(),
        datetime.time(hour=hour, minute=minute),
        tzinfo=zone,
    )
    if candidate <= local_now:
        candidate += datetime.timedelta(days=1)
    return candidate.astimezone(UTC).isoformat()


async def _create_post_record(user_id: str, payload: PostCreate) -> dict:
    _validate_timezone(payload.timezone)
    now = _now().isoformat()
    scheduled_at = _utc_iso(payload.scheduled_at, payload.timezone)
    if payload.mode == "auto_publish":
        scheduled_at = scheduled_at or now
        post_status = "scheduled"
    elif payload.mode == "approval_required":
        post_status = "awaiting_approval"
    else:
        post_status = "draft"

    content_item_id = str(uuid.uuid4())
    post_id = str(uuid.uuid4())
    hook = payload.hook or next((line.strip() for line in payload.content.splitlines() if line.strip()), "")
    hashtags = payload.hashtags or re.findall(r"(?<!\w)#[\w]+", payload.content)
    async with get_db() as db:
        await db.execute(
            text(
                """
                INSERT INTO content_items (
                    id, user_id, topic, description, platform, tone, audience,
                    content_type, content, hook, cta, hashtags_json, image_prompt,
                    image_url, created_at
                ) VALUES (
                    :id, :user_id, :topic, :description, :platform, :tone, :audience,
                    :content_type, :content, :hook, :cta, :hashtags_json, :image_prompt,
                    :image_url, :created_at
                )
                """
            ),
            {
                "id": content_item_id,
                "user_id": user_id,
                "topic": payload.topic,
                "description": payload.description,
                "platform": payload.platform,
                "tone": payload.tone,
                "audience": payload.audience,
                "content_type": payload.content_type,
                "content": payload.content,
                "hook": hook,
                "cta": payload.cta,
                "hashtags_json": json.dumps(hashtags),
                "image_prompt": payload.image_prompt,
                "image_url": payload.image_url,
                "created_at": now,
            },
        )
        await db.execute(
            text(
                """
                INSERT INTO scheduled_posts (
                    id, user_id, content_item_id, platform, content, image_url,
                    scheduled_at, timezone, mode, status, created_at, updated_at
                ) VALUES (
                    :id, :user_id, :content_item_id, :platform, :content, :image_url,
                    :scheduled_at, :timezone, :mode, :status, :created_at, :updated_at
                )
                """
            ),
            {
                "id": post_id,
                "user_id": user_id,
                "content_item_id": content_item_id,
                "platform": payload.platform,
                "content": payload.content,
                "image_url": payload.image_url,
                "scheduled_at": scheduled_at,
                "timezone": payload.timezone,
                "mode": payload.mode,
                "status": post_status,
                "created_at": now,
                "updated_at": now,
            },
        )
        row = (
            await db.execute(
                text(
                    """
                    SELECT p.*, c.topic, c.content_type, c.hook, c.cta,
                        c.hashtags_json, c.image_prompt FROM scheduled_posts p
                    LEFT JOIN content_items c ON c.id = p.content_item_id
                    WHERE p.id = :id AND p.user_id = :user_id
                    """
                ),
                {"id": post_id, "user_id": user_id},
            )
        ).mappings().one()
    return _post_dict(row)


async def _get_post(post_id: str, user_id: str) -> dict | None:
    async with get_db() as db:
        row = (
            await db.execute(
                text(
                    """
                    SELECT p.*, c.topic, c.content_type, c.hook, c.cta,
                        c.hashtags_json, c.image_prompt FROM scheduled_posts p
                    LEFT JOIN content_items c ON c.id = p.content_item_id
                    WHERE p.id = :id AND p.user_id = :user_id
                    """
                ),
                {"id": post_id, "user_id": user_id},
            )
        ).mappings().first()
    return _post_dict(row) if row else None


async def _finish_post(post: dict, published_url: str | None, error: str | None) -> None:
    now = _now().isoformat()
    next_status = "published" if published_url else "failed"
    published_at = now if published_url else None
    async with get_db() as db:
        await db.execute(
            text(
                """
                UPDATE scheduled_posts SET
                    status = :status, published_url = :published_url,
                    published_at = :published_at, last_error = :last_error,
                    updated_at = :updated_at
                WHERE id = :id AND user_id = :user_id
                """
            ),
            {
                "id": post["id"],
                "user_id": post["user_id"],
                "status": next_status,
                "published_url": published_url,
                "published_at": published_at,
                "last_error": error,
                "updated_at": now,
            },
        )
        if published_url:
            await db.execute(
                text(
                    """
                    INSERT INTO published_posts (
                        id, scheduled_post_id, user_id, platform, content,
                        image_url, published_url, published_at
                    ) VALUES (
                        :id, :scheduled_post_id, :user_id, :platform, :content,
                        :image_url, :published_url, :published_at
                    )
                    ON CONFLICT(scheduled_post_id) DO NOTHING
                    """
                ),
                {
                    "id": str(uuid.uuid4()),
                    "scheduled_post_id": post["id"],
                    "user_id": post["user_id"],
                    "platform": post["platform"],
                    "content": post["content"],
                    "image_url": post.get("image_url"),
                    "published_url": published_url,
                    "published_at": published_at,
                },
            )


async def _publish(post: dict) -> dict:
    await _finish_post_status(post, "publishing", None)
    try:
        await _ensure_instagram_image(post)
        published_url = await publish_post(post)
    except (ImageProviderError, PublishingError) as error:
        await _finish_post(post, None, str(error))
    else:
        await _finish_post(post, published_url, None)
    result = await _get_post(post["id"], post["user_id"])
    if result is None:
        raise RuntimeError("The post disappeared while publishing.")
    return result


async def _ensure_instagram_image(post: dict) -> None:
    if post["platform"] != "instagram" or post.get("image_url"):
        return
    image_prompt = post.get("image_prompt")
    if not image_prompt:
        raise PublishingError(
            "Instagram publishing requires a generated image or an image prompt."
        )
    try:
        asset_id = await _create_image_asset(post["user_id"], image_prompt, "1:1")
    except ImageProviderError as error:
        raise PublishingError(str(error)) from error
    image_url = f"{settings.PUBLIC_BACKEND_URL}/api/images/{asset_id}"
    now = _now().isoformat()
    async with get_db() as db:
        await db.execute(
            text(
                """
                UPDATE scheduled_posts SET image_url = :image_url, updated_at = :updated_at
                WHERE id = :id AND user_id = :user_id
                """
            ),
            {
                "image_url": image_url,
                "updated_at": now,
                "id": post["id"],
                "user_id": post["user_id"],
            },
        )
        if post.get("content_item_id"):
            await db.execute(
                text("UPDATE content_items SET image_url = :image_url WHERE id = :id AND user_id = :user_id"),
                {
                    "image_url": image_url,
                    "id": post["content_item_id"],
                    "user_id": post["user_id"],
                },
            )
    post["image_url"] = image_url


async def _finish_post_status(post: dict, post_status: str, error: str | None) -> None:
    async with get_db() as db:
        await db.execute(
            text(
                """
                UPDATE scheduled_posts SET status = :status, last_error = :last_error,
                    updated_at = :updated_at
                WHERE id = :id AND user_id = :user_id
                """
            ),
            {
                "id": post["id"],
                "user_id": post["user_id"],
                "status": post_status,
                "last_error": error,
                "updated_at": _now().isoformat(),
            },
        )


async def process_due_posts() -> None:
    now = _now().isoformat()
    async with get_db() as db:
        candidates = (
            await db.execute(
                text(
                    """
                    SELECT p.*, c.image_prompt FROM scheduled_posts p
                    LEFT JOIN content_items c ON c.id = p.content_item_id
                    WHERE status = 'scheduled' AND scheduled_at <= :now
                    ORDER BY scheduled_at ASC LIMIT 20
                    """
                ),
                {"now": now},
            )
        ).mappings().all()
        claimed: list[dict] = []
        for row in candidates:
            post = dict(row)
            result = await db.execute(
                text(
                    """
                    UPDATE scheduled_posts SET status = 'publishing', updated_at = :now
                    WHERE id = :id AND status = 'scheduled'
                    """
                ),
                {"id": post["id"], "now": now},
            )
            if result.rowcount == 1:
                claimed.append(post)
    for post in claimed:
        try:
            await _publish(post)
        except Exception:
            logger.exception("Unexpected error while publishing scheduled post %s.", post["id"])
            await _finish_post(post, None, "The publishing service failed unexpectedly.")


async def _run_due_automation() -> None:
    now = _now().isoformat()
    async with get_db() as db:
        rows = (
            await db.execute(
                text(
                    """
                    SELECT * FROM automation_settings
                    WHERE enabled = 1 AND next_run_at <= :now
                    ORDER BY next_run_at ASC LIMIT 10
                    """
                ),
                {"now": now},
            )
        ).mappings().all()
        due_settings: list[dict] = []
        for row in rows:
            settings_row = dict(row)
            next_run = _next_daily_run(
                settings_row["posting_time"], settings_row["timezone"]
            )
            claim = await db.execute(
                text(
                    """
                    UPDATE automation_settings SET next_run_at = :next_run,
                        updated_at = :updated_at
                    WHERE user_id = :user_id AND next_run_at <= :now
                    """
                ),
                {
                    "next_run": next_run,
                    "updated_at": now,
                    "user_id": settings_row["user_id"],
                    "now": now,
                },
            )
            if claim.rowcount == 1:
                due_settings.append(settings_row)

    for item in due_settings:
        try:
            generated, compiled_prompt = await ai_service.generate_text(
                product_name=item["topic"],
                product_description=item["description"],
                platform=item["platform"].title(),
                tone=item["tone"],
                audience=item["audience"],
                objective="Product promotion",
                content_type=item["content_type"],
                temperature=0.6,
                top_p=0.9,
                max_tokens=1000,
            )
            formatted, validation = validation_service.validate_and_format(
                generated["content"], item["platform"].title(), item["tone"]
            )
            if item["mode"] == "auto_publish" and not validation.is_valid:
                raise RuntimeError(
                    "Automated content did not pass platform checks: "
                    + "; ".join(validation.warnings)
                )
            content_item_id = str(uuid.uuid4())
            payload = PostCreate(
                topic=item["topic"],
                description=item["description"],
                platform=item["platform"],
                content=formatted.raw_text,
                tone=item["tone"],
                audience=item["audience"],
                content_type=item["content_type"],
                hook=generated["hook"],
                cta=generated["cta"],
                hashtags=generated["hashtags"],
                image_prompt=generated["image_prompt"],
                timezone=item["timezone"],
                mode=item["mode"],
            )
            post = await _create_post_record(item["user_id"], payload)
            await history_service.save_generation(
                generation_id=content_item_id,
                product_name=item["topic"],
                product_description=item["description"],
                platform=item["platform"].title(),
                tone=item["tone"],
                audience=item["audience"],
                objective=item["content_type"],
                prompt_parameters={"temperature": 0.6, "top_p": 0.9, "max_tokens": 1000},
                compiled_prompt=compiled_prompt,
                generated_content=formatted.raw_text,
                content_type=item["content_type"],
                hook=generated["hook"],
                cta=generated["cta"],
                hashtags=generated["hashtags"],
                image_prompt=generated["image_prompt"],
                user_id=item["user_id"],
            )
            if post["status"] == "scheduled":
                await process_due_posts()
                post = await _get_post(post["id"], item["user_id"]) or post
            await _record_automation_result(
                item["user_id"],
                error=post.get("last_error") if post.get("status") == "failed" else None,
            )
        except AIProviderNotConfigured:
            logger.warning("Automation skipped because the AI provider is not configured.")
            await _record_automation_result(
                item["user_id"], error="AI content generation is not configured on the backend."
            )
        except Exception as error:
            logger.exception("Could not execute an automation run for user %s.", item["user_id"])
            await _record_automation_result(
                item["user_id"], error=str(error)[:1000]
            )


async def _record_automation_result(user_id: str, error: str | None) -> None:
    async with get_db() as db:
        await db.execute(
            text(
                """
                UPDATE automation_settings
                SET last_run_at = :last_run_at, last_run_error = :last_run_error
                WHERE user_id = :user_id
                """
            ),
            {
                "last_run_at": _now().isoformat(),
                "last_run_error": error,
                "user_id": user_id,
            },
        )


async def scheduler_loop() -> None:
    await asyncio.sleep(20)
    while True:
        try:
            await process_due_posts()
            await _run_due_automation()
        except Exception:
            logger.exception("The server-side scheduler iteration failed.")
        await asyncio.sleep(20)


@router.get("/trends", response_model=list[TrendItemResponse])
async def get_trends(refresh: bool = Query(False)):
    try:
        return await trend_service.list_trends(refresh=refresh)
    except RuntimeError as error:
        msg = str(error)
        status_code = 503 if "not configured" in msg.lower() else (429 if "limit" in msg.lower() else 502)
        raise HTTPException(status_code=status_code, detail=msg) from error
    except SQLAlchemyError:
        raise
    except Exception as error:
        logger.exception("Could not load trend items.")
        raise HTTPException(status_code=502, detail="Live web search is temporarily unavailable. Please try again.") from error


@router.post("/trends/refresh")
async def refresh_trends():
    try:
        count = await trend_service.refresh()
        return {"retrieved": count}
    except RuntimeError as error:
        msg = str(error)
        status_code = 503 if "not configured" in msg.lower() else (429 if "limit" in msg.lower() else 502)
        raise HTTPException(status_code=status_code, detail=msg) from error
    except SQLAlchemyError:
        raise
    except Exception as error:
        logger.exception("Could not refresh trend sources.")
        raise HTTPException(status_code=502, detail="Live web search is temporarily unavailable. Please try again.") from error


async def _create_image_asset(user_id: str, prompt: str, aspect_ratio: str) -> str:
    aspect_ratio_map = {
        "1:1": "1:1",
        "16:9": "16:9",
        "4:5": "3:4",
        "4:3": "4:3",
        "9:16": "9:16",
    }
    target_aspect = aspect_ratio_map.get(aspect_ratio, "1:1")
    try:
        image_data, mime_type = await gemini_service.generate_image(
            prompt,
            aspect_ratio=target_aspect,
        )
    except AIProviderError as error:
        raise ImageProviderError(str(error), status_code=error.status_code) from error
    asset_id = str(uuid.uuid4())
    created_at = _now().isoformat()
    async with get_db() as db:
        await db.execute(
            text(
                """
                INSERT INTO image_assets (id, user_id, prompt, mime_type, image_data, created_at)
                VALUES (:id, :user_id, :prompt, :mime_type, :image_data, :created_at)
                """
            ),
            {
                "id": asset_id,
                "user_id": user_id,
                "prompt": prompt,
                "mime_type": mime_type,
                "image_data": image_data,
                "created_at": created_at,
            },
        )
    return asset_id


@router.post("/images/generate")
async def generate_image(
    payload: ImageGenerationRequest,
    request: Request,
    user_id: str = Depends(require_user),
):
    try:
        asset_id = await _create_image_asset(user_id, payload.prompt, payload.aspect_ratio)
    except ImageProviderError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    async with get_db() as db:
        created_at = (
            await db.execute(
                text("SELECT created_at FROM image_assets WHERE id = :id"),
                {"id": asset_id},
            )
        ).scalar_one()
    return {
        "id": asset_id,
        "url": str(request.url_for("get_generated_image", asset_id=asset_id)),
        "created_at": created_at,
    }


@router.get("/images/{asset_id}", name="get_generated_image")
async def get_generated_image(asset_id: str):
    async with get_db() as db:
        row = (
            await db.execute(
                text("SELECT mime_type, image_data FROM image_assets WHERE id = :id"),
                {"id": asset_id},
            )
        ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Image not found.")
    try:
        content = base64.b64decode(row[1], validate=True)
    except ValueError as error:
        logger.error("Stored image asset is corrupted.")
        raise HTTPException(status_code=500, detail="Stored image could not be read.") from error
    return Response(content=content, media_type=row[0], headers={"Cache-Control": "private, max-age=3600"})


@router.get("/posts")
async def list_posts(
    status_filter: str | None = Query(default=None, alias="status"),
    user_id: str = Depends(require_user),
):
    if status_filter and status_filter not in SUPPORTED_STATUSES:
        raise HTTPException(status_code=422, detail="Choose a valid post status.")
    query = (
        "SELECT p.*, c.topic, c.content_type, c.hook, c.cta, "
        "c.hashtags_json, c.image_prompt FROM scheduled_posts p "
        "LEFT JOIN content_items c ON c.id = p.content_item_id "
        "WHERE p.user_id = :user_id"
    )
    params = {"user_id": user_id}
    if status_filter:
        query += " AND status = :status"
        params["status"] = status_filter
    query += " ORDER BY COALESCE(p.scheduled_at, p.created_at) ASC"
    async with get_db() as db:
        rows = (await db.execute(text(query), params)).mappings().all()
    return [_post_dict(row) for row in rows]


@router.post("/posts")
async def create_post(
    payload: PostCreate,
    user_id: str = Depends(require_user),
):
    return await _create_post_record(user_id, payload)


@router.get("/approvals")
async def list_approvals(user_id: str = Depends(require_user)):
    async with get_db() as db:
        rows = (
            await db.execute(
                text(
                    """
                    SELECT p.*, c.topic, c.content_type, c.hook, c.cta,
                        c.hashtags_json, c.image_prompt
                    FROM scheduled_posts p
                    LEFT JOIN content_items c ON c.id = p.content_item_id
                    WHERE p.user_id = :user_id AND p.status = 'awaiting_approval'
                    ORDER BY p.created_at ASC
                    """
                ),
                {"user_id": user_id},
            )
        ).mappings().all()
    return [_post_dict(row) for row in rows]


@router.post("/approvals/{post_id}/{action}")
async def update_approval(
    post_id: str,
    action: str,
    user_id: str = Depends(require_user),
):
    if action not in {"approve", "reject"}:
        raise HTTPException(status_code=404, detail="Approval action not found.")
    post = await _get_post(post_id, user_id)
    if not post or post["status"] != "awaiting_approval":
        raise HTTPException(status_code=404, detail="Approval item not found.")
    next_status = "scheduled" if action == "approve" else "draft"
    scheduled_at = post["scheduled_at"] or _now().isoformat()
    async with get_db() as db:
        await db.execute(
            text(
                """
                UPDATE scheduled_posts SET status = :status, scheduled_at = :scheduled_at,
                    updated_at = :updated_at
                WHERE id = :id AND user_id = :user_id AND status = 'awaiting_approval'
                """
            ),
            {
                "status": next_status,
                "scheduled_at": scheduled_at,
                "updated_at": _now().isoformat(),
                "id": post_id,
                "user_id": user_id,
            },
        )
    updated = await _get_post(post_id, user_id)
    return updated


@router.post("/posts/{post_id}/publish")
async def publish_now(post_id: str, user_id: str = Depends(require_user)):
    post = await _get_post(post_id, user_id)
    if not post or post["status"] not in {"scheduled", "draft", "failed"}:
        raise HTTPException(status_code=409, detail="This post cannot be published in its current status.")
    result = await _publish(post)
    if result["status"] == "failed":
        raise HTTPException(status_code=502, detail=result["last_error"])
    return result


@router.get("/published")
async def list_published(user_id: str = Depends(require_user)):
    async with get_db() as db:
        rows = (
            await db.execute(
                text(
                    """
                    SELECT p.*, 'Analytics unavailable from platform API' AS analytics_status
                    FROM published_posts p
                    WHERE p.user_id = :user_id
                    ORDER BY p.published_at DESC
                    """
                ),
                {"user_id": user_id},
            )
        ).mappings().all()
    return [dict(row) for row in rows]


@router.get("/analytics")
async def get_analytics(user_id: str = Depends(require_user)):
    async with get_db() as db:
        counts = (
            await db.execute(
                text(
                    """
                    SELECT
                        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
                        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled,
                        SUM(CASE WHEN status = 'awaiting_approval' THEN 1 ELSE 0 END) AS approvals
                    FROM scheduled_posts WHERE user_id = :user_id
                    """
                ),
                {"user_id": user_id},
            )
        ).mappings().one()
    return {
        "published_count": counts["published"] or 0,
        "scheduled_count": counts["scheduled"] or 0,
        "approval_count": counts["approvals"] or 0,
        "analytics_available": False,
        "message": "Analytics unavailable from platform API",
    }


@router.get("/automation")
async def get_automation(user_id: str = Depends(require_user)):
    async with get_db() as db:
        row = (
            await db.execute(
                text("SELECT * FROM automation_settings WHERE user_id = :user_id"),
                {"user_id": user_id},
            )
        ).mappings().first()
    if row:
        result = dict(row)
        result["enabled"] = bool(result["enabled"])
        return result
    return AutomationSettings().model_dump()


@router.put("/automation")
async def save_automation(
    payload: AutomationSettings,
    user_id: str = Depends(require_user),
):
    _validate_timezone(payload.timezone)
    if payload.enabled and (not payload.topic.strip() or not payload.description.strip()):
        raise HTTPException(
            status_code=422,
            detail="Enter a topic and description before enabling scheduled content generation.",
        )
    now = _now().isoformat()
    next_run = _next_daily_run(payload.posting_time, payload.timezone) if payload.enabled else None
    data = payload.model_dump()
    data.update({
        "user_id": user_id,
        "enabled": int(payload.enabled),
        "next_run_at": next_run,
        "updated_at": now,
    })
    async with get_db() as db:
        await db.execute(
            text(
                """
                INSERT INTO automation_settings (
                    user_id, enabled, platform, topic, description, tone, audience,
                    content_type, frequency, posting_time, timezone, mode, next_run_at,
                    updated_at
                ) VALUES (
                    :user_id, :enabled, :platform, :topic, :description, :tone, :audience,
                    :content_type, :frequency, :posting_time, :timezone, :mode, :next_run_at,
                    :updated_at
                )
                ON CONFLICT(user_id) DO UPDATE SET
                    enabled = excluded.enabled,
                    platform = excluded.platform,
                    topic = excluded.topic,
                    description = excluded.description,
                    tone = excluded.tone,
                    audience = excluded.audience,
                    content_type = excluded.content_type,
                    frequency = excluded.frequency,
                    posting_time = excluded.posting_time,
                    timezone = excluded.timezone,
                    mode = excluded.mode,
                    next_run_at = excluded.next_run_at,
                    updated_at = excluded.updated_at
                """
            ),
            data,
        )
    return await get_automation(user_id)
