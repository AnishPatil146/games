/**
 * THE UNWRITTEN — THE ACADEMY 3.0 VISUAL LEARNING LAB REGISTRY
 *
 * Interactive mathematical, physical, chemical, biological, commercial,
 * historical, and computer science simulations and visualisations.
 * Supports:
 * - Interactive Diagrams (zoom/pan, selectable labels, component explanations)
 * - Interactive Simulations (variable inputs with verified computational models)
 * - Animated Explanations (play, pause, step forward/backward, speed controls)
 * - Graph Explorers (functions, kinematics, economic equilibrium)
 * - Process Visualizations (mitosis, sorting algorithms, circuit current flow)
 */

export type SimulationDomain =
  | "mathematics"
  | "physics"
  | "chemistry"
  | "biology"
  | "commerce"
  | "humanities"
  | "computerscience";

export type VisualisationType =
  | "INTERACTIVE_DIAGRAM"
  | "INTERACTIVE_SIMULATION"
  | "ANIMATED_EXPLANATION"
  | "GRAPH_EXPLORER"
  | "PROCESS_FLOW";

export interface InteractiveParameter {
  id: string;
  name: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description: string;
}

export interface DiagramSimulationSpec {
  id: string;
  title: string;
  domain: SimulationDomain;
  visualType: VisualisationType;
  classLevel: 10 | 11 | 12;
  subjectName: string;
  chapterTitle: string;
  conceptId?: string;
  description: string;
  instructionPrompt: string;
  parameters: InteractiveParameter[];
  keyPrinciples: string[];
  knowledgeCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const DIAGRAM_SIMULATION_CATALOGUE: DiagramSimulationSpec[] = [
  // 1. Math: Trigonometric Unit Circle & Wave Plotter
  {
    id: "sim-math-unit-circle",
    title: "Trigonometric Unit Circle & Wave Plotter",
    domain: "mathematics",
    visualType: "GRAPH_EXPLORER",
    classLevel: 10,
    subjectName: "Mathematics Standard",
    chapterTitle: "Introduction to Trigonometry",
    conceptId: "concept-trig-identities",
    description:
      "Explore the unit circle x² + y² = 1. Drag the angle slider to see the radius vector, cosine projection (horizontal leg), sine projection (vertical leg), tangent intercept, and the corresponding real-time wave curves.",
    instructionPrompt: "Adjust the angle θ from 0° to 360° to observe coordinate signs across the 4 quadrants.",
    parameters: [
      {
        id: "angleDeg",
        name: "Angle (θ)",
        symbol: "θ",
        min: 0,
        max: 360,
        step: 5,
        defaultValue: 45,
        unit: "°",
        description: "Angle made by rotating radius vector counter-clockwise from positive x-axis.",
      },
    ],
    keyPrinciples: [
      "Coordinates of terminal point on unit circle are strictly (cos θ, sin θ).",
      "All, Silver, Tea, Cups rule: Q1 (all +), Q2 (sin +), Q3 (tan +), Q4 (cos +).",
      "Pythagorean identity cos²θ + sin²θ = 1 holds at all points.",
    ],
    knowledgeCheck: {
      question: "At an angle of θ = 180°, what are the values of (cos θ, sin θ)?",
      options: ["(0, 1)", "(-1, 0)", "(1, 0)", "(0, -1)"],
      correctIndex: 1,
      explanation: "At 180° along the negative x-axis, the horizontal coordinate cos(180°) = -1, and vertical height sin(180°) = 0.",
    },
  },

  // 2. Math: Quadratic Function Parabola Explorer
  {
    id: "sim-math-quadratic-parabola",
    title: "Quadratic Function & Parabola Discriminant Explorer",
    domain: "mathematics",
    visualType: "GRAPH_EXPLORER",
    classLevel: 10,
    subjectName: "Mathematics Standard",
    chapterTitle: "Quadratic Equations",
    conceptId: "concept-poly-factorization",
    description:
      "Interact with y = ax² + bx + c. Vary leading coefficient a, linear coefficient b, and constant c. Watch the parabola shift, open upwards or downwards, and observe how the discriminant Δ = b² - 4ac dictates whether the curve intersects the x-axis at 2 real roots, 1 tangent root, or 0 real roots.",
    instructionPrompt: "Change 'a' to see curvature, and vary 'c' to shift the parabola vertically relative to the x-axis.",
    parameters: [
      {
        id: "coeffA",
        name: "Leading Coefficient (a)",
        symbol: "a",
        min: -3,
        max: 3,
        step: 0.5,
        defaultValue: 1,
        unit: "",
        description: "Controls curvature and direction (a > 0 opens up, a < 0 opens down).",
      },
      {
        id: "coeffB",
        name: "Linear Coefficient (b)",
        symbol: "b",
        min: -6,
        max: 6,
        step: 1,
        defaultValue: -2,
        unit: "",
        description: "Controls horizontal axis of symmetry x = -b / (2a).",
      },
      {
        id: "coeffC",
        name: "Constant Term (c)",
        symbol: "c",
        min: -6,
        max: 6,
        step: 1,
        defaultValue: -3,
        unit: "",
        description: "Vertical y-intercept (0, c).",
      },
    ],
    keyPrinciples: [
      "Vertex occurs at x = -b / (2a) and y = c - b²/(4a).",
      "Discriminant Δ = b² - 4ac > 0 gives two distinct real x-intercepts.",
      "Δ = 0 gives a single repeated real root (parabola is tangent to x-axis).",
      "Δ < 0 gives complex conjugate roots (curve never touches the x-axis).",
    ],
    knowledgeCheck: {
      question: "If leading coefficient a > 0 and discriminant Δ < 0, what is true about the quadratic curve?",
      options: [
        "It crosses the x-axis twice",
        "It touches the x-axis at exactly one point",
        "It stays strictly above the x-axis for all real x",
        "It opens downwards into negative y",
      ],
      correctIndex: 2,
      explanation: "When a > 0 (opens upwards) and Δ < 0 (no real roots), the entire parabola is strictly positive and rests completely above the x-axis.",
    },
  },

  // 3. Physics: Ray Optics Geometric Lens Tracer
  {
    id: "sim-physics-ray-optics",
    title: "Convex / Concave Lens Geometric Ray Tracer",
    domain: "physics",
    visualType: "INTERACTIVE_DIAGRAM",
    classLevel: 10,
    subjectName: "Science (Physics)",
    chapterTitle: "Light – Reflection and Refraction",
    conceptId: "concept-lens-formula",
    description:
      "Live 2D ray tracing through thin spherical lenses. Move the object position relative to the principal focus (F) and twice the focal length (2F) to witness real-time image formation, inverted vs erect orientation, and magnification.",
    instructionPrompt: "Vary Object Distance (u) and Focal Length (f) to observe transitions between real inverted and virtual erect images.",
    parameters: [
      {
        id: "objectDistance",
        name: "Object Distance (|u|)",
        symbol: "|u|",
        min: 10,
        max: 80,
        step: 2,
        defaultValue: 35,
        unit: "cm",
        description: "Distance of the object in front of the optical center.",
      },
      {
        id: "focalLength",
        name: "Focal Length (f)",
        symbol: "f",
        min: 10,
        max: 40,
        step: 5,
        defaultValue: 20,
        unit: "cm",
        description: "Focal length of the convex lens (+ for converging).",
      },
      {
        id: "objectHeight",
        name: "Object Height (h)",
        symbol: "h",
        min: 10,
        max: 30,
        step: 2,
        defaultValue: 20,
        unit: "px",
        description: "Height of the luminous upright object arrow.",
      },
    ],
    keyPrinciples: [
      "Thin Lens Formula: 1/f = 1/v - 1/u (with Cartesian sign convention u < 0).",
      "When object is at 2F, image is real, inverted, same size at 2F (magnification m = -1).",
      "When object is between F and optical centre (u < f), image becomes virtual, erect, magnified.",
    ],
    knowledgeCheck: {
      question: "Where must an object be placed in front of a convex lens to produce a virtual, erect, and magnified image?",
      options: ["At infinity", "Between F and 2F", "Between optical center and focus F", "At 2F"],
      correctIndex: 2,
      explanation: "When placed inside the focal distance (between F and optical center O), refracted rays diverge, forming a virtual, erect, and enlarged image behind the object.",
    },
  },

  // 4. Physics: Parabolic Projectile Motion Simulator
  {
    id: "sim-physics-projectile",
    title: "Parabolic Projectile Motion Simulator",
    domain: "physics",
    visualType: "INTERACTIVE_SIMULATION",
    classLevel: 11,
    subjectName: "Physics",
    chapterTitle: "Motion in a Plane (Kinematics)",
    conceptId: "concept-projectile-motion",
    description:
      "Simulate the 2D parabolic trajectory of a projectile launched under uniform gravitational acceleration g = 9.8 m/s² with zero air resistance. Computes maximum apex height (H), total horizontal range (R), and time of flight (T).",
    instructionPrompt: "Adjust initial speed v0 and launch angle θ to verify that 45° yields maximum range.",
    parameters: [
      {
        id: "launchVelocity",
        name: "Launch Velocity (v0)",
        symbol: "v_0",
        min: 10,
        max: 60,
        step: 2,
        defaultValue: 30,
        unit: "m/s",
        description: "Initial speed of projectile emergence.",
      },
      {
        id: "launchAngle",
        name: "Launch Angle (θ)",
        symbol: "θ",
        min: 15,
        max: 85,
        step: 1,
        defaultValue: 45,
        unit: "°",
        description: "Angle with the horizontal ground plane.",
      },
    ],
    keyPrinciples: [
      "Horizontal velocity vx = v0 cos θ remains strictly constant.",
      "Vertical motion is uniformly accelerated: vy(t) = v0 sin θ - gt.",
      "Maximum Height H = (v0² sin²θ) / (2g).",
      "Horizontal Range R = (v0² sin 2θ) / g; maximum at θ = 45°.",
    ],
    knowledgeCheck: {
      question: "Which launch angle yields the absolute maximum horizontal range for a projectile on flat ground?",
      options: ["30°", "45°", "60°", "90°"],
      correctIndex: 1,
      explanation: "Range R = (v0² sin 2θ)/g. The term sin 2θ attains its maximum value of 1 when 2θ = 90°, so θ = 45°.",
    },
  },

  // 5. Physics: Ohm's Law & DC Electrical Circuit Builder
  {
    id: "sim-physics-dc-circuit",
    title: "Ohm's Law & DC Circuit Simulator",
    domain: "physics",
    visualType: "INTERACTIVE_SIMULATION",
    classLevel: 10,
    subjectName: "Science (Physics)",
    chapterTitle: "Electricity",
    conceptId: "concept-series-parallel-resistors",
    description:
      "A complete closed DC circuit with an electromotive DC source, connected resistor, series ammeter, and parallel voltmeter. Watch current flow speed scale in direct proportion to voltage V and inverse proportion to resistance R.",
    instructionPrompt: "Vary the source voltage V and circuit resistance R to verify V = IR and observe Joule thermal dissipation.",
    parameters: [
      {
        id: "circuitVoltage",
        name: "Battery Potential (V)",
        symbol: "V",
        min: 2,
        max: 24,
        step: 1,
        defaultValue: 12,
        unit: "V",
        description: "DC voltage supplied across the circuit.",
      },
      {
        id: "circuitResistance",
        name: "Resistor Value (R)",
        symbol: "R",
        min: 2,
        max: 50,
        step: 1,
        defaultValue: 10,
        unit: "Ω",
        description: "Ohmic resistance opposing electron flow.",
      },
    ],
    keyPrinciples: [
      "Ohm's Law: Current I = V / R in Amperes (A).",
      "Power dissipation: P = VI = I²R = V²/R in Watts (W).",
      "Ammeters are wired in series; voltmeters in parallel across the load.",
    ],
    knowledgeCheck: {
      question: "If the resistance in a circuit is doubled while voltage remains constant, what happens to the electric current?",
      options: ["It doubles", "It quadruples", "It is halved", "It remains unchanged"],
      correctIndex: 2,
      explanation: "By Ohm's Law (I = V/R), current is inversely proportional to resistance. Doubling R halves the current I.",
    },
  },

  // 6. Chemistry: VSEPR Molecular Geometry Explorer
  {
    id: "sim-chem-vsepr",
    title: "VSEPR Molecular Geometry & Hybridization Explorer",
    domain: "chemistry",
    visualType: "INTERACTIVE_DIAGRAM",
    classLevel: 11,
    subjectName: "Chemistry",
    chapterTitle: "Chemical Bonding and Molecular Structure",
    conceptId: "concept-chemical-bonding",
    description:
      "Explore 3D spatial electron-pair geometries predicted by Valence Shell Electron Pair Repulsion (VSEPR) theory. Observe how repulsive interactions between bonding pairs and lone pairs determine bond angles.",
    instructionPrompt: "Select molecular geometry classes to inspect 3D projection, bond angles, and central atom orbital hybridization.",
    parameters: [
      {
        id: "geometryType",
        name: "Geometry Type",
        symbol: "Type",
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 3,
        unit: "Class",
        description: "1: Linear (BeCl2), 2: Trigonal Planar (BF3), 3: Tetrahedral (CH4), 4: Trigonal Bipyramidal (PCl5), 5: Octahedral (SF6).",
      },
    ],
    keyPrinciples: [
      "Electron pairs around a central atom repel one another and assume positions of minimum energy.",
      "Repulsion order: Lone Pair-Lone Pair > Lone Pair-Bond Pair > Bond Pair-Bond Pair.",
      "Steric Number dictates orbital hybridization: 2 => sp, 3 => sp², 4 => sp³, 5 => sp³d, 6 => sp³d².",
    ],
    knowledgeCheck: {
      question: "What is the bond angle and hybridization of methane (CH4) according to VSEPR theory?",
      options: ["180°, sp", "120°, sp²", "109.5°, sp³", "90°, sp³d²"],
      correctIndex: 2,
      explanation: "Methane has 4 bonding pairs and 0 lone pairs (steric number 4), resulting in a regular tetrahedral geometry with 109.5° bond angles and sp³ hybridization.",
    },
  },

  // 7. Biology: Cell Organelle Ultra-Structure Inspector
  {
    id: "sim-bio-cell-architecture",
    title: "Plant vs Animal Cell Organelle Inspector",
    domain: "biology",
    visualType: "INTERACTIVE_DIAGRAM",
    classLevel: 10,
    subjectName: "Science (Biology)",
    chapterTitle: "Life Processes",
    conceptId: "concept-cell-structure",
    description:
      "High-resolution interactive cell cross-section. Click on individual organelles (Nucleus, Mitochondria, Chloroplast, Cell Wall, Vacuole, Ribosomes) to inspect their ultrastructure and biochemical functions.",
    instructionPrompt: "Toggle between Plant and Animal cells to examine distinguishing organelle adaptations.",
    parameters: [
      {
        id: "cellType",
        name: "Cell Model",
        symbol: "Model",
        min: 1,
        max: 2,
        step: 1,
        defaultValue: 1,
        unit: "Type",
        description: "1: Plant Cell (rigid cellulose wall, chloroplasts, central vacuole), 2: Animal Cell (centrioles, lysosomes).",
      },
    ],
    keyPrinciples: [
      "Plant cells possess a rigid cellulose outer cell wall, chloroplasts, and a large central sap vacuole.",
      "Animal cells lack cell walls and chloroplasts, possessing centrioles for spindle apparatus formation during mitosis.",
    ],
    knowledgeCheck: {
      question: "Which organelle is uniquely present in plant cells for solar energy capture and absent in animal cells?",
      options: ["Mitochondria", "Chloroplast", "Golgi apparatus", "Endoplasmic reticulum"],
      correctIndex: 1,
      explanation: "Chloroplasts contain chlorophyll pigments that absorb sunlight for photosynthesis; animal cells do not possess chloroplasts.",
    },
  },

  // 8. Commerce: Market Demand & Supply Equilibrium Explorer
  {
    id: "sim-commerce-equilibrium",
    title: "Market Demand & Supply Equilibrium Explorer",
    domain: "commerce",
    visualType: "GRAPH_EXPLORER",
    classLevel: 11,
    subjectName: "Economics",
    chapterTitle: "Theory of Consumer Behaviour & Market Equilibrium",
    conceptId: "concept-demand-supply",
    description:
      "Interact with downward-sloping market demand Qd = a - bP and upward-sloping market supply Qs = c + dP curves. Vary consumer income shifts (Demand shift) and production technology shocks (Supply shift) to observe real-time equilibrium price P* and quantity Q* clearing.",
    instructionPrompt: "Slide demand and supply intercept shifters to observe shortage, surplus, and market-clearing equilibrium adjustments.",
    parameters: [
      {
        id: "demandShift",
        name: "Demand Curve Shift (A)",
        symbol: "A",
        min: 60,
        max: 140,
        step: 10,
        defaultValue: 100,
        unit: "units",
        description: "Shifts demand rightwards with increased consumer preference or disposable income.",
      },
      {
        id: "supplyShift",
        name: "Supply Curve Shift (C)",
        symbol: "C",
        min: 10,
        max: 50,
        step: 5,
        defaultValue: 20,
        unit: "units",
        description: "Shifts supply rightwards with technological breakthroughs or lower input costs.",
      },
    ],
    keyPrinciples: [
      "Equilibrium price P* occurs where Quantity Demanded Qd equals Quantity Supplied Qs.",
      "If P > P*, quantity supplied exceeds quantity demanded, causing a market surplus that drives prices down.",
      "If P < P*, quantity demanded exceeds quantity supplied, creating a shortage that bids prices up.",
    ],
    knowledgeCheck: {
      question: "What happens to equilibrium price and quantity when consumer demand increases while supply remains fixed?",
      options: [
        "Price falls, quantity rises",
        "Both price and quantity rise",
        "Both price and quantity fall",
        "Price rises, quantity falls",
      ],
      correctIndex: 1,
      explanation: "A rightward shift in demand along an upward-sloping supply curve drives both market-clearing price P* and equilibrium quantity Q* higher.",
    },
  },

  // 9. Computer Science: Sorting Algorithm Step Animator
  {
    id: "sim-cs-sorting",
    title: "Sorting Algorithm Step Animator & Comparison",
    domain: "computerscience",
    visualType: "PROCESS_FLOW",
    classLevel: 11,
    subjectName: "Computer Science",
    chapterTitle: "Data Structures & Algorithms",
    conceptId: "concept-sorting-algorithms",
    description:
      "Interactive step-by-step sorting animator. Watch elements in an array get compared, swapped, and partitioned in real time. Compare Bubble Sort (O(n²)) and Binary Search (O(log n)) computational complexities.",
    instructionPrompt: "Press Step Forward or Play to witness adjacent item comparisons and bar swaps.",
    parameters: [
      {
        id: "arraySize",
        name: "Array Size",
        symbol: "N",
        min: 5,
        max: 12,
        step: 1,
        defaultValue: 7,
        unit: "items",
        description: "Number of unsorted integer elements in the array.",
      },
      {
        id: "stepIndex",
        name: "Animation Step",
        symbol: "k",
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 3,
        unit: "step",
        description: "Active pass through the bubble sort comparison cycle.",
      },
    ],
    keyPrinciples: [
      "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if in wrong order.",
      "Time complexity of Bubble Sort: O(n²) worst and average case, O(n) best case when pre-sorted.",
      "Binary Search requires a sorted array to divide search space in half each iteration (O(log n)).",
    ],
    knowledgeCheck: {
      question: "What is the worst-case time complexity of Bubble Sort on an array of size n?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correctIndex: 3,
      explanation: "Bubble Sort requires n(n-1)/2 comparisons in the worst-case inverted order, scaling quadratically as O(n²).",
    },
  },

  // 10. Humanities / Social Science: Indian National Movement Timeline
  {
    id: "sim-humanities-timeline",
    title: "Indian National Movement Chronological Timeline",
    domain: "humanities",
    visualType: "PROCESS_FLOW",
    classLevel: 10,
    subjectName: "Social Science (History)",
    chapterTitle: "Nationalism in India",
    conceptId: "concept-nationalism-india",
    description:
      "Interactive chronological journey through the decisive milestones of the Indian struggle for independence from 1915 to 1947: Champaran Satyagraha, Rowlatt Act, Non-Cooperation Movement, Civil Disobedience Salt March, and Quit India.",
    instructionPrompt:
      "Slide through chronological eras to explore historical context, mass mobilization milestones, and constitutional outcomes.",
    parameters: [
      {
        id: "yearIndex",
        name: "Timeline Stage",
        symbol: "Era",
        min: 0,
        max: 4,
        step: 1,
        defaultValue: 2,
        unit: "Stage",
        description:
          "0: Champaran (1917), 1: Rowlatt & Jallianwala (1919), 2: Non-Cooperation (1920-22), 3: Salt March (1930), 4: Quit India (1942).",
      },
    ],
    keyPrinciples: [
      "Satyagraha: Moral force rooted in truth and non-violence without physical retaliation.",
      "Mass Mobilization: Transformation from constitutional petitions to nationwide peasant, worker, and student participation.",
      "Civil Disobedience: Deliberate refusal to obey colonial laws (e.g., Salt Law) coupled with refusal to cooperate.",
    ],
    knowledgeCheck: {
      question:
        "Which event directly provoked Mahatma Gandhi to withdraw the Non-Cooperation Movement in February 1922?",
      options: [
        "The violent clash at Chauri Chaura",
        "The enactment of the Government of India Act 1935",
        "The arrival of the Simon Commission",
        "The signing of the Poona Pact",
      ],
      correctIndex: 0,
      explanation:
        "Following the violent clash at Chauri Chaura where a police station was set ablaze, Gandhi abruptly called off the Non-Cooperation Movement upholding the non-negotiable principle of strict non-violence.",
    },
  },
];
