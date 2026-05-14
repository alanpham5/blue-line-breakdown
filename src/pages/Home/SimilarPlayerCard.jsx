import React, { useEffect, useState, useRef } from "react";
import { playerUtils } from "../../utils/playerUtils";

export const SimilarPlayerCard = ({ player, onClick, animationKey }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const prevAnimationKeyRef = useRef(animationKey);
  const isInitialMount = useRef(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevAnimationKeyRef.current = animationKey;
      return;
    }

    if (prevAnimationKeyRef.current !== animationKey) {
      setShouldAnimate(true);
      prevAnimationKeyRef.current = animationKey;
      const timer = setTimeout(
        () => setShouldAnimate(false),
        isMobile ? 250 : 600
      );
      return () => clearTimeout(timer);
    }
  }, [animationKey, isMobile]);

  return (
    <div
      className={`group flex min-w-0 cursor-pointer flex-col items-center py-2 text-center transition-all duration-300 touch-manipulation ${shouldAnimate ? "player-card-enter" : ""} ${isMobile ? "" : "hover:-translate-y-1"}`}
      onClick={() => onClick?.(player)}
    >
      <div
        className={`relative mb-2 ${isMobile ? "" : "transition-transform duration-300 sm:group-hover:scale-105 group-active:scale-105"}`}
      >
        <div
          className={`h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full bg-zinc-950/55 transition-all duration-300 backdrop-blur-sm shadow-lg light:bg-slate-700/45 ${isMobile ? "" : "sm:group-hover:shadow-cyan-500/8"}`}
        >
          <img
            src={playerUtils.getPlayerHeadshot(
              player.playerId,
              player.team,
              player.season
            )}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = playerUtils.getDefaultHeadshot();
            }}
          />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe57e] to-[#ffd037] text-[10px] font-bold text-[#4f3d00] shadow-[0_4px_10px_rgba(255,208,55,0.18)] sm:-bottom-1 sm:-right-1 sm:h-8 sm:w-8 sm:text-xs">
          {Math.round(player.similarity)}
        </div>
      </div>
      <p className="text-xs font-semibold leading-tight text-white light:text-gray-900 sm:text-sm">
        {player.name}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-gray-400 light:text-gray-500 sm:text-[11px]">
        {playerUtils.formatSeason(player.season)}
      </p>
    </div>
  );
};
