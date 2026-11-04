# Project knowledge base

This guide explains what the Context-Aware AI Code Review application does and
how its backend and frontend implement that behavior. It describes the current
code, including its demo-scale limitations; it is not a production deployment
or security guarantee.

## What the application does

The application accepts either a unified diff or a GitHub pull request, reviews
the added code, and presents findings in an Angular dashboard. Reviews and
knowledge documents are stored in PostgreSQL. Four deterministic specialist
agents run for every review; an additional OpenAI-powered agent runs only when
`OPENAI_API_KEY` is configured.

The agents are heuristic reviewers, not compilers or comprehensive security
scanners. Their output is advisory and should be checked by a human.

## Main capabilities

- **Overview:** displays metrics calculated from saved reviews and provides
  access to recent review results.
- **New review:** analyzes a pasted or prefilled diff, or fetches a GitHub PR
  diff. GitHub analysis can optionally post a summary comment.
- **Review history:** lists saved reviews and expands a selected review's
  findings.
- **Knowledge base:** uploads text-based project guidance and lists stored
  knowledge sources.
- **Appearance:** applies a preset or custom accent color and stores the
  selection in browser local storage.
- **GitHub webhook:** accepts supported pull-request events, fetches the PR
  diff, and saves a review.

## How a review is performed

1. The frontend submits a diff to `POST /api/reviews/analyze`, or asks the
   backend to fetch one with
   `POST /api/github/pull-requests/{owner}/{repo}/{number}/analyze`.
2. [`common.py`](../backend/app/agents/common.py) parses unified diff hunks and extracts added
   lines with their file paths and new-file line numbers. Removed lines are
   excluded from agent analysis.
3. [`review.py`](../backend/app/agents/review.py) searches the knowledge table for context and
   runs the Security, Architecture, Standards, and Code Quality agents. It then
   asks the optional context agent for additional observations if an OpenAI
   key is configured.
4. Findings are deduplicated by rule, file, line, and title, then sorted by
   severity. The score starts at 100 and subtracts 25 for each critical, 12 for
   each high, 6 for each medium, and 2 for each low finding; the result is
   clamped to zero. Informational findings do not reduce the score.
5. The backend saves the review in PostgreSQL and returns its summary and
   findings. The GitHub PR analysis response also includes the fetched diff;
   the review record itself does not store the diff.

### Specialist-agent checks

| Agent | Current checks |
|---|---|
| Security | Heuristics for hard-coded credential-like values, `eval`, `dangerouslySetInnerHTML`, and `http://` URLs |
| Architecture | Controller imports from modules named `models` and new `TODO`/`FIXME` markers |
| Standards | `console.log`, TypeScript `any`, and `var` declarations |
| Code Quality | Added lines longer than 140 characters and some swallowed-exception patterns |
| AI Context (optional) | Requests up to 20 additional structured findings based on the diff and retrieved project guidance |

These are pattern matches over added lines, so findings can be missed or be
false positives. The deterministic agents receive retrieved context through
their shared interface, but the current rules do not inspect that context; it
is principally supplied to the optional AI agent.

## Backend implementation

The backend is a Python 3.12-compatible FastAPI application in
[`backend/app/`](../backend/app/).

| File or package | Responsibility |
|---|---|
| [`main.py`](../backend/app/main.py) | Creates the FastAPI app, configures CORS, initializes storage and knowledge ingestion at startup, and implements health, review, knowledge, GitHub, and webhook endpoints |
| [`config.py`](../backend/app/config.py) | Reads environment configuration, including database, knowledge directory, GitHub, OpenAI, and CORS settings |
| [`schemas.py`](../backend/app/schemas.py) | Defines request/response data models and input constraints |
| [`database.py`](../backend/app/database.py) | Opens PostgreSQL connections and creates `reviews` and `knowledge` tables; saves completed reviews |
| [`knowledge.py`](../backend/app/knowledge.py) | Ingests text and searches stored project guidance with keyword matching |
| [`github.py`](../backend/app/github.py) | Fetches PR diffs and posts issue comments through the GitHub REST API |
| [`agents/`](../backend/app/agents/) | Parses diffs, runs specialist rules, optionally calls OpenAI, merges findings, and calculates the review score |

### HTTP API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Reports API status and whether GitHub/OpenAI credentials are configured |
| `POST` | `/api/reviews/analyze` | Analyze a supplied diff and save the review |
| `GET` | `/api/reviews` | List saved reviews (default limit 50, capped at 200) |
| `GET` | `/api/reviews/{review_id}` | Retrieve a saved review |
| `POST` | `/api/reviews/{review_id}/post-comment` | Post saved findings on the associated GitHub PR |
| `GET` | `/api/knowledge` | List stored knowledge metadata |
| `POST` | `/api/knowledge/upload` | Store an uploaded UTF-8 text document |
| `POST` | `/api/github/pull-requests/{owner}/{repo}/{number}/analyze` | Fetch and analyze a GitHub PR; optionally post a comment |
| `POST` | `/api/github/webhook` | Process supported PR webhook events (`opened`, `synchronize`, `reopened`) |

