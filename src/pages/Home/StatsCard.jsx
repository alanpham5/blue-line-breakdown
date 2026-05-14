import { PercentileBar } from "./PercentileBar";
import { playerUtils } from "../../utils/playerUtils";
import { Info } from "lucide-react";
import { Tooltip } from "../../components/Tooltip";

const getColorClasses = (type) =>
  type === "offensive"
    ? {
        iconColor: "text-cyan-300",
      }
    : {
        iconColor: "text-rose-400",
      };

export const StatsCard = ({
  title,
  icon: Icon,
  stats,
  allPercentiles,
  type = "offensive",
  showInfo = true,
}) => {
  const topStats = playerUtils.getTopStats(stats, 6);
  const colorClasses = getColorClasses(type);

  return (
    <div className="liquid-glass-strong liquid-glass-animate rounded-[32px] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <div className="flex items-center gap-3">
          <Icon
            className={`h-5 w-5 shrink-0 sm:h-6 sm:w-6 ${colorClasses.iconColor}`}
          />
          <h3 className="text-xl md:text-2xl font-bold tracking-[-0.04em] text-white light:text-gray-900">
            {title}
          </h3>
        </div>
        <div className="relative flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-gray-400 light:text-gray-600">
            percentile vs. league
          </span>
          {showInfo && (
            <Tooltip
              id={type + "-stats"}
              position="bottom"
              width="w-64 sm:w-72"
              content={
                <div className="space-y-2">
                  <div>
                    <span
                      className={`font-semibold ${type === "offensive" ? "text-cyan-300 light:text-cyan-600" : "text-rose-400 light:text-rose-600"}`}
                    >
                      Percentile Adjusted:
                    </span>{" "}
                    Values are normalized to show where this player ranks
                    compared to all NHL players (0-100th percentile).
                  </div>
                  <div>
                    <span
                      className={`font-semibold ${type === "offensive" ? "text-cyan-300 light:text-cyan-600" : "text-rose-400 light:text-rose-600"}`}
                    >
                      Ice Time Adjusted:
                    </span>{" "}
                    Statistics are adjusted for ice time to provide fair
                    comparisons across players with different usage.
                  </div>
                </div>
              }
            >
              <button
                className="shrink-0 text-gray-400 hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700 transition-colors"
                aria-label="Info about percentile calculation"
              >
                <Info size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      <div>
        {topStats.map((stat, idx) => (
          <PercentileBar
            key={idx}
            label={stat.name}
            value={stat.value}
            type={type}
            statKey={stat.key}
            showInfo={showInfo}
          />
        ))}
      </div>
    </div>
  );
};
