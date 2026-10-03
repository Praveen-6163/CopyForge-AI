import logging
import os
from contextlib import asynccontextmanager
from functools import lru_cache
from urllib.parse import urlparse

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings

logger = logging.getLogger("copyforge.db")


def _database_url() -> str:
    configured_url = settings.DATABASE_URL
    if configured_url:
        if configured_url.startswith("postgres://"):
            return "postgresql+asyncpg://" + configured_url.removeprefix("postgres://")
        if configured_url.startswith("postgresql://"):
            return "postgresql+asyncpg://" + configured_url.removeprefix("postgresql://")
        return configured_url

    db_path = os.path.abspath(settings.DB_PATH)
    return f"sqlite+aiosqlite:///{db_path}"


@lru_cache(maxsize=8)
def _engine_for(database_url: str):
    parsed = urlparse(database_url)
    options = {"pool_pre_ping": True}
    if parsed.scheme.startswith("sqlite"):
        options["poolclass"] = NullPool
    return create_async_engine(database_url, **options)


def database_url() -> str:
    return _database_url()


@asynccontextmanager
async def get_db():
    engine = _engine_for(_database_url())
    async with engine.begin() as connection:
        yield connection


async def init_db() -> None:
    url = _database_url()
    engine = _engine_for(url)
    is_sqlite = urlparse(url).scheme.startswith("sqlite")
    saved_default = "0" if is_sqlite else "FALSE"
    saved_type = "INTEGER" if is_sqlite else "BOOLEAN"

    statements = (
        f"""
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            product_name TEXT NOT NULL,
            product_description TEXT NOT NULL,
            platform TEXT NOT NULL,
            tone TEXT NOT NULL,
            audience TEXT NOT NULL,
            objective TEXT NOT NULL,
            prompt_parameters_json TEXT NOT NULL,
            compiled_prompt TEXT NOT NULL,
            generated_content TEXT NOT NULL,
            is_saved {saved_type} DEFAULT {saved_default},
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_history_platform ON history(platform)",
        "CREATE INDEX IF NOT EXISTS idx_history_tone ON history(tone)",
        "CREATE INDEX IF NOT EXISTS idx_history_is_saved ON history(is_saved)",
        """
        CREATE TABLE IF NOT EXISTS linkedin_oauth_states (
            state_hash TEXT PRIMARY KEY,
            session_hash TEXT NOT NULL,
            expires_at BIGINT NOT NULL
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_linkedin_oauth_states_expiry ON linkedin_oauth_states(expires_at)",
        """
        CREATE TABLE IF NOT EXISTS linkedin_connections (
            session_hash TEXT PRIMARY KEY,
            provider TEXT NOT NULL,
            member_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            profile_image TEXT,
            access_token_ciphertext TEXT NOT NULL,
            token_expires_at BIGINT NOT NULL,
            connected_at TEXT NOT NULL
        )
        """,
    )

    async with engine.begin() as connection:
        for statement in statements:
            await connection.execute(text(statement))

    if is_sqlite:
        logger.info("Initialized SQLite database.")
    else:
        logger.info("Initialized PostgreSQL database.")
