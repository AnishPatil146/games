/**
 * THE UNWRITTEN — Junior Academy 3.0
 * Evidence-Based Improvement Verification & Diagnostic Reassessment Engine
 * 
 * Verifies whether students genuinely improve after completing recommended
 * prerequisite revision, visual learning, and guided practice.
 * 
 * Non-negotiable rule: Completing a lesson or opening an animation NEVER marks
 * a weakness resolved. Improvement can only be confirmed through fresh,
 * comparable reassessments with authentic evidence.
 */

export type LearningProgressState =
  | "NOT_ASSESSED"
  | "WEAKNESS_IDENTIFIED"
  | "REVISION_RECOMMENDED"
  | "REVISION_IN_PROGRESS"
  | "READY_FOR_REASSESSMENT"
  | "IMPROVEMENT_CONFIRMED"
  | "STILL_NEEDS_SUPPORT"
  | "INSUFFICIENT_EVIDENCE";

export interface AssessmentBaseline {
  timestamp: string;
  attemptId: string;
  conceptId: string;
  conceptTitle: string;
  subjectSlug: string;
  classLevel: 10 | 11 | 12;
  totalQuestions: number;
  correctQuestions: number;
  accuracyPct: number;
  errorTypesObserved: string[];
  weakestSubskill: string;
}

export interface ReassessmentAttempt {
  timestamp: string;
  reassessmentAttemptId: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracyPct: number;
  errorTypesObserved: string[];
}

export interface ImprovementEvaluationResult {
  conceptId: string;
  conceptTitle: string;
  progressState: LearningProgressState;
  baselineAccuracy: number;
  reassessmentAccuracy: number;
  accuracyDelta: number; // e.g. +40%
  isStatisticallySignificant: boolean;
  resolvedErrors: string[];
  persistentErrors: string[];
  evidenceSummary: string;
  nextRecommendedAction: {
    actionType: "ADVANCE_TO_HARDER_LEVEL" | "REVISE_PREREQUISITE" | "ANOTHER_REASSESSMENT";
    label: string;
    description: string;
    route: string;
  };
}

/**
 * Evaluates student progress before and after targeted revision.
 * Compares baseline diagnostic records with fresh reassessment outcomes.
 */
export function evaluateStudentImprovement(
  baseline: AssessmentBaseline,
  reassessment: ReassessmentAttempt | null,
  revisionCompleted: boolean
): ImprovementEvaluationResult {
  // If no reassessment has been taken yet
  if (!reassessment) {
    const state: LearningProgressState = revisionCompleted
      ? "READY_FOR_REASSESSMENT"
      : baseline.accuracyPct < 60
      ? "REVISION_RECOMMENDED"
      : "WEAKNESS_IDENTIFIED";

    return {
      conceptId: baseline.conceptId,
      conceptTitle: baseline.conceptTitle,
      progressState: state,
      baselineAccuracy: baseline.accuracyPct,
      reassessmentAccuracy: 0,
      accuracyDelta: 0,
      isStatisticallySignificant: false,
      resolvedErrors: [],
      persistentErrors: baseline.errorTypesObserved,
      evidenceSummary: revisionCompleted
        ? `You have completed all foundational revision steps for ${baseline.conceptTitle}. Take the fresh Reassessment Challenge to prove your improvement.`
        : `Baseline diagnostic showed ${baseline.accuracyPct}% accuracy with persistent issues in ${baseline.weakestSubskill}. Revision is recommended before retrying.`,
      nextRecommendedAction: {
        actionType: revisionCompleted ? "ANOTHER_REASSESSMENT" : "REVISE_PREREQUISITE",
        label: revisionCompleted ? "Take Fresh Reassessment" : "Start Targeted Revision",
        description: revisionCompleted
          ? "5 fresh unrepeated questions at comparable difficulty to verify concept retention."
          : "Work through step-by-step simulations and prerequisite concepts.",
        route: `/junior?tab=${revisionCompleted ? "tests" : "visual-lab"}&concept=${baseline.conceptId}`,
      },
    };
  }

  // Calculate score delta
  const delta = reassessment.accuracyPct - baseline.accuracyPct;
  const isSampleAdequate = reassessment.totalQuestions >= 4 && baseline.totalQuestions >= 4;

  // Detect resolved vs persistent error patterns
  const resolved = baseline.errorTypesObserved.filter(
    (err) => !reassessment.errorTypesObserved.includes(err)
  );
  const persistent = baseline.errorTypesObserved.filter((err) =>
    reassessment.errorTypesObserved.includes(err)
  );

  let state: LearningProgressState = "STILL_NEEDS_SUPPORT";
  let isSignificant = false;
  let summary = "";

  if (!isSampleAdequate) {
    state = "INSUFFICIENT_EVIDENCE";
    summary = `Reassessment sample size (${reassessment.totalQuestions} questions) is too small to reliably establish mastery. Complete a full 5-question test block.`;
  } else if (reassessment.accuracyPct >= 75 && delta >= 20) {
    state = "IMPROVEMENT_CONFIRMED";
    isSignificant = true;
    summary = `Verified Genuine Improvement! Your accuracy increased from ${baseline.accuracyPct}% to ${reassessment.accuracyPct}% (+${delta}% gain). Errors in ${resolved.join(", ") || "core calculation"} were successfully eliminated.`;
  } else if (reassessment.accuracyPct >= 65 && delta >= 10) {
    state = "IMPROVEMENT_CONFIRMED";
    isSignificant = true;
    summary = `Moderate Improvement Confirmed (+${delta}% gain). Baseline errors partially resolved; continue with medium-difficulty questions to lock in retention.`;
  } else {
    state = "STILL_NEEDS_SUPPORT";
    isSignificant = false;
    summary = `Reassessment accuracy remains at ${reassessment.accuracyPct}% (baseline: ${baseline.accuracyPct}%). Persistent issues in ${persistent.join(", ") || baseline.weakestSubskill} indicate an unresolved foundational prerequisite gap.`;
  }

  return {
    conceptId: baseline.conceptId,
    conceptTitle: baseline.conceptTitle,
    progressState: state,
    baselineAccuracy: baseline.accuracyPct,
    reassessmentAccuracy: reassessment.accuracyPct,
    accuracyDelta: delta,
    isStatisticallySignificant: isSignificant,
    resolvedErrors: resolved,
    persistentErrors: persistent,
    evidenceSummary: summary,
    nextRecommendedAction:
      state === "IMPROVEMENT_CONFIRMED"
        ? {
            actionType: "ADVANCE_TO_HARDER_LEVEL",
            label: "Advance to Competitive Entrance Level",
            description: "You have conquered foundational board mastery. Challenge yourself with multi-step JEE / NEET problems.",
            route: `/junior?tab=practice&concept=${baseline.conceptId}&difficulty=hard`,
          }
        : {
            actionType: "REVISE_PREREQUISITE",
            label: "Explore Foundational Prerequisite Lab",
            description: "Directly address underlying concept dependencies in the Visual Learning Lab.",
            route: `/junior?tab=visual-lab&concept=${baseline.conceptId}`,
          },
  };
}

