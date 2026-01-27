import { Ruler, Scale, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { playerUtils } from "../../utils/playerUtils";

export const PlayerHeaderCompact = ({ player, biometrics }) => {
  const teamColor = playerUtils.getTeamColor(player.team, player.season);
  const teamLogoUrl = playerUtils.getTeamLogoUrl(player.team, player.season);

  return (
    <div className="relative liquid-glass-strong rounded-2xl py-3 px-5 overflow-hidden border-cyan-400/30">
      {/* TEAM COLOR PATCH */}
      <div
        className="absolute top-0 right-0 h-full w-28"
        style={{
          backgroundColor: teamColor,
          clipPath: "polygon(40% 0%, 100% 0%, 100% 100%, 5% 100%)",
          opacity: 0.9,
        }}
      />

      {/* BLACK ACCENT STRIP */}
      <div
        className="absolute top-0 right-0 h-full w-28"
        style={{
          backgroundColor: "#020617",
          clipPath: "polygon(49% 0%, 57% 0%, 24% 100%, 16% 100%)",
          opacity: 0.6,
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* HEADSHOT */}
        <div
          className="w-28 h-28 rounded-full overflow-hidden border-[3px] border-gray-300/60 shrink-0"
          style={{ backgroundColor: teamColor }}
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

        {/* INFO */}
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold truncate mb-0.5">{player.name}</h2>

          <div className="text-base text-gray-300">
            {playerUtils.getFullTeamName(player.team, player.season)} •{" "}
            {playerUtils.formatSeason(player.season)}
          </div>

          <div className="flex gap-3 mt-1.5 text-sm text-gray-300">
            {biometrics?.height && (
              <span className="flex items-center gap-1">
                <Ruler className="w-4 h-4 text-cyan-400" />
                {biometrics.height}
              </span>
            )}
            {biometrics?.weight && (
              <span className="flex items-center gap-1">
                <Scale className="w-4 h-4 text-cyan-400" />
                {Math.round(biometrics.weight)} lbs
              </span>
            )}
            {player?.age && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Age {player.age}
              </span>
            )}
          </div>
        </div>

        {/* TEAM LOGO */}
        {teamLogoUrl && (
          <Link
            to={`/teams?season=${player.season}&team=${player.team}`}
            className="shrink-0 w-28 h-28"
          >
            <img
              src={teamLogoUrl}
              alt={`${player.team} logo`}
              className="w-full h-full object-contain"
            />
          </Link>
        )}
      </div>
    </div>
  );
};
