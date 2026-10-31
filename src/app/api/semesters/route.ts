import { NextResponse } from "next/server";
import { serverStore } from "@/lib/data/store";

export async function GET() {
  const semesters = serverStore.getSemesters();
  return NextResponse.json({ semesters });
}
