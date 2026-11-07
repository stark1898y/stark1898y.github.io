"""Audit relative links and images in built Zensical HTML."""
from collections import defaultdict
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import posixpath
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "site"
REPORT = ROOT / "artifacts" / "site-audit.json"
LANDING = {"index.html", "blog/index.html", "dev-tools/index.html"}


class Links(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "a" and data.get("href"):
            self.refs.append(("link", data["href"]))
        if tag in ("img", "script", "iframe", "source") and data.get("src"):
            self.refs.append(("asset", data["src"]))
        if tag == "link" and data.get("href"):
            rel = (data.get("rel") or "").split()
            if set(rel) & {"icon", "stylesheet", "preload", "modulepreload"}:
                self.refs.append(("asset", data["href"]))


def targets(page, value):
    try:
        parsed = urlsplit(value)
    except ValueError:
        return []
    if parsed.scheme or parsed.netloc or not parsed.path or parsed.path.startswith("//"):
        return []
    path = unquote(parsed.path)
    if path.startswith("/"):
        relative = path.lstrip("/")
    else:
        relative = posixpath.normpath(posixpath.join(page.parent.as_posix(), path)).lstrip("/")
    if relative.startswith("../"):
        return []
    relative = relative.rstrip("/")
    if not relative:
        return ["index.html"]
    if not Path(relative).suffix:
        return [relative + "/index.html", relative + ".html", relative]
    return [relative]


def main():
    if not SITE.is_dir():
        raise SystemExit("Site output not found")
    broken = defaultdict(set)
    pages = sorted(SITE.rglob("*.html"))
    references = 0
    for file in pages:
        page = file.relative_to(SITE)
        parser = Links()
        parser.feed(file.read_text(encoding="utf-8", errors="replace"))
        for kind, value in parser.refs:
            options = targets(page, value)
            if not options:
                continue
            references += 1
            if not any((SITE / p).is_file() for p in options):
                broken[(page.as_posix(), kind)].add(value)

    items = [
        {"source": source, "kind": kind, "target": target}
        for (source, kind), values in sorted(broken.items())
        for target in sorted(values)
    ]
    result = {"html_pages": len(pages), "references": references, "broken": items}
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"HTML pages={len(pages)} references={references} unresolved={len(items)}")
    for item in items[:25]:
        print(f"WARN: {item['source']} -> {item['target']}")
    if len(items) > 25:
        print(f"... {len(items) - 25} additional entries in JSON report")

    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as out:
            out.write(
                f"\n### Zensical link audit\n"
                f"- HTML pages: {len(pages)}\n"
                f"- References: {references}\n"
                f"- Unresolved: {len(items)}\n"
            )
    critical = [item for item in items if item["source"] in LANDING]
    if critical:
        raise SystemExit(f"FAIL: {len(critical)} broken landing page references")


if __name__ == "__main__":
    main()
