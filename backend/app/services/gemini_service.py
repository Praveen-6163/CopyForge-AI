import asyncio
import base64
import json
import logging
import re
from collections.abc import Callable, Sequence
from typing import Any

import httpx
from google import genai
from google.genai import errors, types

from app.core.config import settings

logger = logging.getLogger("copyforge.gemini")

DEFAULT_MODEL = "gemini-3.8-flash"
FALLBACK_MODELS = ("gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-flash-latest")
GEMINI_ENDPOINT = "generativelanguage.googleapis.com (Gemini Developer API v1beta)"
REQUEST_TIMEOUT_MS = 60_000
_API_KEY_PATTERN = re.compile(r"AIza[0-9A-Za-z_-]{20,}")


class AIProviderError(RuntimeError):
    def __init__(
        self,
        detail: str,
        *,
        status_code: int = 502,
        error_type: str = "GENERATION",
    ) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.error_type = error_type


class AIProviderNotConfigured(AIProviderError):
    def __init__(self) -> None:
        super().__init__(
            "AI generation is not configured. Add GEMINI_API_KEY to the backend environment.",
            status_code=503,
            error_type="CONFIGURATION",
        )


def _safe_message(message: Any, api_key: str = "") -> str:
    safe_message = str(message or "No provider message was returned.")
    if api_key:
        safe_message = safe_message.replace(api_key, "[REDACTED]")
    if settings.GEMINI_API_KEY:
        safe_message = safe_message.replace(settings.GEMINI_API_KEY, "[REDACTED]")
    if settings.LINKEDIN_CLIENT_SECRET:
        safe_message = safe_message.replace(settings.LINKEDIN_CLIENT_SECRET, "[REDACTED]")
    if settings.SECRET_KEY:
        safe_message = safe_message.replace(settings.SECRET_KEY, "[REDACTED]")
    if settings.DATABASE_URL:
        safe_message = safe_message.replace(settings.DATABASE_URL, "[REDACTED]")
    if settings.META_APP_SECRET:
        safe_message = safe_message.replace(settings.META_APP_SECRET, "[REDACTED]")
    safe_message = _API_KEY_PATTERN.sub("[REDACTED]", safe_message)
    return " ".join(safe_message.split())[:500]


def _provider_error(error: errors.APIError, model: str, api_key: str) -> AIProviderError:
    code = getattr(error, "code", None)
    status = getattr(error, "status", None)
    message = _safe_message(getattr(error, "message", error), api_key)
    logger.error(
        "Gemini request failed: provider=Google Gemini endpoint=%s model=%s "
        "http_status=%s error_code=%s error_status=%s message=%s",
        GEMINI_ENDPOINT,
        model,
        code,
        code,
        status,
        message,
    )

    if code in (401, 403):
        return AIProviderError(
            "Gemini API key is invalid or unavailable. Please check the backend environment configuration.",
            status_code=503,
            error_type="INVALID_CREDENTIALS",
        )
    if code == 429:
        return AIProviderError(
            "Gemini API rate limit reached. Please try again shortly.",
            status_code=429,
            error_type="RATE_LIMIT",
        )
    if code == 400:
        return AIProviderError(
            "Gemini could not process this request. Check the request configuration and try again.",
            status_code=502,
            error_type="INVALID_REQUEST",
        )
    if code == 404 or status == "NOT_FOUND":
        return AIProviderError(
            "Gemini generation is temporarily unavailable. Check the AI health status for details.",
            status_code=503,
            error_type="MODEL_ACCESS",
        )
    if code in (500, 503):
        return AIProviderError(
            "Gemini generation is temporarily unavailable. Please try again shortly.",
            status_code=503,
            error_type="PROVIDER_UNAVAILABLE",
        )
    return AIProviderError(
        "Gemini generation failed. Check the AI health status for details.",
        status_code=502,
        error_type="PROVIDER_ERROR",
    )


