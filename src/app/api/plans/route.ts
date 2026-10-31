import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/data/store";
import { SavedPlan } from "@/lib/types";

export async function GET() {
  const plans = serverStore.getSavedPlans();
  return NextResponse.json({ plans });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: "Invalid plan sections" }, { status: 400 });
    }

    const plan: SavedPlan = {
      id: body.id || `plan-${Date.now()}`,
      name: body.name || `My EWU Plan (${new Date().toLocaleDateString()})`,
      semester: body.semester || "Fall 2026",
      createdAt: new Date().toISOString(),
      sections: body.sections,
    };

    serverStore.savePlan(plan);
    return NextResponse.json({ plan, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to save plan" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing plan id" }, { status: 400 });
    }
    serverStore.deletePlan(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete plan" }, { status: 500 });
  }
}
