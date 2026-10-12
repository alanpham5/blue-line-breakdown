import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowLeft, Target } from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { ShareableModal } from "components/ui/ShareableModal";
import { PlayerHeader } from "features/players/components/PlayerHeader";
import { WarPercentileCard } from "features/players/components/WarPercentileCard";
import { CountingStats } from "features/players/components/CountingStats";
import { SimilarPlayersSection } from "features/players/components/SimilarPlayersSection";
import { PlayerTendenciesCard } from "features/players/components/PlayerTendenciesCard";
import { PlayerQualityCard } from "features/players/components/PlayerQualityCard";
import { PlayerProfileShareablePreview } from "features/players/components/shareable/PlayerProfileShareablePreview";

const exampleGoalie = {
  playerId: 8476945,
  name: "Connor Hellebuyck",
  team: "WPG",
  season: 2024,
  position: "G",
  age: 31,
  warPercentile: 99.4,
  role: "Elite Starter",
  archetypes: ["Big Save Machine", "Workhorse"],
};

const exampleBiometrics = { height: `6' 4"`, weight: 207 };

const exampleStats = {
  gamesPlayed: 63,
  shotsAgainst: 1854,
  saves: 1711,
  gaa: 2.0,
  goalsAgainst: 126,
  savePct: 0.923,
};

const goalieTendencies = [
  { label: "Puck Freeze", percentage: 61, percentile: 91 },
  { label: "Rebounds", percentage: 39, percentile: 28 },
];

const goalieShotMap = {
  areas: [
    { area: "Behind the Net", shotsAgainst: 5, savePct: 1.0, percentile: 42 },
    { area: "L Corner", shotsAgainst: 0, savePct: null, percentile: null },
    { area: "R Corner", shotsAgainst: 1, savePct: 1.0, percentile: 21 },
    { area: "L Net Side", shotsAgainst: 34, savePct: 0.941, percentile: 73 },
    { area: "Crease", shotsAgainst: 53, savePct: 0.868, percentile: 96 },
    { area: "R Net Side", shotsAgainst: 42, savePct: 0.952, percentile: 65 },
    { area: "Low Slot", shotsAgainst: 354, savePct: 0.845, percentile: 90 },
    { area: "Outside L", shotsAgainst: 99, savePct: 0.96, percentile: 31 },
    { area: "L Circle", shotsAgainst: 149, savePct: 0.893, percentile: 35 },
    { area: "High Slot", shotsAgainst: 150, savePct: 0.927, percentile: 98 },
    { area: "R Circle", shotsAgainst: 149, savePct: 0.899, percentile: 33 },
    { area: "Outside R", shotsAgainst: 87, savePct: 0.966, percentile: 52 },
    { area: "L Point", shotsAgainst: 138, savePct: 0.993, percentile: 83 },
    { area: "Center Point", shotsAgainst: 141, savePct: 0.957, percentile: 50 },
    { area: "R Point", shotsAgainst: 158, savePct: 0.981, percentile: 50 },
  ],
  totals: [
    { locationCode: "high", savePct: 0.848, percentile: 94 },
    { locationCode: "mid", savePct: 0.906, percentile: 82 },
    { locationCode: "long", savePct: 0.977, percentile: 67 },
  ],
};

const goaltendingQuality = [
  { label: "Save Percentage", value: 98 },
  { label: "Goals Against / 60", value: 97 },
  { label: "Goals Save Above Expected", value: 99 },
];

const shotsFacedQuality = [
  { label: "Low Danger Saves", value: 93 },
  { label: "Medium Danger Saves", value: 96 },
  { label: "High Danger Saves", value: 98 },
];

const similarGoalies = [
  {
    playerId: 8476883,
    name: "Andrei Vasilevskiy",
    team: "TBL",
    season: 2024,
    similarity: 94,
  },
  {
    playerId: 8478048,
    name: "Igor Shesterkin",
    team: "NYR",
    season: 2024,
    similarity: 92,
  },
  {
    playerId: 8477424,
    name: "Juuse Saros",
    team: "NSH",
    season: 2024,
    similarity: 89,
  },
  {
    playerId: 8480382,
    name: "Ilya Sorokin",
    team: "NYI",
    season: 2024,
    similarity: 87,
  },
  {
    playerId: 8479979,
    name: "Jake Oettinger",
    team: "DAL",
    season: 2024,
    similarity: 85,
  },
];

export const GoalieProfilePreview = () => {
  const [showShareableModal, setShowShareableModal] = useState(false);

  useEffect(() => {
    document.title = "Goalie Profile Preview | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);

  return (
    <div className="ice-background min-h-screen px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <Header />

        <main className="space-y-8 sm:space-y-10">
          <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit items-center rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-cyan-200 light:border-cyan-300/50 light:bg-cyan-100 light:text-cyan-700">
              Goalie profile concept · sample data
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/players/profile-preview"
                className="text-sm font-semibold text-violet-300 transition hover:text-violet-200 light:text-violet-700 light:hover:text-violet-800"
              >
                Skater concept
              </Link>
              <Link
                to="/players"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition hover:text-sky-200 light:text-sky-700 light:hover:text-sky-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Player search
              </Link>
            </div>
          </div>

          <section
            className="space-y-4 sm:space-y-6"
            aria-label="Goalie overview"
          >
            <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-stretch">
              <div className="w-full min-w-0 lg:flex-1">
                <PlayerHeader
                  player={exampleGoalie}
                  biometrics={exampleBiometrics}
                  onShareClick={() => setShowShareableModal(true)}
                />
              </div>
              <div className="w-full shrink-0 lg:flex lg:w-96 lg:items-center">
                <WarPercentileCard
                  role={exampleGoalie.role}
                  warPercentile={exampleGoalie.warPercentile}
                />
              </div>
            </div>

            <CountingStats stats={exampleStats} />
          </section>

          <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 lg:col-span-1">
              <PlayerTendenciesCard
                tendencies={goalieTendencies}
                shotMap={goalieShotMap}
              />
            </div>
            <PlayerQualityCard
              title="Goaltending Quality"
              icon={Target}
              stats={goaltendingQuality}
              type="shotStopping"
            />
            <PlayerQualityCard
              title="Shots Faced"
              icon={Activity}
              stats={shotsFacedQuality}
              type="workload"
            />
          </section>

          <SimilarPlayersSection
            players={similarGoalies}
            onPlayerClick={() => {}}
            filterYear={null}
            onFilterYearChange={() => {}}
          />
        </main>

        <Footer />
      </div>

      <ShareableModal
        isOpen={showShareableModal}
        onClose={() => setShowShareableModal(false)}
        fileName="connor-hellebuyck-goalie-profile-preview"
      >
        <PlayerProfileShareablePreview
          player={exampleGoalie}
          biometrics={exampleBiometrics}
          tendencies={goalieTendencies}
          offensiveQuality={goaltendingQuality}
          defensiveQuality={shotsFacedQuality}
          stats={exampleStats}
          similarPlayers={similarGoalies}
          shotMap={goalieShotMap}
        />
      </ShareableModal>
    </div>
  );
};
