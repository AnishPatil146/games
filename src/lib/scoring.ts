import {
  Archetype,
  ConfidenceLevel,
  GameplayEvent,
  GameplayReport,
  PlayerPreference,
} from "./types";

interface ArchetypeDefinition {
  title: Archetype;
  subtitle: string;
  interpretation: string;
  strengths: string[];
  closingMessage: string;
}

const ARCHETYPE_DEFINITIONS: Record<Archetype, ArchetypeDefinition> = {
  "The Observer": {
    title: "The Observer",
    subtitle: "Patience, scrutiny, and quiet perception.",
    interpretation:
      "You rarely rush into conclusions. Across the chapters, your instinct was to pause, inspect the periphery, and gather contextual detail before committing to action. You notice what others miss.",
    strengths: [
      "Exceptional perceptual patience",
      "High attention to environmental nuance",
      "Resistance to cognitive urgency",
    ],
    closingMessage:
      "The world belongs to those who watch closely while everyone else looks away.",
  },
  "The Strategist": {
    title: "The Strategist",
    subtitle: "Calculated logic, foresight, and systematic deduction.",
    interpretation:
      "Your choices throughout the narrative were guided by structure, consequence evaluation, and deliberate deduction. You treat uncertainties as systems waiting to be organized.",
    strengths: [
      "Rigorous deductive clarity",
      "Pragmatic risk appraisal",
      "Decisive execution under pressure",
    ],
    closingMessage:
      "Every chaotic moment is merely a puzzle that has not yet found its order.",
  },
  "The Creative Soul": {
    title: "The Creative Soul",
    subtitle: "Atmosphere, resonance, and aesthetic expression.",
    interpretation:
      "You were drawn to resonance, composition, and emotional nuance. Your arrangements and choices favored evocative beauty and meaning over rigid functionalism.",
    strengths: [
      "Vivid aesthetic sensibility",
      "Appreciation for poetic ambiguity",
      "Intuitive composition and atmosphere",
    ],
    closingMessage:
      "You do not just live in a space; you transform it into meaning.",
  },
  "The Explorer": {
    title: "The Explorer",
    subtitle: "Curiosity for horizons, the unmapped, and the forgotten.",
    interpretation:
      "When faced with boundaries, you probed beyond the obvious threshold. You sought unknown corridors, examined hidden relics, and prioritized discovery over certainty.",
    strengths: [
      "High tolerance for ambiguity",
      "Inexhaustible appetite for discovery",
      "Natural inclination toward the unfamiliar",
    ],
    closingMessage:
      "The perimeter of the familiar was never meant to be your boundary.",
  },
  "The Empath": {
    title: "The Empath",
    subtitle: "Interpersonal responsibility, social conscience, and connection.",
    interpretation:
      "Your earliest decisions centered on interpersonal accountability and the invisible bonds between strangers. You instinctively weighed the human impact behind every situation.",
    strengths: [
      "Deep relational conscience",
      "Immediate ethical reflex",
      "Attunement to the emotional weight of choices",
    ],
    closingMessage:
      "In a world of transactions, empathy remains the rarest form of rebellion.",
  },
  "The Curious Mind": {
    title: "The Curious Mind",
    subtitle: "Inquiry, relentless questioning, and thirst for truth.",
    interpretation:
      "You refused to let enigmatic signals pass without interrogation. When an anonymous message appeared, your mind leaped into inquiry: why, how, and by whose hand?",
    strengths: [
      "Active epistemic curiosity",
      "Unwillingness to settle for surface answers",
      "Appetite for investigating anomalies",
    ],
    closingMessage:
      "The question you ask will always reveal more than the answer you receive.",
  },
  "The Independent Thinker": {
    title: "The Independent Thinker",
    subtitle: "Autonomy, self-reliance, and refusal of conventional molds.",
    interpretation:
      "You demonstrated a distinct resistance to prescribed paths. When pressured by time or societal expectations, you trusted your own compass and chose self-determination.",
    strengths: [
      "Steadfast internal locus of control",
      "Critical autonomy under social expectations",
      "Confidence in non-conformist solutions",
    ],
    closingMessage:
      "To walk your own path requires neither permission nor an audience.",
  },
};

