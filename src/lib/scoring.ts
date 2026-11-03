import {
  Archetype,
  CharacterPresentation,
  ConfidenceLevel,
  GameplayEvent,
  GameplayReport,
  PlayerPreference,
} from "./types";

interface ArchetypeDefinition {
  title: Archetype;
  subtitle: string;
  interpretation: string;
  tendencies: string[];
  closingMessage: string;
}

const ARCHETYPE_DEFINITIONS: Record<Archetype, ArchetypeDefinition> = {
  "The Observer": {
    title: "The Observer",
    subtitle: "Deliberate perception, quiet scrutiny, and contextual patience.",
    interpretation:
      "Within these six chapters, your choices favored gathering context before committing to irreversible action. Rather than accepting surface urgency at face value, you lingered on peripheral details, examined physical traces, and allowed the room to speak first.",
    tendencies: [
      "Measured perceptual patience before acting",
      "Consistent inspection of environmental details",
      "Composure when confronted with artificial urgency",
    ],
    closingMessage:
      "What others pass in haste often contains the entire story for the one who pauses to look.",
  },
  "The Strategist": {
    title: "The Strategist",
    subtitle: "Structured deduction, consequence weighing, and composed reasoning.",
    interpretation:
      "Across the narrative scenarios, you treated uncertainty as an architecture of cause and effect. Your path combined deliberate verification with focused problem-solving, prioritizing coherent reasoning over impulsive reaction.",
    tendencies: [
      "Systematic deduction across connected clues",
      "Deliberate weighing of trade-offs and timing",
      "Focused reasoning during constrained challenges",
    ],
    closingMessage:
      "In uncertain terrain, clarity belongs to the mind that traces structure beneath noise.",
  },
  "The Creative Soul": {
    title: "The Creative Soul",
    subtitle: "Atmospheric sensitivity, symbolic composition, and tonal nuance.",
    interpretation:
      "Your journey gravitated toward mood, visual balance, and evocative symbolism. Whether arranging forms upon linen or choosing a quiet sanctuary, your decisions privileged resonance and aesthetic coherence.",
    tendencies: [
      "Attunement to tonal mood and spatial composition",
      "Affinity for symbolic and expressive artifacts",
      "Preference for contemplative, resonant spaces",
    ],
    closingMessage:
      "An empty room is never merely empty; it awaits the eye capable of composing meaning within it.",
  },
  "The Explorer": {
    title: "The Explorer",
    subtitle: "Appetite for unmapped thresholds, hidden alcoves, and open horizons.",
    interpretation:
      "When presented with thresholds and unfamiliar environments, your choices leaned outward toward discovery. You inspected optional corners, gravitated toward unmapped corridors, and treated the unknown as an invitation rather than a deterrent.",
    tendencies: [
      "Broad curiosity across unfamiliar environments",
      "Willingness to step beyond marked pathways",
      "Thoroughness in uncovering peripheral clues",
    ],
    closingMessage:
      "Every map begins precisely where the last traveler chose not to turn back.",
  },
  "The Empath": {
    title: "The Empath",
    subtitle: "Human attentiveness, relational accountability, and immediate care.",
    interpretation:
      "At key crossroads in this story, the human presence on the other side of a choice carried decisive weight for you. Even under schedule pressure or ambiguity, your actions accounted for strangers, unspoken words, and interpersonal consequence.",
    tendencies: [
      "Attentiveness to human impact in urgent moments",
      "Direct engagement with interpersonal dilemmas",
      "Sensitivity to personal artifacts and correspondence",
    ],
    closingMessage:
      "Long after schedules and mechanisms are forgotten, the small act of regard endures.",
  },
  "The Curious Mind": {
    title: "The Curious Mind",
    subtitle: "Active inquiry, epistemic persistence, and interrogation of anomalies.",
    interpretation:
      "Mysteries and unanswered transmissions drew you directly into investigation. Throughout the experience, your instinct was to ask how a signal arrived, trace connections across chapters, and test hypotheses until the pattern emerged.",
    tendencies: [
      "Persistent questioning of ambiguous signals",
      "Drive to trace origins and hidden connections",
      "Readiness to experiment and test possibilities",
    ],
    closingMessage:
      "The quality of the questions you pursue shapes every room you enter.",
  },
  "The Independent Thinker": {
    title: "The Independent Thinker",
    subtitle: "Self-directed agency, sovereign restraint, and resistance to pressure.",
    interpretation:
      "Your decisions demonstrated a clear internal compass. Whether declining to be baited by an anonymous provocation or protecting your own trajectory at midnight, you acted on your own terms rather than external scripts.",
    tendencies: [
      "Self-directed judgment under external pressure",
      "Selective restraint when provoked by ambiguity",
      "Comfort with autonomous, non-prescribed paths",
    ],
    closingMessage:
      "Autonomy is quietest when it needs neither permission nor applause to hold its course.",
  },
};

