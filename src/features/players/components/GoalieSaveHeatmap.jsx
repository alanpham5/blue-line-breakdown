import { useId } from "react";
import { useTheme } from "providers/ThemeContext";
import { getPercentileColor } from "utils/percentileColor";

const RINK_WIDTH = 200;
const RINK_HEIGHT = 158;
const GOAL_LINE_Y = 24;
const BLUE_LINE_Y = 152;
const HEAT_BLUR = 8;
const HEAT_BLEED = 4;

const ZONES = [
  { area: "L Corner", shape: "rect", x: 4, y: 4, width: 52, height: 42 },
  {
    area: "Behind the Net",
    shape: "rect",
    x: 58,
    y: 4,
    width: 84,
    height: 18,
    labelX: 74,
  },
  { area: "R Corner", shape: "rect", x: 144, y: 4, width: 52, height: 42 },
  { area: "L Net Side", shape: "rect", x: 58, y: 24, width: 24, height: 34 },
  { area: "Crease", shape: "crease", cx: 100, cy: GOAL_LINE_Y, r: 16 },
  { area: "R Net Side", shape: "rect", x: 118, y: 24, width: 24, height: 34 },
  { area: "Low Slot", shape: "rect", x: 82, y: 42, width: 36, height: 40 },
  { area: "Outside L", shape: "rect", x: 4, y: 48, width: 22, height: 80 },
  { area: "L Circle", shape: "circle", cx: 54, cy: 88, r: 26 },
  { area: "High Slot", shape: "rect", x: 82, y: 84, width: 36, height: 44 },
  { area: "R Circle", shape: "circle", cx: 146, cy: 88, r: 26 },
  { area: "Outside R", shape: "rect", x: 174, y: 48, width: 22, height: 80 },
  { area: "L Point", shape: "rect", x: 4, y: 130, width: 66, height: 20 },
  { area: "Center Point", shape: "rect", x: 72, y: 130, width: 56, height: 20 },
  { area: "R Point", shape: "rect", x: 130, y: 130, width: 66, height: 20 },
];

const RANGE_TILES = [
  { code: "high", label: "Short" },
  { code: "mid", label: "Mid" },
  { code: "long", label: "Long" },
];

const PALETTES = {
  dark: {
    ice: "#12161d",
    boards: "rgba(255, 255, 255, 0.22)",
    noShots: "#1f2530",
    markings: "rgba(255, 255, 255, 0.55)",
    label: "#0b0d12",
    labelHalo: "rgba(255, 255, 255, 0.55)",
  },
  light: {
    ice: "#f1f5f9",
    boards: "#cbd5e1",
    noShots: "#e2e8f0",
    markings: "rgba(15, 23, 42, 0.45)",
    label: "#0b0d12",
    labelHalo: "rgba(255, 255, 255, 0.7)",
  },
};

const formatSavePct = (value) =>
  value == null ? "—" : value.toFixed(3).replace(/^0/, "");

