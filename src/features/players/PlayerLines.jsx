import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Download,
  ListOrdered,
  Loader2,
  Share,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Header } from "components/layout/Header";
import { GeneralSearch } from "components/search/GeneralSearch";
import { Footer } from "components/layout/Footer";
import { AppSelect } from "components/ui/AppSelect";
import { ShareableModal } from "components/ui/ShareableModal";
import { useIsMobile } from "hooks/useIsMobile";
import { apiService } from "lib/api/apiService";
import { buildPageTitle } from "lib/analytics";
import { playerUtils } from "utils/playerUtils";
import {
  DEFAULT_SORT,
  PlayerLinesList,
  nextSort,
  sortUnits,
} from "features/players/components/lines/PlayerLinesList";
import { PlayerLinesShareablePreview } from "features/players/components/lines/PlayerLinesShareablePreview";
import {
  WithWithoutPanel,
  useWithWithout,
} from "features/players/components/lines/WithWithoutPanel";

const CAREER_OPTION = "career";
const MIN_LINE_MINUTES = 10;

const linesPagePath = (result) =>
  result.position === "Goalie"
    ? `/players/v2/${result.playerId}`
    : `/players/v2/${result.playerId}/lines?season=${result.latestSeason}`;
const TABS = [
  { id: "lines", icon: ListOrdered },
  { id: "wowy", label: "With / Without", icon: ArrowLeftRight },
];

