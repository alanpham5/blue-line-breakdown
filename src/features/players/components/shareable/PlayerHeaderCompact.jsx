import { Ruler, Scale, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { playerUtils } from "utils/playerUtils";
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
  const teamLogoUrl = playerUtils.getCorsWrappedUrl(
    playerUtils.getTeamLogoUrl(player.team, player.season, "dark")
  );
  const archetypes = player.archetypes;
  return (
    <div
      className="team-card-surface-strong relative overflow-hidden rounded-[28px] px-5 py-4 liquid-glass-strong"
      style={{
        "--team-card-gradient": teamCardGradient,
      }}
    >
      <div className="relative flex items-center gap-4">
        <div
          className="w-32 h-32 rounded-full overflow-hidden shrink-0"
          style={{
            background: teamColorGradient,
          }}
        >
          <img
            src={playerUtils.getCorsWrappedUrl(
              playerUtils.getPlayerHeadshot(
                player.playerId,
                player.team,
                player.season
              )
            )}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = playerUtils.getCorsWrappedUrl(
                playerUtils.getDefaultHeadshot()
              );
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

          <div className="flex gap-3 mt-1.5 text-lg text-gray-300 shareable-bio-container">
            {biometrics?.height && (
              <span className="flex items-center gap-1">
                <Ruler className="h-4 w-4 text-sky-300" />
                <span className="shareable-bio-value">{biometrics.height}</span>
              </span>
            )}
            {biometrics?.weight && (
              <span className="flex items-center gap-1">
                <Scale className="h-4 w-4 text-sky-300" />
                <span className="shareable-bio-value">
                  {Math.round(biometrics.weight)} lbs
                </span>
              </span>
            )}
            {player?.age && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-sky-300" />
                <span className="shareable-bio-value">Age {player.age}</span>
              </span>
            )}
          </div>
          {archetypes.length > 0 && (
            <div className="flex flex-wrap items-center justify-start gap-2 mt-3">
              {archetypes.map((archetype, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/10 px-2.5 py-1 text-xs sm:text-sm font-semibold text-sky-200"
                >
                  <span className="shareable-pill-text leading-none">
                    {archetype}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {teamLogoUrl && (
          <Link
            to={`/teams?season=${player.season}&team=${player.team}&position=${player.position}`}
            className="relative shrink-0 w-36 h-36 flex items-center justify-center"
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
              className={`team-logo-stroke ${didWinStanleyCup ? "scale-75 z-10 team-logo-stroke-cup" : ""}`}
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "100%",
                display: "block",
                margin: "auto",
              }}
            />
          </Link>
        )}
      </div>
    </div>
  );
};
