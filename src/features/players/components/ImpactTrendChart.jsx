import { useEffect, useState } from "react";
import { playerUtils } from "utils/playerUtils";

const CHART_WIDTH = 320;
const CHART_HEIGHT = 104;
const PLOT_LEFT = 26;
const PLOT_RIGHT = CHART_WIDTH - 20;
const PLOT_TOP = 18;
const PLOT_BOTTOM = CHART_HEIGHT - 22;
const GRID_VALUES = [0, 50, 100];
const LINE_COLOR = "#7dcb48";
const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

export const TREND_PALETTES = {
  dark: {
    grid: "rgba(255, 255, 255, 0.1)",
    axisText: "#6b7280",
    valueText: "#ffffff",
    seasonText: "#9ca3af",
    latestSeasonText: "#e5e7eb",
    dotFill: "#10160c",
  },
  light: {
    grid: "#e2e8f0",
    axisText: "#9ca3af",
    valueText: "#111827",
    seasonText: "#6b7280",
    latestSeasonText: "#374151",
    dotFill: "#ffffff",
  },
};

export const formatShortSeason = (season, currentSeason = null) =>
  playerUtils.isCurrentSeason(season, currentSeason)
    ? "Current"
    : `${String(season).slice(2)}-${String(season + 1).slice(2)}`;

const hasValue = (point) => typeof point.impactPercentile === "number";

export const latestRatedPoint = (trend = []) =>
  [...trend].reverse().find(hasValue);

const describePoint = (point) =>
  [
    playerUtils.formatSeason(point.season),
    point.team,
    `${point.gamesPlayed} GP`,
    hasValue(point)
      ? `Impact ${point.impactPercentile.toFixed(1)}`
      : "No rating",
    point.eligible ? null : "below the ice-time minimum",
  ]
    .filter(Boolean)
    .join(" · ");

const xFor = (index, count) =>
  count <= 1
    ? (PLOT_LEFT + PLOT_RIGHT) / 2
    : PLOT_LEFT + ((PLOT_RIGHT - PLOT_LEFT) * index) / (count - 1);

const yFor = (value) =>
  PLOT_BOTTOM -
  ((PLOT_BOTTOM - PLOT_TOP) * Math.min(100, Math.max(0, value))) / 100;

const buildLineSegments = (points) =>
  points
    .reduce(
      (segments, point) => {
        if (!point.hasValue) return [...segments, []];
        const current = segments[segments.length - 1];
        return [...segments.slice(0, -1), [...current, point]];
      },
      [[]]
    )
    .filter((segment) => segment.length > 1)
    .map((segment) =>
      segment
        .map(
          (point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`
        )
        .join(" ")
    );

export const ImpactTrendChart = ({
  trend = [],
  palette = TREND_PALETTES.dark,
  currentSeason = null,
  onSeasonClick,
  animate = true,
  className = "",
}) => {
  const [isDrawn, setIsDrawn] = useState(!animate);
  useEffect(() => {
    setIsDrawn(true);
  }, []);

  const points = trend.map((point, index) => ({
    ...point,
    hasValue: hasValue(point),
    x: xFor(index, trend.length),
    y: hasValue(point) ? yFor(point.impactPercentile) : PLOT_BOTTOM,
  }));
  const latest = [...points].reverse().find((point) => point.hasValue);

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className={`block h-auto w-full ${className}`}
      fontFamily={FONT_FAMILY}
      role="img"
      aria-label={`Impact percentile by season: ${points
        .map(describePoint)
        .join("; ")}`}
    >
      {GRID_VALUES.map((value) => (
        <g key={value}>
          <line
            x1={PLOT_LEFT}
            x2={PLOT_RIGHT}
            y1={yFor(value)}
            y2={yFor(value)}
            stroke={palette.grid}
            strokeDasharray={value === 50 ? "3 4" : undefined}
          />
          <text
            x={PLOT_LEFT - 7}
            y={yFor(value) + 3}
            textAnchor="end"
            fontSize="8"
            fill={palette.axisText}
          >
            {value}
          </text>
        </g>
      ))}
      {buildLineSegments(points).map((path) => (
        <path
          key={path}
          d={path}
          fill="none"
          stroke={LINE_COLOR}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={isDrawn ? 0 : 1}
          style={
            animate
              ? { transition: "stroke-dashoffset 1200ms ease-out" }
              : undefined
          }
        />
      ))}
      {points.map((point) => {
        const isLatest = point === latest;
        const marks = (
          <g opacity={point.eligible ? 1 : 0.45}>
            <title>{describePoint(point)}</title>
            {point.hasValue ? (
              <>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isLatest ? 5 : 4}
                  fill={palette.dotFill}
                  stroke={LINE_COLOR}
                  strokeWidth="2.5"
                />
                <text
                  x={point.x}
                  y={point.y - 9}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill={palette.valueText}
                >
                  {Math.round(point.impactPercentile)}
                </text>
              </>
            ) : (
              <text
                x={point.x}
                y={PLOT_BOTTOM - 4}
                textAnchor="middle"
                fontSize="8"
                fill={palette.axisText}
              >
                —
              </text>
            )}
            <text
              x={point.x}
              y={CHART_HEIGHT - 6}
              textAnchor="middle"
              fontSize="9"
              fontWeight={isLatest ? "600" : "400"}
              fill={isLatest ? palette.latestSeasonText : palette.seasonText}
            >
              {formatShortSeason(point.season, currentSeason)}
            </text>
          </g>
        );
        if (!onSeasonClick) return <g key={point.season}>{marks}</g>;
        return (
          <g
            key={point.season}
            role="link"
            tabIndex={0}
            aria-label={`Open ${describePoint(point)}`}
            className="cursor-pointer outline-none [&:focus-visible_circle]:fill-[#7dcb48] [&:hover_circle]:fill-[#7dcb48]"
            onClick={() => onSeasonClick(point.season)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSeasonClick(point.season);
            }}
          >
            <rect
              x={point.x - 18}
              y={0}
              width="36"
              height={CHART_HEIGHT}
              fill="transparent"
            />
            {marks}
          </g>
        );
      })}
    </svg>
  );
};
