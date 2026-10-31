import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { History, ArrowUpRight, Check, X, Download, Share } from "lucide-react";
import { Link } from "react-router-dom";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
import { useIsMobile } from "hooks/useIsMobile";
import { ShareableModal } from "components/ui/ShareableModal";

const ShareableContext = createContext(false);

const useThemed = () => {
  const shareable = useContext(ShareableContext);
  return (classes) =>
    shareable
      ? classes
          .split(" ")
          .filter((token) => !token.startsWith("light:"))
          .join(" ")
      : classes;
};

const NUDGE = {
  eyebrow: 2,
  pill: 3,
  title: 6,
  overall: 10,
  tier: 2,
  name: 3,
  blurb: 2,
  impact: 4,
  item: 3,
  tileLabel: 2,
  tileStat: 2,
  tileValue: 5,
  heading: 6,
  season: 4,
};

const Nudge = ({ px, children }) => {
  const shareable = useContext(ShareableContext);
  return shareable ? <span data-export-nudge={px}>{children}</span> : children;
};

const ratingTone = (value) => {
  if (typeof value !== "number") return "text-gray-300 light:text-gray-600";
  if (value >= 66) return "text-emerald-300 light:text-emerald-600";
  if (value >= 40) return "text-amber-300 light:text-amber-600";
  return "text-rose-400 light:text-rose-600";
};
const ratingFill = (value) => {
  if (typeof value !== "number") return "from-gray-500 to-gray-400";
  if (value >= 66) return "from-emerald-500 to-green-400";
  if (value >= 40) return "from-amber-500 to-yellow-400";
  return "from-rose-500 to-red-400";
};
const format = (value, digits = 1) =>
  typeof value === "number" ? value.toFixed(digits) : "-";
const ordinal = (value) => {
  const number = Math.round(value);
  const tens = number % 100;
  const suffix =
    tens >= 10 && tens <= 20 ? "th" : { 1: "st", 2: "nd", 3: "rd" }[number % 10] || "th";
  return `${number}${suffix}`;
};
const shortSeason = (season) =>
  `${season}-${String(Number(season) + 1).slice(-2)}`;

const Eyebrow = ({ children }) => {
  const themed = useThemed();
  return (
    <h3
      className={themed(
        "text-[0.65rem] font-bold uppercase tracking-wide text-gray-400 light:text-slate-500"
      )}
    >
      <Nudge px={NUDGE.eyebrow}>{children}</Nudge>
    </h3>
  );
};

const RoleStat = ({ stat }) => {
  const themed = useThemed();
  return (
    <>
      {" · "}
      <span className={themed("font-bold text-sky-300 light:text-sky-600")}>
        {ordinal(stat.percentile)} pct
      </span>{" "}
      {stat.label}
    </>
  );
};

