import { ArrowRightLeft, Trophy, User } from "lucide-react";
import {
  formatSignedValue,
  percentileColor,
} from "features/players/leaderboard/leaderboardConfig";
import { getOrdinal } from "utils/ordinal";

export const WarPercentileCardCompact = ({
  warPercentile,
  shiftValue,
  shiftValuePercentile,
  role,
}) => {
  if (warPercentile == null) return null;
  const percent = Math.min(100, Math.max(0, warPercentile));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);
  return (
    <div
      className="liquid-glass-strong flex h-full min-w-0 flex-col rounded-[28px] p-5"
      style={{
        position: "static",
        overflow: "visible",
      }}
    >
      <div className="flex w-full min-w-0 flex-1 items-center gap-4">
        <Trophy className="h-7 w-7 shrink-0 text-[#7dcb48]" />
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <h3 className="shareable-icon-label min-w-0 shrink whitespace-nowrap text-[1.75rem] font-bold leading-snug tracking-display text-white">
            Impact Rating
          </h3>
        </div>
        <div className="relative shrink-0 text-right">
          <div className="relative inline-flex items-center justify-center">
            <svg
              className="h-24 w-24"
              style={{
                display: "block",
              }}
              viewBox="0 0 44 44"
            >
              <g transform="rotate(-90 22 22)">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="none"
                  className="stroke-[rgba(103,120,90,0.42)]"
                  strokeWidth="3.5"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="none"
                  className="stroke-[#7dcb48]"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              </g>
            </svg>
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="shareable-war-score text-[1.65rem] font-bold tracking-display text-white"
                style={{
                  lineHeight: "1",
                  display: "block",
                }}
              >
                {warPercentile.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {shiftValue != null && (
        <div className="mt-3 flex w-full items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-gray-400">
            <ArrowRightLeft className="h-5 w-5 text-[#7dcb48]" />
            <span className="shareable-role-label text-base font-semibold uppercase tracking-[0.12em]">
              SVA/60
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="shareable-role-value text-2xl font-bold leading-tight tabular-nums text-white">
              {formatSignedValue(shiftValue)}
            </span>
            {shiftValuePercentile != null && (
              <span
                className="text-lg font-bold tabular-nums"
                data-export-nudge="7"
                style={{ color: percentileColor(shiftValuePercentile) }}
              >
                {getOrdinal(shiftValuePercentile)}
              </span>
            )}
          </div>
        </div>
      )}
      {role && (
        <div className="mt-3 flex w-full items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-gray-400">
            <User className="h-5 w-5 text-sky-300" />
            <span className="shareable-role-label text-base font-semibold uppercase tracking-[0.12em]">
              Role
            </span>
          </div>
          <div className="shareable-role-value text-right text-2xl font-semibold leading-tight text-white">
            {role}
          </div>
        </div>
      )}
    </div>
  );
};