FastAPI's interactive API documentation is available at `/docs` when the
backend is running.

### Data and knowledge storage

PostgreSQL contains two tables initialized by
[`database.init_db()`](../backend/app/database.py):

- `reviews` stores repository, PR number, title, status, score, serialized
  findings, summary, and creation time.
- `knowledge` stores filename, category, full text content, and creation time.

Documents can be placed under [`backend/knowledge/`](../backend/knowledge/) or uploaded from the
frontend. Directory ingestion runs at backend startup and inserts supported
files it has not previously seen under the same stored filename. Supported
extensions are `.md`, `.txt`, `.json`, `.yaml`, `.yml`, `.ts`, `.js`, and
`.py`. Uploads are limited to 1 MB and must decode as UTF-8; stored content is
truncated to 500,000 characters.

Retrieval is deliberately simple: the backend extracts distinct query words
longer than three characters, reads at most the 200 newest knowledge rows, and
scores a document by how many terms appear in its filename, category, or
content. It returns up to eight excerpts (each at most 1,800 characters).
There is no document deletion, update, chunking, vector search, or project-level
access control in the current API.

### Optional integrations

- **GitHub:** `GITHUB_TOKEN` is required to fetch PR diffs and post comments.
  The webhook checks `X-Hub-Signature-256` when `GITHUB_WEBHOOK_SECRET` is set.
  A webhook run saves the review but does not post a comment.
- **OpenAI:** `OPENAI_API_KEY` enables the optional context agent;
  `OPENAI_MODEL` selects the model. If the key is absent, the deterministic
  agents still run.
- **CORS:** `CORS_ORIGINS` is a comma-separated origin list. The frontend's
  current API base URL is hard-coded as `http://localhost:8000/api` in
  [`review.service.ts`](../frontend/src/app/review.service.ts).

Configuration names and local defaults are described in
[`backend/.env.example`](../backend/.env.example). Do not put real credentials in documentation or commit
them to source control.

## Frontend implementation

The frontend is a standalone-component Angular 19 application bootstrapped from
[`main.ts`](../frontend/src/main.ts). [`app.routes.ts`](../frontend/src/app/app.routes.ts)
lazy-loads each page component:

| Browser route | Page | Purpose |
|---|---|---|
| `/` | Overview | Review metrics and recent results |
| `/review` | New review | Diff/GitHub PR input and result display |
| `/history` | Review history | Saved reviews and findings |
| `/knowledge` | Knowledge base | Upload and list project documents |
| `/appearance` | Appearance | Theme presets and custom accent |

The main UI is composed from reusable standalone components for navigation,
review input, findings/results, and dashboard metrics. `ReviewService` is the
HTTP boundary for review, knowledge, and GitHub endpoints. It also exposes a
small in-memory review-count stream. The HTTP interceptor tracks active requests
and updates the API online/offline indicator. `ThemeService` changes CSS custom
properties and persists the selection under the `reviewpilot-theme` local
storage key.

## Run and explore

Use the setup instructions in the repository [README](../README.md). For local
development the backend runs at `http://localhost:8000` and the Angular app at
`http://localhost:4200`. Docker Compose starts PostgreSQL, the backend, and the
frontend together.

To follow a typical implementation path, start with:

1. [`app.routes.ts`](../frontend/src/app/app.routes.ts) for page navigation.
2. [`review.service.ts`](../frontend/src/app/review.service.ts) for frontend API calls and data shapes.
3. [`main.py`](../backend/app/main.py) for HTTP routes and request handling.
4. [`review.py`](../backend/app/agents/review.py) for review orchestration and scoring.
5. [`common.py`](../backend/app/agents/common.py) and the individual agent modules for diff
   parsing and review rules.
6. [`database.py`](../backend/app/database.py) and [`knowledge.py`](../backend/app/knowledge.py) for persistence and
   retrieval.

See the separate [architecture diagram](ARCHITECTURE.md) for the components
and their data flows.

## Important current limitations

- Review checks are heuristic and only inspect added diff lines; they do not
  replace full-repository analysis or human review.
- Knowledge matching is keyword-based and unscoped; retrieved documents are
  not filtered by repository or user.
- The application has no user authentication or authorization.
- A GitHub webhook secret is optional in the current implementation; configure
  it before exposing the endpoint.
- The OpenAI call receives source diff and retrieved context, so configure it
  only when that data-sharing behavior is acceptable.
- The current deployment is a learning/demo reference. Add access control,
  tenant isolation, operational safeguards, and automated tests before using it
  for sensitive production workloads.
