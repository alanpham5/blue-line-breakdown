import {
  ArchetypeBadge,
  archetypeBadgeGroups,
} from "features/players/components/ArchetypeBadge";

export const ArchetypeBadgePreview = () => (
  <main className="min-h-screen bg-[#050608] px-6 py-16 text-white sm:px-10">
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-display">
        Player Archetype Badges
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        Hover or focus a badge to view its definition.
      </p>

      <div className="mt-14 space-y-14">
        {archetypeBadgeGroups.map(({ label, archetypes }) => (
          <section key={label}>
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              {label}
            </h2>
            <div className="flex flex-wrap gap-3">
              {archetypes.map((archetype) => (
                <ArchetypeBadge
                  key={archetype}
                  archetype={archetype}
                  forceDark
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  </main>
);
