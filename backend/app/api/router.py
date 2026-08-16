import uuid
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.generation import (
    GenerateRequest, ImproveRequest, GenerationResponse,
    HistoryItemResponse, TemplateItem, HealthResponse, FormattedContent
)
from app.services.ai_service import ai_service
from app.services.validation_service import validation_service
from app.services.history_service import history_service
from app.templates.preset_templates import get_preset_templates
from app.core.config import settings

logger = logging.getLogger("copyforge.router")
router = APIRouter(prefix="/api")

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Get system health and demo mode status."""
    return HealthResponse(
        status="healthy",
        project_name=settings.PROJECT_NAME,
        tagline=settings.TAGLINE,
        version=settings.VERSION,
        demo_mode=settings.is_demo_mode,
        openai_model=settings.OPENAI_MODEL
    )

@router.post("/generate", response_model=GenerationResponse)
async def generate_content(req: GenerateRequest):
    """
    Core AI generation endpoint.
    Compiles structured prompt dynamically, executes LLM generation (or Demo Mode),
    validates output against platform constraints, and persists result in SQLite history.
    """
    try:
        gen_id = str(uuid.uuid4())
        raw_text, compiled_prompt, is_demo = await ai_service.generate_text(
            product_name=req.product_name,
            product_description=req.product_description,
            platform=req.platform,
            tone=req.tone,
            audience=req.audience,
            objective=req.objective,
            additional_instructions=req.additional_instructions,
            temperature=req.parameters.temperature,
            top_p=req.parameters.top_p,
            max_tokens=req.parameters.max_tokens
        )

        formatted_content, validation_result = validation_service.validate_and_format(
            raw_text=raw_text,
            platform=req.platform,
            tone=req.tone
        )

        params_dict = req.parameters.model_dump()

        # Save to SQLite history
        await history_service.save_generation(
            generation_id=gen_id,
            product_name=req.product_name,
            product_description=req.product_description,
            platform=req.platform,
            tone=req.tone,
            audience=req.audience,
            objective=req.objective,
            prompt_parameters=params_dict,
            compiled_prompt=compiled_prompt,
            generated_content=formatted_content.raw_text
        )

        return GenerationResponse(
            id=gen_id,
            product_name=req.product_name,
            product_description=req.product_description,
            platform=req.platform,
            tone=req.tone,
            audience=req.audience,
            objective=req.objective,
            prompt_parameters=params_dict,
            compiled_prompt=compiled_prompt,
            generated_content=formatted_content.raw_text,
            formatted_content=formatted_content,
            platform_validation=validation_result,
            is_demo_mode=is_demo,
            is_saved=False,
            created_at=""
        )

    except Exception as e:
        logger.error(f"Error in generate_content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content generation failed: {str(e)}"
        )

@router.post("/improve", response_model=GenerationResponse)
async def improve_content(req: ImproveRequest):
    """
    Refine existing copy (e.g. Make Shorter, Make Longer, Change Tone, Change Platform).
    """
    try:
        gen_id = str(uuid.uuid4())
        target_platform = req.new_platform or req.platform
        target_tone = req.new_tone or req.tone

        raw_text, compiled_prompt, is_demo = await ai_service.improve_text(
            current_content=req.current_content,
            action=req.action,
            product_name=req.product_name,
            platform=req.platform,
            tone=req.tone,
            new_tone=req.new_tone,
            new_platform=req.new_platform,
            temperature=req.parameters.temperature,
            top_p=req.parameters.top_p
        )

        formatted_content, validation_result = validation_service.validate_and_format(
            raw_text=raw_text,
            platform=target_platform,
            tone=target_tone
        )

        params_dict = req.parameters.model_dump()

        await history_service.save_generation(
            generation_id=gen_id,
            product_name=req.product_name,
            product_description=f"Refinement ({req.action})",
            platform=target_platform,
            tone=target_tone,
            audience="Refined",
            objective=req.action,
            prompt_parameters=params_dict,
            compiled_prompt=compiled_prompt,
            generated_content=formatted_content.raw_text
        )

        return GenerationResponse(
            id=gen_id,
            product_name=req.product_name,
            product_description=f"Refinement ({req.action})",
            platform=target_platform,
            tone=target_tone,
            audience="Refined",
            objective=req.action,
            prompt_parameters=params_dict,
            compiled_prompt=compiled_prompt,
            generated_content=formatted_content.raw_text,
            formatted_content=formatted_content,
            platform_validation=validation_result,
            is_demo_mode=is_demo,
            is_saved=False,
            created_at=""
        )

    except Exception as e:
        logger.error(f"Error in improve_content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Refinement failed: {str(e)}"
        )

@router.post("/regenerate", response_model=GenerationResponse)
async def regenerate_content(req: GenerateRequest):
    """Re-executes generation with identical or tweaked brief inputs."""
    return await generate_content(req)

@router.get("/history", response_model=List[HistoryItemResponse])
async def get_history(
    search: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    tone: Optional[str] = Query(None),
    saved_only: bool = Query(False)
):
    """Retrieve SQLite generation history with search & filter options."""
    try:
        items = await history_service.get_history(
            search=search,
            platform=platform,
            tone=tone,
            only_saved=saved_only
        )
        return items
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history.")

@router.get("/history/{item_id}", response_model=HistoryItemResponse)
async def get_history_by_id(item_id: str):
    """Retrieve specific history entry."""
    item = await history_service.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="History entry not found.")
    return item

@router.delete("/history/{item_id}")
async def delete_history_item(item_id: str):
    """Delete history entry."""
    success = await history_service.delete_item(item_id)
    return {"success": success, "id": item_id}

@router.post("/history/{item_id}/toggle-save")
async def toggle_save_item(item_id: str):
    """Toggle saved/favorite bookmark status for a generation."""
    new_state = await history_service.toggle_save(item_id)
    return {"id": item_id, "is_saved": new_state}

@router.get("/templates", response_model=List[TemplateItem])
async def get_templates():
    """Retrieve reusable prompt templates."""
    return get_preset_templates()
