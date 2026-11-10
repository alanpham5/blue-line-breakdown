import { Tooltip } from "components/ui/Tooltip";
import { getOrdinal } from "utils/ordinal";
import { getPercentileHue } from "utils/percentileColor";
import { useTheme } from "providers/ThemeContext";

export const SHARE_STATS = [
  {
    key: "possession",
    label: "Possession",
    short: "CF",
    name: "shot attempts",
  },
  { key: "chances", label: "Chances", short: "xGF", name: "expected goals" },
  { key: "goals", label: "Goals", short: "GF", name: "goals" },
];

const formatCount = (value, decimals) =>
  value == null ? "-" : Number(value).toFixed(decimals);

export const formatToi = (minutes) => {
  const seconds = Math.round((Number(minutes) || 0) * 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

export const formatShare = (value) =>
  value == null ? "-" : `${(Number(value) * 100).toFixed(1)}%`;

const toneColor = (percentile, onLight) => {
  const hue = getPercentileHue(percentile);
  return hue == null ? undefined : `hsl(${hue}, 85%, ${onLight ? 40 : 60}%)`;
};

const shareTone = (value, onLight) =>
  value == null
    ? undefined
    : toneColor(50 + (Number(value) - 0.5) * 250, onLight);

const useOnLight = (shareable) => {
  const { actualTheme } = useTheme();
  return !shareable && actualTheme === "light";
};

const formatDelta = (delta) => {
  const points = Math.round(delta * 1000) / 10;
  if (points === 0) return "±0.0";
  return `${points > 0 ? "+" : "−"}${Math.abs(points).toFixed(1)}`;
};

const deltaTone = (delta, shareable) => {
  if (Math.round(delta * 1000) === 0) {
    return shareable ? "text-gray-400" : "text-gray-400 light:text-slate-600";
  }
  if (delta > 0) {
    return shareable
      ? "text-emerald-400"
      : "text-emerald-400 light:text-emerald-700";
  }
  return shareable ? "text-rose-400" : "text-rose-400 light:text-rose-700";
};

export const ShareTooltipContent = ({ stat, values }) => {
  const decimals = stat.key === "chances" ? 2 : 0;
  return (
    <div className="space-y-1.5">
      <div className="font-semibold text-white light:text-gray-900">
        {stat.label} · {stat.short}%
      </div>
      <div className="flex justify-between gap-3 tabular-nums">
        <span>{stat.short} for</span>
        <span className="font-semibold">
          {formatCount(values.for, decimals)}
        </span>
      </div>
      <div className="flex justify-between gap-3 tabular-nums">
        <span>{stat.short} against</span>
        <span className="font-semibold">
          {formatCount(values.against, decimals)}
        </span>
      </div>
      <div className="flex justify-between gap-3 tabular-nums">
        <span>Share of {stat.name}</span>
        <span className="font-semibold">{formatShare(values.value)}</span>
      </div>
      {values.percentile != null && (
        <div className="flex justify-between gap-3 tabular-nums">
          <span>League percentile</span>
          <span className="font-semibold">{getOrdinal(values.percentile)}</span>
        </div>
      )}
    </div>
  );
};

const barDisplay = (values, mode, onLight = false) => {
  const showPercentile = mode === "percentile";
  const amount = showPercentile
    ? values?.percentile
    : values?.value == null
      ? null
      : values.value * 100;
  return {
    showPercentile,
    amount,
    width: amount == null ? 0 : Math.min(100, Math.max(0, amount)),
    color: showPercentile
      ? toneColor(values?.percentile, onLight)
      : shareTone(values?.value, onLight),
    label: showPercentile
      ? values?.percentile == null
        ? "-"
        : getOrdinal(values.percentile)
      : formatShare(values?.value),
  };
};

const BarBody = ({ stat, display, delta, shareable = false }) => (
  <>
    <span
      className={
        shareable
          ? "mb-2 flex items-baseline justify-between gap-2"
          : "mb-1 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-1"
      }
    >
      <span
        className={`min-w-0 truncate font-semibold text-gray-400 ${shareable ? "text-lg" : "text-[11px] light:text-slate-600 sm:text-xs"}`}
        data-export-nudge={shareable ? 6 : undefined}
      >
        {stat.label}
      </span>
      <span className="flex shrink-0 items-baseline gap-1.5">
        <span
          className={`font-bold ${shareable ? "text-2xl" : "text-xs tabular-nums sm:text-sm"}`}
          style={{ color: display.color }}
          data-export-nudge={shareable ? 8 : undefined}
        >
          {display.label}
        </span>
        {delta != null && (
          <span
            className={`font-semibold ${deltaTone(delta, shareable)} ${shareable ? "text-base" : "text-[11px] tabular-nums sm:text-xs"}`}
            data-export-nudge={shareable ? 6 : undefined}
          >
            {formatDelta(delta)}
          </span>
        )}
      </span>
    </span>
    <span
      className={`relative block w-full overflow-hidden rounded-full bg-white/[0.06] ${shareable ? "h-3.5" : "h-2.5 light:bg-slate-300"}`}
    >
      <span
        className="block h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${display.width}%`, background: display.color }}
      />
      {!display.showPercentile && (
        <span
          className={`absolute inset-y-0 left-1/2 w-px bg-white/30 ${shareable ? "" : "light:bg-slate-400"}`}
          aria-hidden="true"
        />
      )}
    </span>
  </>
);

export const ShareBar = ({
  id,
  stat,
  values,
  mode,
  delta,
  shareable = false,
}) => {
  const display = barDisplay(values, mode, useOnLight(shareable));
  if (shareable) {
    return (
      <div className="block w-full min-w-0">
        <BarBody stat={stat} display={display} delta={delta} shareable />
      </div>
    );
  }
  return (
    <Tooltip
      id={id}
      width="w-56"
      content={<ShareTooltipContent stat={stat} values={values || {}} />}
    >
      <button
        type="button"
        className="block w-full min-w-0 cursor-default rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#7ee340]"
        aria-label={`${stat.label}: ${display.label}${delta != null ? `, ${formatDelta(delta)} vs together` : ""}`}
      >
        <BarBody stat={stat} display={display} delta={delta} />
      </button>
    </Tooltip>
  );
};

const RING_RADIUS = 18;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ringLabel = (display) => {
  if (display.amount == null) return "-";
  return display.showPercentile
    ? String(Math.round(display.amount))
    : display.amount.toFixed(1);
};

const RingBody = ({ display, shareable = false }) => (
  <span
    className={`relative flex shrink-0 items-center justify-center ${shareable ? "h-[74px] w-[74px]" : "h-10 w-10 sm:h-[52px] sm:w-[52px]"}`}
  >
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 44 44"
      aria-hidden="true"
    >
      <g transform="rotate(-90 22 22)">
        <circle
          cx="22"
          cy="22"
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          className={shareable ? undefined : "light:stroke-slate-300"}
          strokeWidth="4"
        />
        {display.amount != null && (
          <circle
            cx="22"
            cy="22"
            r={RING_RADIUS}
            fill="none"
            stroke={display.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - display.width / 100)}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        )}
      </g>
    </svg>
    <span
      className={`relative font-bold text-white ${shareable ? "text-[1.35rem]" : `light:text-gray-900 ${display.showPercentile ? "text-[11px]" : "text-[10px] tracking-tight"} tabular-nums sm:text-sm sm:tracking-normal`}`}
      data-export-nudge={shareable ? 8 : undefined}
    >
      {ringLabel(display)}
    </span>
  </span>
);

export const ShareRing = ({ id, stat, values, mode, shareable = false }) => {
  const display = barDisplay(values, mode, useOnLight(shareable));
  if (shareable) {
    return (
      <div className="flex justify-center">
        <RingBody display={display} shareable />
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <Tooltip
        id={id}
        width="w-56"
        content={<ShareTooltipContent stat={stat} values={values || {}} />}
      >
        <button
          type="button"
          className="cursor-default rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#7ee340]"
          aria-label={`${stat.label}: ${display.label}`}
        >
          <RingBody display={display} />
        </button>
      </Tooltip>
    </div>
  );
};
