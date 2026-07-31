import { useLayoutEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ruler, Scale, Calendar, Download, Share } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { ArchetypeBadge } from "features/players/components/ArchetypeBadge";
import { useTheme } from "providers/ThemeContext";
import { useIsMobile } from "hooks/useIsMobile";
import { BookmarkButton } from "components/ui/BookmarkButton";
import { ENTITY_TYPES } from "lib/firebase/firestore";
const BiometricItem = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-1.5 text-gray-300 light:text-gray-600">
    <Icon className="h-3.5 w-3.5 shrink-0 text-sky-300 light:text-sky-600 sm:h-4 sm:w-4" />
    <span className="text-[0.8125rem] lg:text-[0.9375rem]">{value}</span>
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
export const PlayerHeader = ({ player, biometrics, onShareClick }) => {
  const playerNameRef = useRef(null);
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const isMobile = useIsMobile();
  const teamCardGradient = playerUtils.getTeamCardGradient(
    player.team,
    player.season,
    actualTheme
  );
  const didWinStanleyCup = playerUtils.didWinStanleyCup(
    player.team,
    player.season
  );
  const archetypes = player.archetypes || [];
  useLayoutEffect(() => {
    const node = playerNameRef.current;
    if (!node) return undefined;
    const fitName = () => {
      node.style.setProperty("--player-name-shrink", "0px");
      for (let shrink = 1; shrink <= 5; shrink += 1) {
        if (node.scrollWidth <= node.clientWidth) break;
        node.style.setProperty("--player-name-shrink", `${shrink}px`);
      }
    };
    let frame = window.requestAnimationFrame(fitName);
    const handleResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(fitName);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [player.name]);
  return (
    <div
      className="team-card-surface-strong liquid-glass-strong liquid-glass-animate overflow-hidden rounded-[32px] px-5 py-4 lg:px-6 lg:py-5"
      style={{
        "--team-card-gradient": teamCardGradient,
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center lg:flex-row lg:items-center lg:gap-6 lg:text-left">
        <div className="flex shrink-0 flex-col items-center pb-8 xl:pb-0">
          <div className="relative shrink-0">
            <div
              className="
              w-24 h-24 lg:w-32 lg:h-32
              rounded-full overflow-hidden
              shadow-[0_18px_40px_rgba(0,0,0,0.35)]
              backdrop-blur-sm
            "
              style={{
                background: playerUtils.getSurfaceGradient(
                  playerUtils.getTeamColor(player.team, player.season),
                  "dark"
                ),
                boxShadow: `0 0 0 8px ${playerUtils.getTeamColor(player.team, player.season)}20`,
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
            <div className="absolute bottom-0 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 translate-y-1/2 items-center justify-center transition-transform duration-300 active:scale-105 sm:hover:scale-105 xl:hidden">
              <TeamLogoLink
                actualTheme={actualTheme}
                player={player}
                className="flex h-full w-full items-center justify-center"
              />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 w-full max-w-full flex-col items-center py-1 lg:items-start xl:flex-1">
          <h2 className="mb-3 flex min-w-0 w-full items-center justify-center gap-2 text-[1.7rem] font-bold tracking-display text-white light:text-gray-900 sm:text-[1.8rem] lg:justify-start lg:text-[2.2rem]">
            <span
              ref={playerNameRef}
              className="min-w-0 truncate"
              style={{
                fontSize:
                  "calc(clamp(1.1rem, 4vw, 2.2rem) - var(--player-name-shrink, 0px))",
              }}
            >
              {player.name}
            </span>
            {didWinStanleyCup && (
              <img
                src="/stanleycup.png"
                alt="Stanley Cup"
                className="shrink-0 w-5 h-9 object-cover xl:hidden"
              />
            )}
            {onShareClick && (
              <button
                type="button"
                onClick={onShareClick}
                className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:text-white light:border-slate-300 light:bg-white/80 light:text-slate-600 light:hover:text-slate-900"
                aria-label={
                  isMobile ? "Share image" : "Download shareable image"
                }
              >
                {isMobile ? (
                  <Share className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            )}
            <BookmarkButton
              entityType={ENTITY_TYPES.PLAYER}
              entityId={player.playerId}
              size="sm"
              className="shrink-0"
              meta={{
                label: player.name,
                player: player.name,
                season: player.season,
                position: player.position,
                team: player.team,
              }}
            />
          </h2>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2 text-[0.8125rem] font-semibold text-gray-300 light:text-gray-600 md:gap-1 lg:justify-start lg:text-[0.9375rem]">
              <span
                className="cursor-pointer hover:opacity-80"
                onClick={() =>
                  navigate(
                    `/teams?season=${player.season}&team=${player.team}&position=${player.position}`
                  )
                }
              >
                {playerUtils.getFullTeamName(player.team, player.season)}
              </span>
              <span className="text-gray-500 light:text-gray-400">•</span>
              <span
                className="cursor-pointer hover:opacity-80"
                onClick={() =>
                  navigate(
                    `/leaderboard?position=${player.position}&season=${player.season}`
                  )
                }
              >
                {playerUtils.formatSeason(player.season)}
              </span>
              <span className="text-gray-500 light:text-gray-400">•</span>
              <span>
                {player.position === "F"
                  ? "Forward"
                  : player.position === "D"
                    ? "Defense"
                    : "Goalie"}
              </span>
            </div>
            {(biometrics?.height || biometrics?.weight || player?.age) && (
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start lg:gap-4">
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
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
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
          className="hidden shrink-0 transition-transform duration-300 active:scale-105 xl:flex xl:h-44 xl:w-44 xl:items-center xl:justify-center xl:hover:-translate-y-1 xl:hover:scale-105"
        />
      </div>
    </div>
  );
};
