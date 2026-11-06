/**
 * THE UNWRITTEN — The Academy Academic Models & Curriculum Types
 *
 * Defines:
 * - Competitive examination profiles & marking schemes
 * - Formula sheets & key theorems across Science, Commerce & Arts
 * - Academic achievements, ranks, and mastery metrics
 * - Navigation modes for Board Prep vs Competitive Exams
 */

import { StreamSlug } from "@/lib/platform-types";

export type AcademyTab =
  | "home"
  | "board_prep"
  | "competitive_exams"
  | "practice_arena"
  | "mock_hall"
  | "revision_centre"
  | "achievements"
  | "analytics";

export interface CompetitiveExamProfile {
  id: "jee" | "neet" | "mht_cet" | "cuet" | "nda" | "ca_foundation" | "clat";
  name: string;
  fullTitle: string;
  targetStream: StreamSlug | "all";
  patternSummary: string;
  durationMinutes: number;
  totalMarks: number;
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  subjectsCovered: string[];
  description: string;
  difficultyLevels: ("Concept Builder (Easy)" | "Exam Standard (Medium)" | "National Ranker (Hard)")[];
  accentHex: string;
}

export const COMPETITIVE_EXAMS: CompetitiveExamProfile[] = [
  {
    id: "jee",
    name: "JEE Main & Advanced",
    fullTitle: "Joint Entrance Examination (Engineering)",
    targetStream: "science",
    patternSummary: "75 Questions · Single Correct & Numerical Value Types",
    durationMinutes: 180,
    totalMarks: 300,
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    subjectsCovered: ["Mathematics", "Physics", "Chemistry"],
    description: "National benchmark for IITs, NITs, and IIITs. Emphasizes rigorous analytical multi-concept synthesis and calculus-heavy mechanics.",
    difficultyLevels: ["Concept Builder (Easy)", "Exam Standard (Medium)", "National Ranker (Hard)"],
    accentHex: "#4C6B50",
  },
  {
    id: "neet",
    name: "NEET UG",
    fullTitle: "National Eligibility cum Entrance Test (Medical)",
    targetStream: "science",
    patternSummary: "180 Questions from 200 · High Speed & Factual Precision",
    durationMinutes: 200,
    totalMarks: 720,
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    subjectsCovered: ["Biology (Botany & Zoology)", "Physics", "Chemistry"],
    description: "Premier medical entrance exam. Prioritizes NCERT biological architecture, reaction mechanisms, and numerical physics.",
    difficultyLevels: ["Concept Builder (Easy)", "Exam Standard (Medium)", "National Ranker (Hard)"],
    accentHex: "#2E5E4E",
  },
  {
    id: "mht_cet",
    name: "MHT-CET",
    fullTitle: "Maharashtra State Common Entrance Test",
    targetStream: "science",
    patternSummary: "150 Questions · State Board Aligned · Zero Negative Marking",
    durationMinutes: 180,
    totalMarks: 200,
    markingScheme: { correct: 2, incorrect: 0, unattempted: 0 },
    subjectsCovered: ["Mathematics", "Physics", "Chemistry", "Biology"],
    description: "Direct gateway to top engineering and pharmacy institutes across Maharashtra (COEP, VJTI, SPIT). Aligned with FYJC & HSC State Board syllabus.",
    difficultyLevels: ["Concept Builder (Easy)", "Exam Standard (Medium)", "National Ranker (Hard)"],
    accentHex: "#6B5B3E",
  },
  {
    id: "cuet",
    name: "CUET UG",
    fullTitle: "Common University Entrance Test",
    targetStream: "all",
    patternSummary: "Domain-Specific MCQs + General Test + Language Skills",
    durationMinutes: 60,
    totalMarks: 200,
    markingScheme: { correct: 5, incorrect: -1, unattempted: 0 },
    subjectsCovered: ["Commerce", "Humanities", "Science", "General Reasoning"],
    description: "Centralized admission for central and prestigious universities (DU, JNU, BHU) across Science, Commerce, and Humanities domains.",
    difficultyLevels: ["Concept Builder (Easy)", "Exam Standard (Medium)", "National Ranker (Hard)"],
    accentHex: "#4A5868",
  },
  {
    id: "nda",
    name: "NDA & NA",
    fullTitle: "National Defence Academy Examination (UPSC)",
    targetStream: "science",
    patternSummary: "Paper I: Mathematics (300M) + Paper II: GAT (600M)",
    durationMinutes: 150,
    totalMarks: 900,
    markingScheme: { correct: 2.5, incorrect: -0.83, unattempted: 0 },
    subjectsCovered: ["Mathematics", "Physics", "General Studies", "English"],
    description: "Officer entrance testing rapid mathematical deduction, spatial geometry, and comprehensive scientific application.",
    difficultyLevels: ["Concept Builder (Easy)", "Exam Standard (Medium)", "National Ranker (Hard)"],
    accentHex: "#5E4A3B",
  },
  {
    id: "ca_foundation",
    name: "CA Foundation",
    fullTitle: "Institute of Chartered Accountants of India Entry Examination",
    targetStream: "commerce",
    patternSummary: "4 Papers · Principles of Accounting, Business Laws & Mathematics",
    durationMinutes: 120,
    totalMarks: 100,
    markingScheme: { correct: 1, incorrect: -0.25, unattempted: 0 },
    subjectsCovered: ["Book-Keeping & Accountancy", "Business Economics", "Quantitative Aptitude"],
    description: "Gateway to the Chartered Accountancy qualification. Tests rigorous double-entry ledgers, mercantile law, and commercial statistics.",
    difficultyLevels: ["Concept Builder (Easy)", "Exam Standard (Medium)", "National Ranker (Hard)"],
    accentHex: "#7A5A30",
  },
  {
    id: "clat",
    name: "CLAT UG",
    fullTitle: "Common Law Admission Test (NLUs)",
    targetStream: "arts",
    patternSummary: "120 Comprehension-Based Passage Questions",
    durationMinutes: 120,
    totalMarks: 120,
    markingScheme: { correct: 1, incorrect: -0.25, unattempted: 0 },
    subjectsCovered: ["Legal Reasoning", "Current Affairs", "Logical Deduction", "English"],
    description: "Admission to National Law Universities. Emphasizes critical text interpretation, constitutional principles, and philosophical analysis.",
    difficultyLevels: ["Concept Builder (Easy)", "Exam Standard (Medium)", "National Ranker (Hard)"],
    accentHex: "#54465B",
  },
];

