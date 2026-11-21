import { Shield, Target, Trophy } from "lucide-react";

const BicepsFlexedIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1" />
    <path d="M15 14a5 5 0 0 0-7.584 2" />
    <path d="M9.964 6.825C8.019 7.977 9.5 13 8 15" />
  </svg>
);

const BrickWallIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M12 9v6" />
    <path d="M16 15v6" />
    <path d="M16 3v6" />
    <path d="M3 15h18" />
    <path d="M3 9h18" />
    <path d="M8 15v6" />
    <path d="M8 3v6" />
  </svg>
);

const clamp = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const formatValue = (value, unit) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  if (unit === "percent") return `${(number * 100).toFixed(1)}%`;
  if (Math.abs(number) >= 10) return number.toFixed(1);
  return number.toFixed(2);
};

const ordinal = (rank) => {
  const number = Number(rank);
  if (!Number.isFinite(number) || number < 1) return "-";
  const lastTwo = number % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${number}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[number % 10] || "th";
  return `${number}${suffix}`;
};

const ScoreRing = ({ value, label, color, shareable = false }) => {
  const percentile = clamp(value);
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentile / 100);
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${shareable ? "h-[92px] w-[92px]" : "h-[88px] w-[88px]"}`}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 88 88">
        <g transform="rotate(-90 44 44)">
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="7"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span
        className={`relative font-extrabold tabular-nums text-white light:text-gray-900 ${shareable ? "shareable-war-score text-3xl" : "text-2xl"}`}
      >
        {label}
      </span>
    </div>
  );
};

export const TeamQualityCard = ({
  value,
  rank,
  teamCount,
  shareable = false,
}) => (
  <section
    className={`liquid-glass-strong force-dark-player-card flex h-full flex-col justify-center px-6 py-5 ${shareable ? "rounded-[28px]" : "min-h-[190px] rounded-[32px]"}`}
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <Trophy className="h-7 w-7 shrink-0 text-lime-400 light:text-lime-600" />
        <div className="min-w-0">
          <h2
            className={`font-extrabold leading-tight tracking-display text-white light:text-gray-900 ${shareable ? "shareable-icon-label text-[1.75rem]" : "text-2xl"}`}
          >
            Team Quality
          </h2>
          <p
            className={`font-medium text-gray-500 ${shareable ? "text-lg" : "text-sm"}`}
          >
            of {teamCount} teams
          </p>
        </div>
      </div>
      <ScoreRing
        value={value}
        label={ordinal(rank)}
        color="#84cc16"
        shareable={shareable}
      />
    </div>
  </section>
);

const performanceStyles = {
  offense: {
    icon: Target,
    color: "#22d3ee",
    accent: "text-cyan-300 light:text-cyan-700",
    fill: "from-cyan-500 to-sky-400",
    track: "bg-[rgba(8,51,68,0.85)]",
  },
  defense: {
    icon: Shield,
    color: "#fb7185",
    accent: "text-rose-400 light:text-rose-700",
    fill: "from-rose-500 to-pink-400",
    track: "bg-[rgba(76,5,25,0.85)]",
  },
  specialTeams: {
    color: "#c084fc",
    accent: "text-purple-300 light:text-purple-700",
    fill: "from-violet-500 to-fuchsia-400",
    track: "bg-[rgba(59,7,100,0.85)]",
  },
};

const MetricRow = ({ metric, style, stretch = false, shareable = false }) => {
  const percentile = clamp(metric.percentile);
  return (
    <div
      className={
        stretch
          ? `flex flex-1 flex-col justify-center ${shareable ? "py-2.5" : "py-2"}`
          : shareable
            ? "py-2.5"
            : "py-2"
      }
    >
      <div
        className={`${shareable ? "mb-2" : "mb-1.5"} flex items-center justify-between gap-3`}
      >
        <span
          className={`min-w-0 font-semibold text-gray-300 light:text-gray-700 ${shareable ? "text-xl" : "text-sm sm:text-base"}`}
        >
          {metric.label}
        </span>
        <div className="flex shrink-0 items-baseline gap-2.5">
          <span
            className={`tabular-nums text-gray-500 ${shareable ? "text-lg" : "text-xs"}`}
          >
            {formatValue(metric.rawValue, metric.unit)}
          </span>
          <span
            className={`inline-flex items-baseline whitespace-nowrap font-bold tabular-nums ${style.accent} ${shareable ? "text-2xl" : "text-sm sm:text-base"}`}
          >
            {ordinal(metric.rank)}
          </span>
        </div>
      </div>
      <div
        className={`h-2.5 overflow-hidden rounded-full ${style.track} ${shareable ? "" : "light:bg-slate-200"}`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.fill}`}
          style={{ width: percentile + "%" }}
        />
      </div>
    </div>
  );
};

