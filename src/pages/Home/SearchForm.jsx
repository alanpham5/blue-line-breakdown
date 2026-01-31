import { Search, X } from "lucide-react";

const handleKeyPress = (e, onSearch) => {
  if (e.key === "Enter") {
    e.target.blur();
    onSearch();
  }
};

const isNameMatchSuggestion = (suggestions, playerName) =>
  suggestions &&
  suggestions.length > 0 &&
  suggestions.some(
    (suggestion) =>
      suggestion.toLowerCase().trim() === playerName.toLowerCase().trim()
  );

const d = new Date();
const seasons = Array.from(
  {
    length: (d.getMonth() >= 10 ? d.getFullYear() : d.getFullYear() - 1) - 2007,
  },
  (_, i) => 2008 + i
);

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
  suggestions = [],
  onSuggestionClick,
  enablePageLoadAnimation = true,
}) => {
  const nameMatchesSuggestion = isNameMatchSuggestion(suggestions, playerName);

  return (
    <div
      className={`liquid-glass rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 ${enablePageLoadAnimation ? "liquid-glass-animate" : ""}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 light:text-gray-600 mb-2">
            Player Name
          </label>
          <div className="relative">
            <input
              type="search"
              inputMode="search"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, onSearch)}
              autocomplete="off"
              placeholder={
                position === "F"
                  ? "e.g., Macklin Celebrini"
                  : "e.g., Cale Makar"
              }
              className="w-full px-4 py-3 pr-10 sm:pr-4 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white light:text-gray-900 placeholder-gray-400 light:placeholder-gray-500 transition-all duration-300"
            />
            {playerName && (
              <button
                onClick={() => setPlayerName("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 sm:hidden text-gray-400 hover:text-white light:text-gray-500 light:hover:text-gray-900 transition-colors p-1"
                aria-label="Clear input"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 light:text-gray-600 mb-2">
            Season
          </label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white light:text-gray-900 transition-all duration-300"
          >
            {[...seasons].reverse().map((year) => {
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
          <label className="block text-sm font-medium text-gray-300 light:text-gray-600 mb-2">
            Position
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white light:text-gray-900 transition-all duration-300"
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
        {loading ? "Searching..." : "Search Player"}
      </button>

      {error && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-red-900/20 light:bg-red-50 light:border-red-200 light:text-red-800 backdrop-blur-sm border border-red-500/30 rounded-lg text-red-300 text-sm liquid-glass">
            {error}
          </div>

          {nameMatchesSuggestion ? (
            <div className="p-4 bg-amber-900/20 light:bg-amber-50 light:border-amber-200 backdrop-blur-sm border border-amber-500/30 rounded-lg liquid-glass">
              <p className="text-sm font-medium text-amber-300 light:text-amber-800 mb-2">
                Player found, but no data available for this season.
              </p>
              <p className="text-sm text-amber-200 light:text-amber-700">
                Try selecting a different season from the dropdown above.
              </p>
            </div>
          ) : (
            suggestions &&
            suggestions.length > 0 && (
              <div className="p-4 bg-blue-900/20 light:bg-blue-50 light:border-blue-200 backdrop-blur-sm border border-blue-500/30 rounded-lg liquid-glass">
                <p className="text-sm font-medium text-blue-300 light:text-blue-800 mb-3">
                  Did you mean?
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSuggestionClick?.(suggestion)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-200 light:text-blue-800 bg-blue-500/20 hover:bg-blue-500/30 light:bg-blue-100 light:hover:bg-blue-200 border border-blue-400/30 light:border-blue-200 rounded-full transition-all duration-200 hover:border-blue-400/50 hover:scale-105 touch-manipulation"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
