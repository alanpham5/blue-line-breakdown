import {
  Activity,
  Gauge,
  Percent,
  PieChart,
  Tags,
  Target,
  Users,
} from "lucide-react";
import {
  archetypeBadgeGroups,
  getArchetypeBadge,
} from "features/players/components/ArchetypeBadge";
import { getPercentileColor } from "utils/percentileColor";

const accents = {
  sky: { text: "text-sky-300 light:text-sky-600" },
  violet: {
    text: "text-violet-300 light:text-violet-600",
    fill: "bg-violet-400 light:bg-violet-500",
  },
  cyan: {
    text: "text-cyan-300 light:text-cyan-600",
    fill: "bg-cyan-400 light:bg-cyan-500",
  },
  rose: {
    text: "text-rose-400 light:text-rose-600",
    fill: "bg-rose-400 light:bg-rose-500",
  },
  emerald: { text: "text-emerald-300 light:text-emerald-600" },
  amber: { text: "text-amber-300 light:text-amber-600" },
};

const influenceLevels = [
  { level: 3, label: "Major" },
  { level: 2, label: "Moderate" },
  { level: 1, label: "Minor" },
];

const influenceBarHeights = ["h-1.5", "h-2.5", "h-3.5"];

const sections = [
  { id: "reading", label: "Reading the Numbers" },
  { id: "archetypes", label: "Archetypes" },
  { id: "tendencies", label: "Tendencies" },
  { id: "skater-quality", label: "Skater Quality" },
  { id: "goalie-quality", label: "Goalie Quality" },
  { id: "edge", label: "NHL EDGE" },
  { id: "similar", label: "Similar Players" },
];

const percentileMarkers = [
  { value: 10, label: "Bottom tier" },
  { value: 50, label: "League median" },
  { value: 90, label: "Top 10%" },
];

const readingPrinciples = [
  ["0–100 percentile", "50 is the league median."],
  ["True peers", "Same season and position group."],
  ["5-on-5, per 60", "Rates, not totals."],
  ["300+ minutes", "Needed to join the comparison pool."],
  ["Small samples tempered", "Shooting and save % lean toward average."],
];

const archetypeCriteria = {
  "Lamp Lighter": "Goals ≥ 80th",
  Magician: "Assists or setup xG ≥ 80th",
  "200-Foot Player": "Offense and defense scores ≥ 70",
  Quarterback: "Assists or setup xG ≥ 80th",
  "Big Shot": "Goals ≥ 80th",
  "Stay at Home": "Corsi % ≤ 25th",
  Blockaholic: "Blocks/60 ≥ 80th",
  "Battering Ram": "Hits/60 ≥ 80th",
  Fisticuffs: "Major penalties ≥ 90th",
  Racehorse: "Top speed + 20 mph bursts ≥ 80th",
  "Big Save Machine": "High-danger saves ≥ 80th",
  "Big Wall": "Height and Sv% ≥ 75th, few freezes",
  "Dead Stop": "Freeze rate ≥ 80th",
  Workhorse: "Shots faced ≥ 85th",
};

const skaterTendencies = [
  {
    label: "Shoot",
    color: "#32ade6",
    components: [{ label: "Individual shot attempts per 60", influence: 3 }],
  },
  {
    label: "Offensive Buildup",
    color: "#af52de",
    components: [
      { label: "Primary assists per 60", influence: 3 },
      { label: "Secondary assists per 60", influence: 2 },
      { label: "Teammate shot involvement per 60", influence: 2 },
      { label: "Relative on-ice xGF per 60", influence: 2 },
    ],
  },
  {
    label: "Physical Pressure",
    color: "#ffcc00",
    components: [
      { label: "Hits per 60", influence: 3 },
      { label: "Penalties drawn per 60", influence: 2 },
      { label: "Takeaways per 60", influence: 1 },
    ],
  },
  {
    label: "Shot Blocking",
    color: "#34c759",
    components: [
      { label: "Blocked shots per 60", influence: 3 },
      { label: "Blocks per on-ice shot attempt against", influence: 3 },
    ],
  },
];

