import json
import pytest
from fastapi.testclient import TestClient
import httpx

from app.core.config import settings
from app.main import app
from app.services.trend_service import trend_service, _clean_json_str, _normalize_category


def test_clean_json_helper():
    raw_markdown = "```json\n[{\"title\": \"AI Breakthrough\"}]\n```"
    cleaned = _clean_json_str(raw_markdown)
    assert cleaned == '[{"title": "AI Breakthrough"}]'

    raw_with_text = "Here is the news:\n[{\"title\": \"Tech\"}]\nHope this helps!"
    cleaned2 = _clean_json_str(raw_with_text)
    assert cleaned2 == '[{"title": "Tech"}]'


def test_category_normalization():
    assert _normalize_category("LLM Technology") == "LLMs"
    assert _normalize_category("Deep Research Paper") == "Research"
    assert _normalize_category("Developer SDKs") == "Tools"
    assert _normalize_category("Humanoid Robot") == "Robotics"
    assert _normalize_category("Student Hackathon") == "Student Opportunities"
    assert _normalize_category("Unknown") == "AI"


@pytest.mark.anyio
async def test_trend_service_unconfigured(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    trend_service._memory_cache = []
    trend_service._last_fetched_at = None

    with pytest.raises(RuntimeError) as exc_info:
        await trend_service.refresh()
    assert "Gemini AI is not configured" in str(exc_info.value)


@pytest.mark.anyio
async def test_trend_service_search_grounding_and_caching(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-gemini-key")
    trend_service._memory_cache = []
    trend_service._last_fetched_at = None

    sample_gemini_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": json.dumps([
                                {
                                    "title": "Google DeepMind Unveils Next-Gen Multimodal Architecture",
                                    "summary": "Google DeepMind has introduced a state-of-the-art multimodal reasoning model capable of real-time multi-step planning.",
                                    "category": "Research",
                                    "importance": "High",
                                    "whyItMatters": "Enables developers to build autonomous multi-agent pipelines with lower latency.",
                                    "publishedAt": "2026-10-03T18:00:00Z",
                                    "sourceName": "Google DeepMind",
                                    "sourceUrl": "https://deepmind.google/blog/next-gen-multimodal",
                                    "sourceTitle": "Next-Gen Multimodal Architecture Announcement",
                                    "tags": ["AI", "DeepMind", "Multimodal"],
                                    "freshness": "Today"
                                },
                                {
                                    "title": "OpenAI Launches Advanced Developer Coding SDK",
                                    "summary": "New SDK toolkit provides enhanced streaming and context compaction for AI code agents.",
                                    "category": "Tools",
                                    "importance": "High",
                                    "whyItMatters": "Significantly accelerates automated developer workflows.",
                                    "publishedAt": "2026-10-03T12:00:00Z",
                                    "sourceName": "OpenAI",
                                    "sourceUrl": "https://openai.com/index/developer-coding-sdk",
                                    "sourceTitle": "Developer Coding SDK Release",
                                    "tags": ["AI", "OpenAI", "Developer"],
                                    "freshness": "Today"
                                }
                            ])
                        }
                    ],
                    "role": "model"
                },
                "groundingMetadata": {
                    "groundingChunks": [
                        {
                            "web": {
                                "uri": "https://deepmind.google/blog/next-gen-multimodal",
                                "title": "Google DeepMind Official Blog"
                            }
                        }
                    ],
                    "webSearchQueries": ["latest AI news breakthroughs 2026"]
                }
            }
        ]
    }

    async def mock_call_gemini_search(self, api_key):
        return sample_gemini_response

    monkeypatch.setattr(trend_service, "_call_gemini_search", mock_call_gemini_search.__get__(trend_service, trend_service.__class__))

    # Test fresh fetch
    count = await trend_service.refresh()
    assert count == 2

    trends = await trend_service.list_trends(refresh=False)
    assert len(trends) >= 2
    
    first = next(t for t in trends if "DeepMind" in t["title"])
    assert first["category"] == "Research"
    assert first["importance"] == "High"
    assert first["whyItMatters"] == "Enables developers to build autonomous multi-agent pipelines with lower latency."
    assert first["sourceName"] == "Google DeepMind"
    assert first["sourceUrl"] == "https://deepmind.google/blog/next-gen-multimodal"
    assert first["freshness"] == "Today"
    assert "Multimodal" in first["tags"]


def test_api_trends_endpoint(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-gemini-key")

    sample_items = [
        {
            "id": "trend-1",
            "title": "Major AI Model Release",
            "summary": "New breakthrough in frontier intelligence.",
            "category": "AI",
            "importance": "High",
            "whyItMatters": "Transforms productivity.",
            "publishedAt": "2026-10-03T10:00:00Z",
            "retrievedAt": "2026-10-03T20:00:00Z",
            "sourceName": "TechCrunch",
            "sourceUrl": "https://techcrunch.com/article/ai-release",
            "sourceTitle": "Major AI Model Release",
            "tags": ["AI", "Frontier"],
            "freshness": "Today",
            "source": "TechCrunch",
            "source_url": "https://techcrunch.com/article/ai-release",
            "published_at": "2026-10-03T10:00:00Z",
            "retrieved_at": "2026-10-03T20:00:00Z",
        }
    ]

    async def mock_list_trends(self, refresh=False):
        return sample_items

    monkeypatch.setattr(trend_service, "list_trends", mock_list_trends.__get__(trend_service, trend_service.__class__))

    with TestClient(app) as client:
        response = client.get("/api/trends")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        item = data[0]
        assert item["title"] == "Major AI Model Release"
        assert item["category"] == "AI"
        assert item["importance"] == "High"
        assert item["sourceName"] == "TechCrunch"
        assert item["sourceUrl"] == "https://techcrunch.com/article/ai-release"
