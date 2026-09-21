import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Users, Shield, RotateCcw, Wand2 } from "lucide-react";
import { apiService } from "lib/api/apiService";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { AppSelect } from "components/ui/AppSelect";
import { LineSlot } from "features/line-builder/components/LineSlot";
import { LineAnalysis } from "features/line-builder/components/LineAnalysis";
import { PlayerPickerModal } from "features/line-builder/components/PlayerPickerModal";
import { usePlayerPool } from "features/line-builder/hooks/usePlayerPool";
import { useLinesEnabled } from "hooks/useLinesEnabled";
import { NotFound } from "features/not-found/NotFound";
const UNIT_SIZE = { F: 3, D: 2 };
const SLOT_LABELS = {
  F: ["Left Wing", "Center", "Right Wing"],
  D: ["Left Defense", "Right Defense"],
};
const getSeasonName = (season) =>
  `${season}-${(parseInt(season) + 1).toString().slice(-2)}`;
const latestSeason = () => {
  const now = new Date();
  return now.getMonth() >= 10 ? now.getFullYear() : now.getFullYear() - 1;
};
const seasonOptions = () => {
  const newest = latestSeason();
  return Array.from({ length: newest - 2007 }, (_, index) => newest - index);
};
export const LineBuilder = () => {
  const linesEnabled = useLinesEnabled();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const seasons = useMemo(seasonOptions, []);
  const seasonParam = searchParams.get("season") || searchParams.get("year");
  const season = String(
    seasons.includes(parseInt(seasonParam)) ? seasonParam : seasons[0]
  );
  const position = searchParams.get("position") === "D" ? "D" : "F";
  const slotCount = UNIT_SIZE[position];
  const slots = useMemo(() => {
    const parsed = (searchParams.get("players") || "")
      .split(",")
      .map((value) => {
        const playerId = parseInt(value);
        return Number.isFinite(playerId) ? playerId : null;
      });
    return Array.from(
      { length: slotCount },
      (_, index) => parsed[index] ?? null
    );
  }, [searchParams, slotCount]);
  const { pool, loading: poolLoading } = usePlayerPool(
    season,
    position,
    linesEnabled
  );
  const [pickerSlot, setPickerSlot] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const filledIds = slots.filter((id) => id != null);
  const isComplete = filledIds.length === slotCount;
  const slotKey = slots.join(",");
  const updateParams = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(next).forEach(([key, value]) => {
        if (value == null || value === "") params.delete(key);
        else params.set(key, value);
      });
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const setSlots = useCallback(
    (nextSlots) =>
      updateParams({
        players: nextSlots.some((id) => id != null)
          ? nextSlots.map((id) => id ?? "").join(",")
          : "",
      }),
    [updateParams]
  );
  useEffect(() => {
    if (!isComplete) {
      setAnalysis(null);
      setError("");
      return;
    }
    let active = true;
    setAnalyzing(true);
    setError("");
    apiService
      .analyzeBuiltLine({
        season,
        position,
        playerIds: slotKey.split(",").filter(Boolean).map(Number),
      })
      .then((data) => active && setAnalysis(data))
      .catch((requestError) => {
        if (!active) return;
        setAnalysis(null);
        setError(requestError.message || "Failed to analyze line");
      })
      .finally(() => active && setAnalyzing(false));
    return () => {
      active = false;
    };
  }, [season, position, slotKey, isComplete]);
  const handlePositionChange = (nextPosition) => {
    if (nextPosition === position) return;
    const params = new URLSearchParams(searchParams);
    params.set("position", nextPosition);
    params.delete("players");
    setSearchParams(params, { replace: true });
  };
  const handleSeasonChange = (nextSeason) => {
    const params = new URLSearchParams(searchParams);
    params.set("season", nextSeason);
    params.delete("players");
    setSearchParams(params, { replace: true });
  };
  const handleSelect = (player) => {
    const nextSlots = [...slots];
    nextSlots[pickerSlot] = player.playerId;
    setSlots(nextSlots);
    setPickerSlot(null);
  };
  const handleRemove = (index) => {
    const nextSlots = [...slots];
    nextSlots[index] = null;
    setSlots(nextSlots);
  };
  const handleLoadUnit = ({ season: nextSeason, playerIds }) => {
    if (!playerIds?.length) return;
    updateParams({
      season: String(nextSeason || season),
      players: playerIds.join(","),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleClear = () => {
    setSlots(Array.from({ length: slotCount }, () => null));
  };
  const handleSurprise = () => {
    if (pool.length < slotCount) return;
    const chosen = [];
    while (chosen.length < slotCount) {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (!chosen.some((player) => player.playerId === candidate.playerId)) {
        chosen.push(candidate);
      }
    }
    setSlots(chosen.map((player) => player.playerId));
  };
  const playersById = useMemo(() => {
    const map = {};
    pool.forEach((player) => {
      map[player.playerId] = player;
    });
    (analysis?.players || []).forEach((player) => {
      map[player.playerId] = player;
    });
    return map;
  }, [pool, analysis]);
  const slotPlayer = (playerId) =>
    playerId == null ? null : playersById[playerId] || null;
  if (!linesEnabled) return <NotFound />;
  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header />

        <div className="liquid-glass-strong mb-5 rounded-[32px] p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[2rem] font-extrabold tracking-display text-white light:text-gray-900">
              Line Builder
            </h2>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide"
              style={{
                background: "var(--btn-accent)",
                color: "var(--btn-accent-text)",
              }}
            >
              Beta
            </span>
          </div>
          <p className="mt-1.5 max-w-2xl text-sm text-gray-300 light:text-slate-600">
            Put any three forwards or any two defensemen from a season together
            and see what the combination actually is — its identity, traits,
            projected results, and the real NHL lines it most resembles.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-full border border-white/10 p-1 light:border-slate-200">
              {[
                { key: "F", label: "Forward Line", icon: Users },
                { key: "D", label: "Defense Pair", icon: Shield },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePositionChange(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    position === key
                      ? "bg-white/10 text-[#7ee340] light:bg-slate-900/10 light:text-[#2e6e14]"
                      : "text-gray-300 hover:text-white light:text-slate-600 light:hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <label className="block w-full sm:w-52">
              <span className="sr-only">Season</span>
              <AppSelect
                placeholder="Season"
                value={season}
                onChange={(event) => handleSeasonChange(event.target.value)}
                className="app-field w-full px-4 py-3 pr-10 text-base normal-case tracking-normal text-white light:text-gray-900"
              >
                {seasons.map((availableSeason) => (
                  <option key={availableSeason} value={availableSeason}>
                    {getSeasonName(availableSeason)}
                  </option>
                ))}
              </AppSelect>
            </label>
            <div className="flex items-center gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={handleSurprise}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white light:text-slate-600 light:hover:bg-slate-900/10"
              >
                <Wand2 className="h-4 w-4" /> Random
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={filledIds.length === 0}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40 light:text-slate-600 light:hover:bg-slate-900/10"
              >
                <RotateCcw className="h-4 w-4" /> Clear
              </button>
            </div>
          </div>

          <div
            className={`mt-5 grid gap-3 ${position === "D" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}
          >
            {slots.map((playerId, index) => (
              <LineSlot
                key={`${index}-${playerId ?? "empty"}`}
                slotLabel={SLOT_LABELS[position][index]}
                player={slotPlayer(playerId)}
                pending={poolLoading}
                season={season}
                onPick={() => setPickerSlot(index)}
                onRemove={() => handleRemove(index)}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="liquid-glass-strong mb-5 rounded-[28px] p-5 text-center text-sm text-rose-300 light:text-rose-600">
            {error}
          </div>
        )}

        {!isComplete && !error && (
          <div className="liquid-glass-strong rounded-[28px] p-8 text-center">
            <p className="text-sm text-gray-400 light:text-slate-500">
              Fill {slotCount - filledIds.length} more{" "}
              {position === "D" ? "defenseman" : "forward"}
              {slotCount - filledIds.length === 1 ? "" : "s"} to get the full
              breakdown.
            </p>
          </div>
        )}

        {isComplete && analyzing && !analysis && (
          <div className="liquid-glass-strong flex items-center justify-center rounded-[28px] p-10">
            <Loader2 className="h-8 w-8 animate-spin text-sky-300 light:text-sky-600" />
          </div>
        )}

        {analysis && (
          <div className={analyzing ? "opacity-60 transition-opacity" : ""}>
            <LineAnalysis
              analysis={analysis}
              season={season}
              onPlayerClick={(player) =>
                navigate(`/players/v2/${player.playerId}?season=${season}`)
              }
              onLoadUnit={handleLoadUnit}
            />
          </div>
        )}

        <Footer />
      </div>

      <PlayerPickerModal
        isOpen={pickerSlot != null}
        onClose={() => setPickerSlot(null)}
        position={position}
        season={season}
        pool={pool}
        loading={poolLoading}
        selectedIds={filledIds}
        onSelect={handleSelect}
      />
    </div>
  );
};
