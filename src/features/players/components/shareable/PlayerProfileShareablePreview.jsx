import { Gauge, Shield, Target, Users } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { PlayerHeaderCompact } from "features/players/components/shareable/PlayerHeaderCompact";
import { WarPercentileCardCompact } from "features/players/components/shareable/WarPercentileCardCompact";
import { PlayerTendenciesCard } from "features/players/components/PlayerTendenciesCard";
import { PlayerQualityCard } from "features/players/components/PlayerQualityCard";

const edgeOrder = [
  ["TOP_SPEED", "Top Speed", "mph"],
  ["SPEED_BURSTS", "Speed Bursts", "20+ mph"],
  ["SHOT_SPEED", "Shot Speed", "mph"],
  ["DIST_SKATED", "Distance", "mi"],
  ["DIST_GAME", "Max / Game", "mi"],
  ["OZONE", "O-Zone Time", "%"],
];

const formatEdgeValue = (key, value) => {
  if (key === "SPEED_BURSTS") return Number(value).toLocaleString();
  const numericValue = Number(value);
  if (key === "OZONE") {
    return (numericValue < 1 ? numericValue * 100 : numericValue).toFixed(1);
  }
  return numericValue.toFixed(1);
};

export const PlayerProfileShareablePreview = ({
  player,
  biometrics,
  tendencies,
  offensiveQuality,
  defensiveQuality,
  edgeValues,
  edgePercentiles,
  similarPlayers,
}) => (
  <div
    className="shareable-display-dark"
    style={{
      width: 1500,
      minHeight: 1000,
      display: "flex",
      color: "white",
      overflow: "hidden",
      background:
        "radial-gradient(circle at 16% 0%, rgba(50, 173, 230, 0.1) 0%, rgba(50, 173, 230, 0) 27%), radial-gradient(circle at 94% 20%, rgba(175, 82, 222, 0.09) 0%, rgba(175, 82, 222, 0) 25%), radial-gradient(circle at 50% 100%, rgba(52, 199, 89, 0.06) 0%, rgba(52, 199, 89, 0) 28%), linear-gradient(180deg, #020202 0%, #070708 45%, #0b0b0d 100%)",
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
        <img src="/blb-dark.png" alt="Logo" style={{ width: 64, height: 64 }} />
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
      <div className="grid grid-cols-[2.15fr_1fr] gap-3.5">
        <PlayerHeaderCompact player={player} biometrics={biometrics} />
        <WarPercentileCardCompact
          role={player.role}
          warPercentile={player.warPercentile}
        />
      </div>

      <div className="grid min-h-[360px] grid-cols-[1.02fr_1.28fr] gap-3.5">
        <PlayerTendenciesCard
          tendencies={tendencies}
          showInfo={false}
          forceDark
          shareable
        />
        <div className="grid grid-cols-2 gap-3.5">
          <PlayerQualityCard
            title={
              player.position === "G"
                ? "Goaltending Quality"
                : "Offensive Quality"
            }
            icon={Target}
            stats={offensiveQuality}
            type={player.position === "G" ? "shotStopping" : "offensive"}
            showInfo={false}
            forceDark
            shareable
          />
          <PlayerQualityCard
            title={
              player.position === "G" ? "Shots Faced" : "Defensive Quality"
            }
            icon={Shield}
            stats={defensiveQuality}
            type={player.position === "G" ? "workload" : "defensive"}
            showInfo={false}
            forceDark
            shareable
          />
        </div>
      </div>

      {edgeValues && edgePercentiles && (
        <div className="liquid-glass-strong rounded-[28px] px-6 py-4">
          <div className="mb-2.5 flex items-center gap-2.5">
            <Gauge className="h-7 w-7 text-emerald-300" />
            <h3 className="shareable-icon-label text-3xl font-bold text-white">
              NHL EDGE
            </h3>
          </div>
          <div className="grid grid-cols-6 divide-x divide-white/10 text-center">
            {edgeOrder
              .filter(
                ([key]) =>
                  edgeValues[key] != null && edgePercentiles[key] != null
              )
              .map(([key, label, unit]) => (
                <div key={key} className="px-2">
                  <div className="text-[15px] font-semibold text-gray-400">
                    {label}
                  </div>
                  <div className="mt-0.5 text-[28px] font-bold tabular-nums text-emerald-300">
                    {formatEdgeValue(key, edgeValues[key])}
                  </div>
                  <div className="text-[13px] text-gray-500">
                    {unit} · {Math.round(edgePercentiles[key])} Percentile
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="liquid-glass-strong rounded-[28px] px-6 py-4">
        <div className="mb-2.5 flex items-center gap-2.5">
          <Users className="h-7 w-7 text-amber-300" />
          <h3 className="shareable-icon-label text-3xl font-bold text-white">
            Most Similar Players
          </h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {similarPlayers.slice(0, 5).map((similarPlayer) => (
            <div
              key={`${similarPlayer.playerId}-${similarPlayer.season}`}
              className="flex flex-col items-center text-center"
            >
              <div className="relative">
                <div className="h-[76px] w-[76px] overflow-hidden rounded-full border border-white/[0.06] bg-zinc-950/55">
                  <img
                    src={playerUtils.getCorsWrappedUrl(
                      playerUtils.getPlayerHeadshot(
                        similarPlayer.playerId,
                        similarPlayer.team,
                        similarPlayer.season
                      )
                    )}
                    alt={similarPlayer.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe57e] to-[#ffd037] text-sm font-bold leading-none text-[#4f3d00]">
                  <span className="shareable-similarity-score block leading-none">
                    {Math.round(similarPlayer.similarity)}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-[18px] font-bold leading-tight text-white">
                {similarPlayer.name}
              </div>
              <div className="mt-0.5 text-sm font-medium text-gray-400">
                {playerUtils.formatSeason(similarPlayer.season)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xl font-bold text-white/80">
        Data from MoneyPuck.com and NHL.com
      </div>
    </div>
  </div>
);
