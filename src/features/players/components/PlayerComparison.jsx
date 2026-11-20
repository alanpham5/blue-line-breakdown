import { useMemo } from "react";
import { Download, RotateCcw, Share } from "lucide-react";
import { FaceoffHero } from "features/players/components/comparison/FaceoffHero";
import {
  TaleOfTheTape,
  Verdict,
} from "features/players/components/comparison/Scorecard";
import {
  DeploymentComparison,
  EdgeComparison,
  QualityComparison,
  TendenciesComparison,
} from "features/players/components/comparison/DetailSections";
import {
  buildRadarAxes,
  buildVerdict,
} from "features/players/components/comparison/metrics";
import {
  buildSubjectLabels,
  isGoalieData,
  subjectColor,
} from "features/players/components/comparison/shared";
import { buildSubjectPalette } from "features/players/components/comparison/subjectPalette";
import { useTheme } from "providers/ThemeContext";

const headerButtonClass =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-white/10 text-gray-200 transition hover:bg-white/15 hover:text-white light:bg-slate-900/[0.06] light:text-slate-700 light:hover:bg-slate-900/10 light:hover:text-slate-900";

const titleClass =
  "text-2xl font-bold tracking-display text-white light:text-gray-900 sm:text-3xl";

const ComparisonTitle = ({ ready, labels, isSamePlayer }) => {
  if (!ready) return <h2 className={titleClass}>Head-to-head</h2>;
  return (
    <h2 className={titleClass}>
      <span style={{ color: subjectColor(0) }}>{labels[0]}</span>
      <span className="mx-2 text-gray-500">{isSamePlayer ? "→" : "vs"}</span>
      <span style={{ color: subjectColor(1) }}>{labels[1]}</span>
    </h2>
  );
};

export const PlayerComparison = ({
  entries,
  error,
  onRemove,
  onReset,
  onSeasonChange,
  onSwap,
  onShareClick,
  shareable = false,
}) => {
  const { actualTheme } = useTheme();
  const [leftEntry, rightEntry] = entries;
  const left = leftEntry?.data || null;
  const right = rightEntry?.data || null;
  const ready = Boolean(left && right);
  const isSamePlayer =
    ready && String(left.player.playerId) === String(right.player.playerId);
  const isGoalie = ready && isGoalieData(left);
  const labels = ready ? buildSubjectLabels(left, right, isSamePlayer) : [];
  const axes = useMemo(
    () => (ready ? buildRadarAxes(left, right, isGoalie) : []),
    [ready, left, right, isGoalie]
  );
  const verdict = useMemo(
    () => (ready ? buildVerdict(left, right, axes) : null),
    [ready, left, right, axes]
  );

  const palette = buildSubjectPalette(
    left?.player,
    right?.player,
    shareable ? "dark" : actualTheme
  );

  return (
    <div
      className={`comparison-root ${shareable ? "force-dark-player-card" : ""}`}
      style={palette}
    >
      <div className="mb-4 flex items-center justify-between gap-3 px-1 sm:mb-5">
        <div className="min-w-0">
          <ComparisonTitle
            ready={ready}
            labels={labels}
            isSamePlayer={isSamePlayer}
          />
        </div>
        {!shareable && (leftEntry || rightEntry) && (
          <div className="flex items-center gap-2">
            {ready && onShareClick && (
              <button
                type="button"
                onClick={onShareClick}
                className={`${headerButtonClass} h-9 w-9`}
                aria-label="Download shareable comparison"
              >
                <Download className="hidden h-4 w-4 sm:block" />
                <Share className="h-4 w-4 sm:hidden" />
              </button>
            )}
            <button
              type="button"
              onClick={onReset}
              className={`${headerButtonClass} px-3 py-2 text-xs font-semibold`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200 light:text-rose-700">
          {error}
        </div>
      )}

      <FaceoffHero
        entries={entries}
        isSamePlayer={isSamePlayer}
        onRemove={onRemove}
        onSeasonChange={onSeasonChange}
        onSwap={onSwap}
        shareable={shareable}
      />

      {!ready && (
        <p className="px-4 pb-4 pt-6 text-center text-sm font-medium text-gray-400 light:text-gray-600">
          Search for {left ? "one more player" : "two players"} to start the
          comparison.
        </p>
      )}

      {ready && (
        <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5 export:grid-cols-5">
            <div className="lg:col-span-2 export:col-span-2">
              <Verdict verdict={verdict} labels={labels} />
            </div>
            <div className="lg:col-span-3 export:col-span-3">
              <TaleOfTheTape
                left={left}
                right={right}
                labels={labels}
                isGoalie={isGoalie}
              />
            </div>
          </div>
          <div
            className={
              shareable && !isGoalie
                ? "grid grid-cols-2 items-stretch gap-6"
                : "space-y-4 sm:space-y-6"
            }
          >
            <TendenciesComparison left={left} right={right} labels={labels} />
            {!isGoalie && (
              <DeploymentComparison
                left={left}
                right={right}
                labels={labels}
                shareable={shareable}
              />
            )}
          </div>
          <QualityComparison
            left={left}
            right={right}
            labels={labels}
            isGoalie={isGoalie}
          />
          {!isGoalie && (
            <EdgeComparison left={left} right={right} labels={labels} />
          )}
        </div>
      )}
    </div>
  );
};
