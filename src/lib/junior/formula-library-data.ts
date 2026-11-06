/**
 * THE UNWRITTEN — THE ACADEMY 2.0 FORMULA LIBRARY REGISTRY
 *
 * Comprehensive academic formula repository covering Class 10, Class 11, and Class 12
 * across Mathematics, Physics, Chemistry, and Commercial Economics.
 *
 * Every record satisfies all 12 mandatory specifications:
 * 1. Formula name
 * 2. Mathematical expression (KaTeX/LaTeX)
 * 3. Symbol definitions (each with symbol, meaning, and SI unit)
 * 4. Master SI units of output
 * 5. Conditions of applicability / physical assumptions
 * 6. Related concepts
 * 7. Derivation summary where relevant
 * 8. One complete solved numerical example
 * 9. Common student mistakes
 * 10. Related examination question types
 * 11. Difficulty level (Easy, Medium, Hard)
 * 12. Source and syllabus reference
 */

export interface FormulaSymbolDefinition {
  symbol: string;
  meaning: string;
  siUnit: string;
  isConstant?: boolean;
  typicalValue?: string;
}

export interface SolvedNumericalExample {
  problemStatement: string;
  givenData: string[];
  stepByStepSolution: string[];
  finalAnswer: string;
}

export interface AcademicFormulaRecord {
  id: string;
  name: string;
  latexExpression: string;
  classLevel: 10 | 11 | 12;
  board: "CBSE" | "MSBSHSE" | "all";
  stream: "science" | "commerce" | "arts" | "general";
  subjectSlug: string;
  subjectName: string;
  chapterTitle: string;
  topicTitle: string;
  category: string;
  outputUnit: string;
  symbols: FormulaSymbolDefinition[];
  applicabilityConditions: string[];
  relatedConcepts: string[];
  derivationSummary?: string;
  solvedExample: SolvedNumericalExample;
  commonMistakes: string[];
  examQuestionTypes: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  syllabusReference: string;
  applicableExams: ("Board" | "JEE" | "NEET" | "MHT-CET" | "CUET" | "NDA" | "Foundation")[];
}

