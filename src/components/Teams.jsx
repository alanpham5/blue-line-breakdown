import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { apiService } from "../services/apiService";
import { Header } from "./Header";
import { playerUtils } from "../utils/playerUtils";

const PlayerCard = ({ player, team, season, onPlayerClick }) => {
  const maxWinShare = 100;
  const gaugeWidth = (player.winShare / maxWinShare) * 100;
  const { getPlayerHeadshot } = playerUtils;

  return (
    <div
      className="liquid-glass rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
      onClick={() => onPlayerClick(player)}
    >
      <div className="flex items-center gap-4 mb-3">
        <img
          src={getPlayerHeadshot(player.playerId, team, season)}
          alt={player.name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.target.src = "/mobile-icon.png";
          }}
        />
        <h3 className="font-bold text-white">{player.name}</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Win Share</span>
          <span className="text-cyan-400 font-bold">
            {player.winShare.toFixed(1)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${gaugeWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const Teams = () => {
  const defaultSeason = (new Date().getFullYear() - 1).toString();

  const [season, setSeason] = useState(defaultSeason);
  const [team, setTeam] = useState("");
  const [position, setPosition] = useState("F");

  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [initializingCache, setInitializingCache] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [initInProgress, setInitInProgress] = useState(false);

  const initInProgressRef = useRef(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getTeamLogoUrl } = playerUtils;

  const seasons = Array.from(
    { length: new Date().getFullYear() - 1 - 2007 },
    (_, i) => (2008 + i).toString()
  );

  const getSeasonName = (s) => `${s}-${(parseInt(s) + 1).toString().slice(-2)}`;

  useEffect(() => {
    checkHealth();
    initializeCacheInBackground();
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [season]);

  useEffect(() => {
    const urlSeason = searchParams.get("season");
    const urlTeam = searchParams.get("team");
    const urlPosition = searchParams.get("position");

    if (!urlSeason || !urlTeam || !urlPosition) return;

    setSeason(urlSeason);
    setTeam(urlTeam);
    setPosition(urlPosition);

    performSearch(urlSeason, urlTeam, urlPosition);
  }, [searchParams]);

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
    try {
      const data = await apiService.fetchTeams(season);
      setTeams(data.teams || []);

      const urlTeam = searchParams.get("team");
      if (urlTeam && data.teams?.includes(urlTeam)) {
        setTeam(urlTeam);
      } else if (!team && data.teams?.length) {
        setTeam(data.teams[0]);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
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
      setPlayers(data.players || []);
    } catch (err) {
      console.error("Error fetching rosters:", err);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    if (!season || !team || !position) return;

    setSearchParams({ season, team, position }, { replace: false });
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
      {initializingCache && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-lg font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <Header />

        <div className="liquid-glass rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {" "}
                Season{" "}
              </label>{" "}
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white transition-all duration-300"
              >
                {" "}
                {seasons.map((s) => (
                  <option key={s} value={s}>
                    {" "}
                    {getSeasonName(s)}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {" "}
                Team{" "}
              </label>{" "}
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                disabled={loadingTeams}
                className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {" "}
                {loadingTeams ? (
                  <option>Loading...</option>
                ) : (
                  teams.map((team) => (
                    <option key={team} value={team}>
                      {" "}
                      {team}{" "}
                    </option>
                  ))
                )}{" "}
              </select>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {" "}
                Position{" "}
              </label>{" "}
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 liquid-glass-strong rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none text-white transition-all duration-300"
              >
                {" "}
                <option value="F">Forwards</option>{" "}
                <option value="D">Defensemen</option>{" "}
              </select>{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={handleSearchClick}
            disabled={loading}
            className="mt-4 my-5 w-full min-h-[44px] bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            {loading ? (
              <>
                {" "}
                <Loader2 className="w-4 h-4 animate-spin" /> Searching...{" "}
              </>
            ) : (
              "Search Roster"
            )}{" "}
          </button>
          {players.length > 0 && (
            <>
              <h2 className="text-center text-2xl font-bold mt-8 mb-6">
                <img
                  src={getTeamLogoUrl(team, season)}
                  alt={team}
                  className="w-28 mx-auto mb-2"
                />
                {position === "F" ? "Forwards" : "Defensemen"} •{" "}
                {getSeasonName(season)}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((p) => (
                  <PlayerCard
                    key={p.playerId}
                    player={p}
                    team={team}
                    season={season}
                    onPlayerClick={handlePlayerClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
