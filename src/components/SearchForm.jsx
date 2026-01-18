import React from "react";
import { Search } from "lucide-react";

export const SearchForm = ({
  playerName,
  setPlayerName,
  season,
  setSeason,
  position,
  setPosition,
  onSearch,
  loading,
  error,
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="liquid-glass rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Player Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Connor McDavid"
            className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Season
          </label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white transition-all duration-300"
          >
            {Array.from({ length: (new Date().getFullYear() - 1) - 2008 + 1 }, (_, i) => 2008 + i)
              .reverse()
              .map((year) => {
                const nextYear = year + 1;
                return (
                  <option key={year} value={year}>
                    {year}-{nextYear}
                  </option>
                );
              })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Position
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white transition-all duration-300"
          >
            <option value="F">Forward</option>
            <option value="D">Defense</option>
          </select>
        </div>
      </div>

      <button
        onClick={onSearch}
        disabled={loading}
        className="mt-4 w-full min-h-[44px] bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
      >
        <Search size={20} />
        {loading ? "Searching..." : "Search"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg text-red-300 text-sm liquid-glass">
          {error}
        </div>
      )}
    </div>
  );
};
