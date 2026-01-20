import { playerUtils } from "../utils/playerUtils";

export const PlayerCard = ({ player, team, season, onPlayerClick }) => {
  const maxWinShare = 100;
  const gaugeWidth = Math.min(Math.abs(player.winShare), maxWinShare);
  const { getPlayerHeadshot } = playerUtils;

  return (
    <div
      className="liquid-glass rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors liquid-glass-animate"
      onClick={() => onPlayerClick(player)}
    >
      <div className="flex items-center gap-4 mb-3">
        <img
          src={getPlayerHeadshot(player.playerId, team, season)}
          alt={player.name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.target.src = "/mobile-icon.png";
          }}
        />
        <h3 className="font-bold text-white">{player.name}</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Win Share</span>
          <span
            className={`${player.winShare >= 0 ? "text-cyan-400" : "text-red-400"} font-bold`}
          >
            {player.winShare.toFixed(1)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${player.winShare >= 0 ? "from-cyan-500 to-blue-500" : "from-red-500 to-orange-500"} h-2 rounded-full transition-all duration-300 gauge-fill`}
            style={{ width: `${gaugeWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
