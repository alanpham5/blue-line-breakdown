import { useState, useEffect } from "react";
import { Info, Trophy, User } from "lucide-react";
import { Tooltip } from "components/ui/Tooltip";
export const WarPercentileCard = ({
  warPercentile,
  role,
  showInfo = true,
  tooltipTitle = "Season Observed Value",
  tooltipText = "Measures a player's total contribution to team wins in a given season. The value is expressed as a percentile to provide a standardized comparison across all players.",
}) => {
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
      className="liquid-glass-strong liquid-glass-animate flex h-full w-full flex-col rounded-[32px] p-4 sm:p-5"
      style={{
        position: "static",
        overflow: "visible",
      }}
    >
      <div className="flex w-full min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <Trophy className="h-4 w-4 shrink-0 text-[#7dcb48] sm:h-5 sm:w-5" />
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <h3 className="shrink-0 whitespace-nowrap text-[1.2rem] font-bold leading-snug tracking-display text-white light:text-gray-900 sm:text-[1.45rem]">
            Impact Rating
          </h3>
          {showInfo && (
            <Tooltip
              id="observed-value"
              position="top"
              width="w-56 max-w-xs"
              content={
                <div className="space-y-2">
                  <div className="font-semibold text-[#7dcb48]">
                    {tooltipTitle}
                  </div>
                  <div>{tooltipText}</div>
                </div>
              }
            >
              <button
                className="relative -top-1 ml-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700"
                aria-label={`Info about ${tooltipTitle.toLowerCase()}`}
              >
                <Info className="h-[13px] w-[13px] sm:h-4 sm:w-4" />
              </button>
            </Tooltip>
          )}
        </div>
        <div className="relative shrink-0 text-right">
          <div className="relative inline-flex items-center justify-center">
            <svg
              className="h-20 w-20 -rotate-90 transform sm:h-[5.5rem] sm:w-[5.5rem]"
              viewBox="0 0 44 44"
            >
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                className="stroke-[rgba(103,120,90,0.42)] light:stroke-slate-200"
                strokeWidth="3.5"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                className="stroke-[#7dcb48] transition-all duration-[1200ms] ease-out"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={isAnimated ? dashOffset : circumference}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[1.38rem] font-bold tracking-display text-white light:text-gray-900 sm:text-[1.48rem]">
                {displayValue}
              </div>
            </div>
          </div>
        </div>
      </div>
      {role && (
        <div className="mt-2 flex min-w-0 items-center justify-between gap-3 border-t border-white/10 pt-2.5 light:border-slate-200 sm:mt-3 sm:pt-3">
          <div className="flex shrink-0 items-center gap-2 text-gray-400 light:text-gray-500">
            <User className="h-4 w-4 text-sky-300 light:text-sky-600" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">
              Role
            </span>
          </div>
          <div className="min-w-0 text-right text-sm font-semibold leading-tight text-white light:text-gray-900 sm:text-[0.95rem]">
            {role}
          </div>
        </div>
      )}
    </div>
  );
};
