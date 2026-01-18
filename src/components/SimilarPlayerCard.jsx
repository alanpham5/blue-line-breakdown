import React from "react";
import { playerUtils } from "../utils/playerUtils";

export const SimilarPlayerCard = ({ player, onClick }) => {
  return (
    <div
      className="flex flex-col items-center group cursor-pointer touch-manipulation min-w-0"
      onClick={() => onClick?.(player)}
    >
      <div className="relative mb-1 sm:mb-2 transition-transform duration-300 group-hover:scale-110 group-active:scale-105">
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 sm:border-4 border-gray-700 group-hover:border-cyan-400 transition-colors">
          <img
            src={playerUtils.getPlayerHeadshot(player.playerId)}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = playerUtils.getDefaultHeadshot();
            }}
          />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border-2 border-gray-900">
          {Math.round(player.similarity)}
        </div>
      </div>
      <p className="text-[10px] sm:text-xs font-semibold text-white text-center leading-tight max-w-[80px] sm:max-w-[100px] truncate">
        {player.name}
      </p>
      <p className="text-[10px] sm:text-xs text-gray-400">{playerUtils.formatSeason(player.season)}</p>
    </div>
  );
};
