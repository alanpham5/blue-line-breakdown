import { playerUtils } from "../utils/playerUtils";

export const PlayerCard = ({ player, team, season, stroke, onPlayerClick }) => {
  const maxWinShare = 100;
  const gaugeWidth = Math.min(Math.abs(player.winShare), maxWinShare);
  const { getPlayerHeadshot } = playerUtils;

  return (
    <div
      className="liquid-glass-strong rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors liquid-glass-animate"
      onClick={() => onPlayerClick(player)}
    >
      <div className="lg:block absolute top-0 right-0 h-full w-44 overflow-hidden rounded-tr-xl rounded-br-2xl z-[-1]">
        {/* Base diagonal */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: stroke,
            clipPath: "polygon(65% 0%, 100% 0%, 100% 100%, 35% 100%)",
            opacity: 0.85,
          }}
        />

        {/* Accent stripe */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#0f172a",
            clipPath: "polygon(70% 0%, 75% 0%, 45% 100%, 40% 100%)",
            opacity: 0.75,
          }}
        />
      </div>
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
          <span className="text-gray-300 font-bold">Net Impact</span>
          <span
            className={`${player.winShare >= 0 ? "text-cyan-300" : "text-red-300"} font-bold bg-black/50 px-2 py-0.5 rounded-full`}
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
