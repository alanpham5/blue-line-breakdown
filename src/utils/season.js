export const seasonSpan = (season) => {
  const s = parseInt(season, 10);
  return `${s}-${(s + 1).toString().slice(-2)}`;
};

const FIRST_SEASON = 2008;
const OCTOBER = 9;

export const currentSeasonStart = (today = new Date()) =>
  today.getMonth() >= OCTOBER ? today.getFullYear() : today.getFullYear() - 1;

export const seasonRange = (today = new Date()) =>
  Array.from(
    { length: currentSeasonStart(today) - FIRST_SEASON + 1 },
    (_, index) => FIRST_SEASON + index
  );
