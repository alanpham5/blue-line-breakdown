import { useState, useEffect, useMemo, useRef } from "react";
import { X, Search, Loader2, Repeat2, UserPlus } from "lucide-react";
import { apiService } from "lib/api/apiService";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
const POSITION_LABEL = { F: "Forward", D: "Defenseman", G: "Goalie" };
const percentileColor = (pct) => {
  if (typeof pct !== "number") return "text-gray-300 light:text-gray-600";
  if (pct >= 66) return "text-emerald-300 light:text-emerald-600";
  if (pct >= 40) return "text-amber-300 light:text-amber-600";
  return "text-rose-400 light:text-rose-600";
};
const poolCache = {};
export const SubstitutionModal = ({
  isOpen,
  onClose,
  position,
  season,
  usedPlayerIds,
  currentPlayerId,
  onSelect,
}) => {
  const { actualTheme } = useTheme();
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [rookieMode, setRookieMode] = useState(false);
  const [rookieName, setRookieName] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setRookieMode(false);
    setRookieName("");
    const key = `${season}-${position}`;
    if (poolCache[key]) {
      setPool(poolCache[key]);
      return;
    }
    let active = true;
    setLoading(true);
    apiService
      .fetchPlayerPool(season, position)
      .then((data) => {
        if (!active) return;
        poolCache[key] = data.players || [];
        setPool(poolCache[key]);
      })
      .catch(() => active && setPool([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isOpen, season, position]);
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? pool.filter((p) => p.name?.toLowerCase().includes(q))
      : pool;
    return base.slice(0, 60);
  }, [pool, query]);
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/72 p-0 backdrop-blur-sm light:bg-black/30 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="liquid-glass-strong flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4 light:border-slate-200">
          <h3 className="text-lg font-bold tracking-display text-white light:text-gray-900">
            {rookieMode
              ? "Add Rookie"
              : `Substitute ${POSITION_LABEL[position] || "Player"}`}
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRookieMode((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                rookieMode
                  ? "bg-sky-500/15 text-sky-300 light:text-sky-600"
                  : "text-gray-300 hover:bg-white/10 hover:text-white light:text-slate-600 light:hover:bg-slate-900/10"
              }`}
            >
              {rookieMode ? (
                <>
                  <X className="h-3.5 w-3.5" /> Cancel
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" /> Add Rookie
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white light:text-slate-500 light:hover:bg-slate-900/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="space-y-2 p-4 pb-2">
          {rookieMode && (
            <input
              value={rookieName}
              onChange={(e) => setRookieName(e.target.value)}
              placeholder="Rookie name"
              className="app-field w-full px-3 py-2.5 text-sm text-white light:text-gray-900"
            />
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 light:text-slate-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                rookieMode
                  ? "Search a player to use as the profile..."
                  : `Search ${season} ${POSITION_LABEL[position]?.toLowerCase() || "player"}s...`
              }
              className="app-field w-full py-2.5 pl-9 pr-3 text-sm text-white light:text-gray-900"
            />
          </div>
          {rookieMode && (
            <p className="px-1 text-[0.7rem] text-gray-400 light:text-slate-500">
              Pick a player whose metrics the rookie will use. They'll appear as
              "{rookieName.trim() || "Rookie"}" with a generic headshot.
            </p>
          )}
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
            filtered.map((p) => {
              const impactPercentile =
                typeof p.impactPercentile === "number"
                  ? p.impactPercentile
                  : p.warPercentile;
              const onRoster =
                usedPlayerIds?.has(p.playerId) &&
                p.playerId !== currentPlayerId;
              const disabled = rookieMode && onRoster;
              return (
                <button
                  key={p.playerId}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onSelect(
                      rookieMode
                        ? { ...p, rookieName: rookieName.trim() || "Rookie" }
                        : p
                    )
                  }
                  className={`flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition ${
                    disabled
                      ? "cursor-not-allowed opacity-35"
                      : "hover:bg-white/[0.06] light:hover:bg-slate-900/5"
                  } ${p.playerId === currentPlayerId ? "bg-sky-500/10" : ""}`}
                >
                  <img
                    src={playerUtils.getPlayerHeadshot(
                      p.playerId,
                      p.team,
                      season
                    )}
                    alt={p.name}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                    style={{
                      backgroundColor: playerUtils.getTeamColor(
                        p.team,
                        season,
                        actualTheme
                      ),
                    }}
                    onError={(e) => {
                      e.target.src = playerUtils.getDefaultHeadshot();
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white light:text-gray-900">
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-400 light:text-slate-500">
                      {p.team || "—"}
                    </div>
                  </div>
                  {onRoster && !rookieMode && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-sky-300 light:text-sky-600">
                      <Repeat2 className="h-3 w-3" /> Swap
                    </span>
                  )}
                  <span
                    className={`shrink-0 text-sm font-bold ${percentileColor(impactPercentile)}`}
                  >
                    {typeof impactPercentile === "number"
                      ? impactPercentile.toFixed(1)
                      : "—"}
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
