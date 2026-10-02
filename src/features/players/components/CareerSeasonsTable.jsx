import { CalendarRange, ChevronRight } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
import { formatCountingStat } from "features/players/components/CountingStats";

const SKATER_COLUMNS = [
  { key: "gamesPlayed", label: "GP" },
  { key: "goals", label: "G" },
  { key: "assists", label: "A" },
  { key: "points", label: "P" },
];

const GOALIE_COLUMNS = [
  { key: "gamesPlayed", label: "GP" },
  { key: "savePct", label: "SV%" },
  { key: "gaa", label: "GAA" },
  { key: "goalsSavedAboveExpected", label: "GSAx" },
];

export const CareerSeasonsTable = ({
  seasons = [],
  isGoalie,
  onSeasonClick,
  currentSeason = null,
}) => {
  const { actualTheme } = useTheme();
  const columns = isGoalie ? GOALIE_COLUMNS : SKATER_COLUMNS;
  if (seasons.length === 0) return null;

  return (
    <section className="liquid-glass-strong liquid-glass-animate rounded-[32px] p-4 sm:p-6">
      <div className="mb-3 flex items-center gap-2 px-1">
        <CalendarRange className="h-5 w-5 text-sky-300 light:text-sky-600" />
        <h3 className="text-xl font-bold tracking-display text-white light:text-gray-900 sm:text-2xl">
          Season by Season
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-400 light:text-slate-500">
              <th className="px-2 py-2 text-left font-semibold">Season</th>
              <th className="px-2 py-2 text-left font-semibold">Team</th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-2 py-2 text-right font-semibold"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-2 py-2 text-right font-semibold text-[#7dcb48]">
                Impact
              </th>
              <th className="w-6" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {seasons.map((line) => {
              const logoUrl = line.team
                ? playerUtils.getTeamLogoUrl(
                    line.team,
                    line.season,
                    actualTheme
                  )
                : null;
              return (
                <tr
                  key={line.season}
                  onClick={() => onSeasonClick(line.season)}
                  className="cursor-pointer border-t border-white/5 transition-colors hover:bg-white/5 light:border-slate-200 light:hover:bg-slate-900/5"
                >
                  <td className="whitespace-nowrap px-2 py-2.5 font-semibold text-white light:text-gray-900">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSeasonClick(line.season);
                      }}
                      className="hover:underline"
                    >
                      {playerUtils.formatSeasonLabel(
                        line.season,
                        currentSeason
                      )}
                    </button>
                  </td>
                  <td className="px-2 py-2.5 text-gray-300 light:text-slate-600">
                    <span className="flex items-center gap-2">
                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt=""
                          className="h-6 w-6 object-contain"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      {line.team || "—"}
                    </span>
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-2 py-2.5 text-right tabular-nums text-gray-200 light:text-slate-700"
                    >
                      {formatCountingStat(line.stats, column.key)}
                    </td>
                  ))}
                  <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-white light:text-gray-900">
                    {typeof line.impactPercentile === "number"
                      ? line.impactPercentile.toFixed(1)
                      : "—"}
                  </td>
                  <td className="py-2.5 pr-1 text-gray-500 light:text-slate-400">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
