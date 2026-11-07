"""Build the Zensical static site exactly as required for production hosting.

Used by Vercel's buildCommand and by GitHub Actions PR checks. The resulting
site/ directory contains Markdown pages, standalone tools, compatibility
redirects, a sitemap, robots.txt and the local search index.
"""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]

def run(*args):
    print("BUILD:", " ".join(args), flush=True)
    subprocess.run(args, cwd=ROOT, check=True)

def main():
    run("zensical", "build", "--clean", "--strict")
    for step in (
        "restore_tools.py",
        "restore_legacy_urls.py",
        "finalize_seo.py",
        "check_output.py",
        "audit_site.py",
    ):
        run(sys.executable, str(ROOT / "scripts" / "zensical" / step))
    print("PASS: Zensical production build is ready in site/", flush=True)

if __name__ == "__main__":
    main()
