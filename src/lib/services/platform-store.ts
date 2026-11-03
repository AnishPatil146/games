import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  ACADEMIC_STREAMS,
  DEFAULT_ACADEMIC_BOARDS,
  DEFAULT_ACADEMIC_YEARS,
  INITIAL_ACADEMIC_SUBJECTS,
} from "../academic-catalogue";
import {
  AbilityIndicatorEvaluation,
  AbilityIndicatorKey,
  AcademicBoardConfig,
  AcademicStreamConfig,
  AcademicSubjectConfig,
  AcademicYearConfig,
  AdminAuditLogEntry,
  DifficultyPreference,
  ExperienceMode,
  JuniorAttemptResult,
  OptionKey,
  ParticipantDirectoryItem,
  PublicAttemptQuestionView,
  PublicationStatus,
  QuestionAttemptHistoryEntry,
  QuestionBankRecord,
  QuestionDifficulty,
  QuizAttemptRecord,
  StreamSlug,
} from "../platform-types";
import {
  JUNIOR_SCORING_ALGORITHM_VERSION,
  RawSubmissionAnswer,
  aggregateParticipantAbilityIndicators,
  evaluateJuniorAttempt,
} from "./junior-scoring-service";
import {
  RESERVATION_TTL_MS,
  selectQuestionsForAttempt,
  toPublicQuestionViews,
} from "./question-selection-engine";
import {
  getOrCreateSession,
  loadRawAdminDataset,
  recordEventByToken,
  submitProfileByToken,
} from "../storage";
import { evaluateReport } from "../scoring";
import { GameplayEvent, GameplayReport } from "../types";

interface PlatformPersistenceData {
  boards: AcademicBoardConfig[];
  years: AcademicYearConfig[];
  customSubjects: AcademicSubjectConfig[];
  subjectOverrides: Record<
    string,
    Partial<Pick<AcademicSubjectConfig, "name" | "description" | "active" | "isElective">>
  >;
  questionOverrides: Record<string, QuestionBankRecord>;
  customQuestions: QuestionBankRecord[];
  questionUsageCounts: Record<string, number>;
  questionHistory: QuestionAttemptHistoryEntry[];
  quizAttempts: (QuizAttemptRecord & { ownerTokenHash: string })[];
  juniorResults: Record<string, JuniorAttemptResult>;
  participantLinks: Record<
    string,
    {
      participantId: string;
      ownerTokenHash: string;
      username?: string;
      fullName?: string;
      playerId?: string | null;
      createdAt: string;
      lastActiveAt: string;
    }
  >;
  auditLogs: AdminAuditLogEntry[];
}

const DEFAULT_STORE_FILE = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  ".data",
  "platform-store.json"
);

let customStoreFilePath: string | null = null;

/**
 * Allows automated tests to isolate persistence to a temporary file without touching `.data/`.
 */
export function setPlatformStorePathForTests(filePath: string | null): void {
  customStoreFilePath = filePath;
  memoryCache = null;
}

function getActiveStorePath(): string {
  return customStoreFilePath || DEFAULT_STORE_FILE;
}

let memoryCache: PlatformPersistenceData | null = null;

function createEmptyStore(): PlatformPersistenceData {
  return {
    boards: [...DEFAULT_ACADEMIC_BOARDS],
    years: [...DEFAULT_ACADEMIC_YEARS],
    customSubjects: [],
    subjectOverrides: {},
    questionOverrides: {},
    customQuestions: [],
    questionUsageCounts: {},
    questionHistory: [],
    quizAttempts: [],
    juniorResults: {},
    participantLinks: {},
    auditLogs: [],
  };
}

function readPlatformStore(): PlatformPersistenceData {
  const storePath = getActiveStorePath();
  if (memoryCache && !customStoreFilePath) {
    // Re-sync from disk if present so multi-route dev calls stay coherent
  }
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ storePath)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ storePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<PlatformPersistenceData>;
      memoryCache = {
        boards: Array.isArray(parsed.boards)
          ? parsed.boards
          : [...DEFAULT_ACADEMIC_BOARDS],
        years: Array.isArray(parsed.years)
          ? parsed.years
          : [...DEFAULT_ACADEMIC_YEARS],
        customSubjects: Array.isArray(parsed.customSubjects)
          ? parsed.customSubjects
          : [],
        subjectOverrides: parsed.subjectOverrides || {},
        questionOverrides: parsed.questionOverrides || {},
        customQuestions: Array.isArray(parsed.customQuestions)
          ? parsed.customQuestions
          : [],
        questionUsageCounts: parsed.questionUsageCounts || {},
        questionHistory: Array.isArray(parsed.questionHistory)
          ? parsed.questionHistory
          : [],
        quizAttempts: Array.isArray(parsed.quizAttempts)
          ? parsed.quizAttempts
          : [],
        juniorResults: parsed.juniorResults || {},
        participantLinks: parsed.participantLinks || {},
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
      };
      return memoryCache;
    }
  } catch {
    // Fallback to in-memory store on read-only serverless fs
  }
  if (!memoryCache) {
    memoryCache = createEmptyStore();
  }
  return memoryCache;
}

