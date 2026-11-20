import { Scale, Trophy } from "lucide-react";
import {
  ComparisonSection,
  SubHeading,
  SubjectMarker,
  formatPercentile,
  leaderIndex,
  subjectColor,
  subjectTint,
  toNumber,
} from "./shared";

const perGame = (stats) => {
  const games = toNumber(stats?.gamesPlayed);
  const points = toNumber(stats?.points);
  return games && points != null ? points / games : null;
};

const heightInInches = (height) => {
  const match = /(\d+)'\s*(\d+)/.exec(height || "");
  return match ? Number(match[1]) * 12 + Number(match[2]) : null;
};

const fixed = (digits) => (value) =>
  value == null ? "—" : value.toFixed(digits);

const savePct = (value) =>
  value == null ? "—" : value.toFixed(3).replace(/^0/, "");

const whole = (value) => (value == null ? "—" : String(Math.round(value)));

const skaterTape = (data) => [
  {
    label: "Games",
    value: toNumber(data.stats?.gamesPlayed),
    format: whole,
    competitive: false,
  },
  { label: "Goals", value: toNumber(data.stats?.goals), format: whole },
  { label: "Assists", value: toNumber(data.stats?.assists), format: whole },
  { label: "Points", value: toNumber(data.stats?.points), format: whole },
  { label: "Points / GP", value: perGame(data.stats), format: fixed(2) },
  {
    label: "PIM",
    value: toNumber(data.stats?.penaltyMinutes),
    format: whole,
    competitive: false,
  },
];

const goalieTape = (data) => [
  {
    label: "Games",
    value: toNumber(data.stats?.gamesPlayed),
    format: whole,
    competitive: false,
  },
  { label: "Save %", value: toNumber(data.stats?.savePct), format: savePct },
  {
    label: "GAA",
    value: toNumber(data.stats?.gaa),
    format: fixed(2),
    lowerIsBetter: true,
  },
  {
    label: "GSAx",
    value: toNumber(data.stats?.goalsSavedAboveExpected),
    format: fixed(1),
  },
  {
    label: "Saves",
    value: toNumber(data.stats?.saves),
    format: whole,
    competitive: false,
  },
  {
    label: "Shots faced",
    value: toNumber(data.stats?.shotsAgainst),
    format: whole,
    competitive: false,
  },
];

const buildTape = (data) => [
  {
    label: "Age",
    value: toNumber(data.player.age),
    format: whole,
    competitive: false,
  },
  {
    label: "Height",
    value: heightInInches(data.biometrics?.height),
    format: () => data.biometrics?.height || "—",
    competitive: false,
  },
  {
    label: "Weight",
    value: toNumber(data.biometrics?.weight),
    format: (value) => (value == null ? "—" : `${Math.round(value)} lb`),
    competitive: false,
  },
];

const TapeRow = ({
  label,
  rows,
  competitive = true,
  lowerIsBetter = false,
}) => {
  const values = rows.map((row) => row.value);
  const leader = competitive ? leaderIndex(values, lowerIsBetter, 0.001) : null;
  const cell = (index) => (
    <span
      className={`flex items-center gap-1.5 text-lg font-bold tabular-nums tracking-display sm:text-xl ${index === 0 ? "justify-end" : "justify-start"} ${leader != null && leader !== index ? "opacity-50" : ""}`}
      style={{ color: leader === index ? subjectColor(index) : undefined }}
    >
      {index === 1 && leader === 1 && (
        <SubjectMarker index={1} className="h-1.5 w-1.5" />
      )}
      <span
        className={leader === index ? "" : "text-gray-100 light:text-gray-800"}
      >
        {rows[index].format(rows[index].value)}
      </span>
      {index === 0 && leader === 0 && (
        <SubjectMarker index={0} className="h-1.5 w-1.5" />
      )}
    </span>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,1fr)] items-center py-1.5 sm:grid-cols-[minmax(0,1fr)_8rem_minmax(0,1fr)]">
      {cell(0)}
      <span className="text-center text-xs font-semibold text-gray-400 light:text-gray-500 sm:text-[0.82rem]">
        {label}
      </span>
      {cell(1)}
    </div>
  );
};

const TapeBlock = ({ title, left, right }) => (
  <div>
    <SubHeading>{title}</SubHeading>
    {left.map((row, rowIndex) => (
      <TapeRow
        key={row.label}
        label={row.label}
        rows={[row, right[rowIndex]]}
        competitive={row.competitive !== false}
        lowerIsBetter={row.lowerIsBetter}
      />
    ))}
  </div>
);

