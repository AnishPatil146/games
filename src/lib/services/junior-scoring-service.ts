import { ACADEMIC_STREAMS } from "../academic-catalogue";
import {
  AbilityIndicatorEvaluation,
  AbilityIndicatorKey,
  AttemptQuestionSnapshot,
  ChapterPerformanceBreakdown,
  DifficultyPreference,
  EvidenceConfidence,
  JuniorAttemptResult,
  JuniorDescriptiveProfile,
  OptionKey,
  QuizResponseItem,
  StreamSlug,
} from "../platform-types";

export const JUNIOR_SCORING_ALGORITHM_VERSION = "jr-v1.0.0";
export const MIN_EVIDENCE_QUESTIONS = 2;

export interface RawSubmissionAnswer {
  questionId: string;
  selectedOptionKey: OptionKey | null;
  responseTimeMs?: number | null;
}

export interface EvaluateJuniorAttemptInput {
  attemptId: string;
  participantId: string;
  participantName: string;
  sessionId: string;
  board: string;
  academicYear: string;
  standard: string;
  stream: StreamSlug;
  subjectSlug: string;
  subjectName: string;
  difficultyPreference: DifficultyPreference;
  attemptNumber: number;
  cycleNumber: number;
  startedAt: string;
  completedAt: string;
  questions: AttemptQuestionSnapshot[];
  submittedAnswers: RawSubmissionAnswer[];
}

/**
 * Pure, deterministic, auditable scoring & ability analysis engine for Junior Mode.
 *
 * Invariants:
 * 1. Never equates response speed with intelligence or ability.
 * 2. Requires >= MIN_EVIDENCE_QUESTIONS (2) mapped questions to report an ability indicator;
 *    otherwise reports "Not enough evidence yet".
 * 3. Strictly separates academic marks (/10) from descriptive game-generated style profiles.
 * 4. Reproducible: identical (questions, submittedAnswers) inputs always yield identical results.
 */
