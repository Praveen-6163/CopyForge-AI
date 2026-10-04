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


def _parse_generated_content(response_data: Any, platform: str = "linkedin") -> Dict[str, Any]:
    parsed: dict[str, Any] = {}
    raw_text = ""

    if isinstance(response_data, str):
        raw_text = response_data.strip()
        cleaned_text = _clean_json_text(raw_text)
        try:
            loaded = json.loads(cleaned_text)
            if isinstance(loaded, dict):
                parsed = loaded
        except Exception:
            match = re.search(r"\{.*\}", cleaned_text, re.DOTALL)
            if match:
                try:
                    loaded = json.loads(match.group(0))
                    if isinstance(loaded, dict):
                        parsed = loaded
                except Exception:
                    pass
    elif isinstance(response_data, dict):
        parsed = response_data
        raw_text = json.dumps(response_data, ensure_ascii=False)

    post = str(parsed.get("post") or parsed.get("content") or "").strip()
    headline = str(parsed.get("headline") or parsed.get("hook") or "").strip()
    cta = str(parsed.get("cta") or "").strip()
    image_prompt = str(parsed.get("image_prompt") or "").strip()

    raw_hashtags = parsed.get("hashtags")
    hashtags: list[str] = []
    if isinstance(raw_hashtags, list):
        for tag in raw_hashtags:
            tag_str = str(tag).strip()
            if tag_str:
                if not tag_str.startswith("#"):
                    tag_str = f"#{tag_str}"
                hashtags.append(tag_str)
    elif isinstance(raw_hashtags, str) and raw_hashtags.strip():
        hashtags = [
            f"#{t.lstrip('#')}"
            for t in re.findall(r"#?\w+", raw_hashtags)
        ]

    if not post:
        if raw_text:
            post = raw_text
            lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
            first_line = lines[0] if lines else raw_text[:80]
            if first_line.startswith("#"):
                first_line = first_line.lstrip("#").strip()
            headline = first_line[:100]

            extracted_tags = [
                f"#{t.lstrip('#')}" for t in re.findall(r"#\w+", raw_text)
            ]
            if extracted_tags:
                hashtags = list(dict.fromkeys(extracted_tags))
            else:
                hashtags = ["#AI", "#Innovation", "#Technology"]

            cta = "Connect with us to learn more."
            image_prompt = f"Professional visual for {platform} post about {headline[:50]}"
        else:
            raise AIProviderError(
                "Gemini returned an empty response. Please retry.",
                error_type="EMPTY_RESPONSE",
            )

    return {
        "platform": platform.lower(),
        "headline": headline or post[:80],
        "post": post,
        "content": post,
        "hook": headline or post[:80],
        "hashtags": hashtags or ["#AI", "#Innovation"],
        "cta": cta or "Connect with us to learn more.",
        "source": "CopyForge AI",
        "image_prompt": image_prompt or f"Professional visual for {platform} post",
    }


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

        raw_result = await gemini_service.generate_structured_content(
            user_prompt,
            system_instruction=system_prompt,
            generation_config={
                "temperature": temperature,
                "top_p": top_p,
                "max_output_tokens": max_tokens,
            },
        )
        generated_content = _parse_generated_content(raw_result, platform=platform)
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
