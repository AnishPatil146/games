/**
 * THE UNWRITTEN — THE ACADEMY 2.0 CONCEPT LIBRARY REGISTRY
 *
 * Structured conceptual explanations across Class 10, 11, and 12.
 * Features dual-tier explanation levels:
 * - Simple Explanation: Intuitive analogies and accessible conceptual models.
 * - Exam-Level Explanation: Strict syllabus-level mathematical and scientific terminology.
 */

export interface ConceptRecord {
  id: string;
  classLevel: 10 | 11 | 12;
  subjectSlug: string;
  subjectName: string;
  chapterTitle: string;
  topicTitle: string;
  conceptTitle: string;
  tagline: string;
  simpleExplanation: string;
  examLevelExplanation: string;
  prerequisites: string[];
  keyDefinitions: { term: string; definition: string }[];
  importantPrinciples: string[];
  realWorldApplications: string[];
  misconceptions: { trap: string; truth: string }[];
  practiceQuestion: {
    questionText: string;
    options: { key: string; text: string }[];
    correctKey: string;
    explanation: string;
  };
}

export const CONCEPT_REGISTRY: ConceptRecord[] = [
  // 1. Class 10 Light Refraction & Snell's Law
  {
    id: "c-c10-light-refraction",
    classLevel: 10,
    subjectSlug: "c10-science",
    subjectName: "Science",
    chapterTitle: "Light – Reflection and Refraction",
    topicTitle: "Refraction & Snell's Law",
    conceptTitle: "Wave Speed Disparity and Refractive Bending",
    tagline: "Why light bends when traversing boundaries between optical media.",
    simpleExplanation:
      "Imagine a shopping cart rolling across smooth pavement that suddenly hits deep grass at an angle. The wheel that hits the grass first slows down, while the other wheel on smooth pavement keeps going fast. Because one side slows down before the other, the whole cart swerves towards the grass. In the exact same way, light is a wave with width. When it hits an optically denser medium (like water or glass), the side that enters first slows down, pivoting the entire light ray toward the normal line.",
    examLevelExplanation:
      "Refraction is the change in the direction of propagation of a wave passing from one optical medium to another caused by its change in phase velocity. The ratio of the sine of the angle of incidence (i) to the sine of the angle of refraction (r) is a constant for light of a given color and for a given pair of media: sin(i) / sin(r) = n21 = v1 / v2. When entering an optically denser medium (v2 < v1, n2 > n1), the ray bends toward the surface normal (r < i). When entering an optically rarer medium (v2 > v1), it bends away from the normal (r > i). Frequency remains invariant during refraction (f = constant), while wavelength changes according to λ = v / f.",
    prerequisites: ["Rectilinear propagation of light", "Wave speed formula v = fλ", "Geometric surface normals"],
    keyDefinitions: [
      {
        term: "Optical Density",
        definition: "The capability of a transparent substance to retard the transmission velocity of electromagnetic light waves.",
      },
      {
        term: "Refractive Index (n)",
        definition: "The dimensionless ratio of the speed of light in vacuum (c) to its phase velocity in the given medium (v): n = c / v.",
      },
    ],
    importantPrinciples: [
      "Fermat's Principle of Least Time: Light travels along the optical path requiring minimum transit time.",
      "Frequency Conservation: Optical frequency ν is governed strictly by the light source and remains unchanged during refraction.",
    ],
    realWorldApplications: [
      "Design of corrective spectacles for myopia (concave) and hypermetropia (convex).",
      "Total internal reflection in high-speed fiber-optic telecommunication cables.",
      "Atmospheric early sunrise and delayed sunset due to continuous gradient refraction.",
    ],
    misconceptions: [
      {
        trap: "Mass density is identical to optical density.",
        truth: "Optical density relates to polarizability and light speed, not mass per volume. For instance, kerosene has lower mass density than water (it floats), yet it has a higher refractive index (n ≈ 1.44 vs 1.33) and is optically denser.",
      },
      {
        trap: "Light always bends when crossing a boundary.",
        truth: "Light traveling perpendicular to the boundary (along the surface normal with angle of incidence i = 0°) experiences zero deviation (r = 0°), even though its velocity and wavelength still change.",
      },
    ],
    practiceQuestion: {
      questionText: "When a ray of green light travels from air into a block of crown glass (n = 1.52), which property of the light remains strictly unchanged?",
      options: [
        { key: "A", text: "Wavelength" },
        { key: "B", text: "Wave Speed" },
        { key: "C", text: "Frequency" },
        { key: "D", text: "Amplitude" },
      ],
      correctKey: "C",
      explanation: "Frequency is determined exclusively by the light-emitting source atomic oscillations and is conserved across all boundary media transitions.",
    },
  },

  // 2. Class 10 Quadratic Equations & Discriminant
  {
    id: "c-c10-math-discriminant",
    classLevel: 10,
    subjectSlug: "c10-math-standard",
    subjectName: "Mathematics",
    chapterTitle: "Quadratic Equations",
    topicTitle: "Nature of Roots",
    conceptTitle: "The Discriminant as an Algebraic Geometrical Discriminator",
    tagline: "Determining whether a quadratic equation touches, crosses, or misses the horizontal axis.",
    simpleExplanation:
      "A quadratic equation ax² + bx + c = 0 represents a U-shaped curve called a parabola on a graph. The roots of the equation are simply the points where this parabola crosses the flat ground (the x-axis). The discriminant D = b² - 4ac acts like a radar: If D is positive, the radar detects that the parabola dips below the ground and crosses in two separate places (two real roots). If D is zero, the parabola barely kisses the ground at its very tip (one repeated root). If D is negative, the parabola floats entirely in the air and never touches the ground (no real roots).",
    examLevelExplanation:
      "For a quadratic polynomial P(x) = ax² + bx + c with real coefficients (a ≠ 0), the quantity D = b² - 4ac is called the discriminant. By completing the square, the roots are given by x = (-b ± √D) / (2a). Because the radical operates over the real field ℝ, the sign of D completely governs the nature of the roots: (1) D > 0 yields two distinct real roots; (2) D = 0 yields two real and equal (coincident) roots x = -b/(2a); (3) D < 0 yields two complex conjugate roots with no real solutions. If a, b, c ∈ ℚ and D is a perfect square, the roots are rational; if D is non-square positive, roots are irrational and occur in conjugate surd pairs.",
    prerequisites: ["Polynomial degree classification", "Factoring by splitting the middle term", "Radicals and real numbers"],
    keyDefinitions: [
      {
        term: "Discriminant (D)",
        definition: "The algebraic expression b² - 4ac evaluated from standard form coefficients which characterizes root multiplicity and realness.",
      },
      {
        term: "Coincident Roots",
        definition: "A double root occurring when the parabolic vertex is tangent to the line y = 0, achieved when D = 0.",
      },
    ],
    importantPrinciples: [
      "Geometric Axis Tangency: The parabola y = ax² + bx + c touches the x-axis at exactly one point if and only if b² - 4ac = 0.",
      "Rational Root Condition: For integer coefficients, rational roots require D to be a square of an integer.",
    ],
    realWorldApplications: [
      "Civil engineering: calculating bridge parabolic arch suspension clear-spans.",
      "Ballistics: determining whether a projectile launched at velocity v0 can clear a barrier of height H.",
      "Business finance: finding break-even volume points where profit quadratic intersects zero.",
    ],
    misconceptions: [
      {
        trap: "Equal roots means the equation has only one solution, so it's a linear equation.",
        truth: "A quadratic equation always has degree 2 and two roots; when D = 0, both roots happen to share the identical numerical value (multiplicity of 2).",
      },
    ],
    practiceQuestion: {
      questionText: "For what value of k does the quadratic equation 9x² + 6kx + 4 = 0 possess equal real roots?",
      options: [
        { key: "A", text: "k = ±1" },
        { key: "B", text: "k = ±2" },
        { key: "C", text: "k = 0" },
        { key: "D", text: "k = ±4" },
      ],
      correctKey: "B",
      explanation: "Equal roots require D = 0. Here D = (6k)² - 4(9)(4) = 36k² - 144 = 0 => 36k² = 144 => k² = 4 => k = ±2.",
    },
  },

  // 3. Class 12 Physics: Gauss's Law & Electric Flux
  {
    id: "c-c12-phy-gauss-flux",
    classLevel: 12,
    subjectSlug: "c12-physics",
    subjectName: "Physics",
    chapterTitle: "Electric Charges and Fields",
    topicTitle: "Gauss's Theorem",
    conceptTitle: "Closed Surface Invariance and Net Electric Flux",
    tagline: "Counting electric field lines through closed 3D boundaries.",
    simpleExplanation:
      "Think of positive electric charges as tiny light bulbs shining invisible rays in every direction. If you place a light bulb inside an enclosed cardboard box, every single ray of light must puncture the walls of the box to get out. It doesn't matter if the box is a cube, a giant sphere, or a crumpled paper bag—the total amount of light piercing the walls depends solely on how bright the bulb is inside! If the bulb is outside the box, any light ray that enters through one side must exit through the other, resulting in zero net light trapped inside. Gauss's Law states this exact truth for electric charge.",
    examLevelExplanation:
      "Electric flux Φ_E through an oriented surface is defined as the surface integral of the electric field vector: Φ_E = ∬ E · dA = ∬ |E| |dA| cosθ. Gauss's Law asserts that the total outward electric flux through any arbitrary closed Gaussian surface is directly proportional to the net enclosed algebraic charge: ∮ E · dA = Q_enclosed / ε0. External charges contribute to local E-field values across the boundary, but their total integrated flux over the entire closed surface sums identically to zero because every entering field line is balanced by an exiting field line. Gauss's law is fundamentally equivalent to Coulomb's inverse-square law, representing one of Maxwell's four master equations of electromagnetism.",
    prerequisites: ["Coulomb's Law", "Vector dot product", "Surface area normal vector conventions"],
    keyDefinitions: [
      {
        term: "Electric Flux (Φ_E)",
        definition: "A scalar measure of the total number of electric field lines penetrating normally through a given area element.",
      },
      {
        term: "Gaussian Surface",
        definition: "An arbitrary, closed three-dimensional mathematical boundary constructed to exploit geometric charge symmetries.",
      },
    ],
    importantPrinciples: [
      "Electrostatic Shielding: The electric field inside any hollow cavity within a conductor is zero, regardless of outside charges (Faraday Cage).",
      "Permittivity Invariance: Net flux through a closed surface depends only on enclosed charge and permittivity, invariant to surface geometry.",
    ],
    realWorldApplications: [
      "Faraday Cages protecting sensitive electronic servers, aircraft avionics during lightning strikes.",
      "Coaxial cable outer braided shields preventing RF signal interference.",
      "Van de Graaff high-voltage electrostatic generators.",
    ],
    misconceptions: [
      {
        trap: "If the net flux through a closed surface is zero, the electric field must be zero everywhere on that surface.",
        truth: "Net flux can be zero when equal positive and negative field lines cross the surface, or when equal positive and negative charges reside inside (Q_enclosed = 0), even if E is intensely strong locally (e.g. surface enclosing an electric dipole).",
      },
    ],
    practiceQuestion: {
      questionText: "An electric dipole consisting of charges +q and -q separated by distance 2a is completely enclosed inside a sphere of radius R (R > a). What is the total electric flux emerging through the sphere?",
      options: [
        { key: "A", text: "q / ε0" },
        { key: "B", text: "2q / ε0" },
        { key: "C", text: "Zero" },
        { key: "D", text: "q / (4πε0 R²)" },
      ],
      correctKey: "C",
      explanation: "By Gauss's Law, Φ = Q_enclosed / ε0. The net charge of a dipole is Q_net = (+q) + (-q) = 0, so the total emerging flux is identically zero.",
    },
  },

  // 4. Class 12 Mathematics: Bayes' Theorem & Conditional Likelihood
  {
    id: "c-c12-mat-bayes-logic",
    classLevel: 12,
    subjectSlug: "c12-mathematics",
    subjectName: "Mathematics",
    chapterTitle: "Probability",
    topicTitle: "Bayes' Theorem",
    conceptTitle: "Inverse Probability and Evidence Updating",
    tagline: "Updating prior beliefs when presented with new diagnostic evidence.",
    simpleExplanation:
      "Suppose you wake up with a sore throat. You wonder: do I have a rare illness that affects 1 in 10,000 people? A test exists that is 99% accurate, and you test positive! Does this mean you have a 99% chance of being sick? Surprisingly, NO! Because the illness is so extremely rare (1 in 10,000), among 10,000 healthy people, the 1% error rate will produce around 100 false alarms! So your 1 true positive is competing against 100 false alarms. Bayes' Theorem is the mathematical rule that forces us to combine the original rarity (prior probability) with the test accuracy (likelihood) to find the true revised chance (posterior probability).",
    examLevelExplanation:
      "Bayes' Theorem formalizes inverse probability: determining the probability of a specific causal hypothesis E_i given that an observed symptom or event A has materialized. If events {E1, E2, ..., En} partition the sample space S into mutually exclusive and exhaustive causes, then: P(E_i | A) = [P(E_i) · P(A | E_i)] / [Σ P(E_j) · P(A | E_j)]. Here P(E_i) is the prior probability, P(A | E_i) is the conditional likelihood, and the denominator represents the marginal probability of evidence A obtained via the law of total probability.",
    prerequisites: ["Sample space and partitions", "Conditional probability formula P(A|B) = P(A ∩ B) / P(B)", "Multiplication rule of probability"],
    keyDefinitions: [
      {
        term: "Prior Probability P(E_i)",
        definition: "The initial unconditional probability assigned to an event before taking into account new observational evidence.",
      },
      {
        term: "Posterior Probability P(E_i | A)",
        definition: "The refined conditional probability assigned to hypothesis E_i after observing evidence A.",
      },
    ],
    importantPrinciples: [
      "Partition Completeness: Events must satisfy Σ P(E_j) = 1 with zero overlap between distinct hypotheses.",
      "Base Rate Fallacy: Ignoring prior background frequencies leads to severe misestimation of posterior odds.",
    ],
    realWorldApplications: [
      "Spam email classification algorithms evaluating keyword occurrence likelihoods (Naive Bayes).",
      "Medical diagnostics: determining true disease probability following screening tests.",
      "Forensic DNA evidence evaluation in legal court proceedings.",
    ],
    misconceptions: [
      {
        trap: "P(A | B) is always equal to P(B | A).",
        truth: "The probability of coughing given that you have pneumonia P(Cough | Pneumonia) is very high (~90%), but the probability of having pneumonia given that you are coughing P(Pneumonia | Cough) is very low (~1%). Conflating the two is the classical Prosecutor's Fallacy.",
      },
    ],
    practiceQuestion: {
      questionText: "If P(A) = 0.4, P(B) = 0.5, and P(B | A) = 0.6, calculate P(A | B).",
      options: [
        { key: "A", text: "0.24" },
        { key: "B", text: "0.48" },
        { key: "C", text: "0.50" },
        { key: "D", text: "0.60" },
      ],
      correctKey: "B",
      explanation: "From joint probability, P(A ∩ B) = P(A) · P(B | A) = 0.4 × 0.6 = 0.24. Then P(A | B) = P(A ∩ B) / P(B) = 0.24 / 0.5 = 0.48.",
    },
  },
];

