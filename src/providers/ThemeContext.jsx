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

const updateAppIcons = (resolvedTheme) => {
  const href =
    resolvedTheme === "light" ? "/blb-light.png" : "/blb-dark.png";
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

  useEffect(() => {
    const root = document.documentElement;

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

      updateAppIcons(getResolvedTheme(themeMode));
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleSystemThemeChange = (e) => {
        const systemPreference = e.matches ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(systemPreference);
        updateAppIcons(systemPreference);
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      };
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
    actualTheme:
      typeof window !== "undefined" ? getResolvedTheme(theme) : theme,
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
