/**
 * 5 Progressive Hints Catalogue for THE UNWRITTEN
 * Every round across Solo (8) and Multiplayer (8) contains exactly 5 progressive hints:
 * 1. General Direction
 * 2. Key Observation
 * 3. Logical Reasoning
 * 4. Strong Tactical Clue
 * 5. Specific Walkthrough Guidance
 */

export interface RoundHints {
  roundId: string;
  roundTitle: string;
  hints: [string, string, string, string, string]; // Exactly 5 progressive tiers
}

export const CAMPAIGN_HINTS: Record<string, RoundHints> = {
  // ---------------------------------------------------------------------------
  // SOLO CAMPAIGN: THE MIND EXPERIMENT (8 Levels)
  // ---------------------------------------------------------------------------
  solo_l1: {
    roundId: "solo_l1",
    roundTitle: "Level 1: The Wake Up",
    hints: [
      "The blast door's electronic lock requires a 4-digit code. Inspect the chamber for time-stamped records.",
      "Look closely at the shattered wall clock on the right wall and the rusted desk drawer.",
      "The wall clock stopped ticking when the power surged, freezing both hands at an exact hour and minute.",
      "The desk drawer contains a torn calibration record explicitly mentioning 'calibration index locked at 07:45'.",
      "Format the frozen time (7 hours, 45 minutes) as a standard 4-digit sequence: 0 - 7 - 4 - 5.",
    ],
  },
  solo_l2: {
    roundId: "solo_l2",
    roundTitle: "Level 2: Three Doors",
    hints: [
      "Each door bears an inscription. Only one door's statement avoids creating a logical paradox.",
      "Evaluate the claims: Oak points to Iron, Iron points to Chalk, and Chalk declares Oak false.",
      "If the Door of Oak spoke truth, then Iron would also speak truth, pointing to Chalk. But Chalk contradicts Oak, creating an impossible loop.",
      "Therefore, the Door of Oak must be lying. The Door of Chalk correctly identifies that Oak lies.",
      "Select the Door of Chalk (White Door) in the center. Its claim is truthful and resolves the contradiction.",
    ],
  },
  solo_l3: {
    roundId: "solo_l3",
    roundTitle: "Level 3: The Forgotten Room",
    hints: [
      "The Warden removed one specific artifact from the study's mantelpiece after you memorized the scene.",
      "Compare the current mantelpiece against the initial catalog: portrait, mantel clock, quill, celestial globe.",
      "Focus your attention directly above the fireplace hearth where timepieces are traditionally mounted.",
      "The silver quill and celestial globe are still resting on the desk. The oil portrait remains hung.",
      "The Brass Mantel Clock is missing from the center mantel. Select it as the vanished artifact.",
    ],
  },
  solo_l4: {
    roundId: "solo_l4",
    roundTitle: "Level 4: The Interrogation",
    hints: [
      "Mr. Halden's alibi relies on a specific timeline of when he completed his duties and went to sleep.",
      "Compare Halden's statement about the freight train against the official station master dispatch log.",
      "Halden claims: 'I locked the registry ledger at midnight after seeing off the midnight freight.'",
      "The station registry explicitly records that the midnight train suffered a mechanical delay and did not arrive until 01:15.",
      "Select Halden's statement regarding the midnight train arrival. It is impossible for him to have seen it off at midnight.",
    ],
  },
  solo_l5: {
    roundId: "solo_l5",
    roundTitle: "Level 5: The Mirror Maze",
    hints: [
      "Optical reflections create false paths in the gilded corridor. Avoid glowing purple mirror reflection traps.",
      "The true exit is situated at the bottom-right corner marked with a glowing green gateway.",
      "Trace paths that have solid backing rather than mirrored glass. Stepping on a purple tile resets your position.",
      "Move along the outer perimeter corridors: advance south, cut across the central corridor eastward, then descend south.",
      "Navigate to tile coordinate (9, 9) where the threshold door unlocks to break the glass illusion.",
    ],
  },
  solo_l6: {
    roundId: "solo_l6",
    roundTitle: "Level 6: The Last Human",
    hints: [
      "Mira's septic fever requires immediate antibiotic intervention, but your survival supplies are limited.",
      "Consider the narrative impact: an alliance built on empathy changes how the Warden evaluates human nature.",
      "Withholding medicine preserves personal endurance, but leaves a psychological toll on Aarav's resolve.",
      "Surrendering the medicine stabilizes Mira, demonstrating uncalculated human altruism.",
      "Choose based on the moral signature you wish to establish: Surrendering antibiotics unlocks the Humanist/Survivor synthesis.",
    ],
  },
  solo_l7: {
    roundId: "solo_l7",
    roundTitle: "Level 7: The Impossible Second",
    hints: [
      "Emergency power is failing across all sectors. You have 15 seconds to reroute auxiliary generators.",
      "Look at the overload percentages: Sector C (Reactor Core) is redlining at 94% heat.",
      "Rerouting power to non-critical communications or security blast doors will allow the reactor to melt down.",
      "Sector A (Life-Support ICU) and Sector C (Reactor Coolant) are the dual vital nodes.",
      "Prioritize Sector C Coolant Turbines or Sector A ICU to prevent catastrophic station decompression.",
    ],
  },
  solo_l8: {
    roundId: "solo_l8",
    roundTitle: "Level 8: The Final Truth",
    hints: [
      "The Warden reveals that The Mind Experiment is an observation chamber testing cognitive resilience.",
      "Your choices across previous chambers (accuracy, morality, risk, cooperation) form your final profile.",
      "Examine the evidence board linking the 07:45 time index, the library records, and Halden's keycard.",
      "Each conclusion represents a different psychological posture: Mastermind, Humanist, Survivor, or Unpredictable.",
      "Confirm your synthesis to unlock your definitive narrative ending monograph.",
    ],
  },

  // ---------------------------------------------------------------------------
  // MULTIPLAYER CAMPAIGN: THE LAST ALLIANCE (8 Levels)
  // ---------------------------------------------------------------------------
  alliance_l1: {
    roundId: "alliance_l1",
    roundTitle: "Alliance Level 1: The First Lock (Sudoku)",
    hints: [
      "Every row, column, and 3x3 quadrant must contain all digits from 1 to 9 without repetition.",
      "Scan rows or columns that already possess 7 or 8 numbers; the missing digits are forced.",
      "Use Pencil Notes (press 'N') to record candidate numbers inside open cells before committing values.",
      "Check the crimson-highlighted conflict cells; duplicate digits in the same quadrant must be cleared.",
      "Focus on the central 3x3 block: cross-reference row and column intersections to place the remaining digits.",
    ],
  },
  alliance_l2: {
    roundId: "alliance_l2",
    roundTitle: "Alliance Level 2: The Vampire's Offer (Chess)",
    hints: [
      "Count Vesper believes he is winning because he captured White's Queen on d1. Exploit his exposed King.",
      "Look for forced checks. A sacrifice that opens lines against Black's King cannot be ignored.",
      "White's light-squared Bishop on c4 and Knight on e5/d5 are coordinating against the weak f7 square.",
      "The decisive tactical blow begins with a Knight sacrifice: 1. Nf6+! Black's pawn is forced to capture (1... gxf6).",
      "Deliver forced checkmate with the bishop: 2. Bxf7# strikes the King with no legal escape squares.",
    ],
  },
  alliance_l3: {
    roundId: "alliance_l3",
    roundTitle: "Alliance Level 3: Mind Snap",
    hints: [
      "Rapidly compare the synthetic clone matrices on screen to find identical genetic formula pairs.",
      "Filter by primary background color first, then inspect the central geometric symbol.",
      "Beware mirror-flipped symbols; only exact identical orientations count as a valid match.",
      "Two quadrants display identical blue hexagons with triangular vertices.",
      "Select both matching blue hexagon specimens simultaneously to lock in the match.",
    ],
  },
  alliance_l4: {
    roundId: "alliance_l4",
    roundTitle: "Alliance Level 4: The Imposter",
    hints: [
      "One operative received a slightly different briefing word than the rest of the squad.",
      "During the discussion phase, ask subtle questions that verify specific details without giving away the keyword.",
      "The imposter's answers will sound slightly overly broad or evasive regarding the mission location.",
      "Pay attention to Operative 3's hesitation when describing the atmospheric weather.",
      "Cast your vote for the operative whose descriptions fail to align with the authentic dossier.",
    ],
  },
  alliance_l5: {
    roundId: "alliance_l5",
    roundTitle: "Alliance Level 5: The Memory Vault",
    hints: [
      "Terminal Alpha holds the cryptographic prefix; Terminal Beta holds the prime numerical suffix.",
      "Neither player can unlock the vault alone. You must read your private fragments aloud to your partner.",
      "Combine Terminal Alpha's greek symbol with Terminal Beta's 4-digit numeric sequence.",
      "The complete composite key follows the syntax: ALPHA-SIGMA-[NUMERIC_CODE].",
      "Enter the synchronized composite key into the central console within the shared deadline.",
    ],
  },
  alliance_l6: {
    roundId: "alliance_l6",
    roundTitle: "Alliance Level 6: The Human Choice",
    hints: [
      "Decontamination oxygen is restricted. The squad must vote on resource distribution.",
      "A unanimous vote preserves all squad members with minimal reserves.",
      "A divided vote sacrifices the minority operative to guarantee optimal reserves for the remainder.",
      "Coordinate in chat to ensure everyone commits to the same consensus distribution.",
      "Lock in consensus voting for Equal Distribution to ensure the entire team advances intact.",
    ],
  },
  alliance_l7: {
    roundId: "alliance_l7",
    roundTitle: "Alliance Level 7: The Breaking Point",
    hints: [
      "High-voltage conduits require simultaneous manual breaker depression.",
      "Both players must press and hold their respective override buttons within a 0.5s synchronization window.",
      "Use the on-screen sync pulse or a voice countdown ('3 - 2 - 1 - PRESS') to coordinate.",
      "Hold the breaker down until the green power bar completes its 5-second circuit cycle.",
      "Do not release early; releasing before 100% resets the breaker timer.",
    ],
  },
  alliance_l8: {
    roundId: "alliance_l8",
    roundTitle: "Alliance Level 8: The Final Betrayal",
    hints: [
      "The extraction briefcase rests between you. You must secretly choose COOPERATE or BETRAY.",
      "If both operatives Cooperate, both escape with shared honor and equal classified intel.",
      "If one Betrays while the other Cooperates, the traitor takes all intel, abandoning their partner.",
      "If both Betray, the fail-safe locks trigger, destroying the briefcase in the abyss (Lose-Lose).",
      "Trust is the ultimate test: consider whether your partner has proven loyal across the previous 7 chambers.",
    ],
  },
};

/**
 * Retrieves the 5 progressive hints for a given scene or round ID
 */
export function getHintsForRound(roundId: string): RoundHints {
  if (CAMPAIGN_HINTS[roundId]) {
    return CAMPAIGN_HINTS[roundId];
  }
  // Generic fallback if unknown round
  return {
    roundId,
    roundTitle: "Tactical Investigation",
    hints: [
      "Survey the environmental backdrop carefully for interactive visual markers.",
      "Examine recent dialogue clues; key figures frequently drop procedural hints.",
      "Eliminate clearly incorrect or invalid candidate choices before committing.",
      "Check the mechanical rules of the current chamber interface.",
      "Review your recent journal entries to assemble the complete solution.",
    ],
  };
}
