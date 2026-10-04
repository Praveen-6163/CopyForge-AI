import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.services.gemini_service import gemini_service
from app.services.ai_service import ai_service


# 1. Backend startup test
def test_backend_startup_without_crashing():
    with TestClient(app) as client:
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["service"] == "copyforge-ai-backend"


# 2. Gemini health test
def test_gemini_ai_health_endpoint(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-12345")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-3.8-flash")

    async def mock_get_available_models(self):
        return ["gemini-3.8-flash", "gemini-3.5-flash-lite"]

    monkeypatch.setattr(
        gemini_service,
        "get_available_models",
        mock_get_available_models.__get__(gemini_service, type(gemini_service)),
    )

    with TestClient(app) as client:
        res = client.get("/api/ai/health")
        assert res.status_code == 200
        data = res.json()
        assert data["provider"] == "Google Gemini"
        assert data["configured"] is True
        assert data["model"] == "gemini-3.8-flash"
        assert data["status"] == "healthy"
        assert "api_key" not in data
        assert "GEMINI_API_KEY" not in data


# 3. Simple Gemini text generation test
@pytest.mark.anyio
async def test_simple_gemini_text_generation(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-12345")

    async def mock_generate_content_response(self, prompt, **kwargs):
        class DummyResponse:
            text = "CopyForge AI helps you turn product ideas into high-converting posts."
        return DummyResponse()

    monkeypatch.setattr(
        gemini_service,
        "generate_content_response",
        mock_generate_content_response.__get__(gemini_service, type(gemini_service)),
    )

    text = await gemini_service.generate_text("Introduce CopyForge AI.")
    assert "CopyForge AI" in text


# 4, 5, 6. Content Studio LinkedIn, Instagram, and Hashtag generation
@pytest.mark.anyio
@pytest.mark.parametrize("platform", ["LinkedIn", "Instagram"])
async def test_content_studio_generation(monkeypatch, platform):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-12345")

    async def mock_generate_structured_content(self, prompt, **kwargs):
        return {
            "content": f"Automated marketing copy for {platform}.",
            "hook": f"Attention marketers on {platform}!",
            "cta": "Get started now.",
            "hashtags": ["#AI", f"#{platform}", "#Copywriting"],
            "image_prompt": f"A vibrant visual for {platform} marketing.",
        }

    monkeypatch.setattr(
        gemini_service,
        "generate_structured_content",
        mock_generate_structured_content.__get__(gemini_service, type(gemini_service)),
    )

    result, compiled_prompt = await ai_service.generate_text(
        product_name="CopyForge AI",
        product_description="AI copywriting suite",
        platform=platform,
        tone="Professional",
        audience="Business Owners",
        objective="Product launch",
    )

    assert result["content"] == f"Automated marketing copy for {platform}."
    assert result["hook"] == f"Attention marketers on {platform}!"
    assert len(result["hashtags"]) == 3
    assert f"#{platform}" in result["hashtags"]


# 7. PostgreSQL / SQLite connection test
def test_database_health_endpoint():
    with TestClient(app) as client:
        res = client.get("/health/db")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["database"] == "available"


# 8. Existing API routes check
def test_existing_api_routes():
    with TestClient(app) as client:
        assert client.get("/").status_code == 200
        assert client.get("/api/health").status_code == 200
        assert client.get("/api/templates").status_code == 200
        assert client.get("/api/social/linkedin/status").status_code == 200
        assert client.get("/api/social/instagram/status").status_code == 200


# 9. Render deployment compatibility test
def test_render_deployment_compatibility(monkeypatch):
    monkeypatch.setenv("PORT", "10000")
    assert settings.PORT == 10000
    assert settings.CORS_ALLOWED_ORIGINS is not None
    assert "https://copyforge-aiauto.netlify.app" in settings.CORS_ALLOWED_ORIGINS