const TabToggle = ({ activeTab, onSelect, linesLabel }) => (
  <div
    role="tablist"
    aria-label="Line views"
    className="inline-flex gap-1 self-start rounded-full bg-black/20 p-1 backdrop-blur-sm light:bg-white/80"
  >
    {TABS.map(({ id, label, icon: Icon }) => {
      const isActive = activeTab === id;
      return (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onSelect(id)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#7ee340] sm:px-5 sm:text-base ${
            isActive
              ? "bg-white/10 text-[#7ee340] light:bg-slate-900/10 light:text-[#2e6e14]"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-100 light:text-slate-700 light:hover:bg-slate-900/5 light:hover:text-slate-800"
          }`}
        >
          <Icon size={16} className="shrink-0" />
          {label || linesLabel}
        </button>
      );
    })}
  </div>
);

export const PlayerLines = () => {
  const { playerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const season = searchParams.get("season");
  const activeTab = searchParams.get("tab") === "wowy" ? "wowy" : "lines";
  const requestedTeammate = Number(searchParams.get("with")) || null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [mode, setMode] = useState("percentile");
  const [minMinutes, setMinMinutes] = useState(MIN_LINE_MINUTES);
  const [showShareable, setShowShareable] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService
      .fetchPlayerLinesV2(playerId, season)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [playerId, season]);

  useEffect(() => {
    setMinMinutes(MIN_LINE_MINUTES);
  }, [playerId, season]);

  const player = data?.player;
  const isCareer = data ? data.season == null : !season;
  const linesLabel =
    data?.unitType === "pairing" ? "All Pairings" : "All Lines";
  const teammates = data?.teammates || [];
  const teammate =
    teammates.find((option) => option.playerId === requestedTeammate) ||
    teammates[0] ||
    null;
  const wowy = useWithWithout(
    activeTab === "wowy" ? player?.playerId : null,
    teammate?.playerId,
    data?.season
  );
  const filteredUnits = (data?.units || []).filter(
    (unit) => unit.minutes >= minMinutes
  );
  const maxMinutes = Math.max(
    MIN_LINE_MINUTES,
    Math.ceil(Math.max(0, ...(data?.units || []).map((unit) => unit.minutes)))
  );
  const sortedUnits = sortUnits(filteredUnits, sort, mode);
  const shareablePlayer = player && {
    ...player,
    firstSeason: Math.min(...data.availableSeasons),
    lastSeason: Math.max(...data.availableSeasons),
  };
  const canShare =
    data && (activeTab === "lines" ? filteredUnits.length > 0 : wowy.result);

  useEffect(() => {
    if (!player) return;
    document.title = buildPageTitle(`${player.name} ${linesLabel}`);
  }, [player, linesLabel]);

  const updateParams = (changes) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value == null) params.delete(key);
      else params.set(key, String(value));
    });
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="ice-background min-h-screen px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <Header />

        <main className="space-y-5 sm:space-y-7">
          <div className="liquid-glass-strong relative z-50 grid grid-cols-1 gap-3 overflow-visible rounded-[32px] p-4 sm:grid-cols-[2fr_1fr] sm:items-center sm:gap-4 sm:p-5">
            <GeneralSearch
              bare
              compact
              scope="players"
              initialQuery={player?.name || ""}
              className="w-full"
              playerResultPath={linesPagePath}
            />
            {data && (
              <label className="block min-w-0">
                <span className="sr-only">Season</span>
                <AppSelect
                  value={isCareer ? CAREER_OPTION : String(data.season)}
                  onChange={(event) =>
                    updateParams({
                      season:
                        event.target.value === CAREER_OPTION
                          ? null
                          : event.target.value,
                      with: null,
                    })
                  }
                  className="app-field w-full px-4 py-3.5 pr-10 text-base normal-case tracking-normal text-white light:text-gray-900"
                >
                  <option value={CAREER_OPTION}>Career</option>
                  {data.availableSeasons.map((availableSeason) => (
                    <option key={availableSeason} value={availableSeason}>
                      {playerUtils.formatSeason(availableSeason)}
                    </option>
                  ))}
                </AppSelect>
              </label>
            )}
          </div>

          <section className="liquid-glass-strong flex items-center justify-between gap-4 rounded-[32px] p-5 sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              {player && (
                <img
                  src={playerUtils.getPlayerHeadshot(
                    player.playerId,
                    player.team,
                    player.season
                  )}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-full bg-zinc-950/55 object-cover shadow-lg light:bg-slate-700/45 sm:h-20 sm:w-20"
                  onError={(event) => {
                    event.target.src = playerUtils.getDefaultHeadshot();
                  }}
                />
              )}
              <div className="min-w-0">
                <Link
                  to={playerUtils.playerProfilePath(
                    playerId,
                    isCareer ? null : season
                  )}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 transition-colors hover:text-[#7ee340] light:text-slate-700 light:hover:text-[#2e6e14]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to profile
                </Link>
                <h1 className="mt-1 truncate text-2xl font-extrabold tracking-display text-white light:text-gray-900 sm:text-3xl">
                  {player ? player.name : "Player"} · {linesLabel}
                </h1>
                {player && (
                  <p className="text-sm text-gray-400 light:text-slate-600">
                    {isCareer
                      ? "Career, every season"
                      : `${playerUtils.getFullTeamName(player.team, player.season)} · ${playerUtils.formatSeason(player.season)}`}
                  </p>
                )}
              </div>
            </div>
            {canShare && (
              <button
                type="button"
                onClick={() => setShowShareable(true)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:text-white light:border-slate-300 light:bg-white/80 light:text-slate-700 light:hover:text-slate-900"
                aria-label={
                  isMobile ? "Share image" : "Download shareable image"
                }
              >
                {isMobile ? (
                  <Share className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            )}
          </section>

          <TabToggle
            activeTab={activeTab}
            linesLabel={linesLabel}
            onSelect={(tab) =>
              updateParams({ tab: tab === "wowy" ? "wowy" : null })
            }
          />

          {error && (
            <div className="liquid-glass-strong rounded-[32px] border border-rose-400/20 p-6 text-center">
              <p className="font-semibold text-rose-300 light:text-rose-700">
                {error}
              </p>
            </div>
          )}

          {loading && !data && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-sky-300 light:text-sky-600" />
            </div>
          )}

          {data && (
            <div className={loading ? "opacity-60 transition-opacity" : ""}>
              {activeTab === "lines" ? (
                <PlayerLinesList
                  units={filteredUnits}
                  minMinutes={minMinutes}
                  maxMinutes={maxMinutes}
                  onMinMinutesChange={setMinMinutes}
                  unitType={data.unitType}
                  isCareer={isCareer}
                  playerName={player?.name}
                  sort={sort}
                  mode={mode}
                  onSortChange={(key) =>
                    setSort((current) => nextSort(current, key))
                  }
                  onModeChange={setMode}
                />
              ) : (
                <WithWithoutPanel
                  player={data.player}
                  teammates={teammates}
                  teammate={teammate}
                  result={wowy.result}
                  loading={wowy.loading}
                  error={wowy.error}
                  onTeammateChange={(teammateId) =>
                    updateParams({ with: teammateId })
                  }
                />
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>

      <ShareableModal
        isOpen={showShareable}
        onClose={() => setShowShareable(false)}
        fileName={
          player
            ? `${player.name.replace(/\s+/g, "-")}-${activeTab === "wowy" ? "with-without" : linesLabel.replace(/\s+/g, "-").toLowerCase()}-${isCareer ? "career" : data.season}`
            : "player-lines"
        }
      >
        {data && (
          <PlayerLinesShareablePreview
            player={shareablePlayer}
            isCareer={isCareer}
            unitType={data.unitType}
            tab={activeTab}
            units={sortedUnits}
            minMinutes={minMinutes}
            sort={sort}
            mode={mode}
            teammate={teammate}
            wowy={wowy.result}
          />
        )}
      </ShareableModal>
    </div>
  );
};
