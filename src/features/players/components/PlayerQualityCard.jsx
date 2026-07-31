import { Info } from "lucide-react";
import { Tooltip } from "components/ui/Tooltip";

const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const getOrdinal = (value) => {
  const rounded = Math.round(value);
  const mod100 = rounded % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${rounded}th`;
  if (rounded % 10 === 1) return `${rounded}st`;
  if (rounded % 10 === 2) return `${rounded}nd`;
  if (rounded % 10 === 3) return `${rounded}rd`;
  return `${rounded}th`;
};

export const PlayerQualityCard = ({
  title,
  icon: Icon,
  stats,
  type = "offensive",
  showInfo = true,
  forceDark = false,
  shareable = false,
}) => {
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
            className={`${shareable ? "h-7 w-7" : "h-6 w-6"} shrink-0 ${accentText}`}
          />
          <div>
            <h3
              className={`${shareable ? "shareable-icon-label text-2xl" : "text-xl sm:text-2xl"} font-bold tracking-display text-white light:text-gray-900`}
            >
              {title}
            </h3>
            {!shareable && (
              <p className="mt-0.5 text-xs text-gray-400 light:text-gray-500">
                percentile vs. league
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
              <div className="space-y-2">
                <div className={`font-semibold ${accentText}`}>
                  Quality percentile
                </div>
                <div>
                  Each bar isolates how well the player performs in that area,
                  adjusted for ice time and compared with league peers.
                </div>
              </div>
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

      <div className="grid flex-1 grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const value = clampPercent(stat.value);
          return (
            <div
              key={stat.label}
              className="grid min-w-0 grid-rows-[auto_1fr_auto] justify-items-center gap-2"
            >
              <span
                className={`${shareable ? "text-xl" : "text-base"} font-bold tabular-nums ${accentText}`}
              >
                {value.toFixed(0)}
              </span>
              <div
                className={`relative h-full ${shareable ? "min-h-[170px] max-w-[70px]" : "min-h-[200px] max-w-[68px]"} w-full overflow-hidden rounded-2xl ${track} light:bg-slate-200`}
                role="img"
                aria-label={`${stat.label}: ${getOrdinal(value)} league percentile`}
              >
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-2xl bg-gradient-to-t ${barGradient} ${glow} transition-[height] duration-1000 ease-out`}
                  style={{ height: `${value}%` }}
                />
              </div>
              <div className="min-h-[3.25rem] text-center">
                <p
                  className={`${shareable ? "text-sm" : "text-xs sm:text-[0.82rem]"} font-semibold leading-tight text-gray-300 light:text-gray-700`}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
