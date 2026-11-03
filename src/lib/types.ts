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
  session_token?: string;
  character_presentation: CharacterPresentation;
  started_at: string;
  completed_at?: string | null;
  current_chapter: number;
  status: SessionStatus;
  result_archetype?: string | null;
  campaign_source?: string | null;
  campaign_medium?: string | null;
  campaign_name?: string | null;
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

export interface DeletionRequest {
  id: string;
  identifier: string;
  reason?: string | null;
  status: "pending" | "resolved";
  created_at: string;
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
  characterPresentation: CharacterPresentation;
  archetype: Archetype;
  runnerUpArchetype: Archetype;
  subtitle: string;
  interpretation: string;
  confidence: ConfidenceLevel;
  confidenceRationale: string;
  // Tentative inferred tendencies (clearly framed as game-derived)
  observedTendencies: string[];
  supportingEvidence: string[];
  interestingDecisions: {
    chapter: number;
    chapterTitle: string;
    summary: string;
  }[];
  // Strictly factual measured results (null when unmeasured, never fabricated)
  factualResults: {
    chaptersCompleted: number;
    puzzlesAttempted: number;
    puzzlesSolved: number;
    hintsUsed: number;
    cluesInspectedCount: number;
    avgResponseTimeSeconds: number | null;
    accuracyPct: number | null;
  };
  // Explicitly chosen preferences (kept separate from inferences)
  explicitPreferences: {
    worldEnvironment: string | null;
    worldObject: string | null;
    worldActivity: string | null;
    canvasObjects: string[];
    canvasPalette: string | null;
    canvasArrangement: string | null;
  };
  closingMessage: string;
  completedAt: string;
}

export interface ChapterAnalyticsRow {
  chapter: number;
  title: string;
  sessionsStarted: number;
  sessionsCompleted: number;
  completionRatePct: number | null;
  dropOffPct: number | null;
  avgDurationSeconds: number | null;
}

export interface ChoiceDistributionRow {
  chapter: number;
  chapterTitle: string;
  choiceKey: string;
  choiceLabel: string;
  count: number;
  sharePct: number;
}

export interface PuzzleAnalyticsRow {
  chapter: number;
  puzzleName: string;
  sessionsAttempted: number;
  totalAttempts: number;
  sessionsSolved: number;
  completionRatePct: number | null;
  accuracyRatePct: number | null;
  hintsUsedTotal: number;
  avgSolveSeconds: number | null;
}

export interface CampaignAttributionRow {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  completed: number;
}

export interface AdminMetrics {
  storageBackend: "supabase" | "local_fallback";
  schemaReady: boolean;
  schemaNotice?: string;
  totalVisits: number;
  uniqueSessions: number;
  registeredPlayers: number;
  anonymousPlayers: number;
  gamesStarted: number;
  gamesCompleted: number;
  gamesInProgress: number;
  completionRatePct: number | null;
  avgCompletionDurationSeconds: number | null;
  chapterAnalytics: ChapterAnalyticsRow[];
  choiceDistributions: ChoiceDistributionRow[];
  puzzleAnalytics: PuzzleAnalyticsRow[];
  campaignAttribution: CampaignAttributionRow[];
  archetypeDistribution: { archetype: string; count: number }[];
}

export interface AdminPlayerListItem {
  id: string;
  display_name: string;
  instagram_username: string | null;
  profile_consent: boolean;
  character_presentation: CharacterPresentation;
  created_at: string;
  sessionCount: number;
  latestSessionId: string | null;
  latestStatus: SessionStatus | null;
  latestChapter: number | null;
  latestArchetype: string | null;
}
