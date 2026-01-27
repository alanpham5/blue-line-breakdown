import { Trophy } from "lucide-react";

export const WarPercentileCardCompact = ({ warPercentile }) => {
  if (warPercentile == null) return null;

  const percent = Math.min(100, Math.max(0, warPercentile));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <div className="liquid-glass-strong rounded-2xl p-3 border-cyan-400/30 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-cyan-500/20 rounded-lg">
          <Trophy className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">Player Value</div>
        </div>
      </div>

      {/* CIRCLE */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            className="stroke-gray-800/40"
            strokeWidth="3"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            className="stroke-cyan-400"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="text-base font-bold text-white">
          {warPercentile.toFixed(1)}
        </div>
      </div>
    </div>
  );
};
