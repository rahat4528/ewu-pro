import { Day } from "./types";
import { formatCompactDays } from "./days";

/**
 * Converts a time string (e.g., "08:30", "08:30 AM", "1:30 PM", "13:30")
 * to minutes from midnight (0..1439).
 */
export function timeToMinutes(timeStr: string | number): number {
  if (typeof timeStr === "number") return timeStr;
  if (!timeStr) return 0;

  const trimmed = timeStr.trim().toUpperCase();
  const isPM = trimmed.includes("PM");
  const isAM = trimmed.includes("AM");

  // Remove non-digit and non-colon characters
  const clean = trimmed.replace(/[^\d:]/g, "");
  const parts = clean.split(":");

  let hours = parseInt(parts[0] || "0", 10);
  const minutes = parseInt(parts[1] || "0", 10);

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  // Handle implicit PM if time is between 1:00 and 6:59 without AM/PM specified in university context
  // e.g. EWU class slots typically run 8:00 AM to 6:00 PM. 1:00-6:00 is PM.
  if (!isAM && !isPM && hours >= 1 && hours <= 6) {
    hours += 12;
  }

  return Math.min(1439, Math.max(0, hours * 60 + minutes));
}

/**
 * Converts minutes from midnight to a 12-hour or 24-hour time string.
 * Example: 580 -> "09:40 AM"
 */
export function minutesToTime(minutes: number, format12h: boolean = true): string {
  const m = Math.max(0, Math.min(1439, Math.round(minutes)));
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  const padMin = mins.toString().padStart(2, "0");

  if (!format12h) {
    return `${hrs.toString().padStart(2, "0")}:${padMin}`;
  }

  const period = hrs >= 12 ? "PM" : "AM";
  const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
  return `${displayHrs.toString().padStart(2, "0")}:${padMin} ${period}`;
}

/**
 * Formats a start and end time range.
 * Example: (580, 670) -> "09:40 AM - 11:10 AM"
 */
export function formatTimeRange(start: number, end: number): string {
  return `${minutesToTime(start)} - ${minutesToTime(end)}`;
}

/**
 * Generates a consistent grouping key for sections sharing identical timing.
 * Example: days=["SUN","TUE"], start=580, end=670 -> "ST|09:40-11:10"
 */
export function makeGroupingKey(days: Day[], start: number, end: number): string {
  const dayCode = formatCompactDays(days);
  const startTime = minutesToTime(start, false);
  const endTime = minutesToTime(end, false);
  return `${dayCode}|${startTime}-${endTime}`;
}

/**
 * Checks if two open intervals [aStart, aEnd) and [bStart, bEnd) overlap.
 */
export function intervalsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}