export interface FormulaReferenceItem {
  id: string;
  subjectSlug: string;
  category: string;
  title: string;
  latexFormula: string;
  explanation: string;
  applicabilityNote: string;
}

export const FORMULA_REFERENCE_CATALOGUE: FormulaReferenceItem[] = [
  // Physics
  {
    id: "f-phy-01",
    subjectSlug: "sci-physics",
    category: "Mechanics",
    title: "Equations of Kinematics",
    latexFormula: "v = u + at \\quad \\text{and} \\quad s = ut + \\frac{1}{2}at^2 \\quad \\text{and} \\quad v^2 = u^2 + 2as",
    explanation: "Fundamental kinematic relations for constant linear acceleration $a$, initial velocity $u$, displacement $s$, and elapsed time $t$.",
    applicabilityNote: "Valid only under rectilinear motion with uniform acceleration.",
  },
  {
    id: "f-phy-02",
    subjectSlug: "sci-physics",
    category: "Gravitation",
    title: "Newton's Universal Gravitation & Orbital Velocity",
    latexFormula: "F = G\\frac{m_1 m_2}{r^2}, \\quad v_o = \\sqrt{\\frac{GM}{R+h}}, \\quad v_e = \\sqrt{2gR}",
    explanation: "Gravitational force field between masses, circular satellite orbital speed at altitude $h$, and planetary escape velocity $v_e$.",
    applicabilityNote: "Requires point mass or spherical shell symmetry.",
  },
  {
    id: "f-phy-03",
    subjectSlug: "sci-physics",
    category: "Optics & Waves",
    title: "Snell's Law of Refraction & Lens Maker's Formula",
    latexFormula: "n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2), \\quad \\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)",
    explanation: "Refractive boundary redirection between media $n_1, n_2$, and focal power calculation based on surface radii of curvature $R_1, R_2$.",
    applicabilityNote: "Apply Cartesian sign convention rigorously (+ right, - left).",
  },
  // Mathematics
  {
    id: "f-mat-01",
    subjectSlug: "sci-mathematics",
    category: "Trigonometry",
    title: "Compound Angle & Product-to-Sum Identities",
    latexFormula: "\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B, \\quad \\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 2\\cos^2\\theta - 1",
    explanation: "Core angle transformations essential for evaluating non-standard arguments and integrating trigonometric polynomials.",
    applicabilityNote: "Angles measured in radians for calculus applications.",
  },
  {
    id: "f-mat-02",
    subjectSlug: "sci-mathematics",
    category: "Calculus",
    title: "Fundamental Derivatives & Chain Rule",
    latexFormula: "\\frac{d}{dx}(x^n) = n x^{n-1}, \\quad \\frac{d}{dx}(e^x) = e^x, \\quad \\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)",
    explanation: "Standard differentiation rules governing instantaneous rates of change and composite function gradients.",
    applicabilityNote: "Function must be continuous and smooth in the open domain.",
  },
  // Chemistry
  {
    id: "f-chm-01",
    subjectSlug: "sci-chemistry",
    category: "Physical Chemistry",
    title: "Ideal Gas Law & Dalton's Partial Pressures",
    latexFormula: "PV = nRT = \\frac{m}{M}RT, \\quad P_{\\text{total}} = \\sum p_i = \\sum x_i P_{\\text{total}}",
    explanation: "State equation for ideal gases where $R = 8.314 \\text{ J}\\cdot\\text{mol}^{-1}\\cdot\\text{K}^{-1}$, and partial pressure decomposition via mole fractions $x_i$.",
    applicabilityNote: "Absolute temperature $T$ must always be converted to Kelvin ($T = t^\\circ\\text{C} + 273.15$).",
  },
  // Commerce
  {
    id: "f-com-01",
    subjectSlug: "com-accountancy",
    category: "Double-Entry Book-Keeping",
    title: "The Fundamental Accounting Equation",
    latexFormula: "\\text{Assets} = \\text{Liabilities} + \\text{Capital} + (\\text{Revenue} - \\text{Expenses})",
    explanation: "The foundational dual-aspect identity underpinning every double-entry balance sheet and financial ledger.",
    applicabilityNote: "Every journal entry must produce equal debits and credits.",
  },
];

