import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/data/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toUpperCase();

  const courses = serverStore.getAllCourses();
  const filtered = q
    ? courses.filter(
        (c) => c.code.toUpperCase().includes(q) || c.title.toUpperCase().includes(q)
      )
    : courses;

  return NextResponse.json({ courses: filtered });
}
