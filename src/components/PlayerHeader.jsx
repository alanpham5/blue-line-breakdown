import React from "react";
import { playerUtils } from "../utils/playerUtils";

export const PlayerHeader = ({ player }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-4 sm:p-6 border border-gray-700">
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 text-center sm:text-left">
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/30">
            <img
              src={playerUtils.getPlayerHeadshot(player.playerId)}
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = playerUtils.getDefaultHeadshot();
              }}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 truncate">{player.name}</h2>
          <p className="text-gray-400 text-base sm:text-lg">
            {playerUtils.formatSeason(player.season)} Season •{" "}
            {player.position === "F" ? "Forward" : "Defense"}
          </p>
        </div>
      </div>
    </div>
  );
};
