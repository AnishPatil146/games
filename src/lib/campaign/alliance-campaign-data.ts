import { StoryboardScene } from "@/lib/storyboard/types";

export const ALLIANCE_CAMPAIGN_SCENES: Record<string, StoryboardScene> = {
  // ---------------------------------------------------------------------------
  // ALLIANCE LOBBY / PROLOGUE
  // ---------------------------------------------------------------------------
  alliance_lobby: {
    id: "alliance_lobby",
    levelNumber: 0,
    levelTitle: "THE LAST ALLIANCE: COOPERATIVE WAR ROOM",
    sceneTitle: "The Circular Antechamber",
    backgroundUrl: "/art/backgrounds/alliance_lobby.jpg",
    characters: [
      {
        id: "warden",
        name: "THE WARDEN",
        expression: "speaking",
        position: "center",
      },
    ],
    steps: [
      {
        speakerId: "narrator",
        speakerName: "OBSERVER",
        text: "The circular war-room table is set with four empty high-backed chairs. A massive bronze vault door seals the chamber exit.",
        bubblePosition: "center",
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "You have formed an alliance. In this campaign, individual brilliance is worthless if your teammates collapse under pressure.",
        expression: "speaking",
        bubblePosition: "center",
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "If even one operative fails to solve their trial before the authoritative server deadline, the entire alliance must retry the chamber together.",
        expression: "amused",
        bubblePosition: "center",
        choices: [
          {
            id: "BEGIN_ALLIANCE",
            label: "Synchronize team seals and enter Level 1.",
            description: "Begin Level 1: The First Lock",
          },
        ],
      },
    ],
    onCompleteNextSceneId: "alliance_l1",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 1: THE FIRST LOCK (Sudoku Grid)
  // ---------------------------------------------------------------------------
  alliance_l1: {
    id: "alliance_l1",
    levelNumber: 1,
    levelTitle: "LEVEL 01: THE FIRST LOCK",
    sceneTitle: "The Great Glyph Vault",
    backgroundUrl: "/art/backgrounds/alliance_l1_first_lock.jpg",
    characters: [
      {
        id: "aarav",
        name: "AARAV",
        expression: "speaking",
        position: "left",
      },
      {
        id: "aanya",
        name: "AANYA",
        expression: "thinking",
        position: "right",
      },
    ],
    steps: [
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "The giant vault door is partitioned into numerical grid tiles! Each pedestal has illuminated a distinct sequence.",
        expression: "speaking",
        bubblePosition: "left",
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "It's a synchronized Sudoku lock! Every operative must complete their missing digit before the master timer expires.",
        expression: "thinking",
        bubblePosition: "right",
        puzzleTrigger: {
          id: "puzzle_alliance_sudoku",
          type: "sudoku_matrix",
          title: "The Synchronized Glyph Sudoku",
          instructions:
            "Decode the 9x9 mechanical matrix. Align every row, column, and 3x3 quadrant to disengage the chamber's containment locks.",
          payload: { difficulty: "medium" },
          solution: {},
        },
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "All quadrants locked green! The giant circular vault is rolling aside.",
        expression: "victory",
        bubblePosition: "left",
      },
    ],
    onCompleteNextSceneId: "alliance_l2",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 2: THE VAMPIRE'S OFFER (Chess Challenge)
  // ---------------------------------------------------------------------------
  alliance_l2: {
    id: "alliance_l2",
    levelNumber: 2,
    levelTitle: "LEVEL 02: THE VAMPIRE'S OFFER",
    sceneTitle: "The Gothic Chess Hall",
    backgroundUrl: "/art/backgrounds/alliance_l2_vampire_offer.jpg",
    characters: [
      {
        id: "vesper",
        name: "COUNT VESPER",
        expression: "smiling",
        position: "center",
      },
    ],
    steps: [
      {
        speakerId: "vesper",
        speakerName: "COUNT VESPER",
        text: "Welcome, mortals. You walk upon my black-and-ivory chessboard. I have a proposal for your desperate alliance.",
        expression: "smiling",
        bubblePosition: "center",
      },
      {
        speakerId: "vesper",
        speakerName: "COUNT VESPER",
        text: "Each of you faces a tactical endgame on the floor tiles. Find the decisive mating move, or remain my eternal guests.",
        expression: "neutral",
        bubblePosition: "center",
        puzzleTrigger: {
          id: "puzzle_alliance_chess",
          type: "chess_tactics",
          title: "Count Vesper's Gambit: Mate in 2",
          instructions:
            "Vesper takes your Queen on d1 and sneers. White to move: Find the forced tactical sacrifice that seals his fate.",
          payload: { opponent: "Count Vesper" },
          solution: { sequence: ["Nf6+", "gxf6", "Bxf7#"] },
        },
      },
      {
        speakerId: "vesper",
        speakerName: "COUNT VESPER",
        text: "Magnificent. A knight sacrifice into a bishop checkmate. A sharp mind is such a rare vintage. Pass into the laboratory.",
        expression: "smiling",
        bubblePosition: "center",
      },
    ],
    onCompleteNextSceneId: "alliance_l3",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 3: MIND SNAP (Clone Matching)
  // ---------------------------------------------------------------------------
  alliance_l3: {
    id: "alliance_l3",
    levelNumber: 3,
    levelTitle: "LEVEL 03: MIND SNAP",
    sceneTitle: "The Cloning Pods",
    backgroundUrl: "/art/backgrounds/alliance_l3_mind_snap.jpg",
    characters: [
      {
        id: "aanya",
        name: "AANYA",
        expression: "speaking",
        position: "left",
      },
      {
        id: "aarav",
        name: "AARAV",
        expression: "thinking",
        position: "right",
      },
    ],
    steps: [
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "Six tall glass pods... inside each pod is a synthetic clone displaying mathematical glyph sequences.",
        expression: "speaking",
        bubblePosition: "left",
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "Two of the pods share the exact same sequence of Fibonacci primes. We must match the identical pair simultaneously.",
        expression: "thinking",
        bubblePosition: "right",
        choices: [
          {
            id: "SNAP_POD_2_5",
            label: "Link Pod 2 and Pod 5 (Primes: 13, 89, 233)",
            description: "Verified pattern match",
            badge: "Match Confirmed",
          },
          {
            id: "SNAP_POD_1_4",
            label: "Link Pod 1 and Pod 4",
            description: "Divergent sequence",
          },
        ],
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "Resonance locked! The coolant vapor is clearing and the banquet doors have opened.",
        expression: "victory",
        bubblePosition: "left",
      },
    ],
    onCompleteNextSceneId: "alliance_l4",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 4: THE IMPOSTER (Social Deduction)
  // ---------------------------------------------------------------------------
  alliance_l4: {
    id: "alliance_l4",
    levelNumber: 4,
    levelTitle: "LEVEL 04: THE IMPOSTER",
    sceneTitle: "The Masquerade Banquet",
    backgroundUrl: "/art/backgrounds/alliance_l4_imposter.jpg",
    characters: [
      {
        id: "warden",
        name: "THE WARDEN",
        expression: "amused",
        position: "center",
      },
    ],
    steps: [
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Take your seats at the banquet. One of you was secretly given a different code word before entering this room.",
        expression: "amused",
        bubblePosition: "center",
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Three of you hold the word 'OBSERVATION'. One holds 'SURVEILLANCE'. Identify the imposter through cross-examination.",
        expression: "speaking",
        bubblePosition: "center",
        choices: [
          {
            id: "VOTE_OPERATIVE_3",
            label: "Vote: Operative 3 is the Imposter",
            description: "They hesitated when describing the lens aperture",
            badge: "Imposter Identified",
          },
          {
            id: "VOTE_OPERATIVE_1",
            label: "Vote: Operative 1 is the Imposter",
            description: "Inconsistent timing explanation",
          },
        ],
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Correct deduction! The mask falls. You have preserved team integrity against deception.",
        expression: "speaking",
        bubblePosition: "center",
      },
    ],
    onCompleteNextSceneId: "alliance_l5",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 5: THE MEMORY VAULT (Asymmetric Clues)
  // ---------------------------------------------------------------------------
  alliance_l5: {
    id: "alliance_l5",
    levelNumber: 5,
    levelTitle: "LEVEL 05: THE MEMORY VAULT",
    sceneTitle: "The Bank Vault",
    backgroundUrl: "/art/backgrounds/alliance_l5_memory_vault.jpg",
    characters: [
      {
        id: "aarav",
        name: "AARAV",
        expression: "speaking",
        position: "left",
      },
      {
        id: "aanya",
        name: "AANYA",
        expression: "thinking",
        position: "right",
      },
    ],
    steps: [
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "My terminal shows the first half of the master vault coordinates: 'LATITUDE 19.07'.",
        expression: "speaking",
        bubblePosition: "left",
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "And mine shows the second half: 'LONGITUDE 72.87'. Combined, they target Mumbai's historical harbor coordinates!",
        expression: "thinking",
        bubblePosition: "right",
        choices: [
          {
            id: "SUBMIT_COORDINATES",
            label: "Transmit Combined Vector (19.07, 72.87)",
            description: "Disengage master mechanical lock",
            badge: "Vault Unlocked",
          },
        ],
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "The giant center gear is turning. The subterranean metro platform is right ahead.",
        expression: "victory",
        bubblePosition: "left",
      },
    ],
    onCompleteNextSceneId: "alliance_l6",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 6: THE HUMAN CHOICE (Group Survival Dilemma)
  // ---------------------------------------------------------------------------
  alliance_l6: {
    id: "alliance_l6",
    levelNumber: 6,
    levelTitle: "LEVEL 06: THE HUMAN CHOICE",
    sceneTitle: "The Flooded Platform",
    backgroundUrl: "/art/backgrounds/alliance_l6_human_choice.jpg",
    characters: [
      {
        id: "aarav",
        name: "AARAV",
        expression: "shocked",
        position: "left",
      },
      {
        id: "aanya",
        name: "AANYA",
        expression: "scared",
        position: "right",
      },
    ],
    steps: [
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "Water is pouring onto the tracks from a broken floodgate! There is only one small raft tied to the pillar.",
        expression: "shocked",
        bubblePosition: "left",
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "The raft holds enough buoyancy for everyone ONLY if we jettison our collected equipment crates.",
        expression: "speaking",
        bubblePosition: "right",
        choices: [
          {
            id: "CHOICE_ALL_SURVIVE",
            label: "Jettison Equipment — Everyone boards the raft together",
            description: "Equal survival, zero resource advantage",
            badge: "Consensus",
          },
          {
            id: "CHOICE_KEEP_RESOURCES",
            label: "Keep Equipment — Require half the team to swim along the cable",
            description: "High risk, maximum reward retention",
          },
        ],
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "We reached the upper ventilation tunnel together. Nobody was left behind.",
        expression: "victory",
        bubblePosition: "left",
      },
    ],
    onCompleteNextSceneId: "alliance_l7",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 7: THE BREAKING POINT (Collapsing Mine)
  // ---------------------------------------------------------------------------
  alliance_l7: {
    id: "alliance_l7",
    levelNumber: 7,
    levelTitle: "LEVEL 07: THE BREAKING POINT",
    sceneTitle: "The Collapsing Junction",
    backgroundUrl: "/art/backgrounds/alliance_l7_breaking_point.jpg",
    characters: [
      {
        id: "aarav",
        name: "AARAV",
        expression: "shocked",
        position: "left",
      },
      {
        id: "aanya",
        name: "AANYA",
        expression: "scared",
        position: "right",
      },
    ],
    steps: [
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "Timber supports are cracking! Falling dust everywhere! We need to pull the emergency pneumatic levers simultaneously!",
        expression: "shocked",
        bubblePosition: "left",
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "Operative 1 on Lever Alpha, Operative 2 on Lever Beta! Pull on the count of three!",
        expression: "speaking",
        bubblePosition: "right",
        choices: [
          {
            id: "SYNCHRONIZED_PULL",
            label: "Pull Lever Simultaneously (Count 3)",
            description: "Pneumatic blast doors seal the cave-in",
            badge: "Emergency Cleared",
          },
        ],
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "The blast doors slammed shut! The dust is settling. The rooftop bridge ladder is right above us.",
        expression: "victory",
        bubblePosition: "left",
      },
    ],
    onCompleteNextSceneId: "alliance_l8",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 8: THE FINAL BETRAYAL (Prisoner's Dilemma)
  // ---------------------------------------------------------------------------
  alliance_l8: {
    id: "alliance_l8",
    levelNumber: 8,
    levelTitle: "LEVEL 08: THE FINAL BETRAYAL",
    sceneTitle: "The Skyscraper Catwalk",
    backgroundUrl: "/art/backgrounds/alliance_l8_final_betrayal.jpg",
    characters: [
      {
        id: "warden",
        name: "THE WARDEN",
        expression: "amused",
        position: "center",
      },
    ],
    steps: [
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Look down at the storm-swept city below. In the center of this narrow bridge sits the single locked silver briefcase.",
        expression: "speaking",
        bubblePosition: "center",
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Inside is the complete declassified dossier of THE UNWRITTEN. Each of you must now submit your final private choice into your terminal.",
        expression: "amused",
        bubblePosition: "center",
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "If both COOPERATE, the knowledge is shared equally. If one BETRAYS while the other cooperates, the betrayer claims all power alone. If both BETRAY, the case drops into the abyss.",
        expression: "speaking",
        bubblePosition: "center",
        choices: [
          {
            id: "DECISION_COOPERATE",
            label: "PRIVATE VOTE: COOPERATE",
            description: "Honor the alliance and share the discovery",
            badge: "Cooperation",
          },
          {
            id: "DECISION_BETRAY",
            label: "PRIVATE VOTE: BETRAY",
            description: "Claim sole credit and exclusive ownership of the archive",
            badge: "Betrayal",
          },
        ],
      },
      {
        speakerId: "narrator",
        speakerName: "OBSERVER",
        text: "The server resolves the simultaneous votes. The outcome of your alliance is etched into the permanent historical record.",
        bubblePosition: "center",
      },
    ],
    onCompleteNextSceneId: "finish",
  },
};

export const ALLIANCE_CAMPAIGN_LEVELS = Object.values(ALLIANCE_CAMPAIGN_SCENES);

export interface AllianceEnding {
  id: string;
  title: string;
  verdict: "all_cooperated" | "betrayal_occurred" | "all_betrayed";
  description: string;
}

export const ALLIANCE_ENDINGS: AllianceEnding[] = [
  {
    id: "alliance_end_true_alliance",
    title: "Ending A: The Unbroken Alliance",
    verdict: "all_cooperated",
    description:
      "Every operative chose mutual preservation. The vault unlocks together in total collective victory.",
  },
  {
    id: "alliance_end_the_betrayal",
    title: "Ending B: The Lone Defector",
    verdict: "betrayal_occurred",
    description:
      "A defector seized the singular escape capsule. Trust was weaponized for solitary triumph.",
  },
  {
    id: "alliance_end_total_extinction",
    title: "Ending C: Mutual Ruin",
    verdict: "all_betrayed",
    description:
      "Every operative voted betrayal. The quarantine chamber seals permanently from the outside.",
  },
];

export function resolveAllianceEnding(
  votes: Array<{
    sessionToken: string;
    playerName: string;
    vote: "cooperate" | "betray";
  }>
): AllianceEnding {
  const betrayers = votes.filter((v) => v.vote === "betray");
  if (betrayers.length === 0) {
    return ALLIANCE_ENDINGS[0];
  }
  if (betrayers.length === votes.length) {
    return ALLIANCE_ENDINGS[2];
  }
  return ALLIANCE_ENDINGS[1];
}
