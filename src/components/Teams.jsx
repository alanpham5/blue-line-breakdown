import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { apiService } from "../services/apiService";
import { Header } from "./Header";
import { TeamHeader } from "./TeamHeader";
import { PlayerCard } from "./PlayerCard";

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
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Season
      </label>
      <select
        value={tempSeason}
        onChange={(e) => setTempSeason(e.target.value)}
        className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white transition-all duration-300"
      >
        {seasons.reverse().map((s) => (
          <option key={s} value={s}>
            {getSeasonName(s)}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Team
      </label>
      <select
        value={tempTeam}
        onChange={(e) => setTempTeam(e.target.value)}
        disabled={loadingTeams}
        className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingTeams ? (
          <option>Loading...</option>
        ) : (
          teams.map((team) => (
            <option key={team} value={team}>
              {tempSeason <= 2013 && team === "ARI" ? "PHX" : team}
            </option>
          ))
        )}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Position
      </label>
      <select
        value={tempPosition}
        onChange={(e) => setTempPosition(e.target.value)}
        className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white transition-all duration-300"
      >
        <option value="F">Forwards</option>
        <option value="D">Defensemen</option>
      </select>
    </div>
  </div>
);

export const Teams = ({ enablePageLoadAnimations = true }) => {
  const defaultSeason = (new Date().getFullYear() - 1).toString();
  const [season, setSeason] = useState(defaultSeason);
  const [team, setTeam] = useState("");
  const [position, setPosition] = useState("F");
  const [tempSeason, setTempSeason] = useState(defaultSeason);
  const [tempTeam, setTempTeam] = useState("");
  const [tempPosition, setTempPosition] = useState("F");
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [initializingCache, setInitializingCache] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [initInProgress, setInitInProgress] = useState(false);
  const [showTeamsOverlay, setShowTeamsOverlay] = useState(false);
  const [teamRecord, setTeamRecord] = useState(null);
  const [teamClinchStatus, setTeamClinchStatus] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  const initInProgressRef = useRef(false);
  const hasInitializedFromURL = useRef(false);
  const teamHeaderRef = useRef(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const seasons = Array.from(
    { length: new Date().getFullYear() - 1 - 2007 },
    (_, i) => (2008 + i).toString()
  );

  useEffect(() => {
    checkHealth();
    initializeCacheInBackground();
  }, []);

  useEffect(() => {
    if (!hasInitializedFromURL.current && searchParams.get("team")) return;
    fetchTeams();
  }, [tempSeason, searchParams]);

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

    if (!urlSeason || !urlTeam || !urlPosition) return;

    setSeason(urlSeason);
    setTeam(urlTeam);
    setPosition(urlPosition);
    hasInitializedFromURL.current = true;
    performSearch(urlSeason, urlTeam, urlPosition);
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
      if (!cacheStatus.dataLoaded) {
        const initResponse = await apiService.initializeCache();

        if (initResponse.status === "loading") {
          await new Promise((resolve) => {
            const poll = async () => {
              const status = await apiService.checkCacheStatus();
              if (status.dataLoaded) {
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

      if (data.teams?.length) {
        if (tempTeam && data.teams.includes(tempTeam)) {
          setTempTeam(tempTeam);
        } else if (data.teams.includes(urlTeam)) {
          setTempTeam(urlTeam);
        } else {
          setTempTeam(data.teams[0]);
        }
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
  };

  const handlePlayerClick = (player) => {
    navigate(
      `/?player=${encodeURIComponent(
        player.name
      )}&season=${season}&position=${position}`
    );
  };

  return (
    <div className="min-h-screen ice-background text-white p-4 sm:p-6">
      {(initializingCache || showTeamsOverlay) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-lg font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <Header />
        <div
          className={`liquid-glass rounded-2xl p-6 mb-8 ${enablePageLoadAnimations ? "liquid-glass-animate" : ""}`}
        >
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
            className="mt-4 my-5 w-full min-h-[44px] bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Searching...
              </>
            ) : (
              "Search Roster"
            )}
          </button>
          {players.length > 0 && (
            <>
              <TeamHeader
                team={team}
                season={season}
                position={position}
                teamRecord={teamRecord}
                teamClinchStatus={teamClinchStatus}
              />
              <div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
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
                      onPlayerClick={handlePlayerClick}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
