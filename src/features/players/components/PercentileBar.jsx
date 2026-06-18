import { Info } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { Tooltip } from "components/ui/Tooltip";
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
    type === "offensive" || type === "shotStopping"
      ? "from-cyan-500 to-sky-400"
      : "from-rose-500 to-red-400";
  const valueColor =
    type === "offensive" || type === "shotStopping"
      ? "text-cyan-300 light:text-cyan-600"
      : "text-rose-400 light:text-rose-600";
  const trackColor =
    type === "offensive" || type === "shotStopping"
      ? `bg-[rgba(20,78,98,0.56)] ${forceDark ? "" : "light:bg-slate-200"}`
      : `bg-[rgba(112,26,46,0.52)] ${forceDark ? "" : "light:bg-slate-200"}`;
  return (
    <div className="mb-4 sm:mb-5 percentile-bar-container">
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
          className={`text-sm ${!compact ? "lg:text-base" : "lg:text-xl"} font-bold shrink-0 ${valueColor} ${forceDark ? "" : ""}`}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <div
        className={`w-full h-2.5 overflow-hidden rounded-full ${trackColor} backdrop-blur-sm`}
      >
        <div
          className={`h-2.5 rounded-full bg-gradient-to-r ${color} percentile-bar-fill ${type === "offensive" || type === "shotStopping" ? "shadow-[0_0_10px_rgba(18,223,246,0.16)]" : "shadow-[0_0_10px_rgba(255,55,95,0.18)]"}`}
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
};
