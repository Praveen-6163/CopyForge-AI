import asyncio
import sys
import os

# Set UTF-8 output encoding for Windows terminal stdout
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.prompt_builder import prompt_builder_service
from app.services.platform_rules import platform_rules_engine
from app.services.validation_service import validation_service
from app.core.demo_engine import demo_engine
from app.database.db import init_db
from app.services.history_service import history_service
from app.services.ai_service import ai_service

async def run_tests():
    print("--- [TEST 1] Testing Database Init & Storage ---")
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
        generated_content="Test generated content for LinkedIn post."
    )
    print(f"[OK] Saved record ID: {rec_id}")

    history = await history_service.get_history(search="TestProduct")
    assert len(history) > 0, "History query returned empty list!"
    print(f"[OK] History retrieved: {len(history)} items.")

    print("\n--- [TEST 2] Testing Dynamic Prompt Compiler ---")
    sys_p, usr_p = prompt_builder_service.compile_prompt(
        product_name="CopyForge AI",
        product_description="Automated copywriting tool.",
        platform="X/Twitter",
        tone="Witty",
        audience="Developers",
        objective="Product promotion",
        additional_instructions="Keep under 280 chars."
    )
    assert "CopyForge AI" in usr_p
    assert "X/TWITTER" in sys_p
    print("[OK] Dynamic prompt compilation verified.")

    print("\n--- [TEST 3] Testing Platform Rules & Output Validation ---")
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

    print("\n--- [TEST 4] Testing Demo Engine & AI Service Fallback ---")
    raw_text, prompt_sum, is_demo = await ai_service.generate_text(
        product_name="SaaS AI Tool",
        product_description="Automated workflow platform.",
        platform="Instagram",
        tone="Friendly",
        audience="Business Owners",
        objective="Product launch"
    )
    assert len(raw_text) > 0
    assert is_demo is True
    print(f"[OK] Demo engine generated {len(raw_text)} chars of realistic copy.")

    print("\nALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
