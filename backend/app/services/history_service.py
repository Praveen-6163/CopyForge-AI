import datetime
import json
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import text

from app.database.db import get_db


class HistoryService:
    """CRUD service for generation history and bookmarks."""

    @classmethod
    async def save_generation(
        cls,
        product_name: str,
        product_description: str,
        platform: str,
        tone: str,
        audience: str,
        objective: str,
        prompt_parameters: Dict[str, Any],
        compiled_prompt: str,
        generated_content: str,
        generation_id: Optional[str] = None,
    ) -> str:
        record_id = generation_id or str(uuid.uuid4())
        created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        params_json = json.dumps(prompt_parameters)

        async with get_db() as db:
            await db.execute(
                text(
                    """
                    INSERT INTO history (
                        id, product_name, product_description, platform, tone,
                        audience, objective, prompt_parameters_json, compiled_prompt,
                        generated_content, created_at
                    ) VALUES (
                        :id, :product_name, :product_description, :platform, :tone,
                        :audience, :objective, :prompt_parameters_json, :compiled_prompt,
                        :generated_content, :created_at
                    )
                    ON CONFLICT(id) DO UPDATE SET
                        product_name = excluded.product_name,
                        product_description = excluded.product_description,
                        platform = excluded.platform,
                        tone = excluded.tone,
                        audience = excluded.audience,
                        objective = excluded.objective,
                        prompt_parameters_json = excluded.prompt_parameters_json,
                        compiled_prompt = excluded.compiled_prompt,
                        generated_content = excluded.generated_content,
                        created_at = excluded.created_at
                    """
                ),
                {
                    "id": record_id,
                    "product_name": product_name,
                    "product_description": product_description,
                    "platform": platform,
                    "tone": tone,
                    "audience": audience,
                    "objective": objective,
                    "prompt_parameters_json": params_json,
                    "compiled_prompt": compiled_prompt,
                    "generated_content": generated_content,
                    "created_at": created_at,
                },
            )
        return record_id

    @classmethod
    async def get_history(
        cls,
        search: Optional[str] = None,
        platform: Optional[str] = None,
        tone: Optional[str] = None,
        only_saved: bool = False,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        query = "SELECT * FROM history WHERE 1=1"
        params: dict[str, Any] = {"limit": limit}

        if search and search.strip():
            query += " AND (product_name LIKE :search OR generated_content LIKE :search)"
            params["search"] = f"%{search.strip()}%"
        if platform and platform.strip() and platform != "All":
            query += " AND platform = :platform"
            params["platform"] = platform.strip()
        if tone and tone.strip() and tone != "All":
            query += " AND tone = :tone"
            params["tone"] = tone.strip()
        if only_saved:
            query += " AND is_saved = TRUE"

        query += " ORDER BY created_at DESC LIMIT :limit"
        async with get_db() as db:
            rows = (await db.execute(text(query), params)).mappings().all()
        return [cls._history_item(row) for row in rows]

    @classmethod
    def _history_item(cls, row: Any) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "product_name": row["product_name"],
            "product_description": row["product_description"],
            "platform": row["platform"],
            "tone": row["tone"],
            "audience": row["audience"],
            "objective": row["objective"],
            "prompt_parameters": json.loads(row["prompt_parameters_json"]),
            "compiled_prompt": row["compiled_prompt"],
            "generated_content": row["generated_content"],
            "is_saved": bool(row["is_saved"]),
            "created_at": row["created_at"],
        }

    @classmethod
    async def get_by_id(cls, record_id: str) -> Optional[Dict[str, Any]]:
        async with get_db() as db:
            row = (
                await db.execute(
                    text("SELECT * FROM history WHERE id = :id"),
                    {"id": record_id},
                )
            ).mappings().first()
        return cls._history_item(row) if row else None

    @classmethod
    async def delete_item(cls, record_id: str) -> bool:
        async with get_db() as db:
            await db.execute(
                text("DELETE FROM history WHERE id = :id"),
                {"id": record_id},
            )
        return True

    @classmethod
    async def toggle_save(cls, record_id: str) -> bool:
        async with get_db() as db:
            row = (
                await db.execute(
                    text("SELECT is_saved FROM history WHERE id = :id"),
                    {"id": record_id},
                )
            ).first()
            if not row:
                return False
            new_state = not bool(row[0])
            await db.execute(
                text("UPDATE history SET is_saved = :is_saved WHERE id = :id"),
                {"is_saved": new_state, "id": record_id},
            )
        return new_state


history_service = HistoryService()
