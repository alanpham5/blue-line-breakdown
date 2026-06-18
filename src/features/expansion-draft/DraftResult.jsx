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
  Heart,
} from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { ShareableModal } from "components/ui/ShareableModal";
import { TeamProfileStatsGrid } from "components/teamProfile/TeamProfileStatsGrid";
import { SimilarTeamsSection } from "components/teamProfile/SimilarTeamsSection";
import { playerUtils } from "utils/playerUtils";
import { apiService } from "lib/api/apiService";
import { useTheme } from "providers/ThemeContext";
import { useIsMobile } from "hooks/useIsMobile";
import { useAuth } from "providers/AuthContext";
import { checkTeamNameProfanity } from "utils/profanity";
import {
  postDraftToLeaderboard,
  removeDraftFromLeaderboard,
  saveCompletedDraft,
  toggleLike,
} from "lib/firebase/firestore";
import {
  seasonSpan,
  DRAFT_STORAGE_KEY,
} from "features/expansion-draft/utils/draftShared";
import { DraftShareDisplay } from "features/expansion-draft/components/DraftShareDisplay";
import { SaveDraftButton } from "features/expansion-draft/components/SaveDraftButton";
import { ConfirmDialog } from "components/ui/ConfirmDialog";
const normalizePicks = (picks) => {
  if (Array.isArray(picks)) return picks;
  if (!picks || typeof picks !== "object") return null;
  const mapped = Object.entries(picks).map(([team, player]) => ({
    ...(player || {}),
    team,
  }));
  return mapped.length ? mapped : null;
};
export const DraftResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const isMobile = useIsMobile();
  const { user, openAuth } = useAuth();
  const [draft, setDraft] = useState(location.state?.draft || null);
  const viewOnly = Boolean(location.state?.viewOnly);
  const [showShare, setShowShare] = useState(false);
  const [postState, setPostState] = useState("idle");
  const [postError, setPostError] = useState("");
  const [posted, setPosted] = useState(
    Boolean(location.state?.draft?.postedToLeaderboard)
  );
  const [savedId, setSavedId] = useState(
    location.state?.draft?.savedDraftId || null
  );
  const [saveState, setSaveState] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [boardConfirm, setBoardConfirm] = useState(null);
  const [likes, setLikes] = useState(location.state?.draft?.likes || 0);
  const [likedBy, setLikedBy] = useState(location.state?.draft?.likedBy || []);
  const [profile, setProfile] = useState(
    location.state?.draft?.profile || null
  );
  useEffect(() => {
    if (location.state?.draft) {
      const incoming = location.state.draft;
      setDraft(incoming);
      setProfile(incoming.profile || null);
      setSavedId(incoming.savedDraftId || null);
      setPosted(Boolean(incoming.postedToLeaderboard));
      setLikes(incoming.likes || 0);
      setLikedBy(incoming.likedBy || []);
      setPostState("idle");
      setSaveState("idle");
      setSaveError("");
    }
  }, [location.key]);
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
  useEffect(() => {
    if (!draft) return;
    if (viewOnly) return;
    if (profile) return;
    const picks =
      normalizePicks(draft.picks) || normalizePicks(draft.profile?.roster);
    if (!Array.isArray(picks) || picks.length === 0) {
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
    return () => {
      cancelled = true;
    };
  }, [draft, viewOnly, profile, navigate]);
  const isOwnEntry = Boolean(user && draft?.ownerId === user.uid);
  const canEditCommunityEntry = Boolean(
    user && posted && isOwnEntry
  );
  const showLike = Boolean(savedId && (posted || viewOnly));
  const liked = Boolean(user && likedBy.includes(user.uid));
  if (!draft || !profile) {
    return (
      <div className="ice-background flex min-h-screen items-center justify-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  const { counts } = profile.draftSummary;
  const record = profile.predictedRecord;
  const persistDraft = async () => {
    if (savedId) return savedId;
    setSaveState("saving");
    setSaveError("");
    const nameResult = await checkTeamNameProfanity(draft?.teamName);
    if (!nameResult.ok) {
      setSaveState("error");
      setSaveError(nameResult.error || "Couldn't verify franchise name.");
      return null;
    }
    if (nameResult.profane) {
      setSaveState("error");
      setSaveError("Please choose a different franchise name.");
      return null;
    }
    try {
      const id = await saveCompletedDraft(
        user.uid,
        {
          ...draft,
          profile,
        },
        savedId
      );
      setSavedId(id);
      setSaveState("idle");
      return id;
    } catch (err) {
      console.error("saveCompletedDraft failed:", err);
      setSaveState("error");
      setSaveError(
        err?.code === "permission-denied"
          ? "Permission denied — deploy Firestore rules (see SETUP.md)."
          : err?.message || "Couldn't save. Please try again."
      );
      return null;
    }
  };
  const handleSave = async () => {
    if (!user) {
      openAuth("signin");
      return;
    }
    if (viewOnly) return;
    await persistDraft();
  };
  const handlePost = async () => {
    if (!user) {
      openAuth("signin");
      return;
    }
    if (posted) return;
    if (!user.emailVerified) {
      setPostState("error");
      setPostError(
        "Please verify your email before posting to the community board."
      );
      return;
    }
    setPostState("posting");
    setPostError("");
    try {
      const draftId = await persistDraft();
      if (!draftId) {
        setPostState("idle");
        return;
      }
      await postDraftToLeaderboard(user, {
        ...draft,
        profile,
        savedDraftId: draftId,
      });
      setPosted(true);
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
    if (!posted || !savedId) return;
    setPostState("posting");
    setPostError("");
    try {
      await removeDraftFromLeaderboard(user.uid, savedId);
      setPosted(false);
      setPostState("idle");
    } catch (err) {
      setPostState("error");
      setPostError(err?.message || "Couldn't remove your draft.");
    }
  };
  const handleLike = async () => {
    if (!savedId) return;
    if (!user) {
      openAuth("signin");
      return;
    }
    const wasLiked = liked;
    setLikedBy((prev) =>
      wasLiked ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]
    );
    setLikes((prev) => (wasLiked ? Math.max(0, prev - 1) : prev + 1));
    try {
      await toggleLike(savedId, user.uid, wasLiked);
    } catch {
      setLikedBy(draft?.likedBy || []);
      setLikes(draft?.likes || 0);
    }
  };
  const handleSimilarTeamClick = (team, season) => {
    navigate(`/teams?team=${team}&year=${season}`);
  };
  const handlePlayerClick = (player) => {
    if (!player?.name) return;
    const pos = (player.position || "").toUpperCase();
    const normalizedPosition = pos === "D" ? "D" : pos === "G" ? "G" : "F";
    navigate(
      `/players?player=${encodeURIComponent(player.name)}&season=${draft.season}&position=${normalizedPosition}`
    );
  };
  return (
    <div className="ice-background min-h-screen px-4 pb-16 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header />

        <div className="liquid-glass-strong overflow-hidden rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col items-center text-center">
              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                <h1 className="text-3xl font-bold tracking-display text-white light:text-gray-900 sm:text-4xl flex flex-wrap items-baseline justify-center">
                  {draft.teamName}
                  {!isOwnEntry && draft.ownerName && (
                    <span className="ml-3 text-lg font-medium text-gray-400 light:text-gray-500">
                      by {draft.ownerName}
                    </span>
                  )}
                </h1>
                <div className="flex items-center justify-center gap-3">
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
                  {showLike && (
                    <button
                      type="button"
                      onClick={handleLike}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${liked ? "bg-rose-500/15 text-rose-400" : "bg-white/10 text-gray-300 hover:bg-white/20 light:bg-slate-900/10 light:text-slate-600"}`}
                      aria-pressed={liked}
                      aria-label={liked ? "Unlike franchise" : "Like franchise"}
                    >
                      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                      {likes}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                <div className="flex items-baseline gap-2 rounded-2xl bg-white/5 px-4 py-2 light:bg-slate-900/5">
                  <span className="text-2xl font-extrabold tabular-nums text-sky-300 light:text-sky-600">
                    {record.display}
                  </span>
                  <span className="text-[0.7rem] font-semibold text-gray-400 light:text-gray-500">
                    Predicted
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {record.playoffProbability != null && (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm font-bold text-emerald-300 light:text-emerald-700">
                      {Math.round(record.playoffProbability * 100)}% playoff odds
                    </span>
                  )}
                  {record.outlook?.label && (
                    <OutlookPill outlook={record.outlook} />
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm font-semibold text-gray-300 light:text-gray-600">
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

            {(!viewOnly || canEditCommunityEntry) && (
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
                <LeaderboardPost
                  season={draft.season}
                  user={user}
                  postState={postState}
                  postError={postError}
                  hasPosted={posted}
                  onPost={() => setBoardConfirm("add")}
                  onRemove={() => setBoardConfirm("remove")}
                  onSignIn={() => openAuth("signin")}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <TeamProfileStatsGrid stats={profile.stats} />
        </div>

        {profile.similarTeams?.length > 0 && (
          <div className="mt-6">
            <SimilarTeamsSection
              similarTeams={profile.similarTeams}
              onTeamClick={handleSimilarTeamClick}
            />
          </div>
        )}

        <h2 className="mt-8 text-lg font-bold tracking-display text-white light:text-gray-900">
          The Roster
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {profile.roster.map((p) => (
            <RosterCard
              key={`${p.team}-${p.playerId}`}
              player={p}
              season={draft.season}
              actualTheme={actualTheme}
              onSelect={() => handlePlayerClick(p)}
            />
          ))}
        </div>

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
        <DraftShareDisplay draft={draft} profile={profile} />
      </ShareableModal>

      <ConfirmDialog
        open={Boolean(boardConfirm)}
        title={
          boardConfirm === "remove"
            ? "Remove from community board?"
            : "Post to the community board?"
        }
        message={
          boardConfirm === "remove"
            ? "This removes your franchise from the public Community Board."
            : "This shares your franchise on the public Community Board, where anyone can view and like it."
        }
        confirmLabel={boardConfirm === "remove" ? "Remove" : "Post franchise"}
        destructive={boardConfirm === "remove"}
        onCancel={() => setBoardConfirm(null)}
        onConfirm={() => {
          const action = boardConfirm;
          setBoardConfirm(null);
          if (action === "remove") {
            handleRemoveFromBoard();
          } else {
            handlePost();
          }
        }}
      />

      <Footer />
    </div>
  );
};
const Pill = ({ children }) => (
  <span className="rounded-full bg-white/10 px-3 py-1 light:bg-slate-900/10">
    {children}
  </span>
);
const OUTLOOK_STYLES = {
  rising: "bg-sky-500/15 text-sky-300 light:text-sky-700",
  veteran: "bg-amber-500/15 text-amber-300 light:text-amber-700",
  balanced:
    "bg-white/10 text-gray-300 light:bg-slate-900/10 light:text-slate-600",
};
const OutlookPill = ({ outlook }) => (
  <span
    className={`rounded-full px-3 py-1.5 text-sm font-bold ${OUTLOOK_STYLES[outlook.tag] || OUTLOOK_STYLES.balanced}`}
  >
    {outlook.label}
  </span>
);
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
        <ListOrdered className="h-4 w-4 text-sky-300" /> Community Board
      </h3>
      <Link
        to={`/expansion-draft/leaderboard`}
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
        Verify your email to unlock posting. Check your spam folder if you haven't received the email.
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
        <Check className="h-4 w-4 shrink-0" /> Posted to the community board!
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
const RosterCard = ({ player, season, actualTheme, onSelect }) => {
  const theme = POSITION_BAR[player.position] || POSITION_BAR.F;
  const percentile = player.warPercentile;
  const hasPercentile = percentile != null;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col gap-2.5 rounded-[20px] border border-white/10 bg-white/5 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/20 hover:bg-white/10 light:border-slate-200 light:bg-white/60 light:hover:bg-slate-900/5"
    >
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

      <div>
        <div className="mb-1 flex items-center justify-between text-[0.7rem]">
          <span className="font-medium text-gray-400 light:text-gray-500">
            League Pctile
          </span>
          <span className={`font-bold ${theme.text}`}>
            {hasPercentile ? `${percentile.toFixed(1)}%` : "—"}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08] light:bg-gray-200">
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r ${theme.fill} transition-all duration-300`}
            style={{
              width: `${Math.min(100, Math.max(0, percentile || 0))}%`,
            }}
          />
        </div>
      </div>
    </button>
  );
};
