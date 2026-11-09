import htrGames from "data/htrGames.json";

const listeners = new Set();

const toDateKey = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

let htrOverride = null;

export const HTR_SEASON = htrGames.season;

export const getHtrOverride = () => htrOverride;

export const setHtrOverride = (override) => {
  htrOverride = override;
  listeners.forEach((listener) => listener());
};

export const subscribeHtr = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const isHtrSeason = (season) =>
  season != null && parseInt(season, 10) === HTR_SEASON;

export const hasHtrGameOn = (teamCode, date = new Date()) => {
  const games = htrGames.teams[String(teamCode || "").toUpperCase()] || [];
  const dateKey = toDateKey(date);
  return games.some((game) => game.date === dateKey);
};

export const isHtrActive = (teamCode, season) => {
  if (!isHtrSeason(season)) return false;
  if (htrOverride !== null) return htrOverride;
  return hasHtrGameOn(teamCode);
};
