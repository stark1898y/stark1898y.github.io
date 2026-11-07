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
    if "<head>" in source_html:
        additions = []
        if 'rel="icon"' not in source_html:
            additions.append('<link rel="icon" type="image/svg+xml" href="/logo.svg">')
        if 'rel="canonical"' not in source_html:
            canonical = "https://www.stark1898y.cc/dev-tools/" + page.parent.name + "/"
            additions.append('<link rel="canonical" href="' + canonical + '">')
        if additions:
            page.write_text(
                source_html.replace("<head>", "<head>" + chr(10) + chr(10).join(additions), 1),
                encoding="utf-8",
            )
print("Copied standalone tools to", target)
