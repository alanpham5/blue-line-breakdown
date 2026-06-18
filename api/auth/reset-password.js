import { adminAuth } from "../../_lib/admin.js";
import { consumeToken, TokenError } from "../../_lib/token.js";

const MIN_PASSWORD_LENGTH = 6;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { token, newPassword } = req.body || {};
  if (!token) return res.status(400).json({ error: "token is required." });
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }

  try {
    const uid = await consumeToken(token, "reset");
    await adminAuth.updateUser(uid, { password: newPassword });
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof TokenError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("[reset-password]", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
