// Firebase initialization (modular SDK v10).
//
// All configuration is sourced from REACT_APP_FIREBASE_* environment variables
// (mirrors the existing REACT_APP_API_URL convention in apiService.js). See
// SETUP.md for how to create the Firebase project and populate these values.
//
// A single app/auth/db instance is shared across the application. Importing
// `auth` or `db` from here guarantees the app is initialized exactly once.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// True only when the minimum required keys are present. Lets the UI degrade
// gracefully (show a "configure Firebase" notice) instead of throwing on boot
// in an environment where keys haven't been wired up yet.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// Guard against re-initialization during CRA fast-refresh / hot reloads.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Shared Google provider. `prompt: "select_account"` forces the account
// chooser every time rather than silently reusing the last Google session.
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;
