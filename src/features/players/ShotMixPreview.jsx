import { useEffect, useState } from "react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { PlayerTendenciesCard } from "features/players/components/PlayerTendenciesCard";
import { PlayerDifficultyCard } from "features/players/components/PlayerDifficultyCard";
import shotMixSamples from "features/players/shotMixSamples.json";

export const ShotMixPreview = () => {
  const [playerId, setPlayerId] = useState(shotMixSamples[0].playerId);
  const sample = shotMixSamples.find((player) => player.playerId === playerId);

  useEffect(() => {
    document.title = "Shot Mix Concept | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);

  return (
    <div className="ice-background min-h-screen px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <Header />
        <main className="space-y-6">
          <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit items-center rounded-full border border-violet-300/15 bg-violet-300/[0.07] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-violet-200 light:border-violet-300/50 light:bg-violet-100 light:text-violet-700">
              Shot mix concept · 2025-26 play-by-play
            </div>
            <div className="flex flex-wrap gap-2">
              {shotMixSamples.map((player) => (
                <button
                  key={player.playerId}
                  type="button"
                  onClick={() => setPlayerId(player.playerId)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    player.playerId === playerId
                      ? "bg-white text-gray-900 light:bg-gray-900 light:text-white"
                      : "bg-white/[0.06] text-gray-300 hover:bg-white/[0.12] light:bg-white/70 light:text-gray-700"
                  }`}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <div className="md:col-span-2 lg:col-span-1">
              <PlayerTendenciesCard
                tendencies={sample.tendencies}
                shotMix={sample}
                compact
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <PlayerDifficultyCard
                difficulty={sample.difficulty}
                position={sample.playerPosition}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};