const ordinal = (value) => {
  const rounded = Math.round(value);
  const mod100 = rounded % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${rounded}th`;
  return `${rounded}${{ 1: "st", 2: "nd", 3: "rd" }[rounded % 10] || "th"}`;
};

const hasShots = (stats) => Boolean(stats?.shotsAgainst);

const describeZone = (zone, stats) => {
  if (!hasShots(stats)) return `${zone.area}: no shots`;
  return [
    zone.area,
    `${stats.shotsAgainst} shots`,
    `${formatSavePct(stats.savePct)} SV%`,
    stats.percentile == null ? null : `${ordinal(stats.percentile)} percentile`,
  ]
    .filter(Boolean)
    .join(" · ");
};

const labelPosition = (zone) => {
  if (zone.shape === "rect") {
    return {
      x: zone.labelX ?? zone.x + zone.width / 2,
      y: zone.y + zone.height / 2 + 3,
    };
  }
  if (zone.shape === "crease")
    return { x: zone.cx, y: zone.cy + zone.r / 2 + 3 };
  return { x: zone.cx, y: zone.cy + 3 };
};

const ZoneShape = ({ zone, grow = 0, ...paint }) => {
  if (zone.shape === "circle") {
    return <circle cx={zone.cx} cy={zone.cy} r={zone.r + grow} {...paint} />;
  }
  if (zone.shape === "crease") {
    const r = zone.r + grow;
    return (
      <path
        d={`M ${zone.cx - r} ${zone.cy} A ${r} ${r} 0 0 0 ${zone.cx + r} ${zone.cy} Z`}
        {...paint}
      />
    );
  }
  return (
    <rect
      x={zone.x - grow}
      y={zone.y - grow}
      width={zone.width + grow * 2}
      height={zone.height + grow * 2}
      rx="6"
      {...paint}
    />
  );
};

const RinkMarkings = ({ color }) => (
  <g fill="none" stroke={color}>
    <line
      x1="4"
      x2={RINK_WIDTH - 4}
      y1={GOAL_LINE_Y}
      y2={GOAL_LINE_Y}
      strokeWidth="0.8"
    />
    <path d="M 84 24 A 16 16 0 0 0 116 24" strokeWidth="0.8" />
    <rect
      x="93"
      y={GOAL_LINE_Y - 6}
      width="14"
      height="6"
      rx="1.5"
      strokeWidth="1.2"
    />
    <circle cx="54" cy="88" r="26" strokeWidth="0.8" />
    <circle cx="146" cy="88" r="26" strokeWidth="0.8" />
    <line
      x1="4"
      x2={RINK_WIDTH - 4}
      y1={BLUE_LINE_Y + 1.5}
      y2={BLUE_LINE_Y + 1.5}
      stroke="#3b82f6"
      strokeWidth="3"
    />
  </g>
);

const RinkHeatmap = ({ areasByName, palette }) => {
  const id = useId().replace(/:/g, "");
  const clipId = `rink-clip-${id}`;
  const blurId = `rink-heat-${id}`;
  return (
    <svg
      viewBox={`0 0 ${RINK_WIDTH} ${RINK_HEIGHT}`}
      className="block h-auto w-full"
      role="img"
      aria-label={ZONES.map((zone) =>
        describeZone(zone, areasByName[zone.area])
      ).join(". ")}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x="1"
            y="1"
            width={RINK_WIDTH - 2}
            height={RINK_HEIGHT - 2}
            rx="18"
          />
        </clipPath>
        <filter id={blurId} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation={HEAT_BLUR} />
        </filter>
      </defs>
      <rect
        x="1"
        y="1"
        width={RINK_WIDTH - 2}
        height={RINK_HEIGHT - 2}
        rx="18"
        fill={palette.ice}
      />
      <g clipPath={`url(#${clipId})`}>
        <g filter={`url(#${blurId})`}>
          {ZONES.map((zone) => {
            const stats = areasByName[zone.area];
            return (
              <ZoneShape
                key={zone.area}
                zone={zone}
                grow={HEAT_BLEED}
                fill={
                  hasShots(stats)
                    ? getPercentileColor(stats.percentile ?? 50)
                    : palette.noShots
                }
              />
            );
          })}
        </g>
      </g>
      <rect
        x="1"
        y="1"
        width={RINK_WIDTH - 2}
        height={RINK_HEIGHT - 2}
        rx="18"
        fill="none"
        stroke={palette.boards}
      />
      <RinkMarkings color={palette.markings} />
      {ZONES.map((zone) => {
        const stats = areasByName[zone.area];
        const label = labelPosition(zone);
        return (
          <g key={zone.area}>
            <title>{describeZone(zone, stats)}</title>
            <ZoneShape zone={zone} fill="transparent" />
            {hasShots(stats) && (
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={palette.label}
                stroke={palette.labelHalo}
                strokeWidth="2"
                paintOrder="stroke"
                pointerEvents="none"
              >
                {formatSavePct(stats.savePct)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const RangeStat = ({ label, total }) => (
  <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] px-1 py-1.5 text-center light:border-slate-200 light:bg-white/55">
    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.06em] text-gray-400 light:text-gray-500">
      {label}
    </p>
    <p
      className="text-sm font-bold leading-tight tabular-nums"
      style={{ color: getPercentileColor(total?.percentile) }}
    >
      {formatSavePct(total?.savePct)}
    </p>
    <p className="text-[0.6rem] leading-tight text-gray-500">
      {total?.percentile != null ? ordinal(total.percentile) : "—"}
    </p>
  </div>
);

export const GoalieSaveHeatmap = ({ shotMap }) => {
  const { actualTheme } = useTheme();
  const palette = PALETTES[actualTheme] || PALETTES.dark;
  const areasByName = Object.fromEntries(
    shotMap.areas.map((area) => [area.area, area])
  );
  const totalsByCode = Object.fromEntries(
    shotMap.totals.map((total) => [total.locationCode, total])
  );
  return (
    <div className="flex flex-col">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <h4 className="text-xs font-bold text-white light:text-gray-900">
          Save % by location
        </h4>
        <span className="text-[0.62rem] text-gray-400 light:text-gray-500">
          NHL EDGE · color = league pctl
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-2">
        <div className="w-full">
          <RinkHeatmap areasByName={areasByName} palette={palette} />
          <span
            className="mt-1.5 block h-1.5 rounded-full"
            title="Low to high league percentile"
            style={{
              background: `linear-gradient(90deg, ${getPercentileColor(0)}, ${getPercentileColor(50)}, ${getPercentileColor(100)})`,
            }}
          />
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          {RANGE_TILES.map((tile) => (
            <RangeStat
              key={tile.code}
              label={tile.label}
              total={totalsByCode[tile.code]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
