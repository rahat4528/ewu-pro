import { Day } from "./types";

export const DAY_ORDER: Record<Day, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

export const CHAR_TO_DAY: Record<string, Day> = {
  S: "SUN",
  M: "MON",
  T: "TUE",
  W: "WED",
  R: "THU",
  F: "FRI",
  A: "SAT",
};

export const DAY_TO_CHAR: Record<Day, string> = {
  SUN: "S",
  MON: "M",
  TUE: "T",
  WED: "W",
  THU: "R",
  FRI: "F",
  SAT: "A",
};

export const DAY_LABELS: Record<Day, string> = {
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

/**
 * Parses raw day representation into an array of typed Days.
 * Handles EWU codes: ST, MW, TR, SW, MR, SR, S, M, T, W, R, etc.
 * Also handles comma/space separated strings like "SUN, TUE", "Sunday, Tuesday".
 */
export function parseDays(raw: string | undefined | null): Day[] {
  if (!raw) return [];

  const cleaned = raw.trim().toUpperCase();

  // If already standard comma/space separated tokens or codes
  const standardTokens = cleaned.split(/[\s,/-]+/).filter(Boolean);
  const matchedTokens: Day[] = [];
  for (const token of standardTokens) {
    if (token in DAY_ORDER) {
      matchedTokens.push(token as Day);
    } else if (CHAR_TO_DAY[token]) {
      matchedTokens.push(CHAR_TO_DAY[token]);
    } else {
      // Check full day name
      for (const [day, label] of Object.entries(DAY_LABELS)) {
        if (label.toUpperCase().startsWith(token)) {
          matchedTokens.push(day as Day);
          break;
        }
      }
    }
  }

  if (matchedTokens.length > 0) {
    return sortDays(Array.from(new Set(matchedTokens)));
  }

  // Parse compact codes like "ST", "MW", "TR", "SW", "MR", "SR", "R", "W", etc.
  const days: Day[] = [];
  for (const char of cleaned) {
    if (CHAR_TO_DAY[char]) {
      days.push(CHAR_TO_DAY[char]);
    }
  }

  return sortDays(Array.from(new Set(days)));
}

/**
 * Sorts days in canonical weekly order starting Sunday
 */
export function sortDays(days: Day[]): Day[] {
  return [...days].sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);
}

/**
 * Formats day array into compact EWU code (e.g. ["SUN", "TUE"] -> "ST")
 */
export function formatCompactDays(days: Day[]): string {
  const sorted = sortDays(days);
  return sorted.map((d) => DAY_TO_CHAR[d] || d).join("");
}

/**
 * Formats day array into readable string (e.g. "Sun, Tue")
 */
export function formatDayList(days: Day[]): string {
  const sorted = sortDays(days);
  return sorted.map((d) => DAY_LABELS[d].slice(0, 3)).join(", ");
}
