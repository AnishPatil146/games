import { StoryboardScene } from "@/lib/storyboard/types";

export const SOLO_CAMPAIGN_SCENES: Record<string, StoryboardScene> = {
  // ---------------------------------------------------------------------------
  // PROLOGUE / THRESHOLD
  // ---------------------------------------------------------------------------
  solo_prologue: {
    id: "solo_prologue",
    levelNumber: 0,
    levelTitle: "PROLOGUE: THE THRESHOLD",
    sceneTitle: "Fog Over the Institute",
    backgroundUrl: "/art/backgrounds/solo_prologue.jpg",
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
        text: "Midnight in the outer courtyard. Cold mist clings to wet cobblestones outside the brutalist facade of the Institute.",
        bubblePosition: "center",
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Welcome, seeker. You entered through an ordinary link, but you have stepped across the boundary of an unwritten architecture.",
        expression: "speaking",
        bubblePosition: "center",
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Every choice you make inside these eight chambers will be recorded. We do not test your trivia. We observe your instinct under pressure.",
        expression: "amused",
        bubblePosition: "center",
        choices: [
          {
            id: "READY_SOLO",
            label: "I am ready. Unlock the threshold.",
            description: "Begin Level 1: The Wake Up",
            statImpact: { resolve: 1 },
          },
          {
            id: "CAUTIOUS_SOLO",
            label: "Who built this place, and why was I summoned?",
            description: "Demand context before stepping inside",
            statImpact: { skepticism: 1 },
          },
        ],
      },
    ],
    onCompleteNextSceneId: "solo_l1",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 1: THE WAKE UP
  // ---------------------------------------------------------------------------
  solo_l1: {
    id: "solo_l1",
    levelNumber: 1,
    levelTitle: "LEVEL 01: THE WAKE UP",
    sceneTitle: "The Observation Cell",
    backgroundUrl: "/art/backgrounds/solo_l1_wakeup.jpg",
    characters: [
      {
        id: "aarav",
        name: "AARAV",
        expression: "neutral",
        position: "left",
      },
      {
        id: "aanya",
        name: "AANYA",
        expression: "neutral",
        position: "right",
      },
    ],
    steps: [
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "My head is pounding... Where are we? The walls are solid steel reinforced concrete.",
        expression: "thinking",
        bubblePosition: "left",
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "Look at the heavy door on the right. There's an illuminated 4-digit brass keypad. And a note pinned behind the crooked frame on the wall.",
        expression: "speaking",
        bubblePosition: "right",
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "The note reads: 'Dawn begins when the station clock halted at zero-seven-four-five.'",
        expression: "speaking",
        bubblePosition: "left",
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "That must be the override code. We have to enter it into the keypad to open the corridor.",
        expression: "thinking",
        bubblePosition: "right",
        puzzleTrigger: {
          id: "puzzle_l1_keypad",
          type: "keypad_code",
          title: "Observation Cell Access Override",
          instructions:
            "Examine the clue from the wall clock and note: 'zero-seven-four-five'. Enter the 4-digit code on the brass keypad to disengage the magnetic deadbolt.",
          payload: {},
          solution: { code: "0745" },
        },
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "It worked! The bolt released. Let's move before whoever locked us in returns.",
        expression: "victory",
        bubblePosition: "left",
      },
    ],
    onCompleteNextSceneId: "solo_l2",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 2: THREE DOORS
  // ---------------------------------------------------------------------------
  solo_l2: {
    id: "solo_l2",
    levelNumber: 2,
    levelTitle: "LEVEL 02: THREE DOORS",
    sceneTitle: "The Chamber of Paradox",
    backgroundUrl: "/art/backgrounds/solo_l2_three_doors.jpg",
    characters: [
      {
        id: "aarav",
        name: "AARAV",
        expression: "neutral",
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
        text: "Three towering doors. Oak on the left, chalk-white in the center, and black wrought iron on the right.",
        expression: "neutral",
        bubblePosition: "left",
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "There are inscriptions carved on each stone plaque. One door speaks the absolute truth, one lies, and one is indeterminate.",
        expression: "thinking",
        bubblePosition: "right",
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "The oak door claims the iron door is truthful. But the iron door claims the center door leads to salvation. Analyze the contradiction.",
        expression: "speaking",
        bubblePosition: "right",
        puzzleTrigger: {
          id: "puzzle_l2_doors",
          type: "three_doors",
          title: "The Logic of Three Doors",
          instructions:
            "Evaluate the statements: If Oak says Iron is true, but Iron points to Chalk, only the Door of Chalk resolves the mutual paradox without contradiction.",
          payload: {},
          solution: { correctDoor: "WHITE" },
        },
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "The white door opened into an ancient Victorian library hallway. That was close.",
        expression: "speaking",
        bubblePosition: "left",
      },
    ],
    onCompleteNextSceneId: "solo_l3",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 3: THE FORGOTTEN ROOM
  // ---------------------------------------------------------------------------
  solo_l3: {
    id: "solo_l3",
    levelNumber: 3,
    levelTitle: "LEVEL 03: THE FORGOTTEN ROOM",
    sceneTitle: "The Memory Study",
    backgroundUrl: "/art/backgrounds/solo_l3_forgotten_room.jpg",
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
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Welcome to the study of the Institute's founder. Human memory is fragile; you remember what you expect to see, not what is truly present.",
        expression: "speaking",
        bubblePosition: "center",
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Inspect the table and mantelpiece. Several historical artifacts were catalogued here moments ago. One has just vanished.",
        expression: "amused",
        bubblePosition: "center",
        puzzleTrigger: {
          id: "puzzle_l3_memory",
          type: "memory_recall",
          title: "The Missing Artifact",
          instructions:
            "Recall the initial chamber inventory. Which artifact was removed from the display setting?",
          payload: {},
          solution: { missingPropId: "prop_clock" },
        },
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "Perceptive. The brass mantel clock measured moments that never occurred. The study corridor is unlocked.",
        expression: "speaking",
        bubblePosition: "center",
      },
    ],
    onCompleteNextSceneId: "solo_l4",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 4: THE INTERROGATION
  // ---------------------------------------------------------------------------
  solo_l4: {
    id: "solo_l4",
    levelNumber: 4,
    levelTitle: "LEVEL 04: THE INTERROGATION",
    sceneTitle: "The Concrete Annex",
    backgroundUrl: "/art/backgrounds/solo_l4_interrogation.jpg",
    characters: [
      {
        id: "aarav",
        name: "AARAV",
        expression: "neutral",
        position: "left",
      },
      {
        id: "halden",
        name: "MR. HALDEN",
        expression: "nervous",
        position: "right",
      },
    ],
    steps: [
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "Mr. Halden. You were the chief custodian when this sector went dark. Tell us what happened.",
        expression: "speaking",
        bubblePosition: "left",
      },
      {
        speakerId: "halden",
        speakerName: "MR. HALDEN",
        text: "I didn't touch anything! I swear! I locked the registry ledger at midnight and went straight to the barracks!",
        expression: "nervous",
        bubblePosition: "right",
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "Your statements contain a critical flaw. Spot the contradiction in his testimony.",
        expression: "thinking",
        bubblePosition: "left",
        puzzleTrigger: {
          id: "puzzle_l4_interrogation",
          type: "interrogation_deduction",
          title: "Contradiction Analysis",
          instructions:
            "Select the contradictory statement that exposes Mr. Halden's alibi.",
          payload: {},
          solution: { contradictionId: "TRAIN_ARRIVAL" },
        },
      },
      {
        speakerId: "halden",
        speakerName: "MR. HALDEN",
        text: "Fine! I took the keycard to the mirror rotunda! Take it... just don't let the Warden find me here.",
        expression: "defensive",
        bubblePosition: "right",
      },
    ],
    onCompleteNextSceneId: "solo_l5",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 5: THE MIRROR MAZE
  // ---------------------------------------------------------------------------
  solo_l5: {
    id: "solo_l5",
    levelNumber: 5,
    levelTitle: "LEVEL 05: THE MIRROR MAZE",
    sceneTitle: "The Art-Deco Hall of Reflections",
    backgroundUrl: "/art/backgrounds/solo_l5_mirror_maze.jpg",
    characters: [
      {
        id: "aanya",
        name: "AANYA",
        expression: "speaking",
        position: "center",
      },
    ],
    steps: [
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "Every wall here is a gilded full-length mirror. Infinite reflections in all directions. If we guess blindly, we will walk into glass.",
        expression: "thinking",
        bubblePosition: "center",
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "Follow the true reflection angles: North, then East, then North, then West to reach the courtyard exit.",
        expression: "speaking",
        bubblePosition: "center",
        puzzleTrigger: {
          id: "puzzle_l5_maze",
          type: "mirror_maze",
          title: "Spatial Path Navigation",
          instructions:
            "Step through the mirror corridor following the true geometric sequence: NORTH → EAST → NORTH → WEST.",
          payload: {},
          solution: { path: ["NORTH", "EAST", "NORTH", "WEST"] },
        },
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "The glass gave way to an open doorway! Fresh night air... we're out of the labyrinth.",
        expression: "victory",
        bubblePosition: "center",
      },
    ],
    onCompleteNextSceneId: "solo_l6",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 6: THE LAST HUMAN
  // ---------------------------------------------------------------------------
  solo_l6: {
    id: "solo_l6",
    levelNumber: 6,
    levelTitle: "LEVEL 06: THE LAST HUMAN",
    sceneTitle: "The Flooded Ruins at Dusk",
    backgroundUrl: "/art/backgrounds/solo_l6_last_human.jpg",
    characters: [
      {
        id: "aarav",
        name: "AARAV",
        expression: "neutral",
        position: "left",
      },
      {
        id: "mira",
        name: "MIRA",
        expression: "pleading",
        position: "right",
      },
    ],
    steps: [
      {
        speakerId: "mira",
        speakerName: "MIRA",
        text: "Please... you're the first living souls to cross this perimeter in days. My arm is infected, and the water is rising.",
        expression: "pleading",
        bubblePosition: "right",
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "We have one sealed vial of antibiotics in our kit. If we surrender it, we will have no medical reserves for the final vault.",
        expression: "thinking",
        bubblePosition: "left",
      },
      {
        speakerId: "narrator",
        speakerName: "OBSERVER",
        text: "A decisive ethical fork. How you treat an injured stranger dictates the ethical weight of your personal report.",
        bubblePosition: "center",
        puzzleTrigger: {
          id: "puzzle_l6_dilemma",
          type: "moral_dilemma",
          title: "Resource Allocation Decision",
          instructions:
            "Choose whether to surrender the emergency antibiotics to Mira or conserve them for your own final trials.",
          payload: {},
          solution: {},
        },
      },
      {
        speakerId: "mira",
        speakerName: "MIRA",
        text: "Whatever choice you made, take this: a silver transit keycard. The control facility is right down that tunnel.",
        expression: "grateful",
        bubblePosition: "right",
      },
    ],
    onCompleteNextSceneId: "solo_l7",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 7: THE IMPOSSIBLE SECOND
  // ---------------------------------------------------------------------------
  solo_l7: {
    id: "solo_l7",
    levelNumber: 7,
    levelTitle: "LEVEL 07: THE IMPOSSIBLE SECOND",
    sceneTitle: "Emergency Dispatch Room",
    backgroundUrl: "/art/backgrounds/solo_l7_impossible_second.jpg",
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
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "Red alert beacon! Three separate catastrophic overloads are triggering simultaneously!",
        expression: "shocked",
        bubblePosition: "right",
      },
      {
        speakerId: "aarav",
        speakerName: "AARAV",
        text: "Auxiliary power can only sustain ONE critical sector! We have only fifteen seconds to decide!",
        expression: "shocked",
        bubblePosition: "left",
        puzzleTrigger: {
          id: "puzzle_l7_dispatch",
          type: "emergency_dispatch",
          title: "Emergency Power Routing",
          instructions:
            "Select which vital sector to save before the 15-second timer expires: Sector 1 (Cryo-Preservation), Sector 2 (Air Filtration), or Sector 3 (Archives).",
          timeLimitSeconds: 15,
          payload: {},
          solution: {},
        },
      },
      {
        speakerId: "aanya",
        speakerName: "AANYA",
        text: "Power rerouted. Secondary fires suppressed. The master archive elevator has unlocked below.",
        expression: "speaking",
        bubblePosition: "right",
      },
    ],
    onCompleteNextSceneId: "solo_l8",
  },

  // ---------------------------------------------------------------------------
  // LEVEL 8: THE FINAL TRUTH
  // ---------------------------------------------------------------------------
  solo_l8: {
    id: "solo_l8",
    levelNumber: 8,
    levelTitle: "LEVEL 08: THE FINAL TRUTH",
    sceneTitle: "The Great Memory Vault",
    backgroundUrl: "/art/backgrounds/solo_l8_final_truth.jpg",
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
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "You have traversed the eight chambers. Here in the Great Memory Vault, every choice you made is transcribed in the illuminated codex.",
        expression: "speaking",
        bubblePosition: "center",
      },
      {
        speakerId: "warden",
        speakerName: "THE WARDEN",
        text: "You proved whether you value ruthless logic, preservation of life, instinctive adaptation, or methodical calculation.",
        expression: "amused",
        bubblePosition: "center",
        choices: [
          {
            id: "ENDING_SURVIVOR",
            label: "Open the Codex as 'The Survivor'",
            description: "Endurance through pragmatic preservation",
            badge: "Ending I",
          },
          {
            id: "ENDING_MASTERMIND",
            label: "Open the Codex as 'The Mastermind'",
            description: "Deduction and unyielding analytical precision",
            badge: "Ending II",
          },
          {
            id: "ENDING_HUMANIST",
            label: "Open the Codex as 'The Humanist'",
            description: "Empathy and sacrifice for others above all",
            badge: "Ending III",
          },
          {
            id: "ENDING_UNPREDICTABLE",
            label: "Defy the Codex as 'The Unpredictable'",
            description: "Refusal to conform to predetermined outcomes",
            badge: "Ending IV",
          },
        ],
      },
      {
        speakerId: "narrator",
        speakerName: "OBSERVER",
        text: "The codex seals your signature. Your personal gameplay monograph and choice map have been permanently transcribed.",
        bubblePosition: "center",
      },
    ],
    onCompleteNextSceneId: "finish",
  },
};

export const SOLO_CAMPAIGN_LEVELS = Object.values(SOLO_CAMPAIGN_SCENES);

export const SOLO_ENDINGS = [
  {
    id: "ENDING_SURVIVOR",
    title: "Ending I: The Survivor",
    description: "Endurance through pragmatic preservation and cold calculated realism.",
  },
  {
    id: "ENDING_MASTERMIND",
    title: "Ending II: The Mastermind",
    description: "Deduction and unyielding analytical precision that dismantled every lock.",
  },
  {
    id: "ENDING_HUMANIST",
    title: "Ending III: The Humanist",
    description: "Empathy and sacrifice for others above personal self-preservation.",
  },
  {
    id: "ENDING_UNPREDICTABLE",
    title: "Ending IV: The Unpredictable",
    description: "Refusal to conform to predetermined outcomes, rewriting the experiment itself.",
  },
];
