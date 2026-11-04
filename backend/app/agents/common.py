"""Shared types and helpers used by each code-review agent."""

import re
import uuid
from typing import Any


SEVERITY_ORDER = {"critical": 5, "high": 4, "medium": 3, "low": 2, "info": 1}

DiffLine = dict[str, Any]
Finding = dict[str, Any]


def parse_diff(diff: str) -> list[DiffLine]:
    """Extract added diff lines with their file paths and new-file line numbers."""
    current_file, new_line, parsed = "unknown", 0, []
    for line in diff.splitlines():
        if line.startswith("+++ b/"):
            current_file = line[6:]
        elif line.startswith("@@"):
            match = re.search(r"\+(\d+)", line)
            if match:
                new_line = int(match.group(1))
        elif line.startswith("+") and not line.startswith("+++"):
            parsed.append({"file": current_file, "line": new_line, "text": line[1:]})
            new_line += 1
        elif not line.startswith("-") and not line.startswith("\\"):
            new_line += 1
    return parsed


def finding(
    agent: str,
    severity: str,
    category: str,
    title: str,
    file: str,
    line: int | None,
    explanation: str,
    recommendation: str,
    rule_id: str | None = None,
    confidence: float = 0.82,
) -> Finding:
    """Create the consistent finding shape consumed by the API and frontend."""
    return {
        "id": str(uuid.uuid4())[:8],
        "agent": agent,
        "severity": severity,
        "category": category,
        "title": title,
        "file": file,
        "line": line,
        "explanation": explanation,
        "recommendation": recommendation,
        "rule_id": rule_id,
        "confidence": confidence,
    }


class BaseAgent:
    """Common contract for agents that inspect parsed diff lines."""

    name = "base"

    def run(self, lines: list[DiffLine], context: list[dict[str, Any]]) -> list[Finding]:
        """Return findings for this agent; specialized agents implement the checks."""
        return []
