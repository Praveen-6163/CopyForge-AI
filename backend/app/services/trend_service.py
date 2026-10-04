"""
Trend Radar service — fetches real AI/tech news via free public RSS feeds.

Gemini is NOT used here. This file has zero Gemini SDK imports.

Sources:
  - TechCrunch AI     (https://techcrunch.com/feed/)
  - The Verge         (https://www.theverge.com/rss/index.xml)
  - VentureBeat AI    (https://venturebeat.com/feed/)
  - MIT Tech Review   (https://www.technologyreview.com/feed/)
  - ArXiv CS.AI       (https://export.arxiv.org/rss/cs.AI)
  - Wired             (https://www.wired.com/feed/rss)
  - Analytics Vidhya  (https://www.analyticsvidhya.com/feed/)
"""

from __future__ import annotations

import asyncio
import datetime
import hashlib
import json
import logging
import re
import uuid
import xml.etree.ElementTree as ET
from typing import Any
from urllib.parse import urlparse

import httpx
from sqlalchemy import text

from app.database.db import get_db

logger = logging.getLogger("copyforge.trends")

# ─── Configuration ────────────────────────────────────────────────────────────

TREND_CACHE_TTL_SECONDS = 20 * 60   # 20 minutes
MAX_ARTICLES_PER_FEED   = 10
MAX_TOTAL_ARTICLES      = 30
ARTICLE_MAX_AGE_DAYS    = 7
FETCH_TIMEOUT_SECONDS   = 12

# ─── RSS Feed Definitions ─────────────────────────────────────────────────────

RSS_FEEDS = [
    {
        "url": "https://techcrunch.com/feed/",
        "source": "TechCrunch",
        "category": "AI",
    },
    {
        "url": "https://www.theverge.com/rss/index.xml",
        "source": "The Verge",
        "category": "Tools",
    },
    {
        "url": "https://venturebeat.com/category/ai/feed/",
        "source": "VentureBeat",
        "category": "Business",
    },
    {
        "url": "https://www.technologyreview.com/feed/",
        "source": "MIT Tech Review",
        "category": "Research",
    },
    {
        "url": "https://export.arxiv.org/rss/cs.AI",
        "source": "ArXiv CS.AI",
        "category": "Research",
    },
    {
        "url": "https://www.wired.com/feed/category/artificial-intelligence/latest/rss",
        "source": "Wired",
        "category": "AI",
    },
    {
        "url": "https://feeds.feedburner.com/analyticsvidhya",
        "source": "Analytics Vidhya",
        "category": "Tools",
    },
    {
        "url": "https://hnrss.org/newest.atom?q=AI+LLM+machine+learning&count=20",
        "source": "Hacker News",
        "category": "Developer",
    },
]

# ─── AI-Relevance Scoring Keywords ────────────────────────────────────────────

AI_KEYWORDS: list[tuple[list[str], int]] = [
    (["chatgpt", "gpt-4", "gpt-5", "openai"],    10),
    (["gemini", "google deepmind", "deepmind"],    10),
    (["llm", "large language model"],              9),
    (["claude", "anthropic"],                      9),
    (["llama", "meta ai"],                         8),
    (["generative ai", "genai"],                   8),
    (["artificial intelligence", " ai "],          7),
    (["machine learning", " ml "],                 7),
    (["neural network", "transformer"],            7),
    (["pytorch", "tensorflow", "hugging face"],    7),
    (["nvidia", "cuda", "gpu", "accelerator"],     6),
    (["computer vision", "nlp", "speech"],         6),
    (["robotics", "autonomous"],                   6),
    (["data science", "deep learning"],            6),
    (["open source", "open-source"],               5),
    (["benchmark", "research paper", "arxiv"],     5),
    (["technology", "tech", "software"],           3),
    (["developer", "programming", "api"],          3),
    (["startup", "funding", "raises"],             2),
]

