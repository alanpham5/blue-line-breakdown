import { useEffect, useState } from "react";
import { ArrowLeft, Download, Search, Share } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { AppSelect } from "components/ui/AppSelect";
import {
  TeamPerformancePanel,
  TeamQualityCard,
  TeamSpecialTeamsPanel,
} from "components/teamProfile/TeamProfileSections";
import { TeamPlaystylePanel } from "components/teamProfile/TeamPlaystylePanel";
import { SimilarTeamsSection } from "components/teamProfile/SimilarTeamsSection";
import { TeamImpactPlayersSection } from "components/teamProfile/TeamImpactPlayersSection";
import { ShareableModal } from "components/ui/ShareableModal";
import { TeamProfileShareablePreview } from "features/team-summary/components/TeamProfileShareablePreview";
import { useIsMobile } from "hooks/useIsMobile";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";

const exampleProfile = {
  team: {
    id: "SJS",
    name: "San Jose Sharks",
    season: 2025,
    record: "40-34-8",
  },
  identity: [
    {
      id: "attack",
      label: "Attack",
      phase: "withPuck",
      leftLabel: "Cycle",
      rightLabel: "Rush",
      leftTag: "Cycle-first",
      rightTag: "Rush-first",
      score: 62,
      rawMetrics: [
        { label: "Attempts off the rush", value: 0.123, leagueAverage: 0.12 },
        {
          label: "Attempts after 15s+ in zone",
          value: 0.655,
          leagueAverage: 0.652,
        },
      ],
    },
    {
      id: "shotLocation",
      label: "Shot Location",
      phase: "withPuck",
      leftLabel: "Perimeter",
      rightLabel: "Inside",
      leftTag: "Perimeter shooters",
      rightTag: "Inside attack",
      score: 81,
      rawMetrics: [
        { label: "Slot shot share", value: 0.538, leagueAverage: 0.521 },
        { label: "Net-front shot share", value: 0.331, leagueAverage: 0.313 },
        { label: "Point shot share", value: 0.309, leagueAverage: 0.309 },
        { label: "D share of attempts", value: 0.327, leagueAverage: 0.348 },
      ],
    },
    {
      id: "dActivation",
      label: "D Pinch",
      phase: "withPuck",
      leftLabel: "Stay High",
      rightLabel: "Activate",
      leftTag: "Ds stay high",
      rightTag: "Ds activate low",
      score: 19,
      rawMetrics: [
        {
          label: "D shots below the circles",
          value: 0.303,
          leagueAverage: 0.341,
        },
      ],
    },
    {
      id: "breakout",
      label: "Breakout",
      phase: "withPuck",
      leftLabel: "Make Plays",
      rightLabel: "Clear It",
      leftTag: "Plays out of the zone",
      rightTag: "Clears the zone",
      score: 100,
      rawMetrics: [
        { label: "Icings per exit", value: 0.167, leagueAverage: 0.133 },
      ],
    },
    {
      id: "forecheck",
      label: "Forecheck",
      phase: "withoutPuck",
      leftLabel: "Carry In",
      rightLabel: "Dump & Chase",
      leftTag: "Carries the puck in",
      rightTag: "Dumps and chases",
      score: 69,
      rawMetrics: [
        {
          label: "Puck wins in the O-zone",
          value: 0.444,
          leagueAverage: 0.459,
        },
        { label: "D pinches per entry", value: 0.018, leagueAverage: 0.015 },
      ],
    },
    {
      id: "dZoneCoverage",
      label: "D-Zone Coverage",
      phase: "withoutPuck",
      leftLabel: "Collapse",
      rightLabel: "Pressure",
      leftTag: "Collapses and blocks",
      rightTag: "Pressures the points",
      score: 69,
      rawMetrics: [
        {
          label: "Point shots allowed share",
          value: 0.303,
          leagueAverage: 0.309,
        },
        {
          label: "Attempts against blocked",
          value: 0.277,
          leagueAverage: 0.278,
        },
      ],
    },
    {
      id: "chancesAllowed",
      label: "Chances Allowed",
      phase: "withoutPuck",
      leftLabel: "Cycle",
      rightLabel: "Rush",
      leftTag: "Gives up the cycle",
      rightTag: "Gives up the rush",
      score: 97,
      goalsScore: 84,
      rawMetrics: [
        {
          label: "Chances allowed off the cycle",
          value: 0.634,
          leagueAverage: 0.651,
        },
      ],
    },
    {
      id: "physicality",
      label: "Physicality",
      phase: "withoutPuck",
      leftLabel: "Finesse",
      rightLabel: "Physical",
      leftTag: "Finesse",
      rightTag: "Physical",
      score: 97,
      rawMetrics: [
        { label: "Share of hits", value: 0.555, leagueAverage: 0.499 },
      ],
    },
  ],
  quality: [
    {
      id: "overall",
      label: "Overall",
      percentile: 69,
      rawValue: 52.8,
      rank: 10,
      teamCount: 32,
      components: [
        { label: "Expected-goal share", percentile: 71, rawValue: 52.8 },
        {
          label: "Expected-goal differential / 60",
          percentile: 67,
          rawValue: 0.24,
        },
        { label: "Corsi share", percentile: 73, rawValue: 53.1 },
        { label: "Goal differential / 60", percentile: 55, rawValue: 0.12 },
      ],
    },
    {
      id: "offense",
      label: "Offense",
      percentile: 76,
      rawValue: 3.17,
      rank: 8,
      teamCount: 32,
      components: [
        { label: "Goals For", percentile: 75, rawValue: 3.12 },
        { label: "Scoring Chances", percentile: 77, rawValue: 3.17 },
        { label: "Shots", percentile: 73, rawValue: 32.1 },
        { label: "Average Shot Quality", percentile: 74, rawValue: 0.062 },
        { label: "Rebounds Generated", percentile: 70, rawValue: 4.82 },
      ],
    },
    {
      id: "defense",
      label: "Defense",
      percentile: 58,
      rawValue: 2.72,
      rank: 14,
      teamCount: 32,
      components: [
        { label: "Goals Against", percentile: 48, rawValue: 2.94 },
        { label: "Scoring Chances Against", percentile: 61, rawValue: 2.72 },
        { label: "Shots Against", percentile: 66, rawValue: 29.0 },
        { label: "Opponent Shot Quality", percentile: 59, rawValue: 0.054 },
        { label: "Rebounds Allowed", percentile: 55, rawValue: 4.48 },
      ],
    },
    {
      id: "specialTeams",
      label: "Special Teams",
      percentile: 67,
      rank: 11,
      teamCount: 32,
      components: [
        { label: "Power play", percentile: 63, rawValue: 7.84 },
        { label: "Penalty kill", percentile: 71, rawValue: 6.21 },
      ],
    },
  ],
  metadata: {
    situations: {
      identity: "5-on-5",
      overall: "5-on-5",
      offense: "5-on-5",
      defense: "5-on-5",
      powerPlay: "5-on-4",
      penaltyKill: "4-on-5",
    },
    warnings: [
      "Possession is an offensive-zone persistence proxy, not a direct measurement of cycling tactics.",
      "Risk is inferred from event frequency and does not directly identify breakout or neutral-zone structure.",
    ],
  },
};

