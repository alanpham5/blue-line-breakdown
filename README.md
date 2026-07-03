# Blue Line Breakdown

## Navigable Pages

| Path                           | Nav label | Description                                                                                                                                                                                                                                          |
| ------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                            | Players   | Splash landing with featured players, Top Forwards/Defensemen/Goalies tables, and search interface.                                                                                                                                                  |
| `/players`                     | —         | Player dashboard with percentile stats, WAR, similar players, and counting stats.                                                                                                                                                                    |
| `/leaderboard`                 | —         | Sortable, paginated player ranking tables (headshot, name, team, height, weight, league percentile, and profile metrics) by position and season. Reached via the splash "See All" anchors or URL.                                                    |
| `/teams`                       | Teams     | Search for a team by season. View team summary stats, top players, and similar teams. Links to the full roster.                                                                                                                                      |
| `/teams/roster`                | —         | Full roster as compact 5v5 forward lines, defense pairings, and goalies, with per-player League %ile and player-derived offense/defense/physicality/overall line ratings. "Modify" mode lets you substitute any player from any team that season and re-projects the estimated record and line scores live. Reached via the "Roster" anchor on a team profile. |
| `/expansion-draft`             | Draft     | NHL Expansion Draft Emulator — pick a season, claim one unprotected player per franchise.                                                                                                                                                            |
| `/expansion-draft/result`      | —         | Team-profile analysis (simulated percentile stats, similar teams, hybrid predicted record, franchise-ordered roster) + shareable card for a completed franchise; post to the community leaderboard.                                                  |
| `/expansion-draft/leaderboard` | —         | Community leaderboard of posted expansion franchises (top 50 by likes, filterable by season).                                                                                                                                                        |
| `/about`                       | About     | Project background, data sources, and credits.                                                                                                                                                                                                       |
| `/loader`                      | —         | Preview of the cold-cache loading screen shown on first visit while data initializes.                                                                                                                                                                |

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
    players/  roster/  splash/  team-summary/  teams/
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

## Accounts, Bookmarks & Leaderboard

Authentication is powered by **Firebase Auth + Cloud Firestore** (Web SDK v10).
The Google OAuth consent screen and all email delivery route through the Vercel
domain — no `firebaseapp.com` branding is ever shown to users. See
**[SETUP.md](SETUP.md)** for the full infrastructure walkthrough.

### Auth architecture

| Surface                | Implementation                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google SSO**         | Direct OAuth 2.0 redirect flow — configured in Google Cloud Console only. Frontend redirects to `accounts.google.com`; the Vercel serverless function at `/api/auth/google/callback` exchanges the code for a Firebase custom token; the client completes sign-in via `signInWithCustomToken`. No Firebase popup, no `firebaseapp.com` in the flow. |
| **Email verification** | Custom token stored in Firestore `auth_tokens`; the Firebase **Trigger Email** extension delivers a branded email linking to `/auth/verify-email?token=<uuid>`                                                                                                                                                                                      |
| **Password reset**     | Same token pattern; the Firebase **Trigger Email** extension delivers a branded email linking to `/auth/reset-password?token=<uuid>`                                                                                                                                                                                                                |
| **Session / JWTs**     | Firebase Auth (`onAuthStateChanged`) — unchanged                                                                                                                                                                                                                                                                                                    |
| **Data persistence**   | Cloud Firestore — unchanged                                                                                                                                                                                                                                                                                                                         |

### Supported use cases

- **Sign up / sign in** — email + password or Google SSO. Google account-linking
  is handled automatically when a Google email collides with an existing password
  account.
- **Email verification** — required to post to the community leaderboard.
  Triggered on sign-up and resendable from Account Settings.
- **Password reset** — request from the sign-in modal or Account Settings;
  one-time link expires after 1 hour.

### Key files

| File                                                                                               | Purpose                                                           |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`src/lib/firebase/auth.js`](src/lib/firebase/auth.js)                                             | Client-side auth operations                                       |
| [`src/providers/AuthContext.jsx`](src/providers/AuthContext.jsx)                                   | Session state, bookmarks, drafts                                  |
| [`src/features/auth/components/AuthModal.jsx`](src/features/auth/components/AuthModal.jsx)         | Sign-in / sign-up / reset modal                                   |
| [`src/features/auth/components/VerifyEmail.jsx`](src/features/auth/components/VerifyEmail.jsx)     | `/auth/verify-email` landing page                                 |
| [`src/features/auth/components/ResetPassword.jsx`](src/features/auth/components/ResetPassword.jsx) | `/auth/reset-password` landing page                               |
| [`api/auth/send-verification.js`](api/auth/send-verification.js)                                   | Serverless — generate token, queue verification email             |
| [`api/auth/verify-email.js`](api/auth/verify-email.js)                                             | Serverless — consume token, mark user verified                    |
| [`api/auth/send-reset.js`](api/auth/send-reset.js)                                                 | Serverless — generate token, queue reset email                    |
| [`api/auth/reset-password.js`](api/auth/reset-password.js)                                         | Serverless — consume token, update password                       |
| [`api/_lib/email.js`](api/_lib/email.js)                                                           | Serverless — queues mail for the Firebase Trigger Email extension |

### Required environment variables

| Variable                                 | Where used | Description                                                                         |
| ---------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `REACT_APP_FIREBASE_API_KEY`             | Browser    | Firebase Web SDK                                                                    |
| `REACT_APP_FIREBASE_AUTH_DOMAIN`         | Browser    | Set to your Vercel domain, e.g. `blue-line-breakdown.vercel.app`                    |
| `REACT_APP_FIREBASE_PROJECT_ID`          | Browser    | Firebase project ID                                                                 |
| `REACT_APP_FIREBASE_STORAGE_BUCKET`      | Browser    | Firebase Storage bucket                                                             |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Browser    | Firebase messaging sender ID                                                        |
| `REACT_APP_FIREBASE_APP_ID`              | Browser    | Firebase app ID                                                                     |
| `REACT_APP_APP_URL`                      | Serverless | Public URL used to build email links, e.g. `https://blue-line-breakdown.vercel.app` |
| `FIREBASE_SERVICE_ACCOUNT_B64`           | Serverless | Base64-encoded Firebase service account JSON                                        |
| `MAIL_COLLECTION`                        | Serverless | Firestore collection watched by the Trigger Email extension (default `mail`)        |
| `EMAIL_FROM`                             | Serverless | Optional per-message FROM; defaults to the extension's configured sender            |

Copy `.env.example` → `.env` and fill in the values. Add the same variables under
**Vercel → Project → Settings → Environment Variables** for production. The app
runs without Firebase configured — auth/bookmark UI degrades gracefully when
`isFirebaseConfigured` is `false`.
