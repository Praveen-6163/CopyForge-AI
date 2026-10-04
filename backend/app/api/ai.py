from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings
from app.services.gemini_service import AIProviderError, gemini_service

router = APIRouter(prefix="/api", tags=["AI"])


class GeminiTestRequest(BaseModel):
    prompt: str | None = None


@router.get("/health/gemini")
@router.get("/ai/health")
async def gemini_health():
    return await gemini_service.check_model()


@router.post("/test/gemini")
@router.post("/ai/test")
async def gemini_test(req: GeminiTestRequest | None = None):
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

