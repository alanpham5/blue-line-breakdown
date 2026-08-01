import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, Loader2, Search, Share } from "lucide-react";
import { track } from "@vercel/analytics";
import { apiService } from "lib/api/apiService";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { GeneralSearch } from "components/search/GeneralSearch";
import { LookupHeader } from "components/search/LookupHeader";
import { AppSelect } from "components/ui/AppSelect";
import { SimilarTeamsSection } from "components/teamProfile/SimilarTeamsSection";
import {
  TeamIdentityPanel,
  TeamPerformancePanel,
  TeamQualityCard,
  TeamSpecialTeamsPanel,
} from "components/teamProfile/TeamProfileSections";
import { TeamImpactPlayersSection } from "components/teamProfile/TeamImpactPlayersSection";
import { ShareableModal } from "components/ui/ShareableModal";
import { BookmarkButton } from "components/ui/BookmarkButton";
import { ENTITY_TYPES } from "lib/firebase/firestore";
import { TeamProfileShareablePreview } from "features/team-summary/components/TeamProfileShareablePreview";
import { playerUtils } from "utils/playerUtils";
import { useIsMobile } from "hooks/useIsMobile";
import { useTheme } from "providers/ThemeContext";

const getSeasonName = (season) =>
  `${season}-${(Number(season) + 1).toString().slice(-2)}`;

const getClinchStatus = (clincher) => {
  const statuses = {
    x: "Clinched Playoffs",
    y: "Clinched Division",
    z: "Clinched Conference",
    "*": "President's Trophy",
  };
  return statuses[clincher] || null;
};

const emptyQuality = (id, label) => ({
  id,
  label,
  percentile: 50,
  rank: 1,
  teamCount: 32,
  components: [],
});

const normalizePlayers = (players = []) =>
  players.map((player) => ({
    ...player,
    impact: Number(
      player.impactRating ??
        player.impactPercentile ??
        player.warPercentile ??
        0
    ),
  }));

