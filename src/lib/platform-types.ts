export type ExperienceMode = "senior" | "junior";

export type StreamSlug = "science" | "commerce" | "arts";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export type DifficultyPreference = "Mixed" | QuestionDifficulty;

export type OptionKey = "A" | "B" | "C" | "D";

export type PublicationStatus = "draft" | "published" | "archived";

export type ScienceAbilityKey =
  | "logical_reasoning"
  | "analytical_thinking"
  | "scientific_understanding"
  | "problem_solving";

export type CommerceAbilityKey =
  | "numerical_reasoning"
  | "financial_understanding"
  | "strategic_thinking"
  | "business_decision_making";

export type ArtsAbilityKey =
  | "critical_thinking"
  | "interpretation"
  | "communication"
  | "creative_thinking";

export type AbilityIndicatorKey =
  | ScienceAbilityKey
  | CommerceAbilityKey
  | ArtsAbilityKey;

export type DiagramKind =
  | "vector_plane"
  | "circuit_ohm"
  | "optics_refraction"
  | "demand_supply"
  | "accounting_ledger"
  | "earth_layers"
  | null;

export interface AcademicBoardConfig {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface AcademicYearConfig {
  id: string;
  boardCode: string;
  label: string;
  standard: string;
  active: boolean;
}

export interface AcademicStreamConfig {
  slug: StreamSlug;
  name: string;
  subtitle: string;
  description: string;
  accentHex: string;
  abilityIndicators: {
    key: AbilityIndicatorKey;
    label: string;
    description: string;
  }[];
  gameProfiles: {
    title: string;
    subtitle: string;
    narrative: string;
    primaryAbilities: AbilityIndicatorKey[];
  }[];
}

export interface AcademicChapterInfo {
  number: number;
  title: string;
}

export interface AcademicSubjectConfig {
  id: string;
  slug: string;
  stream: StreamSlug;
  name: string;
  code: string;
  boardCode: string;
  academicYear: string;
  standard: string;
  isElective: boolean;
  active: boolean;
  description: string;
  chapters: AcademicChapterInfo[];
}

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface QuestionBankRecord {
  id: string;
  board: string;
  academicYear: string;
  standard: string;
  stream: StreamSlug;
  subjectSlug: string;
  subjectName: string;
  chapterNumber: number;
  chapter: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionText: string;
  diagramType?: DiagramKind;
  options: QuestionOption[];
  correctKey: OptionKey;
  explanation: string;
  syllabusReference: string;
  abilityTags: AbilityIndicatorKey[];
  publicationStatus: PublicationStatus;
  reviewed: boolean;
  version: number;
  usageCount?: number;
  createdAt: string;
  reviewedAt: string | null;
}

/**
 * Snapshot stored inside each quiz_attempt_questions record so historical attempts
 * remain 100% auditable and reproducible even if a question is later edited.
 */
export interface AttemptQuestionSnapshot {
  slotNumber: number; // 1..10
  questionId: string;
  questionVersion: number;
  chapterNumber: number;
  chapter: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionText: string;
  diagramType?: DiagramKind;
  // Presented options in randomized order with display keys A..D
  presentedOptions: {
    displayKey: OptionKey;
    canonicalKey: OptionKey;
    text: string;
  }[];
  // Canonical correct key & mapped display correct key (NEVER sent to public client prior to submit)
  canonicalCorrectKey: OptionKey;
  correctDisplayKey: OptionKey;
  explanation: string;
  syllabusReference: string;
  abilityTags: AbilityIndicatorKey[];
}

export interface PublicAttemptQuestionView {
  slotNumber: number;
  questionId: string;
  questionVersion: number;
  chapterNumber: number;
  chapter: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionText: string;
  diagramType?: DiagramKind;
  options: QuestionOption[]; // displayKey + text only, NO answer key!
}

export interface QuizResponseItem {
  questionId: string;
  selectedDisplayKey: OptionKey | null;
  canonicalSelectedKey: OptionKey | null;
  isCorrect: boolean;
  responseTimeMs: number | null;
  answeredAt: string;
}

export type AttemptStatus = "in_progress" | "completed" | "abandoned";

export interface QuizAttemptRecord {
  id: string;
  participantId: string; // Maps to player_id or stable participant session identity
  sessionId: string;
  board: string;
  academicYear: string;
  standard: string;
  stream: StreamSlug;
  subjectSlug: string;
  subjectName: string;
  difficultyPreference: DifficultyPreference;
  instantFeedbackEnabled: boolean;
  attemptNumber: number;
  cycleNumber: number;
  status: AttemptStatus;
  startedAt: string;
  reservationExpiresAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  scoreOutOf10: number | null;
  correctCount: number | null;
  incorrectCount: number | null;
  accuracyPct: number | null;
  scoringAlgorithmVersion: string;
  questions: AttemptQuestionSnapshot[];
  responses: QuizResponseItem[];
}

export interface QuestionAttemptHistoryEntry {
  participantKey: string;
  subjectSlug: string;
  cycleNumber: number;
  completedQuestionIds: string[];
  lastResetAt: string | null;
  updatedAt: string;
}

export type EvidenceConfidence =
  | "insufficient"
  | "emerging"
  | "moderate"
  | "strong";

export interface AbilityIndicatorEvaluation {
  key: AbilityIndicatorKey;
  label: string;
  supported: boolean; // false when < MIN_EVIDENCE_QUESTIONS (2)
  displayStatus: string; // e.g., "Strong (4/4)" or "Not enough evidence yet"
  qualitativeBand:
    | "Not enough evidence yet"
    | "Developing"
    | "Consistent"
    | "Strong";
  scorePct: number | null; // null when insufficient evidence
  mappedQuestionsCount: number;
  correctMappedCount: number;
  supportingQuestionIds: string[];
  supportingEvidenceSummary: string;
  confidence: EvidenceConfidence;
  scoringAlgorithmVersion: string;
}

export interface ChapterPerformanceBreakdown {
  chapterNumber: number;
  chapter: string;
  attempted: number;
  correct: number;
  accuracyPct: number;
}

export interface JuniorDescriptiveProfile {
  title: string;
  subtitle: string;
  narrative: string;
  disclaimer: string;
  scoringAlgorithmVersion: string;
}

export interface JuniorAttemptResult {
  attemptId: string;
  participantId: string;
  participantName: string;
  sessionId: string;
  board: string;
  academicYear: string;
  standard: string;
  stream: StreamSlug;
  streamName: string;
  subjectSlug: string;
  subjectName: string;
  difficultyPreference: DifficultyPreference;
  attemptNumber: number;
  cycleNumber: number;
  startedAt: string;
  completedAt: string;
  durationSeconds: number | null;
  scoringAlgorithmVersion: string;
  academicPerformance: {
    scoreOutOf10: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredCount: number;
    accuracyPct: number;
    chapterBreakdown: ChapterPerformanceBreakdown[];
  };
  abilityIndicators: AbilityIndicatorEvaluation[];
  descriptiveProfile: JuniorDescriptiveProfile;
  questionReview: {
    slotNumber: number;
    questionId: string;
    questionVersion: number;
    chapter: string;
    topic: string;
    difficulty: QuestionDifficulty;
    questionText: string;
    options: QuestionOption[];
    selectedOptionKey: OptionKey | null;
    selectedOptionText: string | null;
    correctOptionKey: OptionKey;
    correctOptionText: string;
    isCorrect: boolean;
    explanation: string;
    syllabusReference: string;
    responseTimeMs: number | null;
  }[];
}

export interface AdminAuditLogEntry {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface ParticipantDirectoryItem {
  participantId: string;
  isAnonymous: boolean;
  username: string;
  fullName: string;
  instagramHandle: string | null;
  modesPlayed: ExperienceMode[];
  totalSessions: number;
  seniorSessionsCount: number;
  juniorAttemptsCount: number;
  completedExperiencesCount: number;
  lastActivityAt: string;
  registeredAt: string;
  status: "active" | "completed";
}

