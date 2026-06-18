import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8")
);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
