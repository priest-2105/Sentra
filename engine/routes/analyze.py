import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, HTTPException

from db import create_scan, get_scan, update_scan
from models import AnalyzeRequest, AnalyzeResponse, ScanResult
from scanners.repo import clone_repo, cleanup_repo
from scanners.npm_audit import run_npm_audit
from scanners.secrets import scan_secrets
from scanners.devops import scan_devops
from scanners.headers import scan_headers
from scoring.engine import compute_scores
from ai.explainer import generate_explanation

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    scan_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()

    await create_scan(
        scan_id=scan_id,
        timestamp=timestamp,
        repo_url=request.repo_url,
        deploy_url=request.deploy_url,
    )

    background_tasks.add_task(run_scan, scan_id, request.repo_url, request.deploy_url)

    return AnalyzeResponse(scan_id=scan_id)


@router.get("/scan/{scan_id}", response_model=ScanResult)
async def get_scan_result(scan_id: str):
    row = await get_scan(scan_id)
    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")

    result = ScanResult(
        id=row["id"],
        status=row["status"],
        timestamp=row["timestamp"],
        repo_url=row["repo_url"],
        deploy_url=row["deploy_url"],
        error_msg=row.get("error_msg"),
    )

    if row.get("total_score") is not None:
        result.total_score = row["total_score"]

    if row.get("scores_json"):
        scores_data = json.loads(row["scores_json"])
        from models import ScoreBreakdown
        result.scores = ScoreBreakdown(**scores_data)

    if row.get("flags_json"):
        flags_data = json.loads(row["flags_json"])
        from models import RiskFlag
        result.flags = [RiskFlag(**f) for f in flags_data]

    if row.get("explanation"):
        exp_data = json.loads(row["explanation"])
        from models import Explanation, RiskDetail, RoadmapItem
        result.explanation = Explanation(
            summary=exp_data["summary"],
            risks=[RiskDetail(**r) for r in exp_data.get("risks", [])],
            roadmap=[RoadmapItem(**r) for r in exp_data.get("roadmap", [])],
            recommendation=exp_data["recommendation"],
        )

    return result


async def run_scan(scan_id: str, repo_url: str, deploy_url: str | None):
    """Background task: run the full scan pipeline."""
    await update_scan(scan_id, status="running")

    tmpdir = None
    try:
        # 1. Clone repo
        tmpdir, files = clone_repo(repo_url)

        # 2. Run scanners in parallel (npm_audit is sync subprocess, run sequentially)
        import asyncio

        npm_result = run_npm_audit(tmpdir)
        secrets_result = scan_secrets(files)
        devops_result = scan_devops(files, tmpdir)

        # Headers scan is async
        headers_result = await scan_headers(deploy_url)

        # 3. Score
        scores = compute_scores(npm_result, secrets_result, devops_result, headers_result)

        # 4. Build scan_data for AI
        scan_data = {
            "repo_url": repo_url,
            "deploy_url": deploy_url,
            "total": scores["total"],
            "scores": {
                "security": scores["security"],
                "devops": scores["devops"],
                "observability": scores["observability"],
                "architecture": scores["architecture"],
            },
            "flags": scores["flags"],
            "npm": {
                "critical": npm_result.get("critical", 0),
                "high": npm_result.get("high", 0),
                "moderate": npm_result.get("moderate", 0),
            },
            "secrets": {
                "found": secrets_result["found"],
                "count": len(secrets_result.get("findings", [])),
                "env_committed": secrets_result["env_committed"],
            },
            "devops": {
                "has_ci": devops_result["has_ci"],
                "has_dockerfile": devops_result["has_dockerfile"],
                "has_tests": devops_result["has_tests"],
                "has_lint": devops_result["has_lint"],
                "has_typescript": devops_result["has_typescript"],
                "dep_count": devops_result["dep_count"],
            },
            "headers": {
                "is_https": headers_result["is_https"],
                "cors_wildcard": headers_result["cors_wildcard"],
                "csp": headers_result["csp"],
                "hsts": headers_result["hsts"],
                "x_frame_options": headers_result["x_frame_options"],
                "x_content_type_options": headers_result["x_content_type_options"],
            },
        }

        # 5. AI explanation
        explanation = await generate_explanation(scan_data)

        # 6. Persist
        await update_scan(
            scan_id,
            status="complete",
            total_score=scores["total"],
            scores_json=json.dumps({
                "security": scores["security"],
                "devops": scores["devops"],
                "observability": scores["observability"],
                "architecture": scores["architecture"],
            }),
            flags_json=json.dumps(scores["flags"]),
            explanation=json.dumps(explanation),
        )

    except ValueError as e:
        await update_scan(scan_id, status="error", error_msg=str(e))
    except Exception as e:
        await update_scan(scan_id, status="error", error_msg=f"Unexpected error: {str(e)}")
    finally:
        if tmpdir:
            cleanup_repo(tmpdir)