export const ACADEMIC_FORMULA_REGISTRY: AcademicFormulaRecord[] = [
  // ==========================================================================
  // CLASS 10 MATHEMATICS
  // ==========================================================================
  {
    id: "f-c10-mat-quadratic-formula",
    name: "Quadratic Formula (Shreedharacharya's Rule)",
    latexExpression: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    classLevel: 10,
    board: "all",
    stream: "general",
    subjectSlug: "c10-math-standard",
    subjectName: "Mathematics",
    chapterTitle: "Quadratic Equations",
    topicTitle: "Nature of Roots & Solution of Quadratics",
    category: "Algebra",
    outputUnit: "Dimensionless / Scalar Root",
    symbols: [
      { symbol: "x", meaning: "Unknown root or solution of the equation", siUnit: "Scalar" },
      { symbol: "a", meaning: "Coefficient of the quadratic term x² (a ≠ 0)", siUnit: "Scalar" },
      { symbol: "b", meaning: "Coefficient of the linear term x", siUnit: "Scalar" },
      { symbol: "c", meaning: "Constant term", siUnit: "Scalar" },
      { symbol: "D", meaning: "Discriminant (D = b² - 4ac)", siUnit: "Scalar" },
    ],
    applicabilityConditions: [
      "The equation must be arranged strictly in standard form ax² + bx + c = 0.",
      "Leading coefficient a must be non-zero (a ≠ 0).",
      "Real roots exist if and only if the discriminant D = b² - 4ac ≥ 0.",
    ],
    relatedConcepts: [
      "Discriminant and Nature of Roots (D > 0 distinct real, D = 0 equal real, D < 0 non-real complex)",
      "Sum of roots: α + β = -b/a",
      "Product of roots: αβ = c/a",
    ],
    derivationSummary:
      "Obtained by completing the square on ax² + bx + c = 0: Divide by a, add (b/(2a))² to both sides, and extract the square root: (x + b/(2a))² = (b² - 4ac)/(4a²).",
    solvedExample: {
      problemStatement: "Find the roots of the quadratic equation 2x² - 7x + 3 = 0 using the quadratic formula.",
      givenData: ["a = 2", "b = -7", "c = 3"],
      stepByStepSolution: [
        "Compute Discriminant: D = b² - 4ac = (-7)² - 4(2)(3) = 49 - 24 = 25.",
        "Since D = 25 > 0, there are two distinct real roots.",
        "Apply formula: x = [-(-7) ± √25] / (2 × 2) = (7 ± 5) / 4.",
        "Case 1 (Addition): x1 = (7 + 5)/4 = 12/4 = 3.",
        "Case 2 (Subtraction): x2 = (7 - 5)/4 = 2/4 = 1/2.",
      ],
      finalAnswer: "Roots are x = 3 and x = 1/2.",
    },
    commonMistakes: [
      "Forgetting the leading minus sign before b (e.g. writing b ± √D instead of -b ± √D when b is already negative).",
      "Dividing only the square root by 2a instead of the entire numerator (-b ± √D).",
      "Failing to square negative b correctly (e.g. evaluating -7² as -49 instead of +49).",
    ],
    examQuestionTypes: [
      "Direct 2-mark root calculation",
      "Find k such that equation has two equal roots (set D = 0)",
      "Contextual speed/time distance word problems",
    ],
    difficulty: "Easy",
    syllabusReference: "CBSE Class 10 Mathematics Chapter 4, Section 4.4; MSBSHSE SSC Part I Algebra Ch 2",
    applicableExams: ["Board", "Foundation"],
  },

  {
    id: "f-c10-mat-ap-sum",
    name: "Sum of First n Terms of an Arithmetic Progression",
    latexExpression: "S_n = \\frac{n}{2}[2a + (n - 1)d] = \\frac{n}{2}(a + l)",
    classLevel: 10,
    board: "all",
    stream: "general",
    subjectSlug: "c10-math-standard",
    subjectName: "Mathematics",
    chapterTitle: "Arithmetic Progressions",
    topicTitle: "Sum of n Terms",
    category: "Sequences & Series",
    outputUnit: "Scalar Sum",
    symbols: [
      { symbol: "S_n", meaning: "Sum of the first n terms", siUnit: "Scalar" },
      { symbol: "n", meaning: "Number of terms being summed (n ∈ ℕ)", siUnit: "Count" },
      { symbol: "a", meaning: "First term of the progression", siUnit: "Scalar" },
      { symbol: "d", meaning: "Common difference (d = a_k - a_{k-1})", siUnit: "Scalar" },
      { symbol: "l", meaning: "Last term (l = a_n = a + (n-1)d)", siUnit: "Scalar" },
    ],
    applicabilityConditions: [
      "Successive terms must have a constant difference d.",
      "The number of terms n must be a positive integer (n ≥ 1).",
    ],
    relatedConcepts: [
      "nth term formula: a_n = a + (n - 1)d",
      "Relation between sum and nth term: a_n = S_n - S_{n-1}",
      "Sum of first n natural numbers: Σn = n(n + 1)/2",
    ],
    derivationSummary:
      "Write Sn forward and backward, then add the two equations term-by-term. Each of the n pairs sums to (a + l), yielding 2Sn = n(a + l).",
    solvedExample: {
      problemStatement: "Find the sum of the first 20 terms of the AP: 3, 7, 11, 15, ...",
      givenData: ["First term a = 3", "Common difference d = 7 - 3 = 4", "Number of terms n = 20"],
      stepByStepSolution: [
        "Apply formula: S_20 = (20/2) × [2(3) + (20 - 1)(4)].",
        "Simplify bracket: 2(3) + 19(4) = 6 + 76 = 82.",
        "Multiply by n/2: S_20 = 10 × 82 = 820.",
      ],
      finalAnswer: "S_20 = 820.",
    },
    commonMistakes: [
      "Using (n + 1) instead of (n - 1) inside the square bracket.",
      "Confusing the nth term an with the total cumulative sum Sn.",
    ],
    examQuestionTypes: [
      "Find sum of first n terms given AP",
      "Determine number of terms required to yield a specified sum",
      "Practical daily savings or seating capacity word problems",
    ],
    difficulty: "Easy",
    syllabusReference: "CBSE Class 10 Mathematics Chapter 5, Section 5.3; MSBSHSE SSC Part I Algebra Ch 3",
    applicableExams: ["Board", "Foundation"],
  },

  {
    id: "f-c10-mat-distance-formula",
    name: "Distance Formula in 2D Cartesian Plane",
    latexExpression: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
    classLevel: 10,
    board: "all",
    stream: "general",
    subjectSlug: "c10-math-standard",
    subjectName: "Mathematics",
    chapterTitle: "Coordinate Geometry",
    topicTitle: "Distance Between Two Points",
    category: "Coordinate Geometry",
    outputUnit: "Metres or Linear Units",
    symbols: [
      { symbol: "d", meaning: "Euclidean distance between two coordinates", siUnit: "Linear units" },
      { symbol: "(x_1, y_1)", meaning: "Coordinates of the initial point P", siUnit: "Dimensionless coordinates" },
      { symbol: "(x_2, y_2)", meaning: "Coordinates of the terminal point Q", siUnit: "Dimensionless coordinates" },
    ],
    applicabilityConditions: [
      "Valid for any two points situated in a 2D Euclidean Cartesian plane.",
      "Distance is strictly non-negative: d ≥ 0, with d = 0 if and only if P ≡ Q.",
    ],
    relatedConcepts: [
      "Distance from origin: d = √(x² + y²)",
      "Pythagoras Theorem in right-angled triangles",
      "Collinearity test via AB + BC = AC",
    ],
    derivationSummary:
      "Construct a right-angled triangle with legs parallel to the axes: horizontal leg |x2 - x1| and vertical leg |y2 - y1|. By Pythagoras theorem, hypotenuse² = (x2 - x1)² + (y2 - y1)².",
    solvedExample: {
      problemStatement: "Find the distance between points P(2, -3) and Q(10, 3).",
      givenData: ["x1 = 2, y1 = -3", "x2 = 10, y2 = 3"],
      stepByStepSolution: [
        "Horizontal displacement: x2 - x1 = 10 - 2 = 8.",
        "Vertical displacement: y2 - y1 = 3 - (-3) = 6.",
        "Sum of squares: 8² + 6² = 64 + 36 = 100.",
        "Take square root: d = √100 = 10 units.",
      ],
      finalAnswer: "d = 10 units.",
    },
    commonMistakes: [
      "Mishandling negative coordinate subtraction, e.g. calculating 3 - (-3) as 0 instead of 6.",
      "Subtracting x from y instead of matching abscissa with abscissa and ordinate with ordinate.",
    ],
    examQuestionTypes: [
      "Verify whether three points form an equilateral, isosceles, or right triangle",
      "Find point on x-axis equidistant from two points",
    ],
    difficulty: "Easy",
    syllabusReference: "CBSE Class 10 Mathematics Chapter 7, Section 7.2; MSBSHSE SSC Part II Geometry Ch 5",
    applicableExams: ["Board", "Foundation"],
  },

  {
    id: "f-c10-mat-section-formula",
    name: "Section Formula (Internal Division)",
    latexExpression: "P(x, y) = \\left( \\frac{m_1 x_2 + m_2 x_1}{m_1 + m_2}, \\, \\frac{m_1 y_2 + m_2 y_1}{m_1 + m_2} \\right)",
    classLevel: 10,
    board: "all",
    stream: "general",
    subjectSlug: "c10-math-standard",
    subjectName: "Mathematics",
    chapterTitle: "Coordinate Geometry",
    topicTitle: "Section Formula",
    category: "Coordinate Geometry",
    outputUnit: "Coordinate Pair (x, y)",
    symbols: [
      { symbol: "P(x, y)", meaning: "Coordinates of dividing point", siUnit: "Coordinates" },
      { symbol: "m_1 : m_2", meaning: "Ratio of internal division AP : PB", siUnit: "Dimensionless ratio" },
      { symbol: "(x_1, y_1)", meaning: "Point A coordinates", siUnit: "Coordinates" },
      { symbol: "(x_2, y_2)", meaning: "Point B coordinates", siUnit: "Coordinates" },
    ],
    applicabilityConditions: [
      "Point P lies on line segment AB dividing it internally in ratio m1 : m2.",
      "m1 + m2 ≠ 0.",
    ],
    relatedConcepts: [
      "Midpoint formula when m1 = m2 = 1: M = ((x1+x2)/2, (y1+y2)/2)",
      "Centroid of triangle: G = ((x1+x2+x3)/3, (y1+y2+y3)/3)",
    ],
    derivationSummary:
      "Derived using similar right triangles formed by dropping perpendiculars from A, P, and B to the coordinate axes.",
    solvedExample: {
      problemStatement: "Find the coordinates of the point which divides the line segment joining (4, -3) and (8, 5) in the ratio 3:1 internally.",
      givenData: ["(x1, y1) = (4, -3)", "(x2, y2) = (8, 5)", "m1 = 3, m2 = 1"],
      stepByStepSolution: [
        "x-coordinate: x = [3(8) + 1(4)] / (3 + 1) = (24 + 4) / 4 = 28 / 4 = 7.",
        "y-coordinate: y = [3(5) + 1(-3)] / (3 + 1) = (15 - 3) / 4 = 12 / 4 = 3.",
      ],
      finalAnswer: "Point coordinates are (7, 3).",
    },
    commonMistakes: [
      "Swapping m1 and m2 cross-multiplication (m1 must multiply x2, and m2 must multiply x1).",
    ],
    examQuestionTypes: [
      "Find the ratio in which the y-axis divides a given line segment (set x = 0)",
      "Points of trisection of a line segment",
    ],
    difficulty: "Medium",
    syllabusReference: "CBSE Class 10 Mathematics Chapter 7, Section 7.3",
    applicableExams: ["Board", "Foundation"],
  },

  // ==========================================================================
  // CLASS 10 SCIENCE (PHYSICS & CHEMISTRY)
  // ==========================================================================
  {
    id: "f-c10-sci-ohms-law",
    name: "Ohm's Law & Conductor Resistance",
    latexExpression: "V = IR \\quad \\iff \\quad R = \\frac{\\rho L}{A}",
    classLevel: 10,
    board: "all",
    stream: "general",
    subjectSlug: "c10-science",
    subjectName: "Science",
    chapterTitle: "Electricity",
    topicTitle: "Ohm's Law and Resistance Factors",
    category: "Electricity",
    outputUnit: "Volts (V) / Ohms (Ω)",
    symbols: [
      { symbol: "V", meaning: "Potential difference across conductor", siUnit: "Volts (V)" },
      { symbol: "I", meaning: "Electric current flowing through conductor", siUnit: "Amperes (A)" },
      { symbol: "R", meaning: "Electrical resistance", siUnit: "Ohms (Ω)" },
      { symbol: "ρ", meaning: "Electrical resistivity of material", siUnit: "Ohm-metres (Ω·m)" },
      { symbol: "L", meaning: "Length of the conductor", siUnit: "Metres (m)" },
      { symbol: "A", meaning: "Cross-sectional area of conductor", siUnit: "Square metres (m²)" },
    ],
    applicabilityConditions: [
      "Physical conditions (especially temperature and mechanical strain) must remain strictly constant.",
      "Valid for ohmic conductors (metals at room temperature); invalid for non-ohmic devices (semiconductor diodes, thermistors).",
    ],
    relatedConcepts: [
      "V-I linear characteristic curve whose slope equals resistance R",
      "Series resistor combination: Rs = R1 + R2 + ... + Rn",
      "Parallel resistor combination: 1/Rp = 1/R1 + 1/R2 + ... + 1/Rn",
    ],
    derivationSummary:
      "George Simon Ohm experimentally demonstrated that current is directly proportional to voltage at constant temperature: I ∝ V, hence V/I = constant = R. Dimensionally, resistance depends on electron collision rate, yielding R = ρL/A.",
    solvedExample: {
      problemStatement: "A copper wire of length 2 m and cross-sectional area 1.7 × 10⁻⁶ m² has a resistivity of 1.7 × 10⁻⁸ Ω·m. Calculate its resistance and the current when connected to a 6 V battery.",
      givenData: ["L = 2 m", "A = 1.7 × 10⁻⁶ m²", "ρ = 1.7 × 10⁻⁸ Ω·m", "V = 6 V"],
      stepByStepSolution: [
        "Compute resistance: R = ρL/A = (1.7 × 10⁻⁸ × 2) / (1.7 × 10⁻⁶) = 2 × 10⁻² Ω = 0.02 Ω.",
        "Apply Ohm's law for current: I = V / R = 6 / 0.02 = 300 A.",
      ],
      finalAnswer: "R = 0.02 Ω and I = 300 A.",
    },
    commonMistakes: [
      "Converting mm² to m² incorrectly (1 mm² = 10⁻⁶ m², not 10⁻³ m²).",
      "Assuming resistivity changes when wire length or thickness changes (resistivity is an intrinsic material property independent of dimensions).",
    ],
    examQuestionTypes: [
      "Effect on resistance when wire is stretched to double its length (volume constant, so R becomes 4R)",
      "Circuit equivalent resistance with mixed series-parallel networks",
    ],
    difficulty: "Medium",
    syllabusReference: "CBSE Class 10 Science Chapter 11, Section 11.2; MSBSHSE SSC Part I Ch 4",
    applicableExams: ["Board", "Foundation"],
  },

  {
    id: "f-c10-sci-joules-law",
    name: "Joule's Law of Heating & Electric Power",
    latexExpression: "H = I^2 R t \\quad \\text{and} \\quad P = VI = I^2 R = \\frac{V^2}{R}",
    classLevel: 10,
    board: "all",
    stream: "general",
    subjectSlug: "c10-science",
    subjectName: "Science",
    chapterTitle: "Electricity",
    topicTitle: "Heating Effect of Electric Current",
    category: "Electricity",
    outputUnit: "Joules (J) / Watts (W)",
    symbols: [
      { symbol: "H", meaning: "Thermal heat energy generated", siUnit: "Joules (J)" },
      { symbol: "P", meaning: "Electric power consumption", siUnit: "Watts (W = J/s)" },
      { symbol: "I", meaning: "Electric current", siUnit: "Amperes (A)" },
      { symbol: "R", meaning: "Resistance of heating element", siUnit: "Ohms (Ω)" },
      { symbol: "t", meaning: "Time duration current flows", siUnit: "Seconds (s)" },
      { symbol: "V", meaning: "Operating voltage", siUnit: "Volts (V)" },
    ],
    applicabilityConditions: [
      "Applicable to purely resistive circuits where electrical work is converted entirely into thermal heat.",
      "Current must be steady over duration t.",
    ],
    relatedConcepts: [
      "Commercial unit of electrical energy: 1 kilowatt-hour (1 kWh) = 3.6 × 10⁶ J (1 Board of Trade Unit)",
      "Safety fuse rating based on thermal melting",
      "Nichrome heating elements with high resistivity and high melting point",
    ],
    derivationSummary:
      "Work done in moving charge Q through potential V is W = VQ. Since Q = It, W = VIt. By Ohm's law V = IR, yielding H = W = (IR)It = I²Rt.",
    solvedExample: {
      problemStatement: "An electric iron consumes energy at a rate of 840 W when heating is at maximum rate. The voltage is 220 V. Calculate the current and resistance.",
      givenData: ["Power P = 840 W", "Voltage V = 220 V"],
      stepByStepSolution: [
        "Calculate current: I = P / V = 840 / 220 ≈ 3.82 A.",
        "Calculate resistance: R = V / I = 220 / 3.818 ≈ 57.6 Ω (or R = V² / P = 220² / 840 ≈ 57.6 Ω).",
      ],
      finalAnswer: "Current I ≈ 3.82 A and Resistance R ≈ 57.6 Ω.",
    },
    commonMistakes: [
      "Forgetting to convert time in hours to seconds when computing heat in Joules.",
      "Assuming high-wattage bulbs have higher resistance (since P = V²/R, higher power corresponds to lower resistance).",
    ],
    examQuestionTypes: [
      "Calculate electricity bill given appliance ratings and operating hours",
      "Why heating coils are made of alloy rather than pure metals",
    ],
    difficulty: "Easy",
    syllabusReference: "CBSE Class 10 Science Chapter 11, Section 11.7",
    applicableExams: ["Board", "Foundation"],
  },

  {
    id: "f-c10-sci-snells-law",
    name: "Snell's Law of Refraction & Refractive Index",
    latexExpression: "n_{21} = \\frac{\\sin i}{\\sin r} = \\frac{v_1}{v_2} = \\frac{n_2}{n_1}",
    classLevel: 10,
    board: "all",
    stream: "general",
    subjectSlug: "c10-science",
    subjectName: "Science",
    chapterTitle: "Light – Reflection and Refraction",
    topicTitle: "Refraction & Snell's Law",
    category: "Optics",
    outputUnit: "Dimensionless Ratio",
    symbols: [
      { symbol: "n_{21}", meaning: "Refractive index of medium 2 relative to medium 1", siUnit: "Dimensionless" },
      { symbol: "i", meaning: "Angle of incidence measured from surface normal", siUnit: "Degrees / Radians" },
      { symbol: "r", meaning: "Angle of refraction measured from surface normal", siUnit: "Degrees / Radians" },
      { symbol: "v_1, v_2", meaning: "Speed of light in medium 1 and medium 2", siUnit: "Metres per second (m/s)" },
      { symbol: "c", meaning: "Speed of light in vacuum (3.0 × 10⁸ m/s)", siUnit: "m/s", isConstant: true },
    ],
    applicabilityConditions: [
      "Light must be monochromatic (single wavelength).",
      "Boundary between media must be optically smooth and planar.",
      "Angle of incidence must not be 0° (normal incidence experiences no bending: i=0 => r=0).",
    ],
    relatedConcepts: [
      "Absolute refractive index: n = c / v",
      "Optical density vs mass density (e.g. kerosene has higher refractive index than water but lower mass density)",
      "Lateral displacement through a rectangular glass slab",
    ],
    derivationSummary:
      "Arises from Fermat's Principle of Least Time: light traverses the path requiring minimum transit time across the boundary, producing sin i / sin r = v1 / v2.",
    solvedExample: {
      problemStatement: "Light enters from air into glass having refractive index 1.50. What is the speed of light in the glass?",
      givenData: ["n_glass = 1.50", "c = 3.0 × 10⁸ m/s"],
      stepByStepSolution: [
        "Apply absolute refractive index definition: n = c / v.",
        "Rearrange for speed in medium: v = c / n.",
        "Substitute values: v = (3.0 × 10⁸) / 1.50 = 2.0 × 10⁸ m/s.",
      ],
      finalAnswer: "v = 2.0 × 10⁸ m/s.",
    },
    commonMistakes: [
      "Measuring angles from the glass interface surface instead of from the perpendicular normal.",
      "Inverting ratio n21 (writing n1/n2 instead of n2/n1).",
    ],
    examQuestionTypes: [
      "Calculate refractive index from ray diagram angles",
      "Apparent depth calculation for coin at bottom of water beaker",
    ],
    difficulty: "Easy",
    syllabusReference: "CBSE Class 10 Science Chapter 9, Section 9.3; MSBSHSE SSC Part I Ch 6",
    applicableExams: ["Board", "Foundation"],
  },

  {
    id: "f-c10-sci-lens-formula",
    name: "Thin Lens Formula & Optical Power",
    latexExpression: "\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}, \\quad m = \\frac{v}{u} = \\frac{h'}{h}, \\quad P = \\frac{1}{f \\text{ (in metres)}}",
    classLevel: 10,
    board: "all",
    stream: "general",
    subjectSlug: "c10-science",
    subjectName: "Science",
    chapterTitle: "Light – Reflection and Refraction",
    topicTitle: "Spherical Lenses & Power",
    category: "Optics",
    outputUnit: "Dioptres (D = m⁻¹)",
    symbols: [
      { symbol: "f", meaning: "Focal length (+ for convex, - for concave)", siUnit: "Metres (m)" },
      { symbol: "v", meaning: "Image distance from optical centre", siUnit: "Metres (m)" },
      { symbol: "u", meaning: "Object distance from optical centre (always negative)", siUnit: "Metres (m)" },
      { symbol: "m", meaning: "Linear magnification (- for real/inverted, + for virtual/erect)", siUnit: "Dimensionless" },
      { symbol: "P", meaning: "Power of lens", siUnit: "Dioptres (D)" },
    ],
    applicabilityConditions: [
      "Aperture of lens must be small compared to radii of curvature (paraxial ray approximation).",
      "Lens thickness must be negligible (thin lens assumption).",
      "New Cartesian Sign Convention must be strictly applied.",
    ],
    relatedConcepts: [
      "Mirror formula: 1/f = 1/v + 1/u with m = -v/u",
      "Combination of lenses in contact: P_eq = P1 + P2 + ... + Pn",
      "Convex lens convergence vs concave lens divergence",
    ],
    derivationSummary:
      "Derived using geometry of similar triangles formed by object-ray through optical centre and refracted ray through principal focus.",
    solvedExample: {
      problemStatement: "A concave lens has focal length of 15 cm. At what distance should the object from the lens be placed so that it forms an image at 10 cm from the lens? Also find magnification.",
      givenData: ["Concave lens: f = -15 cm", "Virtual image formed on same side: v = -10 cm"],
      stepByStepSolution: [
        "Apply lens formula: 1/f = 1/v - 1/u => 1/u = 1/v - 1/f.",
        "Substitute values: 1/u = 1/(-10) - 1/(-15) = -1/10 + 1/15.",
        "Common denominator (30): 1/u = (-3 + 2)/30 = -1/30.",
        "Therefore, object distance u = -30 cm (object is 30 cm in front of lens).",
        "Magnification: m = v / u = (-10) / (-30) = +1/3 ≈ +0.33 (virtual, erect, diminished).",
      ],
      finalAnswer: "Object distance u = -30 cm; Magnification m = +0.33.",
    },
    commonMistakes: [
      "Using plus sign between 1/v and 1/u (confusing lens formula with mirror formula).",
      "Forgetting to convert focal length from cm to metres when calculating power P = 1/f in dioptres.",
      "Assigning positive sign to object distance u.",
    ],
    examQuestionTypes: [
      "Numerical calculation of image position, size, and nature",
      "Prescription lens calculation (e.g. corrective power P = -2.5 D for myopia)",
    ],
    difficulty: "Medium",
    syllabusReference: "CBSE Class 10 Science Chapter 9, Section 9.3.7",
    applicableExams: ["Board", "Foundation"],
  },

  // ==========================================================================
  // CLASS 12 PHYSICS
  // ==========================================================================
  {
    id: "f-c12-phy-coulomb",
    name: "Coulomb's Law of Electrostatic Force",
    latexExpression: "F = \\frac{1}{4\\pi \\varepsilon_0 \\varepsilon_r} \\frac{|q_1 q_2|}{r^2}",
    classLevel: 12,
    board: "all",
    stream: "science",
    subjectSlug: "c12-physics",
    subjectName: "Physics",
    chapterTitle: "Electric Charges and Fields",
    topicTitle: "Coulomb's Law",
    category: "Electrostatics",
    outputUnit: "Newtons (N)",
    symbols: [
      { symbol: "F", meaning: "Electrostatic mutual force between charges", siUnit: "Newtons (N)" },
      { symbol: "q_1, q_2", meaning: "Magnitude of interacting point charges", siUnit: "Coulombs (C)" },
      { symbol: "r", meaning: "Distance of separation between centres of charge", siUnit: "Metres (m)" },
      { symbol: "\\varepsilon_0", meaning: "Permittivity of free space (8.854 × 10⁻¹² C²·N⁻¹·m⁻²)", siUnit: "C²/(N·m²)", isConstant: true },
      { symbol: "k", meaning: "Coulomb constant 1/(4πε0) ≈ 8.987 × 10⁹ N·m²·C⁻²", siUnit: "N·m²/C²", isConstant: true },
      { symbol: "\\varepsilon_r", meaning: "Relative permittivity or dielectric constant K of medium", siUnit: "Dimensionless" },
    ],
    applicabilityConditions: [
      "Charges must behave as stationary point charges (radius << separation distance r).",
      "Valid strictly in isotropic dielectric media or free vacuum.",
      "Applicable for distances down to nuclear scale (r > 10⁻¹⁵ m where strong nuclear forces dominate).",
    ],
    relatedConcepts: [
      "Vector form: F₁₂ = -F₂₁ (obeys Newton's Third Law)",
      "Principle of Superposition for multi-charge systems",
      "Electric field of point charge: E = F / q₀ = k q / r²",
    ],
    derivationSummary:
      "Formulated experimentally via torsion balance by Charles-Augustin de Coulomb: inverse square variation F ∝ 1/r² combined with charge product proportionality F ∝ |q1q2|.",
    solvedExample: {
      problemStatement: "Two point charges q1 = +2 μC and q2 = -3 μC are placed in vacuum separated by 30 cm. Find the electrostatic force between them.",
      givenData: ["q1 = 2 × 10⁻⁶ C", "q2 = 3 × 10⁻⁶ C", "r = 30 cm = 0.30 m", "k = 9.0 × 10⁹ N·m²/C²"],
      stepByStepSolution: [
        "Apply Coulomb's law: F = k |q1 q2| / r².",
        "Substitute values: F = (9.0 × 10⁹ × 2 × 10⁻⁶ × 3 × 10⁻⁶) / (0.30)².",
        "Numerator: 9.0 × 10⁹ × 6 × 10⁻¹² = 54 × 10⁻³ = 0.054 N·m².",
        "Denominator: (0.30)² = 0.09 m².",
        "Divide: F = 0.054 / 0.09 = 0.60 N.",
        "Since charges have opposite signs, the force is attractive.",
      ],
      finalAnswer: "F = 0.60 N (attractive along line joining charges).",
    },
    commonMistakes: [
      "Forgetting to convert microcoulombs (μC) to coulombs (× 10⁻⁶ C).",
      "Leaving distance in centimetres instead of converting to metres.",
      "Including charge negative signs directly inside the magnitude formula rather than interpreting sign as direction (attractive vs repulsive).",
    ],
    examQuestionTypes: [
      "Ratio of force in dielectric medium versus vacuum (F_med = F_vac / K)",
      "Null point location between two like or unlike charges on an axis",
      "Equilateral triangle three-charge vector equilibrium",
    ],
    difficulty: "Medium",
    syllabusReference: "CBSE Class 12 Physics Chapter 1, Section 1.3; MSBSHSE HSC Physics Ch 8",
    applicableExams: ["Board", "JEE", "NEET", "MHT-CET"],
  },

  {
    id: "f-c12-phy-gauss-law",
    name: "Gauss's Law of Electrostatics",
    latexExpression: "\\Phi_E = \\oint_{\\mathcal{S}} \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enclosed}}}{\\varepsilon_0}",
    classLevel: 12,
    board: "all",
    stream: "science",
    subjectSlug: "c12-physics",
    subjectName: "Physics",
    chapterTitle: "Electric Charges and Fields",
    topicTitle: "Gauss's Theorem & Applications",
    category: "Electrostatics",
    outputUnit: "Volt-metres (V·m) or N·m²/C",
    symbols: [
      { symbol: "\\Phi_E", meaning: "Total electric flux through closed Gaussian surface", siUnit: "N·m²/C or V·m" },
      { symbol: "\\vec{E}", meaning: "Electric field vector at surface element", siUnit: "Volts per metre (V/m)" },
      { symbol: "d\\vec{A}", meaning: "Outward normal differential area vector", siUnit: "Square metres (m²)" },
      { symbol: "Q_{\\text{enclosed}}", meaning: "Net algebraic sum of charges inside closed surface", siUnit: "Coulombs (C)" },
      { symbol: "\\varepsilon_0", meaning: "Vacuum permittivity", siUnit: "C²/(N·m²)", isConstant: true },
    ],
    applicabilityConditions: [
      "The Gaussian surface must be completely closed (hypothetical 3D closed surface).",
      "Charges outside the surface contribute to local electric field E but contribute zero net flux over the entire closed surface.",
      "Most powerful when the charge distribution possesses cylindrical, planar, or spherical symmetry.",
    ],
    relatedConcepts: [
      "Field of infinitely long straight wire: E = λ / (2πε0 r)",
      "Field of uniformly charged infinite plane sheet: E = σ / (2ε0)",
      "Electric field inside a charged spherical conducting shell is identically zero: E_inside = 0",
    ],
    derivationSummary:
      "Derived from Coulomb's law and solid angle geometry. A point charge q produces flux dΦ = (q / 4πε0 r²) (r² dΩ) = (q / 4πε0) dΩ. Integrating over all 4π steradians yields Φ = q / ε0.",
    solvedExample: {
      problemStatement: "A point charge of 2.0 μC is at the centre of a cubic Gaussian surface 9.0 cm on edge. What is the net electric flux through the surface and through one face of the cube?",
      givenData: ["Q = 2.0 × 10⁻⁶ C", "ε0 = 8.854 × 10⁻¹² C²/(N·m²)"],
      stepByStepSolution: [
        "Apply Gauss's law for total flux: Φ_total = Q / ε0.",
        "Calculate total flux: Φ_total = (2.0 × 10⁻⁶) / (8.854 × 10⁻¹²) ≈ 2.26 × 10⁵ N·m²/C.",
        "Due to cubic symmetry, the charge at centre distributes flux equally across all 6 identical faces.",
        "Flux through one face: Φ_face = Φ_total / 6 = (2.26 × 10⁵) / 6 ≈ 3.77 × 10⁴ N·m²/C.",
      ],
      finalAnswer: "Total flux = 2.26 × 10⁵ N·m²/C; Flux through one face = 3.77 × 10⁴ N·m²/C.",
    },
    commonMistakes: [
      "Assuming the edge length of the cube affects total flux (flux is completely independent of surface size or shape).",
      "Forgetting to divide by 6 when asked for flux through an individual face of a symmetric cube.",
    ],
    examQuestionTypes: [
      "Derivation of electric field due to infinite line charge",
      "Flux through a hemisphere or open cylinder capped by flat disc",
    ],
    difficulty: "Medium",
    syllabusReference: "CBSE Class 12 Physics Chapter 1, Section 1.5",
    applicableExams: ["Board", "JEE", "NEET"],
  },

  {
    id: "f-c12-phy-parallel-plate-cap",
    name: "Parallel Plate Capacitance with Dielectric Slab",
    latexExpression: "C = \\frac{K \\varepsilon_0 A}{d} \\quad \\text{and with slab of thickness } t: \\quad C = \\frac{\\varepsilon_0 A}{d - t + \\frac{t}{K}}",
    classLevel: 12,
    board: "all",
    stream: "science",
    subjectSlug: "c12-physics",
    subjectName: "Physics",
    chapterTitle: "Electrostatic Potential and Capacitance",
    topicTitle: "Capacitance & Dielectrics",
    category: "Electrostatics",
    outputUnit: "Farads (F)",
    symbols: [
      { symbol: "C", meaning: "Capacitance", siUnit: "Farads (F = C/V)" },
      { symbol: "A", meaning: "Overlapping surface area of conducting plates", siUnit: "Square metres (m²)" },
      { symbol: "d", meaning: "Plate separation distance", siUnit: "Metres (m)" },
      { symbol: "K", meaning: "Dielectric constant of intervening medium", siUnit: "Dimensionless" },
      { symbol: "t", meaning: "Thickness of partially inserted dielectric slab (t < d)", siUnit: "Metres (m)" },
    ],
    applicabilityConditions: [
      "Linear dimensions of plates must be much larger than separation d (neglect fringing field edges).",
      "Dielectric must be linear, homogeneous, and isotropic.",
    ],
    relatedConcepts: [
      "Stored electrostatic energy: U = (1/2)CV² = Q²/(2C) = (1/2)QV",
      "Energy density in electric field: u = (1/2)ε0 E²",
      "Effect of dielectric insertion with battery connected (V constant) vs battery disconnected (Q constant)",
    ],
    derivationSummary:
      "Electric field in air is E0 = σ/ε0 = Q/(Aε0). In dielectric, field reduces to E = E0/K. Potential difference V = E0(d - t) + E t = (Q/Aε0)[d - t + t/K]. Since C = Q/V, the result follows.",
    solvedExample: {
      problemStatement: "A parallel plate capacitor with air between plates has capacitance 8 pF. What will be the capacitance if distance is reduced by half and space is filled with dielectric of K = 6?",
      givenData: ["Initial air capacitance C0 = 8 pF", "New distance d' = d/2", "Dielectric constant K = 6"],
      stepByStepSolution: [
        "Initial capacitance formula: C0 = ε0 A / d = 8 pF.",
        "New capacitance: C' = K ε0 A / d' = K ε0 A / (d/2) = 2 K (ε0 A / d).",
        "Substitute values: C' = 2 × 6 × C0 = 12 × 8 pF = 96 pF.",
      ],
      finalAnswer: "C' = 96 pF (an increase of 12-fold).",
    },
    commonMistakes: [
      "Confusing picofarads (pF = 10⁻¹² F) and microfarads (μF = 10⁻⁶ F).",
      "Mixing up whether voltage or charge remains constant during battery disconnection.",
    ],
    examQuestionTypes: [
      "Effect on charge, voltage, capacitance, field, and energy upon inserting dielectric with battery connected vs disconnected",
      "Equivalent capacitance of multiple alternating dielectric layers",
    ],
    difficulty: "Medium",
    syllabusReference: "CBSE Class 12 Physics Chapter 2, Section 2.8",
    applicableExams: ["Board", "JEE", "NEET", "MHT-CET"],
  },

  {
    id: "f-c12-phy-biot-savart",
    name: "Biot-Savart Law & Circular Loop Magnetic Field",
    latexExpression: "d\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{I (d\\vec{l} \\times \\hat{r})}{r^2}, \\quad B_{\\text{axis}} = \\frac{\\mu_0 N I R^2}{2(R^2 + x^2)^{3/2}}",
    classLevel: 12,
    board: "all",
    stream: "science",
    subjectSlug: "c12-physics",
    subjectName: "Physics",
    chapterTitle: "Moving Charges and Magnetism",
    topicTitle: "Biot-Savart Law",
    category: "Magnetism",
    outputUnit: "Tesla (T = N·A⁻¹·m⁻¹)",
    symbols: [
      { symbol: "B", meaning: "Magnetic flux density (magnetic field)", siUnit: "Tesla (T)" },
      { symbol: "I", meaning: "Steady electric current", siUnit: "Amperes (A)" },
      { symbol: "d\\vec{l}", meaning: "Vector length element in direction of current", siUnit: "Metres (m)" },
      { symbol: "\\hat{r}", meaning: "Unit displacement vector from current element to point", siUnit: "Dimensionless" },
      { symbol: "\\mu_0", meaning: "Permeability of free space (4π × 10⁻⁷ T·m/A)", siUnit: "T·m/A", isConstant: true },
      { symbol: "R", meaning: "Radius of circular coil", siUnit: "Metres (m)" },
      { symbol: "x", meaning: "Axial distance from centre of coil", siUnit: "Metres (m)" },
      { symbol: "N", meaning: "Number of turns in coil", siUnit: "Count" },
    ],
    applicabilityConditions: [
      "Current must be steady (magnetostatics).",
      "At centre of loop where x = 0, formula simplifies to B_centre = μ0 N I / (2R).",
      "At large axial distance x >> R, B ≈ μ0 m / (2π x³) where m = NIA is magnetic dipole moment.",
    ],
    relatedConcepts: [
      "Ampere's Circuital Law: ∮ B · dl = μ0 I_enclosed",
      "Right-Hand Grip Rule for magnetic dipole polarity",
      "Field of long straight wire: B = μ0 I / (2π r)",
    ],
    derivationSummary:
      "Integrate dB along circular circumference. Due to symmetry, components perpendicular to axis cancel, while axial components sum to B = ∫ dB cosθ = ∫ [μ0 I dl / (4π r²)] (R / r) = [μ0 I R / (4π r³)] (2π R) = μ0 I R² / (2 r³). Substituting r = √(R² + x²) gives the result.",
    solvedExample: {
      problemStatement: "A circular coil of wire consisting of 100 turns, each of radius 8.0 cm carries a current of 0.40 A. What is the magnitude of the magnetic field B at the centre of the coil?",
      givenData: ["N = 100 turns", "R = 8.0 cm = 0.08 m", "I = 0.40 A", "μ0 = 4π × 10⁻⁷ T·m/A"],
      stepByStepSolution: [
        "Apply formula at centre (x = 0): B = μ0 N I / (2R).",
        "Substitute values: B = (4π × 10⁻⁷ × 100 × 0.40) / (2 × 0.08).",
        "Numerator: 4π × 10⁻⁷ × 40 = 160π × 10⁻⁷ = 1.6π × 10⁻⁵.",
        "Denominator: 2 × 0.08 = 0.16.",
        "Divide: B = (1.6π × 10⁻⁵) / 0.16 = 10π × 10⁻⁵ = π × 10⁻⁴ T ≈ 3.14 × 10⁻⁴ T.",
      ],
      finalAnswer: "B ≈ 3.14 × 10⁻⁴ T.",
    },
    commonMistakes: [
      "Forgetting to multiply by number of turns N.",
      "Confusing magnetic field at centre (2R in denominator) with long straight wire (2πr in denominator).",
    ],
    examQuestionTypes: [
      "Ratio of field at centre to field at an axial point x = R√3",
      "Biot-Savart vector integration for semi-circular wire and straight lead segments",
    ],
    difficulty: "Hard",
    syllabusReference: "CBSE Class 12 Physics Chapter 4, Section 4.5; MSBSHSE HSC Physics Ch 10",
    applicableExams: ["Board", "JEE", "NEET"],
  },

  // ==========================================================================
  // CLASS 12 MATHEMATICS
  // ==========================================================================
  {
    id: "f-c12-mat-bayes-theorem",
    name: "Bayes' Theorem of Posterior Probability",
    latexExpression: "P(E_i | A) = \\frac{P(E_i) P(A | E_i)}{\\sum_{j=1}^{n} P(E_j) P(A | E_j)}",
    classLevel: 12,
    board: "all",
    stream: "science",
    subjectSlug: "c12-mathematics",
    subjectName: "Mathematics",
    chapterTitle: "Probability",
    topicTitle: "Bayes' Theorem",
    category: "Probability",
    outputUnit: "Probability Value [0, 1]",
    symbols: [
      { symbol: "P(E_i | A)", meaning: "Posterior probability of hypothesis Ei given observed event A", siUnit: "Probability" },
      { symbol: "P(E_i)", meaning: "Prior probability of hypothesis Ei before observation", siUnit: "Probability" },
      { symbol: "P(A | E_i)", meaning: "Likelihood of observing event A under hypothesis Ei", siUnit: "Probability" },
      { symbol: "P(A)", meaning: "Total probability of event A (denominator sum)", siUnit: "Probability" },
    ],
    applicabilityConditions: [
      "The set of events {E1, E2, ..., En} must form a partition of sample space S (mutually exclusive Ei ∩ Ej = ∅ and exhaustive ∪ Ei = S).",
      "Each prior probability must be non-zero: P(Ei) > 0.",
      "Observed event A must have non-zero probability: P(A) > 0.",
    ],
    relatedConcepts: [
      "Conditional Probability: P(A|B) = P(A ∩ B) / P(B)",
      "Theorem of Total Probability: P(A) = Σ P(Ej) P(A|Ej)",
      "Independent Events: P(A ∩ B) = P(A) P(B)",
    ],
    derivationSummary:
      "From definition of conditional probability: P(Ei ∩ A) = P(Ei|A)P(A) = P(A|Ei)P(Ei). Solving for P(Ei|A) and substituting P(A) via theorem of total probability yields Bayes' Theorem.",
    solvedExample: {
      problemStatement: "Bag I contains 3 red and 4 black balls, while Bag II contains 5 red and 6 black balls. One ball is drawn at random from one of the bags and is found to be red. Find the probability that it was drawn from Bag II.",
      givenData: ["E1: Bag I chosen, P(E1) = 1/2", "E2: Bag II chosen, P(E2) = 1/2", "P(Red|E1) = 3/7", "P(Red|E2) = 5/11"],
      stepByStepSolution: [
        "Compute Total Probability of drawing a Red ball P(A):",
        "P(A) = P(E1)P(A|E1) + P(E2)P(A|E2) = (1/2)(3/7) + (1/2)(5/11) = 3/14 + 5/22.",
        "Common denominator (154): (33 + 35) / 154 = 68 / 154 = 34 / 77.",
        "Apply Bayes' theorem for Bag II P(E2|A):",
        "P(E2|A) = [(1/2)(5/11)] / [34/77] = (5/22) / (34/77) = (5/22) × (77/34) = (5 × 7) / (2 × 34) = 35 / 68.",
      ],
      finalAnswer: "P(Bag II | Red) = 35 / 68 ≈ 0.515.",
    },
    commonMistakes: [
      "Inverting the conditional probability (computing P(A|E2) instead of P(E2|A)).",
      "Failing to account for unequal prior bag selection probabilities when specified.",
    ],
    examQuestionTypes: [
      "Medical diagnostic test true-positive vs false-positive rates",
      "Factory defective bolt manufacture probability across machines A, B, C",
    ],
    difficulty: "Hard",
    syllabusReference: "CBSE Class 12 Mathematics Chapter 13, Section 13.3",
    applicableExams: ["Board", "JEE", "CUET"],
  },

  {
    id: "f-c12-mat-integration-parts",
    name: "Integration by Parts (ILATE Rule)",
    latexExpression: "\\int u(x) v'(x) \\, dx = u(x) v(x) - \\int u'(x) v(x) \\, dx",
    classLevel: 12,
    board: "all",
    stream: "science",
    subjectSlug: "c12-mathematics",
    subjectName: "Mathematics",
    chapterTitle: "Integrals",
    topicTitle: "Integration by Parts",
    category: "Calculus",
    outputUnit: "Antiderivative Function + Constant C",
    symbols: [
      { symbol: "u(x)", meaning: "First function chosen via ILATE priority", siUnit: "Function" },
      { symbol: "v'(x) dx", meaning: "Second function to be integrated", siUnit: "Differential" },
      { symbol: "u'(x)", meaning: "Derivative of the first function", siUnit: "Function" },
      { symbol: "v(x)", meaning: "Integral of the second function (v = ∫ v' dx)", siUnit: "Function" },
    ],
    applicabilityConditions: [
      "Both functions u(x) and v(x) must be differentiable and integrable over the evaluation domain.",
      "ILATE order of priority for selecting u(x): Inverse trigonometric, Logarithmic, Algebraic, Trigonometric, Exponential.",
    ],
    relatedConcepts: [
      "Special form: ∫ e^x [f(x) + f'(x)] dx = e^x f(x) + C",
      "Reduction formulas for ∫ x^n e^x dx and ∫ sin^n(x) dx",
      "Definite integrals by parts with boundary evaluation [uv]_a^b",
    ],
    derivationSummary:
      "Arises directly from product rule of differentiation: d/dx(uv) = u(dv/dx) + v(du/dx). Integrating both sides with respect to x yields uv = ∫ u (dv/dx) dx + ∫ v (du/dx) dx, which rearranges to ∫ u dv = uv - ∫ v du.",
    solvedExample: {
      problemStatement: "Evaluate ∫ x · cos(x) dx.",
      givenData: ["ILATE order: x is Algebraic (u = x)", "cos(x) is Trigonometric (dv = cos(x) dx)"],
      stepByStepSolution: [
        "Compute derivatives and integrals: u = x => du = dx.",
        "v = ∫ cos(x) dx = sin(x).",
        "Apply formula: ∫ x cos(x) dx = x sin(x) - ∫ sin(x) dx.",
        "Evaluate remaining integral: -(-cos(x)) = +cos(x).",
        "Add constant of integration: x sin(x) + cos(x) + C.",
      ],
      finalAnswer: "∫ x cos(x) dx = x sin(x) + cos(x) + C.",
    },
    commonMistakes: [
      "Selecting the wrong function as u (e.g. choosing sin(x) as u instead of x in ∫ x sin(x) dx, causing power of x to increase).",
      "Omitting the constant of integration C in indefinite integrals.",
      "Misplacing minus signs during integration of trig functions (∫ sin(x) dx = -cos(x)).",
    ],
    examQuestionTypes: [
      "Integrals of single functions: ∫ ln(x) dx (take second function as 1)",
      "Cyclic integrals requiring back-substitution: ∫ e^(ax) sin(bx) dx",
    ],
    difficulty: "Medium",
    syllabusReference: "CBSE Class 12 Mathematics Chapter 7, Section 7.6; MSBSHSE HSC Part II Ch 3",
    applicableExams: ["Board", "JEE", "MHT-CET"],
  },

  // ==========================================================================
  // COMMERCE & ECONOMICS
  // ==========================================================================
  {
    id: "f-com-accounting-equation",
    name: "The Fundamental Accounting Equation",
    latexExpression: "\\text{Assets} = \\text{Liabilities} + \\text{Capital} + (\\text{Revenues} - \\text{Expenses})",
    classLevel: 11,
    board: "all",
    stream: "commerce",
    subjectSlug: "com-accountancy",
    subjectName: "Book-Keeping & Accountancy",
    chapterTitle: "Introduction to Accounting & Double Entry",
    topicTitle: "Accounting Equation",
    category: "Financial Accounting",
    outputUnit: "Currency Units (₹ INR)",
    symbols: [
      { symbol: "Assets", meaning: "Economic resources owned by enterprise (Cash, Stock, Debtors, Machinery)", siUnit: "Currency (₹)" },
      { symbol: "Liabilities", meaning: "External financial claims owed to third parties (Creditors, Bank Loans)", siUnit: "Currency (₹)" },
      { symbol: "Capital", meaning: "Owner's equity / proprietary net worth invested into firm", siUnit: "Currency (₹)" },
      { symbol: "Revenues", meaning: "Gross inflow of economic benefits from sales/services", siUnit: "Currency (₹)" },
      { symbol: "Expenses", meaning: "Operational costs incurred to generate revenues", siUnit: "Currency (₹)" },
    ],
    applicabilityConditions: [
      "Dual-aspect concept must govern every transaction: Total Debits must identically equal Total Credits.",
      "Accounting entity principle: the business is treated as distinct from its proprietor.",
    ],
    relatedConcepts: [
      "Working Capital = Current Assets - Current Liabilities",
      "Balance Sheet equilibrium",
      "Net Profit = Revenues - Expenses",
    ],
    derivationSummary:
      "Luca Pacioli's dual-aspect convention: every transaction has two reciprocal effects (giving and receiving). Therefore, total proprietary claims plus external claims must equal total business assets.",
    solvedExample: {
      problemStatement: "A business commenced operations with Cash ₹ 5,00,000, purchased goods on credit for ₹ 1,20,000, and sold goods costing ₹ 80,000 for ₹ 1,00,000 cash. Prove the accounting equation holds.",
      givenData: ["Initial Capital = ₹ 5,00,000", "Credit Purchases = ₹ 1,20,000", "Cost of Goods Sold = ₹ 80,000", "Sales Revenue = ₹ 1,00,000"],
      stepByStepSolution: [
        "Transaction 1 (Start): Assets (Cash ₹ 5,00,000) = Liabilities (0) + Capital (₹ 5,00,000).",
        "Transaction 2 (Credit Goods): Assets (Cash ₹ 5,00,000 + Stock ₹ 1,20,000) = Liabilities (Creditors ₹ 1,20,000) + Capital (₹ 5,00,000). Total = ₹ 6,20,000.",
        "Transaction 3 (Cash Sale at Profit): Cash increases by ₹ 1,00,000 (New Cash = ₹ 6,00,000); Stock decreases by ₹ 80,000 (New Stock = ₹ 40,000). Net Profit = ₹ 20,000 added to Capital.",
        "Final Assets = Cash (₹ 6,00,000) + Stock (₹ 40,000) = ₹ 6,40,000.",
        "Final Liabilities + Capital = Creditors (₹ 1,20,000) + Capital (₹ 5,00,000 + ₹ 20,000 profit) = ₹ 6,40,000.",
      ],
      finalAnswer: "Assets (₹ 6,40,000) = Liabilities (₹ 1,20,000) + Capital (₹ 5,20,000). Equation balanced.",
    },
    commonMistakes: [
      "Adding revenue to Cash without deducting the corresponding cost of goods sold from Stock.",
      "Treating drawings as an expense rather than a direct reduction of proprietor's Capital.",
    ],
    examQuestionTypes: [
      "Trace multi-step ledger entries on accounting equation tabular worksheet",
      "Compute closing capital given opening capital, additional capital, drawings, and profit",
    ],
    difficulty: "Easy",
    syllabusReference: "CBSE Class 11 Accountancy Chapter 3; MSBSHSE FYJC Book-Keeping Ch 2",
    applicableExams: ["Board", "Foundation"],
  },
];

