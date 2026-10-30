import { AppSelect } from "components/ui/AppSelect";

const seasonName = (season) =>
  `${season}-${(Number(season) + 1).toString().slice(-2)}`;

const teamLabel = (teamCode, season) =>
  Number(season) <= 2013 && teamCode === "ARI" ? "PHX" : teamCode;

export const TeamSeasonSelects = ({
  seasons,
  season,
  onSeasonChange,
  teams,
  team,
  onTeamChange,
  loadingTeams = false,
  className = "grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2",
}) => (
  <div className={className}>
    <AppSelect
      placeholder="Season"
      value={season}
      onChange={(event) => onSeasonChange(event.target.value)}
      className="app-field px-4 py-3.5 pr-10 text-base text-white light:text-gray-900"
    >
      {[...seasons].reverse().map((availableSeason) => (
        <option key={availableSeason} value={availableSeason}>
          {seasonName(availableSeason)}
        </option>
      ))}
    </AppSelect>
    <AppSelect
      placeholder="Team"
      value={team}
      onChange={(event) => onTeamChange(event.target.value)}
      disabled={loadingTeams || !season}
      className="app-field px-4 py-3.5 pr-10 text-base text-white light:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loadingTeams ? (
        <option>Loading...</option>
      ) : (
        [...teams]
          .sort((first, second) =>
            teamLabel(first, season).localeCompare(teamLabel(second, season))
          )
          .map((teamCode) => (
            <option key={teamCode} value={teamCode}>
              {teamLabel(teamCode, season)}
            </option>
          ))
      )}
    </AppSelect>
  </div>
);
