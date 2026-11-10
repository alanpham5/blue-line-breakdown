import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppSelect } from "components/ui/AppSelect";
import { apiService } from "lib/api/apiService";
import { playerUtils } from "utils/playerUtils";
import {
  SHARE_STATS,
  ShareBar,
  formatToi,
} from "features/players/components/lines/ShareBar";

const formatRate = (value) => (value == null ? "-" : Number(value).toFixed(2));

export const useWithWithout = (playerId, teammateId, season) => {
  const [state, setState] = useState({
    result: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!playerId || !teammateId) return undefined;
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));
    apiService
      .fetchPlayerWithWithoutV2(playerId, teammateId, season)
      .then((result) => {
        if (!cancelled) setState({ result, loading: false, error: null });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            loading: false,
            error: requestError.message,
          }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [playerId, teammateId, season]);

  return state;
};

const shareDelta = (split, baseline, statKey) => {
  const value = split.stats?.[statKey]?.value;
  const reference = baseline?.stats?.[statKey]?.value;
  return value == null || reference == null ? null : value - reference;
};

const SplitCard = ({
  title,
  subtitle,
  split,
  baseline,
  accent,
  idPrefix,
  shareable,
}) => {
  const theme = (light) => (shareable ? "" : light);
  return (
    <section
      className={`liquid-glass-strong flex h-full flex-col ${shareable ? "rounded-[28px] p-6" : "rounded-[28px] p-5 sm:p-6"}`}
    >
      <div
        className={`border-b border-white/[0.07] ${theme("light:border-slate-300")} ${shareable ? "mb-5 pb-5" : "mb-4 pb-4"}`}
      >
        <h3
          className={`font-extrabold tracking-display ${accent.dark} ${theme(accent.light)} ${shareable ? "text-[1.7rem] leading-tight" : "text-lg"}`}
          data-export-nudge={shareable ? 8 : undefined}
        >
          {title}
        </h3>
        <p
          className={`text-gray-400 ${theme("light:text-slate-600")} ${shareable ? "mt-1 text-lg" : "mt-0.5 text-sm"}`}
          data-export-nudge={shareable ? 6 : undefined}
        >
          {subtitle}
        </p>
        <p
          className={`font-extrabold text-white ${theme("light:text-gray-900")} ${shareable ? "mt-3 text-[2.5rem]" : "mt-3 text-2xl tabular-nums"}`}
          data-export-nudge={shareable ? 10 : undefined}
        >
          {formatToi(split.minutes)}
          <span
            className={`ml-1.5 font-semibold text-gray-500 ${shareable ? "text-xl" : "text-sm light:text-slate-600"}`}
          >
            TOI
          </span>
        </p>
      </div>
      {split.minutes > 0 ? (
        <div
          className={`flex flex-1 flex-col ${shareable ? "gap-6" : "gap-5"}`}
        >
          {SHARE_STATS.map((stat) => {
            const values = split.stats[stat.key];
            return (
              <div key={stat.key}>
                <ShareBar
                  id={`${idPrefix}-${stat.key}`}
                  stat={stat}
                  values={values}
                  mode="measurement"
                  delta={
                    baseline && baseline.minutes > 0
                      ? shareDelta(split, baseline, stat.key)
                      : undefined
                  }
                  shareable={shareable}
                />
                <p
                  className={`text-gray-500 ${shareable ? "mt-2 text-base" : "mt-1.5 text-xs tabular-nums light:text-slate-600"}`}
                  data-export-nudge={shareable ? 5 : undefined}
                >
                  {formatRate(values.for60)} for ·{" "}
                  {formatRate(values.against60)} against per 60
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-gray-400 light:text-slate-600">
          No 5-on-5 minutes in this split.
        </p>
      )}
    </section>
  );
};

export const SplitCards = ({ player, teammate, result, shareable = false }) => (
  <div
    className={
      shareable ? "grid grid-cols-3 gap-3.5" : "grid gap-5 md:grid-cols-3"
    }
  >
    <SplitCard
      title="Together"
      subtitle={`${player.name} and ${teammate.name}`}
      split={result.together}
      accent={{ dark: "text-[#7ee340]", light: "light:text-[#2e6e14]" }}
      idPrefix="wowy-together"
      shareable={shareable}
    />
    <SplitCard
      title={`${player.name} Without`}
      subtitle={`Away from ${teammate.name}`}
      split={result.playerWithout}
      baseline={result.together}
      accent={{ dark: "text-cyan-300", light: "light:text-cyan-700" }}
      idPrefix="wowy-player"
      shareable={shareable}
    />
    <SplitCard
      title={`${teammate.name} Without`}
      subtitle={`Away from ${player.name}`}
      split={result.teammateWithout}
      baseline={result.together}
      accent={{ dark: "text-amber-300", light: "light:text-amber-700" }}
      idPrefix="wowy-teammate"
      shareable={shareable}
    />
  </div>
);

export const positionNote = (position) =>
  position === "D"
    ? "Defensemen are compared with defense partners."
    : "Forwards are compared with forward linemates.";

export const WithWithoutPanel = ({
  player,
  teammates,
  teammate,
  result,
  loading,
  error,
  onTeammateChange,
}) => {
  if (!teammate) {
    return (
      <section className="liquid-glass-strong rounded-[32px] px-6 py-10 text-center text-sm text-gray-400 light:text-slate-600">
        No teammate shared 10 minutes at 5-on-5 with {player.name}.
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="liquid-glass-strong flex flex-col gap-3 rounded-[32px] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={playerUtils.getPlayerHeadshot(
              teammate.playerId,
              teammate.team,
              teammate.season
            )}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full object-cover"
            style={{
              background: playerUtils.getSurfaceGradient(
                playerUtils.getTeamColor(teammate.team, teammate.season),
                "dark"
              ),
            }}
            onError={(event) => {
              event.target.src = playerUtils.getDefaultHeadshot();
            }}
          />
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold tracking-display text-white light:text-gray-900">
              With and Without
            </h2>
            <p className="text-sm text-gray-400 light:text-slate-600">
              5-on-5 results with {teammate.name} and apart.{" "}
              {positionNote(player.position)}
            </p>
          </div>
        </div>
        <label className="block w-full sm:w-72">
          <span className="sr-only">Teammate</span>
          <AppSelect
            value={String(teammate.playerId)}
            onChange={(event) => onTeammateChange(Number(event.target.value))}
            className="app-field w-full px-4 py-3 pr-10 text-base normal-case tracking-normal text-white light:text-gray-900"
          >
            {teammates.map((option) => (
              <option key={option.playerId} value={option.playerId}>
                {option.name} · {formatToi(option.minutes)} together
              </option>
            ))}
          </AppSelect>
        </label>
      </section>

      {error && (
        <p className="liquid-glass-strong rounded-[28px] border border-rose-400/20 p-5 text-center font-semibold text-rose-300 light:text-rose-700">
          {error}
        </p>
      )}
      {loading && !result && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-sky-300 light:text-sky-600" />
        </div>
      )}
      {result && (
        <div className={`transition-opacity ${loading ? "opacity-60" : ""}`}>
          <SplitCards player={player} teammate={teammate} result={result} />
        </div>
      )}
    </div>
  );
};
