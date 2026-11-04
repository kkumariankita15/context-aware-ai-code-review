"""Security Agent: flags potentially unsafe patterns on added diff lines."""

import re
from typing import Any

from .common import BaseAgent, DiffLine, Finding, finding


class SecurityAgent(BaseAgent):
    """Checks added code for credential, eval, HTML-injection, and HTTP patterns."""

    name = "Security Agent"

    def run(self, lines: list[DiffLine], context: list[dict[str, Any]]) -> list[Finding]:
        out = []
        patterns = [
            (r'(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*["\'][^"\']{8,}', "critical", "Possible hard-coded credential", "Move the secret to a managed secret store or environment variable; rotate it if it was committed.", "SEC-001"),
            (r'(?i)\beval\s*\(', "high", "Dynamic eval usage", "Avoid eval; use explicit parsing or a safe dispatch table.", "SEC-002"),
            (r'(?i)dangerouslySetInnerHTML', "high", "Unsafe HTML injection surface", "Sanitize untrusted content or render it as text. Confirm the source is trusted.", "SEC-003"),
            (r'(?i)http://', "low", "Non-TLS URL", "Prefer HTTPS unless this is an intentional local/test endpoint.", "SEC-004"),
        ]
        for item in lines:
            for pattern, severity, title, recommendation, rule in patterns:
                if re.search(pattern, item["text"]):
                    out.append(finding(
                        self.name,
                        severity,
                        "security",
                        title,
                        item["file"],
                        item["line"],
                        f"The added line matches a security heuristic ({rule}). Verify whether the value or operation is externally controllable.",
                        recommendation,
                        rule,
                        0.88,
                    ))
        return out
