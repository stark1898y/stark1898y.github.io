"""Verify and complete SEO files for Zensical plus standalone browser tools."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import tomllib
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "site"
CONFIG = tomllib.loads((ROOT / "zensical.toml").read_text(encoding="utf-8"))
BASE = CONFIG["project"]["site_url"].rstrip("/")
HOST = urlparse(BASE).netloc
TOOLS = ("timestamp-converter", "json-formatter", "base64")
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


class PageMeta(HTMLParser):
    """Collect canonical URL, description and robots directives from built HTML."""
    def __init__(self):
        super().__init__()
        self.canonical = []
        self.descriptions = []
        self.robots = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and "canonical" in (attrs.get("rel") or "").split():
            self.canonical.append(attrs.get("href"))
        if tag == "meta" and attrs.get("name", "").lower() == "description":
            self.descriptions.append(attrs.get("content"))
        if tag == "meta" and attrs.get("name", "").lower() == "robots":
            self.robots.append(attrs.get("content", ""))


def main():
    if BASE != "https://www.stark1898y.cc":
        raise SystemExit(f"Unexpected canonical website domain: {BASE}")
    robots = SITE / "robots.txt"
    if not robots.exists() or f"Sitemap: {BASE}/sitemap.xml" not in robots.read_text(encoding="utf-8"):
        raise SystemExit("robots.txt must point at canonical sitemap")
    if not (SITE / "404.html").is_file():
        raise SystemExit("Missing Zensical 404 page")
    sitemap = SITE / "sitemap.xml"
    root = ET.parse(sitemap).getroot()
    ET.register_namespace("", NS)
    locations = {node.text for node in root.findall(f".//{{{NS}}}loc") if node.text}
    if not locations or any(not url.startswith(BASE + "/") for url in locations):
        raise SystemExit("Non-canonical or missing sitemap locations")
    for tool in TOOLS:
        if not (SITE / "dev-tools" / tool / "index.html").is_file():
            raise SystemExit("Missing browser tool in site output: " + tool)
        url = f"{BASE}/dev-tools/{tool}/"
        if url not in locations:
            el = ET.SubElement(root, f"{{{NS}}}url")
            ET.SubElement(el, f"{{{NS}}}loc").text = url
            locations.add(url)
    # Check key landing pages have useful crawl metadata, not only a sitemap entry.
    landing_pages = ("index.html", "blog/index.html", "docs/intro/index.html", "dev-tools/index.html")
    for relative in landing_pages:
        file = SITE / relative
        if not file.is_file():
            raise SystemExit(f"Missing SEO landing page: {relative}")
        meta = PageMeta()
        meta.feed(file.read_text(encoding="utf-8"))
        expected = BASE + "/" + relative.removesuffix("index.html")
        if meta.canonical != [expected]:
            raise SystemExit(f"Non-canonical SEO URL for {relative}: {meta.canonical!r}; expected {expected}")
        if len(meta.descriptions) != 1 or not (meta.descriptions[0] or "").strip():
            raise SystemExit(f"Missing or duplicate meta description: {relative}")
        if any("noindex" in value.lower() for value in meta.robots):
            raise SystemExit(f"Unexpected noindex on SEO landing page: {relative}")

    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    tree.write(sitemap, encoding="utf-8", xml_declaration=True)
    print(f"PASS SEO: sitemap={len(locations)} URLs, robots.txt, 404.html, HTTPS host {HOST}")


if __name__ == "__main__":
    main()
