import { Contact, Shield, Target, Trophy } from "lucide-react";

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

const formatValue = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  if (Math.abs(number) >= 10) return number.toFixed(1);
  return number.toFixed(2);
};

const formatIdentityValue = (scale) => {
  const score = Math.round(clamp(scale.score));
  if (score === 50) return { percentage: "50-50", label: "" };
  if (score > 50) {
    return { percentage: `${score}%`, label: scale.rightLabel };
  }
  return { percentage: `${100 - score}%`, label: scale.leftLabel };
};

const ScoreRing = ({ value, color, shareable = false }) => {
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
        {Math.round(percentile)}
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
        <h2
          className={`font-extrabold leading-tight tracking-display text-white light:text-gray-900 ${shareable ? "shareable-icon-label text-[1.75rem]" : "text-2xl"}`}
        >
          Team Quality
        </h2>
      </div>
      <ScoreRing value={value} color="#84cc16" shareable={shareable} />
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3 light:border-slate-200">
      <span
        className={`font-semibold uppercase tracking-[0.1em] text-gray-500 ${shareable ? "text-base" : "text-xs"}`}
      >
        Season Rank
      </span>
      <span
        className={`font-extrabold text-white light:text-gray-900 ${shareable ? "text-2xl" : "text-xl"}`}
      >
        #{rank}
        <span
          className={`ml-1 font-medium text-gray-500 ${shareable ? "text-lg" : "text-sm"}`}
        >
          of {teamCount}
        </span>
      </span>
    </div>
  </section>
);

const IdentityScaleBar = ({ scale }) => {
  const markerPosition = Math.min(97, Math.max(3, clamp(scale.score)));
  const identityValue = formatIdentityValue(scale);
  return (
    <div className="border-t border-white/[0.06] px-5 py-4 first:border-t-0 light:border-slate-200">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-bold text-white light:text-gray-900">
          {scale.label}
        </h3>
        <span className="shrink-0 text-sm font-extrabold tabular-nums text-green-400 light:text-green-700">
          {identityValue.percentage}
          {identityValue.label && (
            <span className="ml-1">{identityValue.label}</span>
          )}
        </span>
      </div>
      <div className="relative mt-3 h-2 w-full rounded-full bg-white/[0.08] shadow-inner light:bg-slate-200">
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400 shadow-[0_4px_14px_rgba(74,222,128,0.4)] light:bg-green-600"
          style={{ left: markerPosition + "%" }}
        />
      </div>
      <div className="mt-2 flex justify-between gap-3 text-xs font-semibold text-gray-400 light:text-gray-600">
        <span>{scale.leftLabel}</span>
        <span>{scale.rightLabel}</span>
      </div>
    </div>
  );
};

