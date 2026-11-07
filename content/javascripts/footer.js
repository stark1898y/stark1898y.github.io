/* Days since the GitHub repository was created. No cookies, fetch or external requests. */
(function () {
  "use strict";

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  function renderSiteAge() {
    document.querySelectorAll("[data-stark-site-since]").forEach(function (element) {
      const startedAt = Date.parse(element.getAttribute("data-stark-site-since") || "");
      if (!Number.isFinite(startedAt)) return;

      const days = Math.max(0, Math.floor((Date.now() - startedAt) / MS_PER_DAY));
      element.textContent = "建站至今 " + days.toLocaleString("zh-CN") + " 天";
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

  // The public endpoint is read-only; only Vercel holds the Analytics token.
  async function showStats() {
    const elements = document.querySelectorAll("[data-stark-stats]");
    if (!elements.length || location.hostname !== "www.stark1898y.cc") return;
    try {
      const response = await fetch("/api/site-stats");
      if (!response.ok) return;
      const data = await response.json();
      if (!Number.isSafeInteger(data.visitors) || data.visitors < 0 ||
          !Number.isSafeInteger(data.pageviews) || data.pageviews < 0 ||
          data.periodDays !== 30) return;
      const label = " · 近30天访客 " + data.visitors.toLocaleString("zh-CN") +
        " 人 · 浏览 " + data.pageviews.toLocaleString("zh-CN") + " 次";
      elements.forEach(function (element) {
        element.textContent = label;
        element.hidden = false;
        element.title = "Vercel Web Analytics 最近 30 天统计，不是历史累计人数";
      });
    } catch (_) {
      // Analytics not configured or temporarily unavailable: show no fake counts.
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showStats, { once: true });
  } else {
    showStats();
  }

  // Update the number if someone keeps a tab open across days.
  window.setInterval(renderSiteAge, 60 * 60 * 1000);
})();
