import type {
  AttemptQuestionSnapshot,
  DifficultyPreference,
  OptionKey,
  PublicAttemptQuestionView,
  QuestionBankRecord,
} from "../platform-types";

export const QUESTIONS_PER_ATTEMPT = 10;
export const RESERVATION_TTL_MS = 30 * 60 * 1000; // 30-minute fair reservation policy

const DISPLAY_KEYS: OptionKey[] = ["A", "B", "C", "D"];

/**
 * Cryptographically unbiased or injectable Fisher-Yates shuffle.
 */
export function shuffleArray<T>(
  items: readonly T[],
  rng: () => number = defaultSecureRandom
): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function defaultSecureRandom(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / (0xffffffff + 1);
}

/**
 * Shuffles a question's 4 options and computes the exact mapped display correct key (A..D)
 * while retaining canonical keys and question version for historical auditability.
 */
export function createAttemptQuestionSnapshot(
  question: QuestionBankRecord,
  slotNumber: number,
  rng: () => number = defaultSecureRandom
): AttemptQuestionSnapshot {
  if (question.options.length !== 4) {
    throw new Error(
      `Question ${question.id} must have exactly 4 options; found ${question.options.length}.`
    );
  }

  const shuffledOpts = shuffleArray(question.options, rng);
  let correctDisplayKey: OptionKey | null = null;

  const presentedOptions = shuffledOpts.map((opt, idx) => {
    const displayKey = DISPLAY_KEYS[idx];
    if (opt.key === question.correctKey) {
      correctDisplayKey = displayKey;
    }
    return {
      displayKey,
      canonicalKey: opt.key,
      text: opt.text,
    };
  });

  if (!correctDisplayKey) {
    throw new Error(
      `Question ${question.id} correctKey '${question.correctKey}' did not match any option key.`
    );
  }

  return {
    slotNumber,
    questionId: question.id,
    questionVersion: question.version,
    chapterNumber: question.chapterNumber,
    chapter: question.chapter,
    topic: question.topic,
    difficulty: question.difficulty,
    questionText: question.questionText,
    diagramType: question.diagramType ?? null,
    presentedOptions,
    canonicalCorrectKey: question.correctKey,
    correctDisplayKey,
    explanation: question.explanation,
    syllabusReference: question.syllabusReference,
    abilityTags: [...question.abilityTags],
  };
}

/**
 * Strips all answer keys, explanations, and canonical mappings before sending an
 * active attempt to the browser.
 */
export function toPublicQuestionViews(
  snapshots: readonly AttemptQuestionSnapshot[]
): PublicAttemptQuestionView[] {
  return snapshots.map((s) => ({
    slotNumber: s.slotNumber,
    questionId: s.questionId,
    questionVersion: s.questionVersion,
    chapterNumber: s.chapterNumber,
    chapter: s.chapter,
    topic: s.topic,
    difficulty: s.difficulty,
    questionText: s.questionText,
    diagramType: s.diagramType ?? null,
    options: s.presentedOptions.map((o) => ({
      key: o.displayKey,
      text: o.text,
    })),
  }));
}

export interface SelectAttemptQuestionsInput {
  subjectBank: readonly QuestionBankRecord[];
  completedQuestionIds: readonly string[];
  activeReservedQuestionIds?: readonly string[];
  currentCycleNumber: number;
  difficultyPreference?: DifficultyPreference;
  rng?: () => number;
}

export interface SelectAttemptQuestionsOutput {
  snapshots: AttemptQuestionSnapshot[];
  selectedQuestionIds: string[];
  nextCycleNumber: number;
  didRollOverCycle: boolean;
  /**
   * When a new cycle begins because the subject's published bank was exhausted,
   * `resetCompletedIdsTo` becomes `[]` (completed IDs are only recorded upon submission!).
   */
  resetCompletedIdsBeforeAttempt: boolean;
}

/**
 * Server-side 10-question selection engine implementing:
 * - Published-only eligibility
 * - Zero duplicate questions within an attempt
 * - Zero repetition of previously completed questions in the subject until all 100 are exhausted
 * - Fair temporary exclusion of non-expired reserved questions
 * - Automatic new-cycle rollover once the bank is exhausted
 * - Difficulty preference prioritization while upholding the 10-question & non-repeat invariants
 * - Randomized question order AND randomized option order with verified answer mapping
 */
