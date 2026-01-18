import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Target, Shield, Loader2 } from "lucide-react";
import { apiService } from "../services/apiService";
import { SearchForm } from "./SearchForm";
import { PlayerHeader } from "./PlayerHeader";
import { StatsCard } from "./StatsCard";
import { SimilarPlayersSection } from "./SimilarPlayersSection";
import { Analytics } from "@vercel/analytics/react"

export const Home = () => {
  const [playerName, setPlayerName] = useState("");
  const [season, setSeason] = useState((new Date().getFullYear() - 1).toString());
  const [position, setPosition] = useState("F");
  const [loading, setLoading] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filterYear, setFilterYear] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      await apiService.healthCheck();
    } catch (err) {
    }
  };

  const ensureCacheInitialized = async () => {
    const cacheStatus = await apiService.checkCacheStatus();
    if (!cacheStatus.dataLoaded) {
      await apiService.initializeCache();
    }
  };

  const handleSearch = async () => {
    if (!playerName.trim()) {
      setError("Please enter a player name");
      return;
    }

    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      await ensureCacheInitialized();

      const result = await apiService.searchPlayer(
        playerName,
        season,
        position,
        7,
        filterYear,
      );

      setPlayerData(result);
      setError("");
      setSuggestions([]);
    } catch (err) {
      setError(err.message);
      setSuggestions(err.suggestions || []);
      setPlayerData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSimilarPlayerClick = async (player) => {
    let normalizedPosition = 'F';
    if (player.position) {
      normalizedPosition = player.position.toUpperCase() === 'D' ? 'D' : 'F';
    } else if (position) {
      normalizedPosition = position;
    }
    
    setPlayerName(player.name);
    setSeason(player.season.toString());
    setPosition(normalizedPosition);
    setFilterYear(null);
    
    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      await ensureCacheInitialized();

      const result = await apiService.searchPlayer(
        player.name,
        player.season.toString(),
        normalizedPosition,
        7,
        null,
      );

      setPlayerData(result);
      setError("");
      setSuggestions([]);
    } catch (err) {
      setError(err.message);
      setSuggestions(err.suggestions || []);
      setPlayerData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ice-background text-white p-4 sm:p-6">
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="liquid-glass rounded-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-white text-lg font-medium">Searching...</p>
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
                <img src="/blb-dark.png" alt="Blue Line Breakdown" className="w-16 h-16" />
                <span>Blue Line Breakdown</span>
              </h1>
            </Link>
            <p className="text-gray-400 text-sm sm:text-base">
              Using player metrics to break down styles and uncover true on-ice comparisons.
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
            setLoading(true);
            setError("");
            setSuggestions([]);

            try {
              await ensureCacheInitialized();

              const result = await apiService.searchPlayer(
                suggestionName,
                season,
                position,
                7,
                filterYear,
              );

              setPlayerData(result);
              setError("");
              setSuggestions([]);
            } catch (err) {
              setError(err.message);
              setSuggestions(err.suggestions || []);
              setPlayerData(null);
            } finally {
              setLoading(false);
            }
          }}
        />

        {playerData && (
          <div className="space-y-4 sm:space-y-6">
            <PlayerHeader player={playerData.player} />

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
                  setLoading(true);
                  setError("");
                  setSuggestions([]);
                  try {
                    await ensureCacheInitialized();

                    const result = await apiService.searchPlayer(
                      playerName,
                      season,
                      position,
                      7,
                      year || null,
                    );
                    setPlayerData(result);
                    setError("");
                    setSuggestions([]);
                  } catch (err) {
                    setError(err.message);
                    setSuggestions(err.suggestions || []);
                    setPlayerData(null);
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            />
          </div>
        )}

        {!playerData && !loading && (
          <div className="text-center text-gray-400 mt-8 sm:mt-12 px-2">
            <p className="text-base sm:text-lg mb-2">Enter a player name to get started</p>
            <p className="text-xs sm:text-sm">
              Using advanced analytics from Moneypuck data (2008-{new Date().getFullYear() - 1})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
