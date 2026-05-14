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
    <div className="flex gap-1 rounded-full bg-black/20 p-1 backdrop-blur-sm light:bg-white/80">
      {themes.map(({ value, icon: Icon, label, ariaLabel }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            relative rounded-full px-3 py-2 flex items-center gap-2 outline-none focus:outline-none focus-visible:outline-none
            transition-all duration-200 ease-out
            ${
              theme === value
                ? "bg-sky-400/10 text-sky-300 shadow-[0_6px_16px_rgba(88,166,255,0.12)] light:bg-sky-500/10 light:text-sky-700"
                : "text-slate-400 hover:text-slate-100 dark:text-slate-400 dark:hover:text-slate-100 light:text-slate-600 light:hover:text-slate-800 hover:bg-white/5 light:hover:bg-slate-900/5"
            }
          `}
          aria-label={ariaLabel}
          aria-pressed={theme === value}
        >
          <Icon size={16} className="shrink-0" />

          {showLabel && (
            <span className="text-sm font-medium hidden lg:inline">
              {label}
            </span>
          )}

          {theme === value && (
            <span className="absolute inset-0 -z-10 rounded-full bg-sky-400/8 opacity-80" />
          )}
        </button>
      ))}
    </div>
  );
}
