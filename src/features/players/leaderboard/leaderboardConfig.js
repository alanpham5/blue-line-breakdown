export const POSITIONS = [
  { value: "F", label: "Forwards", singular: "Forward" },
  { value: "D", label: "Defensemen", singular: "Defenseman" },
  { value: "G", label: "Goalies", singular: "Goalie" },
];

const SKATER_METRIC_GROUPS = [
  {
    type: "tendencies",
    keys: ["SHOT_FREQ", "PASS_FREQ", "PHYS", "BLK"],
  },
  {
    type: "shotMix",
    keys: ["SHOT_WRIST", "SHOT_SNAP", "SHOT_SLAP", "SHOT_BACK", "SHOT_TIP"],
  },
  {
    type: "offensive",
    keys: ["SHOT_TAL", "PLAY_DRV", "PP_USAGE", "ONICE_IMP", "O_ENTRY"],
  },
  {
    type: "defensive",
    keys: ["POS_CTRL", "TAKE", "CH_SUP", "BLK_SHARE", "D_EXIT_P"],
  },
  {
    type: "deployment",
    keys: ["OZ_START", "DZ_START", "PP_TOI", "PK_TOI", "MATES"],
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
    keys: ["SV_PCT", "GSAX", "LD_SV", "MD_SV", "HD_SV", "GA_60"],
  },
  {
    type: "workload",
    keys: [
      "WORKLOAD",
      "LD_SA",
      "MD_SA",
      "HD_SA",
      "xGA_60",
      "REB_CTRL",
      "FREEZE",
    ],
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
  if (inches == null) return "-";
  const feet = Math.floor(inches / 12);
  const rem = Math.round(inches % 12);
  return `${feet}'${rem}"`;
};

export const SHIFT_VALUE_TITLE =
  "Shift Value Added: net shot attempts per 60 a player adds at 5-on-5, from the situation they inherit to the one they leave, separated from teammates and opponents";

export const formatSignedValue = (value) =>
  value == null ? "-" : `${value > 0 ? "+" : ""}${value.toFixed(1)}`;

export const formatPercentile = (value) =>
  value == null ? "-" : value.toFixed(1);

const isSavePercentageKey = (key) => key.endsWith("_SV");

const formatSavePercentage = (value) => value.toFixed(3).replace(/^0/, "");

const formatEdgeValue = (key, value) => {
  if (key === "OZONE")
    return `${(value < 1 ? value * 100 : value).toFixed(1)}%`;
  if (key === "DIST_GAME") return value.toFixed(2);
  return value.toFixed(1);
};

const formatMinutesSeconds = (seconds) => {
  const rounded = Math.round(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
};

export const formatMetricCell = (player, key) => {
  const countValue = player.countValues?.[key];
  if (countValue != null) return countValue.toLocaleString();
  const shareValue = player.shareValues?.[key];
  if (shareValue != null) return `${shareValue.toFixed(1)}%`;
  const perGameValue = player.perGameValues?.[key];
  if (perGameValue != null) return perGameValue.toFixed(2);
  const secondsPerGame = player.timePerGameValues?.[key];
  if (secondsPerGame != null) return formatMinutesSeconds(secondsPerGame);
  const edgeValue = player.edgeValues?.[key];
  if (edgeValue != null && !isSavePercentageKey(key))
    return formatEdgeValue(key, edgeValue);
  return formatPercentile(player.metrics?.[key]);
};

export const metricCellTitle = (player, key) => {
  const edgeValue = player.edgeValues?.[key];
  if (edgeValue == null || !isSavePercentageKey(key)) return undefined;
  return `${formatSavePercentage(edgeValue)} save %`;
};

const percentileHue = (value) => Math.max(0, Math.min(120, value * 1.2));

export const percentileTint = (value) =>
  value == null
    ? "transparent"
    : `hsla(${percentileHue(value)}, 70%, 45%, 0.22)`;

export const percentileColor = (value) =>
  value == null ? "transparent" : `hsl(${percentileHue(value)}, 70%, 45%)`;
