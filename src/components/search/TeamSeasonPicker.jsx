import { useEffect, useState } from "react";
import { TeamSeasonSelects } from "components/search/TeamSeasonSelects";
import { useSeasonTeams } from "hooks/useSeasonTeams";
import { useTeamSeasons } from "hooks/useTeamSeasons";

export const TeamSeasonPicker = ({ team, season, onSelect, className }) => {
  const seasons = useTeamSeasons();
  const [pendingSeason, setPendingSeason] = useState(String(season || ""));
  const { teams, loading } = useSeasonTeams(pendingSeason);

  useEffect(() => {
    setPendingSeason(String(season || ""));
  }, [season]);

  useEffect(() => {
    if (loading || !team || pendingSeason === String(season)) return;
    if (teams.includes(team)) onSelect(team, pendingSeason);
  }, [loading, teams, team, season, pendingSeason, onSelect]);

  const switchingSeason = pendingSeason !== String(season);
  const shownTeam = switchingSeason && !teams.includes(team) ? "" : team;

  return (
    <TeamSeasonSelects
      seasons={seasons}
      season={pendingSeason}
      onSeasonChange={setPendingSeason}
      teams={teams}
      team={shownTeam}
      onTeamChange={(nextTeam) => onSelect(nextTeam, pendingSeason)}
      loadingTeams={loading}
      className={className}
    />
  );
};
