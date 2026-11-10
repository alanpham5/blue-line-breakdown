import { ChevronRight, Info, Mountain } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip } from "components/ui/Tooltip";
import { getOrdinal } from "utils/ordinal";
import { getPercentileColor } from "utils/percentileColor";
import { playerUtils } from "utils/playerUtils";

const ZONE_SEGMENTS = [
  {
    key: "offensive",
    label: "Offensive",
    shortLabel: "O-Zone",
    color: "#0891b2",
  },
  { key: "neutral", label: "Neutral", shortLabel: "N-Zone", color: "#64748b" },
  {
    key: "defensive",
    label: "Defensive",
    shortLabel: "D-Zone",
    color: "#e11d48",
  },
];
const POWER_PLAY_COLOR = "#d97706";
const PENALTY_KILL_COLOR = "#7c3aed";

const formatMinutes = (minutes) => {
  const seconds = Math.round((Number(minutes) || 0) * 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

const exportNudge = (shareable, pixels) =>
  shareable ? { "data-export-nudge": pixels } : {};

const LeaguePercentile = ({ value, shareable }) =>
  value == null ? null : (
    <span
      className={`${shareable ? "text-xl" : "text-[0.8rem] md:text-sm"} whitespace-nowrap font-medium tabular-nums text-gray-400 light:text-gray-500`}
    >
      {getOrdinal(value)}
    </span>
  );

const SegmentBar = ({ segments, shareable }) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div
      className={`flex ${shareable ? "h-3.5" : "h-2.5"} w-full overflow-hidden rounded-full bg-white/[0.06] light:bg-slate-200`}
      role="img"
      aria-label={segments
        .map((segment) => `${segment.label}: ${segment.detail}`)
        .join(". ")}
    >
      {segments.map((segment) => (
        <div
          key={segment.label}
          className="transition-all duration-1000 ease-out"
          style={{
            width: `${total > 0 ? (segment.value / total) * 100 : 0}%`,
            background: segment.color,
          }}
        />
      ))}
    </div>
  );
};

const SegmentLegend = ({ segments, shareable }) => (
  <div
    className="mt-2 grid gap-2"
    style={{
      gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))`,
    }}
  >
    {segments.map((segment) => (
      <div
        key={segment.label}
        className="flex w-fit min-w-0 max-w-full flex-col items-center"
      >
        <div className="flex items-center gap-1 md:gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: segment.color }}
          />
          <span
            className="flex flex-wrap items-baseline gap-x-1 md:gap-x-1.5"
            {...exportNudge(shareable, 9)}
          >
            <span
              className={`${shareable ? "text-xl" : "text-[0.8rem] md:text-sm"} whitespace-nowrap font-semibold text-gray-200 light:text-gray-800`}
            >
              {segment.shortLabel && !shareable ? (
                <>
                  <span className="md:hidden">{segment.shortLabel}</span>
                  <span className="hidden md:inline">{segment.label}</span>
                </>
              ) : (
                segment.label
              )}
            </span>
            <LeaguePercentile
              value={segment.percentile}
              shareable={shareable}
            />
          </span>
        </div>
        <p
          className={`${shareable ? "text-2xl" : "text-base"} font-medium tabular-nums text-white light:text-gray-900`}
          {...exportNudge(shareable, 9)}
        >
          {segment.detail}
        </p>
      </div>
    ))}
  </div>
);

const SectionLabel = ({ children, shareable }) => (
  <p
    className={`${shareable ? "text-xl" : "text-sm"} font-semibold text-gray-400 light:text-gray-500`}
    {...exportNudge(shareable, 5)}
  >
    {children}
  </p>
);

const SegmentSection = ({ title, segments, shareable }) => (
  <div>
    <div className="mb-1.5">
      <SectionLabel shareable={shareable}>{title}</SectionLabel>
    </div>
    <SegmentBar segments={segments} shareable={shareable} />
    <SegmentLegend segments={segments} shareable={shareable} />
  </div>
);

const TeammateQuality = ({ title, value, percentile, shareable }) => {
  const quality = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-1.5">
          <SectionLabel shareable={shareable}>{title}</SectionLabel>
          <span {...exportNudge(shareable, 6)}>
            <LeaguePercentile value={percentile} shareable={shareable} />
          </span>
        </span>
        <span
          className={`${shareable ? "text-2xl" : "text-base"} font-bold tabular-nums`}
          style={{ color: getPercentileColor(quality) }}
          {...exportNudge(shareable, 9)}
        >
          {Math.round(quality)}
        </span>
      </div>
      <div
        className={`${shareable ? "h-3.5" : "h-2.5"} w-full overflow-hidden rounded-full bg-white/[0.06] light:bg-slate-200`}
        role="img"
        aria-label={`${title}: ${Math.round(quality)} average impact percentile`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{
            width: `${quality}%`,
            background: getPercentileColor(quality),
          }}
        />
      </div>
    </div>
  );
};

const TeammateHeadshot = ({ teammate, shareable }) => {
  const headshot = playerUtils.getPlayerHeadshot(
    teammate.playerId,
    teammate.team,
    teammate.season
  );
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full bg-zinc-950/55 ${
        shareable
          ? "h-[92px] w-[92px] border border-white/[0.06]"
          : "h-16 w-16 shadow-lg backdrop-blur-sm light:bg-slate-700/45 sm:h-20 sm:w-20"
      }`}
    >
      <img
        src={shareable ? playerUtils.getCorsWrappedUrl(headshot) : headshot}
        alt=""
        className="h-full w-full object-cover"
        onError={(event) => {
          event.target.src = playerUtils.getDefaultHeadshot();
        }}
      />
    </div>
  );
};

