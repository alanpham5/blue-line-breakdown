import { Users, Shield, Hand } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
const getSeasonName = (s) => `${s}-${(parseInt(s) + 1).toString().slice(-2)}`;
const percentileFill = (pct) => {
  if (typeof pct !== "number")
    return "linear-gradient(to right, #6b7280, #9ca3af)";
  if (pct >= 66) return "linear-gradient(to right, #10b981, #4ade80)";
  if (pct >= 40) return "linear-gradient(to right, #f59e0b, #facc15)";
  return "linear-gradient(to right, #f43f5e, #f87171)";
};
const ratingColor = (value) => {
  if (typeof value !== "number") return "#d1d5db";
  if (value >= 66) return "#6ee7b7";
  if (value >= 40) return "#fcd34d";
  return "#fb7185";
};
const fmt = (v) => (typeof v === "number" ? v.toFixed(0) : "—");
const PlayerChip = ({ player, team, season }) => {
  const pct =
    typeof player.warPercentile === "number" ? player.warPercentile : null;
  return (
    <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2">
      <img
        src={playerUtils.getCorsWrappedUrl(
          player.isRookie
            ? playerUtils.getDefaultHeadshot()
            : playerUtils.getPlayerHeadshot(
                player.playerId,
                player.team || team,
                season
              )
        )}
        alt={player.name || "Player"}
        className="h-10 w-10 shrink-0 rounded-full object-cover bg-zinc-900"
        onError={(e) => {
          e.target.src = playerUtils.getCorsWrappedUrl(
            playerUtils.getDefaultHeadshot()
          );
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-white player-name-truncate">
          {player.name || "Unknown"}
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${pct != null ? Math.min(100, Math.max(0, pct)) : 0}%`,
              background: percentileFill(pct),
            }}
          />
        </div>
      </div>
    </div>
  );
};
const LineRow = ({ label, unit, team, season }) => {
  const r = unit.ratings || {};
  return (
    <div className="liquid-glass rounded-[20px] px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-300">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <MiniStat label="Off" value={r.offense} />
          <MiniStat label="Def" value={r.defense} />
          <MiniStat label="Phy" value={r.physicality} />
          <div className="flex items-center gap-1 border-l border-white/10 pl-3">
            <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-gray-400">
              Ovr
            </span>
            <span
              className="text-lg font-extrabold"
              style={{ color: ratingColor(r.overall) }}
            >
              {fmt(r.overall)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {unit.players?.map((player, i) => (
          <PlayerChip
            key={`${player.playerId}-${i}`}
            player={player}
            team={team}
            season={season}
          />
        ))}
      </div>
    </div>
  );
};
const MiniStat = ({ label, value }) => (
  <div className="flex items-center gap-1">
    <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </span>
    <span
      className="text-sm font-bold"
      style={{ color: ratingColor(value) }}
    >
      {fmt(value)}
    </span>
  </div>
);
const Section = ({ icon, title, children }) => (
  <div className="liquid-glass-strong rounded-[26px] px-5 py-4">
    <div
      className="mb-3 flex items-center gap-2"
      style={{ position: "relative", top: "-6px" }}
    >
      {icon}
      <h3 className="text-lg font-extrabold tracking-display text-white">
        {title}
      </h3>
    </div>
    <div className="space-y-2.5">{children}</div>
  </div>
);
export const RosterShareableDisplay = ({
  team,
  season,
  forwardUnits = [],
  defenseUnits = [],
  goalieUnits = [],
  recordText,
  clinchStatus,
  modifying = false,
  estimated,
}) => {
  const didWinStanleyCup = playerUtils.didWinStanleyCup(team, season);
  const teamCardGradient = playerUtils.getTeamCardGradient(team, season, "dark");
  const teamLogoUrl = playerUtils.getCorsWrappedUrl(
    playerUtils.getTeamLogoUrl(team, season, "dark")
  );
  return (
    <div
      className="shareable-display-dark"
      style={{
        width: 1200,
        background:
          "radial-gradient(circle at 18% 0%, rgba(166, 255, 15, 0.08) 0%, rgba(166, 255, 15, 0) 26%), radial-gradient(circle at 92% 16%, rgba(18, 223, 246, 0.07) 0%, rgba(18, 223, 246, 0) 24%), radial-gradient(circle at 50% 100%, rgba(255, 55, 95, 0.05) 0%, rgba(255, 55, 95, 0) 26%), linear-gradient(180deg, #020202 0%, #070708 42%, #0b0b0d 100%)",
        display: "flex",
        color: "white",
        overflow: "hidden",
      }}
    >
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
            color: "#f3f4f6",
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

      <div
        style={{
          flex: 1,
          padding: "20px 48px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
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
                  className={`team-logo-stroke z-10 ${didWinStanleyCup ? "scale-75" : ""}`}
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
              <h2 className="text-3xl font-extrabold tracking-display text-white">
                {playerUtils.getFullTeamName(team, season)}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1 text-base font-semibold text-gray-300">
                <span>{getSeasonName(season)}</span>
                {modifying && estimated ? (
                  <>
                    <span>•</span>
                    <span className="text-sky-300">
                      Est. {estimated.display}
                    </span>
                    {typeof estimated.playoffProbability === "number" && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-300">
                          {Math.round(estimated.playoffProbability * 100)}%
                          playoffs
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {recordText && (
                      <>
                        <span>•</span>
                        <span className="text-sky-300">{recordText}</span>
                      </>
                    )}
                    {clinchStatus && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-300 whitespace-nowrap">
                          {clinchStatus}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <Section
          icon={<Users className="h-5 w-5 shrink-0 text-cyan-300" />}
          title="Forwards"
        >
          {forwardUnits.map((unit, i) => (
            <LineRow
              key={unit.lineId || `f-${i}`}
              label={`Line ${i + 1}`}
              unit={unit}
              team={team}
              season={season}
            />
          ))}
        </Section>

        <Section
          icon={<Shield className="h-5 w-5 shrink-0 text-rose-400" />}
          title="Defense"
        >
          {defenseUnits.map((unit, i) => (
            <LineRow
              key={unit.lineId || `d-${i}`}
              label={`Pairing ${i + 1}`}
              unit={unit}
              team={team}
              season={season}
            />
          ))}
        </Section>

        {goalieUnits.length > 0 && (
          <Section
            icon={<Hand className="h-5 w-5 shrink-0 text-amber-300" />}
            title="Goalies"
          >
            <div className="flex gap-2">
              {goalieUnits.map((g, i) => (
                <PlayerChip
                  key={g.playerId || `g-${i}`}
                  player={g}
                  team={team}
                  season={season}
                />
              ))}
            </div>
          </Section>
        )}

        <div className="text-sm pt-0.5 font-bold text-center text-white/90">
          Data from MoneyPuck.com and NHL.com
        </div>
      </div>
    </div>
  );
};
