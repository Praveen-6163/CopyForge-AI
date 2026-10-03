import asyncio
import json
import logging
import random
import re
from typing import Any, Dict, Tuple

import httpx

from app.core.config import settings
from app.services.prompt_builder import prompt_builder_service

logger = logging.getLogger("copyforge.ai_service")


class AIProviderError(Exception):
    pass


class AIProviderNotConfigured(AIProviderError):
    pass


def _clean_json_text(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _parse_generated_content(response_text: str) -> Dict[str, Any]:
    try:
        cleaned_text = _clean_json_text(response_text)
        generated_content = json.loads(cleaned_text)
        if not isinstance(generated_content, dict):
            raise ValueError("Expected an object.")
        if not isinstance(generated_content.get("content"), str):
            raise ValueError("Missing generated content.")
        for field in ("hook", "cta", "image_prompt"):
            if not isinstance(generated_content.get(field), str) or not generated_content[field].strip():
                raise ValueError(f"Missing {field}.")
        hashtags = generated_content.get("hashtags")
        if not isinstance(hashtags, list) or not all(
            isinstance(item, str) for item in hashtags
        ):
            raise ValueError("Invalid hashtag list.")
        if not generated_content["content"].strip():
            raise ValueError("Generated content is empty.")
        return generated_content
    except (json.JSONDecodeError, ValueError) as error:
        logger.warning("Could not parse AI response as JSON: %s. Response was: %s", error, response_text[:200])
        raise AIProviderError(
            "The AI provider returned content in an invalid format. Please retry."
        ) from error


def _extract_text_from_gemini_response(data: dict) -> str:
    if "error" in data:
        err = data["error"]
        msg = err.get("message") if isinstance(err, dict) else str(err)
        status_code = err.get("code") if isinstance(err, dict) else None
        if status_code in (401, 403) or "API_KEY_INVALID" in msg:
            raise AIProviderError("The configured AI provider credentials were rejected.")
        raise AIProviderError(f"The AI provider error: {msg}")

    candidates = data.get("candidates") or []
    if not candidates:
        prompt_feedback = data.get("promptFeedback") or {}
        block_reason = prompt_feedback.get("blockReason")
        if block_reason:
            raise AIProviderError(f"Content generation was blocked by safety filters: {block_reason}")
        raise AIProviderError("The AI provider returned an empty response.")

    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    if not parts:
        raise AIProviderError("The AI provider returned an empty candidate.")

    return "".join(part.get("text", "") for part in parts if isinstance(part, dict))


class AIService:
    """Server-side text generation through Google Gemini."""

    def _require_provider(self) -> None:
        if not settings.AI_CONFIGURED:
            raise AIProviderNotConfigured(
                "AI generation is not configured. Add GEMINI_API_KEY to the backend environment."
            )

    def _get_endpoint_url(self) -> str:
        return f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"

    def _get_headers(self) -> dict[str, str]:
        return {
            "x-goog-api-key": settings.GEMINI_API_KEY,
            "Content-Type": "application/json",
        }

    async def _post_gemini(self, payload: dict) -> dict:
        url = self._get_endpoint_url()
        headers = self._get_headers()

        for attempt in range(1, 4):
            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    response = await client.post(url, headers=headers, json=payload)

                if response.status_code in (401, 403):
                    logger.error("The configured AI provider rejected its credentials.")
                    raise AIProviderError("The configured AI provider credentials were rejected.")

                if response.status_code == 429:
                    if attempt == 3:
                        logger.warning("AI provider rate limit retries were exhausted.")
                        raise AIProviderError("The AI provider rate limit was reached. Try again shortly.")
                    await asyncio.sleep(2 ** (attempt - 1) + random.uniform(0.2, 0.6))
                    continue

                if response.status_code >= 500:
                    if attempt == 3:
                        logger.warning("AI provider server errors exhausted retries.")
                        raise AIProviderError("The AI provider could not be reached. Try again shortly.")
                    await asyncio.sleep(2 ** (attempt - 1) + random.uniform(0.2, 0.5))
                    continue

                if response.status_code != 200:
                    error_detail = response.text[:200]
                    logger.error("The AI provider returned HTTP %s: %s", response.status_code, error_detail)
                    raise AIProviderError(f"The AI provider returned an error ({response.status_code}).")

                return response.json()

            except (httpx.ConnectError, httpx.TimeoutException) as error:
                if attempt == 3:
                    logger.warning("AI provider connection retries were exhausted: %s", error)
                    raise AIProviderError("The AI provider could not be reached. Try again shortly.") from error
                await asyncio.sleep(2 ** (attempt - 1) + random.uniform(0.1, 0.4))
            except AIProviderError:
                raise
            except Exception as error:
                logger.exception("Unexpected error communicating with AI provider.")
                raise AIProviderError("The AI provider could not generate content.") from error

        raise AIProviderError("The AI provider could not generate content.")

    async def generate_text(
        self,
        product_name: str,
        product_description: str,
        platform: str,
        tone: str,
        audience: str,
        objective: str,
        content_type: str = "Social post",
        additional_instructions: str = "",
        temperature: float = 0.5,
        top_p: float = 0.9,
        max_tokens: int = 750,
    ) -> Tuple[Dict[str, Any], str]:
        self._require_provider()
        system_prompt, user_prompt = prompt_builder_service.compile_prompt(
            product_name=product_name,
            product_description=product_description,
            platform=platform,
            tone=tone,
            audience=audience,
            objective=objective,
            content_type=content_type,
            additional_instructions=additional_instructions,
        )
        compiled_prompt = f"System: {system_prompt[:250]}...\n\nUser: {user_prompt}"

        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "topP": top_p,
                "maxOutputTokens": max_tokens,
                "responseMimeType": "application/json",
            },
        }

        data = await self._post_gemini(payload)
        response_text = _extract_text_from_gemini_response(data)
        if not response_text or not response_text.strip():
            raise AIProviderError("The AI provider returned an empty response.")

        generated_content = _parse_generated_content(response_text)
        return generated_content, compiled_prompt

    async def improve_text(
        self,
        current_content: str,
        action: str,
        product_name: str,
        platform: str,
        tone: str,
        new_tone: str | None = None,
        new_platform: str | None = None,
        temperature: float = 0.5,
        top_p: float = 0.9,
    ) -> Tuple[str, str]:
        self._require_provider()
        system_prompt, user_prompt = prompt_builder_service.compile_improvement_prompt(
            current_content=current_content,
            action=action,
            product_name=product_name,
            platform=platform,
            tone=tone,
            new_tone=new_tone,
            new_platform=new_platform,
        )

        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "topP": top_p,
                "maxOutputTokens": 1000,
            },
        }

        data = await self._post_gemini(payload)
        generated_text = _extract_text_from_gemini_response(data)
        if not generated_text or not generated_text.strip():
            raise AIProviderError("The AI provider returned an empty response.")

        return generated_text.strip(), f"System: {system_prompt}\nUser: {user_prompt}"


ai_service = AIService()
