import React from "react";

export const PercentileBar = ({ label, value, type = "offensive" }) => {
  const color =
    type === "offensive"
      ? "from-blue-500 to-cyan-400"
      : "from-red-500 to-orange-400";

  return (
    <div className="mb-3 sm:mb-4 percentile-bar-container">
      <div className="flex justify-between items-center mb-1 gap-2">
        <span className="text-xs sm:text-sm font-medium text-gray-300 truncate min-w-0">{label}</span>
        <span className="text-xs sm:text-sm font-bold text-white shrink-0">{value}%</span>
      </div>
      <div className="w-full bg-gray-800/40 backdrop-blur-sm rounded-full h-2 sm:h-2.5 overflow-hidden border border-gray-700/30">
        <div
          className={`h-2 sm:h-2.5 rounded-full bg-gradient-to-r ${color} percentile-bar-fill shadow-lg ${type === "offensive" ? "shadow-cyan-500/30" : "shadow-red-500/30"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