export function evaluateReport(
  sessionId: string,
  playerName: string,
  events: GameplayEvent[],
  preferences: PlayerPreference[],
  completedAt: string = new Date().toISOString()
): GameplayReport {
  const scores: Record<Archetype, number> = {
    "The Observer": 0,
    "The Strategist": 0,
    "The Creative Soul": 0,
    "The Explorer": 0,
    "The Empath": 0,
    "The Curious Mind": 0,
    "The Independent Thinker": 0,
  };

  const supportingEvidence: string[] = [];
  const gameplayPatterns: string[] = [];
  let totalPuzzles = 0;
  let solvedCorrectly = 0;
  let hintsUsed = 0;
  let totalPuzzleTime = 0;
  let puzzleCountWithTime = 0;

  // 1. Chapter 1: The Last Train
  const ch1Choice = events.find(
    (e) => e.chapter === 1 && e.event_type === "choice_selected"
  );
  if (ch1Choice) {
    const action = ch1Choice.event_data?.choiceId as string;
    const duration = (ch1Choice.event_data?.durationMs as number) || 0;

    if (action === "return_wallet") {
      scores["The Empath"] += 4;
      scores["The Observer"] += 1;
      supportingEvidence.push(
        "Chapter 1: Prioritized returning the stranger's dropped wallet over your own schedule."
      );
    } else if (action === "call_out") {
      scores["The Empath"] += 2;
      scores["The Curious Mind"] += 2;
      supportingEvidence.push(
        "Chapter 1: Called out immediately to alert the stranger."
      );
    } else if (action === "investigate_first") {
      scores["The Observer"] += 4;
      scores["The Strategist"] += 2;
      supportingEvidence.push(
        "Chapter 1: Paused to scrutinize the wallet and context before acting."
      );
    } else if (action === "catch_train") {
      scores["The Independent Thinker"] += 4;
      scores["The Strategist"] += 2;
      supportingEvidence.push(
        "Chapter 1: Maintained personal journey discipline and caught the final train."
      );
    }

    if (duration > 12000) {
      scores["The Observer"] += 1;
      scores["The Strategist"] += 1;
      gameplayPatterns.push("Deliberative decision pacing in high-urgency moments.");
    } else if (duration < 5000 && duration > 0) {
      scores["The Independent Thinker"] += 1;
      scores["The Empath"] += 1;
      gameplayPatterns.push("Instant intuitive reactions without second-guessing.");
    }
  }

  // 2. Chapter 2: The Locked Room
  const ch2Clues = events.filter(
    (e) => e.chapter === 2 && e.event_type === "clue_inspected"
  );
  const ch2Hints = events.filter(
    (e) => e.chapter === 2 && e.event_type === "hint_used"
  );
  const ch2Puzzles = events.filter(
    (e) => e.chapter === 2 && e.event_type === "puzzle_attempted"
  );

  hintsUsed += ch2Hints.length;
  if (ch2Puzzles.length > 0) {
    totalPuzzles += 1;
    const correctAttempt = ch2Puzzles.find((p) => p.event_data?.isCorrect === true);
    if (correctAttempt) {
      solvedCorrectly += 1;
      const timeMs = (correctAttempt.event_data?.timeToSolveMs as number) || 0;
      if (timeMs > 0) {
        totalPuzzleTime += timeMs / 1000;
        puzzleCountWithTime += 1;
      }
    }
  }

  if (ch2Clues.length >= 3) {
    scores["The Observer"] += 3;
    scores["The Explorer"] += 2;
    supportingEvidence.push(
      `Chapter 2: Thoroughly investigated ${ch2Clues.length} distinct clues before unlocking the room.`
    );
  }
  if (ch2Hints.length === 0 && ch2Puzzles.some((p) => p.event_data?.isCorrect)) {
    scores["The Strategist"] += 3;
    supportingEvidence.push(
      "Chapter 2: Decoded the library cipher independently without using hints."
    );
  }

  // 3. Chapter 3: The Unknown Message
  const ch3Choice = events.find(
    (e) => e.chapter === 3 && e.event_type === "choice_selected"
  );
  if (ch3Choice) {
    const action = ch3Choice.event_data?.choiceId as string;
    if (action === "investigate_sender") {
      scores["The Curious Mind"] += 4;
      scores["The Strategist"] += 2;
      supportingEvidence.push(
        "Chapter 3: Traced the origin and metadata of the anonymous message."
      );
    } else if (action === "look_for_evidence") {
      scores["The Observer"] += 4;
      scores["The Strategist"] += 2;
      supportingEvidence.push(
        "Chapter 3: Searched your immediate physical surroundings for confirming evidence."
      );
    } else if (action === "reply_immediately") {
      scores["The Empath"] += 3;
      scores["The Curious Mind"] += 2;
      supportingEvidence.push(
        "Chapter 3: Directly confronted the sender with immediate response."
      );
    } else if (action === "ignore_message") {
      scores["The Independent Thinker"] += 4;
      supportingEvidence.push(
        "Chapter 3: Exercised sovereign restraint by withholding engagement."
      );
    }
  }

  // 4. Chapter 4: The Empty Canvas
  const ch4Objects = preferences.filter(
    (p) => p.preference_category === "canvas_object"
  );
  const ch4Mood = preferences.find(
    (p) => p.preference_category === "canvas_mood"
  );

  if (ch4Objects.length > 0) {
    scores["The Creative Soul"] += 4;
    supportingEvidence.push(
      `Chapter 4: Curated a thoughtful scene featuring ${ch4Objects.map((o) => o.selected_value).join(", ")}.`
    );
  }

  // 5. Chapter 5: The Final Ten Seconds
  const ch5Puzzles = events.filter(
    (e) => e.chapter === 5 && e.event_type === "puzzle_attempted"
  );
  const ch5Hints = events.filter(
    (e) => e.chapter === 5 && e.event_type === "hint_used"
  );
  hintsUsed += ch5Hints.length;

  if (ch5Puzzles.length > 0) {
    totalPuzzles += 1;
    const correctCh5 = ch5Puzzles.find((p) => p.event_data?.isCorrect === true);
    if (correctCh5) {
      solvedCorrectly += 1;
      const timeMs = (correctCh5.event_data?.durationMs as number) || 0;
      if (timeMs > 0) {
        totalPuzzleTime += timeMs / 1000;
        puzzleCountWithTime += 1;
      }
      if (timeMs < 7000 && timeMs > 0) {
        scores["The Strategist"] += 4;
        gameplayPatterns.push("Remarkable deductive speed under countdown pressure.");
      } else {
        scores["The Strategist"] += 2;
        scores["The Observer"] += 2;
      }
      supportingEvidence.push(
        "Chapter 5: Successfully solved the high-stakes timed deduction sequence."
      );
    } else {
      scores["The Independent Thinker"] += 2;
      gameplayPatterns.push("Willingness to act decisively even with incomplete verification.");
    }
  }

  // 6. Chapter 6: The Unknown World
  const ch6World = preferences.find(
    (p) => p.preference_category === "world_environment"
  );
  const ch6Object = preferences.find(
    (p) => p.preference_category === "world_object"
  );
  const ch6Activity = preferences.find(
    (p) => p.preference_category === "world_activity"
  );

  const exploredEnvironments: string[] = [];

  if (ch6World) {
    exploredEnvironments.push(ch6World.selected_value);
    if (ch6World.selected_value.includes("Observatory")) {
      scores["The Observer"] += 3;
      scores["The Curious Mind"] += 2;
    } else if (ch6World.selected_value.includes("Archives")) {
      scores["The Curious Mind"] += 3;
      scores["The Strategist"] += 2;
    } else if (ch6World.selected_value.includes("Coastal")) {
      scores["The Explorer"] += 4;
      scores["The Creative Soul"] += 2;
    } else if (ch6World.selected_value.includes("Greenhouse")) {
      scores["The Creative Soul"] += 4;
      scores["The Empath"] += 2;
    }
  }

  if (ch6Object) {
    if (ch6Object.selected_value.includes("Letter")) {
      scores["The Empath"] += 2;
      scores["The Curious Mind"] += 1;
    } else if (ch6Object.selected_value.includes("Prism")) {
      scores["The Creative Soul"] += 3;
      scores["The Observer"] += 2;
    } else if (ch6Object.selected_value.includes("Astrolabe")) {
      scores["The Explorer"] += 3;
      scores["The Strategist"] += 2;
    } else if (ch6Object.selected_value.includes("Key")) {
      scores["The Independent Thinker"] += 3;
      scores["The Curious Mind"] += 2;
    }
  }

  if (ch6Activity) {
    if (ch6Activity.selected_value.includes("Document")) {
      scores["The Observer"] += 3;
    } else if (ch6Activity.selected_value.includes("Chart")) {
      scores["The Strategist"] += 3;
    } else if (ch6Activity.selected_value.includes("Venture")) {
      scores["The Explorer"] += 4;
    } else if (ch6Activity.selected_value.includes("Listen")) {
      scores["The Creative Soul"] += 3;
      scores["The Empath"] += 2;
    }
  }

  // Determine top archetype
  const sortedArchetypes = (Object.keys(scores) as Archetype[]).sort(
    (a, b) => scores[b] - scores[a]
  );

  const primaryArchetype = sortedArchetypes[0] || "The Observer";
  const runnerUpArchetype = sortedArchetypes[1] || "The Curious Mind";
  const primaryScore = scores[primaryArchetype];
  const runnerUpScore = scores[runnerUpArchetype];
  const scoreGap = primaryScore - runnerUpScore;

  let confidence: ConfidenceLevel = "Moderate";
  if (scoreGap >= 4 && primaryScore >= 8) {
    confidence = "Strong";
  } else if (scoreGap <= 1) {
    confidence = "Low";
  }

  const definition = ARCHETYPE_DEFINITIONS[primaryArchetype];

  // Default fallbacks if supporting evidence is brief
  if (supportingEvidence.length === 0) {
    supportingEvidence.push(
      "Engaged the experience with deliberate pacing and attentiveness.",
      "Demonstrated balanced instincts across multiple decision points."
    );
  }

  if (gameplayPatterns.length === 0) {
    gameplayPatterns.push(
      "Consistent thematic coherence between observation and action.",
      "Clear preference for internal verification over superficial speed."
    );
  }

  const avgTime =
    puzzleCountWithTime > 0
      ? Math.round(totalPuzzleTime / puzzleCountWithTime)
      : 8;
  const accuracyRate =
    totalPuzzles > 0
      ? `${Math.round((solvedCorrectly / totalPuzzles) * 100)}%`
      : "100%";

  return {
    sessionId,
    playerName: playerName || "Anonymous Traveler",
    archetype: primaryArchetype,
    subtitle: definition.subtitle,
    interpretation: definition.interpretation,
    confidence,
    observedStrengths: definition.strengths,
    gameplayPatterns,
    puzzlePerformance: {
      totalPuzzles: Math.max(totalPuzzles, 2),
      solvedCorrectly: Math.max(solvedCorrectly, 1),
      hintsUsed,
      avgResponseTimeSeconds: avgTime,
      accuracyRate,
    },
    supportingEvidence,
    exploredEnvironments:
      exploredEnvironments.length > 0
        ? exploredEnvironments
        : ["The Whispering Archives"],
    creativeComposition: ch4Mood
      ? {
          selectedObjects: ch4Objects.map((o) => o.selected_value),
          mood: ch4Mood.selected_value,
        }
      : undefined,
    closingMessage: definition.closingMessage,
    completedAt,
  };
}

