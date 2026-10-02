import { apiService } from "lib/api/apiService";

export const LOCAL_SEARCH_MIN_LENGTH = 3;

const normalize = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toEntry = (fields) => {
  const normalized = normalize(fields.name);
  return {
    ...fields,
    normalized,
    parts: normalized.split(" ").filter(Boolean),
  };
};

const buildIndex = ({ players = [], teams = [], currentSeason = null }) => {
  const newestSeason = Math.max(0, ...players.map((player) => player[4]));
  return {
    currentSeason,
    players: players.map(
      ([playerId, name, position, team, latestSeason, prominence = 0]) =>
        toEntry({
          type: "player",
          playerId,
          name,
          position,
          team,
          latestSeason,
          prominence,
          active: latestSeason >= newestSeason - 1,
        })
    ),
    teams: teams.map(([team, name, latestSeason]) => {
      const entry = toEntry({
        type: "team",
        team,
        name,
        latestSeason,
        prominence: Number.MAX_SAFE_INTEGER,
        active: true,
      });
      return { ...entry, parts: [...entry.parts, team.toLowerCase()] };
    }),
  };
};

let indexPromise = null;

export const loadSearchIndex = () => {
  indexPromise ??= apiService
    .fetchSearchIndex()
    .then(buildIndex)
    .catch((error) => {
      indexPromise = null;
      throw error;
    });
  return indexPromise;
};

const tokensMatchParts = (tokens, parts) => {
  const remaining = [...parts];
  return tokens.every((token) => {
    const index = remaining.findIndex((part) => part.startsWith(token));
    if (index === -1) return false;
    remaining.splice(index, 1);
    return true;
  });
};

const scoreEntry = (entry, query, tokens) => {
  if (entry.normalized === query) return 100;
  if (entry.parts.includes(query)) return 95;
  if (tokens.length === 1 && entry.parts.some((part) => part.startsWith(query)))
    return 85;
  if (entry.normalized.startsWith(query)) return 85;
  if (tokens.length > 1 && tokensMatchParts(tokens, entry.parts)) return 80;
  if (entry.normalized.includes(query)) return 60;
  return 0;
};

const byScoreThenProminence = (a, b) =>
  b.score - a.score ||
  Number(b.active) - Number(a.active) ||
  b.prominence - a.prominence ||
  b.latestSeason - a.latestSeason ||
  a.name.length - b.name.length ||
  a.name.localeCompare(b.name);

export const searchIndex = (index, rawQuery, { scope = "all", limit = 10 }) => {
  const query = normalize(rawQuery);
  if (query.length < LOCAL_SEARCH_MIN_LENGTH) return [];
  const tokens = query.split(" ");
  const pools =
    scope === "players"
      ? index.players
      : scope === "teams"
        ? index.teams
        : [...index.players, ...index.teams];
  return pools
    .map((entry) => ({ entry, score: scoreEntry(entry, query, tokens) }))
    .filter(({ score }) => score > 0)
    .map(({ entry, score }) => ({ ...entry, score }))
    .sort(byScoreThenProminence)
    .slice(0, limit)
    .map(
      ({ normalized, parts, score, active, prominence, ...result }) => result
    );
};
