import { Trophy, User } from "lucide-react";
export const WarPercentileCardCompact = ({ warPercentile, role }) => {
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
      {role && (
        <div className="mt-3 flex w-full items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-gray-400">
            <User className="h-5 w-5 text-sky-300" />
            <span className="shareable-role-label text-sm font-semibold uppercase tracking-[0.12em]">
              Role
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
