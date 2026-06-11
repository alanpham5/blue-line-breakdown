// Native Web Share API (Level 2) helper for sharing a generated card image.
// Uses navigator.share directly rather than a wrapper package. Works in any
// secure context — including http://localhost, which browsers treat as secure —
// so it functions in local dev as well as production.

const DEPLOYED_ORIGIN = "https://blue-line-breakdown.vercel.app";

// Canonical deployed URL for the current view, preserving the query params that
// drive what's shown (player/team/season/...).
export const getShareUrl = () =>
  `${DEPLOYED_ORIGIN}${window.location.pathname}${window.location.search}`;

const dataUrlToFile = (dataUrl, fileName) => {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], fileName, { type: mime });
};

// Hands the image + page URL to the native share sheet.
// Returns true when the share sheet handled it (including the user cancelling),
// false when sharing isn't available so the caller can fall back to a download.
export const shareImage = async ({ dataUrl, fileName, text }) => {
  if (typeof navigator === "undefined" || !navigator.share) return false;

  const file = dataUrlToFile(dataUrl, `${fileName || "shareable"}.png`);
  const shareData = { files: [file], text, title: fileName };

  // canShare gates on whether this device can actually share files.
  if (navigator.canShare && !navigator.canShare(shareData)) return false;

  try {
    await navigator.share(shareData);
    return true;
  } catch (err) {
    // AbortError = user dismissed the sheet; treat as handled (no fallback).
    if (err && err.name === "AbortError") return true;
    return false;
  }
};
