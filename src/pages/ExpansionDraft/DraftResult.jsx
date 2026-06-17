import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Download,
  Share,
  Loader2,
  Check,
  ShieldAlert,
  ListOrdered,
} from "lucide-react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { ShareableModal } from "../../components/ShareableModal";
import { TeamProfileStatsGrid } from "../../components/teamProfile/TeamProfileStatsGrid";
import { SimilarTeamsSection } from "../TeamSummary/SimilarTeamsSection";
import { playerUtils } from "../../utils/playerUtils";
import { apiService } from "../../services/apiService";
import { useTheme } from "../../providers/ThemeContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useAuth } from "../../providers/AuthContext";
import { checkTeamNameProfanity } from "../../utils/profanity";
import {
  deletePostedDraft,
  postDraft,
  saveCompletedDraft,
  updateUserDraft,
} from "../../firebase/firestore";
import { seasonSpan, DRAFT_STORAGE_KEY } from "./draftShared";
import { DraftShareDisplay } from "./DraftShareDisplay";
import { SaveDraftButton } from "./SaveDraftButton";

const normalizePicks = (picks) => {
  if (Array.isArray(picks)) return picks;
  if (!picks || typeof picks !== "object") return null;
  const mapped = Object.entries(picks).map(([team, player]) => ({
    ...(player || {}),
    team,
  }));
  return mapped.length ? mapped : null;
};

