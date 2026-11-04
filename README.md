# Context-Aware AI Code Review Platform

A runnable demo of a multi-agent code review platform: **Python + FastAPI backend, Angular 19 frontend, SQLite persistence, project knowledge ingestion, GitHub PR integration, and optional OpenAI-powered contextual review.**

> This is a demo/reference implementation, not a production security scanner. Findings are advisory. Human review remains required.

## 1. What is included

- **Specialist agents:** Security, Architecture, Standards, and Code Quality agents run independently against added diff lines.
- **Optional AI context agent:** when `OPENAI_API_KEY` is configured, an LLM reviews the diff using retrieved project guidance and contributes additional findings.
- **Knowledge base:** upload architecture notes, coding conventions, ESLint/Sonar rules, design-system docs, approved component notes, and prior review feedback. Files can also be placed in `backend/knowledge/`.
- **GitHub PR integration:** fetch a PR diff using a GitHub token; optionally publish the review findings with an additional comment from the review results. A webhook endpoint supports `opened`, `synchronize`, and `reopened` events.
- **Dashboard:** metrics, review findings, recent review history, and knowledge source management.
- **SQLite:** reviews and ingested knowledge persist locally.

## 2. Architecture

```text
Angular Dashboard :4200
       |
       | REST / JSON
       v
FastAPI :8000 ---- GitHub REST API
       |
       +-- Review Orchestrator
       |     +-- Security Agent
       |     +-- Architecture Agent
       |     +-- Standards Agent
       |     +-- Code Quality Agent
       |     +-- Optional AI Context Agent (OpenAI)
       |
       +-- Knowledge Retriever --> SQLite knowledge table
       +-- Review Repository ----> SQLite reviews table
```

The current knowledge retriever is intentionally simple keyword matching so the demo runs without vector infrastructure. A production version should use chunking, embeddings, a vector database, document ownership/versioning, and project/repository scoping.

## 3. Requirements

- Python 3.11+
- Node.js 20+ (22 recommended) and npm
- Git (optional, for producing diffs)
- GitHub Personal Access Token (optional; repository Pull Requests read permission, Issues write permission only if posting comments)
- OpenAI API key (optional)

## 4. Run locally

### Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

uvicorn app.main:app --reload --port 8000
```

Open API docs at http://localhost:8000/docs and health at http://localhost:8000/api/health.

### Frontend (new terminal)

```bash
cd frontend
npm install
npm start
```

Open http://localhost:4200.

The dashboard includes a prefilled sample diff. Click **Analyze changes** to run the local agents.

## 5. Optional integrations

Edit `backend/.env`:

```dotenv
GITHUB_TOKEN=github_pat_xxx
GITHUB_WEBHOOK_SECRET=your-webhook-secret
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:4200
```

Restart the backend after changing `.env`.

### Analyze a GitHub PR

Enter `owner/repository` and PR number in the dashboard. The backend fetches the PR diff from GitHub. You can enable **Post summary comment** during analysis, or post the saved findings from the results panel with an optional additional comment. For either option, the token must have permission to write issue comments.

Equivalent API call:

```bash
curl -X POST "http://localhost:8000/api/github/pull-requests/OWNER/REPO/123/analyze?post_comment=false"
```

### GitHub webhook

Configure a repository webhook:
- Payload URL: `https://YOUR_PUBLIC_HOST/api/github/webhook`
- Content type: `application/json`
- Secret: same value as `GITHUB_WEBHOOK_SECRET`
- Events: Pull requests

The endpoint validates `X-Hub-Signature-256` when a secret is configured. Expose the backend securely over HTTPS (for local demos use a trusted tunnel). For production, add asynchronous queueing, retries, idempotency, and rate limiting.

## 6. Add project context

Option A: add files under `backend/knowledge/` before starting the API. Supported extensions: `.md`, `.txt`, `.json`, `.yaml`, `.yml`, `.ts`, `.js`, `.py`.

Option B: use the dashboard's **Knowledge base** tab to upload UTF-8 text-based documents.