function writePlatformStore(store: PlatformPersistenceData): void {
  memoryCache = store;
  const storePath = getActiveStorePath();
  try {
    const dir = path.dirname(storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = `${storePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), "utf8");
    fs.renameSync(tmpPath, storePath);
  } catch {
    // Read-only serverless fallback retains memoryCache cleanly
  }
}

export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(`unwritten:${token}`).digest("hex");
}

// =============================================================================
// SEEDED QUESTION BANK LOADER (14 MSBSHSE CLASS 11 SUBJECTS × 100 QUESTIONS)
// =============================================================================

const seededSubjectCache = new Map<string, QuestionBankRecord[]>();

export function loadSeededSubjectQuestions(
  subjectSlug: string
): QuestionBankRecord[] {
  const cached = seededSubjectCache.get(subjectSlug);
  if (cached && cached.length > 0) {
    return cached;
  }

  const filePath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "src",
    "data",
    "question-bank",
    "subjects",
    `${subjectSlug}.json`
  );

  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf8");
      const parsed = JSON.parse(raw) as QuestionBankRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        seededSubjectCache.set(subjectSlug, parsed);
        return parsed;
      }
    }
  } catch {
    // Return empty array if seed file is malformed or absent
  }

  return [];
}

// =============================================================================
// ACADEMIC CATALOGUE SERVICE (BOARDS, STREAMS, CONFIGURABLE SUBJECTS)
// =============================================================================

export function listAcademicStreams(): AcademicStreamConfig[] {
  return [
    ACADEMIC_STREAMS.science,
    ACADEMIC_STREAMS.commerce,
    ACADEMIC_STREAMS.arts,
  ];
}

export function listAcademicSubjects(options?: {
  stream?: StreamSlug;
  includeInactive?: boolean;
}): (AcademicSubjectConfig & {
  publishedQuestionCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
})[] {
  const store = readPlatformStore();
  const mergedBase = [
    ...INITIAL_ACADEMIC_SUBJECTS.map((subj) => {
      const ov = store.subjectOverrides[subj.slug];
      return ov ? { ...subj, ...ov } : subj;
    }),
    ...store.customSubjects,
  ];

  const filtered = mergedBase.filter((s) => {
    if (!options?.includeInactive && !s.active) return false;
    if (options?.stream && s.stream !== options.stream) return false;
    return true;
  });

  return filtered.map((subj) => {
    const bank = getEffectiveSubjectQuestionBank(subj.slug);
    const pub = bank.filter(
      (q) => q.publicationStatus === "published" && q.reviewed
    );
    return {
      ...subj,
      publishedQuestionCount: pub.length,
      easyCount: pub.filter((q) => q.difficulty === "Easy").length,
      mediumCount: pub.filter((q) => q.difficulty === "Medium").length,
      hardCount: pub.filter((q) => q.difficulty === "Hard").length,
    };
  });
}

export function upsertAcademicSubject(
  payload: {
    slug: string;
    stream: StreamSlug;
    name: string;
    code: string;
    description: string;
    isElective: boolean;
    active: boolean;
    chapters?: { number: number; title: string }[];
  },
  adminEmail: string
): AcademicSubjectConfig {
  const store = readPlatformStore();
  const builtIn = INITIAL_ACADEMIC_SUBJECTS.find((s) => s.slug === payload.slug);

  let updated: AcademicSubjectConfig;
  if (builtIn) {
    store.subjectOverrides[payload.slug] = {
      name: payload.name,
      description: payload.description,
      isElective: payload.isElective,
      active: payload.active,
    };
    updated = {
      ...builtIn,
      ...store.subjectOverrides[payload.slug],
    };
  } else {
    const existingIdx = store.customSubjects.findIndex(
      (s) => s.slug === payload.slug
    );
    updated = {
      id: `subj-${payload.slug}`,
      slug: payload.slug,
      stream: payload.stream,
      name: payload.name,
      code: payload.code,
      boardCode: "MSBSHSE",
      academicYear: "2025-26",
      standard: "Class 11 (FYJC)",
      isElective: payload.isElective,
      active: payload.active,
      description: payload.description,
      chapters:
        payload.chapters && payload.chapters.length > 0
          ? payload.chapters
          : [{ number: 1, title: "Core Foundations" }],
    };
    if (existingIdx >= 0) {
      store.customSubjects[existingIdx] = updated;
    } else {
      store.customSubjects.push(updated);
    }
  }

  store.auditLogs.unshift({
    id: crypto.randomUUID(),
    adminEmail,
    action: "subject_upserted",
    entityType: "academic_subject",
    entityId: updated.slug,
    summary: `Configured subject ${updated.name} (${updated.stream}, active=${updated.active}, elective=${updated.isElective})`,
    createdAt: new Date().toISOString(),
  });

  writePlatformStore(store);
  return updated;
}

// =============================================================================
// QUESTION BANK SERVICE (SEEDABLE, EDITABLE, VERSIONED, REVIEW-GATED)
// =============================================================================

export function getEffectiveSubjectQuestionBank(
  subjectSlug: string
): QuestionBankRecord[] {
  const store = readPlatformStore();
  const seeded = loadSeededSubjectQuestions(subjectSlug);

  const byId = new Map<string, QuestionBankRecord>();
  for (const q of seeded) {
    const override = store.questionOverrides[q.id];
    const effective = override ? { ...q, ...override } : q;
    byId.set(q.id, {
      ...effective,
      usageCount: store.questionUsageCounts[q.id] || effective.usageCount || 0,
    });
  }

  for (const cq of store.customQuestions) {
    if (cq.subjectSlug === subjectSlug) {
      const override = store.questionOverrides[cq.id];
      const effective = override ? { ...cq, ...override } : cq;
      byId.set(cq.id, {
        ...effective,
        usageCount:
          store.questionUsageCounts[cq.id] || effective.usageCount || 0,
      });
    }
  }

  return Array.from(byId.values());
}

export function getAllEffectiveQuestions(): QuestionBankRecord[] {
  const store = readPlatformStore();
  const slugs = new Set<string>([
    ...INITIAL_ACADEMIC_SUBJECTS.map((s) => s.slug),
    ...store.customSubjects.map((s) => s.slug),
  ]);

  const all: QuestionBankRecord[] = [];
  for (const slug of slugs) {
    all.push(...getEffectiveSubjectQuestionBank(slug));
  }
  return all;
}

export function queryAdminQuestions(filters: {
  stream?: StreamSlug;
  subjectSlug?: string;
  difficulty?: QuestionDifficulty;
  publicationStatus?: PublicationStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}): {
  items: QuestionBankRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  let pool = filters.subjectSlug
    ? getEffectiveSubjectQuestionBank(filters.subjectSlug)
    : getAllEffectiveQuestions();

  if (filters.stream) {
    pool = pool.filter((q) => q.stream === filters.stream);
  }
  if (filters.difficulty) {
    pool = pool.filter((q) => q.difficulty === filters.difficulty);
  }
  if (filters.publicationStatus) {
    pool = pool.filter(
      (q) => q.publicationStatus === filters.publicationStatus
    );
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    pool = pool.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.questionText.toLowerCase().includes(q) ||
        item.chapter.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q)
    );
  }

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(200, Math.max(1, filters.pageSize || 25));
  const total = pool.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = pool.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { items, total, page: safePage, pageSize, totalPages };
}

export function createAdminQuestion(
  input: Omit<
    QuestionBankRecord,
    "id" | "version" | "createdAt" | "reviewedAt" | "usageCount"
  > & { id?: string },
  adminEmail: string
): QuestionBankRecord {
  const store = readPlatformStore();
  const now = new Date().toISOString();

  // Safety gate: cannot create directly in "published" state unless reviewed is true
  const status: PublicationStatus =
    input.publicationStatus === "published" && !input.reviewed
      ? "draft"
      : input.publicationStatus;

  const id =
    input.id?.trim() ||
    `msb-11-${input.subjectSlug}-${crypto.randomUUID().slice(0, 8)}`;

  const record: QuestionBankRecord = {
    ...input,
    id,
    publicationStatus: status,
    version: 1,
    usageCount: 0,
    createdAt: now,
    reviewedAt: input.reviewed ? now : null,
  };

  store.customQuestions.unshift(record);
  store.auditLogs.unshift({
    id: crypto.randomUUID(),
    adminEmail,
    action: "question_created",
    entityType: "question_bank",
    entityId: record.id,
    summary: `Created ${record.difficulty} question in ${record.subjectName} (${record.chapter})`,
    createdAt: now,
  });

  writePlatformStore(store);
  return record;
}

export function updateAdminQuestion(
  questionId: string,
  patch: Partial<
    Pick<
      QuestionBankRecord,
      | "chapterNumber"
      | "chapter"
      | "topic"
      | "difficulty"
      | "questionText"
      | "diagramType"
      | "options"
      | "correctKey"
      | "explanation"
      | "syllabusReference"
      | "abilityTags"
      | "reviewed"
    >
  >,
  adminEmail: string
): QuestionBankRecord {
  const store = readPlatformStore();
  const all = getAllEffectiveQuestions();
  const existing = all.find((q) => q.id === questionId);
  if (!existing) {
    throw new Error(`Question '${questionId}' not found.`);
  }

  const now = new Date().toISOString();
  const nextReviewed =
    patch.reviewed !== undefined ? patch.reviewed : existing.reviewed;

  const updated: QuestionBankRecord = {
    ...existing,
    ...patch,
    reviewed: nextReviewed,
    reviewedAt: nextReviewed ? existing.reviewedAt || now : null,
    // Increment version so historical attempts referencing the prior version remain auditable
    version: existing.version + 1,
  };

  store.questionOverrides[questionId] = updated;
  store.auditLogs.unshift({
    id: crypto.randomUUID(),
    adminEmail,
    action: "question_updated",
    entityType: "question_bank",
    entityId: questionId,
    summary: `Updated question ${questionId} to v${updated.version}`,
    createdAt: now,
  });

  writePlatformStore(store);
  return updated;
}

export function setQuestionPublicationState(
  questionId: string,
  action: "publish" | "unpublish" | "archive",
  reviewConfirmed: boolean,
  adminEmail: string
): QuestionBankRecord {
  const store = readPlatformStore();
  const all = getAllEffectiveQuestions();
  const existing = all.find((q) => q.id === questionId);
  if (!existing) {
    throw new Error(`Question '${questionId}' not found.`);
  }

  const isReviewed = existing.reviewed || reviewConfirmed;
  if (action === "publish" && !isReviewed) {
    throw new Error(
      "Cannot publish an unreviewed question. Mark the question as reviewed after verifying its options, answer key, and syllabus reference."
    );
  }

  const now = new Date().toISOString();
  const nextStatus: PublicationStatus =
    action === "publish"
      ? "published"
      : action === "archive"
      ? "archived"
      : "draft";

  const updated: QuestionBankRecord = {
    ...existing,
    reviewed: isReviewed,
    reviewedAt: isReviewed ? existing.reviewedAt || now : existing.reviewedAt,
    publicationStatus: nextStatus,
  };

  store.questionOverrides[questionId] = updated;
  store.auditLogs.unshift({
    id: crypto.randomUUID(),
    adminEmail,
    action: `question_${action}`,
    entityType: "question_bank",
    entityId: questionId,
    summary: `Set publication status of ${questionId} to '${nextStatus}'`,
    createdAt: now,
  });

  writePlatformStore(store);
  return updated;
}

export function exportQuestionsAsCsv(questions: QuestionBankRecord[]): string {
  const headers = [
    "id",
    "board",
    "academicYear",
    "standard",
    "stream",
    "subjectSlug",
    "subjectName",
    "chapterNumber",
    "chapter",
    "topic",
    "difficulty",
    "questionText",
    "optionA",
    "optionB",
    "optionC",
    "optionD",
    "correctKey",
    "explanation",
    "syllabusReference",
    "abilityTags",
    "publicationStatus",
    "reviewed",
    "version",
  ];

  const escapeCsv = (val: unknown): string => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = questions.map((q) => {
    const optMap = new Map(q.options.map((o) => [o.key, o.text]));
    return [
      q.id,
      q.board,
      q.academicYear,
      q.standard,
      q.stream,
      q.subjectSlug,
      q.subjectName,
      q.chapterNumber,
      q.chapter,
      q.topic,
      q.difficulty,
      q.questionText,
      optMap.get("A") || "",
      optMap.get("B") || "",
      optMap.get("C") || "",
      optMap.get("D") || "",
      q.correctKey,
      q.explanation,
      q.syllabusReference,
      q.abilityTags.join("|"),
      q.publicationStatus,
      q.reviewed,
      q.version,
    ]
      .map(escapeCsv)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

// =============================================================================
// PARTICIPANT IDENTITY & JUNIOR ATTEMPT LIFECYCLE SERVICE
// =============================================================================

async function resolveParticipantFromToken(
  sessionToken: string,
  optionalProfile?: {
    fullName?: string;
    username?: string;
    consent?: boolean;
  }
): Promise<{
  participantId: string;
  participantName: string;
  sessionId: string;
  ownerTokenHash: string;
}> {
  const tokenHash = hashSessionToken(sessionToken);
  const { session, playerDisplayName } = await getOrCreateSession(sessionToken);
  const store = readPlatformStore();
  const now = new Date().toISOString();

  let displayName = playerDisplayName || "";

  if (
    optionalProfile?.consent &&
    (optionalProfile.fullName?.trim() || optionalProfile.username?.trim())
  ) {
    const cleanFull =
      optionalProfile.fullName?.trim() ||
      optionalProfile.username?.trim() ||
      "Student";
    const profileRes = await submitProfileByToken(sessionToken, {
      displayName: cleanFull,
      instagramUsername: optionalProfile.username?.trim() || undefined,
      consent: true,
      characterPresentation: "UNSPECIFIED",
    });
    displayName = profileRes.displayName;

    const pId = profileRes.playerId;
    store.participantLinks[tokenHash] = {
      participantId: pId,
      ownerTokenHash: tokenHash,
      username:
        optionalProfile.username?.trim().replace(/^@+/, "") ||
        cleanFull.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      fullName: cleanFull,
      playerId: pId,
      createdAt: store.participantLinks[tokenHash]?.createdAt || now,
      lastActiveAt: now,
    };
    writePlatformStore(store);
    return {
      participantId: pId,
      participantName: cleanFull,
      sessionId: profileRes.sessionId,
      ownerTokenHash: tokenHash,
    };
  }

  // If session already has a player_id, bind participantId to player_id
  const participantId = session.player_id
    ? session.player_id
    : store.participantLinks[tokenHash]?.participantId || `anon-${session.id}`;

  const existingLink = store.participantLinks[tokenHash];
  store.participantLinks[tokenHash] = {
    participantId,
    ownerTokenHash: tokenHash,
    username: existingLink?.username,
    fullName: displayName || existingLink?.fullName,
    playerId: session.player_id || existingLink?.playerId || null,
    createdAt: existingLink?.createdAt || session.started_at || now,
    lastActiveAt: now,
  };
  writePlatformStore(store);

  return {
    participantId,
    participantName:
      displayName || existingLink?.fullName || "Anonymous Participant",
    sessionId: session.id,
    ownerTokenHash: tokenHash,
  };
}

/**
 * Releases expired in_progress attempt reservations older than RESERVATION_TTL_MS (30m).
 */
function expireStaleReservations(
  store: PlatformPersistenceData,
  nowMs: number = Date.now()
): boolean {
  let mutated = false;
  for (const att of store.quizAttempts) {
    if (att.status === "in_progress") {
      const exp = new Date(att.reservationExpiresAt).getTime();
      if (!Number.isNaN(exp) && exp <= nowMs) {
        att.status = "abandoned";
        mutated = true;
      }
    }
  }
  return mutated;
}

export async function startJuniorAttempt(params: {
  sessionToken: string;
  stream: StreamSlug;
  subjectSlug: string;
  difficultyPreference?: DifficultyPreference;
  instantFeedbackEnabled?: boolean;
  optionalProfile?: {
    fullName?: string;
    username?: string;
    consent?: boolean;
  };
  nowIso?: string;
}): Promise<{
  attemptId: string;
  participantId: string;
  attemptNumber: number;
  cycleNumber: number;
  didRollOverCycle: boolean;
  stream: StreamSlug;
  subjectSlug: string;
  subjectName: string;
  difficultyPreference: DifficultyPreference;
  instantFeedbackEnabled: boolean;
  startedAt: string;
  reservationExpiresAt: string;
  questions: PublicAttemptQuestionView[];
}> {
  const subjects = listAcademicSubjects({ includeInactive: false });
  const subject = subjects.find(
    (s) => s.slug === params.subjectSlug && s.stream === params.stream
  );
  if (!subject) {
    throw new Error(
      `Subject '${params.subjectSlug}' is not active in stream '${params.stream}'.`
    );
  }

  const identity = await resolveParticipantFromToken(
    params.sessionToken,
    params.optionalProfile
  );

  const store = readPlatformStore();
  const nowDate = params.nowIso ? new Date(params.nowIso) : new Date();
  const nowMs = nowDate.getTime();
  const nowIso = nowDate.toISOString();

  expireStaleReservations(store, nowMs);

  // Fair abandonment policy: if this same participant starts a new attempt in the same subject
  // while an older unsubmitted attempt is still in_progress, mark the prior unsubmitted attempt
  // as 'abandoned' so its 10 reserved questions immediately return to the eligible pool!
  for (const prior of store.quizAttempts) {
    if (
      prior.participantId === identity.participantId &&
      prior.subjectSlug === params.subjectSlug &&
      prior.status === "in_progress"
    ) {
      prior.status = "abandoned";
    }
  }

  let historyEntry = store.questionHistory.find(
    (h) =>
      h.participantKey === identity.participantId &&
      h.subjectSlug === params.subjectSlug
  );
  if (!historyEntry) {
    historyEntry = {
      participantKey: identity.participantId,
      subjectSlug: params.subjectSlug,
      cycleNumber: 1,
      completedQuestionIds: [],
      lastResetAt: null,
      updatedAt: nowIso,
    };
    store.questionHistory.push(historyEntry);
  }

  const subjectBank = getEffectiveSubjectQuestionBank(params.subjectSlug);
  const diffPref = params.difficultyPreference || "Mixed";

  const selection = selectQuestionsForAttempt({
    subjectBank,
    completedQuestionIds: historyEntry.completedQuestionIds,
    activeReservedQuestionIds: [],
    currentCycleNumber: historyEntry.cycleNumber,
    difficultyPreference: diffPref,
  });

  if (selection.resetCompletedIdsBeforeAttempt) {
    historyEntry.completedQuestionIds = [];
    historyEntry.cycleNumber = selection.nextCycleNumber;
    historyEntry.updatedAt = nowIso;
  }

  const priorSubjectAttempts = store.quizAttempts.filter(
    (a) =>
      a.participantId === identity.participantId &&
      a.subjectSlug === params.subjectSlug
  ).length;

  const attemptId = crypto.randomUUID();
  const reservationExpiresAt = new Date(
    nowMs + RESERVATION_TTL_MS
  ).toISOString();

  const attemptRecord: QuizAttemptRecord & { ownerTokenHash: string } = {
    id: attemptId,
    participantId: identity.participantId,
    ownerTokenHash: identity.ownerTokenHash,
    sessionId: identity.sessionId,
    board: subject.boardCode,
    academicYear: subject.academicYear,
    standard: subject.standard,
    stream: params.stream,
    subjectSlug: subject.slug,
    subjectName: subject.name,
    difficultyPreference: diffPref,
    instantFeedbackEnabled: Boolean(params.instantFeedbackEnabled),
    attemptNumber: priorSubjectAttempts + 1,
    cycleNumber: selection.nextCycleNumber,
    status: "in_progress",
    startedAt: nowIso,
    reservationExpiresAt,
    completedAt: null,
    durationSeconds: null,
    scoreOutOf10: null,
    correctCount: null,
    incorrectCount: null,
    accuracyPct: null,
    scoringAlgorithmVersion: JUNIOR_SCORING_ALGORITHM_VERSION,
    questions: selection.snapshots,
    responses: [],
  };

  for (const qId of selection.selectedQuestionIds) {
    store.questionUsageCounts[qId] = (store.questionUsageCounts[qId] || 0) + 1;
  }

  store.quizAttempts.unshift(attemptRecord);
  writePlatformStore(store);

  // Record analytics telemetry event non-blockingly
  try {
    await recordEventByToken(params.sessionToken, 0, "junior_attempt_started", {
      attemptId,
      stream: params.stream,
      subjectSlug: subject.slug,
      subjectName: subject.name,
      difficultyPreference: diffPref,
    });
  } catch {
    // Non-blocking in unit test contexts without cookie store
  }

  return {
    attemptId,
    participantId: identity.participantId,
    attemptNumber: attemptRecord.attemptNumber,
    cycleNumber: attemptRecord.cycleNumber,
    didRollOverCycle: selection.didRollOverCycle,
    stream: attemptRecord.stream,
    subjectSlug: attemptRecord.subjectSlug,
    subjectName: attemptRecord.subjectName,
    difficultyPreference: attemptRecord.difficultyPreference,
    instantFeedbackEnabled: attemptRecord.instantFeedbackEnabled,
    startedAt: attemptRecord.startedAt,
    reservationExpiresAt: attemptRecord.reservationExpiresAt,
    questions: toPublicQuestionViews(attemptRecord.questions),
  };
}

export function getPublicJuniorAttemptState(
  attemptId: string,
  sessionToken: string
): {
  attemptId: string;
  status: QuizAttemptRecord["status"];
  stream: StreamSlug;
  subjectSlug: string;
  subjectName: string;
  board: string;
  academicYear: string;
  standard: string;
  difficultyPreference: DifficultyPreference;
  instantFeedbackEnabled: boolean;
  attemptNumber: number;
  cycleNumber: number;
  startedAt: string;
  completedAt: string | null;
  questions: PublicAttemptQuestionView[];
  instantFeedbackMap?: Record<
    string,
    { correctOptionKey: OptionKey; explanation: string }
  >;
} {
  const store = readPlatformStore();
  const tokenHash = hashSessionToken(sessionToken);
  const att = store.quizAttempts.find((a) => a.id === attemptId);

  if (!att) {
    throw new Error("NOT_FOUND: Attempt record not found.");
  }
  if (att.ownerTokenHash !== tokenHash) {
    throw new Error(
      "FORBIDDEN: Attempt belongs to a different participant session."
    );
  }

  // Only reveal instantFeedbackMap when explicitly enabled in attempt config!
  const instantFeedbackMap = att.instantFeedbackEnabled
    ? Object.fromEntries(
        att.questions.map((q) => [
          q.questionId,
          {
            correctOptionKey: q.correctDisplayKey,
            explanation: q.explanation,
          },
        ])
      )
    : undefined;

  return {
    attemptId: att.id,
    status: att.status,
    stream: att.stream,
    subjectSlug: att.subjectSlug,
    subjectName: att.subjectName,
    board: att.board,
    academicYear: att.academicYear,
    standard: att.standard,
    difficultyPreference: att.difficultyPreference,
    instantFeedbackEnabled: att.instantFeedbackEnabled,
    attemptNumber: att.attemptNumber,
    cycleNumber: att.cycleNumber,
    startedAt: att.startedAt,
    completedAt: att.completedAt,
    questions: toPublicQuestionViews(att.questions),
    instantFeedbackMap,
  };
}

export async function submitJuniorAttempt(params: {
  attemptId: string;
  sessionToken: string;
  answers: RawSubmissionAnswer[];
  completedAtIso?: string;
}): Promise<JuniorAttemptResult> {
  const store = readPlatformStore();
  const tokenHash = hashSessionToken(params.sessionToken);
  const att = store.quizAttempts.find((a) => a.id === params.attemptId);

  if (!att) {
    throw new Error("NOT_FOUND: Attempt record not found.");
  }
  if (att.ownerTokenHash !== tokenHash) {
    throw new Error(
      "FORBIDDEN: You do not own this Junior challenge attempt."
    );
  }

  // Idempotent return if already submitted
  if (att.status === "completed" && store.juniorResults[att.id]) {
    return store.juniorResults[att.id];
  }

  const completedAt = params.completedAtIso || new Date().toISOString();
  const linkInfo = store.participantLinks[tokenHash];
  const participantName = linkInfo?.fullName || "Anonymous Student";

  const { result, normalizedResponses } = evaluateJuniorAttempt({
    attemptId: att.id,
    participantId: att.participantId,
    participantName,
    sessionId: att.sessionId,
    board: att.board,
    academicYear: att.academicYear,
    standard: att.standard,
    stream: att.stream,
    subjectSlug: att.subjectSlug,
    subjectName: att.subjectName,
    difficultyPreference: att.difficultyPreference,
    attemptNumber: att.attemptNumber,
    cycleNumber: att.cycleNumber,
    startedAt: att.startedAt,
    completedAt,
    questions: att.questions,
    submittedAnswers: params.answers,
  });

  // Transactional in-memory state mutation + atomic rename write
  att.status = "completed";
  att.completedAt = completedAt;
  att.durationSeconds = result.durationSeconds;
  att.scoreOutOf10 = result.academicPerformance.scoreOutOf10;
  att.correctCount = result.academicPerformance.correctAnswers;
  att.incorrectCount = result.academicPerformance.incorrectAnswers;
  att.accuracyPct = result.academicPerformance.accuracyPct;
  att.responses = normalizedResponses;

  let historyEntry = store.questionHistory.find(
    (h) =>
      h.participantKey === att.participantId &&
      h.subjectSlug === att.subjectSlug
  );
  if (!historyEntry) {
    historyEntry = {
      participantKey: att.participantId,
      subjectSlug: att.subjectSlug,
      cycleNumber: att.cycleNumber,
      completedQuestionIds: [],
      lastResetAt: null,
      updatedAt: completedAt,
    };
    store.questionHistory.push(historyEntry);
  }

  const completedSet = new Set(historyEntry.completedQuestionIds);
  for (const q of att.questions) {
    completedSet.add(q.questionId);
  }
  historyEntry.completedQuestionIds = Array.from(completedSet);
  historyEntry.cycleNumber = att.cycleNumber;
  historyEntry.updatedAt = completedAt;

  if (linkInfo) {
    linkInfo.lastActiveAt = completedAt;
  }

  store.juniorResults[att.id] = result;
  writePlatformStore(store);

  try {
    await recordEventByToken(
      params.sessionToken,
      0,
      "junior_attempt_completed",
      {
        attemptId: att.id,
        stream: att.stream,
        subjectSlug: att.subjectSlug,
        scoreOutOf10: result.academicPerformance.scoreOutOf10,
        accuracyPct: result.academicPerformance.accuracyPct,
      }
    );
  } catch {
    // Non-blocking
  }

  return result;
}

export function getAuthorizedJuniorResult(params: {
  attemptId: string;
  sessionToken?: string | null;
  isAdmin?: boolean;
}): JuniorAttemptResult {
  const store = readPlatformStore();
  const att = store.quizAttempts.find((a) => a.id === params.attemptId);
  if (!att) {
    throw new Error("NOT_FOUND: Junior attempt result not found.");
  }

  const tokenMatches =
    Boolean(params.sessionToken) &&
    hashSessionToken(params.sessionToken!) === att.ownerTokenHash;

  if (!tokenMatches && !params.isAdmin) {
    throw new Error(
      "FORBIDDEN: Attempt result belongs to another participant."
    );
  }

  if (att.status !== "completed" || !store.juniorResults[att.id]) {
    throw new Error(
      "PRECONDITION: Attempt has not been submitted yet."
    );
  }

  return store.juniorResults[att.id];
}

export async function resetJuniorSubjectHistory(params: {
  sessionToken: string;
  subjectSlug: string;
}): Promise<{
  subjectSlug: string;
  cycleNumber: number;
  completedCount: number;
}> {
  const identity = await resolveParticipantFromToken(params.sessionToken);
  const store = readPlatformStore();
  const now = new Date().toISOString();

  let entry = store.questionHistory.find(
    (h) =>
      h.participantKey === identity.participantId &&
      h.subjectSlug === params.subjectSlug
  );

  if (!entry) {
    entry = {
      participantKey: identity.participantId,
      subjectSlug: params.subjectSlug,
      cycleNumber: 1,
      completedQuestionIds: [],
      lastResetAt: now,
      updatedAt: now,
    };
    store.questionHistory.push(entry);
  } else {
    entry.completedQuestionIds = [];
    entry.cycleNumber += 1;
    entry.lastResetAt = now;
    entry.updatedAt = now;
  }

  writePlatformStore(store);
  return {
    subjectSlug: params.subjectSlug,
    cycleNumber: entry.cycleNumber,
    completedCount: 0,
  };
}

export async function getParticipantSubjectProgress(
  sessionToken: string | null | undefined
): Promise<
  Record<
    string,
    {
      completedQuestionsCount: number;
      cycleNumber: number;
      attemptsCompleted: number;
      bestScoreOutOf10: number | null;
    }
  >
> {
  if (!sessionToken) return {};
  const store = readPlatformStore();
  const tokenHash = hashSessionToken(sessionToken);
  const link = store.participantLinks[tokenHash];
  if (!link) return {};

  const out: Record<
    string,
    {
      completedQuestionsCount: number;
      cycleNumber: number;
      attemptsCompleted: number;
      bestScoreOutOf10: number | null;
    }
  > = {};

  for (const h of store.questionHistory) {
    if (h.participantKey !== link.participantId) continue;
    const completedAtts = store.quizAttempts.filter(
      (a) =>
        a.participantId === link.participantId &&
        a.subjectSlug === h.subjectSlug &&
        a.status === "completed"
    );
    const scores = completedAtts
      .map((a) => a.scoreOutOf10)
      .filter((s): s is number => s !== null);

    out[h.subjectSlug] = {
      completedQuestionsCount: h.completedQuestionIds.length,
      cycleNumber: h.cycleNumber,
      attemptsCompleted: completedAtts.length,
      bestScoreOutOf10: scores.length > 0 ? Math.max(...scores) : null,
    };
  }
  return out;
}

// =============================================================================
// PARTICIPANT-CENTRIC ADMIN CONTROL CENTRE SERVICE
// =============================================================================

interface ResolvedUnifiedParticipant {
  participantId: string;
  isAnonymous: boolean;
  username: string;
  fullName: string;
  instagramHandle: string | null;
  registeredAt: string;
  lastActivityAt: string;
  seniorSessionIds: string[];
  juniorAttemptIds: string[];
}

async function buildUnifiedParticipantMap(): Promise<{
  participants: Map<string, ResolvedUnifiedParticipant>;
  seniorDataset: Awaited<ReturnType<typeof loadRawAdminDataset>>;
  platformStore: PlatformPersistenceData;
}> {
  const seniorDataset = await loadRawAdminDataset();
  const platformStore = readPlatformStore();
  expireStaleReservations(platformStore);

  const map = new Map<string, ResolvedUnifiedParticipant>();

  // 1. Seed from registered Senior/shared players
  for (const p of seniorDataset.players) {
    const cleanHandle = p.instagram_username || null;
    const derivedUsername =
      cleanHandle ||
      p.display_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") ||
      `user_${p.id.slice(0, 6)}`;

    map.set(p.id, {
      participantId: p.id,
      isAnonymous: false,
      username: derivedUsername,
      fullName: p.display_name,
      instagramHandle: cleanHandle,
      registeredAt: p.created_at,
      lastActivityAt: p.created_at,
      seniorSessionIds: [],
      juniorAttemptIds: [],
    });
  }

  // 2. Attach Senior sessions (excluding Junior-only telemetry sessions that have 0 Senior chapter activity)
  const eventsBySession = new Map<string, GameplayEvent[]>();
  for (const ev of seniorDataset.events) {
    const arr = eventsBySession.get(ev.session_id) || [];
    arr.push(ev);
    eventsBySession.set(ev.session_id, arr);
  }

  for (const s of seniorDataset.sessions) {
    const sEvents = eventsBySession.get(s.id) || [];
    const hasSeniorActivity =
      s.status === "completed" ||
      s.current_chapter > 1 ||
      sEvents.some(
        (e) =>
          e.event_type === "game_started" ||
          e.event_type === "chapter_started" ||
          e.event_type === "choice_selected" ||
          e.event_type === "clue_inspected" ||
          e.event_type === "puzzle_attempted"
      );

    const hasJuniorAttemptOnSession = platformStore.quizAttempts.some(
      (a) => a.sessionId === s.id
    );

    // Skip pure landing-bounce sessions that started neither Senior nor Junior
    if (!hasSeniorActivity && !hasJuniorAttemptOnSession && !s.player_id) {
      continue;
    }

    const pId = s.player_id ? s.player_id : `anon-${s.id}`;
    let entry = map.get(pId);
    if (!entry) {
      entry = {
        participantId: pId,
        isAnonymous: !s.player_id,
        username: `anon_${s.id.slice(0, 6)}`,
        fullName: s.player?.display_name || "Anonymous Participant",
        instagramHandle: s.player?.instagram_username || null,
        registeredAt: s.started_at,
        lastActivityAt: s.completed_at || s.started_at,
        seniorSessionIds: [],
        juniorAttemptIds: [],
      };
      map.set(pId, entry);
    }

    if (hasSeniorActivity) {
      entry.seniorSessionIds.push(s.id);
    }

    const latestTs = s.completed_at || s.started_at;
    if (
      new Date(latestTs).getTime() > new Date(entry.lastActivityAt).getTime()
    ) {
      entry.lastActivityAt = latestTs;
    }
  }

  // 3. Attach participantLinks & Junior attempts
  const linkByParticipantId = new Map<
    string,
    PlatformPersistenceData["participantLinks"][string]
  >();
  for (const link of Object.values(platformStore.participantLinks)) {
    linkByParticipantId.set(link.participantId, link);
  }

  for (const att of platformStore.quizAttempts) {
    let entry = map.get(att.participantId);
    const link = linkByParticipantId.get(att.participantId);

    if (!entry) {
      const isAnon = att.participantId.startsWith("anon-");
      entry = {
        participantId: att.participantId,
        isAnonymous: isAnon && !link?.fullName,
        username:
          link?.username ||
          (isAnon
            ? `anon_${att.participantId.replace(/^anon-/, "").slice(0, 6)}`
            : `user_${att.participantId.slice(0, 6)}`),
        fullName: link?.fullName || "Anonymous Participant",
        instagramHandle: null,
        registeredAt: link?.createdAt || att.startedAt,
        lastActivityAt: att.completedAt || att.startedAt,
        seniorSessionIds: [],
        juniorAttemptIds: [],
      };
      map.set(att.participantId, entry);
    } else if (link?.fullName && entry.isAnonymous) {
      entry.fullName = link.fullName;
      entry.username = link.username || entry.username;
      entry.isAnonymous = false;
    }

    entry.juniorAttemptIds.push(att.id);
    const latestAttTs = att.completedAt || att.startedAt;
    if (
      new Date(latestAttTs).getTime() > new Date(entry.lastActivityAt).getTime()
    ) {
      entry.lastActivityAt = latestAttTs;
    }
  }

  return { participants: map, seniorDataset, platformStore };
}

export async function listParticipantsDirectory(params?: {
  search?: string;
  modeFilter?: "all" | "senior" | "junior" | "both" | "anonymous";
  sortBy?: "last_activity" | "registration_date" | "total_sessions";
  page?: number;
  pageSize?: number;
}): Promise<{
  items: ParticipantDirectoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const { participants, seniorDataset, platformStore } =
    await buildUnifiedParticipantMap();

  const sessionMap = new Map(seniorDataset.sessions.map((s) => [s.id, s]));
  const attemptMap = new Map(platformStore.quizAttempts.map((a) => [a.id, a]));

  let list: ParticipantDirectoryItem[] = Array.from(participants.values()).map(
    (p) => {
      const modesPlayed: ExperienceMode[] = [];
      if (p.seniorSessionIds.length > 0) modesPlayed.push("senior");
      if (p.juniorAttemptIds.length > 0) modesPlayed.push("junior");

      const completedSenior = p.seniorSessionIds.filter(
        (id) => sessionMap.get(id)?.status === "completed"
      ).length;
      const completedJunior = p.juniorAttemptIds.filter(
        (id) => attemptMap.get(id)?.status === "completed"
      ).length;

      const totalSessions =
        p.seniorSessionIds.length + p.juniorAttemptIds.length;
      const completedExperiencesCount = completedSenior + completedJunior;

      return {
        participantId: p.participantId,
        isAnonymous: p.isAnonymous,
        username: p.username,
        fullName: p.fullName,
        instagramHandle: p.instagramHandle,
        modesPlayed,
        totalSessions,
        seniorSessionsCount: p.seniorSessionIds.length,
        juniorAttemptsCount: p.juniorAttemptIds.length,
        completedExperiencesCount,
        lastActivityAt: p.lastActivityAt,
        registeredAt: p.registeredAt,
        status: completedExperiencesCount > 0 ? "completed" : "active",
      };
    }
  );

  if (params?.modeFilter === "senior") {
    list = list.filter((i) => i.modesPlayed.includes("senior"));
  } else if (params?.modeFilter === "junior") {
    list = list.filter((i) => i.modesPlayed.includes("junior"));
  } else if (params?.modeFilter === "both") {
    list = list.filter(
      (i) =>
        i.modesPlayed.includes("senior") && i.modesPlayed.includes("junior")
    );
  } else if (params?.modeFilter === "anonymous") {
    list = list.filter((i) => i.isAnonymous);
  }

  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (i) =>
        i.username.toLowerCase().includes(q) ||
        i.fullName.toLowerCase().includes(q) ||
        i.participantId.toLowerCase().includes(q) ||
        (i.instagramHandle || "").toLowerCase().includes(q)
    );
  }

  const sortBy = params?.sortBy || "last_activity";
  list.sort((a, b) => {
    if (sortBy === "registration_date") {
      return (
        new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      );
    }
    if (sortBy === "total_sessions") {
      return b.totalSessions - a.totalSessions;
    }
    return (
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
    );
  });

  const page = Math.max(1, params?.page || 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize || 15));
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  return {
    items: list.slice((safePage - 1) * pageSize, safePage * pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function getParticipantCentralProfile(participantId: string) {
  const { participants, seniorDataset, platformStore } =
    await buildUnifiedParticipantMap();
  const decodedId = decodeURIComponent(participantId);
  const p = participants.get(decodedId);

  if (!p) {
    return null;
  }

  const seniorSessions = seniorDataset.sessions.filter((s) =>
    p.seniorSessionIds.includes(s.id)
  );
  const juniorAttempts = platformStore.quizAttempts.filter((a) =>
    p.juniorAttemptIds.includes(a.id)
  );

  const seniorCompletedCount = seniorSessions.filter(
    (s) => s.status === "completed"
  ).length;
  const juniorCompletedCount = juniorAttempts.filter(
    (a) => a.status === "completed"
  ).length;

  const juniorStreams = Array.from(new Set(juniorAttempts.map((a) => a.stream)));
  const juniorSubjects = Array.from(
    new Set(juniorAttempts.map((a) => a.subjectName))
  );

  const modesPlayed: ExperienceMode[] = [];
  if (seniorSessions.length > 0) modesPlayed.push("senior");
  if (juniorAttempts.length > 0) modesPlayed.push("junior");

  return {
    participant: {
      participantId: p.participantId,
      isAnonymous: p.isAnonymous,
      username: p.username,
      fullName: p.fullName,
      instagramHandle: p.instagramHandle,
      registeredAt: p.registeredAt,
      lastActivityAt: p.lastActivityAt,
      accountStatus:
        seniorCompletedCount + juniorCompletedCount > 0
          ? "Active · Completed Runs"
          : "Active · In Progress",
    },
    summaryMetrics: {
      totalSessions: seniorSessions.length + juniorAttempts.length,
      totalModesPlayed: modesPlayed.length,
      seniorSessions: seniorSessions.length,
      juniorAttempts: juniorAttempts.length,
      totalCompletedExperiences: seniorCompletedCount + juniorCompletedCount,
    },
    seniorSummary: {
      played: seniorSessions.length > 0,
      sessionCount: seniorSessions.length,
      completedCount: seniorCompletedCount,
      completionStatus:
        seniorSessions.length === 0
          ? "Not Played"
          : seniorCompletedCount > 0
          ? "Completed"
          : `In Progress (Ch. 0${seniorSessions[0]?.current_chapter || 1})`,
      latestArchetype: seniorSessions[0]?.result_archetype || null,
      lastPlayedAt:
        seniorSessions[0]?.completed_at || seniorSessions[0]?.started_at || null,
    },
    juniorSummary: {
      played: juniorAttempts.length > 0,
      streams: juniorStreams,
      primaryStream: juniorStreams[0] || null,
      subjectsAttempted: juniorSubjects,
      totalAttempts: juniorAttempts.length,
      completedAttempts: juniorCompletedCount,
      lastPlayedAt:
        juniorAttempts[0]?.completedAt || juniorAttempts[0]?.startedAt || null,
    },
  };
}

export async function getParticipantJuniorDashboard(participantId: string) {
  const { participants, platformStore } = await buildUnifiedParticipantMap();
  const decodedId = decodeURIComponent(participantId);
  const p = participants.get(decodedId);

  if (!p) {
    return null;
  }

  const attemptsAsc = platformStore.quizAttempts
    .filter((a) => a.participantId === p.participantId)
    .sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );

  const completedAttempts = attemptsAsc.filter((a) => a.status === "completed");
  const streamsUsed = Array.from(new Set(attemptsAsc.map((a) => a.stream)));
  const primaryStream: StreamSlug = streamsUsed[0] || "science";

  const totalQuestionsAnswered = completedAttempts.reduce(
    (acc, a) =>
      acc +
      a.responses.filter((r) => r.selectedDisplayKey !== null).length,
    0
  );
  const totalCorrect = completedAttempts.reduce(
    (acc, a) => acc + (a.correctCount || 0),
    0
  );
  const totalIncorrect = completedAttempts.reduce(
    (acc, a) => acc + (a.incorrectCount || 0),
    0
  );
  const avgScoreOutOf10 =
    completedAttempts.length > 0
      ? Math.round(
          (completedAttempts.reduce(
            (acc, a) => acc + (a.scoreOutOf10 || 0),
            0
          ) /
            completedAttempts.length) *
            10
        ) / 10
      : null;
  const overallAccuracyPct =
    completedAttempts.length > 0
      ? Math.round((totalCorrect / (completedAttempts.length * 10)) * 100)
      : null;

  // Subject-by-subject performance
  const bySubject = new Map<
    string,
    {
      subjectSlug: string;
      subjectName: string;
      stream: StreamSlug;
      attempts: QuizAttemptRecord[];
    }
  >();
  for (const att of completedAttempts) {
    const cur = bySubject.get(att.subjectSlug) || {
      subjectSlug: att.subjectSlug,
      subjectName: att.subjectName,
      stream: att.stream,
      attempts: [],
    };
    cur.attempts.push(att);
    bySubject.set(att.subjectSlug, cur);
  }

  const subjectPerformance = Array.from(bySubject.values()).map((grp) => {
    const scores = grp.attempts.map((a) => a.scoreOutOf10 || 0);
    const avg =
      Math.round(
        (scores.reduce((acc, v) => acc + v, 0) / scores.length) * 10
      ) / 10;
    const highest = Math.max(...scores);
    const latest = scores[scores.length - 1];
    const accuracy = Math.round(
      (scores.reduce((acc, v) => acc + v, 0) / (scores.length * 10)) * 100
    );

    const chaptersCovered = new Set<string>();
    for (const a of grp.attempts) {
      for (const q of a.questions) {
        chaptersCovered.add(`Ch.${q.chapterNumber}: ${q.chapter}`);
      }
    }

    return {
      subjectSlug: grp.subjectSlug,
      subjectName: grp.subjectName,
      stream: grp.stream,
      attemptsCount: grp.attempts.length,
      avgScoreOutOf10: avg,
      highestScoreOutOf10: highest,
      latestScoreOutOf10: latest,
      accuracyPct: accuracy,
      chaptersCoveredCount: chaptersCovered.size,
      chaptersSample: Array.from(chaptersCovered).slice(0, 6),
    };
  });

  // Stream-specific cumulative Ability Indicators
  const abilityAnalysisByStream: {
    stream: StreamSlug;
    streamName: string;
    indicators: AbilityIndicatorEvaluation[];
  }[] = (streamsUsed.length > 0 ? streamsUsed : [primaryStream]).map((st) => ({
    stream: st,
    streamName: ACADEMIC_STREAMS[st].name,
    indicators: aggregateParticipantAbilityIndicators(
      st,
      completedAttempts.filter((a) => a.stream === st)
    ),
  }));

  const latestCompletedResult =
    completedAttempts.length > 0
      ? platformStore.juniorResults[
          completedAttempts[completedAttempts.length - 1].id
        ] || null
      : null;

  return {
    participant: {
      participantId: p.participantId,
      username: p.username,
      fullName: p.fullName,
      isAnonymous: p.isAnonymous,
    },
    header: {
      streams: streamsUsed,
      primaryStreamName:
        streamsUsed.length > 0
          ? streamsUsed.map((s) => ACADEMIC_STREAMS[s].name).join(" & ")
          : "Not Started",
      firstParticipationAt: attemptsAsc[0]?.startedAt || null,
      mostRecentAttemptAt:
        attemptsAsc[attemptsAsc.length - 1]?.completedAt ||
        attemptsAsc[attemptsAsc.length - 1]?.startedAt ||
        null,
    },
    summaryCards: {
      totalAttempts: attemptsAsc.length,
      completedAttempts: completedAttempts.length,
      totalQuestionsAnswered,
      correctAnswers: totalCorrect,
      incorrectAnswers: totalIncorrect,
      avgScoreOutOf10,
      overallAccuracyPct,
      completedSubjectsCount: subjectPerformance.length,
    },
    subjectPerformance,
    scoreTrendSeries: completedAttempts.map((a, idx) => ({
      index: idx + 1,
      attemptId: a.id,
      subjectName: a.subjectName,
      scoreOutOf10: a.scoreOutOf10 || 0,
      accuracyPct: a.accuracyPct || 0,
      completedAt: a.completedAt || a.startedAt,
    })),
    abilityAnalysisByStream,
    latestDescriptiveProfile:
      latestCompletedResult?.descriptiveProfile || null,
    attemptHistory: [...attemptsAsc].reverse().map((a) => ({
      attemptId: a.id,
      subjectSlug: a.subjectSlug,
      subjectName: a.subjectName,
      stream: a.stream,
      attemptNumber: a.attemptNumber,
      scoreOutOf10: a.scoreOutOf10,
      accuracyPct: a.accuracyPct,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      durationSeconds: a.durationSeconds,
      status: a.status,
    })),
  };
}

export async function getParticipantJuniorAttemptDetail(
  participantId: string,
  attemptId: string
) {
  const { participants, platformStore } = await buildUnifiedParticipantMap();
  const decodedPlayerId = decodeURIComponent(participantId);
  const p = participants.get(decodedPlayerId);
  if (!p) return null;

  const att = platformStore.quizAttempts.find(
    (a) => a.id === attemptId && a.participantId === p.participantId
  );
  if (!att) return null;

  const storedResult = platformStore.juniorResults[att.id];

  // Reconstruct question inspection even if attempt is still in_progress or abandoned
  const respByQ = new Map(att.responses.map((r) => [r.questionId, r]));
  const questionsInspection = [...att.questions]
    .sort((a, b) => a.slotNumber - b.slotNumber)
    .map((q) => {
      const resp = respByQ.get(q.questionId);
      const selectedKey = resp?.selectedDisplayKey ?? null;
      const selectedOpt = selectedKey
        ? q.presentedOptions.find((o) => o.displayKey === selectedKey)
        : null;
      const correctOpt =
        q.presentedOptions.find((o) => o.displayKey === q.correctDisplayKey) ||
        q.presentedOptions[0];

      return {
        slotNumber: q.slotNumber,
        questionId: q.questionId,
        questionVersion: q.questionVersion,
        chapterNumber: q.chapterNumber,
        chapter: q.chapter,
        topic: q.topic,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.presentedOptions.map((o) => ({
          key: o.displayKey,
          text: o.text,
        })),
        selectedOptionKey: selectedKey,
        selectedOptionText: selectedOpt?.text ?? null,
        correctOptionKey: q.correctDisplayKey,
        correctOptionText: correctOpt.text,
        isCorrect: Boolean(resp?.isCorrect),
        explanation: q.explanation,
        syllabusReference: q.syllabusReference,
        responseTimeMs: resp?.responseTimeMs ?? null,
      };
    });

  return {
    participant: {
      participantId: p.participantId,
      username: p.username,
      fullName: p.fullName,
      isAnonymous: p.isAnonymous,
    },
    attempt: {
      attemptId: att.id,
      stream: att.stream,
      subjectSlug: att.subjectSlug,
      subjectName: att.subjectName,
      board: att.board,
      academicYear: att.academicYear,
      standard: att.standard,
      difficultyPreference: att.difficultyPreference,
      attemptNumber: att.attemptNumber,
      cycleNumber: att.cycleNumber,
      status: att.status,
      startedAt: att.startedAt,
      completedAt: att.completedAt,
      durationSeconds: att.durationSeconds,
      scoreOutOf10: att.scoreOutOf10,
      correctCount: att.correctCount,
      incorrectCount: att.incorrectCount,
      accuracyPct: att.accuracyPct,
      scoringAlgorithmVersion: att.scoringAlgorithmVersion,
    },
    abilityIndicators: storedResult?.abilityIndicators || [],
    descriptiveProfile: storedResult?.descriptiveProfile || null,
    questions: questionsInspection,
  };
}

export async function getParticipantSeniorDashboard(participantId: string) {
  const { participants, seniorDataset } = await buildUnifiedParticipantMap();
  const decodedId = decodeURIComponent(participantId);
  const p = participants.get(decodedId);
  if (!p) return null;

  const sessions = seniorDataset.sessions
    .filter((s) => p.seniorSessionIds.includes(s.id))
    .sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

  if (sessions.length === 0) {
    return {
      participant: {
        participantId: p.participantId,
        username: p.username,
        fullName: p.fullName,
        isAnonymous: p.isAnonymous,
      },
      played: false,
      sessions: [],
      primarySession: null,
      chaptersProgress: [],
      decisions: [],
      cluesDiscovered: [],
      challengesCompleted: [],
      seventhDoorStatus: { unlocked: false, completed: false, choice: null },
      hiddenLetterStatus: { unlocked: false, read: false },
      report: null as GameplayReport | null,
      timeline: [] as GameplayEvent[],
    };
  }

  const primary = sessions[0];
  const events = seniorDataset.events
    .filter((e) => e.session_id === primary.id)
    .sort(
      (a, b) =>
        new Date(a.created_at || 0).getTime() -
        new Date(b.created_at || 0).getTime()
    );
  const prefs = seniorDataset.preferences.filter(
    (pr) => pr.session_id === primary.id
  );

  const report = evaluateReport(
    primary.id,
    p.fullName,
    events,
    prefs,
    primary.completed_at || primary.started_at,
    primary.character_presentation
  );

  const clueIds = Array.from(
    new Set(
      events
        .filter((e) => e.event_type === "clue_inspected")
        .map((e) => String(e.event_data?.clueId || ""))
        .filter(Boolean)
    )
  );

  const seventhDoorUnlocked =
    clueIds.length >= 3 ||
    events.some(
      (e) =>
        e.event_type === "seventh_door_unlocked" ||
        e.event_type === "seventh_door_completed"
    );
  const seventhDoorCompletedEv = events.find(
    (e) => e.event_type === "seventh_door_completed"
  );

  const hiddenLetterUnlocked =
    clueIds.length >= 2 ||
    events.some(
      (e) =>
        e.event_type === "hidden_letter_unlocked" ||
        e.event_type === "hidden_letter_read"
    );
  const hiddenLetterRead = events.some(
    (e) => e.event_type === "hidden_letter_read"
  );

  const chaptersProgress = [1, 2, 3, 4, 5, 6].map((ch) => {
    const visited =
      primary.current_chapter >= ch ||
      events.some((e) => e.chapter === ch && e.event_type === "chapter_started");
    const completed =
      primary.status === "completed" ||
      primary.current_chapter > ch ||
      events.some(
        (e) => e.chapter === ch && e.event_type === "chapter_completed"
      );
    return { chapter: ch, visited, completed };
  });

  const decisions = events
    .filter((e) => e.event_type === "choice_selected")
    .map((e) => ({
      chapter: e.chapter,
      choiceKey: String(
        e.event_data?.choiceId || e.event_data?.environment || "choice"
      ),
      detail: e.event_data,
      timestamp: e.created_at || primary.started_at,
    }));

  const challengesCompleted = events
    .filter((e) => e.event_type === "puzzle_attempted")
    .map((e) => ({
      chapter: e.chapter,
      puzzle: String(e.event_data?.puzzle || `Chapter ${e.chapter} Challenge`),
      isCorrect: Boolean(e.event_data?.isCorrect),
      attemptCount: Number(e.event_data?.attemptCount || 1),
      timeToSolveMs: e.event_data?.timeToSolveMs
        ? Number(e.event_data.timeToSolveMs)
        : null,
    }));

  return {
    participant: {
      participantId: p.participantId,
      username: p.username,
      fullName: p.fullName,
      isAnonymous: p.isAnonymous,
    },
    played: true,
    sessions: sessions.map((s) => ({
      id: s.id,
      status: s.status,
      currentChapter: s.current_chapter,
      archetype: s.result_archetype || null,
      startedAt: s.started_at,
      completedAt: s.completed_at || null,
    })),
    primarySession: {
      id: primary.id,
      status: primary.status,
      currentChapter: primary.current_chapter,
      characterPresentation: primary.character_presentation,
      startedAt: primary.started_at,
      completedAt: primary.completed_at || null,
    },
    chaptersProgress,
    decisions,
    cluesDiscovered: clueIds,
    challengesCompleted,
    seventhDoorStatus: {
      unlocked: seventhDoorUnlocked,
      completed: Boolean(seventhDoorCompletedEv),
      choice: seventhDoorCompletedEv?.event_data?.doorChoice
        ? String(seventhDoorCompletedEv.event_data.doorChoice)
        : null,
    },
    hiddenLetterStatus: {
      unlocked: hiddenLetterUnlocked,
      read: hiddenLetterRead,
    },
    report,
    timeline: events,
  };
}

// =============================================================================
// EXECUTIVE ADMIN DASHBOARD & CROSS-MODE ANALYTICS SERVICE
// =============================================================================

export async function getUnifiedAdminOverview() {
  const { participants, seniorDataset, platformStore } =
    await buildUnifiedParticipantMap();

  const pList = Array.from(participants.values());
  const seniorParticipants = pList.filter(
    (p) => p.seniorSessionIds.length > 0
  ).length;
  const juniorParticipants = pList.filter(
    (p) => p.juniorAttemptIds.length > 0
  ).length;

  const seniorCompleted = seniorDataset.sessions.filter(
    (s) => s.status === "completed"
  ).length;
  const juniorAttempts = platformStore.quizAttempts;
  const juniorCompleted = juniorAttempts.filter(
    (a) => a.status === "completed"
  );

  const totalSessionsAndAttempts =
    seniorDataset.sessions.length + juniorAttempts.length;
  const totalCompletedGames = seniorCompleted + juniorCompleted.length;

  const completionRatePct =
    totalSessionsAndAttempts > 0
      ? Math.round((totalCompletedGames / totalSessionsAndAttempts) * 100)
      : null;

  const avgJuniorScore =
    juniorCompleted.length > 0
      ? Math.round(
          (juniorCompleted.reduce((acc, a) => acc + (a.scoreOutOf10 || 0), 0) /
            juniorCompleted.length) *
            10
        ) / 10
      : null;

  const streamParticipation = (["science", "commerce", "arts"] as StreamSlug[]).map(
    (st) => {
      const atts = juniorAttempts.filter((a) => a.stream === st);
      const comp = atts.filter((a) => a.status === "completed");
      return {
        stream: st,
        streamName: ACADEMIC_STREAMS[st].name,
        attempts: atts.length,
        completed: comp.length,
        avgScore:
          comp.length > 0
            ? Math.round(
                (comp.reduce((s, a) => s + (a.scoreOutOf10 || 0), 0) /
                  comp.length) *
                  10
              ) / 10
            : null,
      };
    }
  );

  const subjects = listAcademicSubjects({ includeInactive: true });
  const subjectParticipation = subjects.map((subj) => {
    const atts = juniorAttempts.filter((a) => a.subjectSlug === subj.slug);
    const comp = atts.filter((a) => a.status === "completed");
    return {
      subjectSlug: subj.slug,
      subjectName: subj.name,
      stream: subj.stream,
      publishedQuestions: subj.publishedQuestionCount,
      attempts: atts.length,
      completed: comp.length,
      avgScore:
        comp.length > 0
          ? Math.round(
              (comp.reduce((s, a) => s + (a.scoreOutOf10 || 0), 0) /
                comp.length) *
                10
            ) / 10
          : null,
    };
  });

  const recentAttempts = juniorAttempts.slice(0, 12).map((a) => {
    const p = participants.get(a.participantId);
    return {
      attemptId: a.id,
      participantId: a.participantId,
      participantName: p?.fullName || "Anonymous Participant",
      username: p?.username || "anonymous",
      stream: a.stream,
      subjectName: a.subjectName,
      scoreOutOf10: a.scoreOutOf10,
      accuracyPct: a.accuracyPct,
      status: a.status,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
    };
  });

  const landingVisits = seniorDataset.events.filter(
    (e) => e.event_type === "landing_view"
  ).length;

  return {
    storageBackend: seniorDataset.backend,
    schemaReady: seniorDataset.schemaReady,
    schemaNotice: seniorDataset.schemaNotice,
    landingVisits,
    totalParticipants: pList.length,
    seniorParticipants,
    juniorParticipants,
    totalSessions: totalSessionsAndAttempts,
    completedGames: totalCompletedGames,
    completionRatePct,
    avgJuniorScore,
    streamParticipation,
    subjectParticipation,
    recentAttempts,
    auditLogsCount: platformStore.auditLogs.length,
  };
}

export async function listAllJuniorAttemptsAdmin(filters?: {
  stream?: StreamSlug;
  subjectSlug?: string;
  status?: QuizAttemptRecord["status"];
}) {
  const { participants, platformStore } = await buildUnifiedParticipantMap();
  let list = [...platformStore.quizAttempts];

  if (filters?.stream) {
    list = list.filter((a) => a.stream === filters.stream);
  }
  if (filters?.subjectSlug) {
    list = list.filter((a) => a.subjectSlug === filters.subjectSlug);
  }
  if (filters?.status) {
    list = list.filter((a) => a.status === filters.status);
  }

  return list.map((a) => {
    const p = participants.get(a.participantId);
    return {
      attemptId: a.id,
      participantId: a.participantId,
      participantName: p?.fullName || "Anonymous Participant",
      username: p?.username || "anonymous",
      stream: a.stream,
      subjectSlug: a.subjectSlug,
      subjectName: a.subjectName,
      difficultyPreference: a.difficultyPreference,
      attemptNumber: a.attemptNumber,
      cycleNumber: a.cycleNumber,
      scoreOutOf10: a.scoreOutOf10,
      accuracyPct: a.accuracyPct,
      status: a.status,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      durationSeconds: a.durationSeconds,
    };
  });
}

export function listAdminAuditLogs(limit: number = 50): AdminAuditLogEntry[] {
  const store = readPlatformStore();
  return store.auditLogs.slice(0, limit);
}

/**
 * Parses RFC-4180 CSV text exported or authored in the Question Bank schema.
 */
export function parseQuestionsCsv(csvText: string): Partial<QuestionBankRecord>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  const normalized = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (inQuotes) {
      if (ch === '"') {
        if (normalized[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      currentRow.push(currentField);
      currentField = "";
    } else if (ch === "\n") {
      currentRow.push(currentField);
      if (currentRow.some((cell) => cell.trim() !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += ch;
    }
  }
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((cell) => cell.trim() !== "")) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  const records: Partial<QuestionBankRecord>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = (cells[idx] ?? "").trim();
    });

    if (!rowObj.questionText || !rowObj.subjectSlug) continue;

    const streamVal = (rowObj.stream?.toLowerCase() || "science") as StreamSlug;
    const diffVal = (rowObj.difficulty || "Medium") as QuestionDifficulty;
    const correctVal = (rowObj.correctKey?.toUpperCase() || "A") as OptionKey;
    const pubVal = (rowObj.publicationStatus || "draft") as PublicationStatus;
    const reviewedVal =
      rowObj.reviewed === "true" || rowObj.reviewed === "1";

    records.push({
      id: rowObj.id || undefined,
      board: rowObj.board || "MSBSHSE",
      academicYear: rowObj.academicYear || "2025-26",
      standard: rowObj.standard || "Class 11 (FYJC)",
      stream: ["science", "commerce", "arts"].includes(streamVal)
        ? streamVal
        : "science",
      subjectSlug: rowObj.subjectSlug,
      subjectName: rowObj.subjectName || rowObj.subjectSlug,
      chapterNumber: Math.max(1, Number(rowObj.chapterNumber || 1)),
      chapter: rowObj.chapter || "General Syllabus",
      topic: rowObj.topic || "Core Concept",
      difficulty: ["Easy", "Medium", "Hard"].includes(diffVal)
        ? diffVal
        : "Medium",
      questionText: rowObj.questionText,
      options: [
        { key: "A", text: rowObj.optionA || "Option A" },
        { key: "B", text: rowObj.optionB || "Option B" },
        { key: "C", text: rowObj.optionC || "Option C" },
        { key: "D", text: rowObj.optionD || "Option D" },
      ],
      correctKey: ["A", "B", "C", "D"].includes(correctVal) ? correctVal : "A",
      explanation: rowObj.explanation || "Verified syllabus explanation.",
      syllabusReference:
        rowObj.syllabusReference || "MSBSHSE Class 11 Syllabus",
      abilityTags: rowObj.abilityTags
        ? (rowObj.abilityTags
            .split("|")
            .map((t) => t.trim())
            .filter(Boolean) as AbilityIndicatorKey[])
        : (["analytical_thinking"] as AbilityIndicatorKey[]),
      publicationStatus: ["draft", "published", "archived"].includes(pubVal)
        ? pubVal
        : "draft",
      reviewed: reviewedVal,
    });
  }

  return records;
}

export function importAdminQuestionsBatch(
  items: Partial<QuestionBankRecord>[],
  adminEmail: string
): { importedCount: number; updatedCount: number; skippedCount: number } {
  const store = readPlatformStore();
  const existingAll = new Map(getAllEffectiveQuestions().map((q) => [q.id, q]));
  const now = new Date().toISOString();

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const raw of items) {
    if (
      !raw.questionText?.trim() ||
      !raw.subjectSlug?.trim() ||
      !Array.isArray(raw.options) ||
      raw.options.length !== 4 ||
      !raw.correctKey
    ) {
      skippedCount += 1;
      continue;
    }

    const isReviewed = Boolean(raw.reviewed);
    const safeStatus: PublicationStatus =
      raw.publicationStatus === "published" && !isReviewed
        ? "draft"
        : raw.publicationStatus || "draft";

    const id =
      raw.id?.trim() ||
      `msb-11-${raw.subjectSlug}-${crypto.randomUUID().slice(0, 8)}`;

    const prev = existingAll.get(id);
    if (prev) {
      store.questionOverrides[id] = {
        ...prev,
        board: raw.board || prev.board,
        academicYear: raw.academicYear || prev.academicYear,
        standard: raw.standard || prev.standard,
        stream: raw.stream || prev.stream,
        subjectSlug: raw.subjectSlug || prev.subjectSlug,
        subjectName: raw.subjectName || prev.subjectName,
        chapterNumber: raw.chapterNumber || prev.chapterNumber,
        chapter: raw.chapter || prev.chapter,
        topic: raw.topic || prev.topic,
        difficulty: raw.difficulty || prev.difficulty,
        questionText: raw.questionText.trim(),
        options: raw.options,
        correctKey: raw.correctKey,
        explanation: raw.explanation || prev.explanation,
        syllabusReference: raw.syllabusReference || prev.syllabusReference,
        abilityTags:
          raw.abilityTags && raw.abilityTags.length > 0
            ? raw.abilityTags
            : prev.abilityTags,
        publicationStatus: safeStatus,
        reviewed: isReviewed,
        reviewedAt: isReviewed ? prev.reviewedAt || now : null,
        version: prev.version + 1,
      };
      updatedCount += 1;
    } else {
      const created: QuestionBankRecord = {
        id,
        board: raw.board || "MSBSHSE",
        academicYear: raw.academicYear || "2025-26",
        standard: raw.standard || "Class 11 (FYJC)",
        stream: raw.stream || "science",
        subjectSlug: raw.subjectSlug,
        subjectName: raw.subjectName || raw.subjectSlug,
        chapterNumber: raw.chapterNumber || 1,
        chapter: raw.chapter || "General Syllabus",
        topic: raw.topic || "Core Concept",
        difficulty: raw.difficulty || "Medium",
        questionText: raw.questionText.trim(),
        options: raw.options,
        correctKey: raw.correctKey,
        explanation: raw.explanation || "Verified syllabus explanation.",
        syllabusReference:
          raw.syllabusReference || "MSBSHSE Class 11 Syllabus",
        abilityTags:
          raw.abilityTags && raw.abilityTags.length > 0
            ? raw.abilityTags
            : ["analytical_thinking"],
        publicationStatus: safeStatus,
        reviewed: isReviewed,
        version: 1,
        usageCount: 0,
        createdAt: now,
        reviewedAt: isReviewed ? now : null,
      };
      store.customQuestions.unshift(created);
      importedCount += 1;
    }
  }

  store.auditLogs.unshift({
    id: crypto.randomUUID(),
    adminEmail,
    action: "questions_batch_import",
    entityType: "question_bank",
    entityId: "batch",
    summary: `Batch imported ${importedCount} new, updated ${updatedCount}, skipped ${skippedCount} questions`,
    createdAt: now,
  });

  writePlatformStore(store);
  return { importedCount, updatedCount, skippedCount };
}

export async function getUnifiedAdminAnalytics() {
  const overview = await getUnifiedAdminOverview();
  const { seniorDataset, platformStore } = await buildUnifiedParticipantMap();

  const modeSelections = {
    senior: seniorDataset.events.filter(
      (e) =>
        (e.event_type === "mode_selected" && e.event_data?.mode === "senior") ||
        e.event_type === "game_started"
    ).length,
    junior:
      seniorDataset.events.filter(
        (e) =>
          e.event_type === "mode_selected" && e.event_data?.mode === "junior"
      ).length || platformStore.quizAttempts.length,
  };

  // Chapter-level Junior accuracy across all completed attempts
  const chapterAgg = new Map<
    string,
    {
      subjectName: string;
      stream: StreamSlug;
      chapter: string;
      total: number;
      correct: number;
    }
  >();

  for (const att of platformStore.quizAttempts) {
    if (att.status !== "completed") continue;
    const respMap = new Map(att.responses.map((r) => [r.questionId, r]));
    for (const q of att.questions) {
      const key = `${att.subjectSlug}::${q.chapterNumber}`;
      const cur = chapterAgg.get(key) || {
        subjectName: att.subjectName,
        stream: att.stream,
        chapter: `Ch.${q.chapterNumber}: ${q.chapter}`,
        total: 0,
        correct: 0,
      };
      cur.total += 1;
      if (respMap.get(q.questionId)?.isCorrect) {
        cur.correct += 1;
      }
      chapterAgg.set(key, cur);
    }
  }

  const juniorChapterAccuracy = Array.from(chapterAgg.values())
    .map((c) => ({
      ...c,
      accuracyPct: Math.round((c.correct / c.total) * 100),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 24);

  // Seventh Door & Hidden Letter discovery metrics in Senior Mode
  const seventhDoorUnlocks = new Set(
    seniorDataset.events
      .filter(
        (e) =>
          e.event_type === "seventh_door_unlocked" ||
          e.event_type === "seventh_door_completed"
      )
      .map((e) => e.session_id)
  ).size;
  const seventhDoorCompletions = new Set(
    seniorDataset.events
      .filter((e) => e.event_type === "seventh_door_completed")
      .map((e) => e.session_id)
  ).size;
  const hiddenLetterReads = new Set(
    seniorDataset.events
      .filter((e) => e.event_type === "hidden_letter_read")
      .map((e) => e.session_id)
  ).size;

  const allQuestions = getAllEffectiveQuestions();
  const usedQuestionsCount = allQuestions.filter(
    (q) => (q.usageCount || 0) > 0
  ).length;

  return {
    overview,
    modeSelections,
    juniorChapterAccuracy,
    seniorSecretMetrics: {
      seventhDoorUnlocks,
      seventhDoorCompletions,
      hiddenLetterReads,
    },
    questionBankHealth: {
      totalQuestions: allQuestions.length,
      publishedQuestions: allQuestions.filter(
        (q) => q.publicationStatus === "published" && q.reviewed
      ).length,
      draftOrUnreviewedQuestions: allQuestions.filter(
        (q) => q.publicationStatus !== "published" || !q.reviewed
      ).length,
      usedQuestionsCount,
      unusedQuestionsCount: Math.max(0, allQuestions.length - usedQuestionsCount),
    },
  };
}
