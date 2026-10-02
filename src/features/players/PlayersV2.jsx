import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Loader2, Shield, Target } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { GeneralSearch } from "components/search/GeneralSearch";
import { AppSelect } from "components/ui/AppSelect";
import { ShareableModal } from "components/ui/ShareableModal";
import { apiService } from "lib/api/apiService";
import { buildPageTitle, trackEvent, trackPageView } from "lib/analytics";
import { playerUtils } from "utils/playerUtils";
import { CareerSeasonsTable } from "features/players/components/CareerSeasonsTable";
import { CountingStats } from "features/players/components/CountingStats";
import { EdgeStats } from "features/players/components/EdgeStats";
import { ImpactTrendCard } from "features/players/components/ImpactTrendCard";
import { PlayerHeader } from "features/players/components/PlayerHeader";
import { PlayerQualityCard } from "features/players/components/PlayerQualityCard";
import { PlayerTendenciesCard } from "features/players/components/PlayerTendenciesCard";
import { SimilarPlayersSection } from "features/players/components/SimilarPlayersSection";
import { WarPercentileCard } from "features/players/components/WarPercentileCard";
import { TopPlayersSection } from "features/splash/components/TopPlayersSection";
import { PlayerProfileShareablePreview } from "features/players/components/shareable/PlayerProfileShareablePreview";

const CAREER_OPTION = "career";

const IMPACT_TOOLTIPS = {
  goalie: {
    title: "5-on-5 Goaltending Impact",
    season:
      "Season impact from save quality, goals saved above expected, danger-tier performance, and workload, ranked against eligible goalies.",
    combined:
      "Early-season impact blends this season and last season, each ranked against eligible goalies and weighted by ice time.",
  },
  skater: {
    title: "5-on-5 Player Impact",
    season:
      "Season impact from Game Score rate, total contribution, and role-aware offensive and defensive quality, ranked against eligible players at the same position.",
    combined:
      "Early-season impact blends this season and last season, each ranked against eligible players at the same position and weighted by ice time.",
  },
};

