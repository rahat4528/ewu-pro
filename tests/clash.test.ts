import { describe, it, expect } from "vitest";
import { doSectionsClash, computeSectionBitmask, bitmasksClash } from "../src/lib/planner/clash";
import { Section } from "../src/lib/types";

describe("Clash Detection", () => {
  const baseSection: Section = {
    id: "sec-1",
    semester: "Fall 2026",
    courseCode: "CSE110",
    sectionNo: 1,
    faculty: "MAR",
    days: ["SUN", "TUE"],
    rawDays: "ST",
    start: 510, // 08:30
    end: 600,   // 10:00
    type: "THEORY",
  };

  it("detects clash when sections share days and overlap time", () => {
    const overlapping: Section = {
      ...baseSection,
      id: "sec-2",
      courseCode: "CSE207",
      start: 540, // 09:00 - 10:30
      end: 630,
    };

    expect(doSectionsClash(baseSection, overlapping)).toBe(true);
  });

  it("returns false when sections are on different days", () => {
    const differentDay: Section = {
      ...baseSection,
      id: "sec-3",
      courseCode: "CSE207",
      days: ["MON", "WED"],
      rawDays: "MW",
      start: 510,
      end: 600,
    };

    expect(doSectionsClash(baseSection, differentDay)).toBe(false);
  });

  it("returns false when sections are back-to-back on same day (no overlap)", () => {
    const backToBack: Section = {
      ...baseSection,
      id: "sec-4",
      courseCode: "CSE207",
      start: 600, // 10:00 - 11:30
      end: 690,
    };

    expect(doSectionsClash(baseSection, backToBack)).toBe(false);
  });

  it("bitmask clash detection matches standard clash detection", () => {
    const s1 = baseSection;
    const s2: Section = {
      ...baseSection,
      id: "sec-5",
      courseCode: "MAT101",
      start: 580,
      end: 670,
    };
    const s3: Section = {
      ...baseSection,
      id: "sec-6",
      courseCode: "ENG101",
      days: ["MON", "WED"],
      rawDays: "MW",
      start: 580,
      end: 670,
    };

    const mask1 = computeSectionBitmask(s1);
    const mask2 = computeSectionBitmask(s2);
    const mask3 = computeSectionBitmask(s3);

    expect(bitmasksClash(mask1, mask2)).toBe(true);
    expect(doSectionsClash(s1, s2)).toBe(true);

    expect(bitmasksClash(mask1, mask3)).toBe(false);
    expect(doSectionsClash(s1, s3)).toBe(false);
  });
});
