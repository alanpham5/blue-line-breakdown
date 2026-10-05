import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const MARGIN = { top: 16, right: 18, bottom: 48, left: 56 };
const DOT_RADIUS = 4;
const HOVER_RADIUS = 6;
const HIT_DISTANCE = 24;
const TICK_COUNT = 6;

export const SCATTER_THEMES = {
  dark: {
    surface: "#16181d",
    grid: "rgba(255, 255, 255, 0.08)",
    axisText: "#9ca3af",
    fitLine: "#e5e7eb",
    series: { F: "#3987e5", D: "#d95926" },
  },
  light: {
    surface: "#f4f6fa",
    grid: "#e2e8f0",
    axisText: "#64748b",
    fitLine: "#334155",
    series: { F: "#2a78d6", D: "#eb6834" },
  },
};

const formatTick = (metric, tick) =>
  metric.tickFormat
    ? metric.tickFormat(tick)
    : Number.isInteger(tick)
      ? String(tick)
      : metric.format(tick);

const niceStep = (span, count) => {
  const rough = span / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const factor = residual >= 5 ? 10 : residual >= 2 ? 5 : residual >= 1 ? 2 : 1;
  return factor * magnitude;
};

const niceDomain = (values, fixedDomain) => {
  if (fixedDomain) return fixedDomain;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [min - 1, max + 1];
  const step = niceStep(max - min, TICK_COUNT);
  return [Math.floor(min / step) * step, Math.ceil(max / step) * step];
};

const ticksFor = ([min, max]) => {
  const step = niceStep(max - min, TICK_COUNT);
  const ticks = [];
  for (
    let tick = Math.ceil(min / step) * step;
    tick <= max + step / 1e6;
    tick += step
  ) {
    ticks.push(Number(tick.toFixed(10)));
  }
  return ticks;
};

const useContainerWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width))
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
};

