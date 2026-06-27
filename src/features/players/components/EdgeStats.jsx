import { playerUtils } from "utils/playerUtils";
import { Gauge } from "lucide-react";

export const EdgeStats = ({ edgeValues, edgePercentiles }) => {
  if (!edgeValues || !edgePercentiles || Object.keys(edgeValues).length === 0)
    return null;

  const metricsOrder = [
    "TOP_SPEED",
    "SPEED_BURSTS",
    "SHOT_SPEED",
    "DIST_SKATED",
    "DIST_GAME",
    "OZONE",
  ];

  const formatValue = (key, val) => {
    if (val === undefined || val === null) return "-";
    const num = Number(val);
    if (isNaN(num)) return val;

    switch (key) {
      case "TOP_SPEED":
      case "SHOT_SPEED":
      case "DIST_SKATED":
      case "DIST_GAME":
        return num.toFixed(1);
      case "SPEED_BURSTS":
        return num.toLocaleString();
      case "OZONE":
        const pct = num < 1.0 ? num * 100 : num;
        return pct.toFixed(1);
      default:
        return num;
    }
  };

  const getPercentileStyle = (percentile) => {
    if (percentile == null) return {};
    const hue = Math.max(0, Math.min(120, percentile * 1.2));
    return {
      "--percentile-hue": `${hue}deg`,
    };
  };

  const getMetricLabel = (key, isShort) => {
    const baseName = isShort
      ? playerUtils.formatStatAbbr(key)
      : playerUtils.formatStatName(key);
    switch (key) {
      case "TOP_SPEED":
      case "SHOT_SPEED":
        return `${baseName} (mph)`;
      case "DIST_SKATED":
      case "DIST_GAME":
        return `${baseName} (mi)`;
      case "OZONE":
        return `${baseName} (%)`;
      default:
        return baseName;
    }
  };

  return (
    <div className="liquid-glass-strong liquid-glass-animate rounded-[32px] p-5 sm:p-6 mt-4 sm:mt-6">
      <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Gauge className="h-6 w-6 shrink-0 text-emerald-300 light:text-emerald-600" />
          <h3 className="text-xl sm:text-2xl font-bold tracking-display text-white light:text-gray-900 whitespace-nowrap">
            NHL EDGE
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 divide-white/10 light:divide-slate-200 text-center gap-y-4 sm:gap-y-0 sm:divide-x">
        {metricsOrder.map((statKey) => {
          const val = edgeValues[statKey];
          const percentile = edgePercentiles[statKey];
          if (
            val === undefined ||
            val === null ||
            percentile === undefined ||
            percentile === null
          ) {
            return null;
          }

          return (
            <div
              key={statKey}
              className="flex flex-col items-center justify-start px-1 sm:px-2"
            >
              <div className="text-[0.65rem] sm:text-xs text-gray-400 light:text-gray-500 font-medium font-sans leading-tight min-h-[2rem] flex items-end justify-center text-center">
                <span className="hidden lg:inline">
                  {getMetricLabel(statKey, false)}
                </span>
                <span className="lg:hidden">
                  {getMetricLabel(statKey, true)}
                </span>
              </div>
              <div
                className="text-lg sm:text-2xl font-semibold leading-tight tabular-nums whitespace-nowrap percentile-colored mt-0.5"
                style={getPercentileStyle(percentile)}
              >
                {formatValue(statKey, val)}
              </div>
              <div className="text-[0.65rem] sm:text-[0.75rem] text-gray-500 light:text-gray-400 font-normal mt-0.5">
                {percentile.toFixed(1)} %ile
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
