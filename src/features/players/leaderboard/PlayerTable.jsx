import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
import { useIsMobile } from "hooks/useIsMobile";
import {
  metricGroupsForPosition,
  metricKeysForPosition,
  formatHeight,
  formatPercentile,
  percentileTint,
} from "./leaderboardConfig";

const PAGE_SIZE = 25;

const compareValues = (a, b, dir) => {
  const aNull = a == null;
  const bNull = b == null;
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  return dir === "asc" ? a - b : b - a;
};

const SortHeader = ({
  label,
  title,
  sortKey,
  sort,
  onSort,
  className = "",
}) => {
  const active = sort.key === sortKey;
  const Icon = !active
    ? ChevronsUpDown
    : sort.dir === "asc"
      ? ArrowUp
      : ArrowDown;
  return (
    <th className={`px-2 py-2 text-right font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        title={title || label}
        className={`inline-flex items-center gap-1 transition-colors ${active ? "text-[#7ee340] light:text-[#2e6e14]" : "text-gray-300 hover:text-white light:text-slate-600 light:hover:text-slate-900"}`}
      >
        <span className="whitespace-nowrap">{label}</span>
        <Icon className="h-3.5 w-3.5 shrink-0" />
      </button>
    </th>
  );
};

export const PlayerTable = ({ players, position }) => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const isMobile = useIsMobile();
  const [sort, setSort] = useState({ key: "leaguePercentile", dir: "desc" });
  const [page, setPage] = useState(0);

  const metricGroups = metricGroupsForPosition(position);
  const metricKeys = metricKeysForPosition(position);

  const sortedPlayers = useMemo(() => {
    const getValue = (player) => {
      if (sort.key === "leaguePercentile") return player.leaguePercentile;
      if (sort.key === "height") return player.height;
      if (sort.key === "weight") return player.weight;
      return player.metrics?.[sort.key];
    };
    return [...players].sort((a, b) =>
      compareValues(getValue(a), getValue(b), sort.dir)
    );
  }, [players, sort]);

  const pageCount = Math.max(1, Math.ceil(sortedPlayers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pagePlayers = sortedPlayers.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  const handleSort = (key) => {
    setPage(0);
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  };

  const openPlayer = (player) => {
    if (!player?.playerId) return;
    navigate(`/players/v2/${player.playerId}?season=${player.season}`);
  };

  const groupHeaderColor = (type) =>
    type === "offensive" || type === "shotStopping"
      ? "text-cyan-300 light:text-cyan-700"
      : "text-rose-400 light:text-rose-600";

  return (
    <div
      className="liquid-glass-strong rounded-[28px] p-3 sm:p-5 fade-in-up [&::before]:!opacity-0"
      style={{ background: "var(--glass-bg-strong)" }}
    >
      <p className="mb-2 px-2 text-xs text-gray-400 light:text-slate-500">
        Player impact model · position-relative 5-on-5 percentiles
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-400 light:text-slate-500">
              <th className="sticky left-0 z-10 bg-[var(--glass-bg-strong)] px-2 py-2 text-left font-semibold">
                Player
              </th>
              {!isMobile && (
                <th className="px-2 py-2 text-left font-semibold">Team</th>
              )}
              <SortHeader
                label="Ht"
                sortKey="height"
                sort={sort}
                onSort={handleSort}
              />
              <SortHeader
                label="Wt"
                sortKey="weight"
                sort={sort}
                onSort={handleSort}
              />
              <SortHeader
                label="League %"
                sortKey="leaguePercentile"
                sort={sort}
                onSort={handleSort}
              />
              {metricGroups.flatMap((group) =>
                group.keys.map((key) => (
                  <SortHeader
                    key={key}
                    label={playerUtils.formatStatAbbr(key)}
                    title={playerUtils.formatStatName(key)}
                    sortKey={key}
                    sort={sort}
                    onSort={handleSort}
                    className={`min-w-[3.5rem] ${groupHeaderColor(group.type)}`}
                  />
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {pagePlayers.map((player, idx) => {
              const teamColor = playerUtils.getTeamColor(
                player.team,
                player.season,
                actualTheme
              );
              return (
                <tr
                  key={`${player.playerId}-${player.season}`}
                  onClick={() => openPlayer(player)}
                  className="cursor-pointer border-t border-white/5 transition-colors hover:bg-white/5 light:border-slate-200 light:hover:bg-slate-900/5"
                >
                  <td className="sticky left-0 z-10 bg-[var(--glass-bg-strong)] px-2 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-right text-xs text-gray-500 light:text-slate-400">
                        {safePage * PAGE_SIZE + idx + 1}
                      </span>
                      {!isMobile && (
                        <div
                          className="h-8 w-8 shrink-0 overflow-hidden rounded-full"
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
                      )}
                      <span className="whitespace-nowrap font-semibold text-white light:text-gray-900">
                        {player.name}
                      </span>
                    </div>
                  </td>
                  {!isMobile && (
                    <td className="px-2 py-2 text-left text-gray-300 light:text-slate-600">
                      {player.team || "—"}
                    </td>
                  )}
                  <td className="px-2 py-2 text-right text-gray-300 light:text-slate-600">
                    {formatHeight(player.height)}
                  </td>
                  <td className="px-2 py-2 text-right text-gray-300 light:text-slate-600">
                    {player.weight == null ? "—" : player.weight}
                  </td>
                  <td
                    className="px-2 py-2 text-right font-bold text-white light:text-gray-900"
                    style={{
                      background: percentileTint(player.leaguePercentile),
                    }}
                  >
                    {formatPercentile(player.leaguePercentile)}
                  </td>
                  {metricKeys.map((key) => {
                    const value = player.metrics?.[key];
                    return (
                      <td
                        key={key}
                        className="px-2 py-2 text-right font-medium text-white light:text-gray-900"
                        style={{ background: percentileTint(value) }}
                      >
                        {formatPercentile(value)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-gray-200 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30 light:border-slate-200 light:bg-white/80 light:text-slate-700"
          >
            Previous
          </button>
          <span className="text-gray-400 light:text-slate-500">
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-gray-200 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30 light:border-slate-200 light:bg-white/80 light:text-slate-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
