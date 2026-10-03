import datetime
import html
import logging
import re
import uuid
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlparse

import httpx
from sqlalchemy import text

from app.database.db import get_db

logger = logging.getLogger("copyforge.trends")

FEEDS = {
    "OpenAI": "https://openai.com/news/rss.xml",
    "Google DeepMind": "https://deepmind.google/blog/rss.xml",
    "Anthropic": "https://www.anthropic.com/news/rss.xml",
    "Hugging Face": "https://huggingface.co/blog/feed.xml",
    "TechCrunch AI": "https://techcrunch.com/category/artificial-intelligence/feed/",
    "MIT Technology Review": "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
}
FEED_REFRESH_SECONDS = 15 * 60


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def _clean_text(value: str | None) -> str:
    if not value:
        return ""
    parser = _TextExtractor()
    parser.feed(value)
    return re.sub(r"\s+", " ", html.unescape(" ".join(parser.parts))).strip()


def _child_text(element: ET.Element, *names: str) -> str | None:
    for child in element.iter():
        if child.tag.rsplit("}", 1)[-1].lower() in names and child.text:
            return child.text.strip()
    return None


def _entry_link(entry: ET.Element) -> str | None:
    for child in entry:
        if child.tag.rsplit("}", 1)[-1].lower() == "link":
            link = child.attrib.get("href") or child.text
            if link:
                return link.strip()
    return None


def _feed_items(xml: bytes, source: str, retrieved_at: str) -> list[dict[str, str | None]]:
    root = ET.fromstring(xml)
    items: list[dict[str, str | None]] = []
    for entry in root.iter():
        if entry.tag.rsplit("}", 1)[-1].lower() not in {"item", "entry"}:
            continue
        title = _clean_text(_child_text(entry, "title"))
        link = _entry_link(entry)
        summary = _clean_text(
            _child_text(entry, "description", "summary", "content", "encoded")
        )
        parsed_url = urlparse(link or "")
        if (
            not title
            or not link
            or parsed_url.scheme != "https"
            or not parsed_url.hostname
        ):
            continue
        items.append({
            "id": str(uuid.uuid5(uuid.NAMESPACE_URL, link)),
            "title": title[:500],
            "summary": (summary or title)[:5000],
            "source": source,
            "source_url": link,
            "published_at": _child_text(
                entry, "pubdate", "published", "updated", "date"
            ),
            "retrieved_at": retrieved_at,
        })
    return items


class TrendService:
    async def list_trends(self, refresh: bool = False) -> list[dict[str, str | None]]:
        async with get_db() as db:
            latest = (
                await db.execute(text("SELECT MAX(retrieved_at) FROM trend_items"))
            ).scalar_one_or_none()
            is_stale = not latest
            if latest:
                try:
                    retrieved_at = datetime.datetime.fromisoformat(str(latest))
                    is_stale = (
                        datetime.datetime.now(datetime.timezone.utc) - retrieved_at
                    ).total_seconds() >= FEED_REFRESH_SECONDS
                except ValueError:
                    is_stale = True

        if refresh or is_stale:
            await self.refresh()

        async with get_db() as db:
            rows = (
                await db.execute(
                    text(
                        """
                        SELECT id, title, summary, source, source_url,
                               published_at, retrieved_at
                        FROM trend_items
                        ORDER BY COALESCE(published_at, retrieved_at) DESC
                        LIMIT 100
                        """
                    )
                )
            ).mappings().all()
        return [dict(row) for row in rows]

    async def refresh(self) -> int:
        retrieved_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        records: list[dict[str, str | None]] = []
        successes = 0
        async with httpx.AsyncClient(
            timeout=12.0,
            follow_redirects=True,
            headers={"User-Agent": "CopyForge/1.0 (+https://copyforge-aiauto.netlify.app)"},
        ) as client:
            for source, feed_url in FEEDS.items():
                try:
                    response = await client.get(feed_url)
                    response.raise_for_status()
                    records.extend(_feed_items(response.content, source, retrieved_at))
                    successes += 1
                except (httpx.HTTPError, ET.ParseError, ValueError):
                    logger.warning("Could not retrieve the %s trend feed.", source)

        if not successes:
            raise RuntimeError("Trend sources are temporarily unavailable.")
        if not records:
            raise RuntimeError("The configured trend sources returned no valid articles.")

        async with get_db() as db:
            for item in records:
                await db.execute(
                    text(
                        """
                        INSERT INTO trend_items (
                            id, title, summary, source, source_url,
                            published_at, retrieved_at
                        ) VALUES (
                            :id, :title, :summary, :source, :source_url,
                            :published_at, :retrieved_at
                        )
                        ON CONFLICT(source_url) DO UPDATE SET
                            title = excluded.title,
                            summary = excluded.summary,
                            source = excluded.source,
                            published_at = excluded.published_at,
                            retrieved_at = excluded.retrieved_at
                        """
                    ),
                    item,
                )
        return len(records)


trend_service = TrendService()
