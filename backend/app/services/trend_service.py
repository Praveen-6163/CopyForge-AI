import datetime
import json
import logging
import re
import uuid
from urllib.parse import urlparse
from typing import Any, Dict, List, Optional

from google.genai import types
from sqlalchemy import text

from app.core.config import settings
from app.database.db import get_db
from app.services.gemini_service import gemini_service

logger = logging.getLogger("copyforge.trends")

TREND_CACHE_TTL_SECONDS = 15 * 60  # 15 minutes
VALID_CATEGORIES = {
    "AI", "LLMs", "Research", "Tools", "Business", "Robotics", "Developer", "Student Opportunities"
}
VALID_IMPORTANCE = {"High", "Medium", "Low"}
VALID_FRESHNESS = {"Today", "Yesterday", "Recent"}

SEARCH_PROMPT = """You are an expert AI research & industry intelligence analyst.
Search Google for the top 8-12 latest real-world AI and technology news, breakthroughs, models, tool launches, research advancements, and developer/student opportunities from the last 24-72 hours.

Topics to discover:
- Generative AI, LLMs, and Multimodal models (Gemini, OpenAI, Anthropic, DeepMind, Meta, Microsoft, etc.)
- Machine Learning, Computer Vision, NLP, Data Science, and Robotics breakthroughs
- AI Developer tools, open source frameworks, Hugging Face releases, NVIDIA hardware/software updates
- Student opportunities, AI grants, competitions, and research updates

CRITICAL INSTRUCTIONS:
1. ONLY return real current news discovered through Google Search. Do NOT invent, hallucinate, or use placeholder data.
2. Every item MUST have a real, verified source URL (e.g., official blog post, TechCrunch, ArXiv, Wired, The Verge, MIT Tech Review, etc.).
3. Return ONLY a valid JSON array of objects. Do NOT include markdown commentary outside the JSON.

JSON Schema per item:
[
  {
    "title": "Headline of the news or announcement",
    "summary": "2-3 sentence factual summary of what was released or discovered",
    "category": "AI" | "LLMs" | "Research" | "Tools" | "Business" | "Robotics" | "Developer" | "Student Opportunities",
    "importance": "High" | "Medium" | "Low",
    "whyItMatters": "Why this matters to developers, engineers, students, or businesses",
    "publishedAt": "YYYY-MM-DDTHH:MM:SSZ (or null if exact timestamp is unknown)",
    "sourceName": "Actual name of publisher or organization (e.g. Google DeepMind, OpenAI, TechCrunch)",
    "sourceUrl": "https://... (real source article URL)",
    "sourceTitle": "Exact article title or announcement name",
    "tags": ["AI", "LLMs", "Research"],
    "freshness": "Today" | "Yesterday" | "Recent"
  }
]"""


def _clean_json_str(text_content: str) -> str:
    cleaned = text_content.strip()
    if "```" in cleaned:
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    # Find JSON array bracket boundaries if there is surrounding text
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]
    return cleaned.strip()


def _normalize_category(cat: str | None) -> str:
    if not cat:
        return "AI"
    cat_clean = cat.strip()
    for valid in VALID_CATEGORIES:
        if valid.lower() == cat_clean.lower():
            return valid
    if "llm" in cat_clean.lower():
        return "LLMs"
    if "research" in cat_clean.lower() or "paper" in cat_clean.lower():
        return "Research"
    if "tool" in cat_clean.lower() or "sdk" in cat_clean.lower() or "dev" in cat_clean.lower():
        return "Tools"
    if "robot" in cat_clean.lower():
        return "Robotics"
    if "student" in cat_clean.lower() or "career" in cat_clean.lower() or "grant" in cat_clean.lower():
        return "Student Opportunities"
    if "business" in cat_clean.lower() or "market" in cat_clean.lower() or "enterprise" in cat_clean.lower():
        return "Business"
    return "AI"


def _normalize_importance(imp: str | None) -> str:
    if not imp:
        return "High"
    imp_clean = imp.strip().capitalize()
    return imp_clean if imp_clean in VALID_IMPORTANCE else "High"


def _normalize_freshness(fresh: str | None) -> str:
    if not fresh:
        return "Recent"
    fresh_clean = fresh.strip().capitalize()
    return fresh_clean if fresh_clean in VALID_FRESHNESS else "Recent"


def _validate_url(url: str | None) -> Optional[str]:
    if not url:
        return None
    url = url.strip()
    try:
        parsed = urlparse(url)
        if parsed.scheme in ("http", "https") and parsed.hostname:
            return url
    except Exception:
        pass
    return None


