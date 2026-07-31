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
const request = (path, { method = "GET", body, errorMessage } = {}) =>
  trackApiRequest(async () => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers:
        body !== undefined
          ? {
              "Content-Type": "application/json",
            }
          : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || errorMessage || "Request failed");
    }
    return res.json();
  });
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
  searchAutofill(query, limit = 5) {
    return request(
      `/search/autofill?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        errorMessage: "Failed to fetch autofill suggestions",
      }
    );
  },
  searchPlayersV2(query, limit = 8) {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    return request(`/v2/players/search?${params.toString()}`, {
      errorMessage: "Failed to search players",
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
    return request(`/v2/players/${playerId}?${params.toString()}`, {
      errorMessage: "Failed to fetch player profile",
    });
  },
  fetchPlayersV2Status() {
    return request("/v2/players/status", {
      errorMessage: "Failed to inspect player data",
    });
  },
  searchV2(query, limit = 10) {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    return request(`/v2/search?${params.toString()}`, {
      errorMessage: "Failed to search players and teams",
    });
  },
  fetchLeaderboard(position, season = null, limit = null) {
    const params = new URLSearchParams({ position });
    if (season) params.set("season", season);
    if (limit) params.set("limit", limit);
    return request(`/v2/leaderboard?${params.toString()}`, {
      errorMessage: "Failed to fetch leaderboard",
    });
  },
  fetchTeams(year) {
    return request(`/v2/teams?season=${year}`, {
      errorMessage: "Failed to fetch teams",
    });
  },
  fetchTeamSummary(team, year) {
    return request(
      `/v2/teams/${encodeURIComponent(team)}?season=${encodeURIComponent(year)}`,
      {
        errorMessage: "Failed to fetch team summary",
      }
    );
  },
  searchTeamsV2(query, limit = 10) {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    return request(`/v2/teams/search?${params.toString()}`, {
      errorMessage: "Failed to search teams",
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
    return request("/v2/featured", {
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