VALID_CATEGORIES = {
    "AI", "LLMs", "Research", "Tools", "Business", "Robotics", "Developer", "Student Opportunities",
}
VALID_IMPORTANCE  = {"High", "Medium", "Low"}
VALID_FRESHNESS   = {"Today", "Yesterday", "Recent"}

# Royalty-free curated technology photos (Unsplash free license for commercial & editorial use)
ROYALTY_FREE_CATEGORY_IMAGES: dict[str, str] = {
    "AI": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    "LLMs": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    "Research": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
    "Tools": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    "Robotics": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    "Business": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    "Student Opportunities": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    "Developer": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
}
DEFAULT_ROYALTY_FREE_IMAGE = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80"

# ─── XML Namespaces ───────────────────────────────────────────────────────────

NS = {
    "dc":    "http://purl.org/dc/elements/1.1/",
    "media": "http://search.yahoo.com/mrss/",
    "atom":  "http://www.w3.org/2005/Atom",
    "content": "http://purl.org/rss/1.0/modules/content/",
}


# ─── Utility Helpers ──────────────────────────────────────────────────────────

def _clean_html(text: str) -> str:
    """Strip HTML tags and normalise whitespace."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    text = re.sub(r"&quot;", '"', text)
    text = re.sub(r"&#\d+;", "", text)
    return " ".join(text.split()).strip()


def _validate_url(url: str | None) -> str | None:
    if not url:
        return None
    url = url.strip()
    try:
        p = urlparse(url)
        if p.scheme in ("http", "https") and p.hostname:
            return url
    except Exception:
        pass
    return None


def _validate_image_url(url: str | None) -> str | None:
    """Validate image URL — must be http/https and have an image-like extension or path."""
    validated = _validate_url(url)
    if not validated:
        return None
    # Skip data URIs / SVG / tiny tracking pixels
    lower = validated.lower()
    if lower.startswith("data:") or ".svg" in lower:
        return None
    return validated


def _normalize_category(cat: str | None, feed_default: str = "AI") -> str:
    if not cat:
        return feed_default
    c = cat.strip()
    for v in VALID_CATEGORIES:
        if v.lower() == c.lower():
            return v
    if "llm" in c.lower():
        return "LLMs"
    if "research" in c.lower() or "paper" in c.lower() or "arxiv" in c.lower():
        return "Research"
    if "tool" in c.lower() or "sdk" in c.lower() or "dev" in c.lower():
        return "Tools"
    if "robot" in c.lower():
        return "Robotics"
    if "student" in c.lower() or "career" in c.lower() or "grant" in c.lower():
        return "Student Opportunities"
    if "business" in c.lower() or "market" in c.lower() or "enterprise" in c.lower():
        return "Business"
    return feed_default


def _ai_relevance_score(title: str, summary: str) -> int:
    """Return a score (0–100) based on how AI-relevant an article is."""
    haystack = f"{title} {summary}".lower()
    score = 0
    for keywords, weight in AI_KEYWORDS:
        if any(kw in haystack for kw in keywords):
            score += weight
    return min(score, 100)


def _importance_from_score(score: int) -> str:
    if score >= 14:
        return "High"
    if score >= 7:
        return "Medium"
    return "Low"


def _freshness(pub_dt: datetime.datetime | None) -> str:
    if not pub_dt:
        return "Recent"
    now = datetime.datetime.now(datetime.timezone.utc)
    delta = now - pub_dt
    if delta.days == 0:
        return "Today"
    if delta.days == 1:
        return "Yesterday"
    return "Recent"


def _why_it_matters(title: str, summary: str, category: str) -> str:
    """Generate a brief contextual relevance sentence locally — no AI needed."""
    haystack = f"{title} {summary}".lower()
    if any(k in haystack for k in ["llm", "large language", "gpt", "gemini", "claude", "llama"]):
        return "Advances in large language models are reshaping developer workflows, content creation, and enterprise automation."
    if "research" in haystack or "paper" in haystack or "arxiv" in haystack:
        return "New research findings often become the foundation for the next generation of AI products and frameworks."
    if "open source" in haystack or "hugging face" in haystack:
        return "Open-source AI tools lower the barrier for developers and organisations to build with state-of-the-art models."
    if "nvidia" in haystack or "gpu" in haystack or "chip" in haystack:
        return "Hardware improvements directly unlock faster, cheaper AI training and inference at scale."
    if "robotics" in haystack or "autonomous" in haystack:
        return "Advances in robotics and autonomy are creating new industries and disrupting physical labour markets."
    if category in ("Business", "LLMs"):
        return "This development signals important shifts in the AI industry landscape and competitive dynamics."
    return "Staying current with AI and technology news is essential for developers, marketers, and business leaders."


def _dedup_articles(articles: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Remove duplicates using URL normalisation and title similarity."""
    seen_urls:  set[str] = set()
    seen_hashes: set[str] = set()
    unique: list[dict[str, Any]] = []
    for art in articles:
        url = (art.get("source_url") or "").strip().lower().rstrip("/")
        url = re.sub(r"[?#].*$", "", url)   # strip query/fragment
        title_hash = hashlib.md5(
            re.sub(r"\W+", "", (art.get("title") or "").lower()).encode()
        ).hexdigest()[:12]
        if url and url in seen_urls:
            continue
        if title_hash in seen_hashes:
            continue
        if url:
            seen_urls.add(url)
        seen_hashes.add(title_hash)
        unique.append(art)
    return unique


