import { Gauge, Mountain, PieChart, Shield, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { getOrdinal } from "utils/ordinal";
import { playerUtils } from "utils/playerUtils";
import { SHOT_TYPE_SHADES } from "features/players/components/ShotMixStrip";
import {
  describeWedge,
  polarPoint,
  layoutWedges,
} from "features/players/components/tendencyChart";
import { mergeByLabel, qualityGroupsFor, shortLabel } from "./metrics";
import {
  ComparisonSection,
  SubjectTag,
  leaderIndex,
  subjectColor,
  subjectTint,
  toNumber,
} from "./shared";

const PIE_RADIUS = 92;
const PIE_LABEL_RADIUS = 106;
const TENDENCY_SHADES = [100, 72, 50, 34];
const SHOT_SHADES = [100, 80, 62, 46, 32];
const SHOT_LABELS = { "Tip & Deflection": "Tip", Backhand: "Back" };

const ZONES = [
  { key: "offensive", label: "Offensive", short: "O-Zone", shade: 100 },
  { key: "defensive", label: "Defensive", short: "D-Zone", shade: 28 },
];

const EDGE_ORDER = [
  "TOP_SPEED",
  "SPEED_BURSTS",
  "SHOT_SPEED",
  "DIST_SKATED",
  "DIST_GAME",
  "OZONE",
];
const EDGE_UNITS = {
  TOP_SPEED: "mph",
  SHOT_SPEED: "mph",
  DIST_SKATED: "mi",
  DIST_GAME: "mi",
  OZONE: "%",
};

const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const ordinalOrDash = (value) =>
  toNumber(value) == null ? "—" : getOrdinal(value);

const formatMinutes = (minutes) => {
  const seconds = Math.round((Number(minutes) || 0) * 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

const mutedClass = (leader, index) =>
  leader != null && leader !== index ? "opacity-50" : "";

const MUTED_FILL_OPACITY = 0.45;

const percentilesByLabel = (items) =>
  new Map((items || []).map((item) => [item.label, toNumber(item.percentile)]));

const trailsRival = (percentile, rivalPercentile) =>
  leaderIndex([toNumber(percentile), rivalPercentile]) === 1;

const twoColumns =
  "grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 export:grid-cols-2 export:gap-10";

const labelPlacement = (angle) => {
  const radians = (angle * Math.PI) / 180;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  const anchor = sin > 0.25 ? "start" : sin < -0.25 ? "end" : "middle";
  if (cos > 0.5) return { anchor, offsets: [-16, 0] };
  if (cos < -0.5) return { anchor, offsets: [13, 29] };
  return { anchor, offsets: [-4, 12] };
};

const TendencyPie = ({ index, tendencies, rivalTendencies }) => {
  const rivalPercentiles = percentilesByLabel(rivalTendencies);
  const wedges = layoutWedges(
    tendencies.slice(0, 4).map((tendency, order) => ({
      ...tendency,
      shade: TENDENCY_SHADES[order],
    }))
  );

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <svg
        viewBox="-78 -34 376 288"
        className="block h-auto w-full"
        role="img"
        aria-label={wedges
          .map(
            (wedge) =>
              `${wedge.label}: ${wedge.percentage}% of events, ${getOrdinal(wedge.percentile)} league percentile`
          )
          .join(". ")}
      >
        <circle
          cx="110"
          cy="110"
          r={PIE_RADIUS}
          className="fill-white/[0.05] light:fill-slate-900/[0.05]"
        />
        {wedges.map((wedge) => (
          <path
            key={wedge.label}
            d={describeWedge(
              PIE_RADIUS * (clampPercent(wedge.percentile) / 100),
              wedge.startAngle,
              wedge.endAngle
            )}
            fill={subjectTint(index, wedge.shade)}
            className="transition-all duration-700 ease-out"
          />
        ))}
        {wedges.map((wedge) => {
          const middle = (wedge.startAngle + wedge.endAngle) / 2;
          const point = polarPoint(PIE_LABEL_RADIUS, middle);
          const { anchor, offsets } = labelPlacement(middle);
          const valueOpacity = trailsRival(
            wedge.percentile,
            rivalPercentiles.get(wedge.label)
          )
            ? MUTED_FILL_OPACITY
            : 1;
          return (
            <text key={`label-${wedge.label}`} x={point.x} textAnchor={anchor}>
              <tspan
                x={point.x}
                y={point.y + offsets[0]}
                className="fill-gray-300 text-[13px] font-semibold light:fill-slate-600"
              >
                {shortLabel(wedge.label)}
              </tspan>
              <tspan
                x={point.x}
                y={point.y + offsets[1]}
                className="text-[15px] font-bold"
                style={{ fill: subjectColor(index), fillOpacity: valueOpacity }}
              >
                {getOrdinal(wedge.percentile)}
              </tspan>
              <tspan
                className="fill-gray-500 text-[12px] font-medium"
                style={{ fillOpacity: valueOpacity }}
              >
                {` · ${Math.round(Number(wedge.percentage) || 0)}%`}
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const ShotMix = ({ index, shotMix, rivalShotMix }) => {
  const rivalPercentiles = percentilesByLabel(rivalShotMix?.shots);
  const shots = (shotMix?.shots || []).filter(
    (shot) => SHOT_TYPE_SHADES[shot.label]
  );
  if (!shots.length) return null;
  const total = shots.reduce((sum, shot) => sum + shot.attempts, 0) || 1;

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-base font-semibold text-gray-400 light:text-gray-500">
          Shot Mix
        </span>
        <span className="text-base font-bold tabular-nums text-white light:text-gray-900">
          {shotMix.attempts}
          <span className="ml-1 text-xs font-medium text-gray-500">
            unblocked
          </span>
        </span>
      </div>
      <div
        className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full"
        role="img"
        aria-label={shots
          .map((shot) => `${shot.label}: ${Math.round(shot.share)}%`)
          .join(". ")}
      >
        {shots.map((shot, order) => (
          <div
            key={shot.label}
            className="min-w-0 transition-all duration-1000 ease-out"
            style={{
              width: `${(shot.attempts / total) * 100}%`,
              backgroundColor: subjectTint(index, SHOT_SHADES[order]),
            }}
          />
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-5 gap-1.5">
        {shots.map((shot, order) => (
          <div
            key={shot.label}
            className="min-w-0 rounded-xl bg-white/[0.04] px-1 py-1.5 text-center light:bg-slate-900/[0.04]"
          >
            <div className="flex items-center justify-center gap-1 text-[0.7rem] font-semibold text-gray-300 light:text-gray-700">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: subjectTint(index, SHOT_SHADES[order]),
                }}
              />
              <span className="truncate">
                {SHOT_LABELS[shot.label] || shot.label}
              </span>
            </div>
            <div
              className={
                trailsRival(shot.percentile, rivalPercentiles.get(shot.label))
                  ? "opacity-50"
                  : ""
              }
            >
              <div className="mt-0.5 text-sm font-bold tabular-nums text-white light:text-gray-900">
                {Math.round(Number(shot.share) || 0)}%
              </div>
              <div className="text-xs font-medium tabular-nums text-gray-500">
                {ordinalOrDash(shot.percentile)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TendenciesComparison = ({ left, right, labels }) => (
  <ComparisonSection
    icon={PieChart}
    iconClassName="text-violet-300 light:text-violet-600"
    title="Tendencies"
  >
    <div className={twoColumns}>
      {[left, right].map((data, index) => {
        const rival = index === 0 ? right : left;
        return (
          <div key={index} className="min-w-0">
            <SubjectTag index={index} label={labels[index]} />
            <TendencyPie
              index={index}
              tendencies={data.tendencies || []}
              rivalTendencies={rival.tendencies}
            />
            <ShotMix
              index={index}
              shotMix={data.shotMix}
              rivalShotMix={rival.shotMix}
            />
          </div>
        );
      })}
    </div>
  </ComparisonSection>
);

const SectionLabel = ({ children }) => (
  <p className="text-base font-semibold text-gray-400 light:text-gray-500">
    {children}
  </p>
);

const SegmentSection = ({ index, title, segments }) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div>
      <div className="mb-1.5">
        <SectionLabel>{title}</SectionLabel>
      </div>
      <div
        className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full bg-[var(--comparison-track)]"
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
              backgroundColor: subjectTint(index, segment.shade),
            }}
          />
        ))}
      </div>
      <div
        className="mt-2 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))`,
        }}
      >
        {segments.map((segment) => (
          <div key={segment.label} className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: subjectTint(index, segment.shade) }}
              />
              <span className="flex min-w-0 items-baseline gap-1">
                <span className="truncate text-sm font-semibold text-gray-200 light:text-gray-800">
                  {segment.short ? (
                    <>
                      <span className="lg:hidden export:inline">
                        {segment.short}
                      </span>
                      <span className="hidden lg:inline export:hidden">
                        {segment.label}
                      </span>
                    </>
                  ) : (
                    segment.label
                  )}
                </span>
                {segment.percentile != null && (
                  <span className="whitespace-nowrap text-sm font-medium tabular-nums text-gray-400 light:text-gray-500">
                    {getOrdinal(segment.percentile)}
                  </span>
                )}
              </span>
            </div>
            <p className="text-lg font-medium tabular-nums text-white light:text-gray-900">
              {segment.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TeammateQuality = ({ index, title, value, percentile }) => {
  const quality = clampPercent(value);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-1.5">
          <SectionLabel>{title}</SectionLabel>
          {percentile != null && (
            <span className="text-sm font-medium tabular-nums text-gray-400 light:text-gray-500">
              {getOrdinal(percentile)}
            </span>
          )}
        </span>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color: subjectColor(index) }}
        >
          {Math.round(quality)}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--comparison-track)]">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{ width: `${quality}%`, background: subjectColor(index) }}
        />
      </div>
    </div>
  );
};

const Teammate = ({ index, teammate, shareable }) => {
  const headshot = playerUtils.getPlayerHeadshot(
    teammate.playerId,
    teammate.team,
    teammate.season
  );
  const content = (
    <>
      <div
        className="h-16 w-16 shrink-0 overflow-hidden rounded-full lg:h-20 lg:w-20"
        style={{ backgroundColor: subjectTint(index, 18) }}
      >
        <img
          src={shareable ? playerUtils.getCorsWrappedUrl(headshot) : headshot}
          alt=""
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = playerUtils.getDefaultHeadshot();
          }}
        />
      </div>
      <span className="text-sm font-bold leading-tight text-white light:text-gray-900 sm:text-base">
        {teammate.name}
      </span>
    </>
  );
  const className = "flex min-w-0 flex-col items-center gap-2 text-center";
  if (shareable) return <div className={className}>{content}</div>;
  return (
    <Link
      to={playerUtils.playerProfilePath(teammate.playerId, teammate.season)}
      className={`${className} rounded-xl transition-opacity hover:opacity-80`}
    >
      {content}
    </Link>
  );
};

const DeploymentColumn = ({
  index,
  label,
  difficulty,
  isDefense,
  shareable,
}) => {
  const { zoneStarts, specialTeams, teammateQuality, teammates } = difficulty;
  const percentiles = difficulty.percentiles || {};
  const zoneSegments =
    zoneStarts &&
    ZONES.map((zone) => ({
      ...zone,
      value: Number(zoneStarts[zone.key]) || 0,
      detail: `${Math.round(Number(zoneStarts[zone.key]) || 0)}%`,
      percentile: percentiles[zone.key],
    }));
  const specialTeamsSegments = specialTeams && [
    {
      label: "PP",
      shade: 100,
      value: Number(specialTeams.powerPlayMinutes) || 0,
      detail: `${formatMinutes(specialTeams.powerPlayPerGame)} / GP`,
      percentile: percentiles.powerPlay,
    },
    {
      label: "PK",
      shade: 40,
      value: Number(specialTeams.penaltyKillMinutes) || 0,
      detail: `${formatMinutes(specialTeams.penaltyKillPerGame)} / GP`,
      percentile: percentiles.penaltyKill,
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <SubjectTag index={index} label={label} />
      {zoneSegments && (
        <SegmentSection
          index={index}
          title="Shift Starts"
          segments={zoneSegments}
        />
      )}
      {specialTeamsSegments && (
        <SegmentSection
          index={index}
          title="Special Teams"
          segments={specialTeamsSegments}
        />
      )}
      {teammateQuality != null && (
        <TeammateQuality
          index={index}
          title={isDefense ? "Partner Quality" : "Linemate Quality"}
          value={teammateQuality}
          percentile={percentiles.teammateQuality}
        />
      )}
      {teammates?.length > 0 && (
        <div>
          <div className="mb-3">
            <SectionLabel>
              {isDefense ? "Most Common Partner" : "Most Common Linemates"}
            </SectionLabel>
          </div>
          <div
            className={`grid items-start gap-3 ${teammates.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {teammates.slice(0, 2).map((teammate) => (
              <Teammate
                key={teammate.playerId}
                index={index}
                teammate={teammate}
                shareable={shareable}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const DeploymentComparison = ({ left, right, labels, shareable }) => {
  if (!left.difficulty || !right.difficulty) return null;
  return (
    <ComparisonSection
      icon={Mountain}
      iconClassName="text-amber-300 light:text-amber-600"
      title="Deployment"
    >
      <div className={twoColumns}>
        {[left, right].map((data, index) => (
          <DeploymentColumn
            key={index}
            index={index}
            label={labels[index]}
            difficulty={data.difficulty}
            isDefense={data.player.position === "D"}
            shareable={shareable}
          />
        ))}
      </div>
    </ComparisonSection>
  );
};

const QualityBars = ({ rows }) => (
  <div
    className="grid flex-1 gap-3 sm:gap-4"
    style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}
  >
    {rows.map((row) => {
      const leader = leaderIndex(row.values, false, 0.5);
      return (
        <div
          key={row.label}
          className="grid min-w-0 grid-rows-[auto_1fr_auto] justify-items-center gap-2"
        >
          <div className="flex items-baseline gap-2 text-base font-bold tabular-nums">
            {[0, 1].map((index) => (
              <span
                key={index}
                className={mutedClass(leader, index)}
                style={{ color: subjectColor(index) }}
              >
                {row.values[index] == null
                  ? "—"
                  : Math.round(row.values[index])}
              </span>
            ))}
          </div>
          <div
            className="flex h-full min-h-[200px] w-full max-w-[88px] gap-1.5"
            role="img"
            aria-label={`${row.label}: ${row.values
              .map((value) => (value == null ? "no data" : getOrdinal(value)))
              .join(" vs ")} league percentile`}
          >
            {[0, 1].map((index) => (
              <div
                key={index}
                className="relative h-full flex-1 overflow-hidden rounded-2xl bg-[var(--comparison-track)]"
              >
                <div
                  className="absolute inset-x-0 bottom-0 rounded-2xl transition-[height] duration-1000 ease-out"
                  style={{
                    height: `${clampPercent(row.values[index])}%`,
                    backgroundColor: subjectColor(index),
                    opacity: leader != null && leader !== index ? 0.45 : 1,
                  }}
                />
              </div>
            ))}
          </div>
          <p className="min-h-[2.5rem] text-center text-xs font-semibold leading-tight text-gray-300 light:text-gray-700 sm:text-[0.82rem]">
            {row.label}
          </p>
        </div>
      );
    })}
  </div>
);

export const QualityComparison = ({ left, right, labels, isGoalie }) => (
  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 export:grid-cols-2 export:gap-6">
    {qualityGroupsFor(isGoalie).map((group, groupIndex) => {
      const offensive = groupIndex === 0;
      return (
        <ComparisonSection
          key={group.key}
          icon={offensive ? Target : Shield}
          iconClassName={
            offensive
              ? "text-cyan-300 light:text-cyan-600"
              : "text-rose-400 light:text-rose-600"
          }
          title={group.title}
          labels={labels}
          className="flex flex-col"
        >
          <QualityBars
            rows={mergeByLabel(
              left.quality?.[group.key],
              right.quality?.[group.key],
              (item) => item?.value
            )}
          />
        </ComparisonSection>
      );
    })}
  </div>
);

const formatEdgeValue = (key, value) => {
  const number = toNumber(value);
  if (number == null) return "—";
  if (key === "OZONE") return (number < 1 ? number * 100 : number).toFixed(1);
  return number.toFixed(1);
};

const edgeLabel = (key, short) => {
  const name = short
    ? playerUtils.formatStatAbbr(key)
    : playerUtils.formatStatName(key);
  return EDGE_UNITS[key] ? `${name} (${EDGE_UNITS[key]})` : name;
};

export const EdgeComparison = ({ left, right, labels }) => {
  if (!left.edgeValues || !right.edgeValues) return null;
  const keys = EDGE_ORDER.filter(
    (key) => left.edgeValues[key] != null || right.edgeValues[key] != null
  );
  if (!keys.length) return null;

  return (
    <ComparisonSection
      icon={Gauge}
      iconClassName="text-emerald-300 light:text-emerald-600"
      title="NHL EDGE"
      labels={labels}
    >
      <div className="grid grid-cols-3 gap-y-6 text-center sm:grid-cols-6 export:grid-cols-6">
        {keys.map((key) => {
          const sides = [left, right].map((data) => ({
            value: data.edgeValues[key],
            percentile: toNumber(data.edgePercentiles?.[key]),
          }));
          const leader = leaderIndex(
            sides.map((side) => side.percentile),
            false,
            0.5
          );
          return (
            <div
              key={key}
              className="flex min-w-0 flex-col items-center px-1 sm:px-2"
            >
              <div className="flex min-h-[2rem] items-end justify-center text-[0.65rem] font-medium leading-tight text-gray-400 light:text-gray-500 sm:text-xs">
                <span className="hidden lg:inline export:inline">
                  {edgeLabel(key, false)}
                </span>
                <span className="lg:hidden export:hidden">
                  {edgeLabel(key, true)}
                </span>
              </div>
              {sides.map((side, index) => (
                <div
                  key={index}
                  className={`mt-1 flex flex-col items-center ${mutedClass(leader, index)}`}
                >
                  <span
                    className="whitespace-nowrap text-lg font-semibold leading-tight tabular-nums sm:text-2xl"
                    style={{ color: subjectColor(index) }}
                  >
                    {formatEdgeValue(key, side.value)}
                  </span>
                  <span className="text-[0.65rem] font-normal text-gray-500 sm:text-xs">
                    {ordinalOrDash(side.percentile)}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </ComparisonSection>
  );
};
