/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2024 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

(() => {
  "use strict";

  const getStoredTheme = () => localStorage.getItem("theme");
  const setStoredTheme = (theme) => localStorage.setItem("theme", theme);

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const setTheme = (theme) => {
    if (theme === "auto") {
      document.documentElement.setAttribute(
        "data-bs-theme",
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    } else {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  };

  setTheme(getPreferredTheme());

  const showActiveTheme = (theme) => {
    const themeSelect = document.querySelector("#themeSelect");
    if (!themeSelect) {
      return;
    }

    themeSelect.value = theme;
  };

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const storedTheme = getStoredTheme();
      if (storedTheme !== "light" && storedTheme !== "dark") {
        setTheme(getPreferredTheme());
      }
    });

  window.addEventListener("DOMContentLoaded", () => {
    showActiveTheme(getPreferredTheme());

    const themeSelect = document.querySelector("#themeSelect");
    themeSelect.addEventListener("change", () => {
      const theme = themeSelect.value;
      setStoredTheme(theme);
      setTheme(theme);
      showActiveTheme(theme);
    });
  });
})();

(() => {
  "use strict";

  const getStoredFontTheme = () => localStorage.getItem("fontTheme");
  const setStoredFontTheme = (fontTheme) =>
    localStorage.setItem("fontTheme", fontTheme);

  const getPreferredFontTheme = () => {
    return "default";
  };

  const setFontTheme = (fontTheme) => {
    if (fontTheme === "default") {
      document.documentElement.setAttribute("data-font-theme", "default");
    } else {
      document.documentElement.setAttribute("data-font-theme", fontTheme);
    }
  };

  setFontTheme(getPreferredFontTheme());

  const showActiveFontTheme = (fontTheme) => {
    const fontThemeSelect = document.querySelector("#fontThemeSelect");
    if (!fontThemeSelect) {
      return;
    }

    fontThemeSelect.value = fontTheme;
  };

  window.addEventListener("DOMContentLoaded", () => {
    showActiveFontTheme(getPreferredFontTheme());

    const fontThemeSelect = document.querySelector("#fontThemeSelect");
    fontThemeSelect.addEventListener("change", () => {
      const fontTheme = fontThemeSelect.value;
      setStoredFontTheme(fontTheme);
      setFontTheme(fontTheme);
      showActiveFontTheme(fontTheme);
    });
  });
})();