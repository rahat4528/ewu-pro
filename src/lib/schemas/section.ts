import { z } from "zod";
import { parseDays } from "../days";
import { timeToMinutes } from "../time";
import { Day, Section } from "../types";

export const RawSectionRowSchema = z.object({
  courseCode: z.string().min(2, "Course code is required (e.g. CSE115)"),
  courseTitle: z.string().optional(),
  credits: z.coerce.number().min(0).max(10).optional().default(3),
  sectionNo: z.coerce.number().int().min(1, "Section number must be >= 1"),
  faculty: z.string().optional().default("TBA"),
  days: z.string().min(1, "Days cannot be empty (e.g. ST, MW, TR)"),
  time: z.string().optional(), // e.g. "09:40-11:10" or "09:40 AM - 11:10 AM"
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  room: z.string().optional(),
  seats: z.coerce.number().int().min(0).optional().default(35),
  capacity: z.coerce.number().int().min(0).optional().default(35),
  type: z.enum(["THEORY", "LAB"]).optional().default("THEORY"),
  linkedTo: z.string().optional(),
});

export type RawSectionRow = z.infer<typeof RawSectionRowSchema>;

export interface NormalizedRowResult {
  valid: boolean;
  section?: Section;
  errors?: string[];
  rowNumber: number;
}

/**
 * Validates and normalizes a single raw row (from CSV or JSON) into a typed Section.
 */
export function validateAndNormalizeRow(
  raw: Record<string, any>,
  semesterName: string,
  rowNumber: number
): NormalizedRowResult {
  // Normalize key names: support variations like "Course", "Course Code", "Sec", "Section", "Time", etc.
  const normalizedKeys: Record<string, any> = {};
  for (const [key, val] of Object.entries(raw)) {
    const k = key.trim().toLowerCase().replace(/[\s_-]+/g, "");
    if (k === "course" || k === "coursecode" || k === "code") normalizedKeys.courseCode = val;
    else if (k === "title" || k === "coursetitle" || k === "name") normalizedKeys.courseTitle = val;
    else if (k === "sec" || k === "section" || k === "sectionno" || k === "secno") normalizedKeys.sectionNo = val;
    else if (k === "credit" || k === "credits") normalizedKeys.credits = val;
    else if (k === "faculty" || k === "instructor" || k === "initials" || k === "teacher") normalizedKeys.faculty = val;
    else if (k === "day" || k === "days" || k === "daypattern") normalizedKeys.days = val;
    else if (k === "time" || k === "timerange" || k === "timeslot" || k === "timing") normalizedKeys.time = val;
    else if (k === "start" || k === "starttime") normalizedKeys.startTime = val;
    else if (k === "end" || k === "endtime") normalizedKeys.endTime = val;
    else if (k === "room" || k === "classroom") normalizedKeys.room = val;
    else if (k === "seats" || k === "seat" || k === "available" || k === "availableseats") normalizedKeys.seats = val;
    else if (k === "cap" || k === "capacity" || k === "total") normalizedKeys.capacity = val;
    else if (k === "type") normalizedKeys.type = val;
    else if (k === "linkedto" || k === "lablink") normalizedKeys.linkedTo = val;
    else normalizedKeys[key] = val;
  }

  // Handle combined time field e.g. "09:40-11:10" or "09:40 AM - 11:10 AM"
  if (normalizedKeys.time && (!normalizedKeys.startTime || !normalizedKeys.endTime)) {
    const timeParts = String(normalizedKeys.time).split(/[-–—]/);
    if (timeParts.length >= 2) {
      normalizedKeys.startTime = timeParts[0].trim();
      normalizedKeys.endTime = timeParts[1].trim();
    }
  }

  const parsed = RawSectionRowSchema.safeParse(normalizedKeys);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    return { valid: false, errors, rowNumber };
  }

  const data = parsed.data;

  // Validate parsed days
  const parsedDays = parseDays(data.days);
  if (parsedDays.length === 0) {
    return {
      valid: false,
      errors: [`Row ${rowNumber}: Invalid day code "${data.days}". Must contain valid EWU days (S, M, T, W, R).`],
      rowNumber,
    };
  }

  // Validate start and end times
  const startMinutes = timeToMinutes(data.startTime || "09:40");
  const endMinutes = timeToMinutes(data.endTime || "11:10");

  if (startMinutes >= endMinutes) {
    return {
      valid: false,
      errors: [`Row ${rowNumber}: Start time (${startMinutes}m) must be before end time (${endMinutes}m).`],
      rowNumber,
    };
  }

  const cleanCourseCode = data.courseCode.trim().toUpperCase().replace(/\s+/g, "");
  const sectionId = `${semesterName}-${cleanCourseCode}-${data.sectionNo}`;

  const section: Section = {
    id: sectionId,
    semester: semesterName,
    courseCode: cleanCourseCode,
    courseTitle: data.courseTitle?.trim(),
    credits: data.credits,
    sectionNo: data.sectionNo,
    faculty: (data.faculty || "TBA").trim().toUpperCase(),
    days: parsedDays,
    rawDays: data.days.trim().toUpperCase(),
    start: startMinutes,
    end: endMinutes,
    room: data.room ? String(data.room).trim() : undefined,
    seats: data.seats,
    capacity: data.capacity,
    type: data.type,
    linkedTo: data.linkedTo,
    importedAt: new Date().toISOString(),
  };

  return {
    valid: true,
    section,
    rowNumber,
  };
}