export const TeamIdentityPanel = ({ identity, shareable = false }) => (
  <section
    className={`liquid-glass-strong force-dark-player-card overflow-hidden ${shareable ? "rounded-[28px]" : "h-full rounded-[32px]"}`}
    aria-labelledby="team-identity-heading"
  >
    <div
      className={`flex items-center border-b border-white/[0.07] light:border-slate-200 ${shareable ? "px-6 py-3.5" : "px-5 py-5 sm:px-7 sm:py-6"}`}
    >
      <div className="flex items-center gap-3">
        <Contact className="h-7 w-7 shrink-0 text-green-400 light:text-green-700" />
        <h2
          id="team-identity-heading"
          className={`font-extrabold tracking-display text-white light:text-gray-900 ${shareable ? "shareable-icon-label text-[1.75rem]" : "text-2xl sm:text-3xl"}`}
        >
          Team Identity
        </h2>
      </div>
    </div>

    {!shareable && (
      <div className="flex flex-col sm:hidden">
        {identity.map((scale) => (
          <IdentityScaleBar key={scale.id} scale={scale} />
        ))}
      </div>
    )}

    <div
      className={
        shareable
          ? "grid h-[310px] grid-cols-7"
          : "hidden flex-wrap justify-center sm:flex lg:h-[320px]"
      }
    >
      {identity.map((scale) => {
        const score = clamp(scale.score);
        const markerPosition = Math.min(97, Math.max(3, score));
        const identityValue = formatIdentityValue(scale);
        if (shareable) {
          return (
            <div
              key={scale.id}
              className="grid min-w-0 grid-rows-[24px_20px_24px_20px_96px_20px] items-center justify-items-center gap-y-2.5 border-l border-white/[0.06] px-3 py-7 first:border-l-0"
            >
              <h3 className="text-center text-xl font-bold leading-none text-white">
                {scale.label}
              </h3>
              <span className="text-center text-xl font-bold leading-none tabular-nums text-green-400">
                {identityValue.percentage}
              </span>
              <span className="text-center text-xl font-bold leading-none text-green-400">
                {identityValue.label || "Balanced"}
              </span>
              <span className="text-center text-base font-medium leading-none text-gray-300">
                {scale.rightLabel}
              </span>
              <div className="relative h-24 w-2.5 shrink-0 rounded-full bg-white/[0.08]">
                <span
                  className="absolute left-1/2 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full bg-green-400 shadow-[0_4px_14px_rgba(74,222,128,0.4)]"
                  style={{ bottom: markerPosition + "%" }}
                />
              </div>
              <span className="text-center text-base font-medium leading-none text-gray-300">
                {scale.leftLabel}
              </span>
            </div>
          );
        }
        return (
          <div
            key={scale.id}
            className="flex min-h-[320px] w-1/4 min-w-0 flex-col items-center border-l border-t border-white/[0.06] px-3 pb-2 pt-5 first:border-l-0 light:border-slate-200 lg:min-h-0 lg:w-[14.285714%] lg:border-t-0"
          >
            <h3 className="flex h-10 items-center justify-center text-center text-sm font-bold leading-tight text-white light:text-gray-900 sm:text-base">
              {scale.label}
            </h3>
            <div className="mt-1 flex h-12 flex-col items-center justify-center gap-0.5 text-center text-sm font-extrabold leading-tight tabular-nums text-green-400 light:text-green-700 sm:text-base">
              <span>{identityValue.percentage}</span>
              {identityValue.label && <span>{identityValue.label}</span>}
            </div>
            <div className="mt-2 flex flex-col items-center">
              <span className="flex h-6 items-center justify-center text-center text-xs font-semibold leading-tight text-gray-400 light:text-gray-600">
                {scale.rightLabel}
              </span>
              <div className="relative my-2 h-32 w-2 shrink-0 rounded-full bg-white/[0.08] shadow-inner light:bg-slate-200">
                <span
                  className="absolute left-1/2 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-green-400 shadow-[0_4px_14px_rgba(74,222,128,0.4)] light:bg-green-600"
                  style={{ bottom: markerPosition + "%" }}
                />
              </div>
              <span className="flex h-6 items-center justify-center text-center text-xs font-semibold leading-tight text-gray-400 light:text-gray-600">
                {scale.leftLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

const performanceStyles = {
  offense: {
    icon: Target,
    color: "#22d3ee",
    accent: "text-cyan-300 light:text-cyan-700",
    fill: "from-cyan-500 to-sky-400",
  },
  defense: {
    icon: Shield,
    color: "#fb7185",
    accent: "text-rose-400 light:text-rose-700",
    fill: "from-rose-500 to-pink-400",
  },
  specialTeams: {
    color: "#c084fc",
    accent: "text-purple-300 light:text-purple-700",
    fill: "from-violet-500 to-fuchsia-400",
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
            {formatValue(metric.rawValue)}
          </span>
          <span
            className={`inline-flex items-baseline whitespace-nowrap font-bold tabular-nums ${style.accent} ${shareable ? "text-2xl" : "text-sm sm:text-base"}`}
          >
            {Math.round(percentile)}
            <span
              className={`ml-1 font-semibold tracking-wide ${shareable ? "text-[15px]" : "text-[9px] sm:text-[10px]"}`}
            >
              Pctle
            </span>
          </span>
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06] light:bg-slate-200">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.fill}`}
          style={{ width: percentile + "%" }}
        />
      </div>
    </div>
  );
};

const PanelHeader = ({ id, title, style, value, shareable = false }) => {
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
      <ScoreRing value={value} color={style.color} shareable={shareable} />
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
                {Math.round(unit.percentile)}
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
