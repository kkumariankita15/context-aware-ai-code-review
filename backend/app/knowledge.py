from pathlib import Path
from .config import settings
from .database import connect

SUPPORTED = {
    ".md",
    ".txt",
    ".json",
    ".yaml",
    ".yml",
    ".ts",
    ".js",
    ".py"
}

def ingest_text(filename: str, category: str, content: str):
    """
    Store uploaded knowledge content in PostgreSQL.
    """

    with connect() as db:

        row = db.execute("""
            INSERT INTO knowledge (
                filename,
                category,
                content
            )
            VALUES (%s, %s, %s)
            RETURNING id
        """, (
            filename,
            category,
            content[:500_000]
        )).fetchone()

        return row["id"]


def search_context(query: str, limit: int = 8) -> list[dict]:
    """
    Search the knowledge table using simple keyword matching.
    """

    terms = {
        word.lower()
        for word in query.replace("/", " ").replace(".", " ").split()
        if len(word) > 3
    }

    if not terms:
        return []

    with connect() as db:

        rows = db.execute("""
            SELECT
                id,
                filename,
                category,
                content
            FROM knowledge
            ORDER BY id DESC
            LIMIT 200
        """).fetchall()

    scored = []

    for row in rows:

        content = row["content"]

        haystack = (
            row["filename"]
            + " "
            + row["category"]
            + " "
            + content
        ).lower()

        score = sum(
            1 for term in terms
            if term in haystack
        )

        if score:

            scored.append((
                score,
                {
                    "id": row["id"],
                    "filename": row["filename"],
                    "category": row["category"],
                    "excerpt": content[:1800]
                }
            ))

    scored.sort(
        key=lambda item: item[0],
        reverse=True
    )

    return [
        item[1]
        for item in scored[:limit]
    ]


def ingest_directory():
    """
    Read supported files from the knowledge directory
    and insert files that have not already been ingested.
    """

    directory = Path(settings.knowledge_dir)

    directory.mkdir(
        parents=True,
        exist_ok=True
    )

    for path in directory.rglob("*"):

        if (
            path.is_file()
            and path.suffix.lower() in SUPPORTED
        ):

            try:

                content = path.read_text(
                    encoding="utf-8"
                )

                filename = str(path)

                with connect() as db:

                    exists = db.execute("""
                        SELECT 1
                        FROM knowledge
                        WHERE filename = %s
                        LIMIT 1
                    """, (filename,)).fetchone()

                if not exists:

                    ingest_text(
                        filename,
                        "project-document",
                        content
                    )

            except (UnicodeDecodeError, OSError):
                continue

