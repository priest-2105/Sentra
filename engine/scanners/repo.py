import os
import tempfile
import shutil
from pathlib import Path
from git import Repo
from git.exc import GitCommandError, InvalidGitRepositoryError


SKIP_DIRS = {".git", "node_modules", "__pycache__", ".next", "dist", "build", ".cache", "venv", ".venv"}
MAX_FILE_SIZE = 512 * 1024  # 512KB
TEXT_EXTENSIONS = {
    ".js", ".ts", ".jsx", ".tsx", ".py", ".rb", ".go", ".java", ".cs",
    ".php", ".rs", ".cpp", ".c", ".h", ".sh", ".bash", ".zsh",
    ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf",
    ".env", ".env.example", ".env.local", ".env.production",
    ".md", ".txt", ".html", ".css", ".scss", ".sass",
    ".dockerfile", ".Dockerfile", ".gitignore", ".eslintrc",
    ".prettierrc", ".babelrc", ".xml",
}


def clone_repo(repo_url: str) -> tuple[str, list[dict]]:
    """Clone a git repo to a temp dir. Returns (tmpdir, file_list)."""
    tmpdir = tempfile.mkdtemp(prefix="sentra_")
    try:
        Repo.clone_from(repo_url, tmpdir, depth=1)
    except GitCommandError as e:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise ValueError(f"Failed to clone repository: {e}") from e

    files = walk_files(tmpdir)
    return tmpdir, files


def walk_files(root: str) -> list[dict]:
    """Walk the repo and return a list of {path, rel_path, size, is_text}."""
    result = []
    root_path = Path(root)

    for dirpath, dirnames, filenames in os.walk(root):
        # Skip unwanted directories in-place
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]

        for filename in filenames:
            full_path = Path(dirpath) / filename
            rel_path = full_path.relative_to(root_path)
            try:
                size = full_path.stat().st_size
            except OSError:
                continue

            ext = full_path.suffix.lower()
            name_lower = filename.lower()
            is_text = (
                ext in TEXT_EXTENSIONS
                or name_lower in {"dockerfile", ".gitignore", ".env", "makefile", "procfile"}
                or name_lower.startswith(".eslintrc")
                or name_lower.startswith(".prettierrc")
                or name_lower.startswith(".biome")
            )

            result.append({
                "path": str(full_path),
                "rel_path": str(rel_path).replace("\\", "/"),
                "size": size,
                "is_text": is_text,
            })

    return result


def read_file_safe(path: str, max_size: int = MAX_FILE_SIZE) -> str | None:
    """Read a file safely, returning None if it can't be read as text."""
    try:
        size = os.path.getsize(path)
        if size > max_size:
            return None
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except (OSError, UnicodeDecodeError):
        return None


def cleanup_repo(tmpdir: str):
    """Remove the temp directory."""
    shutil.rmtree(tmpdir, ignore_errors=True)