export function selectQuestionsForAttempt(
  input: SelectAttemptQuestionsInput
): SelectAttemptQuestionsOutput {
  const rng = input.rng || defaultSecureRandom;
  const published = input.subjectBank.filter(
    (q) => q.publicationStatus === "published" && q.reviewed === true
  );

  if (published.length < QUESTIONS_PER_ATTEMPT) {
    throw new Error(
      `Subject bank requires at least ${QUESTIONS_PER_ATTEMPT} published, reviewed questions; found ${published.length}.`
    );
  }

  const completedSet = new Set(input.completedQuestionIds);
  const reservedSet = new Set(input.activeReservedQuestionIds || []);

  // Unseen & unreserved pool in the current cycle
  let unseenPool = published.filter(
    (q) => !completedSet.has(q.id) && !reservedSet.has(q.id)
  );

  // If active reservations temporarily starved the pool, release reservations before rolling cycle
  if (unseenPool.length < QUESTIONS_PER_ATTEMPT && reservedSet.size > 0) {
    unseenPool = published.filter((q) => !completedSet.has(q.id));
  }

  let nextCycleNumber = input.currentCycleNumber;
  let didRollOverCycle = false;
  let resetCompletedIdsBeforeAttempt = false;
  let chosenRecords: QuestionBankRecord[] = [];

  const pickWithDifficultyPreference = (
    pool: readonly QuestionBankRecord[],
    countNeeded: number
  ): QuestionBankRecord[] => {
    const pref = input.difficultyPreference || "Mixed";
    if (pref === "Mixed") {
      // Balanced draw when Mixed: aim for ~3 Easy, ~4 Medium, ~3 Hard when available in pool
      const easy = shuffleArray(
        pool.filter((q) => q.difficulty === "Easy"),
        rng
      );
      const medium = shuffleArray(
        pool.filter((q) => q.difficulty === "Medium"),
        rng
      );
      const hard = shuffleArray(
        pool.filter((q) => q.difficulty === "Hard"),
        rng
      );

      const picked: QuestionBankRecord[] = [
        ...easy.slice(0, Math.min(3, countNeeded)),
      ];
      if (picked.length < countNeeded) {
        picked.push(
          ...medium.slice(0, Math.min(4, countNeeded - picked.length))
        );
      }
      if (picked.length < countNeeded) {
        picked.push(...hard.slice(0, Math.min(3, countNeeded - picked.length)));
      }
      if (picked.length < countNeeded) {
        const pickedIds = new Set(picked.map((p) => p.id));
        const remainder = shuffleArray(
          pool.filter((q) => !pickedIds.has(q.id)),
          rng
        );
        picked.push(...remainder.slice(0, countNeeded - picked.length));
      }
      return picked.slice(0, countNeeded);
    }

    // Specific difficulty preference: prioritize unseen matching difficulty first, then fill from unseen pool
    const matching = shuffleArray(
      pool.filter((q) => q.difficulty === pref),
      rng
    );
    if (matching.length >= countNeeded) {
      return matching.slice(0, countNeeded);
    }
    const others = shuffleArray(
      pool.filter((q) => q.difficulty !== pref),
      rng
    );
    return [...matching, ...others].slice(0, countNeeded);
  };

  if (unseenPool.length >= QUESTIONS_PER_ATTEMPT) {
    chosenRecords = pickWithDifficultyPreference(
      unseenPool,
      QUESTIONS_PER_ATTEMPT
    );
  } else if (unseenPool.length === 0) {
    // All 100 published questions in this subject have been completed -> start a fresh cycle!
    nextCycleNumber = input.currentCycleNumber + 1;
    didRollOverCycle = true;
    resetCompletedIdsBeforeAttempt = true;
    const freshPool = published.filter((q) => !reservedSet.has(q.id));
    chosenRecords = pickWithDifficultyPreference(
      freshPool.length >= QUESTIONS_PER_ATTEMPT ? freshPool : published,
      QUESTIONS_PER_ATTEMPT
    );
  } else {
    // Partial remainder (< 10 unseen left at end of cycle): take ALL remaining unseen first,
    // then roll into next cycle to fill the remaining slots without duplicating within this attempt!
    nextCycleNumber = input.currentCycleNumber + 1;
    didRollOverCycle = true;
    resetCompletedIdsBeforeAttempt = true;

    const mustInclude = [...unseenPool];
    const mustIncludeIds = new Set(mustInclude.map((q) => q.id));
    const neededFromNewCycle = QUESTIONS_PER_ATTEMPT - mustInclude.length;
    const rolloverCandidates = published.filter(
      (q) => !mustIncludeIds.has(q.id)
    );
    const additional = pickWithDifficultyPreference(
      rolloverCandidates,
      neededFromNewCycle
    );
    chosenRecords = [...mustInclude, ...additional];
  }

  // Randomize final question presentation order (1..10)
  const randomizedOrder = shuffleArray(chosenRecords, rng);

  // Defensive uniqueness assertion
  const uniqueCheck = new Set(randomizedOrder.map((q) => q.id));
  if (
    randomizedOrder.length !== QUESTIONS_PER_ATTEMPT ||
    uniqueCheck.size !== QUESTIONS_PER_ATTEMPT
  ) {
    throw new Error(
      `Attempt selection invariant violated: expected ${QUESTIONS_PER_ATTEMPT} unique questions.`
    );
  }

  const snapshots = randomizedOrder.map((q, idx) =>
    createAttemptQuestionSnapshot(q, idx + 1, rng)
  );

  return {
    snapshots,
    selectedQuestionIds: snapshots.map((s) => s.questionId),
    nextCycleNumber,
    didRollOverCycle,
    resetCompletedIdsBeforeAttempt,
  };
}