export const PlayersV2 = () => {
  const { playerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(Boolean(playerId));
  const [error, setError] = useState("");
  const [showShareableModal, setShowShareableModal] = useState(false);
  const [goalieShotMap, setGoalieShotMap] = useState(null);
  const lastTrackedRef = useRef(null);

  const season = searchParams.get("season");
  const similarSeason = searchParams.get("similarSeason");
  const isCareerRequest = Boolean(playerId) && !season;
  const isCareer = Boolean(playerData?.isCareer);
  const isGoalie = playerData?.player?.position === "G";
  const impactTooltip = isGoalie
    ? IMPACT_TOOLTIPS.goalie
    : IMPACT_TOOLTIPS.skater;
  const combined = isCareer ? null : playerData?.combined || null;
  const currentSeason = playerData?.currentSeason ?? null;
  const isBlended = (combined?.seasons?.length ?? 0) > 1;
  const qualitySubtitle = isCareer
    ? "career percentile, weighted by ice time"
    : isBlended
      ? "percentile across both seasons, weighted by ice time"
      : undefined;

  useEffect(() => {
    const reportPageView = (trackingKey, pageTitle) => {
      document.title = pageTitle;
      if (lastTrackedRef.current === trackingKey) return false;
      lastTrackedRef.current = trackingKey;
      trackPageView(pageTitle);
      return true;
    };

    if (!playerId) {
      setPlayerData(null);
      setLoading(false);
      setError("");
      reportPageView("browse", buildPageTitle("Player Profiles"));
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    const profileRequest = isCareerRequest
      ? apiService.fetchPlayerCareerV2(playerId)
      : apiService.fetchPlayerProfileV2(playerId, season, similarSeason);
    profileRequest
      .then((response) => {
        if (cancelled) return;
        setPlayerData({ ...response, isCareer: isCareerRequest });
        const { player } = response;
        const viewKey = isCareerRequest ? "career" : player.season;
        const isNewView = reportPageView(
          `player:${playerId}:${viewKey}`,
          buildPageTitle(player.name)
        );
        if (isNewView) {
          trackEvent("player_view", {
            player: player.name,
            player_id: String(playerId),
            season: isCareerRequest ? "career" : player.season,
            position: player.position,
            team: player.team,
            datetime: new Date().toISOString(),
          });
        }
      })
      .catch((requestError) => {
        if (cancelled) return;
        setPlayerData(null);
        setError(requestError.message);
        reportPageView(
          `player-error:${playerId}`,
          buildPageTitle("Player Profiles")
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId, season, similarSeason, isCareerRequest]);

  const shotMapSeason =
    isGoalie && !isCareer ? (playerData?.player?.season ?? null) : null;

  useEffect(() => {
    setGoalieShotMap(null);
    if (!playerId || shotMapSeason == null) return undefined;
    let cancelled = false;
    apiService
      .fetchGoalieShotMap(playerId, shotMapSeason)
      .then((shotMap) => {
        if (!cancelled) setGoalieShotMap(shotMap);
      })
      .catch(() => {
        if (!cancelled) setGoalieShotMap(null);
      });
    return () => {
      cancelled = true;
    };
  }, [playerId, shotMapSeason]);

  useEffect(
    () => () => {
      document.title = buildPageTitle();
    },
    []
  );

  const shareFileName = useMemo(() => {
    if (!playerData) return "player-profile";
    const slug = playerData.player.name.replace(/\s+/g, "-").toLowerCase();
    return `${slug}-${playerData.isCareer ? "career" : playerData.player.season}`;
  }, [playerData]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, String(value));
    else params.delete(key);
    setSearchParams(params);
  };

  const handleSeasonChange = (value) => {
    const params = new URLSearchParams(searchParams);
    params.delete("similarSeason");
    if (value === CAREER_OPTION) params.delete("season");
    else params.set("season", String(value));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const similarCareerHref = (player) =>
    playerUtils.playerProfilePath(player.playerId);
  const similarSeasonHref = (player) =>
    playerUtils.playerProfilePath(player.playerId, player.season);

  const qualityCards = playerData && (
    <>
      <PlayerQualityCard
        title={isGoalie ? "Goaltending Quality" : "Offensive Quality"}
        icon={Target}
        stats={
          isGoalie
            ? playerData.quality.goaltending
            : playerData.quality.offensive
        }
        type={isGoalie ? "shotStopping" : "offensive"}
        subtitle={qualitySubtitle}
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
        subtitle={qualitySubtitle}
      />
    </>
  );

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
                className="w-full"
              />
              {playerData && (
                <label className="block w-full">
                  <span className="sr-only">Season</span>
                  <AppSelect
                    placeholder="Season"
                    value={
                      isCareer
                        ? CAREER_OPTION
                        : String(playerData.player.season)
                    }
                    onChange={(event) => handleSeasonChange(event.target.value)}
                    className="app-field w-full px-4 py-3.5 pr-10 text-base normal-case tracking-normal text-white light:text-gray-900"
                  >
                    <option value={CAREER_OPTION}>Career</option>
                    {playerData.availableSeasons.map((availableSeason) => (
                      <option key={availableSeason} value={availableSeason}>
                        {playerUtils.formatSeasonLabel(
                          availableSeason,
                          currentSeason
                        )}
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
                  <div className="w-full min-w-0 lg:flex lg:flex-1">
                    <PlayerHeader
                      player={playerData.player}
                      biometrics={playerData.biometrics}
                      isCareer={isCareer}
                      combined={combined}
                      currentSeason={currentSeason}
                      onShareClick={() => setShowShareableModal(true)}
                    />
                  </div>
                  <div className="w-full shrink-0 lg:flex lg:w-96">
                    {isCareer ? (
                      <ImpactTrendCard
                        trend={playerData.impactTrend}
                        currentSeason={currentSeason}
                        role={playerData.player.role}
                        tooltipTitle={impactTooltip.title}
                        onSeasonClick={handleSeasonChange}
                      />
                    ) : (
                      <WarPercentileCard
                        role={playerData.player.role}
                        warPercentile={
                          playerData.player.impactPercentile ??
                          playerData.player.warPercentile
                        }
                        tooltipTitle={impactTooltip.title}
                        tooltipText={
                          isBlended
                            ? impactTooltip.combined
                            : impactTooltip.season
                        }
                      />
                    )}
                  </div>
                </div>
                <CountingStats stats={playerData.stats} />
              </section>

              <section className="space-y-4 sm:space-y-6">
                {goalieShotMap ? (
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="md:col-span-2 lg:col-span-1">
                      <PlayerTendenciesCard
                        tendencies={playerData.tendencies}
                        shotMap={goalieShotMap}
                      />
                    </div>
                    {qualityCards}
                  </div>
                ) : (
                  <>
                    <PlayerTendenciesCard tendencies={playerData.tendencies} />
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                      {qualityCards}
                    </div>
                  </>
                )}
              </section>

              {isCareer ? (
                <section className="space-y-4 sm:space-y-6">
                  <SimilarPlayersSection
                    players={playerData.similarCareers || []}
                    playerHref={similarCareerHref}
                    onPlayerClick={scrollToTop}
                    title="Most Similar Careers"
                    tooltipTitle="Career Similarity"
                    tooltipText="Careers are compared on ice-time-weighted playing style and impact across every eligible season, plus peak impact, longevity and per-game production, against the same position."
                  />
                  <CareerSeasonsTable
                    seasons={playerData.seasons}
                    currentSeason={currentSeason}
                    isGoalie={isGoalie}
                    onSeasonClick={handleSeasonChange}
                  />
                </section>
              ) : (
                <section className="space-y-4 sm:space-y-6">
                  {!isGoalie && (
                    <EdgeStats
                      edgeValues={playerData.edgeValues}
                      edgePercentiles={playerData.edgePercentiles}
                    />
                  )}
                  <SimilarPlayersSection
                    players={playerData.similarPlayers || []}
                    playerHref={similarSeasonHref}
                    onPlayerClick={scrollToTop}
                    filterYear={similarSeason}
                    onFilterYearChange={(value) =>
                      updateParam("similarSeason", value)
                    }
                  />
                </section>
              )}
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
            isCareer={isCareer}
            combined={combined}
            currentSeason={currentSeason}
            impactTrend={playerData.impactTrend}
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
            edgeValues={isCareer ? null : playerData.edgeValues}
            edgePercentiles={isCareer ? null : playerData.edgePercentiles}
            similarPlayers={
              (isCareer
                ? playerData.similarCareers
                : playerData.similarPlayers) || []
            }
          />
        )}
      </ShareableModal>
    </div>
  );
};
