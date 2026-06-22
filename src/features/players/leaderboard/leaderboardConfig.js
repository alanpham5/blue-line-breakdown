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
    keys: ["POS_CTRL", "BLK", "HIT", "TAKE", "CH_SUP", "GOAL_PREV"],
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

export const percentileTint = (value) => {
  if (value == null) return "transparent";
  const hue = Math.max(0, Math.min(120, value * 1.2));
  return `hsla(${hue}, 70%, 45%, 0.22)`;
};
