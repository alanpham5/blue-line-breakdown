import React, { useState } from "react";
import { Info } from "lucide-react";
import { playerUtils } from "../utils/playerUtils";

export const PercentileBar = ({ label, value, type = "offensive", statKey }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isInverted = statKey && playerUtils.isInvertedStat(statKey);
  const color =
    type === "offensive"
      ? "from-blue-500 to-cyan-400"
      : "from-red-500 to-orange-400";

  return (
    <div className="mb-3 sm:mb-4 percentile-bar-container">
      <div className="flex justify-between items-center mb-1 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-xs sm:text-sm font-medium text-gray-300 truncate">{label}</span>
          {isInverted && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Info"
              >
                <Info size={14} />
              </button>
              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-2 w-56 sm:w-64 p-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg text-xs text-gray-200 z-10 shadow-lg pointer-events-none">
                  {statKey === 'I_F_giveaways' ? (
                    <>
                      A high percentile means giveaways occur less frequently. However, this stat may be misleading since players who handle the puck more tend to have more giveaways.
                    </>
                  ) : (
                    <>
                      A high percentile means these events occur less frequently, which is better for this stat.
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
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
