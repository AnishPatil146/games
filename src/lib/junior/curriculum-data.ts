/**
 * THE UNWRITTEN — THE ACADEMY 2.0 CURRICULUM REGISTRY
 *
 * Authoritative curriculum models and syllabus data for:
 * - Class 10 (Board Foundation: CBSE & Maharashtra State Board)
 * - Class 11 (Concept Mastery: Science, Commerce, Arts)
 * - Class 12 (Board + Entrance Preparation: Science, Commerce, Arts)
 *
 * Source Authorities:
 * - CBSE Academic Curriculum 2026-27 (cbseacademic.nic.in)
 * - CBSE Class X Scheme of Studies (skilleducation.cbseit.in)
 * - Maharashtra State Board of Secondary and Higher Secondary Education (MSBSHSE / Balbharati)
 */

export type AcademicClassLevel = 10 | 11 | 12;

export type AcademicBoardId = "CBSE" | "MSBSHSE";

export type AcademicStreamId = "science" | "commerce" | "arts" | "general";

export interface CurriculumTopic {
  id: string;
  title: string;
  slug: string;
  learningObjectives: string[];
  hasFormulas: boolean;
  hasDiagrams: boolean;
  conceptCount: number;
}

export interface CurriculumChapter {
  number: number;
  title: string;
  slug: string;
  description: string;
  weightageMarks?: number;
  topics: CurriculumTopic[];
}

export interface AcademicSubjectDefinition {
  id: string;
  slug: string;
  name: string;
  code: string;
  classLevel: AcademicClassLevel;
  board: AcademicBoardId;
  stream: AcademicStreamId;
  isElective: boolean;
  description: string;
  accentColor: string;
  iconName: string;
  theoryMarks?: number;
  practicalMarks?: number;
  chapters: CurriculumChapter[];
}

export interface BoardProfile {
  id: AcademicBoardId;
  name: string;
  fullName: string;
  jurisdiction: string;
  supportedClasses: AcademicClassLevel[];
  academicYear: string;
  description: string;
}

export const ACADEMIC_BOARDS: Record<AcademicBoardId, BoardProfile> = {
  CBSE: {
    id: "CBSE",
    name: "CBSE",
    fullName: "Central Board of Secondary Education",
    jurisdiction: "All-India & International Affiliated Schools",
    supportedClasses: [10, 11, 12],
    academicYear: "2026-27",
    description: "National curriculum framework aligned with NCERT guidelines, National Education Policy (NEP), and entrance prerequisites (JEE, NEET, CUET).",
  },
  MSBSHSE: {
    id: "MSBSHSE",
    name: "Maharashtra State Board",
    fullName: "Maharashtra State Board of Secondary & Higher Secondary Education",
    jurisdiction: "State of Maharashtra (SSC & HSC)",
    supportedClasses: [10, 11, 12],
    academicYear: "2026-27",
    description: "Official State Board curriculum based on Balbharati textbooks, MHT-CET syllabus alignment, and HSC examination boards.",
  },
};

// ============================================================================
// CLASS 10 CURRICULUM (CBSE & STATE BOARD)
// ============================================================================

