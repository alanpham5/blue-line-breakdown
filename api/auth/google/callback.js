import { adminAuth } from "../../_lib/admin.js";

const APP_URL = process.env.REACT_APP_APP_URL || "https://blue-line-breakdown.vercel.app";
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(302, `${APP_URL}/auth/google/callback?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(302, `${APP_URL}/auth/google/callback?error=missing_code`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error_description || "Token exchange failed.");
    }

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const { email, name, picture, email_verified } = await userInfoRes.json();

    let uid;
    try {
      const existing = await adminAuth.getUserByEmail(email);
      uid = existing.uid;
      await adminAuth.updateUser(uid, {
        displayName: existing.displayName || name,
        photoURL: existing.photoURL || picture,
        emailVerified: true,
      });
    } catch (lookupErr) {
      if (lookupErr.code === "auth/user-not-found") {
        const created = await adminAuth.createUser({
          email,
          displayName: name,
          photoURL: picture,
          emailVerified: email_verified,
        });
        uid = created.uid;
      } else {
        throw lookupErr;
      }
    }

    const customToken = await adminAuth.createCustomToken(uid);

    const dest = new URL(`${APP_URL}/auth/google/callback`);
    dest.searchParams.set("customToken", customToken);
    if (state) dest.searchParams.set("state", state);
    return res.redirect(302, dest.toString());
  } catch (err) {
    console.error("[google/callback]", err);
    const dest = new URL(`${APP_URL}/auth/google/callback`);
    dest.searchParams.set("error", err.message || "Sign-in failed.");
    if (state) dest.searchParams.set("state", state);
    return res.redirect(302, dest.toString());
  }
}