def _is_fresh(pub_dt: datetime.datetime | None, max_age_days: int = ARTICLE_MAX_AGE_DAYS) -> bool:
    if not pub_dt:
        return True
    now = datetime.datetime.now(datetime.timezone.utc)
    return (now - pub_dt).days <= max_age_days


def _parse_date(raw: str | None) -> datetime.datetime | None:
    if not raw:
        return None
    raw = raw.strip()
    for fmt in (
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S GMT",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.datetime.strptime(raw, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=datetime.timezone.utc)
            return dt
        except ValueError:
            continue
    return None


# ─── RSS Parser ───────────────────────────────────────────────────────────────

def _extract_image_from_item(item: ET.Element, ns: dict[str, str]) -> str | None:
    """Try multiple RSS extension fields to extract an article image."""
    # <media:content url="...">
    for mc in item.findall("media:content", ns):
        url = mc.get("url")
        if _validate_image_url(url):
            return url

    # <media:thumbnail url="...">
    for mt in item.findall("media:thumbnail", ns):
        url = mt.get("url")
        if _validate_image_url(url):
            return url

    # <enclosure url="..." type="image/...">
    for enc in item.findall("enclosure"):
        if (enc.get("type") or "").startswith("image/"):
            url = enc.get("url")
            if _validate_image_url(url):
                return url

    # Scrape first <img src="..."> from content:encoded or description
    for tag in ("content:encoded", "description"):
        el = item.find(tag, ns) or item.find(tag)
        text_val = (el.text or "") if el is not None else ""
        if text_val:
            m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', text_val, re.IGNORECASE)
            if m:
                url = m.group(1)
                if _validate_image_url(url):
                    return url
    return None


def _parse_rss_feed(xml_bytes: bytes, feed_meta: dict[str, str]) -> list[dict[str, Any]]:
    """Parse both RSS 2.0 and Atom feeds; return list of normalised article dicts."""
    articles: list[dict[str, Any]] = []
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError as exc:
        logger.warning("RSS XML parse error for %s: %s", feed_meta["source"], exc)
        return articles

    # Detect feed type
    tag = root.tag.lower()
    is_atom = "atom" in tag or "feed" in tag

    if is_atom:
        items = root.findall("{http://www.w3.org/2005/Atom}entry")
        if not items:
            items = root.findall("entry")
    else:
        channel = root.find("channel")
        items = channel.findall("item") if channel is not None else root.findall("item")

    for item in items[:MAX_ARTICLES_PER_FEED]:
        try:
            if is_atom:
                title_el = item.find("{http://www.w3.org/2005/Atom}title") or item.find("title")
                link_el  = item.find("{http://www.w3.org/2005/Atom}link")
                if link_el is None:
                    link_el = item.find("link")
                link = link_el.get("href") if link_el is not None else None
                if not link and link_el is not None:
                    link = link_el.text
                summary_el = (
                    item.find("{http://www.w3.org/2005/Atom}summary") or
                    item.find("{http://www.w3.org/2005/Atom}content") or
                    item.find("summary") or
                    item.find("content")
                )
                pub_el = (
                    item.find("{http://www.w3.org/2005/Atom}published") or
                    item.find("{http://www.w3.org/2005/Atom}updated") or
                    item.find("published") or
                    item.find("updated")
                )
                image_url = _extract_image_from_item(item, NS)
            else:
                title_el   = item.find("title")
                link_el    = item.find("link")
                link       = link_el.text if link_el is not None else None
                summary_el = item.find("description")
                pub_el     = item.find("pubDate") or item.find("dc:date", NS)
                image_url  = _extract_image_from_item(item, NS)

            title   = _clean_html(title_el.text if title_el is not None else "").strip()
            summary = _clean_html(summary_el.text if summary_el is not None else "").strip()
            pub_raw = pub_el.text if pub_el is not None else None
            url     = _validate_url(link.strip() if link else None)

            if not title or not url:
                continue

            # Limit summary length
            if len(summary) > 600:
                summary = summary[:597] + "…"
            if not summary:
                summary = title

            pub_dt   = _parse_date(pub_raw)
            if not _is_fresh(pub_dt):
                continue

            score    = _ai_relevance_score(title, summary)
            category = _normalize_category(feed_meta.get("category", "AI"), feed_meta.get("category", "AI"))

            articles.append({
                "id":           str(uuid.uuid5(uuid.NAMESPACE_URL, url)),
                "title":        title[:500],
                "summary":      summary,
                "source":       feed_meta["source"],
                "source_url":   url,
                "source_title": title[:500],
                "published_at": pub_dt.isoformat() if pub_dt else None,
                "category":     category,
                "importance":   _importance_from_score(score),
                "why_it_matters": _why_it_matters(title, summary, category),
                "tags_json":    json.dumps([feed_meta["source"], category, "AI"][:10]),
                "freshness":    _freshness(pub_dt),
                "relevance_score": score,
                "image_url":    _validate_image_url(image_url) or ROYALTY_FREE_CATEGORY_IMAGES.get(category, DEFAULT_ROYALTY_FREE_IMAGE),
            })
        except Exception as exc:
            logger.debug("Skipping malformed RSS item: %s", exc)
            continue

    return articles


# ─── HTTP Fetcher ─────────────────────────────────────────────────────────────

async def _fetch_feed(client: httpx.AsyncClient, feed: dict[str, str]) -> list[dict[str, Any]]:
    try:
        response = await client.get(
            feed["url"],
            timeout=FETCH_TIMEOUT_SECONDS,
            follow_redirects=True,
            headers={
                "User-Agent": "CopyForgeAI/1.0 RSS Reader (+https://copyforge.ai)",
                "Accept": "application/rss+xml, application/xml, text/xml, */*",
            },
        )
        response.raise_for_status()
        articles = _parse_rss_feed(response.content, feed)
        logger.info(
            "RSS [%s] fetched %d fresh articles from %s",
            feed["source"], len(articles), feed["url"],
        )
        return articles
    except httpx.TimeoutException:
        logger.warning("RSS [%s] timed out.", feed["source"])
    except httpx.HTTPStatusError as exc:
        logger.warning("RSS [%s] HTTP %s.", feed["source"], exc.response.status_code)
    except Exception as exc:
        logger.warning("RSS [%s] fetch failed: %s", feed["source"], exc)
    return []


async def _fetch_all_feeds() -> list[dict[str, Any]]:
    """Fetch all RSS feeds concurrently and return merged, ranked article list."""
    async with httpx.AsyncClient() as client:
        tasks = [_fetch_feed(client, feed) for feed in RSS_FEEDS]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    all_articles: list[dict[str, Any]] = []
    for result in results:
        if isinstance(result, list):
            all_articles.extend(result)
        elif isinstance(result, Exception):
            logger.warning("Feed task raised: %s", result)

    # Deduplicate by URL/title
    unique = _dedup_articles(all_articles)

    # Sort: high relevance first, then newest
    unique.sort(key=lambda a: (-a["relevance_score"], a.get("published_at") or ""), reverse=False)
    unique.sort(key=lambda a: a.get("published_at") or "", reverse=True)

    # Keep AI-relevant articles (score >= 2) and limit total
    filtered = [a for a in unique if a["relevance_score"] >= 2]
    if not filtered:
        filtered = unique   # fallback: keep everything if nothing scores

    return filtered[:MAX_TOTAL_ARTICLES]


# ─── Service Class ────────────────────────────────────────────────────────────

class TrendService:
    def __init__(self) -> None:
        self._memory_cache: list[dict[str, Any]] = []
        self._last_fetched_at: datetime.datetime | None = None

    async def list_trends(self, refresh: bool = False) -> list[dict[str, Any]]:
        now = datetime.datetime.now(datetime.timezone.utc)

        # ── In-memory cache hit ──────────────────────────────────────────────
        if not refresh and self._memory_cache and self._last_fetched_at:
            if (now - self._last_fetched_at).total_seconds() < TREND_CACHE_TTL_SECONDS:
                return self._memory_cache

        # ── Database cache hit ───────────────────────────────────────────────
        try:
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
                            text("""
                                SELECT id, title, summary, source, source_url,
                                       published_at, retrieved_at, category, importance,
                                       why_it_matters, source_title, tags_json, freshness, image_url
                                FROM trend_items
                                ORDER BY COALESCE(published_at, retrieved_at) DESC
                                LIMIT 30
                            """)
                        )
                    ).mappings().all()
                    if rows:
                        items = [self._row_to_trend(dict(r)) for r in rows]
                        self._memory_cache = items
                        self._last_fetched_at = now
                        return items
        except Exception as exc:
            logger.warning("DB cache read failed, refreshing from RSS: %s", exc)

        # ── Fetch fresh articles from RSS ────────────────────────────────────
        try:
            count = await self.refresh()
            if count == 0:
                logger.warning("RSS returned 0 articles; serving stale DB cache if available.")
        except Exception as exc:
            logger.warning("RSS refresh error: %s", exc)

        try:
            async with get_db() as db:
                rows = (
                    await db.execute(
                        text("""
                            SELECT id, title, summary, source, source_url,
                                   published_at, retrieved_at, category, importance,
                                   why_it_matters, source_title, tags_json, freshness, image_url
                            FROM trend_items
                            ORDER BY COALESCE(published_at, retrieved_at) DESC
                            LIMIT 30
                        """)
                    )
                ).mappings().all()
            items = [self._row_to_trend(dict(r)) for r in rows]
        except Exception as exc:
            logger.error("DB read failed after RSS refresh: %s", exc)
            items = self._memory_cache   # serve stale in-memory cache

        self._memory_cache = items
        self._last_fetched_at = now
        return items

    async def refresh(self) -> int:
        """Fetch all RSS feeds, score, dedup, and persist to DB. Returns saved count."""
        retrieved_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        articles = await _fetch_all_feeds()

        if not articles:
            logger.warning("All RSS feeds returned 0 articles.")
            return 0

        saved = 0
        async with get_db() as db:
            for art in articles:
                try:
                    await db.execute(
                        text("""
                            INSERT INTO trend_items (
                                id, title, summary, source, source_url,
                                published_at, retrieved_at, category, importance,
                                why_it_matters, source_title, tags_json, freshness, image_url
                            ) VALUES (
                                :id, :title, :summary, :source, :source_url,
                                :published_at, :retrieved_at, :category, :importance,
                                :why_it_matters, :source_title, :tags_json, :freshness, :image_url
                            )
                            ON CONFLICT(source_url) DO UPDATE SET
                                title         = excluded.title,
                                summary       = excluded.summary,
                                published_at  = excluded.published_at,
                                retrieved_at  = excluded.retrieved_at,
                                category      = excluded.category,
                                importance    = excluded.importance,
                                why_it_matters= excluded.why_it_matters,
                                source_title  = excluded.source_title,
                                tags_json     = excluded.tags_json,
                                freshness     = excluded.freshness,
                                image_url     = excluded.image_url
                        """),
                        {
                            "id":            art["id"],
                            "title":         art["title"],
                            "summary":       art["summary"],
                            "source":        art["source"],
                            "source_url":    art["source_url"],
                            "published_at":  art.get("published_at"),
                            "retrieved_at":  retrieved_at,
                            "category":      art["category"],
                            "importance":    art["importance"],
                            "why_it_matters":art.get("why_it_matters", ""),
                            "source_title":  art.get("source_title", art["title"]),
                            "tags_json":     art.get("tags_json", "[]"),
                            "freshness":     art.get("freshness", "Recent"),
                            "image_url":     art.get("image_url"),
                        },
                    )
                    saved += 1
                except Exception as exc:
                    logger.warning("Failed to upsert article %s: %s", art.get("source_url"), exc)

        self._memory_cache = [self._row_to_trend(a) for a in articles]
        self._last_fetched_at = datetime.datetime.now(datetime.timezone.utc)
        logger.info("RSS refresh complete: %d articles saved.", saved)
        return saved

    def _row_to_trend(self, row: dict[str, Any]) -> dict[str, Any]:
        tags: list[str] = []
        tags_raw = row.get("tags_json")
        if tags_raw:
            try:
                tags = json.loads(tags_raw) if isinstance(tags_raw, str) else tags_raw
            except Exception:
                tags = []

        return {
            "id":          row.get("id"),
            "title":       row.get("title"),
            "summary":     row.get("summary"),
            "category":    row.get("category") or "AI",
            "importance":  row.get("importance") or "High",
            "whyItMatters":row.get("why_it_matters") or "",
            "publishedAt": row.get("published_at"),
            "retrievedAt": row.get("retrieved_at"),
            "sourceName":  row.get("source") or "Tech News",
            "sourceUrl":   row.get("source_url"),
            "sourceTitle": row.get("source_title") or row.get("title"),
            "tags":        tags if isinstance(tags, list) else [],
            "freshness":   row.get("freshness") or "Recent",
            "image_url":   row.get("image_url") or ROYALTY_FREE_CATEGORY_IMAGES.get(row.get("category") or "AI", DEFAULT_ROYALTY_FREE_IMAGE),
            # backward-compat fields
            "source":      row.get("source") or "Tech News",
            "source_url":  row.get("source_url"),
            "published_at":row.get("published_at"),
            "retrieved_at":row.get("retrieved_at"),
        }


# ─── Module-level singleton ───────────────────────────────────────────────────

trend_service = TrendService()


# ─── Utility exports used by tests ───────────────────────────────────────────

def _clean_json_str(text_content: str) -> str:
    """Kept for test compatibility (previously used for Gemini JSON parsing)."""
    import re as _re
    cleaned = text_content.strip()
    if "```" in cleaned:
        cleaned = _re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = _re.sub(r"\s*```$", "", cleaned)
    start = cleaned.find("[")
    end   = cleaned.rfind("]")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]
    return cleaned.strip()


# _normalize_category is defined above as a module-level function; tests can import it directly.
