import React, { useEffect, useRef } from "react";
import { playerUtils } from "../../utils/playerUtils";
import { useTheme } from "../../providers/ThemeContext";

const getSeasonName = (s) => `${s}-${(parseInt(s) + 1).toString().slice(-2)}`;

export const TeamHeader = ({
  team,
  season,
  position,
  teamRecord,
  teamClinchStatus,
}) => {
  const teamHeaderRef = useRef(null);
  const { actualTheme } = useTheme();

  useEffect(() => {
    if (teamHeaderRef.current) {
      const y =
        teamHeaderRef.current.getBoundingClientRect().top +
        window.pageYOffset -
        100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [team, season, position]);

  return (
    <h2 ref={teamHeaderRef} className="text-center font-bold mt-8 mb-6">
      <div className="flex items-center justify-center md:gap-4 mt-8 mb-6">
        <img
          src={playerUtils.getTeamLogoUrl(team, season, actualTheme)}
          alt={team}
          className="w-24 lg:w-32 m-2 shrink-0 team-logo-stroke"
        />
        <h2 className="text-center text-2xl font-bold text-white light:text-gray-900">
          <h2 className="hidden md:flex text-center items-end text-3xl font-bold text-white light:text-gray-900">
            {playerUtils.getFullTeamName(team, season)}
            {teamRecord && (
              <span className="text-lg font-normal ml-2 text-gray-300 light:text-gray-600">
                {teamRecord}
                {teamClinchStatus ? ` (${teamClinchStatus})` : ""}
              </span>
            )}
          </h2>
          <span className="text-xl md:text-2xl font-bold">
            <span className="md:hidden">
              {position === "F" ? "FWD" : "DEF"} •{" "}
            </span>
            <span className="hidden md:inline">
              {position === "F" ? "Forwards" : "Defensemen"} •{" "}
            </span>
            {getSeasonName(season)}
          </span>
          <div className="md:hidden text-sm font-normal ml-2 text-gray-300 light:text-gray-600">
            {teamRecord}
            {teamClinchStatus ? ` (${teamClinchStatus})` : ""}
          </div>
        </h2>
      </div>
    </h2>
  );
};
