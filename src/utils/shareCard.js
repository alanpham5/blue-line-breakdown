const DEPLOYED_ORIGIN = "https://blue-line-breakdown.vercel.app";
export const getShareUrl = () =>
  `${DEPLOYED_ORIGIN}${window.location.pathname}${window.location.search}`;
const dataUrlToFile = (dataUrl, fileName) => {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], fileName, {
    type: mime,
  });
};
export const shareImage = async ({ dataUrl, fileName, text }) => {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  const file = dataUrlToFile(dataUrl, `${fileName || "shareable"}.png`);
  const shareData = {
    files: [file],
    text,
    title: fileName,
  };
  if (navigator.canShare && !navigator.canShare(shareData)) return false;
  try {
    await navigator.share(shareData);
    return true;
  } catch (err) {
    if (err && err.name === "AbortError") return true;
    return false;
  }
};
