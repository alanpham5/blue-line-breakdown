export const seasonSpan = (season) => {
  const s = parseInt(season, 10);
  return `${s}-${(s + 1).toString().slice(-2)}`;
};
