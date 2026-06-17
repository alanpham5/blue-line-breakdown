// Shared constants + analytics helpers for the Expansion Draft feature.

// Roster seasons that have data. Each "draft edition" pulls the PRECEDING
// season's rosters (e.g. the 2017 Expansion Draft drafts from 2016-17 rosters),
// mirroring how the real Vegas (2017) and Seattle (2021) drafts worked.
export const DRAFT_SEASONS = (() => {
  const seasons = [];
  for (let season = 2025; season >= 2008; season--) {
    seasons.push(season);
  }
  return seasons;
})();

export const seasonLabel = (season) => {
  const s = parseInt(season, 10);
  const span = `${s}-${(s + 1).toString().slice(-2)}`;
  return `${s + 1} Expansion Draft · ${span} rosters`;
};

export const seasonSpan = (season) => {
  const s = parseInt(season, 10);
  return `${s}-${(s + 1).toString().slice(-2)}`;
};

// sessionStorage key for handing a completed draft to the result page so a
// refresh on /result still has data (router state alone is lost on reload).
export const DRAFT_STORAGE_KEY = "blb_expansion_draft_result";