export const ScatterPlot = ({
  points,
  xMetric,
  yMetric,
  fit,
  theme,
  height = 460,
}) => {
  const navigate = useNavigate();
  const [containerRef, width] = useContainerWidth();
  const [hovered, setHovered] = useState(null);

  const plot = useMemo(() => {
    if (!width || points.length === 0) return null;
    const innerWidth = Math.max(10, width - MARGIN.left - MARGIN.right);
    const innerHeight = height - MARGIN.top - MARGIN.bottom;
    const xDomain = niceDomain(
      points.map((point) => point.x),
      xMetric.domain
    );
    const yDomain = niceDomain(
      points.map((point) => point.y),
      yMetric.domain
    );
    const xScale = (value) =>
      MARGIN.left +
      ((value - xDomain[0]) / (xDomain[1] - xDomain[0])) * innerWidth;
    const yScale = (value) =>
      MARGIN.top +
      innerHeight -
      ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerHeight;
    return {
      innerWidth,
      innerHeight,
      xDomain,
      yDomain,
      xTicks: ticksFor(xDomain),
      yTicks: ticksFor(yDomain),
      xScale,
      yScale,
      placed: points.map((point) => ({
        ...point,
        px: xScale(point.x),
        py: yScale(point.y),
      })),
    };
  }, [height, points, width, xMetric.domain, yMetric.domain]);

  const nearestPoint = (event) => {
    if (!plot) return null;
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;
    let best = null;
    let bestDistance = HIT_DISTANCE;
    for (const point of plot.placed) {
      const distance = Math.hypot(point.px - pointerX, point.py - pointerY);
      if (distance <= bestDistance) {
        best = point;
        bestDistance = distance;
      }
    }
    return best;
  };

  const openPoint = (event) => {
    const point = nearestPoint(event);
    if (!point?.href) return;
    if (event.button === 1 || event.metaKey || event.ctrlKey) {
      window.open(point.href, "_blank", "noopener");
      return;
    }
    if (event.button === 0) navigate(point.href);
  };

  const fitSegment =
    plot && fit
      ? [plot.xDomain[0], plot.xDomain[1]].map((x) => ({
          x: plot.xScale(x),
          y: plot.yScale(fit.intercept + fit.slope * x),
        }))
      : null;

  const ordered = plot
    ? hovered
      ? [...plot.placed.filter((point) => point.id !== hovered.id), hovered]
      : plot.placed
    : [];

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {plot && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`Scatter plot of ${yMetric.label} against ${xMetric.label} for ${points.length} skaters`}
          className="block cursor-crosshair select-none"
          onPointerMove={(event) => setHovered(nearestPoint(event))}
          onPointerLeave={() => setHovered(null)}
          onMouseDown={(event) => event.button === 1 && event.preventDefault()}
          onMouseUp={openPoint}
        >
          <defs>
            <clipPath id="scatter-plot-area">
              <rect
                x={MARGIN.left}
                y={MARGIN.top}
                width={plot.innerWidth}
                height={plot.innerHeight}
              />
            </clipPath>
          </defs>
          {plot.yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + plot.innerWidth}
                y1={plot.yScale(tick)}
                y2={plot.yScale(tick)}
                stroke={theme.grid}
                strokeWidth="1"
              />
              <text
                x={MARGIN.left - 8}
                y={plot.yScale(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill={theme.axisText}
              >
                {formatTick(yMetric, tick)}
              </text>
            </g>
          ))}
          {plot.xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={plot.xScale(tick)}
                x2={plot.xScale(tick)}
                y1={MARGIN.top}
                y2={MARGIN.top + plot.innerHeight}
                stroke={theme.grid}
                strokeWidth="1"
              />
              <text
                x={plot.xScale(tick)}
                y={MARGIN.top + plot.innerHeight + 18}
                textAnchor="middle"
                fontSize="11"
                fill={theme.axisText}
              >
                {formatTick(xMetric, tick)}
              </text>
            </g>
          ))}
          <text
            x={MARGIN.left + plot.innerWidth / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={theme.axisText}
          >
            {xMetric.label}
          </text>
          <text
            transform={`translate(14 ${MARGIN.top + plot.innerHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={theme.axisText}
          >
            {yMetric.label}
          </text>
          <g clipPath="url(#scatter-plot-area)">
            {fitSegment && (
              <line
                x1={fitSegment[0].x}
                y1={fitSegment[0].y}
                x2={fitSegment[1].x}
                y2={fitSegment[1].y}
                stroke={theme.fitLine}
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </g>
          <g>
            {ordered.map((point) => {
              const isHovered = hovered?.id === point.id;
              return (
                <circle
                  key={point.id}
                  cx={point.px}
                  cy={point.py}
                  r={isHovered ? HOVER_RADIUS : DOT_RADIUS}
                  fill={theme.series[point.group]}
                  stroke={theme.surface}
                  strokeWidth="2"
                />
              );
            })}
          </g>
        </svg>
      )}
      {hovered && (
        <div
          className="pointer-events-none absolute z-10 min-w-[11rem] rounded-xl border border-white/10 bg-[#0b0d12]/95 px-3 py-2 text-xs shadow-xl light:border-slate-200 light:bg-white/95"
          style={{
            left: Math.min(hovered.px + 14, Math.max(0, width - 200)),
            top: Math.max(0, hovered.py - 70),
          }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-white light:text-gray-900">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: theme.series[hovered.group] }}
            />
            {hovered.label}
          </div>
          <div className="mt-0.5 text-gray-400 light:text-gray-500">
            {hovered.sub}
          </div>
          <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
            <span className="font-bold tabular-nums text-white light:text-gray-900">
              {xMetric.format(hovered.x)}
            </span>
            <span className="text-gray-400 light:text-gray-500">
              {xMetric.label}
            </span>
            <span className="font-bold tabular-nums text-white light:text-gray-900">
              {yMetric.format(hovered.y)}
            </span>
            <span className="text-gray-400 light:text-gray-500">
              {yMetric.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
