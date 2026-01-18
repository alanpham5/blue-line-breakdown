import React from "react";
import { PercentileBar } from "./PercentileBar";
import { playerUtils } from "../utils/playerUtils";

export const StatsCard = ({ title, icon: Icon, stats, allPercentiles, type = "offensive" }) => {
  const topStats = type === "offensive" 
    ? playerUtils.getOffensiveStats(stats, allPercentiles)
    : playerUtils.getTopStats(stats, 6);
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
      className={`liquid-glass-strong rounded-2xl p-4 sm:p-6 ${type === "offensive" ? "border-cyan-400/30" : "border-red-400/30"}`}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${colorClasses.iconBg} rounded-lg shrink-0 backdrop-blur-sm border ${type === "offensive" ? "border-cyan-400/20" : "border-red-400/20"}`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClasses.iconColor}`} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">{title}</h3>
        </div>
        <span className="text-sm text-gray-300 whitespace-nowrap">percentile vs. league</span>
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
