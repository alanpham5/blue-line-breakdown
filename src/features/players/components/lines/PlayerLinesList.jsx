import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { playerUtils } from "utils/playerUtils";
import {
  SHARE_STATS,
  ShareRing,
  formatToi,
} from "features/players/components/lines/ShareBar";

const PAGE_SIZE = 25;
const PLAYER_SCORING = [
  { key: "playerGoals", field: "goals", label: "G", name: "Goals" },
  { key: "playerAssists", field: "assists", label: "A", name: "Assists" },
  { key: "playerPoints", field: "points", label: "P", name: "Points" },
];
export const SORT_OPTIONS = [
  { value: "minutes", label: "Time on Ice" },
  { value: "gamesPlayed", label: "Games Played" },
  ...PLAYER_SCORING.map((item) => ({
    value: item.key,
    label: item.name,
    player: true,
  })),
  ...SHARE_STATS.map((stat) => ({
    value: stat.key,
    label: stat.label,
    measured: `${stat.short}%`,
  })),
];
export const MODES = [
  { value: "percentile", label: "Percentiles" },
  { value: "measurement", label: "Measurements" },
];
export const DEFAULT_SORT = { key: "minutes", dir: "desc" };

const SCORING_VISIBILITY = { playerGoals: "lg", playerAssists: "lg" };
const COLUMNS = [
  { key: "minutes", label: "TOI", short: "TOI" },
  { key: "gamesPlayed", label: "GP", short: "GP", from: "sm" },
  ...SHARE_STATS.map((stat) => ({
    key: stat.key,
    label: stat.label,
    short: stat.short,
    measured: `${stat.short}%`,
  })),
  ...PLAYER_SCORING.map((item) => ({
    key: item.key,
    label: item.name,
    short: item.label,
    name: item.name,
    player: true,
    from: SCORING_VISIBILITY[item.key] || "sm",
  })),
];
const HEADER_VISIBILITY = { sm: "hidden sm:flex", lg: "hidden lg:flex" };
const CELL_VISIBILITY = { sm: "hidden sm:block", lg: "hidden lg:block" };

const PAGE_GRID =
  "grid-cols-[1.1rem_minmax(0,1fr)_2.9rem_repeat(3,2.5rem)] gap-x-2 px-4 sm:grid-cols-[1.5rem_minmax(0,1fr)_3.75rem_2.5rem_repeat(3,3.75rem)_3.75rem] sm:gap-x-3 sm:px-6 lg:grid-cols-[1.5rem_minmax(0,1fr)_4.5rem_2.75rem_repeat(3,4.5rem)_repeat(3,4.75rem)]";
const SHAREABLE_GRID =
  "grid-cols-[2.25rem_minmax(0,1fr)_6rem_3.5rem_repeat(3,5.25rem)_repeat(3,5rem)] gap-x-3.5 px-7";

const columnLabel = (column, mode) =>
  mode === "measurement" && column.measured ? column.measured : column.label;
const columnShort = (column, mode) =>
  mode === "measurement" && column.measured ? column.measured : column.short;

const scoringField = (key) =>
  PLAYER_SCORING.find((item) => item.key === key)?.field;

const sortValue = (unit, key, mode) => {
  if (key === "minutes" || key === "gamesPlayed") return unit[key] ?? -1;
  const field = scoringField(key);
  if (field) return unit.scoring?.[field] ?? -1;
  const stat = unit.stats?.[key];
  const value = mode === "percentile" ? stat?.percentile : stat?.value;
  return value ?? -1;
};

export const sortUnits = (units, sort, mode) => {
  const direction = sort.dir === "asc" ? -1 : 1;
  return [...units].sort(
    (a, b) =>
      direction * (sortValue(b, sort.key, mode) - sortValue(a, sort.key, mode))
  );
};

export const nextSort = (current, key) =>
  current.key === key
    ? { key, dir: current.dir === "desc" ? "asc" : "desc" }
    : { key, dir: "desc" };

export const lastName = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
};

