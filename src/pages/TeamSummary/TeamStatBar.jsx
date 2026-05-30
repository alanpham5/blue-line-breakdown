import React from "react";

export const TeamStatBar = ({
  label,
  rawValue,
  percentile,
  type = "offensive",
}) => {
  let color = "from-cyan-500 to-sky-400";
  let valueColor = "text-cyan-300 light:text-cyan-600";
  let trackColor = "bg-[rgba(20,78,98,0.56)] light:bg-slate-200";
  let shadowColor = "shadow-[0_0_10px_rgba(18,223,246,0.16)]";

  if (type === "defensive") {
    color = "from-rose-500 to-red-400";
    valueColor = "text-rose-400 light:text-rose-600";
    trackColor = "bg-[rgba(112,26,46,0.52)] light:bg-slate-200";
    shadowColor = "shadow-[0_0_10px_rgba(255,55,95,0.18)]";
  } else if (type === "aggressiveness" || type === "pace") {
    color = "from-amber-500 to-orange-400";
    valueColor = "text-amber-300 light:text-amber-600";
    trackColor = "bg-[rgba(120,80,20,0.52)] light:bg-slate-200";
    shadowColor = "shadow-[0_0_10px_rgba(245,158,11,0.18)]";
  }

  return (
    <div className="mb-4 sm:mb-5 percentile-bar-container">
      <div className="flex justify-between items-center mb-1 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-sm font-medium lg:text-base text-gray-300 truncate light:text-gray-600">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm lg:text-base font-bold ${valueColor}`}>
            {percentile.toFixed(1)}
          </span>
        </div>
      </div>
      <div
        className={`w-full h-2.5 overflow-hidden rounded-full ${trackColor} backdrop-blur-sm`}
      >
        <div
          className={`h-2.5 rounded-full bg-gradient-to-r ${color} percentile-bar-fill ${shadowColor}`}
          style={{ width: `${Math.min(100, Math.max(0, percentile))}%` }}
        />
      </div>
    </div>
  );
};
