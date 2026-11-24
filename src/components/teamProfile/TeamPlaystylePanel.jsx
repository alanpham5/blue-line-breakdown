import { Contact } from "lucide-react";
import { getOrdinal } from "utils/ordinal";

const PHASES = [
  { id: "withPuck", label: "With the Puck" },
  { id: "withoutPuck", label: "Without the Puck" },
];
const TAG_THRESHOLD = 25;
const SLIGHT_LEAN = 12;
const MAX_TAGS = 4;
const TOP_RANKS = 5;

const exportNudge = (shareable, pixels) =>
  shareable ? { "data-export-nudge": pixels } : {};

const clamp = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const hasScore = (value) => value !== null && value !== undefined;

const leanSide = (score) => {
  const distance = clamp(score) - 50;
  if (Math.abs(distance) < SLIGHT_LEAN) return null;
  return distance > 0 ? "right" : "left";
};

const topRank = (rank, side) =>
  rank && rank.value <= TOP_RANKS && (!side || rank.side === side)
    ? `(${getOrdinal(rank.value)})`
    : null;

const TAG_GROUPS = {
  shotLocation: "shooting",
  dActivation: "shooting",
};

const tagGroup = (scale) => TAG_GROUPS[scale.id] ?? scale.id;

const styleTags = (identity) => {
  const usedGroups = new Set();
  return identity
    .map((scale) => ({ scale, distance: Math.abs(clamp(scale.score) - 50) }))
    .filter(({ distance }) => distance >= 50 - TAG_THRESHOLD)
    .sort((a, b) => b.distance - a.distance)
    .filter(({ scale }) => {
      const group = tagGroup(scale);
      if (usedGroups.has(group)) return false;
      usedGroups.add(group);
      return true;
    })
    .slice(0, MAX_TAGS)
    .map(({ scale }) => ({
      id: scale.id,
      label: clamp(scale.score) > 50 ? scale.rightTag : scale.leftTag,
    }));
};

const poleClass = (active, shareable) =>
  active
    ? `font-bold text-emerald-300 ${shareable ? "" : "light:text-emerald-600"}`
    : `font-medium text-gray-400 ${shareable ? "" : "light:text-gray-500"}`;

const rankClass = (shareable) =>
  `shrink-0 font-bold text-emerald-200 ${shareable ? "" : "light:text-emerald-700"}`;

const GoalsMarker = ({ score, rank, shareable }) => (
  <div
    className="absolute -inset-y-0.5 -ml-[1.5px] w-[3px]"
    style={{ left: `${Math.min(98.5, Math.max(1.5, clamp(score)))}%` }}
  >
    <span
      className={`block h-full w-full rounded-full bg-white/75 ring-1 ring-black/25 ${shareable ? "" : "light:bg-slate-600/80 light:ring-white/60"}`}
    />
    <span
      className={`absolute bottom-full left-1/2 -ml-10 w-20 whitespace-nowrap text-center font-semibold leading-none text-gray-300 ${shareable ? "mb-1 text-xs" : "mb-px text-[0.6rem] light:text-slate-600"}`}
    >
      <span {...exportNudge(shareable, 4)}>
        Goals
        {rank && <span className={`ml-1 ${rankClass(shareable)}`}>{rank}</span>}
      </span>
    </span>
  </div>
);

const PoleLabel = ({
  label,
  active,
  rank,
  alignEnd,
  shareable,
  text,
  cell,
}) => (
  <span
    className={`flex items-baseline gap-1.5 whitespace-nowrap ${alignEnd ? "justify-end" : ""} ${text} ${cell} ${poleClass(active, shareable)}`}
    {...exportNudge(shareable, 8)}
  >
    <span>{label}</span>
    {rank && (
      <span
        className={`${rankClass(shareable)} ${shareable ? "text-base" : "text-[0.7rem] sm:text-xs"}`}
      >
        {rank}
      </span>
    )}
  </span>
);

