/**
 * THE UNWRITTEN — Junior Academy 3.0
 * Mistake & Error Notebook Engine
 * 
 * Automatically captures student errors during Practice and Test attempts,
 * classifies them into 9 diagnostic categories, and tracks remediation.
 * Mistakes are marked resolved ONLY when a fresh reassessment confirms mastery.
 */

export type MistakeCategory =
  | "CONCEPTUAL_MISUNDERSTANDING"
  | "FORMULA_RECALL_ERROR"
  | "FORMULA_SELECTION_ERROR"
  | "CALCULATION_ERROR"
  | "UNIT_CONVERSION_ERROR"
  | "SIGN_ERROR"
  | "DIAGRAM_INTERPRETATION_ERROR"
  | "CARELESS_MISTAKE"
  | "TIME_MANAGEMENT_ISSUE";

export interface StudentMistakeRecord {
  id: string;
  timestamp: string;
  questionId: string;
  questionText: string;
  subjectSlug: string;
  subjectName: string;
  chapterTitle: string;
  conceptId: string;
  conceptTitle: string;
  formulaId?: string;
  studentAnswer: string;
  correctAnswer: string;
  stepExplanation: string;
  category: MistakeCategory;
  resolved: boolean;
  resolvedAt?: string;
  resolvedAttemptId?: string;
}

export const MISTAKE_CATEGORY_LABELS: Record<MistakeCategory, { label: string; badgeColor: string; description: string }> = {
  CONCEPTUAL_MISUNDERSTANDING: {
    label: "Conceptual Flaw",
    badgeColor: "bg-purple-950/70 text-purple-300 border-purple-500/40",
    description: "Fundamental misinterpretation of physical law, geometric theorem, or accounting principle.",
  },
  FORMULA_RECALL_ERROR: {
    label: "Formula Recall",
    badgeColor: "bg-red-950/70 text-red-300 border-red-500/40",
    description: "Missing mathematical term, incorrect exponent, or misremembered algebraic formula.",
  },
  FORMULA_SELECTION_ERROR: {
    label: "Wrong Formula Choice",
    badgeColor: "bg-rose-950/70 text-rose-300 border-rose-500/40",
    description: "Selecting a formula whose prerequisite applicability conditions were not met by the problem.",
  },
  CALCULATION_ERROR: {
    label: "Arithmetic Slip",
    badgeColor: "bg-amber-950/70 text-amber-300 border-amber-500/40",
    description: "Execution error during multiplication, long division, square roots, or fraction addition.",
  },
  UNIT_CONVERSION_ERROR: {
    label: "Unit Mismatch",
    badgeColor: "bg-yellow-950/70 text-yellow-300 border-yellow-500/40",
    description: "Failure to convert given quantities into coherent SI base units (e.g. km/h to m/s, cm to m).",
  },
  SIGN_ERROR: {
    label: "Sign Convention",
    badgeColor: "bg-orange-950/70 text-orange-300 border-orange-500/40",
    description: "Inverted Cartesian coordinate signs (+ vs -), lens focal lengths, or debit/credit directions.",
  },
  DIAGRAM_INTERPRETATION_ERROR: {
    label: "Diagram Reading",
    badgeColor: "bg-blue-950/70 text-blue-300 border-blue-500/40",
    description: "Misreading circuit schematics, vector diagrams, biological labels, or economic shift curves.",
  },
  CARELESS_MISTAKE: {
    label: "Misread Prompt",
    badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-600",
    description: "Overlooking keywords like 'INCORRECT', 'EXCEPT', or 'NOT APPLICABLE' in the question stem.",
  },
  TIME_MANAGEMENT_ISSUE: {
    label: "Time Rush",
    badgeColor: "bg-cyan-950/70 text-cyan-300 border-cyan-500/40",
    description: "Hasty random guess under countdown timer pressure without completing required steps.",
  },
};

// Seed authentic mistake records for immediate exploration
export const INITIAL_MISTAKE_NOTEBOOK: StudentMistakeRecord[] = [
  {
    id: "mst-001",
    timestamp: "2026-11-05T14:20:00.000Z",
    questionId: "q-c10-phy-res-1",
    questionText: "Two resistors of 6 Ω and 3 Ω are connected in parallel across a 12 V source. Calculate the total current drawn.",
    subjectSlug: "physics",
    subjectName: "Science & Physics",
    chapterTitle: "Current Electricity",
    conceptId: "concept-series-parallel-resistors",
    conceptTitle: "Parallel and Series Resistor Networks",
    formulaId: "formula-ohms-law",
    studentAnswer: "1.33 A",
    correctAnswer: "6.0 A",
    stepExplanation: "Total equivalent resistance R_eq = (6 × 3)/(6 + 3) = 18/9 = 2 Ω. Then by Ohm's Law: I = V / R_eq = 12 V / 2 Ω = 6 A. (Student mistakenly summed resistances directly: 6 + 3 = 9 Ω, giving 12/9 = 1.33 A).",
    category: "FORMULA_SELECTION_ERROR",
    resolved: false,
  },
  {
    id: "mst-002",
    timestamp: "2026-11-05T16:45:00.000Z",
    questionId: "q-c11-math-diff-1",
    questionText: "Evaluate the derivative of f(x) = x³ · sin(x) with respect to x.",
    subjectSlug: "mathematics",
    subjectName: "Mathematics",
    chapterTitle: "Limits and Derivatives",
    conceptId: "concept-diff-rules",
    conceptTitle: "Product Rule of Differentiation",
    studentAnswer: "3x² · cos(x)",
    correctAnswer: "3x² · sin(x) + x³ · cos(x)",
    stepExplanation: "The derivative of a product u · v requires the Product Rule: d/dx(uv) = u'v + uv'. Differentiating both terms simultaneously without summing produces an incorrect result.",
    category: "FORMULA_RECALL_ERROR",
    resolved: false,
  },
  {
    id: "mst-003",
    timestamp: "2026-11-06T10:15:00.000Z",
    questionId: "q-c10-m-quad-1",
    questionText: "Find the discriminant of 2x² - 4x + 3 = 0 and determine the nature of its roots.",
    subjectSlug: "mathematics",
    subjectName: "Mathematics Standard",
    chapterTitle: "Quadratic Equations",
    conceptId: "concept-poly-factorization",
    conceptTitle: "Quadratic Discriminant Analysis",
    studentAnswer: "Δ = 40 (Two distinct real roots)",
    correctAnswer: "Δ = -8 (No real roots / complex roots)",
    stepExplanation: "Discriminant Δ = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Because Δ < 0, there are no real roots. (Student made a sign error: calculated 16 - (-24) = 40).",
    category: "SIGN_ERROR",
    resolved: false,
  },
];

