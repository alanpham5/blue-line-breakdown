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
import { auth, googleProvider } from "lib/firebase/config";
export const ACCOUNT_EXISTS_CODE =
  "auth/account-exists-with-different-credential";
export const signUpWithEmail = async (email, password, displayName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(user, {
      displayName,
    });
  }
  await sendEmailVerification(user);
  return user;
};
export const signInWithEmail = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};
export const resendVerification = async () => {
  if (!auth.currentUser) throw new Error("No authenticated user.");
  await sendEmailVerification(auth.currentUser);
};
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/`,
  });
};
export const updateDisplayName = async (displayName) => {
  if (!auth.currentUser) throw new Error("No authenticated user.");
  await updateProfile(auth.currentUser, {
    displayName: displayName || null,
  });
  return auth.currentUser;
};
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
export const completeGoogleLink = async (email, password, pendingCred) => {
  const user = await signInWithEmail(email, password);
  if (pendingCred) {
    await linkWithCredential(user, pendingCred);
  }
  return user;
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
