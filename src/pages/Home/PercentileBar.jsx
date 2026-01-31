import { Info } from "lucide-react";
import { playerUtils } from "../../utils/playerUtils";
import { Tooltip } from "../../components/Tooltip";

export const PercentileBar = ({
  label,
  value,
  type = "offensive",
  statKey,
  showInfo = true,
  compact = false,
  forceDark = false,
}) => {
  const explanation = statKey ? playerUtils.getStatExplanation(statKey) : null;
  const color =
    type === "offensive"
      ? "from-blue-500 to-cyan-400"
      : "from-red-500 to-orange-400";

  return (
    <div className="mb-3 sm:mb-4 percentile-bar-container">
      <div className="flex justify-between items-center mb-1 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            className={`text-sm font-medium ${!compact ? "lg:text-base" : "lg:text-xl font-semibold"} text-gray-300 truncate ${forceDark ? "" : "light:text-gray-600"}`}
          >
            {label}
          </span>
          {explanation && showInfo && (
            <Tooltip
              id={label}
              content={
                <div className="space-y-2">
                  <div className="whitespace-pre-line">{explanation}</div>
                </div>
              }
              position="top"
              width="w-56 sm:w-64"
              forceDark={forceDark}
            >
              <button
                className={`shrink-0 transition-colors text-gray-400 hover:text-gray-200 ${forceDark ? "" : "light:text-gray-500 light:hover:text-gray-700"}`}
                aria-label="Stat explanation"
              >
                <Info size={14} />
              </button>
            </Tooltip>
          )}
        </div>
        <span
          className={`text-sm ${!compact ? "lg:text-base" : "lg:text-xl"} font-bold text-white shrink-0 ${forceDark ? "" : "light:text-gray-900"}`}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <div
        className={`w-full bg-gray-800/40 backdrop-blur-sm rounded-full h-2 sm:h-2.5 overflow-hidden border border-gray-700/30 ${forceDark ? "" : "light:bg-gray-200/80 light:border-gray-300"}`}
      >
        <div
          className={`h-2 sm:h-2.5 rounded-full bg-gradient-to-r ${color} percentile-bar-fill shadow-lg ${type === "offensive" ? "shadow-cyan-500/30" : "shadow-red-500/30"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
