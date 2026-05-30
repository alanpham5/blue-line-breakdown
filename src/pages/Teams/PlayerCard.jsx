import { playerUtils } from "../../utils/playerUtils";
import { useTheme } from "../../providers/ThemeContext";

export const PlayerCard = ({ player, team, season, stroke, onPlayerClick }) => {
  const maxWinShare = 100;
  const gaugeWidth = Math.min(Math.abs(player.winShare), maxWinShare);
  const { getPlayerHeadshot } = playerUtils;
  const { actualTheme } = useTheme();

  return (
    <div
      className="team-card-surface liquid-glass liquid-glass-animate cursor-pointer rounded-[28px] p-4 transition-all duration-300 hover:brightness-[1.03]"
      style={{
        "--team-card-gradient": playerUtils.getCardGradient(
          stroke,
          actualTheme
        ),
      }}
      onClick={() => onPlayerClick(player)}
    >
      <div className="flex items-center gap-4 mb-3">
        <img
          src={getPlayerHeadshot(player.playerId, team, season)}
          alt={player.name}
          className="w-12 h-12 rounded-full object-cover bg-[var(--team-color)]"
          style={{
            "--team-color": playerUtils.getTeamColor(team, season),
          }}
          onError={(e) => {
            e.target.src = "/blb-dark.png";
          }}
        />
        <h3 className="font-bold text-white max-w-[145px] sm:max-w-full truncate light:text-gray-900">
          {player.name}
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300 light:text-gray-600 font-bold">
            Net Impact
          </span>
          <span
            className={`${player.winShare >= 0 ? "text-cyan-300 light:text-cyan-700" : "text-rose-400 light:text-rose-700"} font-bold bg-white/[0.06] light:bg-gray-200/80 px-2 py-0.5 rounded-full`}
          >
            {player.winShare.toFixed(1)}
          </span>
        </div>
        <div className="w-full bg-white/[0.06] light:bg-gray-200 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${player.winShare >= 0 ? "from-cyan-500 to-sky-400" : "from-rose-500 to-red-400"} h-2 rounded-full transition-all duration-300 gauge-fill`}
            style={{ width: `${gaugeWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
