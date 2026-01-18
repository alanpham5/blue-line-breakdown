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
    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
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
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Season
          </label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white"
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
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white"
          >
            <option value="F">Forward</option>
            <option value="D">Defense</option>
          </select>
        </div>
      </div>

      <button
        onClick={onSearch}
        disabled={loading}
        className="mt-4 w-full min-h-[44px] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
      >
        <Search size={20} />
        {loading ? "Searching..." : "Find Similar Players"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
