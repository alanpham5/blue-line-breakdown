import { Info, Trophy, User } from "lucide-react";
import { Tooltip } from "components/ui/Tooltip";
import { useTheme } from "providers/ThemeContext";
import {
  ImpactTrendChart,
  TREND_PALETTES,
  formatShortSeason,
  latestRatedPoint,
} from "features/players/components/ImpactTrendChart";

export const ImpactTrendCard = ({
  trend = [],
  role,
  currentSeason = null,
  onSeasonClick,
  tooltipTitle = "5-on-5 Player Impact",
  tooltipText = "Each point is that season's impact percentile against eligible players at the same position.",
}) => {
  const { actualTheme } = useTheme();
  const latest = latestRatedPoint(trend);

  return (
    <div
      className="liquid-glass-strong liquid-glass-animate flex h-full w-full flex-col rounded-[32px] p-4 sm:p-5"
      style={{ position: "static", overflow: "visible" }}
    >
      <div className="flex w-full min-w-0 items-center gap-3">
        <Trophy className="h-4 w-4 shrink-0 text-[#7dcb48] sm:h-5 sm:w-5" />
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <h3 className="whitespace-nowrap text-[1.2rem] font-bold leading-snug tracking-display text-white light:text-gray-900 sm:text-[1.45rem]">
              Impact Rating
            </h3>
            <p className="text-xs text-gray-400 light:text-gray-500">
              Last {trend.length} season{trend.length === 1 ? "" : "s"}
            </p>
          </div>
          <Tooltip
            id="impact-trend"
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
              className="relative -top-2 ml-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center self-start text-gray-400 transition-colors hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700"
              aria-label={`Info about ${tooltipTitle.toLowerCase()}`}
            >
              <Info className="h-[13px] w-[13px] sm:h-4 sm:w-4" />
            </button>
          </Tooltip>
        </div>
        {latest && (
          <div className="shrink-0 text-right">
            <div className="text-[1.6rem] font-bold leading-none tracking-display text-white light:text-gray-900 sm:text-[1.8rem]">
              {latest.impactPercentile.toFixed(1)}
            </div>
            <div className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-gray-400 light:text-gray-500">
              {formatShortSeason(latest.season, currentSeason)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-1 items-center">
        <ImpactTrendChart
          trend={trend}
          currentSeason={currentSeason}
          palette={TREND_PALETTES[actualTheme] || TREND_PALETTES.dark}
          onSeasonClick={onSeasonClick}
        />
      </div>

      {role && (
        <div className="mt-2 flex min-w-0 items-center justify-between gap-3 border-t border-white/10 pt-2.5 light:border-slate-200 sm:mt-3 sm:pt-3">
          <div className="flex shrink-0 items-center gap-2 text-gray-400 light:text-gray-500">
            <User className="h-4 w-4 text-sky-300 light:text-sky-600" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">
              Career Role
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
