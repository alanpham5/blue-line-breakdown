import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "lib/api/apiService";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
import { SectionAnchor } from "features/expansion-draft/components/DraftLeaderboardPreview";

export const TopPlayersSection = ({
  title,
  position,
  className = "",
  style,
}) => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const [players, setPlayers] = useState(null);
  const [season, setSeason] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await apiService.fetchLeaderboard(position, null, 10);
        if (cancelled) return;
        setPlayers(data.players || []);
        setSeason(data.season);
      } catch {
        if (!cancelled) setPlayers([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [position]);

  // Render nothing until the data is fully loaded, so the section fades in
  // populated rather than animating in an empty/skeleton table.
  if (!players || players.length === 0) return null;

  const seeAllHref = `/leaderboard?position=${position}${season ? `&season=${season}` : ""}`;

  const openPlayer = (player) => {
    navigate(
      `/players?player=${encodeURIComponent(player.name)}&season=${player.season}&position=${player.position}`
    );
  };

  return (
    <section className={`space-y-4 ${className}`} style={style}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-display text-white light:text-gray-900">
          {title}
        </h2>
        <SectionAnchor to={seeAllHref}>See All</SectionAnchor>
      </div>

      <div className="liquid-glass-strong overflow-hidden rounded-[28px]">
        {players.map((player, idx) => {
          const teamColor = playerUtils.getTeamColor(
            player.team,
            player.season,
            actualTheme
          );
          return (
            <button
              key={`${player.playerId}-${player.season}`}
              type="button"
              onClick={() => openPlayer(player)}
              className="flex w-full items-center gap-3 border-t border-white/5 px-4 py-3 text-left transition-colors first:border-t-0 hover:bg-white/5 light:border-slate-200 light:hover:bg-slate-900/5"
            >
              <span className="w-5 shrink-0 text-right text-sm font-bold text-gray-500 light:text-slate-400">
                {idx + 1}
              </span>
              <div
                className="h-9 w-9 shrink-0 overflow-hidden rounded-full"
                style={{ background: teamColor }}
              >
                <img
                  src={playerUtils.getPlayerHeadshot(
                    player.playerId,
                    player.team,
                    player.season
                  )}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = playerUtils.getDefaultHeadshot();
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white light:text-gray-900">
                  {player.name}
                </p>
                <p className="text-xs text-gray-400 light:text-slate-500">
                  {player.team || "—"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-[#7ee340] light:text-[#2e6e14]">
                  {player.leaguePercentile == null
                    ? "—"
                    : player.leaguePercentile.toFixed(1)}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-gray-500 light:text-slate-400">
                  League %
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
