import { PercentileBar } from "./PercentileBar";
import { playerUtils } from "../../utils/playerUtils";
import { Info } from "lucide-react";
import { Tooltip } from "../../components/Tooltip";

const getColorClasses = (type) =>
  type === "offensive"
    ? {
        gradient: "from-blue-900/30 to-cyan-900/30",
        border: "border-blue-700/50",
        iconBg: "bg-blue-500/20",
        iconColor: "text-blue-400",
      }
    : {
        gradient: "from-red-900/30 to-orange-900/30",
        border: "border-red-700/50",
        iconBg: "bg-red-500/20",
        iconColor: "text-red-400",
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
    <div
      className={`liquid-glass-strong rounded-2xl p-4 sm:p-6 liquid-glass-animate ${type === "offensive" ? "border-cyan-400/30" : "border-red-400/30"}`}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 ${colorClasses.iconBg} rounded-lg shrink-0 backdrop-blur-sm border ${type === "offensive" ? "border-cyan-400/20" : "border-red-400/20"}`}
          >
            <Icon
              className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClasses.iconColor}`}
            />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white light:text-gray-900">
            {title}
          </h3>
        </div>
        <div className="relative flex items-center gap-2">
          <span className="text-sm text-gray-300 light:text-gray-600 whitespace-nowrap">
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
                    <span className="font-semibold text-cyan-400 light:text-cyan-600">
                      Percentile Adjusted:
                    </span>{" "}
                    Values are normalized to show where this player ranks
                    compared to all NHL players (0-100th percentile).
                  </div>
                  <div>
                    <span className="font-semibold text-cyan-400 light:text-cyan-600">
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
