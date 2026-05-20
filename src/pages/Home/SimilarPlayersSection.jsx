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
  const sharedFieldClassName =
    "app-field px-4 py-3.5 pr-10 text-base text-white light:text-gray-900";
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
    <div className="relative liquid-glass-strong liquid-glass-animate rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Users className="h-6 w-6 shrink-0 text-amber-300 light:text-amber-600" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.04em] text-white light:text-gray-900 whitespace-nowrap">
              Most Similar Players
            </h3>
            <div className="absolute top-[22px] right-5 sm:static sm:top-auto sm:right-auto">
              <Tooltip
                id="similar-players"
                position="bottom"
                width="w-64 sm:w-72"
                content={
                  <div className="space-y-2">
                    <div className="mb-1 font-semibold text-amber-300 light:text-amber-600">
                      Player Similarity
                    </div>
                    <div className="text-xs leading-relaxed text-gray-300 light:text-gray-600">
                      Players are compared using normalized on-ice, physical,
                      and performance stats. Similarity scores are relative and
                      based on how close players are statistically, not raw
                      totals. Changing the season filter changes the comparison
                      pool, which can shift both rankings and scores.
                    </div>
                  </div>
                }
              >
                <button
                  className="shrink-0 text-gray-400 hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700 transition-colors"
                  aria-label="Info about player similarity"
                >
                  <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-5 w-5 shrink-0 text-amber-300 light:text-amber-600" />
          <select
            value={filterYear || ""}
            onChange={(e) => onFilterYearChange(e.target.value || null)}
            className={`${sharedFieldClassName} min-w-0 flex-1 sm:flex-initial`}
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:flex md:flex-wrap md:justify-center md:gap-4">
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
