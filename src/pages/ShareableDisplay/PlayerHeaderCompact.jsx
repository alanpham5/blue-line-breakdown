import { Ruler, Scale, Calendar } from "lucide-react";
import { ArchetypeBadge } from "../Home/ArchetypeBadge";
import { Link } from "react-router-dom";
import { playerUtils } from "../../utils/playerUtils";
import { useSearchParams } from "react-router-dom";

export const PlayerHeaderCompact = ({ player, biometrics }) => {
  const teamColor = playerUtils.getTeamColor(player.team, player.season);
  const teamCardGradient = playerUtils.getTeamCardGradient(
    player.team,
    player.season,
    "dark"
  );
  const teamColorGradient = playerUtils.getSurfaceGradient(teamColor, "dark");
  const didWinStanleyCup = playerUtils.didWinStanleyCup(
    player.team,
    player.season
  );
  const teamLogoUrl = playerUtils.getTeamLogoUrl(
    player.team,
    player.season,
    "dark"
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const archetypes = player.archetypes;
  const onReset = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("shareable");
    setSearchParams(newSearchParams);
  };
  return (
    <div
      className="team-card-surface-strong relative overflow-hidden rounded-[28px] px-5 py-4 liquid-glass-strong"
      style={{ "--team-card-gradient": teamCardGradient }}
    >
      <div className="relative flex items-center gap-4">
        <div
          className="w-32 h-32 rounded-full overflow-hidden shrink-0"
          style={{ background: teamColorGradient }}
          onClick={onReset}
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
        <div className="min-w-0 flex-1">
          <h2 className="text-4xl font-bold mb-0.5 text-white">
            {player.name}
          </h2>

          <div className="text-xl font-semibold text-gray-300">
            {playerUtils.getFullTeamName(player.team, player.season)} •{" "}
            {playerUtils.formatSeason(player.season)}
          </div>

          <div className="flex gap-3 mt-1.5 text-lg text-gray-300">
            {biometrics?.height && (
              <span className="flex items-center gap-1">
                <Ruler className="h-4 w-4 text-sky-300" />
                {biometrics.height}
              </span>
            )}
            {biometrics?.weight && (
              <span className="flex items-center gap-1">
                <Scale className="h-4 w-4 text-sky-300" />
                {Math.round(biometrics.weight)} lbs
              </span>
            )}
            {player?.age && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-sky-300" />
                Age {player.age}
              </span>
            )}
          </div>
          {archetypes.length > 0 && (
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3">
              {archetypes.map((archetype, idx) => (
                <ArchetypeBadge key={idx} archetype={archetype} forceDark />
              ))}
            </div>
          )}
        </div>

        {teamLogoUrl && (
          <Link
            to={`/teams?season=${player.season}&team=${player.team}&position=${player.position}`}
            className="relative shrink-0 w-36 h-36"
          >
            {didWinStanleyCup && (
              <img
                src="/stanleycup.png"
                alt="Stanley Cup"
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
            <img
              src={teamLogoUrl}
              alt={`${player.team} logo`}
              className={`relative w-full h-full object-contain team-logo-stroke ${
                didWinStanleyCup ? "scale-75 z-10 team-logo-stroke-cup" : ""
              }`}
            />
          </Link>
        )}
      </div>
    </div>
  );
};
