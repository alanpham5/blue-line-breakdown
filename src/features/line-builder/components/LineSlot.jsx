import { Loader2, Plus, X } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
const impactColor = (pct) => {
  if (typeof pct !== "number") return "text-gray-300 light:text-gray-600";
  if (pct >= 66) return "text-emerald-300 light:text-emerald-600";
  if (pct >= 40) return "text-amber-300 light:text-amber-600";
  return "text-rose-400 light:text-rose-600";
};
export const LineSlot = ({
  slotLabel,
  player,
  season,
  pending = false,
  onPick,
  onRemove,
}) => {
  const { actualTheme } = useTheme();
  if (!player && pending) {
    return (
      <div className="flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-2 rounded-[24px] border border-white/5 bg-white/[0.04] p-4 light:border-slate-200/60 light:bg-gray-100/60">
        <Loader2 className="h-5 w-5 animate-spin text-sky-300 light:text-sky-600" />
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400 light:text-slate-500">
          {slotLabel}
        </span>
      </div>
    );
  }
  if (!player) {
    return (
      <button
        type="button"
        onClick={onPick}
        className="flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-white/15 bg-white/[0.02] p-4 transition hover:border-sky-400/40 hover:bg-white/[0.06] light:border-slate-300 light:bg-slate-900/[0.02] light:hover:bg-slate-900/5"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 light:bg-slate-900/10 light:text-slate-600">
          <Plus className="h-5 w-5" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400 light:text-slate-500">
          {slotLabel}
        </span>
      </button>
    );
  }
  const impact =
    typeof player.impactPercentile === "number"
      ? player.impactPercentile
      : player.warPercentile;
  return (
    <div className="relative flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-2 rounded-[24px] border border-white/5 bg-white/[0.04] p-4 text-center light:border-slate-200/60 light:bg-gray-100/60">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${player.name}`}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white light:text-slate-500 light:hover:bg-slate-900/10"
      >
        <X className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onPick}
        className="flex flex-col items-center gap-2"
      >
        <img
          src={playerUtils.getPlayerHeadshot(
            player.playerId,
            player.team,
            season
          )}
          alt={player.name}
          className="h-12 w-12 rounded-full object-cover"
          style={{
            backgroundColor: playerUtils.getTeamColor(
              player.team,
              season,
              actualTheme
            ),
          }}
          onError={(event) => {
            event.target.src = playerUtils.getDefaultHeadshot();
          }}
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white light:text-gray-900">
            {player.name}
          </div>
          <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-gray-400 light:text-slate-500">
            {player.team || "—"}
            {player.lineRole ? ` · ${player.lineRole}` : ""}
          </div>
        </div>
        <span className={`text-sm font-extrabold ${impactColor(impact)}`}>
          {typeof impact === "number" ? impact.toFixed(1) : "—"}
        </span>
      </button>
    </div>
  );
};
