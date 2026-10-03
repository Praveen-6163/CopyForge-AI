import asyncio
import json
import logging
import random
from typing import Any, Dict, Tuple

from openai import (
    APIConnectionError,
    APIError,
    AsyncOpenAI,
    AuthenticationError,
    RateLimitError,
)

from app.core.config import settings
from app.services.prompt_builder import prompt_builder_service

logger = logging.getLogger("copyforge.ai_service")


class AIProviderError(Exception):
    pass


class AIProviderNotConfigured(AIProviderError):
    pass


def _parse_generated_content(response_text: str) -> Dict[str, Any]:
    try:
        generated_content = json.loads(response_text)
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
        raise AIProviderError(
            "The AI provider returned content in an invalid format. Please retry."
        ) from error


class AIService:
    """Server-side text generation through the configured OpenAI provider."""

    def _get_client(self) -> AsyncOpenAI:
        return AsyncOpenAI(api_key=settings.OPENAI_API_KEY, timeout=30.0, max_retries=0)

    def _require_provider(self) -> None:
        if not settings.AI_CONFIGURED:
            raise AIProviderNotConfigured(
                "AI generation is not configured. Add OPENAI_API_KEY to the backend environment."
            )

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
    ) -> Tuple[str, str]:
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

        for attempt in range(1, 4):
            try:
                async with self._get_client() as client:
                    response = await client.chat.completions.create(
                        model=settings.OPENAI_MODEL,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        temperature=temperature,
                        top_p=top_p,
                        max_tokens=max_tokens,
                        response_format={"type": "json_object"},
                    )
                response_text = response.choices[0].message.content
                if not response_text or not response_text.strip():
                    raise AIProviderError("The AI provider returned an empty response.")
                generated_content = _parse_generated_content(response_text)
                return generated_content, compiled_prompt
            except RateLimitError as error:
                if attempt == 3:
                    logger.warning("AI provider rate limit retries were exhausted.")
                    raise AIProviderError(
                        "The AI provider rate limit was reached. Try again shortly."
                    ) from error
                await asyncio.sleep(2 ** (attempt - 1) + random.uniform(0.1, 0.5))
            except AuthenticationError as error:
                logger.error("The configured AI provider rejected its credentials.")
                raise AIProviderError(
                    "The configured AI provider credentials were rejected."
                ) from error
            except (APIConnectionError, asyncio.TimeoutError) as error:
                if attempt == 3:
                    logger.warning("AI provider connection retries were exhausted.")
                    raise AIProviderError(
                        "The AI provider could not be reached. Try again shortly."
                    ) from error
                await asyncio.sleep(2 ** (attempt - 1) + random.uniform(0.1, 0.3))
            except APIError as error:
                logger.error("The AI provider returned an API error.")
                raise AIProviderError("The AI provider could not generate content.") from error

        raise AIProviderError("The AI provider could not generate content.")

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
        try:
            async with self._get_client() as client:
                response = await client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temperature,
                    top_p=top_p,
                    max_tokens=1000,
                )
        except AuthenticationError as error:
            logger.error("The configured AI provider rejected its credentials.")
            raise AIProviderError(
                "The configured AI provider credentials were rejected."
            ) from error
        except APIError as error:
            logger.error("The AI provider failed to refine content.")
            raise AIProviderError("The AI provider could not refine content.") from error

        generated_text = response.choices[0].message.content
        if not generated_text or not generated_text.strip():
            raise AIProviderError("The AI provider returned an empty response.")
        return generated_text, f"System: {system_prompt}\nUser: {user_prompt}"


ai_service = AIService()
