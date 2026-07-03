import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  Users,
  Shield,
  Hand,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Share,
  Search,
} from "lucide-react";
import { apiService } from "lib/api/apiService";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { AppSelect } from "components/ui/AppSelect";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
import { useIsMobile } from "hooks/useIsMobile";
import { ShareableModal } from "components/ui/ShareableModal";
import { UnitCard } from "features/roster/components/UnitCard";
import { RosterPlayerCard } from "features/roster/components/RosterPlayerCard";
import { SubstitutionModal } from "features/roster/components/SubstitutionModal";
import { RosterShareableDisplay } from "features/roster/components/RosterShareableDisplay";
const getSeasonName = (s) => `${s}-${(parseInt(s) + 1).toString().slice(-2)}`;
const getClinchStatus = (clincher) => {
  const statusMap = {
    x: "Clinched Playoffs",
    y: "Clinched Division",
    z: "Clinched Conference",
    "*": "President's Trophy",
  };
  return statusMap[clincher] || null;
};
const avgLeaguePercentile = (unit) => {
  const values = (unit.players || [])
    .map((p) => p.warPercentile)
    .filter((v) => typeof v === "number");
  if (!values.length) return -1;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};
const sortByAvgPercentile = (units) =>
  [...units].sort((a, b) => avgLeaguePercentile(b) - avgLeaguePercentile(a));
