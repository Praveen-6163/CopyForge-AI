import datetime
import logging
import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from sqlalchemy.exc import SQLAlchemyError

from app.api.auth import require_user
from app.core.config import settings
from app.schemas.generation import (
    FormattedContent,
    GenerateRequest,
    GenerationResponse,
    HealthResponse,
    HistoryItemResponse,
    ImproveRequest,
    TemplateItem,
)
from app.services.ai_service import (
    AIProviderError,
    AIProviderNotConfigured,
    ai_service,
)
from app.services.gemini_service import gemini_service
from app.services.history_service import history_service
from app.services.validation_service import validation_service
from app.templates.preset_templates import get_preset_templates

logger = logging.getLogger("copyforge.router")
router = APIRouter(prefix="/api")


class GeminiTestRequest(BaseModel):
    prompt: str | None = None


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        project_name=settings.PROJECT_NAME,
        tagline=settings.TAGLINE,
        version=settings.VERSION,
        ai_provider=settings.AI_PROVIDER,
        ai_model=settings.GEMINI_MODEL,
        openai_model=settings.GEMINI_MODEL,
        ai_configured=settings.AI_CONFIGURED,
    )


@router.get("/health/gemini")
@router.get("/ai/health")
async def gemini_health_check():
    return await gemini_service.check_model()


@router.post("/test/gemini")
@router.post("/ai/test")
async def gemini_test_endpoint(req: GeminiTestRequest | None = None):
    if not settings.AI_CONFIGURED:
        return {
            "ok": False,
            "provider": "Google Gemini",
            "model": settings.GEMINI_MODEL,
            "message": "Gemini API key is not configured on the backend.",
        }
    prompt = (req and req.prompt) or "Respond with: CopyForge AI Gemini API is operational."
    try:
        response_text = await gemini_service.generate_text(
            prompt,
            generation_config={"max_output_tokens": 50},
        )
        return {
            "ok": True,
            "provider": "Google Gemini",
            "model": settings.GEMINI_MODEL,
            "message": "Gemini API test request succeeded.",
            "sample_output": response_text.strip(),
        }
    except AIProviderError as error:
        return {
            "ok": False,
            "provider": "Google Gemini",
            "model": settings.GEMINI_MODEL,
            "message": str(error),
            "error_type": error.error_type,
        }
    except Exception as error:
        return {
            "ok": False,
            "provider": "Google Gemini",
            "model": settings.GEMINI_MODEL,
            "message": "Gemini test request failed unexpectedly.",
        }


def _generation_response(
    *,
    generation_id: str,
    product_name: str,
    product_description: str,
    platform: str,
    tone: str,
    audience: str,
    objective: str,
    content_type: str = "Social post",
    parameters: dict,
    compiled_prompt: str,
    generated_content: str,
    formatted_content: FormattedContent,
    validation_result,
    hook: str | None = None,
    cta: str | None = None,
    hashtags: list[str] | None = None,
    image_prompt: str | None = None,
) -> GenerationResponse:
    return GenerationResponse(
        id=generation_id,
        product_name=product_name,
        product_description=product_description,
        platform=platform,
        tone=tone,
        audience=audience,
        objective=objective,
        content_type=content_type,
        prompt_parameters=parameters,
        compiled_prompt=compiled_prompt,
        generated_content=generated_content,
        hook=hook,
        cta=cta,
        hashtags=hashtags or [],
        image_prompt=image_prompt,
        formatted_content=formatted_content,
        platform_validation=validation_result,
        is_saved=False,
        created_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )


async def _generate_for_user(req: GenerateRequest, user_id: str) -> GenerationResponse:
    generation_id = str(uuid.uuid4())
    request_id = f"req_{uuid.uuid4().hex[:8]}"
    start_time = time.time()
    logger.info(
        "[%s] Generation request received: platform=%s tone=%s topic=%s user_id=%s",
        request_id,
        req.platform,
        req.tone,
        req.product_name[:40],
        user_id[:8],
    )
    try:
        generated, compiled_prompt = await ai_service.generate_text(
            product_name=req.product_name,
            product_description=req.product_description,
            platform=req.platform,
            tone=req.tone,
            audience=req.audience,
            objective=req.objective,
            content_type=req.content_type,
            additional_instructions=req.additional_instructions or "",
            temperature=req.parameters.temperature,
            top_p=req.parameters.top_p,
            max_tokens=req.parameters.max_tokens,
        )
        formatted_content, validation_result = validation_service.validate_and_format(
            raw_text=generated["content"],
            platform=req.platform,
            tone=req.tone,
        )
        parameters = req.parameters.model_dump()
        await history_service.save_generation(
            generation_id=generation_id,
            product_name=req.product_name,
            product_description=req.product_description,
            platform=req.platform,
            tone=req.tone,
            audience=req.audience,
            objective=req.objective,
            content_type=req.content_type,
            prompt_parameters=parameters,
            compiled_prompt=compiled_prompt,
            generated_content=formatted_content.raw_text,
            hook=generated["hook"],
            cta=generated["cta"],
            hashtags=generated["hashtags"],
            image_prompt=generated["image_prompt"],
            user_id=user_id,
        )
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info(
            "[%s] Generation succeeded: platform=%s duration_ms=%d model=%s",
            request_id,
            req.platform,
            duration_ms,
            settings.GEMINI_MODEL,
        )
        return _generation_response(
            generation_id=generation_id,
            product_name=req.product_name,
            product_description=req.product_description,
            platform=req.platform,
            tone=req.tone,
            audience=req.audience,
            objective=req.objective,
            content_type=req.content_type,
            parameters=parameters,
            compiled_prompt=compiled_prompt,
            generated_content=formatted_content.raw_text,
            formatted_content=formatted_content,
            validation_result=validation_result,
            hook=generated["hook"],
            cta=generated["cta"],
            hashtags=generated["hashtags"],
            image_prompt=generated["image_prompt"],
        )
    except AIProviderNotConfigured as error:
        logger.warning("[%s] Gemini API key not configured.", request_id)
        raise HTTPException(
            status_code=error.status_code,
            detail={
                "success": False,
                "error": "gemini_unconfigured",
                "message": "Gemini API key is not configured on the backend.",
                "request_id": request_id,
            },
        ) from error
    except AIProviderError as error:
        logger.warning("[%s] Gemini generation failed: %s", request_id, str(error))
        raise HTTPException(
            status_code=error.status_code,
            detail={
                "success": False,
                "error": "gemini_unavailable",
                "message": str(error),
                "request_id": request_id,
            },
        ) from error
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        logger.exception("[%s] Database failure during generation save.", request_id)
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": "database_unavailable",
                "message": "Database is temporarily unavailable. Please try again.",
                "request_id": request_id,
            },
        ) from error
    except Exception as error:
        logger.exception("[%s] Generation failed unexpectedly.", request_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "internal_error",
                "message": "Content generation failed. Please try again.",
                "request_id": request_id,
            },
        ) from error


