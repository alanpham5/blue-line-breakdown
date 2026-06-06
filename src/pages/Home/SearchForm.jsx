import { Search, X } from "lucide-react";
import { AppSelect } from "../../components/AppSelect";

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
  const sharedFieldClassName =
    "app-field px-4 py-3.5 text-base text-white light:text-gray-900";

  return (
    <div
      className={`liquid-glass-strong rounded-[32px] p-5 sm:p-6 lg:p-7 mb-6 sm:mb-8 ${enablePageLoadAnimation ? "liquid-glass-animate" : ""}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search
              size={16}
              className="app-field-icon absolute left-4 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              inputMode="search"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, onSearch)}
              autoComplete="off"
              placeholder="Player Name"
              className={`${sharedFieldClassName} pl-11 pr-10`}
            />
            {playerName && (
              <button
                onClick={() => setPlayerName("")}
                className="app-field-clear absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1"
                aria-label="Clear input"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <div>
          <AppSelect
            placeholder="Season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className={`${sharedFieldClassName} pr-10`}
          >
            {[...seasons].reverse().map((year) => {
              const nextYear = year + 1;
              return (
                <option key={year} value={year}>
                  {year}-{nextYear}
                </option>
              );
            })}
          </AppSelect>
        </div>
        <div>
          <AppSelect
            placeholder="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={`${sharedFieldClassName} pr-10`}
          >
            <option value="F">Forward</option>
            <option value="D">Defense</option>
          </AppSelect>
        </div>
      </div>

      <button
        onClick={onSearch}
        disabled={loading}
        className="btn-search-primary mt-5"
      >
        <Search size={20} />
        {loading ? "Searching..." : "Search Player"}
      </button>

      {error && (
        <div className="mt-4 space-y-3">
          <div className="liquid-glass rounded-[24px] p-4 text-sm font-medium leading-relaxed text-rose-400 light:text-rose-800">
            {error}
          </div>

          {nameMatchesSuggestion ? (
            <div className="liquid-glass rounded-[24px] p-4">
              <p className="mb-2 text-sm font-medium text-orange-200/95 light:text-orange-950">
                Player found, but no data available for this season.
              </p>
              <p className="text-sm text-orange-100/85 light:text-orange-900/90">
                Try selecting a different season from the dropdown above.
              </p>
            </div>
          ) : (
            suggestions &&
            suggestions.length > 0 && (
              <div className="liquid-glass rounded-[24px] p-4">
                <p className="mb-3 text-sm font-medium text-[#7ab8fc] light:text-[#256fd4]">
                  Did you mean?
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSuggestionClick?.(suggestion)}
                      type="button"
                      className="rounded-full bg-white/[0.08] px-3 py-1.5 text-sm font-medium text-[#a9d0fd] transition-all duration-200 hover:scale-[1.02] hover:bg-[#3d8deb]/35 touch-manipulation light:bg-slate-100 light:text-[#256fd4] light:hover:bg-[#d4e8fc]"
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
