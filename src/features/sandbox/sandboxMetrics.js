import { playerUtils } from "utils/playerUtils";
import {
  formatHeight,
  metricGroupsForPosition,
} from "features/players/leaderboard/leaderboardConfig";

const EDGE_UNITS = {
  TOP_SPEED: "mph",
  SPEED_BURSTS: "count",
  SHOT_SPEED: "mph",
  DIST_SKATED: "mi",
  DIST_GAME: "mi",
  OZONE: "%",
};

const edgeValue = (key) => (player) => {
  const value = player.edgeValues?.[key];
  if (value == null) return null;
  return key === "OZONE" && value < 1 ? value * 100 : value;
};

const formatNumber = (digits) => (value) =>
  value == null ? "—" : Number(value).toFixed(digits);

const baseMetrics = [
  {
    key: "leaguePercentile",
    label: "League %",
    group: "Overall",
    value: (player) => player.leaguePercentile,
    format: formatNumber(1),
    domain: [0, 100],
  },
  {
    key: "height",
    label: "Height",
    group: "Overall",
    value: (player) => player.height,
    format: formatHeight,
    tickFormat: formatHeight,
  },
  {
    key: "weight",
    label: "Weight (lbs)",
    group: "Overall",
    value: (player) => player.weight,
    format: formatNumber(0),
  },
];

const groupLabels = {
  offensive: "Offense (percentile)",
  defensive: "Defense (percentile)",
  edge: "NHL EDGE",
};

export const SKATER_METRICS = [
  ...baseMetrics,
  ...metricGroupsForPosition("F").flatMap((group) =>
    group.keys.map((key) =>
      group.type === "edge"
        ? {
            key,
            label: `${playerUtils.formatStatName(key)} (${EDGE_UNITS[key]})`,
            group: groupLabels.edge,
            value: edgeValue(key),
            format: formatNumber(
              key === "DIST_GAME" ? 2 : key === "SPEED_BURSTS" ? 0 : 1
            ),
          }
        : {
            key,
            label: playerUtils.formatStatName(key),
            group: groupLabels[group.type],
            value: (player) => player.metrics?.[key],
            format: formatNumber(1),
            domain: [0, 100],
          }
    )
  ),
];

export const metricByKey = (key) =>
  SKATER_METRICS.find((metric) => metric.key === key) || SKATER_METRICS[0];

export const DEFAULT_X_METRIC = "TOP_SPEED";
export const DEFAULT_Y_METRIC = "leaguePercentile";