const PlayerRow = ({ player, blurb, roleStat, season, href, theme }) => {
  const shareable = useContext(ShareableContext);
  const themed = useThemed();
  const headshot = playerUtils.getPlayerHeadshot(
    player.playerId,
    player.team,
    season
  );
  const content = (
    <>
      <img
        src={shareable ? playerUtils.getCorsWrappedUrl(headshot) : headshot}
        alt={player.name}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
        style={{
          backgroundColor: playerUtils.getTeamColor(
            player.team,
            season,
            shareable ? "dark" : theme
          ),
        }}
        onError={(event) => {
          const fallback = playerUtils.getDefaultHeadshot();
          event.target.src = shareable
            ? playerUtils.getCorsWrappedUrl(fallback)
            : fallback;
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span
            className={themed(
              "max-w-full truncate text-sm font-bold text-white light:text-gray-900"
            )}
          >
            <Nudge px={NUDGE.name}>{player.name}</Nudge>
          </span>
          <span
            className={themed(
              "shrink-0 rounded-full bg-sky-500/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-sky-300 light:text-sky-600"
            )}
          >
            <Nudge px={NUDGE.pill}>{player.lineRole}</Nudge>
          </span>
        </div>
        <div
          className={themed(
            "mt-0.5 text-xs leading-snug text-gray-400 light:text-slate-500"
          )}
        >
          <Nudge px={NUDGE.blurb}>
            {blurb}
            {roleStat && <RoleStat stat={roleStat} />}
          </Nudge>
        </div>
      </div>
      <div
        className={themed(
          `shrink-0 text-lg font-extrabold ${ratingTone(player.impactPercentile)}`
        )}
        title="Player impact percentile"
      >
        <Nudge px={NUDGE.impact}>{format(player.impactPercentile, 0)}</Nudge>
      </div>
    </>
  );
  const rowClass = themed(
    "flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 transition hover:bg-white/[0.07] light:border-slate-200/60 light:bg-gray-100/60 light:hover:bg-gray-100"
  );
  return shareable ? (
    <div className={rowClass}>{content}</div>
  ) : (
    <Link to={href} className={rowClass}>
      {content}
    </Link>
  );
};

const RatingTile = ({ label, value, stat, statLabel }) => {
  const shareable = useContext(ShareableContext);
  const themed = useThemed();
  return (
    <div
      className={themed(
        "rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 light:border-slate-200/60 light:bg-gray-100/60"
      )}
    >
      <div
        className={
          shareable
            ? "flex flex-row items-baseline justify-between gap-2"
            : "flex flex-col gap-0.5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-2"
        }
      >
        <span
          className={themed(
            "text-[0.62rem] font-bold uppercase tracking-wide text-gray-400 light:text-slate-500"
          )}
        >
          <Nudge px={NUDGE.tileLabel}>{label}</Nudge>
        </span>
        <span className={themed("text-xs text-gray-400 light:text-slate-500")}>
          <Nudge px={NUDGE.tileStat}>
            <span className={themed("font-bold text-white light:text-gray-900")}>
              {stat}
            </span>{" "}
            {statLabel}
          </Nudge>
        </span>
      </div>
      <div className={themed(`mt-0.5 text-2xl font-extrabold ${ratingTone(value)}`)}>
        <Nudge px={NUDGE.tileValue}>{format(value, 0)}</Nudge>
      </div>
      <div
        className={themed(
          "mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] light:bg-gray-200"
        )}
      >
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${ratingFill(value)}`}
          style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
        />
      </div>
    </div>
  );
};

const SummaryList = ({ title, items, positive }) => {
  const themed = useThemed();
  const Icon = positive ? Check : X;
  const tone = positive
    ? "text-emerald-300 light:text-emerald-600"
    : "text-rose-400 light:text-rose-600";
  return (
    <div>
      <Eyebrow>{title}</Eyebrow>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className={themed(
              "flex gap-2 text-sm font-semibold text-gray-100 light:text-slate-800"
            )}
          >
            <Icon className={themed(`mt-0.5 h-4 w-4 shrink-0 ${tone}`)} />
            <Nudge px={NUDGE.item}>{item}</Nudge>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ShareButton = ({ onClick }) => {
  const isMobile = useIsMobile();
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:text-white light:border-slate-300 light:bg-white/80 light:text-slate-600 light:hover:text-slate-900"
      aria-label={isMobile ? "Share image" : "Download shareable image"}
    >
      {isMobile ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
    </button>
  );
};

const SummaryCard = ({ analysis, season, playerHref, theme, onShare }) => {
  const shareable = useContext(ShareableContext);
  const themed = useThemed();
  const { identity, ratings, quality, projection, summary } = analysis;
  const summaries = Object.fromEntries(
    (summary?.players || []).map((entry) => [entry.playerId, entry])
  );
  return (
    <div className="liquid-glass-strong rounded-[32px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className={themed(
              "inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-sky-300 light:text-sky-600"
            )}
          >
            <Nudge px={NUDGE.pill}>
              {analysis.position === "D" ? "Pair Identity" : "Line Identity"}
            </Nudge>
          </span>
          <div className="mt-1.5 flex min-w-0 items-center gap-3">
            <h2
              className={themed(
                "text-[1.9rem] font-extrabold leading-tight tracking-display text-white light:text-gray-900"
              )}
            >
              <Nudge px={NUDGE.title}>{identity.label}</Nudge>
            </h2>
            {!shareable && onShare && <ShareButton onClick={onShare} />}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div
            className={themed(
              `text-5xl font-extrabold leading-none ${ratingTone(quality.overall)}`
            )}
          >
            <Nudge px={NUDGE.overall}>{format(quality.overall, 0)}</Nudge>
          </div>
          <div className={themed("mt-1 text-xs font-bold text-white light:text-gray-900")}>
            <Nudge px={NUDGE.tier}>{quality.tier}</Nudge>
          </div>
        </div>
      </div>

      <div
        className={
          shareable
            ? "mt-4 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-5"
            : "mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
        }
      >
        <div className="space-y-2">
          {analysis.players.map((player) => (
            <PlayerRow
              key={player.playerId}
              player={player}
              blurb={summaries[player.playerId]?.blurb}
              roleStat={summaries[player.playerId]?.roleStat}
              season={season}
              href={playerHref?.(player)}
              theme={theme}
            />
          ))}
        </div>

        {summary && (
          <div className="space-y-5">
            <SummaryList title="Does well" items={summary.strengths} positive />
            <SummaryList title="Lacks" items={summary.gaps} positive={false} />
          </div>
        )}
      </div>

      <div
        className={
          shareable
            ? "mt-4 grid grid-cols-4 gap-2"
            : "mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4"
        }
      >
        <RatingTile
          label="Offense"
          value={ratings.offense}
          stat={format(projection?.xGoalsFor60, 2)}
          statLabel="proj. xGF/60"
        />
        <RatingTile
          label="Defense"
          value={ratings.defense}
          stat={format(projection?.xGoalsAgainst60, 2)}
          statLabel="proj. xGA/60"
        />
        <RatingTile
          label="Physical"
          value={ratings.physicality}
          stat={format(projection?.hitsFor60, 1)}
          statLabel="proj. hits/60"
        />
        <RatingTile
          label="Overall"
          value={ratings.overall}
          stat={`${format(projection?.xGoalsForPercentage)}%`}
          statLabel="proj. xGF"
        />
      </div>
    </div>
  );
};

const LineShareablePreview = ({ analysis, season }) => (
  <ShareableContext.Provider value>
    <div
      className="shareable-display-dark"
      data-export-scale="2"
      style={{
        width: 1080,
        display: "flex",
        color: "white",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 12% 0%, rgba(56, 189, 248, 0.08), transparent 30%), radial-gradient(circle at 88% 100%, rgba(132, 204, 22, 0.07), transparent 30%), linear-gradient(180deg, #020303 0%, #070809 55%, #050506 100%)",
      }}
    >
      <aside
        style={{
          width: 72,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.012)",
        }}
      >
        <div
          style={{
            position: "absolute",
            transform: "rotate(-90deg)",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            fontWeight: 800,
            color: "#f3f4f6",
          }}
        >
          <img src="/blb-dark.png" alt="Logo" style={{ width: 44, height: 44 }} />
          <span>Blue Line Breakdown</span>
        </div>
      </aside>
      <div style={{ flex: 1, padding: 20 }}>
        <div className="mb-3 flex items-baseline gap-3 px-1">
          <h1 className="text-[1.75rem] font-extrabold tracking-display text-white">
            <Nudge px={NUDGE.heading}>
              {analysis.position === "D" ? "Pair Projection" : "Line Projection"}
            </Nudge>
          </h1>
          <span className="text-[1.25rem] font-medium text-gray-400">
            <Nudge px={NUDGE.season}>{shortSeason(season)}</Nudge>
          </span>
        </div>
        <SummaryCard analysis={analysis} season={season} theme="dark" />
      </div>
    </div>
  </ShareableContext.Provider>
);

const shareFileName = (analysis, season) =>
  `${analysis.players
    .map((player) => String(player.name || "").split(" ").slice(-1)[0])
    .join("-")}-${season}`;

export const LineAnalysis = ({ analysis, season, playerHref, onLoadUnit }) => {
  const { actualTheme } = useTheme();
  const [sharing, setSharing] = useState(false);
  const comparables = analysis.comparables || [];
  const history = analysis.playedTogether || [];
  return (
    <div className="space-y-4 sm:space-y-5">
      <SummaryCard
        analysis={analysis}
        season={season}
        playerHref={playerHref}
        theme={actualTheme}
        onShare={() => setSharing(true)}
      />

      {createPortal(
        <ShareableModal
          isOpen={sharing}
          onClose={() => setSharing(false)}
          fileName={shareFileName(analysis, season)}
        >
          <LineShareablePreview analysis={analysis} season={season} />
        </ShareableModal>,
        document.body
      )}

      <div className="liquid-glass-strong rounded-[28px] p-4 sm:p-5">
        <div className="mb-3.5 flex items-start gap-2">
          <History className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300 light:text-cyan-600" />
          <div className="min-w-0">
            <h3 className="text-lg font-bold tracking-display text-white light:text-gray-900">
              Similar real lines
            </h3>
            <p className="mt-0.5 text-xs text-gray-400 light:text-slate-500">
              Tap to load
            </p>
          </div>
        </div>
        {comparables.length === 0 ? (
          <p className="text-sm text-gray-400 light:text-slate-500">
            No comparable lines.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {comparables.map((comparable) => (
              <button
                key={comparable.lineId}
                type="button"
                onClick={() =>
                  onLoadUnit?.({
                    season: comparable.season,
                    playerIds: comparable.playerIds,
                  })
                }
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition hover:bg-white/[0.07] light:border-slate-200/60 light:bg-gray-100/60 light:hover:bg-gray-100"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white light:text-gray-900">
                    {comparable.name}
                  </div>
                  <div className="flex items-center gap-1 text-[0.68rem] text-gray-400 light:text-slate-500">
                    {comparable.team} · {format(comparable.icetimeMinutes, 0)}{" "}
                    min
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
                <div
                  className={`shrink-0 text-sm font-bold ${ratingTone(comparable.xgPercentage)}`}
                >
                  {format(comparable.xgPercentage)}% xGF
                </div>
              </button>
            ))}
          </div>
        )}
        {history.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-3 light:border-slate-200">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 light:text-slate-500">
              Played together
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {history.slice(0, 3).map((entry) => (
                <button
                  key={`${entry.season}-${entry.team}`}
                  type="button"
                  disabled={entry.season === analysis.season}
                  onClick={() =>
                    onLoadUnit?.({
                      season: entry.season,
                      playerIds: analysis.players.map(
                        (player) => player.playerId
                      ),
                    })
                  }
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition enabled:hover:bg-white/[0.07] disabled:cursor-default light:border-slate-200/60 light:bg-gray-100/60 light:enabled:hover:bg-gray-100"
                >
                  <div className="text-sm font-semibold text-white light:text-gray-900">
                    {shortSeason(entry.season)} · {entry.team}
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${ratingTone(entry.xGoalsForPercentage)}`}
                    >
                      {format(entry.xGoalsForPercentage)}% xGF
                    </div>
                    <div className="text-[0.62rem] text-gray-400 light:text-slate-500">
                      {format(entry.icetimeMinutes, 0)} min
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
