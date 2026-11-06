/**
 * THE UNWRITTEN — Junior Academy 3.0
 * Prerequisite Weakness Detection & Foundational Knowledge Gap Engine
 * 
 * Maps concept dependency DAGs across Class 10, 11, and 12 curricula.
 * When a student struggles with an advanced concept (e.g. Differentiation),
 * this engine evaluates evidence across foundational dependencies (Functions, Limits, Algebra)
 * to pinpoint root causes rather than issuing shallow "study harder" advice.
 */

export type EvidenceConfidence =
  | "STRONG_EVIDENCE"
  | "DEVELOPING"
  | "NEEDS_IMPROVEMENT"
  | "INSUFFICIENT_DATA";

export interface ConceptPrerequisite {
  conceptId: string;
  conceptTitle: string;
  chapterTitle: string;
  subjectSlug: string;
  classLevel: 10 | 11 | 12;
  importance: "CRITICAL" | "RECOMMENDED" | "COMPLEMENTARY";
  rationale: string;
}

export interface PrerequisiteDiagnosticItem {
  prerequisite: ConceptPrerequisite;
  attemptsCount: number;
  accuracyPct: number;
  confidence: EvidenceConfidence;
  isGap: boolean;
  recommendedAction: string;
}

export interface PrerequisiteDiagnosticResult {
  targetConceptId: string;
  targetConceptTitle: string;
  targetSubject: string;
  overallTargetStatus: "WEAKNESS_CONFIRMED" | "DEVELOPING" | "MASTERY";
  foundationalGapsIdentified: PrerequisiteDiagnosticItem[];
  hasRootCauseGaps: boolean;
  summaryExplanation: string;
  recommendedRevisionPath: {
    stepNumber: number;
    title: string;
    type: "PREREQUISITE_REVISION" | "CONCEPT_REVISION" | "GUIDED_PRACTICE" | "REASSESSMENT";
    resourceLink: string;
  }[];
}

/**
 * Persisted Prerequisite Dependency Mappings across CBSE and State Curricula
 */
