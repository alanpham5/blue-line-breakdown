import { trackApiRequest } from "lib/api/requestActivity";

const getApiBaseUrl = () => {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "");
  if (isLocalhost || process.env.NODE_ENV === "development") {
    return process.env.REACT_APP_API_URL || "http://localhost:5001";
  }
  return process.env.REACT_APP_API_URL || "";
};
const API_BASE_URL = getApiBaseUrl();
const NHL_TO_ESPN_TEAM_MAP = {
  LAK: "LA",
  SJS: "SJ",
  TBL: "TB",
  NJD: "NJ",
};
const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Check your connection and try again.";
export const isAbortError = (error) => error?.name === "AbortError";
const request = (path, { method = "GET", body, errorMessage, signal } = {}) =>
  trackApiRequest(async () => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers:
        body !== undefined
          ? {
              "Content-Type": "application/json",
            }
          : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).catch((error) => {
      if (isAbortError(error)) throw error;
      throw new Error(NETWORK_ERROR_MESSAGE);
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || errorMessage || "Request failed");
    }
    return res.json();
  });
const RESPONSE_CACHE_TTL_MS = 5 * 60 * 1000;
const RESPONSE_CACHE_LIMIT = 200;
const responseCache = new Map();

const abortError = () => new DOMException("Aborted", "AbortError");

const followUnlessAborted = (promise, signal) => {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener("abort", onAbort));
  });
};

const readCachedResponse = (path, { allowPending }) => {
  const entry = responseCache.get(path);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(path);
    return null;
  }
  if (!entry.settled && !allowPending) return null;
  responseCache.delete(path);
  responseCache.set(path, entry);
  return entry.promise;
};

const rememberResponse = (path, promise) => {
  const entry = {
    promise,
    settled: false,
    expiresAt: Date.now() + RESPONSE_CACHE_TTL_MS,
  };
  responseCache.set(path, entry);
  promise.then(
    () => {
      entry.settled = true;
    },
    () => {
      if (responseCache.get(path) === entry) responseCache.delete(path);
    }
  );
  while (responseCache.size > RESPONSE_CACHE_LIMIT) {
    responseCache.delete(responseCache.keys().next().value);
  }
};

const cachedRequest = (path, { errorMessage, signal, fresh = false } = {}) => {
  const cached = fresh
    ? null
    : readCachedResponse(path, { allowPending: !signal });
  if (cached) return followUnlessAborted(cached, signal);
  const promise = request(path, { errorMessage, signal });
  rememberResponse(path, promise);
  return promise;
};

