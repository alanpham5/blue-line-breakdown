# Blue Line Breakdown — Auth & Infrastructure Setup

This guide covers everything needed to enable **Authentication**, **Cloud
Firestore bookmarking**, and the **Expansion Draft community leaderboard**.

Google SSO is handled entirely by a direct OAuth 2.0 flow — configured once in
Google Cloud Console and never touching Firebase's OAuth infrastructure. Email
verification and password-reset messages are delivered by the **Firebase Trigger
Email extension** over Gmail SMTP — no custom domain required. Firebase Auth is
kept as the session and JWT layer; Firestore is the data store.

---

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. Disable Google Analytics if preferred — it is not required.

## 2. Register a Web App

1. Project → click the **Web** icon (`</>`) → **Add app**.
2. Give it a nickname; you do **not** need Firebase Hosting.
3. Copy the `firebaseConfig` values — you will paste them into `.env` in step 5.

## 3. Enable Email/Password authentication

Firebase Console → **Build → Authentication → Get started → Sign-in method**:

- **Email/Password** → Enable → Save.

> Google SSO is **not** configured here. It is configured entirely in Google
> Cloud Console in the next step.

Under **Authentication → Settings → Authorized domains**, add:

- `localhost`
- your Vercel domain, e.g. `blue-line-breakdown.vercel.app`

---

## 4. Google Cloud Console — OAuth setup

This is the **only** place you configure Google SSO.

### 4a. OAuth consent screen

