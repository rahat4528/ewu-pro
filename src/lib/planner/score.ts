import { Day, EWU_DAYS, PlannerPreferences, Section, TimetablePlan } from "../types";

export interface ScoreMetrics {
  freeDaysCount: number;
  totalGapMinutes: number;
  earlyStartsCount: number;
  lateFinishesCount: number;
  preferredFacultyCount: number;
  avoidedFacultyCount: number;
  hasFullSeats: boolean;
}

export function evaluatePlanMetrics(sections: Section[], preferences: PlannerPreferences): ScoreMetrics {
  // Days with classes
  const activeDays = new Set<Day>();
  // Sections per day for gap computation
  const sectionsByDay: Record<Day, Section[]> = {
    SUN: [],
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
    SAT: [],
  };

  for (const s of sections) {
    for (const d of s.days) {
      activeDays.add(d);
      sectionsByDay[d].push(s);
    }
  }

  // Count free days among EWU regular instructional days (Sunday - Thursday)
  const freeDaysCount = EWU_DAYS.filter((d) => !activeDays.has(d)).length;

  // Calculate gaps between classes on each day
  let totalGapMinutes = 0;
  for (const d of EWU_DAYS) {
    const daySections = sectionsByDay[d];
    if (daySections.length > 1) {
      // Sort by start time
      const sorted = [...daySections].sort((a, b) => a.start - b.start);
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1].start - sorted[i].end;
        if (gap > 0) {
          totalGapMinutes += gap;
        }
      }
    }
  }

  // Early starts & late finishes
  let earlyStartsCount = 0;
  let lateFinishesCount = 0;
  let preferredFacultyCount = 0;
  let avoidedFacultyCount = 0;
  let hasFullSeats = true;

  const prefFac = preferences.preferredFaculty.map((f) => f.trim().toUpperCase()).filter(Boolean);
  const avoidFac = preferences.avoidedFaculty.map((f) => f.trim().toUpperCase()).filter(Boolean);

  for (const s of sections) {
    if (preferences.earliestStart && s.start < preferences.earliestStart) {
      earlyStartsCount++;
    }
    if (preferences.latestEnd && s.end > preferences.latestEnd) {
      lateFinishesCount++;
    }

    const fac = (s.faculty || "").trim().toUpperCase();
    if (fac) {
      if (prefFac.some((pf) => fac.includes(pf) || pf.includes(fac))) {
        preferredFacultyCount++;
      }
      if (avoidFac.some((af) => fac.includes(af) || af.includes(fac))) {
        avoidedFacultyCount++;
      }
    }

    if (s.seats !== undefined && s.seats <= 0) {
      hasFullSeats = false;
    }
  }

  return {
    freeDaysCount,
    totalGapMinutes,
    earlyStartsCount,
    lateFinishesCount,
    preferredFacultyCount,
    avoidedFacultyCount,
    hasFullSeats,
  };
}

export function scorePlan(metrics: ScoreMetrics, preferences: PlannerPreferences): number {
  const w = preferences.weights || {
    wFreeDays: 200,
    wGaps: 1, // 1 point deducted per minute gap
    wEarlyStart: 100,
    wLateFinish: 80,
    wPrefFaculty: 150,
    wAvoidFaculty: 250,
  };

  const score =
    w.wFreeDays * metrics.freeDaysCount -
    w.wGaps * metrics.totalGapMinutes -
    w.wEarlyStart * metrics.earlyStartsCount -
    w.wLateFinish * metrics.lateFinishesCount +
    w.wPrefFaculty * metrics.preferredFacultyCount -
    w.wAvoidFaculty * metrics.avoidedFacultyCount +
    (metrics.hasFullSeats ? 50 : -200);

  return Math.round(score);
}
