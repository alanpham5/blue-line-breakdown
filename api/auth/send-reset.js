import { adminAuth } from "../_lib/admin.js";
import { createToken } from "../_lib/token.js";
import { sendEmail } from "../_lib/email.js";
import { renderAuthEmail } from "../_lib/email-layout.js";

const APP_URL =
  process.env.REACT_APP_APP_URL || "https://blue-line-breakdown.vercel.app";

function resetEmailHtml({ displayName, resetUrl }) {
  const name = displayName || "there";
  return renderAuthEmail({
    preheader: "Reset your Blue Line Breakdown password.",
    subtitle: "Profiling NHL Players, Teams, and More",
    heading: `Hey ${name}, reset your password`,
    intro:
      "Click the button below to choose a new password. The link expires in 1 hour and can only be used once.",
    buttonLabel: "Reset my password",
    buttonUrl: resetUrl,
    footnote:
      "If you didn't request this, you can safely ignore this email — your password won't change.",
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email is required." });

  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    const token = await createToken(userRecord.uid, "reset");
    const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset your Blue Line Breakdown password",
      html: resetEmailHtml({ displayName: userRecord.displayName, resetUrl }),
    });
  } catch (err) {
    if (err?.code !== "auth/user-not-found") {
      console.error("[send-reset]", err);
    }
  }

  return res.status(200).json({ ok: true });
}
