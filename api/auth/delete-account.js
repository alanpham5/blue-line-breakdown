import { adminAuth, adminDb } from "../_lib/admin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { idToken } = req.body || {};
  if (!idToken) return res.status(400).json({ error: "idToken is required." });

  let uid;
  try {
    ({ uid } = await adminAuth.verifyIdToken(idToken));
  } catch {
    return res.status(401).json({ error: "Not authenticated." });
  }

  try {
    const ownedDrafts = await adminDb
      .collection("expansion_drafts")
      .where("ownerId", "==", uid)
      .get();
    await Promise.all(ownedDrafts.docs.map((doc) => doc.ref.delete()));

    await adminDb.recursiveDelete(adminDb.collection("users").doc(uid));

    await adminAuth.deleteUser(uid);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[delete-account]", err);
    return res.status(500).json({ error: "Couldn't delete your account. Please try again." });
  }
}
