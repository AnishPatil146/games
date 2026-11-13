// ============================================================================
// THE UNWRITTEN — CINEMATIC TIMELINE & AUDIO DUCKING ENGINE
// Precision Event Sequencing, Procedural Acoustics & Audio Ducking
// ============================================================================

export type CinematicMode = "intro" | "outro";

export interface TimelineCue {
  id: string;
  startTime: number;
  endTime: number;
  poseId: string;
  poseImage: string;
  speaker: string;
  subtitle: string;
  cameraScale: number;
  environment: "gate_wide" | "gate_opening" | "gate_dark";
  lightingColor: string;
  eventTrigger?: "rumble" | "impact" | "shimmer" | "footstep" | "outro_slate";
}

// ----------------------------------------------------------------------------
// 1. WARDEN INTRO CUES (31.55s narration)
// Transparent RGBA Character Poses from reference-matched pack
// ----------------------------------------------------------------------------
export const WARDEN_INTRO_CUES: TimelineCue[] = [
  {
    id: "intro_01",
    startTime: 0.0,
    endTime: 5.0,
    poseId: "warden_01_standing",
    poseImage: "/art/characters/warden/warden_01_standing.png",
    speaker: "THE WARDEN",
    subtitle: "Hello everyone, I am The Warden of the Dungeon.",
    cameraScale: 1.02,
    environment: "gate_wide",
    lightingColor: "rgba(200, 178, 142, 0.25)",
  },
  {
    id: "intro_02",
    startTime: 5.0,
    endTime: 9.0,
    poseId: "warden_04_arms_crossed",
    poseImage: "/art/characters/warden/warden_04_arms_crossed.png",
    speaker: "THE WARDEN",
    subtitle: "These doors have remained sealed for centuries...",
    cameraScale: 1.04,
    environment: "gate_wide",
    lightingColor: "rgba(200, 178, 142, 0.35)",
  },
  {
    id: "intro_03",
    startTime: 9.0,
    endTime: 13.5,
    poseId: "warden_02_inviting_hand",
    poseImage: "/art/characters/warden/warden_02_inviting_hand.png",
    speaker: "THE WARDEN",
    subtitle: "...but you, young explorer, have finally unclosed them.",
    cameraScale: 1.06,
    environment: "gate_opening",
    lightingColor: "rgba(220, 38, 38, 0.4)",
    eventTrigger: "footstep",
  },
  {
    id: "intro_04",
    startTime: 13.5,
    endTime: 17.5,
    poseId: "warden_08_contemplative_pose",
    poseImage: "/art/characters/warden/warden_08_contemplative_pose.png",
    speaker: "THE WARDEN",
    subtitle: "The wait... the silence... the mystery... all lies in there beyond the door.",
    cameraScale: 1.05,
    environment: "gate_opening",
    lightingColor: "rgba(180, 20, 20, 0.5)",
    eventTrigger: "rumble",
  },
  {
    id: "intro_05",
    startTime: 17.5,
    endTime: 25.0,
    poseId: "warden_03_open_arms_reveal",
    poseImage: "/art/characters/warden/warden_03_open_arms_reveal.png",
    speaker: "THE WARDEN",
    subtitle: "The doors are open. THE UNWRITTEN has finally begun! The experience is yours to discover.",
    cameraScale: 1.08,
    environment: "gate_opening",
    lightingColor: "rgba(239, 68, 68, 0.7)",
    eventTrigger: "impact",
  },
  {
    id: "intro_06",
    startTime: 25.0,
    endTime: 31.55,
    poseId: "warden_10_presenting_artifact",
    poseImage: "/art/characters/warden/warden_10_presenting_artifact.png",
    speaker: "THE WARDEN",
    subtitle: "Explore the unknown. Experience the game for yourself. Welcome to THE UNWRITTEN.",
    cameraScale: 1.03,
    environment: "gate_dark",
    lightingColor: "rgba(200, 178, 142, 0.3)",
    eventTrigger: "outro_slate",
  },
];