const PanelHeader = ({ id, title, style, value, rank, shareable = false }) => {
  const Icon = style.icon;
  return (
    <div
      className={`flex items-center justify-between gap-5 border-b border-white/[0.07] light:border-slate-200 ${shareable ? "px-5 py-3" : "px-5 py-3 sm:px-6 sm:py-3.5"}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-7 w-7 shrink-0 ${style.accent}`} />
        <h2
          id={id}
          className={`font-extrabold tracking-display text-white light:text-gray-900 ${shareable ? "shareable-icon-label text-[1.75rem]" : "text-2xl sm:text-3xl"}`}
        >
          {title}
        </h2>
      </div>
      <ScoreRing
        value={value}
        label={ordinal(rank)}
        color={style.color}
        shareable={shareable}
      />
    </div>
  );
};

export const TeamPerformancePanel = ({
  type,
  title,
  quality,
  shareable = false,
}) => {
  const style = performanceStyles[type];
  return (
    <section
      className={`liquid-glass-strong force-dark-player-card flex h-full flex-col overflow-hidden ${shareable ? "rounded-[28px]" : "rounded-[32px]"}`}
      aria-labelledby={type + "-panel-heading"}
    >
      <PanelHeader
        id={type + "-panel-heading"}
        title={title}
        style={style}
        value={quality.percentile}
        rank={quality.rank}
        shareable={shareable}
      />
      <div
        className={`flex flex-1 flex-col divide-y divide-white/[0.06] light:divide-slate-200 ${shareable ? "px-5 pb-[5px]" : "px-5 pb-[5px] sm:px-7"}`}
      >
        {quality.components.map((metric) => (
          <MetricRow
            key={metric.label}
            metric={metric}
            style={style}
            stretch
            shareable={shareable}
          />
        ))}
      </div>
    </section>
  );
};

export const TeamSpecialTeamsPanel = ({ units, shareable = false }) => {
  const style = performanceStyles.specialTeams;
  return (
    <div
      className={`grid h-full min-h-0 grid-rows-2 ${shareable ? "gap-3.5" : "gap-5"}`}
    >
      {units.map((unit) => {
        const headingId = `${unit.label.toLowerCase().replaceAll(" ", "-")}-panel-heading`;
        const Icon =
          unit.label === "Power Play" ? BicepsFlexedIcon : BrickWallIcon;
        return (
          <section
            key={unit.label}
            className={`liquid-glass-strong force-dark-player-card flex min-h-0 flex-col overflow-hidden ${shareable ? "rounded-[28px]" : "rounded-[32px]"}`}
            aria-labelledby={headingId}
          >
            <div
              className={`flex items-center justify-between border-b border-white/[0.07] light:border-slate-200 ${shareable ? "gap-4 px-5 py-3" : "gap-3 px-5 py-3 sm:px-6 sm:py-3.5"}`}
            >
              <div
                className={`flex min-w-0 items-center ${shareable ? "gap-3" : "gap-2.5"}`}
              >
                <Icon
                  className={`shrink-0 ${style.accent} ${shareable ? "h-7 w-7" : "h-6 w-6"}`}
                />
                <h2
                  id={headingId}
                  className={`font-extrabold tracking-display text-white light:text-gray-900 ${shareable ? "shareable-icon-label text-[1.65rem]" : "text-xl sm:text-2xl"}`}
                >
                  {unit.label}
                </h2>
              </div>
              <span
                className={`font-extrabold tabular-nums ${style.accent} ${shareable ? "text-3xl" : "text-xl sm:text-2xl"}`}
              >
                {ordinal(unit.rank)}
              </span>
            </div>
            <div
              className={`flex min-h-0 flex-1 flex-col divide-y divide-white/[0.06] light:divide-slate-200 ${shareable ? "px-5 pb-[5px]" : "px-5 pb-[5px] sm:px-7"}`}
            >
              {unit.components.map((metric) => (
                <MetricRow
                  key={metric.label}
                  metric={metric}
                  style={style}
                  stretch
                  shareable={shareable}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
