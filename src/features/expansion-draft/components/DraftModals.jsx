import { X, ChevronRight, Trophy, Loader2 } from "lucide-react";
import { playerUtils } from "utils/playerUtils";

export const ModalShell = ({ children, onClose }) => (
  <div
    onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm light:bg-black/30"
  >
    <div className="liquid-glass-strong relative w-full max-w-md rounded-[32px] p-6 sm:p-8">
      {children}
    </div>
  </div>
);

export const ConfirmModal = ({ confirm, season, onCancel, onConfirm }) => {
  const { player } = confirm;
  const teamColor = playerUtils.getTeamColor(confirm.team, season);
  return (
    <ModalShell onClose={onCancel}>
      <button
        type="button"
        onClick={onCancel}
        className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
        aria-label="Cancel"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="flex flex-col items-center text-center">
        <div
          className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg backdrop-blur-sm mb-4"
          style={{
            background: playerUtils.getSurfaceGradient(teamColor, "dark"),
            boxShadow: `0 0 0 4px ${teamColor}20`,
          }}
        >
          <img
            src={playerUtils.getPlayerHeadshot(
              player.playerId,
              confirm.team,
              season
            )}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = playerUtils.getDefaultHeadshot())}
          />
        </div>
        <h3 className="text-xl font-bold text-white light:text-gray-900">
          Draft {player.name}?
        </h3>
        <p className="mt-1 text-sm text-gray-400 light:text-gray-500">
          {player.position === "G"
            ? `${(player.savePct ?? 0).toFixed(3)} Sv% · ${(player.gaa ?? 0).toFixed(2)} Gaa · ${player.gamesPlayed} Gp`
            : `${player.goals}G · ${player.assists}A · ${player.points} Pts`}
          {player.age ? ` · Age ${player.age}` : ""}
        </p>
        <div className="mt-6 flex w-full gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-white/10 light:border-slate-300 light:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 btn-search-primary !min-h-[46px] py-2.5 text-sm"
          >
            Confirm <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export const NameModal = ({
  teamName,
  setTeamName,
  analyzing,
  error,
  title,
  description,
  confirmLabel,
  loadingLabel,
  onCancel,
  onConfirm,
}) => (
  <ModalShell onClose={onCancel}>
    <button
      type="button"
      onClick={onCancel}
      disabled={analyzing}
      className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
      aria-label="Cancel"
    >
      <X className="h-5 w-5" />
    </button>
    <div className="text-center">
      <Trophy className="mx-auto h-10 w-10 text-amber-300" />
      <h3 className="mt-3 text-xl font-bold text-white light:text-gray-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-400 light:text-gray-500">
        {description}
      </p>
    </div>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
      className="mt-5"
    >
      <input
        autoFocus
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        maxLength={40}
        placeholder="e.g. Atlanta Thrashers"
        disabled={analyzing}
        className="app-field px-4 py-3.5 text-base text-white light:text-gray-900 disabled:opacity-60"
      />
      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        className="btn-search-primary mt-4 w-full"
        disabled={!teamName.trim() || analyzing}
      >
        {analyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {loadingLabel}
          </>
        ) : (
          confirmLabel
        )}
      </button>
    </form>
  </ModalShell>
);
