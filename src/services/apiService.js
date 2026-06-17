const getApiBaseUrl = () => {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "");

  if (isLocalhost || process.env.NODE_ENV === "development") {
    return process.env.REACT_APP_API_URL || "http://localhost:5001";
  }

  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  return "";
};

const API_BASE_URL = getApiBaseUrl();

const NHL_TO_ESPN_TEAM_MAP = {
  LAK: "LA",
  SJS: "SJ",
  TBL: "TB",
  NJD: "NJ",
};
export const apiService = {
  async searchPlayer(
    playerName,
    season,
    position,
    numNeighbors = 9,
    filterSeason = null
  ) {
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
  },

  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  async initializeCache() {
    const response = await fetch(`${API_BASE_URL}/init`, {
      method: "GET",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Cache initialization failed");
    }
    return response.json();
  },

  async checkCacheStatus() {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: "GET",
    });
    if (!response.ok) {
      return { cacheExists: false, dataLoaded: false };
    }
    return response.json();
  },

  async searchAutofill(query, limit = 5) {
    const response = await fetch(
      `${API_BASE_URL}/search/autofill?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch autofill suggestions");
    }
    return response.json();
  },

  async fetchTeams(year) {
    const response = await fetch(`${API_BASE_URL}/teams?year=${year}`);
    if (!response.ok) {
      throw new Error("Failed to fetch teams");
    }
    return response.json();
  },

  async fetchTeamSummary(team, year) {
    const response = await fetch(
      `${API_BASE_URL}/teams?team=${team}&year=${year}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch team summary");
    }
    return response.json();
  },

  async fetchRosters(year, team, position) {
    const response = await fetch(
      `${API_BASE_URL}/rosters?year=${year}&team=${team}&position=${position}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch rosters");
    }
    return response.json();
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

      if (!teamEntry) {
        throw new Error("Team not found");
      }

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

  async fetchFeatured() {
    const response = await fetch(`${API_BASE_URL}/featured`);
    if (!response.ok) {
      throw new Error("Failed to fetch featured data");
    }
    return response.json();
  },

  // Expansion Draft — every franchise active in a season (drives the team grid).
  async fetchDraftTeams(year) {
    const response = await fetch(`${API_BASE_URL}/draft/teams?year=${year}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch draft teams");
    }
    return response.json();
  },

  // Expansion Draft — full single-team roster with box scores, age, and the
  // server-resolved protection annotations the draft table renders.
  async fetchDraftRoster(year, team) {
    const response = await fetch(
      `${API_BASE_URL}/draft/rosters?year=${year}&team=${encodeURIComponent(team)}`
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch draft roster");
    }
    return response.json();
  },

  // Expansion Draft — analyze a completed draft into a full team profile
  // (simulated stats, similar teams, predicted record, franchise-ordered roster).
  async analyzeDraft({ season, teamName, picks }) {
    const response = await fetch(`${API_BASE_URL}/draft/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season: parseInt(season), teamName, picks }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to analyze draft");
    }
    return response.json();
  },

  // Expansion Draft — re-analyze a saved roster into a fresh profile without
  // strict franchise-list validation. Used when reopening a non-leaderboard
  // saved franchise so metrics are always computed dynamically.
  async reanalyzeDraft({ season, teamName, picks }) {
    const response = await fetch(`${API_BASE_URL}/draft/reanalyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season: parseInt(season), teamName, picks }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to re-analyze draft");
    }
    return response.json();
  },
};

