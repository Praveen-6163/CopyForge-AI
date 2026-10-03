from typing import Dict, Any, Tuple
from app.services.platform_rules import platform_rules_engine

class PromptBuilderService:
    """
    Dynamic Prompt Compiler Service.
    Compiles input variables, platform-specific constraints, tone directives, and target audience
    into a structured, high-performing system prompt and user prompt.
    """

    TONE_DIRECTIVES: Dict[str, str] = {
        "Professional": "Maintain an authoritative, clear, sophisticated, and polished tone. Focus on expertise and credibility.",
        "Friendly": "Adopt a warm, inviting, approachable, and helpful tone with human warmth.",
        "Witty": "Use clever wordplay, subtle humor, sharp commentary, and an entertaining, smart tone.",
        "Persuasive": "Focus intensely on customer pain points, compelling value propositions, strong call-to-actions, and emotional triggers.",
        "Premium": "Exude luxury, exclusivity, craftsmanship, elegance, and high-end sophistication.",
        "Casual": "Relaxed, conversational, authentic, jargon-free, as if talking to a close friend.",
        "Inspirational": "Uplifting, motivating, visionary, empowering, focused on transformation and possibilities.",
        "Technical": "Precise, data-driven, feature-rich, clear, targeted towards engineers or domain experts."
    }

    OBJECTIVE_DIRECTIVES: Dict[str, str] = {
        "Product launch": "Emphasize excitement, novelty, first-access, key innovations, and launch momentum.",
        "Product promotion": "Highlight core features, practical benefits, value proposition, and a clear conversion CTA.",
        "Awareness": "Focus on educating the audience about the core problem solved, building brand recognition and interest.",
        "Engagement": "Spark discussion, invite comments, ask thought-provoking questions, and drive interaction.",
        "Announcement": "Deliver clear, exciting news updates with immediate clarity and high energy.",
        "Educational": "Provide actionable insights, tips, frameworks, or how-to guidance linked to the product solution."
    }

    @classmethod
    def compile_prompt(
        self,
        product_name: str,
        product_description: str,
        platform: str,
        tone: str,
        audience: str,
        objective: str,
        content_type: str = "Social post",
        additional_instructions: str = ""
    ) -> Tuple[str, str]:
        """
        Dynamically compiles system prompt and user prompt.
        Returns: (system_prompt, user_prompt)
        """
        rules = platform_rules_engine.get_rules(platform)
        tone_instruction = self.TONE_DIRECTIVES.get(tone, self.TONE_DIRECTIVES["Professional"])
        objective_instruction = self.OBJECTIVE_DIRECTIVES.get(objective, self.OBJECTIVE_DIRECTIVES["Product promotion"])

        system_prompt = f"""You are CopyForge AI, an elite AI Copywriter and Tone Transformer specialized in crafting high-converting, platform-optimized marketing content.

### CORE TASK ASSIGNMENT:
Generate platform-ready marketing copy for the product '{product_name}' tailored specifically for **{platform}**.

### TARGET PLATFORM CONSTRAINTS ({platform}):
- Tone Directive: {rules['tone_directives']}
- Recommended Length: up to ~{rules['max_character_recommendation']} characters.
- Minimum Words: {rules['min_words']} words.
- Structural Elements Required:
{chr(10).join(['  * ' + r for r in rules['structure']])}

### FORMATTING RULES FOR {platform.upper()}:
{rules['formatting_instructions']}

### TONE SPECIFICATION ({tone.upper()}):
{tone_instruction}

### GOAL & OBJECTIVE ({objective.upper()}):
{objective_instruction}

### TARGET AUDIENCE:
{audience}

### CONTENT FORMAT:
Create a {content_type}, not a generic post. Shape its structure and length for that format.

### CRITICAL RULES:
1. Return only a valid JSON object with exactly these keys: "content", "hook", "cta", "hashtags", "image_prompt".
2. "content" is the complete platform-ready copy, including relevant hashtags where appropriate.
3. "hook" and "cta" are concise strings taken from the generated copy; "hashtags" is an array of hashtag strings.
4. "image_prompt" is a useful visual-generation prompt consistent with the brief, with no unsupported factual claims.
5. Do not add markdown fences, preambles, or commentary. Ensure valid JSON and comply with the constraints for {platform}.
"""

        user_prompt = f"""### CONTENT BRIEF FOR GENERATION:

- **Product Name**: {product_name}
- **Product Description**: {product_description}
- **Target Platform**: {platform}
- **Tone**: {tone}
- **Target Audience**: {audience}
- **Content Objective**: {objective}
- **Content Format**: {content_type}
"""

        if additional_instructions and additional_instructions.strip():
            user_prompt += f"\n- **Additional Custom Instructions**: {additional_instructions.strip()}\n"

        user_prompt += f"\nPlease compile the final marketing copy now for {platform} adhering to all strict formatting instructions."

        return system_prompt, user_prompt

    @classmethod
    def compile_improvement_prompt(
        self,
        current_content: str,
        action: str,
        product_name: str,
        platform: str,
        tone: str,
        new_tone: str = None,
        new_platform: str = None
    ) -> Tuple[str, str]:
        """
        Compiles prompts for refining existing content.
        """
        target_platform = new_platform or platform
        target_tone = new_tone or tone
        rules = platform_rules_engine.get_rules(target_platform)

        system_prompt = f"""You are CopyForge AI, an expert copy editor. Your task is to modify existing marketing copy based on a user action requirement.

Current Platform: {target_platform}
Current Tone: {target_tone}

Format requirements:
{rules['formatting_instructions']}
Do NOT add preamble or meta-text. Return only the revised copy.
"""

        action_descriptions = {
            "make_shorter": "Make the content more concise, trimming fluff while preserving key hook and CTA.",
            "make_longer": "Expand on product benefits, add deeper insights or story elements while keeping high engagement.",
            "enhance_persuasion": "Boost persuasion, add emotional triggers, amplify customer pain points, and sharpen CTA.",
            "change_tone": f"Transform tone completely to '{target_tone}'. Adjust word choices and pacing.",
            "change_platform": f"Adapt and restructure the content specifically for '{target_platform}' respecting platform constraints.",
            "fix_grammar": "Polishing phrasing, fix grammar, and improve sentence flow."
        }

        directive = action_descriptions.get(action, f"Refine the content according to action: {action}.")

        user_prompt = f"""### ORIGINAL CONTENT TO REFINE ({product_name}):
{current_content}

### ACTION REQUESTED:
{directive}

Generate the refined version now:"""

        return system_prompt, user_prompt

prompt_builder_service = PromptBuilderService()
