import React, { useState, useEffect } from "react";
import { Target, Shield } from "lucide-react";
import { apiService } from "./services/apiService";
import { SearchForm } from "./components/SearchForm";
import { PlayerHeader } from "./components/PlayerHeader";
import { StatsCard } from "./components/StatsCard";
import { SimilarPlayersSection } from "./components/SimilarPlayersSection";

const App = () => {
  const [playerName, setPlayerName] = useState("");
  const [season, setSeason] = useState((new Date().getFullYear() - 1).toString());
  const [position, setPosition] = useState("F");
  const [loading, setLoading] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState("");
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

  const handleSearch = async () => {
    if (!playerName.trim()) {
      setError("Please enter a player name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await apiService.searchPlayer(
        playerName,
        season,
        position,
        7,
        filterYear,
      );

      setPlayerData(result);
      setError("");
    } catch (err) {
      setError(err.message);
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

    try {
      const result = await apiService.searchPlayer(
        player.name,
        player.season.toString(),
        normalizedPosition,
        7,
        null,
      );

      setPlayerData(result);
      setError("");
    } catch (err) {
      setError(err.message);
      setPlayerData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <img src="/blb-dark.png" alt="Blue Line Breakdown" className="w-16 h-16" />
            <span>Blue Line Breakdown</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
          Using player metrics to break down styles and uncover true on-ice comparisons.
          </p>
        </div>

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
                  try {
                    const result = await apiService.searchPlayer(
                      playerName,
                      season,
                      position,
                      7,
                      year || null,
                    );
                    setPlayerData(result);
                    setError("");
                  } catch (err) {
                    setError(err.message);
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

export default App;
