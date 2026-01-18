import React, { useEffect, useState, useRef } from "react";
import { playerUtils } from "../utils/playerUtils";

export const SimilarPlayerCard = ({ player, onClick, animationKey }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const prevAnimationKeyRef = useRef(animationKey);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevAnimationKeyRef.current = animationKey;
      return;
    }

    if (prevAnimationKeyRef.current !== animationKey) {
      setShouldAnimate(true);
      prevAnimationKeyRef.current = animationKey;
      const timer = setTimeout(() => setShouldAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [animationKey]);

  return (
    <div
      className={`flex flex-col items-center group cursor-pointer touch-manipulation min-w-0 ${shouldAnimate ? 'player-card-enter' : ''}`}
      onClick={() => onClick?.(player)}
    >
      <div className="relative mb-1 sm:mb-2 transition-transform duration-300 sm:group-hover:scale-110 group-active:scale-105">
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 sm:border-4 border-gray-600/40 sm:group-hover:border-cyan-400/80 transition-all duration-300 backdrop-blur-sm shadow-lg sm:group-hover:shadow-cyan-500/30">
          <img
            src={playerUtils.getPlayerHeadshot(player.playerId, player.team, player.season)}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = playerUtils.getDefaultHeadshot();
            }}
          />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-gradient-to-r from-cyan-500/90 to-blue-500/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border-2 border-gray-900/50 shadow-lg shadow-cyan-500/30">
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
