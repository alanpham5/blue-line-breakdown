import { adminAuth } from "../_lib/admin.js";
import { createToken } from "../_lib/token.js";
import { sendEmail } from "../_lib/email.js";
import { renderAuthEmail } from "../_lib/email-layout.js";

const APP_URL =
  process.env.REACT_APP_APP_URL || "https://blue-line-breakdown.vercel.app";

function verificationEmailHtml({ displayName, verifyUrl }) {
  const name = displayName || "there";
  return renderAuthEmail({
    preheader: "Confirm your email to unlock leaderboard posting.",
    subtitle: "NHL Players, Teams, and More",
    heading: `Hey ${name}, verify your email`,
    intro:
      "Click the button below to confirm your address and unlock leaderboard posting. The link expires in 1 hour.",
    buttonLabel: "Verify my email",
    buttonUrl: verifyUrl,
    footnote:
      "If you didn't create an account, you can safely ignore this email.",
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { uid } = req.body || {};
  if (!uid) return res.status(400).json({ error: "uid is required." });

  try {
    const userRecord = await adminAuth.getUser(uid);
    if (userRecord.emailVerified) {
      return res.status(200).json({ ok: true, alreadyVerified: true });
    }

    const token = await createToken(uid, "verify");
    const verifyUrl = `${APP_URL}/auth/verify-email?token=${token}`;

    await sendEmail({
      to: userRecord.email,
      subject: "Verify your Blue Line Breakdown email",
      html: verificationEmailHtml({
        displayName: userRecord.displayName,
        verifyUrl,
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[send-verification]", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to send verification email." });
  }
}
