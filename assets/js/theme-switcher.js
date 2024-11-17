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
    const themeSwitches = document.querySelectorAll(".theme-switch");
    themeSwitches.forEach((themeSwitch) => {
      const themeLabel = document.querySelector(`label[for='${themeSwitch.id}']`);
      if (!themeSwitch || !themeLabel) {
        return;
      }

      themeSwitch.checked = theme === "contrast";
      themeLabel.textContent = theme === "contrast" ? "Turn off High Contrast" : "Turn on High Contrast";
    });
  };

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const storedTheme = getStoredTheme();
      if (storedTheme !== "light" && storedTheme !== "dark" && storedTheme !== "contrast") {
        setTheme(getPreferredTheme());
      }
    });

  window.addEventListener("DOMContentLoaded", () => {
    showActiveTheme(getPreferredTheme());

    const themeSwitches = document.querySelectorAll(".theme-switch");
    themeSwitches.forEach((themeSwitch) => {
      themeSwitch.addEventListener("change", () => {
        const theme = themeSwitch.checked ? "contrast" : "light";
        setStoredTheme(theme);
        setTheme(theme);
        showActiveTheme(theme);
      });
    });
  });
})();

(() => {
  "use strict";

  const getStoredFontTheme = () => localStorage.getItem("fontTheme");
  const setStoredFontTheme = (fontTheme) =>
    localStorage.setItem("fontTheme", fontTheme);

  const getPreferredFontTheme = () => {
    const storedFontTheme = getStoredFontTheme();
    if (storedFontTheme) {
      return storedFontTheme;
    }
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
    const fontSwitches = document.querySelectorAll(".font-switch");
    fontSwitches.forEach((fontSwitch) => {
      const fontLabel = document.querySelector(`label[for='${fontSwitch.id}']`);
      if (!fontSwitch || !fontLabel) {
        return;
      }

      fontSwitch.checked = fontTheme === "dyslexic";
      fontLabel.textContent = fontTheme === "dyslexic" ? "Turn off Dyslexic Font" : "Turn on Dyslexic Font";
    });
  };

  window.addEventListener("DOMContentLoaded", () => {
    showActiveFontTheme(getPreferredFontTheme());

    const fontSwitches = document.querySelectorAll(".font-switch");
    fontSwitches.forEach((fontSwitch) => {
      fontSwitch.addEventListener("change", () => {
        const fontTheme = fontSwitch.checked ? "dyslexic" : "default";
        setStoredFontTheme(fontTheme);
        setFontTheme(fontTheme);
        showActiveFontTheme(fontTheme);
      });
    });
  });
})();

(() => {
  "use strict";

  const getStoredFontSize = () => localStorage.getItem("fontSize");
  const setStoredFontSize = (fontSize) => localStorage.setItem("fontSize", fontSize);

  const getPreferredFontSize = () => {
    const storedFontSize = getStoredFontSize();
    if (storedFontSize) {
      return storedFontSize;
    }
    return "medium";
  };

  const setFontSize = (fontSize) => {
    document.documentElement.setAttribute("data-font-size", fontSize);
  };

  setFontSize(getPreferredFontSize());

  const showActiveFontSize = (fontSize) => {
    const fontSizeOptions = document.querySelectorAll(".font-size-option");
    fontSizeOptions.forEach((option) => {
      option.checked = option.value === fontSize;
    });
  };

  window.addEventListener("DOMContentLoaded", () => {
    showActiveFontSize(getPreferredFontSize());

    const fontSizeOptions = document.querySelectorAll(".font-size-option");
    fontSizeOptions.forEach((option) => {
      option.addEventListener("change", () => {
        const fontSize = option.value;
        setStoredFontSize(fontSize);
        setFontSize(fontSize);
        showActiveFontSize(fontSize);
      });
    });
  });
})();