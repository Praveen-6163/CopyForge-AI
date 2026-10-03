import asyncio
import sys
from unittest.mock import patch

# Set UTF-8 output encoding for Windows terminal stdout
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.prompt_builder import prompt_builder_service
from app.services.validation_service import validation_service
from app.database.db import init_db
from app.services.history_service import history_service
from app.services.ai_service import (
    AIProviderError,
    AIProviderNotConfigured,
    _parse_generated_content,
    ai_service,
)
from app.api.platform import _create_post_record, _get_post
from app.schemas.platform import PostCreate

async def run_tests():
    print("--- [TEST 1] Testing Database Init & Storage ---")
    await init_db()
    await init_db()
    
    rec_id = await history_service.save_generation(
        product_name="TestProduct",
        product_description="Test Description for product launch.",
        platform="LinkedIn",
        tone="Professional",
        audience="Developers",
        objective="Product launch",
        prompt_parameters={"temperature": 0.5, "top_p": 0.9, "max_tokens": 500},
        compiled_prompt="System: ... User: ...",
        generated_content="Test generated content for LinkedIn post.",
        content_type="Carousel",
        hook="A verified opening hook.",
        cta="Join the discussion.",
        hashtags=["#CopyForge", "#Content"],
        image_prompt="A clean editorial illustration of a content workflow.",
    )
    print(f"[OK] Saved record ID: {rec_id}")

    history = await history_service.get_history(search="TestProduct")
    assert len(history) > 0, "History query returned empty list!"
    stored_generation = next(item for item in history if item["id"] == rec_id)
    assert stored_generation["content_type"] == "Carousel"
    assert stored_generation["hook"] == "A verified opening hook."
    assert stored_generation["cta"] == "Join the discussion."
    assert stored_generation["hashtags"] == ["#CopyForge", "#Content"]
    assert stored_generation["image_prompt"] == "A clean editorial illustration of a content workflow."
    print(f"[OK] History retrieved: {len(history)} items.")

    print("\n--- [TEST 2] Testing account-scoped post persistence ---")
    post = await _create_post_record(
        "test-user",
        PostCreate(
            topic="Test social post",
            description="Integration check",
            platform="linkedin",
            content="A real database-backed draft.",
            content_type="Carousel",
            hook="A real hook.",
            cta="Read more.",
            hashtags=["#Test"],
            image_prompt="An editorial image prompt.",
            mode="draft_only",
        ),
    )
    stored_post = await _get_post(post["id"], "test-user")
    assert stored_post is not None
    assert stored_post["status"] == "draft"
    assert stored_post["content"] == "A real database-backed draft."
    assert stored_post["content_type"] == "Carousel"
    assert stored_post["hook"] == "A real hook."
    assert stored_post["cta"] == "Read more."
    assert stored_post["hashtags"] == ["#Test"]
    assert stored_post["image_prompt"] == "An editorial image prompt."
    assert await _get_post(post["id"], "another-user") is None
    print("[OK] Post content and structured fields are persisted and account-scoped.")

    print("\n--- [TEST 3] Testing Dynamic Prompt Compiler ---")
    sys_p, usr_p = prompt_builder_service.compile_prompt(
        product_name="CopyForge AI",
        product_description="Automated copywriting tool.",
        platform="X/Twitter",
        tone="Witty",
        audience="Developers",
        objective="Product promotion",
        content_type="Carousel",
        additional_instructions="Keep under 280 chars."
    )
    assert "CopyForge AI" in usr_p
    assert "Carousel" in sys_p
    assert "X/TWITTER" in sys_p
    structured_output = _parse_generated_content(
        '{"content":"A generated post.","hook":"A hook.","cta":"Read more.",'
        '"hashtags":["#AI"],"image_prompt":"An editorial visual."}'
    )
    assert structured_output["content"] == "A generated post."
    assert structured_output["hashtags"] == ["#AI"]
    try:
        _parse_generated_content('{"content":"Missing structured fields."}')
    except AIProviderError:
        pass
    else:
        raise AssertionError("Incomplete structured AI output must be rejected.")
    print("[OK] Dynamic prompt compilation verified.")

    print("\n--- [TEST 4] Testing Platform Rules & Output Validation ---")
    email_text = """SUBJECT LINE: Transform Your Marketing Content Fast
PREVIEW TEXT: Create platform-ready copy with AI.

GREETING: Hi Marketer,

BODY:
CopyForge AI converts product ideas into high-converting copy in seconds.

CALL TO ACTION:
[ Get Started Free ]

SIGN-OFF:
Cheers,
CopyForge Team"""

    fmt, val = validation_service.validate_and_format(email_text, "Email", "Professional")
    assert fmt.email_data is not None, "Email parsing failed!"
    assert fmt.email_data.subject == "Transform Your Marketing Content Fast"
    print("[OK] Email structure parsing and validation successful.")

    print("\n--- [TEST 5] Verifying unconfigured AI fails explicitly ---")
    with patch.object(
        ai_service,
        "_require_provider",
        side_effect=AIProviderNotConfigured("AI provider is not configured."),
    ):
        try:
            await ai_service.generate_text(
                product_name="SaaS AI Tool",
                product_description="Automated workflow platform.",
                platform="Instagram",
                tone="Friendly",
                audience="Business Owners",
                objective="Product launch",
                content_type="Story",
            )
        except AIProviderNotConfigured:
            print("[OK] AI generation reports missing provider configuration.")
        else:
            raise AssertionError("AI generation must fail when the provider is not configured.")

    print("\nALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
