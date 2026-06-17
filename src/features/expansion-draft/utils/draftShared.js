import { seasonSpan } from "utils/season";
export { seasonSpan };
export const DRAFT_SEASONS = (() => {
  const seasons = [];
  for (let season = 2025; season >= 2008; season--) {
    seasons.push(season);
  }
  return seasons;
})();
export const seasonLabel = (season) =>
  `${parseInt(season, 10) + 1} Expansion Draft · ${seasonSpan(season)} rosters`;
export const DRAFT_STORAGE_KEY = "blb_expansion_draft_result";
export const DRAFT_RESULT_ROUTE = "/expansion-draft/result";
export const buildDraftResultState = (entry, user) => {
  const isOwner = Boolean(user && entry.ownerId && entry.ownerId === user.uid);
  return {
    viewOnly: !isOwner,
    draft: {
      season: entry.season,
      teamName: entry.teamName,
      profile: entry.profile,
      picks: entry.picks,
      ownerId: entry.ownerId,
      ownerName: entry.ownerName,
      savedDraftId: entry.draftId || entry.id,
      postedToLeaderboard: true,
    },
  };
};
