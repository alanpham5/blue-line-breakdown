import React, { useState } from "react";
import { PercentileBar } from "./PercentileBar";
import { playerUtils } from "../utils/playerUtils";
import { Info } from "lucide-react";

export const StatsCard = ({
  title,
  icon: Icon,
  stats,
  allPercentiles,
  type = "offensive",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const topStats = playerUtils.getTopStats(stats, 6);
  const colorClasses =
    type === "offensive"
      ? {
          gradient: "from-blue-900/30 to-cyan-900/30",
          border: "border-blue-700/50",
          iconBg: "bg-blue-500/20",
          iconColor: "text-blue-400",
        }
      : {
          gradient: "from-red-900/30 to-orange-900/30",
          border: "border-red-700/50",
          iconBg: "bg-red-500/20",
          iconColor: "text-red-400",
        };

  return (
    <div
      className={`liquid-glass-strong rounded-2xl p-4 sm:p-6 liquid-glass-animate ${type === "offensive" ? "border-cyan-400/30" : "border-red-400/30"}`}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 ${colorClasses.iconBg} rounded-lg shrink-0 backdrop-blur-sm border ${type === "offensive" ? "border-cyan-400/20" : "border-red-400/20"}`}
          >
            <Icon
              className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClasses.iconColor}`}
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">{title}</h3>
        </div>
        <div className="relative flex items-center gap-2">
          <span className="text-sm text-gray-300 whitespace-nowrap">
            percentile vs. league
          </span>
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Info about percentile calculation"
          >
            <Info size={16} />
          </button>
          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg text-xs text-gray-200 z-10 shadow-lg pointer-events-none">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-cyan-400">
                    Percentile Adjusted:
                  </span>{" "}
                  Values are normalized to show where this player ranks compared
                  to all NHL players (0-100th percentile).
                </div>
                <div>
                  <span className="font-semibold text-cyan-400">
                    Ice Time Adjusted:
                  </span>{" "}
                  Statistics are adjusted for ice time to provide fair
                  comparisons across players with different usage.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        {topStats.map((stat, idx) => (
          <PercentileBar
            key={idx}
            label={stat.name}
            value={stat.value}
            type={type}
            statKey={stat.key}
          />
        ))}
      </div>
    </div>
  );
};
