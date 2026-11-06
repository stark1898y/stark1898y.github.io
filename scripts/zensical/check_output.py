"""Verify primary pages, stand-alone tools and visible search UI."""
from pathlib import Path

root = Path(__file__).resolve().parents[2] / "site"
paths = [
    "index.html",
    "docs/hardware/index.html",
    "docs/mcu/index.html",
    "docs/rtos/index.html",
    "open-source/index.html",
    "dev-tools/index.html",
    "dev-tools/timestamp-converter/index.html",
    "dev-tools/json-formatter/index.html",
    "dev-tools/base64/index.html",
    "blog/index.html",
]
missing = [p for p in paths if not (root / p).is_file()]
if missing:
    raise SystemExit("Missing expected site outputs:\\n" + "\\n".join(missing))

# Zensical uses a different search implementation from MkDocs Material;
# do not assume it outputs 'search/search_index.json'.
index = (root / "index.html").read_text(encoding="utf-8")
if 'data-md-component="search"' not in index:
    raise SystemExit("Search UI not found in generated homepage")

print(f"PASS: {len(paths)} critical site files + search UI")
