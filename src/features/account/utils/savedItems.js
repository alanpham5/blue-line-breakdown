import {
  ENTITY_TYPES,
  isCompleteDraft,
  isInProgressDraft,
} from "lib/firebase/firestore";
const normalizePicks = (picks) => {
  if (Array.isArray(picks)) return picks;
  if (!picks || typeof picks !== "object") return null;
  const mapped = Object.entries(picks).map(([team, player]) => ({
    ...(player || {}),
    team,
  }));
  return mapped.length ? mapped : null;
};
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
export const draftNavTarget = (d) =>
  isCompleteDraft(d)
    ? {
        path: "/expansion-draft/result",
        state: {
          draft: {
            season: d.season,
            teamName: d.teamName,
            picks: normalizePicks(d.picks) || normalizePicks(d.profile?.roster),
            savedDraftId: d.id,
            postedToLeaderboard: Boolean(d.postedToLeaderboard),
          },
        },
      }
    : isInProgressDraft(d)
      ? {
          path: "/expansion-draft",
          state: {
            resume: d,
          },
        }
      : {
          path: "/expansion-draft",
          state: {},
        };
