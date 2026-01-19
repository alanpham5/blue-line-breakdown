import { useState } from "react";
import { Info, Trophy } from "lucide-react";

export const WarPercentileCard = ({ warPercentile }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (warPercentile === null || warPercentile === undefined) return null;

  const clampedPercent =
    typeof warPercentile === "number"
      ? Math.min(100, Math.max(0, warPercentile))
      : 0;

  const displayValue =
    typeof warPercentile === "number"
      ? Number.isInteger(warPercentile)
        ? warPercentile.toString()
        : warPercentile.toFixed(1)
      : String(warPercentile);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clampedPercent / 100);

  return (
    <div
      className="liquid-glass-strong rounded-2xl h-full flex p-4 sm:p-5 border-cyan-400/30"
      style={{ position: "static", overflow: "visible" }}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 bg-cyan-500/20 rounded-lg shrink-0 backdrop-blur-sm border border-cyan-400/20">
            <Trophy className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold">WAR</h3>
              <div
                className="relative z-[10000]"
                style={{ overflow: "visible" }}
              >
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label="Info about wins above replacement"
                >
                  <Info size={16} />
                </button>
                {showTooltip && (
                  <div
                    className="absolute left-0 bottom-full mb-2 w-56 max-w-xs p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg text-xs text-gray-200 z-[9999] shadow-lg"
                    style={{ pointerEvents: "none" }}
                  >
                    <div className="space-y-2">
                      <div className="font-semibold text-cyan-400">
                        Wins Above Replacement (WAR)
                      </div>
                      <div>
                        WAR estimates the number of wins a player contributes
                        compared to a replacement-level player. This percentile
                        shows how the player ranks relative to the league, based
                        on normalized and ice-time-adjusted performance.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-300 mt-1">
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
                className="stroke-gray-800/40"
                strokeWidth="3"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                className="stroke-cyan-400"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white">
                  {displayValue}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