/**
 * Filter formulas across class, subject, exam, and search term.
 */
export function queryFormulaRegistry(params: {
  classLevel?: 10 | 11 | 12;
  subjectSlug?: string;
  category?: string;
  examTrack?: string;
  searchTerm?: string;
}): AcademicFormulaRecord[] {
  return ACADEMIC_FORMULA_REGISTRY.filter((rec) => {
    if (params.classLevel && rec.classLevel !== params.classLevel) {
      return false;
    }
    if (params.subjectSlug && rec.subjectSlug !== params.subjectSlug) {
      return false;
    }
    if (params.category && rec.category.toLowerCase() !== params.category.toLowerCase()) {
      return false;
    }
    if (
      params.examTrack &&
      !rec.applicableExams.some((ex) => ex.toLowerCase() === params.examTrack?.toLowerCase())
    ) {
      return false;
    }
    if (params.searchTerm) {
      const q = params.searchTerm.toLowerCase();
      const inName = rec.name.toLowerCase().includes(q);
      const inTopic = rec.topicTitle.toLowerCase().includes(q);
      const inChapter = rec.chapterTitle.toLowerCase().includes(q);
      const inSymbols = rec.symbols.some(
        (s) => s.symbol.toLowerCase().includes(q) || s.meaning.toLowerCase().includes(q)
      );
      if (!inName && !inTopic && !inChapter && !inSymbols) return false;
    }
    return true;
  });
}
