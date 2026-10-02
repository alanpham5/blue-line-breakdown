import { Trophy, User } from "lucide-react";
import {
  ImpactTrendChart,
  TREND_PALETTES,
  formatShortSeason,
  latestRatedPoint,
} from "features/players/components/ImpactTrendChart";

export const ImpactTrendCardCompact = ({
  trend = [],
  role,
  currentSeason = null,
}) => {
  const latest = latestRatedPoint(trend);
  return (
    <div
      className="liquid-glass-strong flex h-full min-w-0 flex-col rounded-[28px] p-5"
      style={{ position: "static", overflow: "visible" }}
    >
      <div className="flex w-full min-w-0 items-center gap-4">
        <Trophy className="h-7 w-7 shrink-0 text-[#7dcb48]" />
        <div className="min-w-0 flex-1">
          <h3 className="shareable-icon-label whitespace-nowrap text-[1.75rem] font-bold leading-snug tracking-display text-white">
            Impact Rating
          </h3>
          <div className="text-base font-medium text-gray-400">
            Last {trend.length} season{trend.length === 1 ? "" : "s"}
          </div>
        </div>
        {latest && (
          <div className="shrink-0 text-right">
            <div className="shareable-war-score text-[2.25rem] font-bold leading-none tracking-display text-white">
              {latest.impactPercentile.toFixed(1)}
            </div>
            <div className="mt-1 text-sm font-semibold uppercase tracking-[0.1em] text-gray-400">
              {formatShortSeason(latest.season, currentSeason)}
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-1 items-center">
        <ImpactTrendChart
          trend={trend}
          currentSeason={currentSeason}
          palette={TREND_PALETTES.dark}
          animate={false}
        />
      </div>
      {role && (
        <div className="mt-2 flex w-full items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-gray-400">
            <User className="h-5 w-5 text-sky-300" />
            <span className="shareable-role-label text-sm font-semibold uppercase tracking-[0.12em]">
              Career Role
            </span>
          </div>
          <div className="shareable-role-value text-right text-xl font-semibold leading-tight text-white">
            {role}
          </div>
        </div>
      )}
    </div>
  );
};
