export const LEADERBOARD_RANK_DELAY_MS = 1000;

export const isLikeReorder = (previousDrafts, nextDrafts) => {
  if (!previousDrafts?.length || !nextDrafts?.length) return false;
  if (previousDrafts.length !== nextDrafts.length) return false;

  const previousIds = previousDrafts.map((draft) => draft.id);
  const nextIds = nextDrafts.map((draft) => draft.id);
  if (previousIds.join(",") === nextIds.join(",")) return false;

  const previousIdSet = new Set(previousIds);
  if (previousIdSet.size !== previousIds.length) return false;

  return nextIds.every((id) => previousIdSet.has(id));
};

export const mergeByCurrentOrder = (currentDrafts, incomingDrafts) => {
  const incomingById = new Map(incomingDrafts.map((draft) => [draft.id, draft]));
  const kept = currentDrafts
    .map((draft) => incomingById.get(draft.id))
    .filter(Boolean);
  const keptIds = new Set(kept.map((draft) => draft.id));
  const added = incomingDrafts.filter((draft) => !keptIds.has(draft.id));
  return [...kept, ...added];
};