const exampleSpecialUnits = {
  offense: {
    label: "Power Play",
    situation: "5-on-4 performance",
    percentile: 63,
    rank: 12,
    teamCount: 32,
    components: [
      { label: "Goals For", percentile: 50, rawValue: 6.8 },
      { label: "Shots", percentile: 72, rawValue: 55.4 },
      { label: "Average Shot Quality", percentile: 67, rawValue: 0.123 },
    ],
  },
  defense: {
    label: "Penalty Kill",
    situation: "4-on-5 performance",
    percentile: 71,
    rank: 9,
    teamCount: 32,
    components: [
      { label: "Goals Against", percentile: 66, rawValue: 5.92 },
      { label: "Shots Against", percentile: 74, rawValue: 44.8 },
      { label: "Opponent Shot Quality", percentile: 70, rawValue: 0.132 },
    ],
  },
};

const exampleSimilarTeams = [
  { team: "BUF", season: 2022, similarity: 91 },
  { team: "OTT", season: 2023, similarity: 89 },
  { team: "NJD", season: 2021, similarity: 87 },
  { team: "SEA", season: 2022, similarity: 85 },
  { team: "MTL", season: 2024, similarity: 83 },
];

const exampleImpactPlayers = {
  forwards: [
    {
      playerId: 8484801,
      name: "Macklin Celebrini",
      position: "Center",
      impact: 99,
    },
    {
      playerId: 8482667,
      name: "William Eklund",
      position: "Left Wing",
      impact: 88,
    },
    {
      playerId: 8475726,
      name: "Tyler Toffoli",
      position: "Right Wing",
      impact: 82,
    },
  ],
  defensemen: [
    {
      playerId: 8479983,
      name: "Mario Ferraro",
      position: "Defense",
      impact: 78,
    },
    {
      playerId: 8480043,
      name: "Timothy Liljegren",
      position: "Defense",
      impact: 74,
    },
    { playerId: 8478013, name: "Jake Walman", position: "Defense", impact: 72 },
  ],
  goalies: [
    {
      playerId: 8482137,
      name: "Yaroslav Askarov",
      position: "Goalie",
      impact: 84,
    },
    {
      playerId: 8477968,
      name: "Alex Nedeljkovic",
      position: "Goalie",
      impact: 69,
    },
  ],
};

