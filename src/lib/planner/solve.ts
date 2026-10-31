import { PlannerPreferences, Section, TimetablePlan } from "../types";
import { computeSectionBitmask, SectionBitmask, bitmasksClash, doSectionsClash } from "./clash";
import { evaluatePlanMetrics, scorePlan } from "./score";

export interface SolveResult {
  plans: TimetablePlan[];
  totalCombinationsSearched: number;
  conflictPair?: { courseA: string; courseB: string; count: number };
  message?: string;
}

interface SectionUnit {
  primarySection: Section;
  companionSection?: Section;
  masks: SectionBitmask[];
}

export function solveTimetables(
  coursesSections: Section[][],
  preferences: PlannerPreferences,
  limit: number = 200,
  allAvailableSections?: Section[]
): SolveResult {
  if (!coursesSections || coursesSections.length === 0) {
    return { plans: [], totalCombinationsSearched: 0, message: "No courses provided." };
  }

  // Quick lookup map for linked companion sections (e.g. Theory <-> Lab)
  const sectionById = new Map<string, Section>();
  if (allAvailableSections) {
    for (const s of allAvailableSections) {
      sectionById.set(s.id, s);
    }
  } else {
    for (const list of coursesSections) {
      for (const s of list) {
        sectionById.set(s.id, s);
      }
    }
  }

  // Pre-filter sections if seatsOnly is specified
  const filteredCourses: Section[][] = coursesSections.map((secList) => {
    if (preferences.seatsOnly) {
      const withSeats = secList.filter((s) => s.seats === undefined || s.seats > 0);
      return withSeats.length > 0 ? withSeats : secList;
    }
    return secList;
  });

  const emptyCourseIdx = filteredCourses.findIndex((list) => list.length === 0);
  if (emptyCourseIdx !== -1) {
    return {
      plans: [],
      totalCombinationsSearched: 0,
      message: `Course at index ${emptyCourseIdx + 1} has no available sections.`,
    };
  }

  // Build units (including linked companion lab/theory sections if present)
  const preparedUnits: SectionUnit[][] = filteredCourses.map((list) =>
    list.map((section) => {
      const companion = section.linkedTo ? sectionById.get(section.linkedTo) : undefined;
      const masks: SectionBitmask[] = [computeSectionBitmask(section)];
      if (companion) {
        masks.push(computeSectionBitmask(companion));
      }
      return {
        primarySection: section,
        companionSection: companion,
        masks,
      };
    })
  );

  // Heuristic: sort courses by fewest candidate units first to prune early
  const indexed = preparedUnits.map((list) => ({ list, count: list.length }));
  indexed.sort((a, b) => a.count - b.count);
  const sortedCourses = indexed.map((item) => item.list);

  const rawSolutions: Section[][] = [];
  const pickedUnits: SectionUnit[] = [];
  let combinationsExplored = 0;

  function backtrack(depth: number) {
    if (rawSolutions.length >= limit) return;

    if (depth === sortedCourses.length) {
      // Collect all sections (both primary and bundled companion sections)
      const fullPlanSections: Section[] = [];
      for (const unit of pickedUnits) {
        fullPlanSections.push(unit.primarySection);
        if (unit.companionSection) {
          fullPlanSections.push(unit.companionSection);
        }
      }
      rawSolutions.push(fullPlanSections);
      return;
    }

    const currentCourseUnits = sortedCourses[depth];
    for (const unit of currentCourseUnits) {
      combinationsExplored++;

      // Check if ANY mask in this unit clashes with ANY mask in previously picked units
      let clash = false;
      for (const picked of pickedUnits) {
        for (const pMask of picked.masks) {
          for (const uMask of unit.masks) {
            if (bitmasksClash(pMask, uMask)) {
              clash = true;
              break;
            }
          }
          if (clash) break;
        }
        if (clash) break;
      }

      if (!clash) {
        pickedUnits.push(unit);
        backtrack(depth + 1);
        pickedUnits.pop();
        if (rawSolutions.length >= limit) return;
      }
    }
  }

  backtrack(0);

  // If 0 clash-free combinations found, diagnose conflict
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
