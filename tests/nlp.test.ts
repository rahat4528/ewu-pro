import { describe, it, expect } from "vitest";
import { parseNaturalLanguagePreferences } from "../src/lib/planner/nlp";

describe("Natural Language Preference Parser", () => {
  it("extracts free days off from natural queries", () => {
    const res = parseNaturalLanguagePreferences("no Sunday classes and avoid Thursday");
    expect(res.preferences.freeDays).toContain("SUN");
    expect(res.preferences.freeDays).toContain("THU");
    expect(res.appliedTags.length).toBeGreaterThanOrEqual(2);
  });

  it("extracts afternoon timing constraint", () => {
    const res = parseNaturalLanguagePreferences("afternoons only please");
    expect(res.preferences.earliestStart).toBe(720);
    expect(res.appliedTags).toContain("Earliest Start: 12:00 PM");
  });

  it("extracts morning timing constraint", () => {
    const res = parseNaturalLanguagePreferences("mornings only, finish early");
    expect(res.preferences.latestEnd).toBe(800);
    expect(res.appliedTags).toContain("Latest Finish: 01:20 PM");
  });

  it("extracts preferred and avoided faculty", () => {
    const res = parseNaturalLanguagePreferences("prefer MAR and avoid TBA");
    expect(res.preferences.preferredFaculty).toContain("MAR");
    expect(res.preferences.avoidedFaculty).toContain("TBA");
  });

  it("extracts open seats constraint", () => {
    const res = parseNaturalLanguagePreferences("only sections with open seats");
    expect(res.preferences.seatsOnly).toBe(true);
  });
});
