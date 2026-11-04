"""Code Quality Agent: looks for readability and error-handling risks."""

import re
from typing import Any

from .common import BaseAgent, DiffLine, Finding, finding


class QualityAgent(BaseAgent):
    """Flags long added lines and code that appears to swallow exceptions."""

    name = "Code Quality Agent"

    def run(self, lines: list[DiffLine], context: list[dict[str, Any]]) -> list[Finding]:
        out = []
        for item in lines:
            text = item["text"]
            if len(text) > 140:
                out.append(finding(
                    self.name,
                    "info",
                    "readability",
                    "Long line added",
                    item["file"],
                    item["line"],
                    f"This changed line is {len(text)} characters long.",
                    "Break the expression into named intermediate values or wrap it for readability.",
                    "QLT-001",
                    0.75,
                ))
            if re.search(r'(?i)catch\s*\([^)]*\)\s*\{\s*\}', text) or re.search(r'except\s*:\s*pass', text):
                out.append(finding(
                    self.name,
                    "medium",
                    "reliability",
                    "Exception may be swallowed",
                    item["file"],
                    item["line"],
                    "The added code appears to ignore an exception.",
                    "Handle expected failures explicitly and log or propagate unexpected errors.",
                    "QLT-002",
                ))
        return out
