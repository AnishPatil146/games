import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getParticipantSubjectProgress,
  listAcademicSubjects,
} from "@/lib/services/platform-store";
import { getSessionTokenFromRequest } from "@/lib/session-cookie";

const QuerySchema = z.object({
  stream: z.enum(["science", "commerce", "arts"]).optional(),
});

export async function GET(req: NextRequest) {
  const rawStream = req.nextUrl.searchParams.get("stream") || undefined;
  const parsed = QuerySchema.safeParse({ stream: rawStream });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid stream filter. Expected science, commerce, or arts." },
      { status: 400 }
    );
  }

  const token = getSessionTokenFromRequest(req);
  const subjects = listAcademicSubjects({
    stream: parsed.data.stream,
    includeInactive: false,
  });
  const progressMap = await getParticipantSubjectProgress(token);

  const enriched = subjects.map((subj) => ({
    ...subj,
    participantProgress: progressMap[subj.slug] || {
      completedQuestionsCount: 0,
      cycleNumber: 1,
      attemptsCompleted: 0,
      bestScoreOutOf10: null,
    },
  }));

  return NextResponse.json({
    subjects: enriched,
  });
}