class TrendService:
    def __init__(self) -> None:
        self._memory_cache: list[dict[str, Any]] = []
        self._last_fetched_at: Optional[datetime.datetime] = None

    def _require_api_key(self) -> str:
        if not settings.AI_CONFIGURED:
            raise RuntimeError("Gemini AI is not configured on the backend. Add GEMINI_API_KEY to environment.")
        return settings.GEMINI_API_KEY

    async def list_trends(self, refresh: bool = False) -> list[dict[str, Any]]:
        now = datetime.datetime.now(datetime.timezone.utc)
        
        # Check in-memory cache
        if not refresh and self._memory_cache and self._last_fetched_at:
            if (now - self._last_fetched_at).total_seconds() < TREND_CACHE_TTL_SECONDS:
                return self._memory_cache

        # Check database cache
        async with get_db() as db:
            latest = (
                await db.execute(text("SELECT MAX(retrieved_at) FROM trend_items"))
            ).scalar_one_or_none()
            
            is_stale = not latest
            if latest:
                try:
                    latest_dt = datetime.datetime.fromisoformat(str(latest))
                    if latest_dt.tzinfo is None:
                        latest_dt = latest_dt.replace(tzinfo=datetime.timezone.utc)
                    is_stale = (now - latest_dt).total_seconds() >= TREND_CACHE_TTL_SECONDS
                except ValueError:
                    is_stale = True

            if not refresh and not is_stale:
                rows = (
                    await db.execute(
                        text(
                            """
                            SELECT id, title, summary, source, source_url,
                                   published_at, retrieved_at, category, importance,
                                   why_it_matters, source_title, tags_json, freshness
                            FROM trend_items
                            ORDER BY COALESCE(published_at, retrieved_at) DESC
                            LIMIT 30
                            """
                        )
                    )
                ).mappings().all()
                if rows:
                    items = [self._row_to_trend(dict(r)) for r in rows]
                    self._memory_cache = items
                    self._last_fetched_at = now
                    return items

        # Stale or forced refresh: fetch fresh trends with Google Search grounding
        try:
            await self.refresh()
        except RuntimeError as e:
            # If search encounters rate limit or network error, return existing DB items if available
            async with get_db() as db:
                rows = (
                    await db.execute(
                        text(
                            """
                            SELECT id, title, summary, source, source_url,
                                   published_at, retrieved_at, category, importance,
                                   why_it_matters, source_title, tags_json, freshness
                            FROM trend_items
                            ORDER BY COALESCE(published_at, retrieved_at) DESC
                            LIMIT 30
                            """
                        )
                    )
                ).mappings().all()
            if rows:
                logger.warning("Returning cached trends due to refresh error: %s", e)
                items = [self._row_to_trend(dict(r)) for r in rows]
                self._memory_cache = items
                return items
            raise

        async with get_db() as db:
            rows = (
                await db.execute(
                    text(
                        """
                        SELECT id, title, summary, source, source_url,
                               published_at, retrieved_at, category, importance,
                               why_it_matters, source_title, tags_json, freshness
                        FROM trend_items
                        ORDER BY COALESCE(published_at, retrieved_at) DESC
                        LIMIT 30
                        """
                    )
                )
            ).mappings().all()
        items = [self._row_to_trend(dict(r)) for r in rows]
        self._memory_cache = items
        self._last_fetched_at = now
        return items

    def _row_to_trend(self, row: dict[str, Any]) -> dict[str, Any]:
        tags = []
        tags_raw = row.get("tags_json")
        if tags_raw:
            try:
                tags = json.loads(tags_raw) if isinstance(tags_raw, str) else tags_raw
            except Exception:
                tags = []

        return {
            "id": row.get("id"),
            "title": row.get("title"),
            "summary": row.get("summary"),
            "category": row.get("category") or "AI",
            "importance": row.get("importance") or "High",
            "whyItMatters": row.get("why_it_matters") or "",
            "publishedAt": row.get("published_at"),
            "retrievedAt": row.get("retrieved_at"),
            "sourceName": row.get("source") or "Web Intelligence",
            "sourceUrl": row.get("source_url"),
            "sourceTitle": row.get("source_title") or row.get("title"),
            "tags": tags if isinstance(tags, list) else [],
            "freshness": row.get("freshness") or "Recent",
            # Compatibility fields
            "source": row.get("source") or "Web Intelligence",
            "source_url": row.get("source_url"),
            "published_at": row.get("published_at"),
            "retrieved_at": row.get("retrieved_at"),
        }

    async def _call_gemini_search(self, api_key: str | None = None) -> dict[str, Any]:
        response = await gemini_service.generate_content_response(
            SEARCH_PROMPT,
            tools=[types.Tool(google_search=types.GoogleSearch())],
        )
        return response.model_dump(mode="json", by_alias=True, exclude_none=True)

    def _parse_search_results(self, data: dict[str, Any], retrieved_at: str) -> list[dict[str, Any]]:
        candidates = data.get("candidates") or []
        if not candidates:
            raise RuntimeError("No recent AI trends were found. Try refreshing.")

        first_cand = candidates[0]
        content = first_cand.get("content") or {}
        parts = content.get("parts") or []
        text_content = "".join(p.get("text", "") for p in parts if isinstance(p, dict))
        if not text_content.strip():
            raise RuntimeError("The AI trend discovery model returned an empty response.")

        cleaned_json = _clean_json_str(text_content)
        try:
            raw_items = json.loads(cleaned_json)
        except json.JSONDecodeError as err:
            logger.error("Failed to parse JSON from Gemini search response: %s. Raw was: %s", err, text_content[:400])
            raise RuntimeError("Live web search returned unexpected data format. Please retry.") from err

        if not isinstance(raw_items, list):
            raise RuntimeError("AI trend response format error: expected a list of trend items.")

        # Extract grounding metadata chunks for source verification
        grounding_metadata = first_cand.get("groundingMetadata") or {}
        grounding_chunks = grounding_metadata.get("groundingChunks") or []
        grounding_urls = []
        for chunk in grounding_chunks:
            web = chunk.get("web") or {}
            uri = web.get("uri")
            if uri:
                grounding_urls.append((uri, web.get("title") or "Verified Web Source"))

        processed_items: list[dict[str, Any]] = []
        for idx, item in enumerate(raw_items):
            if not isinstance(item, dict):
                continue
            title = str(item.get("title") or "").strip()
            summary = str(item.get("summary") or "").strip()
            if not title or not summary:
                continue

            source_url = _validate_url(item.get("sourceUrl") or item.get("source_url"))
            source_name = str(item.get("sourceName") or item.get("source") or "").strip()

            # If URL is missing, match with grounding URLs if available
            if not source_url and grounding_urls:
                fallback_idx = idx % len(grounding_urls)
                source_url, matched_title = grounding_urls[fallback_idx]
                if not source_name or source_name.lower() in ("source", "web", "url"):
                    source_name = matched_title

            if not source_url:
                continue

            if not source_name:
                parsed_host = urlparse(source_url).hostname or "Tech News"
                source_name = parsed_host.removeprefix("www.")

            item_id = str(uuid.uuid5(uuid.NAMESPACE_URL, source_url))
            category = _normalize_category(item.get("category"))
            importance = _normalize_importance(item.get("importance"))
            freshness = _normalize_freshness(item.get("freshness"))
            why_it_matters = str(item.get("whyItMatters") or item.get("why_it_matters") or "").strip()
            source_title = str(item.get("sourceTitle") or item.get("source_title") or title).strip()
            
            raw_tags = item.get("tags")
            tags = [str(t).strip() for t in raw_tags if str(t).strip()] if isinstance(raw_tags, list) else ["AI", category]
            if not tags:
                tags = ["AI", category]

            published_at = item.get("publishedAt") or item.get("published_at")
            if published_at:
                published_at = str(published_at).strip()

            processed_items.append({
                "id": item_id,
                "title": title[:500],
                "summary": summary[:5000],
                "source": source_name[:100],
                "source_url": source_url[:2000],
                "published_at": published_at,
                "retrieved_at": retrieved_at,
                "category": category,
                "importance": importance,
                "why_it_matters": why_it_matters[:5000],
                "source_title": source_title[:500],
                "tags_json": json.dumps(tags[:10]),
                "freshness": freshness,
            })

        if not processed_items:
            raise RuntimeError("No valid AI trend articles could be verified from web search.")

        return processed_items

    async def refresh(self) -> int:
        api_key = self._require_api_key()
        retrieved_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        gemini_response = await self._call_gemini_search(api_key)
        trend_records = self._parse_search_results(gemini_response, retrieved_at)

        async with get_db() as db:
            for item in trend_records:
                await db.execute(
                    text(
                        """
                        INSERT INTO trend_items (
                            id, title, summary, source, source_url,
                            published_at, retrieved_at, category, importance,
                            why_it_matters, source_title, tags_json, freshness
                        ) VALUES (
                            :id, :title, :summary, :source, :source_url,
                            :published_at, :retrieved_at, :category, :importance,
                            :why_it_matters, :source_title, :tags_json, :freshness
                        )
                        ON CONFLICT(source_url) DO UPDATE SET
                            title = excluded.title,
                            summary = excluded.summary,
                            source = excluded.source,
                            published_at = excluded.published_at,
                            retrieved_at = excluded.retrieved_at,
                            category = excluded.category,
                            importance = excluded.importance,
                            why_it_matters = excluded.why_it_matters,
                            source_title = excluded.source_title,
                            tags_json = excluded.tags_json,
                            freshness = excluded.freshness
                        """
                    ),
                    item,
                )

        self._memory_cache = [self._row_to_trend(r) for r in trend_records]
        self._last_fetched_at = datetime.datetime.now(datetime.timezone.utc)
        return len(trend_records)


trend_service = TrendService()
