// Firebase Authentication utility module (modular SDK v10).
//
// Centralizes every auth interaction the app needs: email/password sign-up and
// sign-in, Google SSO, the account-linking edge case, password reset, email
// verification, sign-out, the auth-state observer, and friendly error mapping.
//
// UI components should call these helpers rather than importing firebase/auth
// directly, so the linking + error-handling logic lives in exactly one place.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  linkWithCredential,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth, googleProvider } from "./config";

// Sentinel thrown when Google SSO collides with an existing email/password
// account. The UI catches this, asks the user for their original password, and
// calls `completeGoogleLink` to merge the credentials.
export const ACCOUNT_EXISTS_CODE =
  "auth/account-exists-with-different-credential";

// ---------------------------------------------------------------------------
// Email / password
// ---------------------------------------------------------------------------

// Registers a new email/password user and immediately fires the verification
// email (spec: token-based verification on standard registration). An optional
// display name is written to the profile so the avatar can show initials.
export const signUpWithEmail = async (email, password, displayName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(user, { displayName });
  }
  await sendEmailVerification(user);
  return user;
};

export const signInWithEmail = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

// Re-sends the verification email for the currently signed-in user.
export const resendVerification = async () => {
  if (!auth.currentUser) throw new Error("No authenticated user.");
  await sendEmailVerification(auth.currentUser);
};

// Routes the user to Firebase's password-reset email flow. The continue URL is
// the app origin so the recovery interface returns here when done.
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/`,
  });
};

// Updates the signed-in user's profile display name.
export const updateDisplayName = async (displayName) => {
  if (!auth.currentUser) throw new Error("No authenticated user.");
  await updateProfile(auth.currentUser, { displayName: displayName || null });
  return auth.currentUser;
};

// ---------------------------------------------------------------------------
// Google SSO + account linking
// ---------------------------------------------------------------------------

// Attempts Google sign-in. On the `account-exists-with-different-credential`
// error we DON'T silently fail: we extract the pending Google credential, look
// up which providers the email already uses, and rethrow an enriched error the
// UI uses to drive the linking prompt.
export const signInWithGoogle = async () => {
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    return user;
  } catch (error) {
    if (error?.code === ACCOUNT_EXISTS_CODE) {
      const pendingCred = GoogleAuthProvider.credentialFromError(error);
      const email = error.customData?.email;
      let methods = [];
      try {
        methods = email ? await fetchSignInMethodsForEmail(auth, email) : [];
      } catch {
        methods = [];
      }
      const linkError = new Error(
        "An account already exists with this email. Sign in with your original method to link Google."
      );
      linkError.code = ACCOUNT_EXISTS_CODE;
      linkError.pendingCred = pendingCred;
      linkError.email = email;
      linkError.methods = methods;
      throw linkError;
    }
    throw error;
  }
};

// Second half of the linking flow: the user has just proven ownership of the
// existing email/password account, so we attach the pending Google credential
// to it. After this, either provider signs into the same single user context.
export const completeGoogleLink = async (email, password, pendingCred) => {
  const user = await signInWithEmail(email, password);
  if (pendingCred) {
    await linkWithCredential(user, pendingCred);
  }
  return user;
};

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export const logOut = () => signOut(auth);

// Thin wrapper over onAuthStateChanged so providers don't import config + the
// SDK separately. Returns the unsubscribe function.
export const observeAuth = (callback) => onAuthStateChanged(auth, callback);

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

// Translates raw Firebase auth error codes into copy safe to show users.
const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "That email address looks invalid.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account already exists with that email.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in popup. Allow popups and try again.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
  [ACCOUNT_EXISTS_CODE]:
    "An account already exists with this email. Sign in with your original method to link Google.",
};

export const mapAuthError = (error) =>
  AUTH_ERROR_MESSAGES[error?.code] ||
  error?.message ||
  "Something went wrong. Please try again.";
