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
  const didWinStanleyCup = playerUtils.didWinStanleyCup(team, season);
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
    <div ref={teamHeaderRef} className="relative overflow-hidden mt-6">
      <div className="hidden lg:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: playerUtils.getTeamColor(
              team,
              season,
              actualTheme
            ),
            clipPath: "polygon(95% 0%, 100% 0%, 100% 100%, 85% 100%)",
          }}
        />

        <div
          className="absolute inset-0 player-header-overlay-bg"
          style={{
            clipPath: "polygon(96% 0%, 97% 0%, 87% 100%, 86% 100%)",
          }}
        />
      </div>
      <h2 className="relative z-10 text-center font-bold">
        <div className="flex items-center justify-center md:gap-4 py-2">
          <div className="relative w-28 object-contain mt-4 mx-4">
            {didWinStanleyCup && (
              <img
                src="/stanleycup.png"
                alt="Stanley Cup"
                className="absolute  inset-0 scale-150 w-full h-fit object-contain"
              />
            )}
            <img
              src={playerUtils.getTeamLogoUrl(team, season, actualTheme)}
              alt={team}
              className={`relative h-32 object-contain team-logo-stroke ${
                didWinStanleyCup
                  ? `scale-75 z-10 ${
                      actualTheme === "dark" && "team-logo-stroke-cup"
                    }`
                  : ""
              }`}
            />
          </div>

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
            <div className="md:hidden text-xl font-bold">
              {playerUtils.getFullTeamName(team, season)}
            </div>

            <span className="text-xl font-semibold">
              <span className="md:hidden">
                {position === "F" ? "FWD" : "DEF"} •{" "}
              </span>
              <span className="hidden md:inline">
                {position === "F" ? "Forwards" : "Defensemen"} •{" "}
              </span>
              {getSeasonName(season)}
            </span>

            <div className="md:hidden text-sm font-normal ml-2 text-gray-300 light:text-gray-600 text-nowrap">
              {teamRecord}
              {teamClinchStatus ? ` (${teamClinchStatus})` : ""}
            </div>
          </h2>
        </div>
      </h2>
    </div>
  );
};
