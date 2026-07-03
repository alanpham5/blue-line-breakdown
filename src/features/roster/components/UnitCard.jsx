import { RosterPlayerCard } from "features/roster/components/RosterPlayerCard";
const ratingColor = (value) => {
  if (typeof value !== "number") return "text-gray-300 light:text-gray-600";
  if (value >= 66) return "text-emerald-300 light:text-emerald-600";
  if (value >= 40) return "text-amber-300 light:text-amber-600";
  return "text-rose-400 light:text-rose-600";
};
const fmt = (v) => (typeof v === "number" ? v.toFixed(0) : "—");
const MiniStat = ({ label, value }) => (
  <div className="flex items-center gap-1">
    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 light:text-gray-500">
      {label}
    </span>
    <span className={`text-sm font-bold ${ratingColor(value)}`}>
      {fmt(value)}
    </span>
  </div>
);
export const UnitCard = ({
  label,
  unit,
  team,
  season,
  editable = false,
  swappedIds,
  onPlayerClick,
}) => {
  const r = unit.ratings || {};
  const cols =
    unit.players?.length >= 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";
  return (
    <div className="liquid-glass rounded-2xl p-3">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-300 light:text-gray-600">
          {label}
        </span>
        <div className="flex items-center gap-2.5">
          <MiniStat label="Off" value={r.offense} />
          <MiniStat label="Def" value={r.defense} />
          <MiniStat label="Phy" value={r.physicality} />
          <div className="flex items-center gap-1 border-l border-white/10 pl-2.5 light:border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 light:text-gray-500">
              Ovr
            </span>
            <span
              className={`text-lg font-extrabold ${ratingColor(r.overall)}`}
            >
              {fmt(r.overall)}
            </span>
          </div>
        </div>
      </div>
      <div className={`grid ${cols} gap-2`}>
        {unit.players?.map((player, i) => (
          <RosterPlayerCard
            key={`${player.playerId}-${i}`}
            player={player}
            team={team}
            season={season}
            editable={editable}
            swapped={!!swappedIds?.has(player.playerId)}
            onPlayerClick={() => onPlayerClick?.(player, i)}
          />
        ))}
      </div>
    </div>
  );
};
