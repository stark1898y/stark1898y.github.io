"""Keep pre-existing standalone tools in their original public URLs."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[2]
source = ROOT / "public" / "dev-tools"
target = ROOT / "site" / "dev-tools"
if not source.is_dir():
    raise SystemExit(f"Missing standalone tools: {source}")
shutil.copytree(source, target, dirs_exist_ok=True)
print("Copied standalone tools to", target)
