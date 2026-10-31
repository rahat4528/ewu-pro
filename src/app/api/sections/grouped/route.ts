import { NextRequest, NextResponse } from "next/server";
import { filterSections, groupSectionsByTiming, serverStore } from "@/lib/data/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const semester = searchParams.get("semester") || "Fall 2026";
  const query = searchParams.get("q") || "";
  const day = searchParams.get("day") || "";
  const faculty = searchParams.get("faculty") || "";
  const hasSeats = searchParams.get("seats") === "true";

  const allSections = serverStore.getSectionsBySemester(semester);
  const filtered = filterSections(allSections, {
    query,
    day,
    faculty,
    hasSeats,
  });

  const groups = groupSectionsByTiming(filtered);

  return NextResponse.json({
    semester,
    totalSections: filtered.length,
    totalGroups: groups.length,
    groups,
  });
}
