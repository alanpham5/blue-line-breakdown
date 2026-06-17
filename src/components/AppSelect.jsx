import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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
  // Screen-space rect of the trigger button, used to position the portalled
  // listbox. Null until the menu has been opened at least once.
  const [rect, setRect] = useState(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

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

  // Re-measure the trigger so the menu tracks it on open, scroll, and resize.
  const updateRect = useCallback(() => {
    if (buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
  }, []);

  useLayoutEffect(() => {
    if (open) updateRect();
  }, [open, updateRect]);

  useEffect(() => {
    if (!open) return;
    // The listbox lives in a portal (outside containerRef), so an outside-click
    // check has to exempt it explicitly.
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        listRef.current &&
        !listRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    // Keep the fixed-position menu pinned to the trigger as the page moves.
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, updateRect]);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
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

      {/* Portalled to <body> so the menu escapes the glass cards' isolated
          stacking contexts and always paints above following content. */}
      {rect &&
        createPortal(
          <div
            ref={listRef}
            role="listbox"
            style={{
              position: "fixed",
              top: rect.bottom + 8,
              left: rect.left,
              width: rect.width,
            }}
            className={`liquid-glass z-[9999] max-h-60 origin-top overflow-y-auto rounded-[24px] p-2 transition-all duration-200 ease-out ${
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
          </div>,
          document.body
        )}
    </div>
  );
};
