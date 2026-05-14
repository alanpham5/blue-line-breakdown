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
          height: 960,
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
              fontSize: 34,
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
              style={{ width: 70, height: 70, transform: "rotate(90deg)" }}
            />
            Blue Line Breakdown
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
            <WarPercentileCardCompact warPercentile={player.warPercentile} />
          </div>

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

          <div className="liquid-glass-strong rounded-[28px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-6 w-6 shrink-0 text-amber-300" />
              <h3 className="text-2xl font-bold text-white">
                Most Similar Players
              </h3>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-2 place-items-center">
              {displayPlayers.map((p, i) => (
                <div key={i} className="text-center">
                  <img
                    src={playerUtils.getPlayerHeadshot(
                      p.playerId,
                      p.team,
                      p.season
                    )}
                    className="w-20 h-20 rounded-full mx-auto mb-1"
                    onError={(e) => {
                      e.target.src = playerUtils.getDefaultHeadshot();
                    }}
                  />
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