const goalieTendencies = [
  {
    label: "Puck Freeze",
    color: "#5ac8fa",
    body: "Shots covered for a whistle",
  },
  { label: "Rebounds", color: "#ff9f0a", body: "Shots that become rebounds" },
];

const offensiveQuality = [
  {
    label: "Chance Creation",
    components: [
      { label: "Primary assists per 60", influence: 3 },
      { label: "Created xG per 60", influence: 2 },
      { label: "Relative on-ice xGF per 60", influence: 2 },
      { label: "Rebound-created xG per 60", influence: 1 },
    ],
  },
  {
    label: "Positioning",
    components: [
      { label: "High-danger xG per 60", influence: 3 },
      { label: "High-danger shots per 60", influence: 2 },
      { label: "Rebounds per 60", influence: 2 },
      { label: "Dangerous-chance share", influence: 2 },
    ],
  },
  {
    label: "Finishing",
    components: [
      { label: "Goals above expected per 60", influence: 3 },
      { label: "Goals-to-xG efficiency", influence: 2 },
      { label: "Unblocked shooting %", influence: 1 },
      { label: "High-danger conversion", influence: 1 },
    ],
  },
];

const defensiveQuality = [
  {
    label: "Takeaways",
    components: [
      { label: "Takeaways per 60", influence: 3 },
      { label: "Takeaway-to-giveaway balance", influence: 2 },
      { label: "Fewer giveaways per 60", influence: 1 },
      { label: "Fewer D-zone giveaways per 60", influence: 1 },
    ],
  },
  {
    label: "D-Zone Exits",
    components: [
      { label: "Shifts that end outside the defensive zone", influence: 3 },
      { label: "Fewer D-zone giveaways per 60", influence: 3 },
    ],
  },
  {
    label: "Chance Suppression",
    components: [
      { label: "Fewer xGA per 60", influence: 3 },
      { label: "Fewer high-danger xGA per 60", influence: 2 },
      { label: "Relative on-ice xGA per 60", influence: 2 },
      { label: "Fewer shot attempts against per 60", influence: 1 },
    ],
  },
];

const goaltendingQuality = [
  ["Save Percentage", "Adjusted for sample size"],
  ["Goals Against / 60", "Lower is better"],
  ["Goals Saved Above Expected", "Expected goals minus goals allowed, per 60"],
];

const shotsFacedQuality = [
  ["Low Danger Saves", "Sv% on low-danger shots"],
  ["Medium Danger Saves", "Sv% on medium-danger shots"],
  ["High Danger Saves", "Sv% on high-danger shots"],
];

const edgeMetrics = [
  ["Top Skating Speed", "mph", "Season max"],
  ["Speed Bursts (20+ mph)", "count", "Season total"],
  ["Top Shot Speed", "mph", "Season max"],
  ["Distance Skated", "mi", "Season total"],
  ["Max Game Distance", "mi", "Single-game max"],
  ["Offensive Zone Time", "%", "Share of on-ice time"],
];

const similarityFacts = [
  ["Score", "0–100 match in style and calibre"],
  ["Compared on", "Tendencies, quality, and impact"],
  ["Season filter", "Limits matches to one year"],
];

const ExpectedGoalsNote = () => (
  <p className="text-sm text-gray-400 light:text-gray-600">
    <span className="font-semibold text-gray-200 light:text-gray-800">xG</span>{" "}
    = chance a shot scores, based on location and type. xGF / xGA = expected
    goals for / against while on ice.
  </p>
);

const SectionCard = ({ id, icon: Icon, accent, title, subtitle, children }) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    className="liquid-glass-strong liquid-glass-animate scroll-mt-24 rounded-[32px] p-5 sm:p-7"
  >
    <div className="mb-5 flex items-start gap-2.5 sm:mb-6">
      <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${accents[accent].text}`} />
      <div className="min-w-0">
        <h2
          id={`${id}-title`}
          className="text-xl font-bold tracking-display text-white light:text-gray-900 sm:text-2xl"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm leading-relaxed text-gray-400 light:text-gray-500 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

const GroupLabel = ({ children, className = "mb-2.5" }) => (
  <h3
    className={`${className} text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 light:text-gray-500`}
  >
    {children}
  </h3>
);

const InsetCard = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 light:border-slate-200 light:bg-white/55 ${className}`}
  >
    {children}
  </div>
);

