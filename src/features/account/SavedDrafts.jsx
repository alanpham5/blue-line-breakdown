import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  PlayCircle,
  Trash2,
  Loader2,
  ListPlus,
  ListX,
  List,
  Users,
} from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { useAuth } from "providers/AuthContext";
import {
  deleteUserDraft,
  isCompleteDraft,
  isInProgressDraft,
  postDraftToLeaderboard,
  removeDraftFromLeaderboard,
} from "lib/firebase/firestore";
import { apiService } from "lib/api/apiService";
import { seasonSpan } from "utils/season";
import { draftNavTarget } from "features/account/utils/savedItems";
import { ConfirmDialog } from "components/ui/ConfirmDialog";
import { playerUtils } from "utils/playerUtils";
const normalizePicks = (picks) => {
  if (Array.isArray(picks)) return picks;
  if (!picks || typeof picks !== "object") return [];
  return Object.entries(picks).map(([team, player]) => ({
    ...(player || {}),
    team,
  }));
};
const topPicks = (picks, count) =>
  normalizePicks(picks)
    .sort(
      (a, b) =>
        (b.warPercentile ?? b.points ?? b.savePct ?? 0) -
        (a.warPercentile ?? a.points ?? a.savePct ?? 0)
    )
    .slice(0, count);
