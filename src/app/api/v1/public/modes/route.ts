import { NextResponse } from "next/server";
import { listAcademicStreams, listAcademicSubjects } from "@/lib/services/platform-store";

export async function GET() {
  const subjects = listAcademicSubjects({ includeInactive: false });
  const streams = listAcademicStreams();
  const totalPublishedQuestions = subjects.reduce(
    (sum, s) => sum + s.publishedQuestionCount,
    0
  );

  return NextResponse.json({
    product: "THE UNWRITTEN",
    tagline: "An experiment in human curiosity.",
    modes: [
      {
        slug: "senior",
        title: "SENIOR MODE",
        subtitle: "Interactive Narrative & Behavioral Exploration",
        entryPath: "/play",
        chaptersCount: 6,
        features: [
          "Six interactive narrative chapters",
          "Tactile archive & vault logic puzzles",
          "Optional Seventh Door & Hidden Letter discovery",
          "Personalized archetype report & Choice Map",
        ],
      },
      {
        slug: "junior",
        title: "JUNIOR MODE — CLASS 11",
        subtitle: "MSBSHSE Academic Challenges & Reasoning Studio",
        entryPath: "/junior",
        board: "MSBSHSE",
        academicYear: "2025-26",
        standard: "Class 11 (FYJC)",
        streamsCount: streams.length,
        activeSubjectsCount: subjects.length,
        totalPublishedQuestions,
        questionsPerAttempt: 10,
      },
    ],
  });
}

