# Algorithms & Client-Side Logic

The analytical model (player similarity, percentiles, WAR, team simulation,
similar teams, and predicted record) is computed by the Flask backend; the
frontend renders whatever the API returns. See **[SETUP.md](SETUP.md)** for the
backend API contract and the Firestore data model. This document covers the
non-obvious logic that lives in the **frontend**.

## Team colors (`utils/playerUtils.js` → `getTeamColor`)

Each franchise has a brand `primary`/`secondary` plus a `worksOnDark` flag.
Color selection is theme- and season-aware:

- **Light theme** always uses the brand `primary`.
- **Dark theme** uses `primary` when `worksOnDark` is true; otherwise it falls
  back to the `secondary` color (unless that is pure black/white), so logos and
  surfaces stay legible on dark backgrounds.
- **Retro eras** override the brand for a season range (e.g. Nashville
  1998–2010, Anaheim's "Wild Wing"/orange eras). The first matching era for the
  given season wins.

`getSurfaceGradient` / `getCardGradient` derive layered CSS gradients from the
resolved color (with `toRgba` for alpha blending) so cards tint toward the team
color without hard-coding per-team gradients.

## Player headshots (`getPlayerHeadshot`)

1. A few hand-picked overrides return custom art for specific player+season
   combinations (e.g. celebration/cupcake images).
2. With a team + season, the NHL mug CDN URL is built as
   `…/mugs/nhl/{season}{season+1}/{TEAM}/{playerId}.png`, mapping `ARI → PHX`
   for seasons ≤ 2013 (the Phoenix Coyotes era).
3. Otherwise the latest mug is used, with a default-skater fallback.

## Team logos (`getTeamLogoUrl`)

Resolves the correct historical/anniversary logo for a season:

- A `light`/`dark` suffix is chosen from the active theme.
- Special anniversary logos are returned for specific season pins (e.g. Leafs
  100, Canadiens 100, Bruins 100, several 2025 throwbacks).
- `logoEras` maps season ranges to the era-correct asset; the first matching era
  wins. Teams without an era match use the standard `{TEAM}_{suffix}.svg`.

## Theme resolution (`providers/ThemeContext.jsx`)

- Theme is `light`, `dark`, or `system` (persisted to `localStorage`).
- **Touch / coarse-pointer devices are forced to `system`** and the toggle is
  disabled, so mobile always follows the OS appearance.
- `system` resolves live via `prefers-color-scheme` and re-applies on OS change.
- The favicon / apple-touch-icon swap between light/dark variants based on the
  system preference.

## Expansion-draft season mapping (`features/expansion-draft/utils/draftShared.js`)

A draft "edition" drafts from the **preceding** season's rosters, mirroring the
real Vegas (2017) and Seattle (2021) drafts. So the 2017 Expansion Draft uses
2016–17 rosters. `DRAFT_SEASONS` lists roster seasons 2008–2025; `seasonLabel`
renders e.g. "2018 Expansion Draft · 2017-18 rosters".

Protection schemes (`7-3-1` vs `8-1`) and the `isLosing` inference are resolved
**server-side** and arrive on each roster as a `protection` object — see
SETUP.md. A completed draft is stashed in `sessionStorage` under
`DRAFT_STORAGE_KEY` so a refresh on the result page survives (router state alone
is lost on reload).

## Shareable card export (`components/ui/ShareableModal.jsx`, `utils/shareCard.js`)

Cards are designed at a fixed **1200px** width and captured with `html2canvas`:

- The on-screen preview is shrunk to fit narrow viewports via a CSS transform,
  but capture temporarily renders the card off-screen at full 1200px (with a
  forced `windowWidth` of 1280) so the exported PNG is identical on mobile and
  desktop.
- `useCORS: true` + `allowTaint: false` keep the canvas exportable; the
  `onclone` hook disables animations and applies small text-offset corrections
  that compensate for html2canvas's text-baseline differences.
- On mobile, the image is handed to the **Web Share API** (`navigator.share`);
  `shareImage` returns `false` when sharing/file-sharing isn't supported so the
  caller falls back to a direct PNG download. A dismissed share sheet
  (`AbortError`) is treated as handled.

## Bookmarks & leaderboard integrity (`lib/firebase/firestore.js`)

- Bookmarks use a **deterministic doc id** (`{ENTITY_TYPE}_{entityId}`) so an
  entity is bookmarked at most once and toggling is idempotent.
- A leaderboard entry shares the **same id** as its saved draft, which makes
  posting idempotent, lets deletes cascade, and guarantees an entry can't
  reference a missing or another user's draft. Orphan reconciliation removes
  any public entry whose saved draft no longer exists.
- Saved drafts persist only the **roster** (`picks`); team metrics are always
  recomputed by the backend on view. Leaderboard entries store a one-time
  metrics snapshot so the list never recomputes on read.
- All writes are run through `sanitizeForFirestore` to strip nested `undefined`
  values (which Firestore rejects).

## Profanity check (`utils/profanity.js`)

Team names are validated against PurgoMalum's public
`containsprofanity` endpoint (no local word list). The helper returns a
structured `{ ok, profane }` / `{ ok: false, error }` result so callers can
distinguish "clean", "profane", and "check unavailable".

## Page-view analytics (`providers/GaPageTrackContext.jsx`)

On every route change the document title is derived from the path and query
params (player/team/season), and a `page_view` (plus a `player_view` /
`team_view` where applicable) event is sent to Google Analytics when `gtag` is
present.
