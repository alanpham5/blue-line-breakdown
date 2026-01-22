export const CountingStats = ({ stats }) => {
  if (!stats || stats.length === 0) return null;
  const labels = {
    assists: "Assists",
    gamesPlayed: "Games Played",
    goals: "Goals",
    penaltyMinutes: "Penalty Minutes",
    points: "Points",
  };

  const mobileLabels = {
    assists: "A",
    gamesPlayed: "GP",
    goals: "G",
    penaltyMinutes: "PIM",
    points: "PTS",
  };

  const statsOrder = [
    "gamesPlayed",
    "goals",
    "assists",
    "points",
    "penaltyMinutes",
  ];

  return (
    <div className="liquid-glass-strong rounded-2xl p-4 sm:p-6 liquid-glass-animate">
      <div className="grid grid-flow-col auto-cols-fr divide-x divide-white/30 text-center">
        {statsOrder.map((statKey) => (
          <div
            key={statKey}
            className="flex flex-col items-center justify-center px-2"
          >
            <div className="text-xs sm:text-sm text-gray-300 uppercase tracking-wide">
              <span className="hidden lg:inline">{labels[statKey] ?? "-"}</span>
              <span className="lg:hidden">{mobileLabels[statKey] ?? "-"}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
              {stats[statKey]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
