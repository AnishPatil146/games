export type CharacterId =
  | "aarav"
  | "aanya"
  | "warden"
  | "vesper"
  | "halden"
  | "mira"
  | "narrator"
  | "system";

export type CharacterExpression =
  | "neutral"
  | "speaking"
  | "thinking"
  | "happy"
  | "smiling"
  | "sad"
  | "angry"
  | "scared"
  | "shocked"
  | "victory"
  | "amused"
  | "nervous"
  | "defensive"
  | "pleading"
  | "grateful";

export type StagePosition = "far-left" | "left" | "center" | "right" | "far-right";

export interface StoryboardCharacter {
  id: CharacterId;
  name: string;
  expression: CharacterExpression;
  position: StagePosition;
  flipped?: boolean;
  active?: boolean;
  customScale?: number;
}

export interface StoryboardChoice {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  targetStep?: number;
  targetSceneId?: string;
  statImpact?: Record<string, number | string>;
}

export type PuzzleType =
  | "keypad_code"
  | "three_doors"
  | "memory_recall"
  | "interrogation_deduction"
  | "mirror_maze"
  | "moral_dilemma"
  | "emergency_dispatch"
  | "memory_vault_cipher"
  | "sudoku_matrix"
  | "chess_tactics"
  | "multiplayer_sudoku"
  | "multiplayer_chess"
  | "multiplayer_clone_snap"
  | "multiplayer_imposter"
  | "multiplayer_asymmetric_vault"
  | "multiplayer_group_survival"
  | "multiplayer_mine_tunnel"
  | "multiplayer_prisoner_dilemma";

export interface ContextualPuzzleConfig {
  id: string;
  type: PuzzleType;
  title: string;
  instructions: string;
  timeLimitSeconds?: number;
  payload: Record<string, unknown>;
  solution: Record<string, unknown>;
  hint?: string;
}

export interface StoryboardDialogueStep {
  speakerId: CharacterId;
  speakerName: string;
  text: string;
  expression?: CharacterExpression;
  bubblePosition?: "left" | "center" | "right";
  cameraEffect?: "shake" | "flash" | "zoom" | "dim";
  soundEffect?: string;
  choices?: StoryboardChoice[];
  puzzleTrigger?: ContextualPuzzleConfig;
  autoAdvanceMs?: number;
}

export interface StoryboardScene {
  id: string;
  levelNumber: number;
  levelTitle: string;
  sceneTitle: string;
  backgroundUrl: string;
  moodColor?: string;
  characters: StoryboardCharacter[];
  steps: StoryboardDialogueStep[];
  onCompleteNextSceneId?: string;
}
