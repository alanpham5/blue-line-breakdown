import { getImpact, leaderIndex, toNumber } from "./shared";

const SHORT_LABELS = {
  Shoot: "Shoot",
  "Offensive Buildup": "Buildup",
  "Physical Pressure": "Physical",
  "Shot Blocking": "Blocks",
  "Puck Freeze": "Freeze",
  Rebounds: "Rebounds",
  "Chance Creation": "Creation",
  Positioning: "Positioning",
  Finishing: "Finishing",
  Takeaways: "Takeaways",
  "D-Zone Exits": "Exits",
  "Chance Suppression": "Suppression",
  "Save Percentage": "SV%",
  "Goals Against / 60": "GA/60",
  "Goals Save Above Expected": "GSAx",
  "Low Danger Saves": "Low Danger",
  "Medium Danger Saves": "Mid Danger",
  "High Danger Saves": "High Danger",
};

export const EDGE_METRICS = [
  { key: "TOP_SPEED", label: "Top skating speed", short: "Top Speed", unit: "mph" },
  { key: "SPEED_BURSTS", label: "Bursts (20+ mph) per 60", short: "Bursts/60", unit: "" },
  { key: "DIST_GAME", label: "Distance per game", short: "Distance", unit: "mi" },
  { key: "SHOT_SPEED", label: "Top shot speed", short: "Shot Speed", unit: "mph" },
  { key: "OZONE", label: "Offensive zone time", short: "O-Zone", unit: "%" },
];

export const qualityGroupsFor = (isGoalie) =>
  isGoalie
    ? [
        { key: "goaltending", title: "Goaltending", radarGroup: "Saves" },
        { key: "shotsFaced", title: "Shots Faced", radarGroup: "Danger" },
      ]
    : [
        { key: "offensive", title: "Offensive Quality", radarGroup: "Offense" },
        { key: "defensive", title: "Defensive Quality", radarGroup: "Defense" },
      ];

export const mergeByLabel = (leftItems, rightItems, readValue) => {
  const leftMap = new Map((leftItems || []).map((item) => [item.label, item]));
  const rightMap = new Map((rightItems || []).map((item) => [item.label, item]));
  const labels = [...new Set([...leftMap.keys(), ...rightMap.keys()])];
  return labels.map((label) => ({
    label,
    items: [leftMap.get(label), rightMap.get(label)],
    values: [
      toNumber(readValue(leftMap.get(label))),
      toNumber(readValue(rightMap.get(label))),
    ],
  }));
};

export const shortLabel = (label) => SHORT_LABELS[label] || label;

export const buildRadarAxes = (left, right, isGoalie) => {
  const style = mergeByLabel(
    left.tendencies,
    right.tendencies,
    (item) => item?.percentile
  ).map((row) => ({ ...row, group: "Style", competitive: false }));

  const quality = qualityGroupsFor(isGoalie).flatMap((group) =>
    mergeByLabel(
      left.quality?.[group.key],
      right.quality?.[group.key],
      (item) => item?.value
    ).map((row) => ({ ...row, group: group.radarGroup, competitive: true }))
  );

  const hasEdge = !isGoalie && left.edgePercentiles && right.edgePercentiles;
  const edge = hasEdge
    ? EDGE_METRICS.map((metric) => ({
        label: metric.label,
        short: metric.short,
        values: [
          toNumber(left.edgePercentiles[metric.key]),
          toNumber(right.edgePercentiles[metric.key]),
        ],
        group: "Athleticism",
        competitive: true,
      })).filter((row) => row.values.some((value) => value != null))
    : [];

  return [...style, ...quality, ...edge].map((axis) => ({
    ...axis,
    short: axis.short || shortLabel(axis.label),
  }));
};

export const buildVerdict = (left, right, axes) => {
  const categories = [
    {
      label: "Impact",
      group: "Impact",
      values: [getImpact(left.player), getImpact(right.player)],
    },
    ...axes.filter((axis) => axis.competitive),
  ].filter((category) => category.values.every((value) => value != null));

  const scored = categories.map((category) => ({
    ...category,
    leader: leaderIndex(category.values, false, 0.5),
    gap: category.values[0] - category.values[1],
  }));

  const wins = [0, 1].map(
    (index) => scored.filter((category) => category.leader === index).length
  );
  const ties = scored.length - wins[0] - wins[1];
  const biggestEdges = [0, 1].map((index) =>
    scored
      .filter((category) => category.leader === index)
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
      .slice(0, 3)
  );
  const strongestGroup = [0, 1].map((index) => {
    const totals = scored.reduce((map, category) => {
      const signedGap = index === 0 ? category.gap : -category.gap;
      if (signedGap <= 0 || category.group === "Impact") return map;
      return { ...map, [category.group]: (map[category.group] || 0) + signedGap };
    }, {});
    const [group] =
      Object.entries(totals).sort((a, b) => b[1] - a[1])[0] || [];
    return group || null;
  });

  return { total: scored.length, wins, ties, biggestEdges, strongestGroup };
};
