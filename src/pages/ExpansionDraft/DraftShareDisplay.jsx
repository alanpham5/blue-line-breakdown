import { playerUtils } from "../../utils/playerUtils";
import { seasonSpan } from "./draftShared";

// Fixed 1200px-wide composition captured by ShareableModal's html2canvas layer.
// Mirrors the native team-profile share cards, driven by the analyzed profile.
export const DraftShareDisplay = ({ draft, profile, actualTheme = "dark" }) => {
  const { stats, predictedRecord, draftSummary, roster } = profile;
  const topPicks = [...roster]
    .sort((a, b) => (b.points ?? b.savePct ?? 0) - (a.points ?? a.savePct ?? 0))
    .slice(0, 12);

  return (
    <div
      style={{ width: 1200 }}
      className="bg-[#0b1220] p-12 text-white light:bg-white light:text-gray-900"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold uppercase tracking-[0.3em] text-amber-300">
            Expansion Draft · {seasonSpan(draft.season)}
          </p>
          <h1 className="mt-2 text-6xl font-bold tracking-[-0.04em]">
            {draft.teamName}
          </h1>
        </div>
        <img
          src={actualTheme === "light" ? "/blb-light.png" : "/blb-dark.png"}
          alt="Blue Line Breakdown"
          className="h-20 w-20 object-contain"
        />
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <ShareStat label="Predicted Record" value={predictedRecord.display} />
        <ShareStat
          label="Offense Rating"
          value={`${(stats.offense_rating ?? 0).toFixed(0)}%`}
        />
        <ShareStat
          label="Defense Rating"
          value={`${(stats.defense_rating ?? 0).toFixed(0)}%`}
        />
        <ShareStat
          label="Forwards / Defense / Goalies"
          value={`${draftSummary.counts.forwards}/${draftSummary.counts.defensemen}/${draftSummary.counts.goalies}`}
        />
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        {topPicks.map((p) => (
          <div
            key={`${p.team}-${p.playerId}`}
            className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 light:bg-slate-100"
          >
            <img
              src={playerUtils.getPlayerHeadshot(
                p.playerId,
                p.team,
                draft.season
              )}
              alt={p.name}
              className="h-12 w-12 rounded-full object-cover bg-[var(--team-color)]"
              style={{
                "--team-color": playerUtils.getTeamColor(p.team, draft.season),
              }}
              crossOrigin="anonymous"
              onError={(e) => (e.target.src = playerUtils.getDefaultHeadshot())}
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">
                {p.position} - {p.name}
              </p>
              <p className="text-sm text-gray-400 light:text-gray-500">
                {p.position === "G"
                  ? `${(p.savePct ?? 0).toFixed(3)} SV%`
                  : `${p.points ?? 0} PTS`}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        blue-line-breakdown.vercel.app · Build your own expansion franchise
      </p>
    </div>
  );
};

const ShareStat = ({ label, value }) => (
  <div className="rounded-2xl bg-white/5 p-5 text-center light:bg-slate-100">
    <p className="text-4xl font-bold tabular-nums">{value}</p>
    <p className="mt-1 text-sm font-medium uppercase tracking-[0.15em] text-gray-400 light:text-gray-500">
      {label}
    </p>
  </div>
);
