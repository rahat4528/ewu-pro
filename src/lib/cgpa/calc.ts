import { GradeRecord } from "../types";
import { getGradePoint } from "./scale";

export interface CGPACalculationResult {
  gpa: number;
  totalCredits: number;
  totalGradePoints: number;
  earnedCredits: number; // credits where grade != F and not non-GPA
}

/**
 * Calculates GPA for a list of courses in a single semester.
 */
export function calculateSemesterGPA(courses: Array<{ credits: number; grade: string }>): CGPACalculationResult {
  let totalCredits = 0;
  let totalGradePoints = 0;
  let earnedCredits = 0;

  for (const course of courses) {
    const pt = getGradePoint(course.grade);
    if (pt === null) {
      // W, I, etc. are excluded
      continue;
    }
    const credits = Number(course.credits);
    if (isNaN(credits) || credits <= 0) continue;

    totalCredits += credits;
    totalGradePoints += pt * credits;
    if (pt > 0) {
      earnedCredits += credits;
    }
  }

  const gpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;

  return {
    gpa,
    totalCredits,
    totalGradePoints: Number(totalGradePoints.toFixed(2)),
    earnedCredits,
  };
}

/**
 * Combines previous CGPA & credits with newly completed courses.
 */
export function calculateCumulativeCGPA(
  previousCredits: number,
  previousCGPA: number,
  newCourses: Array<{ credits: number; grade: string }>
): CGPACalculationResult {
  const prevCred = Math.max(0, Number(previousCredits) || 0);
  const prevGpa = Math.max(0, Number(previousCGPA) || 0);
  let totalCredits = prevCred;
  let totalGradePoints = prevCred * prevGpa;
  let earnedCredits = prevCred;

  for (const course of newCourses) {
    const pt = getGradePoint(course.grade);
    if (pt === null) continue;
    const credits = Number(course.credits);
    if (isNaN(credits) || credits <= 0) continue;

    totalCredits += credits;
    totalGradePoints += pt * credits;
    if (pt > 0) {
      earnedCredits += credits;
    }
  }

  const gpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;

  return {
    gpa,
    totalCredits,
    totalGradePoints: Number(totalGradePoints.toFixed(2)),
    earnedCredits,
  };
}

/**
 * Calculates CGPA across historical grade records.
 * For EWU policy, the newer attempt replaces the older attempt if retakePolicy === 'latest'.
 */
export function calculateHistoricalCGPA(
  records: GradeRecord[],
  retakePolicy: "latest" | "best" = "latest"
): CGPACalculationResult {
  // Map courseCode -> GradeRecord
  // Records are assumed chronological or ordered
  const effectiveMap = new Map<string, { credits: number; gradePoint: number; grade: string }>();

  for (const rec of records) {
    const code = rec.courseCode.trim().toUpperCase();
    const pt = getGradePoint(rec.grade);
    if (pt === null) continue;
    const credits = Number(rec.credits) || 0;
    if (credits <= 0) continue;

    if (!effectiveMap.has(code)) {
      effectiveMap.set(code, { credits, gradePoint: pt, grade: rec.grade });
    } else {
      if (retakePolicy === "latest") {
        // Newer replaces older
        effectiveMap.set(code, { credits, gradePoint: pt, grade: rec.grade });
      } else {
        // Best attempt replaces
        const existing = effectiveMap.get(code)!;
        if (pt > existing.gradePoint) {
          effectiveMap.set(code, { credits, gradePoint: pt, grade: rec.grade });
        }
      }
    }
  }

  let totalCredits = 0;
  let totalGradePoints = 0;
  let earnedCredits = 0;

  for (const item of effectiveMap.values()) {
    totalCredits += item.credits;
    totalGradePoints += item.gradePoint * item.credits;
    if (item.gradePoint > 0) {
      earnedCredits += item.credits;
    }
  }

  const gpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;

  return {
    gpa,
    totalCredits,
    totalGradePoints: Number(totalGradePoints.toFixed(2)),
    earnedCredits,
  };
}

export interface WhatIfResult {
  requiredGPA: number;
  isPossible: boolean;
  message: string;
}

/**
 * What-if solver:
 * required GPA = (target * (doneCredits + remainingCredits) - currentPoints) / remainingCredits
 */
export function calculateWhatIfGPA(
  currentCGPA: number,
  doneCredits: number,
  targetCGPA: number,
  remainingCredits: number
): WhatIfResult {
  const cGPA = Number(currentCGPA) || 0;
  const dCredits = Number(doneCredits) || 0;
  const tCGPA = Number(targetCGPA) || 0;
  const rCredits = Number(remainingCredits) || 0;

  if (rCredits <= 0) {
    return {
      requiredGPA: 0,
      isPossible: false,
      message: "Remaining credits must be greater than 0.",
    };
  }

  if (tCGPA < 0 || tCGPA > 4.0) {
    return {
      requiredGPA: 0,
      isPossible: false,
      message: "Target CGPA must be between 0.00 and 4.00.",
    };
  }

  const currentPoints = cGPA * dCredits;
  const totalCredits = dCredits + rCredits;
  const neededPoints = tCGPA * totalCredits - currentPoints;
  const rawRequired = neededPoints / rCredits;
  const rounded = Number(rawRequired.toFixed(2));

  if (rounded > 4.0) {
    return {
      requiredGPA: rounded,
      isPossible: false,
      message: `Mathematically impossible. You would need a ${rounded} GPA, but the maximum possible GPA is 4.00.`,
    };
  }

  if (rounded <= 0.0) {
    return {
      requiredGPA: 0.0,
      isPossible: true,
      message: "You have already reached or exceeded this target CGPA even with 0.00 in remaining credits!",
    };
  }

  return {
    requiredGPA: rounded,
    isPossible: true,
    message: `You need an average GPA of ${rounded.toFixed(2)} in your remaining ${rCredits} credits to achieve a ${tCGPA.toFixed(2)} CGPA.`,
  };
}
