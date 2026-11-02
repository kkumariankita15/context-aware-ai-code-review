# import json, hashlib, hmac
# from pathlib import Path
# from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
# from fastapi.middleware.cors import CORSMiddleware
# from .config import settings
# from .database import init_db, connect, save_review
# from .schemas import AnalyzeRequest
# from .agents import run_review
# from .knowledge import ingest_text, ingest_directory
# from .github import fetch_pull_request_diff, post_pr_comment

# app = FastAPI(title=settings.app_name, version="1.0.0",
#               description="Multi-agent, context-aware pull request review demo.")
# app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins,
#                    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# @app.on_event("startup")
# def startup():
#     init_db()
#     ingest_directory()

# @app.get("/api/health")
# def health():
#     return {"status": "ok", "llm_enabled": bool(settings.openai_api_key), "github_enabled": bool(settings.github_token)}

# def serialize_review(row):
#     return {"id": row["id"], "repository": row["repository"], "pull_request": row["pull_request"],
#             "title": row["title"], "status": row["status"], "score": row["score"],
#             "findings": json.loads(row["findings"]), "summary": row["summary"], "created_at": row["created_at"]}

# @app.post("/api/reviews/analyze")
# def analyze(request: AnalyzeRequest):
#     findings, score, summary, context = run_review(request.diff)
#     review_id = save_review(request.repository, request.pull_request, request.title, score, findings, summary)
#     return {"id": review_id, "repository": request.repository, "pull_request": request.pull_request,
#             "title": request.title, "status": "completed", "score": score, "findings": findings,
#             "summary": summary, "context_used": context, "created_at": "just now"}

# @app.get("/api/reviews")
# def list_reviews(limit: int = 50):
#     with connect() as db:
#         rows = db.execute("SELECT * FROM reviews ORDER BY id DESC LIMIT ?", (min(limit, 200),)).fetchall()
#     return [serialize_review(r) for r in rows]

# @app.get("/api/reviews/{review_id}")
# def get_review(review_id: int):
#     with connect() as db:
#         row = db.execute("SELECT * FROM reviews WHERE id=?", (review_id,)).fetchone()
#     if not row: raise HTTPException(404, "Review not found")
#     return serialize_review(row)

# @app.post("/api/knowledge/upload")
# async def upload_knowledge(file: UploadFile = File(...), category: str = Form("engineering-guideline")):
#     content = await file.read()
#     if len(content) > 1_000_000: raise HTTPException(413, "File must be smaller than 1 MB")
#     try: text = content.decode("utf-8")
#     except UnicodeDecodeError: raise HTTPException(400, "Upload a UTF-8 text, Markdown, JSON, YAML, or source file")
#     item_id = ingest_text(file.filename or "uploaded.txt", category, text)
#     return {"id": item_id, "filename": file.filename, "category": category}

# @app.get("/api/knowledge")
# def list_knowledge():
#     with connect() as db:
#         rows = db.execute("SELECT id,filename,category,length(content) as bytes,created_at FROM knowledge ORDER BY id DESC").fetchall()
#     return [dict(r) for r in rows]

# @app.post("/api/github/pull-requests/{owner}/{repo}/{number}/analyze")
# async def analyze_github_pr(owner: str, repo: str, number: int, post_comment: bool = False):
#     try: diff = await fetch_pull_request_diff(owner, repo, number)
#     except ValueError as e: raise HTTPException(400, str(e))
#     except Exception as e: raise HTTPException(502, f"GitHub API error: {e}")
#     findings, score, summary, context = run_review(diff)
#     title = f"{owner}/{repo} PR #{number}"
#     review_id = save_review(f"{owner}/{repo}", number, title, score, findings, summary)
#     if post_comment:
#         lines = [f"## AI Code Review — score {score}/100", summary, ""]
#         for f in findings[:25]:
#             lines.append(f"- **{f['severity'].upper()} · {f['title']}** (`{f['file']}:{f['line'] or '?'}`) — {f['recommendation']}")
#         try: await post_pr_comment(owner, repo, number, "\n".join(lines))
#         except Exception as e: raise HTTPException(502, f"Review saved, but GitHub comment failed: {e}")
#     return {"id": review_id, "repository": f"{owner}/{repo}", "pull_request": number,
#             "title": title, "status": "completed", "score": score, "findings": findings,
#             "summary": summary, "context_used": context}

# @app.post("/api/github/webhook")
# async def github_webhook(request: Request):
#     body = await request.body()
#     secret = settings.github_webhook_secret
#     signature = request.headers.get("X-Hub-Signature-256", "")
#     if secret:
#         expected = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
#         if not hmac.compare_digest(signature, expected): raise HTTPException(401, "Invalid webhook signature")
#     payload = await request.json()
#     if payload.get("action") not in {"opened", "synchronize", "reopened"}: return {"ignored": True}
#     pr = payload.get("pull_request", {})
#     repo = payload.get("repository", {}).get("full_name", "")
#     number = pr.get("number")
#     if not repo or not number: return {"ignored": True}
#     owner, name = repo.split("/", 1)
#     diff = await fetch_pull_request_diff(owner, name, number)
#     findings, score, summary, _ = run_review(diff)
#     review_id = save_review(repo, number, pr.get("title", "GitHub PR"), score, findings, summary)
#     return {"review_id": review_id, "score": score, "findings_count": len(findings)}


import json
import hashlib
import hmac

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Form,
    Request
)