export const TeamProfilePreview = () => {
  const { actualTheme } = useTheme();
  const isMobile = useIsMobile();
  const [showShareableModal, setShowShareableModal] = useState(false);
  const { team, identity, quality } = exampleProfile;
  const offenseQuality = quality.find((item) => item.id === "offense");
  const defenseQuality = quality.find((item) => item.id === "defense");
  const specialTeamsQuality = quality.find(
    (item) => item.id === "specialTeams"
  );
  const teamQualityValue = Math.round(
    (offenseQuality.percentile + defenseQuality.percentile) / 2
  );
  const teamQualityRank = Math.max(
    1,
    Math.round(
      ((100 - teamQualityValue) / 100) * (offenseQuality.teamCount - 1) + 1
    )
  );
  const teamQuality = {
    value: teamQualityValue,
    rank: teamQualityRank,
    teamCount: offenseQuality.teamCount,
  };
  const didWinStanleyCup = playerUtils.didWinStanleyCup(team.id, team.season);
  const teamLogoUrl = playerUtils.getTeamLogoUrl(
    team.id,
    team.season,
    actualTheme
  );
  const teamCardGradient = playerUtils.getTeamCardGradient(
    team.id,
    team.season,
    actualTheme
  );

  useEffect(() => {
    document.title = "Team Profile Preview | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);

  return (
    <div className="ice-background min-h-screen px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="relative z-10 mx-auto max-w-7xl">
        <Header />

        <main className="space-y-7 sm:space-y-9">
          <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit items-center rounded-full border border-orange-300/15 bg-orange-300/[0.07] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-orange-200 light:border-orange-300/50 light:bg-orange-100 light:text-orange-700">
              Team profile concept · sample data
            </div>
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition hover:text-sky-200 light:text-sky-700 light:hover:text-sky-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Team search
            </Link>
          </div>

          <div className="liquid-glass-strong relative z-40 grid grid-cols-1 gap-3 overflow-visible rounded-[32px] p-4 sm:grid-cols-[2fr_1fr] sm:items-center sm:gap-4 sm:p-5">
            <label className="app-field flex items-center gap-3 px-4 py-3.5">
              <Search className="h-5 w-5 shrink-0 text-gray-500" />
              <span className="sr-only">Team</span>
              <input
                value={team.name}
                readOnly
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none light:text-gray-900"
              />
            </label>
            <label className="block w-full">
              <span className="sr-only">Season</span>
              <AppSelect
                value={String(team.season)}
                onChange={() => {}}
                className="app-field w-full px-4 py-3.5 pr-10 text-base normal-case tracking-normal text-white light:text-gray-900"
              >
                <option value="2025">2025-2026</option>
                <option value="2024">2024-2025</option>
              </AppSelect>
            </label>
          </div>

          <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,2.6fr)_minmax(350px,1fr)]">
            <section
              className="team-card-surface liquid-glass overflow-hidden rounded-[32px] px-5 py-6 sm:px-6"
              style={{ "--team-card-gradient": teamCardGradient }}
              aria-label="Team overview"
            >
              <div className="relative z-10 text-center font-bold">
                <div className="flex flex-col items-center justify-center gap-0 py-2 md:flex-row md:gap-6">
                  <div className="relative mx-2 flex h-36 w-36 items-center justify-center md:mx-4 md:h-40 md:w-40">
                    {didWinStanleyCup && (
                      <img
                        src="/stanleycup.png"
                        alt="Stanley Cup"
                        className="absolute inset-0 z-0 h-full w-full object-contain"
                      />
                    )}
                    <img
                      src={teamLogoUrl}
                      alt={`${team.name} logo`}
                      className="team-logo-stroke relative z-10 h-28 object-contain md:h-32"
                      style={{
                        transform: playerUtils.getTeamLogoTransform(
                          teamLogoUrl,
                          didWinStanleyCup
                        ),
                      }}
                    />
                  </div>
                  <div className="-mt-[11px] text-center text-2xl font-bold text-white light:text-gray-900 md:mt-0 md:text-left">
                    <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:flex-wrap md:justify-start">
                      <h1 className="w-full text-center text-[2.125rem] font-extrabold tracking-display md:w-auto md:text-left sm:text-4xl">
                        {playerUtils.getFullTeamName(team.id, team.season)}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setShowShareableModal(true)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:text-white light:border-slate-300 light:bg-white/80 light:text-slate-600 light:hover:text-slate-900"
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
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-gray-300 light:text-gray-600 md:justify-start sm:text-base">
                      <span>2025-2026 Season</span>
                      <span>•</span>
                      <span className="text-sky-300 light:text-sky-600">
                        {team.record}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <TeamQualityCard {...teamQuality} />
          </div>

          <TeamPlaystylePanel identity={identity} />

          <div className="grid items-stretch gap-5 xl:grid-cols-3">
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
              units={[exampleSpecialUnits.offense, exampleSpecialUnits.defense]}
            />
          </div>

          <TeamImpactPlayersSection
            groups={exampleImpactPlayers}
            team={team.id}
            season={team.season}
          />

          <SimilarTeamsSection
            similarTeams={exampleSimilarTeams}
            onTeamClick={() => {}}
          />
        </main>

        <Footer />
      </div>

      <ShareableModal
        isOpen={showShareableModal}
        onClose={() => setShowShareableModal(false)}
        fileName="san-jose-sharks-2025-team-profile"
      >
        <TeamProfileShareablePreview
          team={team}
          identity={identity}
          offenseQuality={offenseQuality}
          defenseQuality={defenseQuality}
          specialTeamsQuality={specialTeamsQuality}
          specialUnits={[
            exampleSpecialUnits.offense,
            exampleSpecialUnits.defense,
          ]}
          teamQuality={teamQuality}
          impactPlayers={exampleImpactPlayers}
        />
      </ShareableModal>
    </div>
  );
};
