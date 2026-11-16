import { useState } from "react";
import { Fingerprint } from "lucide-react";
import { shapeMatch } from "./metrics";
import {
  ButterflyRow,
  ComparisonSection,
  SubjectMarker,
  formatPercentile,
  leaderIndex,
  subjectColor,
  subjectTint,
} from "./shared";

const CENTER_X = 250;
const CENTER_Y = 220;
const RADIUS = 140;
const LABEL_RADIUS = RADIUS + 16;
const RINGS = [25, 50, 75, 100];

const pointAt = (radius, angle) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.sin(radians),
    y: CENTER_Y - radius * Math.cos(radians),
  };
};

const wedgePath = (radius, startAngle, endAngle) => {
  const start = pointAt(radius, startAngle);
  const end = pointAt(radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CENTER_X} ${CENTER_Y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
};

const anchorFor = (angle) => {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized < 12 || normalized > 348) return "middle";
  if (normalized > 168 && normalized < 192) return "middle";
  return normalized < 180 ? "start" : "end";
};

const baselineFor = (angle) => {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized < 60 || normalized > 300) return "auto";
  if (normalized > 120 && normalized < 240) return "hanging";
  return "middle";
};

const groupSpans = (axes) =>
  axes.reduce((spans, axis, index) => {
    const last = spans[spans.length - 1];
    if (last && last.group === axis.group) {
      last.end = index;
      return spans;
    }
    return [...spans, { group: axis.group, start: index, end: index }];
  }, []);

const groupAverages = (axes) =>
  groupSpans(axes).map((span) => {
    const members = axes.slice(span.start, span.end + 1);
    const average = (index) => {
      const values = members
        .map((axis) => axis.values[index])
        .filter((value) => value != null);
      return values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : null;
    };
    return {
      group: span.group,
      competitive: members.every((axis) => axis.competitive),
      values: [average(0), average(1)],
    };
  });

const polygonPoints = (axes, index, step) =>
  axes
    .map((axis, axisIndex) => {
      const value = axis.values[index] ?? 0;
      const point = pointAt((RADIUS * value) / 100, axisIndex * step);
      return `${point.x},${point.y}`;
    })
    .join(" ");

const RadarChart = ({ axes, activeIndex, onActivate, interactive }) => {
  const step = 360 / axes.length;
  const spans = groupSpans(axes);

  return (
    <svg
      viewBox="0 0 500 440"
      className="mx-auto w-full max-w-[520px] overflow-visible"
      role="img"
      aria-label="Overlaid percentile profiles of both players"
      onMouseLeave={interactive ? () => onActivate(null) : undefined}
    >
      {spans.map((span, spanIndex) => (
        <path
          key={span.group}
          d={wedgePath(
            RADIUS,
            span.start * step - step / 2,
            span.end * step + step / 2
          )}
          className={
            spanIndex % 2 === 0
              ? "fill-white/[0.035] light:fill-slate-900/[0.035]"
              : "fill-transparent"
          }
        />
      ))}
      {RINGS.map((ring) => (
        <circle
          key={ring}
          cx={CENTER_X}
          cy={CENTER_Y}
          r={(RADIUS * ring) / 100}
          fill="none"
          className="stroke-white/10 light:stroke-slate-300"
          strokeDasharray={ring === 50 ? "3 4" : undefined}
          strokeWidth="1"
        />
      ))}
      {axes.map((axis, axisIndex) => {
        const end = pointAt(RADIUS, axisIndex * step);
        return (
          <line
            key={`spoke-${axis.label}`}
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={end.x}
            y2={end.y}
            className={
              activeIndex === axisIndex
                ? "stroke-white/50 light:stroke-slate-500"
                : "stroke-white/[0.08] light:stroke-slate-300/70"
            }
            strokeWidth="1"
          />
        );
      })}
      {[0, 1].map((index) => (
        <polygon
          key={`shape-${index}`}
          points={polygonPoints(axes, index, step)}
          fill={subjectTint(index, 26)}
          stroke={subjectColor(index)}
          strokeWidth="2.25"
          strokeLinejoin="round"
          style={{
            mixBlendMode: "var(--comparison-blend)",
            filter: `drop-shadow(0 0 10px ${subjectTint(index, 35)})`,
          }}
        />
      ))}
      {[0, 1].map((index) =>
        axes.map((axis, axisIndex) => {
          if (axis.values[index] == null) return null;
          const point = pointAt(
            (RADIUS * axis.values[index]) / 100,
            axisIndex * step
          );
          return (
            <circle
              key={`dot-${index}-${axis.label}`}
              cx={point.x}
              cy={point.y}
              r={activeIndex === axisIndex ? 5 : 3}
              fill={subjectColor(index)}
              className="transition-all"
            />
          );
        })
      )}
      {axes.map((axis, axisIndex) => {
        const angle = axisIndex * step;
        const point = pointAt(LABEL_RADIUS, angle);
        return (
          <text
            key={`label-${axis.label}`}
            x={point.x}
            y={point.y}
            textAnchor={anchorFor(angle)}
            dominantBaseline={baselineFor(angle)}
            className={`text-[13px] font-semibold transition-colors ${activeIndex === axisIndex ? "fill-white light:fill-slate-900" : "fill-gray-400 light:fill-slate-500"}`}
          >
            {axis.short}
          </text>
        );
      })}
      {interactive &&
        axes.map((axis, axisIndex) => (
          <path
            key={`hit-${axis.label}`}
            d={wedgePath(
              LABEL_RADIUS + 24,
              axisIndex * step - step / 2,
              axisIndex * step + step / 2
            )}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => onActivate(axisIndex)}
            onClick={() => onActivate(axisIndex)}
          />
        ))}
    </svg>
  );
};

