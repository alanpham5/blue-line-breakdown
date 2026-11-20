export const subjectColor = (index) => `var(--subject-${index})`;

export const subjectInk = (index) => `var(--subject-ink-${index})`;

export const subjectTint = (index, percent) =>
  `rgb(var(--subject-rgb-${index}) / ${percent / 100})`;

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

export const leaderIndex = (
  values,
  lowerIsBetter = false,
  tolerance = 0.05
) => {
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
    className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold ${className}`}
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

export const SubjectTag = ({ index, label, className = "" }) => (
  <p
    className={`flex min-w-0 items-center gap-2 text-lg font-bold tracking-display ${className}`}
    style={{ color: subjectColor(index) }}
  >
    <SubjectMarker index={index} />
    <span className="truncate">{label}</span>
  </p>
);

export const SubHeading = ({ children }) => (
  <p className="mb-3 text-sm font-semibold text-gray-300 light:text-gray-700">
    {children}
  </p>
);

export const ComparisonSection = ({
  icon: Icon,
  iconClassName = "text-gray-300",
  title,
  labels,
  children,
  className = "",
}) => (
  <section
    className={`liquid-glass-strong liquid-glass-animate relative overflow-hidden rounded-[32px] p-5 sm:p-6 ${className}`}
  >
    <header className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className={`h-6 w-6 shrink-0 ${iconClassName}`} />}
        <h3 className="text-xl font-bold tracking-display text-white light:text-gray-900 sm:text-2xl">
          {title}
        </h3>
      </div>
      {labels && <SubjectLegend labels={labels} />}
    </header>
    {children}
  </section>
);
