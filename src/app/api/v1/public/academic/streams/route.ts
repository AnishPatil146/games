import { NextResponse } from "next/server";
import { listAcademicStreams } from "@/lib/services/platform-store";

export async function GET() {
  const streams = listAcademicStreams();
  return NextResponse.json({
    board: "MSBSHSE",
    academicYear: "2025-26",
    standard: "Class 11 (FYJC)",
    streams,
  });
}

