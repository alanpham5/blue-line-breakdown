import { ArrowRight, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";

const groupStyles = {
  forwards: {
    label: "Forwards",
    position: "F",
    accent: "text-cyan-300 light:text-cyan-700",
    fill: "from-cyan-500 to-sky-400",
  },
  defensemen: {
    label: "Defensemen",
    position: "D",
    accent: "text-rose-400 light:text-rose-700",
    fill: "from-rose-500 to-pink-400",
  },
  goalies: {
    label: "Goalies",
    position: "G",
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
  playerHref,
  tableHref,
  rosterHref,
}) => {
  const { actualTheme } = useTheme();
  const showsLinks = !shareable;
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
        className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-white/[0.07] light:border-slate-200 ${shareable ? "px-6 py-3.5" : "px-5 py-5 sm:px-7 sm:py-6"}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Users className="h-7 w-7 shrink-0 text-orange-400 light:text-orange-600" />
          <h2
            className={`whitespace-nowrap font-extrabold tracking-display text-white light:text-gray-900 ${shareable ? "shareable-icon-label text-[1.75rem]" : "text-2xl sm:text-3xl"}`}
          >
            Most Impactful Players
          </h2>
        </div>
        {showsLinks && rosterHref && (
          <Link
            to={rosterHref}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-orange-400/40 px-3.5 py-1.5 text-sm font-bold text-orange-300 transition hover:border-orange-300/70 hover:bg-orange-400/10 light:border-orange-600/40 light:text-orange-700 light:hover:border-orange-600/70 light:hover:bg-orange-500/10"
          >
            <span className="hidden sm:inline">See Roster</span>
            <span className="sm:hidden">Roster</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
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
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3
                  className={`font-bold uppercase tracking-[0.08em] ${style.accent} ${shareable ? "text-base" : "text-sm"}`}
                >
                  {style.label}
                </h3>
                {showsLinks && tableHref && (
                  <Link
                    to={tableHref(style.position)}
                    aria-label={`See ${style.label.toLowerCase()} table`}
                    className={`group inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold opacity-75 transition-opacity hover:opacity-100 ${style.accent}`}
                  >
                    Full table
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>
              <div className="divide-y divide-white/[0.06] light:divide-slate-200">
                {players.map((player) => {
                  const headshot = playerUtils.getPlayerHeadshot(
                    player.playerId,
                    team,
                    season
                  );
                  const href = shareable ? null : playerHref?.(player);
                  const interactive = Boolean(href || onPlayerClick);
                  const RowElement = href ? Link : "div";
                  const rowInteraction = href
                    ? { to: href }
                    : onPlayerClick
                      ? {
                          onClick: () => onPlayerClick(player),
                          onKeyDown: (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onPlayerClick(player);
                            }
                          },
                          role: "button",
                          tabIndex: 0,
                        }
                      : {};
                  return (
                    <RowElement
                      key={player.playerId}
                      {...rowInteraction}
                      className={`flex items-center py-3 first:pt-0 last:pb-0 ${shareable ? "gap-4" : "gap-3"} ${interactive ? "cursor-pointer rounded-2xl transition hover:bg-white/[0.04]" : ""}`}
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
                    </RowElement>
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
