// Shared routing helpers for the user's saved items (bookmarks + drafts), used
// by the account dropdown and the dedicated "see all" pages so link targets and
// navigation state stay defined in one place.
import {
  ENTITY_TYPES,
  isCompleteDraft,
  isInProgressDraft,
} from "../../firebase/firestore";

const normalizePicks = (picks) => {
  if (Array.isArray(picks)) return picks;
  if (!picks || typeof picks !== "object") return null;
  const mapped = Object.entries(picks).map(([team, player]) => ({
    ...(player || {}),
    team,
  }));
  return mapped.length ? mapped : null;
};

// In-app route for a bookmarked entity, rebuilt from its stored meta.
export const bookmarkHref = (bm) => {
  if (bm.entityType === ENTITY_TYPES.TEAM) {
    const params = new URLSearchParams();
    if (bm.team) params.set("team", bm.team);
    if (bm.season) params.set("year", bm.season);
    return `/teams?${params.toString()}`;
  }
  const params = new URLSearchParams();
  if (bm.player) params.set("player", bm.player);
  if (bm.season) params.set("season", bm.season);
  if (bm.position) params.set("position", bm.position);
  return `/players?${params.toString()}`;
};

// Navigation target for opening a saved draft: completed franchises reopen the
// result page with their picks so metrics are re-analyzed dynamically; in-
// progress drafts resume on the draft page.
//
// `savedDraftId` lets the result page know the franchise is already persisted.
// `picks` is sourced from `d.picks` (new saves) with a backward-compat
// fallback to `d.profile?.roster` for older saves that stored a full profile.
export const draftNavTarget = (d) =>
  isCompleteDraft(d)
    ? {
        path: "/expansion-draft/result",
        state: {
          draft: {
            season: d.season,
            teamName: d.teamName,
            // No profile — metrics are always recalculated dynamically for
            // non-leaderboard franchises. The result page calls /draft/reanalyze.
            picks: normalizePicks(d.picks) || normalizePicks(d.profile?.roster),
            savedDraftId: d.id,
            leaderboardId: d.leaderboardId || null,
          },
        },
      }
    : isInProgressDraft(d)
      ? { path: "/expansion-draft", state: { resume: d } }
      : { path: "/expansion-draft", state: {} };

