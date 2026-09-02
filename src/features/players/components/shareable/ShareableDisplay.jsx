import { Users, Target, Shield, Gauge } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { getPercentileColor } from "utils/percentileColor";
import { PlayerHeaderCompact } from "features/players/components/shareable/PlayerHeaderCompact";
import { WarPercentileCardCompact } from "features/players/components/shareable/WarPercentileCardCompact";
import { StatsCardCompact } from "features/players/components/shareable/StatsCardCompact";

const metricsOrder = [
  "TOP_SPEED",
  "SPEED_BURSTS",
  "SHOT_SPEED",
  "DIST_SKATED",
  "DIST_GAME",
  "OZONE",
];

const formatValue = (key, val) => {
  if (val === undefined || val === null) return "-";
  const num = Number(val);
  if (isNaN(num)) return val;

  switch (key) {
    case "TOP_SPEED":
    case "SHOT_SPEED":
    case "DIST_SKATED":
    case "DIST_GAME":
      return num.toFixed(1);
    case "SPEED_BURSTS":
      return num.toLocaleString();
    case "OZONE":
      const pct = num < 1.0 ? num * 100 : num;
      return pct.toFixed(1);
    default:
      return num;
  }
};

const getMetricLabel = (key, isShort) => {
  const baseName = isShort
    ? playerUtils.formatStatAbbr(key)
    : playerUtils.formatStatName(key);
  switch (key) {
    case "TOP_SPEED":
    case "SHOT_SPEED":
      return `${baseName} (mph)`;
    case "DIST_SKATED":
    case "DIST_GAME":
      return `${baseName} (mi)`;
    case "OZONE":
      return `${baseName} (%)`;
    default:
      return baseName;
  }
};

export const ShareableDisplay = ({ playerData }) => {
  if (!playerData) {
    return (
      <div
        style={{
          width: 1200,
          height: 900,
          background:
            "linear-gradient(180deg, #020202 0%, #070708 42%, #0b0b0d 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: 28,
        }}
      >
        {" "}
        No player data available{" "}
      </div>
    );
  } else {
    const { player, biometrics, percentiles, similarPlayers } = playerData;
    const displayPlayers = (similarPlayers || []).slice(0, 6);
    return (
      <div
        className="shareable-display-dark"
        style={{
          width: 1200,
          minHeight: 960,
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
              fontSize: 30,
              fontWeight: 800,
              color: "#f3f4f6",
            }}
          >
            <img
              src="/blb-dark.png"
              alt="Logo"
              style={{
                width: 60,
                height: 60,
              }}
            />
            <span>Blue Line Breakdown</span>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "20px 20px 32px",
            display: "grid",
            gridTemplateRows: "auto auto 1fr",
            gap: 14,
          }}
        >
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <PlayerHeaderCompact player={player} biometrics={biometrics} />
            <WarPercentileCardCompact
              role={player.role}
              warPercentile={player.warPercentile}
            />
          </div>

          <div className="space-y-3">
            {player.position !== "G" &&
              playerData.edgeValues &&
              percentiles.edge && (
                <div className="liquid-glass-strong rounded-[28px] p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="h-6 w-6 shrink-0 text-emerald-300" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">
                      NHL EDGE
                    </h3>
                  </div>
                  <div className="grid grid-cols-6 divide-x divide-white/10 text-center">
                    {metricsOrder.map((statKey) => {
                      const val = playerData.edgeValues[statKey];
                      const percentile = percentiles.edge[statKey];
                      if (
                        val === undefined ||
                        val === null ||
                        percentile === undefined ||
                        percentile === null
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={statKey}
                          className="flex flex-col items-center justify-end px-2"
                        >
                          <div className="text-[13px] text-gray-400 font-semibold leading-tight whitespace-nowrap">
                            {getMetricLabel(statKey, true)}
                          </div>
                          <div
                            className="text-[26px] font-bold leading-tight tabular-nums whitespace-nowrap mt-1"
                            style={{ color: getPercentileColor(percentile) }}
                          >
                            {formatValue(statKey, val)}
                          </div>
                          <div className="text-[12px] text-gray-400 font-semibold mt-0.5">
                            {percentile.toFixed(1)} Percentile
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            <div className="grid grid-cols-2 gap-3">
              {player.position === "G" ? (
                <>
                  <StatsCardCompact
                    title="Shot Stopping"
                    icon={Target}
                    stats={percentiles.shotStopping}
                    type="shotStopping"
                  />
                  <StatsCardCompact
                    title="Workload"
                    icon={Shield}
                    stats={percentiles.workload}
                    type="workload"
                  />
                </>
              ) : (
                <>
                  <StatsCardCompact
                    title="Offensive Metrics"
                    icon={Target}
                    stats={percentiles.offensive}
                    type="offensive"
                  />
                  <StatsCardCompact
                    title="Defensive Metrics"
                    icon={Shield}
                    stats={percentiles.defensive}
                    type="defensive"
                  />
                </>
              )}
            </div>
          </div>

          <div className="liquid-glass-strong rounded-[28px] p-4">
            <div className="shareable-card-title-row flex items-center gap-2 mb-2">
              <Users className="shareable-card-title-icon h-6 w-6 shrink-0 text-amber-300" />
              <h3 className="shareable-card-title-text text-2xl font-bold text-white">
                Most Similar Players
              </h3>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-2 place-items-center">
              {displayPlayers.map((p, i) => (
                <div key={i} className="text-center">
                  <div className="relative mb-2 inline-block">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full bg-zinc-950/55 backdrop-blur-sm shadow-lg border border-white/5 flex items-center justify-center">
                      <img
                        src={playerUtils.getCorsWrappedUrl(
                          playerUtils.getPlayerHeadshot(
                            p.playerId,
                            p.team,
                            p.season
                          )
                        )}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = playerUtils.getCorsWrappedUrl(
                            playerUtils.getDefaultHeadshot()
                          );
                        }}
                      />
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe57e] to-[#ffd037] text-[10px] font-bold text-[#4f3d00] shadow-[0_4px_10px_rgba(255,208,55,0.18)] sm:-bottom-1 sm:-right-1 sm:h-8 sm:w-8 sm:text-xs"
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
                        }}
                      >
                        {Math.round(p.similarity)}
                      </span>
                    </div>
                  </div>
                  <div className="text-[17px] max-w-[145px] font-bold truncate text-white">
                    {p.name}
                  </div>
                  <div className="text-[14px] font-semibold text-gray-300">
                    {playerUtils.formatSeason(p.season)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xl pt-2 font-bold justify-self-center text-white/90">
            Data from MoneyPuck.com and NHL.com
          </div>
        </div>
      </div>
    );
  }
};
