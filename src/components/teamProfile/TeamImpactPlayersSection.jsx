import { ArrowUpRight, Users } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";

const groupStyles = {
  forwards: {
    label: "Forwards",
    accent: "text-cyan-300 light:text-cyan-700",
    fill: "from-cyan-500 to-sky-400",
  },
  defensemen: {
    label: "Defensemen",
    accent: "text-rose-400 light:text-rose-700",
    fill: "from-rose-500 to-pink-400",
  },
  goalies: {
    label: "Goalies",
    accent: "text-yellow-300 light:text-yellow-700",
    fill: "from-amber-500 to-yellow-300",
  },
};

export const TeamImpactPlayersSection = ({
  groups,
  team,
  season,
  shareable = false,
  onPlayerClick,
  onRosterClick,
}) => {
  const { actualTheme } = useTheme();
  const teamColor = playerUtils.getTeamColor(
    team,
    season,
    shareable ? "dark" : actualTheme
  );

  return (
    <section
      className={`liquid-glass-strong force-dark-player-card overflow-hidden ${shareable ? "rounded-[28px]" : "rounded-[32px]"}`}
    >
      <div
        className={`flex items-center justify-between gap-4 border-b border-white/[0.07] light:border-slate-200 ${shareable ? "px-6 py-3.5" : "px-5 py-5 sm:px-7 sm:py-6"}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Users className="h-7 w-7 shrink-0 text-orange-400 light:text-orange-600" />
          <h2
            className={`font-extrabold tracking-display text-white light:text-gray-900 ${shareable ? "shareable-icon-label text-[1.75rem]" : "text-2xl sm:text-3xl"}`}
          >
            Most Impactful Players
          </h2>
        </div>
        {!shareable && onRosterClick && (
          <button
            type="button"
            onClick={onRosterClick}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-orange-300 transition hover:text-orange-200 light:text-orange-700 light:hover:text-orange-800"
          >
            <span className="hidden sm:inline">See Roster</span>
            <span className="sm:hidden">Roster</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        className={
          shareable
            ? "grid grid-cols-3 divide-x divide-white/[0.07] light:divide-slate-200"
            : "grid divide-y divide-white/[0.07] light:divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0"
        }
      >
        {Object.entries(groups).map(([groupKey, players]) => {
          const style = groupStyles[groupKey];
          return (
            <div
              key={groupKey}
              className={shareable ? "px-5 py-4" : "px-5 py-5 sm:px-6"}
            >
              <h3
                className={`mb-3 font-bold uppercase tracking-[0.08em] ${style.accent} ${shareable ? "text-base" : "text-sm"}`}
              >
                {style.label}
              </h3>
              <div className="divide-y divide-white/[0.06] light:divide-slate-200">
                {players.map((player) => {
                  const headshot = playerUtils.getPlayerHeadshot(
                    player.playerId,
                    team,
                    season
                  );
                  return (
                    <div
                      key={player.playerId}
                      className={`flex items-center py-3 first:pt-0 last:pb-0 ${shareable ? "gap-4" : "gap-3"} ${onPlayerClick ? "cursor-pointer rounded-2xl transition hover:bg-white/[0.04]" : ""}`}
                      onClick={() => onPlayerClick?.(player)}
                      onKeyDown={(event) => {
                        if (
                          onPlayerClick &&
                          (event.key === "Enter" || event.key === " ")
                        ) {
                          event.preventDefault();
                          onPlayerClick(player);
                        }
                      }}
                      role={onPlayerClick ? "button" : undefined}
                      tabIndex={onPlayerClick ? 0 : undefined}
                    >
                      <img
                        src={
                          shareable
                            ? playerUtils.getCorsWrappedUrl(headshot)
                            : headshot
                        }
                        alt={player.name}
                        className={`${shareable ? "h-14 w-14" : "h-11 w-11"} shrink-0 rounded-full object-cover`}
                        style={{ backgroundColor: teamColor }}
                        onError={(event) => {
                          event.currentTarget.src =
                            playerUtils.getDefaultHeadshot();
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-bold text-white light:text-gray-900 ${shareable ? "text-xl" : "text-sm sm:text-base"}`}
                        >
                          {player.name}
                        </p>
                        <div className="mt-2 flex items-center gap-2.5">
                          <div
                            className={`${shareable ? "h-2.5" : "h-1.5"} min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.07] light:bg-slate-200`}
                          >
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${style.fill}`}
                              style={{
                                width: `${Math.min(100, Math.max(0, player.impact))}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`shrink-0 text-right font-extrabold tabular-nums ${style.accent} ${shareable ? "shareable-team-bar-value w-9 text-lg" : "w-7 text-sm"}`}
                          >
                            {Math.round(player.impact)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
