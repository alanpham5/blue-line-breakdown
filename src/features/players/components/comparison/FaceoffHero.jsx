import { ArrowLeftRight, Loader2, Plus, X } from "lucide-react";
import { AppSelect } from "components/ui/AppSelect";
import { getArchetypeBadge } from "features/players/components/ArchetypeBadge";
import { useTheme } from "providers/ThemeContext";
import { playerUtils } from "utils/playerUtils";
import {
  SubjectMarker,
  compactSeason,
  formatPercentile,
  getImpact,
  subjectColor,
  subjectInk,
  subjectTint,
} from "./shared";

const RING_RADIUS = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const headshotSource = (player, shareable) => {
  const source = playerUtils.getPlayerHeadshot(
    player.playerId,
    player.team,
    player.season
  );
  return shareable ? playerUtils.getCorsWrappedUrl(source) : source;
};

const ImpactPortrait = ({ index, player, shareable }) => {
  const impact = getImpact(player) ?? 0;
  const offset = RING_CIRCUMFERENCE * (1 - Math.min(100, impact) / 100);

  return (
    <div
      className="relative mx-auto h-24 w-24 sm:h-36 sm:w-36 export:h-36 export:w-36"
      role="img"
      aria-label={`${player.name}, ${formatPercentile(impact)} impact percentile`}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--comparison-track)"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke={subjectColor(index)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className="transition-[stroke-dashoffset] duration-[1200ms] ease-out"
        />
      </svg>
      <div className="absolute inset-[11%] overflow-hidden rounded-full bg-[#111216] light:bg-white">
        <img
          src={headshotSource(player, shareable)}
          crossOrigin={shareable ? "anonymous" : undefined}
          alt=""
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = playerUtils.getDefaultHeadshot();
          }}
        />
      </div>
    </div>
  );
};

const SeasonControl = ({ entry, onSeasonChange, shareable }) => {
  const { player, availableSeasons } = entry.data;
  if (shareable) {
    return (
      <div className="text-base font-bold tabular-nums text-white">
        {compactSeason(player.season)}
      </div>
    );
  }
  return (
    <AppSelect
      aria-label={`Season for ${player.name}`}
      value={String(player.season)}
      onChange={(event) => onSeasonChange(event.target.value)}
      className="app-field w-full px-3 py-2 pr-8 text-xs font-semibold normal-case tracking-normal text-white light:text-gray-900 sm:text-sm"
    >
      {(availableSeasons || []).map((season) => (
        <option key={season} value={season}>
          {compactSeason(season)}
        </option>
      ))}
    </AppSelect>
  );
};

const EmptyHalf = ({ index, loading }) => (
  <div className="liquid-glass-strong flex min-h-[17rem] flex-col items-center justify-center rounded-[28px] px-3 text-center sm:min-h-[22rem]">
    {loading ? (
      <Loader2
        className="h-7 w-7 animate-spin"
        style={{ color: subjectColor(index) }}
      />
    ) : (
      <>
        <span
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: subjectTint(index, 16),
            color: subjectColor(index),
          }}
        >
          <Plus className="h-5 w-5" />
        </span>
        <span className="text-base font-semibold text-gray-200 light:text-gray-800">
          Add a player
        </span>
      </>
    )}
  </div>
);

