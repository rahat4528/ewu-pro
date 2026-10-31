import { describe, it, expect } from "vitest";
import { validateAndNormalizeRow } from "../src/lib/schemas/section";

describe("Admin Import Pipeline Validation", () => {
  it("successfully validates and normalizes a clean row", () => {
    const raw = {
      courseCode: "CSE110",
      courseTitle: "Programming Language I",
      sectionNo: "1",
      faculty: "MAR",
      days: "ST",
      time: "08:30-10:00",
      room: "AB3-401",
      seats: "25",
    };

    const res = validateAndNormalizeRow(raw, "Fall 2026", 1);
    expect(res.valid).toBe(true);
    expect(res.section).toBeDefined();
    expect(res.section?.courseCode).toBe("CSE110");
    expect(res.section?.days).toEqual(["SUN", "TUE"]);
    expect(res.section?.start).toBe(510);
    expect(res.section?.end).toBe(600);
    expect(res.section?.seats).toBe(25);
  });

  it("normalizes flexible header column names", () => {
    const flexibleRaw = {
      "Course": "cse207",
      "Section": "2",
      "Instructor": "TSH",
      "Days": "MW",
      "Start Time": "10:10",
      "End Time": "11:40",
      "Classroom": "AB3-501",
      "Available Seats": "10",
    };

    const res = validateAndNormalizeRow(flexibleRaw, "Fall 2026", 2);
    expect(res.valid).toBe(true);
    expect(res.section?.courseCode).toBe("CSE207");
    expect(res.section?.sectionNo).toBe(2);
    expect(res.section?.faculty).toBe("TSH");
    expect(res.section?.days).toEqual(["MON", "WED"]);
  });

  it("rejects invalid day codes", () => {
    const invalidDay = {
      courseCode: "CSE110",
      sectionNo: "1",
      days: "XYZ", // Invalid
      time: "08:30-10:00",
    };

    const res = validateAndNormalizeRow(invalidDay, "Fall 2026", 3);
    expect(res.valid).toBe(false);
    expect(res.errors).toBeDefined();
    expect(res.errors?.[0]).toContain("Invalid day code");
  });

  it("rejects start time >= end time", () => {
    const invalidTime = {
      courseCode: "CSE110",
      sectionNo: "1",
      days: "ST",
      time: "11:00-09:00", // Start after end
    };

    const res = validateAndNormalizeRow(invalidTime, "Fall 2026", 4);
    expect(res.valid).toBe(false);
    expect(res.errors?.[0]).toContain("Start time");
  });
});
