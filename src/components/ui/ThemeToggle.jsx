import { useTheme } from "providers/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";
export function ThemeToggle({ showLabel = true }) {
  const { theme, setTheme, isThemeTogglingDisabled } = useTheme();
  if (isThemeTogglingDisabled) {
    return null;
  }
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
            ${theme === value ? "bg-white/10 text-[#7ee340] light:bg-slate-900/10 light:text-[#2e6e14]" : "text-slate-400 hover:text-slate-100 dark:text-slate-400 dark:hover:text-slate-100 light:text-slate-600 light:hover:text-slate-800 hover:bg-white/5 light:hover:bg-slate-900/5"}
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
        </button>
      ))}
    </div>
  );
}
