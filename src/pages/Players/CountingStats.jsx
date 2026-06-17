export const CountingStats = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) return null;

  const isGoalie = stats.savePct !== undefined || stats.saves !== undefined;

  const labels = isGoalie
    ? {
        gamesPlayed: "Games Played",
        shotsAgainst: "Shots Against",
        saves: "Saves",
        gaa: "Goals Against Avg",
        goalsAgainst: "Goals Against",
        savePct: "Save %",
        goalsSavedAboveExpected: "GSAX",
      }
    : {
        assists: "Assists",
        gamesPlayed: "Games Played",
        goals: "Goals",
        penaltyMinutes: "Penalty Minutes",
        points: "Points",
      };

  const mobileLabels = isGoalie
    ? {
        gamesPlayed: "GP",
        shotsAgainst: "SA",
        saves: "SV",
        gaa: "GAA",
        goalsAgainst: "GA",
        savePct: "SV%",
        goalsSavedAboveExpected: "GSAX",
      }
    : {
        assists: "A",
        gamesPlayed: "GP",
        goals: "G",
        penaltyMinutes: "PIM",
        points: "PTS",
      };

  // Goalie columns are responsive: mobile shows GP, SA, SV, GAA, SV% (5 cols)
  // while desktop keeps the full GP, SA, SV, GA, SV%, GSAX set (6 cols).
  // Hidden columns drop out of the auto-cols-fr grid so the visible ones
  // redistribute evenly without crowding/overlap on narrow viewports.
  const statsOrder = isGoalie
    ? [
        "gamesPlayed",
        "shotsAgainst",
        "saves",
        "gaa",
        "goalsAgainst",
        "savePct",
        "goalsSavedAboveExpected",
      ]
    : ["gamesPlayed", "goals", "assists", "points", "penaltyMinutes"];

  const statVisibility = isGoalie
    ? {
        gaa: "flex lg:hidden", // mobile-only
        goalsAgainst: "hidden lg:flex", // desktop-only
        goalsSavedAboveExpected: "hidden lg:flex", // desktop-only
      }
    : {};

  const statValueClasses = isGoalie
    ? {
        gamesPlayed: "text-white light:text-slate-900",
        shotsAgainst: "text-sky-300 light:text-sky-700",
        saves: "text-[#7dcb48]",
        gaa: "text-rose-400 light:text-rose-600",
        goalsAgainst: "text-rose-400 light:text-rose-600",
        savePct: "text-amber-300 light:text-amber-700",
        goalsSavedAboveExpected: "text-cyan-300 light:text-cyan-700",
      }
    : {
        gamesPlayed: "text-white light:text-slate-900",
        goals: "text-rose-400 light:text-rose-600",
        assists: "text-[#7dcb48]",
        points: "text-sky-300 light:text-sky-700",
        penaltyMinutes: "text-amber-300 light:text-amber-700",
      };

  const formatValue = (statKey) => {
    if (statKey === "gaa") {
      const ga = stats.goalsAgainst;
      const gp = stats.gamesPlayed;
      if (!gp || ga === undefined || ga === null) return "-";
      return ((ga / gp) * 1).toFixed(2);
    }
    const val = stats[statKey];
    if (val === undefined || val === null) return "-";
    if (statKey === "savePct") {
      return val.toFixed(3);
    }
    if (statKey === "goalsSavedAboveExpected") {
      return val.toFixed(1);
    }
    return val;
  };

  return (
    <div className="liquid-glass-strong liquid-glass-animate rounded-[32px] p-4 sm:p-6">
      <div className="grid grid-flow-col auto-cols-fr divide-x divide-white/10 light:divide-slate-200 text-center">
        {statsOrder.map((statKey) => (
          <div
            key={statKey}
            className={`flex-col items-center justify-center px-1 sm:px-2 ${statVisibility[statKey] ?? "flex"}`}
          >
            <div className="text-[0.7rem] sm:text-sm text-gray-400 light:text-gray-500 uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">
              <span className="hidden lg:inline">{labels[statKey] ?? "-"}</span>
              <span className="lg:hidden">{mobileLabels[statKey] ?? "-"}</span>
            </div>
            <div
              className={`text-xl sm:text-3xl font-semibold leading-tight tabular-nums whitespace-nowrap ${statValueClasses[statKey]}`}
            >
              {formatValue(statKey)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
