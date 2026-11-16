export const subjectColor = (index) => `var(--subject-${index})`;

export const subjectTint = (index, percent) =>
  `color-mix(in srgb, var(--subject-${index}) ${percent}%, transparent)`;

export const compactSeason = (season) =>
  `${season}–${String(Number(season) + 1).slice(-2)}`;

export const formatPercentile = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(1).replace(/\.0$/, "")
    : "—";

export const toNumber = (value) => {
  const number = Number(value);
  return value != null && Number.isFinite(number) ? number : null;
};

export const getImpact = (player) =>
  toNumber(player?.impactPercentile ?? player?.warPercentile);

export const isGoalieData = (data) => data?.player?.position === "G";

const lastName = (name = "") => name.trim().split(/\s+/).slice(1).join(" ");

const initialedName = (name = "") =>
  `${name.trim().charAt(0)}. ${lastName(name)}`;

export const buildSubjectLabels = (left, right, isSamePlayer) => {
  if (isSamePlayer) {
    return [
      compactSeason(left.player.season),
      compactSeason(right.player.season),
    ];
  }
  const leftLast = lastName(left.player.name) || left.player.name;
  const rightLast = lastName(right.player.name) || right.player.name;
  return leftLast === rightLast
    ? [initialedName(left.player.name), initialedName(right.player.name)]
    : [leftLast, rightLast];
};

export const leaderIndex = (values, lowerIsBetter = false, tolerance = 0.05) => {
  const [left, right] = values;
  if (left == null || right == null) return null;
  if (Math.abs(left - right) <= tolerance) return null;
  const leftLeads = lowerIsBetter ? left < right : left > right;
  return leftLeads ? 0 : 1;
};

export const SubjectMarker = ({ index, className = "h-2.5 w-2.5" }) => (
  <span
    className={`inline-block shrink-0 ${index === 0 ? "rounded-full" : "rotate-45 scale-[0.85] rounded-[2px]"} ${className}`}
    style={{ backgroundColor: subjectColor(index) }}
    aria-hidden="true"
  />
);

export const SubjectLegend = ({ labels, className = "" }) => (
  <div
    className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold ${className}`}
  >
    {labels.map((label, index) => (
      <span
        key={`${label}-${index}`}
        className="flex items-center gap-1.5"
        style={{ color: subjectColor(index) }}
      >
        <SubjectMarker index={index} />
        {label}
      </span>
    ))}
  </div>
);

export const ComparisonSection = ({
  icon: Icon,
  iconClassName = "text-gray-300",
  eyebrow,
  title,
  description,
  labels,
  children,
  className = "",
}) => (
  <section
    className={`liquid-glass-strong liquid-glass-animate relative overflow-hidden rounded-[32px] p-4 sm:p-6 ${className}`}
  >
    <header className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gray-500">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`h-6 w-6 shrink-0 ${iconClassName}`} />}
          <h3 className="text-xl font-bold tracking-display text-white light:text-gray-900 sm:text-2xl">
            {title}
          </h3>
        </div>
        {description && (
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-400 light:text-gray-600 sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {labels && <SubjectLegend labels={labels} className="sm:justify-end" />}
    </header>
    {children}
  </section>
);

const ValueCell = ({ index, display, sublabel, emphasis, align }) => (
  <div
    className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}
  >
    <div
      className={`truncate text-sm font-bold tabular-nums transition-opacity sm:text-base ${emphasis === "muted" ? "opacity-55" : ""}`}
      style={{
        color: emphasis === "lead" ? subjectColor(index) : undefined,
      }}
    >
      <span
        className={
          emphasis === "lead" ? "" : "text-gray-200 light:text-gray-800"
        }
      >
        {display}
      </span>
    </div>
    {sublabel && (
      <div className="truncate text-[0.6rem] font-semibold text-gray-500 sm:text-[0.65rem]">
        {sublabel}
      </div>
    )}
  </div>
);

const HalfBar = ({ index, fraction, emphasis, direction }) => (
  <div
    className={`flex h-3 min-w-0 overflow-hidden bg-[var(--comparison-track)] ${direction === "left" ? "justify-end rounded-l-full" : "justify-start rounded-r-full"}`}
  >
    <div
      className={`h-full transition-[width] duration-1000 ease-out ${direction === "left" ? "rounded-l-full" : "rounded-r-full"}`}
      style={{
        width: `${Math.max(0, Math.min(1, fraction)) * 100}%`,
        background:
          direction === "left"
            ? `linear-gradient(270deg, ${subjectTint(index, 55)}, ${subjectColor(index)})`
            : `linear-gradient(90deg, ${subjectTint(index, 55)}, ${subjectColor(index)})`,
        opacity: emphasis === "muted" ? 0.4 : 1,
        boxShadow:
          emphasis === "lead" ? `0 0 14px ${subjectTint(index, 45)}` : "none",
      }}
    />
  </div>
);

export const ButterflyRow = ({
  label,
  values,
  displays,
  sublabels = [],
  max = 100,
  competitive = true,
  lowerIsBetter = false,
}) => {
  const leader = competitive ? leaderIndex(values, lowerIsBetter) : null;
  const emphasisFor = (index) => {
    if (leader == null) return "even";
    return leader === index ? "lead" : "muted";
  };
  const fractionFor = (index) =>
    values[index] == null || !max ? 0 : values[index] / max;

  return (
    <div className="min-w-0" role="group" aria-label={label}>
      <div className="mb-1 truncate text-center text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gray-400 light:text-gray-500 sm:text-[0.68rem]">
        {label}
      </div>
      <div className="grid grid-cols-[3.75rem_minmax(0,1fr)_minmax(0,1fr)_3.75rem] items-center gap-x-2 sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)_5rem] sm:gap-x-3">
        <ValueCell
          index={0}
          display={displays[0]}
          sublabel={sublabels[0]}
          emphasis={emphasisFor(0)}
          align="right"
        />
        <div className="grid grid-cols-2 gap-[3px] [grid-column:span_2]">
          <HalfBar
            index={0}
            fraction={fractionFor(0)}
            emphasis={emphasisFor(0)}
            direction="left"
          />
          <HalfBar
            index={1}
            fraction={fractionFor(1)}
            emphasis={emphasisFor(1)}
            direction="right"
          />
        </div>
        <ValueCell
          index={1}
          display={displays[1]}
          sublabel={sublabels[1]}
          emphasis={emphasisFor(1)}
          align="left"
        />
      </div>
    </div>
  );
};
