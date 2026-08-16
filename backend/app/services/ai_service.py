import asyncio
import logging
import random
from typing import Tuple, Dict, Any
from openai import AsyncOpenAI, APIError, RateLimitError, APIConnectionError, AuthenticationError
from app.core.config import settings
from app.core.demo_engine import demo_engine
from app.services.prompt_builder import prompt_builder_service

logger = logging.getLogger("copyforge.ai_service")

class AIService:
    """
    AI Generation Service utilizing the official OpenAI Async SDK.
    Includes exponential backoff retry logic, rate limit handling,
    timeout handling, and seamless Demo Mode fallback.
    """

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL

    def _get_client(self) -> AsyncOpenAI:
        return AsyncOpenAI(api_key=self.api_key or "sk-demo-placeholder")

    async def generate_text(
        self,
        product_name: str,
        product_description: str,
        platform: str,
        tone: str,
        audience: str,
        objective: str,
        additional_instructions: str = "",
        temperature: float = 0.5,
        top_p: float = 0.9,
        max_tokens: int = 750
    ) -> Tuple[str, str, bool]:
        """
        Executes text generation.
        Returns: (raw_generated_text, compiled_prompt_summary, is_demo_mode)
        """
        system_prompt, user_prompt = prompt_builder_service.compile_prompt(
            product_name=product_name,
            product_description=product_description,
            platform=platform,
            tone=tone,
            audience=audience,
            objective=objective,
            additional_instructions=additional_instructions
        )

        compiled_prompt_summary = f"System: {system_prompt[:250]}...\n\nUser: {user_prompt}"

        if settings.is_demo_mode:
            logger.info("Running generation in DEMO MODE (No valid OpenAI API Key provided)")
            demo_output = demo_engine.generate_demo_content(
                product_name=product_name,
                product_description=product_description,
                platform=platform,
                tone=tone,
                audience=audience,
                objective=objective,
                additional_instructions=additional_instructions
            )
            # Simulate realistic processing latency
            await asyncio.sleep(0.6)
            return demo_output, compiled_prompt_summary, True

        # Real OpenAI Call with Exponential Backoff Retry Logic
        client = self._get_client()
        max_retries = 3
        base_delay = 1.0

        for attempt in range(1, max_retries + 1):
            try:
                response = await asyncio.wait_for(
                    client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        temperature=temperature,
                        top_p=top_p,
                        max_tokens=max_tokens
                    ),
                    timeout=30.0
                )
                generated_text = response.choices[0].message.content or ""
                return generated_text, compiled_prompt_summary, False

            except RateLimitError as e:
                logger.warning(f"Rate limit hit (Attempt {attempt}/{max_retries}): {e}")
                if attempt == max_retries:
                    logger.error("Rate limit retries exhausted. Falling back to Demo Mode with warning notice.")
                    fallback = f"[Notice: OpenAI Rate Limit Reached - Displaying Demo Sample]\n\n" + demo_engine.generate_demo_content(
                        product_name, product_description, platform, tone, audience, objective, additional_instructions
                    )
                    return fallback, compiled_prompt_summary, True
                # Exponential backoff with jitter
                sleep_time = base_delay * (2 ** (attempt - 1)) + random.uniform(0.1, 0.5)
                await asyncio.sleep(sleep_time)

            except AuthenticationError as e:
                logger.error(f"OpenAI Authentication Error: {e}. Falling back to Demo Mode.")
                demo_output = demo_engine.generate_demo_content(
                    product_name, product_description, platform, tone, audience, objective, additional_instructions
                )
                return demo_output, compiled_prompt_summary, True

            except (APIConnectionError, asyncio.TimeoutError) as e:
                logger.warning(f"Connection/Timeout error (Attempt {attempt}/{max_retries}): {e}")
                if attempt == max_retries:
                    raise Exception("AI Generation timed out after multiple retries. Please try again.")
                sleep_time = base_delay * (2 ** (attempt - 1)) + random.uniform(0.1, 0.3)
                await asyncio.sleep(sleep_time)

            except APIError as e:
                logger.error(f"OpenAI API Error: {e}")
                raise Exception(f"OpenAI API Error: {str(e)}")

        raise Exception("Failed to generate content after retries.")

    async def improve_text(
        self,
        current_content: str,
        action: str,
        product_name: str,
        platform: str,
        tone: str,
        new_tone: str = None,
        new_platform: str = None,
        temperature: float = 0.5,
        top_p: float = 0.9
    ) -> Tuple[str, str, bool]:
        """
        Executes refinement / improvement generation.
        """
        system_prompt, user_prompt = prompt_builder_service.compile_improvement_prompt(
            current_content=current_content,
            action=action,
            product_name=product_name,
            platform=platform,
            tone=tone,
            new_tone=new_tone,
            new_platform=new_platform
        )
        compiled_prompt = f"System: {system_prompt}\nUser: {user_prompt}"

        if settings.is_demo_mode:
            await asyncio.sleep(0.5)
            target_platform = new_platform or platform
            target_tone = new_tone or tone
            if action == "make_shorter":
                words = current_content.split()
                improved = " ".join(words[:max(15, len(words) // 2)]) + "..."
            elif action == "make_longer":
                improved = current_content + f"\n\n🔥 Plus: {product_name} comes with 24/7 dedicated support and instant setup."
            else:
                improved = f"[Refined for {target_platform} - {target_tone}]\n\n" + current_content
            return improved, compiled_prompt, True

        client = self._get_client()
        try:
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                top_p=top_p,
                max_tokens=1000
            )
            return response.choices[0].message.content or "", compiled_prompt, False
        except Exception as e:
            logger.error(f"Improve generation error: {e}")
            return current_content, compiled_prompt, True

ai_service = AIService()
