import { Trophy } from "lucide-react";

export const WarPercentileCardCompact = ({ warPercentile }) => {
  if (warPercentile == null) return null;

  const percent = Math.min(100, Math.max(0, warPercentile));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <div
      className="liquid-glass-strong flex min-w-0 items-center gap-3 rounded-[28px] p-4 sm:gap-5 sm:p-5"
      style={{ position: "static", overflow: "visible" }}
    >
      <Trophy className="h-4 w-4 shrink-0 text-[#7dcb48] sm:h-5 sm:w-5" />
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <h3 className="min-w-0 shrink font-bold tracking-[-0.04em] text-white leading-[1.06]">
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
      </div>
      <div className="relative shrink-0 text-right">
        <div className="relative inline-flex items-center justify-center">
          <svg
            className="h-[5.75rem] w-[5.75rem] sm:h-[6.25rem] sm:w-[6.25rem]"
            style={{ display: "block" }}
            viewBox="0 0 44 44"
          >
            <g transform="rotate(-90 22 22)">
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
              className="shareable-war-score text-[1.38rem] font-bold tracking-[-0.04em] text-white sm:text-[1.48rem]"
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
  );
};