class GeminiService:
    def _require_api_key(self) -> str:
        api_key = settings.GEMINI_API_KEY
        if not settings.AI_CONFIGURED:
            raise AIProviderNotConfigured()
        return api_key

    def _candidate_models(self, requested_model: str | None = None) -> list[str]:
        configured_model = (requested_model or settings.GEMINI_MODEL or DEFAULT_MODEL).strip()
        return list(dict.fromkeys((configured_model, *FALLBACK_MODELS)))

    def _run_sync(self, operation: Callable[[Any, str], Any]) -> Any:
        api_key = self._require_api_key()
        options = types.HttpOptions(
            timeout=REQUEST_TIMEOUT_MS,
            retry_options=types.HttpRetryOptions(attempts=1),
        )
        with genai.Client(api_key=api_key, http_options=options) as client:
            return operation(client, api_key)

    async def _run(self, operation: Callable[[Any, str], Any]) -> Any:
        try:
            return await asyncio.to_thread(self._run_sync, operation)
        except AIProviderError:
            raise
        except (httpx.TimeoutException, TimeoutError) as error:
            logger.warning(
                "Gemini request timed out: provider=Google Gemini endpoint=%s",
                GEMINI_ENDPOINT,
            )
            raise AIProviderError(
                "Gemini generation timed out. Please try again shortly.",
                status_code=504,
                error_type="TIMEOUT",
            ) from error
        except Exception as error:
            if isinstance(error, errors.APIError):
                raise _provider_error(error, settings.GEMINI_MODEL, settings.GEMINI_API_KEY) from error
            logger.error(
                "Gemini request failed: provider=Google Gemini endpoint=%s "
                "error_type=%s message=%s",
                GEMINI_ENDPOINT,
                type(error).__name__,
                _safe_message(error, settings.GEMINI_API_KEY),
            )
            raise AIProviderError(
                "Gemini generation is temporarily unavailable. Please try again shortly.",
                status_code=503,
                error_type="PROVIDER_UNAVAILABLE",
            ) from error

    async def generate_content_response(
        self,
        prompt: str,
        *,
        model: str | None = None,
        system_instruction: str | None = None,
        generation_config: dict[str, Any] | types.GenerateContentConfig | None = None,
        tools: Sequence[types.Tool] | None = None,
    ) -> types.GenerateContentResponse:
        config_data: dict[str, Any] = {}
        if isinstance(generation_config, dict):
            config_data.update(generation_config)
        elif generation_config is not None:
            config_data.update(generation_config.model_dump(exclude_none=True))
        if system_instruction is not None:
            config_data["system_instruction"] = system_instruction
        if tools is not None:
            config_data["tools"] = list(tools)
        config = types.GenerateContentConfig(**config_data) if config_data else None
        models = self._candidate_models(model)

        def request(client: Any, api_key: str) -> types.GenerateContentResponse:
            for index, model_name in enumerate(models):
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config,
                    )
                    logger.info(
                        "Gemini request succeeded: provider=Google Gemini endpoint=%s model=%s",
                        GEMINI_ENDPOINT,
                        model_name,
                    )
                    return response
                except errors.APIError as error:
                    mapped_error = _provider_error(error, model_name, api_key)
                    if (
                        mapped_error.error_type == "MODEL_ACCESS"
                        and index + 1 < len(models)
                    ):
                        logger.warning(
                            "Gemini model is unavailable; trying fallback: "
                            "provider=Google Gemini model=%s fallback_model=%s",
                            model_name,
                            models[index + 1],
                        )
                        continue
                    raise mapped_error from error

            raise AIProviderError(
                "Gemini generation is temporarily unavailable. Check the AI health status for details.",
                status_code=503,
                error_type="MODEL_ACCESS",
            )

        return await self._run(request)

    async def generate_text(
        self,
        prompt: str,
        *,
        model: str | None = None,
        system_instruction: str | None = None,
        generation_config: dict[str, Any] | types.GenerateContentConfig | None = None,
        tools: Sequence[types.Tool] | None = None,
    ) -> str:
        response = await self.generate_content_response(
            prompt,
            model=model,
            system_instruction=system_instruction,
            generation_config=generation_config,
            tools=tools,
        )
        text_response = response.text
        if not text_response or not text_response.strip():
            raise AIProviderError(
                "Gemini returned an empty response. Please try again.",
                error_type="EMPTY_RESPONSE",
            )
        return text_response.strip()

    async def generate_structured_content(
        self,
        prompt: str,
        *,
        system_instruction: str | None = None,
        generation_config: dict[str, Any] | types.GenerateContentConfig | None = None,
        model: str | None = None,
    ) -> dict[str, Any]:
        config_data: dict[str, Any] = {}
        if isinstance(generation_config, dict):
            config_data.update(generation_config)
        elif generation_config is not None:
            config_data.update(generation_config.model_dump(exclude_none=True))
        config_data["response_mime_type"] = "application/json"

        response_text = await self.generate_text(
            prompt,
            model=model,
            system_instruction=system_instruction,
            generation_config=config_data,
        )
        try:
            result = json.loads(response_text)
        except json.JSONDecodeError as error:
            logger.warning("Gemini returned malformed structured content.")
            raise AIProviderError(
                "Gemini returned content in an invalid format. Please retry.",
                error_type="INVALID_RESPONSE",
            ) from error
        if not isinstance(result, dict):
            raise AIProviderError(
                "Gemini returned content in an invalid format. Please retry.",
                error_type="INVALID_RESPONSE",
            )
        return result

    async def generate_image(
        self,
        prompt: str,
        *,
        model: str | None = None,
        aspect_ratio: str = "1:1",
    ) -> tuple[str, str]:
        image_model = model or settings.GEMINI_IMAGE_MODEL

        def request(client: Any, api_key: str) -> tuple[str, str]:
            try:
                response = client.models.generate_images(
                    model=image_model,
                    prompt=prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                        aspect_ratio=aspect_ratio,
                        output_mime_type="image/png",
                    ),
                )
            except errors.APIError as error:
                raise _provider_error(error, image_model, api_key) from error

            images = response.generated_images or []
            if not images or not images[0].image or not images[0].image.image_bytes:
                raise AIProviderError(
                    "Gemini returned no image. Please try again.",
                    error_type="EMPTY_RESPONSE",
                )
            image = images[0].image
            mime_type = image.mime_type or "image/png"
            return base64.b64encode(image.image_bytes).decode("ascii"), mime_type

        return await self._run(request)

    async def get_available_models(self) -> list[str]:
        def list_models(client: Any, api_key: str) -> list[str]:
            try:
                models = client.models.list()
                return sorted(
                    model.name.removeprefix("models/")
                    for model in models
                    if model.name
                    and model.supported_actions
                    and "generateContent" in model.supported_actions
                )
            except errors.APIError as error:
                raise _provider_error(error, settings.GEMINI_MODEL, api_key) from error

        return await self._run(list_models)

    async def check_model(self) -> dict[str, Any]:
        model = settings.GEMINI_MODEL or DEFAULT_MODEL
        result: dict[str, Any] = {
            "provider": "Google Gemini",
            "configured": settings.AI_CONFIGURED,
            "model": model,
        }
        if not settings.AI_CONFIGURED:
            result.update(
                status="error",
                error_type="CONFIGURATION",
                error="Gemini API key is not configured.",
            )
            return result
        try:
            available = set(await self.get_available_models())
        except AIProviderError as error:
            result.update(
                status="error",
                error_type=error.error_type,
                error=str(error),
            )
            return result

        for candidate in self._candidate_models(model):
            if candidate in available:
                result.update(status="healthy", active_model=candidate)
                return result

        result.update(
            status="error",
            error_type="MODEL_ACCESS",
            error="No configured Gemini model is available for content generation.",
        )
        return result


gemini_service = GeminiService()
