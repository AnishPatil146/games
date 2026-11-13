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

export const WARDEN_INTRO_CUES: TimelineCue[] = [
  {
    id: "intro_01",
    startTime: 0.0,
    endTime: 5.0,
    poseId: "warden_01_neutral_standing",
    poseImage: "/art/characters/launch/story_frames/scene1_neutral.jpg",
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
    poseId: "warden_03_welcoming_gesture",
    poseImage: "/art/characters/launch/story_frames/scene2_welcome.jpg",
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
    poseId: "warden_02_walking_forward",
    poseImage: "/art/characters/launch/story_frames/scene3_walking.jpg",
    speaker: "THE WARDEN",
    subtitle: "...but you, young explorer, have finally unclosed them.",
    cameraScale: 1.06,
    environment: "gate_opening",
    lightingColor: "rgba(220, 38, 38, 0.35)",
    eventTrigger: "footstep",
  },
  {
    id: "intro_04",
    startTime: 13.5,
    endTime: 17.5,
    poseId: "warden_04_three_quarter_hand_in_pocket",
    poseImage: "/art/characters/launch/story_frames/scene5_pocket.jpg",
    speaker: "THE WARDEN",
    subtitle: "The wait... the silence... the mystery... all lies in there beyond the door.",
    cameraScale: 1.05,
    environment: "gate_opening",
    lightingColor: "rgba(180, 20, 20, 0.45)",
    eventTrigger: "rumble",
  },
  {
    id: "intro_05",
    startTime: 17.5,
    endTime: 25.0,
    poseId: "warden_05_guarded_standing",
    poseImage: "/art/characters/launch/story_frames/scene4_guarded.jpg",
    speaker: "THE WARDEN",
    subtitle: "The doors are open. THE UNWRITTEN has finally begun! The experience is yours to discover.",
    cameraScale: 1.08,
    environment: "gate_opening",
    lightingColor: "rgba(239, 68, 68, 0.65)",
    eventTrigger: "impact",
  },
  {
    id: "intro_06",
    startTime: 25.0,
    endTime: 31.55,
    poseId: "warden_06_kneeling_pose",
    poseImage: "/art/characters/launch/story_frames/scene5_kneel.jpg",
    speaker: "THE WARDEN",
    subtitle: "Explore the unknown. Experience the game for yourself. Welcome to THE UNWRITTEN.",
    cameraScale: 1.03,
    environment: "gate_dark",
    lightingColor: "rgba(200, 178, 142, 0.3)",
    eventTrigger: "outro_slate",
  },
];

export const WARDEN_OUTRO_CUES: TimelineCue[] = [
  {
    id: "outro_01",
    startTime: 0.0,
    endTime: 4.5,
    poseId: "warden_03_welcoming_gesture",
    poseImage: "/art/characters/launch/story_frames/scene2_welcome.jpg",
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
    poseId: "warden_04_three_quarter_hand_in_pocket",
    poseImage: "/art/characters/launch/story_frames/scene5_pocket.jpg",
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
    poseId: "warden_05_guarded_standing",
    poseImage: "/art/characters/launch/story_frames/scene4_guarded.jpg",
    speaker: "THE WARDEN",
    subtitle: "You're the one in centuries to finally complete the Dungeon. Congratulations!",
    cameraScale: 1.07,
    environment: "gate_opening",
    lightingColor: "rgba(220, 38, 38, 0.5)",
    eventTrigger: "shimmer",
  },
  {
    id: "outro_04",
    startTime: 13.5,
    endTime: 19.52,
    poseId: "warden_06_kneeling_pose",
    poseImage: "/art/characters/launch/story_frames/scene5_kneel.jpg",
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
    id: "warden_01_neutral_standing",
    name: "01 · Neutral Standing",
    title: "The Gatekeeper's Vigil",
    role: "Opening Reveal & Distant Silhouette",
    description: "Full-body neutral standing stance, hands resting naturally at sides, leather boots grounded on reflective cobblestone.",
    image: "/the_unwritten_warden_pose_pack/warden_01_neutral_standing.png",
    quote: "“Hello everyone, I am The Warden of the Dungeon.”",
    audioTime: 0.0,
    mode: "intro",
  },
  {
    id: "warden_02_walking_forward",
    name: "02 · Walking Forward",
    title: "The Unsealed Stride",
    role: "Approaching Stride & Announcement",
    description: "Dynamic walking stride forward, trench coat flaring, boots advancing firmly toward the camera.",
    image: "/the_unwritten_warden_pose_pack/warden_02_walking_forward.png",
    quote: "“...but you, young explorer, have finally unclosed them.”",
    audioTime: 9.0,
    mode: "intro",
  },
  {
    id: "warden_03_welcoming_gesture",
    name: "03 · Welcoming Gesture",
    title: "The Ancient Invitation",
    role: "Personal Introduction & Emergence",
    description: "Welcoming gesture, left gloved hand raised invitingly, porcelain mask tilted directly toward the explorer.",
    image: "/the_unwritten_warden_pose_pack/warden_03_welcoming_gesture.png",
    quote: "“Hello there, traveler. You look cold and dusty...”",
    audioTime: 0.0,
    mode: "outro",
  },
  {
    id: "warden_04_three_quarter_hand_in_pocket",
    name: "04 · Three-Quarter Pocket",
    title: "The Philosopher's Silence",
    role: "Contemplative Monologue",
    description: "Three-quarter stance, left hand tucked in coat pocket, confident and enigmatic gothic composure.",
    image: "/the_unwritten_warden_pose_pack/warden_04_three_quarter_hand_in_pocket.png",
    quote: "“Looks like you finally made it out of the Dungeon.”",
    audioTime: 4.5,
    mode: "outro",
  },
  {
    id: "warden_05_guarded_standing",
    name: "05 · Guarded Standing",
    title: "The Crimson Threshold",
    role: "Official Launch & Climax Reveal",
    description: "Guarded posture framed by an intense crimson portal rim light across the left shoulder.",
    image: "/the_unwritten_warden_pose_pack/warden_05_guarded_standing.png",
    quote: "“THE UNWRITTEN has finally begun! The experience is yours to discover.”",
    audioTime: 17.5,
    mode: "intro",
  },
  {
    id: "warden_06_kneeling_pose",
    name: "06 · Kneeling Climax",
    title: "The Fallen Truth",
    role: "Low Perspective Dramatic Climax",
    description: "Kneeling pose, gloved hand resting upon the ancient stone floor, heavy coat draped across cobblestones.",
    image: "/the_unwritten_warden_pose_pack/warden_06_kneeling_pose.png",
    quote: "“Tell me about the Dungeon... honest words would be appreciated.”",
    audioTime: 13.5,
    mode: "outro",
  },
];