export interface AcademicBadge {
  id: string;
  title: string;
  subtitle: string;
  category: "mastery" | "streak" | "accuracy" | "deduction";
  requiredPoints: number;
  iconName: string;
  unlocked: boolean;
}

export const ACADEMY_BADGES: AcademicBadge[] = [
  {
    id: "b-first-step",
    title: "Academy Matriculation",
    subtitle: "Completed your first 10-question evaluation.",
    category: "mastery",
    requiredPoints: 10,
    iconName: "GraduationCap",
    unlocked: true,
  },
  {
    id: "b-perfect-score",
    title: "Flawless Deduction",
    subtitle: "Scored 10/10 in a timed examination cycle.",
    category: "accuracy",
    requiredPoints: 100,
    iconName: "Award",
    unlocked: false,
  },
  {
    id: "b-math-genius",
    title: "Euler's Heir",
    subtitle: "Mastered 50 questions across Mathematics and Statistics.",
    category: "mastery",
    requiredPoints: 250,
    iconName: "Sigma",
    unlocked: false,
  },
  {
    id: "b-phys-master",
    title: "Newton's Disciple",
    subtitle: "Resolved complex mechanics and circuit dynamics with >85% accuracy.",
    category: "mastery",
    requiredPoints: 250,
    iconName: "Atom",
    unlocked: false,
  },
  {
    id: "b-ledger-king",
    title: "Balance Sheet Sovereign",
    subtitle: "Zero balance sheet discrepancies across 30 accounting problems.",
    category: "mastery",
    requiredPoints: 200,
    iconName: "FileSpreadsheet",
    unlocked: false,
  },
  {
    id: "b-constitution-scholar",
    title: "Constitutional Jurist",
    subtitle: "Commanded Political Science & Legal Reasoning with high precision.",
    category: "deduction",
    requiredPoints: 200,
    iconName: "Scale",
    unlocked: false,
  },
  {
    id: "b-three-day-streak",
    title: "Tenacious Scholar",
    subtitle: "Sustained active study cycles across 3 consecutive sessions.",
    category: "streak",
    requiredPoints: 150,
    iconName: "Flame",
    unlocked: true,
  },
  {
    id: "b-national-ranker",
    title: "Entrance Vanguard",
    subtitle: "Completed a full Mock Examination under strict timed conditions.",
    category: "accuracy",
    requiredPoints: 300,
    iconName: "Trophy",
    unlocked: false,
  },
];

export function calculateStudentRank(totalXP: number): {
  title: string;
  level: number;
  progressPct: number;
  nextThreshold: number;
} {
  if (totalXP < 100) {
    return { title: "Novice Scholar", level: 1, progressPct: Math.round((totalXP / 100) * 100), nextThreshold: 100 };
  } else if (totalXP < 300) {
    return { title: "Axiom Apprentice", level: 2, progressPct: Math.round(((totalXP - 100) / 200) * 100), nextThreshold: 300 };
  } else if (totalXP < 700) {
    return { title: "Theorem Investigator", level: 3, progressPct: Math.round(((totalXP - 300) / 400) * 100), nextThreshold: 700 };
  } else if (totalXP < 1500) {
    return { title: "Senior Fellow of Logic", level: 4, progressPct: Math.round(((totalXP - 700) / 800) * 100), nextThreshold: 1500 };
  } else {
    return { title: "Grand Master of Deduction", level: 5, progressPct: 100, nextThreshold: 1500 };
  }
}

