import { Day, Section, Semester, Course, SavedPlan } from "../types";
import { makeGroupingKey } from "../time";
import { ALL_SEED_SECTIONS, SEED_COURSES, SEED_SEMESTERS } from "./seedData";

export interface GroupedSectionsRow {
  groupKey: string;
  days: Day[];
  rawDays: string;
  start: number;
  end: number;
  sections: Section[];
}

/**
 * Groups sections sharing identical days and start-end times.
 */
export function groupSectionsByTiming(sections: Section[]): GroupedSectionsRow[] {
  const map = new Map<string, GroupedSectionsRow>();

  for (const s of sections) {
    const key = makeGroupingKey(s.days, s.start, s.end);
    if (!map.has(key)) {
      map.set(key, {
        groupKey: key,
        days: s.days,
        rawDays: s.rawDays,
        start: s.start,
        end: s.end,
        sections: [],
      });
    }
    map.get(key)!.sections.push(s);
  }

  // Sort groups by start time, then day code
  const result = Array.from(map.values());
  result.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return a.groupKey.localeCompare(b.groupKey);
  });

  // Sort sections inside each group by courseCode, then sectionNo
  for (const group of result) {
    group.sections.sort((a, b) => {
      if (a.courseCode !== b.courseCode) return a.courseCode.localeCompare(b.courseCode);
      return a.sectionNo - b.sectionNo;
    });
  }

  return result;
}

/**
 * Filter sections based on user search parameters.
 */
export function filterSections(
  sections: Section[],
  options: {
    query?: string;
    day?: string;
    faculty?: string;
    hasSeats?: boolean;
    department?: string;
  }
): Section[] {
  const q = options.query?.trim().toUpperCase() || "";
  const day = options.day?.trim().toUpperCase() || "";
  const faculty = options.faculty?.trim().toUpperCase() || "";
  const hasSeats = options.hasSeats || false;

  return sections.filter((s) => {
    if (q) {
      const matchCode = s.courseCode.toUpperCase().includes(q);
      const matchTitle = s.courseTitle ? s.courseTitle.toUpperCase().includes(q) : false;
      const matchFaculty = s.faculty.toUpperCase().includes(q);
      const matchRoom = s.room ? s.room.toUpperCase().includes(q) : false;
      if (!matchCode && !matchTitle && !matchFaculty && !matchRoom) {
        return false;
      }
    }

    if (day) {
      const matchDay = s.days.some((d) => d === day) || s.rawDays.includes(day);
      if (!matchDay) return false;
    }

    if (faculty) {
      if (!s.faculty.toUpperCase().includes(faculty)) return false;
    }

    if (hasSeats) {
      if (s.seats !== undefined && s.seats <= 0) return false;
    }

    return true;
  });
}

// In-memory runtime data holder for API routes & server components
class MemoryStore {
  private semesters: Semester[] = [...SEED_SEMESTERS];
  private courses: Course[] = [...SEED_COURSES];
  private sections: Map<string, Section[]> = new Map();
  private plans: SavedPlan[] = [];

  constructor() {
    for (const [sem, list] of Object.entries(ALL_SEED_SECTIONS)) {
      this.sections.set(sem, [...list]);
    }
  }

  getSemesters(): Semester[] {
    return [...this.semesters];
  }

  getSectionsBySemester(semesterName: string): Section[] {
    return this.sections.get(semesterName) || [];
  }

  getAllCourses(): Course[] {
    return [...this.courses];
  }

  upsertSemester(sem: Semester) {
    const idx = this.semesters.findIndex((s) => s.name === sem.name);
    if (idx >= 0) {
      this.semesters[idx] = { ...this.semesters[idx], ...sem };
    } else {
      this.semesters.unshift(sem);
    }
  }

  setSections(semesterName: string, sections: Section[]) {
    this.sections.set(semesterName, sections);
    // Update semester count
    const sem = this.semesters.find((s) => s.name === semesterName);
    if (sem) {
      sem.sectionCount = sections.length;
    } else {
      this.semesters.unshift({
        id: `sem-${Date.now()}`,
        name: semesterName,
        published: true,
        importedAt: new Date().toISOString(),
        sectionCount: sections.length,
      });
    }

    // Also register any new courses in catalog
    for (const s of sections) {
      if (!this.courses.some((c) => c.code === s.courseCode)) {
        this.courses.push({
          code: s.courseCode,
          title: s.courseTitle || s.courseCode,
          credits: s.credits || 3,
        });
      }
    }
  }

  getSavedPlans(): SavedPlan[] {
    return [...this.plans];
  }

  savePlan(plan: SavedPlan): SavedPlan {
    this.plans = [plan, ...this.plans.filter((p) => p.id !== plan.id)];
    return plan;
  }

  deletePlan(id: string) {
    this.plans = this.plans.filter((p) => p.id !== id);
  }
}

// Singleton global instance for server-side route handlers
declare global {
  // eslint-disable-next-line no-var
  var __ewuMemoryStore: MemoryStore | undefined;
}

export const serverStore = globalThis.__ewuMemoryStore || new MemoryStore();
if (process.env.NODE_ENV !== "production") {
  globalThis.__ewuMemoryStore = serverStore;
}
