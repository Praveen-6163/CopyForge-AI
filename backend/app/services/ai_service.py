import json
import logging
import re
from typing import Any, Dict, Tuple

from app.core.config import settings
from app.services.prompt_builder import prompt_builder_service
from app.services.gemini_service import (
    AIProviderError,
    AIProviderNotConfigured,
    gemini_service,
)

logger = logging.getLogger("copyforge.ai_service")


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
        logger.warning("Could not parse structured AI response: %s", error)
        raise AIProviderError(
            "Gemini returned content in an invalid format. Please retry.",
            error_type="INVALID_RESPONSE",
        ) from error


class AIService:
    """Server-side text generation through Google Gemini."""

    def _require_provider(self) -> None:
        if not settings.AI_CONFIGURED:
            raise AIProviderNotConfigured()

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

        generated_content = await gemini_service.generate_structured_content(
            user_prompt,
            system_instruction=system_prompt,
            generation_config={
                "temperature": temperature,
                "top_p": top_p,
                "max_output_tokens": max_tokens,
            },
        )
        generated_content = _parse_generated_content(
            json.dumps(generated_content, ensure_ascii=False)
        )
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

        generated_text = await gemini_service.generate_text(
            user_prompt,
            system_instruction=system_prompt,
            generation_config={
                "temperature": temperature,
                "top_p": top_p,
                "max_output_tokens": 1000,
            },
        )

        return generated_text.strip(), f"System: {system_prompt}\nUser: {user_prompt}"


ai_service = AIService()
