import React, { useState } from "react";
import { Info } from "lucide-react";
import { playerUtils } from "../../utils/playerUtils";

export const PercentileBar = ({
  label,
  value,
  type = "offensive",
  statKey,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const explanation = statKey ? playerUtils.getStatExplanation(statKey) : null;
  const color =
    type === "offensive"
      ? "from-blue-500 to-cyan-400"
      : "from-red-500 to-orange-400";

  return (
    <div className="mb-3 sm:mb-4 percentile-bar-container">
      <div className="flex justify-between items-center mb-1 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-xs sm:text-sm font-medium text-gray-300 truncate">
            {label}
          </span>
          {explanation && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="shrink-0 transition-colors text-gray-400 hover:text-gray-200"
                aria-label="Stat explanation"
              >
                <Info size={14} />
              </button>
              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-2 w-56 sm:w-64 p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg text-xs text-gray-200 z-10 shadow-lg pointer-events-none">
                  <div className="space-y-2">
                    <div className="whitespace-pre-line">{explanation}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-xs sm:text-sm font-bold text-white shrink-0">
          {value.toFixed(1)}
        </span>
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
