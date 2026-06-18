import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { AppSelect } from "components/ui/AppSelect";
import { apiService } from "lib/api/apiService";
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
  const [autofillResults, setAutofillResults] = useState([]);
  const [showAutofill, setShowAutofill] = useState(false);
  const autofillContainerRef = useRef(null);
  const suppressAutofillRef = useRef(false);
  const userTypingRef = useRef(false);
  useEffect(() => {
    const query = playerName.trim();
    const wasUserTyping = userTypingRef.current;
    userTypingRef.current = false;
    if (query.length < 3) {
      setAutofillResults([]);
      return;
    }
    if (!wasUserTyping || suppressAutofillRef.current) {
      suppressAutofillRef.current = false;
      return;
    }
    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      try {
        const data = await apiService.searchAutofill(query);
        if (!cancelled) {
          setAutofillResults(data.results || []);
          setShowAutofill(true);
        }
      } catch {
        if (!cancelled) {
          setAutofillResults([]);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [playerName]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        autofillContainerRef.current &&
        !autofillContainerRef.current.contains(e.target)
      ) {
        setShowAutofill(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleAutofillSelect = (result) => {
    suppressAutofillRef.current = true;
    setPlayerName(result.name);
    if (!season) setSeason(result.latestYear.toString());
    const pos = result.position?.toUpperCase();
    if (pos === "DEFENSEMAN" || pos === "D") {
      setPosition("D");
    } else if (pos === "GOALIE" || pos === "GOALTENDER" || pos === "G") {
      setPosition("G");
    } else {
      setPosition("F");
    }
    setShowAutofill(false);
  };
  return (
    <div
      className={`liquid-glass-strong rounded-[32px] p-5 sm:p-6 lg:p-7 mb-6 sm:mb-8 ${enablePageLoadAnimation ? "liquid-glass-animate" : ""}`}
      style={{
        isolation: "auto",
        overflow: "visible",
      }}
    >
      <div className="mb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white light:text-gray-900">
          Lookup Player
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="md:col-span-2">
          <div
            className={`relative ${showAutofill ? "z-[60]" : "z-[50]"}`}
            ref={autofillContainerRef}
          >
            <Search
              size={16}
              className="app-field-icon absolute left-4 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              inputMode="search"
              value={playerName}
              onChange={(e) => {
                userTypingRef.current = true;
                setPlayerName(e.target.value);
              }}
              onKeyPress={(e) => handleKeyPress(e, onSearch)}
              onFocus={() => {
                if (autofillResults.length > 0) setShowAutofill(true);
              }}
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
            {autofillResults.length > 0 && (
              <div
                className={`liquid-glass !absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-80 origin-top overflow-y-auto rounded-[24px] p-2 transition-all duration-200 ease-out ${showAutofill ? "translate-y-0 scale-y-100 opacity-100" : "pointer-events-none -translate-y-1 scale-y-95 opacity-0"}`}
              >
                {autofillResults.map((result) => (
                  <button
                    key={result.playerId}
                    type="button"
                    onClick={() => handleAutofillSelect(result)}
                    className="flex w-full items-center gap-3 rounded-[18px] px-3 py-2 text-left transition-colors hover:bg-[#3d8deb]/35 light:hover:bg-[#d4e8fc]"
                  >
                    <img
                      src={`https://assets.nhle.com/mugs/nhl/latest/${result.playerId}.png`}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded-full bg-white/10 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.visibility = "hidden";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white light:text-gray-900">
                        {result.name}
                      </p>
                      <p className="text-xs text-[#a9d0fd] light:text-[#256fd4]">
                        {result.latestYear}-{result.latestYear + 1} ·{" "}
                        {result.position}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
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
            <option value="G">Goalie</option>
          </AppSelect>
        </div>
      </div>

      <button
        onClick={onSearch}
        disabled={loading || !playerName.trim() || !season || !position}
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
