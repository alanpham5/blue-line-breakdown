import { useMemo } from "react";
import { Download, RotateCcw, Share } from "lucide-react";
import { FaceoffHero } from "features/players/components/comparison/FaceoffHero";
import { ProfileRadar } from "features/players/components/comparison/ProfileRadar";
import {
  TaleOfTheTape,
  Verdict,
} from "features/players/components/comparison/Scorecard";
import {
  DeploymentComparison,
  EdgeComparison,
  QualityComparison,
  StyleComparison,
} from "features/players/components/comparison/DetailSections";
import {
  buildRadarAxes,
  buildVerdict,
} from "features/players/components/comparison/metrics";
import {
  buildSubjectLabels,
  compactSeason,
  isGoalieData,
  subjectColor,
} from "features/players/components/comparison/shared";

const headerButtonClass =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white light:border-slate-300 light:bg-white light:text-slate-600 light:hover:text-slate-900";

const ComparisonTitle = ({ left, right, labels, isSamePlayer }) => {
  if (!left || !right) {
    return (
      <>
        <h2 className="text-xl font-bold tracking-display text-white light:text-gray-900 sm:text-3xl">
          Head-to-head
        </h2>
        <p className="mt-0.5 text-xs text-gray-400 light:text-gray-600 sm:text-sm">
          Pick two players, or two seasons of the same player.
        </p>
      </>
    );
  }
  return (
    <>
      <h2 className="text-xl font-bold tracking-display text-white light:text-gray-900 sm:text-3xl">
        <span style={{ color: subjectColor(0) }}>{labels[0]}</span>
        <span className="mx-2 text-gray-500">{isSamePlayer ? "→" : "vs"}</span>
        <span style={{ color: subjectColor(1) }}>{labels[1]}</span>
      </h2>
      <p className="mt-0.5 text-xs text-gray-400 light:text-gray-600 sm:text-sm">
        {isSamePlayer
          ? `${left.player.name}, season over season at 5-on-5.`
          : `${compactSeason(left.player.season)} vs ${compactSeason(right.player.season)} · 5-on-5, percentiles within position.`}
      </p>
    </>
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

  return (
    <div
      className={`comparison-root ${shareable ? "force-dark-player-card" : ""}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3 px-1 sm:mb-5">
        <div className="min-w-0">
          <ComparisonTitle
            left={left}
            right={right}
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
        <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200 light:text-rose-700">
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
        <p className="px-4 pb-4 pt-6 text-center text-sm text-gray-400 light:text-gray-600">
          Search for {left ? "one more player" : "two players"} to start the
          comparison.
        </p>
      )}

      {ready && (
        <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Verdict verdict={verdict} labels={labels} />
            </div>
            <div className="lg:col-span-3">
              <TaleOfTheTape
                left={left}
                right={right}
                labels={labels}
                isGoalie={isGoalie}
              />
            </div>
          </div>
          <ProfileRadar axes={axes} labels={labels} shareable={shareable} />
          {!isGoalie && (
            <DeploymentComparison left={left} right={right} labels={labels} />
          )}
          <StyleComparison left={left} right={right} labels={labels} />
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
