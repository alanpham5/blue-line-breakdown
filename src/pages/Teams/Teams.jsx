import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { track } from "@vercel/analytics";
import { Loader2, Search } from "lucide-react";
import { apiService } from "../../services/apiService";
import { Header } from "../../components/Header";
import { AppSelect } from "../../components/AppSelect";
import { TeamHeader } from "./TeamHeader";
import { PlayerCard } from "./PlayerCard";
import { playerUtils } from "../../utils/playerUtils";
import { useIsExternal } from "../../hooks/useIsExternal";
import { LoadingScreen } from "../../components/LoadingScreen";
import { useTheme } from "../../providers/ThemeContext";

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

const SearchForm = ({
  seasons,
  tempSeason,
  setTempSeason,
  tempTeam,
  setTempTeam,
  tempPosition,
  setTempPosition,
  teams,
  loadingTeams,
  getSeasonName,
}) => {
  const sharedFieldClassName =
    "app-field px-4 py-3.5 text-base text-white light:text-gray-900";
  const getTeamLabel = (team) =>
    tempSeason <= 2013 && team === "ARI" ? "PHX" : team;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      <div>
        <AppSelect
          placeholder="Season"
          value={tempSeason}
          onChange={(e) => setTempSeason(e.target.value)}
          className={`${sharedFieldClassName} pr-10`}
        >
          {[...seasons].reverse().map((s) => (
            <option key={s} value={s}>
              {getSeasonName(s)}
            </option>
          ))}
        </AppSelect>
      </div>
      <div>
        <AppSelect
          placeholder="Team"
          value={tempTeam}
          onChange={(e) => setTempTeam(e.target.value)}
          disabled={loadingTeams || !tempSeason}
          className={`${sharedFieldClassName} pr-10 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {loadingTeams ? (
            <option>Loading...</option>
          ) : (
            [...teams]
              .sort((a, b) => getTeamLabel(a).localeCompare(getTeamLabel(b)))
              .map((team) => (
                <option key={team} value={team}>
                  {getTeamLabel(team)}
                </option>
              ))
          )}
        </AppSelect>
      </div>
      <div>
        <AppSelect
          placeholder="Position"
          value={tempPosition}
          onChange={(e) => setTempPosition(e.target.value)}
          className={`${sharedFieldClassName} pr-10`}
        >
          <option value="F">Forwards</option>
          <option value="D">Defensemen</option>
        </AppSelect>
      </div>
    </div>
  );
};

export const Teams = ({ enablePageLoadAnimations = true }) => {
  const now = new Date();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSeason = searchParams.get("season") || "";
  const initialTeam = searchParams.get("team") || "";
  const initialPosition = searchParams.get("position") || "";

  const [season, setSeason] = useState(initialSeason);
  const [team, setTeam] = useState(initialTeam);
  const [position, setPosition] = useState(initialPosition);
  const [tempSeason, setTempSeason] = useState(initialSeason);
  const [tempTeam, setTempTeam] = useState(initialTeam);
  const [tempPosition, setTempPosition] = useState(initialPosition);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [initializingCache, setInitializingCache] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Searching...");
  const [initInProgress, setInitInProgress] = useState(false);
  const [showTeamsOverlay, setShowTeamsOverlay] = useState(false);
  const [teamRecord, setTeamRecord] = useState(null);
  const [teamClinchStatus, setTeamClinchStatus] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const [urlInitComplete, setUrlInitComplete] = useState(false);
  const { actualTheme } = useTheme();

  const isExternal = useIsExternal();

  const initInProgressRef = useRef(false);
  const teamHeaderRef = useRef(null);

  const seasons = Array.from(
    {
      length:
        (now.getMonth() >= 10 ? now.getFullYear() : now.getFullYear() - 1) -
        2007,
    },
    (_, i) => 2008 + i
  );

  useEffect(() => {
    checkHealth();
    initializeCacheInBackground();
  }, []);

  useEffect(() => {
    if (!urlInitComplete) return;
    if (!tempSeason) {
      setTeams([]);
      return;
    }
    fetchTeams();
  }, [tempSeason, urlInitComplete]);

  useEffect(() => {
    if (teamHeaderRef.current) {
      const y =
        teamHeaderRef.current.getBoundingClientRect().top +
        window.pageYOffset -
        100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [players]);

  useEffect(() => {
    const urlSeason = searchParams.get("season");
    const urlTeam = searchParams.get("team");
    const urlPosition = searchParams.get("position");

    if (urlSeason) {
      setSeason(urlSeason);
      setTempSeason(urlSeason);
    }

    if (urlTeam) {
      setTeam(urlTeam);
      setTempTeam(urlTeam);
    }

    if (urlPosition) {
      setPosition(urlPosition);
      setTempPosition(urlPosition);
    }

    if (urlSeason && urlTeam && urlPosition) {
      performSearch(urlSeason, urlTeam, urlPosition);
    }
    setUrlInitComplete(true);
  }, [searchParams]);

  useEffect(() => {
    setTempSeason(season);
    setTempTeam(team);
    setTempPosition(position);
  }, [season, team, position]);

  const checkHealth = async () => {
    try {
      await apiService.healthCheck();
    } catch {}
  };

  const initializeCacheInBackground = async () => {
    try {
      setInitInProgress(true);
      initInProgressRef.current = true;

      const cacheStatus = await apiService.checkCacheStatus();
      if (!cacheStatus.dataLoaded || !cacheStatus.cacheExists) {
        const initResponse = await apiService.initializeCache();

        if (initResponse.status === "loading") {
          await new Promise((resolve) => {
            const poll = async () => {
              const status = await apiService.checkCacheStatus();
              if (status.dataLoaded || status.cacheExists) {
                initInProgressRef.current = false;
                setInitInProgress(false);
                resolve();
              } else {
                setTimeout(poll, 30000);
              }
            };
            poll();
          });
        }
      }

      setInitInProgress(false);
      initInProgressRef.current = false;
    } catch {
      setInitInProgress(false);
      initInProgressRef.current = false;
    }
  };

  const fetchTeams = async () => {
    setLoadingTeams(true);
    let overlayTimeout = setTimeout(() => setShowTeamsOverlay(true), 3000);
    try {
      const data = await apiService.fetchTeams(tempSeason);
      setTeams(data.teams || []);
      const urlTeam = searchParams.get("team");

      if (tempTeam && data.teams?.length && !data.teams.includes(tempTeam)) {
        setTempTeam("");
      } else if (urlTeam && data.teams?.includes(urlTeam)) {
        setTempTeam(urlTeam);
      }
    } catch {
    } finally {
      clearTimeout(overlayTimeout);
      setShowTeamsOverlay(false);
      setLoadingTeams(false);
    }
  };

  const ensureCacheInitialized = async () => {
    if (!initInProgressRef.current) return;

    setInitializingCache(true);

    const messages = [
      "Searching...",
      "Hold on, we need to refresh the data...",
      "Turning on the lights...",
      "Zamboni resurfacing the ice...",
      "Almost ready...",
    ];

    let i = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[i++ % messages.length]);
    }, 6000);

    while (initInProgressRef.current) {
      await new Promise((r) => setTimeout(r, 1000));
    }

    clearInterval(interval);
    setInitializingCache(false);
    setLoadingMessage("Initializing...");
  };

  const performSearch = async (s, t, p) => {
    if (!s || !t || !p) return;

    await ensureCacheInitialized();

    setLoading(true);
    try {
      const data = await apiService.fetchRosters(s, t, p);
      const teamStatus = await apiService.getNhlTeamStatus(
        s < 2014 && t === "ARI" ? "PHX" : t,
        s
      );
      if (!teamStatus.record) {
        setTeamRecord(null);
        setTeamClinchStatus(null);
      } else {
        setTeamRecord(
          `${teamStatus.record.wins}-${teamStatus.record.losses}-${teamStatus.record.otl}`
        );
        setTeamClinchStatus(getClinchStatus(teamStatus.clincher));
      }
      setPlayers(data.players || []);
      setRenderKey((prev) => prev + 1);
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    if (!tempSeason || !tempTeam || !tempPosition) return;
    setSeason(tempSeason);
    setTeam(tempTeam);
    setPosition(tempPosition);
    setSearchParams(
      { season: tempSeason, team: tempTeam, position: tempPosition },
      { replace: false }
    );
    track("team_search", {
      team: tempTeam,
      season: tempSeason,
      position: tempPosition,
    });
  };

  const handlePlayerClick = (player) => {
    navigate(
      `/?player=${encodeURIComponent(
        player.name
      )}&season=${season}&position=${position}`
    );
  };

  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      {isExternal && initInProgress ? (
        <LoadingScreen />
      ) : (
        <>
          {(initializingCache || showTeamsOverlay) && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/72 backdrop-blur-sm light:bg-black/30">
              <div className="liquid-glass-strong rounded-[30px] p-8 text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-sky-300 light:text-sky-600" />
                <p className="text-lg font-medium text-white light:text-gray-900">
                  {loadingMessage}
                </p>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            <Header />
            <div className="relative z-10">
              <div
                className={`liquid-glass-strong rounded-[32px] p-5 sm:p-6 lg:p-7 mb-8 ${enablePageLoadAnimations ? "liquid-glass-animate" : ""}`}
                style={{ overflow: "visible" }}
              >
                <div className="mb-6">
                  <h1 className="section-title text-4xl sm:text-5xl">Teams</h1>
                </div>
                <SearchForm
                  seasons={seasons}
                  tempSeason={tempSeason}
                  setTempSeason={setTempSeason}
                  tempTeam={tempTeam}
                  setTempTeam={setTempTeam}
                  tempPosition={tempPosition}
                  setTempPosition={setTempPosition}
                  teams={teams}
                  loadingTeams={loadingTeams}
                  getSeasonName={getSeasonName}
                />
                <button
                  onClick={handleSearchClick}
                  disabled={loading}
                  className="btn-search-primary mb-1 mt-5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                    </>
                  ) : (
                    <>
                      <Search size={20} /> Search Roster
                    </>
                  )}
                </button>
                {players.length > 0 && (
                  <div className="relative z-0 mt-6 space-y-6 sm:mt-7 sm:space-y-7">
                    <TeamHeader
                      team={team}
                      season={season}
                      position={position}
                      teamRecord={teamRecord}
                      teamClinchStatus={teamClinchStatus}
                    />
                    <div
                      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                      key={renderKey}
                    >
                      {players.map((p, idx) => (
                        <div
                          key={p.playerId}
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <PlayerCard
                            player={p}
                            team={team}
                            season={season}
                            stroke={playerUtils.getTeamColor(
                              team,
                              season,
                              actualTheme
                            )}
                            onPlayerClick={handlePlayerClick}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
