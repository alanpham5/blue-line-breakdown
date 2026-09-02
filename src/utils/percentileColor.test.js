import { getPercentileColor, getPercentileHue } from "./percentileColor";

describe("percentileColor", () => {
  it("maps percentiles across the red-to-green hue range", () => {
    expect(getPercentileHue(0)).toBe(0);
    expect(getPercentileHue(50)).toBe(60);
    expect(getPercentileHue(100)).toBe(120);
  });

  it("clamps out-of-range values", () => {
    expect(getPercentileHue(-10)).toBe(0);
    expect(getPercentileHue(120)).toBe(120);
  });

  it("returns an export-safe color and ignores invalid values", () => {
    expect(getPercentileColor(75)).toBe("hsl(90, 85%, 60%)");
    expect(getPercentileColor(null)).toBeUndefined();
    expect(getPercentileColor("invalid")).toBeUndefined();
  });
});
