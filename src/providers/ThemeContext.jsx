import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const getResolvedTheme = (themeMode) => {
  if (themeMode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return themeMode;
};

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const updateAppIcons = () => {
  const href =
    getSystemTheme() === "light" ? "/blb-light.png" : "/blb-dark.png";
  document.getElementById("app-favicon")?.setAttribute("href", href);
  document.getElementById("app-apple-touch-icon")?.setAttribute("href", href);
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system";
    }
    return "system";
  });

  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(pointer: coarse)");
      setIsTouch(mediaQuery.matches);
      const handlePointerChange = (e) => {
        setIsTouch(e.matches);
      };
      mediaQuery.addEventListener("change", handlePointerChange);
      return () => {
        mediaQuery.removeEventListener("change", handlePointerChange);
      };
    }
  }, []);

  useEffect(() => {
    if (isTouch) {
      setTheme("system");
    }
  }, [isTouch]);

  useEffect(() => {
    const root = document.documentElement;
    const activeTheme = isTouch ? "system" : theme;

    const applyTheme = (themeMode) => {
      root.classList.remove("light", "dark");

      if (themeMode === "system") {
        const systemPreference = getResolvedTheme("system");
        root.classList.add(systemPreference);
        root.removeAttribute("data-theme");
      } else {
        root.classList.add(themeMode);
        root.setAttribute("data-theme", themeMode);
      }
    };

    applyTheme(activeTheme);
    if (!isTouch) {
      localStorage.setItem("theme", theme);
    }

    if (activeTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleSystemThemeChange = (e) => {
        const systemPreference = e.matches ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(systemPreference);
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      };
    }
  }, [theme, isTouch]);

  useEffect(() => {
    updateAppIcons();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateAppIcons);

    return () => {
      mediaQuery.removeEventListener("change", updateAppIcons);
    };
  }, []);

  const handleSetTheme = (newTheme) => {
    if (!isTouch) {
      setTheme(newTheme);
    }
  };

  const value = {
    theme: isTouch ? "system" : theme,
    setTheme: handleSetTheme,
    isThemeTogglingDisabled: isTouch,
    actualTheme:
      typeof window !== "undefined"
        ? getResolvedTheme(isTouch ? "system" : theme)
        : theme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
