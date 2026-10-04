from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

SocialPlatform = Literal["linkedin", "instagram"]
PublishMode = Literal["draft_only", "approval_required", "auto_publish"]


class PostCreate(BaseModel):
    topic: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    platform: SocialPlatform
    content: str = Field(min_length=1, max_length=30000)
    tone: str = Field(default="Professional", max_length=80)
    audience: str = Field(default="General", max_length=200)
    content_type: str = Field(default="Social post", max_length=100)
    hook: str | None = Field(default=None, max_length=1000)
    cta: str | None = Field(default=None, max_length=1000)
    hashtags: list[str] = Field(default_factory=list, max_length=30)
    image_prompt: str | None = Field(default=None, max_length=4000)
    image_url: str | None = Field(default=None, max_length=5000)
    scheduled_at: datetime | None = None
    timezone: str = Field(default="Asia/Kolkata", max_length=80)
    mode: PublishMode = "draft_only"


class AutomationSettings(BaseModel):
    enabled: bool = False
    platform: SocialPlatform = "linkedin"
    topic: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=5000)
    tone: str = Field(default="Professional", max_length=80)
    audience: str = Field(default="General", max_length=200)
    content_type: str = Field(default="Social post", max_length=100)
    frequency: Literal["daily"] = "daily"
    posting_time: str = Field(default="06:00", pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    timezone: str = Field(default="Asia/Kolkata", max_length=80)
    mode: PublishMode = "approval_required"


class ImageGenerationRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)
    aspect_ratio: Literal["1:1", "16:9", "4:5"] = "1:1"


class TrendItemResponse(BaseModel):
    id: str
    title: str
    summary: str
    category: str = "AI"
    importance: Literal["High", "Medium", "Low"] = "High"
    whyItMatters: str = ""
    publishedAt: str | None = None
    retrievedAt: str
    sourceName: str
    sourceUrl: str
    sourceTitle: str | None = None
    tags: list[str] = Field(default_factory=list)
    freshness: Literal["Today", "Yesterday", "Recent"] = "Recent"
    image_url: str | None = None
    # Backwards compatibility fields:
    source: str | None = None
    source_url: str | None = None
    published_at: str | None = None
    retrieved_at: str | None = None
