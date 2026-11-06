"""Verify key pages, old article routes, local search, and draft privacy."""
import json
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
    "docs/rtos/comparison.html",
    "docs/hardware/component/ntc.html",
    "docs/mcu/stm32/cubemx.html",
]
missing = [p for p in paths if not (root / p).is_file()]
if missing:
    raise SystemExit("Missing expected site outputs:\n" + "\n".join(missing))

index = (root / "index.html").read_text(encoding="utf-8")
if 'data-md-component="search"' not in index:
    raise SystemExit("Search UI not found in generated homepage")
if 'class="stark-home"' not in index:
    raise SystemExit("Custom homepage not found")

search = root / "search.json"
if not search.is_file():
    raise SystemExit("Zensical search.json is absent")
items = json.loads(search.read_text(encoding="utf-8")).get("items", [])
all_text = "\n".join(str(x.get("title","")) + str(x.get("text","")) for x in items)
for term in ("硬件设计", "STM32", "RTOS", "NTC"):
    if term not in all_text:
        raise SystemExit(f"Search index does not contain {term}")
if "Zensical 网站迁移记录（草稿）" in all_text:
    raise SystemExit("Private blog draft was indexed!")

legacy = (root / "docs/rtos/comparison.html").read_text(encoding="utf-8")
if "/docs/rtos/comparison/" not in legacy:
    raise SystemExit("Historical redirect target missing")

print(f"PASS: {len(paths)} critical pages + legacy routes + {len(items)} search entries")