/**
 * Query concepts by class, subject, and chapter.
 */
export function queryConceptRegistry(params: {
  classLevel?: 10 | 11 | 12;
  subjectSlug?: string;
  chapterTitle?: string;
  searchTerm?: string;
}): ConceptRecord[] {
  return CONCEPT_REGISTRY.filter((c) => {
    if (params.classLevel && c.classLevel !== params.classLevel) return false;
    if (params.subjectSlug && c.subjectSlug !== params.subjectSlug) return false;
    if (
      params.chapterTitle &&
      c.chapterTitle.toLowerCase() !== params.chapterTitle.toLowerCase()
    ) {
      return false;
    }
    if (params.searchTerm) {
      const q = params.searchTerm.toLowerCase();
      const inId = c.id.toLowerCase().includes(q);
      const inTitle = c.conceptTitle.toLowerCase().includes(q);
      const inTag = c.tagline.toLowerCase().includes(q);
      const inTopic = c.topicTitle.toLowerCase().includes(q);
      const inChapter = c.chapterTitle.toLowerCase().includes(q);
      const inDefs = c.keyDefinitions.some((d) => d.term.toLowerCase().includes(q));
      if (!inId && !inTitle && !inTag && !inTopic && !inChapter && !inDefs) return false;
    }
    return true;
  });
}
