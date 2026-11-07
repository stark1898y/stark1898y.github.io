"""Keep VitePress-style *.html article URLs alive on GitHub Pages.

The new Zensical output uses /docs/topic/page/index.html. VitePress
previously emitted /docs/topic/page.html, also linked by extensionless URLs.
For each migrated article, create a lightweight browser redirect.
"""
from html import escape
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "content"
SITE = ROOT / "site"
SECTIONS = ("docs", "open-source", "dev-tools")


def main():
    count = 0
    skipped = 0
    for section in SECTIONS:
        for source in (DOCS / section).rglob("*.md"):
            if source.name == "index.md":
                continue
            rel = source.relative_to(DOCS).with_suffix("")
            target = "/" + rel.as_posix().strip("/") + "/"
            destination = SITE / (rel.as_posix() + ".html")
            if not (SITE / rel / "index.html").is_file():
                raise SystemExit("Missing new target for " + str(rel))
            if destination.exists():
                skipped += 1
                continue
            destination.parent.mkdir(parents=True, exist_ok=True)
            safe_target = escape(target, quote=True)
            destination.write_text(
                '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">\n'
                '<meta name="robots" content="noindex">\n'
                '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
                f'<link rel="canonical" href="https://www.stark1898y.cc{safe_target}">\n'
                f'<meta http-equiv="refresh" content="0; url={safe_target}">\n'
                f'<script>location.replace({json.dumps(target)} + location.search + location.hash)</script>\n'
                f'<title>页面已迁移</title></head><body><a href="{safe_target}">跳转到新地址</a></body></html>\n',
                encoding="utf-8",
            )
            count += 1
    print(f"PASS legacy URLs: created={count}, already-existed={skipped}")


if __name__ == "__main__":
    main()