export const CLASS_10_SUBJECTS: AcademicSubjectDefinition[] = [
  // 1. Mathematics Standard (CBSE Code 041)
  {
    id: "c10-cbse-math-standard",
    slug: "c10-math-standard",
    name: "Mathematics Standard",
    code: "041",
    classLevel: 10,
    board: "CBSE",
    stream: "general",
    isElective: false,
    description: "Rigorous analytical mathematics curriculum required for students intending to pursue Mathematics in Class 11–12 (Science/Commerce).",
    accentColor: "#4C6B50",
    iconName: "Sigma",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Real Numbers",
        slug: "real-numbers",
        description: "Fundamental Theorem of Arithmetic, prime factorisation, proving irrationality of √2, √3, √5, decimal expansions.",
        weightageMarks: 6,
        topics: [
          { id: "c10-m-1-1", title: "Fundamental Theorem of Arithmetic", slug: "fundamental-theorem-arithmetic", learningObjectives: ["Express composite numbers as products of primes", "Compute HCF and LCM using prime factorisation"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
          { id: "c10-m-1-2", title: "Irrationality Proofs", slug: "irrationality-proofs", learningObjectives: ["Construct contradiction proofs for non-terminating non-repeating numbers"], hasFormulas: true, hasDiagrams: false, conceptCount: 2 },
        ],
      },
      {
        number: 2,
        title: "Polynomials",
        slug: "polynomials",
        description: "Zeros of a polynomial, geometrical meaning of zeros, relationship between zeros and coefficients of quadratic polynomials.",
        weightageMarks: 6,
        topics: [
          { id: "c10-m-2-1", title: "Geometric Meaning of Zeros", slug: "geometric-zeros", learningObjectives: ["Interpret parabolic intersections with the x-axis"], hasFormulas: true, hasDiagrams: true, conceptCount: 2 },
          { id: "c10-m-2-2", title: "Relationship Between Zeros and Coefficients", slug: "zeros-coefficients-relation", learningObjectives: ["Apply sum α + β = -b/a and product αβ = c/a in factorisation"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 3,
        title: "Pair of Linear Equations in Two Variables",
        slug: "linear-equations-two-variables",
        description: "Graphical and algebraic methods: substitution, elimination, consistency and inconsistency conditions.",
        weightageMarks: 6,
        topics: [
          { id: "c10-m-3-1", title: "Graphical Solution & Consistency", slug: "graphical-method-consistency", learningObjectives: ["Identify intersecting, parallel, and coincident lines via ratio comparisons"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
          { id: "c10-m-3-2", title: "Algebraic Elimination & Substitution", slug: "algebraic-methods", learningObjectives: ["Solve simultaneous linear systems algebraically"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 4,
        title: "Quadratic Equations",
        slug: "quadratic-equations",
        description: "Standard form ax² + bx + c = 0, solution by factorisation, quadratic formula, nature of roots via discriminant.",
        weightageMarks: 6,
        topics: [
          { id: "c10-m-4-1", title: "Quadratic Formula & Discriminant", slug: "quadratic-formula-discriminant", learningObjectives: ["Derive and apply x = (-b ± √(b² - 4ac))/(2a)", "Evaluate root nature via D = b² - 4ac"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 5,
        title: "Arithmetic Progressions (AP)",
        slug: "arithmetic-progressions",
        description: "nth term of an AP, sum of the first n terms of an AP, application to day-to-day contextual word problems.",
        weightageMarks: 6,
        topics: [
          { id: "c10-m-5-1", title: "nth Term of an AP", slug: "nth-term-ap", learningObjectives: ["Calculate unknown terms via an = a + (n-1)d"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
          { id: "c10-m-5-2", title: "Sum of First n Terms", slug: "sum-first-n-terms", learningObjectives: ["Compute Sn = (n/2)[2a + (n-1)d] and Sn = (n/2)[a + l]"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 6,
        title: "Triangles & Similarity",
        slug: "triangles-similarity",
        description: "Basic Proportionality Theorem (Thales), criteria for similarity of triangles (AAA, SSS, SAS), geometric proofs.",
        weightageMarks: 8,
        topics: [
          { id: "c10-m-6-1", title: "Basic Proportionality Theorem (BPT)", slug: "basic-proportionality-theorem", learningObjectives: ["Prove and apply Thales theorem and its converse"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
          { id: "c10-m-6-2", title: "Similarity Criteria", slug: "similarity-criteria", learningObjectives: ["Apply AAA, SSS, and SAS similarity conditions"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 7,
        title: "Coordinate Geometry",
        slug: "coordinate-geometry",
        description: "Distance formula, Section formula (internal division), collinearity and geometric centroid applications.",
        weightageMarks: 6,
        topics: [
          { id: "c10-m-7-1", title: "Distance Formula", slug: "distance-formula", learningObjectives: ["Calculate distance between (x1, y1) and (x2, y2)"], hasFormulas: true, hasDiagrams: true, conceptCount: 2 },
          { id: "c10-m-7-2", title: "Section Formula", slug: "section-formula", learningObjectives: ["Locate coordinates dividing a segment in ratio m1:m2"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 8,
        title: "Introduction to Trigonometry",
        slug: "introduction-to-trigonometry",
        description: "Trigonometric ratios of acute angles, values of trigonometric ratios of 0°, 30°, 45°, 60°, and 90°, fundamental identities.",
        weightageMarks: 8,
        topics: [
          { id: "c10-m-8-1", title: "Trigonometric Ratios & Specific Angles", slug: "trig-ratios-angles", learningObjectives: ["Evaluate sin, cos, tan, cosec, sec, cot across standard angles"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c10-m-8-2", title: "Pythagorean Trigonometric Identities", slug: "trig-identities", learningObjectives: ["Prove and verify sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 9,
        title: "Applications of Trigonometry (Heights and Distances)",
        slug: "heights-and-distances",
        description: "Angle of elevation, angle of depression, simple problems involving heights and distances with max two right triangles.",
        weightageMarks: 4,
        topics: [
          { id: "c10-m-9-1", title: "Angle of Elevation and Depression", slug: "elevation-depression", learningObjectives: ["Model real-world observation problems geometrically"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 10,
        title: "Circles & Tangents",
        slug: "circles-tangents",
        description: "Tangent to a circle at point of contact, theorem: lengths of tangents drawn from an external point to a circle are equal.",
        weightageMarks: 6,
        topics: [
          { id: "c10-m-10-1", title: "Tangent Perpendicularity & Tangent Lengths", slug: "tangent-theorems", learningObjectives: ["Prove tangent is perpendicular to radius at point of contact", "Prove external tangent equality"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 11,
        title: "Areas Related to Circles",
        slug: "areas-related-to-circles",
        description: "Area of sectors and segments of a circle, problems involving combinations of plane figures with central angles 60°, 90°, 120°.",
        weightageMarks: 4,
        topics: [
          { id: "c10-m-11-1", title: "Sector and Segment Areas", slug: "sector-segment-area", learningObjectives: ["Compute (θ/360°)·πr² and arc length (θ/360°)·2πr"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 12,
        title: "Surface Areas and Volumes",
        slug: "surface-areas-and-volumes",
        description: "Surface areas and volumes of combinations of two solids: cubes, cuboids, spheres, hemispheres, and right circular cylinders/cones.",
        weightageMarks: 6,
        topics: [
          { id: "c10-m-12-1", title: "Combination of Solid Figures", slug: "combination-solids", learningObjectives: ["Calculate total surface area and volume of composite mechanical models"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 13,
        title: "Statistics",
        slug: "statistics",
        description: "Mean, median, and mode of grouped data, direct and assumed mean methods, modal class and median class identification.",
        weightageMarks: 6,
        topics: [
          { id: "c10-m-13-1", title: "Central Tendency for Grouped Data", slug: "grouped-data-central-tendency", learningObjectives: ["Calculate mean via Σfidi/Σfi, mode formula, and median formula"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
        ],
      },
      {
        number: 14,
        title: "Probability",
        slug: "probability",
        description: "Classical definition of probability, simple problems on finding the probability of an event, complementary events.",
        weightageMarks: 4,
        topics: [
          { id: "c10-m-14-1", title: "Theoretical Probability", slug: "theoretical-probability", learningObjectives: ["Apply P(E) = n(E)/n(S) where 0 ≤ P(E) ≤ 1"], hasFormulas: true, hasDiagrams: false, conceptCount: 2 },
        ],
      },
    ],
  },

  // 2. Mathematics Basic (CBSE Code 241)
  {
    id: "c10-cbse-math-basic",
    slug: "c10-math-basic",
    name: "Mathematics Basic",
    code: "241",
    classLevel: 10,
    board: "CBSE",
    stream: "general",
    isElective: true,
    description: "Foundational mathematics focusing on core concepts, direct formula evaluation, and conceptual mastery without complex multi-tier algebraic derivations.",
    accentColor: "#3B5C6B",
    iconName: "Calculator",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Real Numbers & Arithmetic Foundations",
        slug: "real-numbers-basic",
        description: "Prime factorisation, HCF and LCM calculations, basic terminating and non-terminating decimals.",
        weightageMarks: 6,
        topics: [
          { id: "c10-mb-1-1", title: "Prime Factorisation & HCF/LCM", slug: "prime-factor-hcf-lcm", learningObjectives: ["Direct calculation of HCF and LCM"], hasFormulas: true, hasDiagrams: false, conceptCount: 2 },
        ],
      },
      {
        number: 2,
        title: "Polynomials",
        slug: "polynomials-basic",
        description: "Finding zeros of quadratic polynomials and verifying relationship with coefficients.",
        weightageMarks: 5,
        topics: [
          { id: "c10-mb-2-1", title: "Zeros of Quadratic Polynomials", slug: "zeros-quadratic-basic", learningObjectives: ["Find roots by splitting the middle term"], hasFormulas: true, hasDiagrams: true, conceptCount: 2 },
        ],
      },
      {
        number: 3,
        title: "Pair of Linear Equations in Two Variables",
        slug: "linear-equations-basic",
        description: "Solving pairs of linear equations by substitution and elimination methods, ratio conditions.",
        weightageMarks: 6,
        topics: [
          { id: "c10-mb-3-1", title: "Substitution & Elimination Solvers", slug: "linear-systems-direct", learningObjectives: ["Solve simultaneous equations directly"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 4,
        title: "Quadratic Equations",
        slug: "quadratic-equations-basic",
        description: "Solving quadratics via factorization and the quadratic formula, evaluating the discriminant.",
        weightageMarks: 6,
        topics: [
          { id: "c10-mb-4-1", title: "Quadratic Formula Application", slug: "quadratics-direct", learningObjectives: ["Apply x = (-b ± √(b² - 4ac))/(2a)"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 5,
        title: "Arithmetic Progressions",
        slug: "arithmetic-progressions-basic",
        description: "Finding the nth term and sum of the first n terms of an arithmetic progression.",
        weightageMarks: 6,
        topics: [
          { id: "c10-mb-5-1", title: "AP nth Term & Sum Evaluations", slug: "ap-evaluations-basic", learningObjectives: ["Apply an = a + (n-1)d and Sn = (n/2)[2a + (n-1)d]"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 6,
        title: "Triangles",
        slug: "triangles-basic",
        description: "Basic proportionality theorem applications and similarity criteria.",
        weightageMarks: 6,
        topics: [
          { id: "c10-mb-6-1", title: "Thales Theorem & Triangle Similarity", slug: "triangle-similarity-basic", learningObjectives: ["Apply BPT ratio calculations"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 7,
        title: "Coordinate Geometry",
        slug: "coordinate-geometry-basic",
        description: "Distance formula, section formula, and midpoint calculations on the Cartesian plane.",
        weightageMarks: 6,
        topics: [
          { id: "c10-mb-7-1", title: "Distance and Midpoint Formulas", slug: "distance-midpoint-direct", learningObjectives: ["Evaluate distances between coordinates"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 8,
        title: "Introduction to Trigonometry",
        slug: "intro-trigonometry-basic",
        description: "Trigonometric ratios of acute angles, values of standard angles (0°, 30°, 45°, 60°, 90°).",
        weightageMarks: 6,
        topics: [
          { id: "c10-mb-8-1", title: "Standard Angle Trigonometry", slug: "trig-standard-angles", learningObjectives: ["Evaluate sin, cos, tan for standard angles"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 9,
        title: "Some Applications of Trigonometry",
        slug: "applications-trigonometry-basic",
        description: "Simple problems on heights and distances with single right-angled triangles.",
        weightageMarks: 5,
        topics: [
          { id: "c10-mb-9-1", title: "Single-Observer Heights & Distances", slug: "heights-distances-basic", learningObjectives: ["Solve basic angle of elevation models"], hasFormulas: true, hasDiagrams: true, conceptCount: 2 },
        ],
      },
      {
        number: 10,
        title: "Circles",
        slug: "circles-basic",
        description: "Tangents to a circle, number of tangents from a point, tangent perpendicular to radius.",
        weightageMarks: 6,
        topics: [
          { id: "c10-mb-10-1", title: "Tangent Theorems & Lengths", slug: "circle-tangents-direct", learningObjectives: ["Apply equal tangent lengths from external points"], hasFormulas: true, hasDiagrams: true, conceptCount: 2 },
        ],
      },
      {
        number: 11,
        title: "Areas Related to Circles",
        slug: "areas-related-circles-basic",
        description: "Area of sectors and segments of a circle with angles 60° and 90°.",
        weightageMarks: 4,
        topics: [
          { id: "c10-mb-11-1", title: "Sector Area & Arc Length", slug: "sector-arc-direct", learningObjectives: ["Compute (θ/360) × πr² and (θ/360) × 2πr"], hasFormulas: true, hasDiagrams: true, conceptCount: 2 },
        ],
      },
      {
        number: 12,
        title: "Surface Areas and Volumes",
        slug: "surface-areas-volumes-basic",
        description: "Surface areas and volumes of combinations of cylinders, cones, and spheres.",
        weightageMarks: 6,
        topics: [
          { id: "c10-mb-12-1", title: "Solid Mensuration Calculations", slug: "solid-mensuration-basic", learningObjectives: ["Calculate total surface area and volume of basic solids"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 13,
        title: "Statistics",
        slug: "statistics-basic",
        description: "Mean, median, and mode of grouped data using direct computational formulas.",
        weightageMarks: 8,
        topics: [
          { id: "c10-mb-13-1", title: "Direct Mean, Median & Mode", slug: "direct-central-tendency", learningObjectives: ["Compute mean = Σfx / Σf"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 14,
        title: "Probability",
        slug: "probability-basic",
        description: "Theoretical probability of events, coin tosses, dice rolls, and card draws.",
        weightageMarks: 4,
        topics: [
          { id: "c10-mb-14-1", title: "Single-Stage Classical Probability", slug: "classical-probability-direct", learningObjectives: ["Compute P(E) = favorable outcomes / total outcomes"], hasFormulas: true, hasDiagrams: false, conceptCount: 2 },
        ],
      },
    ],
  },

  // 3. Science (CBSE Code 086)
  {
    id: "c10-cbse-science",
    slug: "c10-science",
    name: "Science (Physics, Chemistry & Biology)",
    code: "086",
    classLevel: 10,
    board: "CBSE",
    stream: "general",
    isElective: false,
    description: "Integrated experimental and theoretical science exploring chemical reactions, physiological life systems, geometric optics, and electromagnetism.",
    accentColor: "#2E5E4E",
    iconName: "Atom",
    chapters: [
      {
        number: 1,
        title: "Chemical Reactions and Equations",
        slug: "chemical-reactions-equations",
        description: "Chemical equation, balanced chemical equation, implications of balanced chemical equation, combination, decomposition, displacement, double displacement, precipitation, endothermic/exothermic reactions, oxidation and reduction.",
        weightageMarks: 6,
        topics: [
          { id: "c10-s-1-1", title: "Balancing Chemical Equations", slug: "balancing-equations", learningObjectives: ["Apply Law of Conservation of Mass to balance stoichiometric coefficients"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
          { id: "c10-s-1-2", title: "Types of Chemical Reactions", slug: "types-reactions", learningObjectives: ["Distinguish combination, decomposition, displacement, and redox mechanisms"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
        ],
      },
      {
        number: 2,
        title: "Acids, Bases and Salts",
        slug: "acids-bases-salts",
        description: "Definitions in terms of furnishing H+ and OH- ions, general properties, neutralisation, pH scale definition, importance of pH in everyday life, preparation and uses of Sodium Hydroxide, Bleaching powder, Baking soda, Washing soda, and Plaster of Paris.",
        weightageMarks: 6,
        topics: [
          { id: "c10-s-2-1", title: "pH Scale & Neutralisation", slug: "ph-scale-neutralisation", learningObjectives: ["Calculate logarithmic hydrogen ion concentration scale 0-14"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
          { id: "c10-s-2-2", title: "Important Salts of Commercial Importance", slug: "commercial-salts", learningObjectives: ["Explain manufacture of chlor-alkali process, gypsum, and POP"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
        ],
      },
      {
        number: 3,
        title: "Metals and Non-metals",
        slug: "metals-and-non-metals",
        description: "Properties of metals and non-metals, reactivity series, formation and properties of ionic compounds, basic metallurgical processes, corrosion and its prevention.",
        weightageMarks: 7,
        topics: [
          { id: "c10-s-3-1", title: "Reactivity Series & Ionic Bonding", slug: "reactivity-series-ionic", learningObjectives: ["Predict displacement reactions using reactivity order", "Draw electron dot structures for NaCl, MgCl2"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 4,
        title: "Carbon and its Compounds",
        slug: "carbon-and-its-compounds",
        description: "Covalent bonding in carbon compounds, versatile nature of carbon (catenation, tetravalency), homologous series, nomenclature of carbon compounds containing functional groups, saturated and unsaturated hydrocarbons, chemical properties, ethanol and ethanoic acid.",
        weightageMarks: 8,
        topics: [
          { id: "c10-s-4-1", title: "Tetravalency, Catenation & Homologous Series", slug: "carbon-versatility", learningObjectives: ["Explain self-linking catenation and general molecular formulas CnH2n+2, CnH2n, CnH2n-2"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c10-s-4-2", title: "Combustion, Saponification & Esterification", slug: "carbon-reactions", learningObjectives: ["Formulate esterification between ethanol and ethanoic acid", "Explain micelle structure in soaps"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 5,
        title: "Life Processes",
        slug: "life-processes",
        description: "What are life processes? Nutrition (autotrophic and heterotrophic), respiration (aerobic and anaerobic, ATP), transportation in humans and plants, excretion in humans and plants.",
        weightageMarks: 9,
        topics: [
          { id: "c10-s-5-1", title: "Autotrophic Photosynthesis & Human Digestion", slug: "nutrition-digestion", learningObjectives: ["Trace enzyme action (pepsin, trypsin, amylase) along alimentary canal"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c10-s-5-2", title: "Circulatory System & Nephron Excretion", slug: "circulation-excretion", learningObjectives: ["Diagram double circulation through 4-chambered human heart", "Explain nephron ultrafiltration and selective reabsorption"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 6,
        title: "Control and Coordination",
        slug: "control-and-coordination",
        description: "Tropic movements in plants, introduction to plant hormones, control and coordination in animals: nervous system, voluntary, involuntary, and reflex action, chemical coordination: animal hormones.",
        weightageMarks: 6,
        topics: [
          { id: "c10-s-6-1", title: "Neuron Anatomy & Reflex Arc", slug: "neuron-reflex-arc", learningObjectives: ["Diagram synapse transmission and reflex arc trajectory"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
          { id: "c10-s-6-2", title: "Endocrine Glands & Phytohormones", slug: "endocrine-phytohormones", learningObjectives: ["Contrast auxin, gibberellin, cytokinin with insulin, thyroxine, adrenaline"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 7,
        title: "How do Organisms Reproduce?",
        slug: "how-do-organisms-reproduce",
        description: "Reproduction in animals and plants (asexual and sexual), reproductive health: need and methods of family planning, safe sex vs HIV/AIDS, child bearing and women’s health.",
        weightageMarks: 7,
        topics: [
          { id: "c10-s-7-1", title: "Asexual Modes & Angiosperm Pollination", slug: "asexual-plant-reproduction", learningObjectives: ["Diagram binary fission, budding, spore formation, and double fertilisation in flowering plants"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
          { id: "c10-s-7-2", title: "Human Reproductive Systems", slug: "human-reproduction", learningObjectives: ["Trace male and female reproductive organ physiology and gametogenesis"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 8,
        title: "Heredity & Evolution",
        slug: "heredity",
        description: "Heredity, Mendel’s contribution: laws for inheritance of traits, sex determination in human beings.",
        weightageMarks: 4,
        topics: [
          { id: "c10-s-8-1", title: "Mendelian Genetics & Monohybrid Cross", slug: "mendelian-genetics", learningObjectives: ["Construct Punnett squares for 3:1 phenotypic and 1:2:1 genotypic ratios", "Explain XX and XY chromosomal sex determination"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 9,
        title: "Light – Reflection and Refraction",
        slug: "light-reflection-refraction",
        description: "Reflection of light by curved surfaces, images formed by spherical mirrors, centre of curvature, principal axis, principal focus, focal length, mirror formula, magnification, refraction, laws of refraction, refractive index, refraction of light by spherical lens, image formed by spherical lenses, lens formula, magnification, power of a lens.",
        weightageMarks: 10,
        topics: [
          { id: "c10-s-9-1", title: "Spherical Mirrors & Mirror Formula", slug: "spherical-mirrors", learningObjectives: ["Construct ray diagrams for concave and convex mirrors", "Solve 1/f = 1/v + 1/u and m = -v/u"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c10-s-9-2", title: "Snell's Law, Lenses & Lens Power", slug: "lenses-refraction-power", learningObjectives: ["Calculate refractive index n = c/v = sin i/sin r", "Solve lens formula 1/f = 1/v - 1/u and P = 1/f (dioptres)"], hasFormulas: true, hasDiagrams: true, conceptCount: 5 },
        ],
      },
      {
        number: 10,
        title: "The Human Eye and the Colourful World",
        slug: "human-eye-colourful-world",
        description: "Functioning of a lens in human eye, defects of vision and their corrections (myopia, hypermetropia, presbyopia), application of spherical mirrors and lenses, refraction of light through a prism, dispersion of light, scattering of light, applications in daily life (Tyndall effect, blue sky, red sunset).",
        weightageMarks: 5,
        topics: [
          { id: "c10-s-10-1", title: "Eye Anatomy & Refractive Defects Correction", slug: "eye-defects-correction", learningObjectives: ["Prescribe concave lens for myopia and convex lens for hypermetropia"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
          { id: "c10-s-10-2", title: "Prism Dispersion & Atmospheric Scattering", slug: "dispersion-scattering", learningObjectives: ["Explain Rayleigh scattering I ∝ 1/λ⁴ and rainbow formation"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 11,
        title: "Electricity",
        slug: "electricity",
        description: "Electric current, potential difference and electric current, Ohm’s law, resistance, resistivity, factors on which the resistance of a conductor depends, series combination of resistors, parallel combination of resistors and its applications in daily life, heating effect of electric current and its applications in daily life, electric power, interrelation between P, V, I and R.",
        weightageMarks: 8,
        topics: [
          { id: "c10-s-11-1", title: "Ohm's Law, Resistance & Resistivity", slug: "ohms-law-resistance", learningObjectives: ["Verify V = IR", "Calculate resistance R = ρL/A"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c10-s-11-2", title: "Series-Parallel Equivalent & Joule's Heating", slug: "circuits-joules-heating", learningObjectives: ["Compute Rs = R1+R2 and 1/Rp = 1/R1+1/R2", "Calculate thermal dissipation H = I²Rt and power P = VI = V²/R"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 12,
        title: "Magnetic Effects of Electric Current",
        slug: "magnetic-effects-electric-current",
        description: "Magnetic field, field lines, field due to a current carrying conductor, field due to current carrying coil or solenoid, force on current carrying conductor, Fleming’s Left Hand Rule, direct current, alternating current: frequency of AC, advantage of AC over DC, domestic electric circuits.",
        weightageMarks: 6,
        topics: [
          { id: "c10-s-12-1", title: "Right-Hand Thumb Rule & Solenoid Fields", slug: "field-lines-solenoid", learningObjectives: ["Diagram magnetic field patterns of straight conductors and solenoids"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
          { id: "c10-s-12-2", title: "Fleming's Left-Hand Rule & Domestic Wiring", slug: "flemings-rule-domestic-circuits", learningObjectives: ["Determine Lorentz force direction F = BIl", "Trace live, neutral, earth wires, fuse, and grounding safety"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 13,
        title: "Our Environment",
        slug: "our-environment",
        description: "Eco-system, environmental problems, ozone depletion, waste production and their solutions, biodegradable and non-biodegradable substances, 10 percent energy law.",
        weightageMarks: 5,
        topics: [
          { id: "c10-s-13-1", title: "Trophic Levels, 10% Energy Law & Biomagnification", slug: "trophic-levels-energy-law", learningObjectives: ["Trace Lindeman's 10% trophic transfer law and pesticide accumulation"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
          { id: "c10-s-13-2", title: "Ozone Layer Depletion & Waste Management", slug: "ozone-depletion-waste", learningObjectives: ["Explain catalytic CFC breakdown of O3 into O2"], hasFormulas: false, hasDiagrams: false, conceptCount: 2 },
        ],
      },
    ],
  },

  // 4. Social Science (CBSE Code 087)
  {
    id: "c10-cbse-social-science",
    slug: "c10-social-science",
    name: "Social Science",
    code: "087",
    classLevel: 10,
    board: "CBSE",
    stream: "general",
    isElective: false,
    description: "Integrated history, contemporary geography, democratic politics, and economic development of modern India and the world.",
    accentColor: "#6B5B3E",
    iconName: "Globe",
    chapters: [
      {
        number: 1,
        title: "The Rise of Nationalism in Europe",
        slug: "nationalism-in-europe",
        description: "The French Revolution and the idea of the nation, the making of nationalism in Europe, the age of revolutions: 1830–1848, the making of Germany and Italy, visualising the nation, nationalism and imperialism.",
        weightageMarks: 6,
        topics: [
          { id: "c10-ss-1-1", title: "French Revolution & Napoleonic Code of 1804", slug: "french-revolution-napoleon", learningObjectives: ["Analyze civil equality, property rights, and abolition of feudal privileges"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
          { id: "c10-ss-1-2", title: "Unification of Germany & Italy", slug: "unification-germany-italy", learningObjectives: ["Evaluate Bismarck's blood and iron diplomacy and Cavour-Garibaldi alliance"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 2,
        title: "Nationalism in India",
        slug: "nationalism-in-india",
        description: "First World War, Khilafat and Non-Cooperation, differing strands within the movement, towards Civil Disobedience (Salt March), the sense of collective belonging.",
        weightageMarks: 6,
        topics: [
          { id: "c10-ss-2-1", title: "Satyagraha, Rowlatt Act & Jallianwala Bagh", slug: "satyagraha-rowlatt", learningObjectives: ["Chronicle Champaran, Kheda, Ahmedabad, and 1919 martial law massacre"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
          { id: "c10-ss-2-2", title: "Non-Cooperation, Dandi Salt March & Poona Pact", slug: "dandi-march-poona-pact", learningObjectives: ["Analyze 240-mile Salt March from Sabarmati to Dandi and Gandhi-Ambedkar agreement"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 3,
        title: "Resources and Development",
        slug: "resources-and-development",
        description: "Concept of resources, classification of resources, development of resources, resource planning in India, land resources, land utilisation, land degradation and conservation measures, soil as a resource, classification of soils.",
        weightageMarks: 5,
        topics: [
          { id: "c10-ss-3-1", title: "Land Utilisation & Soil Types of India", slug: "land-utilisation-soils", learningObjectives: ["Categorize Alluvial, Black (Regur), Red/Yellow, Laterite, and Arid soils on maps"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 4,
        title: "Agriculture",
        slug: "agriculture",
        description: "Types of farming, cropping pattern (Rabi, Kharif, Zaid), major crops (rice, wheat, millets, pulses, sugarcane, tea, coffee), technological and institutional reforms.",
        weightageMarks: 5,
        topics: [
          { id: "c10-ss-4-1", title: "Cropping Seasons & Geographical Conditions", slug: "cropping-seasons-crops", learningObjectives: ["Compare temperature, rainfall, and soil requirements for major food and cash crops"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 5,
        title: "Power Sharing & Federalism",
        slug: "power-sharing-federalism",
        description: "Case studies of Belgium and Sri Lanka, why power sharing is desirable, forms of power sharing, what is federalism, what makes India a federal country, decentralisation in India.",
        weightageMarks: 6,
        topics: [
          { id: "c10-ss-5-1", title: "Belgium Accommodation vs Sri Lanka Majoritarianism", slug: "belgium-sri-lanka-models", learningObjectives: ["Contrast constitutional power sharing against majoritarian conflict"], hasFormulas: false, hasDiagrams: false, conceptCount: 3 },
          { id: "c10-ss-5-2", title: "Union, State & Concurrent Lists & 73rd/74th Amendments", slug: "indian-federalism-lists", learningObjectives: ["Categorize subjects across constitutional lists and explain Panchayati Raj institutions"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 6,
        title: "Development & Sectors of the Indian Economy",
        slug: "development-sectors-economy",
        description: "What development promises – different people different goals, national development, per capita income, Human Development Index (HDI), primary, secondary, and tertiary sectors, historical change in sectors, rising importance of tertiary sector, creating employment.",
        weightageMarks: 6,
        topics: [
          { id: "c10-ss-6-1", title: "Per Capita Income & HDI Indicators", slug: "per-capita-income-hdi", learningObjectives: ["Evaluate UNDP Human Development Index dimensions (health, education, standard of living)"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
          { id: "c10-ss-6-2", title: "Three Sectors of Economy & Disguised Unemployment", slug: "three-sectors-unemployment", learningObjectives: ["Analyze GDP contribution versus workforce percentage across primary, secondary, and tertiary sectors"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
    ],
  },

  // 5. English Language & Literature (CBSE Code 184)
  {
    id: "c10-cbse-english",
    slug: "c10-english",
    name: "English Language & Literature",
    code: "184",
    classLevel: 10,
    board: "CBSE",
    stream: "general",
    isElective: false,
    description: "Reading comprehension, formal discursive and creative writing, integrated grammar, and analytical prose and poetry from First Flight and Footprints Without Feet.",
    accentColor: "#54465B",
    iconName: "BookOpen",
    chapters: [
      {
        number: 1,
        title: "Reading Comprehension & Critical Analysis",
        slug: "reading-comprehension",
        description: "Unseen discursive and factual passages with inference, vocabulary, and textual interpretation.",
        weightageMarks: 20,
        topics: [
          { id: "c10-en-1-1", title: "Discursive & Case-Based Passage Evaluation", slug: "discursive-passages", learningObjectives: ["Infer author tone, underlying claims, and evaluate evidence-based claims"], hasFormulas: false, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 2,
        title: "Writing Skills & Applied Grammar",
        slug: "writing-skills-grammar",
        description: "Formal letter writing (editor, complaint, enquiry, order), analytical paragraph writing based on charts/cues, tenses, modals, subject-verb concord, reported speech.",
        weightageMarks: 20,
        topics: [
          { id: "c10-en-2-1", title: "Formal Letters & Analytical Paragraph Writing", slug: "formal-letters-analytical-paragraphs", learningObjectives: ["Structure formal business/editorial letters and construct data-driven paragraph arguments"], hasFormulas: false, hasDiagrams: false, conceptCount: 3 },
          { id: "c10-en-2-2", title: "Reported Speech & Subject-Verb Concord", slug: "reported-speech-grammar", learningObjectives: ["Convert direct to indirect speech statements, questions, and commands"], hasFormulas: false, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 3,
        title: "Literature: First Flight Prose & Poetry",
        slug: "first-flight-literature",
        description: "A Letter to God, Nelson Mandela: Long Walk to Freedom, Two Stories About Flying, From the Diary of Anne Frank, Dust of Snow, Fire and Ice, A Tiger in the Zoo, Amanda.",
        weightageMarks: 20,
        topics: [
          { id: "c10-en-3-1", title: "Core Prose Analysis & Character Rationales", slug: "core-prose-analysis", learningObjectives: ["Analyze character motivation, figurative motifs, and philosophical subtext"], hasFormulas: false, hasDiagrams: false, conceptCount: 4 },
        ],
      },
    ],
  },

  // 6. Information Technology (Skill Subject Code 402)
  {
    id: "c10-cbse-it",
    slug: "c10-information-technology",
    name: "Information Technology",
    code: "402",
    classLevel: 10,
    board: "CBSE",
    stream: "general",
    isElective: true,
    description: "Applied computing covering digital documentation, electronic spreadsheets, relational database management systems (RDBMS / LibreOffice Base), and web applications security.",
    accentColor: "#3E5B6B",
    iconName: "Cpu",
    chapters: [
      {
        number: 1,
        title: "Digital Documentation (Advanced)",
        slug: "digital-documentation-advanced",
        description: "Create and apply styles in the document, insert and use images, create and use template, create and customise table of contents, implement mail merge.",
        weightageMarks: 8,
        topics: [
          { id: "c10-it-1-1", title: "Styles, Templates & Mail Merge", slug: "styles-mail-merge", learningObjectives: ["Configure character and paragraph styles, link data sources in mail merge"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 2,
        title: "Electronic Spreadsheet (Advanced)",
        slug: "electronic-spreadsheet-advanced",
        description: "Analyse data using scenarios and goal seek, link data and spreadsheets, share and review a spreadsheet, create and use macros in spreadsheet.",
        weightageMarks: 10,
        topics: [
          { id: "c10-it-2-1", title: "Consolidate Data, Goal Seek & Subtotals", slug: "consolidate-goal-seek", learningObjectives: ["Execute what-if analysis, backsolve parameters via Goal Seek"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
        ],
      },
      {
        number: 3,
        title: "Database Management System (RDBMS)",
        slug: "database-management-system",
        description: "Appreciate the concept of Database Management System, create and edit tables using wizard and SQL commands, perform operations on table, retrieve data using query, create forms and reports.",
        weightageMarks: 12,
        topics: [
          { id: "c10-it-3-1", title: "Relational Concepts, Keys & SQL Queries", slug: "relational-keys-sql", learningObjectives: ["Differentiate Primary Key, Foreign Key, and Candidate Key", "Formulate SELECT, INSERT, UPDATE, DELETE queries with WHERE and ORDER BY"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 4,
        title: "Web Applications and Security",
        slug: "web-applications-security",
        description: "Working with accessibility options, network fundamentals, instant messaging, blog creation, online transactions, internet security practices, workplace safety measures.",
        weightageMarks: 10,
        topics: [
          { id: "c10-it-4-1", title: "Network Topologies, Firewalls & Cybersecurity", slug: "network-cybersecurity", learningObjectives: ["Contrast LAN, MAN, WAN; configure HTTPS, strong encryption, and phishing defense"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
];

// ============================================================================
// CLASS 12 CURRICULUM (BOARD + ENTRANCE PREPARATION)
// ============================================================================

export const CLASS_12_SUBJECTS: AcademicSubjectDefinition[] = [
  // 1. Physics (CBSE Code 042 & State Board)
  {
    id: "c12-cbse-physics",
    slug: "c12-physics",
    name: "Class 12 Physics",
    code: "042",
    classLevel: 12,
    board: "CBSE",
    stream: "science",
    isElective: false,
    description: "Calculus-based electrodynamics, electromagnetic waves, wave optics, quantum radiation, nuclear physics, and semiconductor electronics.",
    accentColor: "#4C6B50",
    iconName: "Zap",
    chapters: [
      {
        number: 1,
        title: "Electric Charges and Fields",
        slug: "electric-charges-fields",
        description: "Electric charge, conductors/insulators, Coulomb's law, force between multiple charges, electric field, electric field lines, electric dipole, electric flux, Gauss's theorem and applications.",
        weightageMarks: 8,
        topics: [
          { id: "c12-phy-1-1", title: "Coulomb's Law & Principle of Superposition", slug: "coulombs-law", learningObjectives: ["Calculate vector force between point charges in vacuum and dielectric media"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c12-phy-1-2", title: "Gauss's Theorem & Symmetrical Field Derivations", slug: "gauss-theorem", learningObjectives: ["Derive fields for infinitely long wire, uniformly charged infinite plane sheet, and thin spherical shell"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 2,
        title: "Electrostatic Potential and Capacitance",
        slug: "electrostatic-potential-capacitance",
        description: "Electric potential, potential difference, electric potential due to a point charge, equipotential surfaces, electrical potential energy, conductors and dielectrics, capacitors and capacitance, parallel plate capacitor, combination of capacitors, energy stored in a capacitor.",
        weightageMarks: 8,
        topics: [
          { id: "c12-phy-2-1", title: "Equipotential Surfaces & Potential Gradient", slug: "equipotential-surfaces", learningObjectives: ["Evaluate relationship E = -dV/dr"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
          { id: "c12-phy-2-2", title: "Parallel Plate Capacitors & Dielectric Polarization", slug: "capacitors-dielectrics", learningObjectives: ["Calculate C = Kε0A/d and stored energy U = (1/2)CV²"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 3,
        title: "Current Electricity",
        slug: "current-electricity",
        description: "Electric current, drift velocity, mobility, Ohm's law, V-I characteristics, electrical resistivity and conductivity, temperature dependence of resistance, internal resistance of a cell, potential difference and emf, combination of cells, Kirchhoff's rules and Wheatstone bridge.",
        weightageMarks: 7,
        topics: [
          { id: "c12-phy-3-1", title: "Drift Velocity, Current Density & Ohm's Microscopic Law", slug: "drift-velocity-current-density", learningObjectives: ["Derive I = n e A vd and verify microscopic Ohm's law J = σE"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c12-phy-3-2", title: "Kirchhoff's Laws & Wheatstone Bridge Null Condition", slug: "kirchhoffs-laws-wheatstone", learningObjectives: ["Apply junction rule ΣI = 0 and loop rule ΣΔV = 0", "Derive bridge balance condition P/Q = R/S"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 4,
        title: "Moving Charges and Magnetism",
        slug: "moving-charges-magnetism",
        description: "Concept of magnetic field, Oersted's experiment, Biot-Savart law and circular loop application, Ampere's law, solenoid, force on moving charge in uniform B and E fields, force on current carrying conductor, force between parallel currents, torque on magnetic dipole, moving coil galvanometer.",
        weightageMarks: 8,
        topics: [
          { id: "c12-phy-4-1", title: "Biot-Savart Law & Circular Loop Axis", slug: "biot-savart-loop", learningObjectives: ["Derive dB = (μ0/4π) · (I dl × r̂)/r²", "Compute B = μ0 I R² / (2(R²+x²)^(3/2))"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c12-phy-4-2", title: "Ampere's Circuital Law & Moving Coil Galvanometer", slug: "amperes-law-galvanometer", learningObjectives: ["Derive field of long solenoid B = μ0 n I", "Convert galvanometer to ammeter via shunt and voltmeter via series multiplier"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 5,
        title: "Electromagnetic Induction & Alternating Current",
        slug: "emi-and-ac",
        description: "Faraday's laws, induced emf and current, Lenz's law, eddy currents, self and mutual induction, AC generator and transformer, alternating currents, peak and RMS value, reactance and impedance, LCR series circuit, resonance, power in AC circuits, wattless current.",
        weightageMarks: 9,
        topics: [
          { id: "c12-phy-5-1", title: "Faraday-Lenz Law & Motional EMF", slug: "faraday-lenz-motional-emf", learningObjectives: ["Calculate ε = -dΦ/dt and motional EMF ε = Blv"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c12-phy-5-2", title: "Series LCR Resonance & AC Power Factor", slug: "series-lcr-resonance", learningObjectives: ["Compute impedance Z = √(R² + (XL - XC)²)", "Calculate resonant frequency ω0 = 1/√(LC) and power P = Vrms Irms cosφ"], hasFormulas: true, hasDiagrams: true, conceptCount: 5 },
        ],
      },
      {
        number: 6,
        title: "Optics (Ray & Wave)",
        slug: "ray-and-wave-optics",
        description: "Refraction at spherical surfaces, lenses, thin lens formula, lens maker's formula, magnification, power, combination of thin lenses, prism refraction, optical instruments (microscope, telescope), wave optics: Huygens principle, reflection/refraction proof, Young's double slit interference, diffraction at single slit.",
        weightageMarks: 14,
        topics: [
          { id: "c12-phy-6-1", title: "Lens Maker's Formula & Astronomical Telescope", slug: "lens-makers-telescope", learningObjectives: ["Derive 1/f = (n-1)(1/R1 - 1/R2)", "Calculate angular magnification m = -fo/fe"], hasFormulas: true, hasDiagrams: true, conceptCount: 5 },
          { id: "c12-phy-6-2", title: "Young's Double Slit Interference & Fringe Width", slug: "youngs-double-slit", learningObjectives: ["Derive fringe width β = λD/d", "Analyze single slit central diffraction maximum width 2λD/a"], hasFormulas: true, hasDiagrams: true, conceptCount: 5 },
        ],
      },
      {
        number: 7,
        title: "Dual Nature, Atoms and Nuclei",
        slug: "dual-nature-atoms-nuclei",
        description: "Photoelectric effect, Hertz and Lenard's observations, Einstein's photoelectric equation, de Broglie relation, Alpha particle scattering, Rutherford model, Bohr model of hydrogen, line spectra, mass-energy relation, mass defect, binding energy per nucleon.",
        weightageMarks: 12,
        topics: [
          { id: "c12-phy-7-1", title: "Einstein's Photoelectric Equation & de Broglie Wavelength", slug: "photoelectric-de-broglie", learningObjectives: ["Apply Kmax = hν - Φ0 = e V0", "Compute matter wave wavelength λ = h/p = h/√(2mE)"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c12-phy-7-2", title: "Bohr Hydrogen Energy Levels & Mass Defect", slug: "bohr-model-mass-defect", learningObjectives: ["Calculate En = -13.6/n² eV and Rydberg formula 1/λ = R(1/n1² - 1/n2²)", "Compute binding energy ΔE = Δm · c²"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 8,
        title: "Semiconductor Electronics",
        slug: "semiconductor-electronics",
        description: "Energy bands in conductors, semiconductors and insulators, intrinsic and extrinsic semiconductors (p and n type), p-n junction diode: I-V characteristics in forward and reverse bias, diode as rectifier (half-wave and full-wave).",
        weightageMarks: 7,
        topics: [
          { id: "c12-phy-8-1", title: "P-N Junction Barrier & Rectification Circuits", slug: "pn-junction-rectification", learningObjectives: ["Explain depletion layer widening under reverse bias and thinning under forward bias", "Diagram half-wave and full-wave bridge rectifier with smoothing filter"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },

  // 2. Mathematics (CBSE Code 041)
  {
    id: "c12-cbse-mathematics",
    slug: "c12-mathematics",
    name: "Class 12 Mathematics",
    code: "041",
    classLevel: 12,
    board: "CBSE",
    stream: "science",
    isElective: false,
    description: "Advanced functions, matrices, determinants, calculus (limits, derivatives, integrals, differential equations), 3D coordinate geometry, vectors, linear programming, and conditional probability.",
    accentColor: "#3B5C6B",
    iconName: "Sigma",
    chapters: [
      {
        number: 1,
        title: "Relations, Functions & Inverse Trigonometry",
        slug: "relations-functions-itf",
        description: "Types of relations (reflexive, symmetric, transitive, equivalence), one-one and onto functions, composite functions, definition/range/domain/principal value branch of inverse trigonometric functions.",
        weightageMarks: 8,
        topics: [
          { id: "c12-mat-1-1", title: "Equivalence Relations & Bijective Functions", slug: "equivalence-bijective", learningObjectives: ["Prove equivalence partitions", "Verify injectivity f(x1)=f(x2) => x1=x2 and surjectivity"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
          { id: "c12-mat-1-2", title: "Principal Value Branches of ITF", slug: "itf-principal-branches", learningObjectives: ["Evaluate sin⁻¹(x), cos⁻¹(x), tan⁻¹(x) strictly inside principal domains"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 2,
        title: "Matrices and Determinants",
        slug: "matrices-determinants",
        description: "Matrix concept, types, operations, symmetric and skew symmetric matrices, determinants of square matrix, minors, cofactors, applications of determinants, adjoint and inverse of a matrix, solving systems of linear equations using matrix inverse.",
        weightageMarks: 10,
        topics: [
          { id: "c12-mat-2-1", title: "Matrix Multiplication & Transpose Invariance", slug: "matrix-multiplication-transpose", learningObjectives: ["Multiply non-commutative rectangular matrices", "Verify (AB)ᵀ = BᵀAᵀ"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
          { id: "c12-mat-2-2", title: "Matrix Inversion & Cramer's Matrix Method", slug: "matrix-inverse-linear-systems", learningObjectives: ["Compute A⁻¹ = (1/|A|) · adj(A)", "Solve AX = B via X = A⁻¹B"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
        ],
      },
      {
        number: 3,
        title: "Continuity and Differentiability",
        slug: "continuity-differentiability",
        description: "Continuity and differentiability, derivative of composite functions, chain rule, derivative of inverse trigonometric functions, derivative of implicit functions, concept of exponential and logarithmic functions, logarithmic differentiation, second order derivatives.",
        weightageMarks: 9,
        topics: [
          { id: "c12-mat-3-1", title: "Chain Rule, Implicit & Logarithmic Differentiation", slug: "chain-rule-log-differentiation", learningObjectives: ["Differentiate y = (f(x))^(g(x)) via ln(y) = g(x) ln(f(x))"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
          { id: "c12-mat-3-2", title: "Parametric & Second-Order Derivatives", slug: "parametric-second-order", learningObjectives: ["Compute d²y/dx² = (d/dt(dy/dx))/(dx/dt)"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 4,
        title: "Applications of Derivatives",
        slug: "applications-of-derivatives",
        description: "Rate of change of bodies, increasing/decreasing functions, tangents and normals, maxima and minima (first derivative test motivated geometrically and second derivative test given as a provable tool).",
        weightageMarks: 8,
        topics: [
          { id: "c12-mat-4-1", title: "Increasing/Decreasing Intervals & First Derivative Test", slug: "increasing-decreasing-intervals", learningObjectives: ["Locate monotonic intervals where f'(x) > 0 and f'(x) < 0"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
          { id: "c12-mat-4-2", title: "Second Derivative Test for Global Maxima & Minima", slug: "second-derivative-extrema", learningObjectives: ["Find critical points f'(c) = 0 and classify via f''(c) < 0 (max) or f''(c) > 0 (min)"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 5,
        title: "Integrals & Applications of Integrals",
        slug: "integrals-and-applications",
        description: "Integration as inverse process of differentiation, integration by substitution, by partial fractions and by parts, fundamental theorem of calculus, basic properties of definite integrals, applications in finding the area under simple curves, especially lines, circles/parabolas/ellipses.",
        weightageMarks: 15,
        topics: [
          { id: "c12-mat-5-1", title: "Integration by Parts & Partial Fractions", slug: "integration-by-parts", learningObjectives: ["Evaluate ∫ u v dx = u ∫ v dx - ∫ (u' ∫ v dx) dx using ILATE convention"], hasFormulas: true, hasDiagrams: false, conceptCount: 5 },
          { id: "c12-mat-5-2", title: "Definite Integral Properties & Area Under Curves", slug: "definite-integrals-area", learningObjectives: ["Apply King's property ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx", "Compute enclosed planar area A = ∫ [y_upper - y_lower] dx"], hasFormulas: true, hasDiagrams: true, conceptCount: 5 },
        ],
      },
      {
        number: 6,
        title: "Differential Equations",
        slug: "differential-equations",
        description: "Definition, order and degree, general and particular solutions of a differential equation, formation of differential equation whose general solution is given, solution of differential equations by method of separation of variables, homogeneous differential equations, linear differential equations.",
        weightageMarks: 7,
        topics: [
          { id: "c12-mat-6-1", title: "Variable Separable & Homogeneous DEs", slug: "variable-separable-homogeneous", learningObjectives: ["Integrate g(y)dy = f(x)dx and solve dy/dx = F(y/x) using y = vx"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
          { id: "c12-mat-6-2", title: "First-Order Linear DE & Integrating Factor", slug: "linear-de-integrating-factor", learningObjectives: ["Solve dy/dx + P(x)y = Q(x) via I.F. = e^(∫ P dx) and y · I.F. = ∫ Q · I.F. dx + C"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
        ],
      },
      {
        number: 7,
        title: "Vectors and Three-Dimensional Geometry",
        slug: "vectors-and-3d-geometry",
        description: "Vectors and scalars, magnitude and direction of a vector, direction cosines and direction ratios of a vector, types of vectors, dot product, cross product, projection of a vector on a line, direction cosines and direction ratios of a line joining two points, Cartesian equation and vector equation of a line, coplanar and skew lines, shortest distance between two lines.",
        weightageMarks: 14,
        topics: [
          { id: "c12-mat-7-1", title: "Scalar Dot & Vector Cross Products", slug: "dot-and-cross-products", learningObjectives: ["Compute a · b = |a||b|cosθ and a × b = |a||b|sinθ n̂ with determinant expansion"], hasFormulas: true, hasDiagrams: true, conceptCount: 5 },
          { id: "c12-mat-7-2", title: "Lines in 3D Space & Shortest Distance Between Skew Lines", slug: "3d-lines-shortest-distance", learningObjectives: ["Formulate r = a + λb", "Derive shortest distance d = |(a2 - a1) · (b1 × b2)| / |b1 × b2|"], hasFormulas: true, hasDiagrams: true, conceptCount: 5 },
        ],
      },
      {
        number: 8,
        title: "Linear Programming & Probability",
        slug: "linear-programming-probability",
        description: "Introduction, related terminology such as constraints, objective function, optimization, graphical method of solving linear programming problems, conditional probability, multiplication theorem on probability, independent events, total probability, Bayes' theorem.",
        weightageMarks: 9,
        topics: [
          { id: "c12-mat-8-1", title: "LPP Corner Point Method & Feasible Region", slug: "lpp-corner-points", learningObjectives: ["Plot linear half-plane constraints and evaluate objective function Z = ax + by at vertices"], hasFormulas: true, hasDiagrams: true, conceptCount: 3 },
          { id: "c12-mat-8-2", title: "Conditional Probability & Bayes' Theorem", slug: "bayes-theorem", learningObjectives: ["Compute P(A|B) = P(A ∩ B)/P(B)", "Calculate posterior probability P(Ei|A) = [P(Ei)P(A|Ei)] / [Σ P(Ej)P(A|Ej)]"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },

  // 3. Chemistry (CBSE Code 043)
  {
    id: "c12-cbse-chemistry",
    slug: "c12-chemistry",
    name: "Class 12 Chemistry",
    code: "043",
    classLevel: 12,
    board: "CBSE",
    stream: "science",
    isElective: false,
    description: "Physical solutions, electrochemistry, chemical kinetics, d- and f-block coordination complexes, haloalkanes, alcohols, aldehydes, ketones, amines, and biomolecules.",
    accentColor: "#3B5C6B",
    iconName: "Atom",
    theoryMarks: 70,
    practicalMarks: 30,
    chapters: [
      {
        number: 1,
        title: "Solutions",
        slug: "solutions",
        description: "Types of solutions, expression of concentration, solubility of gases, Raoult's law, colligative properties, abnormal molecular mass and van 't Hoff factor.",
        weightageMarks: 7,
        topics: [
          { id: "c12-ch-1-1", title: "Colligative Properties & van 't Hoff Factor", slug: "colligative-properties", learningObjectives: ["Derive ΔTb = i·Kb·m and ΔTf = i·Kf·m"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 2,
        title: "Electrochemistry",
        slug: "electrochemistry",
        description: "Redox reactions, EMF of a cell, standard electrode potential, Nernst equation and its application to chemical cells, relation between Gibbs energy change and EMF of a cell, Kohlrausch's Law.",
        weightageMarks: 9,
        topics: [
          { id: "c12-ch-2-1", title: "Nernst Equation & Gibbs Free Energy", slug: "nernst-equation", learningObjectives: ["Calculate cell EMF Ecell = E°cell - (RT/nF)lnQ and ΔG° = -nFE°cell"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
      {
        number: 3,
        title: "Chemical Kinetics",
        slug: "chemical-kinetics",
        description: "Rate of a reaction, factors affecting rates of reaction, order and molecularity of a reaction, rate law and specific rate constant, integrated rate equations and half-life, Arrhenius equation.",
        weightageMarks: 7,
        topics: [
          { id: "c12-ch-3-1", title: "First Order Kinetics & Arrhenius Activation", slug: "kinetics-arrhenius", learningObjectives: ["Evaluate k = (2.303/t)log(A0/A) and ln(k2/k1) = (Ea/R)(1/T1 - 1/T2)"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },

  // 4. Biology (CBSE Code 044)
  {
    id: "c12-cbse-biology",
    slug: "c12-biology",
    name: "Class 12 Biology",
    code: "044",
    classLevel: 12,
    board: "CBSE",
    stream: "science",
    isElective: true,
    description: "Reproduction in organisms, genetics and evolution, biology and human welfare, biotechnology applications, and ecology.",
    accentColor: "#2E5E4E",
    iconName: "Dna",
    theoryMarks: 70,
    practicalMarks: 30,
    chapters: [
      {
        number: 1,
        title: "Molecular Basis of Inheritance",
        slug: "molecular-basis-inheritance",
        description: "Structure of DNA and RNA, DNA packaging, DNA replication, central dogma, transcription, genetic code, translation, gene expression regulation (Lac Operon), Human Genome Project.",
        weightageMarks: 10,
        topics: [
          { id: "c12-bio-1-1", title: "DNA Replication & Lac Operon", slug: "dna-replication-lac-operon", learningObjectives: ["Trace semiconservative replication fork and inducible operon regulation"], hasFormulas: false, hasDiagrams: true, conceptCount: 5 },
        ],
      },
    ],
  },

  // 5. Accountancy (CBSE Code 055)
  {
    id: "c12-cbse-accountancy",
    slug: "c12-accountancy",
    name: "Class 12 Accountancy",
    code: "055",
    classLevel: 12,
    board: "CBSE",
    stream: "commerce",
    isElective: false,
    description: "Accounting for partnership firms, accounting for companies (share capital and debentures), and analysis of financial statements.",
    accentColor: "#7E6747",
    iconName: "FileSpreadsheet",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Accounting for Partnership: Fundamentals",
        slug: "partnership-fundamentals",
        description: "Partnership Deed, Profit and Loss Appropriation Account, partners' capital accounts, past adjustments, guarantee of profit.",
        weightageMarks: 10,
        topics: [
          { id: "c12-acc-1-1", title: "P&L Appropriation & Past Adjustments", slug: "pl-appropriation-adjustments", learningObjectives: ["Prepare appropriation accounts and compute interest on capital/drawings"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
        ],
      },
    ],
  },

  // 6. Business Studies (CBSE Code 054)
  {
    id: "c12-cbse-business-studies",
    slug: "c12-business-studies",
    name: "Class 12 Business Studies",
    code: "054",
    classLevel: 12,
    board: "CBSE",
    stream: "commerce",
    isElective: false,
    description: "Principles and functions of management (planning, organizing, staffing, directing, controlling), financial markets, and marketing.",
    accentColor: "#6A5E50",
    iconName: "Briefcase",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Principles of Management",
        slug: "principles-of-management",
        description: "Fayol's 14 principles of general management and Taylor's scientific management techniques.",
        weightageMarks: 8,
        topics: [
          { id: "c12-bst-1-1", title: "Fayol vs Taylor Frameworks", slug: "fayol-taylor-principles", learningObjectives: ["Differentiate administrative management from functional foremanship"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },

  // 7. Economics (CBSE Code 030)
  {
    id: "c12-cbse-economics",
    slug: "c12-economics",
    name: "Class 12 Economics",
    code: "030",
    classLevel: 12,
    board: "CBSE",
    stream: "commerce",
    isElective: false,
    description: "Introductory Macroeconomics (National Income, Money and Banking, Determination of Income, Government Budget, Balance of Payments) and Indian Economic Development.",
    accentColor: "#5B6B4E",
    iconName: "TrendingUp",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "National Income & Related Aggregates",
        slug: "national-income-aggregates",
        description: "Circular flow of income, GDP, GNP, NNP at market prices and factor costs, measurement of national income via value added, expenditure, and income methods.",
        weightageMarks: 10,
        topics: [
          { id: "c12-eco-1-1", title: "National Income Accounting Methods", slug: "national-income-methods", learningObjectives: ["Compute GDPmp, NNPfc, and apply GDP deflator formulas"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },

  // 8. History (CBSE Code 027)
  {
    id: "c12-cbse-history",
    slug: "c12-history",
    name: "Class 12 History",
    code: "027",
    classLevel: 12,
    board: "CBSE",
    stream: "arts",
    isElective: false,
    description: "Themes in Indian History Part I, II, and III spanning Harappan civilization to the framing of the Constitution.",
    accentColor: "#6B4C4C",
    iconName: "Clock",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Bricks, Beads and Bones: Harappan Civilisation",
        slug: "harappan-civilisation",
        description: "Urban planning, subsistence strategies, craft production, social differences, and decline of Indus Valley civilization.",
        weightageMarks: 8,
        topics: [
          { id: "c12-his-1-1", title: "Mohenjodaro Town Planning & Drainage", slug: "harappan-town-planning", learningObjectives: ["Analyze grid pattern street layout, Citadel, and Great Bath architecture"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },

  // 9. Political Science (CBSE Code 028)
  {
    id: "c12-cbse-polsci",
    slug: "c12-political-science",
    name: "Class 12 Political Science",
    code: "028",
    classLevel: 12,
    board: "CBSE",
    stream: "arts",
    isElective: false,
    description: "Contemporary World Politics (Cold War Era, multipolar world, UN agencies) and Politics in India Since Independence.",
    accentColor: "#4C5B6B",
    iconName: "Globe",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "The End of Bipolarity",
        slug: "end-of-bipolarity",
        description: "Soviet system, Gorbachev and disintegration of USSR, shock therapy and its consequences, democratic transitions.",
        weightageMarks: 8,
        topics: [
          { id: "c12-pol-1-1", title: "Soviet Disintegration & Shock Therapy", slug: "ussr-shock-therapy", learningObjectives: ["Evaluate causes of 1991 Soviet collapse and transition to market capitalism"], hasFormulas: false, hasDiagrams: false, conceptCount: 4 },
        ],
      },
    ],
  },

  // 10. Psychology (CBSE Code 037)
  {
    id: "c12-cbse-psychology",
    slug: "c12-psychology",
    name: "Class 12 Psychology",
    code: "037",
    classLevel: 12,
    board: "CBSE",
    stream: "arts",
    isElective: true,
    description: "Psychological attributes, self and personality, meeting life challenges, psychological disorders, therapeutic approaches, attitude and social cognition.",
    accentColor: "#5B4C6B",
    iconName: "Brain",
    theoryMarks: 70,
    practicalMarks: 30,
    chapters: [
      {
        number: 1,
        title: "Variations in Psychological Attributes",
        slug: "psychological-attributes",
        description: "Individual differences, intelligence theories (Gardner, Sternberg), PASS model, emotional intelligence, psychological assessment.",
        weightageMarks: 9,
        topics: [
          { id: "c12-psy-1-1", title: "Multiple Intelligences & Triarchic Theory", slug: "intelligence-theories", learningObjectives: ["Contrast Gardner's 8 intelligences with Sternberg's componential, experiential, and contextual subtheories"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },

  // 11. Sociology (CBSE Code 039)
  {
    id: "c12-cbse-sociology",
    slug: "c12-sociology",
    name: "Class 12 Sociology",
    code: "039",
    classLevel: 12,
    board: "CBSE",
    stream: "arts",
    isElective: true,
    description: "Indian society demography, social institutions, social inequality and exclusion, cultural diversity, structural and cultural change, social movements.",
    accentColor: "#6B5A4C",
    iconName: "Users",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "The Demographic Structure of the Indian Society",
        slug: "indian-demography",
        description: "Demographic theories (Malthusian, Demographic Transition), population size and growth, age structure and demographic dividend in India.",
        weightageMarks: 10,
        topics: [
          { id: "c12-soc-1-1", title: "Demographic Transition & Dividend", slug: "demographic-transition-dividend", learningObjectives: ["Analyze birth rate, death rate, and working-age population dynamics"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
];

// ============================================================================
// CLASS 11 CURRICULUM SUBJECTS (SCIENCE, COMMERCE & ARTS)
// ============================================================================

export const CLASS_11_SUBJECTS: AcademicSubjectDefinition[] = [
  // Science
  {
    id: "c11-physics",
    slug: "c11-physics",
    name: "Class 11 Physics",
    code: "042",
    classLevel: 11,
    board: "CBSE",
    stream: "science",
    isElective: false,
    description: "Kinematics, laws of motion, work energy power, rotational dynamics, gravitation, thermodynamics, and oscillatory waves.",
    accentColor: "#4C6B50",
    iconName: "Zap",
    theoryMarks: 70,
    practicalMarks: 30,
    chapters: [
      {
        number: 1,
        title: "Units and Measurements",
        slug: "units-and-measurements",
        description: "SI units, dimensional analysis, dimensional homogeneity, error propagation.",
        weightageMarks: 5,
        topics: [
          { id: "c11-phy-1-1", title: "Dimensional Analysis & Error Propagation", slug: "dimensional-analysis", learningObjectives: ["Deduce formulas using dimensional consistency"], hasFormulas: true, hasDiagrams: false, conceptCount: 3 },
        ],
      },
      {
        number: 2,
        title: "Motion in a Plane (Vectors & Projectiles)",
        slug: "motion-in-a-plane",
        description: "Vector operations, relative velocity, projectile trajectory, maximum height, range, and time of flight.",
        weightageMarks: 7,
        topics: [
          { id: "c11-phy-2-1", title: "Projectile Trajectory & Range", slug: "projectile-motion", learningObjectives: ["Derive R = (u² sin 2θ)/g and H = (u² sin²θ)/(2g)"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
  {
    id: "c11-chemistry",
    slug: "c11-chemistry",
    name: "Class 11 Chemistry",
    code: "043",
    classLevel: 11,
    board: "CBSE",
    stream: "science",
    isElective: false,
    description: "Atomic structure, chemical bonding, thermodynamics, chemical equilibrium, redox processes, and organic chemistry foundations.",
    accentColor: "#3B5C6B",
    iconName: "Atom",
    theoryMarks: 70,
    practicalMarks: 30,
    chapters: [
      {
        number: 1,
        title: "Chemical Bonding and Molecular Structure",
        slug: "chemical-bonding",
        description: "VSEPR theory, hybridization, dipole moments, molecular orbital theory for homonuclear diatomic molecules.",
        weightageMarks: 9,
        topics: [
          { id: "c11-ch-1-1", title: "VSEPR Geometries & Hybridization", slug: "vsepr-hybridization", learningObjectives: ["Predict molecular shapes and bond angles from electron pairs"], hasFormulas: true, hasDiagrams: true, conceptCount: 5 },
        ],
      },
    ],
  },
  {
    id: "c11-mathematics",
    slug: "c11-mathematics",
    name: "Class 11 Mathematics",
    code: "041",
    classLevel: 11,
    board: "CBSE",
    stream: "science",
    isElective: false,
    description: "Sets and relations, trigonometric functions, complex numbers, linear inequalities, permutations and combinations, conic sections, limits and derivatives.",
    accentColor: "#2E5E4E",
    iconName: "Sigma",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Trigonometric Functions & Unit Circle",
        slug: "trigonometric-functions",
        description: "Radian measure, unit circle definitions, compound angle identities, multiple angle formulas.",
        weightageMarks: 12,
        topics: [
          { id: "c11-mat-1-1", title: "Unit Circle Coordinates & Radian Angle Measure", slug: "unit-circle-rad", learningObjectives: ["Map (cosθ, sinθ) on unit circle for all quadrants"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
  {
    id: "c11-biology",
    slug: "c11-biology",
    name: "Class 11 Biology",
    code: "044",
    classLevel: 11,
    board: "CBSE",
    stream: "science",
    isElective: true,
    description: "Diversity in the living world, structural organization in plants and animals, cell structure and function, plant physiology, and human physiology.",
    accentColor: "#4C6B4E",
    iconName: "Dna",
    theoryMarks: 70,
    practicalMarks: 30,
    chapters: [
      {
        number: 1,
        title: "Cell: The Unit of Life",
        slug: "cell-unit-of-life",
        description: "Prokaryotic and eukaryotic cells, cell organelles (mitochondria, chloroplasts, ER, Golgi, ribosomes, nucleus), endomembrane system.",
        weightageMarks: 8,
        topics: [
          { id: "c11-bio-1-1", title: "Cell Organelle Ultrastructure", slug: "cell-ultrastructure", learningObjectives: ["Differentiate plant vs animal cell membranes, plastids, and vacuole structures"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },

  // Commerce
  {
    id: "c11-accounts",
    slug: "c11-accounts",
    name: "Book Keeping & Accountancy",
    code: "055",
    classLevel: 11,
    board: "CBSE",
    stream: "commerce",
    isElective: false,
    description: "Double entry system, journal, ledger, cash book, trial balance, depreciation, bank reconciliation, and final accounts.",
    accentColor: "#7E6747",
    iconName: "FileSpreadsheet",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Accounting Equation & Journal Entries",
        slug: "accounting-equation-journal",
        description: "Assets = Liabilities + Capital, golden rules of debit and credit, compound journal entries.",
        weightageMarks: 10,
        topics: [
          { id: "c11-acc-1-1", title: "Fundamental Accounting Equation", slug: "fundamental-equation", learningObjectives: ["Apply Assets = Liabilities + Capital across balance sheet events"], hasFormulas: true, hasDiagrams: false, conceptCount: 4 },
        ],
      },
    ],
  },
  {
    id: "c11-economics",
    slug: "c11-economics",
    name: "Class 11 Economics",
    code: "030",
    classLevel: 11,
    board: "CBSE",
    stream: "commerce",
    isElective: false,
    description: "Statistics for Economics (measures of central tendency, dispersion, index numbers) and Microeconomics (consumer equilibrium, demand, elasticity, production, cost).",
    accentColor: "#5B6B4E",
    iconName: "TrendingUp",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Theory of Consumer Behaviour & Demand",
        slug: "consumer-behaviour-demand",
        description: "Marginal utility analysis, indifference curve approach, price elasticity of demand.",
        weightageMarks: 12,
        topics: [
          { id: "c11-eco-1-1", title: "Price Elasticity of Demand (Ed)", slug: "price-elasticity-demand", learningObjectives: ["Calculate Ed = -(%ΔQ / %ΔP) using percentage and point methods"], hasFormulas: true, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
  {
    id: "c11-ocm",
    slug: "c11-ocm",
    name: "Organisation of Commerce & Management",
    code: "054",
    classLevel: 11,
    board: "CBSE",
    stream: "commerce",
    isElective: false,
    description: "Nature and purpose of business, forms of business organization, public private enterprises, emerging modes of business, social responsibilities.",
    accentColor: "#6A5E50",
    iconName: "Briefcase",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Forms of Business Organisation",
        slug: "forms-business-organisation",
        description: "Sole proprietorship, partnership firm, Hindu Undivided Family, cooperative society, joint stock company.",
        weightageMarks: 12,
        topics: [
          { id: "c11-ocm-1-1", title: "Corporate Incorporation & Limited Liability", slug: "corporate-incorporation", learningObjectives: ["Evaluate legal status, capital raising, and liability differences across enterprise models"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
  {
    id: "c11-sp",
    slug: "c11-sp",
    name: "Secretarial Practice",
    code: "052",
    classLevel: 11,
    board: "MSBSHSE",
    stream: "commerce",
    isElective: true,
    description: "Secretary profile, joint stock company formation, documents related to company formation, members, directors and key managerial personnel.",
    accentColor: "#5A6550",
    iconName: "FileText",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Documents Related to Formation of a Company",
        slug: "company-documents",
        description: "Memorandum of Association, Articles of Association, Prospectus, legal requirements.",
        weightageMarks: 10,
        topics: [
          { id: "c11-sp-1-1", title: "MoA Clauses & AoA Doctrine of Indoor Management", slug: "moa-aoa-clauses", learningObjectives: ["Draft fundamental corporate constitutional clauses"], hasFormulas: false, hasDiagrams: false, conceptCount: 3 },
        ],
      },
    ],
  },

  // Arts / Humanities
  {
    id: "c11-history",
    slug: "c11-history",
    name: "Class 11 History",
    code: "027",
    classLevel: 11,
    board: "CBSE",
    stream: "arts",
    isElective: false,
    description: "Themes in World History: writing and city life, an empire across three continents, nomadic empires, the three orders, changing cultural traditions, paths to modernization.",
    accentColor: "#6B4C4C",
    iconName: "Clock",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Writing and City Life (Mesopotamia)",
        slug: "mesopotamia-writing",
        description: "Urban development in southern Mesopotamia, cuneiform script, temple complexes (ziggurats), trade networks.",
        weightageMarks: 10,
        topics: [
          { id: "c11-his-1-1", title: "Cuneiform Tablets & City Planning at Ur", slug: "cuneiform-ur", learningObjectives: ["Trace evolution of pictographic to phonetic cuneiform recording systems"], hasFormulas: false, hasDiagrams: true, conceptCount: 3 },
        ],
      },
    ],
  },
  {
    id: "c11-geography",
    slug: "c11-geography",
    name: "Class 11 Geography",
    code: "029",
    classLevel: 11,
    board: "CBSE",
    stream: "arts",
    isElective: false,
    description: "Fundamentals of Physical Geography: origin of the earth, interior, landforms, climate, water in oceans, life on the earth.",
    accentColor: "#4C6B62",
    iconName: "Compass",
    theoryMarks: 70,
    practicalMarks: 30,
    chapters: [
      {
        number: 1,
        title: "Geomorphic Processes & Plate Tectonics",
        slug: "plate-tectonics",
        description: "Continental drift theory, seafloor spreading, plate tectonic boundaries (convergent, divergent, transform), volcanism and earthquakes.",
        weightageMarks: 9,
        topics: [
          { id: "c11-geo-1-1", title: "Plate Margins & Seismic Discontinuities", slug: "plate-margins-seismic", learningObjectives: ["Map Mohorovicic and Gutenberg mantle-core boundaries and subduction zones"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
  {
    id: "c11-polsci",
    slug: "c11-political-science",
    name: "Class 11 Political Science",
    code: "028",
    classLevel: 11,
    board: "CBSE",
    stream: "arts",
    isElective: false,
    description: "Indian Constitution at Work (philosophy, rights, executive, legislature, judiciary, federalism) and Political Theory (freedom, equality, justice, rights, citizenship).",
    accentColor: "#4C5B6B",
    iconName: "Globe",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Constitution: Why and How? & Fundamental Rights",
        slug: "constitution-rights",
        description: "Making of the Constituent Assembly, Preamble values, Articles 12-35 Fundamental Rights, judicial writs (Habeas Corpus, Mandamus, Quo Warranto).",
        weightageMarks: 10,
        topics: [
          { id: "c11-pol-1-1", title: "Constitutional Writs & Basic Structure Doctrine", slug: "constitutional-writs", learningObjectives: ["Distinguish five constitutional writs under Article 32 and Kesavananda Bharati basic features"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
  {
    id: "c11-psychology",
    slug: "c11-psychology",
    name: "Class 11 Psychology",
    code: "037",
    classLevel: 11,
    board: "CBSE",
    stream: "arts",
    isElective: true,
    description: "What is psychology? Methods of psychological enquiry, biological bases of behaviour, human development, sensory processes, learning, human memory, thinking, motivation and emotion.",
    accentColor: "#5B4C6B",
    iconName: "Brain",
    theoryMarks: 70,
    practicalMarks: 30,
    chapters: [
      {
        number: 1,
        title: "Learning & Conditioning Principles",
        slug: "learning-conditioning",
        description: "Classical conditioning (Pavlov), operant conditioning (Skinner), observational learning (Bandura), cognitive learning.",
        weightageMarks: 9,
        topics: [
          { id: "c11-psy-1-1", title: "Pavlovian Stimulus-Response & Skinnerian Reinforcement", slug: "conditioning-reinforcement", learningObjectives: ["Differentiate positive/negative reinforcement from punishment schedules"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
  {
    id: "c11-sociology",
    slug: "c11-sociology",
    name: "Class 11 Sociology",
    code: "039",
    classLevel: 11,
    board: "CBSE",
    stream: "arts",
    isElective: true,
    description: "Introducing Sociology (sociological imagination, society and basic concepts, social institutions) and Understanding Society (social structure, social change, environment).",
    accentColor: "#6B5A4C",
    iconName: "Users",
    theoryMarks: 80,
    practicalMarks: 20,
    chapters: [
      {
        number: 1,
        title: "Sociology and Society: Terms & Concepts",
        slug: "sociology-concepts",
        description: "Sociological imagination (C. Wright Mills), social groups and stratification, status and role, socialization, social control.",
        weightageMarks: 10,
        topics: [
          { id: "c11-soc-1-1", title: "Sociological Imagination & Stratification Systems", slug: "sociological-imagination", learningObjectives: ["Connect personal troubles to public issues across class, caste, and gender structures"], hasFormulas: false, hasDiagrams: true, conceptCount: 4 },
        ],
      },
    ],
  },
];

// ============================================================================
// ACADEMIC CLASS CURRICULUM ARCHITECTURE
// ============================================================================

export interface AcademicClassCurriculum {
  level: AcademicClassLevel;
  name: string;
  tagline: string;
  boardVariants: Record<
    AcademicBoardId,
    {
      boardId: AcademicBoardId;
      boardName: string;
      subjects: AcademicSubjectDefinition[];
    }
  >;
  streams: {
    science: { name: string; subjects: AcademicSubjectDefinition[] };
    commerce: { name: string; subjects: AcademicSubjectDefinition[] };
    arts: { name: string; subjects: AcademicSubjectDefinition[] };
  };
}

export const CLASS_10_CURRICULUM: AcademicClassCurriculum = {
  level: 10,
  name: "Class 10 — Board Foundation",
  tagline: "Comprehensive secondary curriculum mastering all core concepts, formulas, and blueprint mock examinations.",
  boardVariants: {
    CBSE: {
      boardId: "CBSE",
      boardName: "Central Board of Secondary Education",
      subjects: CLASS_10_SUBJECTS,
    },
    MSBSHSE: {
      boardId: "MSBSHSE",
      boardName: "Maharashtra State Board (SSC)",
      subjects: CLASS_10_SUBJECTS,
    },
  },
  streams: {
    science: {
      name: "Secondary STEM Core",
      subjects: [
        CLASS_10_SUBJECTS[0], // Math Standard
        CLASS_10_SUBJECTS[2], // Science
        CLASS_10_SUBJECTS[5], // Information Technology
      ],
    },
    commerce: {
      name: "Secondary Commerce & Social Sciences",
      subjects: [
        CLASS_10_SUBJECTS[1], // Math Basic
        CLASS_10_SUBJECTS[3], // Social Science
        CLASS_10_SUBJECTS[4], // English
      ],
    },
    arts: {
      name: "Secondary Humanities & Languages",
      subjects: [
        CLASS_10_SUBJECTS[3], // Social Science
        CLASS_10_SUBJECTS[4], // English
        CLASS_10_SUBJECTS[5], // Information Technology
      ],
    },
  },
};

export const CLASS_11_CURRICULUM: AcademicClassCurriculum = {
  level: 11,
  name: "Class 11 — Concept Mastery",
  tagline: "Higher secondary foundation building theoretical depth and analytical problem solving across Science, Commerce, and Arts.",
  boardVariants: {
    CBSE: {
      boardId: "CBSE",
      boardName: "Central Board of Secondary Education",
      subjects: CLASS_11_SUBJECTS,
    },
    MSBSHSE: {
      boardId: "MSBSHSE",
      boardName: "Maharashtra State Board (FYJC)",
      subjects: CLASS_11_SUBJECTS,
    },
  },
  streams: {
    science: {
      name: "Physical & Life Sciences",
      subjects: CLASS_11_SUBJECTS.filter((s) => s.stream === "science"),
    },
    commerce: {
      name: "Commerce & Management",
      subjects: CLASS_11_SUBJECTS.filter((s) => s.stream === "commerce"),
    },
    arts: {
      name: "Humanities & Social Sciences",
      subjects: CLASS_11_SUBJECTS.filter((s) => s.stream === "arts"),
    },
  },
};

export const CLASS_12_CURRICULUM: AcademicClassCurriculum = {
  level: 12,
  name: "Class 12 — Board + Entrance Preparation",
  tagline: "Rigorous senior graduation curriculum geared for 100% board excellence and national competitive examination rankings.",
  boardVariants: {
    CBSE: {
      boardId: "CBSE",
      boardName: "Central Board of Secondary Education",
      subjects: CLASS_12_SUBJECTS,
    },
    MSBSHSE: {
      boardId: "MSBSHSE",
      boardName: "Maharashtra State Board (HSC)",
      subjects: CLASS_12_SUBJECTS,
    },
  },
  streams: {
    science: {
      name: "Advanced Physical & Life Sciences",
      subjects: CLASS_12_SUBJECTS.filter((s) => s.stream === "science"),
    },
    commerce: {
      name: "Corporate Finance & Economic Analytics",
      subjects: CLASS_12_SUBJECTS.filter((s) => s.stream === "commerce"),
    },
    arts: {
      name: "Public Policy, History & Social Theory",
      subjects: CLASS_12_SUBJECTS.filter((s) => s.stream === "arts"),
    },
  },
};

export const CLASS_CURRICULA: Record<AcademicClassLevel, AcademicClassCurriculum> = {
  10: CLASS_10_CURRICULUM,
  11: CLASS_11_CURRICULUM,
  12: CLASS_12_CURRICULUM,
};

/**
 * Returns subjects configured for a given academic class level.
 */
export function getSubjectsByClassLevel(
  level: AcademicClassLevel
): AcademicSubjectDefinition[] {
  if (level === 10) {
    return CLASS_10_SUBJECTS;
  }
  if (level === 11) {
    return CLASS_11_SUBJECTS;
  }
  return CLASS_12_SUBJECTS;
}
