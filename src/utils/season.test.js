import { currentSeasonStart, seasonRange } from "utils/season";

describe("season cutoff", () => {
  it("keeps last season current until October 20", () => {
    expect(currentSeasonStart(new Date(2026, 9, 19))).toBe(2025);
    expect(seasonRange(new Date(2026, 9, 19)).at(-1)).toBe(2025);
  });

  it("opens the new season on October 20", () => {
    expect(currentSeasonStart(new Date(2026, 9, 20))).toBe(2026);
    expect(currentSeasonStart(new Date(2026, 11, 1))).toBe(2026);
    expect(seasonRange(new Date(2026, 9, 20)).at(-1)).toBe(2026);
  });

  it("keeps the season current through the following September", () => {
    expect(currentSeasonStart(new Date(2027, 8, 30))).toBe(2026);
  });
});
