import re
from typing import Tuple, Dict, Any, Optional
from app.schemas.generation import FormattedContent, EmailFormattedContent, PlatformValidationResult

class OutputValidationService:
    """
    Service responsible for inspecting raw AI responses, stripping filler preambles,
    enforcing platform specific constraints, parsing structured output (e.g., Email fields),
    and providing validation diagnostic feedback.
    """

    PREFIX_PATTERNS = [
        r"(?i)^here (is|are) (your|the) (marketing )?(copy|content|email|post|text)[^\n]*:\s*",
        r"(?i)^sure!?[^\n]*\n+",
        r"(?i)^certainly!?[^\n]*\n+",
        r"(?i)^as an ai copywriter[^\n]*\n+",
        r"(?i)^here's (a|the) (draft|version|copy)[^\n]*:\s*"
    ]

    @classmethod
    def strip_unwanted_prefixes(cls, raw_text: str) -> str:
        """Strip boilerplate conversational preamble lines from AI text."""
        cleaned = raw_text.strip()
        for pattern in cls.PREFIX_PATTERNS:
            cleaned = re.sub(pattern, "", cleaned).strip()
        return cleaned

    @classmethod
    def parse_email_content(cls, text: str) -> Optional[EmailFormattedContent]:
        """Extract Subject, Preview, Body from Email copy formatted with headers."""
        subject = ""
        preview = ""
        body = text

        # Regex search for headers
        subj_match = re.search(r"SUBJECT LINE:\s*([^\n]+)", text, re.IGNORECASE)
        prev_match = re.search(r"PREVIEW TEXT:\s*([^\n]+)", text, re.IGNORECASE)

        if subj_match:
            subject = subj_match.group(1).strip()
        if prev_match:
            preview = prev_match.group(1).strip()

        # Extract body (everything after preview or subject, or full text)
        body_start = 0
        if prev_match:
            body_start = prev_match.end()
        elif subj_match:
            body_start = subj_match.end()

        if body_start > 0:
            body = text[body_start:].strip()
            # Remove remaining labels if present
            body = re.sub(r"^(GREETING|BODY|CALL TO ACTION|SIGN-OFF):\s*", "", body, flags=re.IGNORECASE).strip()

        if subject or preview:
            return EmailFormattedContent(
                subject=subject or "Exclusive Update",
                preview_text=preview or "Open to learn more.",
                body=body
            )
        return None

    @classmethod
    def validate_and_format(
        cls,
        raw_text: str,
        platform: str,
        tone: str
    ) -> Tuple[FormattedContent, PlatformValidationResult]:
        """
        Validates the generated output against platform constraints and constructs
        a structured FormattedContent payload.
        """
        cleaned_text = cls.strip_unwanted_prefixes(raw_text)
        
        words = len(cleaned_text.split())
        chars = len(cleaned_text)

        passed_rules = []
        warnings = []
        is_valid = True

        # Platform checks
        if not cleaned_text or len(cleaned_text.strip()) == 0:
            is_valid = False
            warnings.append("Output is empty.")
        else:
            passed_rules.append("Non-empty output generated.")

        email_data = None
        twitter_char_count = None
        twitter_limit = 280
        instagram_rec = None

        if platform == "X/Twitter":
            twitter_char_count = chars
            if chars <= 280:
                passed_rules.append(f"Character count ({chars}) complies with 280-char limit.")
            else:
                passed_rules.append(f"Multi-tweet thread or long form ({chars} chars).")
                if chars > 500 and "1/" not in cleaned_text:
                    warnings.append(f"Output is {chars} characters. Consider converting to a thread (1/, 2/).")

        elif platform == "Email":
            email_data = cls.parse_email_content(cleaned_text)
            if email_data and email_data.subject:
                passed_rules.append("Valid Subject Line detected.")
            else:
                warnings.append("No explicit Subject Line header detected in email output.")

            if email_data and email_data.preview_text:
                passed_rules.append("Valid Preview Text detected.")

        elif platform == "LinkedIn":
            if "\n\n" in cleaned_text or "\n" in cleaned_text:
                passed_rules.append("Paragraph line breaks present for readability.")
            else:
                warnings.append("Dense text block detected. Add paragraph spacing for LinkedIn.")

            if "#" in cleaned_text:
                passed_rules.append("Hashtag cluster included.")

        elif platform == "Instagram":
            instagram_rec = "Recommended caption length: 150-300 words with emoji dividers."
            if any(char for char in cleaned_text if ord(char) > 0x1F600):
                passed_rules.append("Emojis present for visual engagement.")
            if "#" in cleaned_text:
                passed_rules.append("Instagram hashtag cluster included.")

        formatted_content = FormattedContent(
            raw_text=cleaned_text,
            email_data=email_data,
            twitter_char_count=twitter_char_count,
            twitter_limit=twitter_limit,
            instagram_recommended=instagram_rec,
            word_count=words,
            char_count=chars
        )

        validation_result = PlatformValidationResult(
            is_valid=is_valid and len(warnings) == 0,
            passed_rules=passed_rules,
            warnings=warnings,
            platform_constraints={
                "platform": platform,
                "tone": tone,
                "target_words": words,
                "target_chars": chars
            }
        )

        return formatted_content, validation_result

validation_service = OutputValidationService()