// ----------------------------------------------------------------------------
// 2. WARDEN OUTRO CUES (19.52s narration)
// Transparent RGBA Character Poses from reference-matched pack
// ----------------------------------------------------------------------------
export const WARDEN_OUTRO_CUES: TimelineCue[] = [
  {
    id: "outro_01",
    startTime: 0.0,
    endTime: 4.5,
    poseId: "warden_11_close_reaching_pose",
    poseImage: "/art/characters/warden/warden_11_close_reaching_pose.png",
    speaker: "THE WARDEN",
    subtitle: "Hello there, traveler. You look cold and dusty...",
    cameraScale: 1.02,
    environment: "gate_dark",
    lightingColor: "rgba(200, 178, 142, 0.3)",
  },
  {
    id: "outro_02",
    startTime: 4.5,
    endTime: 9.0,
    poseId: "warden_06_side_turn",
    poseImage: "/art/characters/warden/warden_06_side_turn.png",
    speaker: "THE WARDEN",
    subtitle: "Looks like you finally made it out of the Dungeon.",
    cameraScale: 1.04,
    environment: "gate_dark",
    lightingColor: "rgba(200, 178, 142, 0.35)",
  },
  {
    id: "outro_03",
    startTime: 9.0,
    endTime: 13.5,
    poseId: "warden_03_open_arms_reveal",
    poseImage: "/art/characters/warden/warden_03_open_arms_reveal.png",
    speaker: "THE WARDEN",
    subtitle: "You're the one in centuries to finally complete the Dungeon. Congratulations!",
    cameraScale: 1.07,
    environment: "gate_opening",
    lightingColor: "rgba(220, 38, 38, 0.6)",
    eventTrigger: "shimmer",
  },
  {
    id: "outro_04",
    startTime: 13.5,
    endTime: 19.52,
    poseId: "warden_09_holding_book",
    poseImage: "/art/characters/warden/warden_09_holding_book.png",
    speaker: "THE WARDEN",
    subtitle: "But before you leave, tell me about the Dungeon... honest words would be appreciated.",
    cameraScale: 1.03,
    environment: "gate_dark",
    lightingColor: "rgba(200, 178, 142, 0.25)",
    eventTrigger: "outro_slate",
  },
];

export interface PoseDetail {
  id: string;
  name: string;
  title: string;
  role: string;
  description: string;
  image: string;
  quote: string;
  audioTime: number;
  mode: CinematicMode;
}