export function evaluateJuniorAttempt(
  input: EvaluateJuniorAttemptInput
): {
  result: JuniorAttemptResult;
  normalizedResponses: QuizResponseItem[];
} {
  const streamConfig = ACADEMIC_STREAMS[input.stream];
  const answerByQuestionId = new Map<string, RawSubmissionAnswer>();
  for (const ans of input.submittedAnswers) {
    answerByQuestionId.set(ans.questionId, ans);
  }

  const orderedQuestions = [...input.questions].sort(
    (a, b) => a.slotNumber - b.slotNumber
  );

  let correctAnswers = 0;
  let unansweredCount = 0;
  const normalizedResponses: QuizResponseItem[] = [];

  const chapterStats = new Map<
    number,
    { chapterNumber: number; chapter: string; attempted: number; correct: number }
  >();

  const questionReview: JuniorAttemptResult["questionReview"] = [];

  for (const q of orderedQuestions) {
    const submitted = answerByQuestionId.get(q.questionId);
    const selectedDisplayKey = submitted?.selectedOptionKey ?? null;

    const selectedOptObj = selectedDisplayKey
      ? q.presentedOptions.find((o) => o.displayKey === selectedDisplayKey) ||
        null
      : null;

    const correctOptObj =
      q.presentedOptions.find((o) => o.displayKey === q.correctDisplayKey) ||
      q.presentedOptions[0];

    const isCorrect =
      selectedDisplayKey !== null &&
      selectedDisplayKey === q.correctDisplayKey;

    if (selectedDisplayKey === null) {
      unansweredCount += 1;
    }
    if (isCorrect) {
      correctAnswers += 1;
    }

    const sanitizedTimeMs =
      typeof submitted?.responseTimeMs === "number" &&
      submitted.responseTimeMs >= 0 &&
      submitted.responseTimeMs < 3_600_000
        ? Math.round(submitted.responseTimeMs)
        : null;

    normalizedResponses.push({
      questionId: q.questionId,
      selectedDisplayKey,
      canonicalSelectedKey: selectedOptObj?.canonicalKey ?? null,
      isCorrect,
      responseTimeMs: sanitizedTimeMs,
      answeredAt: input.completedAt,
    });

    // Chapter aggregation
    const chStat = chapterStats.get(q.chapterNumber) || {
      chapterNumber: q.chapterNumber,
      chapter: q.chapter,
      attempted: 0,
      correct: 0,
    };
    chStat.attempted += 1;
    if (isCorrect) chStat.correct += 1;
    chapterStats.set(q.chapterNumber, chStat);

    questionReview.push({
      slotNumber: q.slotNumber,
      questionId: q.questionId,
      questionVersion: q.questionVersion,
      chapter: q.chapter,
      topic: q.topic,
      difficulty: q.difficulty,
      questionText: q.questionText,
      options: q.presentedOptions.map((o) => ({
        key: o.displayKey,
        text: o.text,
      })),
      selectedOptionKey: selectedDisplayKey,
      selectedOptionText: selectedOptObj?.text ?? null,
      correctOptionKey: q.correctDisplayKey,
      correctOptionText: correctOptObj.text,
      isCorrect,
      explanation: q.explanation,
      syllabusReference: q.syllabusReference,
      responseTimeMs: sanitizedTimeMs,
    });
  }

  const totalQuestions = orderedQuestions.length;
  const incorrectAnswers = Math.max(0, totalQuestions - correctAnswers);
  const accuracyPct =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const chapterBreakdown: ChapterPerformanceBreakdown[] = Array.from(
    chapterStats.values()
  )
    .sort((a, b) => a.chapterNumber - b.chapterNumber)
    .map((c) => ({
      chapterNumber: c.chapterNumber,
      chapter: c.chapter,
      attempted: c.attempted,
      correct: c.correct,
      accuracyPct:
        c.attempted > 0 ? Math.round((c.correct / c.attempted) * 100) : 0,
    }));

  // ---------------------------------------------------------------------------
  // Stream-Specific Evidence-Based Ability Indicators
  // ---------------------------------------------------------------------------
  const responseCorrectMap = new Map<string, boolean>();
  for (const r of normalizedResponses) {
    responseCorrectMap.set(r.questionId, r.isCorrect);
  }

  const abilityIndicators: AbilityIndicatorEvaluation[] =
    streamConfig.abilityIndicators.map((indicatorDef) => {
      const mappedQuestions = orderedQuestions.filter((q) =>
        q.abilityTags.includes(indicatorDef.key)
      );
      const mappedCount = mappedQuestions.length;
      const supportingIds = mappedQuestions.map((q) => q.questionId);
      const correctMappedCount = mappedQuestions.filter(
        (q) => responseCorrectMap.get(q.questionId) === true
      ).length;

      if (mappedCount < MIN_EVIDENCE_QUESTIONS) {
        return {
          key: indicatorDef.key,
          label: indicatorDef.label,
          supported: false,
          displayStatus: "Not enough evidence yet",
          qualitativeBand: "Not enough evidence yet",
          scorePct: null,
          mappedQuestionsCount: mappedCount,
          correctMappedCount,
          supportingQuestionIds: supportingIds,
          supportingEvidenceSummary:
            mappedCount === 0
              ? "No questions in this 10-question draw mapped directly to this indicator."
              : `Only 1 mapped question (${supportingIds[0]}) appeared in this draw; at least ${MIN_EVIDENCE_QUESTIONS} mapped questions are required.`,
          confidence: "insufficient",
          scoringAlgorithmVersion: JUNIOR_SCORING_ALGORITHM_VERSION,
        };
      }

      const pct = Math.round((correctMappedCount / mappedCount) * 100);
      const qualitativeBand =
        pct >= 75 ? "Strong" : pct >= 50 ? "Consistent" : "Developing";
      const confidence: EvidenceConfidence =
        mappedCount >= 4 ? "strong" : mappedCount === 3 ? "moderate" : "emerging";

      return {
        key: indicatorDef.key,
        label: indicatorDef.label,
        supported: true,
        displayStatus: `${qualitativeBand} (${correctMappedCount}/${mappedCount})`,
        qualitativeBand,
        scorePct: pct,
        mappedQuestionsCount: mappedCount,
        correctMappedCount,
        supportingQuestionIds: supportingIds,
        supportingEvidenceSummary: `Verified ${correctMappedCount} of ${mappedCount} mapped items (${supportingIds.join(", ")}). Accuracy-based only; response speed is never used to infer ability.`,
        confidence,
        scoringAlgorithmVersion: JUNIOR_SCORING_ALGORITHM_VERSION,
      };
    });

  // ---------------------------------------------------------------------------
  // Deterministic Descriptive Game Profile Selection
  // ---------------------------------------------------------------------------
  const indicatorScoreMap = new Map<AbilityIndicatorKey, number>();
  for (const ind of abilityIndicators) {
    if (ind.supported && ind.scorePct !== null) {
      indicatorScoreMap.set(ind.key, ind.scorePct);
    }
  }

  let bestProfile = streamConfig.gameProfiles[0];
  let bestScore = -1;

  for (const candidate of streamConfig.gameProfiles) {
    const scores = candidate.primaryAbilities
      .map((k) => indicatorScoreMap.get(k))
      .filter((v): v is number => v !== undefined);
    const avg =
      scores.length > 0
        ? scores.reduce((acc, s) => acc + s, 0) / scores.length
        : 0;
    if (avg > bestScore) {
      bestScore = avg;
      bestProfile = candidate;
    }
  }

  const startMs = new Date(input.startedAt).getTime();
  const endMs = new Date(input.completedAt).getTime();
  const durationSeconds =
    !Number.isNaN(startMs) && !Number.isNaN(endMs) && endMs >= startMs
      ? Math.round((endMs - startMs) / 1000)
      : null;

  const descriptiveProfile: JuniorDescriptiveProfile = {
    title: bestProfile.title,
    subtitle: bestProfile.subtitle,
    narrative:
      correctAnswers >= 8
        ? `${bestProfile.narrative} Scoring ${correctAnswers}/10 in ${input.subjectName} reflects strong command across the sampled Class 11 chapters.`
        : correctAnswers >= 5
        ? `${bestProfile.narrative} Scoring ${correctAnswers}/10 in ${input.subjectName} highlights solid conceptual footing alongside specific chapters to revisit.`
        : `This initial ${correctAnswers}/10 pass in ${input.subjectName} establishes your baseline across the sampled chapters. Review the step-by-step explanations below and attempt another 10-question draw to build momentum.`,
    disclaimer:
      "Game-generated academic style summary based solely on your responses in this 10-question Class 11 challenge. It does not measure IQ, personality, mental health, or career suitability.",
    scoringAlgorithmVersion: JUNIOR_SCORING_ALGORITHM_VERSION,
  };

  return {
    normalizedResponses,
    result: {
      attemptId: input.attemptId,
      participantId: input.participantId,
      participantName: input.participantName || "Anonymous Student",
      sessionId: input.sessionId,
      board: input.board,
      academicYear: input.academicYear,
      standard: input.standard,
      stream: input.stream,
      streamName: streamConfig.name,
      subjectSlug: input.subjectSlug,
      subjectName: input.subjectName,
      difficultyPreference: input.difficultyPreference,
      attemptNumber: input.attemptNumber,
      cycleNumber: input.cycleNumber,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      durationSeconds,
      scoringAlgorithmVersion: JUNIOR_SCORING_ALGORITHM_VERSION,
      academicPerformance: {
        scoreOutOf10: correctAnswers,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        unansweredCount,
        accuracyPct,
        chapterBreakdown,
      },
      abilityIndicators,
      descriptiveProfile,
      questionReview,
    },
  };
}

