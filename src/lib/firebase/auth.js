import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "lib/firebase/config";

const APP_URL = process.env.REACT_APP_APP_URL || window.location.origin;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const apiPost = (path, body) =>
  fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.error || "Request failed.");
    return json;
  });

export const initiateGoogleOAuth = () => {
  const state = crypto.randomUUID();
  sessionStorage.setItem("oauth_state", state);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

export const completeGoogleOAuth = async (customToken) => {
  const { user } = await signInWithCustomToken(auth, customToken);
  return user;
};

export const signUpWithEmail = async (email, password, displayName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(user, { displayName });
  await apiPost("/api/auth/send-verification", { uid: user.uid });
  return user;
};

export const signInWithEmail = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

export const resendVerification = async () => {
  if (!auth.currentUser) throw new Error("No authenticated user.");
  await apiPost("/api/auth/send-verification", { uid: auth.currentUser.uid });
};

export const resetPassword = async (email) => {
  await apiPost("/api/auth/send-reset", { email });
};

export const updateDisplayName = async (displayName) => {
  if (!auth.currentUser) throw new Error("No authenticated user.");
  await updateProfile(auth.currentUser, { displayName: displayName || null });
  return auth.currentUser;
};

export const deleteAccount = async () => {
  if (!auth.currentUser) throw new Error("No authenticated user.");
  const idToken = await auth.currentUser.getIdToken();
  await apiPost("/api/auth/delete-account", { idToken });
  await signOut(auth);
};

export const logOut = () => signOut(auth);
export const observeAuth = (callback) => onAuthStateChanged(auth, callback);

const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "That email address looks invalid.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account already exists with that email.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

export const mapAuthError = (error) =>
  AUTH_ERROR_MESSAGES[error?.code] ||
  error?.message ||
  "Something went wrong. Please try again.";
