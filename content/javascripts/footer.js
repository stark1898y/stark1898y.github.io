/* Decorative site-age counter. No cookies, fetch, or third-party requests. */
(function () {
  "use strict";

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  function renderSiteAge() {
    document.querySelectorAll("[data-stark-site-since]").forEach(function (element) {
      const startedAt = Date.parse(element.getAttribute("data-stark-site-since") || "");
      if (!Number.isFinite(startedAt)) return;

      const days = Math.max(0, Math.floor((Date.now() - startedAt) / MS_PER_DAY));
      element.textContent = "本站已运行 " + days.toLocaleString("zh-CN") + " 天";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSiteAge, { once: true });
  } else {
    renderSiteAge();
  }

  // Work across future Zensical instant-navigation changes, too.
  if (typeof document$ !== "undefined" && document$ && typeof document$.subscribe === "function") {
    document$.subscribe(renderSiteAge);
  }

  // Update the number if someone keeps a tab open across days.
  window.setInterval(renderSiteAge, 60 * 60 * 1000);
})();
