import React, { useState, useEffect, useRef } from "react";
import { Users, Filter, Info } from "lucide-react";
import { SimilarPlayerCard } from "./SimilarPlayerCard";
import { playerUtils } from "../utils/playerUtils";

export const SimilarPlayersSection = ({
  players,
  onPlayerClick,
  filterYear,
  onFilterYearChange,
}) => {
  const years = Array.from(
    { length: 2025 - 2008 + 1 },
    (_, i) => 2008 + i
  ).reverse();
  const [animationKey, setAnimationKey] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const prevPlayersRef = useRef(null);
  useEffect(() => {
    const currentPlayersSignature = players
      .map((p) => `${p.playerId}-${p.season}`)
      .sort()
      .join(",");

    const prevPlayersSignature = prevPlayersRef.current
      ? prevPlayersRef.current
          .map((p) => `${p.playerId}-${p.season}`)
          .sort()
          .join(",")
      : null;

    if (
      prevPlayersSignature !== null &&
      currentPlayersSignature !== prevPlayersSignature
    ) {
      setAnimationKey((prev) => prev + 1);
    }

    prevPlayersRef.current = players;
  }, [players]);

  return (
    <div className="liquid-glass-strong rounded-2xl p-4 sm:p-6 border-purple-400/30 liquid-glass-animate">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg shrink-0 backdrop-blur-sm border border-purple-400/20">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold">
              Most Similar Players
            </h3>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Info about player similarity"
              >
                <Info size={16} />
              </button>
              {showTooltip && (
                <div className="absolute left-0 top-full mt-2 w-64 sm:w-72 p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg text-xs text-gray-200 z-10 shadow-lg pointer-events-none">
                  <div className="space-y-2">
                    <div className="font-semibold text-purple-400 mb-1">
                      Player Similarity
                    </div>
                    <div>
                      Players are compared using normalized on-ice, physical,
                      and performance stats. Similarity scores are relative and
                      based on how close players are statistically, not raw
                      totals. Changing the season filter changes the comparison
                      pool, which can shift both rankings and scores.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-5 h-5 text-gray-400 shrink-0" />
          <select
            value={filterYear || ""}
            onChange={(e) => onFilterYearChange(e.target.value || null)}
            className="flex-1 sm:flex-initial min-w-0 liquid-glass-strong rounded-full px-3 sm:px-4 py-2 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
          >
            <option value="">All Seasons</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {playerUtils.formatSeason(year)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:flex md:flex-wrap md:justify-center md:gap-4">
        {players.map((player, idx) => (
          <div
            key={`${player.playerId}-${player.season}`}
            className="md:w-[calc((100%-4rem)/5)]"
          >
            <SimilarPlayerCard
              player={player}
              onClick={onPlayerClick}
              animationKey={animationKey}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
