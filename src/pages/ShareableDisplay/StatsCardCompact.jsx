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
    <div className="liquid-glass-strong rounded-[28px] p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={`h-6 w-6 ${
            type === "offensive" ? "text-cyan-300" : "text-rose-400"
          }`}
        />
        <h3 className="text-2xl font-bold text-white">{title}</h3>
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
            forceDark
          />
        ))}
      </div>
    </div>
  );
};
