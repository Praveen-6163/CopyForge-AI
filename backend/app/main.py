import asyncio
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.db import init_db
from app.database.db import database_url
from app.api.router import router
from app.api.linkedin import router as linkedin_router
from app.api.instagram import router as instagram_router
from app.api.platform import router as platform_router, scheduler_loop

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    await init_db()
    logging.info(f"Started {settings.PROJECT_NAME} backend v{settings.VERSION}")
    logging.info("Database configured: %s", "PostgreSQL" if "postgresql" in database_url() else "SQLite")
    if os.getenv("RENDER") and not settings.DATABASE_URL:
        raise RuntimeError("DATABASE_URL must point to persistent PostgreSQL on Render.")
    linkedin_issues = settings.LINKEDIN_CONFIGURATION_ISSUES
    if linkedin_issues:
        logging.warning(
            "LinkedIn OAuth is disabled. Set or fix these environment variables: %s",
            ", ".join(linkedin_issues),
        )
    else:
        logging.info("LinkedIn OAuth is configured for callback %s", settings.LINKEDIN_REDIRECT_URI)
    if settings.AI_CONFIGURED:
        logging.info("AI provider configured with model %s.", settings.OPENAI_MODEL)
    else:
        logging.warning("AI provider is not configured. Set OPENAI_API_KEY on the backend.")
    scheduler = asyncio.create_task(scheduler_loop(), name="copyforge-server-scheduler")
    try:
        yield
    finally:
        scheduler.cancel()
        try:
            await scheduler
        except asyncio.CancelledError:
            pass
    # Shutdown actions
    logging.info("Shutting down CopyForge AI backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Automated Copywriting & Tone Transformer API",
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(linkedin_router)
app.include_router(instagram_router)
app.include_router(platform_router)


@app.get("/health")
async def production_health():
    return {"status": "healthy"}


@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "running",
        "ai_configured": settings.AI_CONFIGURED,
        "docs": "/docs"
    }
