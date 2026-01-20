import { Link } from "react-router-dom";
import { Ruler, Scale, Calendar } from "lucide-react";
import { playerUtils } from "../utils/playerUtils";
import { ArchetypeBadge } from "./ArchetypeBadge";

export const PlayerHeader = ({ player, biometrics }) => {
  const teamLogoUrl = player.team
    ? playerUtils.getTeamLogoUrl(player.team, player.season)
    : null;
  const archetypes = player.archetypes || [];
  return (
    <div className="liquid-glass-strong rounded-2xl p-4 lg:p-6 liquid-glass-animate">
      <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-cyan-400/60 shadow-lg shadow-cyan-500/40 backdrop-blur-sm">
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
            <Link
              to={`/teams?season=${player.season}&team=${player.team}&position=${player.position}`}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 xl:hidden w-14 h-14 flex items-center justify-center z-10 hover:opacity-80 transition-opacity"
            >
              <img
                src={teamLogoUrl}
                alt={`${player.team} logo`}
                className="w-full h-full object-contain cursor-pointer"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </Link>
          )}
        </div>
        <div className="flex-1 min-w-0 text-center lg:text-left">
          <h2 className="text-2xl lg:text-3xl lg:text-4xl font-bold mb-2 lg:mb-3 truncate">
            {player.name}
          </h2>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 lg:gap-3 text-gray-300">
              <span className="text-sm lg:text-base">
                {playerUtils.getFullTeamName(player.team, player.season)}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm lg:text-base">
                {playerUtils.formatSeason(player.season)}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm lg:text-base">
                {player.position === "F" ? "Forward" : "Defense"}
              </span>
            </div>
            {(biometrics?.height || biometrics?.weight || player?.age) && (
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 lg:gap-4">
                {biometrics?.height && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Ruler className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm lg:text-base">
                      {biometrics.height}
                    </span>
                  </div>
                )}
                {biometrics?.weight && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm lg:text-base">
                      {Math.round(biometrics.weight)} lbs
                    </span>
                  </div>
                )}
                {player?.age && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm lg:text-base">
                      Age {player.age}
                    </span>
                  </div>
                )}
              </div>
            )}
            {archetypes.length > 0 && (
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3">
                {archetypes.map((archetype, idx) => (
                  <ArchetypeBadge key={idx} archetype={archetype} />
                ))}
              </div>
            )}
          </div>
        </div>
        {teamLogoUrl && (
          <Link
            to={`/teams?season=${player.season}&team=${player.team}&position=${player.position}`}
            className="hidden xl:flex shrink-0 w-40 lg:h-40 items-center justify-center hover:opacity-80 transition-opacity"
          >
            <img
              src={teamLogoUrl}
              alt={`${player.team} logo`}
              className="w-full h-full object-contain cursor-pointer"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </Link>
        )}
      </div>
    </div>
  );
};