export const ModeToggle = ({ mode, onChange }) => (
  <div
    role="radiogroup"
    aria-label="Circle scale"
    className="inline-flex gap-1 rounded-full bg-black/20 p-1 backdrop-blur-sm light:bg-white/80"
  >
    {MODES.map((option) => {
      const active = option.value === mode;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#7ee340] ${
            active
              ? "bg-white/10 text-[#7ee340] light:bg-slate-900/10 light:text-[#2e6e14]"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-100 light:text-slate-700 light:hover:bg-slate-900/5 light:hover:text-slate-800"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

const SortIcon = ({ active, dir, shareable }) => {
  if (!active && shareable) return null;
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <Icon
      className={`shrink-0 ${shareable ? "h-5 w-5" : active ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "hidden h-3.5 w-3.5 opacity-50 sm:block"}`}
      aria-hidden="true"
    />
  );
};

const PlayerColumnLabel = ({ playerName, stat, icon, shareable }) => {
  const surname = lastName(playerName) || "Player";
  const shareableSize = surname.length > 9 ? "text-sm" : "text-base";
  return (
    <span
      className={`flex min-w-0 flex-col items-center text-center leading-tight ${shareable ? shareableSize : ""}`}
    >
      <span
        className="max-w-full truncate"
        data-export-nudge={shareable ? 8 : undefined}
      >
        {surname}
      </span>
      <span className="flex items-center gap-0.5">
        <span data-export-nudge={shareable ? 8 : undefined}>{stat}</span>
        {icon}
      </span>
    </span>
  );
};

const HeaderCell = ({ column, sort, mode, playerName, onSort, shareable }) => {
  const active = sort.key === column.key;
  const label = columnLabel(column, mode);
  const tone = active
    ? `text-[#7ee340] ${shareable ? "" : "light:text-[#2e6e14]"}`
    : `text-gray-400 ${shareable ? "" : "light:text-slate-600"}`;
  const visibility = shareable
    ? "flex"
    : HEADER_VISIBILITY[column.from] || "flex";
  const layout = `${visibility} min-w-0 items-center justify-center gap-0.5 font-semibold ${tone}`;
  const description = column.player
    ? `${playerName ? `${lastName(playerName)} ` : ""}${column.name} with this unit`
    : label;
  const content = column.player ? (
    <PlayerColumnLabel
      playerName={playerName}
      stat={column.name}
      shareable={shareable}
      icon={<SortIcon active={active} dir={sort.dir} shareable={shareable} />}
    />
  ) : (
    <>
      <span
        className={shareable ? "" : "sm:hidden"}
        data-export-nudge={shareable ? 8 : undefined}
      >
        {shareable ? label : columnShort(column, mode)}
      </span>
      {!shareable && <span className="hidden sm:inline">{label}</span>}
      <SortIcon active={active} dir={sort.dir} shareable={shareable} />
    </>
  );

  if (shareable) {
    return <span className={`${layout} text-lg`}>{content}</span>;
  }
  return (
    <button
      type="button"
      onClick={() => onSort(column.key)}
      title={description}
      aria-label={`Sort by ${description}`}
      className={`${layout} rounded-md text-[11px] outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#7ee340] light:hover:text-gray-900 sm:text-xs`}
    >
      {content}
    </button>
  );
};

export const LinesHeader = ({
  sort,
  mode,
  playerName,
  onSort,
  unitType,
  shareable = false,
}) => (
  <div
    className={`grid items-center border-b border-white/[0.07] py-3 ${shareable ? SHAREABLE_GRID : `${PAGE_GRID} light:border-slate-300`}`}
  >
    <span
      className={`font-semibold text-gray-500 ${shareable ? "text-lg" : "text-[11px] light:text-slate-600 sm:text-xs"}`}
      data-export-nudge={shareable ? 8 : undefined}
    >
      #
    </span>
    <span
      className={`font-semibold text-gray-400 ${shareable ? "text-lg" : "text-[11px] light:text-slate-600 sm:text-xs"}`}
      data-export-nudge={shareable ? 8 : undefined}
    >
      {unitType === "pairing" ? "Pairing" : "Line"}
    </span>
    {COLUMNS.map((column) => (
      <HeaderCell
        key={column.key}
        column={column}
        sort={sort}
        mode={mode}
        playerName={playerName}
        onSort={onSort}
        shareable={shareable}
      />
    ))}
  </div>
);

const Headshot = ({ player, shareable }) => {
  const headshot = playerUtils.getPlayerHeadshot(
    player.playerId,
    player.team,
    player.season
  );
  return (
    <img
      src={shareable ? playerUtils.getCorsWrappedUrl(headshot) : headshot}
      alt=""
      className={`shrink-0 rounded-full border-2 border-[#1b1c20] object-cover ${shareable ? "h-14 w-14" : "h-10 w-10 light:border-white"}`}
      style={{
        background: playerUtils.getSurfaceGradient(
          playerUtils.getTeamColor(player.team, player.season),
          "dark"
        ),
      }}
      onError={(event) => {
        event.target.src = playerUtils.getDefaultHeadshot();
      }}
    />
  );
};

const PlayerName = ({ player, season, shareable }) =>
  shareable ? (
    lastName(player.name)
  ) : (
    <Link
      to={playerUtils.playerProfilePath(player.playerId, season)}
      title={player.name}
      className="transition-colors hover:text-[#7ee340] light:hover:text-[#2e6e14]"
    >
      {lastName(player.name)}
    </Link>
  );

const PlayerNames = ({ unit, shareable }) => {
  if (shareable) {
    return (
      <p
        className="whitespace-nowrap text-[1.3rem] font-bold leading-tight text-white"
        data-export-nudge={8}
      >
        {unit.players.map((player, index) => (
          <span key={player.playerId}>
            {index > 0 && <span className="text-gray-500"> · </span>}
            <PlayerName player={player} shareable />
          </span>
        ))}
      </p>
    );
  }
  return (
    <>
      <div className="flex flex-col text-[13px] font-bold leading-snug text-white light:text-gray-900 sm:hidden">
        {unit.players.map((player) => (
          <span key={player.playerId} className="truncate">
            <PlayerName player={player} season={unit.season} />
          </span>
        ))}
      </div>
      <p className="hidden truncate whitespace-nowrap font-bold text-white light:text-gray-900 sm:block sm:text-[15px] lg:text-sm xl:text-base">
        {unit.players.map((player, index) => (
          <span key={player.playerId}>
            {index > 0 && (
              <span className="text-gray-500 light:text-slate-500"> · </span>
            )}
            <PlayerName player={player} season={unit.season} />
          </span>
        ))}
      </p>
    </>
  );
};

const scoringValue = (unit, field) => unit.scoring?.[field] ?? "-";

const UnitDetail = ({ unit, isCareer, shareable }) => {
  const teamSeason =
    isCareer && `${unit.team} ${playerUtils.formatSeason(unit.season)}`;
  if (shareable) {
    return teamSeason ? (
      <p className="mt-1 text-lg text-gray-400" data-export-nudge={6}>
        {teamSeason}
      </p>
    ) : null;
  }
  return (
    <p className="mt-0.5 text-xs text-gray-400 light:text-slate-600">
      <span className="sm:hidden">
        {unit.gamesPlayed} GP · {scoringValue(unit, "points")} P
        {teamSeason && " · "}
      </span>
      {teamSeason}
    </p>
  );
};

const NumberCell = ({ value, from, strong = false, shareable }) => {
  const tone = strong
    ? `text-white ${shareable ? "" : "light:text-gray-900"}`
    : `text-gray-300 ${shareable ? "" : "light:text-slate-700"}`;
  const size = shareable
    ? "text-2xl"
    : `${CELL_VISIBILITY[from] || ""} ${strong ? "text-xs sm:text-[15px]" : "text-sm"} tabular-nums`;
  return (
    <span
      className={`text-center ${strong ? "font-bold" : "font-semibold"} ${tone} ${size}`}
      data-export-nudge={shareable ? 8 : undefined}
    >
      {value}
    </span>
  );
};

export const LineRow = ({ unit, rank, mode, isCareer, shareable = false }) => (
  <li
    className={`grid items-center ${shareable ? `${SHAREABLE_GRID} py-4` : `${PAGE_GRID} py-3.5`}`}
  >
    <span
      className={`font-bold text-gray-500 ${shareable ? "text-2xl" : "text-xs tabular-nums light:text-slate-600 sm:text-sm"}`}
      data-export-nudge={shareable ? 8 : undefined}
    >
      {rank}
    </span>
    <div
      className={`flex min-w-0 items-center ${shareable ? "gap-4" : "gap-3"}`}
    >
      <div
        className={`shrink-0 ${shareable ? "flex -space-x-4" : "hidden -space-x-3.5 xl:flex"}`}
      >
        {unit.players.map((player) => (
          <Headshot
            key={player.playerId}
            player={player}
            shareable={shareable}
          />
        ))}
      </div>
      <div className="min-w-0">
        <PlayerNames unit={unit} shareable={shareable} />
        <UnitDetail unit={unit} isCareer={isCareer} shareable={shareable} />
      </div>
    </div>
    <NumberCell value={formatToi(unit.minutes)} strong shareable={shareable} />
    <NumberCell value={unit.gamesPlayed} from="sm" shareable={shareable} />
    {SHARE_STATS.map((stat) => (
      <ShareRing
        key={stat.key}
        id={`line-${unit.season}-${unit.lineId}-${stat.key}`}
        stat={stat}
        values={unit.stats?.[stat.key]}
        mode={mode}
        shareable={shareable}
      />
    ))}
    {COLUMNS.filter((column) => column.player).map((column) => (
      <NumberCell
        key={column.key}
        value={scoringValue(unit, scoringField(column.key))}
        from={column.from}
        strong={column.key === "playerPoints"}
        shareable={shareable}
      />
    ))}
  </li>
);

const MIN_TOI_MINUTES = 10;

export const parseToi = (text) => {
  const match = String(text ?? "")
    .trim()
    .match(/^(\d+)(?::([0-5]?\d))?$/);
  return match ? Number(match[1]) + Number(match[2] || 0) / 60 : null;
};

const TypedToiValue = ({ value, max, onChange }) => {
  const [draft, setDraft] = useState(null);
  const cancelled = useRef(false);

  const commit = () => {
    const minutes = parseToi(draft);
    if (!cancelled.current && minutes != null) {
      onChange(Math.min(max, Math.max(MIN_TOI_MINUTES, minutes)));
    }
    cancelled.current = false;
    setDraft(null);
  };

  if (draft == null) {
    return (
      <button
        type="button"
        onClick={() => setDraft(formatToi(value))}
        title="Click to type a minimum (minutes or m:ss)"
        aria-label={`Minimum time on ice ${formatToi(value)}, click to type`}
        className="h-7 w-16 shrink-0 cursor-text rounded-md border border-transparent px-1.5 text-right text-sm font-bold tabular-nums text-white underline decoration-white/30 decoration-dotted underline-offset-4 outline-none transition-colors hover:text-[#7ee340] focus-visible:ring-2 focus-visible:ring-[#7ee340] light:text-gray-900 light:decoration-slate-400 light:hover:text-[#2e6e14]"
      >
        {formatToi(value)}
      </button>
    );
  }
  return (
    <input
      autoFocus
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={(event) => event.target.select()}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          cancelled.current = true;
          event.currentTarget.blur();
        }
      }}
      aria-label="Minimum time on ice in minutes or m:ss"
      className="h-7 w-16 shrink-0 rounded-md border border-[#7ee340]/60 bg-white/[0.06] px-1.5 text-right text-sm font-bold tabular-nums text-white outline-none ring-2 ring-[#7ee340]/25 selection:bg-[#7ee340]/30 light:border-[#2e6e14]/50 light:bg-white light:text-gray-900 light:ring-[#2e6e14]/15 light:selection:bg-[#2e6e14]/20"
    />
  );
};

