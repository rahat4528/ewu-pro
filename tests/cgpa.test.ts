import { describe, it, expect } from "vitest";
import { getGradePoint } from "../src/lib/cgpa/scale";
import {
  calculateSemesterGPA,
  calculateCumulativeCGPA,
  calculateHistoricalCGPA,
  calculateWhatIfGPA,
} from "../src/lib/cgpa/calc";
import { GradeRecord } from "../src/lib/types";

describe("EWU CGPA Calculator", () => {
  it("converts all EWU 10-tier letter grades to exact points", () => {
    expect(getGradePoint("A+")).toBe(4.00);
    expect(getGradePoint("A")).toBe(3.75);
    expect(getGradePoint("A-")).toBe(3.50);
    expect(getGradePoint("B+")).toBe(3.25);
    expect(getGradePoint("B")).toBe(3.00);
    expect(getGradePoint("B-")).toBe(2.75);
    expect(getGradePoint("C+")).toBe(2.50);
    expect(getGradePoint("C")).toBe(2.25);
    expect(getGradePoint("D")).toBe(2.00);
    expect(getGradePoint("F")).toBe(0.00);
    expect(getGradePoint("W")).toBeNull();
    expect(getGradePoint("I")).toBeNull();
  });

  it("calculates semester GPA accurately", () => {
    // 3 credits A+ (4.00) = 12.0
    // 3 credits A  (3.75) = 11.25
    // 3 credits B  (3.00) = 9.0
    // Total credits = 9, points = 32.25, GPA = 32.25 / 9 = 3.5833 -> 3.58
    const courses = [
      { credits: 3, grade: "A+" },
      { credits: 3, grade: "A" },
      { credits: 3, grade: "B" },
    ];
    const res = calculateSemesterGPA(courses);
    expect(res.totalCredits).toBe(9);
    expect(res.earnedCredits).toBe(9);
    expect(res.gpa).toBe(3.58);
  });

  it("handles failing grades in GPA (credits count in attempt, 0 points earned)", () => {
    // 3 credits A+ (4.00) = 12.0
    // 3 credits F  (0.00) = 0.0
    // Total credits = 6, points = 12.0, GPA = 2.00, earned = 3
    const courses = [
      { credits: 3, grade: "A+" },
      { credits: 3, grade: "F" },
    ];
    const res = calculateSemesterGPA(courses);
    expect(res.totalCredits).toBe(6);
    expect(res.earnedCredits).toBe(3);
    expect(res.gpa).toBe(2.00);
  });

  it("applies EWU retake policy: newer attempt replaces older attempt", () => {
    const history: GradeRecord[] = [
      { id: "1", courseCode: "CSE110", credits: 3, grade: "D", semester: "Spring 2025" },
      { id: "2", courseCode: "MAT101", credits: 3, grade: "B", semester: "Spring 2025" },
      // Retake of CSE110 in Fall 2025 with A
      { id: "3", courseCode: "CSE110", credits: 3, grade: "A", semester: "Fall 2025" },
    ];

    const res = calculateHistoricalCGPA(history, "latest");
    // CSE110 should count as A (3.75), MAT101 as B (3.00) = total 6 credits, points = 11.25 + 9 = 20.25 -> GPA = 3.38
    expect(res.totalCredits).toBe(6);
    expect(res.gpa).toBe(3.38);
  });

  it("calculates what-if required GPA correctly", () => {
    // Current: 60 credits done with 3.20 CGPA (192 points)
    // Target: 3.50 CGPA at graduation (120 credits total -> need 420 points)
    // Remaining: 60 credits -> need (420 - 192) / 60 = 228 / 60 = 3.80
    const whatIf = calculateWhatIfGPA(3.20, 60, 3.50, 60);
    expect(whatIf.isPossible).toBe(true);
    expect(whatIf.requiredGPA).toBe(3.80);
  });

  it("flags mathematically impossible what-if targets", () => {
    // Target 3.90 when current is 2.50 with only 15 credits remaining
    const whatIf = calculateWhatIfGPA(2.50, 100, 3.90, 15);
    expect(whatIf.isPossible).toBe(false);
    expect(whatIf.requiredGPA).toBeGreaterThan(4.00);
  });
});
