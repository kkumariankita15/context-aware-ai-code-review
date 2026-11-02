from pydantic import BaseModel, Field
from typing import Optional, Literal

class AnalyzeRequest(BaseModel):
    repository: str = "demo/repository"
    pull_request: Optional[int] = None
    title: str = "Local code review"
    description: str = ""
    diff: str = Field(..., min_length=1)
    branch: Optional[str] = None

class Finding(BaseModel):
    id: str
    agent: str
    severity: Literal["critical", "high", "medium", "low", "info"]
    category: str
    title: str
    file: str
    line: Optional[int] = None
    explanation: str
    recommendation: str
    confidence: float = 0.8
    rule_id: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    repository: str
    pull_request: Optional[int]
    title: str
    status: str
    score: int
    findings: list[Finding]
    summary: str
    created_at: str

class KnowledgeItem(BaseModel):
    id: int
    filename: str
    category: str
    chunks: int
    created_at: str
