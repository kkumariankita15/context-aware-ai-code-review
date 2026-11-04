"""Standards Agent: checks new lines for common project-style problems."""

import re
from typing import Any

from .common import BaseAgent, DiffLine, Finding, finding


class StandardsAgent(BaseAgent):
    """Flags console logging, TypeScript any types, and function-scoped var use."""

    name = "Standards Agent"

    def run(self, lines: list[DiffLine], context: list[dict[str, Any]]) -> list[Finding]:
        out = []
        for item in lines:
            text = item["text"]
            if re.search(r'\bconsole\.log\s*\(', text):
                out.append(finding(
                    self.name,
                    "low",
                    "standards",
                    "Debug logging in application code",
                    item["file"],
                    item["line"],
                    "A console.log statement was added.",
                    "Use the project's logger and remove temporary debugging output.",
                    "STD-001",
                ))
            if re.search(r'\bany\b', text) and item["file"].endswith((".ts", ".tsx")):
                out.append(finding(
                    self.name,
                    "low",
                    "standards",
                    "TypeScript any type",
                    item["file"],
                    item["line"],
                    "The any type bypasses useful compile-time checks.",
                    "Prefer a concrete type, unknown with narrowing, or a shared domain interface.",
                    "STD-002",
                ))
            if re.search(r'^\s{0,2}(var\s+)', text):
                out.append(finding(
                    self.name,
                    "low",
                    "standards",
                    "Use block-scoped declarations",
                    item["file"],
                    item["line"],
                    "var has function scope and can lead to accidental reassignment.",
                    "Use const by default and let when reassignment is required.",
                    "STD-003",
                ))
        return out
