import React, { useState, useEffect, useRef } from "react";
import { Users, Info } from "lucide-react";
import { playerUtils } from "../../utils/playerUtils";
import { Tooltip } from "../../components/Tooltip";
import { useTheme } from "../../providers/ThemeContext";

const SimilarTeamCard = ({
  similarTeam,
  onClick,
  animationKey,
  actualTheme,
}) => {
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

  const teamColor = playerUtils.getTeamColor(
    similarTeam.team,
    similarTeam.season,
    actualTheme
  );

  return (
    <div
      className={`group flex min-w-0 cursor-pointer flex-col items-center py-2 text-center transition-all duration-300 touch-manipulation ${shouldAnimate ? "player-card-enter" : ""} ${isMobile ? "" : "hover:-translate-y-1"}`}
      onClick={() => onClick?.(similarTeam.team, similarTeam.season)}
    >
      <div
        className={`relative mb-2 ${isMobile ? "" : "transition-transform duration-300 sm:group-hover:scale-105 group-active:scale-105"}`}
      >
        <div
          className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full bg-zinc-950/55 transition-all duration-300 backdrop-blur-sm shadow-lg light:bg-slate-700/45 flex items-center justify-center p-2"
          style={{ border: `1px solid ${playerUtils.toRgba(teamColor, 0.3)}` }}
        >
          <img
            src={playerUtils.getTeamLogoUrl(
              similarTeam.team,
              similarTeam.season,
              actualTheme
            )}
            alt={similarTeam.team}
            className="w-full h-full object-contain team-logo-stroke"
            onError={(e) => {
              e.target.src =
                "https://assets.nhle.com/logos/nhl/svg/NHL_dark.svg";
            }}
          />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe57e] to-[#ffd037] text-[10px] font-bold text-[#4f3d00] shadow-[0_4px_10px_rgba(255,208,55,0.18)] sm:-bottom-1 sm:-right-1 sm:h-8 sm:w-8 sm:text-xs">
          {Math.round(similarTeam.similarity)}
        </div>
      </div>
      <p className="text-xs font-semibold leading-tight text-white light:text-gray-900 sm:text-sm">
        {playerUtils.getFullTeamName(similarTeam.team, similarTeam.season)}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-gray-400 light:text-gray-500 sm:text-[11px]">
        {playerUtils.formatSeason(similarTeam.season)}
      </p>
    </div>
  );
};

export const SimilarTeamsSection = ({ similarTeams, onTeamClick }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const prevTeamsRef = useRef(null);
  const { actualTheme } = useTheme();

  useEffect(() => {
    if (!similarTeams) return;
    const currentTeamsSignature = similarTeams
      .map((t) => `${t.team}-${t.season}`)
      .sort()
      .join(",");

    const prevTeamsSignature = prevTeamsRef.current
      ? prevTeamsRef.current
          .map((t) => `${t.team}-${t.season}`)
          .sort()
          .join(",")
      : null;

    if (
      prevTeamsSignature !== null &&
      currentTeamsSignature !== prevTeamsSignature
    ) {
      setAnimationKey((prev) => prev + 1);
    }

    prevTeamsRef.current = similarTeams;
  }, [similarTeams]);

  if (!similarTeams || similarTeams.length === 0) return null;

  return (
    <div className="relative liquid-glass-strong liquid-glass-animate rounded-[32px] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Users className="h-6 w-6 shrink-0 text-amber-300 light:text-amber-600" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.04em] text-white light:text-gray-900 whitespace-nowrap">
              Most Similar Teams
            </h3>
            <Tooltip
              id="similar-teams"
              position="bottom"
              width="w-64 sm:w-72"
              content={
                <div className="space-y-2">
                  <div className="mb-1 font-semibold text-amber-300 light:text-amber-600">
                    Team Similarity
                  </div>
                  <div className="text-xs leading-relaxed text-gray-300 light:text-gray-600">
                    Teams are compared using normalized offensive, defensive,
                    and pacing statistics. Similarity scores indicate how
                    closely their statistical profiles match in these areas.
                  </div>
                </div>
              }
            >
              <button
                className="shrink-0 text-gray-400 hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700 transition-colors"
                aria-label="Info about team similarity"
              >
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap md:justify-center md:gap-4">
        {similarTeams.map((similar) => (
          <div
            key={`${similar.team}-${similar.season}`}
            className="md:w-[calc((90%-4rem)/5)]"
          >
            <SimilarTeamCard
              similarTeam={similar}
              onClick={onTeamClick}
              animationKey={animationKey}
              actualTheme={actualTheme}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
