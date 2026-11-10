import { Gauge, Shield, Target, Users } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { getOrdinal } from "utils/ordinal";
import { getPercentileColor } from "utils/percentileColor";
import { PlayerHeaderCompact } from "features/players/components/shareable/PlayerHeaderCompact";
import { ImpactTrendCardCompact } from "features/players/components/shareable/ImpactTrendCardCompact";
import { WarPercentileCardCompact } from "features/players/components/shareable/WarPercentileCardCompact";
import { PlayerTendenciesCard } from "features/players/components/PlayerTendenciesCard";
import { PlayerDifficultyCard } from "features/players/components/PlayerDifficultyCard";
import { PlayerQualityCard } from "features/players/components/PlayerQualityCard";
import {
  formatCountingStat,
  getCountingStatsLabels,
  getCountingStatsOrder,
  isGoalieStats,
} from "features/players/components/CountingStats";

const edgeOrder = [
  ["TOP_SPEED", "Top Speed", "mph"],
  ["SPEED_BURSTS", "Speed Bursts", "20+ mph"],
  ["SHOT_SPEED", "Shot Speed", "mph"],
  ["DIST_SKATED", "Distance", "mi"],
  ["DIST_GAME", "Max / Game", "mi"],
  ["OZONE", "O-Zone Time", "%"],
];

const countingStatColors = {
  gamesPlayed: "#ffffff",
  goals: "#fb7185",
  assists: "#7dcb48",
  points: "#7dd3fc",
  penaltyMinutes: "#fcd34d",
  shotsAgainst: "#7dd3fc",
  saves: "#7dcb48",
  gaa: "#fb7185",
  savePct: "#fcd34d",
};

