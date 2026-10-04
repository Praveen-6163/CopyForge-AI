import json
import logging

import pytest
from fastapi.testclient import TestClient
from google.genai import errors, types

from app.main import app
from app.services import gemini_service as gemini_service_module
from app.services.gemini_service import (
    AIProviderError,
    FALLBACK_MODELS,
    gemini_service,
)


class FakeModels:
    def __init__(self, responses):
        self.responses = responses
        self.generate_calls = []

    def generate_content(self, *, model, contents, config):
        self.generate_calls.append((model, contents, config))
        response = self.responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response

    def list(self):
        return [
            types.Model(
                name="models/gemini-3.8-flash",
                supported_actions=["generateContent"],
            ),
            types.Model(
                name="models/embedding-test",
                supported_actions=["embedContent"],
            ),
        ]


class FakeClient:
    def __init__(self, *, responses, **kwargs):
        self.models = FakeModels(responses)
        self.api_key = kwargs["api_key"]

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return None


def _response_text(value: str):
    return types.GenerateContentResponse(
        candidates=[
            types.Candidate(
                content=types.Content(parts=[types.Part(text=value)])
            )
        ]
    )


@pytest.mark.anyio
async def test_text_generation_falls_back_once_and_uses_sdk(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "unavailable-test-model")
    fake_client = FakeClient(
        responses=[
            errors.APIError(
                404,
                {
                    "error": {
                        "code": 404,
                        "status": "NOT_FOUND",
                        "message": "Requested model was not found.",
                    }
                },
            ),
            _response_text("Generated text."),
        ],
        api_key="test-key",
    )
    monkeypatch.setattr(
        gemini_service_module.genai,
        "Client",
        lambda **kwargs: fake_client,
    )

    result = await gemini_service.generate_text(
        "Write a post.",
        system_instruction="Be concise.",
        generation_config={"temperature": 0.3},
    )

    assert result == "Generated text."
    assert [call[0] for call in fake_client.models.generate_calls] == [
        "unavailable-test-model",
        FALLBACK_MODELS[0],
    ]
    assert fake_client.models.generate_calls[1][1] == "Write a post."


@pytest.mark.anyio
async def test_structured_generation_uses_fallback_and_parses_json(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "unavailable-test-model")
    fake_client = FakeClient(
        responses=[
            errors.APIError(
                404,
                {"error": {"code": 404, "status": "NOT_FOUND", "message": "Missing model"}},
            ),
            _response_text(json.dumps({"content": "A post."})),
        ],
        api_key="test-key",
    )
    monkeypatch.setattr(
        gemini_service_module.genai,
        "Client",
        lambda **kwargs: fake_client,
    )

    content = await gemini_service.generate_structured_content("Write JSON.")

    assert content == {"content": "A post."}
    assert fake_client.models.generate_calls[1][2].response_mime_type == "application/json"


@pytest.mark.anyio
async def test_api_key_error_is_actionable_and_redacted(monkeypatch, caplog):
    test_key = "AIzaSyABCDEFGHIJKLMNOPQRSTUV"
    monkeypatch.setenv("GEMINI_API_KEY", test_key)
    fake_client = FakeClient(
        responses=[
            errors.APIError(
                403,
                {
                    "error": {
                        "code": 403,
                        "status": "PERMISSION_DENIED",
                        "message": f"Rejected key {test_key}",
                    }
                },
            )
        ],
        api_key=test_key,
    )
    monkeypatch.setattr(
        gemini_service_module.genai,
        "Client",
        lambda **kwargs: fake_client,
    )

    with caplog.at_level(logging.ERROR, logger="copyforge.gemini"):
        with pytest.raises(AIProviderError, match="Gemini API key is invalid or unavailable"):
            await gemini_service.generate_text("Write a post.")

    assert test_key not in caplog.text
    assert "http_status=403" in caplog.text
    assert "error_status=PERMISSION_DENIED" in caplog.text


@pytest.mark.anyio
async def test_ai_health_reports_model_access(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "unavailable-test-model")
    fake_client = FakeClient(responses=[], api_key="test-key")
    monkeypatch.setattr(
        gemini_service_module.genai,
        "Client",
        lambda **kwargs: fake_client,
    )

    status = await gemini_service.check_model()

    assert status["provider"] == "Google Gemini"
    assert status["configured"] is True
    assert status["model"] == "unavailable-test-model"
    assert status["status"] == "healthy"
    assert status["active_model"] == FALLBACK_MODELS[0]


def test_ai_health_endpoint_reports_missing_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    with TestClient(app) as client:
        response = client.get("/api/ai/health")

    res_data = response.json()
    assert res_data["provider"] == "Google Gemini"
    assert res_data["configured"] is False
    assert res_data["model"] == "gemini-3.8-flash"
    assert res_data["status"] == "error"
    assert res_data["error_type"] == "CONFIGURATION"
    assert "Gemini API key is not configured" in res_data["error"]


def test_model_candidates_are_deduplicated_in_fallback_order(monkeypatch):
    monkeypatch.setenv("GEMINI_MODEL", "gemini-3.8-flash")

    assert gemini_service._candidate_models() == list(FALLBACK_MODELS)
