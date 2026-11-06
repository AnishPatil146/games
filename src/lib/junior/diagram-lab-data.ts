/**
 * THE UNWRITTEN — THE ACADEMY 2.0 DIAGRAM & VISUALISATION LAB REGISTRY
 *
 * Interactive mathematical, physical, chemical, and biological simulations.
 * Each interactive simulation defines parameters, ranges, real-time computational models,
 * and scientific annotations.
 */

export type SimulationDomain = "mathematics" | "physics" | "chemistry" | "biology" | "humanities";

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

export interface SimulationAnnotation {
  label: string;
  formulaOrValue: string;
  note: string;
}

export interface DiagramSimulationSpec {
  id: string;
  title: string;
  domain: SimulationDomain;
  classLevel: 10 | 11 | 12;
  subjectName: string;
  chapterTitle: string;
  description: string;
  instructionPrompt: string;
  parameters: InteractiveParameter[];
  keyPrinciples: string[];
}

export const DIAGRAM_SIMULATION_CATALOGUE: DiagramSimulationSpec[] = [
  // 1. Math: Trigonometric Unit Circle
  {
    id: "sim-math-unit-circle",
    title: "Trigonometric Unit Circle & Function Wave Plotter",
    domain: "mathematics",
    classLevel: 10,
    subjectName: "Mathematics",
    chapterTitle: "Introduction to Trigonometry",
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
  },

  // 2. Physics: Ray Optics Geometric Lens Tracer
  {
    id: "sim-physics-ray-optics",
    title: "Convex / Concave Lens Geometric Ray Tracer",
    domain: "physics",
    classLevel: 10,
    subjectName: "Science (Physics)",
    chapterTitle: "Light – Reflection and Refraction",
    description:
      "Live 2D ray tracing through thin spherical lenses. Move the object position relative to the principal focus (F) and twice the focal length (2F) to witness real-time image formation, inverted vs erect orientation, and magnification.",
    instructionPrompt: "Vary Object Distance (u) and Focal Length (f) to observe transitions between real inverted and virtual erect images.",
    parameters: [
      {
        id: "objectDistance",
        name: "Object Distance (|u|)",
        symbol: "|u|",
        min: 5,
        max: 80,
        step: 1,
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
        max: 40,
        step: 2,
        defaultValue: 20,
        unit: "px",
        description: "Height of the luminous upright object arrow.",
      },
    ],
    keyPrinciples: [
      "Thin Lens Formula: 1/f = 1/v - 1/u (with Cartesian sign convention u < 0).",
      "When object is beyond 2F, image is real, inverted, diminished between F and 2F.",
      "When object is at 2F, image is real, inverted, same size at 2F (magnification m = -1).",
      "When object is between F and optical centre (u < f), image becomes virtual, erect, magnified behind object.",
    ],
  },

  // 3. Physics: Projectile Kinematics Trajectory
  {
    id: "sim-physics-projectile",
    title: "Parabolic Projectile Motion Simulator",
    domain: "physics",
    classLevel: 11,
    subjectName: "Physics",
    chapterTitle: "Motion in a Plane (Kinematics)",
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
      "Complementary angles (θ and 90° - θ) produce identical horizontal ranges.",
    ],
  },

  // 4. Physics: Ohm's Law & DC Electrical Circuit
  {
    id: "sim-physics-dc-circuit",
    title: "Ohm's Law & DC Electrical Circuit Simulator",
    domain: "physics",
    classLevel: 10,
    subjectName: "Science (Electricity)",
    chapterTitle: "Electricity",
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
      "Power dissipation: P = VI = I²R = V²/R in Watts (W = J/s).",
      "Ammeters are wired in series (low internal resistance); voltmeters in parallel (high internal resistance).",
    ],
  },

  // 5. Chemistry: Molecular Geometry (VSEPR Theory)
  {
    id: "sim-chem-vsepr",
    title: "VSEPR Molecular Geometry & Hybridization Explorer",
    domain: "chemistry",
    classLevel: 11,
    subjectName: "Chemistry",
    chapterTitle: "Chemical Bonding and Molecular Structure",
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
  },

  // 6. Biology: Animal Cell vs Plant Cell Architecture
  {
    id: "sim-bio-cell-architecture",
    title: "Animal Cell vs Plant Cell Organelle Inspector",
    domain: "biology",
    classLevel: 10,
    subjectName: "Science (Biology)",
    chapterTitle: "Life Processes & The Fundamental Unit of Life",
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
      "Cell Theory (Schleiden, Schwann, Virchow): All living organisms are composed of cells; cells arise from pre-existing cells (Omnis cellula-e-cellula).",
      "Plant cells possess a rigid cellulose outer cell wall, plastids/chloroplasts for photosynthesis, and a large central sap vacuole.",
      "Animal cells lack cell walls and chloroplasts, possessing centrioles for spindle apparatus formation during mitosis.",
    ],
  },

  // 7. Social Science: Indian National Movement Timeline
  {
    id: "sim-humanities-timeline",
    title: "Indian National Movement Chronological Timeline",
    domain: "humanities",
    classLevel: 10,
    subjectName: "Social Science (History)",
    chapterTitle: "Nationalism in India",
    description:
      "Interactive chronological journey through the decisive milestones of the Indian struggle for independence from 1915 to 1947.",
    instructionPrompt: "Slide through the chronological eras to explore historical context, key leaders, and constitutional outcomes.",
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
        description: "0: Champaran (1917), 1: Rowlatt & Jallianwala (1919), 2: Non-Cooperation (1920-22), 3: Salt March (1930), 4: Quit India (1942).",
      },
    ],
    keyPrinciples: [
      "Satyagraha: Moral force rooted in truth and non-violence without rancour or physical retaliation.",
      "Mass Mobilization: Evolution from elite constitutional petitions to nationwide peasant, worker, and student participation.",
    ],
  },
];

