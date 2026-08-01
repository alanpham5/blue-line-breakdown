import {
  TeamIdentityPanel,
  TeamPerformancePanel,
  TeamQualityCard,
  TeamSpecialTeamsPanel,
} from "components/teamProfile/TeamProfileSections";
import { playerUtils } from "utils/playerUtils";

export const TeamProfileShareablePreview = ({
  team,
  identity,
  offenseQuality,
  defenseQuality,
  specialTeamsQuality,
  specialUnits,
  teamQuality,
}) => {
  const teamCardGradient = playerUtils.getTeamCardGradient(
    team.id,
    team.season,
    "dark"
  );
  const logoUrl = playerUtils.getCorsWrappedUrl(
    playerUtils.getTeamLogoUrl(team.id, team.season, "dark")
  );
  const didWinStanleyCup = playerUtils.didWinStanleyCup(team.id, team.season);

  return (
    <div
      className="shareable-display-dark"
      data-export-scale="3"
      style={{
        width: 1502,
        minHeight: 1120,
        display: "flex",
        color: "white",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 12% 0%, rgba(250, 204, 21, 0.09), transparent 27%), radial-gradient(circle at 85% 8%, rgba(34, 211, 238, 0.08), transparent 28%), radial-gradient(circle at 60% 100%, rgba(192, 132, 252, 0.08), transparent 28%), linear-gradient(180deg, #020303 0%, #070809 55%, #050506 100%)",
      }}
    >
      <aside
        style={{
          width: 82,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.012)",
        }}
      >
        <div
          style={{
            position: "absolute",
            transform: "rotate(-90deg)",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 32,
            fontWeight: 800,
            color: "#f3f4f6",
          }}
        >
          <img
            src="/blb-dark.png"
            alt="Logo"
            style={{ width: 64, height: 64 }}
          />
          <span>Blue Line Breakdown</span>
        </div>
      </aside>

      <div
        style={{
          flex: 1,
          padding: "22px 24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div className="grid grid-cols-[2.15fr_1fr] items-stretch gap-3.5">
          <section
            className="team-card-surface liquid-glass overflow-hidden rounded-[28px] px-6 py-5"
            style={{ "--team-card-gradient": teamCardGradient }}
          >
            <div className="flex h-full items-center gap-5">
              <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                {didWinStanleyCup && (
                  <img
                    src="/stanleycup.png"
                    alt="Stanley Cup"
                    className="absolute inset-0 z-0 h-full w-full object-contain"
                  />
                )}
                <img
                  src={logoUrl}
                  alt={`${team.name} logo`}
                  className="team-logo-stroke relative z-10 object-contain"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: didWinStanleyCup ? "75%" : "100%",
                    maxHeight: didWinStanleyCup ? "75%" : "100%",
                  }}
                />
              </div>
              <div className="shareable-team-header-text min-w-0 flex-1">
                <h1 className="text-[2.75rem] font-extrabold leading-tight tracking-display text-white">
                  {playerUtils.getFullTeamName(team.id, team.season)}
                </h1>
                <div className="mt-2 flex items-center gap-3 text-[1.35rem] font-semibold text-gray-300">
                  <span>{playerUtils.formatSeason(team.season)}</span>
                  <span>•</span>
                  <span className="text-sky-300">{team.record}</span>
                  {team.status && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-300">{team.status}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
          <TeamQualityCard {...teamQuality} shareable />
        </div>

        <TeamIdentityPanel identity={identity} shareable />

        <div className="grid min-h-[430px] grid-cols-3 items-stretch gap-3.5">
          <TeamPerformancePanel
            type="offense"
            title="Offense"
            quality={offenseQuality}
            shareable
          />
          <TeamPerformancePanel
            type="defense"
            title="Defense"
            quality={defenseQuality}
            shareable
          />
          <TeamSpecialTeamsPanel
            quality={specialTeamsQuality}
            units={specialUnits}
            shareable
          />
        </div>

        <div className="text-center text-xl font-bold text-white/80">
          Data from MoneyPuck.com and NHL.com
        </div>
      </div>
    </div>
  );
};