1. Open [Google Cloud Console](https://console.cloud.google.com/) → select your Firebase project.
2. Navigate to **APIs & Services → OAuth consent screen**.
3. Choose **External** → **Create**.
4. Fill in:
   - **App name**: `Blue Line Breakdown`
   - **User support email**: your email
   - **App logo**: optional, appears on the consent screen
   - **App home page**: `https://blue-line-breakdown.vercel.app`
   - **Developer contact email**: your email
5. Click **Save and Continue** through the remaining screens.

### 4b. Create an OAuth 2.0 Client ID

1. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Name: `Blue Line Breakdown Web`.
4. Under **Authorized JavaScript origins**, add:
   ```
   https://blue-line-breakdown.vercel.app
   http://localhost:3000
   ```
5. Under **Authorized redirect URIs**, add:
   ```
   https://blue-line-breakdown.vercel.app/api/auth/google/callback
   http://localhost:3000/api/auth/google/callback
   ```
6. Click **Create**.
7. Copy the **Client ID** and **Client Secret** — you will need both in step 5.

> The redirect URI points to your Vercel serverless function, not to Firebase.
> Firebase is not involved in this OAuth flow at all.

---

## 5. Firebase service account (Admin SDK)

The serverless functions use the Firebase Admin SDK to create users, issue
custom tokens, verify emails, reset passwords, and queue outgoing mail for the
Trigger Email extension.

1. Firebase Console → **Project settings** (gear icon) → **Service accounts**.
2. Click **Generate new private key** → download the JSON file.
3. Base64-encode it (no line breaks):

   ```bash
   base64 -i serviceAccount.json | tr -d '\n'
   ```

4. Copy the output — this is your `FIREBASE_SERVICE_ACCOUNT_B64` value.

> Never commit the raw JSON or the encoded string to source control.

---

## 6. Transactional email — Firebase Trigger Email extension

Instead of Resend (which needs a verified custom domain), email is sent by the
official **Trigger Email from Firestore** extension. The serverless functions
write a document to a Firestore collection; the extension picks it up and sends
it over an SMTP provider. **Gmail SMTP works with no custom domain.**

### 6a. Create a Gmail App Password (SMTP credentials)

1. Use any Gmail account as the sender (e.g. your own).
2. Enable **2-Step Verification**: [myaccount.google.com/security](https://myaccount.google.com/security).
3. Go to **App passwords**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
4. Create a new app password (name it `blue-line-breakdown`) and copy the 16-character value.

> The app password is the SMTP password — your normal Gmail password will not work.
> Gmail's free tier allows ~500 messages/day, which is ample for verification/reset email.

### 6b. Install the Trigger Email extension

Firebase Console → **Build → Extensions** → find **Trigger Email from Firestore**
(`firebase/firestore-send-email`) → **Install**. During configuration:

| Setting | Value |
| --- | --- |
| **SMTP connection URI** | `smtps://YOUR_EMAIL%40gmail.com@smtp.gmail.com:465` |
| **SMTP password** | the 16-char Gmail App Password from step 6a |
| **Email documents collection** | `mail` |
| **Default FROM address** | `Blue Line Breakdown <YOUR_EMAIL@gmail.com>` |

> Note the `%40` — the `@` in the email must be URL-encoded inside the connection URI.
> Some console versions ask for the SMTP password as a separate field/secret rather
> than inline in the URI; either is fine.

The collection name (`mail`) must match `MAIL_COLLECTION` in your env (it defaults
to `mail`, so you can leave that unset). The app passes no explicit FROM unless you
set `EMAIL_FROM`, so the extension's default sender is used.

### 6c. How the app uses it

[`api/_lib/email.js`](api/_lib/email.js) writes `{ to, message: { subject, html } }`
to the `mail` collection via the Admin SDK. The extension sends it and writes a
`delivery` status field back onto the same document — handy for debugging in the
Firestore console.

---

## 7. Firestore database

Firebase Console → **Build → Firestore Database → Create database**:

- Start in **production mode**.
- Pick a region close to your users.

### Deploy rules and indexes

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 8. Environment variables

### Local development (`.env`)

```bash
REACT_APP_API_URL=https://blue-line-breakdown-api.onrender.com
REACT_APP_APP_URL=http://localhost:3000

REACT_APP_GOOGLE_CLIENT_ID=<Client ID from step 4b>
GOOGLE_CLIENT_SECRET=<Client Secret from step 4b>

REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=blue-line-breakdown-afaf2.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

FIREBASE_SERVICE_ACCOUNT_B64=<base64 output from step 5>

# Email — delivered by the Trigger Email extension (step 6).
# Both are optional; defaults shown.
MAIL_COLLECTION=mail
EMAIL_FROM=
```

> `REACT_APP_FIREBASE_AUTH_DOMAIN` can remain as the Firebase default domain
> (`your-project.firebaseapp.com`) in both environments. The Google consent
> screen is now driven entirely by the Cloud Console OAuth client — Firebase's
> auth domain is no longer involved in the Google SSO flow.

### Production (Vercel dashboard)

Add all variables above to **Vercel → Project → Settings → Environment
Variables**, with these production overrides:

```bash
REACT_APP_APP_URL=https://blue-line-breakdown.vercel.app
```

Mark `FIREBASE_SERVICE_ACCOUNT_B64` and `GOOGLE_CLIENT_SECRET` as **Sensitive**.
The SMTP credentials live on the extension (configured in step 6), not in Vercel.
Trigger a new deployment after saving.

---

## How Google SSO works (no Firebase involved)

```
User clicks "Continue with Google"
  → Frontend redirects to accounts.google.com with your Client ID
  → Google shows consent screen (your app name, your brand)
  → User approves
  → Google redirects to /api/auth/google/callback?code=...
  → Serverless function exchanges code for Google tokens (using Client Secret)
  → Serverless function finds or creates Firebase user (via Admin SDK)
  → Serverless function issues a Firebase custom token
  → Redirects browser to /auth/google/callback?customToken=...
  → Frontend calls signInWithCustomToken → Firebase session established
```

No `firebaseapp.com` appears anywhere in this flow.

---

## Data model

```
users/{uid}                      (owner-only)
  bookmarks/{entityType}_{id}
  drafts/progress_{season}
  drafts/{autoId}

expansion_drafts/{draftId}       (public read)

auth_tokens/{uuid}               (public read; no client writes)
  { uid, type: 'verify'|'reset', used, expiresAt, createdAt }

mail/{autoId}                    (no client access; Admin SDK + extension only)
  { to, message: { subject, html }, delivery }
```

## Security rules summary

| Path | Read | Write |
| --- | --- | --- |
| `users/{uid}` | owner | owner only |
| `users/{uid}/bookmarks/{id}` | owner | owner only |
| `users/{uid}/drafts/{id}` | owner | owner only |
| `expansion_drafts/{id}` | public | create: verified email + ownership; update: likes only; delete: owner |
| `auth_tokens/{tokenId}` | public | Admin SDK only |
| `mail/{docId}` | none | Admin SDK only (Trigger Email extension) |

---

## Local development

The Google OAuth callback (`/api/auth/google/callback`) is a Vercel serverless
function. The plain CRA dev server (`npm start`) does not serve `api/` — it
serves `index.html` for every unknown path, so Google's redirect lands in React
Router instead of the function.

Use `vercel dev`, which starts both CRA and the serverless functions behind a
single local port:

```bash
cp .env.example .env     # fill in all values
npm install
npx vercel link          # one-time: links the project to your Vercel account
npm run dev              # runs vercel dev → http://localhost:3000
```

`vercel dev` reads `.env` automatically and routes `/api/*` to the functions
while proxying everything else to CRA. The Google redirect URI
`http://localhost:3000/api/auth/google/callback` must be registered in the
Google Cloud Console (step 4b).

> If you only need to work on the UI (no auth flows), `npm start` still works —
> it just can't handle the OAuth callback.