export const TeamSummary = ({ enablePageLoadAnimations = true }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { actualTheme } = useTheme();
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
    Boolean(initialTeam && initialSeason)
  );
  const [teamsList, setTeamsList] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [teamSummaryData, setTeamSummaryData] = useState(null);
  const [teamRecord, setTeamRecord] = useState(null);
  const [teamClinchStatus, setTeamClinchStatus] = useState(null);
  const [error, setError] = useState("");
  const [showShareableModal, setShowShareableModal] = useState(false);
  const seasonsList = Array.from(
    {
      length:
        (now.getMonth() >= 10 ? now.getFullYear() : now.getFullYear() - 1) -
        2007,
    },
    (_, index) => 2008 + index
  );

  useEffect(() => {
    document.title = teamSummaryData
      ? `${playerUtils.getFullTeamName(team, season)} | Blue Line Breakdown`
      : "Teams | Blue Line Breakdown";
  }, [season, team, teamSummaryData]);

  useEffect(() => {
    if (!tempSeason) {
      setTeamsList([]);
      return;
    }
    const fetchTeams = async () => {
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
    fetchTeams();
  }, [tempSeason]);

  const fetchTeamSummaryData = async (teamCode, seasonYear) => {
    setLoadingData(true);
    setError("");
    try {
      const data = await apiService.fetchTeamSummary(teamCode, seasonYear);
      setTeamSummaryData(data);
      try {
        const nhlTeamCode =
          Number(seasonYear) < 2014 && teamCode === "ARI" ? "PHX" : teamCode;
        const status = await apiService.getNhlTeamStatus(
          nhlTeamCode,
          seasonYear
        );
        if (status.record) {
          setTeamRecord(
            `${status.record.wins}-${status.record.losses}-${status.record.otl}`
          );
          setTeamClinchStatus(getClinchStatus(status.clincher));
        } else {
          setTeamRecord(null);
          setTeamClinchStatus(null);
        }
      } catch {
        setTeamRecord(null);
        setTeamClinchStatus(null);
      }
    } catch (requestError) {
      setError(requestError.message || "Failed to load team summary");
      setTeamSummaryData(null);
      setTeamRecord(null);
      setTeamClinchStatus(null);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const urlTeam = searchParams.get("team");
    const urlSeason = searchParams.get("year") || searchParams.get("season");
    if (urlTeam) {
      setTeam(urlTeam);
      setTempTeam(urlTeam);
    }
    if (urlSeason) {
      setSeason(urlSeason);
      setTempSeason(urlSeason);
    }
    if (urlTeam && urlSeason) {
      setHasSearched(true);
      fetchTeamSummaryData(urlTeam, urlSeason);
    }
  }, [searchParams]);

  const handleSearchClick = () => {
    if (!tempTeam || !tempSeason) return;
    setTeam(tempTeam);
    setSeason(tempSeason);
    setHasSearched(true);
    setSearchParams({ team: tempTeam, season: tempSeason });
    track("team_summary_search", {
      team: tempTeam,
      season: tempSeason,
    });
  };

  const handleProfileSeasonChange = (nextSeason) => {
    if (!team || !nextSeason) return;
    setTempSeason(nextSeason);
    setSearchParams({ team, season: nextSeason });
  };

  const handleSimilarTeamClick = (nextTeam, nextSeason) => {
    setTempTeam(nextTeam);
    setTempSeason(String(nextSeason));
    setSearchParams({ team: nextTeam, season: String(nextSeason) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlayerClick = (player) => {
    if (player?.playerId) {
      navigate(`/players/v2/${player.playerId}?season=${season}`);
    }
  };

  const getTeamLabel = (teamCode) =>
    Number(tempSeason) <= 2013 && teamCode === "ARI" ? "PHX" : teamCode;
  const teamCardGradient = playerUtils.getTeamCardGradient(
    team,
    season,
    actualTheme
  );
  const didWinStanleyCup = playerUtils.didWinStanleyCup(team, season);
  const displayedTeamStatus = didWinStanleyCup
    ? "Stanley Cup Winners"
    : teamClinchStatus;
  const identity = teamSummaryData?.identity || [];
  const qualities = teamSummaryData?.quality || [];
  const offenseQuality =
    qualities.find((quality) => quality.id === "offense") ||
    emptyQuality("offense", "Offense");
  const defenseQuality =
    qualities.find((quality) => quality.id === "defense") ||
    emptyQuality("defense", "Defense");
  const specialTeamsQuality =
    qualities.find((quality) => quality.id === "specialTeams") ||
    emptyQuality("specialTeams", "Special Teams");
  const specialUnits = teamSummaryData?.specialTeams || [];
  const teamQuality = teamSummaryData?.teamQuality || {
    value: (offenseQuality.percentile + defenseQuality.percentile) / 2,
    rank: 1,
    teamCount: offenseQuality.teamCount || 32,
  };
  const impactPlayers = {
    forwards: normalizePlayers(teamSummaryData?.topForwards),
    defensemen: normalizePlayers(teamSummaryData?.topDefensemen),
    goalies: normalizePlayers(teamSummaryData?.topGoalies),
  };
  const shareTeam = {
    id: team,
    name: playerUtils.getFullTeamName(team, season),
    season: Number(season),
    record: teamRecord || "Season in progress",
    status: displayedTeamStatus,
  };

  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      {loadingData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/72 backdrop-blur-sm light:bg-black/30">
          <div className="liquid-glass-strong rounded-[30px] p-8 text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-sky-300 light:text-sky-600" />
            <p className="text-lg font-medium text-white light:text-gray-900">
              Loading team profile…
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <Header />

        <div className="relative z-50 mt-8">
          {hasSearched && teamSummaryData ? (
            <div className="liquid-glass-strong grid grid-cols-1 gap-3 overflow-visible rounded-[32px] p-4 sm:grid-cols-[2fr_1fr] sm:items-center sm:gap-4 sm:p-5">
              <GeneralSearch
                bare
                compact
                scope="teams"
                initialQuery={playerUtils.getFullTeamName(team, season)}
                targetSeason={season}
                className="w-full"
              />
              <label className="block w-full">
                <span className="sr-only">Season</span>
                <AppSelect
                  placeholder="Season"
                  value={String(season)}
                  onChange={(event) =>
                    handleProfileSeasonChange(event.target.value)
                  }
                  className="app-field w-full px-4 py-3.5 pr-10 text-base normal-case tracking-normal text-white light:text-gray-900"
                >
                  {(
                    teamSummaryData.availableSeasons ||
                    [...seasonsList].reverse()
                  ).map((availableSeason) => (
                    <option key={availableSeason} value={availableSeason}>
                      {getSeasonName(availableSeason)}
                    </option>
                  ))}
                </AppSelect>
              </label>
            </div>
          ) : (
            <div
              className={`liquid-glass-strong rounded-[32px] p-5 sm:p-7 ${enablePageLoadAnimations ? "liquid-glass-animate" : ""}`}
              style={{ overflow: "visible" }}
            >
              <LookupHeader title="Lookup Team" />
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <AppSelect
                  placeholder="Season"
                  value={tempSeason}
                  onChange={(event) => setTempSeason(event.target.value)}
                  className="app-field px-4 py-3.5 pr-10 text-base text-white light:text-gray-900"
                >
                  {[...seasonsList].reverse().map((availableSeason) => (
                    <option key={availableSeason} value={availableSeason}>
                      {getSeasonName(availableSeason)}
                    </option>
                  ))}
                </AppSelect>
                <AppSelect
                  placeholder="Team"
                  value={tempTeam}
                  onChange={(event) => setTempTeam(event.target.value)}
                  disabled={loadingTeams || !tempSeason}
                  className="app-field px-4 py-3.5 pr-10 text-base text-white light:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingTeams ? (
                    <option>Loading...</option>
                  ) : (
                    [...teamsList]
                      .sort((first, second) =>
                        getTeamLabel(first).localeCompare(getTeamLabel(second))
                      )
                      .map((teamCode) => (
                        <option key={teamCode} value={teamCode}>
                          {getTeamLabel(teamCode)}
                        </option>
                      ))
                  )}
                </AppSelect>
              </div>
              <button
                type="button"
                onClick={handleSearchClick}
                disabled={loadingData || !tempSeason || !tempTeam}
                className="btn-search-primary mb-1 mt-5"
              >
                {loadingData ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} /> Search Team
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {!hasSearched && !loadingData && (
          <div className="liquid-glass relative z-0 mt-6 rounded-[32px] px-5 py-10 text-center">
            <p className="mb-3 text-2xl font-semibold tracking-display text-white light:text-slate-900 sm:text-3xl">
              Select a team and season to get started
            </p>
            <p className="mx-auto max-w-2xl text-sm text-gray-400 light:text-gray-500 sm:text-base">
              Explore team identity, quality, special teams, impact players, and
              statistical comparables.
            </p>
          </div>
        )}

        {error && (
          <div className="liquid-glass mt-8 rounded-[32px] p-6 text-center text-rose-400">
            {error}
          </div>
        )}

        {hasSearched && teamSummaryData && !loadingData && (
          <main className="relative z-0 mt-8 space-y-6 sm:space-y-8">
            <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,2.55fr)_minmax(365px,1fr)]">
              <section
                className="team-card-surface liquid-glass min-h-[190px] overflow-hidden rounded-[32px] px-5 py-5 sm:px-7"
                style={{ "--team-card-gradient": teamCardGradient }}
              >
                <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 text-center sm:flex-row sm:text-left">
                  <div className="relative flex h-36 w-36 shrink-0 items-center justify-center sm:h-40 sm:w-40">
                    {didWinStanleyCup && (
                      <img
                        src="/stanleycup.png"
                        alt="Stanley Cup"
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    )}
                    <img
                      src={playerUtils.getTeamLogoUrl(
                        team,
                        season,
                        actualTheme
                      )}
                      alt={`${playerUtils.getFullTeamName(team, season)} logo`}
                      className={`relative z-10 max-h-full max-w-full object-contain team-logo-stroke ${didWinStanleyCup ? "scale-75" : ""}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <h1 className="text-3xl font-extrabold tracking-display text-white light:text-gray-900 sm:text-4xl">
                        {playerUtils.getFullTeamName(team, season)}
                      </h1>
                      <div className="flex shrink-0 flex-nowrap items-center gap-2">
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
                            label: playerUtils.getFullTeamName(team, season),
                            team,
                            season,
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-gray-300 light:text-gray-600 sm:justify-start sm:text-base">
                      <span>{getSeasonName(season)} Season</span>
                      {teamRecord && (
                        <>
                          <span>•</span>
                          <span className="text-sky-300 light:text-sky-600">
                            {teamRecord}
                          </span>
                        </>
                      )}
                      {displayedTeamStatus && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-300 light:text-emerald-600">
                            {displayedTeamStatus}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>
              <TeamQualityCard {...teamQuality} />
            </div>

            {identity.length > 0 && <TeamIdentityPanel identity={identity} />}

            <div className="grid items-stretch gap-5 lg:grid-cols-3">
              <TeamPerformancePanel
                type="offense"
                title="Offense"
                quality={offenseQuality}
              />
              <TeamPerformancePanel
                type="defense"
                title="Defense"
                quality={defenseQuality}
              />
              <TeamSpecialTeamsPanel
                quality={specialTeamsQuality}
                units={specialUnits}
              />
            </div>

            <TeamImpactPlayersSection
              groups={impactPlayers}
              team={team}
              season={season}
              onPlayerClick={handlePlayerClick}
              onRosterClick={() =>
                navigate(
                  `/teams/roster?team=${encodeURIComponent(team)}&year=${season}`
                )
              }
            />

            <SimilarTeamsSection
              similarTeams={teamSummaryData.similarTeams}
              onTeamClick={handleSimilarTeamClick}
            />
          </main>
        )}

        <Footer />
      </div>

      <ShareableModal
        isOpen={showShareableModal}
        onClose={() => setShowShareableModal(false)}
        fileName={
          team
            ? `${playerUtils
                .getFullTeamName(team, season)
                .replace(/\s+/g, "-")}-${season}`
            : "team-shareable"
        }
      >
        {teamSummaryData && (
          <TeamProfileShareablePreview
            team={shareTeam}
            identity={identity}
            offenseQuality={offenseQuality}
            defenseQuality={defenseQuality}
            specialTeamsQuality={specialTeamsQuality}
            specialUnits={specialUnits}
            teamQuality={teamQuality}
          />
        )}
      </ShareableModal>
    </div>
  );
};

export default TeamSummary;
