import logging
import os
import datetime
import time
from contextlib import asynccontextmanager
from functools import lru_cache
from urllib.parse import urlparse

from sqlalchemy import inspect, text
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
            content_type TEXT NOT NULL DEFAULT 'Social post',
            prompt_parameters_json TEXT NOT NULL,
            compiled_prompt TEXT NOT NULL,
            generated_content TEXT NOT NULL,
            hook TEXT,
            cta TEXT,
            hashtags_json TEXT NOT NULL DEFAULT '[]',
            image_prompt TEXT,
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
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            linkedin_member_id TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS user_sessions (
            session_hash TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            expires_at BIGINT NOT NULL,
            created_at TEXT NOT NULL
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_expiry ON user_sessions(expires_at)",
        """
        CREATE TABLE IF NOT EXISTS oauth_states (
            provider TEXT NOT NULL,
            state_hash TEXT NOT NULL,
            session_hash TEXT NOT NULL,
            expires_at BIGINT NOT NULL,
            PRIMARY KEY (provider, state_hash)
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_oauth_states_expiry ON oauth_states(expires_at)",
        """
        CREATE TABLE IF NOT EXISTS social_accounts (
            user_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            provider_user_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            profile_image TEXT,
            access_token_ciphertext TEXT NOT NULL,
            token_expires_at BIGINT NOT NULL,
            connected_at TEXT NOT NULL,
            PRIMARY KEY (user_id, platform)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS content_items (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            topic TEXT NOT NULL,
            description TEXT NOT NULL,
            platform TEXT NOT NULL,
            tone TEXT NOT NULL,
            audience TEXT NOT NULL,
            content_type TEXT NOT NULL,
            content TEXT NOT NULL,
            hook TEXT,
            cta TEXT,
            hashtags_json TEXT NOT NULL,
            image_prompt TEXT,
            image_url TEXT,
            created_at TEXT NOT NULL
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_content_items_user_created ON content_items(user_id, created_at)",
        """
        CREATE TABLE IF NOT EXISTS scheduled_posts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            content_item_id TEXT,
            platform TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            scheduled_at TEXT,
            timezone TEXT NOT NULL,
            mode TEXT NOT NULL,
            status TEXT NOT NULL,
            published_url TEXT,
            published_at TEXT,
            last_error TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_scheduled_posts_due ON scheduled_posts(status, scheduled_at)",
        "CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user ON scheduled_posts(user_id, created_at)",
        """
        CREATE TABLE IF NOT EXISTS published_posts (
            id TEXT PRIMARY KEY,
            scheduled_post_id TEXT NOT NULL UNIQUE,
            user_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            published_url TEXT NOT NULL,
            published_at TEXT NOT NULL
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_published_posts_user ON published_posts(user_id, published_at)",
        """
        CREATE TABLE IF NOT EXISTS trend_items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            summary TEXT NOT NULL,
            source TEXT NOT NULL,
            source_url TEXT NOT NULL UNIQUE,
            published_at TEXT,
            retrieved_at TEXT NOT NULL,
            category TEXT DEFAULT 'AI',
            importance TEXT DEFAULT 'High',
            why_it_matters TEXT DEFAULT '',
            source_title TEXT,
            tags_json TEXT DEFAULT '[]',
            freshness TEXT DEFAULT 'Recent'
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_trend_items_retrieved ON trend_items(retrieved_at)",
        """
        CREATE TABLE IF NOT EXISTS image_assets (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            prompt TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            image_data TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_image_assets_user_created ON image_assets(user_id, created_at)",
        """
        CREATE TABLE IF NOT EXISTS analytics (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            published_post_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            metrics_json TEXT NOT NULL,
            retrieved_at TEXT NOT NULL
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_analytics_user_post ON analytics(user_id, published_post_id)",
        """
        CREATE TABLE IF NOT EXISTS automation_settings (
            user_id TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL DEFAULT 0,
            platform TEXT NOT NULL,
            topic TEXT NOT NULL,
            description TEXT NOT NULL,
            tone TEXT NOT NULL,
            audience TEXT NOT NULL,
            content_type TEXT NOT NULL,
            frequency TEXT NOT NULL,
            posting_time TEXT NOT NULL,
            timezone TEXT NOT NULL,
            mode TEXT NOT NULL,
            next_run_at TEXT,
            last_run_at TEXT,
            last_run_error TEXT,
            updated_at TEXT NOT NULL
        )
        """,
    )

    async with engine.begin() as connection:
        for statement in statements:
            await connection.execute(text(statement))
        session_expiry = int(time.time()) + 30 * 24 * 60 * 60
        created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        await connection.execute(
            text(
                """
                INSERT INTO users (id, linkedin_member_id, display_name, created_at)
                SELECT member_id, member_id, display_name, connected_at
                FROM linkedin_connections
                WHERE 1 = 1
                ON CONFLICT(id) DO NOTHING
                """
            )
        )
        await connection.execute(
            text(
                """
                INSERT INTO user_sessions (session_hash, user_id, expires_at, created_at)
                SELECT session_hash, member_id, :expires_at, :created_at
                FROM linkedin_connections
                WHERE 1 = 1
                ON CONFLICT(session_hash) DO NOTHING
                """
            ),
            {"expires_at": session_expiry, "created_at": created_at},
        )
        columns = await connection.run_sync(
            lambda sync_connection: {
                column["name"] for column in inspect(sync_connection).get_columns("history")
            }
        )
        if "user_id" not in columns:
            await connection.execute(text("ALTER TABLE history ADD COLUMN user_id TEXT"))
        if "content_type" not in columns:
            await connection.execute(
                text("ALTER TABLE history ADD COLUMN content_type TEXT NOT NULL DEFAULT 'Social post'")
            )
        for column_name, definition in (
            ("hook", "TEXT"),
            ("cta", "TEXT"),
            ("hashtags_json", "TEXT NOT NULL DEFAULT '[]'"),
            ("image_prompt", "TEXT"),
        ):
            if column_name not in columns:
                await connection.execute(
                    text(f"ALTER TABLE history ADD COLUMN {column_name} {definition}")
                )
        automation_columns = await connection.run_sync(
            lambda sync_connection: {
                column["name"]
                for column in inspect(sync_connection).get_columns("automation_settings")
            }
        )
        for column_name in ("last_run_at", "last_run_error"):
            if column_name not in automation_columns:
                await connection.execute(
                    text(f"ALTER TABLE automation_settings ADD COLUMN {column_name} TEXT")
                )
        trend_columns = await connection.run_sync(
            lambda sync_connection: {
                column["name"]
                for column in inspect(sync_connection).get_columns("trend_items")
            }
        )
        for column_name, definition in (
            ("category", "TEXT DEFAULT 'AI'"),
            ("importance", "TEXT DEFAULT 'High'"),
            ("why_it_matters", "TEXT DEFAULT ''"),
            ("source_title", "TEXT"),
            ("tags_json", "TEXT DEFAULT '[]'"),
            ("freshness", "TEXT DEFAULT 'Recent'"),
        ):
            if column_name not in trend_columns:
                await connection.execute(
                    text(f"ALTER TABLE trend_items ADD COLUMN {column_name} {definition}")
                )
        await connection.execute(
            text("CREATE INDEX IF NOT EXISTS idx_history_user_created ON history(user_id, created_at)")
        )

    if is_sqlite:
        logger.info("Initialized SQLite database.")
    else:
        logger.info("Initialized PostgreSQL database.")
