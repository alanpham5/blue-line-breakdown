import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, ListOrdered, Loader2, Trophy } from "lucide-react";
import { subscribeLeaderboard, toggleLike } from "lib/firebase/firestore";
import { LeaderboardAnimatedList } from "features/expansion-draft/components/LeaderboardAnimatedList";
import { useDelayedLeaderboardOrder } from "features/expansion-draft/hooks/useDelayedLeaderboardOrder";
import { useAuth } from "providers/AuthContext";
import { playerUtils } from "utils/playerUtils";
import {
  seasonSpan,
  DRAFT_RESULT_ROUTE,
  buildDraftResultState,
} from "features/expansion-draft/utils/draftShared";
const topPicks = (picks, count) =>
  [...(picks || [])]
    .sort(
      (a, b) =>
        (b.warPercentile ?? b.points ?? b.savePct ?? 0) -
        (a.warPercentile ?? a.points ?? a.savePct ?? 0)
    )
    .slice(0, count);
const SectionAnchor = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#7ee340] transition-colors hover:text-[#9ef45a] light:text-[#2e6e14] light:hover:text-[#3d8c1c]"
  >
    {children}
    <ArrowRight className="h-4 w-4" />
  </Link>
);
export const DraftLeaderboardPreview = ({
  title = "Community Drafts",
  ctaHref = "/expansion-draft",
  ctaLabel = "Build Franchise",
  hideCta = false,
  seeAllHref = "/expansion-draft/leaderboard",
  seeAllThreshold = 15,
  className = "",
  limit = 5,
}) => {
  const { isConfigured, user, openAuth } = useAuth();
  const navigate = useNavigate();
  const [allDrafts, setAllDrafts] = useState(null);
  const sourceDrafts = useMemo(() => {
    if (allDrafts === null) return null;
    return (allDrafts || []).slice(0, limit);
  }, [allDrafts, limit]);
  const { drafts, reorderAnimationKey } =
    useDelayedLeaderboardOrder(sourceDrafts);
  const openDraft = (draft) => {
    navigate(DRAFT_RESULT_ROUTE, {
      state: buildDraftResultState(draft, user),
    });
  };
  const handleLike = async (draft) => {
    if (!user) {
      openAuth("signin");
      return;
    }
    const liked = (draft.likedBy || []).includes(user.uid);
    try {
      await toggleLike(draft.id, user.uid, liked);
    } catch {}
  };
  useEffect(() => {
    if (!isConfigured) {
      setAllDrafts([]);
      return;
    }
    setAllDrafts(null);
    const unsub = subscribeLeaderboard("ALL", setAllDrafts);
    return unsub;
  }, [isConfigured]);
  const totalCount = allDrafts?.length ?? 0;
  const showSeeAll = hideCta && totalCount > seeAllThreshold;
  return (
    <section className={className}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white light:text-gray-900">
          <ListOrdered className="h-6 w-6 text-sky-300 light:text-sky-600" />
          {title}
        </h2>
        {hideCta ? (
          showSeeAll && <SectionAnchor to={seeAllHref}>See all</SectionAnchor>
        ) : (
          <SectionAnchor to={ctaHref}>{ctaLabel}</SectionAnchor>
        )}
      </div>

      <div className="liquid-glass rounded-[24px] p-5 sm:p-6">
        {drafts === null ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading community
            drafts...
          </div>
        ) : drafts.length === 0 ? (
          <p className="text-sm text-gray-400">
            No community drafts posted yet.
          </p>
        ) : (
          <LeaderboardAnimatedList
            items={drafts}
            reorderAnimationKey={reorderAnimationKey}
            className="space-y-2"
          >
            {(draft, idx) => {
              const stats = draft.profile?.stats || {};
              const liked = user && (draft.likedBy || []).includes(user.uid);
              return (
                <div
                  key={draft.id}
                  data-leaderboard-row={draft.id}
                  className="flex items-center gap-2 rounded-[16px] border border-white/10 bg-white/5 px-3 py-2.5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/10 light:border-slate-200 light:bg-white/60 light:hover:bg-slate-900/5"
                >
                  <button
                    type="button"
                    onClick={() => openDraft(draft)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 rounded-[12px]"
                  >
                    <span className="w-6 shrink-0 text-center text-xs font-bold text-gray-500">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white light:text-gray-900">
                        {draft.teamName}
                      </p>
                      <p className="truncate text-xs text-gray-400 light:text-gray-500">
                        {seasonSpan(draft.season)} · by{" "}
                        {draft.ownerName || "Anonymous GM"}
                      </p>
                      {(stats.offense_rating != null ||
                        stats.defense_rating != null ||
                        stats.aggressiveness_rating != null) && (
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] font-semibold">
                          {stats.offense_rating != null && (
                            <span className="text-cyan-300 light:text-cyan-600">
                              {stats.offense_rating.toFixed(0)}% OFF
                            </span>
                          )}
                          {stats.defense_rating != null && (
                            <span className="text-rose-400 light:text-rose-600">
                              {stats.defense_rating.toFixed(0)}% DEF
                            </span>
                          )}
                          {stats.aggressiveness_rating != null && (
                            <span className="text-amber-300 light:text-amber-600">
                              {stats.aggressiveness_rating.toFixed(0)}% AGG
                            </span>
                          )}
                        </p>
                      )}
                      {(draft.picks || []).length > 0 && (
                        <div className="mt-1.5 flex -space-x-2">
                          {topPicks(draft.picks, 6).map((p) => (
                            <img
                              key={`${p.team}-${p.playerId}`}
                              src={playerUtils.getPlayerHeadshot(
                                p.playerId,
                                p.team,
                                draft.season
                              )}
                              alt={p.name}
                              title={`${p.position} - ${p.name}`}
                              className="h-6 w-6 rounded-full border-2 border-[#0b1220] object-cover bg-[var(--team-color)] light:border-white"
                              style={{
                                "--team-color": playerUtils.getTeamColor(
                                  p.team,
                                  draft.season
                                ),
                              }}
                              onError={(e) =>
                                (e.target.src = playerUtils.getDefaultHeadshot())
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLike(draft)}
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors ${liked ? "bg-rose-500/15 text-rose-400" : "bg-white/10 text-gray-300 hover:bg-white/20 light:bg-slate-900/10 light:text-slate-600"}`}
                    aria-pressed={liked}
                    aria-label={liked ? "Unlike franchise" : "Like franchise"}
                  >
                    <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
                    {draft.likes || 0}
                  </button>
                </div>
              );
            }}
          </LeaderboardAnimatedList>
        )}
      </div>
    </section>
  );
};
export { SectionAnchor };
