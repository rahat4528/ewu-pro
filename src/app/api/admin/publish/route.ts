import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/data/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const semesterName = body.semesterName;
    const published = typeof body.published === "boolean" ? body.published : true;

    if (!semesterName) {
      return NextResponse.json({ error: "Missing semesterName" }, { status: 400 });
    }

    const semesters = serverStore.getSemesters();
    const target = semesters.find((s) => s.name === semesterName);

    if (!target) {
      return NextResponse.json({ error: `Semester ${semesterName} not found.` }, { status: 404 });
    }

    target.published = published;
    serverStore.upsertSemester(target);

    return NextResponse.json({
      success: true,
      semester: target,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update publish state" }, { status: 500 });
  }
}
