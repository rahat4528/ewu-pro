import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/data/store";
import { validateAndNormalizeRow } from "@/lib/schemas/section";
import { Section } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const semesterName = (body.semesterName || "").trim();
    const rows: Record<string, any>[] = body.rows || [];
    const action: "preview" | "commit" = body.action || "preview";

    if (!semesterName) {
      return NextResponse.json(
        { error: "Semester name is required (e.g. 'Spring 2027')." },
        { status: 400 }
      );
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No data rows provided for import." },
        { status: 400 }
      );
    }

    const validSections: Section[] = [];
    const errors: Array<{ rowNumber: number; errors: string[] }> = [];

    rows.forEach((rawRow, idx) => {
      const rowNumber = idx + 1;
      const res = validateAndNormalizeRow(rawRow, semesterName, rowNumber);
      if (res.valid && res.section) {
        validSections.push(res.section);
      } else if (res.errors) {
        errors.push({ rowNumber, errors: res.errors });
      }
    });

    if (action === "commit") {
      if (validSections.length === 0) {
        return NextResponse.json(
          { error: "Cannot commit semester with 0 valid sections.", errors },
          { status: 400 }
        );
      }

      serverStore.setSections(semesterName, validSections);

      return NextResponse.json({
        success: true,
        message: `Successfully published ${validSections.length} sections for ${semesterName}.`,
        totalRows: rows.length,
        validCount: validSections.length,
        errorCount: errors.length,
        errors: errors.slice(0, 50),
      });
    }

    // Action is preview
    return NextResponse.json({
      preview: true,
      semesterName,
      totalRows: rows.length,
      validCount: validSections.length,
      errorCount: errors.length,
      errors: errors.slice(0, 50),
      sampleSections: validSections.slice(0, 20),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Import pipeline failed." },
      { status: 500 }
    );
  }
}
