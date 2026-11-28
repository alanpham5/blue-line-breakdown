const HIDDEN_QUALITY_KEYS = new Set(["blockShare"]);

export const displayedQualityBars = (stats) =>
  (stats || []).filter((stat) => !HIDDEN_QUALITY_KEYS.has(stat.key));
