import { Users, Target, Shield } from "lucide-react";
import { playerUtils } from "../../utils/playerUtils";
import { PlayerHeaderCompact } from "./PlayerHeaderCompact";
import { WarPercentileCardCompact } from "./WarPercentileCardCompact";
import { StatsCardCompact } from "./StatsCardCompact";

export const ShareableDisplay = ({ playerData }) => {
  if (!playerData) {
    return (
      <div
        style={{
          width: 1200,
          height: 675,
          backgroundColor: "#0f172a",
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
    const displayPlayers = (similarPlayers || []).slice(0, 8);
    return (
      <div
        style={{
          width: 1200,
          height: 675,
          backgroundColor: "#0f172a",
          display: "flex",
          color: "white",
          overflow: "hidden",
        }}
      >
        {/* SIDEBAR */}
        <div
          style={{
            width: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 10,
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <img
              src="/blb-dark.png"
              alt="Logo"
              style={{ width: 80, height: 80, transform: "rotate(90deg)" }}
            />
            Blue Line Breakdown
          </div>
        </div>
        {/* MAIN */}
        <div
          style={{
            flex: 1,
            padding: "18px 18px 36px",
            display: "grid",
            gridTemplateRows: "auto auto 1fr",
            gap: 12,
          }}
        >
          {/* HEADER */}
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <PlayerHeaderCompact player={player} biometrics={biometrics} />
            <WarPercentileCardCompact warPercentile={player.warPercentile} />
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* SIMILAR PLAYERS */}
          <div className="liquid-glass-strong rounded-2xl p-3 border-purple-400/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 shrink-0 backdrop-blur-sm">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold">Most Similar Players</h3>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {displayPlayers.map((p, i) => (
                <div key={i} className="text-center">
                  <img
                    src={playerUtils.getPlayerHeadshot(
                      p.playerId,
                      p.team,
                      p.season
                    )}
                    className="w-16 h-16 rounded-full mx-auto mb-0.5"
                    onError={(e) => {
                      e.target.src = playerUtils.getDefaultHeadshot();
                    }}
                  />
                  <div className="text-[12px] font-semibold truncate">
                    {p.name}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-300">
                    {playerUtils.formatSeason(p.season)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
};
