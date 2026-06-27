import { PercentileBar } from "features/players/components/PercentileBar";
import { playerUtils } from "utils/playerUtils";
export const StatsCardCompact = ({
  title,
  icon: Icon,
  stats,
  type = "offensive",
  columns = 1,
}) => {
  const topStats = playerUtils.getTopStats(stats, 6);
  return (
    <div className="liquid-glass-strong rounded-[28px] p-5">
      <div className="shareable-card-title-row flex items-center gap-1.5 sm:gap-2 mb-2">
        <Icon
          className={`shareable-card-title-icon h-6 w-6 ${type === "offensive" || type === "shotStopping" ? "text-cyan-300" : type === "edge" ? "text-emerald-300" : "text-rose-400"}`}
        />
        <h3 className="shareable-card-title-text text-xl sm:text-2xl font-bold text-white whitespace-nowrap">
          {title}
        </h3>
      </div>

      <div
        className={
          columns === 2
            ? "grid grid-cols-2 gap-x-6 gap-y-5"
            : "space-y-5"
        }
      >
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
