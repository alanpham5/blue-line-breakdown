import { getOrdinal } from "utils/ordinal";

const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

export const hasDangerShotPercentiles = (stats) =>
  Array.isArray(stats) &&
  stats.length > 0 &&
  stats.every((stat) => Number.isFinite(Number(stat?.shotsAgainstPercentile)));

const BAR_SERIES = [
  {
    key: "shotsAgainstPercentile",
    short: "SA",
    name: "shots against per 60",
    text: "text-rose-400 light:text-rose-600",
    fill: "from-rose-600 via-rose-500 to-red-300 shadow-[0_0_18px_rgba(255,55,95,0.18)]",
  },
  {
    key: "value",
    short: "SV",
    name: "save percentage",
    text: "text-rose-300 light:text-rose-500",
    fill: "from-rose-600/70 via-rose-500/70 to-red-300/70 shadow-[0_0_18px_rgba(255,55,95,0.12)]",
  },
];

const sizeClasses = (shareable, compact) => {
  if (!shareable) {
    return {
      count: "text-xs sm:text-sm",
      height: "min-h-[200px]",
      width: "max-w-[96px]",
      tag: "text-[0.65rem] sm:text-xs",
      label: "text-xs sm:text-sm",
    };
  }
  return compact
    ? {
        count: "text-base",
        height: "min-h-[170px]",
        width: "max-w-[104px]",
        tag: "text-xs",
        label: "text-lg",
      }
    : {
        count: "text-xl",
        height: "min-h-[304px]",
        width: "max-w-[120px]",
        tag: "text-sm",
        label: "text-2xl",
      };
};

const percentileText = (stat) =>
  BAR_SERIES.map(
    (series) =>
      `${series.name} ${getOrdinal(clampPercent(stat[series.key]))} percentile`
  ).join(", ");

const DangerPair = ({ stat, sizes, shareable }) => {
  const label = stat.shortLabel || stat.label;
  return (
    <div className="grid min-w-0 grid-rows-[auto_1fr_auto] justify-items-center gap-2">
      <div className={`grid w-full ${sizes.width} grid-cols-2`}>
        {BAR_SERIES.map((series) => (
          <span
            key={series.key}
            className={`${sizes.count} text-center font-bold tabular-nums ${series.text}`}
            data-export-nudge={shareable ? 8 : undefined}
          >
            {clampPercent(stat[series.key]).toFixed(0)}
          </span>
        ))}
      </div>
      <div
        className={`grid h-full w-full ${sizes.height} ${sizes.width} grid-cols-2 overflow-hidden rounded-2xl bg-[rgba(112,26,46,0.4)] light:bg-slate-200`}
        role="img"
        aria-label={`${label}: ${percentileText(stat)}`}
      >
        {BAR_SERIES.map((series) => (
          <div key={series.key} className="relative h-full">
            <div
              className={`absolute inset-x-0 bottom-0 rounded-t-xl bg-gradient-to-t ${series.fill} transition-[height] duration-1000 ease-out`}
              style={{ height: `${clampPercent(stat[series.key])}%` }}
            />
          </div>
        ))}
      </div>
      <div className="w-full text-center">
        <div
          className={`grid w-full ${sizes.width} mx-auto grid-cols-2 ${sizes.tag} font-semibold uppercase tracking-wide text-gray-400 light:text-gray-500`}
        >
          {BAR_SERIES.map((series) => (
            <span key={series.key}>{series.short}</span>
          ))}
        </div>
        <p
          className={`mt-1 flex justify-center whitespace-nowrap ${sizes.label} font-bold leading-tight text-white light:text-gray-900`}
        >
          {label}
        </p>
      </div>
    </div>
  );
};

export const DangerShotPairs = ({
  stats,
  shareable = false,
  compact = false,
}) => {
  const sizes = sizeClasses(shareable, compact);

  return (
    <div className="grid flex-1 grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <DangerPair
          key={stat.key || stat.label}
          stat={stat}
          sizes={sizes}
          shareable={shareable}
        />
      ))}
    </div>
  );
};