const InfluenceMeter = ({ influence, accent }) => (
  <span className="flex h-3.5 shrink-0 items-end gap-[3px]" aria-hidden="true">
    {influenceBarHeights.map((height, index) => (
      <span
        key={height}
        className={`w-1.5 rounded-full ${height} ${
          index < influence
            ? accents[accent].fill
            : "bg-white/10 light:bg-slate-900/10"
        }`}
      />
    ))}
  </span>
);

const InfluenceLegend = ({ accent }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 light:text-gray-500">
    <span className="font-semibold uppercase tracking-[0.12em] text-gray-500">
      Influence
    </span>
    {influenceLevels.map(({ level, label }) => (
      <span key={level} className="inline-flex items-center gap-1.5">
        <InfluenceMeter influence={level} accent={accent} />
        {label}
      </span>
    ))}
  </div>
);

const InfluenceBreakdown = ({ components, accent }) => (
  <ul className="divide-y divide-white/[0.06] light:divide-slate-200">
    {components.map(({ label, influence }) => (
      <li
        key={label}
        className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0"
      >
        <span className="min-w-0 text-gray-300 light:text-gray-700">
          {label}
        </span>
        <InfluenceMeter influence={influence} accent={accent} />
        <span className="sr-only">
          {influenceLevels.find(({ level }) => level === influence).label}{" "}
          influence
        </span>
      </li>
    ))}
  </ul>
);

const QualityGroup = ({ title, items, accent }) => (
  <div>
    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <GroupLabel className="">{title}</GroupLabel>
      <InfluenceLegend accent={accent} />
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      {items.map(({ label, components }) => (
        <InsetCard key={label}>
          <h4 className={`mb-3 font-semibold ${accents[accent].text}`}>
            {label}
          </h4>
          <InfluenceBreakdown components={components} accent={accent} />
        </InsetCard>
      ))}
    </div>
  </div>
);

const DefinitionGrid = ({ items, accent }) => (
  <div className="grid gap-3 sm:grid-cols-3">
    {items.map(([label, body]) => (
      <InsetCard key={label} className="!p-3.5">
        <h4 className={`text-sm font-semibold ${accents[accent].text}`}>
          {label}
        </h4>
        <p className="text-sm text-gray-400 light:text-gray-600">{body}</p>
      </InsetCard>
    ))}
  </div>
);

