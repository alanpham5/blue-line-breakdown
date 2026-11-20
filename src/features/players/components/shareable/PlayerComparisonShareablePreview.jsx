import { PlayerComparison } from "features/players/components/PlayerComparison";

export const PlayerComparisonShareablePreview = ({ entries }) => (
  <div
    className="shareable-display-dark"
    data-export-scale="1"
    data-export-true-baseline="true"
    style={{
      width: 1500,
      minHeight: 1000,
      color: "white",
      padding: "24px",
      background:
        "radial-gradient(circle at 16% 0%, rgba(50, 173, 230, 0.1) 0%, rgba(50, 173, 230, 0) 27%), radial-gradient(circle at 94% 20%, rgba(175, 82, 222, 0.09) 0%, rgba(175, 82, 222, 0) 25%), radial-gradient(circle at 50% 100%, rgba(52, 199, 89, 0.06) 0%, rgba(52, 199, 89, 0) 28%), linear-gradient(180deg, #020202 0%, #070708 45%, #0b0b0d 100%)",
    }}
  >
    <div className="mb-4 flex items-center justify-between px-2">
      <div className="flex items-center gap-3">
        <img src="/blb-dark.png" alt="" className="h-12 w-12" />
        <div>
          <div className="text-2xl font-bold">Blue Line Breakdown</div>
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
            Player comparison
          </div>
        </div>
      </div>
      <div className="text-lg font-bold text-white/60">
        bluelinebreakdown.com
      </div>
    </div>
    <PlayerComparison
      entries={entries}
      error=""
      onRemove={() => {}}
      onReset={() => {}}
      onSeasonChange={() => {}}
      shareable
    />
  </div>
);
