import subprocess
import json
import os


def run_npm_audit(repo_dir: str) -> dict:
    """
    Run npm audit --json if package.json exists.
    Returns {critical: int, high: int, moderate: int, low: int, error: str|None}
    """
    package_json = os.path.join(repo_dir, "package.json")
    if not os.path.exists(package_json):
        return {"critical": 0, "high": 0, "moderate": 0, "low": 0, "error": None, "skipped": True}

    # Run npm install --package-lock-only first to generate lock file if missing
    lock_file = os.path.join(repo_dir, "package-lock.json")
    if not os.path.exists(lock_file):
        try:
            subprocess.run(
                ["npm", "install", "--package-lock-only", "--ignore-scripts"],
                cwd=repo_dir,
                capture_output=True,
                timeout=60,
            )
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return {"critical": 0, "high": 0, "moderate": 0, "low": 0, "error": "npm not available", "skipped": True}

    try:
        result = subprocess.run(
            ["npm", "audit", "--json"],
            cwd=repo_dir,
            capture_output=True,
            text=True,
            timeout=120,
        )
        # npm audit exits with non-zero if vulnerabilities found — that's expected
        data = json.loads(result.stdout)
        return _parse_audit_output(data)
    except FileNotFoundError:
        return {"critical": 0, "high": 0, "moderate": 0, "low": 0, "error": "npm not available", "skipped": True}
    except (subprocess.TimeoutExpired, json.JSONDecodeError) as e:
        return {"critical": 0, "high": 0, "moderate": 0, "low": 0, "error": str(e), "skipped": False}


def _parse_audit_output(data: dict) -> dict:
    counts = {"critical": 0, "high": 0, "moderate": 0, "low": 0, "error": None, "skipped": False}

    # npm audit v7+ format
    if "metadata" in data and "vulnerabilities" in data.get("metadata", {}):
        vuln_meta = data["metadata"]["vulnerabilities"]
        counts["critical"] = vuln_meta.get("critical", 0)
        counts["high"] = vuln_meta.get("high", 0)
        counts["moderate"] = vuln_meta.get("moderate", 0)
        counts["low"] = vuln_meta.get("low", 0)
    # npm audit v6 format
    elif "vulnerabilities" in data:
        for vuln in data["vulnerabilities"].values():
            severity = vuln.get("severity", "low")
            if severity in counts:
                counts[severity] += 1
    # advisories format (older)
    elif "advisories" in data:
        for advisory in data["advisories"].values():
            severity = advisory.get("severity", "low")
            if severity in counts:
                counts[severity] += 1

    return counts
