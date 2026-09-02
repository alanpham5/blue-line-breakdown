export const getPercentileHue = (percentile) => {
  if (percentile == null) return null;
  const numericPercentile = Number(percentile);
  if (!Number.isFinite(numericPercentile)) return null;
  return Math.max(0, Math.min(120, numericPercentile * 1.2));
};

export const getPercentileColor = (percentile) => {
  const hue = getPercentileHue(percentile);
  return hue == null ? undefined : `hsl(${hue}, 85%, 60%)`;
};
