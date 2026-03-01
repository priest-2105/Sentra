import re
from .repo import read_file_safe

SECRET_PATTERNS = [
    # Generic API/secret keys
    (re.compile(r'(?i)(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token)\s*[=:]\s*[\'"]?[A-Za-z0-9/+]{16,}'), "API/Secret Key"),
    # AWS access key
    (re.compile(r'AKIA[0-9A-Z]{16}'), "AWS Access Key"),
    # GitHub personal access token
    (re.compile(r'ghp_[A-Za-z0-9]{36}'), "GitHub Token"),
    # Generic password assignment
    (re.compile(r'password\s*=\s*[\'"][^\'"]{8,}[\'"]'), "Hardcoded Password"),
    # Private key header
    (re.compile(r'-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----'), "Private Key"),
    # Slack token
    (re.compile(r'xox[baprs]-[0-9A-Za-z\-]{10,}'), "Slack Token"),
    # Stripe key
    (re.compile(r'sk_live_[0-9a-zA-Z]{24,}'), "Stripe Secret Key"),
    # SendGrid API key
    (re.compile(r'SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}'), "SendGrid API Key"),
]

ENV_FILE_PATTERN = re.compile(r'(^|/)\.env($|\.)(?!example|sample|template)', re.IGNORECASE)


def scan_secrets(files: list[dict]) -> dict:
    """
    Scan text files for secret patterns.
    Returns {found: bool, findings: [{file, pattern_name, line}], env_committed: bool}
    """
    findings = []
    env_committed = False

    for file_info in files:
        rel_path = file_info["rel_path"]

        # Check if a .env file (not example/sample) is committed
        if _is_env_file(rel_path):
            env_committed = True

        if not file_info["is_text"]:
            continue

        content = read_file_safe(file_info["path"])
        if content is None:
            continue

        for pattern, pattern_name in SECRET_PATTERNS:
            matches = pattern.findall(content)
            if matches:
                # Find line numbers
                for i, line in enumerate(content.splitlines(), 1):
                    if pattern.search(line):
                        findings.append({
                            "file": rel_path,
                            "pattern_name": pattern_name,
                            "line": i,
                        })
                        break  # One finding per file per pattern is enough

    return {
        "found": len(findings) > 0,
        "findings": findings[:20],  # cap at 20
        "env_committed": env_committed,
    }


def _is_env_file(rel_path: str) -> bool:
    """Return True if this looks like a committed .env file (not example/template)."""
    filename = rel_path.split("/")[-1].lower()
    if not filename.startswith(".env"):
        return False
    # Allow .env.example, .env.sample, .env.template, .env.local.example
    excluded_suffixes = ("example", "sample", "template")
    remainder = filename[4:]  # after ".env"
    if not remainder:
        return True
    if remainder.startswith("."):
        suffix = remainder[1:].lower()
        return not any(suffix.startswith(s) for s in excluded_suffixes)
    return False
