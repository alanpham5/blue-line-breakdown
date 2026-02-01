import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Ruler, Scale, Calendar, Share } from "lucide-react";
import { playerUtils } from "../../utils/playerUtils";
import { ArchetypeBadge } from "./ArchetypeBadge";
import { useTheme } from "../../providers/ThemeContext";

const BiometricItem = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-1.5 text-gray-300 light:text-gray-600">
    <Icon className="w-4 h-4 text-cyan-400 light:text-cyan-600" />
    <span className="text-sm lg:text-base">{value}</span>
  </div>
);

const TeamLogoLink = ({
  player,
  className,
  actualTheme = "dark",
  showCup = false,
}) => {
  const wonCup =
    playerUtils.didWinStanleyCup(player.team, player.season) && showCup;
  const teamLogoUrl = player.team
    ? playerUtils.getTeamLogoUrl(
        player.team,
        player.season,
        wonCup ? "dark" : actualTheme
      )
    : null;

  if (!teamLogoUrl) return null;

  return (
    <Link
      to={`/teams?season=${player.season}&team=${player.team}&position=${player.position}`}
      className={wonCup ? `relative ${className}` : className}
    >
      {wonCup && (
        <img
          src="/stanleycup.png"
          alt="Stanley Cup"
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}
      <img
        src={teamLogoUrl}
        alt={`${player.team} logo`}
        className={`relative w-full h-full object-contain cursor-pointer team-logo-stroke ${wonCup ? "scale-75 z-10 team-logo-stroke-cup" : ""}`}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </Link>
  );
};

export const PlayerHeader = ({ player, biometrics }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();

  const teamLogoUrl = player.team
    ? playerUtils.getTeamLogoUrl(player.team, player.season, actualTheme)
    : null;

  const archetypes = player.archetypes || [];

  const activateShareable = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.append("shareable", true);
    setSearchParams(newSearchParams);
  };

  const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );

  return (
    <div className="liquid-glass-strong rounded-2xl p-4 lg:p-6 liquid-glass-animate">
      <div className="hidden xl:block absolute top-0 right-0 h-full w-44 overflow-hidden rounded-tr-xl rounded-br-2xl z-[-1]">
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

        <div
          className="absolute inset-0 player-header-overlay-bg"
          style={{
            clipPath: "polygon(65% 0%, 70% 0%, 40% 100%, 35% 100%)",
          }}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
        <div className="relative shrink-0">
          <div
            className="
              w-24 h-24 lg:w-32 lg:h-32
              rounded-full overflow-hidden
              border-4 border-gray-300/50 light:border-gray-400/60
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
            actualTheme={actualTheme}
            player={player}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 xl:hidden w-16 h-16 flex items-center justify-center z-10 hover:opacity-80 transition-opacity"
          />
        </div>
        <div className="xl:flex-1 min-w-0 py-3">
          <h2 className="flex items-center justify-center lg:justify-start gap-2 text-2xl lg:text-3xl font-bold mb-2 lg:mb-3 text-white light:text-gray-900">
            <span className="max-w-80 truncate">{player.name}</span>
            {isLocalhost && (
              <Share className="h-4 w-4" onClick={activateShareable} />
            )}
          </h2>
          <div className="space-y-2">
            <div className="flex flex-wrap font-semibold items-center justify-center lg:justify-start gap-2 md:gap-1 text-gray-300 light:text-gray-600">
              <span
                className="text-sm lg:text-base cursor-pointer hover:opacity-80"
                onClick={() =>
                  navigate(
                    `/teams?season=${player.season}&team=${player.team}&position=${player.position}`
                  )
                }
              >
                {playerUtils.getFullTeamName(player.team, player.season)}
              </span>
              <span className="text-gray-500 light:text-gray-400">•</span>
              <span className="text-sm lg:text-base">
                {playerUtils.formatSeason(player.season)}
              </span>
              <span className="text-gray-500 light:text-gray-400">•</span>
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
          actualTheme={actualTheme}
          showCup={true}
          player={player}
          className="hidden xl:flex shrink-0 w-40 lg:h-40 items-center justify-center hover:opacity-80 transition-opacity"
        />
      </div>
    </div>
  );
};
