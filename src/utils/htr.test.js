import {
  hasHtrGameOn,
  isHtrActive,
  isHtrSeason,
  setHtrOverride,
} from "utils/htr";

describe("hasHtrGameOn", () => {
  it("matches a team's scheduled HTR date", () => {
    expect(hasHtrGameOn("ANA", new Date(2026, 10, 8))).toBe(true);
    expect(hasHtrGameOn("pit", new Date(2027, 3, 1))).toBe(true);
  });

  it("ignores other dates and other teams", () => {
    expect(hasHtrGameOn("ANA", new Date(2026, 10, 9))).toBe(false);
    expect(hasHtrGameOn("TOR", new Date(2026, 10, 11))).toBe(false);
    expect(hasHtrGameOn("XYZ", new Date(2026, 10, 8))).toBe(false);
  });
});

describe("isHtrActive", () => {
  afterEach(() => {
    setHtrOverride(null);
    jest.useRealTimers();
  });

  it("follows the schedule for the HTR season", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 11, 22, 19));
    expect(isHtrActive("BOS", 2026)).toBe(true);
    expect(isHtrActive("NYI", "2026")).toBe(true);
    expect(isHtrActive("TOR", 2026)).toBe(false);
    expect(isHtrActive("BOS", 2025)).toBe(false);
  });

  it("lets the remix override force logos on or off", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 11, 22, 19));
    setHtrOverride(true);
    expect(isHtrActive("TOR", 2026)).toBe(true);
    setHtrOverride(false);
    expect(isHtrActive("BOS", 2026)).toBe(false);
    expect(isHtrSeason(2026)).toBe(true);
  });
});