const DivergingBar = ({ score, goalsScore, goalsRank, shareable }) => {
  const position = clamp(score);
  const rightward = position >= 50;
  return (
    <div className="relative">
      <div
        className={`relative h-2.5 w-full overflow-hidden rounded-full bg-[rgba(6,78,59,0.85)] backdrop-blur-sm ${shareable ? "" : "light:bg-slate-200"}`}
      >
        <div
          className={`absolute inset-y-0 rounded-full from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.18)] ${rightward ? "bg-gradient-to-r" : "bg-gradient-to-l"}`}
          style={{
            left: `${Math.min(50, position)}%`,
            width: `${Math.abs(position - 50)}%`,
          }}
        />
        <span
          className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/30 ${shareable ? "" : "light:bg-slate-400/60"}`}
        />
      </div>
      {hasScore(goalsScore) && (
        <GoalsMarker
          score={goalsScore}
          rank={goalsRank}
          shareable={shareable}
        />
      )}
    </div>
  );
};

const phasesGridClass = (shareable) =>
  shareable
    ? "grid grid-cols-[max-content_max-content_1fr_max-content_1rem_max-content_max-content_1fr_max-content] items-center gap-x-3 px-6 py-2"
    : "px-5 py-2 sm:grid sm:grid-cols-[max-content_max-content_1fr_max-content] sm:items-center sm:gap-x-3 sm:px-6 lg:grid-cols-[max-content_max-content_1fr_max-content_1rem_max-content_max-content_1fr_max-content]";

const phaseClass = (shareable, second) =>
  shareable
    ? `col-span-4 grid grid-cols-subgrid items-center ${second ? "col-start-6" : ""}`
    : `sm:col-span-4 sm:grid sm:grid-cols-subgrid sm:items-center ${second ? "lg:col-start-6" : ""}`;

const rowClass = (shareable) =>
  shareable
    ? "contents"
    : "grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 py-2 sm:contents";

const PlaystyleRow = ({ scale, shareable }) => {
  const side = leanSide(scale.score);
  const text = shareable ? "text-lg" : "text-xs sm:text-sm";
  const cell = shareable ? "py-2.5" : "sm:py-2";
  return (
    <div className={rowClass(shareable)}>
      <div
        className={`flex items-center gap-1.5 ${cell} ${shareable ? "" : "col-span-3 sm:col-span-1"}`}
      >
        <span
          className={`whitespace-nowrap font-semibold text-gray-100 ${shareable ? "text-xl" : "text-sm light:text-gray-700"}`}
          {...exportNudge(shareable, 9)}
        >
          {scale.label}
        </span>
      </div>
      <PoleLabel
        label={scale.leftLabel}
        active={side === "left"}
        rank={topRank(scale.rank, "left")}
        alignEnd
        shareable={shareable}
        text={text}
        cell={cell}
      />
      <div className={cell}>
        <DivergingBar
          score={scale.score}
          goalsScore={scale.goalsScore}
          goalsRank={topRank(scale.goalsRank)}
          shareable={shareable}
        />
      </div>
      <PoleLabel
        label={scale.rightLabel}
        active={side === "right"}
        rank={topRank(scale.rank, "right")}
        shareable={shareable}
        text={text}
        cell={cell}
      />
    </div>
  );
};

export const TeamPlaystylePanel = ({ identity, shareable = false }) => {
  const tags = styleTags(identity);
  return (
    <section
      className={`liquid-glass-strong force-dark-player-card overflow-hidden ${shareable ? "rounded-[28px]" : "rounded-[32px]"}`}
      aria-labelledby="team-playstyle-heading"
    >
      <div
        className={`flex flex-col gap-3 border-b border-white/[0.07] light:border-slate-200 sm:flex-row sm:items-center sm:justify-between ${shareable ? "px-6 py-3" : "px-5 py-3 sm:px-6 sm:py-3.5"}`}
      >
        <div className="flex items-center gap-3">
          <Contact className="h-7 w-7 shrink-0 text-emerald-300 light:text-emerald-600" />
          <h2
            id="team-playstyle-heading"
            className={`font-extrabold tracking-display text-white light:text-gray-900 ${shareable ? "shareable-icon-label text-[1.75rem]" : "text-2xl sm:text-3xl"}`}
          >
            Playstyle
          </h2>
        </div>
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 sm:justify-end">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className={`rounded-full bg-white/[0.05] font-semibold text-emerald-200 backdrop-blur-sm ${shareable ? "px-3.5 py-1.5 text-lg" : "px-2.5 py-1 text-xs light:bg-emerald-100 light:text-emerald-800 sm:text-sm"}`}
              >
                <span {...exportNudge(shareable, 6)}>{tag.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={phasesGridClass(shareable)}>
        {PHASES.map((phase, index) => (
          <div key={phase.id} className={phaseClass(shareable, index > 0)}>
            <h3
              className={`border-b border-white/[0.07] pb-1.5 pt-2 font-semibold uppercase tracking-wide text-gray-400 ${shareable ? "col-span-4 text-base" : "text-xs light:border-slate-200 light:text-gray-500 sm:col-span-4"}`}
            >
              {phase.label}
            </h3>
            {identity
              .filter((scale) => scale.phase === phase.id)
              .map((scale) => (
                <PlaystyleRow
                  key={scale.id}
                  scale={scale}
                  shareable={shareable}
                />
              ))}
          </div>
        ))}
      </div>
    </section>
  );
};
