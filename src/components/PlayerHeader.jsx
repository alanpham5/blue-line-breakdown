import React from "react";
import { Ruler, Scale } from "lucide-react";
import { playerUtils } from "../utils/playerUtils";
import { ArchetypeBadge } from "./ArchetypeBadge";

export const PlayerHeader = ({ player, biometrics }) => {
  const teamLogoUrl = player.team
    ? playerUtils.getTeamLogoUrl(player.team, player.season)
    : null;
  const archetypes = player.archetypes || [];
  return (
    <div className="liquid-glass-strong rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-cyan-400/60 shadow-lg shadow-cyan-500/40 backdrop-blur-sm">
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
          {teamLogoUrl && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:hidden w-14 h-14 flex items-center justify-center z-10">
              <img
                src={teamLogoUrl}
                alt={`${player.team} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 truncate">
            {player.name}
          </h2>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-gray-300">
              <span className="text-sm sm:text-base">
                {playerUtils.formatSeason(player.season)}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm sm:text-base">
                {player.position === "F" ? "Forward" : "Defense"}
              </span>
            </div>
            {(biometrics?.height || biometrics?.weight) && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                {biometrics?.height && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Ruler className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm sm:text-base">
                      {biometrics.height}
                    </span>
                  </div>
                )}
                {biometrics?.weight && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm sm:text-base">
                      {Math.round(biometrics.weight)} lbs
                    </span>
                  </div>
                )}
              </div>
            )}
            {archetypes.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                {archetypes.map((archetype, idx) => (
                  <ArchetypeBadge key={idx} archetype={archetype} />
                ))}
              </div>
            )}
          </div>
        </div>
        {teamLogoUrl && (
          <div className="hidden sm:flex shrink-0 w-24 h-24 md:w-28 md:h-28 items-center justify-center">
            <img
              src={teamLogoUrl}
              alt={`${player.team} logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
