const COLORS = {
  bg: "#020202",
  card: "#1c1c1e",
  border: "rgba(255,255,255,0.08)",
  textPrimary: "#f5f5f7",
  textSecondary: "#b9bcc6",
  textTertiary: "#787b84",
  accent: "#58a6ff",
  btnBg: "#7ee340",
  btnText: "#08260c",
};

export function renderAuthEmail({
  preheader,
  subtitle = "Profiling NHL Players, Teams, and More",
  heading,
  intro,
  buttonLabel,
  buttonUrl,
  footnote,
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLORS.bg};">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${COLORS.card};border-radius:28px;border:1px solid ${COLORS.border};box-shadow:0 12px 34px rgba(0,0,0,0.28);">
        <tr><td style="padding:40px 36px;">
          <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:${COLORS.textPrimary};letter-spacing:-0.02em;">Blue Line Breakdown</p>
          <p style="margin:0 0 20px;font-size:14px;color:${COLORS.textTertiary};">${subtitle}</p>
          <div style="height:3px;width:56px;border-radius:9999px;background:${COLORS.accent};margin:0 0 28px;"></div>
          <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:${COLORS.textPrimary};letter-spacing:-0.01em;">${heading}</p>
          <p style="margin:0 0 28px;font-size:14px;color:${COLORS.textSecondary};line-height:1.6;">${intro}</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:9999px;background:${COLORS.btnBg};">
            <a href="${buttonUrl}" style="display:inline-block;background:${COLORS.btnBg};color:${COLORS.btnText};text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:9999px;">${buttonLabel}</a>
          </td></tr></table>
          <p style="margin:28px 0 0;font-size:12px;color:${COLORS.textTertiary};line-height:1.6;">${footnote}<br>Or copy this link: <span style="color:${COLORS.accent};word-break:break-all;">${buttonUrl}</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
