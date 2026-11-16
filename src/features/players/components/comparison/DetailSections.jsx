import { Gauge, Mountain, PieChart, Shield, Target } from "lucide-react";
import { getOrdinal } from "utils/ordinal";
import { playerUtils } from "utils/playerUtils";
import { SHOT_TYPE_SHADES } from "features/players/components/ShotMixStrip";
import { EDGE_METRICS, mergeByLabel, qualityGroupsFor } from "./metrics";
import {
  ButterflyRow,
  ComparisonSection,
  SubjectMarker,
  formatPercentile,
  subjectColor,
  subjectTint,
  toNumber,
} from "./shared";

const ZONES = [
  { key: "offensive", short: "O", label: "Offensive", tint: 100 },
  { key: "neutral", short: "N", label: "Neutral", tint: 55 },
  { key: "defensive", short: "D", label: "Defensive", tint: 26 },
];

const pctlLabel = (value) =>
  toNumber(value) == null ? undefined : `${getOrdinal(value)} pctl`;

const formatMinutes = (minutes) => {
  const value = toNumber(minutes);
  if (value == null) return "—";
  const seconds = Math.round(value * 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

const SubHeading = ({ children }) => (
  <p className="mb-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gray-500">
    {children}
  </p>
);

const ZoneStrip = ({ index, label, zoneStarts }) => (
  <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
    <span
      className="flex min-w-0 items-center gap-1.5 text-xs font-bold"
      style={{ color: subjectColor(index) }}
    >
      <SubjectMarker index={index} className="h-2 w-2" />
      <span className="truncate">{label}</span>
    </span>
    <div
      className="flex h-7 w-full gap-[2px] overflow-hidden rounded-xl"
      role="img"
      aria-label={ZONES.map(
        (zone) => `${zone.label} ${Math.round(zoneStarts?.[zone.key] || 0)}%`
      ).join(", ")}
    >
      {ZONES.map((zone) => {
        const share = Number(zoneStarts?.[zone.key]) || 0;
        return (
          <div
            key={zone.key}
            className="flex min-w-0 items-center justify-center overflow-hidden text-[0.65rem] font-black tabular-nums transition-[flex-grow] duration-1000"
            style={{
              flexGrow: Math.max(share, 0.01),
              flexBasis: 0,
              backgroundColor: subjectTint(index, zone.tint),
              color: zone.tint > 50 ? "var(--subject-ink)" : undefined,
            }}
          >
            {share >= 9 && (
              <span
                className={`whitespace-nowrap ${zone.tint > 50 ? "" : "text-gray-100 light:text-gray-800"}`}
              >
                {share >= 24 ? `${zone.short} ` : ""}
                {Math.round(share)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const LinemateList = ({ index, label, teammates }) => (
  <div className="min-w-0">
    <p
      className="mb-2 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em]"
      style={{ color: subjectColor(index) }}
    >
      <SubjectMarker index={index} className="h-2 w-2" />
      <span className="truncate">{label}</span>
    </p>
    {teammates?.length ? (
      <ul className="space-y-2">
        {teammates.slice(0, 3).map((teammate) => (
          <li key={teammate.playerId} className="flex min-w-0 items-center gap-2">
            <img
              src={playerUtils.getPlayerHeadshot(
                teammate.playerId,
                teammate.team,
                teammate.season
              )}
              alt=""
              className="h-7 w-7 shrink-0 rounded-full border bg-[#111216] object-cover light:bg-white"
              style={{ borderColor: subjectTint(index, 50) }}
              onError={(event) => {
                event.currentTarget.src = playerUtils.getDefaultHeadshot();
              }}
            />
            <span className="truncate text-xs font-semibold text-gray-200 light:text-gray-800 sm:text-sm">
              {teammate.name}
            </span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-gray-500">No linemate data.</p>
    )}
  </div>
);

export const DeploymentComparison = ({ left, right, labels }) => {
  const [leftUsage, rightUsage] = [left.difficulty, right.difficulty];
  if (!leftUsage || !rightUsage) return null;
  const isDefense =
    left.player.position === "D" && right.player.position === "D";
  const usageRows = [
    {
      label: "Power play / GP",
      values: [leftUsage.percentiles?.powerPlay, rightUsage.percentiles?.powerPlay],
      displays: [
        formatMinutes(leftUsage.specialTeams?.powerPlayPerGame),
        formatMinutes(rightUsage.specialTeams?.powerPlayPerGame),
      ],
    },
    {
      label: "Penalty kill / GP",
      values: [leftUsage.percentiles?.penaltyKill, rightUsage.percentiles?.penaltyKill],
      displays: [
        formatMinutes(leftUsage.specialTeams?.penaltyKillPerGame),
        formatMinutes(rightUsage.specialTeams?.penaltyKillPerGame),
      ],
    },
    {
      label: isDefense ? "Partner quality" : "Linemate quality",
      values: [
        leftUsage.percentiles?.teammateQuality,
        rightUsage.percentiles?.teammateQuality,
      ],
      displays: [
        formatPercentile(toNumber(leftUsage.teammateQuality)),
        formatPercentile(toNumber(rightUsage.teammateQuality)),
      ],
    },
  ];

  return (
    <ComparisonSection
      icon={Mountain}
      iconClassName="text-amber-300 light:text-amber-600"
      eyebrow="Deployment"
      title="How they're used"
      description="Where shifts start, special-teams load, and who they skate with. Bars show league usage percentile: more usage, not better."
      labels={labels}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div>
          <SubHeading>Shift starts · 5v5, off the fly excluded</SubHeading>
          <div className="space-y-2.5">
            <ZoneStrip index={0} label={labels[0]} zoneStarts={leftUsage.zoneStarts} />
            <ZoneStrip index={1} label={labels[1]} zoneStarts={rightUsage.zoneStarts} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.65rem] font-semibold text-gray-500">
            {ZONES.map((zone) => (
              <span key={zone.key}>
                <b className="text-gray-300 light:text-gray-700">{zone.short}</b>{" "}
                {zone.label}
              </span>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {ZONES.map((zone) => (
              <ButterflyRow
                key={zone.key}
                label={`${zone.label}-zone starts`}
                values={[
                  toNumber(leftUsage.percentiles?.[zone.key]),
                  toNumber(rightUsage.percentiles?.[zone.key]),
                ]}
                displays={[
                  `${Math.round(Number(leftUsage.zoneStarts?.[zone.key]) || 0)}%`,
                  `${Math.round(Number(rightUsage.zoneStarts?.[zone.key]) || 0)}%`,
                ]}
                sublabels={[
                  pctlLabel(leftUsage.percentiles?.[zone.key]),
                  pctlLabel(rightUsage.percentiles?.[zone.key]),
                ]}
                competitive={false}
              />
            ))}
          </div>
        </div>
        <div>
          <SubHeading>Special teams & company</SubHeading>
          <div className="space-y-3">
            {usageRows.map((row) => (
              <ButterflyRow
                key={row.label}
                label={row.label}
                values={row.values.map(toNumber)}
                displays={row.displays}
                sublabels={row.values.map(pctlLabel)}
                competitive={false}
              />
            ))}
          </div>
          <div className="mt-6">
            <SubHeading>{isDefense ? "Most-used partners" : "Most-used linemates"}</SubHeading>
            <div className="grid grid-cols-2 gap-4">
              <LinemateList index={0} label={labels[0]} teammates={leftUsage.teammates} />
              <LinemateList index={1} label={labels[1]} teammates={rightUsage.teammates} />
            </div>
          </div>
        </div>
      </div>
    </ComparisonSection>
  );
};

const shotRows = (left, right) => {
  const rows = mergeByLabel(
    left.shotMix?.shots,
    right.shotMix?.shots,
    (shot) => shot?.share
  ).filter((row) => SHOT_TYPE_SHADES[row.label]);
  const maxShare = Math.max(
    1,
    ...rows.flatMap((row) => row.values.filter((value) => value != null))
  );
  return { rows, maxShare };
};

export const StyleComparison = ({ left, right, labels }) => {
  const tendencies = mergeByLabel(
    left.tendencies,
    right.tendencies,
    (item) => item?.percentile
  );
  const showShots = left.shotMix && right.shotMix;
  const { rows: shots, maxShare } = showShots
    ? shotRows(left, right)
    : { rows: [], maxShare: 1 };

  return (
    <ComparisonSection
      icon={PieChart}
      iconClassName="text-violet-300 light:text-violet-600"
      eyebrow="Style"
      title="How they play"
      description="Tendencies show how often each player goes to an action compared with the league. Neither side is scored: style isn't better or worse."
      labels={labels}
    >
      <div className={`grid grid-cols-1 gap-6 ${showShots ? "lg:grid-cols-2 lg:gap-8" : ""}`}>
        <div>
          <SubHeading>Tendencies · percentile of event share</SubHeading>
          <div className="space-y-3">
            {tendencies.map((row) => (
              <ButterflyRow
                key={row.label}
                label={row.label}
                values={row.values}
                displays={row.values.map(formatPercentile)}
                sublabels={row.items.map((item) =>
                  item ? `${Math.round(Number(item.percentage) || 0)}% of events` : undefined
                )}
                competitive={false}
              />
            ))}
          </div>
        </div>
        {showShots && (
          <div>
            <SubHeading>
              Shot mix · {left.shotMix.attempts ?? "—"} vs {right.shotMix.attempts ?? "—"} unblocked attempts
            </SubHeading>
            <div className="space-y-3">
              {shots.map((row) => (
                <ButterflyRow
                  key={row.label}
                  label={row.label}
                  values={row.values}
                  max={maxShare}
                  displays={row.values.map((value) =>
                    value == null ? "—" : `${Math.round(value)}%`
                  )}
                  sublabels={row.items.map((item) => pctlLabel(item?.percentile))}
                  competitive={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ComparisonSection>
  );
};

export const QualityComparison = ({ left, right, labels, isGoalie }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
    {qualityGroupsFor(isGoalie).map((group, groupIndex) => {
      const rows = mergeByLabel(
        left.quality?.[group.key],
        right.quality?.[group.key],
        (item) => item?.value
      );
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
          eyebrow={offensive ? (isGoalie ? "Stopping pucks" : "With the puck") : isGoalie ? "By danger" : "Without the puck"}
          title={group.title}
          description="Percentile vs. league. The brighter side leads."
        >
          <div className="space-y-4">
            {rows.map((row) => (
              <ButterflyRow
                key={row.label}
                label={row.label}
                values={row.values}
                displays={row.values.map(formatPercentile)}
              />
            ))}
          </div>
        </ComparisonSection>
      );
    })}
  </div>
);

const formatEdgeValue = (key, value) => {
  const number = toNumber(value);
  if (number == null) return "—";
  if (key === "OZONE") return (number <= 1 ? number * 100 : number).toFixed(1);
  if (key === "SPEED_BURSTS") return String(Math.round(number));
  return number.toFixed(1);
};

export const EdgeComparison = ({ left, right, labels }) => {
  if (!left.edgeValues || !right.edgeValues) return null;
  const metrics = EDGE_METRICS.filter(
    (metric) =>
      left.edgeValues[metric.key] != null || right.edgeValues[metric.key] != null
  );
  if (!metrics.length) return null;

  return (
    <ComparisonSection
      icon={Gauge}
      iconClassName="text-emerald-300 light:text-emerald-600"
      eyebrow="NHL EDGE"
      title="Speed & motor"
      description="Puck and player tracking. Values are raw; bars are league percentile."
      labels={labels}
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        {metrics.map((metric) => (
          <ButterflyRow
            key={metric.key}
            label={metric.unit ? `${metric.label} (${metric.unit})` : metric.label}
            values={[
              toNumber(left.edgePercentiles?.[metric.key]),
              toNumber(right.edgePercentiles?.[metric.key]),
            ]}
            displays={[
              formatEdgeValue(metric.key, left.edgeValues[metric.key]),
              formatEdgeValue(metric.key, right.edgeValues[metric.key]),
            ]}
            sublabels={[
              pctlLabel(left.edgePercentiles?.[metric.key]),
              pctlLabel(right.edgePercentiles?.[metric.key]),
            ]}
          />
        ))}
      </div>
    </ComparisonSection>
  );
};
