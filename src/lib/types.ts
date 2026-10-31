export type Day = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export const EWU_DAYS: Day[] = ["SUN", "MON", "TUE", "WED", "THU"];

export interface Course {
  id?: string;
  code: string;
  title: string;
  credits: number;
  department?: string;
}

export interface Section {
  id: string;
  semester: string;
  courseCode: string;
  courseTitle?: string;
  credits?: number;
  sectionNo: number;
  faculty: string;
  days: Day[];
  rawDays: string;
  start: number; // minutes since midnight, e.g. 580 = 09:40
  end: number;   // minutes since midnight, e.g. 670 = 11:10
  room?: string;
  seats?: number;
  capacity?: number;
  type: "THEORY" | "LAB";
  linkedTo?: string; // key or id of paired lab/theory section
  importedAt?: string;
}

export interface Semester {
  id: string;
  name: string; // e.g. "Fall 2026", "Summer 2026", "Spring 2026"
  published: boolean;
  importedAt: string;
  sourceNote?: string;
  sectionCount?: number;
}

export interface PlannerPreferences {
  freeDays: Day[];
  earliestStart: number; // in minutes, e.g. 540 = 09:00 AM
  latestEnd: number;     // in minutes, e.g. 1020 = 05:00 PM
  preferredFaculty: string[];
  avoidedFaculty: string[];
  maxGapMinutes?: number;
  seatsOnly: boolean;
  weights?: {
    wFreeDays: number;
    wGaps: number;
    wEarlyStart: number;
    wLateFinish: number;
    wPrefFaculty: number;
    wAvoidFaculty: number;
  };
}

export interface TimetablePlan {
  id: string;
  sections: Section[];
  score: number;
  metrics: {
    freeDaysCount: number;
    totalGapMinutes: number;
    earlyStartsCount: number;
    lateFinishesCount: number;
    preferredFacultyCount: number;
    avoidedFacultyCount: number;
    hasFullSeats: boolean;
  };
  hasConflict?: boolean;
}

export interface GradeScaleEntry {
  grade: string;
  point: number;
  minMarks: number;
  maxMarks: number;
  remarks: string;
}

export interface GradeRecord {
  id: string;
  courseCode: string;
  credits: number;
  grade: string;
  semester?: string;
}

export interface SavedPlan {
  id: string;
  name: string;
  semester: string;
  createdAt: string;
  sections: Section[];
}
