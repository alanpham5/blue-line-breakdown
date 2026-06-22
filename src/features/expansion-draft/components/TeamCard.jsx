import { playerUtils } from "utils/playerUtils";

export const TeamCard = ({ team, season, actualTheme, pick, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full cursor-pointer border-0 bg-transparent p-0 outline-none"
  >
    <div
      className={`flex flex-col items-center rounded-[22px] border p-3 text-center transition-all duration-300 ease-out group-hover:scale-[1.06] group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.18)] group-focus-visible:ring-2 group-focus-visible:ring-sky-400/50 light:group-hover:shadow-[0_16px_36px_rgba(100,80,90,0.18)] ${
        isActive
          ? "border-sky-400/60 bg-sky-400/10"
          : "border-white/10 bg-[#1c1c1e] group-hover:border-white/20 light:border-slate-200 light:bg-white"
      }`}
    >
      <img
        src={playerUtils.getTeamLogoUrl(team.team, season, actualTheme)}
        alt={team.name}
        className="h-12 w-12 object-contain"
        onError={(e) => (e.target.style.visibility = "hidden")}
      />
      <span className="mt-1.5 line-clamp-1 text-[0.7rem] font-semibold text-gray-200 light:text-slate-700">
        {team.name}
      </span>

      <div className="mt-2 w-full">
        {pick ? (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-1">
            <img
              src={playerUtils.getPlayerHeadshot(
                pick.playerId,
                team.team,
                season
              )}
              alt={pick.name}
              className="h-5 w-5 shrink-0 rounded-full object-cover bg-[var(--team-color)]"
              style={{
                "--team-color": playerUtils.getTeamColor(team.team, season),
              }}
              onError={(e) => (e.target.src = playerUtils.getDefaultHeadshot())}
            />
            <span className="line-clamp-1 text-[0.65rem] font-semibold text-emerald-300 light:text-emerald-700">
              {pick.position} - {pick.name}
            </span>
          </div>
        ) : (
          <div className="rounded-full border border-dashed border-white/20 px-2 py-1 text-[0.65rem] font-medium text-gray-500 light:border-slate-300">
            Empty slot
          </div>
        )}
      </div>
    </div>
  </button>
);
