from pydantic import BaseModel
from typing import Optional


class AnalyzeRequest(BaseModel):
    repo_url: str
    deploy_url: Optional[str] = None


class AnalyzeResponse(BaseModel):
    scan_id: str


class ScoreBreakdown(BaseModel):
    security: int
    devops: int
    observability: int
    architecture: int


class RiskFlag(BaseModel):
    severity: str  # high | medium | low
    title: str
    detail: str


class RoadmapItem(BaseModel):
    priority: int
    action: str
    effort: str  # low | medium | high


class RiskDetail(BaseModel):
    title: str
    impact: str
    fix: str


class Explanation(BaseModel):
    summary: str
    risks: list[RiskDetail]
    roadmap: list[RoadmapItem]
    recommendation: str  # Ready | Needs Work | Not Ready


class ScanResult(BaseModel):
    id: str
    status: str
    timestamp: Optional[str] = None
    repo_url: Optional[str] = None
    deploy_url: Optional[str] = None
    total_score: Optional[int] = None
    scores: Optional[ScoreBreakdown] = None
    flags: Optional[list[RiskFlag]] = None
    explanation: Optional[Explanation] = None
    error_msg: Optional[str] = None