export const apiService = {
  async searchPlayer(
    playerName,
    season,
    position,
    numNeighbors = 9,
    filterSeason = null
  ) {
    return trackApiRequest(async () => {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName,
          season: parseInt(season),
          position,
          numNeighbors,
          filterSeason,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        const errorObj = new Error(error.error || "Search failed");
        errorObj.suggestions = error.suggestions || null;
        throw errorObj;
      }
      return response.json();
    });
  },
  healthCheck() {
    return trackApiRequest(async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.json();
    });
  },
  initializeCache() {
    return request("/init", {
      errorMessage: "Cache initialization failed",
    });
  },
  checkCacheStatus() {
    return trackApiRequest(async () => {
      const response = await fetch(`${API_BASE_URL}/search`);
      if (!response.ok)
        return {
          cacheExists: false,
          dataLoaded: false,
        };
      return response.json();
    });
  },
  searchAutofill(query, limit = 5, { signal } = {}) {
    return cachedRequest(
      `/search/autofill?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        errorMessage: "Failed to fetch autofill suggestions",
        signal,
      }
    );
  },
  fetchSearchIndex() {
    return request("/v2/search/index", {
      errorMessage: "Failed to load the search index",
    });
  },
  searchPlayersV2(query, limit = 8, { signal } = {}) {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    return cachedRequest(`/v2/players/search?${params.toString()}`, {
      errorMessage: "Failed to search players",
      signal,
    });
  },
  fetchPlayerProfileV2(
    playerId,
    season = null,
    similarSeason = null,
    limit = 9
  ) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (season) params.set("season", String(season));
    if (similarSeason) params.set("similarSeason", String(similarSeason));
    return cachedRequest(`/v2/players/${playerId}?${params.toString()}`, {
      errorMessage: "Failed to fetch player profile",
    });
  },
  fetchGoalieShotMap(playerId, season) {
    return cachedRequest(
      `/v2/players/${playerId}/goalie-shot-map?season=${encodeURIComponent(season)}`,
      { errorMessage: "NHL EDGE shot data is unavailable" }
    );
  },
  fetchPlayerCareerV2(playerId) {
    return cachedRequest(`/v2/players/${playerId}/career`, {
      errorMessage: "Failed to fetch player career",
    });
  },
  fetchPlayersV2Status() {
    return request("/v2/players/status", {
      errorMessage: "Failed to inspect player data",
    });
  },
  searchV2(query, limit = 10, { signal } = {}) {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    return cachedRequest(`/v2/search?${params.toString()}`, {
      errorMessage: "Failed to search players and teams",
      signal,
    });
  },
  fetchLeaderboard(position, season = null, limit = null, { fresh } = {}) {
    const params = new URLSearchParams({ position });
    if (season) params.set("season", season);
    if (limit) params.set("limit", limit);
    return cachedRequest(`/v2/leaderboard?${params.toString()}`, {
      errorMessage: "Failed to fetch leaderboard",
      fresh,
    });
  },
  fetchTeams(year) {
    return cachedRequest(`/v2/teams?season=${year}`, {
      errorMessage: "Failed to fetch teams",
    });
  },
  fetchTeamSummary(team, year) {
    return cachedRequest(
      `/v2/teams/${encodeURIComponent(team)}?season=${encodeURIComponent(year)}`,
      {
        errorMessage: "Failed to fetch team summary",
      }
    );
  },
  searchTeamsV2(query, limit = 10, { signal } = {}) {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    return cachedRequest(`/v2/teams/search?${params.toString()}`, {
      errorMessage: "Failed to search teams",
      signal,
    });
  },
  fetchRosters(year, team, position) {
    return request(`/rosters?year=${year}&team=${team}&position=${position}`, {
      errorMessage: "Failed to fetch rosters",
    });
  },
  fetchTeamLines(team, year) {
    const params = new URLSearchParams({
      team,
      season: String(year),
    });
    return request(`/v2/lineups?${params.toString()}`, {
      errorMessage: "Failed to fetch lineups",
    });
  },
  simulateTeamLines({ team, year, forwardLines, defensePairs, goalies }) {
    return request("/v2/lineups/analyze", {
      method: "POST",
      body: {
        team,
        season: parseInt(year),
        forwardLines,
        defensePairs,
        goalies,
      },
      errorMessage: "Failed to analyze lineup",
    });
  },
  analyzeBuiltLine({ season, position, playerIds }) {
    return request("/v2/line-builder/analyze", {
      method: "POST",
      body: {
        season: parseInt(season),
        position,
        playerIds,
      },
      errorMessage: "Failed to analyze line",
    });
  },
  fetchPlayerPool(year, position) {
    const params = new URLSearchParams({
      season: String(year),
      position,
    });
    return request(`/v2/players/pool?${params.toString()}`, {
      errorMessage: "Failed to fetch player pool",
    });
  },
  async getNhlTeamStatus(teamAbbr, season) {
    try {
      const fetchSeason = parseInt(season) + 1;
      const url = `https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings?season=${fetchSeason}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      let entries = [];
      if (data?.standings?.entries) {
        entries = data.standings.entries;
      } else if (data?.children) {
        data.children.forEach((child) => {
          if (child.standings?.entries) {
            entries = entries.concat(child.standings.entries);
          }
        });
      }
      const teamEntry = entries.find(
        (entry) =>
          entry.team?.abbreviation ===
          (NHL_TO_ESPN_TEAM_MAP[teamAbbr] || teamAbbr)
      );
      if (!teamEntry) throw new Error("Team not found");
      const stats = teamEntry.stats ?? [];
      const wins = stats.find((s) => s.type === "wins")?.value ?? null;
      const losses = stats.find((s) => s.type === "losses")?.value ?? null;
      const otl =
        stats.find((s) => s.type === "overtimelosses")?.value ??
        stats.find((s) => s.type === "otlosses")?.value ??
        null;
      const clincher =
        stats.find((s) => s.type === "clincher")?.displayValue ?? null;
      return {
        team: teamAbbr,
        record:
          wins !== null
            ? {
                wins,
                losses,
                otl,
              }
            : null,
        clincher,
      };
    } catch (error) {
      return {
        team: null,
        record: null,
        clincher: null,
      };
    }
  },
  fetchFeatured() {
    return cachedRequest("/v2/featured", {
      errorMessage: "Failed to fetch featured data",
    });
  },
  fetchDraftTeams(year) {
    return request(`/v2/expansion-draft/teams?season=${year}`, {
      errorMessage: "Failed to fetch draft teams",
    });
  },
  fetchDraftRoster(year, team) {
    return request(
      `/v2/expansion-draft/rosters?season=${year}&team=${encodeURIComponent(team)}`,
      {
        errorMessage: "Failed to fetch draft roster",
      }
    );
  },
  analyzeDraft({ season, teamName, picks }) {
    return request("/v2/expansion-draft/analyze", {
      method: "POST",
      body: {
        season: parseInt(season),
        teamName,
        picks,
      },
      errorMessage: "Failed to analyze draft",
    });
  },
  reanalyzeDraft({ season, teamName, picks }) {
    return request("/v2/expansion-draft/reanalyze", {
      method: "POST",
      body: {
        season: parseInt(season),
        teamName,
        picks,
      },
      errorMessage: "Failed to re-analyze draft",
    });
  },
  analyzeTeam({ season, teamName, roster }) {
    return request("/v2/team-analysis", {
      method: "POST",
      body: {
        season: parseInt(season),
        teamName,
        roster,
      },
      errorMessage: "Failed to analyze team",
    });
  },
};
