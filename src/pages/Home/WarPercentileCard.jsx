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
      className="liquid-glass-strong liquid-glass-animate flex h-full rounded-[32px] p-5 sm:p-6"
      style={{ position: "static", overflow: "visible" }}
    >
      <div className="flex w-full min-w-0 items-center gap-3 sm:gap-5">
        <Trophy className="h-4 w-4 shrink-0 text-[#7dcb48] sm:h-5 sm:w-5" />
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <h3 className="min-w-0 shrink font-bold tracking-[-0.04em] text-white light:text-gray-900 leading-[1.06]">
            <span className="block text-[1.2rem] leading-snug sm:hidden whitespace-nowrap">
              League Percentile
            </span>
            <span className="hidden sm:block">
              <span className="block text-[1.48rem] lg:text-[1.88rem] xl:text-[2.1rem]">
                League
              </span>
              <span className="block text-[1.48rem] lg:text-[1.88rem] xl:text-[2.1rem]">
                Percentile
              </span>
            </span>
          </h3>
          {showInfo && (
            <Tooltip
              id="observed-value"
              position="top"
              width="w-56 max-w-xs"
              content={
                <div className="space-y-2">
                  <div className="font-semibold text-[#7dcb48]">
                    Season Observed Value
                  </div>
                  <div>
                    Measures a player&apos;s total contribution to team wins in
                    a given season. The value is expressed as a percentile to
                    provide a standardized comparison across all players.
                  </div>
                </div>
              }
            >
              <button
                className="shrink-0 translate-y-px text-gray-400 transition-colors hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700 sm:self-center"
                aria-label="Info about wins above replacement"
              >
                <Info className="h-[13px] w-[13px] sm:h-4 sm:w-4" />
              </button>
            </Tooltip>
          )}
        </div>
        <div className="relative shrink-0 text-right">
          <div className="relative inline-flex items-center justify-center">
            <svg
              className="h-[5.75rem] w-[5.75rem] -rotate-90 transform sm:h-[6.25rem] sm:w-[6.25rem]"
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
              <div className="text-center">
                <div className="text-[1.38rem] font-bold tracking-[-0.04em] text-white light:text-gray-900 sm:text-[1.48rem]">
                  {displayValue}
                </div>
                <div className="text-[0.7rem] uppercase tracking-[0.2em] text-gray-500 light:text-slate-500">
                  pct
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
