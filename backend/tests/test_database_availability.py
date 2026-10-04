from fastapi.testclient import TestClient

from app.api.auth import require_user
from app.database.db import database_url
from app.main import app


def test_render_postgresql_url_uses_asyncpg(monkeypatch):
    monkeypatch.setenv("RENDER", "true")
    monkeypatch.setenv("DATABASE_URL", "postgresql://db.example.invalid/copyforge")

    assert database_url() == "postgresql+asyncpg://db.example.invalid/copyforge"


def test_health_and_database_routes_when_render_database_is_unconfigured(monkeypatch):
    monkeypatch.setenv("RENDER", "true")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    app.dependency_overrides[require_user] = lambda: "health-test-user"

    try:
        with TestClient(app) as client:
            health = client.get("/health")
            assert health.status_code == 200
            assert health.json() == {
                "status": "ok",
                "service": "copyforge-ai-backend",
            }

            database_health = client.get("/health/db")
            assert database_health.status_code == 503
            assert database_health.json() == {
                "status": "error",
                "service": "copyforge-ai-backend",
                "database": "unavailable",
            }

            history = client.get("/api/history")
            assert history.status_code == 503
            assert "Database is temporarily unavailable" in history.json()["detail"]
    finally:
        app.dependency_overrides.pop(require_user, None)
