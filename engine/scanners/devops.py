import os
import re


CI_PATTERNS = [
    ".github/workflows",
    ".gitlab-ci.yml",
    "Jenkinsfile",
    ".circleci/config.yml",
    ".travis.yml",
    "azure-pipelines.yml",
    "bitbucket-pipelines.yml",
    ".drone.yml",
]

DOCKERFILE_PATTERNS = [
    "Dockerfile",
    "dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
]

TEST_DIR_PATTERNS = [
    "test", "tests", "__tests__", "spec", "specs",
    "e2e", "integration", "unit",
]

TEST_FILE_PATTERNS = [
    re.compile(r'\.test\.(js|ts|jsx|tsx|py|rb|go|java)$'),
    re.compile(r'\.spec\.(js|ts|jsx|tsx|py|rb|go)$'),
    re.compile(r'_test\.(go|py|rb)$'),
    re.compile(r'Test\.java$'),
]

LINT_PATTERNS = [
    ".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.yaml", ".eslintrc.yml",
    ".eslintrc.cjs", "eslint.config.js", "eslint.config.mjs",
    ".prettierrc", ".prettierrc.js", ".prettierrc.json",
    ".biome.json", "biome.json",
    ".stylelintrc", "stylelint.config.js",
    "pyproject.toml",  # often contains ruff/black config
    ".flake8", "setup.cfg",
    ".rubocop.yml",
    ".golangci.yml",
]

HEALTH_PATTERNS = [
    re.compile(r'[\'"/]health[\'"/\s]', re.IGNORECASE),
    re.compile(r'[\'"/]healthz[\'"/\s]', re.IGNORECASE),
    re.compile(r'[\'"/]ping[\'"/\s]', re.IGNORECASE),
    re.compile(r'[\'"/]ready[\'"/\s]', re.IGNORECASE),
    re.compile(r'[\'"/]livez[\'"/\s]', re.IGNORECASE),
]

MONITORING_DEPS = {
    "sentry", "@sentry/", "datadog", "dd-trace", "rollbar", "bugsnag",
    "newrelic", "elastic-apm", "honeybadger", "raygun", "trackjs",
}

LOGGING_DEPS = {
    "winston", "pino", "morgan", "bunyan", "log4js", "loglevel",
    "signale", "consola", "tslog", "logging",
}


def scan_devops(files: list[dict], repo_dir: str) -> dict:
    """Scan for DevOps maturity indicators."""
    rel_paths = {f["rel_path"] for f in files}
    all_paths_lower = {p.lower() for p in rel_paths}

    result = {
        "has_ci": _check_ci(rel_paths, repo_dir),
        "has_dockerfile": _check_dockerfile(rel_paths),
        "has_tests": _check_tests(files, rel_paths),
        "has_lint": _check_lint(all_paths_lower),
        "has_health_endpoint": False,
        "has_error_tracking": False,
        "has_structured_logging": False,
        "env_in_gitignore": False,
        "env_not_in_repo": True,  # assumed true, secrets.py will find .env files
        "has_typescript": _check_typescript(rel_paths),
        "dep_count": 0,
    }

    # Check package.json for deps and observability libs
    result.update(_check_package_json(files, result))

    # Check for health endpoint patterns in source files
    result["has_health_endpoint"] = _check_health_endpoint(files)

    # Check .gitignore for .env
    result["env_in_gitignore"] = _check_gitignore(files)

    return result


def _check_ci(rel_paths: set, repo_dir: str) -> bool:
    for pattern in CI_PATTERNS:
        if pattern in rel_paths:
            return True
        # For directory patterns like .github/workflows
        if "/" in pattern:
            dir_part = pattern.split("/")[0]
            if any(p.startswith(dir_part + "/") for p in rel_paths):
                return True
    return False


def _check_dockerfile(rel_paths: set) -> bool:
    for pattern in DOCKERFILE_PATTERNS:
        if pattern in rel_paths:
            return True
        # Check in any subdirectory
        if any(p.endswith("/" + pattern) or p == pattern for p in rel_paths):
            return True
    return False


def _check_tests(files: list[dict], rel_paths: set) -> bool:
    # Check for test directories
    for path in rel_paths:
        parts = path.split("/")
        for part in parts:
            if part.lower() in TEST_DIR_PATTERNS:
                return True

    # Check for test file patterns
    for f in files:
        for pattern in TEST_FILE_PATTERNS:
            if pattern.search(f["rel_path"]):
                return True

    return False


def _check_lint(paths_lower: set) -> bool:
    for pattern in LINT_PATTERNS:
        if pattern.lower() in paths_lower:
            return True
        # Check in any directory
        if any(p.endswith("/" + pattern.lower()) for p in paths_lower):
            return True
    return False


def _check_typescript(rel_paths: set) -> bool:
    return "tsconfig.json" in rel_paths or any(p.endswith("tsconfig.json") for p in rel_paths)


def _check_health_endpoint(files: list[dict]) -> bool:
    from .repo import read_file_safe
    source_exts = {".js", ".ts", ".jsx", ".tsx", ".py", ".rb", ".go", ".java", ".php"}
    for f in files:
        ext = "." + f["rel_path"].rsplit(".", 1)[-1] if "." in f["rel_path"] else ""
        if ext not in source_exts:
            continue
        content = read_file_safe(f["path"], max_size=128 * 1024)
        if content:
            for pattern in HEALTH_PATTERNS:
                if pattern.search(content):
                    return True
    return False


def _check_package_json(files: list[dict], result: dict) -> dict:
    from .repo import read_file_safe
    import json

    updates = {
        "has_error_tracking": False,
        "has_structured_logging": False,
        "dep_count": 0,
    }

    for f in files:
        if f["rel_path"] not in ("package.json",):
            continue
        content = read_file_safe(f["path"])
        if not content:
            continue
        try:
            pkg = json.loads(content)
            deps = {}
            deps.update(pkg.get("dependencies", {}))
            deps.update(pkg.get("devDependencies", {}))
            updates["dep_count"] = len(pkg.get("dependencies", {}))

            dep_keys_lower = {k.lower() for k in deps}
            for dep in dep_keys_lower:
                if any(m in dep for m in MONITORING_DEPS):
                    updates["has_error_tracking"] = True
                if any(l in dep for l in LOGGING_DEPS):
                    updates["has_structured_logging"] = True
        except (json.JSONDecodeError, TypeError):
            pass
        break  # only check root package.json

    return updates


def _check_gitignore(files: list[dict]) -> bool:
    from .repo import read_file_safe
    for f in files:
        if f["rel_path"] == ".gitignore":
            content = read_file_safe(f["path"])
            if content:
                for line in content.splitlines():
                    line = line.strip()
                    if line in (".env", ".env.*", "*.env", ".env*"):
                        return True
            break
    return False
