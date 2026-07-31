import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Target, Shield, Gauge, Loader2 } from "lucide-react";
import { track } from "@vercel/analytics";
import { apiService } from "lib/api/apiService";
import { SearchForm } from "features/players/components/SearchForm";
import { PlayerHeader } from "features/players/components/PlayerHeader";
import { StatsCard } from "features/players/components/StatsCard";
import { SimilarPlayersSection } from "features/players/components/SimilarPlayersSection";
import { WarPercentileCard } from "features/players/components/WarPercentileCard";
import { CountingStats } from "features/players/components/CountingStats";
import { EdgeStats } from "features/players/components/EdgeStats";
import { Header } from "components/layout/Header";
import { Analytics } from "@vercel/analytics/react";
import { useIsExternal } from "hooks/useIsExternal";
import { LoadingScreen } from "components/ui/LoadingScreen";
import { ShareableDisplay } from "features/players/components/shareable/ShareableDisplay";
import { ShareableModal } from "components/ui/ShareableModal";
import { Footer } from "components/layout/Footer";
import { TopPlayersSection } from "features/splash/components/TopPlayersSection";
export const Players = ({ enablePageLoadAnimations = true }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerName, setPlayerName] = useState("");
  const [season, setSeason] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializingCache, setInitializingCache] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Searching...");
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState("");
  const [noMatchSeason, setNoMatchSeason] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [filterYear, setFilterYear] = useState(null);
  const [initInProgress, setInitInProgress] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [showShareableModal, setShowShareableModal] = useState(false);
  const initInProgressRef = useRef(false);
  const isUpdatingFromUrlRef = useRef(false);
  const lastSearchParamsRef = useRef("");
  const playerHeaderRef = useRef(null);
  const isExternal = useIsExternal();
  const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );
  useEffect(() => {
    document.title = "Players | Blue Line Breakdown";
    checkHealth();
    initializeCacheInBackground();
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);
  useEffect(() => {
    if (isLocalhost && searchParams.toString()) {
      console.log(
        `https://blue-line-breakdown.vercel.app/players?${searchParams.toString()}`
      );
    }
  }, [isLocalhost, searchParams]);
  useEffect(() => {
    if (playerData?.player?.name) {
      document.title = `${playerData.player.name} | Blue Line Breakdown`;
    } else {
      document.title = "Players | Blue Line Breakdown";
    }
  }, [playerData?.player?.name]);
  useEffect(() => {
    if (playerHeaderRef.current) {
      const y =
        playerHeaderRef.current.getBoundingClientRect().top +
        window.pageYOffset -
        100;
      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  }, [playerData?.player?.name, playerData?.player?.season]);
  useEffect(() => {
    const currentParamsString = searchParams.toString();
    if (currentParamsString === lastSearchParamsRef.current) {
      return;
    }
    lastSearchParamsRef.current = currentParamsString;
    const urlPlayerName = searchParams.get("player");
    const urlSeason = searchParams.get("season");
    const urlPosition = searchParams.get("position");
    const urlFilterYear = searchParams.get("filterYear");
    if (isUpdatingFromUrlRef.current) {
      isUpdatingFromUrlRef.current = false;
      return;
    }
    if (urlPlayerName && urlPlayerName !== playerName)
      setPlayerName(urlPlayerName);
    if (urlSeason && urlSeason !== season) setSeason(urlSeason);
    if (urlPosition && urlPosition !== position) setPosition(urlPosition);
    if (urlFilterYear !== (filterYear || null)) {
      setFilterYear(urlFilterYear || null);
    }
    if (urlPlayerName && urlSeason && urlPosition) {
      performSearch(
        urlPlayerName,
        urlSeason,
        urlPosition,
        urlFilterYear || null
      );
    } else if (!urlPlayerName) {
      setPlayerData(null);
    }
  }, [searchParams]);
  const checkHealth = async () => {
    try {
      await apiService.healthCheck();
    } catch (err) {}
  };
  const initializeCacheInBackground = async () => {
    try {
      setInitInProgress(true);
      initInProgressRef.current = true;
      const cacheStatus = await apiService.checkCacheStatus();
      if (!cacheStatus.dataLoaded && !cacheStatus.cacheExists) {
        const initResponse = await apiService.initializeCache();
        if (initResponse.status === "loading") {
          let timeoutId;
          await new Promise((resolve) => {
            const checkStatus = async () => {
              try {
                const status = await apiService.checkCacheStatus();
                if (status.dataLoaded || status.cacheExists) {
                  if (timeoutId) clearTimeout(timeoutId);
                  setInitInProgress(false);
                  initInProgressRef.current = false;
                  resolve();
                } else {
                  timeoutId = setTimeout(checkStatus, 30000);
                }
              } catch (err) {
                if (timeoutId) clearTimeout(timeoutId);
                setInitInProgress(false);
                initInProgressRef.current = false;
                resolve();
              }
            };
            checkStatus();
          });
        } else {
          setInitInProgress(false);
          initInProgressRef.current = false;
        }
      } else {
        setInitInProgress(false);
        initInProgressRef.current = false;
      }
    } catch (err) {
      setInitInProgress(false);
      initInProgressRef.current = false;
    }
  };
  const ensureCacheInitialized = async (showLoading = false) => {
    if (initInProgressRef.current && showLoading) {
      setInitializingCache(true);
      const messages = [
        "Searching...",
        "Hold on, we need to refresh the data...",
        "Turning on the lights...",
        "Zamboni resurfacing the ice...",
        "Players warming up...",
        "Coaches reviewing the game plan...",
        "Referees checking the lines...",
        "Almost ready...",
      ];
      setLoadingMessage(messages[0]);
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        if (messageIndex < messages.length - 1) {
          messageIndex++;
          setLoadingMessage(messages[messageIndex]);
        } else {
          messageIndex = 0;
          setLoadingMessage(messages[0]);
        }
      }, 6000);
      while (initInProgressRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      clearInterval(messageInterval);
      setInitializingCache(false);
      setLoadingMessage("Searching...");
      return;
    }
    if (!hasSearched) {
      const cacheStatus = await apiService.checkCacheStatus();
      if (!cacheStatus.dataLoaded && !cacheStatus.cacheExists) {
        setInitializingCache(true);
        const messages = [
          "Hold on, we need to refresh the data...",
          "Turning on the lights...",
          "Zamboni resurfacing the ice...",
          "Players warming up...",
          "Coaches reviewing the game plan...",
          "Referees checking the lines...",
          "Almost ready...",
        ];
        setLoadingMessage(messages[0]);
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
          if (messageIndex < messages.length - 1) {
            messageIndex++;
            setLoadingMessage(messages[messageIndex]);
          } else {
            messageIndex = 0;
            setLoadingMessage(messages[0]);
          }
        }, 6000);
        try {
          setInitInProgress(true);
          initInProgressRef.current = true;
          const initResponse = await apiService.initializeCache();
          if (initResponse.status === "loading") {
            let timeoutId;
            await new Promise((resolve) => {
              const checkStatus = async () => {
                try {
                  const status = await apiService.checkCacheStatus();
                  if (status.dataLoaded || status.cacheExists) {
                    if (timeoutId) clearTimeout(timeoutId);
                    clearInterval(messageInterval);
                    setInitializingCache(false);
                    setLoadingMessage("Searching...");
                    setInitInProgress(false);
                    initInProgressRef.current = false;
                    resolve();
                  } else {
                    timeoutId = setTimeout(checkStatus, 30000);
                  }
                } catch (err) {
                  if (timeoutId) clearTimeout(timeoutId);
                  clearInterval(messageInterval);
                  setInitializingCache(false);
                  setLoadingMessage("Searching...");
                  setInitInProgress(false);
                  initInProgressRef.current = false;
                  resolve();
                }
              };
              checkStatus();
            });
          } else {
            setInitInProgress(false);
            initInProgressRef.current = false;
          }
        } finally {
          clearInterval(messageInterval);
          setInitializingCache(false);
          setLoadingMessage("Searching...");
        }
      }
    }
  };
  const performSearch = async (
    name,
    seasonValue,
    positionValue,
    filterYearValue
  ) => {
    setLoading(true);
    setError("");
    setSuggestions([]);
    setNoMatchSeason(null);
    try {
      await ensureCacheInitialized(initInProgressRef.current);
      const result = await apiService.searchPlayer(
        name,
        seasonValue,
        positionValue,
        9,
        filterYearValue
      );
      setPlayerData(result);
      setError("");
      setSuggestions([]);
      setNoMatchSeason(null);
      setHasSearched(true);
      setRenderKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
      setSuggestions(err.suggestions || []);
      setPlayerData(null);
      setNoMatchSeason(seasonValue || null);
    } finally {
      setLoading(false);
      isUpdatingFromUrlRef.current = false;
    }
  };
  const updateSearchParams = (
    name,
    seasonValue,
    positionValue,
    filterYearValue
  ) => {
    const params = new URLSearchParams();
    if (name) params.set("player", name);
    if (seasonValue) params.set("season", seasonValue);
    if (positionValue) params.set("position", positionValue);
    if (filterYearValue) params.set("filterYear", filterYearValue);
    const paramsString = params.toString();
    if (paramsString !== lastSearchParamsRef.current) {
      isUpdatingFromUrlRef.current = true;
      lastSearchParamsRef.current = paramsString;
      setSearchParams(params, {
        replace: false,
      });
    }
  };
  const handleSearch = async () => {
    if (!playerName.trim()) {
      setError("Please enter a player name");
      return;
    }
    if (!season) {
      setError("Please select a season");
      return;
    }
    if (!position) {
      setError("Please select a position");
      return;
    }
    updateSearchParams(playerName, season, position, filterYear);
    track("player_search", {
      player: playerName,
      season,
      position,
      filterYear,
    });
    await performSearch(playerName, season, position, filterYear);
  };
  const handleSimilarPlayerClick = async (player) => {
    let normalizedPosition = "F";
    if (player.position) {
      const pos = player.position.toUpperCase();
      if (pos === "D") {
        normalizedPosition = "D";
      } else if (pos === "G") {
        normalizedPosition = "G";
      } else {
        normalizedPosition = "F";
      }
    } else if (position) {
      normalizedPosition = position;
    }
    setPlayerName(player.name);
    setSeason(player.season.toString());
    setPosition(normalizedPosition);
    setFilterYear(null);
    updateSearchParams(
      player.name,
      player.season.toString(),
      normalizedPosition,
      null
    );
    await performSearch(
      player.name,
      player.season.toString(),
      normalizedPosition,
      null
    );
  };
  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      {isExternal && initInProgress ? (
        <LoadingScreen />
      ) : (
        <>
          <>
            {loading && (
              <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/72 backdrop-blur-sm light:bg-black/30">
                <div className="app-modal-panel liquid-glass-strong flex flex-col items-center gap-4 rounded-[30px] p-8">
                  <Loader2 className="h-12 w-12 animate-spin text-sky-300 light:text-sky-600" />
                  <p className="text-lg font-medium text-white light:text-gray-900">
                    {loadingMessage}
                  </p>
                </div>
              </div>
            )}
            <div className="max-w-6xl mx-auto relative z-10">
              <Header />
              <Analytics />
              <div className="space-y-5 sm:space-y-7">
                <div className="relative z-10">
                  <SearchForm
                    playerName={playerName}
                    setPlayerName={setPlayerName}
                    season={season}
                    setSeason={setSeason}
                    position={position}
                    setPosition={setPosition}
                    onSearch={handleSearch}
                    loading={loading}
                    error={error}
                    suggestions={suggestions}
                    enablePageLoadAnimation={enablePageLoadAnimations}
                    onSuggestionClick={async (suggestionName) => {
                      setPlayerName(suggestionName);
                      updateSearchParams(
                        suggestionName,
                        season,
                        position,
                        filterYear
                      );
                      await performSearch(
                        suggestionName,
                        season,
                        position,
                        filterYear
                      );
                    }}
                  />
                </div>

                {playerData && (
                  <div
                    className="relative z-0 space-y-5 sm:space-y-7"
                    ref={playerHeaderRef}
                    key={renderKey}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-stretch gap-4 sm:gap-6">
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
                          warPercentile={playerData.player.warPercentile}
                        />
                      </div>
                    </div>
                    <div className="w-full">
                      <CountingStats stats={playerData.stats} />
                      {playerData.player.position !== "G" && playerData.edgeValues && (
                        <EdgeStats
                          edgeValues={playerData.edgeValues}
                          edgePercentiles={playerData.percentiles.edge}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {playerData.player.position === "G" ? (
                        <>
                          <StatsCard
                            title="Shot Stopping"
                            icon={Target}
                            stats={playerData.percentiles.shotStopping}
                            allPercentiles={playerData.percentiles}
                            type="shotStopping"
                          />
                          <StatsCard
                            title="Workload"
                            icon={Shield}
                            stats={playerData.percentiles.workload}
                            type="workload"
                          />
                        </>
                      ) : (
                        <>
                          <StatsCard
                            title="Offensive Metrics"
                            icon={Target}
                            stats={playerData.percentiles.offensive}
                            allPercentiles={playerData.percentiles}
                            type="offensive"
                          />
                          <StatsCard
                            title="Defensive Metrics"
                            icon={Shield}
                            stats={playerData.percentiles.defensive}
                            type="defensive"
                          />
                        </>
                      )}
                    </div>



                    <SimilarPlayersSection
                      players={playerData.similarPlayers}
                      onPlayerClick={handleSimilarPlayerClick}
                      filterYear={filterYear}
                      onFilterYearChange={async (year) => {
                        setFilterYear(year);
                        if (playerName) {
                          updateSearchParams(
                            playerName,
                            season,
                            position,
                            year || null
                          );
                          await performSearch(
                            playerName,
                            season,
                            position,
                            year || null
                          );
                        }
                      }}
                    />
                  </div>
                )}

                {!playerData && !loading && (
                  <div className="relative z-0 space-y-5 sm:space-y-7">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <TopPlayersSection
                        title="Top Forwards"
                        position="F"
                        seasonFilter={noMatchSeason}
                        className="fade-in-up"
                      />
                      <TopPlayersSection
                        title="Top Defensemen"
                        position="D"
                        seasonFilter={noMatchSeason}
                        className="fade-in-up"
                      />
                      <TopPlayersSection
                        title="Top Goalies"
                        position="G"
                        seasonFilter={noMatchSeason}
                        className="fade-in-up"
                      />
                    </div>
                  </div>
                )}
              </div>
              <Footer />
            </div>
          </>

          <ShareableModal
            isOpen={showShareableModal}
            onClose={() => setShowShareableModal(false)}
            fileName={
              playerData
                ? `${playerData.player.name.replace(/\s+/g, "-")}-${playerData.player.season}`
                : "player-shareable"
            }
          >
            <ShareableDisplay playerData={playerData} />
          </ShareableModal>
        </>
      )}
    </div>
  );
};
