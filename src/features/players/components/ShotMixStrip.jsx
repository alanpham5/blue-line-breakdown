import { getOrdinal } from "utils/ordinal";

export const SHOOT_BLUE = "#32ade6";

export const SHOT_TYPE_SHADES = {
  Wrist: { fill: "#a8e6ff" },
  Snap: { fill: "#4cc3f7" },
  Slap: { fill: "#0a84ff" },
  Backhand: { fill: "#0052b8" },
  "Tip & Deflection": { fill: "#5658e0" },
};

const SHORT_LABELS = { "Tip & Deflection": "Tip" };
const PHONE_LABELS = { Backhand: "Back" };

const chartedShots = (shotMix) =>
  shotMix.shots
    .filter((shot) => SHOT_TYPE_SHADES[shot.label])
    .map((shot) => ({ ...shot, shade: SHOT_TYPE_SHADES[shot.label] }));

const percentileLabel = (percentile) =>
  percentile == null ? "–" : getOrdinal(percentile);

const shareLabel = (share) =>
  share == null ? "–" : `${Math.round(Number(share))}%`;

const exportNudge = (shareable, amount) => (shareable ? amount : undefined);

const ShotMixBar = ({ shots, shareable }) => {
  const total = shots.reduce((sum, shot) => sum + shot.attempts, 0) || 1;
  return (
    <div
      className={`flex w-full gap-[2px] overflow-hidden rounded-full ${shareable ? "h-3.5" : "h-2.5"}`}
      role="img"
      aria-label={shots
        .map(
          (shot) =>
            `${shot.label}: ${shot.attempts} shots, ${shareLabel(shot.share)} of shot mix, ${percentileLabel(shot.percentile)} percentile`
        )
        .join(". ")}
    >
      {shots.map((shot) => (
        <div
          key={shot.label}
          className="min-w-0 transition-all duration-1000 ease-out"
          style={{
            width: `${(shot.attempts / total) * 100}%`,
            backgroundColor: shot.shade.fill,
          }}
        />
      ))}
    </div>
  );
};

const ShotTile = ({ shot, shareable }) => (
  <div
    className={`min-w-0 rounded-xl border border-white/[0.05] bg-white/[0.025] text-center ${shareable ? "px-2 py-2.5" : "px-1.5 py-1.5 light:border-slate-200 light:bg-white/55"}`}
  >
    <div
      className={`flex items-center justify-center gap-1.5 font-semibold text-gray-200 ${shareable ? "text-base" : "text-[0.7rem] light:text-gray-800"}`}
    >
      <span
        className={`shrink-0 rounded-full ${shareable ? "h-2.5 w-2.5" : "h-1.5 w-1.5"}`}
        style={{ backgroundColor: shot.shade.fill }}
      />
      {shareable ? (
        <span className="truncate" data-export-nudge={6}>
          {SHORT_LABELS[shot.label] || shot.label}
        </span>
      ) : (
        <>
          <span className="truncate sm:hidden">
            {PHONE_LABELS[shot.label] || SHORT_LABELS[shot.label] || shot.label}
          </span>
          <span className="hidden truncate sm:inline">
            {SHORT_LABELS[shot.label] || shot.label}
          </span>
        </>
      )}
    </div>
    <div
      className={`flex items-baseline justify-center gap-1 whitespace-nowrap font-bold tabular-nums text-white ${shareable ? "text-2xl leading-tight" : "mt-0.5 text-sm light:text-gray-900"}`}
      data-export-nudge={exportNudge(shareable, 8)}
    >
      {shot.attempts}
      <span
        className={`font-medium text-gray-400 light:text-gray-500 ${shareable ? "text-lg" : "text-xs"}`}
      >
        {shareLabel(shot.share)}
      </span>
    </div>
    <div
      className={`whitespace-nowrap font-medium tabular-nums text-gray-400 ${shareable ? "text-lg leading-tight" : "text-xs light:text-gray-500"}`}
      data-export-nudge={exportNudge(shareable, 8)}
    >
      {percentileLabel(shot.percentile)}
    </div>
  </div>
);

export const ShotMixStrip = ({
  shotMix,
  shareable = false,
  linked = false,
  onLinkChange,
}) => {
  const shots = chartedShots(shotMix);

  return (
    <div
      className={`border-t border-white/[0.06] ${shareable ? "mt-4 pt-4" : "mt-5 pt-4 light:border-slate-200"}`}
      onMouseEnter={onLinkChange ? () => onLinkChange(true) : undefined}
      onMouseLeave={onLinkChange ? () => onLinkChange(false) : undefined}
    >
      <div
        className={`rounded-2xl transition-colors duration-300 ${shareable ? "" : "p-2.5"} ${linked ? "bg-[#32ade6]/[0.08] ring-1 ring-[#32ade6]/40" : "ring-1 ring-transparent"}`}
      >
        <div
          className={`relative flex items-center justify-between gap-3 pl-3.5 ${shareable ? "mb-3" : "mb-2.5"}`}
        >
          <span
            className="absolute inset-y-0.5 left-0 w-1 rounded-full shadow-[0_0_12px_currentColor]"
            style={{ backgroundColor: SHOOT_BLUE, color: SHOOT_BLUE }}
          />
          <div className="min-w-0">
            <h4
              className={`font-semibold text-gray-200 ${shareable ? "text-xl" : "text-sm light:text-gray-800"}`}
              data-export-nudge={exportNudge(shareable, 6)}
            >
              Shot Mix
            </h4>
          </div>
          <div className="shrink-0 text-right">
            <div
              className={`font-bold tabular-nums text-white ${shareable ? "text-xl" : "text-sm light:text-gray-900"}`}
              data-export-nudge={exportNudge(shareable, 6)}
            >
              {shotMix.attempts}
            </div>
            <div
              className={`font-semibold uppercase tracking-[0.04em] text-gray-500 ${shareable ? "text-[0.72rem]" : "text-[0.6rem]"}`}
              data-export-nudge={exportNudge(shareable, 5)}
            >
              unblocked
            </div>
          </div>
        </div>
        <ShotMixBar shots={shots} shareable={shareable} />
        <div
          className={`grid grid-cols-5 ${shareable ? "mt-3 gap-2" : "mt-2.5 gap-1.5"}`}
        >
          {shots.map((shot) => (
            <ShotTile key={shot.label} shot={shot} shareable={shareable} />
          ))}
        </div>
      </div>
    </div>
  );
};
