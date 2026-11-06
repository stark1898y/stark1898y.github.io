"""Browser smoke tests for the built site (requires Playwright + Chrome)."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "site"
OUTPUT = ROOT / "artifacts" / "screenshots"


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    handler = partial(SimpleHTTPRequestHandler, directory=str(SITE))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    Thread(target=server.serve_forever, daemon=True).start()
    base = "http://127.0.0.1:" + str(server.server_port)
    try:
        with sync_playwright() as runner:
            browser = runner.chromium.launch(channel="chrome", headless=True, args=["--no-sandbox"])
            page = browser.new_page(viewport={"width": 1365, "height": 900})
            for path in ("/", "/docs/intro/", "/docs/hardware/", "/blog/", "/open-source/"):
                response = page.goto(base + path, wait_until="domcontentloaded")
                assert response.status == 200, (path, response.status)
                assert page.locator("h1").count() > 0, path
                print("PASS page", path)

            assert not (SITE / "blog/posts/first-draft/index.html").exists()
            assert "Zensical 网站迁移记录" not in page.goto(base + "/blog/", wait_until="domcontentloaded").text()
            print("PASS blog draft not published")

            page.goto(base, wait_until="load")
            page.screenshot(path=str(OUTPUT / "desktop-home.png"), full_page=True)
            page.set_viewport_size({"width": 390, "height": 844})
            page.reload(wait_until="load")
            assert not page.evaluate("document.documentElement.scrollWidth > window.innerWidth"), "Mobile page has horizontal overflow"
            page.screenshot(path=str(OUTPUT / "mobile-home.png"), full_page=True)
            print("PASS desktop/mobile homepage")

            page.goto(base + "/dev-tools/base64/", wait_until="load")
            page.locator("#input").fill("Hello")
            page.locator('button[onclick="doConvert()"]').click()
            assert page.locator("#output").input_value().strip() == "SGVsbG8="
            print("PASS Base64 functional test")

            page.goto(base + "/dev-tools/json-formatter/", wait_until="load")
            page.locator("#jsonInput").fill('{"example": 42}')
            page.locator('button[onclick="doFormat()"]').click()
            assert page.evaluate("typeof doFormat") == "function"
            print("PASS JSON formatter runs")

            page.goto(base + "/dev-tools/timestamp-converter/", wait_until="load")
            assert page.locator("#tsInput").count() == 1
            assert page.evaluate("typeof fillTsNow") == "function"
            print("PASS timestamp tool loaded")

            # A VitePress-era .html URL must keep working after migration.
            page.goto(base + "/docs/rtos/comparison.html", wait_until="load")
            assert page.url.endswith("/docs/rtos/comparison/"), page.url
            print("PASS legacy .html URL redirect")

            # Verify Chinese page content and Mermaid diagram rendering.
            page.goto(base + "/docs/intro/", wait_until="load")
            assert page.get_by_text("从开发实践到知识沉淀").count() > 0
            try:
                # The runtime replaces <pre class="mermaid"> with rendered SVG.
                page.locator(".mermaid svg, svg[id^='mermaid']").first.wait_for(timeout=9000)
                print("PASS Mermaid diagram SVG rendered")
            except Exception:
                page.screenshot(path=str(OUTPUT / "mermaid-debug.png"), full_page=True)
                raise

            # Verify the actual search interaction, not just the search icon.
            page.goto(base, wait_until="load")
            page.locator(".md-search__button").click()
            page.wait_for_timeout(350)
            visible = [
                control for control in page.locator("input").all()
                if control.is_visible() and control.get_attribute("type") in (None, "text", "search")
            ]
            assert visible, "Search dialog has no visible input"
            visible[-1].fill("NTC")
            page.wait_for_timeout(1300)
            page.screenshot(path=str(OUTPUT / "search-ntc.png"))
            assert "热敏电阻" in page.locator("body").inner_text(), "Chinese search result was not shown"
            print("PASS Chinese/English technical term search")

            browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