const PercentileScale = () => (
  <div className="px-1 pb-9 pt-1" aria-hidden="true">
    <div className="relative">
      <div
        className="h-2.5 rounded-full"
        style={{
          background: `linear-gradient(to right, ${[0, 25, 50, 75, 100]
            .map(getPercentileColor)
            .join(", ")})`,
        }}
      />
      {percentileMarkers.map(({ value, label }) => (
        <div
          key={value}
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${value}%` }}
        >
          <div className="h-2.5 w-0.5 bg-white/80 light:bg-slate-900/70" />
          <span className="mt-1.5 text-sm font-bold tabular-nums text-white light:text-gray-900">
            {value}
          </span>
          <span className="whitespace-nowrap text-[0.68rem] text-gray-400 light:text-gray-500">
            {label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const exampleTendencyWedges = [
  { label: "Shoot", color: "#32ade6", share: 30, percentile: 92 },
  { label: "Offensive Buildup", color: "#af52de", share: 25, percentile: 74 },
  { label: "Shot Blocking", color: "#34c759", share: 20, percentile: 48 },
  { label: "Physical Pressure", color: "#ffcc00", share: 25, percentile: 63 },
];

const DIAGRAM_CENTER = 110;
const DIAGRAM_RADIUS = 92;

const polarPoint = (radius, angle) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: DIAGRAM_CENTER + radius * Math.sin(radians),
    y: DIAGRAM_CENTER - radius * Math.cos(radians),
  };
};

const describeArc = (radius, startAngle, endAngle) => {
  const start = polarPoint(radius, startAngle);
  const end = polarPoint(radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

const describeWedge = (radius, startAngle, endAngle) =>
  `M ${DIAGRAM_CENTER} ${DIAGRAM_CENTER} L ${describeArc(radius, startAngle, endAngle).slice(2)} Z`;

const layOutWedges = (wedges) => {
  const firstShare = wedges[0].share;
  let angle = -(firstShare / 100) * 180;
  return wedges.map((wedge) => {
    const startAngle = angle;
    angle += (wedge.share / 100) * 360;
    return {
      ...wedge,
      startAngle,
      endAngle: angle,
      radius: DIAGRAM_RADIUS * (wedge.percentile / 100),
    };
  });
};

const TendencyDiagram = () => {
  const wedges = layOutWedges(exampleTendencyWedges);
  const [highlighted] = wedges;
  const radiusTip = polarPoint(highlighted.radius, 0);
  const annotationRadius = DIAGRAM_RADIUS + 6;
  return (
    <svg
      viewBox="0 0 220 220"
      className="mx-auto w-full max-w-[220px] overflow-visible"
      role="img"
      aria-label="Example tendency chart: slice width shows how often an action happens, slice length shows its percentile"
    >
      <circle
        cx={DIAGRAM_CENTER}
        cy={DIAGRAM_CENTER}
        r={DIAGRAM_RADIUS}
        className="fill-white/[0.04] stroke-white/15 light:fill-slate-100 light:stroke-slate-300"
        strokeWidth="1"
      />
      {wedges.map(({ label, color, radius, startAngle, endAngle }) => (
        <path
          key={label}
          d={describeWedge(radius, startAngle, endAngle)}
          fill={color}
          opacity={label === highlighted.label ? 1 : 0.45}
        />
      ))}
      <path
        d={describeArc(
          annotationRadius,
          highlighted.startAngle,
          highlighted.endAngle
        )}
        fill="none"
        className="stroke-white light:stroke-slate-900"
        strokeWidth="2.5"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <line
        x1={DIAGRAM_CENTER}
        y1={DIAGRAM_CENTER}
        x2={radiusTip.x}
        y2={radiusTip.y}
        className="stroke-white light:stroke-slate-900"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

const TendencyLegendRow = ({ swatch, title, body }) => (
  <div className="flex items-center gap-3 text-sm">
    {swatch}
    <span className="font-semibold text-gray-200 light:text-gray-800">
      {title}
    </span>
    <span className="text-gray-400 light:text-gray-600">{body}</span>
  </div>
);

const SectionNav = () => (
  <nav
    aria-label="Metrics sections"
    className="liquid-glass rounded-[28px] p-3 sm:p-4"
  >
    <ul className="flex flex-wrap gap-2">
      {sections.map(({ id, label }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={(event) => {
              event.preventDefault();
              document
                .getElementById(id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex rounded-full bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white light:bg-slate-900/[0.05] light:text-gray-600 light:hover:bg-slate-900/10 light:hover:text-gray-900 sm:text-sm"
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export const MetricsTab = () => (
  <div className="space-y-5 sm:space-y-6">
    <SectionNav />

    <SectionCard
      id="reading"
      icon={Percent}
      accent="sky"
      title="Reading the Numbers"
    >
      <PercentileScale />
      <DefinitionGrid items={readingPrinciples} accent="sky" />
      <ExpectedGoalsNote />
    </SectionCard>

    <SectionCard
      id="archetypes"
      icon={Tags}
      accent="sky"
      title="Archetypes"
      subtitle="Percentile thresholds to earn each badge."
    >
      {archetypeBadgeGroups.map(({ label, archetypes }) => (
        <div key={label}>
          <GroupLabel>{label}</GroupLabel>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {archetypes.map((archetype) => {
              const { name, icon: Icon } = getArchetypeBadge(archetype);
              return (
                <InsetCard key={name} className="!p-3.5">
                  <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-sm font-medium text-sky-200 light:bg-sky-100 light:text-sky-800">
                    {Icon && <Icon size={14} className="shrink-0" />}
                    {name}
                  </div>
                  <p className="text-sm text-gray-400 light:text-gray-600">
                    {archetypeCriteria[name]}
                  </p>
                </InsetCard>
              );
            })}
          </div>
        </div>
      ))}
    </SectionCard>

    <SectionCard
      id="tendencies"
      icon={PieChart}
      accent="violet"
      title="Tendencies"
    >
      <div className="grid items-center gap-5 md:grid-cols-[220px_1fr] md:gap-8">
        <TendencyDiagram />
        <div className="space-y-3">
          <TendencyLegendRow
            swatch={
              <span className="h-0 w-6 shrink-0 border-t-[2.5px] border-dashed border-white light:border-slate-900" />
            }
            title="Width"
            body="How often, vs. position average"
          />
          <TendencyLegendRow
            swatch={
              <span className="h-0.5 w-6 shrink-0 bg-white light:bg-slate-900" />
            }
            title="Length"
            body="League percentile"
          />
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <GroupLabel className="">Skater actions</GroupLabel>
          <InfluenceLegend accent="violet" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {skaterTendencies.map(({ label, color, components }) => (
            <InsetCard key={label} className="relative overflow-hidden pl-6">
              <span
                className="absolute inset-y-3 left-2.5 w-1 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h4 className="mb-3 font-semibold text-gray-100 light:text-gray-900">
                {label}
              </h4>
              <InfluenceBreakdown components={components} accent="violet" />
            </InsetCard>
          ))}
        </div>
      </div>

      <div>
        <GroupLabel>Goalie actions · per shot on goal</GroupLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          {goalieTendencies.map(({ label, color, body }) => (
            <InsetCard
              key={label}
              className="relative overflow-hidden !py-3 pl-6"
            >
              <span
                className="absolute inset-y-3 left-2.5 w-1 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h4 className="text-sm font-semibold text-gray-100 light:text-gray-900">
                {label}
              </h4>
              <p className="text-sm text-gray-400 light:text-gray-600">
                {body}
              </p>
            </InsetCard>
          ))}
        </div>
      </div>
    </SectionCard>

    <SectionCard
      id="skater-quality"
      icon={Target}
      accent="cyan"
      title="Offensive & Defensive Quality"
    >
      <QualityGroup
        title="Offensive Quality"
        items={offensiveQuality}
        accent="cyan"
      />
      <QualityGroup
        title="Defensive Quality"
        items={defensiveQuality}
        accent="rose"
      />
    </SectionCard>

    <SectionCard
      id="goalie-quality"
      icon={Activity}
      accent="cyan"
      title="Goaltending Quality & Shots Faced"
    >
      <div>
        <GroupLabel>Goaltending Quality</GroupLabel>
        <DefinitionGrid items={goaltendingQuality} accent="cyan" />
      </div>
      <div>
        <GroupLabel>Shots Faced</GroupLabel>
        <DefinitionGrid items={shotsFacedQuality} accent="rose" />
      </div>
    </SectionCard>

    <SectionCard
      id="edge"
      icon={Gauge}
      accent="emerald"
      title="NHL EDGE"
      subtitle="NHL tracking data. Color shows the league percentile."
    >
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {edgeMetrics.map(([label, unit, body]) => (
          <InsetCard
            key={label}
            className="flex items-center justify-between gap-3 !p-3.5"
          >
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-emerald-300 light:text-emerald-600">
                {label}
              </h4>
              <p className="text-sm text-gray-400 light:text-gray-600">
                {body}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-gray-400 light:bg-slate-900/[0.06] light:text-gray-500">
              {unit}
            </span>
          </InsetCard>
        ))}
      </div>
    </SectionCard>

    <SectionCard
      id="similar"
      icon={Users}
      accent="amber"
      title="Most Similar Players"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe57e] to-[#ffd037] text-sm font-bold text-[#4f3d00]">
          92
        </div>
        <dl className="grid flex-1 gap-2.5 sm:grid-cols-3">
          {similarityFacts.map(([label, body]) => (
            <div key={label}>
              <dt className="text-sm font-semibold text-amber-300 light:text-amber-600">
                {label}
              </dt>
              <dd className="text-sm text-gray-400 light:text-gray-600">
                {body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionCard>
  </div>
);
