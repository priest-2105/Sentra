import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "sentra.db")

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS scans (
    id           TEXT PRIMARY KEY,
    timestamp    TEXT NOT NULL,
    repo_url     TEXT NOT NULL,
    deploy_url   TEXT,
    status       TEXT NOT NULL DEFAULT 'pending',
    total_score  INTEGER,
    scores_json  TEXT,
    flags_json   TEXT,
    explanation  TEXT,
    error_msg    TEXT
);
"""


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_TABLE_SQL)
        await db.commit()


async def get_scan(scan_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM scans WHERE id = ?", (scan_id,)) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


async def create_scan(scan_id: str, timestamp: str, repo_url: str, deploy_url: str | None):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO scans (id, timestamp, repo_url, deploy_url, status) VALUES (?, ?, ?, ?, 'pending')",
            (scan_id, timestamp, repo_url, deploy_url),
        )
        await db.commit()


async def update_scan(scan_id: str, **fields):
    if not fields:
        return
    set_clause = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [scan_id]
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(f"UPDATE scans SET {set_clause} WHERE id = ?", values)
        await db.commit()
