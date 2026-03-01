"""
Scoring engine — converts scanner results to dimension scores + risk flags.

Security — 40 pts base
DevOps    — 30 pts
Observability — 15 pts
Architecture  — 15 pts
Total         — 100 pts max
"""

from typing import Any


def compute_scores(
    npm_result: dict,
    secrets_result: dict,
    devops_result: dict,
    headers_result: dict,
) -> dict:
    """Return {security, devops, observability, architecture, total, flags}."""
    security, sec_flags = _security_score(npm_result, secrets_result, headers_result)
    devops, dev_flags = _devops_score(devops_result)
    observability, obs_flags = _observability_score(devops_result)
    architecture, arch_flags = _architecture_score(devops_result, secrets_result)

    total = security + devops + observability + architecture

    flags = sec_flags + dev_flags + obs_flags + arch_flags
    # Sort by severity
    severity_order = {"high": 0, "medium": 1, "low": 2}
    flags.sort(key=lambda f: severity_order.get(f["severity"], 9))

    return {
        "security": security,
        "devops": devops,
        "observability": observability,
        "architecture": architecture,
        "total": total,
        "flags": flags,
    }


def _security_score(npm: dict, secrets: dict, headers: dict) -> tuple[int, list]:
    score = 40
    flags = []

    # npm audit deductions
    critical = npm.get("critical", 0)
    high = npm.get("high", 0)
    if critical > 0:
        deduct = min(critical * 8, score)
        score -= deduct
        flags.append({
            "severity": "high",
            "title": f"Critical npm vulnerabilities ({critical})",
            "detail": f"Found {critical} critical severity vulnerability/vulnerabilities in npm dependencies.",
        })
    if high > 0:
        deduct = min(high * 4, score)
        score -= deduct
        flags.append({
            "severity": "high",
            "title": f"High npm vulnerabilities ({high})",
            "detail": f"Found {high} high severity vulnerability/vulnerabilities in npm dependencies.",
        })

    moderate = npm.get("moderate", 0)
    if moderate > 0:
        flags.append({
            "severity": "medium",
            "title": f"Moderate npm vulnerabilities ({moderate})",
            "detail": f"Found {moderate} moderate severity vulnerability/vulnerabilities in npm dependencies.",
        })

    # Secrets detection
    if secrets.get("found"):
        score = max(0, score - 15)
        count = len(secrets.get("findings", []))
        flags.append({
            "severity": "high",
            "title": "Secrets detected in source code",
            "detail": f"Found {count} potential secret(s) hardcoded in the repository. Rotate affected credentials immediately.",
        })

    # .env committed
    if secrets.get("env_committed"):
        score = max(0, score - 10)
        flags.append({
            "severity": "high",
            "title": ".env file committed to repository",
            "detail": "A .env file with potentially sensitive values is tracked by git.",
        })

    # CORS wildcard
    if headers.get("cors_wildcard"):
        score = max(0, score - 5)
        flags.append({
            "severity": "medium",
            "title": "CORS wildcard (Access-Control-Allow-Origin: *)",
            "detail": "The API allows requests from any origin, which may expose sensitive data.",
        })

    # HTTPS bonus
    if headers.get("is_https"):
        score += 5

    # CSP header
    if headers.get("csp"):
        score += 2.5

    # HSTS header
    if headers.get("hsts"):
        score += 2.5

    # X-Frame-Options
    if headers.get("x_frame_options"):
        score += 2.5

    # X-Content-Type-Options
    if headers.get("x_content_type_options"):
        score += 2.5

    # Missing security headers (informational flags)
    if headers.get("reachable"):
        missing_headers = []
        if not headers.get("csp"):
            missing_headers.append("Content-Security-Policy")
        if not headers.get("hsts"):
            missing_headers.append("Strict-Transport-Security")
        if not headers.get("x_frame_options"):
            missing_headers.append("X-Frame-Options")
        if not headers.get("x_content_type_options"):
            missing_headers.append("X-Content-Type-Options")
        if missing_headers:
            flags.append({
                "severity": "medium",
                "title": "Missing security headers",
                "detail": f"Missing: {', '.join(missing_headers)}. Add these to harden your HTTP responses.",
            })

    score = max(0, min(50, round(score)))  # cap at 50 (40 base + 10 bonus)
    return score, flags


def _devops_score(devops: dict) -> tuple[int, list]:
    score = 0
    flags = []

    if devops.get("has_ci"):
        score += 12
    else:
        flags.append({
            "severity": "medium",
            "title": "No CI/CD pipeline detected",
            "detail": "No GitHub Actions, GitLab CI, or other CI configuration found. Add automated pipelines.",
        })

    if devops.get("has_dockerfile"):
        score += 8
    else:
        flags.append({
            "severity": "low",
            "title": "No Dockerfile found",
            "detail": "Containerizing your application improves reproducibility and deployment consistency.",
        })

    if devops.get("has_tests"):
        score += 7
    else:
        flags.append({
            "severity": "medium",
            "title": "No test files detected",
            "detail": "No test directory or test files found. Automated tests are essential for production readiness.",
        })

    if devops.get("has_lint"):
        score += 3

    return min(30, score), flags


def _observability_score(devops: dict) -> tuple[int, list]:
    score = 0
    flags = []

    if devops.get("has_health_endpoint"):
        score += 5
    else:
        flags.append({
            "severity": "low",
            "title": "No health check endpoint detected",
            "detail": "Add /health, /healthz, or /ping endpoint for load balancer and monitoring integration.",
        })

    if devops.get("has_error_tracking"):
        score += 5
    else:
        flags.append({
            "severity": "medium",
            "title": "No error tracking library detected",
            "detail": "Consider adding Sentry, Datadog, or Rollbar for production error monitoring.",
        })

    if devops.get("has_structured_logging"):
        score += 5
    else:
        flags.append({
            "severity": "low",
            "title": "No structured logging library detected",
            "detail": "Use Winston, Pino, or similar for structured, queryable logs in production.",
        })

    return min(15, score), flags


def _architecture_score(devops: dict, secrets: dict) -> tuple[int, list]:
    score = 0
    flags = []

    if devops.get("env_in_gitignore"):
        score += 5
    else:
        flags.append({
            "severity": "medium",
            "title": ".env not in .gitignore",
            "detail": "Add .env to .gitignore to prevent accidental secret commits.",
        })

    if not secrets.get("env_committed"):
        score += 5

    if devops.get("has_typescript"):
        score += 3

    dep_count = devops.get("dep_count", 0)
    if dep_count > 0 and dep_count < 50:
        score += 2
    elif dep_count >= 50:
        flags.append({
            "severity": "low",
            "title": f"High dependency count ({dep_count} direct deps)",
            "detail": "Large dependency trees increase attack surface and maintenance burden.",
        })

    return min(15, score), flags
