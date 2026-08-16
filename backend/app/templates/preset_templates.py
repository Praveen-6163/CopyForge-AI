from typing import List
from app.schemas.generation import TemplateItem

PRESET_TEMPLATES: List[TemplateItem] = [
    TemplateItem(
        id="product-launch",
        name="Product Launch",
        category="Product Strategy",
        description="High-energy announcement post designed to build immediate momentum and drive initial try-outs.",
        platform="LinkedIn",
        tone="Inspirational",
        audience="Professionals",
        objective="Product launch",
        product_name_placeholder="TaskPulse AI",
        product_description_placeholder="An autonomous workflow AI assistant that automatically categorizes Jira tickets, drafts release notes, and syncs engineering sprint summaries in real-time.",
        additional_instructions="Focus on the transition from manual sprint tracking to automated clarity. Include a strong call to action."
    ),
    TemplateItem(
        id="startup-announcement",
        name="Startup Announcement",
        category="Company Milestone",
        description="Foundational story post sharing company vision, problem statement, and launch announcement.",
        platform="Website",
        tone="Premium",
        audience="Business Owners",
        objective="Announcement",
        product_name_placeholder="Aether Analytics",
        product_description_placeholder="Real-time predictive revenue analytics engine that converts raw stripe webhooks into automated ARR forecasting and customer churn alerts.",
        additional_instructions="Structure with Hero Headline, key benefit bullet points, and high-converting CTA."
    ),
    TemplateItem(
        id="linkedin-thought-leadership",
        name="LinkedIn Thought Leadership",
        category="Social Media",
        description="Insightful professional framework addressing key industry friction points before introducing the product.",
        platform="LinkedIn",
        tone="Professional",
        audience="Developers",
        objective="Educational",
        product_name_placeholder="DevShield Security",
        product_description_placeholder="Automated secret-scanner and dependency vulnerability inspector that plugs directly into GitHub CI/CD pipelines.",
        additional_instructions="Open with a bold myth or statistic. Use short 1-line paragraphs and bullet points."
    ),
    TemplateItem(
        id="instagram-product-promotion",
        name="Instagram Product Promotion",
        category="Visual Marketing",
        description="Visually catchy Instagram post with vibrant emoji styling, clear benefit list, and 'Link in bio' CTA.",
        platform="Instagram",
        tone="Witty",
        audience="General",
        objective="Product promotion",
        product_name_placeholder="PulseFlow Hydration Bottle",
        product_description_placeholder="Smart self-cleaning water bottle with built-in LED hydration reminders and temperature sensing cap.",
        additional_instructions="Use vibrant emojis, line break dividers, and 5 niche hashtags."
    ),
    TemplateItem(
        id="email-campaign",
        name="Email Campaign",
        category="Direct Response",
        description="Full email drip campaign with curiosity subject line, preview snippet, problem-solution body, and CTA button.",
        platform="Email",
        tone="Persuasive",
        audience="Business Owners",
        objective="Product promotion",
        product_name_placeholder="LeadStream Pro",
        product_description_placeholder="AI B2B lead enrichment tool that finds verified decision-maker email addresses and personalizes outreach messages at scale.",
        additional_instructions="Provide Subject Line, Preview Text, Salutation, Body, and Standalone CTA Button text."
    ),
    TemplateItem(
        id="job-internship-announcement",
        name="Job/Internship Announcement",
        category="Recruitment",
        description="Engaging recruitment post highlighting company culture, role responsibilities, and application link.",
        platform="LinkedIn",
        tone="Friendly",
        audience="Students",
        objective="Announcement",
        product_name_placeholder="DecodeLabs AI Internship",
        product_description_placeholder="A hands-on 12-week intensive generative AI internship program building real-world LLM applications, custom prompt compilers, and full-stack software.",
        additional_instructions="Highlight learning opportunities, mentorship, and key prerequisites. End with application link."
    ),
    TemplateItem(
        id="educational-post",
        name="Educational Post",
        category="Content Marketing",
        description="5-step breakdown post providing immediate value and positioning product as the fastest solution.",
        platform="X/Twitter",
        tone="Technical",
        audience="Developers",
        objective="Educational",
        product_name_placeholder="FastVector DB",
        product_description_placeholder="Ultra-fast embedded vector database optimized for Python and Rust with sub-millisecond similarity search.",
        additional_instructions="Format as a punchy thread or concise post with code/step breakdown."
    )
]

def get_preset_templates() -> List[TemplateItem]:
    return PRESET_TEMPLATES
