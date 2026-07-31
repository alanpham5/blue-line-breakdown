import { Ruler, Scale, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { playerUtils } from "utils/playerUtils";
import { archetypeIcons } from "features/players/components/ArchetypeBadge";
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
      className="team-card-surface-strong relative h-full overflow-hidden rounded-[28px] px-6 py-5 liquid-glass-strong"
      style={{
        "--team-card-gradient": teamCardGradient,
      }}
    >
      <div className="relative flex h-full items-center gap-5">
        <div
          className="h-36 w-36 shrink-0 overflow-hidden rounded-full"
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
          <h2 className="mb-0.5 text-[2.75rem] font-bold leading-tight text-white">
            {player.name}
          </h2>

          <div className="text-[1.35rem] font-semibold text-gray-300">
            {playerUtils.getFullTeamName(player.team, player.season)} •{" "}
            {playerUtils.formatSeason(player.season)}
          </div>

          <div className="shareable-bio-container mt-2 flex gap-4 text-xl text-gray-300">
            {biometrics?.height && (
              <span className="flex items-center gap-1">
                <Ruler className="h-5 w-5 text-sky-300" />
                <span className="shareable-bio-value">{biometrics.height}</span>
              </span>
            )}
            {biometrics?.weight && (
              <span className="flex items-center gap-1">
                <Scale className="h-5 w-5 text-sky-300" />
                <span className="shareable-bio-value">
                  {Math.round(biometrics.weight)} lbs
                </span>
              </span>
            )}
            {player?.age && (
              <span className="flex items-center gap-1">
                <Calendar className="h-5 w-5 text-sky-300" />
                <span className="shareable-bio-value">Age {player.age}</span>
              </span>
            )}
          </div>
          {archetypes.length > 0 && (
            <div className="flex flex-wrap items-center justify-start gap-2 mt-3">
              {archetypes.map((archetype, idx) => {
                const Icon = archetypeIcons[archetype];
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-base font-semibold text-sky-200"
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0 text-sky-300" />}
                    <span className="shareable-pill-text">{archetype}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {teamLogoUrl && (
          <Link
            to={`/teams?season=${player.season}&team=${player.team}&position=${player.position}`}
            className="relative flex h-40 w-40 shrink-0 items-center justify-center"
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
