const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5001';
  }
  return process.env.REACT_APP_API_URL || '';
};

const API_BASE_URL = getApiBaseUrl();

export const apiService = {
  async searchPlayer(
    playerName,
    season,
    position,
    numNeighbors = 7,
    filterSeason = null,
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
};
