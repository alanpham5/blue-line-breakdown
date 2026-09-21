import { useState, useEffect, useMemo, useRef } from "react";
import { X, Search, Loader2, Check } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
const POSITION_LABEL = { F: "forward", D: "defenseman" };
const percentileColor = (pct) => {
  if (typeof pct !== "number") return "text-gray-300 light:text-gray-600";
  if (pct >= 66) return "text-emerald-300 light:text-emerald-600";
  if (pct >= 40) return "text-amber-300 light:text-amber-600";
  return "text-rose-400 light:text-rose-600";
};
export const PlayerPickerModal = ({
  isOpen,
  onClose,
  position,
  season,
  pool,
  loading,
  selectedIds,
  onSelect,
}) => {
  const { actualTheme } = useTheme();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);
  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const base = trimmed
      ? pool.filter(
          (player) =>
            player.name?.toLowerCase().includes(trimmed) ||
            player.team?.toLowerCase().includes(trimmed)
        )
      : pool;
    return base.slice(0, 80);
  }, [pool, query]);
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/72 p-0 backdrop-blur-sm light:bg-black/30 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="liquid-glass-strong flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4 light:border-slate-200">
          <h3 className="text-lg font-bold tracking-display text-white light:text-gray-900">
            Add a {POSITION_LABEL[position] || "player"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white light:text-slate-500 light:hover:bg-slate-900/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 light:text-slate-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${season} ${POSITION_LABEL[position] || "player"}s or teams...`}
              className="app-field w-full py-2.5 pl-9 pr-3 text-sm text-white light:text-gray-900"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-sky-300 light:text-sky-600" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400 light:text-slate-500">
              No players found.
            </p>
          ) : (
            filtered.map((player) => {
              const impact =
                typeof player.impactPercentile === "number"
                  ? player.impactPercentile
                  : player.warPercentile;
              const alreadyOnLine = selectedIds?.includes(player.playerId);
              return (
                <button
                  key={player.playerId}
                  type="button"
                  disabled={alreadyOnLine}
                  onClick={() => onSelect(player)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition ${
                    alreadyOnLine
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-white/[0.06] light:hover:bg-slate-900/5"
                  }`}
                >
                  <img
                    src={playerUtils.getPlayerHeadshot(
                      player.playerId,
                      player.team,
                      season
                    )}
                    alt={player.name}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                    style={{
                      backgroundColor: playerUtils.getTeamColor(
                        player.team,
                        season,
                        actualTheme
                      ),
                    }}
                    onError={(event) => {
                      event.target.src = playerUtils.getDefaultHeadshot();
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white light:text-gray-900">
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-400 light:text-slate-500">
                      {player.team || "—"}
                    </div>
                  </div>
                  {alreadyOnLine && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-sky-300 light:text-sky-600">
                      <Check className="h-3 w-3" /> On line
                    </span>
                  )}
                  <span
                    className={`shrink-0 text-sm font-bold ${percentileColor(impact)}`}
                  >
                    {typeof impact === "number" ? impact.toFixed(1) : "—"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