const PlayerHalf = ({ entry, index, onRemove, onSeasonChange, shareable }) => {
  const { actualTheme } = useTheme();

  if (!entry?.data) {
    return <EmptyHalf index={index} loading={Boolean(entry?.loading)} />;
  }

  const { player } = entry.data;
  const archetypes = (player.archetypes || [])
    .map(getArchetypeBadge)
    .slice(0, 3);
  const mirrored = index === 1;

  return (
    <article
      className="team-card-surface-strong liquid-glass-strong relative flex min-h-[17rem] min-w-0 flex-col items-center overflow-hidden rounded-[28px] px-3 pb-4 pt-5 text-center sm:min-h-[22rem] sm:px-6 sm:pt-7"
      style={{
        "--team-card-gradient": playerUtils.getTeamCardGradient(
          player.team,
          player.season,
          shareable ? "dark" : actualTheme
        ),
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 70% at ${mirrored ? "100%" : "0%"} 100%, ${subjectTint(index, 22)}, transparent 60%)`,
        }}
        aria-hidden="true"
      />
      {!shareable && (
        <button
          type="button"
          onClick={onRemove}
          className={`absolute top-3 z-10 rounded-full bg-black/25 p-1.5 text-gray-300 transition hover:bg-black/40 hover:text-white light:bg-white/80 light:text-slate-600 light:hover:text-slate-900 ${mirrored ? "right-3" : "left-3"}`}
          aria-label={`Remove ${player.name} from comparison`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="relative">
        <ImpactPortrait index={index} player={player} shareable={shareable} />
        <div
          className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-baseline gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums tracking-display shadow-lg sm:px-3 sm:text-lg"
          style={{
            backgroundColor: subjectColor(index),
            color: subjectInk(index),
          }}
        >
          {formatPercentile(getImpact(player))}
          <span className="text-[0.6rem] font-semibold tracking-normal opacity-75 sm:text-xs">
            impact
          </span>
        </div>
      </div>

      <div className="relative mt-6 flex min-h-[2.6rem] w-full items-center justify-center sm:min-h-0">
        <h3 className="line-clamp-2 text-base font-bold leading-tight tracking-display text-white light:text-gray-900 sm:text-[1.65rem]">
          {player.name}
        </h3>
      </div>
      <p className="relative mt-1 text-xs font-medium text-gray-400 light:text-gray-600 sm:text-sm">
        {player.team} · {player.position}
        {player.age ? ` · ${player.age}` : ""}
      </p>
      {player.role && (
        <p
          className="relative mt-2 flex items-center justify-center gap-1.5 text-center text-xs font-semibold leading-snug sm:text-sm"
          style={{ color: subjectColor(index) }}
        >
          <SubjectMarker
            index={index}
            className="hidden h-2 w-2 sm:inline-block export:inline-block"
          />
          {player.role}
        </p>
      )}
      {archetypes.length > 0 && (
        <div className="relative mt-3 hidden flex-wrap justify-center gap-1.5 sm:flex export:flex">
          {archetypes.map(({ name, icon: Icon }) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-gray-200 light:text-gray-700"
              style={{ backgroundColor: subjectTint(index, 14) }}
            >
              {Icon && <Icon size={12} className="shrink-0" />}
              {name}
            </span>
          ))}
        </div>
      )}
      <div className="relative mt-auto w-full max-w-[12rem] pt-4">
        <SeasonControl
          entry={entry}
          onSeasonChange={onSeasonChange}
          shareable={shareable}
        />
      </div>
    </article>
  );
};

const Medallion = ({ onSwap, canSwap, isSamePlayer }) => (
  <div className="pointer-events-none absolute left-1/2 top-[38%] z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1c1c1e] text-sm font-bold tracking-display text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)] light:bg-white light:text-slate-900 light:shadow-[0_8px_24px_rgba(15,23,42,0.14)] sm:h-14 sm:w-14 sm:text-base">
      {isSamePlayer ? "→" : "vs"}
    </div>
    {canSwap && (
      <button
        type="button"
        onClick={onSwap}
        className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1c1c1e] text-gray-300 transition hover:text-white light:bg-white light:text-slate-600 light:shadow-[0_4px_12px_rgba(15,23,42,0.12)] light:hover:text-slate-900"
        aria-label="Swap sides"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

export const FaceoffHero = ({
  entries,
  isSamePlayer,
  onRemove,
  onSeasonChange,
  onSwap,
  shareable,
}) => (
  <div className="relative grid grid-cols-2 gap-2 sm:gap-4">
    {[0, 1].map((index) => (
      <PlayerHalf
        key={index}
        index={index}
        entry={entries[index]}
        onRemove={() => onRemove(index)}
        onSeasonChange={(season) => onSeasonChange(index, season)}
        shareable={shareable}
      />
    ))}
    <Medallion
      onSwap={onSwap}
      canSwap={!shareable && Boolean(onSwap) && entries.some(Boolean)}
      isSamePlayer={isSamePlayer}
    />
  </div>
);
