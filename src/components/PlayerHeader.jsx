import { Link } from "react-router-dom";
import { Ruler, Scale, Calendar } from "lucide-react";
import { playerUtils } from "../utils/playerUtils";
import { ArchetypeBadge } from "./ArchetypeBadge";

const BiometricItem = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-1.5 text-gray-300">
    <Icon className="w-4 h-4 text-cyan-400" />
    <span className="text-sm lg:text-base">{value}</span>
  </div>
);

const TeamLogoLink = ({
  teamLogoUrl,
  player,
  className,
  teamColor,
  showStroke = false,
}) =>
  teamLogoUrl ? (
    <Link
      to={`/teams?season=${player.season}&team=${player.team}&position=${player.position}`}
      className={className}
    >
      <img
        src={teamLogoUrl}
        alt={`${player.team} logo`}
        className="
          w-full h-full object-contain cursor-pointer
          [filter:var(--logo-outline)]
        "
        style={
          showStroke
            ? {
                "--logo-outline": `
            drop-shadow(0.5px 0 0 ${teamColor})
            drop-shadow(-0.5px 0 0 ${teamColor})
            drop-shadow(0 0.5px 0 ${teamColor})
            drop-shadow(0 -0.5px 0 ${teamColor})
          `,
              }
            : {}
        }
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </Link>
  ) : null;

export const PlayerHeader = ({ player, biometrics }) => {
  const teamLogoUrl = player.team
    ? playerUtils.getTeamLogoUrl(player.team, player.season)
    : null;
  const archetypes = player.archetypes || [];

  return (
    <div className="liquid-glass-strong rounded-2xl p-4 lg:p-6 liquid-glass-animate">
      <div className="hidden xl:block absolute top-0 right-0 h-full w-44 overflow-hidden rounded-tr-xl rounded-br-2xl z-[-1]">
        {/* Base diagonal */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: playerUtils.getTeamColor(
              player.team,
              player.season
            ),
            clipPath: "polygon(60% 0%, 100% 0%, 100% 100%, 30% 100%)",
            opacity: 0.85,
          }}
        />

        {/* Accent stripe */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#0f172a",
            clipPath: "polygon(65% 0%, 70% 0%, 40% 100%, 35% 100%)",
            opacity: 0.75,
          }}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
        <div className="relative shrink-0">
          <div
            className="
              w-24 h-24 lg:w-32 lg:h-32
              rounded-full overflow-hidden
              border-4 border-gray-300/50
              shadow-[0_0_16px_var(--team-color)]
              shadow-[0_10px_30px_rgba(0,0,0,0.35)]
              backdrop-blur-sm
              bg-[var(--team-color)]
            "
            style={{
              "--team-color": playerUtils.getTeamColor(
                player.team,
                player.season
              ),
            }}
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
          <TeamLogoLink
            teamLogoUrl={teamLogoUrl}
            player={player}
            teamColor={playerUtils.getTeamColor(player.team, player.season)}
            showStroke={player.team === "TBL"}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 xl:hidden w-16 h-16 flex items-center justify-center z-10 hover:opacity-80 transition-opacity"
          />
        </div>
        <div className="xl:flex-1 min-w-0 py-3 text-center lg:text-left">
          <h2 className="text-2xl lg:text-3xl lg:text-4xl font-bold mb-2 lg:mb-3 truncate">
            {player.name}
          </h2>
          <div className="space-y-2">
            <div className="flex flex-wrap font-semibold items-center justify-center lg:justify-start gap-2 lg:gap-3 text-gray-300">
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
                  <BiometricItem icon={Ruler} value={biometrics.height} />
                )}
                {biometrics?.weight && (
                  <BiometricItem
                    icon={Scale}
                    value={`${Math.round(biometrics.weight)} lbs`}
                  />
                )}
                {player?.age && (
                  <BiometricItem icon={Calendar} value={`Age ${player.age}`} />
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
        <TeamLogoLink
          teamLogoUrl={teamLogoUrl}
          player={player}
          className="hidden xl:flex shrink-0 w-40 lg:h-40 items-center justify-center hover:opacity-80 transition-opacity"
        />
      </div>
    </div>
  );
};
