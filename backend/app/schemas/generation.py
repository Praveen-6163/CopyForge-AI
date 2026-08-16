from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PromptParameters(BaseModel):
    temperature: float = Field(0.5, ge=0.0, le=1.0)
    top_p: float = Field(0.9, ge=0.0, le=1.0)
    max_tokens: int = Field(750, ge=100, le=3000)

class GenerateRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=150, description="Product Name")
    product_description: str = Field(..., min_length=5, max_length=3000, description="Product Description")
    platform: str = Field("LinkedIn", description="Target Platform (LinkedIn, Instagram, Email, X/Twitter, Facebook, Website)")
    tone: str = Field("Professional", description="Tone (Professional, Friendly, Witty, Persuasive, Premium, Casual, Inspirational, Technical)")
    audience: str = Field("General", description="Target Audience")
    objective: str = Field("Product promotion", description="Content Objective")
    additional_instructions: Optional[str] = Field("", description="Optional custom constraints")
    parameters: PromptParameters = Field(default_factory=PromptParameters)

class ImproveRequest(BaseModel):
    current_content: str = Field(..., min_length=1)
    action: str = Field(..., description="Action: make_shorter, make_longer, enhance_persuasion, change_tone, change_platform, fix_grammar")
    product_name: str = Field(...)
    platform: str = Field("LinkedIn")
    tone: str = Field("Professional")
    new_tone: Optional[str] = None
    new_platform: Optional[str] = None
    parameters: PromptParameters = Field(default_factory=PromptParameters)

class PlatformValidationResult(BaseModel):
    is_valid: bool = True
    passed_rules: List[str] = []
    warnings: List[str] = []
    platform_constraints: Dict[str, Any] = {}

class EmailFormattedContent(BaseModel):
    subject: str
    preview_text: str
    body: str

class FormattedContent(BaseModel):
    raw_text: str
    email_data: Optional[EmailFormattedContent] = None
    twitter_char_count: Optional[int] = None
    twitter_limit: Optional[int] = 280
    instagram_recommended: Optional[str] = None
    word_count: int
    char_count: int

class GenerationResponse(BaseModel):
    id: str
    product_name: str
    product_description: str
    platform: str
    tone: str
    audience: str
    objective: str
    prompt_parameters: Dict[str, Any]
    compiled_prompt: str
    generated_content: str
    formatted_content: FormattedContent
    platform_validation: PlatformValidationResult
    is_demo_mode: bool = False
    is_saved: bool = False
    created_at: str

class HistoryItemResponse(BaseModel):
    id: str
    product_name: str
    product_description: str
    platform: str
    tone: str
    audience: str
    objective: str
    generated_content: str
    prompt_parameters: Dict[str, Any]
    is_saved: bool
    created_at: str

class TemplateItem(BaseModel):
    id: str
    name: str
    category: str
    description: str
    platform: str
    tone: str
    audience: str
    objective: str
    product_name_placeholder: str
    product_description_placeholder: str
    additional_instructions: str

class HealthResponse(BaseModel):
    status: str
    project_name: str
    tagline: str
    version: str
    demo_mode: bool
    openai_model: str