const AxisReadout = ({ axis, labels, match }) => {
  if (!axis) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.025] p-4 light:border-slate-200 light:bg-white/70">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gray-500">
          Shape match
        </p>
        <p className="mt-1 text-4xl font-black tabular-nums tracking-display text-white light:text-gray-900">
          {match == null ? "—" : `${match}%`}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-gray-400 light:text-gray-600">
          How much the two shapes overlap. Point at a spoke to read it.
        </p>
      </div>
    );
  }
  const leader = axis.competitive ? leaderIndex(axis.values, false, 0.5) : null;
  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.025] p-4 light:border-slate-200 light:bg-white/70">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gray-500">
        {axis.group}
      </p>
      <p className="mt-0.5 truncate text-lg font-bold text-white light:text-gray-900">
        {axis.label}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {[0, 1].map((index) => (
          <div key={index} className={leader != null && leader !== index ? "opacity-55" : ""}>
            <p
              className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide"
              style={{ color: subjectColor(index) }}
            >
              <SubjectMarker index={index} className="h-2 w-2" />
              <span className="truncate">{labels[index]}</span>
            </p>
            <p className="text-2xl font-black tabular-nums text-white light:text-gray-900">
              {formatPercentile(axis.values[index])}
              <span className="ml-1 text-[0.6rem] font-bold uppercase text-gray-500">
                pctl
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfileRadar = ({ axes, labels, shareable }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  if (axes.length < 3) return null;
  const averages = groupAverages(axes);

  return (
    <ComparisonSection
      icon={Fingerprint}
      iconClassName="text-sky-300 light:text-sky-600"
      eyebrow="Fingerprint"
      title="Two shapes, one chart"
      description="Every percentile on one map. The further out a point sits, the better against the league."
      labels={labels}
    >
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <RadarChart
          axes={axes}
          activeIndex={activeIndex}
          onActivate={setActiveIndex}
          interactive={!shareable}
        />
        <div className="space-y-4">
          <AxisReadout
            axis={activeIndex == null ? null : axes[activeIndex]}
            labels={labels}
            match={shapeMatch(axes)}
          />
          <div className="space-y-3">
            {averages.map((average) => (
              <ButterflyRow
                key={average.group}
                label={`${average.group} avg`}
                values={average.values}
                displays={average.values.map(formatPercentile)}
                competitive={average.competitive}
              />
            ))}
          </div>
        </div>
      </div>
    </ComparisonSection>
  );
};
