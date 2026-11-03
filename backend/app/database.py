import json
import psycopg
from psycopg.rows import dict_row

from .config import settings


def connect():
    """
    Create and return a PostgreSQL connection.

    dict_row allows us to access columns using:
    row["id"], row["repository"], etc.
    """
    return psycopg.connect(
        settings.database_url,
        row_factory=dict_row,
        connect_timeout=2
    )


def init_db():
    """
    Create the required database tables if they do not exist.
    """

    with connect() as db:

        db.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id BIGSERIAL PRIMARY KEY,
                repository TEXT,
                pull_request INTEGER,
                title TEXT,
                status TEXT,
                score INTEGER,
                findings TEXT,
                summary TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS knowledge (
                id BIGSERIAL PRIMARY KEY,
                filename TEXT,
                category TEXT,
                content TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        """)


def save_review(
    repository,
    pr,
    title,
    score,
    findings,
    summary
):
    """
    Save a completed code review and return its generated ID.
    """

    with connect() as db:

        row = db.execute("""
            INSERT INTO reviews (
                repository,
                pull_request,
                title,
                status,
                score,
                findings,
                summary
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            repository,
            pr,
            title,
            "completed",
            score,
            json.dumps(findings),
            summary
        )).fetchone()

        return row["id"]
