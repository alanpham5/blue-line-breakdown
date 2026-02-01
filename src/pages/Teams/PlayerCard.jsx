import { useTheme } from "../../providers/ThemeContext";
import { playerUtils } from "../../utils/playerUtils";

export const PlayerCard = ({ player, team, season, stroke, onPlayerClick }) => {
  const maxWinShare = 100;
  const gaugeWidth = Math.min(Math.abs(player.winShare), maxWinShare);
  const { getPlayerHeadshot } = playerUtils;
  const { actualTheme } = useTheme;

  return (
    <div
      className="liquid-glass-strong rounded-2xl p-4 cursor-pointer hover:bg-white/5 light:hover:bg-gray-100/80 transition-colors liquid-glass-animate"
      onClick={() => onPlayerClick(player)}
    >
      <div className="lg:block absolute top-0 right-0 h-full w-44 overflow-hidden rounded-tr-xl rounded-br-2xl z-[-1]">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: stroke,
            clipPath: "polygon(65% 0%, 100% 0%, 100% 100%, 35% 100%)",
          }}
        />

        <div
          className="absolute inset-0 player-header-overlay-bg"
          style={{
            clipPath: "polygon(70% 0%, 75% 0%, 45% 100%, 40% 100%)",
          }}
        />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <img
          src={getPlayerHeadshot(player.playerId, team, season)}
          alt={player.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300/50 light:border-gray-400/60 bg-[var(--team-color)]"
          style={{
            "--team-color": playerUtils.getTeamColor(team, season),
          }}
          onError={(e) => {
            e.target.src = "/mobile-icon.png";
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
            className={`${player.winShare >= 0 ? "text-cyan-300 light:text-cyan-700" : "text-red-300 light:text-red-700"} font-bold bg-black/50 light:bg-gray-200/80 px-2 py-0.5 rounded-full`}
          >
            {player.winShare.toFixed(1)}
          </span>
        </div>
        <div className="w-full bg-gray-700 light:bg-gray-200 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${player.winShare >= 0 ? "from-cyan-500 to-blue-500" : "from-red-500 to-orange-500"} h-2 rounded-full transition-all duration-300 gauge-fill`}
            style={{ width: `${gaugeWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
