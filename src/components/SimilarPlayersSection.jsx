import React, { useState, useEffect, useRef } from "react";
import { Users, Filter } from "lucide-react";
import { SimilarPlayerCard } from "./SimilarPlayerCard";
import { playerUtils } from "../utils/playerUtils";

export const SimilarPlayersSection = ({ players, onPlayerClick, filterYear, onFilterYearChange }) => {
  const years = Array.from({ length: 2025 - 2008 + 1 }, (_, i) => 2008 + i).reverse();
  const [animationKey, setAnimationKey] = useState(0);
  const prevPlayersRef = useRef(null);

  useEffect(() => {
    // Create a signature of the current players list
    const currentPlayersSignature = players
      .map(p => `${p.playerId}-${p.season}`)
      .sort()
      .join(',');

    // Create a signature of the previous players list
    const prevPlayersSignature = prevPlayersRef.current
      ? prevPlayersRef.current
          .map(p => `${p.playerId}-${p.season}`)
          .sort()
          .join(',')
      : null;

    // Only animate if the players list actually changed
    if (prevPlayersSignature !== null && currentPlayersSignature !== prevPlayersSignature) {
      setAnimationKey(prev => prev + 1);
    }

    // Update the ref with the current players
    prevPlayersRef.current = players;
  }, [players]);

  return (
    <div className="liquid-glass-strong rounded-2xl p-4 sm:p-6 border-purple-400/30">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg shrink-0 backdrop-blur-sm border border-purple-400/20">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">Most Similar Players</h3>
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
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
        {players.map((player, idx) => (
          <SimilarPlayerCard
            key={`${player.playerId}-${player.season}`}
            player={player}
            onClick={onPlayerClick}
            animationKey={animationKey}
          />
        ))}
      </div>
    </div>
  );
};
