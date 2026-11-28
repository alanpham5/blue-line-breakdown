import { Fragment } from "react";
import { Info } from "lucide-react";
import { Tooltip } from "components/ui/Tooltip";
import { getOrdinal } from "utils/ordinal";
import {
  DangerShotPairs,
  hasDangerShotPercentiles,
} from "features/players/components/DangerShotPairs";
import { displayedQualityBars } from "features/players/qualityBars";
import { barRowsTemplate } from "features/players/components/barRows";

const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const PROXIED_KEYS = new Set([
  "zoneEntriesProxy",
  "zoneExitsProxy",
  "entrySuppressionProxy",
]);

const hasProxiedBars = (stats) =>
  (stats || []).some((stat) => PROXIED_KEYS.has(stat.key));

const labelSize = (shareable, compact, crowded) => {
  if (shareable) return compact ? "text-sm" : "text-lg";
  if (crowded) return "text-[0.65rem] sm:text-[0.82rem]";
  return "text-xs sm:text-[0.82rem]";
};

export const PlayerQualityCard = ({
  title,
  icon: Icon,
  stats: rawStats,
  type = "offensive",
  subtitle = "percentile vs. league",
  showInfo = true,
  forceDark = false,
  shareable = false,
  compact = false,
}) => {
  const stats = displayedQualityBars(rawStats);
  const showsDangerPairs =
    type === "workload" && hasDangerShotPercentiles(stats);
  const isCool = type === "offensive" || type === "shotStopping";
  const accentText = isCool
    ? "text-cyan-300 light:text-cyan-600"
    : "text-rose-400 light:text-rose-600";
  const barGradient = isCool
    ? "from-cyan-500 via-cyan-400 to-sky-300"
    : "from-rose-600 via-rose-500 to-red-300";
  const glow = isCool
    ? "shadow-[0_0_18px_rgba(18,223,246,0.18)]"
    : "shadow-[0_0_18px_rgba(255,55,95,0.18)]";
  const track = isCool
    ? "bg-[rgba(20,78,98,0.42)]"
    : "bg-[rgba(112,26,46,0.4)]";

  return (
    <section
      className={`liquid-glass-strong liquid-glass-animate flex h-full flex-col rounded-[32px] ${shareable ? "min-h-0 p-5" : "min-h-[370px] p-5 sm:p-6"} ${forceDark ? "force-dark-player-card" : ""}`}
    >
      <div
        className={`${shareable ? "mb-3" : "mb-5"} flex items-start justify-between gap-3`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Icon
            className={`${shareable ? (compact ? "h-7 w-7" : "h-8 w-8") : "h-6 w-6"} shrink-0 ${accentText}`}
          />
          <div>
            <h3
              className={`${shareable ? `shareable-icon-label ${compact ? "text-2xl" : "text-3xl"}` : "text-xl sm:text-2xl"} font-bold tracking-display text-white light:text-gray-900`}
            >
              {title}
            </h3>
            {!shareable && (
              <p className="mt-0.5 text-xs text-gray-400 light:text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {showInfo && (
          <Tooltip
            id={`${type}-quality`}
            position="bottom"
            width="w-64 sm:w-72"
            content={
              showsDangerPairs ? (
                <div className="space-y-2">
                  <div className={`font-semibold ${accentText}`}>
                    Shots against vs. saves
                  </div>
                  <div>
                    For each danger tier, SA is the league percentile for shots
                    faced per 60 (higher means a heavier workload) and SV is the
                    league percentile for save percentage.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className={`font-semibold ${accentText}`}>
                    Quality percentile
                  </div>
                  <div>
                    Each bar isolates how well the player performs in that area,
                    adjusted for ice time and compared with league peers.
                  </div>
                  {hasProxiedBars(stats) && (
                    <div>
                      A leading p means proxied: entries and exits are inferred
                      from NHL play-by-play, which never records who carries the
                      puck. Each is compared per 60 with what a same-position
                      player would get from the same shift starts. pDZ Entries
                      Prevented counts opponent entries into the player's
                      defensive zone while on the ice, so fewer than expected
                      ranks higher.
                    </div>
                  )}
                </div>
              )
            }
          >
            <button
              className="shrink-0 text-gray-400 transition-colors hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700"
              aria-label={`Info about ${title.toLowerCase()}`}
            >
              <Info className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {showsDangerPairs ? (
        <DangerShotPairs
          stats={stats}
          shareable={shareable}
          compact={compact}
        />
      ) : (
        <div
          className={`grid flex-1 gap-y-2 ${stats.length > 4 ? "gap-x-2 sm:gap-x-3" : "gap-x-3 sm:gap-x-4"}`}
          style={{
            gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
            gridTemplateRows: barRowsTemplate(shareable, compact),
          }}
        >
          {stats.map((stat, index) => {
            const value = clampPercent(stat.value);
            const gridColumn = index + 1;
            return (
              <Fragment key={stat.label}>
                <span
                  className={`justify-self-center ${shareable ? "self-end leading-none" : ""} ${shareable ? (compact ? "text-xl" : "text-2xl") : "text-base"} font-bold tabular-nums ${accentText}`}
                  style={{ gridColumn, gridRow: 1 }}
                  data-export-nudge={shareable ? 8 : undefined}
                >
                  {value.toFixed(0)}
                </span>
                <div
                  className={`relative mx-auto h-full ${shareable ? `${compact ? "min-h-[170px]" : "min-h-[304px]"} max-w-[70px]` : "min-h-[200px] max-w-[68px]"} w-full overflow-hidden rounded-2xl ${track} light:bg-slate-200`}
                  style={{ gridColumn, gridRow: 2 }}
                  role="img"
                  aria-label={`${stat.label}: ${getOrdinal(value)} league percentile`}
                >
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-2xl bg-gradient-to-t ${barGradient} ${glow} transition-[height] duration-1000 ease-out`}
                    style={{ height: `${value}%` }}
                  />
                </div>
                <div
                  className={`${shareable ? "" : "min-h-[3.25rem]"} min-w-0 text-center`}
                  style={{ gridColumn, gridRow: 3 }}
                >
                  <p
                    className={`${labelSize(shareable, compact, stats.length >= 4)} font-semibold leading-tight text-gray-300 hyphens-none break-normal light:text-gray-700`}
                    data-export-nudge={shareable ? 6 : undefined}
                  >
                    {stat.label}
                  </p>
                </div>
              </Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
};
