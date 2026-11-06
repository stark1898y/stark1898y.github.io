"""Verify public paths that must survive the VitePress -> Zensical migration."""
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
    "search/search_index.json",
]
missing = [p for p in paths if not (root / p).is_file()]
if missing:
    raise SystemExit("Missing expected site outputs:\n" + "\n".join(missing))
print(f"PASS: {len(paths)} critical site files exist")
