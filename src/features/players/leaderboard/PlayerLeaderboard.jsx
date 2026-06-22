import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Trophy } from "lucide-react";
import { apiService } from "lib/api/apiService";
import { AppSelect } from "components/ui/AppSelect";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { seasonSpan } from "utils/season";
import { POSITIONS } from "./leaderboardConfig";
import { PlayerTable } from "./PlayerTable";

const positionLabel = (value) =>
  POSITIONS.find((p) => p.value === value)?.label || "Players";

export const PlayerLeaderboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const position = (searchParams.get("position") || "F").toUpperCase();
  const seasonParam = searchParams.get("season");

  const [data, setData] = useState(null);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Player Rankings | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await apiService.fetchLeaderboard(position, seasonParam);
        if (cancelled) return;
        setData(result);
        setAvailableSeasons(result.availableSeasons || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load rankings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [position, seasonParam]);

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => params.set(key, value));
    setSearchParams(params);
  };

  const handlePositionChange = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("position", value);
    params.delete("season");
    setSearchParams(params);
  };

  const sharedFieldClassName =
    "app-field px-4 py-3 text-base text-white light:text-gray-900 pr-10";

  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="max-w-6xl mx-auto relative z-10">
        <Header />

        <div className="space-y-5 sm:space-y-7">
          <div className="liquid-glass-strong rounded-[32px] p-5 sm:p-6 lg:p-7 fade-in-up">
            <div className="mb-5 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-[#7ee340] light:text-[#2e6e14]" />
              <h2 className="text-2xl font-bold tracking-display text-white light:text-gray-900">
                {positionLabel(position)} Rankings
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <AppSelect
                placeholder="Position"
                value={position}
                onChange={(e) => handlePositionChange(e.target.value)}
                className={sharedFieldClassName}
              >
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </AppSelect>
              <AppSelect
                placeholder="Season"
                value={data?.season ? String(data.season) : ""}
                onChange={(e) => updateParams({ season: e.target.value })}
                className={sharedFieldClassName}
              >
                {availableSeasons.map((year) => (
                  <option key={year} value={year}>
                    {seasonSpan(year)}
                  </option>
                ))}
              </AppSelect>
            </div>
          </div>

          {loading && (
            <div className="liquid-glass rounded-[28px] flex items-center justify-center gap-3 px-5 py-16 fade-in-up">
              <Loader2 className="h-8 w-8 animate-spin text-sky-300 light:text-sky-600" />
              <span className="text-lg font-medium">Loading rankings...</span>
            </div>
          )}

          {!loading && error && (
            <div className="liquid-glass rounded-[28px] px-5 py-10 text-center text-rose-400 light:text-rose-700 fade-in-up">
              {error}
            </div>
          )}

          {!loading && !error && data && data.players.length > 0 && (
            <PlayerTable players={data.players} position={data.position} />
          )}

          {!loading && !error && data && data.players.length === 0 && (
            <div className="liquid-glass rounded-[28px] px-5 py-10 text-center text-gray-300 light:text-slate-600 fade-in-up">
              No players available for this season.
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};
