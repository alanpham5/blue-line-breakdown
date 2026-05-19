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
  const teamCardGradient = playerUtils.getTeamCardGradient(
    team,
    season,
    actualTheme
  );

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
    <div ref={teamHeaderRef} className="relative mt-6">
      <div
        className="team-card-surface liquid-glass rounded-[32px] overflow-hidden px-5 py-6 sm:px-6"
        style={{ "--team-card-gradient": teamCardGradient }}
      >
        <div className="relative z-10 text-center font-bold">
          <div className="flex items-center justify-center gap-3 py-2 md:gap-4">
            <div className="relative mx-2 mt-1 h-32 w-28 justify-center md:mx-4 md:h-36 md:w-32">
              {didWinStanleyCup && (
                <img
                  src="/stanleycup.png"
                  alt="Stanley Cup"
                  className="absolute inset-0 w-full h-full object-contain z-0"
                  style={{ filter: "opacity(1)" }}
                />
              )}

              <img
                src={playerUtils.getTeamLogoUrl(team, season, actualTheme)}
                alt={team}
                className={`relative h-32 object-contain team-logo-stroke z-10 md:h-36 ${
                  didWinStanleyCup
                    ? `scale-75 ${
                        actualTheme === "dark" && "team-logo-stroke-cup"
                      }`
                    : ""
                }`}
                style={
                  didWinStanleyCup
                    ? { transform: "translateZ(0) scale(0.75)" }
                    : undefined
                }
              />
            </div>

            <div className="text-center text-2xl font-bold text-white light:text-gray-900">
              <div className="hidden items-end text-center text-3xl font-bold text-white light:text-gray-900 md:flex">
                {playerUtils.getFullTeamName(team, season)}
                {teamRecord && (
                  <span className="text-lg font-normal ml-2 text-gray-300 light:text-gray-600">
                    {teamRecord}
                    {teamClinchStatus ? ` (${teamClinchStatus})` : ""}
                  </span>
                )}
              </div>
              <div className="md:hidden text-lg font-bold text-nowrap">
                {playerUtils.getFullTeamName(team, season)}
              </div>

              <span className="text-lg font-semibold text-gray-300 light:text-gray-700">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
