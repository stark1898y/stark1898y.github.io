"""Keep pre-existing standalone tools in their original public URLs."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[2]
source = ROOT / "public" / "dev-tools"
target = ROOT / "site" / "dev-tools"
if not source.is_dir():
    raise SystemExit(f"Missing standalone tools: {source}")
shutil.copytree(source, target, dirs_exist_ok=True)
# Standalone HTML tools do not use the Zensical template.
# Add an explicit SVG favicon to avoid browser requests for a missing favicon.ico.
for page in target.glob("*/index.html"):
    source_html = page.read_text(encoding="utf-8")
    if 'rel="icon"' not in source_html and "<head>" in source_html:
        source_html = source_html.replace(
            "<head>",
            '<head>\n<link rel="icon" type="image/svg+xml" href="/logo.svg">',
            1,
        )
        page.write_text(source_html, encoding="utf-8")
print("Copied standalone tools to", target)