@router.post("/generate", response_model=GenerationResponse)
async def generate_content(
    req: GenerateRequest,
    user_id: str = Depends(require_user),
):
    return await _generate_for_user(req, user_id)


@router.post("/improve", response_model=GenerationResponse)
async def improve_content(
    req: ImproveRequest,
    user_id: str = Depends(require_user),
):
    generation_id = str(uuid.uuid4())
    target_platform = req.new_platform or req.platform
    target_tone = req.new_tone or req.tone
    try:
        raw_text, compiled_prompt = await ai_service.improve_text(
            current_content=req.current_content,
            action=req.action,
            product_name=req.product_name,
            platform=req.platform,
            tone=req.tone,
            new_tone=req.new_tone,
            new_platform=req.new_platform,
            temperature=req.parameters.temperature,
            top_p=req.parameters.top_p,
        )
        formatted_content, validation_result = validation_service.validate_and_format(
            raw_text=raw_text,
            platform=target_platform,
            tone=target_tone,
        )
        parameters = req.parameters.model_dump()
        description = f"Refinement ({req.action})"
        await history_service.save_generation(
            generation_id=generation_id,
            product_name=req.product_name,
            product_description=description,
            platform=target_platform,
            tone=target_tone,
            audience="Refined",
            objective=req.action,
            content_type="Social post",
            prompt_parameters=parameters,
            compiled_prompt=compiled_prompt,
            generated_content=formatted_content.raw_text,
            user_id=user_id,
        )
        return _generation_response(
            generation_id=generation_id,
            product_name=req.product_name,
            product_description=description,
            platform=target_platform,
            tone=target_tone,
            audience="Refined",
            objective=req.action,
            parameters=parameters,
            compiled_prompt=compiled_prompt,
            generated_content=formatted_content.raw_text,
            formatted_content=formatted_content,
            validation_result=validation_result,
        )
    except AIProviderNotConfigured as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    except AIProviderError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise
    except Exception as error:
        logger.exception("Content refinement failed.")
        raise HTTPException(status_code=500, detail="Content refinement failed.") from error


@router.post("/regenerate", response_model=GenerationResponse)
async def regenerate_content(
    req: GenerateRequest,
    user_id: str = Depends(require_user),
):
    return await _generate_for_user(req, user_id)


@router.get("/history", response_model=List[HistoryItemResponse])
async def get_history(
    search: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    tone: Optional[str] = Query(None),
    saved_only: bool = Query(False),
    user_id: str = Depends(require_user),
):
    try:
        return await history_service.get_history(
            search=search,
            platform=platform,
            tone=tone,
            only_saved=saved_only,
            user_id=user_id,
        )
    except SQLAlchemyError:
        raise
    except Exception as error:
        logger.exception("Could not retrieve account content history.")
        raise HTTPException(status_code=500, detail="Failed to fetch content history.") from error


@router.get("/history/{item_id}", response_model=HistoryItemResponse)
async def get_history_by_id(
    item_id: str,
    user_id: str = Depends(require_user),
):
    item = await history_service.get_by_id(item_id, user_id)
    if not item:
        raise HTTPException(status_code=404, detail="History entry not found.")
    return item


@router.delete("/history/{item_id}")
async def delete_history_item(
    item_id: str,
    user_id: str = Depends(require_user),
):
    success = await history_service.delete_item(item_id, user_id)
    return {"success": success, "id": item_id}


@router.post("/history/{item_id}/toggle-save")
async def toggle_save_item(
    item_id: str,
    user_id: str = Depends(require_user),
):
    new_state = await history_service.toggle_save(item_id, user_id)
    if new_state is None:
        raise HTTPException(status_code=404, detail="History entry not found.")
    return {"id": item_id, "is_saved": new_state}


@router.get("/templates", response_model=List[TemplateItem])
async def get_templates():
    return get_preset_templates()
