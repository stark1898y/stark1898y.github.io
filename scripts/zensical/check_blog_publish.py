"""Test publishing a Pages CMS shaped blog post and a CMS media file.

The test post/image only exist in CI checkout; they never become Git commits.
"""
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[2]
POST = ROOT / "content/blog/posts/ci-publish-probe.md"
MEDIA = ROOT / "content/assets/uploads/ci-publish-probe.svg"
OUT = ROOT / "site"


def main():
    if POST.exists() or MEDIA.exists():
        raise SystemExit("Refusing to overwrite an existing CMS test fixture")

    MEDIA.parent.mkdir(parents=True, exist_ok=True)
    try:
        # Match Pages CMS output: a YAML title and a plain-text body (no # heading).
        POST.write_text(
            "---\ntitle: 在线博客发布验证\nslug: ci-publish-probe\n"
            "date: 2026-10-01\ndraft: false\n"
            "description: CI publication and image test\n"
            "categories:\n  - 技术验证\n---\n"
            "通过 Pages CMS 格式模拟发布。\n"
            "\n![测试图片](/assets/uploads/ci-publish-probe.svg)\n",
            encoding="utf-8",
        )
        MEDIA.write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">'
            '<rect width="20" height="20" fill="#2a6fbe"/></svg>\n',
            encoding="utf-8",
        )
        subprocess.run(["zensical", "build", "--clean", "--strict"], cwd=ROOT, check=True)
        index = (OUT / "blog/index.html").read_text(encoding="utf-8")
        assert "在线博客发布验证" in index, "Published post missing from blog index"
        posts = list((OUT / "blog").rglob("ci-publish-probe/index.html"))
        assert posts, "Published blog URL was not generated"
        assert (OUT / "blog/ci-publish-probe/index.html").is_file(), "Blog permalink must be /blog/{slug}/"
        assert (OUT / "assets/uploads/ci-publish-probe.svg").is_file(), "CMS media output missing"
        search = json.loads((OUT / "search.json").read_text(encoding="utf-8"))
        assert "在线博客发布验证" in json.dumps(search, ensure_ascii=False), "Post absent from search"
        print("PASS CMS Markdown-style blog publication, search and media path")
        print("Published preview URL:", posts[0].relative_to(OUT))
    finally:
        POST.unlink(missing_ok=True)
        MEDIA.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
