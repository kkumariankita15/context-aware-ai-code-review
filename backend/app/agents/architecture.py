"""Architecture Agent: checks added code for layering and follow-up markers."""

import re
from typing import Any

from .common import BaseAgent, DiffLine, Finding, finding


class ArchitectureAgent(BaseAgent):
    """Flags controller-to-model coupling and newly introduced TODO/FIXME markers."""

    name = "Architecture Agent"

    def run(self, lines: list[DiffLine], context: list[dict[str, Any]]) -> list[Finding]:
        out = []
        for item in lines:
            text = item["text"]
            if re.search(r'(?i)(from\s+\S+\.models\s+import|import\s+\S+\.models)', text) and "controller" in item["file"].lower():
                out.append(finding(
                    self.name,
                    "medium",
                    "architecture",
                    "Controller may depend directly on persistence models",
                    item["file"],
                    item["line"],
                    "This can couple the API layer to storage implementation.",
                    "Consider depending on a service or repository interface and keep persistence concerns behind that boundary.",
                    "ARCH-001",
                ))
            if re.search(r'(?i)(TODO|FIXME)', text):
                out.append(finding(
                    self.name,
                    "low",
                    "maintainability",
                    "Unresolved TODO/FIXME added",
                    item["file"],
                    item["line"],
                    "A follow-up marker was introduced in the changed code.",
                    "Link this to a tracked issue or resolve it before merging.",
                    "ARCH-002",
                ))
        return out
