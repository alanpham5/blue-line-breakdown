import { PercentileBar } from "../Home/PercentileBar";
import { playerUtils } from "../../utils/playerUtils";

export const StatsCardCompact = ({
  title,
  icon: Icon,
  stats,
  type = "offensive",
}) => {
  const topStats = playerUtils.getTopStats(stats, 6);

  return (
    <div
      className={`liquid-glass-strong rounded-2xl p-5 ${
        type === "offensive" ? "border-cyan-400/30" : "border-red-400/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`p-2 rounded-lg ${
            type === "offensive"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>

      <div className="space-y-5">
        {topStats.map((stat, idx) => (
          <PercentileBar
            key={idx}
            label={stat.name}
            value={stat.value}
            type={type}
            showInfo={false}
            compact
          />
        ))}
      </div>
    </div>
  );
};
