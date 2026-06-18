import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Search, Users, Download, Share } from "lucide-react";
import { track } from "@vercel/analytics";
import { apiService } from "lib/api/apiService";
import { Header } from "components/layout/Header";
import { AppSelect } from "components/ui/AppSelect";
import { TeamProfileStatsGrid } from "components/teamProfile/TeamProfileStatsGrid";
import { SimilarTeamsSection } from "components/teamProfile/SimilarTeamsSection";
import { playerUtils } from "utils/playerUtils";
import { useIsExternal } from "hooks/useIsExternal";
import { useIsMobile } from "hooks/useIsMobile";
import { LoadingScreen } from "components/ui/LoadingScreen";
import { useTheme } from "providers/ThemeContext";
import { ShareableModal } from "components/ui/ShareableModal";
import { BookmarkButton } from "components/ui/BookmarkButton";
import { ENTITY_TYPES } from "lib/firebase/firestore";
import { Footer } from "components/layout/Footer";
import { TeamShareableDisplay } from "features/team-summary/components/TeamShareableDisplay";
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
export const TeamSummary = ({ enablePageLoadAnimations = true }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { actualTheme } = useTheme();
  const isExternal = useIsExternal();
  const isMobile = useIsMobile();
  const now = new Date();
  const initialTeam = searchParams.get("team") || "";
  const initialSeason =
    searchParams.get("year") || searchParams.get("season") || "";
  const [team, setTeam] = useState(initialTeam);
  const [season, setSeason] = useState(initialSeason);
  const [tempTeam, setTempTeam] = useState(initialTeam);
  const [tempSeason, setTempSeason] = useState(initialSeason);
  const [hasSearched, setHasSearched] = useState(
    !!(initialTeam && initialSeason)
  );
  const [teamsList, setTeamsList] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [teamSummaryData, setTeamSummaryData] = useState(null);
  const [teamRecord, setTeamRecord] = useState(null);
  const [teamClinchStatus, setTeamClinchStatus] = useState(null);
  const [error, setError] = useState("");
  const [initializingCache, setInitializingCache] = useState(false);
  const [initInProgress, setInitInProgress] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Searching...");
  const initInProgressRef = useRef(false);
  const teamHeaderRef = useRef(null);
  const [showShareableModal, setShowShareableModal] = useState(false);
  const seasonsList = Array.from(
    {
      length:
        (now.getMonth() >= 10 ? now.getFullYear() : now.getFullYear() - 1) -
        2007,
    },
    (_, i) => 2008 + i
  );
  useEffect(() => {
    if (teamSummaryData && team) {
      document.title = `${team} | Blue Line Breakdown`;
    } else {
      document.title = "Teams | Blue Line Breakdown";
    }
  }, [team, teamSummaryData]);
  useEffect(() => {
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
    checkHealth();
    initializeCacheInBackground();
  }, []);
  useEffect(() => {
    if (!tempSeason) {
      setTeamsList([]);
      return;
    }
    const fetchTeamsList = async () => {
      setLoadingTeams(true);
      try {
        const data = await apiService.fetchTeams(tempSeason);
        setTeamsList(data.teams || []);
        if (tempTeam && data.teams?.length && !data.teams.includes(tempTeam)) {
          setTempTeam("");
        }
      } catch {
        setTeamsList([]);
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeamsList();
  }, [tempSeason]);
  useEffect(() => {
    const urlTeam = searchParams.get("team");
    const urlYear = searchParams.get("year") || searchParams.get("season");
    if (urlTeam) {
      setTeam(urlTeam);
      setTempTeam(urlTeam);
    }
    if (urlYear) {
      setSeason(urlYear);
      setTempSeason(urlYear);
    }
    if (urlTeam && urlYear) {
      setHasSearched(true);
      fetchTeamSummaryData(urlTeam, urlYear);
    }
  }, [searchParams]);
  useEffect(() => {
    if (
      hasSearched &&
      teamSummaryData &&
      !loadingData &&
      teamHeaderRef.current
    ) {
      teamHeaderRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [hasSearched, teamSummaryData, loadingData]);
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
  const fetchTeamSummaryData = async (teamCode, seasonYear) => {
    await ensureCacheInitialized();
    setLoadingData(true);
    setError("");
    try {
      const data = await apiService.fetchTeamSummary(teamCode, seasonYear);
      setTeamSummaryData(data);
      const espnTeamCode =
        seasonYear < 2014 && teamCode === "ARI" ? "PHX" : teamCode;
      const teamStatus = await apiService.getNhlTeamStatus(
        espnTeamCode,
        seasonYear
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
    } catch (err) {
      setError(err.message || "Failed to load team summary");
      setTeamSummaryData(null);
      setTeamRecord(null);
      setTeamClinchStatus(null);
    } finally {
      setLoadingData(false);
    }
  };
  const handleSearchClick = () => {
    if (!tempTeam || !tempSeason) return;
    setTeam(tempTeam);
    setSeason(tempSeason);
    setHasSearched(true);
    setSearchParams(
      {
        team: tempTeam,
        year: tempSeason,
      },
      {
        replace: false,
      }
    );
    track("team_summary_search", {
      team: tempTeam,
      season: tempSeason,
    });
  };
  const handleSimilarTeamClick = (clickedTeam, clickedSeason) => {
    setTempTeam(clickedTeam);
    setTempSeason(clickedSeason.toString());
    setSearchParams(
      {
        team: clickedTeam,
        year: clickedSeason.toString(),
      },
      {
        replace: false,
      }
    );
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handlePlayerClick = (playerName, playerPosition) => {
    navigate(
      `/players?player=${encodeURIComponent(playerName)}&season=${season}&position=${playerPosition}`
    );
  };
  const getTeamLabel = (t) => (tempSeason <= 2013 && t === "ARI" ? "PHX" : t);
  const teamColor = playerUtils.getTeamColor(team, season, actualTheme);
  const teamCardGradient = playerUtils.getTeamCardGradient(
    team,
    season,
    actualTheme
  );
  const didWinStanleyCup = playerUtils.didWinStanleyCup(team, season);
  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      {isExternal && initInProgress ? (
        <LoadingScreen />
      ) : (
        <>
          {(initializingCache || loadingData) && (
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
                className={`liquid-glass-strong rounded-[32px] p-4 sm:p-6 lg:p-7 mb-8 ${enablePageLoadAnimations ? "liquid-glass-animate" : ""}`}
                style={{
                  overflow: "visible",
                }}
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-white light:text-gray-900">
                    Lookup Team
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
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
                  </div>
                  <div>
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
                          .sort((a, b) =>
                            getTeamLabel(a).localeCompare(getTeamLabel(b))
                          )
                          .map((t) => (
                            <option key={t} value={t}>
                              {getTeamLabel(t)}
                            </option>
                          ))
                      )}
                    </AppSelect>
                  </div>
                </div>

                <button
                  onClick={handleSearchClick}
                  disabled={loadingData || !tempSeason || !tempTeam}
                  className="btn-search-primary mb-1 mt-5"
                >
                  {loadingData ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                    </>
                  ) : (
                    <>
                      <Search size={20} /> Search Team
                    </>
                  )}
                </button>
              </div>
            </div>

            {!hasSearched && !loadingData && (
              <div className="relative z-0 liquid-glass rounded-[32px] mt-4 sm:mt-6 px-5 py-10 text-center">
                <p className="mb-3 text-2xl font-semibold tracking-[-0.03em] text-white light:text-slate-900 sm:text-3xl">
                  Select a team and season to get started
                </p>
                <p className="mx-auto max-w-2xl text-sm text-gray-400 light:text-gray-500 sm:text-base">
                  Analytics derived from MoneyPuck data (2008–
                  {new Date().getFullYear() - 1}), with proprietary calculations
                  and metrics.
                </p>
              </div>
            )}

            {error && (
              <div className="liquid-glass rounded-[32px] p-6 text-center text-rose-400 mb-8">
                {error}
              </div>
            )}

            {hasSearched && teamSummaryData && !loadingData && (
              <div className="relative z-0 space-y-6 sm:space-y-8">
                <div ref={teamHeaderRef} className="relative">
                  <div
                    className="team-card-surface liquid-glass rounded-[32px] overflow-hidden px-5 py-6 sm:px-6"
                    style={{
                      "--team-card-gradient": teamCardGradient,
                    }}
                  >
                    <div className="relative z-10 text-center font-bold">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 py-2">
                        <div className="relative mx-2 h-28 w-28 flex justify-center items-center md:mx-4 md:h-32 md:w-32">
                          {didWinStanleyCup && (
                            <img
                              src="/stanleycup.png"
                              alt="Stanley Cup"
                              className="absolute inset-0 w-full h-full object-contain z-0"
                              style={{
                                filter: "opacity(1)",
                              }}
                            />
                          )}
                          <img
                            src={playerUtils.getTeamLogoUrl(
                              team,
                              season,
                              actualTheme
                            )}
                            alt={team}
                            className={`relative h-28 object-contain team-logo-stroke z-10 md:h-32 ${didWinStanleyCup ? "scale-75" : ""}`}
                          />
                        </div>

                        <div className="text-center md:text-left text-2xl font-bold text-white light:text-gray-900">
                          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.04em] flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <span>
                              {playerUtils.getFullTeamName(team, season)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowShareableModal(true)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:text-white light:border-slate-300 light:bg-white/80 light:text-slate-600 light:hover:text-slate-900"
                              aria-label={
                                isMobile
                                  ? "Share image"
                                  : "Download shareable image"
                              }
                            >
                              {isMobile ? (
                                <Share className="h-4 w-4" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                            <BookmarkButton
                              entityType={ENTITY_TYPES.TEAM}
                              entityId={`${team}_${season}`}
                              size="sm"
                              meta={{
                                label: playerUtils.getFullTeamName(
                                  team,
                                  season
                                ),
                                team,
                                season,
                              }}
                            />
                          </h2>
                          <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm sm:text-base font-semibold text-gray-300 light:text-gray-600">
                            <span>
                              {getSeasonName(season)}
                              <span className="hidden sm:inline"> Season</span>
                            </span>
                            {teamRecord && (
                              <>
                                <span>•</span>
                                <span className="text-sky-300 light:text-sky-600">
                                  {teamRecord}
                                </span>
                              </>
                            )}
                            {teamClinchStatus && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-300 light:text-emerald-600 whitespace-nowrap">
                                  {teamClinchStatus}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <TeamProfileStatsGrid stats={teamSummaryData.stats} />

                <div className="liquid-glass-strong rounded-[32px] p-4 sm:p-6 lg:p-7">
                  <div className="flex items-center gap-2 border-b border-white/10 light:border-slate-200 pb-4 mb-5">
                    <Users className="h-6 w-6 shrink-0 text-amber-300 light:text-amber-600" />
                    <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.04em] text-white light:text-gray-900">
                      Top Impact Players
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    <div>
                      <h4 className="text-md font-bold uppercase tracking-[0.1em] text-cyan-300 light:text-cyan-600 mb-4">
                        Forwards
                      </h4>
                      <div className="space-y-3">
                        {teamSummaryData.topForwards?.map((fw) => (
                          <div
                            key={fw.playerId}
                            onClick={() => handlePlayerClick(fw.name, "F")}
                            className="flex flex-col p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] light:bg-gray-100/50 light:hover:bg-gray-100 border border-white/5 light:border-slate-200/50 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={playerUtils.getPlayerHeadshot(
                                    fw.playerId,
                                    team,
                                    season
                                  )}
                                  alt={fw.name}
                                  className="w-10 h-10 rounded-full object-cover bg-zinc-900"
                                  onError={(e) => {
                                    e.target.src =
                                      playerUtils.getDefaultHeadshot();
                                  }}
                                />
                                <span className="font-semibold text-sm sm:text-base text-white light:text-gray-900">
                                  {fw.name}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-cyan-300 light:text-cyan-700">
                                {fw.warPercentile.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-white/[0.06] light:bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-sky-400 h-1.5 rounded-full transition-all duration-300 gauge-fill"
                                style={{
                                  width: `${fw.warPercentile}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-bold uppercase tracking-[0.1em] text-rose-400 light:text-rose-600 mb-4">
                        Defensemen
                      </h4>
                      <div className="space-y-3">
                        {teamSummaryData.topDefensemen?.map((df) => (
                          <div
                            key={df.playerId}
                            onClick={() => handlePlayerClick(df.name, "D")}
                            className="flex flex-col p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] light:bg-gray-100/50 light:hover:bg-gray-100 border border-white/5 light:border-slate-200/50 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={playerUtils.getPlayerHeadshot(
                                    df.playerId,
                                    team,
                                    season
                                  )}
                                  alt={df.name}
                                  className="w-10 h-10 rounded-full object-cover bg-zinc-900"
                                  onError={(e) => {
                                    e.target.src =
                                      playerUtils.getDefaultHeadshot();
                                  }}
                                />
                                <span className="font-semibold text-sm sm:text-base text-white light:text-gray-900">
                                  {df.name}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-rose-400 light:text-rose-700">
                                {df.warPercentile.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-white/[0.06] light:bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-rose-500 to-red-400 h-1.5 rounded-full transition-all duration-300 gauge-fill"
                                style={{
                                  width: `${df.warPercentile}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-bold uppercase tracking-[0.1em] text-amber-300 light:text-amber-600 mb-4">
                        Goalies
                      </h4>
                      <div className="space-y-3">
                        {teamSummaryData.topGoalies?.slice(0, 2).map((gl) => (
                          <div
                            key={gl.playerId}
                            onClick={() => handlePlayerClick(gl.name, "G")}
                            className="flex flex-col p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] light:bg-gray-100/50 light:hover:bg-gray-100 border border-white/5 light:border-slate-200/50 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={playerUtils.getPlayerHeadshot(
                                    gl.playerId,
                                    team,
                                    season
                                  )}
                                  alt={gl.name}
                                  className="w-10 h-10 rounded-full object-cover bg-zinc-900"
                                  onError={(e) => {
                                    e.target.src =
                                      playerUtils.getDefaultHeadshot();
                                  }}
                                />
                                <span className="font-semibold text-sm sm:text-base text-white light:text-gray-900">
                                  {gl.name}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-amber-300 light:text-amber-700">
                                {gl.warPercentile.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-white/[0.06] light:bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-orange-400 h-1.5 rounded-full transition-all duration-300 gauge-fill"
                                style={{
                                  width: `${gl.warPercentile}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {teamSummaryData.similarTeams && (
                  <SimilarTeamsSection
                    similarTeams={teamSummaryData.similarTeams}
                    onTeamClick={handleSimilarTeamClick}
                  />
                )}
              </div>
            )}
            <Footer />
          </div>
        </>
      )}

      <ShareableModal
        isOpen={showShareableModal}
        onClose={() => setShowShareableModal(false)}
        fileName={
          team
            ? `${playerUtils.getFullTeamName(team, season).replace(/\s+/g, "-")}-${season}`
            : "team-shareable"
        }
      >
        <TeamShareableDisplay
          team={team}
          season={season}
          teamSummaryData={teamSummaryData}
          teamRecord={teamRecord}
          teamClinchStatus={teamClinchStatus}
        />
      </ShareableModal>
    </div>
  );
};
export default TeamSummary;
