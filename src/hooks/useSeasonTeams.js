import { useEffect, useState } from "react";
import { apiService } from "lib/api/apiService";

export const useSeasonTeams = (season) => {
  const [state, setState] = useState({ season: null, teams: [] });
  useEffect(() => {
    if (!season) return;
    let active = true;
    apiService
      .fetchTeams(season)
      .then((data) => active && setState({ season, teams: data.teams || [] }))
      .catch(() => active && setState({ season, teams: [] }));
    return () => {
      active = false;
    };
  }, [season]);
  const loaded = Boolean(season) && String(state.season) === String(season);
  return {
    teams: loaded ? state.teams : [],
    loading: Boolean(season) && !loaded,
  };
};
