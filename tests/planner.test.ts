import { describe, it, expect } from "vitest";
import { solveTimetables } from "../src/lib/planner/solve";
import { doSectionsClash } from "../src/lib/planner/clash";
import { SEED_SECTIONS_FALL_2026 } from "../src/lib/data/seedData";
import { PlannerPreferences } from "../src/lib/types";

describe("Advising Planner Solver", () => {
  const defaultPrefs: PlannerPreferences = {
    freeDays: [],
    earliestStart: 0,
    latestEnd: 1440,
    preferredFaculty: [],
    avoidedFaculty: [],
    seatsOnly: false,
  };

  it("finds clash-free combinations for 3 sample courses", () => {
    const cse110 = SEED_SECTIONS_FALL_2026.filter((s) => s.courseCode === "CSE110");
    const cse207 = SEED_SECTIONS_FALL_2026.filter((s) => s.courseCode === "CSE207");
    const mat101 = SEED_SECTIONS_FALL_2026.filter((s) => s.courseCode === "MAT101");

    const result = solveTimetables([cse110, cse207, mat101], defaultPrefs, 100);

    expect(result.plans.length).toBeGreaterThan(0);

    // Property-style test: EVERY returned plan must contain zero clashes between any pair of sections
    for (const plan of result.plans) {
      expect(plan.sections.length).toBe(3);
      for (let i = 0; i < plan.sections.length; i++) {
        for (let j = i + 1; j < plan.sections.length; j++) {
          const clash = doSectionsClash(plan.sections[i], plan.sections[j]);
          expect(clash).toBe(false);
        }
      }
    }
  });

  it("scores and ranks preferred faculty higher", () => {
    const cse110 = SEED_SECTIONS_FALL_2026.filter((s) => s.courseCode === "CSE110");
    const cse207 = SEED_SECTIONS_FALL_2026.filter((s) => s.courseCode === "CSE207");

    const prefsWithFaculty: PlannerPreferences = {
      ...defaultPrefs,
      preferredFaculty: ["MAR"], // CSE110 Section 1 faculty
    };

    const result = solveTimetables([cse110, cse207], prefsWithFaculty, 50);
    expect(result.plans.length).toBeGreaterThan(0);

    // Top plan should prioritize the preferred faculty
    const topPlan = result.plans[0];
    const hasMAR = topPlan.sections.some((s) => s.faculty === "MAR");
    expect(hasMAR).toBe(true);
  });

  it("diagnoses conflict pair when courses have 100% clash", () => {
    // Construct 2 single-section courses that clash exactly
    const courseA = [SEED_SECTIONS_FALL_2026[0]]; // CSE110-1 (ST 08:30-10:00)
    const courseB = [{
      ...SEED_SECTIONS_FALL_2026[0],
      id: "CLASH-1",
      courseCode: "CSE999",
      sectionNo: 1,
    }];

    const result = solveTimetables([courseA, courseB], defaultPrefs, 50);
    expect(result.plans.length).toBe(0);
    expect(result.conflictPair).toBeDefined();
    expect(result.conflictPair?.courseA).toBe("CSE110");
    expect(result.conflictPair?.courseB).toBe("CSE999");
  });
});
