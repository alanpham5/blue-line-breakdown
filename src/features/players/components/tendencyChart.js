const CENTER = 110;

export const polarPoint = (radius, angle) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.sin(radians),
    y: CENTER - radius * Math.cos(radians),
  };
};

export const describeWedge = (radius, startAngle, endAngle) => {
  const safeRadius = Math.max(0.01, radius);
  const sweep = endAngle - startAngle;
  if (sweep >= 359.99) {
    const top = polarPoint(safeRadius, 0);
    const bottom = polarPoint(safeRadius, 180);
    return [
      `M ${top.x} ${top.y}`,
      `A ${safeRadius} ${safeRadius} 0 1 1 ${bottom.x} ${bottom.y}`,
      `A ${safeRadius} ${safeRadius} 0 1 1 ${top.x} ${top.y}`,
      "Z",
    ].join(" ");
  }
  const start = polarPoint(safeRadius, startAngle);
  const end = polarPoint(safeRadius, endAngle);
  const largeArc = sweep > 180 ? 1 : 0;
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${safeRadius} ${safeRadius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
};

const actionShare = (tendency) => Math.max(0, Number(tendency.percentage) || 0);

const chartOrder = (tendencies) =>
  tendencies.length === 4
    ? [tendencies[0], tendencies[1], tendencies[3], tendencies[2]]
    : tendencies;

export const layoutWedges = (tendencies) => {
  const totalActions = tendencies.reduce(
    (total, tendency) => total + actionShare(tendency),
    0
  );
  const offensiveShare = tendencies
    .slice(0, 2)
    .reduce((total, tendency) => total + actionShare(tendency), 0);
  const offensiveArc =
    totalActions > 0 ? (offensiveShare / totalActions) * 360 : 180;
  let currentAngle = -offensiveArc / 2;
  return chartOrder(tendencies).map((tendency) => {
    const angularSize =
      totalActions > 0
        ? (actionShare(tendency) / totalActions) * 360
        : 360 / tendencies.length;
    const wedge = {
      ...tendency,
      startAngle: currentAngle,
      endAngle: currentAngle + angularSize,
    };
    currentAngle += angularSize;
    return wedge;
  });
};
