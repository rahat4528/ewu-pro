import { Day, PlannerPreferences } from "../types";

export interface ParsedNLPPreferences {
  preferences: Partial<PlannerPreferences>;
  appliedTags: string[];
  rawText: string;
}

/**
 * Natural language intent parser for advising routine wishes.
 * Turns conversational text like "no Sunday classes, afternoons only, prefer MAR"
 * into a structured preferences object.
 */
export function parseNaturalLanguagePreferences(input: string): ParsedNLPPreferences {
  if (!input || !input.trim()) {
    return { preferences: {}, appliedTags: [], rawText: input };
  }

  const text = input.toLowerCase();
  const prefs: Partial<PlannerPreferences> = {};
  const tags: string[] = [];

  // 1. Day off / Free day intents
  const freeDays: Day[] = [];
  const dayPatterns = [
    { regex: /(?:no|free|avoid|skip|without)\s+sundays?/i, day: "SUN" as Day, label: "Sunday" },
    { regex: /(?:no|free|avoid|skip|without)\s+mondays?/i, day: "MON" as Day, label: "Monday" },
    { regex: /(?:no|free|avoid|skip|without)\s+tuesdays?/i, day: "TUE" as Day, label: "Tuesday" },
    { regex: /(?:no|free|avoid|skip|without)\s+wednesdays?/i, day: "WED" as Day, label: "Wednesday" },
    { regex: /(?:no|free|avoid|skip|without)\s+thursdays?/i, day: "THU" as Day, label: "Thursday" },
  ];

  for (const p of dayPatterns) {
    if (p.regex.test(text)) {
      freeDays.push(p.day);
      tags.push(`Day Off: ${p.label}`);
    }
  }

  if (freeDays.length > 0) {
    prefs.freeDays = freeDays;
  }

  // 2. Time-of-day intents
  // Afternoon only (after 12:00 PM or 1:00 PM)
  if (/afternoons?\s+only|after\s+12|after\s+1\s*pm|late\s+starts?/i.test(text)) {
    prefs.earliestStart = 720; // 12:00 PM
    tags.push("Earliest Start: 12:00 PM");
  } else if (/after\s+10|after\s+10\s*am/i.test(text)) {
    prefs.earliestStart = 610; // 10:10 AM
    tags.push("Earliest Start: 10:10 AM");
  }

  // Morning only (finish by 1:00 PM or 3:00 PM)
  if (/mornings?\s+only|finish\s+early|before\s+1\s*pm|before\s+2\s*pm/i.test(text)) {
    prefs.latestEnd = 800; // 01:20 PM
    tags.push("Latest Finish: 01:20 PM");
  } else if (/before\s+3\s*pm|before\s+4\s*pm/i.test(text)) {
    prefs.latestEnd = 900; // 03:00 PM
    tags.push("Latest Finish: 03:00 PM");
  }

  // 3. Faculty preferences
  // "prefer MAR", "prefer faculty MAR, AH"
  const prefFacultyMatch = text.match(/(?:prefer|want|favorite|like)\s+(?:faculty|teacher|instructor)?\s*([a-z\s,]+)/i);
  if (prefFacultyMatch && prefFacultyMatch[1]) {
    const rawTokens = prefFacultyMatch[1].split(/[\s,]+/).filter(Boolean);
    const validInitials = rawTokens
      .map((t) => t.toUpperCase())
      .filter((t) => t.length >= 2 && t.length <= 5 && !["ONLY", "AND", "WITH", "NO", "CLASSES"].includes(t));
    if (validInitials.length > 0) {
      prefs.preferredFaculty = validInitials;
      tags.push(`Preferred Faculty: ${validInitials.join(", ")}`);
    }
  }

  // "avoid TBA", "avoid faculty XYZ"
  const avoidFacultyMatch = text.match(/(?:avoid|dislike|no)\s+(?:faculty|teacher|instructor)?\s*([a-z\s,]+)/i);
  if (avoidFacultyMatch && avoidFacultyMatch[1]) {
    const rawTokens = avoidFacultyMatch[1].split(/[\s,]+/).filter(Boolean);
    const validInitials = rawTokens
      .map((t) => t.toUpperCase())
      .filter((t) => t.length >= 2 && t.length <= 5 && !["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "CLASSES"].includes(t));
    if (validInitials.length > 0) {
      prefs.avoidedFaculty = validInitials;
      tags.push(`Avoided Faculty: ${validInitials.join(", ")}`);
    }
  }

  // 4. Seats availability
  if (/seats?\s+only|has\s+seats|open\s+seats/i.test(text)) {
    prefs.seatsOnly = true;
    tags.push("Open Seats Only");
  }

  return {
    preferences: prefs,
    appliedTags: tags,
    rawText: input,
  };
}
