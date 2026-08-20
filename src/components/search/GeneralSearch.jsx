import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Search, Shield, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "lib/api/apiService";
import { useTheme } from "providers/ThemeContext";
import { playerUtils } from "utils/playerUtils";
import { LookupHeader } from "components/search/LookupHeader";

const PANEL_GAP = 8;
const PANEL_VIEWPORT_MARGIN = 12;
const PANEL_MAX_HEIGHT = 448;

const getPanelPosition = (anchor) => {
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP;
  const spaceAbove = rect.top - PANEL_GAP;
  const preferredHeight = Math.min(PANEL_MAX_HEIGHT, window.innerHeight * 0.65);
  const dropUp = spaceBelow < preferredHeight && spaceAbove > spaceBelow;
  const available = (dropUp ? spaceAbove : spaceBelow) - PANEL_VIEWPORT_MARGIN;
  return {
    left: rect.left,
    width: rect.width,
    maxHeight: Math.max(120, Math.min(preferredHeight, available)),
    ...(dropUp
      ? { bottom: window.innerHeight - rect.top + PANEL_GAP }
      : { top: rect.bottom + PANEL_GAP }),
  };
};

export const GeneralSearch = ({
  bare = false,
  compact = false,
  className = "",
  scope = "all",
  initialQuery = "",
  targetSeason = null,
  teamResultPath = "/teams",
}) => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const suppressPrefilledSearchRef = useRef(Boolean(initialQuery));
  const [panelPosition, setPanelPosition] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const isPlayerScope = scope === "players";
  const isTeamScope = scope === "teams";

  useEffect(() => {
    suppressPrefilledSearchRef.current = Boolean(initialQuery);
    setQuery(initialQuery);
    setResults([]);
    setError("");
    setOpen(false);
    setActiveIndex(-1);
  }, [initialQuery]);

  useEffect(() => {
    if (suppressPrefilledSearchRef.current) {
      suppressPrefilledSearchRef.current = false;
      return undefined;
    }
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError("");
      setOpen(false);
      setActiveIndex(-1);
      return undefined;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = isPlayerScope
          ? await apiService.searchPlayersV2(trimmed, 10)
          : isTeamScope
            ? await apiService.searchTeamsV2(trimmed, 10)
            : await apiService.searchV2(trimmed);
        const nextResults = isPlayerScope
          ? (response.results || []).map((result) => ({
              ...result,
              type: "player",
              team: result.latestTeam,
            }))
          : isTeamScope
            ? (response.results || []).map((result) => ({
                ...result,
                type: "team",
              }))
            : response.results || [];
        if (!cancelled) {
          setResults(nextResults);
          setOpen(true);
          setActiveIndex(-1);
        }
      } catch (requestError) {
        if (!cancelled) {
          setResults([]);
          setError(requestError.message);
          setOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isPlayerScope, isTeamScope, query]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const insideAnchor = containerRef.current?.contains(event.target);
      const insidePanel = panelRef.current?.contains(event.target);
      if (!insideAnchor && !insidePanel) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useLayoutEffect(() => {
    if (!open || !containerRef.current) {
      setPanelPosition(null);
      return undefined;
    }
    const updatePosition = () => {
      if (containerRef.current) {
        setPanelPosition(getPanelPosition(containerRef.current));
      }
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, results.length, error, loading]);

  const openResult = (result) => {
    setOpen(false);
    suppressPrefilledSearchRef.current = true;
    setQuery(result.name);
    const numericTargetSeason = Number(targetSeason);
    const resultSeasons = (result.seasons || []).map(Number);
    const destinationSeason = resultSeasons.includes(numericTargetSeason)
      ? numericTargetSeason
      : result.latestSeason;
    if (result.type === "team") {
      navigate(
        `${teamResultPath}?team=${encodeURIComponent(result.team)}&season=${destinationSeason}`
      );
      return;
    }
    navigate(`/players/v2/${result.playerId}?season=${destinationSeason}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!open || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      openResult(results[activeIndex >= 0 ? activeIndex : 0]);
    }
  };

  const clearSearch = () => {
    suppressPrefilledSearchRef.current = false;
    setQuery("");
    setResults([]);
    setError("");
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <section
      className={`relative z-[60] ${
        bare
          ? ""
          : `liquid-glass-strong liquid-glass-animate rounded-[32px] ${
              compact ? "p-4 sm:p-5" : "p-5 sm:p-7"
            }`
      } ${className}`}
      aria-label={
        isPlayerScope
          ? "Search players"
          : isTeamScope
            ? "Search teams"
            : "Search players and teams"
      }
    >
      {!compact && (
        <LookupHeader
          title={
            isPlayerScope
              ? "Lookup Player"
              : isTeamScope
                ? "Lookup Team"
                : "Search Blue Line Breakdown"
          }
          subtext={
            !isPlayerScope && !isTeamScope
              ? "Find any player or NHL team from one place."
              : ""
          }
        />
      )}

      <div ref={containerRef} className="relative">
        <Search
          className="app-field-icon absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          role="combobox"
          aria-label={
            isPlayerScope
              ? "Search players"
              : isTeamScope
                ? "Search teams"
                : "Search players and teams"
          }
          aria-expanded={open}
          aria-controls="general-search-results"
          aria-activedescendant={
            activeIndex >= 0
              ? `general-search-result-${activeIndex}`
              : undefined
          }
          value={query}
          onChange={(event) => {
            suppressPrefilledSearchRef.current = false;
            setQuery(event.target.value);
          }}
          onFocus={() => {
            if (results.length > 0 || error) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isPlayerScope
              ? "Player Name"
              : isTeamScope
                ? "Team Name"
                : "Search players or teams"
          }
          className="app-field w-full py-3.5 pl-12 pr-12 text-base text-white light:text-gray-900"
          autoComplete="off"
        />
        {loading ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="block h-5 w-5 animate-spin text-sky-300 light:text-sky-600" />
          </span>
        ) : (
          query && (
            <button
              type="button"
              onClick={clearSearch}
              className="app-field-clear absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )
        )}

        {open &&
          panelPosition &&
          createPortal(
            <div
              ref={panelRef}
              id="general-search-results"
              role="listbox"
              style={panelPosition}
              className="fixed z-[9998] overflow-y-auto rounded-[24px] border border-white/10 bg-[#0b0d12] p-2 shadow-2xl light:border-slate-200 light:bg-white"
            >
              {error ? (
                <p className="px-3 py-3 text-sm text-rose-300 light:text-rose-700">
                  {error}
                </p>
              ) : results.length === 0 && !loading ? (
                <p className="px-3 py-3 text-sm text-gray-400 light:text-gray-600">
                  {isPlayerScope
                    ? "No matching players."
                    : isTeamScope
                      ? "No matching teams."
                      : "No matching players or teams."}
                </p>
              ) : (
                results.map((result, index) => {
                  const isTeam = result.type === "team";
                  const logoUrl = isTeam
                    ? playerUtils.getTeamLogoUrl(
                        result.team,
                        result.latestSeason,
                        actualTheme
                      )
                    : playerUtils.getPlayerHeadshot(
                        result.playerId,
                        result.team,
                        result.latestSeason
                      );
                  return (
                    <button
                      id={`general-search-result-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      key={
                        isTeam
                          ? `team-${result.team}`
                          : `player-${result.playerId}`
                      }
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => openResult(result)}
                      className={`flex w-full items-center gap-3 rounded-[18px] px-3 py-2.5 text-left transition-colors ${
                        index === activeIndex
                          ? "bg-[#3d8deb]/25 light:bg-[#d4e8fc]"
                          : "hover:bg-white/[0.06] light:hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] light:bg-slate-100">
                        <img
                          src={logoUrl}
                          alt=""
                          className={`h-full w-full ${
                            isTeam ? "object-contain p-1" : "object-cover"
                          }`}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white light:text-gray-900">
                          {result.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400 light:text-gray-500">
                          {isTeam ? (
                            <Shield className="h-3.5 w-3.5 text-sky-300 light:text-sky-600" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-violet-300 light:text-violet-600" />
                          )}
                          <span>
                            {isTeam
                              ? `${result.team} · Team`
                              : `${result.team || "NHL"} · ${result.position}`}
                          </span>
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-sky-300 light:text-sky-700">
                        {playerUtils.formatSeason(result.latestSeason)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>,
            document.body
          )}
      </div>
    </section>
  );
};
