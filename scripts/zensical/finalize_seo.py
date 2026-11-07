"""Verify and complete SEO files for Zensical plus standalone browser tools."""
from pathlib import Path
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
    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    tree.write(sitemap, encoding="utf-8", xml_declaration=True)
    print(f"PASS SEO: sitemap={len(locations)} URLs, robots.txt, 404.html, HTTPS host {HOST}")


if __name__ == "__main__":
    main()
