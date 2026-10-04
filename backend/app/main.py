import asyncio
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.database.db import check_database_connection
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
    logging.info("Starting CopyForge AI backend...")
    render_without_database = bool(os.getenv("RENDER")) and not settings.DATABASE_URL
    if settings.DATABASE_URL:
        logging.info("Database configuration loaded.")
    elif render_without_database:
        logging.warning(
            "DATABASE_URL is not configured; database-dependent routes will return HTTP 503."
        )
    else:
        logging.info("Database configuration loaded (local SQLite fallback).")

    linkedin_issues = settings.LINKEDIN_CONFIGURATION_ISSUES
    if linkedin_issues:
        logging.warning(
            "LinkedIn OAuth is disabled. Set or fix these environment variables: %s",
            ", ".join(linkedin_issues),
        )
    else:
        logging.info("LinkedIn OAuth is configured.")
    if settings.AI_CONFIGURED:
        logging.info("AI provider configured: %s with model %s.", settings.AI_PROVIDER, settings.GEMINI_MODEL)
    else:
        logging.warning("AI provider is not configured. Set GEMINI_API_KEY on the backend.")

    scheduler = None
    if render_without_database:
        logging.warning("The background scheduler was not started because DATABASE_URL is missing.")
    else:
        scheduler = asyncio.create_task(
            scheduler_loop(), name="copyforge-server-scheduler"
        )
    logging.info("Web server ready. Health endpoint available at /health.")
    try:
        yield
    finally:
        if scheduler is not None:
            scheduler.cancel()
            try:
                await scheduler
            except asyncio.CancelledError:
                pass
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


@app.exception_handler(SQLAlchemyError)
async def database_error_handler(request: Request, error: SQLAlchemyError):
    logging.getLogger("copyforge.db").warning(
        "Database request failed (%s).", type(error).__name__
    )
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Database is temporarily unavailable. Please try again shortly."
        },
    )


@app.get("/health")
async def production_health():
    return {"status": "ok", "service": "copyforge-ai-backend"}


@app.get("/health/db")
async def database_health():
    try:
        await check_database_connection()
    except SQLAlchemyError as error:
        logging.getLogger("copyforge.db").warning(
            "Database health check failed (%s).", type(error).__name__
        )
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "service": "copyforge-ai-backend",
                "database": "unavailable",
            },
        )
    return {
        "status": "ok",
        "service": "copyforge-ai-backend",
        "database": "available",
    }


@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "running",
        "ai_provider": settings.AI_PROVIDER if settings.AI_CONFIGURED else None,
        "ai_configured": settings.AI_CONFIGURED,
        "docs": "/docs"
    }
