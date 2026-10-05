import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FlaskConical, Loader2 } from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { AppSelect } from "components/ui/AppSelect";
import { apiService } from "lib/api/apiService";
import { useTheme } from "providers/ThemeContext";
import { playerUtils } from "utils/playerUtils";
import { seasonSpan } from "utils/season";
import { ScatterPlot, SCATTER_THEMES } from "features/sandbox/ScatterPlot";
import {
  DEFAULT_X_METRIC,
  DEFAULT_Y_METRIC,
  SKATER_METRICS,
  metricByKey,
} from "features/sandbox/sandboxMetrics";

const POSITION_OPTIONS = [
  { value: "F", label: "Forwards", groups: ["F"] },
  { value: "D", label: "Defensemen", groups: ["D"] },
  { value: "all", label: "Forwards + Defensemen", groups: ["F", "D"] },
];
const SERIES_LABELS = { F: "Forwards", D: "Defensemen" };
const FIELD_CLASS =
  "app-field w-full px-4 py-3 pr-10 text-sm text-white light:text-gray-900";

const leastSquares = (points) => {
  const n = points.length;
  if (n < 3) return null;
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / n;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / n;
  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  points.forEach((point) => {
    covariance += (point.x - meanX) * (point.y - meanY);
    varianceX += (point.x - meanX) ** 2;
    varianceY += (point.y - meanY) ** 2;
  });
  if (varianceX === 0 || varianceY === 0) return null;
  const slope = covariance / varianceX;
  return {
    n,
    slope,
    intercept: meanY - slope * meanX,
    r: covariance / Math.sqrt(varianceX * varianceY),
  };
};

const groupedMetricOptions = () => {
  const groups = [];
  SKATER_METRICS.forEach((metric) => {
    const last = groups[groups.length - 1];
    if (last?.group === metric.group) last.metrics.push(metric);
    else groups.push({ group: metric.group, metrics: [metric] });
  });
  return groups;
};

const MetricSelect = ({ label, value, onChange }) => (
  <label className="block">
    <span className="mb-1 block px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 light:text-gray-500">
      {label}
    </span>
    <AppSelect
      placeholder={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={FIELD_CLASS}
    >
      {groupedMetricOptions().flatMap(({ group, metrics }) =>
        metrics.map((metric) => (
          <option key={metric.key} value={metric.key}>
            {`${metric.label} · ${group}`}
          </option>
        ))
      )}
    </AppSelect>
  </label>
);

const FitSummary = ({ fit, xMetric, yMetric }) => {
  if (!fit) return null;
  const strength =
    Math.abs(fit.r) >= 0.7
      ? "strong"
      : Math.abs(fit.r) >= 0.4
        ? "moderate"
        : Math.abs(fit.r) >= 0.2
          ? "weak"
          : "little to no";
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
      <span>
        <span className="text-lg font-bold tabular-nums text-white light:text-gray-900">
          {fit.r.toFixed(2)}
        </span>{" "}
        <span className="text-gray-400 light:text-gray-500">
          correlation (r)
        </span>
      </span>
      <span>
        <span className="font-semibold tabular-nums text-white light:text-gray-900">
          {(fit.r ** 2).toFixed(2)}
        </span>{" "}
        <span className="text-gray-400 light:text-gray-500">R²</span>
      </span>
      <span>
        <span className="font-semibold tabular-nums text-white light:text-gray-900">
          {fit.n}
        </span>{" "}
        <span className="text-gray-400 light:text-gray-500">skaters</span>
      </span>
      <span className="text-gray-400 light:text-gray-500">
        {`${strength} ${fit.r >= 0 ? "positive" : "negative"} relationship · each +1 ${xMetric.label} ≈ ${fit.slope >= 0 ? "+" : ""}${fit.slope.toFixed(2)} ${yMetric.label}`}
      </span>
    </div>
  );
};