const CHAPTER_TITLES: Record<number, string> = {
  1: "The Last Train",
  2: "The Locked Room",
  3: "The Unknown Message",
  4: "The Empty Canvas",
  5: "The Final Ten Seconds",
  6: "The Unknown World",
};

export function evaluateReport(
  sessionId: string,
  playerName: string,
  events: GameplayEvent[],
  preferences: PlayerPreference[],
  completedAt: string = new Date().toISOString(),
  characterPresentation: CharacterPresentation = "UNSPECIFIED"
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
  const interestingDecisions: { chapter: number; chapterTitle: string; summary: string }[] = [];
  const chaptersWithSignals = new Set<number>();

  // Count completed chapters accurately from events
  const completedChapterNums = new Set<number>();
  for (const ev of events) {
    if (ev.event_type === "chapter_completed" && ev.chapter >= 1 && ev.chapter <= 6) {
      completedChapterNums.add(ev.chapter);
    }
  }

  // ---------------------------------------------------------------------------
  // CHAPTER 1 — THE LAST TRAIN
  // ---------------------------------------------------------------------------
  const ch1Choices = events.filter(
    (e) => e.chapter === 1 && e.event_type === "choice_selected"
  );
  if (ch1Choices.length > 0) {
    chaptersWithSignals.add(1);
    const investigatedFirst = ch1Choices.some(
      (c) => c.event_data?.choiceId === "investigate_first"
    );
    const finalCh1 = ch1Choices[ch1Choices.length - 1];
    const finalAction = String(finalCh1.event_data?.choiceId || "");
    const durationMs = Number(finalCh1.event_data?.durationMs || 0);

    if (investigatedFirst) {
      scores["The Observer"] += 3;
      scores["The Strategist"] += 1;
      scores["The Curious Mind"] += 1;
      supportingEvidence.push(
        "Chapter 01: Inspected the fallen leather wallet on the platform before committing to a final decision."
      );
    }

    if (finalAction === "return_wallet") {
      scores["The Empath"] += 4;
      scores["The Observer"] += 1;
      interestingDecisions.push({
        chapter: 1,
        chapterTitle: CHAPTER_TITLES[1],
        summary: "Forfeited the final train to return the stranger's wallet in person.",
      });
      supportingEvidence.push(
        "Chapter 01: Chose to return the wallet directly despite losing the last departure."
      );
    } else if (finalAction === "call_out") {
      scores["The Empath"] += 3;
      scores["The Strategist"] += 2;
      interestingDecisions.push({
        chapter: 1,
        chapterTitle: CHAPTER_TITLES[1],
        summary: "Called out across the platform to alert the stranger while still catching the train.",
      });
      supportingEvidence.push(
        "Chapter 01: Balanced social regard with practical timing by calling out to the stranger."
      );
    } else if (finalAction === "catch_train") {
      scores["The Independent Thinker"] += 4;
      scores["The Strategist"] += 2;
      interestingDecisions.push({
        chapter: 1,
        chapterTitle: CHAPTER_TITLES[1],
        summary: "Maintained course and boarded the departing train before the doors sealed.",
      });
      supportingEvidence.push(
        "Chapter 01: Protected your intended departure rather than being diverted at the threshold."
      );
    }

    if (durationMs > 14000) {
      scores["The Observer"] += 1;
      scores["The Strategist"] += 1;
    } else if (durationMs > 0 && durationMs < 5500) {
      scores["The Independent Thinker"] += 1;
    }
  }

  // ---------------------------------------------------------------------------
  // CHAPTER 2 — THE LOCKED ROOM
  // ---------------------------------------------------------------------------
  const ch2Clues = events.filter(
    (e) => e.chapter === 2 && e.event_type === "clue_inspected"
  );
  const ch2Hints = events.filter(
    (e) => e.chapter === 2 && e.event_type === "hint_used"
  );
  const ch2Attempts = events.filter(
    (e) => e.chapter === 2 && e.event_type === "puzzle_attempted"
  );

  const uniqueCh2Clues = Array.from(
    new Set(ch2Clues.map((c) => String(c.event_data?.clueId || "")).filter(Boolean))
  );

  if (uniqueCh2Clues.length > 0 || ch2Attempts.length > 0) {
    chaptersWithSignals.add(2);
  }

  if (uniqueCh2Clues.length >= 3) {
    scores["The Observer"] += 3;
    scores["The Explorer"] += 2;
    supportingEvidence.push(
      `Chapter 02: Examined ${uniqueCh2Clues.length} archive clues in sequence before opening the oak door.`
    );
  } else if (uniqueCh2Clues.length >= 1) {
    scores["The Curious Mind"] += 2;
  }

  const ch2Solved = ch2Attempts.some((a) => a.event_data?.isCorrect === true);
  if (ch2Solved) {
    if (ch2Hints.length === 0 && ch2Attempts.length === 1) {
      scores["The Strategist"] += 4;
      scores["The Observer"] += 1;
      interestingDecisions.push({
        chapter: 2,
        chapterTitle: CHAPTER_TITLES[2],
        summary: "Deduced the archive tumbler code on the first attempt without hints.",
      });
    } else if (ch2Hints.length === 0) {
      scores["The Strategist"] += 2;
      scores["The Independent Thinker"] += 1;
    } else {
      scores["The Curious Mind"] += 1;
    }
  }

  // ---------------------------------------------------------------------------
  // CHAPTER 3 — THE UNKNOWN MESSAGE
  // ---------------------------------------------------------------------------
  const ch3Choices = events.filter(
    (e) => e.chapter === 3 && e.event_type === "choice_selected"
  );
  if (ch3Choices.length > 0) {
    chaptersWithSignals.add(3);
    const inspectedSender = ch3Choices.some(
      (c) => c.event_data?.choiceId === "investigate_sender"
    );
    const searchedEvidence = ch3Choices.some(
      (c) => c.event_data?.choiceId === "look_for_evidence"
    );
    const finalCh3 = ch3Choices[ch3Choices.length - 1];
    const ch3Action = String(finalCh3.event_data?.choiceId || "");

    if (inspectedSender) {
      scores["The Curious Mind"] += 3;
      scores["The Strategist"] += 1;
      supportingEvidence.push(
        "Chapter 03: Traced transmission routing metadata before deciding how to respond."
      );
    }
    if (searchedEvidence) {
      scores["The Observer"] += 3;
      scores["The Explorer"] += 1;
      supportingEvidence.push(
        "Chapter 03: Swept the physical study perimeter for corroborating evidence."
      );
    }

    if (ch3Action === "ignore_message") {
      scores["The Independent Thinker"] += 4;
      interestingDecisions.push({
        chapter: 3,
        chapterTitle: CHAPTER_TITLES[3],
        summary: "Refused to grant leverage to the anonymous sender by withholding a reply.",
      });
    } else if (ch3Action === "reply_immediately" || ch3Action === "confront_sender") {
      scores["The Curious Mind"] += 2;
      scores["The Empath"] += 2;
      scores["The Independent Thinker"] += 1;
      interestingDecisions.push({
        chapter: 3,
        chapterTitle: CHAPTER_TITLES[3],
        summary: "Engaged the unknown sender directly to test their claim.",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // CHAPTER 4 — THE EMPTY CANVAS
  // ---------------------------------------------------------------------------
  const canvasObjects = preferences
    .filter((p) => p.preference_category === "canvas_object")
    .map((p) => p.selected_value);
  const canvasPalette =
    preferences.find((p) => p.preference_category === "canvas_mood")?.selected_value ||
    preferences.find((p) => p.preference_category === "canvas_palette")?.selected_value ||
    null;
  const canvasArrangement =
    preferences.find((p) => p.preference_category === "canvas_arrangement")?.selected_value ||
    null;

  if (canvasObjects.length > 0 || canvasPalette) {
    chaptersWithSignals.add(4);
    scores["The Creative Soul"] += 3;

    for (const obj of canvasObjects) {
      if (obj.includes("Astrolabe")) {
        scores["The Explorer"] += 1;
        scores["The Strategist"] += 1;
      } else if (obj.includes("Rose")) {
        scores["The Creative Soul"] += 1;
        scores["The Empath"] += 1;
      } else if (obj.includes("Key")) {
        scores["The Curious Mind"] += 1;
        scores["The Independent Thinker"] += 1;
      } else if (obj.includes("Prism")) {
        scores["The Observer"] += 1;
        scores["The Creative Soul"] += 1;
      } else if (obj.includes("Letter")) {
        scores["The Empath"] += 2;
      } else if (obj.includes("Hourglass")) {
        scores["The Strategist"] += 1;
        scores["The Observer"] += 1;
      }
    }

    interestingDecisions.push({
      chapter: 4,
      chapterTitle: CHAPTER_TITLES[4],
      summary: `Composed "${canvasPalette || "Editorial Study"}" with ${canvasObjects.join(", ")}.`,
    });
    supportingEvidence.push(
      `Chapter 04: Constructed a ${canvasArrangement ? canvasArrangement.toLowerCase() + " " : ""}studio composition around ${canvasObjects.slice(0, 3).join(", ")}.`
    );
  }

  // ---------------------------------------------------------------------------
  // CHAPTER 5 — THE FINAL TEN SECONDS
  // ---------------------------------------------------------------------------
  const ch5Attempts = events.filter(
    (e) => e.chapter === 5 && e.event_type === "puzzle_attempted"
  );
  const ch5Hints = events.filter(
    (e) => e.chapter === 5 && e.event_type === "hint_used"
  );

  if (ch5Attempts.length > 0) {
    chaptersWithSignals.add(5);
    const ch5Correct = ch5Attempts.find((a) => a.event_data?.isCorrect === true);
    if (ch5Correct) {
      scores["The Strategist"] += 3;
      if (ch5Hints.length === 0) {
        scores["The Observer"] += 1;
        scores["The Independent Thinker"] += 1;
      }
      supportingEvidence.push(
        "Chapter 05: Resolved the relational vault equation accurately during the countdown."
      );
      interestingDecisions.push({
        chapter: 5,
        chapterTitle: CHAPTER_TITLES[5],
        summary: "Maintained composure under countdown pressure to verify the relay value.",
      });
    } else {
      scores["The Explorer"] += 1;
      scores["The Independent Thinker"] += 1;
    }
  }

  // ---------------------------------------------------------------------------
  // CHAPTER 6 — THE UNKNOWN WORLD (Explicit Preferences + Subtle Thematic Tie)
  // ---------------------------------------------------------------------------
  const worldEnvironment =
    preferences.find((p) => p.preference_category === "world_environment")?.selected_value ||
    null;
  const worldObject =
    preferences.find((p) => p.preference_category === "world_object")?.selected_value ||
    null;
  const worldActivity =
    preferences.find((p) => p.preference_category === "world_activity")?.selected_value ||
    null;

  if (worldEnvironment || worldObject || worldActivity) {
    chaptersWithSignals.add(6);

    if (worldEnvironment?.includes("Observatory")) {
      scores["The Observer"] += 2;
      scores["The Curious Mind"] += 2;
    } else if (worldEnvironment?.includes("Archives")) {
      scores["The Curious Mind"] += 3;
      scores["The Strategist"] += 1;
    } else if (worldEnvironment?.includes("Coastal")) {
      scores["The Explorer"] += 3;
      scores["The Independent Thinker"] += 1;
    } else if (worldEnvironment?.includes("Greenhouse")) {
      scores["The Creative Soul"] += 3;
      scores["The Empath"] += 1;
    }

    if (worldObject?.includes("Letter")) {
      scores["The Empath"] += 2;
    } else if (worldObject?.includes("Prism")) {
      scores["The Creative Soul"] += 2;
      scores["The Observer"] += 1;
    } else if (worldObject?.includes("Astrolabe")) {
      scores["The Explorer"] += 2;
      scores["The Strategist"] += 1;
    } else if (worldObject?.includes("Key")) {
      scores["The Curious Mind"] += 2;
      scores["The Independent Thinker"] += 1;
    }

    if (worldActivity?.includes("Document")) {
      scores["The Observer"] += 3;
    } else if (worldActivity?.includes("Chart")) {
      scores["The Strategist"] += 3;
    } else if (worldActivity?.includes("Venture")) {
      scores["The Explorer"] += 3;
    } else if (worldActivity?.includes("Sit") || worldActivity?.includes("absorb")) {
      scores["The Creative Soul"] += 2;
      scores["The Empath"] += 2;
    }

    if (worldEnvironment) {
      interestingDecisions.push({
        chapter: 6,
        chapterTitle: CHAPTER_TITLES[6],
        summary: `Selected ${worldEnvironment} as your closing horizon.`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // FACTUAL PUZZLE & GAMEPLAY TELEMETRY (Strictly measured — never fabricated)
  // ---------------------------------------------------------------------------
  const allClueEvents = events.filter((e) => e.event_type === "clue_inspected");
  const allHintEvents = events.filter((e) => e.event_type === "hint_used");
  const puzzleChaptersAttempted = [2, 5].filter((ch) =>
    events.some((e) => e.chapter === ch && e.event_type === "puzzle_attempted")
  );
  const puzzleChaptersSolved = [2, 5].filter((ch) =>
    events.some(
      (e) =>
        e.chapter === ch &&
        e.event_type === "puzzle_attempted" &&
        e.event_data?.isCorrect === true
    )
  );

  const responseSamplesSec: number[] = [];
  for (const ev of events) {
    if (ev.event_type === "puzzle_attempted" || ev.event_type === "choice_selected") {
      const ms = Number(
        ev.event_data?.durationMs || ev.event_data?.timeToSolveMs || 0
      );
      if (ms > 0 && ms < 600_000) {
        responseSamplesSec.push(ms / 1000);
      }
    }
  }

  const avgResponseTimeSeconds =
    responseSamplesSec.length > 0
      ? Math.round(
          (responseSamplesSec.reduce((sum, v) => sum + v, 0) /
            responseSamplesSec.length) *
            10
        ) / 10
      : null;

  const totalPuzzleAttemptsCount = ch2Attempts.length + ch5Attempts.length;
  const totalCorrectPuzzleAttempts =
    ch2Attempts.filter((a) => a.event_data?.isCorrect === true).length +
    ch5Attempts.filter((a) => a.event_data?.isCorrect === true).length;

  const accuracyPct =
    totalPuzzleAttemptsCount > 0
      ? Math.round((totalCorrectPuzzleAttempts / totalPuzzleAttemptsCount) * 100)
      : null;

  // ---------------------------------------------------------------------------
  // DETERMINISTIC ARCHETYPE RANKING & CONFIDENCE
  // ---------------------------------------------------------------------------
  const orderedArchetypes: Archetype[] = [
    "The Observer",
    "The Strategist",
    "The Creative Soul",
    "The Explorer",
    "The Empath",
    "The Curious Mind",
    "The Independent Thinker",
  ];

  const sorted = [...orderedArchetypes].sort((a, b) => scores[b] - scores[a]);
  const primaryArchetype = sorted[0];
  const runnerUpArchetype = sorted[1];
  const scoreGap = scores[primaryArchetype] - scores[runnerUpArchetype];
  const signalChapterCount = chaptersWithSignals.size;

  let confidence: ConfidenceLevel = "Moderate";
  let confidenceRationale =
    "Moderate alignment across recorded decisions, with secondary affinities also present.";

  if (signalChapterCount < 3 || scores[primaryArchetype] < 5) {
    confidence = "Low";
    confidenceRationale =
      "Based on limited chapter signals recorded so far; treat this portrait as tentative.";
  } else if (signalChapterCount >= 5 && scoreGap >= 3 && scores[primaryArchetype] >= 9) {
    confidence = "Strong";
    confidenceRationale = `Consistent convergence across ${signalChapterCount} chapters separating ${primaryArchetype} from ${runnerUpArchetype}.`;
  } else if (scoreGap <= 1) {
    confidence = "Low";
    confidenceRationale = `Closely balanced between ${primaryArchetype} and ${runnerUpArchetype} across ${signalChapterCount} chapters.`;
  } else {
    confidence = "Moderate";
    confidenceRationale = `Synthesized across ${signalChapterCount} chapters with secondary resonance toward ${runnerUpArchetype}.`;
  }

  const definition = ARCHETYPE_DEFINITIONS[primaryArchetype];

  if (supportingEvidence.length === 0) {
    supportingEvidence.push(
      "Recorded session telemetry reflects initial chapter exploration."
    );
  }

  const chaptersCompleted = Math.max(
    completedChapterNums.size,
    signalChapterCount
  );

  return {
    sessionId,
    playerName: playerName?.trim() || "Anonymous Traveler",
    characterPresentation,
    archetype: primaryArchetype,
    runnerUpArchetype,
    subtitle: definition.subtitle,
    interpretation: definition.interpretation,
    confidence,
    confidenceRationale,
    observedTendencies: definition.tendencies,
    supportingEvidence,
    interestingDecisions,
    factualResults: {
      chaptersCompleted,
      puzzlesAttempted: puzzleChaptersAttempted.length,
      puzzlesSolved: puzzleChaptersSolved.length,
      hintsUsed: allHintEvents.length,
      cluesInspectedCount: allClueEvents.length,
      avgResponseTimeSeconds,
      accuracyPct,
    },
    explicitPreferences: {
      worldEnvironment,
      worldObject,
      worldActivity,
      canvasObjects,
      canvasPalette,
      canvasArrangement,
    },
    closingMessage: definition.closingMessage,
    completedAt,
  };
}
