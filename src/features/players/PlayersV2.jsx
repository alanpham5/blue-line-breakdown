import { useEffect, useMemo, useState } from "react";
import { Activity, Loader2, Shield, Target } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { GeneralSearch } from "components/search/GeneralSearch";
import { AppSelect } from "components/ui/AppSelect";
import { ShareableModal } from "components/ui/ShareableModal";
import { apiService } from "lib/api/apiService";
import { playerUtils } from "utils/playerUtils";
import { CountingStats } from "features/players/components/CountingStats";
import { EdgeStats } from "features/players/components/EdgeStats";
import { PlayerHeader } from "features/players/components/PlayerHeader";
import { PlayerQualityCard } from "features/players/components/PlayerQualityCard";
import { PlayerTendenciesCard } from "features/players/components/PlayerTendenciesCard";
import { SimilarPlayersSection } from "features/players/components/SimilarPlayersSection";
import { WarPercentileCard } from "features/players/components/WarPercentileCard";
import { TopPlayersSection } from "features/splash/components/TopPlayersSection";
import { PlayerProfileShareablePreview } from "features/players/components/shareable/PlayerProfileShareablePreview";

export const PlayersV2 = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(Boolean(playerId));
  const [error, setError] = useState("");
  const [showShareableModal, setShowShareableModal] = useState(false);

  const season = searchParams.get("season");
  const similarSeason = searchParams.get("similarSeason");
  const isGoalie = playerData?.player?.position === "G";

  useEffect(() => {
    if (!playerId) {
      setPlayerData(null);
      setLoading(false);
      setError("");
      document.title = "Player Profiles | Blue Line Breakdown";
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    apiService
      .fetchPlayerProfileV2(playerId, season, similarSeason)
      .then((response) => {
        if (cancelled) return;
        setPlayerData(response);
        document.title = `${response.player.name} | Blue Line Breakdown`;
        if (!season && response.player.season) {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.set("season", String(response.player.season));
          setSearchParams(nextParams, { replace: true });
        }
      })
      .catch((requestError) => {
        if (cancelled) return;
        setPlayerData(null);
        setError(requestError.message);
        document.title = "Player Profiles | Blue Line Breakdown";
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId, season, similarSeason, searchParams, setSearchParams]);

  useEffect(
    () => () => {
      document.title = "Blue Line Breakdown";
    },
    []
  );

  const shareFileName = useMemo(() => {
    if (!playerData) return "player-profile";
    return `${playerData.player.name.replace(/\s+/g, "-").toLowerCase()}-${
      playerData.player.season
    }`;
  }, [playerData]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, String(value));
    else params.delete(key);
    setSearchParams(params);
  };

  const handleSimilarPlayerClick = (player) => {
    navigate(`/players/v2/${player.playerId}?season=${player.season}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="ice-background min-h-screen px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      {loading && (
        <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/72 backdrop-blur-sm light:bg-black/30">
          <div className="app-modal-panel liquid-glass-strong flex flex-col items-center gap-4 rounded-[30px] p-8">
            <Loader2 className="h-12 w-12 animate-spin text-sky-300 light:text-sky-600" />
            <p className="text-lg font-medium text-white light:text-gray-900">
              Loading player profile…
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-6xl">
        <Header />

        <main className="space-y-5 sm:space-y-7">
          {playerId ? (
            <div className="liquid-glass-strong relative z-50 grid grid-cols-1 gap-3 overflow-visible rounded-[32px] p-4 sm:grid-cols-[2fr_1fr] sm:items-center sm:gap-4 sm:p-5">
              <GeneralSearch
                bare
                compact
                scope="players"
                initialQuery={playerData?.player?.name || ""}
                targetSeason={playerData?.player?.season || season}
                className="w-full"
              />
              {playerData && (
                <label className="block w-full">
                  <span className="sr-only">Season</span>
                  <AppSelect
                    placeholder="Season"
                    value={String(playerData.player.season)}
                    onChange={(event) =>
                      updateParam("season", event.target.value)
                    }
                    className="app-field w-full px-4 py-3.5 pr-10 text-base normal-case tracking-normal text-white light:text-gray-900"
                  >
                    {playerData.availableSeasons.map((availableSeason) => (
                      <option key={availableSeason} value={availableSeason}>
                        {playerUtils.formatSeason(availableSeason)}
                      </option>
                    ))}
                  </AppSelect>
                </label>
              )}
            </div>
          ) : (
            <>
              <GeneralSearch scope="players" />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <TopPlayersSection
                  title="Top Forwards"
                  position="F"
                  className="fade-in-up"
                />
                <TopPlayersSection
                  title="Top Defensemen"
                  position="D"
                  className="fade-in-up"
                />
                <TopPlayersSection
                  title="Top Goalies"
                  position="G"
                  className="fade-in-up"
                />
              </div>
            </>
          )}

          {error && (
            <div className="liquid-glass-strong rounded-[32px] border border-rose-400/20 p-6 text-center">
              <p className="font-semibold text-rose-300 light:text-rose-700">
                {error}
              </p>
              <p className="mt-1 text-sm text-gray-400 light:text-gray-600">
                Check that the local player data files have been generated and
                the API is running.
              </p>
            </div>
          )}

          {playerData && (
            <>
              <section
                className="space-y-4 sm:space-y-6"
                aria-label="Player overview"
              >
                <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-stretch">
                  <div className="w-full min-w-0 lg:flex-1">
                    <PlayerHeader
                      player={playerData.player}
                      biometrics={playerData.biometrics}
                      onShareClick={() => setShowShareableModal(true)}
                    />
                  </div>
                  <div className="w-full shrink-0 lg:flex lg:w-96 lg:items-center">
                    <WarPercentileCard
                      role={playerData.player.role}
                      warPercentile={
                        playerData.player.impactPercentile ??
                        playerData.player.warPercentile
                      }
                      tooltipTitle={
                        isGoalie
                          ? "5-on-5 Goaltending Impact"
                          : "5-on-5 Player Impact"
                      }
                      tooltipText={
                        isGoalie
                          ? "Season impact from save quality, goals saved above expected, danger-tier performance, and workload, ranked against eligible goalies."
                          : "Season impact from Game Score rate, total contribution, and role-aware offensive and defensive quality, ranked against eligible players at the same position."
                      }
                    />
                  </div>
                </div>
                <CountingStats stats={playerData.stats} />
              </section>

              <section className="space-y-4 sm:space-y-6">
                <PlayerTendenciesCard tendencies={playerData.tendencies} />
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  <PlayerQualityCard
                    title={
                      isGoalie ? "Goaltending Quality" : "Offensive Quality"
                    }
                    icon={Target}
                    stats={
                      isGoalie
                        ? playerData.quality.goaltending
                        : playerData.quality.offensive
                    }
                    type={isGoalie ? "shotStopping" : "offensive"}
                  />
                  <PlayerQualityCard
                    title={isGoalie ? "Shots Faced" : "Defensive Quality"}
                    icon={isGoalie ? Activity : Shield}
                    stats={
                      isGoalie
                        ? playerData.quality.shotsFaced
                        : playerData.quality.defensive
                    }
                    type={isGoalie ? "workload" : "defensive"}
                  />
                </div>
              </section>

              <section className="space-y-4 sm:space-y-6">
                {!isGoalie && (
                  <EdgeStats
                    edgeValues={playerData.edgeValues}
                    edgePercentiles={playerData.edgePercentiles}
                  />
                )}
                <SimilarPlayersSection
                  players={playerData.similarPlayers || []}
                  onPlayerClick={handleSimilarPlayerClick}
                  filterYear={similarSeason}
                  onFilterYearChange={(value) =>
                    updateParam("similarSeason", value)
                  }
                />
              </section>
            </>
          )}
        </main>

        <Footer />
      </div>

      <ShareableModal
        isOpen={showShareableModal}
        onClose={() => setShowShareableModal(false)}
        fileName={shareFileName}
      >
        {playerData && (
          <PlayerProfileShareablePreview
            player={playerData.player}
            biometrics={playerData.biometrics}
            tendencies={playerData.tendencies}
            offensiveQuality={
              isGoalie
                ? playerData.quality.goaltending
                : playerData.quality.offensive
            }
            defensiveQuality={
              isGoalie
                ? playerData.quality.shotsFaced
                : playerData.quality.defensive
            }
            stats={playerData.stats}
            edgeValues={playerData.edgeValues}
            edgePercentiles={playerData.edgePercentiles}
            similarPlayers={playerData.similarPlayers || []}
          />
        )}
      </ShareableModal>
    </div>
  );
};
