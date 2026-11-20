import { playerUtils } from "utils/playerUtils";

const NEUTRAL = { dark: "#f5f5f7", light: "#6e6e73" };
const FALLBACK = { dark: "#64d2ff", light: "#0071e3" };
const LIGHTNESS_RANGE = { dark: [0.56, 0.82], light: [0.26, 0.46] };
const SIMILARITY_THRESHOLD = 22;
const DARK_INK = "#0b0b0d";
const LIGHT_INK = "#ffffff";

const parseHex = (color) => {
  if (typeof color !== "string") return null;
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((char) => char + char)
          .join("")
      : match[1];
  return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
};

const toHex = (rgb) =>
  `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;

const rgbToHsl = ([red, green, blue]) => {
  const [r, g, b] = [red, green, blue].map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, lightness];
  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  const hueSector =
    max === r
      ? (g - b) / delta + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  return [hueSector / 6, saturation, lightness];
};

const hueToChannel = (p, q, t) => {
  const wrapped = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
  if (wrapped < 1 / 6) return p + (q - p) * 6 * wrapped;
  if (wrapped < 1 / 2) return q;
  if (wrapped < 2 / 3) return p + (q - p) * (2 / 3 - wrapped) * 6;
  return p;
};

const hslToRgb = ([hue, saturation, lightness]) => {
  if (saturation === 0)
    return [lightness, lightness, lightness].map((v) => v * 255);
  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  return [hue + 1 / 3, hue, hue - 1 / 3].map(
    (t) => hueToChannel(p, q, t) * 255
  );
};

const readableOn = (theme, color) => {
  const rgb = parseHex(color);
  if (!rgb) return color;
  const [hue, saturation, lightness] = rgbToHsl(rgb);
  const [min, max] = LIGHTNESS_RANGE[theme];
  const clamped = Math.min(max, Math.max(min, lightness));
  return toHex(hslToRgb([hue, saturation, clamped]));
};

const toLinear = (channel) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const labPivot = (value) =>
  value > 216 / 24389 ? Math.cbrt(value) : ((24389 / 27) * value + 16) / 116;

const rgbToLab = (rgb) => {
  const [r, g, b] = rgb.map(toLinear);
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const [fx, fy, fz] = [x, y, z].map(labPivot);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

const colorDistance = (first, second) => {
  const a = parseHex(first);
  const b = parseHex(second);
  if (!a || !b) return Infinity;
  const [labA, labB] = [rgbToLab(a), rgbToLab(b)];
  return Math.hypot(...labA.map((value, axis) => value - labB[axis]));
};

const isSimilar = (first, second) =>
  colorDistance(first, second) < SIMILARITY_THRESHOLD;

const relativeLuminance = (color) => {
  const rgb = parseHex(color);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const rgbChannels = (color) => (parseHex(color) || [128, 128, 128]).join(" ");

const inkFor = (color) =>
  relativeLuminance(color) > 0.4 ? DARK_INK : LIGHT_INK;

const teamAccent = (player, theme) =>
  player
    ? readableOn(
        theme,
        playerUtils.getTeamColor(player.team, player.season, theme)
      )
    : null;

const secondAccent = (leftPlayer, rightPlayer, first, theme) => {
  const own = teamAccent(rightPlayer, theme);
  if (!own || !first) return own || NEUTRAL[theme];
  const sameTeam = leftPlayer.team === rightPlayer.team;
  if (!sameTeam && !isSimilar(own, first)) return own;
  return isSimilar(NEUTRAL[theme], first) ? FALLBACK[theme] : NEUTRAL[theme];
};

export const buildSubjectPalette = (leftPlayer, rightPlayer, theme) => {
  const first = teamAccent(leftPlayer, theme);
  const second = secondAccent(leftPlayer, rightPlayer, first, theme);
  const colors = [first || NEUTRAL[theme], second];
  return {
    "--subject-0": colors[0],
    "--subject-1": colors[1],
    "--subject-ink-0": inkFor(colors[0]),
    "--subject-ink-1": inkFor(colors[1]),
    "--subject-rgb-0": rgbChannels(colors[0]),
    "--subject-rgb-1": rgbChannels(colors[1]),
  };
};
