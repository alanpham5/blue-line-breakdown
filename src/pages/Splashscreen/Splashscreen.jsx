import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Users, Shield, ArrowUpRight } from "lucide-react";
import { apiService } from "../../services/apiService";
import { playerUtils } from "../../utils/playerUtils";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LoadingScreen } from "../../components/LoadingScreen";
import { useTheme } from "../../providers/ThemeContext";
import "./Splashscreen.css";

export const Splashscreen = ({ enablePageLoadAnimations = true }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();

  // Redirect legacy links instantly if player param is present
  useEffect(() => {
    if (searchParams.has("player")) {
      navigate(`/players?${searchParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const [featuredData, setFeaturedData] = useState(null);
  const [errorState, setErrorState] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    document.title = "Blue Line Breakdown";
    initializeCacheInBackground();
  }, []);

  const initializeCacheInBackground = async () => {
    try {
      await apiService.healthCheck().catch(() => {});
      const cacheStatus = await apiService.checkCacheStatus();
      if (!cacheStatus.dataLoaded && !cacheStatus.cacheExists) {
        const initResponse = await apiService.initializeCache();
        if (initResponse.status === "loading") {
          let timeoutId;
          await new Promise((resolve) => {
            const checkStatus = async () => {
              const status = await apiService.checkCacheStatus();
              if (status.dataLoaded || status.cacheExists) {
                if (timeoutId) clearTimeout(timeoutId);
                resolve();
              } else {
                timeoutId = setTimeout(checkStatus, 30000);
              }
            };
            checkStatus();
          });
        }
      }
    } catch (err) {}
  };
  const [scrollEdges, setScrollEdges] = useState({
    atStart: true,
    atEnd: true,
  });

  const updateScrollEdges = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 8;
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8;
    setScrollEdges((prev) =>
      prev.atStart === atStart && prev.atEnd === atEnd
        ? prev
        : { atStart, atEnd }
    );
  };

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await apiService.fetchFeatured();
        if (
          data &&
          data.players &&
          data.players.length > 0 &&
          data.featuredTeam
        ) {
          setFeaturedData(data);
        }
      } catch (err) {
        setErrorState(true);
      }
    };
    loadFeatured();
  }, []);

  useEffect(() => {
    updateScrollEdges();
    window.addEventListener("resize", updateScrollEdges);
    return () => window.removeEventListener("resize", updateScrollEdges);
  }, [featuredData]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const team = featuredData?.featuredTeam;
  const teamStats = team?.stats || {};
  const offenseRating = teamStats.offense_rating ?? 0;
  const defenseRating = teamStats.defense_rating ?? 0;
  const aggressivenessRating = teamStats.aggressiveness_rating ?? 0;
  const goalsPg = teamStats.goals_pg ?? 0;
  const goalsAgainstPg = teamStats.goals_against_pg ?? 0;
  const possession = teamStats.possession ?? 0;
  const blockedShotsPg = teamStats.blocked_shots_pg ?? 0;
  const hasStats =
    offenseRating > 0 ||
    defenseRating > 0 ||
    aggressivenessRating > 0 ||
    goalsPg > 0 ||
    goalsAgainstPg > 0 ||
    possession > 0 ||
    blockedShotsPg > 0;
  const players = featuredData?.players || [];

  // Fade scroll edges only when there is hidden content in that direction
  const leftStop = scrollEdges.atStart
    ? "black 0"
    : "transparent 0, black 48px";
  const rightStop = scrollEdges.atEnd
    ? "black 100%"
    : "black calc(100% - 48px), transparent 100%";
  const playersMaskImage = `linear-gradient(to right, ${leftStop}, ${rightStop})`;

  const teamCardGradient = team
    ? playerUtils.getTeamCardGradient(team.team, team.season, actualTheme)
    : "";
  const teamWonCup = team
    ? playerUtils.didWinStanleyCup(team.team, team.season)
    : false;

  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      {!featuredData && !showSkeleton && (
        <LoadingScreen onZamboniCircleComplete={() => setShowSkeleton(true)} />
      )}

      {!featuredData && showSkeleton && (
        <div className="max-w-6xl mx-auto relative z-10">
          <Header />
          <div className="space-y-12 animate-pulse">
            {/* Players skeleton */}
            <section className="space-y-4">
              <div className="h-7 w-48 rounded-xl bg-white/10 light:bg-slate-200" />
              <div className="flex gap-4 overflow-hidden py-6 px-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[170px] sm:w-[190px] liquid-glass rounded-2xl p-4 flex flex-col items-center gap-3"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 light:bg-slate-200" />
                    <div className="h-4 w-24 rounded-lg bg-white/10 light:bg-slate-200" />
                    <div className="h-3 w-16 rounded-lg bg-white/10 light:bg-slate-200" />
                  </div>
                ))}
              </div>
            </section>

            {/* Team skeleton */}
            <section className="space-y-4">
              <div className="h-7 w-40 rounded-xl bg-white/10 light:bg-slate-200" />
              <div className="liquid-glass-strong rounded-[32px] p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4">
                  <div className="md:col-span-5 flex flex-col items-center gap-4">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/10 light:bg-slate-200" />
                    <div className="h-8 w-48 rounded-xl bg-white/10 light:bg-slate-200" />
                    <div className="h-4 w-24 rounded-lg bg-white/10 light:bg-slate-200" />
                  </div>
                  <div className="md:col-span-7 space-y-5">
                    <div className="liquid-glass rounded-2xl p-5 sm:p-6 space-y-5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between">
                            <div className="h-3 w-32 rounded bg-white/10 light:bg-slate-200" />
                            <div className="h-3 w-10 rounded bg-white/10 light:bg-slate-200" />
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/10 light:bg-slate-200" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="liquid-glass rounded-2xl p-3 flex flex-col items-center gap-2"
                        >
                          <div className="h-2 w-12 rounded bg-white/10 light:bg-slate-200" />
                          <div className="h-6 w-10 rounded bg-white/10 light:bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <Footer />
        </div>
      )}

      {featuredData && (
        <div className="max-w-6xl mx-auto relative z-10">
          <Header />

          <div className="space-y-12">
            {/* Featured Players Row */}
            <section
              className={`space-y-4 ${enablePageLoadAnimations ? "fade-in-up-delay-1" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white light:text-gray-900 flex items-center gap-2">
                    <Users className="h-6 w-6 text-[#7ee340] light:text-[#2e6e14]" />
                    Featured Players
                  </h2>
                </div>

                {/* Scroll Indicators / Arrows */}
                <div className="flex gap-2">
                  <button
                    onClick={handleScrollLeft}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 light:bg-slate-900/5 light:border-slate-900/10 light:text-slate-600 light:hover:bg-slate-900/10 transition"
                    aria-label="Scroll Left"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleScrollRight}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 light:bg-slate-900/5 light:border-slate-900/10 light:text-slate-600 light:hover:bg-slate-900/10 transition"
                    aria-label="Scroll Right"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Container wrapper with fade-out mask */}
              <div className="relative group">
                <div
                  ref={scrollContainerRef}
                  onScroll={updateScrollEdges}
                  className="flex gap-4 overflow-x-auto py-6 px-1 scroll-smooth snap-x snap-mandatory hide-scrollbar"
                  style={{
                    maskImage: playersMaskImage,
                    WebkitMaskImage: playersMaskImage,
                  }}
                >
                  {players.map((player) => {
                    const pColor = playerUtils.getTeamColor(
                      player.team,
                      player.season,
                      actualTheme
                    );

                    return (
                      <div
                        key={`${player.playerId}-${player.season}`}
                        onClick={() =>
                          navigate(
                            `/players?player=${encodeURIComponent(
                              player.name
                            )}&season=${player.season}&position=${player.position}`
                          )
                        }
                        className="snap-start flex-shrink-0 w-[170px] sm:w-[190px] liquid-glass rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] hover:scale-[1.02] select-none"
                        style={{
                          "--player-team-glow": `${pColor}1a`,
                          boxShadow: `0 8px 32px 0 rgba(0,0,0,0.18)`,
                        }}
                      >
                        {/* Player headshot */}
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 relative flex items-center justify-center"
                          style={{
                            background: pColor,
                            boxShadow: `0 0 0 4px ${pColor}1f, 0 6px 16px rgba(0,0,0,0.28)`,
                          }}
                        >
                          <img
                            src={playerUtils.getPlayerHeadshot(
                              player.playerId,
                              player.team,
                              player.season
                            )}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = playerUtils.getDefaultHeadshot();
                            }}
                          />
                        </div>

                        {/* Player Info */}
                        <h3 className="text-sm font-bold text-white light:text-gray-900 line-clamp-1 w-full">
                          {player.name}
                        </h3>
                        <div className="text-[10px] sm:text-xs font-semibold text-gray-400 light:text-slate-500">
                          {playerUtils.formatSeason(player.season)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Featured Team Hero Section */}
            {team && (
              <section
                className={`space-y-4 ${enablePageLoadAnimations ? "fade-in-up-delay-2" : ""}`}
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white light:text-gray-900 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-sky-400 light:text-sky-600" />
                    Featured Team
                  </h2>
                </div>

                <Link
                  to={`/teams?season=${team.season}&team=${team.team}`}
                  className="group team-card-surface-strong liquid-glass-strong block relative overflow-hidden rounded-[32px] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
                  style={{ "--team-card-gradient": teamCardGradient }}
                >
                  {/* Clickable indicator arrow */}
                  <ArrowUpRight className="absolute top-5 right-5 z-10 h-6 w-6 text-gray-300 transition-all duration-200 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 light:text-slate-500 light:group-hover:text-slate-900" />

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-6 md:pt-4">
                    {/* Left Column - Team info */}
                    <div
                      className={`${
                        hasStats ? "md:col-span-5" : "md:col-span-12"
                      } flex flex-col items-center text-center`}
                    >
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-4">
                        {teamWonCup && (
                          <img
                            src="/stanleycup.png"
                            alt="Stanley Cup"
                            className="absolute inset-0 w-full h-full object-contain z-0"
                          />
                        )}

                        <img
                          src={
                            team.logoUrl ||
                            playerUtils.getTeamLogoUrl(
                              team.team,
                              team.season,
                              actualTheme
                            )
                          }
                          alt={`${team.name} Logo`}
                          className={`relative z-10 w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] ${
                            teamWonCup
                              ? `scale-75 ${actualTheme === "dark" ? "team-logo-stroke-cup" : ""}`
                              : ""
                          }`}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>

                      <h3 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-white light:text-gray-900 mb-1">
                        {team.name}
                      </h3>

                      <p className="text-sm font-semibold text-gray-300 light:text-gray-500">
                        {playerUtils.formatSeason(team.season)}
                      </p>
                    </div>

                    {/* Right Column - Stats Details */}
                    {hasStats && (
                      <div className="md:col-span-7 space-y-5">
                        {/* Metric bars */}
                        <div className="liquid-glass rounded-2xl p-5 sm:p-6 space-y-4">
                          {/* Offense Rating */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                              <span className="font-semibold text-gray-300 light:text-gray-600">
                                Offense Percentile
                              </span>
                              <span className="font-extrabold text-sky-400 light:text-sky-600">
                                {offenseRating.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                                style={{ width: `${offenseRating}%` }}
                              />
                            </div>
                          </div>

                          {/* Defense Rating */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                              <span className="font-semibold text-gray-300 light:text-gray-600">
                                Defense Percentile
                              </span>
                              <span className="font-extrabold text-rose-400 light:text-rose-600">
                                {defenseRating.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-300 shadow-[0_0_10px_rgba(251,113,133,0.3)]"
                                style={{ width: `${defenseRating}%` }}
                              />
                            </div>
                          </div>

                          {/* Aggressiveness Rating */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                              <span className="font-semibold text-gray-300 light:text-gray-600">
                                Aggressiveness Percentile
                              </span>
                              <span className="font-extrabold text-amber-400 light:text-amber-600">
                                {aggressivenessRating.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                                style={{
                                  width: `${aggressivenessRating}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Summary Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="liquid-glass rounded-2xl p-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 light:text-slate-500 mb-1">
                              Goals PG
                            </div>
                            <div className="text-xl font-extrabold text-white light:text-gray-900">
                              {goalsPg.toFixed(2)}
                            </div>
                          </div>

                          <div className="liquid-glass rounded-2xl p-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 light:text-slate-500 mb-1">
                              Goals Against
                            </div>
                            <div className="text-xl font-extrabold text-white light:text-gray-900">
                              {goalsAgainstPg.toFixed(2)}
                            </div>
                          </div>

                          <div className="liquid-glass rounded-2xl p-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 light:text-slate-500 mb-1">
                              Possession
                            </div>
                            <div className="text-xl font-extrabold text-white light:text-gray-900">
                              {(possession * 100).toFixed(1)}%
                            </div>
                          </div>

                          <div className="liquid-glass rounded-2xl p-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 light:text-slate-500 mb-1">
                              Blocked Shots
                            </div>
                            <div className="text-xl font-extrabold text-white light:text-gray-900">
                              {blockedShotsPg.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </section>
            )}
          </div>

          <Footer />
        </div>
      )}
    </div>
  );
};