/**
 * Aggregates multi-attempt ability indicators for a participant's Junior Performance Dashboard.
 */
export function aggregateParticipantAbilityIndicators(
  stream: StreamSlug,
  completedAttempts: {
    questions: AttemptQuestionSnapshot[];
    responses: QuizResponseItem[];
  }[]
): AbilityIndicatorEvaluation[] {
  const streamConfig = ACADEMIC_STREAMS[stream];

  return streamConfig.abilityIndicators.map((indicatorDef) => {
    const supportingIds: string[] = [];
    let mappedCount = 0;
    let correctCount = 0;

    for (const att of completedAttempts) {
      const respMap = new Map<string, boolean>();
      for (const r of att.responses) {
        respMap.set(r.questionId, r.isCorrect);
      }

      for (const q of att.questions) {
        if (q.abilityTags.includes(indicatorDef.key)) {
          mappedCount += 1;
          if (!supportingIds.includes(q.questionId)) {
            supportingIds.push(q.questionId);
          }
          if (respMap.get(q.questionId) === true) {
            correctCount += 1;
          }
        }
      }
    }

    if (mappedCount < MIN_EVIDENCE_QUESTIONS) {
      return {
        key: indicatorDef.key,
        label: indicatorDef.label,
        supported: false,
        displayStatus: "Not enough evidence yet",
        qualitativeBand: "Not enough evidence yet",
        scorePct: null,
        mappedQuestionsCount: mappedCount,
        correctMappedCount: correctCount,
        supportingQuestionIds: supportingIds,
        supportingEvidenceSummary: `Insufficient cumulative evidence (${mappedCount}/${MIN_EVIDENCE_QUESTIONS} minimum mapped questions).`,
        confidence: "insufficient",
        scoringAlgorithmVersion: JUNIOR_SCORING_ALGORITHM_VERSION,
      };
    }

    const pct = Math.round((correctCount / mappedCount) * 100);
    const qualitativeBand =
      pct >= 75 ? "Strong" : pct >= 50 ? "Consistent" : "Developing";
    const confidence: EvidenceConfidence =
      mappedCount >= 8 ? "strong" : mappedCount >= 4 ? "moderate" : "emerging";

    return {
      key: indicatorDef.key,
      label: indicatorDef.label,
      supported: true,
      displayStatus: `${qualitativeBand} (${pct}% · ${correctCount}/${mappedCount})`,
      qualitativeBand,
      scorePct: pct,
      mappedQuestionsCount: mappedCount,
      correctMappedCount: correctCount,
      supportingQuestionIds: supportingIds,
      supportingEvidenceSummary: `Computed across ${mappedCount} mapped responses (${correctCount} accurate) in ${completedAttempts.length} completed attempt(s).`,
      confidence,
      scoringAlgorithmVersion: JUNIOR_SCORING_ALGORITHM_VERSION,
    };
  });
}