const CountingStatsRow = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) return null;
  const isGoalie = isGoalieStats(stats);
  const labels = getCountingStatsLabels(isGoalie);
  return (
    <div className="liquid-glass-strong rounded-[28px] px-6 py-4">
      <div className="grid grid-cols-5 divide-x divide-white/10 text-center">
        {getCountingStatsOrder(isGoalie).map((statKey) => (
          <div key={statKey} className="px-2">
            <div className="text-[18px] font-semibold text-gray-400">
              {labels[statKey]}
            </div>
            <div
              className="mt-0.5 text-[38px] font-bold tabular-nums"
              style={{ color: countingStatColors[statKey] }}
            >
              {formatCountingStat(stats, statKey)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatEdgeValue = (key, value) => {
  if (key === "SPEED_BURSTS") return Number(value).toLocaleString();
  const numericValue = Number(value);
  if (key === "OZONE") {
    return (numericValue < 1 ? numericValue * 100 : numericValue).toFixed(1);
  }
  return numericValue.toFixed(1);
};

const SimilarPlayersColumn = ({ players, isCareer }) => (
  <div
    className="liquid-glass-strong flex flex-col rounded-[28px] p-5"
    style={{ width: 210, flexShrink: 0 }}
  >
    <div className="mb-3 flex items-center justify-center gap-2">
      <Users className="h-8 w-8 shrink-0 text-amber-300" />
      <h3 className="shareable-icon-label whitespace-nowrap text-[2.25rem] font-bold tracking-display text-white">
        Similar
      </h3>
    </div>
    <div className="flex flex-1 flex-col justify-around gap-3">
      {players.map((similarPlayer) => (
        <div
          key={`${similarPlayer.playerId}-${similarPlayer.season}`}
          className="flex flex-col items-center text-center"
        >
          <div className="relative">
            <div className="h-[92px] w-[92px] overflow-hidden rounded-full border border-white/[0.06] bg-zinc-950/55">
              <img
                src={playerUtils.getCorsWrappedUrl(
                  playerUtils.getPlayerHeadshot(
                    similarPlayer.playerId,
                    similarPlayer.team,
                    isCareer ? null : similarPlayer.season
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
          <div className="mt-2 text-[21px] font-bold leading-tight text-white">
            {similarPlayer.name}
          </div>
          <div className="mt-0.5 text-[17px] font-medium text-gray-400">
            {isCareer
              ? playerUtils.formatCareerSpan(
                  similarPlayer.firstSeason,
                  similarPlayer.lastSeason
                )
              : playerUtils.formatSeason(similarPlayer.season)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SimilarPlayersRow = ({ players, isCareer }) => (
  <div className="liquid-glass-strong rounded-[28px] px-6 py-4">
    <div className="mb-2.5 flex items-center gap-2.5">
      <Users className="h-7 w-7 text-amber-300" />
      <h3 className="shareable-icon-label text-3xl font-bold text-white">
        {isCareer ? "Most Similar Careers" : "Most Similar Players"}
      </h3>
    </div>
    <div className="grid grid-cols-5 gap-3">
      {players.map((similarPlayer) => (
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
                    isCareer ? null : similarPlayer.season
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
            {isCareer
              ? playerUtils.formatCareerSpan(
                  similarPlayer.firstSeason,
                  similarPlayer.lastSeason
                )
              : playerUtils.formatSeason(similarPlayer.season)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PlayerProfileShareablePreview = ({
  player,
  biometrics,
  tendencies,
  offensiveQuality,
  defensiveQuality,
  difficulty = null,
  stats,
  edgeValues,
  edgePercentiles,
  similarPlayers,
  shotMap = null,
  isCareer = false,
  impactTrend = [],
  combined = null,
  currentSeason = null,
}) => {
  const isGoalie = player.position === "G";
  return (
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
            fontSize: 34,
            fontWeight: 800,
            color: "#f3f4f6",
          }}
        >
          <img
            src="/blb-dark.png"
            alt="Logo"
            style={{ width: 64, height: 64 }}
          />
          <span data-export-nudge={15}>Blue Line Breakdown</span>
        </div>
      </aside>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: "22px 24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div className="grid grid-cols-[2.15fr_1fr] gap-3.5">
          <PlayerHeaderCompact
            player={player}
            biometrics={biometrics}
            isCareer={isCareer}
            combined={combined}
            currentSeason={currentSeason}
          />
          {isCareer ? (
            <ImpactTrendCardCompact
              trend={impactTrend}
              role={player.role}
              currentSeason={currentSeason}
            />
          ) : (
            <WarPercentileCardCompact
              role={player.role}
              warPercentile={player.warPercentile}
            />
          )}
        </div>

        <div style={{ flex: 1, display: "flex", gap: 14 }}>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {isGoalie && <CountingStatsRow stats={stats} />}

            <div
              className={`grid gap-3.5 ${isGoalie ? "min-h-[360px] grid-cols-3" : "grid-cols-2"}`}
            >
              <div className={isGoalie || difficulty ? "" : "col-span-2"}>
                <PlayerTendenciesCard
                  tendencies={tendencies}
                  showInfo={false}
                  forceDark
                  shareable
                  bar={isGoalie}
                  shotMap={shotMap}
                />
              </div>
              {!isGoalie && difficulty && (
                <PlayerDifficultyCard
                  difficulty={difficulty}
                  position={player.position}
                  isCareer={isCareer}
                  showInfo={false}
                  forceDark
                  shareable
                />
              )}
              <PlayerQualityCard
                title={isGoalie ? "Goaltending Quality" : "Offensive Quality"}
                icon={Target}
                stats={offensiveQuality}
                type={isGoalie ? "shotStopping" : "offensive"}
                compact={isGoalie}
                showInfo={false}
                forceDark
                shareable
              />
              <PlayerQualityCard
                title={isGoalie ? "Shots Faced" : "Defensive Quality"}
                icon={Shield}
                stats={defensiveQuality}
                type={isGoalie ? "workload" : "defensive"}
                compact={isGoalie}
                showInfo={false}
                forceDark
                shareable
              />
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
                        <div className="text-[18px] font-semibold text-gray-400">
                          {label}
                        </div>
                        <div
                          className="mt-0.5 text-[34px] font-bold tabular-nums"
                          style={{
                            color: getPercentileColor(edgePercentiles[key]),
                          }}
                        >
                          {formatEdgeValue(key, edgeValues[key])}
                        </div>
                        <div className="whitespace-nowrap text-lg text-gray-400">
                          {unit} · {getOrdinal(edgePercentiles[key])} pctl
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {isGoalie && (
              <SimilarPlayersRow
                players={similarPlayers.slice(0, 5)}
                isCareer={isCareer}
              />
            )}
          </div>

          {!isGoalie && similarPlayers.length > 0 && (
            <SimilarPlayersColumn
              players={similarPlayers.slice(0, 5)}
              isCareer={isCareer}
            />
          )}
        </div>

        <div className="text-center text-2xl font-bold text-white/80">
          Data from MoneyPuck.com and NHL.com
        </div>
      </div>
    </div>
  );
};
