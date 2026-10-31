import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/data/store";
import { solveTimetables } from "@/lib/planner/solve";
import { PlannerPreferences, Section } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const semester = body.semester || "Fall 2026";
    const courseCodes: string[] = body.courseCodes || [];
    const preferences: PlannerPreferences = body.preferences || {
      freeDays: [],
      earliestStart: 0,
      latestEnd: 1440,
      preferredFaculty: [],
      avoidedFaculty: [],
      seatsOnly: false,
    };
    const limit = typeof body.limit === "number" ? body.limit : 200;

    if (!Array.isArray(courseCodes) || courseCodes.length === 0) {
      return NextResponse.json(
        { error: "At least one course code is required." },
        { status: 400 }
      );
    }

    const allSections = serverStore.getSectionsBySemester(semester);

    // Group sections by requested course codes
    const coursesSections: Section[][] = [];
    const missingCourses: string[] = [];

    for (const code of courseCodes) {
      const cleanCode = code.trim().toUpperCase();
      const matching = allSections.filter(
        (s) => s.courseCode.toUpperCase() === cleanCode
      );
      if (matching.length === 0) {
        missingCourses.push(cleanCode);
      } else {
        coursesSections.push(matching);
      }
    }

    if (missingCourses.length > 0) {
      return NextResponse.json(
        {
          error: `No offered sections found in ${semester} for: ${missingCourses.join(", ")}`,
          missingCourses,
        },
        { status: 404 }
      );
    }

    const result = solveTimetables(coursesSections, preferences, limit);

    return NextResponse.json({
      semester,
      courseCodes,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to solve timetables" },
      { status: 500 }
    );
  }
}
