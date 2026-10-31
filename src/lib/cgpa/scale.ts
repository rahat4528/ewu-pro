import { GradeScaleEntry } from "../types";

export const EWU_GRADE_SCALE: GradeScaleEntry[] = [
  { grade: "A+", point: 4.00, minMarks: 80, maxMarks: 100, remarks: "Outstanding" },
  { grade: "A",  point: 3.75, minMarks: 75, maxMarks: 79.99, remarks: "Excellent" },
  { grade: "A-", point: 3.50, minMarks: 70, maxMarks: 74.99, remarks: "Very Good" },
  { grade: "B+", point: 3.25, minMarks: 65, maxMarks: 69.99, remarks: "Good" },
  { grade: "B",  point: 3.00, minMarks: 60, maxMarks: 64.99, remarks: "Satisfactory" },
  { grade: "B-", point: 2.75, minMarks: 55, maxMarks: 59.99, remarks: "Above Average" },
  { grade: "C+", point: 2.50, minMarks: 50, maxMarks: 54.99, remarks: "Average" },
  { grade: "C",  point: 2.25, minMarks: 45, maxMarks: 49.99, remarks: "Below Average" },
  { grade: "D",  point: 2.00, minMarks: 40, maxMarks: 44.99, remarks: "Passing" },
  { grade: "F",  point: 0.00, minMarks: 0,  maxMarks: 39.99, remarks: "Failing" },
];

export const NON_GPA_GRADES = ["W", "I", "P", "S", "U"];

export function getGradePoint(grade: string): number | null {
  const normalized = grade.trim().toUpperCase();
  if (NON_GPA_GRADES.includes(normalized)) {
    return null;
  }
  const entry = EWU_GRADE_SCALE.find((g) => g.grade.toUpperCase() === normalized);
  return entry !== undefined ? entry.point : null;
}

export function isValidGrade(grade: string): boolean {
  const normalized = grade.trim().toUpperCase();
  return (
    EWU_GRADE_SCALE.some((g) => g.grade.toUpperCase() === normalized) ||
    NON_GPA_GRADES.includes(normalized)
  );
}
