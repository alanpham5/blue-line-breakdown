import { Repeat2 } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
const percentileColors = (pct) => {
  if (typeof pct !== "number")
    return {
      text: "text-gray-300 light:text-gray-600",
      fill: "from-gray-500 to-gray-400",
    };
  if (pct >= 66)
    return {
      text: "text-emerald-300 light:text-emerald-600",
      fill: "from-emerald-500 to-green-400",
    };
  if (pct >= 40)
    return {
      text: "text-amber-300 light:text-amber-600",
      fill: "from-amber-500 to-yellow-400",
    };
  return {
    text: "text-rose-400 light:text-rose-600",
    fill: "from-rose-500 to-red-400",
  };
};
export const RosterPlayerCard = ({
  player,
  team,
  season,
  editable = false,
  swapped = false,
  onPlayerClick,
}) => {
  const { actualTheme } = useTheme();
  const teamColor = playerUtils.getTeamColor(
    player.isRookie ? team : player.team || team,
    season,
    actualTheme
  );
  const pct =
    typeof player.warPercentile === "number" ? player.warPercentile : null;
  const { text: valueColor, fill } = percentileColors(pct);
  return (
    <div
      onClick={() => onPlayerClick?.(player)}
      className={`group flex items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 transition-all duration-200 light:border-slate-200/50 light:bg-gray-100/50 ${
        onPlayerClick
          ? "cursor-pointer hover:bg-white/[0.08] light:hover:bg-gray-100"
          : ""
      } ${editable ? "ring-1 ring-inset ring-sky-400/20" : ""}`}
    >
      <div className="relative shrink-0">
        <img
          src={
            player.isRookie
              ? playerUtils.getDefaultHeadshot()
              : playerUtils.getPlayerHeadshot(
                  player.playerId,
                  player.team || team,
                  season
                )
          }
          alt={player.name || "Player"}
          className="h-9 w-9 rounded-full object-cover"
          style={{ backgroundColor: teamColor }}
          onError={(e) => {
            e.target.src = playerUtils.getDefaultHeadshot();
          }}
        />
        {swapped && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white shadow">
            <Repeat2 className="h-2.5 w-2.5" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-white light:text-gray-900">
            {player.name || "Unknown"}
          </span>
          <span className={`shrink-0 text-sm font-bold ${valueColor}`}>
            {pct != null ? pct.toFixed(1) : "—"}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-gray-400 light:text-gray-500">
            LP
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06] light:bg-gray-200">
            <div
              className={`h-1.5 rounded-full bg-gradient-to-r ${fill} gauge-fill`}
              style={{
                width: `${pct != null ? Math.min(100, Math.max(0, pct)) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