export const PREREQUISITE_DEPENDENCY_GRAPH: Record<string, ConceptPrerequisite[]> = {
  // Calculus: Differentiation
  "concept-diff-rules": [
    {
      conceptId: "concept-limits",
      conceptTitle: "Limits and Indeterminate Forms",
      chapterTitle: "Limits and Derivatives",
      subjectSlug: "mathematics",
      classLevel: 11,
      importance: "CRITICAL",
      rationale: "Derivatives are formally defined as the limit of the difference quotient [f(x+h) - f(x)]/h as h -> 0.",
    },
    {
      conceptId: "concept-functions-domain",
      conceptTitle: "Functions, Domain, and Range",
      chapterTitle: "Relations and Functions",
      subjectSlug: "mathematics",
      classLevel: 11,
      importance: "CRITICAL",
      rationale: "Understanding function composition, continuity, and differentiability criteria requires solid domain mastery.",
    },
    {
      conceptId: "concept-poly-factorization",
      conceptTitle: "Algebraic Manipulation & Factorization",
      chapterTitle: "Polynomials",
      subjectSlug: "mathematics",
      classLevel: 10,
      importance: "RECOMMENDED",
      rationale: "Rationalizing expressions and simplifying quotients is mandatory during derivative calculations.",
    },
  ],

  // Calculus: Integration by Parts
  "concept-integration-parts": [
    {
      conceptId: "concept-diff-rules",
      conceptTitle: "Differentiation Rules (Product & Chain)",
      chapterTitle: "Continuity and Differentiability",
      subjectSlug: "mathematics",
      classLevel: 12,
      importance: "CRITICAL",
      rationale: "Integration by parts is the inverse of the differential product rule: d(uv) = u dv + v du.",
    },
    {
      conceptId: "concept-trig-identities",
      conceptTitle: "Trigonometric Compound Angle Identities",
      chapterTitle: "Trigonometric Functions",
      subjectSlug: "mathematics",
      classLevel: 11,
      importance: "RECOMMENDED",
      rationale: "Trigonometric substitutions and product-to-sum expansions are required in integral evaluation.",
    },
  ],

  // Physics: Current Electricity - Series & Parallel Resistances
  "concept-series-parallel-resistors": [
    {
      conceptId: "concept-ohms-law",
      conceptTitle: "Ohm's Law & Electrical Resistance (V = IR)",
      chapterTitle: "Current Electricity",
      subjectSlug: "physics",
      classLevel: 10,
      importance: "CRITICAL",
      rationale: "Ohmic relationships and voltage drops across circuit segments cannot be resolved without V = IR.",
    },
    {
      conceptId: "concept-electric-potential",
      conceptTitle: "Electric Potential Difference & Kirchhoff's Junction Law",
      chapterTitle: "Electrostatic Potential",
      subjectSlug: "physics",
      classLevel: 12,
      importance: "CRITICAL",
      rationale: "Conservation of charge at junctions and conservation of energy in loops dictate parallel and series branch behavior.",
    },
  ],

  // Physics: Projectile Motion
  "concept-projectile-motion": [
    {
      conceptId: "concept-kinematics-1d",
      conceptTitle: "Kinematic Equations of Motion (v = u + at, s = ut + 1/2at^2)",
      chapterTitle: "Motion in a Straight Line",
      subjectSlug: "physics",
      classLevel: 11,
      importance: "CRITICAL",
      rationale: "Horizontal and vertical components of projectile trajectories operate as decoupled 1D equations of motion.",
    },
    {
      conceptId: "concept-vector-resolution",
      conceptTitle: "Vector Resolution into Orthogonal Components (cos θ, sin θ)",
      chapterTitle: "Motion in a Plane",
      subjectSlug: "physics",
      classLevel: 11,
      importance: "CRITICAL",
      rationale: "Splitting initial velocity into u_x = u cos θ and u_y = u sin θ is the foundational first step.",
    },
  ],

  // Chemistry: Chemical Equilibrium & Le Chatelier
  "concept-le-chatelier": [
    {
      conceptId: "concept-mole-stoichiometry",
      conceptTitle: "The Mole Concept & Reaction Stoichiometry",
      chapterTitle: "Some Basic Concepts of Chemistry",
      subjectSlug: "chemistry",
      classLevel: 11,
      importance: "CRITICAL",
      rationale: "Molar concentrations and reaction quotient expressions (Q_c) depend directly on stoichiometric coefficients.",
    },
    {
      conceptId: "concept-thermo-enthalpy",
      conceptTitle: "Enthalpy Changes & Exothermic vs Endothermic Shifts (ΔH)",
      chapterTitle: "Chemical Thermodynamics",
      subjectSlug: "chemistry",
      classLevel: 11,
      importance: "RECOMMENDED",
      rationale: "Temperature effects on equilibrium constants depend on whether the reaction is endothermic or exothermic.",
    },
  ],

  // Commerce: Financial Final Accounts
  "concept-final-accounts": [
    {
      conceptId: "concept-trial-balance",
      conceptTitle: "Trial Balance Preparation & Error Detection",
      chapterTitle: "Trial Balance and Rectification of Errors",
      subjectSlug: "accountancy",
      classLevel: 11,
      importance: "CRITICAL",
      rationale: "Trading and Profit & Loss accounts cannot balance without an accurate, verified trial balance.",
    },
    {
      conceptId: "concept-double-entry-rules",
      conceptTitle: "Double-Entry Bookkeeping & Accounting Equation",
      chapterTitle: "Introduction to Accounting",
      subjectSlug: "accountancy",
      classLevel: 11,
      importance: "CRITICAL",
      rationale: "Understanding debit/credit classifications (Assets, Liabilities, Capital, Incomes, Expenses) is foundational.",
    },
  ],
};

/**
 * Retrieves configured prerequisites for any concept
 */
export function getPrerequisitesForConcept(conceptId: string): ConceptPrerequisite[] {
  return PREREQUISITE_DEPENDENCY_GRAPH[conceptId] || [];
}

/**
 * Diagnoses whether a student's difficulty with a concept is caused by
 * foundational prerequisite gaps based on actual historical assessment evidence.
 */
