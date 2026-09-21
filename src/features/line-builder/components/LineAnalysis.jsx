import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Users,
  History,
  Target,
  Link2,
  ArrowUpRight,
} from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
const TRAIT_STYLES = {
  strength: {
    chip: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200 light:border-emerald-600/25 light:bg-emerald-500/10 light:text-emerald-700",
    icon: Sparkles,
  },
  risk: {
    chip: "border-rose-400/25 bg-rose-500/10 text-rose-200 light:border-rose-600/25 light:bg-rose-500/10 light:text-rose-700",
    icon: ShieldAlert,
  },
  style: {
    chip: "border-sky-400/25 bg-sky-500/10 text-sky-200 light:border-sky-600/25 light:bg-sky-500/10 light:text-sky-700",
    icon: Target,
  },
};
const ratingTone = (value) => {
  if (typeof value !== "number") return "text-gray-300 light:text-gray-600";
  if (value >= 66) return "text-emerald-300 light:text-emerald-600";
  if (value >= 40) return "text-amber-300 light:text-amber-600";
  return "text-rose-400 light:text-rose-600";
};
const ratingFill = (value) => {
  if (typeof value !== "number") return "from-gray-500 to-gray-400";
  if (value >= 66) return "from-emerald-500 to-green-400";
  if (value >= 40) return "from-amber-500 to-yellow-400";
  return "from-rose-500 to-red-400";
};
const format = (value, digits = 1) =>
  typeof value === "number" ? value.toFixed(digits) : "—";
