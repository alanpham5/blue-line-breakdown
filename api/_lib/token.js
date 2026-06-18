import { randomUUID } from "crypto";
import { adminDb } from "./admin.js";
import { Timestamp } from "firebase-admin/firestore";

const TOKENS_COLLECTION = "auth_tokens";
const TTL_MS = 60 * 60 * 1000;

export async function createToken(uid, type) {
  const token = randomUUID();
  const expiresAt = Timestamp.fromMillis(Date.now() + TTL_MS);
  await adminDb.collection(TOKENS_COLLECTION).doc(token).set({
    uid,
    type,
    used: false,
    expiresAt,
    createdAt: Timestamp.now(),
  });
  return token;
}

export async function consumeToken(token, expectedType) {
  const ref = adminDb.collection(TOKENS_COLLECTION).doc(token);
  const snap = await ref.get();
  if (!snap.exists) throw new TokenError("Invalid or expired link.");
  const data = snap.data();
  if (data.type !== expectedType) throw new TokenError("Invalid or expired link.");
  if (data.used) throw new TokenError("This link has already been used.");
  if (data.expiresAt.toMillis() < Date.now()) throw new TokenError("This link has expired. Please request a new one.");
  await ref.update({ used: true });
  return data.uid;
}

export class TokenError extends Error {
  constructor(message) {
    super(message);
    this.name = "TokenError";
  }
}
