import { useState, useEffect } from "react";
import { Info, Trophy } from "lucide-react";
import { Tooltip } from "../../components/Tooltip";

export const WarPercentileCard = ({ warPercentile, showInfo = true }) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const clampedPercent =
    typeof warPercentile === "number"
      ? Math.min(100, Math.max(0, warPercentile))
      : 0;

  const displayValue =
    typeof warPercentile === "number" && warPercentile
      ? warPercentile.toFixed(1)
      : 0;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clampedPercent / 100);

  return (
    <div
      className="liquid-glass-strong rounded-2xl h-full flex p-4 sm:p-5 border-cyan-400/30 liquid-glass-animate"
      style={{ position: "static", overflow: "visible" }}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 bg-cyan-500/20 rounded-lg shrink-0 backdrop-blur-sm border border-cyan-400/20">
            <Trophy className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white light:text-gray-900">
                Observed Value
              </h3>
              {showInfo && (
                <Tooltip
                  id="observed-value"
                  position="top"
                  width="w-56 max-w-xs"
                  content={
                    <div className="space-y-2">
                      <div className="font-semibold text-cyan-400 light:text-cyan-600">
                        Season Observed Value
                      </div>
                      <div>
                        Measures a player’s total contribution to team wins in a
                        given season. The value is expressed as a percentile to
                        provide a standardized comparison across all players.
                      </div>
                    </div>
                  }
                >
                  <button
                    className="shrink-0 text-gray-400 hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700 transition-colors"
                    aria-label="Info about wins above replacement"
                  >
                    <Info size={16} />
                  </button>
                </Tooltip>
              )}
            </div>
            <div className="text-xs text-gray-300 light:text-gray-600 mt-1">
              percentile vs. league
            </div>
          </div>
        </div>
        <div className="text-right shrink-0 relative self-end sm:self-auto">
          <div className="relative inline-flex items-center justify-center">
            <svg
              className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90"
              viewBox="0 0 44 44"
            >
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                className="stroke-gray-800/40 light:stroke-gray-300"
                strokeWidth="3"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                className="stroke-cyan-400 transition-all duration-[1200ms] ease-out"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={isAnimated ? dashOffset : circumference}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white light:text-gray-900">
                  {displayValue}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
