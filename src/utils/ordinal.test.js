import { getOrdinal } from "utils/ordinal";

describe("getOrdinal", () => {
  it.each([
    [0, "0th"],
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [4, "4th"],
    [11, "11th"],
    [12, "12th"],
    [13, "13th"],
    [21, "21st"],
    [22, "22nd"],
    [23, "23rd"],
    [100, "100th"],
    [101, "101st"],
  ])("formats %s as %s", (value, expected) => {
    expect(getOrdinal(value)).toBe(expected);
  });

  it("rounds to the nearest whole number first", () => {
    expect(getOrdinal(11.4)).toBe("11th");
    expect(getOrdinal(97.6)).toBe("98th");
    expect(getOrdinal(0.6)).toBe("1st");
  });
});
