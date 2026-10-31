import { describe, it, expect } from "vitest";
import { parseDays, formatCompactDays, formatDayList } from "../src/lib/days";

describe("EWU Day Parser", () => {
  it("parses individual EWU day characters correctly", () => {
    expect(parseDays("S")).toEqual(["SUN"]);
    expect(parseDays("M")).toEqual(["MON"]);
    expect(parseDays("T")).toEqual(["TUE"]);
    expect(parseDays("W")).toEqual(["WED"]);
    expect(parseDays("R")).toEqual(["THU"]);
  });

  it("parses standard EWU two-day combinations", () => {
    expect(parseDays("ST")).toEqual(["SUN", "TUE"]);
    expect(parseDays("MW")).toEqual(["MON", "WED"]);
    expect(parseDays("TR")).toEqual(["TUE", "THU"]);
    expect(parseDays("SW")).toEqual(["SUN", "WED"]);
    expect(parseDays("MR")).toEqual(["MON", "THU"]);
    expect(parseDays("SR")).toEqual(["SUN", "THU"]);
  });

  it("handles lowercase and spaces", () => {
    expect(parseDays("st")).toEqual(["SUN", "TUE"]);
    expect(parseDays(" m w ")).toEqual(["MON", "WED"]);
    expect(parseDays("t-r")).toEqual(["TUE", "THU"]);
  });

  it("handles written day names", () => {
    expect(parseDays("Sunday, Tuesday")).toEqual(["SUN", "TUE"]);
    expect(parseDays("Monday, Wednesday")).toEqual(["MON", "WED"]);
    expect(parseDays("SUN TUE")).toEqual(["SUN", "TUE"]);
  });

  it("formats day arrays back to compact EWU codes and strings", () => {
    expect(formatCompactDays(["SUN", "TUE"])).toBe("ST");
    expect(formatCompactDays(["MON", "WED"])).toBe("MW");
    expect(formatCompactDays(["TUE", "THU"])).toBe("TR");
    expect(formatDayList(["SUN", "TUE"])).toBe("Sun, Tue");
  });
});
