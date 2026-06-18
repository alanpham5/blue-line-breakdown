# Blue Line Breakdown — Firebase & Firestore Setup

This guide covers everything needed to enable **Authentication**, **Cloud
Firestore bookmarking**, and the **Expansion Draft community leaderboard**.

The frontend uses the **Firebase Web SDK v10 (modular)**. All wiring lives under
[`src/lib/firebase/`](src/lib/firebase/) and reads configuration from
`REACT_APP_FIREBASE_*` environment variables — no keys are committed.

---

## 1. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) →
   **Add project**. Name it (e.g. `blue-line-breakdown`).
2. Disable or enable Google Analytics as you prefer — it's not required.

## 2. Register a Web App

1. In the project, click the **Web** icon (`</>`) to add a web app.
2. Give it a nickname; you do **not** need Firebase Hosting.
3. Copy the `firebaseConfig` values shown — you'll paste them into `.env`.

## 3. Enable Authentication providers

Console → **Build → Authentication → Get started → Sign-in method**:

- **Email/Password** → Enable.
- **Google** → Enable, choose a support email, Save.

Under **Authentication → Settings → Authorized domains**, make sure these are
listed (add any you deploy to):

- `localhost`
- your Vercel domain, e.g. `blue-line-breakdown.vercel.app`

> Google SSO popups and email-action links only work on authorized domains.

### SSO Branding (Custom Auth Domain)

To prevent Google SSO from showing the default Firebase domain (`blue-line-breakdown-afaf2.firebaseapp.com`) and display your app brand/domain instead:

1. **Google Cloud Console Settings**:
   - Go to Google Cloud Console, select your project, and navigate to **APIs & Services** -> **Credentials**.
   - Edit the **OAuth 2.0 Client ID** for Web application.
   - Add your Vercel domain (`https://blue-line-breakdown.vercel.app`) to **Authorized JavaScript origins**.
   - Add the custom rewrite path (`https://blue-line-breakdown.vercel.app/__/auth/handler`) to **Authorized redirect URIs**.
2. **Google OAuth Consent Screen**:
   - In **APIs & Services** -> **OAuth consent screen**, ensure the **App name** is set to `Blue Line Breakdown`.
3. **Vercel Rewrites (`vercel.json`)**:
   - A `vercel.json` file must be present in the repository root containing a rewrite rule to proxy `/__/auth/*` requests to Firebase Hosting:
     ```json
     {
       "rewrites": [
         {
           "source": "/__/auth/:path*",
           "destination": "https://blue-line-breakdown-afaf2.firebaseapp.com/__/auth/:path*"
         }
       ]
     }
     ```

## 4. Create the Firestore database

Console → **Build → Firestore Database → Create database**:

- Start in **production mode** (the rules below lock it down properly).
- Pick a region close to your users.

## 5. Configure environment variables

Copy `.env.example` to `.env` and fill in the Web App config from step 2. Note that for custom branded SSO, `REACT_APP_FIREBASE_AUTH_DOMAIN` should be set to your custom Vercel domain (e.g. `blue-line-breakdown.vercel.app`) instead of the default `.firebaseapp.com` domain:

```bash
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=blue-line-breakdown.vercel.app
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

In production (Vercel), add the same variables under **Project → Settings →
Environment Variables**, then redeploy.

> If these are missing, the app still runs — `isFirebaseConfigured` is `false`,
> auth/bookmark UI shows a "configure Firebase" notice, and the leaderboard
> renders empty instead of throwing.

## 6. Deploy the security rules & indexes

The repo ships:

- [`firestore.rules`](firestore.rules) — access control (see below)
- [`firestore.indexes.json`](firestore.indexes.json) — the composite index the
  season-filtered leaderboard query needs
- [`firebase.json`](firebase.json) — points the CLI at both

Install the CLI once and deploy:

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # select your project
firebase deploy --only firestore:rules,firestore:indexes
```

> Alternatively, the first time the season-filtered leaderboard query runs,
> Firestore logs a console error with a **one-click "create index"** link.

---

## Data model

