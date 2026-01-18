import React from "react";

export const PercentileBar = ({ label, value, type = "offensive" }) => {
  const color =
    type === "offensive"
      ? "from-blue-500 to-cyan-400"
      : "from-red-500 to-orange-400";

  return (
    <div className="mb-3 sm:mb-4">
      <div className="flex justify-between items-center mb-1 gap-2">
        <span className="text-xs sm:text-sm font-medium text-gray-300 truncate min-w-0">{label}</span>
        <span className="text-xs sm:text-sm font-bold text-white shrink-0">{value}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden">
        <div
          className={`h-2 sm:h-2.5 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
