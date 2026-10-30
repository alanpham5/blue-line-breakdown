import { useEffect, useState } from "react";
import { apiService } from "lib/api/apiService";
import { currentSeasonStart, seasonRange } from "utils/season";

export const useTeamSeasons = () => {
  const [seasons, setSeasons] = useState(() =>
    seasonRange().filter((s) => s < currentSeasonStart())
  );
  useEffect(() => {
    let active = true;
    apiService
      .fetchTeamSeasons()
      .then((data) => {
        if (active && data.seasons?.length) {
          setSeasons([...data.seasons].sort((a, b) => a - b));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return seasons;
};
