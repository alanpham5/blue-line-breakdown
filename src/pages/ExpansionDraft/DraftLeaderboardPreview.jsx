import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ListOrdered, Loader2, Trophy } from "lucide-react";
import { subscribeLeaderboard } from "../../firebase/firestore";
import { useAuth } from "../../providers/AuthContext";
import { seasonSpan } from "./draftShared";

const SectionAnchor = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#7ee340] transition-colors hover:text-[#9ef45a] light:text-[#2e6e14] light:hover:text-[#3d8c1c]"
  >
    {children}
    <ArrowRight className="h-4 w-4" />
  </Link>
);

// Compact community-drafts card used on splash surfaces.
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
  const { isConfigured } = useAuth();
  const [allDrafts, setAllDrafts] = useState(null);

  useEffect(() => {
    if (!isConfigured) {
      setAllDrafts([]);
      return;
    }
    setAllDrafts(null);
    const unsub = subscribeLeaderboard("ALL", setAllDrafts);
    return unsub;
  }, [isConfigured]);

  const drafts =
    allDrafts === null ? null : (allDrafts || []).slice(0, limit);
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
          showSeeAll && (
            <SectionAnchor to={seeAllHref}>See all</SectionAnchor>
          )
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
          <div className="space-y-2">
            {drafts.map((draft, idx) => (
              <div
                key={draft.id}
                className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/5 px-3 py-2.5 light:border-slate-200 light:bg-white/60"
              >
                <span className="w-6 text-center text-xs font-bold text-gray-500">
                  {idx === 0 ? (
                    <Trophy className="mx-auto h-3.5 w-3.5 text-amber-300" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white light:text-gray-900">
                    {draft.teamName}
                  </p>
                  <p className="truncate text-xs text-gray-400 light:text-gray-500">
                    {seasonSpan(draft.season)} · {draft.likes || 0} likes
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { SectionAnchor };
