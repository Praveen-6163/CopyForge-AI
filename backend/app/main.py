import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.db import init_db
from app.api.router import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    await init_db()
    logging.info(f"Started {settings.PROJECT_NAME} backend v{settings.VERSION}")
    if settings.is_demo_mode:
        logging.info("--> OPENAI_API_KEY not found or default. Running in DEMO MODE.")
    else:
        logging.info(f"--> Using OpenAI API with Model: {settings.OPENAI_MODEL}")
    yield
    # Shutdown actions
    logging.info("Shutting down CopyForge AI backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Automated Copywriting & Tone Transformer API",
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "running",
        "demo_mode": settings.is_demo_mode,
        "docs": "/docs"
    }
