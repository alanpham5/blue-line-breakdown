import { useMemo } from "react";
import { Lock, Shield, Check } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { seasonSpan } from "features/expansion-draft/utils/draftShared";

const Cell = ({ children, strong }) => (
  <td
    className={`px-2 py-2 text-center tabular-nums ${strong ? "font-semibold text-white light:text-gray-900" : "text-gray-300 light:text-gray-600"}`}
  >
    {children}
  </td>
);

const SkaterTable = ({ players, season, rosterTeam, isMobile, pickedId, onPick }) => (
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr className="text-left text-[0.7rem] text-gray-500">
        <th className="px-2 py-2">Player</th>
        {!isMobile && <th className="px-2 py-2 text-center">Age</th>}
        <th className="px-2 py-2 text-center">G</th>
        <th className="px-2 py-2 text-center">A</th>
        <th className="px-2 py-2 text-center">Pts</th>
        <th className="px-2 py-2 text-center">+/-</th>
      </tr>
    </thead>
    <tbody>
      {players.map((p) => {
        const locked = p.protected;
        const isExempt = p.exempt;
        const picked = p.playerId === pickedId;
        return (
          <tr
            key={p.playerId ?? p.name}
            onClick={() => !locked && !isExempt && !picked && onPick(p)}
            className={`border-t border-white/5 light:border-slate-200 transition-colors ${locked || isExempt ? "opacity-40" : picked ? "bg-emerald-500/10" : "cursor-pointer hover:bg-white/5 light:hover:bg-slate-900/5"}`}
          >
            <td className="px-2 py-2">
              <div className="flex items-center gap-2">
                <img
                  src={playerUtils.getPlayerHeadshot(p.playerId, rosterTeam, season)}
                  alt={p.name}
                  className="h-7 w-7 shrink-0 rounded-full object-cover bg-[var(--team-color)]"
                  style={{
                    "--team-color": playerUtils.getTeamColor(rosterTeam, season),
                  }}
                  onError={(e) =>
                    (e.target.src = playerUtils.getDefaultHeadshot())
                  }
                />
                <span className="font-medium text-white light:text-gray-900 truncate max-w-[120px] sm:max-w-full block">
                  {p.name}
                </span>
                {locked && (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                )}
                {isExempt && (
                  <Shield className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                )}
                {picked && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                )}
              </div>
            </td>
            {!isMobile && (
              <td className="px-2 py-2 text-center text-gray-400">
                {p.age ?? "–"}
              </td>
            )}
            <Cell>{p.goals ?? 0}</Cell>
            <Cell>{p.assists ?? 0}</Cell>
            <Cell strong>{p.points ?? 0}</Cell>
            <Cell>
              {p.plusMinus > 0 ? `+${p.plusMinus}` : (p.plusMinus ?? 0)}
            </Cell>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const GoalieTable = ({ players, season, rosterTeam, isMobile, pickedId, onPick }) => (
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr className="text-left text-[0.7rem] text-gray-500">
        <th className="px-2 py-2">Player</th>
        {!isMobile && <th className="px-2 py-2 text-center">Age</th>}
        <th className="px-2 py-2 text-center">Sv%</th>
        <th className="px-2 py-2 text-center">Gaa</th>
        <th className="px-2 py-2 text-center">Gp</th>
        <th className="px-2 py-2 text-center">Saves</th>
      </tr>
    </thead>
    <tbody>
      {players.map((p) => {
        const locked = p.protected;
        const isExempt = p.exempt;
        const picked = p.playerId === pickedId;
        return (
          <tr
            key={p.playerId ?? p.name}
            onClick={() => !locked && !isExempt && !picked && onPick(p)}
            className={`border-t border-white/5 light:border-slate-200 transition-colors ${locked || isExempt ? "opacity-40" : picked ? "bg-emerald-500/10" : "cursor-pointer hover:bg-white/5 light:hover:bg-slate-900/5"}`}
          >
            <td className="px-2 py-2">
              <div className="flex items-center gap-2">
                <img
                  src={playerUtils.getPlayerHeadshot(p.playerId, rosterTeam, season)}
                  alt={p.name}
                  className="h-7 w-7 shrink-0 rounded-full object-cover bg-[var(--team-color)]"
                  style={{
                    "--team-color": playerUtils.getTeamColor(rosterTeam, season),
                  }}
                  onError={(e) =>
                    (e.target.src = playerUtils.getDefaultHeadshot())
                  }
                />
                <span className="font-medium text-white light:text-gray-900 truncate max-w-[120px] sm:max-w-full block">
                  {p.name}
                </span>
                {locked && (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                )}
                {isExempt && (
                  <Shield className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                )}
                {picked && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                )}
              </div>
            </td>
            {!isMobile && (
              <td className="px-2 py-2 text-center text-gray-400">
                {p.age ?? "–"}
              </td>
            )}
            <Cell strong>{(p.savePct ?? 0).toFixed(3)}</Cell>
            <Cell>{(p.gaa ?? 0).toFixed(2)}</Cell>
            <Cell>{p.gamesPlayed ?? 0}</Cell>
            <Cell>{p.saves ?? 0}</Cell>
          </tr>
        );
      })}
    </tbody>
  </table>
);

export const RosterTable = ({ roster, season, isMobile, pickedId, onPick }) => {
  const players = roster.protection.players;
  const forwards = useMemo(
    () =>
      [...players]
        .filter((p) => p.position === "F")
        .sort((a, b) => (b.points || 0) - (a.points || 0)),
    [players]
  );
  const defensemen = useMemo(
    () =>
      [...players]
        .filter((p) => p.position === "D")
        .sort((a, b) => (b.points || 0) - (a.points || 0)),
    [players]
  );
  const goalies = useMemo(
    () =>
      [...players]
        .filter((p) => p.position === "G")
        .sort((a, b) => (b.savePct || 0) - (a.savePct || 0)),
    [players]
  );
  return (
    <div className="space-y-6">
      <div className="liquid-glass liquid-glass-animate rounded-[28px] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white light:text-gray-900">
          {roster.teamName}
          <span className="ml-2 text-xs font-medium text-gray-500">
            {seasonSpan(season)} · {roster.protection.scheme} protection
          </span>
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 light:text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-gray-500" />
            Protected
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-sky-400 light:text-sky-600" />
            Exempt
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="liquid-glass liquid-glass-animate rounded-[28px] p-4 sm:p-5 flex flex-col">
          <h4 className="mb-3 text-sm font-bold text-cyan-300 light:text-cyan-600 border-b border-white/5 pb-2 light:border-slate-200">
            Forwards
          </h4>
          <div className="overflow-x-auto flex-1">
            <SkaterTable
              players={forwards}
              season={season}
              rosterTeam={roster.team}
              isMobile={isMobile}
              pickedId={pickedId}
              onPick={onPick}
            />
          </div>
        </div>

        <div className="liquid-glass liquid-glass-animate rounded-[28px] p-4 sm:p-5 flex flex-col">
          <h4 className="mb-3 text-sm font-bold text-cyan-300 light:text-cyan-600 border-b border-white/5 pb-2 light:border-slate-200">
            Defensemen
          </h4>
          <div className="overflow-x-auto flex-1">
            <SkaterTable
              players={defensemen}
              season={season}
              rosterTeam={roster.team}
              isMobile={isMobile}
              pickedId={pickedId}
              onPick={onPick}
            />
          </div>
        </div>
      </div>

      <div className="liquid-glass liquid-glass-animate rounded-[28px] p-4 sm:p-5">
        <h4 className="mb-3 text-sm font-bold text-cyan-300 light:text-cyan-600 border-b border-white/5 pb-2 light:border-slate-200">
          Goalies
        </h4>
        <div className="overflow-x-auto">
          <GoalieTable
            players={goalies}
            season={season}
            rosterTeam={roster.team}
            isMobile={isMobile}
            pickedId={pickedId}
            onPick={onPick}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Tap an available row to claim a player.
      </p>
    </div>
  );
};
