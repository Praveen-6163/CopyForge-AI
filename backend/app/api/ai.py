from fastapi import APIRouter

from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.get("/health")
async def ai_health():
    return await gemini_service.check_model()
