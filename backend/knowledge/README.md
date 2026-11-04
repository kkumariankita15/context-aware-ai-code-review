# Project knowledge base

Drop project-specific `.md`, `.txt`, `.json`, `.yaml`, `.yml`, `.ts`, `.js`, or `.py`
guidelines here. Files are ingested at API startup. You can also upload documents from
the dashboard.

The general review references in this directory are:
- `universal-code-review-standards.md` for language-neutral review principles and finding quality.
- `static-analysis-guidance.md` for interpreting SonarQube, SonarLint/SonarQube for IDE,
  ESLint, and equivalent tools.
- `language-quality-standards.md` for ecosystem checks across common programming languages.

Add repository-specific architecture, coding conventions, analyzer configuration, design
system usage, approved component catalogues, and review notes as separate documents. Project
configuration and explicitly documented team decisions take precedence over general examples.

The demo uses lightweight keyword retrieval. For production, replace this with chunked
embeddings + a vector database, add document versioning, and enforce access controls.