// Result page for a completed expansion draft.
//
// Two rendering modes:
//   • Leaderboard entry  – `leaderboardId` is set; profile comes from
//     Firestore and is used as-is (metrics were saved at post time).
//   • Non-leaderboard    – no `leaderboardId`; picks are loaded from the
//     draft state and passed to /draft/reanalyze so metrics are always
//     computed dynamically (never stale Firestore values).
export const DraftResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const isMobile = useIsMobile();
  const { user, openAuth } = useAuth();

  const [draft, setDraft] = useState(location.state?.draft || null);
  const viewOnly = Boolean(location.state?.viewOnly);
  const [showShare, setShowShare] = useState(false);
  const [postState, setPostState] = useState("idle"); // idle|posting|done|error
  const [postError, setPostError] = useState("");
  const [leaderboardId, setLeaderboardId] = useState(
    location.state?.draft?.leaderboardId || location.state?.leaderboardId || null
  );
  // Account-save state. `savedId` is set once the franchise is in the account.
  const [savedId, setSavedId] = useState(
    location.state?.draft?.savedDraftId || null
  );
  const [saveState, setSaveState] = useState("idle"); // idle|saving|error
  const [saveError, setSaveError] = useState("");

  // Profile is separate from draft state so we can populate it asynchronously
  // (via /draft/reanalyze) for non-leaderboard franchises.
  const [profile, setProfile] = useState(location.state?.draft?.profile || null);

  // Adopt a draft passed via navigation (e.g. reopening a saved franchise from
  // the account menu or navigating between result pages) even when already
  // mounted on this route.
  useEffect(() => {
    if (location.state?.draft) {
      const incoming = location.state.draft;
      setDraft(incoming);
      setProfile(incoming.profile || null);
      setSavedId(incoming.savedDraftId || null);
      setLeaderboardId(
        incoming.leaderboardId ||
          location.state.leaderboardId ||
          null
      );
      setPostState("idle");
      setSaveState("idle");
      setSaveError("");
    }
  }, [location.key]);

  // Fallback: restore draft from sessionStorage on hard-refresh.
  useEffect(() => {
    if (draft) return;
    const stored = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDraft(parsed);
        setProfile(parsed.profile || null);
      } catch {
        navigate("/expansion-draft");
      }
    } else {
      navigate("/expansion-draft");
    }
  }, [draft, navigate]);

  // Dynamic metric calculation for non-leaderboard franchises.
  //
  // • Leaderboard entries already carry a profile from Firestore → skip.
  // • Session-fresh drafts (just completed) carry a profile in nav state → skip.
  // • Saved franchises (from account) arrive without a profile but with a
  //   picks array → call /draft/reanalyze to compute metrics fresh every time.
  useEffect(() => {
    if (!draft) return;
    if (leaderboardId) return;   // leaderboard: use Firestore profile as-is
    if (profile) return;          // already have a profile (session-fresh draft)

    // picks source: new saves store d.picks; old saves stored d.profile.roster
    const picks = normalizePicks(draft.picks) || normalizePicks(draft.profile?.roster);
    if (!Array.isArray(picks) || picks.length === 0) {
      // No picks to analyze — cannot show result page.
      navigate("/expansion-draft");
      return;
    }

    let cancelled = false;
    apiService
      .reanalyzeDraft({
        season: draft.season,
        teamName: draft.teamName,
        picks,
      })
      .then((freshProfile) => {
        if (!cancelled) setProfile(freshProfile);
      })
      .catch(() => {
        if (!cancelled) navigate("/expansion-draft");
      });
    return () => { cancelled = true; };
  }, [draft, leaderboardId, profile, navigate]);

  const canEditCommunityEntry =
    Boolean(user && leaderboardId && (savedId || draft?.ownerId === user.uid));

  // Loading guard — wait until both the draft and its (possibly async) profile
  // are ready before rendering.
  if (!draft || !profile) {
    return (
      <div className="ice-background flex min-h-screen items-center justify-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const { counts } = profile.draftSummary;
  const record = profile.predictedRecord;

  const handlePost = async () => {
    if (!user) {
      openAuth("signin");
      return;
    }
    if (leaderboardId) return;
    if (!user.emailVerified) {
      setPostState("error");
      setPostError(
        "Please verify your email before posting to the community leaderboard."
      );
      return;
    }
    setPostState("posting");
    setPostError("");
    try {
      // Merge in the current profile so postDraft stores full metrics to
      // Firestore (required for the leaderboard entry to display correctly).
      const id = await postDraft(user, { ...draft, profile });
      setLeaderboardId(id);
      if (savedId) {
        try {
          await updateUserDraft(user.uid, savedId, { leaderboardId: id });
        } catch {
          // best-effort; UI still reflects the posted state for this session
        }
      }
      setPostState("done");
    } catch (err) {
      setPostState("error");
      setPostError(err.message || "Couldn't post your draft.");
    }
  };

  const handleRemoveFromBoard = async () => {
    if (!user) {
      openAuth("signin");
      return;
    }
    if (!leaderboardId) return;
    setPostState("posting");
    setPostError("");
    try {
      await deletePostedDraft(leaderboardId);
      setLeaderboardId(null);
      if (savedId) {
        try {
          await updateUserDraft(user.uid, savedId, { leaderboardId: null });
        } catch {
          // best-effort
        }
      }
      setPostState("idle");
    } catch (err) {
      setPostState("error");
      setPostError(err?.message || "Couldn't remove your draft.");
    }
  };

  const handleSave = async () => {
    if (!user) {
      openAuth("signin");
      return;
    }
    if (viewOnly) return;
    setSaveState("saving");
    setSaveError("");
    const nameResult = await checkTeamNameProfanity(draft?.teamName);
    if (!nameResult.ok) {
      setSaveState("error");
      setSaveError(nameResult.error || "Couldn't verify franchise name.");
      return;
    }
    if (nameResult.profane) {
      setSaveState("error");
      setSaveError("Please choose a different franchise name.");
      return;
    }
    try {
      // Merge profile into draft so saveCompletedDraft can extract the roster
      // as picks (profile.roster is the picks source for re-analysis).
      const id = await saveCompletedDraft(user.uid, { ...draft, profile }, savedId);
      setSavedId(id);
      setSaveState("idle");
    } catch (err) {
      console.error("saveCompletedDraft failed:", err);
      setSaveState("error");
      setSaveError(
        err?.code === "permission-denied"
          ? "Permission denied — deploy Firestore rules (see SETUP.md)."
          : err?.message || "Couldn't save. Please try again."
      );
    }
  };

  const handleSimilarTeamClick = (team, season) => {
    navigate(`/teams?team=${team}&year=${season}`);
  };

  return (
    <div className="ice-background min-h-screen px-4 pb-16 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header />

        {/* Franchise hero — identity on the left, share + leaderboard posting
            on the right; stacks on mobile. */}
        <div className="liquid-glass-strong overflow-hidden rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-amber-300">
                <Trophy className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  Expansion Franchise · {seasonSpan(draft.season)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-[-0.04em] text-white light:text-gray-900 sm:text-4xl">
                  {draft.teamName}
                </h1>
                <button
                  type="button"
                  onClick={() => setShowShare(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:text-white light:border-slate-300 light:bg-white/80 light:text-slate-600"
                  aria-label={isMobile ? "Share image" : "Download image"}
                >
                  {isMobile ? (
                    <Share className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Predicted record + position mix */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-baseline gap-2 rounded-2xl bg-white/5 px-4 py-2 light:bg-slate-900/5">
                  <span className="text-2xl font-extrabold tabular-nums text-sky-300 light:text-sky-600">
                    {record.display}
                  </span>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gray-400 light:text-gray-500">
                    Predicted
                  </span>
                </div>
                {record.playoffProbability != null && (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm font-bold text-emerald-300 light:text-emerald-700">
                    {Math.round(record.playoffProbability * 100)}% playoff odds
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-gray-300 light:text-gray-600">
                <Pill>{counts.forwards} F</Pill>
                <Pill>{counts.defensemen} D</Pill>
                <Pill>{counts.goalies} G</Pill>
                {profile.draftSummary.ageTrajectory.avg != null && (
                  <Pill>
                    avg age {profile.draftSummary.ageTrajectory.avg.toFixed(1)}
                  </Pill>
                )}
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 lg:w-72">
              {!viewOnly && (
                <SaveDraftButton
                  mode="complete"
                  user={user}
                  saved={!!savedId}
                  saveState={saveState}
                  saveError={saveError}
                  onSave={handleSave}
                />
              )}
              {(!viewOnly || canEditCommunityEntry) && (
                <LeaderboardPost
                  season={draft.season}
                  user={user}
                  postState={postState}
                  postError={postError}
                  hasPosted={Boolean(leaderboardId)}
                  onPost={handlePost}
                  onRemove={handleRemoveFromBoard}
                  onSignIn={() => openAuth("signin")}
                />
              )}
            </div>
          </div>
        </div>

        {/* Team profile stats */}
        <div className="mt-6">
          <TeamProfileStatsGrid stats={profile.stats} />
        </div>

        {/* Similar teams */}
        {profile.similarTeams?.length > 0 && (
          <div className="mt-6">
            <SimilarTeamsSection
              similarTeams={profile.similarTeams}
              onTeamClick={handleSimilarTeamClick}
            />
          </div>
        )}

        {/* Roster, ordered by source franchise */}
        <h2 className="mt-8 text-lg font-bold tracking-tight text-white light:text-gray-900">
          The Roster
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {profile.roster.map((p) => (
            <RosterCard
              key={`${p.team}-${p.playerId}`}
              player={p}
              season={draft.season}
              actualTheme={actualTheme}
            />
          ))}
        </div>

        {/* Run again */}
        <div className="mt-6 text-center">
          <Link
            to="/expansion-draft"
            className="text-sm font-semibold text-gray-400 hover:text-white light:text-gray-500 light:hover:text-slate-900"
          >
            ← Run another draft
          </Link>
        </div>
      </div>

      <ShareableModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        fileName={`${draft.teamName.replace(/\s+/g, "-")}-expansion-draft`}
      >
        <DraftShareDisplay draft={draft} profile={profile} actualTheme={actualTheme} />
      </ShareableModal>

      <Footer />
    </div>
  );
};

const Pill = ({ children }) => (
  <span className="rounded-full bg-white/10 px-3 py-1 light:bg-slate-900/10">
    {children}
  </span>
);

// Community-leaderboard posting, relocated into the result-page header. Renders
// the appropriate control for the auth/verification/post state.
const LeaderboardPost = ({
  season,
  user,
  postState,
  postError,
  hasPosted,
  onPost,
  onRemove,
  onSignIn,
}) => (
  <div className="w-full rounded-[24px] border border-white/10 bg-white/5 p-4 light:border-slate-200 light:bg-white/60">
    <div className="flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-white light:text-gray-900">
        <ListOrdered className="h-4 w-4 text-sky-300" /> Leaderboard
      </h3>
      <Link
        to={`/expansion-draft/leaderboard?season=${season}`}
        className="text-xs font-semibold text-sky-300 hover:text-sky-200 light:text-sky-600"
      >
        View →
      </Link>
    </div>

    {!user ? (
      <p className="mt-3 text-sm text-gray-300 light:text-slate-700">
        <button
          type="button"
          onClick={onSignIn}
          className="font-semibold text-sky-300 hover:text-sky-200 light:text-sky-600"
        >
          Sign in
        </button>{" "}
        to post your franchise.
      </p>
    ) : !user.emailVerified ? (
      <p className="mt-3 flex items-start gap-2 text-sm text-amber-300 light:text-amber-700">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        Verify your email to unlock posting.
      </p>
    ) : hasPosted ? (
      <button
        type="button"
        onClick={onRemove}
        disabled={postState === "posting"}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500/15 px-4 py-2.5 text-sm font-bold text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-50 light:text-rose-600"
      >
        {postState === "posting" && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        Remove from board
      </button>
    ) : postState === "done" ? (
      <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-300 light:text-emerald-700">
        <Check className="h-4 w-4 shrink-0" /> Posted to the leaderboard!
      </p>
    ) : (
      <button
        type="button"
        onClick={onPost}
        disabled={postState === "posting"}
        className="btn-search-primary mt-3 inline-flex w-full items-center justify-center gap-2"
      >
        {postState === "posting" && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        Post franchise
      </button>
    )}
    {postState === "error" && (
      <p className="mt-2 text-xs text-rose-400">{postError}</p>
    )}
  </div>
);

// Color the WAR-percentile bar by position, matching the Top Impact Players UI.
const POSITION_BAR = {
  F: {
    fill: "from-cyan-500 to-sky-400",
    text: "text-cyan-300 light:text-cyan-700",
  },
  D: {
    fill: "from-rose-500 to-red-400",
    text: "text-rose-400 light:text-rose-700",
  },
  G: {
    fill: "from-amber-500 to-orange-400",
    text: "text-amber-300 light:text-amber-700",
  },
};

const RosterCard = ({ player, season, actualTheme }) => {
  const theme = POSITION_BAR[player.position] || POSITION_BAR.F;
  const percentile = player.warPercentile;
  const hasPercentile = percentile != null;
  return (
    <div className="flex flex-col gap-2.5 rounded-[20px] border border-white/10 bg-white/5 p-3 light:border-slate-200 light:bg-white/60">
      <div className="flex items-center gap-2.5">
        <img
          src={playerUtils.getPlayerHeadshot(
            player.playerId,
            player.team,
            season
          )}
          alt={player.name}
          className="h-10 w-10 shrink-0 rounded-full object-cover bg-[var(--team-color)]"
          style={{
            "--team-color": playerUtils.getTeamColor(player.team, season),
          }}
          onError={(e) => (e.target.src = playerUtils.getDefaultHeadshot())}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white light:text-gray-900">
            {player.position} - {player.name}
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-400 light:text-gray-500">
            <img
              src={playerUtils.getTeamLogoUrl(player.team, season, actualTheme)}
              alt=""
              className="h-3.5 w-3.5 object-contain"
              onError={(e) => (e.target.style.display = "none")}
            />
            {player.teamName || player.team}
          </p>
        </div>
      </div>

      {/* League WAR percentile */}
      <div>
        <div className="mb-1 flex items-center justify-between text-[0.7rem]">
          <span className="font-medium uppercase tracking-[0.1em] text-gray-400 light:text-gray-500">
            WAR Pctile
          </span>
          <span className={`font-bold ${theme.text}`}>
            {hasPercentile ? `${percentile.toFixed(1)}%` : "—"}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08] light:bg-gray-200">
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r ${theme.fill} transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(0, percentile || 0))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
