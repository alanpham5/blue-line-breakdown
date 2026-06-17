# Blue Line Breakdown

## Navigable Pages

| Path                           | Nav label | Description                                                                                                                                                                                         |
| ------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                            | Players   | Splash landing with featured players and search interface.                                                                                                                                          |
| `/players`                     | —         | Player dashboard with percentile stats, WAR, similar players, and counting stats.                                                                                                                   |
| `/teams`                       | Teams     | Search for a team by season. View team summary stats, top players, and similar teams.                                                                                                               |
| `/expansion-draft`             | Draft     | NHL Expansion Draft Emulator — pick a season, claim one unprotected player per franchise.                                                                                                           |
| `/expansion-draft/result`      | —         | Team-profile analysis (simulated percentile stats, similar teams, hybrid predicted record, franchise-ordered roster) + shareable card for a completed franchise; post to the community leaderboard. |
| `/expansion-draft/leaderboard` | —         | Community leaderboard of posted expansion franchises (top 50 by likes, filterable by season).                                                                                                       |
| `/about`                       | About     | Project background, data sources, and credits.                                                                                                                                                      |
| `/loader`                      | —         | Preview of the cold-cache loading screen shown on first visit while data initializes.                                                                                                               |

The header links to Players, Teams, Draft, and About. `/loader` and the
expansion-draft result/leaderboard pages are reached in-flow or by URL.

## Project structure

The frontend follows a [bulletproof-react](https://github.com/alan2207/bulletproof-react)
layout. Imports are absolute from `src` (configured via `jsconfig.json`), e.g.
`import { Header } from "components/layout/Header"`.

```
src/
  app/            App shell + route table (App.jsx)
  components/     Shared, cross-feature UI
    layout/       Header, Footer
    ui/           Generic primitives (AppSelect, Tooltip, ShareableModal, …)
    teamProfile/  Reusable team-profile widgets shared by team + draft features
  features/       Self-contained product areas (one folder per feature)
    about/  account/  auth/  expansion-draft/  loader/
    players/  splash/  team-summary/  teams/
      <Feature>.jsx        page/route entry
      components/           feature-local components
      utils/               feature-local helpers
  hooks/          Shared hooks (useIsMobile, useIsExternal)
  lib/            Reusable libraries
    api/          Backend API client (apiService.js)
    firebase/     Firebase init, auth, and Firestore data layer
  providers/      App-wide React context providers (auth, theme, tooltip, GA)
  utils/          Shared pure helpers (playerUtils, season, profanity, shareCard)
  data/           Static data tables
```

Feature folders are self-contained; genuinely shared code is hoisted to
`components/`, `hooks/`, `lib/`, or `utils/` rather than imported across features.

Client-side heuristics (team colors, headshot/logo era resolution, theme
resolution, canvas export, draft season mapping) are documented in
**[ALGORITHMS.md](ALGORITHMS.md)**.

## Accounts, Bookmarks & Leaderboard (Firebase)

Authentication and persistence are powered by **Firebase Auth + Cloud
Firestore** (modular Web SDK v10). See **[SETUP.md](SETUP.md)** for the full
configuration walkthrough.

- **Auth** — email/password + Google SSO, with automatic account-linking when a
  Google email collides with an existing password account, email verification,
  and password reset. Logic lives in [`src/lib/firebase/auth.js`](src/lib/firebase/auth.js);
  session + bookmark state in [`src/providers/AuthContext.jsx`](src/providers/AuthContext.jsx).
- **Account menu** — avatar dropdown in the header
  ([`src/features/auth/components/AccountMenu.jsx`](src/features/auth/components/AccountMenu.jsx))
  with account settings, a live bookmarks list, a **My Drafts** section (resume
  in-progress drafts, reopen completed franchises), and sign-out.
- **Bookmarks** — toggle players/teams from their profile headers
  ([`src/components/ui/BookmarkButton.jsx`](src/components/ui/BookmarkButton.jsx)),
  synced in real time via `onSnapshot`.
- **Expansion Draft** — a thin client over the backend, which owns all draft
  logic. Rosters arrive with server-resolved protection
  ([`apiService.fetchDraftRoster`](src/lib/api/apiService.js)); completed drafts
  are POSTed to `/draft/analyze` ([`apiService.analyzeDraft`](src/lib/api/apiService.js))
  and the result page renders the returned team profile via the shared
  [`TeamProfileStatsGrid`](src/components/teamProfile/TeamProfileStatsGrid.jsx).
  Includes draft UI, HTML5-canvas share/export, and a Firestore-backed community
  leaderboard.
- **Saved drafts** — for signed-in users, in-progress drafts autosave to their
  account (`users/{uid}/drafts`, one resumable doc per season) and completed
  franchises are persisted on completion. Both are reachable from the account
  menu, and the draft splash page surfaces a "Resume an in-progress draft"
  section. State streams live via `onSnapshot` from
  [`src/providers/AuthContext.jsx`](src/providers/AuthContext.jsx).

Configuration: copy `.env.example` → `.env` and fill in `REACT_APP_FIREBASE_*`.
The app runs without Firebase configured (auth/bookmark UI degrades gracefully).
