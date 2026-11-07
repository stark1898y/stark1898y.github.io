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
            # Mobile navigation, search and translation must be reachable.
            drawer_toggle = page.locator('.md-header__button[for="__drawer"]')
            assert drawer_toggle.count() > 0, "Mobile navigation toggle missing"
            drawer_toggle.first.click()
            page.wait_for_function("document.querySelector('#__drawer')?.checked === true")
            navigation = page.locator(".md-sidebar--primary")
            assert navigation.is_visible(), "Mobile navigation drawer not visible"
            assert navigation.locator('a[href*="/docs/"]').count() > 0, "Knowledge-base link missing from mobile navigation"
            page.locator('label.md-overlay[for="__drawer"]').click()
            page.wait_for_function("document.querySelector('#__drawer')?.checked === false")
            mobile_translate = page.locator(".stark-translate__trigger")
            assert mobile_translate.is_visible(), "Translation action not available on mobile"
            mobile_translate.click()
            assert page.locator(".stark-translate__menu").is_visible()
            assert not page.evaluate("document.documentElement.scrollWidth > window.innerWidth"), "Mobile translation menu creates horizontal overflow"
            page.keyboard.press("Escape")
            assert page.locator(".stark-translate__menu").is_hidden()
            print("PASS mobile drawer, knowledge navigation and translation access")


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
                page.wait_for_function("() => !document.querySelector('pre.mermaid')", timeout=9000)
                print("PASS Mermaid diagram was transformed from its source block")
            except Exception:
                page.screenshot(path=str(OUTPUT / "mermaid-debug.png"), full_page=True)
                raise

            # Verify the actual search interaction, not just the search icon.
            page.set_viewport_size({"width": 1365, "height": 900})
            page.goto(base, wait_until="load")
            # The search dialog hydrates asynchronously. Retry the shortcut
            # rather than failing the whole CI on a slow GitHub runner.
            visible = []
            for attempt in range(3):
                page.keyboard.press("Escape")
                page.wait_for_timeout(200)
                page.keyboard.press("Control+k")
                page.wait_for_timeout(1000)
                visible = [
                    control for control in page.locator("input").all()
                    if control.is_visible() and control.get_attribute("type") in (None, "text", "search")
                ]
                if visible:
                    break
            if not visible:
                page.screenshot(path=str(OUTPUT / "search-dialog-debug.png"), full_page=True)
                raise AssertionError("Search dialog has no visible input after retries")
            visible[-1].fill("NTC")
            page.wait_for_timeout(1300)
            page.screenshot(path=str(OUTPUT / "search-ntc.png"))
            assert page.get_by_role("listbox", name="Search results").locator("a").count() > 0, "No selectable search results"
            print("PASS Chinese/English technical term search")

            # Native Zensical three-mode palette: system -> light -> dark.
            page.keyboard.press("Escape")
            page.emulate_media(color_scheme="light")
            page.goto(base + "/", wait_until="load")
            labels = page.locator(".md-header label[title]")
            assert page.locator('label[title="跟随系统 · 切换到浅色模式"]').count() > 0, "No system theme option"
            page.wait_for_function("document.body.getAttribute('data-md-color-scheme') === 'default'")
            page.locator('label[title="跟随系统 · 切换到浅色模式"]').first.click()
            page.wait_for_function("document.body.getAttribute('data-md-color-scheme') === 'default'")
            assert page.locator('label[title="浅色模式 · 切换到深色模式"]').count() > 0, "No light theme option"
            page.locator('label[title="浅色模式 · 切换到深色模式"]').first.click()
            page.wait_for_function("document.body.getAttribute('data-md-color-scheme') === 'slate'")
            page.goto(base + "/docs/intro/", wait_until="load")
            page.wait_for_function("document.body.getAttribute('data-md-color-scheme') === 'slate'")
            assert page.locator('label[title="深色模式 · 切换到跟随系统"]').count() > 0, "No dark theme option"
            page.locator('label[title="深色模式 · 切换到跟随系统"]').first.click()
            page.wait_for_function("document.body.getAttribute('data-md-color-scheme') === 'default'")
            page.emulate_media(color_scheme="dark")
            page.wait_for_function("document.body.getAttribute('data-md-color-scheme') === 'slate'")
            page.emulate_media(color_scheme="light")
            page.wait_for_function("document.body.getAttribute('data-md-color-scheme') === 'default'")
            print("PASS native system/light/dark cycle, persistence, and system preference")

            # Translation dropdown has exactly Chinese original and English.
            page.goto(base + "/", wait_until="load")
            trigger = page.locator(".stark-translate__trigger")
            assert trigger.count() == 1, "Missing header translate button"
            trigger.click()
            menu = page.locator(".stark-translate__menu")
            assert menu.is_visible(), "Translation menu did not open"
            links = menu.locator("a")
            assert links.count() == 2, "Expected only original Chinese and English"
            assert links.nth(0).inner_text() == "简体中文（原文）"
            assert links.nth(1).inner_text() == "English"
            assert links.nth(1).get_attribute("target") == "_blank"
            assert "tl=en" in links.nth(1).get_attribute("href")
            page.keyboard.press("Escape")
            assert menu.is_hidden(), "Escape did not dismiss translation menu"
            page.goto(base + "/docs/intro/", wait_until="load")
            page.locator(".stark-translate__trigger").click()
            assert "%2Fdocs%2Fintro%2F" in page.locator('.stark-translate__menu a[data-lang="en"]').get_attribute("href")
            print("PASS Chinese/English translation dropdown on home and docs")

            # Footer displays an actual calculated day count on every Zensical page.
            page.goto(base + "/", wait_until="load")
            age = page.locator(".stark-footer-running")
            assert age.count() == 1, "Site age missing from homepage footer"
            assert age.get_attribute("data-stark-site-since") == "2022-01-12T05:49:47Z"
            assert "建站至今" in age.inner_text() and "天" in age.inner_text()
            assert age.inner_text().split(" ")[1].replace(",", "").isdigit(), "Site age is not numeric"
            page.goto(base + "/docs/intro/", wait_until="load")
            assert "建站至今" in page.locator(".stark-footer-running").inner_text()
            print("PASS repository creation-based site age on homepage and documentation footer")

            browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
