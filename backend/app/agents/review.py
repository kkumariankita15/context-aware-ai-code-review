"""Review orchestration: runs each agent and calculates the combined review score."""

from typing import Any

from ..config import settings
from ..knowledge import search_context
from .architecture import ArchitectureAgent
from .common import Finding, SEVERITY_ORDER, parse_diff
from .context_agent import optional_llm_review
from .quality import QualityAgent
from .security import SecurityAgent
from .standards import StandardsAgent


def run_review(diff: str) -> tuple[list[Finding], int, str, list[dict[str, Any]]]:
    """Run specialist and optional context-aware agents over a pull request diff."""
    lines = parse_diff(diff)
    context = search_context(diff[:5000])
    agents = [SecurityAgent(), ArchitectureAgent(), StandardsAgent(), QualityAgent()]
    findings: list[Finding] = []
    for agent in agents:
        findings.extend(agent.run(lines, context))
    findings.extend(optional_llm_review(diff, context))

    # Keep one finding for each rule and source location.
    unique = {}
    for item in findings:
        key = (item["rule_id"], item["file"], item["line"], item["title"])
        unique[key] = item
    findings = sorted(
        unique.values(),
        key=lambda item: SEVERITY_ORDER.get(item["severity"], 0),
        reverse=True,
    )
    weights = {"critical": 25, "high": 12, "medium": 6, "low": 2, "info": 0}
    penalty = sum(weights.get(item["severity"], 0) for item in findings)
    score = max(0, 100 - penalty)
    summary = (
        f"Analyzed {len(lines)} added lines with {len(agents)} specialist agents"
        + (" and the optional AI context agent" if settings.openai_api_key else "")
        + f". Found {len(findings)} actionable or informational observations."
    )
    return findings, score, summary, context