```
users/{uid}                      (owner-only)
  bookmarks/{entityType}_{id}    { entityId, entityType: 'PLAYER'|'TEAM',
                                   label, player?/team?, season?, position?,
                                   createdAt }
  drafts/progress_{season}       in-progress autosave (one per season)
                                 { status:'in_progress', season:number,
                                   teamName, picks:{ [team]: player },
                                   pickCount:number, updatedAt }
  drafts/{autoId}                completed franchise (source of truth)
                                 { status:'complete', season:number, teamName,
                                   picks:[player],            // roster only —
                                   pickCount:number,          // metrics are
                                   postedToLeaderboard?:bool, // recalculated on
                                   createdAt, updatedAt }      // every view

expansion_drafts/{draftId}       (public read; id == the saved draft's id)
  { draftId,                       // reference back to the saved draft
    ownerId, ownerName, teamName, season:number,
    profile: {                     // metrics snapshot, captured once at post
      stats, roster, similarTeams, predictedRecord, draftSummary },
    picks: profile.roster,         // roster snapshot (franchise-ordered)
    metrics: profile.draftSummary, // metrics snapshot
    likes:number, likedBy:[uid], createdAt }
```

A saved draft is private and stores only its roster; team metrics are
recalculated by the backend whenever the draft is viewed. A leaderboard entry
is a public snapshot that reuses the saved draft's id, so a draft has at most
one entry, posting is idempotent, deleting a draft cascades to its entry, and an
entry can never reference a missing or another user's draft.

## Security rules summary

`firestore.rules` enforces:

| Path                         | Read   | Write                                                                                                                                   |
| ---------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `users/{uid}`                | owner  | owner only                                                                                                                              |
| `users/{uid}/bookmarks/{id}` | owner  | owner only                                                                                                                              |
| `users/{uid}/drafts/{id}`    | owner  | owner only (private saved drafts — no email gate)                                                                                       |
| `expansion_drafts/{id}`      | public | **create**: verified email + `ownerId == uid` + `draftId == id` + `likes == 0` + the owned saved draft `users/{uid}/drafts/{id}` exists |
|                              |        | **update**: signed-in, only `likes`/`likedBy` may change, only your own uid                                                             |
|                              |        | **delete**: owner only                                                                                                                  |

This guarantees users can only touch their own data, and posting to the
community leaderboard requires a verified email (matching the in-app
`user.emailVerified` gate).

---

## Backend (Expansion Draft)

All draft logic lives in the Flask backend (`blue-line-breakdown-stateless`);
the frontend is a thin client that renders whatever the API returns.

- `GET /draft/teams?year=<season>` → franchises active that season, ordered by
  full name (also the roster ordering used by `/draft/analyze`)
- `GET /draft/rosters?year=<season>&team=<ABBR>` → forwards/defensemen/goalies
  with G/A/PTS/+−, age, goalie SV%/GAA/SV/SA, **plus** a `protection` object:

  ```json
  "protection": {
    "scheme": "7-3-1",            // or "8-1"
    "isLosing": false,            // resolved server-side from teams_processed
    "players": [{ "playerId": 1, "protected": true, "protectionReason": "...",
                  "exempt": false, ... }],
    "unprotected": [ ... ]
  }
  ```

- `POST /draft/analyze` — body `{ season, teamName, picks[] }`. Validates the
  roster (one pick per franchise, 12 F / 6 D / 2 G, unprotected-only) and returns
  a full team profile:

  ```json
  {
    "teamName": "Seattle Kraken", "season": 2025, "isExpansionTeam": true,
    "stats": { "goals_pg": 3.12, "goals_pg_pct": 72.4, "offense_rating": 68.2, ... },
    "roster": [ /* one entry per franchise, in /draft/teams order, WAR-enriched */ ],
    "similarTeams": [{ "team": "COL", "season": 2022, "similarity": 87.4 }],
    "predictedRecord": { "wins": 44, "losses": 30, "otl": 8,
                          "display": "44-30-8", "playoffProbability": 0.62 },
    "draftSummary": { "counts": {...}, "scoringDepth": {...}, "ageTrajectory": {...} }
  }
  ```

  A `400` is returned for any roster-rule violation.

No extra configuration is required beyond the backend's existing data hosting.
**Note:** the source dataset has no goalie W/L, so the draft table surfaces
GP/SV%/GAA instead; `+/-` is approximated by on-ice goal differential.

---

## Local development

```bash
cp .env.example .env     # fill in Firebase keys
npm install
npm run dev              # http://localhost:3000
```

The backend defaults to `http://localhost:5001` (override with
`REACT_APP_API_URL`).