const MinimumToiSlider = ({ value, max, onChange }) => (
  <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-sm">
    <label
      htmlFor="min-toi-slider"
      className="shrink-0 text-sm font-semibold text-gray-400 light:text-slate-600"
    >
      Min TOI
    </label>
    <input
      id="min-toi-slider"
      type="range"
      min={MIN_TOI_MINUTES}
      max={max}
      step={1}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[#7ee340] light:accent-[#2e6e14]"
      aria-valuetext={`${formatToi(value)} minimum time on ice`}
    />
    <TypedToiValue value={value} max={max} onChange={onChange} />
  </div>
);

export const PlayerLinesList = ({
  units,
  unitType,
  isCareer,
  playerName,
  sort,
  mode,
  minMinutes,
  maxMinutes,
  onSortChange,
  onModeChange,
  onMinMinutesChange,
}) => {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sorted = sortUnits(units, sort, mode);
  const unitLabel = unitType === "pairing" ? "pairings" : "lines";

  return (
    <section className="liquid-glass-strong overflow-hidden rounded-[32px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 light:border-slate-300 sm:px-6">
        <MinimumToiSlider
          value={minMinutes}
          max={maxMinutes}
          onChange={(value) => {
            onMinMinutesChange(value);
            setVisible(PAGE_SIZE);
          }}
        />
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
      {units.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-gray-400 light:text-slate-600">
          No {unitLabel} reached {formatToi(minMinutes)} together.
        </p>
      ) : (
        <>
          <LinesHeader
            sort={sort}
            mode={mode}
            playerName={playerName}
            unitType={unitType}
            onSort={(key) => {
              onSortChange(key);
              setVisible(PAGE_SIZE);
            }}
          />
          <ol className="divide-y divide-white/[0.06] light:divide-slate-300">
            {sorted.slice(0, visible).map((unit, index) => (
              <LineRow
                key={`${unit.season}-${unit.lineId}`}
                unit={unit}
                rank={index + 1}
                mode={mode}
                isCareer={isCareer}
              />
            ))}
          </ol>
        </>
      )}
      {sorted.length > visible && (
        <div className="border-t border-white/[0.07] px-5 py-4 text-center light:border-slate-300">
          <button
            type="button"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
            className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-[#7ee340] transition-colors hover:bg-white/15 light:bg-slate-900/10 light:text-[#2e6e14]"
          >
            Show {Math.min(PAGE_SIZE, sorted.length - visible)} more
          </button>
        </div>
      )}
    </section>
  );
};
