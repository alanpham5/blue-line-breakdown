import { useState, useEffect, useRef } from "react";
import { Users, Filter, Info } from "lucide-react";
import { SimilarPlayerCard } from "./SimilarPlayerCard";
import { playerUtils } from "../../utils/playerUtils";
import { Tooltip } from "../../components/Tooltip";
const d = new Date();
const seasons = Array.from(
  {
    length: (d.getMonth() >= 10 ? d.getFullYear() : d.getFullYear() - 1) - 2007,
  },
  (_, i) => 2008 + i
);

export const SimilarPlayersSection = ({
  players,
  onPlayerClick,
  filterYear = null,
  onFilterYearChange,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
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
    <div className="liquid-glass-strong rounded-2xl p-4 sm:p-6 border-purple-400/30 light:border-purple-500/40 liquid-glass-animate">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg shrink-0 backdrop-blur-sm border border-purple-400/20 light:bg-purple-400/25 light:border-purple-500/30">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 light:text-purple-600" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white light:text-gray-900">
              Most Similar Players
            </h3>
            <Tooltip
              id="similar-players"
              position="bottom"
              width="w-64 sm:w-72"
              content={
                <div className="space-y-2">
                  <div className="font-semibold text-purple-400 light:text-purple-600 mb-1">
                    Player Similarity
                  </div>
                  <div>
                    Players are compared using normalized on-ice, physical, and
                    performance stats. Similarity scores are relative and based
                    on how close players are statistically, not raw totals.
                    Changing the season filter changes the comparison pool,
                    which can shift both rankings and scores.
                  </div>
                </div>
              }
            >
              <button
                className="shrink-0 text-gray-400 hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700 transition-colors"
                aria-label="Info about player similarity"
              >
                <Info size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-5 h-5 text-gray-400 light:text-gray-500 shrink-0" />
          <select
            value={filterYear || ""}
            onChange={(e) => onFilterYearChange(e.target.value || null)}
            className="flex-1 sm:flex-initial min-w-0 liquid-glass-strong rounded-full px-3 sm:px-4 py-2 text-white light:text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
          >
            <option value="">All Seasons</option>
            {[...seasons].reverse().map((year) => (
              <option key={year} value={year}>
                {playerUtils.formatSeason(year)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:flex md:flex-wrap md:justify-center">
        {players.map((player, idx) => (
          <div
            key={`${player.playerId}-${player.season}`}
            className="md:w-[calc((90%-4rem)/5)]"
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
