import { Day, Section } from "../types";
import { intervalsOverlap, formatTimeRange } from "../time";
import { DAY_ORDER, DAY_LABELS } from "../days";

/**
 * Checks if two sections have any overlapping schedule time on the same day.
 */
export function doSectionsClash(a: Section, b: Section): boolean {
  if (a.id && b.id && a.id === b.id) return false;
  
  // Find shared days
  const sharedDay = a.days.some((d) => b.days.includes(d));
  if (!sharedDay) return false;

  return intervalsOverlap(a.start, a.end, b.start, b.end);
}

/**
 * Generates an explanation message if two sections clash, or null if they don't.
 */
export function getClashReason(a: Section, b: Section): string | null {
  const commonDays = a.days.filter((d) => b.days.includes(d));
  if (commonDays.length === 0) return null;

  if (intervalsOverlap(a.start, a.end, b.start, b.end)) {
    const daysStr = commonDays.map((d) => DAY_LABELS[d]).join(", ");
    const overlapStart = Math.max(a.start, b.start);
    const overlapEnd = Math.min(a.end, b.end);
    return `${a.courseCode} Sec ${a.sectionNo} conflicts with ${b.courseCode} Sec ${b.sectionNo} on ${daysStr} (${formatTimeRange(overlapStart, overlapEnd)})`;
  }

  return null;
}

/**
 * Fast bitmask representation of a section's schedule.
 * Slots: 10-minute intervals from 00:00 to 24:00 (144 slots/day).
 * Uses BigInt bitmask per day.
 */
export interface SectionBitmask {
  masksByDay: Record<Day, bigint>;
}

export function computeSectionBitmask(section: Section): SectionBitmask {
  const masksByDay: Record<Day, bigint> = {
    SUN: 0n,
    MON: 0n,
    TUE: 0n,
    WED: 0n,
    THU: 0n,
    FRI: 0n,
    SAT: 0n,
  };

  const startSlot = Math.max(0, Math.floor(section.start / 10));
  const endSlot = Math.min(144, Math.ceil(section.end / 10));

  let slotMask = 0n;
  for (let slot = startSlot; slot < endSlot; slot++) {
    slotMask |= 1n << BigInt(slot);
  }

  for (const day of section.days) {
    masksByDay[day] = slotMask;
  }

  return { masksByDay };
}

export function bitmasksClash(a: SectionBitmask, b: SectionBitmask): boolean {
  for (const day of Object.keys(a.masksByDay) as Day[]) {
    if ((a.masksByDay[day] & b.masksByDay[day]) !== 0n) {
      return true;
    }
  }
  return false;
}
