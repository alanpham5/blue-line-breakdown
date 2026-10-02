export const POSITIONS = [
  { value: "F", label: "Forwards", singular: "Forward" },
  { value: "D", label: "Defensemen", singular: "Defenseman" },
  { value: "G", label: "Goalies", singular: "Goalie" },
];

const SKATER_METRIC_GROUPS = [
  {
    type: "offensive",
    keys: [
      "SHOT_TAL",
      "PLAY_DRV",
      "SHOT_FREQ",
      "PASS_FREQ",
      "PP_USAGE",
      "ONICE_IMP",
    ],
  },
  {
    type: "defensive",
    keys: ["POS_CTRL", "BLK", "HIT", "TAKE", "D_EXIT", "CH_SUP"],
  },
  {
    type: "edge",
    keys: [
      "TOP_SPEED",
      "SPEED_BURSTS",
      "SHOT_SPEED",
      "DIST_SKATED",
      "DIST_GAME",
      "OZONE",
    ],
  },
];

const GOALIE_METRIC_GROUPS = [
  {
    type: "shotStopping",
    keys: ["SV_PCT", "GSAX", "HD_SV", "MD_SV", "LD_SV", "GA_60"],
  },
  {
    type: "workload",
    keys: ["WORKLOAD", "xGA_60", "REB_CTRL", "FREEZE", "HD_WORK", "GAMES"],
  },
  {
    type: "edge",
    keys: ["EDGE_HIGH_SV", "EDGE_MID_SV", "EDGE_LONG_SV"],
  },
];

export const metricGroupsForPosition = (position) =>
  position === "G" ? GOALIE_METRIC_GROUPS : SKATER_METRIC_GROUPS;

export const metricKeysForPosition = (position) =>
  metricGroupsForPosition(position).flatMap((group) => group.keys);

export const formatHeight = (inches) => {
  if (inches == null) return "—";
  const feet = Math.floor(inches / 12);
  const rem = Math.round(inches % 12);
  return `${feet}'${rem}"`;
};

export const formatPercentile = (value) =>
  value == null ? "—" : value.toFixed(1);

const formatEdgeValue = (key, value) => {
  if (key === "SPEED_BURSTS") return Math.round(value).toLocaleString();
  if (key.endsWith("_SV")) return value.toFixed(3).replace(/^0/, "");
  if (key === "OZONE")
    return `${(value < 1 ? value * 100 : value).toFixed(1)}%`;
  if (key === "DIST_GAME") return value.toFixed(2);
  return value.toFixed(1);
};

export const formatMetricCell = (player, key) => {
  const edgeValue = player.edgeValues?.[key];
  if (edgeValue != null) return formatEdgeValue(key, edgeValue);
  return formatPercentile(player.metrics?.[key]);
};

export const percentileTint = (value) => {
  if (value == null) return "transparent";
  const hue = Math.max(0, Math.min(120, value * 1.2));
  return `hsla(${hue}, 70%, 45%, 0.22)`;
};
