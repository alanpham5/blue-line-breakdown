import { Info, PieChart } from "lucide-react";
import { Tooltip } from "components/ui/Tooltip";

const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const tendencyColors = {
  Shoot: {
    start: "#a8eaff",
    middle: "#32ade6",
    end: "#007aff",
  },
  "Offensive Buildup": {
    start: "#dab9ff",
    middle: "#af52de",
    end: "#5856d6",
  },
  "Physical Pressure": {
    start: "#ffe57a",
    middle: "#ffcc00",
    end: "#ff9500",
  },
  "Shot Blocking": {
    start: "#a7f3d0",
    middle: "#34c759",
    end: "#078844",
  },
  "Puck Freeze": {
    start: "#b7efff",
    middle: "#5ac8fa",
    end: "#007aff",
  },
  Rebounds: {
    start: "#ffe6a3",
    middle: "#ff9f0a",
    end: "#ff6b00",
  },
};

const fallbackColors = [
  tendencyColors.Shoot,
  tendencyColors["Offensive Buildup"],
  tendencyColors["Physical Pressure"],
  tendencyColors["Shot Blocking"],
];

const getOrdinal = (value) => {
  const rounded = Math.round(value);
  const mod100 = rounded % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${rounded}th`;
  if (rounded % 10 === 1) return `${rounded}st`;
  if (rounded % 10 === 2) return `${rounded}nd`;
  if (rounded % 10 === 3) return `${rounded}rd`;
  return `${rounded}th`;
};

const polarPoint = (radius, angle) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 110 + radius * Math.sin(radians),
    y: 110 - radius * Math.cos(radians),
  };
};

const describeWedge = (radius, startAngle, endAngle) => {
  const safeRadius = Math.max(0.01, radius);
  const start = polarPoint(safeRadius, startAngle);
  const end = polarPoint(safeRadius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    "M 110 110",
    `L ${start.x} ${start.y}`,
    `A ${safeRadius} ${safeRadius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
};

export const PlayerTendenciesCard = ({
  tendencies,
  showInfo = true,
  forceDark = false,
  shareable = false,
}) => {
  const visibleTendencies = tendencies.slice(0, 4);
  const totalActions = visibleTendencies.reduce(
    (total, tendency) => total + Math.max(0, Number(tendency.percentage) || 0),
    0
  );
  const offensiveActionShare = visibleTendencies
    .slice(0, 2)
    .reduce(
      (total, tendency) =>
        total + Math.max(0, Number(tendency.percentage) || 0),
      0
    );
  const offensiveArc =
    totalActions > 0 ? (offensiveActionShare / totalActions) * 360 : 180;
  const legendTendencies = visibleTendencies.map((tendency, index) => ({
    ...tendency,
    colors: tendencyColors[tendency.label] || fallbackColors[index],
    gradientId: `tendency-gradient-${index}`,
  }));
  const chartOrder =
    legendTendencies.length === 4
      ? [
          legendTendencies[0],
          legendTendencies[1],
          legendTendencies[3],
          legendTendencies[2],
        ]
      : legendTendencies;
  let currentAngle = -offensiveArc / 2;
  const chartTendencies = chartOrder.map((tendency) => {
    const angularSize =
      totalActions > 0
        ? (Math.max(0, Number(tendency.percentage) || 0) / totalActions) * 360
        : 360 / visibleTendencies.length;
    const chartTendency = {
      ...tendency,
      startAngle: currentAngle,
      endAngle: currentAngle + angularSize,
    };
    currentAngle += angularSize;
    return chartTendency;
  });

  return (
    <section
      className={`liquid-glass-strong liquid-glass-animate flex h-full flex-col rounded-[32px] ${shareable ? "p-6" : "p-5 sm:p-6"} ${forceDark ? "force-dark-player-card" : ""}`}
    >
      <div className={`${shareable ? "mb-3" : "mb-5"} flex items-start justify-between gap-3`}>
        <div className="flex min-w-0 items-center gap-2">
          <PieChart className={`${shareable ? "h-8 w-8" : "h-6 w-6"} shrink-0 text-violet-300 light:text-violet-600`} />
          <div>
            <h3 className={`${shareable ? "text-3xl" : "text-xl sm:text-2xl"} font-bold tracking-display text-white light:text-gray-900`}>
              Tendencies
            </h3>
            {!shareable && (
              <p className="mt-0.5 text-xs text-gray-400 light:text-gray-500">
                angle = event share · radius = percentile
              </p>
            )}
          </div>
        </div>
        {showInfo && (
          <Tooltip
            id="player-tendencies"
            position="bottom"
            width="w-64 sm:w-72"
            content={
              <div className="space-y-2">
                <div className="font-semibold text-violet-300 light:text-violet-600">
                  How to read this chart
                </div>
                <div>
                  A wider slice means the action happens more often. Its reach
                  from the center toward the outer ring shows the player&apos;s
                  league percentile. Each action keeps a consistent color.
                </div>
              </div>
            }
          >
            <button
              className="shrink-0 text-gray-400 transition-colors hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700"
              aria-label="Info about player tendencies"
            >
              <Info className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>

      <div
        className={`grid flex-1 items-center ${shareable ? "grid-cols-[250px_minmax(0,1fr)] gap-5" : "gap-6 sm:grid-cols-[minmax(210px,0.8fr)_minmax(280px,1.2fr)] lg:gap-10"}`}
      >
        <div className="flex justify-center">
          <svg
            className={`aspect-square w-full ${shareable ? "max-w-[250px]" : "max-w-[280px]"} overflow-visible drop-shadow-[0_18px_28px_rgba(0,0,0,0.24)]`}
            viewBox="0 0 220 220"
            role="img"
            aria-label={chartTendencies
              .map(
                (tendency) =>
                  `${tendency.label}: ${tendency.percentage}% of actions, ${getOrdinal(tendency.percentile)} league percentile`
              )
              .join(". ")}
          >
            <defs>
              <radialGradient id="tendency-backdrop" cx="32%" cy="24%" r="88%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.13" />
                <stop offset="58%" stopColor="#94a3b8" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.2" />
              </radialGradient>
              {chartTendencies.map((tendency) => (
                <linearGradient
                  key={tendency.gradientId}
                  id={tendency.gradientId}
                  x1="12%"
                  y1="5%"
                  x2="88%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={tendency.colors.start} />
                  <stop offset="52%" stopColor={tendency.colors.middle} />
                  <stop offset="100%" stopColor={tendency.colors.end} />
                </linearGradient>
              ))}
            </defs>
            <circle
              cx="110"
              cy="110"
              r="92"
              fill="url(#tendency-backdrop)"
              className="stroke-white/10 light:stroke-slate-300"
              strokeWidth="1"
            />

            {chartTendencies.map((tendency) => (
              <path
                key={tendency.label}
                d={describeWedge(
                  92 * (clampPercent(tendency.percentile) / 100),
                  tendency.startAngle,
                  tendency.endAngle
                )}
                fill={`url(#${tendency.gradientId})`}
                className="transition-all duration-1000 ease-out"
              />
            ))}
          </svg>
        </div>

        <div className={`grid ${shareable ? "grid-cols-1 gap-2" : "gap-2.5 lg:grid-cols-2"}`}>
          {legendTendencies.map((tendency) => (
            <div
              key={tendency.label}
              className={`relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.025] light:border-slate-200 light:bg-white/55 ${shareable ? "px-5 py-2" : "px-4 py-2.5"}`}
            >
              <span
                className="absolute inset-y-2 left-2.5 w-1 rounded-full shadow-[0_0_12px_currentColor]"
                style={{
                  backgroundColor: tendency.colors.middle,
                  color: tendency.colors.middle,
                }}
              />
              <div className="min-w-0 text-center">
                <p className={`${shareable ? "text-base" : "text-sm"} truncate text-center font-semibold text-gray-200 light:text-gray-800`}>
                  {tendency.label}
                </p>
                <div className={`${shareable ? "mt-1" : "mt-1.5"} grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] divide-x divide-white/[0.08] light:divide-slate-200`}>
                  <div className={`${shareable ? "flex-col gap-0" : "items-baseline gap-1"} flex min-w-0 justify-center px-2 text-center`}>
                    <span className={`${shareable ? "text-lg" : "text-base"} font-bold tabular-nums text-white light:text-gray-900`}>
                      {tendency.percentage}%
                    </span>
                    <span className={`${shareable ? "text-[0.66rem] leading-tight" : "text-[0.62rem]"} font-semibold uppercase tracking-[0.06em] text-gray-500 light:text-gray-500`}>
                      events
                    </span>
                  </div>
                  <div className={`${shareable ? "flex-col gap-0" : "items-baseline gap-1"} flex min-w-0 justify-center px-2 text-center`}>
                    <span className={`${shareable ? "text-lg" : "text-base"} font-bold tabular-nums text-white light:text-gray-900`}>
                      {Math.round(tendency.percentile)}
                    </span>
                    <span className={`${shareable ? "text-[0.66rem] leading-tight" : "text-[0.62rem]"} font-semibold uppercase tracking-[0.06em] text-gray-500 light:text-gray-500`}>
                      Percentile
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
