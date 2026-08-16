import aiosqlite
import os
import logging
from app.core.config import settings

logger = logging.getLogger("copyforge.db")

CREATE_TABLES_SQL = """
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
    is_saved INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_history_platform ON history(platform);
CREATE INDEX IF NOT EXISTS idx_history_tone ON history(tone);
CREATE INDEX IF NOT EXISTS idx_history_is_saved ON history(is_saved);
"""

async def init_db():
    """Initialize SQLite tables asynchronously."""
    db_path = settings.DB_PATH
    async with aiosqlite.connect(db_path) as db:
        await db.executescript(CREATE_TABLES_SQL)
        await db.commit()
    logger.info(f"Initialized SQLite database at {db_path}")

async def get_db():
    """Async database context manager."""
    db_path = settings.DB_PATH
    async with aiosqlite.connect(db_path) as db:
        db.row_factory = aiosqlite.Row
        yield db
