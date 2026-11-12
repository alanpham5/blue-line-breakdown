import { ArrowLeftRight, ListOrdered } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { PlayerHeaderCompact } from "features/players/components/shareable/PlayerHeaderCompact";
import {
  DEFAULT_SORT,
  LineRow,
  LinesHeader,
  MODES,
  SORT_OPTIONS,
  lastName,
} from "features/players/components/lines/PlayerLinesList";
import {
  SplitCards,
  SAMPLE_NOTE,
} from "features/players/components/lines/WithWithoutPanel";
import { formatToi } from "features/players/components/lines/ShareBar";

export const SHAREABLE_LINE_COUNT = 10;

const BACKGROUND =
  "radial-gradient(circle at 16% 0%, rgba(50, 173, 230, 0.1) 0%, rgba(50, 173, 230, 0) 27%), radial-gradient(circle at 94% 20%, rgba(175, 82, 222, 0.09) 0%, rgba(175, 82, 222, 0) 25%), radial-gradient(circle at 50% 100%, rgba(52, 199, 89, 0.06) 0%, rgba(52, 199, 89, 0) 28%), linear-gradient(180deg, #020202 0%, #070708 45%, #0b0b0d 100%)";

const BrandRail = () => (
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
      <img src="/blb-dark.png" alt="Logo" style={{ width: 64, height: 64 }} />
      <span data-export-nudge={15}>Blue Line Breakdown</span>
    </div>
  </aside>
);

const SummaryCard = ({ icon: Icon, title, lines }) => (
  <div className="liquid-glass-strong flex h-full min-w-0 flex-col justify-center gap-3 rounded-[28px] p-6">
    <div className="flex items-center gap-3">
      <Icon className="h-8 w-8 shrink-0 text-[#7dcb48]" />
      <h3 className="shareable-icon-label whitespace-nowrap text-[2rem] font-bold leading-snug tracking-display text-white">
        {title}
      </h3>
    </div>
    {lines.map((line) => (
      <p
        key={line}
        className="text-xl font-semibold text-gray-300"
        data-export-nudge={6}
      >
        {line}
      </p>
    ))}
  </div>
);

const TeammateStrip = ({ player, teammate }) => (
  <div className="liquid-glass-strong flex items-center gap-4 rounded-[28px] px-6 py-4">
    <img
      src={playerUtils.getCorsWrappedUrl(
        playerUtils.getPlayerHeadshot(
          teammate.playerId,
          teammate.team,
          teammate.season
        )
      )}
      alt=""
      className="h-20 w-20 shrink-0 rounded-full object-cover"
      style={{
        background: playerUtils.getSurfaceGradient(
          playerUtils.getTeamColor(teammate.team, teammate.season),
          "dark"
        ),
      }}
    />
    <div className="min-w-0">
      <h3 className="shareable-icon-label text-[1.9rem] font-bold tracking-display text-white">
        With and Without {teammate.name}
      </h3>
      <p className="text-lg text-gray-400" data-export-nudge={6}>
        5-on-5 results together and apart. {SAMPLE_NOTE}
      </p>
    </div>
  </div>
);

export const PlayerLinesShareablePreview = ({
  player,
  isCareer,
  unitType,
  tab,
  units,
  minMinutes = 10,
  sort = DEFAULT_SORT,
  mode,
  teammate,
  wowy,
}) => {
  const unitLabel = unitType === "pairing" ? "Pairings" : "Lines";
  const sortOption = SORT_OPTIONS.find((option) => option.value === sort.key);
  const playerLastName = lastName(player.name);
  const optionLabel =
    mode === "measurement" && sortOption?.measured
      ? sortOption.measured
      : sortOption?.label;
  const sortLabel = sortOption
    ? `${sortOption.player ? `${playerLastName} ` : ""}${optionLabel}`
    : "Time on Ice";
  const modeLabel =
    MODES.find((option) => option.value === mode)?.label || "Percentiles";
  const shownUnits = units.slice(0, SHAREABLE_LINE_COUNT);
  const isWowy = tab === "wowy" && teammate && wowy;

  return (
    <div
      className="shareable-display-dark"
      style={{
        width: 1500,
        display: "flex",
        color: "white",
        overflow: "hidden",
        background: BACKGROUND,
      }}
    >
      <BrandRail />
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
          <PlayerHeaderCompact player={player} isCareer={isCareer} />
          {isWowy ? (
            <SummaryCard
              icon={ArrowLeftRight}
              title="With / Without"
              lines={[
                `${formatToi(wowy.together.minutes)} together`,
                "5-on-5 shares of each split",
              ]}
            />
          ) : (
            <SummaryCard
              icon={ListOrdered}
              title={`Top ${unitLabel}`}
              lines={[
                `Top ${shownUnits.length} of ${units.length} by ${sortLabel}${sort.dir === "asc" ? ", lowest first" : ""}`,
                `${modeLabel} · ${formatToi(minMinutes)}+ TOI at 5-on-5`,
              ]}
            />
          )}
        </div>

        {isWowy ? (
          <>
            <TeammateStrip player={player} teammate={teammate} />
            <SplitCards
              player={player}
              teammate={teammate}
              result={wowy}
              shareable
            />
          </>
        ) : (
          <div className="liquid-glass-strong overflow-hidden rounded-[28px]">
            <LinesHeader
              sort={sort}
              mode={mode}
              playerName={player.name}
              unitType={unitType}
              shareable
            />
            <ol className="divide-y divide-white/[0.06]">
              {shownUnits.map((unit, index) => (
                <LineRow
                  key={`${unit.season}-${unit.lineId}`}
                  unit={unit}
                  rank={index + 1}
                  mode={mode}
                  isCareer={isCareer}
                  shareable
                />
              ))}
            </ol>
          </div>
        )}

        <div className="text-center text-2xl font-bold text-white/80">
          Data from MoneyPuck.com and NHL.com
        </div>
      </div>
    </div>
  );
};