Good starter documents:
- `architecture.md`: service boundaries, module ownership, dependency rules, event/data flows.
- `coding-standards.md`: naming, error handling, logging, test expectations.
- `design-system.md`: approved UI components, tokens, accessibility rules, forbidden patterns.
- `quality-gates.md`: ESLint, SonarQube, test coverage, complexity thresholds.
- `review-feedback.md`: examples of accepted/rejected findings and team conventions.

Knowledge content is retrieved by matching terms from the diff. The optional LLM receives the retrieved excerpts as untrusted project context and is instructed to return structured findings.

## 7. API quick reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend status and integration flags |
| POST | `/api/reviews/analyze` | Analyze a supplied unified diff |
| GET | `/api/reviews` | List saved reviews |
| GET | `/api/reviews/{id}` | Review details |
| POST | `/api/reviews/{id}/post-comment` | Post saved PR findings with optional `additional_comment` |
| GET | `/api/knowledge` | List knowledge sources |
| POST | `/api/knowledge/upload` | Upload a knowledge file |
| POST | `/api/github/pull-requests/{owner}/{repo}/{number}/analyze` | Fetch and analyze GitHub PR |
| POST | `/api/github/webhook` | GitHub PR webhook |

## 8. Demo walkthrough for your senior

1. Start backend and Angular app; show the dashboard metrics.
2. Run the prefilled diff. It deliberately contains a sample hard-coded key, `eval`, `console.log`, `any`, and an HTTP URL to demonstrate multiple agents.
3. Explain the finding cards: severity, source agent, file/line, evidence, recommendation, and confidence.
4. Open Knowledge base and upload a short architecture or design-system guideline. Re-run a diff that mentions the relevant module/component and explain how retrieved context is supplied to the optional AI agent.
5. If credentials are available, analyze a real GitHub PR and optionally post a summary comment.
6. Show review history and explain the success metrics you would track during a pilot.

**Important:** The sample API key in the seeded diff is fake and exists only to demonstrate the heuristic. Never commit real credentials.

## 9. How the success metrics should be measured

- **Useful recommendation rate:** reviewer marks each finding useful/not useful; useful / all rated findings. Add this feedback capture before using the 80% target as a measured KPI.
- **Manual review effort:** compare reviewer time per PR before/after pilot using a consistent sample and report median minutes saved.
- **Standards compliance:** count violations per 100 changed files or per 1,000 changed lines over time.
- **Review cycle time:** PR ready-for-review timestamp to approval/merge timestamp; compare matched repositories and PR sizes.

This demo currently reports findings and quality score, but it does not fabricate reviewer usefulness or time-saved metrics. Those need real feedback and workflow telemetry.

## 10. Production hardening backlog

Before production use:
- Authenticate users (SSO/OIDC), authorize repository/project access, and isolate tenant data.
- Store secrets in a vault; rotate GitHub/OpenAI tokens; never log diffs or credentials.
- Add webhook idempotency, background jobs (Celery/RQ), retries, timeouts, rate limits, and dead-letter handling.
- Add robust unified-diff parsing and line-anchored GitHub review comments (review API, not only issue comments).
- Integrate ESLint/SonarQube outputs directly instead of approximating their rules.
- Add test execution, rule configuration, severity tuning, suppressions, and finding feedback.
- Use embedding-based retrieval with document metadata filters and citations back to source documents.
- Add evaluation datasets, reviewer acceptance tracking, false-positive monitoring, and prompt/model versioning.
- Add unit/integration tests, CI, observability, audit logs, and dependency/security scanning.
- Treat all source code and retrieved documents as untrusted input; defend against prompt injection and data exfiltration.

## 11. Troubleshooting

- **Dashboard says API offline:** make sure FastAPI is running on port 8000; check `/api/health`.
- **CORS error:** set `CORS_ORIGINS` to the Angular origin and restart backend.
- **GitHub 401/403:** check token, repository access, and permissions.
- **No LLM findings:** configure `OPENAI_API_KEY`; without it, the deterministic agents still work.
- **Knowledge source not appearing:** upload a UTF-8 text file or restart after placing a supported file in `backend/knowledge/`.
