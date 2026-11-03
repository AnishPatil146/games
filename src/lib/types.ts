export type CharacterPresentation = "HIM" | "HER" | "UNSPECIFIED";

export type SessionStatus = "in_progress" | "completed" | "abandoned";

export interface Player {
  id: string;
  display_name: string;
  instagram_username?: string | null;
  profile_consent: boolean;
  character_presentation: CharacterPresentation;
  created_at: string;
}

export interface GameSession {
  id: string;
  player_id?: string | null;
  session_token: string;
  character_presentation: CharacterPresentation;
  started_at: string;
  completed_at?: string | null;
  current_chapter: number;
  status: SessionStatus;
  result_archetype?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  created_at: string;
  player?: Player | null;
}

export type EventType =
  | "landing_view"
  | "game_started"
  | "profile_submitted"
  | "chapter_started"
  | "choice_selected"
  | "clue_inspected"
  | "puzzle_attempted"
  | "hint_used"
  | "chapter_completed"
  | "game_completed";

export interface GameplayEvent {
  id?: string;
  session_id: string;
  chapter: number;
  event_type: EventType;
  event_data: Record<string, unknown>;
  created_at?: string;
}

export interface PlayerPreference {
  id?: string;
  session_id: string;
  preference_category: string;
  selected_value: string;
  created_at?: string;
}

export type Archetype =
  | "The Observer"
  | "The Strategist"
  | "The Creative Soul"
  | "The Explorer"
  | "The Empath"
  | "The Curious Mind"
  | "The Independent Thinker";

export type ConfidenceLevel = "Low" | "Moderate" | "Strong";

export interface GameplayReport {
  sessionId: string;
  playerName: string;
  archetype: Archetype;
  subtitle: string;
  interpretation: string;
  confidence: ConfidenceLevel;
  observedStrengths: string[];
  gameplayPatterns: string[];
  puzzlePerformance: {
    totalPuzzles: number;
    solvedCorrectly: number;
    hintsUsed: number;
    avgResponseTimeSeconds: number;
    accuracyRate: string;
  };
  supportingEvidence: string[];
  exploredEnvironments: string[];
  creativeComposition?: {
    selectedObjects: string[];
    mood: string;
  };
  closingMessage: string;
  completedAt: string;
}

export interface ChapterInfo {
  number: number;
  title: string;
  subtitle: string;
  setting: string;
  estimatedMinutes: string;
}

export interface AdminMetrics {
  totalVisits: number;
  uniqueSessions: number;
  registeredPlayers: number;
  anonymousPlayers: number;
  gamesCompleted: number;
  gamesInProgress: number;
  completionRate: number;
  chapterDropOff: {
    chapter: number;
    title: string;
    sessionsReached: number;
    dropOffPct: number;
  }[];
  topChoices: {
    chapter: number;
    action: string;
    count: number;
  }[];
  puzzleStats: {
    chapter: number;
    puzzleName: string;
    totalAttempts: number;
    successRate: number;
    hintsUsedTotal: number;
  }[];
  campaignAttribution: {
    source: string;
    medium: string;
    campaign: string;
    count: number;
  }[];
}