const Section = ({ icon, title, subtitle, children }) => (
  <div className="liquid-glass-strong rounded-[28px] p-4 sm:p-5">
    <div className="mb-3.5 flex items-start gap-2">
      {icon}
      <div className="min-w-0">
        <h3 className="text-lg font-bold tracking-display text-white light:text-gray-900">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-400 light:text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {children}
  </div>
);
const Meter = ({ label, value, suffix = "" }) => (
  <div>
    <div className="mb-1 flex items-center justify-between gap-2">
      <span className="truncate text-xs font-semibold uppercase tracking-wide text-gray-400 light:text-slate-500">
        {label}
      </span>
      <span className={`text-sm font-bold ${ratingTone(value)}`}>
        {format(value)}
        {suffix}
      </span>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] light:bg-gray-200">
      <div
        className={`h-1.5 rounded-full bg-gradient-to-r ${ratingFill(value)} gauge-fill`}
        style={{
          width: `${typeof value === "number" ? Math.min(100, Math.max(0, value)) : 0}%`,
        }}
      />
    </div>
  </div>
);
const StatTile = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center light:border-slate-200/60 light:bg-gray-100/60">
    <div className="text-xl font-extrabold text-white light:text-gray-900">
      {value}
    </div>
    <div className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-gray-400 light:text-slate-500">
      {label}
    </div>
    {hint && (
      <div className="mt-1 text-[0.62rem] text-gray-500 light:text-slate-400">
        {hint}
      </div>
    )}
  </div>
);
export const LineAnalysis = ({
  analysis,
  season,
  onPlayerClick,
  onLoadUnit,
}) => {
  const { actualTheme } = useTheme();
  const { identity, ratings, quality, traits, chemistry, projection } =
    analysis;
  const comparables = analysis.comparables || [];
  const history = analysis.playedTogether || [];
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="liquid-glass-strong rounded-[32px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-sky-300 light:text-sky-600">
              Line Identity
            </span>
            <h2 className="mt-2 text-[2rem] font-extrabold leading-tight tracking-display text-white light:text-gray-900">
              {identity.label}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-gray-300 light:text-slate-600">
              {identity.headline}
            </p>
            <p className="mt-2 text-xs text-gray-400 light:text-slate-500">
              {format(identity.confidence, 0)}% confidence · closest alternative
              read: {identity.secondaryLabel}
            </p>
          </div>
          <div className="shrink-0 rounded-[24px] border border-white/5 bg-white/[0.04] px-5 py-4 text-center light:border-slate-200/60 light:bg-gray-100/60">
            <div
              className={`text-4xl font-extrabold ${ratingTone(quality.overall)}`}
            >
              {format(quality.overall)}
            </div>
            <div className="mt-1 text-[0.62rem] font-bold uppercase tracking-wide text-gray-400 light:text-slate-500">
              Overall
            </div>
            <div className="mt-1.5 text-[0.68rem] font-bold text-white light:text-gray-900">
              {quality.tier}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(analysis.breakdown || []).map((axis) => (
            <div
              key={axis.key}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 light:border-slate-200/60 light:bg-gray-100/60"
            >
              <span className="text-[0.62rem] font-bold uppercase tracking-wide text-gray-400 light:text-slate-500">
                {axis.label}
              </span>
              <div
                className={`mt-1 text-2xl font-extrabold ${ratingTone(axis.value)}`}
              >
                {format(axis.value)}
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] light:bg-gray-200">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${ratingFill(axis.value)} gauge-fill`}
                  style={{
                    width: `${Math.min(100, Math.max(0, axis.value))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-5">
        <Section
          icon={
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-sky-300 light:text-sky-600" />
          }
          title="Who does what"
          subtitle="Archetype and the job each player takes on this unit"
        >
          <div className="space-y-2">
            {analysis.players.map((player) => (
              <button
                key={player.playerId}
                type="button"
                onClick={() => onPlayerClick?.(player)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition hover:bg-white/[0.07] light:border-slate-200/60 light:bg-gray-100/60 light:hover:bg-gray-100"
              >
                <img
                  src={playerUtils.getPlayerHeadshot(
                    player.playerId,
                    player.team,
                    season
                  )}
                  alt={player.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
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
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-white light:text-gray-900">
                    {player.name}
                  </div>
                  <div className="truncate text-[0.68rem] text-gray-400 light:text-slate-500">
                    {player.team} · {player.role}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-sky-300 light:text-sky-600">
                    {player.lineRole}
                  </div>
                  <div
                    className={`mt-1 text-sm font-extrabold ${ratingTone(player.impactPercentile)}`}
                  >
                    {format(player.impactPercentile)}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <StatTile label="Star Power" value={format(quality.starPower)} />
            <StatTile label="Weakest Link" value={format(quality.floor)} />
            <StatTile label="Balance" value={format(quality.balance)} />
          </div>
        </Section>

        <Section
          icon={
            <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300 light:text-emerald-600" />
          }
          title="Projected 5-on-5 results"
          subtitle={
            projection
              ? `Learned from ${projection.sampleCount} observed ${season} combinations`
              : "Not enough observed combinations to project results"
          }
        >
          {projection ? (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatTile
                  label="xGF%"
                  value={`${format(projection.xGoalsForPercentage)}%`}
                />
                <StatTile
                  label="xGF/60"
                  value={format(projection.xGoalsFor60, 2)}
                />
                <StatTile
                  label="xGA/60"
                  value={format(projection.xGoalsAgainst60, 2)}
                />
                <StatTile
                  label="Hits/60"
                  value={format(projection.hitsFor60, 2)}
                />
              </div>
              <div className="mt-3">
                <Meter
                  label="Comparable support"
                  value={projection.confidence}
                />
                <p className="mt-2 text-xs text-gray-400 light:text-slate-500">
                  How closely real lines resemble this build. Unusual
                  combinations score low — the projection then leans on style
                  neighbours rather than near-matches.
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 light:text-slate-500">
              Results are rated from player profiles only for this season.
            </p>
          )}
          <div className="mt-4 border-t border-white/10 pt-3 light:border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 light:text-slate-500">
              Deployment
            </h4>
            <p className="mt-1.5 text-sm text-gray-200 light:text-slate-700">
              {quality.usage}
            </p>
            {quality.specialTeams?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quality.specialTeams.map((unit) => (
                  <span
                    key={unit}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-semibold text-gray-300 light:border-slate-200 light:text-slate-600"
                  >
                    {unit} candidate
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-[0.68rem] text-gray-500 light:text-slate-400">
              Rating evidence: {quality.evidence}
            </p>
          </div>
        </Section>
      </div>

      <Section
        icon={
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-300 light:text-amber-600" />
        }
        title="Traits"
        subtitle="What stands out — and what breaks down — about this combination"
      >
        {traits.length === 0 ? (
          <p className="text-sm text-gray-400 light:text-slate-500">
            No trait crosses a meaningful threshold. This is an average unit in
            every direction.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {traits.map((trait) => {
              const style = TRAIT_STYLES[trait.kind] || TRAIT_STYLES.style;
              const Icon = style.icon;
              return (
                <div
                  key={trait.name}
                  className={`rounded-2xl border p-3 ${style.chip}`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-bold">{trait.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-300 light:text-slate-600">
                    {trait.detail}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-5">
        <Section
          icon={
            <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-300 light:text-violet-600" />
          }
          title="Fit & chemistry"
          subtitle={`Structural fit score ${format(chemistry.score)}`}
        >
          <div className="space-y-2.5">
            {chemistry.components.map((component) => (
              <Meter
                key={component.label}
                label={component.label}
                value={component.value}
              />
            ))}
          </div>
          <ul className="mt-3 space-y-1.5">
            {chemistry.notes.map((note) => (
              <li
                key={note}
                className="flex gap-2 text-sm text-gray-300 light:text-slate-600"
              >
                <span className="text-gray-500 light:text-slate-400">•</span>
                {note}
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-white/10 pt-3 light:border-slate-200">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 light:text-slate-500">
              Identity read
            </h4>
            <div className="space-y-2">
              {identity.mix.map((entry) => (
                <Meter
                  key={entry.label}
                  label={entry.label}
                  value={entry.score}
                />
              ))}
            </div>
          </div>
        </Section>

        <Section
          icon={
            <History className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300 light:text-cyan-600" />
          }
          title="Lines that look like this"
          subtitle="Real MoneyPuck combinations with the closest style profile — tap one to build it"
        >
          {comparables.length === 0 ? (
            <p className="text-sm text-gray-400 light:text-slate-500">
              No observed combinations to compare against.
            </p>
          ) : (
            <div className="space-y-2">
              {comparables.map((comparable) => (
                <button
                  key={comparable.lineId}
                  type="button"
                  onClick={() =>
                    onLoadUnit?.({
                      season: comparable.season,
                      playerIds: comparable.playerIds,
                    })
                  }
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition hover:bg-white/[0.07] light:border-slate-200/60 light:bg-gray-100/60 light:hover:bg-gray-100"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white light:text-gray-900">
                      {comparable.name}
                    </div>
                    <div className="flex items-center gap-1 text-[0.68rem] text-gray-400 light:text-slate-500">
                      {comparable.team} · {comparable.gamesPlayed} GP ·{" "}
                      {format(comparable.icetimeMinutes, 0)} min
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className={`text-sm font-bold ${ratingTone(comparable.xgPercentage)}`}
                    >
                      {format(comparable.xgPercentage)}% xGF
                    </div>
                    <div className="text-[0.62rem] text-gray-400 light:text-slate-500">
                      {format(comparable.similarity, 0)}% match
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {history.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-3 light:border-slate-200">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 light:text-slate-500">
                This exact combination has played together
              </h4>
              <div className="space-y-2">
                {history.slice(0, 4).map((entry) => (
                  <button
                    key={`${entry.season}-${entry.team}`}
                    type="button"
                    disabled={entry.season === analysis.season}
                    onClick={() =>
                      onLoadUnit?.({
                        season: entry.season,
                        playerIds: analysis.players.map(
                          (player) => player.playerId
                        ),
                      })
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition enabled:hover:bg-white/[0.07] disabled:cursor-default light:border-slate-200/60 light:bg-gray-100/60 light:enabled:hover:bg-gray-100"
                  >
                    <div className="text-sm font-semibold text-white light:text-gray-900">
                      {playerUtils.formatSeason(entry.season)} · {entry.team}
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${ratingTone(entry.xGoalsForPercentage)}`}
                      >
                        {format(entry.xGoalsForPercentage)}% xGF
                      </div>
                      <div className="text-[0.62rem] text-gray-400 light:text-slate-500">
                        {entry.gamesPlayed} GP ·{" "}
                        {format(entry.icetimeMinutes, 0)} min together
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};
