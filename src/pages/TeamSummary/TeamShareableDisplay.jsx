import { Target, Shield, Flame, Activity, Users } from "lucide-react";
import { playerUtils } from "../../utils/playerUtils";

const CompactStatBar = ({ label, percentile, type = "offensive" }) => {
  let color = "from-cyan-500 to-sky-400";
  let valueColor = "text-cyan-300";
  let trackColor = "bg-[rgba(20,78,98,0.56)]";

  if (type === "defensive") {
    color = "from-rose-500 to-red-400";
    valueColor = "text-rose-400";
    trackColor = "bg-[rgba(112,26,46,0.52)]";
  } else if (type === "aggressiveness" || type === "pace") {
    color = "from-amber-500 to-orange-400";
    valueColor = "text-amber-300";
    trackColor = "bg-[rgba(120,80,20,0.52)]";
  }

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-0.5 gap-2">
        <span className="text-sm font-semibold text-gray-300 truncate">
          {label}
        </span>
        <span className={`text-sm font-bold ${valueColor}`}>
          {percentile.toFixed(1)}
        </span>
      </div>
      <div
        className={`w-full h-1.5 overflow-hidden rounded-full ${trackColor}`}
      >
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, percentile))}%` }}
        />
      </div>
    </div>
  );
};

const RatingBadge = ({ value, color }) => (
  <span className={`text-lg font-extrabold tracking-[-0.04em] ${color}`}>
    {value.toFixed(1)}%
  </span>
);

export const TeamShareableDisplay = ({
  team,
  season,
  teamSummaryData,
  teamRecord,
  teamClinchStatus,
}) => {
  if (!teamSummaryData) {
    return (
      <div
        style={{
          width: 1200,
          height: 960,
          background:
            "linear-gradient(180deg, #020202 0%, #070708 42%, #0b0b0d 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: 28,
        }}
      >
        No team data available
      </div>
    );
  }

  const didWinStanleyCup = playerUtils.didWinStanleyCup(team, season);
  const teamCardGradient = playerUtils.getTeamCardGradient(
    team,
    season,
    "dark"
  );
  const teamLogoUrl = playerUtils.getCorsWrappedUrl(
    playerUtils.getTeamLogoUrl(team, season, "dark")
  );
  const stats = teamSummaryData.stats;

  return (
    <div
      className="shareable-display-dark"
      style={{
        width: 1200,
        height: 960,
        background:
          "radial-gradient(circle at 18% 0%, rgba(166, 255, 15, 0.08) 0%, rgba(166, 255, 15, 0) 26%), radial-gradient(circle at 92% 16%, rgba(18, 223, 246, 0.07) 0%, rgba(18, 223, 246, 0) 24%), radial-gradient(circle at 50% 100%, rgba(255, 55, 95, 0.05) 0%, rgba(255, 55, 95, 0) 26%), linear-gradient(180deg, #020202 0%, #070708 42%, #0b0b0d 100%)",
        display: "flex",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Brand sidebar */}
      <div
        style={{
          width: 75,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.01)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#f3f4f6",
            textTransform: "uppercase",
          }}
        >
          <img
            src="/blb-dark.png"
            alt="Logo"
            style={{ width: 44, height: 44, display: "block" }}
          />
          <span>Blue Line Breakdown</span>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          padding: "16px 48px 16px",
          display: "grid",
          gridTemplateRows: "auto 1.55fr 0.75fr auto",
          gap: 10,
        }}
      >
        {/* Team Header */}
        <div
          className="team-card-surface liquid-glass rounded-[28px] overflow-hidden px-5 py-5"
          style={{ "--team-card-gradient": teamCardGradient }}
        >
          <div className="flex items-center justify-center gap-5">
            <div className="relative h-24 w-24 flex justify-center items-center shrink-0">
              {didWinStanleyCup && (
                <img
                  src="/stanleycup.png"
                  alt="Stanley Cup"
                  className="absolute inset-0 w-full h-full object-contain z-0"
                />
              )}
              {teamLogoUrl && (
                <img
                  src={teamLogoUrl}
                  alt={`${team} logo`}
                  className={`team-logo-stroke z-10 ${
                    didWinStanleyCup ? "scale-75" : ""
                  }`}
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    display: "block",
                    margin: "auto",
                  }}
                />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-white">
                {playerUtils.getFullTeamName(team, season)}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1 text-base font-semibold text-gray-300">
                <span>{playerUtils.formatSeason(season)}</span>
                {teamRecord && (
                  <>
                    <span>•</span>
                    <span className="text-sky-300">{teamRecord}</span>
                  </>
                )}
                {teamClinchStatus && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-300">{teamClinchStatus}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Offense */}
          <div className="liquid-glass-strong rounded-[22px] px-4 py-3">
            <div
              className="flex items-center justify-between mb-2"
              style={{ position: "relative", top: "-8px" }}
            >
              <div className="flex items-center gap-1.5">
                <Target className="h-5 w-5 shrink-0 text-cyan-300" />
                <h3 className="text-base font-extrabold text-white">Offense</h3>
              </div>
              <RatingBadge value={stats.offense_rating} color="text-cyan-300" />
            </div>
            <CompactStatBar
              label="Goal Scoring"
              percentile={stats.goals_pg_pct}
              type="offensive"
            />
            <CompactStatBar
              label="Chance Creation"
              percentile={stats.xg_pg_pct}
              type="offensive"
            />
            <CompactStatBar
              label="Dangerous Shots"
              percentile={stats.high_danger_shots_pg_pct}
              type="offensive"
            />
            <CompactStatBar
              label="Shots on Net"
              percentile={stats.shots_on_goal_pg_pct}
              type="offensive"
            />
            <CompactStatBar
              label="Rebound Chances"
              percentile={stats.rebound_xg_pg_pct}
              type="offensive"
            />
          </div>

          {/* Defense */}
          <div className="liquid-glass-strong rounded-[22px] px-4 py-3">
            <div
              className="flex items-center justify-between mb-2"
              style={{ position: "relative", top: "-8px" }}
            >
              <div className="flex items-center gap-1.5">
                <Shield className="h-5 w-5 shrink-0 text-rose-400" />
                <h3 className="text-base font-extrabold text-white">Defense</h3>
              </div>
              <RatingBadge value={stats.defense_rating} color="text-rose-400" />
            </div>
            <CompactStatBar
              label="Goals Allowed"
              percentile={stats.goals_against_pg_pct}
              type="defensive"
            />
            <CompactStatBar
              label="Chances Allowed"
              percentile={stats.xg_against_pg_pct}
              type="defensive"
            />
            <CompactStatBar
              label="Dangerous Shots Allowed"
              percentile={stats.high_danger_shots_against_pg_pct}
              type="defensive"
            />
            <CompactStatBar
              label="Shots Allowed"
              percentile={stats.shots_against_pg_pct}
              type="defensive"
            />
            <CompactStatBar
              label="Takeaways"
              percentile={stats.takeaways_pg_pct}
              type="defensive"
            />
          </div>

          {/* Aggressiveness */}
          <div className="liquid-glass-strong rounded-[22px] px-4 py-3">
            <div
              className="flex items-center justify-between mb-2"
              style={{ position: "relative", top: "-8px" }}
            >
              <div className="flex items-center gap-1.5">
                <Flame className="h-5 w-5 shrink-0 text-amber-300" />
                <h3 className="text-base font-extrabold text-white">
                  Aggression
                </h3>
              </div>
              <RatingBadge
                value={stats.aggressiveness_rating}
                color="text-amber-300"
              />
            </div>
            <CompactStatBar
              label="Hits"
              percentile={stats.hits_pg_pct}
              type="aggressiveness"
            />
            <CompactStatBar
              label="Penalties Taken"
              percentile={stats.penalties_pg_pct}
              type="aggressiveness"
            />
            <CompactStatBar
              label="Penalty Minutes"
              percentile={stats.penalty_minutes_pg_pct}
              type="aggressiveness"
            />
            <CompactStatBar
              label="Shots Blocked"
              percentile={stats.blocked_shots_pg_pct}
              type="aggressiveness"
            />
          </div>

          {/* Miscellaneous */}
          <div className="liquid-glass-strong rounded-[22px] px-4 py-3">
            <div
              className="flex items-center gap-1.5 mb-2"
              style={{ position: "relative", top: "-8px" }}
            >
              <Activity className="h-5 w-5 shrink-0 text-sky-300" />
              <h3 className="text-base font-extrabold text-white">Misc</h3>
            </div>
            <div className="mb-2">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 mb-1">
                Possession
              </div>
              <CompactStatBar
                label="Puck Management"
                percentile={stats.possession_pct}
                type="offensive"
              />
            </div>
            <div className="pt-1.5 border-t border-white/5">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 mb-1">
                Pace
              </div>
              <CompactStatBar
                label="Game Pace"
                percentile={stats.pace_pg_pct}
                type="pace"
              />
            </div>
          </div>
        </div>

        {/* Bottom row: Top Players + Similar Teams */}
        <div className="grid grid-cols-[1fr_auto] gap-3">
          {/* Top Impact Players */}
          <div className="liquid-glass-strong rounded-[22px] px-4 py-3">
            <div
              className="flex items-center gap-2 mb-2"
              style={{ position: "relative", top: "-8px" }}
            >
              <Users className="h-5 w-5 shrink-0 text-amber-300" />
              <h3 className="text-base font-extrabold text-white">
                Top Impact Players
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-0">
              {/* Forwards */}
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.12em] text-cyan-300 mb-1.5">
                  Forwards
                </h4>
                <div className="space-y-2">
                  {teamSummaryData.topForwards?.slice(0, 4).map((fw) => (
                    <div
                      key={fw.playerId}
                      className="flex items-center gap-1.5"
                    >
                      <img
                        src={playerUtils.getCorsWrappedUrl(
                          playerUtils.getPlayerHeadshot(
                            fw.playerId,
                            team,
                            season
                          )
                        )}
                        alt={fw.name}
                        className="w-7 h-7 rounded-full object-cover bg-zinc-900 shrink-0"
                        onError={(e) => {
                          e.target.src = playerUtils.getCorsWrappedUrl(
                            playerUtils.getDefaultHeadshot()
                          );
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white player-name-truncate">
                          {fw.name}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-cyan-300 shrink-0">
                        {fw.warPercentile.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Defensemen */}
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.12em] text-rose-400 mb-1.5">
                  Defensemen
                </h4>
                <div className="space-y-2">
                  {teamSummaryData.topDefensemen?.slice(0, 4).map((df) => (
                    <div
                      key={df.playerId}
                      className="flex items-center gap-1.5"
                    >
                      <img
                        src={playerUtils.getCorsWrappedUrl(
                          playerUtils.getPlayerHeadshot(
                            df.playerId,
                            team,
                            season
                          )
                        )}
                        alt={df.name}
                        className="w-7 h-7 rounded-full object-cover bg-zinc-900 shrink-0"
                        onError={(e) => {
                          e.target.src = playerUtils.getCorsWrappedUrl(
                            playerUtils.getDefaultHeadshot()
                          );
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white player-name-truncate">
                          {df.name}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-rose-400 shrink-0">
                        {df.warPercentile.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Goalies */}
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.12em] text-amber-300 mb-1.5">
                  Goalies
                </h4>
                <div className="space-y-2">
                  {teamSummaryData.topGoalies?.slice(0, 2).map((gl) => (
                    <div
                      key={gl.playerId}
                      className="flex items-center gap-1.5"
                    >
                      <img
                        src={playerUtils.getCorsWrappedUrl(
                          playerUtils.getPlayerHeadshot(
                            gl.playerId,
                            team,
                            season
                          )
                        )}
                        alt={gl.name}
                        className="w-7 h-7 rounded-full object-cover bg-zinc-900 shrink-0"
                        onError={(e) => {
                          e.target.src = playerUtils.getCorsWrappedUrl(
                            playerUtils.getDefaultHeadshot()
                          );
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white player-name-truncate">
                          {gl.name}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-amber-300 shrink-0">
                        {gl.warPercentile.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Teams */}
          {teamSummaryData.similarTeams &&
            teamSummaryData.similarTeams.length > 0 && (
              <div
                className="liquid-glass-strong rounded-[22px] px-3.5 py-3"
                style={{ width: 290 }}
              >
                <h3
                  className="text-base font-extrabold text-white mb-2"
                  style={{
                    position: "relative",
                    top: "-8px",
                    display: "block",
                  }}
                >
                  Most Similar Teams
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 place-items-center">
                  {teamSummaryData.similarTeams.slice(0, 4).map((similar) => (
                    <div
                      key={`${similar.team}-${similar.season}`}
                      className="text-center"
                    >
                      <div className="relative w-16 h-16 mx-auto mb-1">
                        <div
                          className="h-16 w-16 overflow-hidden rounded-full bg-zinc-950/55 flex items-center justify-center"
                          style={{
                            border: `1px solid ${playerUtils.toRgba(
                              playerUtils.getTeamColor(
                                similar.team,
                                similar.season,
                                "dark"
                              ),
                              0.3
                            )}`,
                          }}
                        >
                          <img
                            src={playerUtils.getCorsWrappedUrl(
                              playerUtils.getTeamLogoUrl(
                                similar.team,
                                similar.season,
                                "dark"
                              )
                            )}
                            alt={similar.team}
                            className="team-logo-stroke scale-110"
                            style={{
                              width: "auto",
                              height: "auto",
                              maxWidth: "100%",
                              maxHeight: "100%",
                              display: "block",
                              margin: "auto",
                            }}
                            onError={(e) => {
                              e.target.src = playerUtils.getCorsWrappedUrl(
                                "https://assets.nhle.com/logos/nhl/svg/NHL_dark.svg"
                              );
                            }}
                          />
                        </div>
                        <div
                          className="absolute bottom-[-4px] right-[-4px] flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe57e] to-[#ffd037] text-[9px] font-bold text-[#4f3d00] shadow-md z-20"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                          }}
                        >
                          <span
                            className="shareable-similarity-score"
                            style={{
                              display: "block",
                              lineHeight: "1",
                              position: "relative",
                              top: "-1px",
                            }}
                          >
                            {Math.round(similar.similarity)}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-white leading-tight max-w-[110px] truncate mx-auto">
                        {playerUtils.getFullTeamName(
                          similar.team,
                          similar.season
                        )}
                      </p>
                      <p className="text-[9px] uppercase tracking-[0.16em] text-gray-400 mt-0.5">
                        {playerUtils.formatSeason(similar.season)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="text-sm pt-0.5 font-bold justify-self-center text-white/90">
          Data from MoneyPuck.com and NHL.com
        </div>
      </div>
    </div>
  );
};