const rosterFromData = (data) => ({
  forwardLines: sortByAvgPercentile(data?.forwardLines || []).map((u) =>
    u.players.map((p) => p.playerId)
  ),
  defensePairs: sortByAvgPercentile(data?.defensePairs || []).map((u) =>
    u.players.map((p) => p.playerId)
  ),
  goalies: (data?.goalies || []).map((g) => g.playerId),
});
const Section = ({ icon, title, children }) => (
  <div className="rounded-[28px] liquid-glass-strong p-3 sm:p-5">
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <h3 className="text-lg font-bold tracking-display text-white light:text-gray-900">
        {title}
      </h3>
    </div>
    <div className="space-y-2.5">{children}</div>
  </div>
);
export const Roster = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { actualTheme } = useTheme();
  const isMobile = useIsMobile();
  const team = searchParams.get("team") || "";
  const season = searchParams.get("year") || searchParams.get("season") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [recordText, setRecordText] = useState(null);
  const [clinchStatus, setClinchStatus] = useState(null);
  const [modifying, setModifying] = useState(false);
  const [roster, setRoster] = useState(null);
  const [simData, setSimData] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [picker, setPicker] = useState(null);
  const [subHeadshots, setSubHeadshots] = useState({});
  const [rookies, setRookies] = useState({});
  const [showShareableModal, setShowShareableModal] = useState(false);
  const [tempTeam, setTempTeam] = useState(team);
  const [tempSeason, setTempSeason] = useState(season);
  const [teamsList, setTeamsList] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const teamSeasonRef = useRef(`${team}-${season}`);
  const now = new Date();
  const seasonsList = Array.from(
    {
      length:
        (now.getMonth() >= 10 ? now.getFullYear() : now.getFullYear() - 1) -
        2007,
    },
    (_, i) => 2008 + i
  );
  const getTeamLabel = (t) =>
    parseInt(tempSeason) <= 2013 && t === "ARI" ? "PHX" : t;
  useEffect(() => {
    setTempTeam(team);
    setTempSeason(season);
  }, [team, season]);
  useEffect(() => {
    if (!tempSeason) {
      setTeamsList([]);
      return;
    }
    let active = true;
    setLoadingTeams(true);
    apiService
      .fetchTeams(tempSeason)
      .then((data) => {
        if (!active) return;
        setTeamsList(data.teams || []);
        if (tempTeam && data.teams?.length && !data.teams.includes(tempTeam)) {
          setTempTeam("");
        }
      })
      .catch(() => active && setTeamsList([]))
      .finally(() => active && setLoadingTeams(false));
    return () => {
      active = false;
    };
  }, [tempSeason]);
  const handleSearch = () => {
    if (!tempTeam || !tempSeason) return;
    navigate(
      `/teams/roster?team=${encodeURIComponent(tempTeam)}&year=${tempSeason}`
    );
  };
  useEffect(() => {
    document.title = team
      ? `${playerUtils.getFullTeamName(team, season)} Roster | Blue Line Breakdown`
      : "Roster | Blue Line Breakdown";
  }, [team, season]);
  // When the team or season changes (Lookup Team form, similar-team link, or
  // browser navigation), drop any in-progress modify session and stale data so
  // the new team's header never renders alongside the previous team's roster or
  // record. This runs synchronously (before paint) so there is no stale frame.
  useLayoutEffect(() => {
    teamSeasonRef.current = `${team}-${season}`;
    setModifying(false);
    setRoster(null);
    setSimData(null);
    setSimulating(false);
    setPicker(null);
    setSubHeadshots({});
    setRookies({});
    setRecordText(null);
    setClinchStatus(null);
    setData(null);
    setError("");
    if (team && season) setLoading(true);
  }, [team, season]);
  useEffect(() => {
    if (!team || !season) {
      setError("Select a team and season from the Teams page.");
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await apiService.fetchTeamLines(team, season);
        if (active) setData(result);
      } catch (err) {
        if (active) setError(err.message || "Failed to load roster");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [team, season]);
  useEffect(() => {
    if (!team || !season) return;
    let active = true;
    const espnTeam = parseInt(season) < 2014 && team === "ARI" ? "PHX" : team;
    apiService
      .getNhlTeamStatus(espnTeam, season)
      .then((status) => {
        if (!active || !status.record) return;
        setRecordText(
          `${status.record.wins}-${status.record.losses}-${status.record.otl}`
        );
        setClinchStatus(getClinchStatus(status.clincher));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [team, season]);
  const runSimulate = useCallback(
    async (rosterState) => {
      const token = `${team}-${season}`;
      setSimulating(true);
      try {
        const res = await apiService.simulateTeamLines({
          team,
          year: season,
          forwardLines: rosterState.forwardLines,
          defensePairs: rosterState.defensePairs,
          goalies: rosterState.goalies,
        });
        // Ignore a response that lands after the user switched teams/season.
        if (teamSeasonRef.current !== token) return;
        setSimData(res);
      } catch (err) {
        if (teamSeasonRef.current !== token) return;
        setError(err.message || "Failed to simulate roster");
      } finally {
        if (teamSeasonRef.current === token) setSimulating(false);
      }
    },
    [team, season]
  );
  const enterModify = () => {
    const next = rosterFromData(data);
    setRoster(next);
    setModifying(true);
    runSimulate(next);
  };
  const exitModify = () => {
    setModifying(false);
    setRoster(null);
    setSimData(null);
    setPicker(null);
    setSubHeadshots({});
    setRookies({});
  };
  const resetModify = () => {
    const next = rosterFromData(data);
    setRoster(next);
    setSubHeadshots({});
    setRookies({});
    runSimulate(next);
  };
  const applySub = (player) => {
    if (!picker) return;
    const { position, unitIndex, playerIndex, currentPlayerId } = picker;
    const asRookie = !!player.rookieName;
    const currentIsRookie = rookies[currentPlayerId] !== undefined;
    // Re-selecting the exact same player is only a no-op when it doesn't change
    // rookie state (e.g. renaming a rookie, or reverting a rookie to the real
    // player, both reuse the same profile id and must still apply).
    if (player.playerId === currentPlayerId && !asRookie && !currentIsRookie) {
      setPicker(null);
      return;
    }
    const next = {
      forwardLines: roster.forwardLines.map((u) => [...u]),
      defensePairs: roster.defensePairs.map((u) => [...u]),
      goalies: [...roster.goalies],
    };
    const groupFor = (pos) =>
      pos === "F"
        ? next.forwardLines
        : pos === "D"
          ? next.defensePairs
          : null;
    const setSlot = (pos, ui, pi, id) => {
      const group = groupFor(pos);
      if (group) group[ui][pi] = id;
      else next.goalies[ui] = id;
    };
    const findSlot = (pos, id) => {
      const group = groupFor(pos);
      if (group) {
        for (let ui = 0; ui < group.length; ui++)
          for (let pi = 0; pi < group[ui].length; pi++)
            if (group[ui][pi] === id) return { ui, pi };
      } else {
        const ui = next.goalies.indexOf(id);
        if (ui !== -1) return { ui, pi: 0 };
      }
      return null;
    };
    // If the incoming player is already on the roster (same position group),
    // swap the two players' slots instead of dropping the displaced one.
    const existing = findSlot(position, player.playerId);
    const relocatedDisplaced =
      existing &&
      !(existing.ui === unitIndex && existing.pi === playerIndex);
    setSlot(position, unitIndex, playerIndex, player.playerId);
    if (relocatedDisplaced) {
      setSlot(position, existing.ui, existing.pi, currentPlayerId);
    }
    setRookies((prev) => {
      const nextRookies = { ...prev };
      if (asRookie) {
        // A rookie borrows an existing player's metrics but shows a custom name
        // and the generic headshot (handled in the display decoration).
        nextRookies[player.playerId] = player.rookieName;
      } else if (player.playerId === currentPlayerId) {
        // Reverting the current rookie back to the real player.
        delete nextRookies[player.playerId];
      }
      // Clear a stale rookie flag when the displaced player leaves the roster.
      if (currentPlayerId !== player.playerId && !relocatedDisplaced) {
        delete nextRookies[currentPlayerId];
      }
      return nextRookies;
    });
    if (!asRookie && player.team) {
      // Preserve the swapped-in player's original team so their headshot keeps
      // resolving to the correct source after re-simulation.
      setSubHeadshots((prev) => ({ ...prev, [player.playerId]: player.team }));
    }
    setRoster(next);
    setPicker(null);
    runSimulate(next);
  };
  const usedIds = roster
    ? new Set([
        ...roster.forwardLines.flat(),
        ...roster.defensePairs.flat(),
        ...roster.goalies,
      ])
    : new Set();
  const swappedIds = (() => {
    if (!roster || !data) return new Set();
    const original = rosterFromData(data);
    const originalIds = new Set([
      ...original.forwardLines.flat(),
      ...original.defensePairs.flat(),
      ...original.goalies,
    ]);
    return new Set([...usedIds].filter((id) => !originalIds.has(id)));
  })();
  const teamCardGradient = playerUtils.getTeamCardGradient(
    team,
    season,
    actualTheme
  );
  const didWinStanleyCup = playerUtils.didWinStanleyCup(team, season);
  const estimated = simData?.estimatedRecord;
  const usingSim = modifying && simData;
  const decoratePlayer = (player) => {
    if (!player) return player;
    let p = player;
    if (subHeadshots[p.playerId]) {
      p = { ...p, team: subHeadshots[p.playerId] };
    }
    if (rookies[p.playerId]) {
      p = { ...p, name: rookies[p.playerId], isRookie: true };
    }
    return p;
  };
  const decorateUnit = (unit) => ({
    ...unit,
    players: (unit.players || []).map(decoratePlayer),
  });
  const forwardUnits = usingSim
    ? simData.forwardLines.map(decorateUnit)
    : sortByAvgPercentile(data?.forwardLines || []);
  const defenseUnits = usingSim
    ? simData.defensePairs.map(decorateUnit)
    : sortByAvgPercentile(data?.defensePairs || []);
  const goalieUnits = usingSim
    ? (simData.goalies || []).map(decoratePlayer)
    : data?.goalies || [];
  const forwardExtras = data?.forwardExtras || [];
  const defenseExtras = data?.defenseExtras || [];
  const openForwardPicker = (i) => (player, pi) =>
    setPicker({
      position: "F",
      unitIndex: i,
      playerIndex: pi,
      currentPlayerId: player?.playerId,
    });
  const openDefensePicker = (i) => (player, pi) =>
    setPicker({
      position: "D",
      unitIndex: i,
      playerIndex: pi,
      currentPlayerId: player?.playerId,
    });
  const navigateToPlayer = (position) => (player) => {
    if (!player?.name) return;
    navigate(
      `/players?player=${encodeURIComponent(player.name)}&season=${season}&position=${position}`
    );
  };
  const renderExtras = (label, players, position) => (
    <div className="mt-4 border-t border-white/10 pt-4 light:border-slate-200">
      <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-gray-400 light:text-gray-500">
        {label}
      </h4>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <RosterPlayerCard
            key={player.playerId}
            player={player}
            team={team}
            season={season}
            onPlayerClick={navigateToPlayer(position)}
          />
        ))}
      </div>
    </div>
  );
  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header />

        <button
          onClick={() =>
            navigate(`/teams?team=${encodeURIComponent(team)}&year=${season}`)
          }
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 transition-colors hover:text-gray-200 light:text-slate-500 light:hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Team
        </button>

        <div
          className="liquid-glass-strong mb-6 rounded-[32px] p-4 sm:mb-8 sm:p-6"
          style={{ overflow: "visible" }}
        >
          <h2 className="mb-4 text-xl font-bold tracking-display text-white light:text-gray-900">
            Lookup Team
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <AppSelect
              placeholder="Season"
              value={tempSeason}
              onChange={(e) => setTempSeason(e.target.value)}
              className="app-field px-4 py-3.5 pr-10 text-base text-white light:text-gray-900"
            >
              {[...seasonsList].reverse().map((s) => (
                <option key={s} value={s}>
                  {getSeasonName(s)}
                </option>
              ))}
            </AppSelect>
            <AppSelect
              placeholder="Team"
              value={tempTeam}
              onChange={(e) => setTempTeam(e.target.value)}
              disabled={loadingTeams || !tempSeason}
              className="app-field px-4 py-3.5 pr-10 text-base text-white light:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingTeams ? (
                <option>Loading...</option>
              ) : (
                [...teamsList]
                  .sort((a, b) => getTeamLabel(a).localeCompare(getTeamLabel(b)))
                  .map((t) => (
                    <option key={t} value={t}>
                      {getTeamLabel(t)}
                    </option>
                  ))
              )}
            </AppSelect>
          </div>
          <button
            onClick={handleSearch}
            disabled={!tempSeason || !tempTeam}
            className="btn-search-primary mt-5"
          >
            <Search size={20} /> Search Team
          </button>
        </div>

        {team && season && (
          <div
            className="team-card-surface liquid-glass mb-6 overflow-hidden rounded-[32px] px-5 py-6 sm:mb-8 sm:px-6"
            style={{ "--team-card-gradient": teamCardGradient }}
          >
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center md:flex-row md:gap-6 md:text-left">
              <div className="relative flex h-24 w-24 items-center justify-center md:h-28 md:w-28">
                {didWinStanleyCup && (
                  <img
                    src="/stanleycup.png"
                    alt="Stanley Cup"
                    className="absolute inset-0 z-0 h-full w-full object-contain"
                  />
                )}
                <img
                  src={playerUtils.getTeamLogoUrl(team, season, actualTheme)}
                  alt={team}
                  className={`relative z-10 h-24 object-contain team-logo-stroke md:h-28 ${didWinStanleyCup ? "scale-75" : ""}`}
                />
              </div>
              <div>
                <h2 className="flex flex-wrap items-center justify-center gap-2 text-2xl font-extrabold tracking-display text-white light:text-gray-900 md:justify-start sm:text-3xl">
                  <span>{playerUtils.getFullTeamName(team, season)}</span>
                  {data && !error && !loading && (
                    <button
                      type="button"
                      onClick={() => setShowShareableModal(true)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:text-white light:border-slate-300 light:bg-white/80 light:text-slate-600 light:hover:text-slate-900"
                      aria-label={
                        isMobile ? "Share image" : "Download shareable image"
                      }
                    >
                      {isMobile ? (
                        <Share className="h-4 w-4" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </h2>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-gray-300 light:text-gray-600 md:justify-start sm:text-base">
                  <span>{getSeasonName(season)}</span>
                  {modifying && estimated ? (
                    <>
                      <span>•</span>
                      <span className="text-sky-300 light:text-sky-600">
                        Est. {estimated.display}
                      </span>
                      {typeof estimated.playoffProbability === "number" && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-300 light:text-emerald-600">
                            {Math.round(estimated.playoffProbability * 100)}%
                            playoffs
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {recordText && (
                        <>
                          <span>•</span>
                          <span className="text-sky-300 light:text-sky-600">
                            {recordText}
                          </span>
                        </>
                      )}
                      {clinchStatus && (
                        <>
                          <span>•</span>
                          <span className="whitespace-nowrap text-emerald-300 light:text-emerald-600">
                            {clinchStatus}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400 light:text-gray-500">
                  {error
                    ? "Lineup data isn't available for this team & season."
                    : modifying
                      ? "Modify mode — substitute any player to re-estimate the record & line scores"
                      : "Most-used 5v5 units, ranked by average league percentile"}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-[32px] liquid-glass p-12">
            <Loader2 className="h-10 w-10 animate-spin text-sky-300 light:text-sky-600" />
            <p className="text-gray-300 light:text-gray-600">
              Building line combinations...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[32px] liquid-glass p-6 text-center text-rose-400">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                {modifying && (
                  <button
                    type="button"
                    onClick={resetModify}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:text-white light:border-slate-300 light:bg-white/80 light:text-slate-600 light:hover:text-slate-900"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={modifying ? exitModify : enterModify}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  modifying
                    ? "text-emerald-300 hover:text-emerald-200 light:text-emerald-700 light:hover:text-emerald-800"
                    : "text-emerald-400 hover:text-emerald-300 light:text-emerald-600 light:hover:text-emerald-700"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Modify
              </button>
            </div>

            {modifying && !simData ? (
              <div className="flex items-center justify-center rounded-[28px] liquid-glass-strong p-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-300 light:text-sky-600" />
              </div>
            ) : (
              <div
                className={`space-y-4 transition-opacity ${simulating ? "opacity-60" : ""}`}
              >
                <Section
                  icon={
                    <Users className="h-5 w-5 shrink-0 text-cyan-300 light:text-cyan-600" />
                  }
                  title="Forwards"
                >
                  {forwardUnits.map((unit, i) => (
                    <UnitCard
                      key={unit.lineId || `f-${i}`}
                      label={`Line ${i + 1}`}
                      unit={unit}
                      team={team}
                      season={season}
                      editable={modifying}
                      swappedIds={swappedIds}
                      onPlayerClick={
                        modifying ? openForwardPicker(i) : navigateToPlayer("F")
                      }
                    />
                  ))}
                  {!modifying &&
                    forwardExtras.length > 0 &&
                    renderExtras("Extra Forwards", forwardExtras, "F")}
                </Section>

                <Section
                  icon={
                    <Shield className="h-5 w-5 shrink-0 text-rose-400 light:text-rose-600" />
                  }
                  title="Defense"
                >
                  {defenseUnits.map((unit, i) => (
                    <UnitCard
                      key={unit.lineId || `d-${i}`}
                      label={`Pairing ${i + 1}`}
                      unit={unit}
                      team={team}
                      season={season}
                      editable={modifying}
                      swappedIds={swappedIds}
                      onPlayerClick={
                        modifying ? openDefensePicker(i) : navigateToPlayer("D")
                      }
                    />
                  ))}
                  {!modifying &&
                    defenseExtras.length > 0 &&
                    renderExtras("Extra Defensemen", defenseExtras, "D")}
                </Section>

                {goalieUnits.length > 0 && (
                  <Section
                    icon={
                      <Hand className="h-5 w-5 shrink-0 text-amber-300 light:text-amber-600" />
                    }
                    title="Goalies"
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {goalieUnits.map((g, i) => (
                        <RosterPlayerCard
                          key={g.playerId || `g-${i}`}
                          player={g}
                          team={team}
                          season={season}
                          editable={modifying}
                          swapped={swappedIds.has(g.playerId)}
                          onPlayerClick={
                            modifying
                              ? () =>
                                  setPicker({
                                    position: "G",
                                    unitIndex: i,
                                    playerIndex: 0,
                                    currentPlayerId: g.playerId,
                                  })
                              : navigateToPlayer("G")
                          }
                        />
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )}
          </div>
        )}
        <Footer />
      </div>

      <SubstitutionModal
        isOpen={!!picker}
        onClose={() => setPicker(null)}
        position={picker?.position}
        season={season}
        usedPlayerIds={usedIds}
        currentPlayerId={picker?.currentPlayerId}
        onSelect={applySub}
      />

      <ShareableModal
        isOpen={showShareableModal}
        onClose={() => setShowShareableModal(false)}
        fileName={
          team
            ? `${playerUtils.getFullTeamName(team, season).replace(/\s+/g, "-")}-${season}-roster`
            : "roster-shareable"
        }
      >
        <RosterShareableDisplay
          team={team}
          season={season}
          forwardUnits={forwardUnits}
          defenseUnits={defenseUnits}
          goalieUnits={goalieUnits}
          recordText={recordText}
          clinchStatus={clinchStatus}
          modifying={modifying}
          estimated={estimated}
        />
      </ShareableModal>
    </div>
  );
};
export default Roster;