const Legend = ({ groups, theme }) =>
  groups.length > 1 ? (
    <div className="flex items-center gap-4 text-xs font-semibold text-gray-300 light:text-gray-600">
      {groups.map((group) => (
        <span key={group} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: theme.series[group] }}
          />
          {SERIES_LABELS[group]}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span
          className="h-0.5 w-4 rounded-full"
          style={{ backgroundColor: theme.fitLine }}
        />
        Best fit
      </span>
    </div>
  ) : null;

const PointsTable = ({ points, xMetric, yMetric }) => (
  <div className="max-h-[460px] overflow-auto">
    <table className="w-full border-collapse text-sm">
      <thead className="sticky top-0 bg-[var(--glass-bg-strong)]">
        <tr className="text-xs uppercase tracking-wide text-gray-400 light:text-slate-500">
          <th className="px-2 py-2 text-left font-semibold">Player</th>
          <th className="px-2 py-2 text-left font-semibold">Team</th>
          <th className="px-2 py-2 text-left font-semibold">Pos</th>
          <th className="px-2 py-2 text-right font-semibold">
            {xMetric.label}
          </th>
          <th className="px-2 py-2 text-right font-semibold">
            {yMetric.label}
          </th>
        </tr>
      </thead>
      <tbody>
        {[...points]
          .sort((a, b) => b.y - a.y)
          .map((point) => (
            <tr
              key={point.id}
              className="border-t border-white/5 light:border-slate-200"
            >
              <td className="px-2 py-1.5">
                <Link
                  to={point.href}
                  className="font-semibold text-white hover:underline light:text-gray-900"
                >
                  {point.label}
                </Link>
              </td>
              <td className="px-2 py-1.5 text-gray-300 light:text-slate-600">
                {point.team || "—"}
              </td>
              <td className="px-2 py-1.5 text-gray-300 light:text-slate-600">
                {point.group}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums text-gray-200 light:text-slate-700">
                {xMetric.format(point.x)}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums text-gray-200 light:text-slate-700">
                {yMetric.format(point.y)}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);

export const Sandbox = () => {
  const { actualTheme } = useTheme();
  const theme = SCATTER_THEMES[actualTheme] || SCATTER_THEMES.dark;
  const [searchParams, setSearchParams] = useSearchParams();
  const position = searchParams.get("pos") || "F";
  const seasonParam = searchParams.get("season");
  const xMetric = metricByKey(searchParams.get("x") || DEFAULT_X_METRIC);
  const yMetric = metricByKey(searchParams.get("y") || DEFAULT_Y_METRIC);
  const positionOption =
    POSITION_OPTIONS.find((option) => option.value === position) ||
    POSITION_OPTIONS[0];

  const [datasets, setDatasets] = useState({});
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    document.title = "Sandbox | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all(
      ["F", "D"].map((group) => apiService.fetchLeaderboard(group, seasonParam))
    )
      .then(([forwards, defensemen]) => {
        if (cancelled) return;
        setDatasets({ F: forwards.players || [], D: defensemen.players || [] });
        setAvailableSeasons(forwards.availableSeasons || []);
        setSeason(forwards.season);
      })
      .catch((requestError) => {
        if (!cancelled)
          setError(requestError.message || "Failed to load skaters");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [seasonParam]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    setSearchParams(params, { replace: true });
  };

  const points = useMemo(
    () =>
      positionOption.groups.flatMap((group) =>
        (datasets[group] || [])
          .map((player) => ({
            id: `${group}-${player.playerId}`,
            group,
            label: player.name,
            team: player.team,
            sub: `${player.team || "NHL"} · ${SERIES_LABELS[group]}`,
            href: playerUtils.playerProfilePath(player.playerId, player.season),
            x: xMetric.value(player),
            y: yMetric.value(player),
          }))
          .filter((point) => point.x != null && point.y != null)
      ),
    [datasets, positionOption, xMetric, yMetric]
  );
  const fit = useMemo(() => leastSquares(points), [points]);

  return (
    <div className="ice-background min-h-screen px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <Header />
        <main className="space-y-5 sm:space-y-7">
          <section className="liquid-glass-strong rounded-[32px] p-5 sm:p-6 lg:p-7">
            <div className="mb-5 flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-sky-300 light:text-sky-600" />
              <div>
                <h2 className="text-2xl font-bold tracking-display text-white light:text-gray-900">
                  Sandbox
                </h2>
                <p className="text-xs text-gray-400 light:text-gray-500">
                  Plot any two skater metrics from the rankings against each
                  other
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1 block px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 light:text-gray-500">
                  Skaters
                </span>
                <AppSelect
                  placeholder="Skaters"
                  value={positionOption.value}
                  onChange={(event) => updateParam("pos", event.target.value)}
                  className={FIELD_CLASS}
                >
                  {POSITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </AppSelect>
              </label>
              <label className="block">
                <span className="mb-1 block px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 light:text-gray-500">
                  Season
                </span>
                <AppSelect
                  placeholder="Season"
                  value={season ? String(season) : ""}
                  onChange={(event) =>
                    updateParam("season", event.target.value)
                  }
                  className={FIELD_CLASS}
                >
                  {availableSeasons.map((year) => (
                    <option key={year} value={year}>
                      {seasonSpan(year)}
                    </option>
                  ))}
                </AppSelect>
              </label>
              <MetricSelect
                label="X axis"
                value={xMetric.key}
                onChange={(value) => updateParam("x", value)}
              />
              <MetricSelect
                label="Y axis"
                value={yMetric.key}
                onChange={(value) => updateParam("y", value)}
              />
            </div>
          </section>

          <section className="liquid-glass-strong rounded-[32px] p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-24">
                <Loader2 className="h-7 w-7 animate-spin text-sky-300 light:text-sky-600" />
                <span className="font-medium">Loading skaters…</span>
              </div>
            ) : error ? (
              <p className="py-16 text-center text-rose-400 light:text-rose-700">
                {error}
              </p>
            ) : points.length === 0 ? (
              <p className="py-16 text-center text-gray-400 light:text-gray-500">
                No skaters have both {xMetric.label} and {yMetric.label} for
                this season.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <FitSummary fit={fit} xMetric={xMetric} yMetric={yMetric} />
                  <button
                    type="button"
                    onClick={() => setShowTable((value) => !value)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:bg-white/10 light:border-slate-200 light:bg-white/80 light:text-slate-700"
                  >
                    {showTable ? "Show chart" : "Show table"}
                  </button>
                </div>
                <Legend groups={positionOption.groups} theme={theme} />
                {showTable ? (
                  <PointsTable
                    points={points}
                    xMetric={xMetric}
                    yMetric={yMetric}
                  />
                ) : (
                  <ScatterPlot
                    points={points}
                    xMetric={xMetric}
                    yMetric={yMetric}
                    fit={fit}
                    theme={theme}
                  />
                )}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};
