import random
from typing import Tuple

class DemoEngine:
    """
    Demo Generation Engine.
    Generates realistic, platform-tailored marketing copy locally when OPENAI_API_KEY
    is not provided, enabling full offline evaluation and demonstration.
    """

    @classmethod
    def generate_demo_content(
        cls,
        product_name: str,
        product_description: str,
        platform: str,
        tone: str,
        audience: str,
        objective: str,
        additional_instructions: str = ""
    ) -> str:
        desc_snippet = product_description[:120].strip()
        if len(product_description) > 120:
            desc_snippet += "..."

        if platform == "LinkedIn":
            return f"""🚀 Exciting News: Introducing {product_name}!

Most {audience.lower()} face a constant challenge when trying to elevate their workflow and productivity. Traditional tools fall short, leaving teams scrambling for efficient solutions.

{product_name} changes the game. 

Key features designed for modern teams:
• Built for speed: {desc_snippet}
• Automated efficiency designed specifically for {audience}
• Seamless integration into your existing stack

Whether your goal is {objective.lower()} or scaling your impact, {product_name} empowers you to achieve more in less time.

What's your biggest hurdle in this domain right now? Let's discuss in the comments below! 👇

#Innovation #Technology #{product_name.replace(' ', '')} #Productivity #{audience.replace(' ', '')}"""

        elif platform == "Instagram":
            return f"""✨ Transform the way you work with {product_name}! 🔥

Say goodbye to outdated workarounds! 👋 {product_name} is here to revolutionize how {audience.lower()} approach every project.

💡 Why you'll love it:
👉 {desc_snippet}
👉 Designed for effortless results
👉 Tailored for {objective.lower()}

Ready to take your results to the next level? 🚀

👇 Drop a '🔥' in the comments or click the link in our bio to learn more today!

.
.
#{product_name.replace(' ', '')} #Innovation #{audience.replace(' ', '')} #Productivity #NewRelease"""

        elif platform == "X/Twitter":
            return f"""Stop struggling with inefficient tools. Meet {product_name} ⚡

{desc_snippet}

Built specifically for {audience.lower()} focused on {objective.lower()}.

Try it today and experience the difference: https://copyforge.ai/{product_name.lower().replace(' ', '-')} 🚀

#{product_name.replace(' ', '')} #Tech"""

        elif platform == "Email":
            return f"""SUBJECT LINE: [Launch] Introducing {product_name} – Designed for {audience}

PREVIEW TEXT: Experience {desc_snippet[:60]}...

GREETING: Hi there,

BODY:
We are thrilled to announce the official release of {product_name}!

If you're like most {audience.lower()}, finding a solution that balances power with ease of use has always been a challenge. We built {product_name} specifically to solve this.

{product_description}

Here is what makes {product_name} unique:
1. High-speed performance tailored to your exact needs.
2. Built-in intelligence that streamlines repetitive tasks.
3. Designed from the ground up for {objective.lower()}.

CALL TO ACTION:
[ Claim Your Free Trial Now ]

SIGN-OFF:
Best regards,
The {product_name} Team"""

        elif platform == "Facebook":
            return f"""Meet {product_name} – The ultimate solution for {audience.lower()}! 🎉

Are you ready to upgrade your daily routine? {product_name} was engineered to help you master {objective.lower()} without the headache.

Here's the takeaway:
"{desc_snippet}"

We built this for people who demand quality, reliability, and speed. 

Have questions about how {product_name} can work for you? Send us a message or comment below and our team will get back to you!

👉 Learn more at: https://copyforge.ai/{product_name.lower().replace(' ', '-')}"""

        else: # Website
            return f"""# Elevate Your Experience with {product_name}

## The Ultimate Solution Built for {audience}

{product_name} empowers you to achieve {objective.lower()} effortlessly with smart, modern tools designed for maximum impact.

### Key Benefits
• **Unmatched Efficiency**: {desc_snippet}
• **Tailored Workflow**: Seamlessly customized for {audience.lower()}.
• **Proven Reliability**: Built with production-grade engineering at every level.

### Call to Action
[ Start Your Free Trial Today ] — No credit card required."""

demo_engine = DemoEngine()
