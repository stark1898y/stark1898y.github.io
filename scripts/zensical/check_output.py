"""Verify key pages, old article routes, local search, and draft privacy."""
import json
from pathlib import Path
import yaml

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
# Scan all current draft posts, including files created directly in Pages CMS.
blog_landing = (root / "blog/index.html").read_text(encoding="utf-8")
posts_dir = root.parent / "content/blog/posts"
for source in posts_dir.rglob("*.md"):
    raw = source.read_text(encoding="utf-8")
    if not raw.startswith("---"):
        continue
    sections = raw.split("---", 2)
    if len(sections) != 3:
        continue
    frontmatter = yaml.safe_load(sections[1]) or {}
    if frontmatter.get("draft") is not True:
        continue
    title = frontmatter.get("title") or source.stem
    slug = frontmatter.get("slug") or source.stem
    if title in all_text or title in blog_landing:
        raise SystemExit(f"Draft content leaked into search or blog list: {source}")
    if any((root / "blog").rglob(f"{slug}/index.html")):
        raise SystemExit(f"Draft URL was published: {source}")

from urllib.parse import urlparse
import xml.etree.ElementTree as ET
base = "https://www.stark1898y.cc"
if not (root / "404.html").is_file():
    raise SystemExit("404.html missing")
sitemap = root / "sitemap.xml"
robots = root / "robots.txt"
if not sitemap.is_file() or not robots.is_file():
    raise SystemExit("SEO files missing")
urls = {e.text for e in ET.parse(sitemap).getroot().iter() if e.tag.endswith("}loc")}
for tool in ("timestamp-converter", "json-formatter", "base64"):
    expected = f"{base}/dev-tools/{tool}/"
    if expected not in urls:
        raise SystemExit(f"Tool not indexed in sitemap: {expected}")
    page = (root / "dev-tools" / tool / "index.html").read_text(encoding="utf-8")
    if f'rel="canonical" href="{expected}"' not in page:
        raise SystemExit(f"Tool canonical missing: {tool}")
if any(urlparse(u).netloc != "www.stark1898y.cc" for u in urls):
    raise SystemExit("Non-canonical sitemap URL")

legacy = (root / "docs/rtos/comparison.html").read_text(encoding="utf-8")
if "/docs/rtos/comparison/" not in legacy:
    raise SystemExit("Historical redirect target missing")

print(f"PASS: {len(paths)} critical pages + legacy routes + {len(items)} search entries")