export function diagnoseFoundationalGaps(
  targetConceptId: string,
  targetConceptTitle: string,
  targetSubject: string,
  historyMap: Record<string, { attempts: number; correct: number }>
): PrerequisiteDiagnosticResult {
  const prerequisites = getPrerequisitesForConcept(targetConceptId);
  const diagnosticItems: PrerequisiteDiagnosticItem[] = [];

  for (const prereq of prerequisites) {
    const record = historyMap[prereq.conceptId] || { attempts: 0, correct: 0 };
    const accuracy = record.attempts > 0 ? Math.round((record.correct / record.attempts) * 100) : 0;

    let confidence: EvidenceConfidence = "INSUFFICIENT_DATA";
    let isGap = false;
    let action = "Attempt diagnostic questions to verify baseline understanding.";

    if (record.attempts >= 4) {
      if (accuracy < 55) {
        confidence = "STRONG_EVIDENCE";
        isGap = true;
        action = `Critical foundational gap detected (${accuracy}% accuracy across ${record.attempts} questions). Must revise before proceeding.`;
      } else if (accuracy < 75) {
        confidence = "DEVELOPING";
        isGap = true;
        action = `Partial mastery (${accuracy}% accuracy). Review key formulas and concept misconceptions.`;
      } else {
        confidence = "STRONG_EVIDENCE";
        isGap = false;
        action = `Prerequisite is strong (${accuracy}% accuracy). Root cause is likely specific to the advanced concept itself.`;
      }
    } else if (record.attempts > 0) {
      confidence = "DEVELOPING";
      isGap = accuracy < 60;
      action = `Limited attempts (${record.attempts}). Complete 3 targeted practice questions to solidify confidence.`;
    }

    diagnosticItems.push({
      prerequisite: prereq,
      attemptsCount: record.attempts,
      accuracyPct: accuracy,
      confidence,
      isGap,
      recommendedAction: action,
    });
  }

  const detectedGaps = diagnosticItems.filter((item) => item.isGap);
  const hasRootCauseGaps = detectedGaps.length > 0;

  // Synthesize intelligent explanation
  let summary = "";
  if (!prerequisites.length) {
    summary = `"${targetConceptTitle}" is a foundational concept with no prior prerequisites mapped. Focus directly on definition, solved examples, and core formulas.`;
  } else if (hasRootCauseGaps) {
    const gapNames = detectedGaps.map((g) => `"${g.prerequisite.conceptTitle}" (${g.accuracyPct}% accuracy)`).join(" and ");
    summary = `Your difficulty with ${targetConceptTitle} is influenced by underlying gaps in ${gapNames}. Rather than blindly retrying advanced questions, mastering these prerequisites first will dramatically accelerate comprehension.`;
  } else {
    summary = `Your foundational prerequisites for ${targetConceptTitle} are verified strong. Your difficulty is specific to advanced multi-step execution or sign conventions in this chapter.`;
  }

  // Generate step-by-step revision sequence
  const revisionPath: PrerequisiteDiagnosticResult["recommendedRevisionPath"] = [];
  let step = 1;

  for (const gap of detectedGaps) {
    revisionPath.push({
      stepNumber: step++,
      title: `Revise Foundational Prerequisite: ${gap.prerequisite.conceptTitle}`,
      type: "PREREQUISITE_REVISION",
      resourceLink: `/junior?tab=concepts&concept=${gap.prerequisite.conceptId}`,
    });
  }

  revisionPath.push({
    stepNumber: step++,
    title: `Study Core Explanations & Visualisation for ${targetConceptTitle}`,
    type: "CONCEPT_REVISION",
    resourceLink: `/junior?tab=visual-lab&concept=${targetConceptId}`,
  });

  revisionPath.push({
    stepNumber: step++,
    title: `Complete 5-Question Guided Practice with 3-Tier Hints`,
    type: "GUIDED_PRACTICE",
    resourceLink: `/junior?tab=practice&concept=${targetConceptId}`,
  });

  revisionPath.push({
    stepNumber: step++,
    title: `Take Fresh 5-Question Reassessment Hall Challenge`,
    type: "REASSESSMENT",
    resourceLink: `/junior?tab=tests&concept=${targetConceptId}`,
  });

  return {
    targetConceptId,
    targetConceptTitle,
    targetSubject,
    overallTargetStatus: hasRootCauseGaps ? "WEAKNESS_CONFIRMED" : "DEVELOPING",
    foundationalGapsIdentified: diagnosticItems,
    hasRootCauseGaps,
    summaryExplanation: summary,
    recommendedRevisionPath: revisionPath,
  };
}