export const SavedDrafts = () => {
  const { user, loading, drafts, openAuth } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null);
  const [boardAction, setBoardAction] = useState(null);
  const [boardBusyId, setBoardBusyId] = useState(null);
  const [boardError, setBoardError] = useState(null);
  useEffect(() => {
    document.title = "My Drafts | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);
  useEffect(() => {
    if (!loading && !user) {
      openAuth("signin");
      navigate("/", {
        replace: true,
      });
    }
  }, [loading, user, openAuth, navigate]);
  const inProgress = drafts.filter(
    (d) => isInProgressDraft(d) && (d.pickCount || 0) > 0
  );
  const completed = drafts.filter((d) => isCompleteDraft(d));
  const openDraft = (d) => {
    const { path, state } = draftNavTarget(d);
    navigate(path, {
      state,
    });
  };
  const removeDraft = (d) => setConfirm(d);
  const confirmDelete = async () => {
    const d = confirm;
    setConfirm(null);
    if (!d) return;
    await deleteUserDraft(user.uid, d.id).catch(() => {});
  };
  const requestBoardToggle = (d) => {
    setBoardError(null);
    if (!d.postedToLeaderboard && !user?.emailVerified) {
      setBoardError({
        id: d.id,
        message: "Verify your email to post to the community board.",
      });
      return;
    }
    setBoardAction({
      draft: d,
      action: d.postedToLeaderboard ? "remove" : "add",
    });
  };
  const confirmBoard = async () => {
    const action = boardAction;
    setBoardAction(null);
    if (!action || !user) return;
    const d = action.draft;
    setBoardBusyId(d.id);
    setBoardError(null);
    try {
      if (action.action === "remove") {
        await removeDraftFromLeaderboard(user.uid, d.id);
      } else {
        const profile = await apiService.analyzeTeam({
          season: d.season,
          teamName: d.teamName,
          roster: d.picks,
        });
        await postDraftToLeaderboard(user, {
          ...d,
          profile,
          savedDraftId: d.id,
        });
      }
    } catch (err) {
      setBoardError({
        id: d.id,
        message: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setBoardBusyId(null);
    }
  };
  return (
    <div className="min-h-screen ice-background px-4 pb-28 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header />

        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-white light:text-gray-500 light:hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <h1 className="fade-in-up mb-6 flex items-center gap-2 text-3xl font-extrabold tracking-display text-white light:text-gray-900 sm:text-4xl">
            <List className="h-7 w-7 text-amber-300 light:text-amber-600" /> My
            Drafts
          </h1>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : inProgress.length === 0 && completed.length === 0 ? (
            <div className="liquid-glass rounded-[28px] p-10 text-center text-gray-400 light:text-gray-500">
              No saved drafts yet.{" "}
              <Link
                to="/expansion-draft"
                className="font-semibold text-sky-300 hover:text-sky-200 light:text-sky-600"
              >
                Build a franchise
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-6">
              {inProgress.length > 0 && (
                <Section
                  icon={PlayCircle}
                  label="In progress"
                  items={inProgress}
                  onOpen={openDraft}
                  onRemove={removeDraft}
                />
              )}
              {completed.length > 0 && (
                <Section
                  icon={Trophy}
                  label="Completed"
                  items={completed}
                  onOpen={openDraft}
                  onRemove={removeDraft}
                  showHeaderIcon={false}
                  showLeaderboard
                  onToggleBoard={requestBoardToggle}
                  busyId={boardBusyId}
                  boardError={boardError}
                />
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete this franchise?"
        message="This removes it from your account. If it's posted to Community Drafts, it will be removed there too."
        confirmLabel="Delete franchise"
        onCancel={() => setConfirm(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={Boolean(boardAction)}
        title={
          boardAction?.action === "remove"
            ? "Remove from community board?"
            : "Post to the community board?"
        }
        message={
          boardAction?.action === "remove"
            ? "This removes your franchise from the public Community Board."
            : "This shares your franchise on the public Community Board, where anyone can view and like it."
        }
        confirmLabel={
          boardAction?.action === "remove" ? "Remove" : "Post franchise"
        }
        destructive={boardAction?.action === "remove"}
        onCancel={() => setBoardAction(null)}
        onConfirm={confirmBoard}
      />
    </div>
  );
};
const subtitleFor = (d) =>
  isInProgressDraft(d)
    ? `${seasonSpan(d.season)} · ${d.pickCount} picked`
    : `${seasonSpan(d.season)}${d.profile?.predictedRecord?.display ? ` · ${d.profile.predictedRecord.display} predicted` : ""}`;
const Section = ({
  icon: Icon,
  label,
  items,
  onOpen,
  onRemove,
  showHeaderIcon = true,
  showLeaderboard = false,
  onToggleBoard,
  busyId,
  boardError,
}) => (
  <section className="liquid-glass-strong fade-in-up rounded-[28px] p-4 sm:p-6">
    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-400 light:text-gray-500">
      {showHeaderIcon && <Icon className="h-4 w-4" />} {label}
      <span className="text-gray-500">({items.length})</span>
    </h2>
    <div className="space-y-1.5">
      {items.map((d) => (
        <div
          key={d.id}
          className="rounded-[18px] border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/10 light:border-slate-200 light:bg-white/60"
        >
          <div className="group flex items-center">
            <button
              type="button"
              onClick={() => onOpen(d)}
              className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
            >
              <Users className="h-4 w-4 shrink-0 text-gray-400 light:text-gray-500" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white light:text-gray-900">
                  {d.teamName || "Untitled franchise"}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {subtitleFor(d)}
                </span>
                {topPicks(d.picks, 6).length > 0 && (
                  <span className="mt-1.5 flex -space-x-2">
                    {topPicks(d.picks, 6).map((p) => (
                      <img
                        key={`${p.team}-${p.playerId}`}
                        src={playerUtils.getPlayerHeadshot(
                          p.playerId,
                          p.team,
                          d.season
                        )}
                        alt={p.name}
                        title={`${p.position} - ${p.name}`}
                        className="h-6 w-6 rounded-full border-2 border-[#0b1220] object-cover bg-[var(--team-color)] light:border-white"
                        style={{
                          "--team-color": playerUtils.getTeamColor(
                            p.team,
                            d.season
                          ),
                        }}
                        onError={(e) =>
                          (e.target.src = playerUtils.getDefaultHeadshot())
                        }
                      />
                    ))}
                  </span>
                )}
              </span>
            </button>
            {showLeaderboard && (
              <button
                type="button"
                onClick={() => onToggleBoard(d)}
                disabled={busyId === d.id}
                aria-label={
                  d.postedToLeaderboard
                    ? "Remove from community board"
                    : "Add to community board"
                }
                title={
                  d.postedToLeaderboard
                    ? "Remove from community board"
                    : "Add to community board"
                }
                className={`shrink-0 rounded-full p-2 transition-colors disabled:opacity-50 ${
                  d.postedToLeaderboard
                    ? "text-sky-300 hover:bg-sky-500/10 light:text-sky-600"
                    : "text-gray-500 hover:bg-sky-500/10 hover:text-sky-300 light:hover:text-sky-600"
                }`}
              >
                {busyId === d.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : d.postedToLeaderboard ? (
                  <ListX className="h-4 w-4" />
                ) : (
                  <ListPlus className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(d)}
              aria-label="Delete draft"
              className="mr-2 shrink-0 rounded-full p-2 text-gray-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {boardError?.id === d.id && (
            <p className="px-4 pb-2.5 text-xs text-rose-400">
              {boardError.message}
            </p>
          )}
        </div>
      ))}
    </div>
  </section>
);
