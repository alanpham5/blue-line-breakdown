import { Children, isValidElement, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export const AppSelect = ({
  placeholder,
  value,
  onChange,
  children,
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({
      value:
        child.props.value !== undefined
          ? child.props.value
          : child.props.children,
      label: child.props.children,
    }));

  const hasValue = value !== "" && value != null;
  const selected = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setOpen(false);
  };

  return (
    <div
      className={`relative ${open ? "z-[60]" : "z-[50]"}`}
      ref={containerRef}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={placeholder}
        className={`${className} flex items-center justify-between text-left ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span
          className={`truncate ${hasValue ? "" : "text-[var(--control-placeholder)]"}`}
        >
          {hasValue ? selected?.label : placeholder}
        </span>
      </button>
      <ChevronDown
        aria-hidden="true"
        className={`pointer-events-none absolute right-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--control-placeholder)] transition-transform duration-200 ${
          open ? "rotate-180" : ""
        } ${disabled ? "opacity-50" : ""}`}
      />
      <div
        role="listbox"
        className={`liquid-glass !absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-60 origin-top overflow-y-auto rounded-[24px] p-2 transition-all duration-200 ease-out ${
          open
            ? "translate-y-0 scale-y-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-y-95 opacity-0"
        }`}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={String(opt.value) === String(value)}
            onClick={() => handleSelect(opt.value)}
            className={`w-full rounded-[18px] px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-[#3d8deb]/35 light:hover:bg-[#d4e8fc] ${
              String(opt.value) === String(value)
                ? "text-[#a9d0fd] light:text-[#256fd4]"
                : "text-white light:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
