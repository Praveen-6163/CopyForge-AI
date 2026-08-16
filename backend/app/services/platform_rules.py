from typing import Dict, Any, List

class PlatformRulesEngine:
    """
    Backend rules engine defining structural, formatting, and content constraints
    for each target marketing platform.
    """

    PLATFORM_RULES: Dict[str, Dict[str, Any]] = {
        "LinkedIn": {
            "name": "LinkedIn",
            "max_character_recommendation": 1300,
            "min_words": 100,
            "structure": [
                "Strong narrative hook in the first 2 lines (before 'see more')",
                "Short, punchy single-line or 2-sentence paragraphs with line breaks",
                "Value-driven insights, framework, or industry takeaway",
                "Actionable Call to Action (CTA) encouraging comments/discussion",
                "3 to 5 highly targeted professional hashtags"
            ],
            "tone_directives": "Authoritative yet approachable, professional, thought-leadership style.",
            "formatting_instructions": """
- Use bullet points (• or 🚀) for list items.
- Ensure spacing between every paragraph for high mobile readability.
- Add 3-5 hashtags at the bottom (e.g. #Leadership #Innovation #Tech).
"""
        },
        "Instagram": {
            "name": "Instagram",
            "max_character_recommendation": 800,
            "min_words": 50,
            "structure": [
                "Attention-grabbing visual hook in the first 5 words",
                "Short readable sections divided by emojis and line breaks",
                "Relatable product storytelling or solution highlight",
                "Clear CTA (e.g. 'Link in bio', 'Drop a comment below')",
                "5 to 10 relevant niche hashtags"
            ],
            "tone_directives": "Vibrant, visually engaging, friendly, high energy.",
            "formatting_instructions": """
- Embed context-appropriate emojis throughout the post.
- Keep sentences short and punchy.
- Place hashtag cluster at the end separated by dots or line breaks.
"""
        },
        "X/Twitter": {
            "name": "X/Twitter",
            "max_character_recommendation": 280,
            "min_words": 15,
            "structure": [
                "Instant scroll-stopping hook",
                "Zero fluff; ultra-concise value proposition",
                "Clear CTA or link prompt",
                "Optional 1-2 relevant hashtags"
            ],
            "tone_directives": "Punchy, witty, direct, sharp.",
            "formatting_instructions": """
- CRITICAL: Keep total length under 280 characters if single post, or format clearly as a numbered 2-3 tweet thread (1/, 2/, 3/).
- Avoid filler words like 'In today's fast-paced world...'.
"""
        },
        "Email": {
            "name": "Email",
            "max_character_recommendation": 2000,
            "min_words": 80,
            "structure": [
                "SUBJECT LINE: High open-rate, curiosity or benefit-driven subject line",
                "PREVIEW TEXT: 1-sentence snippet summarizing the value",
                "GREETING: Warm, personalized salutation (e.g., 'Hi [Name],')",
                "BODY: Problem statement, product solution presentation, key benefits",
                "CTA: Prominent standalone Call-to-Action button or link",
                "CLOSING: Professional sign-off"
            ],
            "tone_directives": "Persuasive, conversational, value-oriented, personal.",
            "formatting_instructions": """
- You MUST structure the response clearly with explicit headers:
  SUBJECT LINE: <Subject text>
  PREVIEW TEXT: <Preview text>
  GREETING: <Greeting text>
  BODY: <Body text with paragraphs>
  CALL TO ACTION: <CTA text>
  SIGN-OFF: <Sign-off text>
"""
        },
        "Facebook": {
            "name": "Facebook",
            "max_character_recommendation": 1000,
            "min_words": 60,
            "structure": [
                "Conversational opening hook",
                "Story-driven product feature or customer benefit highlight",
                "Community engagement question to drive comments",
                "Clear CTA"
            ],
            "tone_directives": "Friendly, conversational, community-centric, persuasive.",
            "formatting_instructions": """
- Use an inviting, personal voice as if talking to a colleague or community member.
- Include a closing question to stimulate comments.
"""
        },
        "Website": {
            "name": "Website/Product Page",
            "max_character_recommendation": 1500,
            "min_words": 80,
            "structure": [
                "HERO HEADLINE: High-impact H1 value proposition",
                "SUBHEADLINE: Supporting summary clarifying who it's for and main benefit",
                "KEY BENEFITS: 3 bullet points with bold sub-headers",
                "PRIMARY CTA: Action-oriented button copy (e.g. 'Get Started Free')",
                "SOCIAL PROOF / TRUST BADGE: Short trust claim or headline summary"
            ],
            "tone_directives": "Clear, premium, high-converting, crisp, feature-benefit oriented.",
            "formatting_instructions": """
- Format clearly with Markdown headers (# Hero Headline, ## Subheadline, ### Key Benefits, ### Call to Action).
"""
        }
    }

    @classmethod
    def get_rules(cls, platform: str) -> Dict[str, Any]:
        """Fetch rule dictionary for platform, defaulting to LinkedIn if unknown."""
        return cls.PLATFORM_RULES.get(platform, cls.PLATFORM_RULES["LinkedIn"])

    @classmethod
    def get_supported_platforms(cls) -> List[str]:
        return list(cls.PLATFORM_RULES.keys())

platform_rules_engine = PlatformRulesEngine()
