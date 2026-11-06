"""Verify awesome-nav includes an added Markdown page without editing .nav.yml."""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[2]
probe = root / "content/docs/mcu/zensical-nav-probe.md"
page = root / "site/docs/mcu/index.html"

if probe.exists():
    raise SystemExit("Refusing to overwrite an existing navigation probe")
try:
    probe.write_text("# Zensical 导航自动发现测试\n\n该文档仅用于 CI。\n", encoding="utf-8")
    subprocess.run(["zensical", "build", "--clean", "--strict"], cwd=root, check=True)
    if not (root / "site/docs/mcu/zensical-nav-probe/index.html").exists():
        raise SystemExit("Probe page missing from output")
    if "zensical-nav-probe" not in page.read_text(encoding="utf-8"):
        raise SystemExit("awesome-nav did not add the probe link to MCU navigation")
    print("PASS awesome-nav auto-discovers a new Markdown page")
finally:
    probe.unlink(missing_ok=True)
