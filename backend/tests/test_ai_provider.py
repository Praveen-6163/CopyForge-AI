import json
import pytest
from fastapi.testclient import TestClient
import httpx

from app.core.config import settings
from app.main import app
from app.services.ai_service import ai_service, AIProviderError, AIProviderNotConfigured


def test_ai_provider_status_unconfigured(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    
    assert settings.AI_CONFIGURED is False
    assert settings.AI_PROVIDER == "None"

    with TestClient(app) as client:
        root_res = client.get("/")
        assert root_res.status_code == 200
        root_data = root_res.json()
        assert root_data["ai_configured"] is False
        assert root_data["ai_provider"] is None

        health_res = client.get("/api/health")
        assert health_res.status_code == 200
        health_data = health_res.json()
        assert health_data["ai_configured"] is False


def test_ai_provider_status_configured(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-gemini-api-key-12345")
    
    assert settings.AI_CONFIGURED is True
    assert settings.AI_PROVIDER == "Gemini"

    with TestClient(app) as client:
        root_res = client.get("/")
        assert root_res.status_code == 200
        root_data = root_res.json()
        assert root_data["ai_configured"] is True
        assert root_data["ai_provider"] == "Gemini"

        health_res = client.get("/api/health")
        assert health_res.status_code == 200
        health_data = health_res.json()
        assert health_data["ai_configured"] is True
        assert health_data["ai_provider"] == "Gemini"
        assert health_data["ai_model"] == "gemini-2.5-flash"


@pytest.mark.anyio
async def test_ai_service_requires_provider_when_unconfigured(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    with pytest.raises(AIProviderNotConfigured) as exc_info:
        await ai_service.generate_text(
            product_name="Test SaaS",
            product_description="Test Description",
            platform="LinkedIn",
            tone="Professional",
            audience="Developers",
            objective="Product promotion",
        )
    assert "Add GEMINI_API_KEY to the backend environment" in str(exc_info.value)


@pytest.mark.anyio
async def test_ai_service_generates_content_with_gemini(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-123")

    mock_gemini_payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": json.dumps({
                                "content": "Unlock high conversions with automated copy.",
                                "hook": "Stop wasting hours writing copy.",
                                "cta": "Try CopyForge today.",
                                "hashtags": ["#AI", "#Copywriting", "#Marketing"],
                                "image_prompt": "A modern sleek dashboard displaying AI marketing insights."
                            })
                        }
                    ],
                    "role": "model"
                },
                "finishReason": "STOP"
            }
        ]
    }

    async def mock_post_gemini(self, payload):
        return mock_gemini_payload

    monkeypatch.setattr(ai_service, "_post_gemini", mock_post_gemini.__get__(ai_service, ai_service.__class__))

    content, prompt = await ai_service.generate_text(
        product_name="CopyForge AI",
        product_description="Automated AI copywriting tool",
        platform="LinkedIn",
        tone="Professional",
        audience="Marketers",
        objective="Product launch",
    )

    assert content["content"] == "Unlock high conversions with automated copy."
    assert content["hook"] == "Stop wasting hours writing copy."
    assert content["cta"] == "Try CopyForge today."
    assert content["hashtags"] == ["#AI", "#Copywriting", "#Marketing"]
    assert "CopyForge AI" in prompt


@pytest.mark.anyio
async def test_ai_service_handles_auth_error(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "invalid-key")

    def mock_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"error": {"code": 401, "message": "API key not valid."}})

    transport = httpx.MockTransport(mock_handler)
    real_async_client = httpx.AsyncClient

    def client_factory(*args, **kwargs):
        kwargs["transport"] = transport
        return real_async_client(*args, **kwargs)

    monkeypatch.setattr(httpx, "AsyncClient", client_factory)

    with pytest.raises(AIProviderError) as exc_info:
        await ai_service.generate_text(
            product_name="Test SaaS",
            product_description="Test Description",
            platform="LinkedIn",
            tone="Professional",
            audience="Developers",
            objective="Product promotion",
        )
    assert "credentials were rejected" in str(exc_info.value)
