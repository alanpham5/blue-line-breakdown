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

## Accounts, Bookmarks & Leaderboard (Firebase)

Authentication and persistence are powered by **Firebase Auth + Cloud
Firestore** (modular Web SDK v10). See **[SETUP.md](SETUP.md)** for the full
configuration walkthrough.

- **Auth** — email/password + Google SSO, with automatic account-linking when a
  Google email collides with an existing password account, email verification,
  and password reset. Logic lives in [`src/firebase/auth.js`](src/firebase/auth.js);
  session + bookmark state in [`src/providers/AuthContext.jsx`](src/providers/AuthContext.jsx).
- **Account menu** — avatar dropdown in the header
  ([`src/components/auth/AccountMenu.jsx`](src/components/auth/AccountMenu.jsx))
  with account settings, a live bookmarks list, a **My Drafts** section (resume
  in-progress drafts, reopen completed franchises), and sign-out.
- **Bookmarks** — toggle players/teams from their profile headers
  ([`src/components/BookmarkButton.jsx`](src/components/BookmarkButton.jsx)),
  synced in real time via `onSnapshot`.
- **Expansion Draft** — a thin client over the backend, which owns all draft
  logic. Rosters arrive with server-resolved protection
  ([`apiService.fetchDraftRoster`](src/services/apiService.js)); completed drafts
  are POSTed to `/draft/analyze` ([`apiService.analyzeDraft`](src/services/apiService.js))
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
