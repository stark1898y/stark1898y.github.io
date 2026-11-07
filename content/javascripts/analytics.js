/* Load Vercel Web Analytics only on the canonical production domain. */
(function () {
  "use strict";
  if (window.location.hostname !== "www.stark1898y.cc") return;
  if (document.querySelector('script[data-stark-vercel-analytics]')) return;
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
  const script = document.createElement("script");
  script.defer = true;
  script.src = "/_vercel/insights/script.js";
  script.dataset.starkVercelAnalytics = "1";
  document.head.appendChild(script);
})();