export const WARDEN_POSES_GALLERY: PoseDetail[] = [
  {
    id: "warden_01_standing",
    name: "01 · Standing",
    title: "The Gatekeeper's Vigil",
    role: "Opening Reveal & Calm Silhouette",
    description: "Upright standing stance, pale expressionless mask, silver hair, dark trench coat grounded on ancient stone.",
    image: "/art/characters/warden/warden_01_standing.png",
    quote: "“Hello everyone, I am The Warden of the Dungeon.”",
    audioTime: 0.0,
    mode: "intro",
  },
  {
    id: "warden_02_inviting_hand",
    name: "02 · Inviting Hand",
    title: "The Unsealed Stride",
    role: "Approaching Gesture & Invitation",
    description: "Inviting hand reaching toward the traveler, beckoning them toward the ancient gates.",
    image: "/art/characters/warden/warden_02_inviting_hand.png",
    quote: "“...but you, young explorer, have finally unclosed them.”",
    audioTime: 9.0,
    mode: "intro",
  },
  {
    id: "warden_03_open_arms_reveal",
    name: "03 · Open-Arms Reveal",
    title: "The Threshold Proclamation",
    role: "Grand Climax & Official Launch",
    description: "Broad open-arms gesture, coat billowing dramatically as crimson light surges from within the gate.",
    image: "/art/characters/warden/warden_03_open_arms_reveal.png",
    quote: "“The doors are open. THE UNWRITTEN has finally begun!”",
    audioTime: 17.5,
    mode: "intro",
  },
  {
    id: "warden_04_arms_crossed",
    name: "04 · Arms Crossed",
    title: "Centuries of Vigilance",
    role: "Guarded Observation",
    description: "Arms crossed against the chest, resolute stance holding the secrets of centuries.",
    image: "/art/characters/warden/warden_04_arms_crossed.png",
    quote: "“These doors have remained sealed for centuries...”",
    audioTime: 5.0,
    mode: "intro",
  },
  {
    id: "warden_05_thinking_pose",
    name: "05 · Thinking Pose",
    title: "The Pondering Sentinel",
    role: "Deliberation & Judgment",
    description: "Gloved hand brought to chin in quiet contemplation of the traveler's fate.",
    image: "/art/characters/warden/warden_05_thinking_pose.png",
    quote: "“The wait... the silence... the mystery...”",
    audioTime: 13.5,
    mode: "intro",
  },
  {
    id: "warden_06_side_turn",
    name: "06 · Side Turn",
    title: "The Emerged Traveler",
    role: "Assessment of Survivor",
    description: "Profile turn with coat flowing back, measuring the traveler who emerged alive from the dungeon.",
    image: "/art/characters/warden/warden_06_side_turn.png",
    quote: "“Looks like you finally made it out of the Dungeon.”",
    audioTime: 4.5,
    mode: "outro",
  },
  {
    id: "warden_07_seated_pose",
    name: "07 · Seated Pose",
    title: "The Gatekeeper's Rest",
    role: "Quiet Vigil After Conquest",
    description: "Dignified seated posture upon an ancient stone pedestal.",
    image: "/art/characters/warden/warden_07_seated_pose.png",
    quote: "“You're the one in centuries to finally complete the Dungeon.”",
    audioTime: 9.0,
    mode: "outro",
  },
  {
    id: "warden_08_contemplative_pose",
    name: "08 · Contemplative Pose",
    title: "The Silent Mystery",
    role: "Deep Lore Reflection",
    description: "Seated deep in contemplation, draped coat falling over the cobblestone floor.",
    image: "/art/characters/warden/warden_08_contemplative_pose.png",
    quote: "“...all lies in there beyond the door.”",
    audioTime: 13.5,
    mode: "intro",
  },
  {
    id: "warden_09_holding_book",
    name: "09 · Holding Book",
    title: "The Dungeon Chronicle",
    role: "Debrief & Player Review",
    description: "Holding the heavy leather-bound ledger of the Dungeon, preparing to record honest feedback.",
    image: "/art/characters/warden/warden_09_holding_book.png",
    quote: "“Tell me about the Dungeon... honest words would be appreciated.”",
    audioTime: 13.5,
    mode: "outro",
  },
  {
    id: "warden_10_presenting_artifact",
    name: "10 · Presenting Artifact",
    title: "The Key of the Gate",
    role: "Welcoming into Gameplay",
    description: "Offering the ceremonial key of the dungeon toward the explorer.",
    image: "/art/characters/warden/warden_10_presenting_artifact.png",
    quote: "“Explore the unknown. Welcome to THE UNWRITTEN.”",
    audioTime: 25.0,
    mode: "intro",
  },
  {
    id: "warden_11_close_reaching_pose",
    name: "11 · Close Reaching Pose",
    title: "The Outro Welcome",
    role: "Personal Closing Reception",
    description: "Stepping close with an open hand, receiving the returning explorer.",
    image: "/art/characters/warden/warden_11_close_reaching_pose.png",
    quote: "“Hello there, traveler. You look cold and dusty...”",
    audioTime: 0.0,
    mode: "outro",
  },
  {
    id: "warden_12_departing_back_view",
    name: "12 · Departing Back View",
    title: "Into the Shadows",
    role: "Final Fade & Dissolve",
    description: "Warden's back turned as they walk back toward the eternal shadows of the Gate.",
    image: "/art/characters/warden/warden_12_departing_back_view.png",
    quote: "“WHERE SILENCE SPEAKS.”",
    audioTime: 17.5,
    mode: "outro",
  },
];
