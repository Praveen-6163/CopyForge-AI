import time

from fastapi import HTTPException, Request, status
from sqlalchemy import text

from app.api.linkedin import _hash, _request_session_id
from app.database.db import get_db


async def require_user(request: Request) -> str:
    session_id = _request_session_id(request)
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Connect LinkedIn to sign in to CopyForge.",
        )

    async with get_db() as db:
        row = (
            await db.execute(
                text(
                    """
                    SELECT user_id FROM user_sessions
                    WHERE session_hash = :session_hash AND expires_at > :now
                    """
                ),
                {"session_hash": _hash(session_id), "now": int(time.time())},
            )
        ).first()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your CopyForge session has expired. Reconnect LinkedIn to continue.",
        )
    return str(row[0])