from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db, connect, save_review
from .schemas import AnalyzeRequest
from .agents import run_review
from .knowledge import ingest_text, ingest_directory
from .github import fetch_pull_request_diff, post_pr_comment


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Multi-agent, context-aware pull request review demo."
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.on_event("startup")
def startup():
    """
    Initialize PostgreSQL tables and ingest knowledge files.
    """
    init_db()
    ingest_directory()


@app.get("/api/health")
def health():

    return {
        "status": "ok",
        "llm_enabled": bool(settings.openai_api_key),
        "github_enabled": bool(settings.github_token)
    }


def serialize_review(row):

    return {
        "id": row["id"],
        "repository": row["repository"],
        "pull_request": row["pull_request"],
        "title": row["title"],
        "status": row["status"],
        "score": row["score"],
        "findings": json.loads(row["findings"]),
        "summary": row["summary"],
        "created_at": row["created_at"]
    }


@app.post("/api/reviews/analyze")
def analyze(request: AnalyzeRequest):

    findings, score, summary, context = run_review(
        request.diff
    )

    review_id = save_review(
        request.repository,
        request.pull_request,
        request.title,
        score,
        findings,
        summary
    )

    return {
        "id": review_id,
        "repository": request.repository,
        "pull_request": request.pull_request,
        "title": request.title,
        "status": "completed",
        "score": score,
        "findings": findings,
        "summary": summary,
        "context_used": context,
        "created_at": "just now"
    }


@app.get("/api/reviews")
def list_reviews(limit: int = 50):

    with connect() as db:

        rows = db.execute("""
            SELECT *
            FROM reviews
            ORDER BY id DESC
            LIMIT %s
        """, (min(limit, 200),)).fetchall()

    return [
        serialize_review(row)
        for row in rows
    ]


@app.get("/api/reviews/{review_id}")
def get_review(review_id: int):

    with connect() as db:

        row = db.execute("""
            SELECT *
            FROM reviews
            WHERE id = %s
        """, (review_id,)).fetchone()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    return serialize_review(row)


@app.post("/api/knowledge/upload")
async def upload_knowledge(
    file: UploadFile = File(...),
    category: str = Form("engineering-guideline")
):

    content = await file.read()

    if len(content) > 1_000_000:
        raise HTTPException(
            status_code=413,
            detail="File must be smaller than 1 MB"
        )

    try:
        text = content.decode("utf-8")

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Upload a UTF-8 text, Markdown, JSON, YAML, or source file"
        )

    item_id = ingest_text(
        file.filename or "uploaded.txt",
        category,
        text
    )

    return {
        "id": item_id,
        "filename": file.filename,
        "category": category
    }


@app.get("/api/knowledge")
def list_knowledge():

    with connect() as db:

        rows = db.execute("""
            SELECT
                id,
                filename,
                category,
                length(content) AS bytes,
                created_at
            FROM knowledge
            ORDER BY id DESC
        """).fetchall()

    return [
        dict(row)
        for row in rows
    ]


@app.post("/api/github/pull-requests/{owner}/{repo}/{number}/analyze")
async def analyze_github_pr(
    owner: str,
    repo: str,
    number: int,
    post_comment: bool = False
):

    try:

        diff = await fetch_pull_request_diff(
            owner,
            repo,
            number
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=f"GitHub API error: {error}"
        )

    findings, score, summary, context = run_review(diff)

    title = f"{owner}/{repo} PR #{number}"

    review_id = save_review(
        f"{owner}/{repo}",
        number,
        title,
        score,
        findings,
        summary
    )

    if post_comment:

        lines = [
            f"## AI Code Review — score {score}/100",
            summary,
            ""
        ]

        for finding in findings[:25]:

            lines.append(
                f"- **{finding['severity'].upper()} · "
                f"{finding['title']}** "
                f"(`{finding['file']}:{finding['line'] or '?'}`) "
                f"— {finding['recommendation']}"
            )

        try:

            await post_pr_comment(
                owner,
                repo,
                number,
                "\n".join(lines)
            )

        except Exception as error:

            raise HTTPException(
                status_code=502,
                detail=f"Review saved, but GitHub comment failed: {error}"
            )

    return {
        "id": review_id,
        "repository": f"{owner}/{repo}",
        "pull_request": number,
        "title": title,
        "status": "completed",
        "score": score,
        "findings": findings,
        "summary": summary,
        "context_used": context
    }


@app.post("/api/github/webhook")
async def github_webhook(request: Request):

    body = await request.body()

    secret = settings.github_webhook_secret

    signature = request.headers.get(
        "X-Hub-Signature-256",
        ""
    )

    if secret:

        expected = "sha256=" + hmac.new(
            secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):

            raise HTTPException(
                status_code=401,
                detail="Invalid webhook signature"
            )

    payload = await request.json()

    if payload.get("action") not in {
        "opened",
        "synchronize",
        "reopened"
    }:

        return {"ignored": True}

    pr = payload.get("pull_request", {})

    repo = payload.get(
        "repository",
        {}
    ).get("full_name", "")

    number = pr.get("number")

    if not repo or not number:
        return {"ignored": True}

    owner, name = repo.split("/", 1)

    diff = await fetch_pull_request_diff(
        owner,
        name,
        number
    )

    findings, score, summary, _ = run_review(diff)

    review_id = save_review(
        repo,
        number,
        pr.get("title", "GitHub PR"),
        score,
        findings,
        summary
    )

    return {
        "review_id": review_id,
        "score": score,
        "findings_count": len(findings)
    }

