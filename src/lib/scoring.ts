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

  // Helper to retrieve the latest preference value for a category (prevents stale first-value locks)
  const getLatestPref = (category: string): string | null => {
    for (let i = preferences.length - 1; i >= 0; i--) {
      if (preferences[i].preference_category === category && preferences[i].selected_value) {
        return preferences[i].selected_value;
      }
    }
    return null;
  };

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
  let finalAction = "";
  if (ch1Choices.length > 0) {
    chaptersWithSignals.add(1);
    const investigatedFirst = ch1Choices.some(
      (c) => c.event_data?.choiceId === "investigate_first"
    );

    // Pick the last decisive action (preferring return_wallet/call_out/catch_train over investigate_first)
    const decisiveActionEv = ch1Choices.slice().reverse().find((c) =>
      ["return_wallet", "call_out", "catch_train"].includes(String(c.event_data?.choiceId || ""))
    );
    const finalCh1 = decisiveActionEv || ch1Choices[ch1Choices.length - 1];
    finalAction = String(finalCh1.event_data?.choiceId || "");
    const durationMs = Number(finalCh1.event_data?.durationMs || 0);

    if (investigatedFirst) {
      scores["The Observer"] += 3;
      scores["The Curious Mind"] += 2;
      scores["The Strategist"] += 1;
      supportingEvidence.push(
        "Chapter 01: Inspected the fallen leather wallet on the platform before committing to a final decision."
      );
    }

    if (finalAction === "return_wallet") {
      scores["The Empath"] += 6;
      interestingDecisions.push({
        chapter: 1,
        chapterTitle: CHAPTER_TITLES[1],
        summary: "Forfeited the final train to return the stranger's wallet in person.",
      });
      supportingEvidence.push(
        "Chapter 01: Chose to return the wallet directly despite losing the last departure."
      );
    } else if (finalAction === "call_out") {
      scores["The Strategist"] += 4;
      scores["The Empath"] += 2;
      interestingDecisions.push({
        chapter: 1,
        chapterTitle: CHAPTER_TITLES[1],
        summary: "Called out across the platform to alert the stranger while still catching the train.",
      });
      supportingEvidence.push(
        "Chapter 01: Balanced social regard with practical timing by calling out to the stranger."
      );
    } else if (finalAction === "catch_train") {
      scores["The Independent Thinker"] += 5;
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
      scores["The Observer"] += 2;
      scores["The Strategist"] += 1;
    } else if (durationMs > 0 && durationMs < 5500) {
      scores["The Independent Thinker"] += 2;
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
    scores["The Explorer"] += 3;
    scores["The Observer"] += 2;
    scores["The Curious Mind"] += 2;
    supportingEvidence.push(
      `Chapter 02: Examined ${uniqueCh2Clues.length} archive clues in sequence before opening the oak door.`
    );
  } else if (uniqueCh2Clues.length >= 1) {
    scores["The Curious Mind"] += 2;
  }

  const ch2Solved = ch2Attempts.some((a) => a.event_data?.isCorrect === true);
  if (ch2Solved) {
    if (ch2Hints.length === 0 && ch2Attempts.length === 1) {
      scores["The Strategist"] += 5;
      scores["The Independent Thinker"] += 2;
      interestingDecisions.push({
        chapter: 2,
        chapterTitle: CHAPTER_TITLES[2],
        summary: "Deduced the archive tumbler code on the first attempt without hints.",
      });
    } else if (ch2Hints.length === 0) {
      scores["The Strategist"] += 3;
      scores["The Curious Mind"] += 2;
    } else {
      scores["The Curious Mind"] += 3;
      scores["The Explorer"] += 1;
    }
  }

  // ---------------------------------------------------------------------------
  // CHAPTER 3 — THE UNKNOWN MESSAGE
  // ---------------------------------------------------------------------------
  const ch3Choices = events.filter(
    (e) => e.chapter === 3 && e.event_type === "choice_selected"
  );
  let ch3Action = "";
  if (ch3Choices.length > 0) {
    chaptersWithSignals.add(3);
    const inspectedSender = ch3Choices.some(
      (c) => c.event_data?.choiceId === "investigate_sender"
    );
    const searchedEvidence = ch3Choices.some(
      (c) => c.event_data?.choiceId === "look_for_evidence"
    );

    // Pick the last decisive action
    const decisiveCh3Ev = ch3Choices.slice().reverse().find((c) =>
      ["reply_immediately", "confront_sender", "ignore_message"].includes(String(c.event_data?.choiceId || ""))
    );
    const finalCh3 = decisiveCh3Ev || ch3Choices[ch3Choices.length - 1];
    ch3Action = String(finalCh3.event_data?.choiceId || "");

    if (inspectedSender) {
      scores["The Curious Mind"] += 4;
      scores["The Strategist"] += 2;
      supportingEvidence.push(
        "Chapter 03: Traced transmission routing metadata before deciding how to respond."
      );
    }
    if (searchedEvidence) {
      scores["The Observer"] += 3;
      scores["The Explorer"] += 2;
      supportingEvidence.push(
        "Chapter 03: Swept the physical study perimeter for corroborating evidence."
      );
    }

    if (ch3Action === "ignore_message") {
      scores["The Independent Thinker"] += 6;
      scores["The Observer"] += 1;
      interestingDecisions.push({
        chapter: 3,
        chapterTitle: CHAPTER_TITLES[3],
        summary: "Refused to grant leverage to the anonymous sender by withholding a reply.",
      });
    } else if (ch3Action === "reply_immediately") {
      scores["The Empath"] += 5;
      scores["The Curious Mind"] += 2;
      interestingDecisions.push({
        chapter: 3,
        chapterTitle: CHAPTER_TITLES[3],
        summary: "Engaged the unknown sender with a direct, measured response.",
      });
    } else if (ch3Action === "confront_sender") {
      scores["The Curious Mind"] += 5;
      scores["The Independent Thinker"] += 3;
      interestingDecisions.push({
        chapter: 3,
        chapterTitle: CHAPTER_TITLES[3],
        summary: "Demanded the sender's identity and challenged their claims directly.",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // CHAPTER 4 — THE EMPTY CANVAS (Multi-object selection & aesthetic palette)
  // ---------------------------------------------------------------------------
  // Isolate latest 3 canvas objects to prevent cross-run / replay leakage
  const allCanvasObjects = preferences
    .filter((p) => p.preference_category === "canvas_object" && p.selected_value)
    .map((p) => p.selected_value);
  const canvasObjects = allCanvasObjects.slice(-3);

  const canvasPalette = getLatestPref("canvas_mood") || getLatestPref("canvas_palette");
  const canvasArrangement = getLatestPref("canvas_arrangement");

  if (canvasObjects.length > 0 || canvasPalette) {
    chaptersWithSignals.add(4);
    scores["The Creative Soul"] += 4;

    for (const obj of canvasObjects) {
      if (obj.includes("Astrolabe")) {
        scores["The Explorer"] += 3;
        scores["The Strategist"] += 2;
      } else if (obj.includes("Rose")) {
        scores["The Creative Soul"] += 3;
        scores["The Empath"] += 3;
      } else if (obj.includes("Key")) {
        scores["The Curious Mind"] += 3;
        scores["The Independent Thinker"] += 3;
      } else if (obj.includes("Prism")) {
        scores["The Observer"] += 3;
        scores["The Creative Soul"] += 2;
      } else if (obj.includes("Letter")) {
        scores["The Empath"] += 4;
        scores["The Creative Soul"] += 2;
      } else if (obj.includes("Hourglass")) {
        scores["The Strategist"] += 3;
        scores["The Observer"] += 2;
      }
    }

    if (canvasPalette) {
      if (canvasPalette.includes("Ivory")) {
        scores["The Empath"] += 2;
        scores["The Creative Soul"] += 1;
      } else if (canvasPalette.includes("Nocturne")) {
        scores["The Independent Thinker"] += 2;
        scores["The Observer"] += 1;
      } else if (canvasPalette.includes("Ochre")) {
        scores["The Explorer"] += 2;
        scores["The Strategist"] += 1;
      } else if (canvasPalette.includes("Celadon")) {
        scores["The Creative Soul"] += 2;
        scores["The Curious Mind"] += 1;
      }
    }

    if (canvasArrangement) {
      if (canvasArrangement.includes("Golden Ratio")) {
        scores["The Creative Soul"] += 2;
        scores["The Observer"] += 1;
      } else if (canvasArrangement.includes("Centered Totem")) {
        scores["The Independent Thinker"] += 2;
        scores["The Strategist"] += 1;
      } else if (canvasArrangement.includes("Horizon Triptych")) {
        scores["The Explorer"] += 2;
        scores["The Strategist"] += 1;
      }
    }

    interestingDecisions.push({
      chapter: 4,
      chapterTitle: CHAPTER_TITLES[4],
      summary: `Composed "${canvasPalette || "Editorial Study"}" with ${canvasObjects.join(", ")}.`,
    });
    supportingEvidence.push(
      `Chapter 04: Constructed a ${canvasArrangement ? canvasArrangement.toLowerCase() + " " : ""}studio composition around ${canvasObjects.join(", ")}.`
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
      if (ch5Hints.length === 0) {
        scores["The Strategist"] += 5;
        scores["The Independent Thinker"] += 2;
      } else {
        scores["The Curious Mind"] += 3;
        scores["The Strategist"] += 2;
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
      scores["The Observer"] += 4;
      scores["The Explorer"] += 2;
      supportingEvidence.push(
        "Chapter 05: Watched the countdown expire without committing an unverified relay value."
      );
    }
  }

  // ---------------------------------------------------------------------------
  // CHAPTER 6 — THE UNKNOWN WORLD (Latest Explicit Preferences)
  // ---------------------------------------------------------------------------
  const worldEnvironment = getLatestPref("world_environment");
  const worldObject = getLatestPref("world_object");
  const worldActivity = getLatestPref("world_activity");

  if (worldEnvironment || worldObject || worldActivity) {
    chaptersWithSignals.add(6);

    if (worldEnvironment?.includes("Observatory")) {
      scores["The Observer"] += 5;
      scores["The Curious Mind"] += 2;
    } else if (worldEnvironment?.includes("Archives")) {
      scores["The Curious Mind"] += 5;
      scores["The Strategist"] += 2;
    } else if (worldEnvironment?.includes("Coastal")) {
      scores["The Explorer"] += 5;
      scores["The Independent Thinker"] += 2;
    } else if (worldEnvironment?.includes("Greenhouse")) {
      scores["The Creative Soul"] += 5;
      scores["The Empath"] += 2;
    }

    if (worldObject?.includes("Letter")) {
      scores["The Empath"] += 4;
      scores["The Creative Soul"] += 2;
    } else if (worldObject?.includes("Prism")) {
      scores["The Observer"] += 4;
      scores["The Creative Soul"] += 2;
    } else if (worldObject?.includes("Astrolabe")) {
      scores["The Explorer"] += 4;
      scores["The Strategist"] += 2;
    } else if (worldObject?.includes("Key")) {
      scores["The Curious Mind"] += 4;
      scores["The Independent Thinker"] += 2;
    }

    if (worldActivity?.includes("Document")) {
      scores["The Observer"] += 6;
      scores["The Curious Mind"] += 2;
    } else if (worldActivity?.includes("Chart")) {
      scores["The Strategist"] += 6;
      scores["The Explorer"] += 2;
    } else if (worldActivity?.includes("Venture")) {
      scores["The Explorer"] += 6;
      scores["The Independent Thinker"] += 2;
    } else if (worldActivity?.includes("Sit") || worldActivity?.includes("absorb")) {
      scores["The Creative Soul"] += 5;
      scores["The Empath"] += 4;
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
  // DETERMINISTIC ARCHETYPE RANKING & FAIR TIE-BREAKING
  // ---------------------------------------------------------------------------
  const allArchetypes: Archetype[] = [
    "The Observer",
    "The Strategist",
    "The Creative Soul",
    "The Explorer",
    "The Empath",
    "The Curious Mind",
    "The Independent Thinker",
  ];

  // Dynamic tie-breaker derived directly from the player's decisive choices:
  const getTieBreakerPriority = (a: Archetype): number => {
    let p = 0;
    // Chapter 6 environment + activity weight
    if (worldEnvironment?.includes("Observatory") && a === "The Observer") p += 4;
    if (worldEnvironment?.includes("Archives") && (a === "The Curious Mind" || a === "The Strategist")) p += 4;
    if (worldEnvironment?.includes("Coastal") && (a === "The Explorer" || a === "The Independent Thinker")) p += 4;
    if (worldEnvironment?.includes("Greenhouse") && (a === "The Creative Soul" || a === "The Empath")) p += 4;

    if (worldActivity?.includes("Document") && a === "The Observer") p += 5;
    if (worldActivity?.includes("Chart") && a === "The Strategist") p += 5;
    if (worldActivity?.includes("Venture") && a === "The Explorer") p += 5;
    if ((worldActivity?.includes("Sit") || worldActivity?.includes("absorb")) && (a === "The Creative Soul" || a === "The Empath")) p += 5;

    // Chapter 1 decisive action
    if (finalAction === "return_wallet" && a === "The Empath") p += 4;
    if (finalAction === "catch_train" && a === "The Independent Thinker") p += 4;
    if (finalAction === "call_out" && a === "The Strategist") p += 4;

    // Chapter 3 decisive action
    if (ch3Action === "ignore_message" && a === "The Independent Thinker") p += 4;
    if (ch3Action === "reply_immediately" && a === "The Empath") p += 4;
    if (ch3Action === "confront_sender" && a === "The Curious Mind") p += 4;

    return p;
  };

  const sorted = [...allArchetypes].sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (diff !== 0) return diff;
    return getTieBreakerPriority(b) - getTieBreakerPriority(a);
  });

  const primaryArchetype = sorted[0];
  const runnerUpArchetype = sorted[1];
  const scoreGap = scores[primaryArchetype] - scores[runnerUpArchetype];
  const signalChapterCount = chaptersWithSignals.size;

  let confidence: ConfidenceLevel = "Moderate";
  let confidenceRationale =
    "Moderate alignment across recorded decisions, with secondary affinities also present.";

  if (signalChapterCount < 2 || scores[primaryArchetype] < 4) {
    confidence = "Low";
    confidenceRationale =
      "Based on limited chapter signals recorded so far; treat this portrait as tentative.";
  } else if (signalChapterCount >= 4 && scoreGap >= 3 && scores[primaryArchetype] >= 8) {
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
