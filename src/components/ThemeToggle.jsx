import { useTheme } from "../providers/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle({ showLabel = true }) {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: "light",
      icon: Sun,
      label: "Light",
      ariaLabel: "Switch to light mode",
    },
    {
      value: "dark",
      icon: Moon,
      label: "Dark",
      ariaLabel: "Switch to dark mode",
    },
    {
      value: "system",
      icon: Monitor,
      label: "System",
      ariaLabel: "Use system theme",
    },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-lg liquid-glass backdrop-blur-sm">
      {themes.map(({ value, icon: Icon, label, ariaLabel }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            relative px-3 py-2 rounded-md flex items-center gap-2 
            transition-all duration-200 ease-out
            ${
              theme === value
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200 light:text-slate-600 light:hover:text-slate-800 hover:bg-slate-700/30 dark:hover:bg-slate-700/30 light:hover:bg-slate-200/50"
            }
          `}
          aria-label={ariaLabel}
          aria-pressed={theme === value}
        >
          <Icon size={16} className="shrink-0" />

          {showLabel && (
            <span className="text-sm font-medium hidden xl:inline">
              {label}
            </span>
          )}

          {theme === value && (
            <span className="absolute inset-0 rounded-md bg-blue-500 -z-10 animate-pulse opacity-30" />
          )}
        </button>
      ))}
    </div>
  );
}
