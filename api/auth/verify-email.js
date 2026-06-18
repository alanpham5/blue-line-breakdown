import { adminAuth } from "../_lib/admin.js";
import { consumeToken, TokenError } from "../_lib/token.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "token is required." });

  try {
    const uid = await consumeToken(token, "verify");
    await adminAuth.updateUser(uid, { emailVerified: true });
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof TokenError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("[verify-email]", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
