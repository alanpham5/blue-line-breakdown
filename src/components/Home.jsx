import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Target, Shield, Loader2 } from "lucide-react";
import { apiService } from "../services/apiService";
import { SearchForm } from "./SearchForm";
import { PlayerHeader } from "./PlayerHeader";
import { StatsCard } from "./StatsCard";
import { SimilarPlayersSection } from "./SimilarPlayersSection";
import { Analytics } from "@vercel/analytics/react";

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerName, setPlayerName] = useState("");
  const [season, setSeason] = useState(
    (new Date().getFullYear() - 1).toString()
  );
  const [position, setPosition] = useState("F");
  const [loading, setLoading] = useState(false);
  const [initializingCache, setInitializingCache] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Searching...");
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filterYear, setFilterYear] = useState(null);
  const [initInProgress, setInitInProgress] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const initInProgressRef = useRef(false);
  const isUpdatingFromUrlRef = useRef(false);
  const lastSearchParamsRef = useRef("");

  useEffect(() => {
    checkHealth();
    initializeCacheInBackground();
  }, []);

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

    const defaultSeason = (new Date().getFullYear() - 1).toString();
    const defaultPosition = "F";

    if (urlPlayerName && urlPlayerName !== playerName)
      setPlayerName(urlPlayerName);
    if (urlSeason && urlSeason !== season) setSeason(urlSeason);
    if (urlPosition && urlPosition !== position) setPosition(urlPosition);
    if (urlFilterYear !== (filterYear || null)) {
      setFilterYear(urlFilterYear || null);
    }

    if (urlPlayerName) {
      performSearch(
        urlPlayerName,
        urlSeason || season || defaultSeason,
        urlPosition || position || defaultPosition,
        urlFilterYear || null
      );
    } else {
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
      if (!cacheStatus.dataLoaded) {
        const initResponse = await apiService.initializeCache();

        if (initResponse.status === "loading") {
          let timeoutId;
          await new Promise((resolve) => {
            const checkStatus = async () => {
              const status = await apiService.checkCacheStatus();
              if (status.dataLoaded) {
                if (timeoutId) clearTimeout(timeoutId);
                setInitInProgress(false);
                initInProgressRef.current = false;
                resolve();
              } else {
                timeoutId = setTimeout(checkStatus, 30000);
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
                const status = await apiService.checkCacheStatus();
                if (status.dataLoaded) {
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
      setHasSearched(true);
    } catch (err) {
      setError(err.message);
      setSuggestions(err.suggestions || []);
      setPlayerData(null);
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
      setSearchParams(params, { replace: false });
    }
  };

  const handleSearch = async () => {
    if (!playerName.trim()) {
      setError("Please enter a player name");
      return;
    }

    updateSearchParams(playerName, season, position, filterYear);
    await performSearch(playerName, season, position, filterYear);
  };

  const handleSimilarPlayerClick = async (player) => {
    let normalizedPosition = "F";
    if (player.position) {
      normalizedPosition = player.position.toUpperCase() === "D" ? "D" : "F";
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
    <div className="min-h-screen ice-background text-white p-4 sm:p-6">
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="liquid-glass rounded-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-white text-lg font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-end mb-4 sm:mb-0 sm:absolute sm:top-0 sm:right-0 relative">
            <Link
              to="/about"
              className="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 px-4 sm:py-2.5 sm:px-5 rounded-full transition-all duration-300 backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 text-sm sm:text-base"
            >
              About
            </Link>
          </div>
          <div className="text-center">
            <Link
              to="/"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-3 cursor-pointer">
                <img
                  src="/blb-dark.png"
                  alt="Blue Line Breakdown"
                  className="w-16 h-16"
                />
                <span>Blue Line Breakdown</span>
              </h1>
            </Link>
            <p className="text-gray-400 text-sm sm:text-base">
              Using player metrics to break down styles and uncover true on-ice
              comparisons.
            </p>
          </div>
        </div>
        <Analytics />

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
          onSuggestionClick={async (suggestionName) => {
            setPlayerName(suggestionName);
            updateSearchParams(suggestionName, season, position, filterYear);
            await performSearch(suggestionName, season, position, filterYear);
          }}
        />

        {playerData && (
          <div className="space-y-4 sm:space-y-6">
            <PlayerHeader
              player={playerData.player}
              biometrics={playerData.biometrics}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
          <div className="text-center text-gray-400 mt-8 sm:mt-12 px-2">
            <p className="text-base sm:text-lg mb-2">
              Enter a player name to get started
            </p>
            <p className="text-xs sm:text-sm">
              Using advanced analytics from Moneypuck data (2008-
              {new Date().getFullYear() - 1})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
