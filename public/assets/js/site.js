/* Pruthwi policies site: progressive enhancement only. Every page reads fully without this file. */
(function () {
  "use strict";

  var root = document.documentElement;
  var KEY = "pruthwi-theme";

  function readTheme() {
    try { return localStorage.getItem(KEY) || "system"; } catch (e) { return "system"; }
  }
  function saveTheme(mode) {
    try {
      if (mode === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) { /* storage blocked: the choice lasts for this page only */ }
  }
  function applyTheme(mode) {
    if (mode === "light" || mode === "dark") root.setAttribute("data-theme", mode);
    else root.removeAttribute("data-theme");
  }

  // Runs in <head>, before first paint, so there is no flash of the wrong theme.
  root.classList.remove("no-js");
  applyTheme(readTheme());

  document.addEventListener("DOMContentLoaded", function () {
    // Theme toggle: system -> light -> dark -> system.
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      var labels = { system: "Theme: match device", light: "Theme: light", dark: "Theme: dark" };
      var next = { system: "light", light: "dark", dark: "system" };
      var setButton = function (mode) {
        toggle.setAttribute("data-mode", mode);
        toggle.setAttribute("aria-label", labels[mode] + " (click to change)");
        toggle.setAttribute("title", labels[mode]);
      };
      setButton(readTheme());
      toggle.addEventListener("click", function () {
        var mode = next[toggle.getAttribute("data-mode")] || "system";
        applyTheme(mode);
        saveTheme(mode);
        setButton(mode);
      });
    }

    // Table of contents: collapsed on phones, highlights the section in view.
    var toc = document.querySelector(".toc");
    if (toc) {
      var narrow = window.matchMedia("(max-width: 959px)");
      var syncOpen = function () { toc.open = !narrow.matches; };
      syncOpen();
      if (narrow.addEventListener) narrow.addEventListener("change", syncOpen);

      var links = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
      links.forEach(function (a) {
        a.addEventListener("click", function () { if (narrow.matches) toc.open = false; });
      });

      if ("IntersectionObserver" in window) {
        var byId = {};
        links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
        var visible = {};
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
          var current = null;
          for (var i = 0; i < links.length; i++) {
            var id = links[i].getAttribute("href").slice(1);
            if (visible[id]) { current = id; break; }
          }
          if (!current) return;
          links.forEach(function (a) { a.classList.remove("active"); a.removeAttribute("aria-current"); });
          byId[current].classList.add("active");
          byId[current].setAttribute("aria-current", "location");
        }, { rootMargin: "-80px 0px -55% 0px" });
        Object.keys(byId).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) observer.observe(el);
        });
      }
    }

    // "Copy link" button on each numbered section heading.
    var headings = document.querySelectorAll(".doc-body section[id] > h2");
    Array.prototype.forEach.call(headings, function (h) {
      var id = h.parentElement.id;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "anchor";
      btn.textContent = "Copy link";
      btn.setAttribute("aria-label", "Copy link to this section");
      btn.addEventListener("click", function () {
        var url = location.origin + location.pathname + "#" + id;
        var done = function () {
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = "Copy link"; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () { location.hash = id; });
        } else {
          location.hash = id;
        }
      });
      h.appendChild(btn);
    });

    // Footer year.
    var year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
  });
})();