export const TaleOfTheTape = ({ left, right, labels, isGoalie }) => {
  const production = isGoalie ? goalieTape : skaterTape;
  return (
    <ComparisonSection
      icon={Scale}
      iconClassName="text-gray-300 light:text-gray-600"
      className="h-full"
      title="Box score & build"
      labels={labels}
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        <TapeBlock
          title={isGoalie ? "Results" : "Production"}
          left={production(left)}
          right={production(right)}
        />
        <TapeBlock
          title="Build"
          left={buildTape(left)}
          right={buildTape(right)}
        />
      </div>
    </ComparisonSection>
  );
};

const VerdictBar = ({ wins, ties, total }) => (
  <div
    className="flex h-3 w-full gap-[3px] overflow-hidden rounded-full"
    role="img"
    aria-label={`${wins[0]} wins, ${ties} even, ${wins[1]} wins`}
  >
    {wins[0] > 0 && (
      <div
        className="h-full rounded-l-full"
        style={{
          flexGrow: wins[0],
          background: subjectColor(0),
        }}
      />
    )}
    {ties > 0 && (
      <div
        className="h-full bg-[var(--comparison-track)]"
        style={{ flexGrow: ties }}
      />
    )}
    {wins[1] > 0 && (
      <div
        className="h-full rounded-r-full"
        style={{
          flexGrow: wins[1],
          background: subjectColor(1),
        }}
      />
    )}
    {total === 0 && (
      <div className="h-full flex-1 bg-[var(--comparison-track)]" />
    )}
  </div>
);

const EdgeList = ({ index, label, edges }) => (
  <div className="min-w-0">
    <p
      className="mb-2 flex items-center gap-1.5 text-sm font-semibold"
      style={{ color: subjectColor(index) }}
    >
      <SubjectMarker index={index} className="h-2 w-2" />
      <span className="truncate">{label} leads</span>
    </p>
    {edges.length === 0 ? (
      <p className="text-sm text-gray-500">No clear edges.</p>
    ) : (
      <ul className="space-y-1.5">
        {edges.map((edge) => (
          <li
            key={edge.label}
            className="flex items-center justify-between gap-2 text-xs sm:text-sm"
          >
            <span className="min-w-0 truncate text-gray-300 light:text-gray-700">
              {edge.short || edge.label}
            </span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
              style={{
                color: subjectColor(index),
                backgroundColor: subjectTint(index, 14),
              }}
            >
              +{formatPercentile(Math.abs(edge.gap))}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const verdictHeadline = (labels, wins, total) => {
  if (total === 0) return { text: "Not enough shared data", index: null };
  if (wins[0] === wins[1]) return { text: "Dead even", index: null };
  const index = wins[0] > wins[1] ? 0 : 1;
  return { text: labels[index], index };
};

export const Verdict = ({ verdict, labels }) => {
  const { wins, ties, total, biggestEdges } = verdict;
  const headline = verdictHeadline(labels, wins, total);

  return (
    <ComparisonSection
      icon={Trophy}
      iconClassName="text-amber-200 light:text-amber-600"
      className="h-full"
      title="Who has the edge"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className="truncate text-3xl font-bold tracking-display sm:text-4xl"
            style={{
              color:
                headline.index == null
                  ? undefined
                  : subjectColor(headline.index),
            }}
          >
            {headline.text}
          </p>
          {headline.index != null && (
            <p className="text-sm font-medium text-gray-400 light:text-gray-600">
              wins {wins[headline.index]} of {total} categories
              {ties ? ` · ${ties} even` : ""}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-baseline gap-2 text-2xl font-bold tabular-nums tracking-display">
          <span style={{ color: subjectColor(0) }}>{wins[0]}</span>
          <span className="text-sm text-gray-500">–</span>
          <span style={{ color: subjectColor(1) }}>{wins[1]}</span>
        </div>
      </div>
      <VerdictBar wins={wins} ties={ties} total={total} />
      <div className="mt-5 grid grid-cols-2 gap-4">
        {[0, 1].map((index) => (
          <EdgeList
            key={index}
            index={index}
            label={labels[index]}
            edges={biggestEdges[index]}
          />
        ))}
      </div>
    </ComparisonSection>
  );
};
