/* Optional page translation via Google Translate. No third-party script loads until clicked. */
(function () {
  "use strict";
  const languages = [
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "fr", label: "Français" }
  ];

  function currentPageUrl() {
    return location.origin + location.pathname + location.search;
  }

  function addTranslator() {
    const header = document.querySelector(".md-header__inner");
    if (!header || header.querySelector(".stark-translate")) return;
    const palette = header.querySelector(".md-header__option");
    const search = header.querySelector(".md-search");
    const anchor = palette || search;
    if (!anchor) return;

    const wrapper = document.createElement("div");
    wrapper.className = "stark-translate";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "stark-translate__trigger";
    trigger.title = "翻译当前页面";
    trigger.setAttribute("aria-label", "翻译当前页面");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 6 6"/><path d="m4 14 6-7 2-3H2"/><path d="M2 8h12"/><path d="m13 20 5-11 5 11"/><path d="M15 16h6"/></svg>';

    const menu = document.createElement("div");
    menu.className = "stark-translate__menu";
    menu.hidden = true;
    const heading = document.createElement("div");
    heading.className = "stark-translate__heading";
    heading.textContent = "翻译当前页面";
    menu.appendChild(heading);
    const original = document.createElement("a");
    original.textContent = "简体中文（原文）";
    original.href = currentPageUrl();
    menu.appendChild(original);
    languages.forEach(function (language) {
      const link = document.createElement("a");
      link.textContent = language.label;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.dataset.lang = language.code;
      menu.appendChild(link);
    });
    const note = document.createElement("small");
    note.textContent = "由 Google 翻译提供，新标签页打开";
    menu.appendChild(note);

    function close() {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
    trigger.addEventListener("click", function () {
      const opening = menu.hidden;
      menu.hidden = !opening;
      trigger.setAttribute("aria-expanded", String(opening));
      if (opening) {
        const url = currentPageUrl();
        original.href = url;
        menu.querySelectorAll("[data-lang]").forEach(function (link) {
          link.href = "https://translate.google.com/translate?sl=zh-CN&tl=" +
            encodeURIComponent(link.dataset.lang) + "&u=" + encodeURIComponent(url);
        });
      }
    });
    wrapper.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { close(); trigger.focus(); }
    });
    document.addEventListener("click", function (event) {
      if (!wrapper.contains(event.target)) close();
    });
    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);
    anchor.before(wrapper);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addTranslator, { once: true });
  } else {
    addTranslator();
  }
  if (typeof document$ !== "undefined" && document$ && typeof document$.subscribe === "function") {
    document$.subscribe(addTranslator);
  }
})();