const Teammate = ({ teammate, isCareer, shareable }) => {
  const content = (
    <>
      <TeammateHeadshot teammate={teammate} shareable={shareable} />
      <span
        className={`${shareable ? "text-xl" : "text-sm"} font-bold leading-tight text-white light:text-gray-900`}
        {...exportNudge(shareable, 5)}
      >
        {teammate.name}
      </span>
    </>
  );
  const className = "flex min-w-0 flex-col items-center gap-1.5 text-center";
  if (shareable) return <div className={className}>{content}</div>;
  return (
    <Link
      to={playerUtils.playerProfilePath(
        teammate.playerId,
        isCareer ? null : teammate.season
      )}
      className={`${className} rounded-xl transition-opacity hover:opacity-80`}
    >
      {content}
    </Link>
  );
};

export const PlayerDifficultyCard = ({
  difficulty,
  position = "F",
  isCareer = false,
  showInfo = true,
  forceDark = false,
  shareable = false,
  linesHref = null,
}) => {
  const { zoneStarts, specialTeams, teammateQuality, teammates } = difficulty;
  const percentiles = difficulty.percentiles || {};
  const isDefense = position === "D";
  const zoneSegments =
    zoneStarts &&
    ZONE_SEGMENTS.map(({ key, label, shortLabel, color }) => ({
      label,
      shortLabel,
      color,
      value: zoneStarts[key],
      detail: `${Math.round(zoneStarts[key])}%`,
      percentile: percentiles[key],
    }));
  const specialTeamsSegments = specialTeams && [
    {
      label: "PP",
      color: POWER_PLAY_COLOR,
      value: specialTeams.powerPlayMinutes,
      detail: `${formatMinutes(specialTeams.powerPlayPerGame)} / GP`,
      percentile: percentiles.powerPlay,
    },
    {
      label: "PK",
      color: PENALTY_KILL_COLOR,
      value: specialTeams.penaltyKillMinutes,
      detail: `${formatMinutes(specialTeams.penaltyKillPerGame)} / GP`,
      percentile: percentiles.penaltyKill,
    },
  ];

  return (
    <section
      className={`liquid-glass-strong liquid-glass-animate flex h-full flex-col rounded-[32px] ${shareable ? "min-h-0 p-6" : "min-h-[370px] p-5 sm:p-6"} ${forceDark ? "force-dark-player-card" : ""}`}
    >
      <div
        className={`${shareable ? "mb-3" : "mb-5"} flex items-start justify-between gap-3`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Mountain
            className={`${shareable ? "h-8 w-8" : "h-6 w-6"} shrink-0 text-amber-300 light:text-amber-600`}
          />
          <div>
            <h3
              className={`${shareable ? "shareable-icon-label text-3xl" : "text-xl sm:text-2xl"} font-bold tracking-display text-white light:text-gray-900`}
            >
              Deployment
            </h3>
            {!shareable && (
              <p className="mt-0.5 text-xs text-gray-400 light:text-gray-500">
                grey = percentile vs. league
              </p>
            )}
          </div>
        </div>
        {showInfo && (
          <Tooltip
            id="player-difficulty"
            position="bottom"
            width="w-64 sm:w-72"
            content={
              <div className="space-y-2">
                <div className="font-semibold text-amber-300 light:text-amber-600">
                  How the player was used
                </div>
                <div>
                  Shift starts split 5-on-5 zone starts, leaving out shifts
                  started on the fly. Special teams compares 5-on-4 and 4-on-5
                  ice time. Teammate quality averages the impact percentile of
                  5-on-5 linemates or partners, weighted by time together.
                </div>
                <div>
                  Grey numbers are league percentiles against the same position.
                  A higher number means more of that usage, not better.
                </div>
              </div>
            }
          >
            <button
              className="shrink-0 text-gray-400 transition-colors hover:text-gray-200 light:text-gray-500 light:hover:text-gray-700"
              aria-label="Info about deployment"
            >
              <Info className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col justify-between ${shareable ? "gap-3" : "gap-4"}`}
      >
        {zoneSegments && (
          <SegmentSection
            title="Shift Starts"
            segments={zoneSegments}
            shareable={shareable}
          />
        )}
        {specialTeamsSegments && (
          <SegmentSection
            title="Special Teams"
            segments={specialTeamsSegments}
            shareable={shareable}
          />
        )}
        {teammateQuality != null && (
          <TeammateQuality
            title={isDefense ? "Partner Quality" : "Linemate Quality"}
            value={teammateQuality}
            percentile={percentiles.teammateQuality}
            shareable={shareable}
          />
        )}
        {teammates?.length > 0 && (
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <SectionLabel shareable={shareable}>
                {isDefense ? "Most Common Partner" : "Most Common Linemates"}
              </SectionLabel>
              {linesHref && !shareable && (
                <Link
                  to={linesHref}
                  className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-amber-300 transition-colors hover:text-amber-200 light:text-amber-600 light:hover:text-amber-700"
                >
                  {isDefense ? "All Pairings" : "All Lines"}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div
              className={`grid gap-3 ${teammates.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {teammates.map((teammate) => (
                <Teammate
                  key={teammate.playerId}
                  teammate={teammate}
                  isCareer={isCareer}
                  shareable={shareable}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
