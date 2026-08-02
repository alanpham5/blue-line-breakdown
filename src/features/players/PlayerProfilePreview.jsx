import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Target } from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { PlayerHeader } from "features/players/components/PlayerHeader";
import { WarPercentileCard } from "features/players/components/WarPercentileCard";
import { CountingStats } from "features/players/components/CountingStats";
import { EdgeStats } from "features/players/components/EdgeStats";
import { SimilarPlayersSection } from "features/players/components/SimilarPlayersSection";
import { PlayerTendenciesCard } from "features/players/components/PlayerTendenciesCard";
import { PlayerQualityCard } from "features/players/components/PlayerQualityCard";
import { ShareableModal } from "components/ui/ShareableModal";
import { PlayerProfileShareablePreview } from "features/players/components/shareable/PlayerProfileShareablePreview";

const examplePlayer = {
  playerId: 8471675,
  name: "Sidney Crosby",
  team: "PIT",
  season: 2009,
  position: "F",
  age: 22,
  warPercentile: 98.7,
  role: "Playmaker",
  archetypes: ["Magician", "200-Foot Player"],
};

const exampleTendencies = [
  { label: "Shoot", percentage: 28, percentile: 74 },
  { label: "Offensive Buildup", percentage: 45, percentile: 96 },
  { label: "Physical Pressure", percentage: 19, percentile: 62 },
  { label: "Shot Blocking", percentage: 8, percentile: 38 },
];

const offensiveQuality = [
  {
    label: "Chance Creation",
    shortLabel: "Creation",
    value: 97,
  },
  { label: "Positioning", shortLabel: "Positioning", value: 91 },
  { label: "Finishing", shortLabel: "Finishing", value: 86 },
];

const defensiveQuality = [
  { label: "Takeaways", shortLabel: "Takeaways", value: 88 },
  {
    label: "Chance Suppression",
    shortLabel: "Suppression",
    value: 79,
  },
  { label: "Goal Prevention", shortLabel: "Prevention", value: 72 },
];

const exampleSimilarPlayers = [
  {
    playerId: 8471214,
    name: "Evgeni Malkin",
    team: "PIT",
    season: 2009,
    similarity: 94,
  },
  {
    playerId: 8470638,
    name: "Patrice Bergeron",
    team: "BOS",
    season: 2009,
    similarity: 91,
  },
  {
    playerId: 8466139,
    name: "Joe Thornton",
    team: "SJS",
    season: 2009,
    similarity: 89,
  },
  {
    playerId: 8470595,
    name: "Eric Staal",
    team: "CAR",
    season: 2009,
    similarity: 87,
  },
  {
    playerId: 8470612,
    name: "Ryan Getzlaf",
    team: "ANA",
    season: 2009,
    similarity: 85,
  },
];

export const PlayerProfilePreview = () => {
  const [showShareableModal, setShowShareableModal] = useState(false);

  useEffect(() => {
    document.title = "Player Profile Preview | Blue Line Breakdown";
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
            <div className="inline-flex w-fit items-center rounded-full border border-violet-300/15 bg-violet-300/[0.07] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-violet-200 light:border-violet-300/50 light:bg-violet-100 light:text-violet-700">
              Profile concept · sample data
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/players/goalie-profile-preview"
                className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200 light:text-cyan-700 light:hover:text-cyan-800"
              >
                Goalie concept
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
            aria-label="Player overview"
          >
            <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-stretch">
              <div className="w-full min-w-0 lg:flex-1">
                <PlayerHeader
                  player={examplePlayer}
                  biometrics={{ height: `5' 11"`, weight: 200 }}
                  onShareClick={() => setShowShareableModal(true)}
                />
              </div>
              <div className="w-full shrink-0 lg:flex lg:w-96 lg:items-center">
                <WarPercentileCard
                  role={examplePlayer.role}
                  warPercentile={examplePlayer.warPercentile}
                />
              </div>
            </div>

            <CountingStats
              stats={{
                gamesPlayed: 81,
                goals: 51,
                assists: 58,
                points: 109,
                penaltyMinutes: 71,
              }}
            />
          </section>

          <section className="space-y-4 sm:space-y-6">
            <PlayerTendenciesCard tendencies={exampleTendencies} />

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <PlayerQualityCard
                title="Offensive Quality"
                icon={Target}
                stats={offensiveQuality}
                type="offensive"
              />
              <PlayerQualityCard
                title="Defensive Quality"
                icon={Shield}
                stats={defensiveQuality}
                type="defensive"
              />
            </div>
          </section>

          <section className="space-y-4 sm:space-y-6">
            <EdgeStats
              edgeValues={{
                TOP_SPEED: 23.4,
                SPEED_BURSTS: 118,
                SHOT_SPEED: 91.8,
                DIST_SKATED: 267.2,
                DIST_GAME: 3.3,
                OZONE: 61.4,
              }}
              edgePercentiles={{
                TOP_SPEED: 81,
                SPEED_BURSTS: 92,
                SHOT_SPEED: 77,
                DIST_SKATED: 89,
                DIST_GAME: 84,
                OZONE: 96,
              }}
            />

            <SimilarPlayersSection
              players={exampleSimilarPlayers}
              onPlayerClick={() => {}}
              filterYear={null}
              onFilterYearChange={() => {}}
            />
          </section>
        </main>

        <Footer />
      </div>

      <ShareableModal
        isOpen={showShareableModal}
        onClose={() => setShowShareableModal(false)}
        fileName="sidney-crosby-profile-preview"
      >
        <PlayerProfileShareablePreview
          player={examplePlayer}
          biometrics={{ height: `5' 11"`, weight: 200 }}
          tendencies={exampleTendencies}
          offensiveQuality={offensiveQuality}
          defensiveQuality={defensiveQuality}
          stats={{
            gamesPlayed: 81,
            goals: 51,
            assists: 58,
            points: 109,
            penaltyMinutes: 71,
          }}
          edgeValues={{
            TOP_SPEED: 23.4,
            SPEED_BURSTS: 118,
            SHOT_SPEED: 91.8,
            DIST_SKATED: 267.2,
            DIST_GAME: 3.3,
            OZONE: 61.4,
          }}
          edgePercentiles={{
            TOP_SPEED: 81,
            SPEED_BURSTS: 92,
            SHOT_SPEED: 77,
            DIST_SKATED: 89,
            DIST_GAME: 84,
            OZONE: 96,
          }}
          similarPlayers={exampleSimilarPlayers}
        />
      </ShareableModal>
    </div>
  );
};
