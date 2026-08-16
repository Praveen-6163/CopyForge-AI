import json
import uuid
import datetime
from typing import List, Optional, Dict, Any
import aiosqlite
from app.core.config import settings

class HistoryService:
    """
    CRUD Service for SQLite History and Bookmarks.
    """

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
        generation_id: Optional[str] = None
    ) -> str:
        record_id = generation_id or str(uuid.uuid4())
        created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        params_json = json.dumps(prompt_parameters)

        async with aiosqlite.connect(settings.DB_PATH) as db:
            await db.execute(
                """
                INSERT OR REPLACE INTO history (
                    id, product_name, product_description, platform, tone,
                    audience, objective, prompt_parameters_json, compiled_prompt,
                    generated_content, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record_id, product_name, product_description, platform, tone,
                    audience, objective, params_json, compiled_prompt,
                    generated_content, created_at
                )
            )
            await db.commit()
        return record_id

    @classmethod
    async def get_history(
        cls,
        search: Optional[str] = None,
        platform: Optional[str] = None,
        tone: Optional[str] = None,
        only_saved: bool = False,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(settings.DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            
            query = "SELECT * FROM history WHERE 1=1"
            params = []

            if search and search.strip():
                query += " AND (product_name LIKE ? OR generated_content LIKE ?)"
                term = f"%{search.strip()}%"
                params.extend([term, term])

            if platform and platform.strip() and platform != "All":
                query += " AND platform = ?"
                params.append(platform.strip())

            if tone and tone.strip() and tone != "All":
                query += " AND tone = ?"
                params.append(tone.strip())

            if only_saved:
                query += " AND is_saved = 1"

            query += " ORDER BY created_at DESC LIMIT ?"
            params.append(limit)

            async with db.execute(query, params) as cursor:
                rows = await cursor.fetchall()
                results = []
                for r in rows:
                    results.append({
                        "id": r["id"],
                        "product_name": r["product_name"],
                        "product_description": r["product_description"],
                        "platform": r["platform"],
                        "tone": r["tone"],
                        "audience": r["audience"],
                        "objective": r["objective"],
                        "prompt_parameters": json.loads(r["prompt_parameters_json"]),
                        "compiled_prompt": r["compiled_prompt"],
                        "generated_content": r["generated_content"],
                        "is_saved": bool(r["is_saved"]),
                        "created_at": r["created_at"]
                    })
                return results

    @classmethod
    async def get_by_id(cls, record_id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(settings.DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM history WHERE id = ?", (record_id,)) as cursor:
                r = await cursor.fetchone()
                if not r:
                    return None
                return {
                    "id": r["id"],
                    "product_name": r["product_name"],
                    "product_description": r["product_description"],
                    "platform": r["platform"],
                    "tone": r["tone"],
                    "audience": r["audience"],
                    "objective": r["objective"],
                    "prompt_parameters": json.loads(r["prompt_parameters_json"]),
                    "compiled_prompt": r["compiled_prompt"],
                    "generated_content": r["generated_content"],
                    "is_saved": bool(r["is_saved"]),
                    "created_at": r["created_at"]
                }

    @classmethod
    async def delete_item(cls, record_id: str) -> bool:
        async with aiosqlite.connect(settings.DB_PATH) as db:
            await db.execute("DELETE FROM history WHERE id = ?", (record_id,))
            await db.commit()
            return True

    @classmethod
    async def toggle_save(cls, record_id: str) -> bool:
        async with aiosqlite.connect(settings.DB_PATH) as db:
            async with db.execute("SELECT is_saved FROM history WHERE id = ?", (record_id,)) as cursor:
                r = await cursor.fetchone()
                if not r:
                    return False
                current_state = r[0]
                new_state = 0 if current_state == 1 else 1
            
            await db.execute("UPDATE history SET is_saved = ? WHERE id = ?", (new_state, record_id))
            await db.commit()
            return bool(new_state)

history_service = HistoryService()
