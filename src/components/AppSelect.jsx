import { ChevronDown } from "lucide-react";

export const AppSelect = ({
  placeholder,
  value,
  onChange,
  children,
  className = "",
  disabled = false,
  ...props
}) => {
  const hasValue = value !== "" && value != null;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-label={placeholder}
        className={`app-select-field ${className}${hasValue ? "" : " app-select-native"}`}
        {...props}
      >
        {!hasValue && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      {!hasValue && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-4 z-10 flex items-center text-base text-[var(--control-placeholder)]"
        >
          {placeholder}
        </span>
      )}
      <ChevronDown
        aria-hidden="true"
        className={`pointer-events-none absolute right-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--control-placeholder)]${
          disabled ? " opacity-50" : ""
        }`}
      />
    </div>
  );
};
