import { PlannerPreferences, Section, TimetablePlan } from "../types";
import { computeSectionBitmask, SectionBitmask, bitmasksClash, doSectionsClash } from "./clash";
import { evaluatePlanMetrics, scorePlan } from "./score";

export interface SolveResult {
  plans: TimetablePlan[];
  totalCombinationsSearched: number;
  conflictPair?: { courseA: string; courseB: string; count: number };
  message?: string;
}

interface SectionWithMask {
  section: Section;
  mask: SectionBitmask;
}

export function solveTimetables(
  coursesSections: Section[][],
  preferences: PlannerPreferences,
  limit: number = 200
): SolveResult {
  if (!coursesSections || coursesSections.length === 0) {
    return { plans: [], totalCombinationsSearched: 0, message: "No courses provided." };
  }

  // Pre-filter sections if seatsOnly is specified
  const filteredCourses: Section[][] = coursesSections.map((secList) => {
    if (preferences.seatsOnly) {
      const withSeats = secList.filter((s) => s.seats === undefined || s.seats > 0);
      return withSeats.length > 0 ? withSeats : secList; // fallback if no section has seats
    }
    return secList;
  });

  // Check if any course has 0 sections
  const emptyCourseIdx = filteredCourses.findIndex((list) => list.length === 0);
  if (emptyCourseIdx !== -1) {
    return {
      plans: [],
      totalCombinationsSearched: 0,
      message: `Course at index ${emptyCourseIdx + 1} has no available sections.`,
    };
  }

  // Prepare with bitmasks
  const preparedCourses: SectionWithMask[][] = filteredCourses.map((list) =>
    list.map((section) => ({
      section,
      mask: computeSectionBitmask(section),
    }))
  );

  // Heuristic: sort courses by fewest sections first to fail early in backtracking
  // Keep track of original order indices if needed
  const indexed = preparedCourses.map((list, originalIdx) => ({ list, originalIdx }));
  indexed.sort((a, b) => a.list.length - b.list.length);

  const sortedCourses = indexed.map((item) => item.list);

  const rawSolutions: Section[][] = [];
  const picked: SectionWithMask[] = [];
  let combinationsExplored = 0;

  function backtrack(depth: number) {
    if (rawSolutions.length >= limit) return;

    if (depth === sortedCourses.length) {
      // Found clash-free combination!
      rawSolutions.push(picked.map((p) => p.section));
      return;
    }

    const currentCourseSections = sortedCourses[depth];
    for (const item of currentCourseSections) {
      combinationsExplored++;

      // Check clash against all previously picked sections
      let clash = false;
      for (const p of picked) {
        if (bitmasksClash(p.mask, item.mask)) {
          clash = true;
          break;
        }
      }

      if (!clash) {
        picked.push(item);
        backtrack(depth + 1);
        picked.pop();
        if (rawSolutions.length >= limit) return;
      }
    }
  }

  backtrack(0);

  // If no clash-free solution found, diagnose the most frequent conflict
  let conflictPair: { courseA: string; courseB: string; count: number } | undefined;
  if (rawSolutions.length === 0 && coursesSections.length > 1) {
    const pairClashes = new Map<string, number>();

    for (let i = 0; i < coursesSections.length; i++) {
      for (let j = i + 1; j < coursesSections.length; j++) {
        const listA = coursesSections[i];
        const listB = coursesSections[j];
        let clashCount = 0;

        for (const sa of listA) {
          for (const sb of listB) {
            if (doSectionsClash(sa, sb)) {
              clashCount++;
            }
          }
        }

        const totalPairCombos = listA.length * listB.length;
        if (totalPairCombos > 0) {
          const clashRate = clashCount / totalPairCombos;
          const key = `${listA[0]?.courseCode || `Course ${i + 1}`} vs ${listB[0]?.courseCode || `Course ${j + 1}`}`;
          pairClashes.set(key, (pairClashes.get(key) || 0) + clashRate);
        }
      }
    }

    let worstKey = "";
    let highestRate = -1;
    for (const [k, v] of pairClashes.entries()) {
      if (v > highestRate) {
        highestRate = v;
        worstKey = k;
      }
    }

    if (worstKey) {
      const [cA, cB] = worstKey.split(" vs ");
      conflictPair = {
        courseA: cA,
        courseB: cB,
        count: Math.round(highestRate * 100),
      };
    }
  }

  // Score and rank all solutions
  const plans: TimetablePlan[] = rawSolutions.map((secs, idx) => {
    const metrics = evaluatePlanMetrics(secs, preferences);
    const score = scorePlan(metrics, preferences);
    return {
      id: `plan-${idx + 1}-${Date.now()}`,
      sections: secs,
      score,
      metrics,
    };
  });

  // Sort descending by score
  plans.sort((a, b) => b.score - a.score);

  return {
    plans,
    totalCombinationsSearched: combinationsExplored,
    conflictPair,
    message:
      plans.length > 0
        ? `Found ${plans.length} clash-free combination${plans.length === 1 ? "" : "s"}.`
        : conflictPair
        ? `No clash-free combination found. ${conflictPair.courseA} and ${conflictPair.courseB} clash heavily.`
        : "No clash-free combination found.",
  };
}
