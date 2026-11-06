import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  ACADEMIC_STREAMS,
  INITIAL_ACADEMIC_SUBJECTS,
} from "../src/lib/academic-catalogue";
import {
  evaluateJuniorAttempt,
  JUNIOR_SCORING_ALGORITHM_VERSION,
} from "../src/lib/services/junior-scoring-service";
import {
  createAdminQuestion,
  exportQuestionsAsCsv,
  getAuthorizedJuniorResult,
  getEffectiveSubjectQuestionBank,
  getParticipantCentralProfile,
  getParticipantJuniorAttemptDetail,
  getParticipantJuniorDashboard,
  getParticipantSeniorDashboard,
  getPublicJuniorAttemptState,
  importAdminQuestionsBatch,
  listAcademicSubjects,
  listAdminAuditLogs,
  listParticipantsDirectory,
  loadSeededSubjectQuestions,
  parseQuestionsCsv,
  resetJuniorSubjectHistory,
  setPlatformStorePathForTests,
  setQuestionPublicationState,
  startJuniorAttempt,
  submitJuniorAttempt,
  updateAdminQuestion,
  upsertAcademicSubject,
} from "../src/lib/services/platform-store";
import {
  getOrCreateSession,
  recordEventByToken,
  setLocalStorePathForTests,
  submitProfileByToken,
} from "../src/lib/storage";
import { evaluateReport } from "../src/lib/scoring";
import { isEmailAllowed } from "../src/lib/admin-auth";
import {
  SOLO_CAMPAIGN_LEVELS,
  SOLO_ENDINGS,
} from "../src/lib/campaign/solo-campaign-data";
import { multiplayerStore } from "../src/lib/services/multiplayer-store";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "unwritten-platform-qa-"));
const tmpPlatformPath = path.join(tmpDir, "platform-store.json");
const tmpLocalPath = path.join(tmpDir, "local-store.json");

describe("THE UNWRITTEN — Master Platform Automated Verification Suite", () => {
  before(() => {
    process.env.ADMIN_EMAILS = "anishpatil146@gmail.com";
    setPlatformStorePathForTests(tmpPlatformPath);
    setLocalStorePathForTests(tmpLocalPath);
  });

  after(() => {
    setPlatformStorePathForTests(null);
    setLocalStorePathForTests(null);
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup lock on Windows
    }
  });

  it("1. Validates MSBSHSE Class 11 Academic Catalogue & All 14 Subject Question Banks (1,400 Questions)", () => {
    assert.equal(
      INITIAL_ACADEMIC_SUBJECTS.length,
      14,
      "Expected 14 MSBSHSE Class 11 subjects across Science (4), Commerce (5), and Arts (5)"
    );

    const globalStems = new Set<string>();
    const globalIds = new Set<string>();

    for (const subj of INITIAL_ACADEMIC_SUBJECTS) {
      const bank = loadSeededSubjectQuestions(subj.slug);
      assert.equal(
        bank.length,
        100,
        `Subject '${subj.slug}' (${subj.name}) must contain exactly 100 seeded questions; found ${bank.length}`
      );

      let easy = 0;
      let medium = 0;
      let hard = 0;
      const validStreamAbilities = new Set(
        ACADEMIC_STREAMS[subj.stream].abilityIndicators.map((a) => a.key)
      );

      for (const q of bank) {
        assert.ok(!globalIds.has(q.id), `Duplicate question ID: ${q.id}`);
        globalIds.add(q.id);

        const normStem = q.questionText.trim().toLowerCase();
        assert.ok(
          !globalStems.has(`${subj.slug}::${normStem}`),
          `Duplicate stem in ${subj.slug}: ${q.questionText}`
        );
        globalStems.add(`${subj.slug}::${normStem}`);

        assert.equal(q.stream, subj.stream);
        assert.equal(q.subjectSlug, subj.slug);
        assert.equal(q.publicationStatus, "published");
        assert.equal(q.reviewed, true);
        assert.equal(q.options.length, 4);

        const optKeys = q.options.map((o) => o.key).sort().join("");
        assert.equal(optKeys, "ABCD");
        assert.ok(["A", "B", "C", "D"].includes(q.correctKey));
        assert.ok(q.explanation.trim().length >= 12);
        assert.ok(q.syllabusReference.trim().length >= 6);
        assert.ok(q.abilityTags.length >= 1);
        for (const tag of q.abilityTags) {
          assert.ok(
            validStreamAbilities.has(tag),
            `Invalid ability tag '${tag}' for stream '${subj.stream}' in ${q.id}`
          );
        }

        if (q.difficulty === "Easy") easy++;
        else if (q.difficulty === "Medium") medium++;
        else if (q.difficulty === "Hard") hard++;
      }

      assert.equal(easy, 30, `${subj.slug} must have 30 Easy questions`);
      assert.equal(medium, 40, `${subj.slug} must have 40 Medium questions`);
      assert.equal(hard, 30, `${subj.slug} must have 30 Hard questions`);
    }
  });

  it("2. Serves 10 Unique Questions Without Exposing Answer Keys Prior to Submission", async () => {
    const token = "uw_test_token_alpha_0000000001";
    const started = await startJuniorAttempt({
      sessionToken: token,
      stream: "science",
      subjectSlug: "sci-physics",
      difficultyPreference: "Mixed",
      instantFeedbackEnabled: false,
    });

    assert.equal(started.questions.length, 10);
    const uniqueIds = new Set(started.questions.map((q) => q.questionId));
    assert.equal(uniqueIds.size, 10, "Zero duplicate questions within attempt");

    for (const q of started.questions) {
      assert.equal("correctKey" in q, false);
      assert.equal("correctDisplayKey" in q, false);
      assert.equal("explanation" in q, false);
      assert.equal(q.options.length, 4);
    }

    const publicState = getPublicJuniorAttemptState(started.attemptId, token);
    assert.equal(publicState.instantFeedbackMap, undefined);
  });

  it("3 & 4. Guarantees Zero Repeats Across 10 Consecutive Attempts (100 Questions) & Rolls Over to Cycle 2 on 11th Attempt", async () => {
    const token = "uw_test_cycle_exhaustive_000002";
    const seenAcrossTenRuns = new Set<string>();

    for (let run = 1; run <= 10; run++) {
      const att = await startJuniorAttempt({
        sessionToken: token,
        stream: "science",
        subjectSlug: "sci-chemistry",
        difficultyPreference: "Mixed",
      });
      assert.equal(att.cycleNumber, 1);
      assert.equal(att.questions.length, 10);

      for (const q of att.questions) {
        assert.equal(
          seenAcrossTenRuns.has(q.questionId),
          false,
          `Question ${q.questionId} repeated prematurely on run #${run}!`
        );
        seenAcrossTenRuns.add(q.questionId);
      }

      await submitJuniorAttempt({
        attemptId: att.attemptId,
        sessionToken: token,
        answers: att.questions.map((q) => ({
          questionId: q.questionId,
          selectedOptionKey: "A",
          responseTimeMs: 4200,
        })),
      });
    }

    assert.equal(
      seenAcrossTenRuns.size,
      100,
      "All 100 Chemistry questions must be exhausted without a single repeat"
    );

    // 11th attempt must automatically start Cycle 2
    const eleventh = await startJuniorAttempt({
      sessionToken: token,
      stream: "science",
      subjectSlug: "sci-chemistry",
    });
    assert.equal(eleventh.cycleNumber, 2);
    assert.equal(eleventh.didRollOverCycle, true);
    assert.equal(eleventh.questions.length, 10);
  });

  it("5 & 6. Isolates Question History Across Participants & Subjects, and Supports Voluntary Cycle Reset", async () => {
    const tokenUser1 = "uw_test_isolation_user_one_0003";
    const tokenUser2 = "uw_test_isolation_user_two_0004";

    const u1Bio = await startJuniorAttempt({
      sessionToken: tokenUser1,
      stream: "science",
      subjectSlug: "sci-biology",
    });
    await submitJuniorAttempt({
      attemptId: u1Bio.attemptId,
      sessionToken: tokenUser1,
      answers: u1Bio.questions.map((q) => ({
        questionId: q.questionId,
        selectedOptionKey: "B",
      })),
    });

    // User 2 still has full 100-question pool in Biology (Cycle 1, Attempt 1)
    const u2Bio = await startJuniorAttempt({
      sessionToken: tokenUser2,
      stream: "science",
      subjectSlug: "sci-biology",
    });
    assert.equal(u2Bio.attemptNumber, 1);
    assert.equal(u2Bio.cycleNumber, 1);

    // Voluntary cycle reset for User 1 in Biology
    const resetRes = await resetJuniorSubjectHistory({
      sessionToken: tokenUser1,
      subjectSlug: "sci-biology",
    });
    assert.equal(resetRes.completedCount, 0);
    assert.equal(resetRes.cycleNumber, 2);
  });

  it("7 & 8. Preserves Answer Mapping Under Option Shuffling, Enforces Evidence Threshold (<2), and Never Equates Speed With Intelligence", async () => {
    const token = "uw_test_scoring_determinism_005";
    const started = await startJuniorAttempt({
      sessionToken: token,
      stream: "science",
      subjectSlug: "sci-mathematics",
      instantFeedbackEnabled: true,
    });

    // Using instantFeedbackMap (enabled here) to select all 10 shuffled correct keys
    const state = getPublicJuniorAttemptState(started.attemptId, token);
    assert.ok(state.instantFeedbackMap);

    const perfectAnswers = started.questions.map((q) => ({
      questionId: q.questionId,
      selectedOptionKey: state.instantFeedbackMap![q.questionId].correctOptionKey,
      responseTimeMs: 2500,
    }));

    const submitted = await submitJuniorAttempt({
      attemptId: started.attemptId,
      sessionToken: token,
      answers: perfectAnswers,
    });

    assert.equal(submitted.academicPerformance.scoreOutOf10, 10);
    assert.equal(submitted.academicPerformance.accuracyPct, 100);
    assert.equal(
      submitted.scoringAlgorithmVersion,
      JUNIOR_SCORING_ALGORITHM_VERSION
    );

    // Direct pure unit check: fast vs slow response times yield identical ability & profile outputs,
    // and an ability tag appearing on only 1 question yields "Not enough evidence yet"
    const detail = await getParticipantJuniorAttemptDetail(
      submitted.participantId,
      started.attemptId
    );
    assert.ok(detail);

    const singleEvidenceQuestions = detail.questions.map((q, idx) => ({
      slotNumber: q.slotNumber,
      questionId: q.questionId,
      questionVersion: q.questionVersion,
      chapterNumber: q.chapterNumber,
      chapter: q.chapter,
      topic: q.topic,
      difficulty: "Medium" as const,
      questionText: q.questionText,
      presentedOptions: q.options.map((o) => ({
        displayKey: o.key,
        canonicalKey: o.key,
        text: o.text,
      })),
      canonicalCorrectKey: q.correctOptionKey,
      correctDisplayKey: q.correctOptionKey,
      explanation: q.explanation,
      syllabusReference: q.syllabusReference,
      abilityTags:
        idx === 0
          ? (["scientific_understanding"] as const)
          : (["logical_reasoning", "problem_solving"] as const),
    }));

    const evalFast = evaluateJuniorAttempt({
      attemptId: "det-1",
      participantId: "p-1",
      participantName: "Test Student",
      sessionId: "s-1",
      board: "MSBSHSE",
      academicYear: "2025-26",
      standard: "Class 11 (FYJC)",
      stream: "science",
      subjectSlug: "sci-mathematics",
      subjectName: "Mathematics and Statistics",
      difficultyPreference: "Mixed",
      attemptNumber: 1,
      cycleNumber: 1,
      startedAt: "2026-11-03T10:00:00.000Z",
      completedAt: "2026-11-03T10:01:00.000Z",
      questions: singleEvidenceQuestions.map((q) => ({
        ...q,
        abilityTags: [...q.abilityTags],
      })),
      submittedAnswers: singleEvidenceQuestions.map((q) => ({
        questionId: q.questionId,
        selectedOptionKey: q.correctDisplayKey,
        responseTimeMs: 900,
      })),
    });

    const evalSlow = evaluateJuniorAttempt({
      attemptId: "det-1",
      participantId: "p-1",
      participantName: "Test Student",
      sessionId: "s-1",
      board: "MSBSHSE",
      academicYear: "2025-26",
      standard: "Class 11 (FYJC)",
      stream: "science",
      subjectSlug: "sci-mathematics",
      subjectName: "Mathematics and Statistics",
      difficultyPreference: "Mixed",
      attemptNumber: 1,
      cycleNumber: 1,
      startedAt: "2026-11-03T10:00:00.000Z",
      completedAt: "2026-11-03T10:25:00.000Z",
      questions: singleEvidenceQuestions.map((q) => ({
        ...q,
        abilityTags: [...q.abilityTags],
      })),
      submittedAnswers: singleEvidenceQuestions.map((q) => ({
        questionId: q.questionId,
        selectedOptionKey: q.correctDisplayKey,
        responseTimeMs: 95_000,
      })),
    });

    assert.equal(
      evalFast.result.descriptiveProfile.title,
      evalSlow.result.descriptiveProfile.title
    );
    assert.deepEqual(
      evalFast.result.abilityIndicators,
      evalSlow.result.abilityIndicators
    );

    const sciUnderstanding = evalFast.result.abilityIndicators.find(
      (i) => i.key === "scientific_understanding"
    );
    assert.ok(sciUnderstanding);
    assert.equal(sciUnderstanding.supported, false);
    assert.equal(sciUnderstanding.qualitativeBand, "Not enough evidence yet");
  });

  it("9, 10, 11 & 12. Retains Historical Question Snapshots on Edit, Releases Abandoned Reservations, Enforces Session Ownership, & Blocks Unreviewed Publication", async () => {
    const ownerToken = "uw_test_snapshot_owner_00000006";
    const intruderToken = "uw_test_snapshot_intruder_00007";

    // Start an attempt and abandon it by starting a second attempt immediately
    const abandonedRun = await startJuniorAttempt({
      sessionToken: ownerToken,
      stream: "science",
      subjectSlug: "sci-physics",
      optionalProfile: {
        fullName: "Meera Deshmukh",
        username: "meera_fyjc",
        consent: true,
      },
    });

    const activeRun = await startJuniorAttempt({
      sessionToken: ownerToken,
      stream: "science",
      subjectSlug: "sci-physics",
    });

    const firstAbandState = getPublicJuniorAttemptState(
      abandonedRun.attemptId,
      ownerToken
    );
    assert.equal(
      firstAbandState.status,
      "abandoned",
      "Prior unsubmitted attempt must automatically release into abandoned state"
    );

    await submitJuniorAttempt({
      attemptId: activeRun.attemptId,
      sessionToken: ownerToken,
      answers: activeRun.questions.map((q) => ({
        questionId: q.questionId,
        selectedOptionKey: "A",
      })),
    });

    // Cross-session access must throw FORBIDDEN
    assert.throws(
      () =>
        getAuthorizedJuniorResult({
          attemptId: activeRun.attemptId,
          sessionToken: intruderToken,
          isAdmin: false,
        }),
      /FORBIDDEN:/
    );

    // Authorized admin can inspect
    const adminRead = getAuthorizedJuniorResult({
      attemptId: activeRun.attemptId,
      sessionToken: null,
      isAdmin: true,
    });
    assert.equal(adminRead.participantName, "Meera Deshmukh");

    // Edit the first question in activeRun via admin service; historical attempt must retain v1 stem!
    const targetQ = activeRun.questions[0];
    const originalStem = targetQ.questionText;
    const edited = updateAdminQuestion(
      targetQ.questionId,
      { questionText: `${originalStem} [Curator Revised v2]` },
      "anishpatil146@gmail.com"
    );
    assert.equal(edited.version, 2);

    const historicalInspection = await getParticipantJuniorAttemptDetail(
      activeRun.participantId,
      activeRun.attemptId
    );
    assert.ok(historicalInspection);
    assert.equal(historicalInspection.questions[0].questionVersion, 1);
    assert.equal(historicalInspection.questions[0].questionText, originalStem);

    // Unreviewed question cannot be published directly
    const draftQ = createAdminQuestion(
      {
        board: "MSBSHSE",
        academicYear: "2025-26",
        standard: "Class 11 (FYJC)",
        stream: "science",
        subjectSlug: "sci-physics",
        subjectName: "Physics",
        chapterNumber: 1,
        chapter: "Units and Measurements",
        topic: "Parallax Method",
        difficulty: "Medium",
        questionText:
          "Which astronomical distance unit is defined using a parallax angle of one arcsecond?",
        options: [
          { key: "A", text: "Parsec" },
          { key: "B", text: "Light-year" },
          { key: "C", text: "Astronomical Unit" },
          { key: "D", text: "Angstrom" },
        ],
        correctKey: "A",
        explanation: "One parsec corresponds to 1 AU subtending 1 arcsecond.",
        syllabusReference: "MSBSHSE Class 11 Physics Ch. 1",
        abilityTags: ["scientific_understanding"],
        publicationStatus: "published", // Should safely downgrade to draft because reviewed=false!
        reviewed: false,
      },
      "anishpatil146@gmail.com"
    );

    assert.equal(draftQ.publicationStatus, "draft");
    assert.throws(
      () =>
        setQuestionPublicationState(
          draftQ.id,
          "publish",
          false,
          "anishpatil146@gmail.com"
        ),
      /Cannot publish an unreviewed question/
    );

    const publishedQ = setQuestionPublicationState(
      draftQ.id,
      "publish",
      true,
      "anishpatil146@gmail.com"
    );
    assert.equal(publishedQ.publicationStatus, "published");
    assert.equal(publishedQ.reviewed, true);
  });

  it("13, 14, 15, 16 & 17. Verifies CSV Round-Trip, Configurable Electives, Senior+Junior Participant Control Workflow, & Strict Admin Allowlist", async () => {
    // 13. CSV Export -> Parse -> Import round-trip
    const sampleSlice = getEffectiveSubjectQuestionBank("sci-physics").slice(
      0,
      2
    );
    const csv = exportQuestionsAsCsv(sampleSlice);
    const parsedRows = parseQuestionsCsv(csv);
    assert.equal(parsedRows.length, 2);
    const batchRes = importAdminQuestionsBatch(
      parsedRows,
      "anishpatil146@gmail.com"
    );
    assert.equal(batchRes.updatedCount, 2);

    // 14. Configurable elective subject + Audit Logs
    const customSubj = upsertAcademicSubject(
      {
        slug: "sci-computer-science",
        stream: "science",
        name: "Computer Science",
        code: "D9",
        description: "Boolean algebra, algorithms, and C++ fundamentals.",
        isElective: true,
        active: true,
      },
      "anishpatil146@gmail.com"
    );
    assert.equal(customSubj.isElective, true);
    assert.ok(
      listAcademicSubjects({ stream: "science" }).some(
        (s) => s.slug === "sci-computer-science"
      )
    );
    assert.ok(listAdminAuditLogs().length >= 3);

    // 15 & 16. Unified Participant playing BOTH Senior Mode & Junior Mode
    const dualToken = "uw_test_dual_mode_participant_08";
    await getOrCreateSession(dualToken);
    const prof = await submitProfileByToken(dualToken, {
      displayName: "Rohan Joshi",
      instagramUsername: "rohan_curious",
      consent: true,
      characterPresentation: "HIM",
    });
    await recordEventByToken(dualToken, 1, "chapter_started", { chapter: 1 });
    await recordEventByToken(dualToken, 1, "choice_selected", {
      choiceId: "return_wallet",
    });
    await recordEventByToken(dualToken, 2, "clue_inspected", {
      clueId: "ledger_note",
    });
    await recordEventByToken(dualToken, 2, "clue_inspected", {
      clueId: "brass_stamp",
    });
    await recordEventByToken(dualToken, 7, "seventh_door_completed", {
      doorChoice: "leave_lantern_lit",
    });
    await recordEventByToken(dualToken, 6, "hidden_letter_read", {
      discoveredVia: "test",
    });
    await recordEventByToken(
      dualToken,
      6,
      "game_completed",
      { finishedAllChapters: true },
      "The Quiet Investigator"
    );

    const jrRun = await startJuniorAttempt({
      sessionToken: dualToken,
      stream: "science",
      subjectSlug: "sci-biology",
    });
    await submitJuniorAttempt({
      attemptId: jrRun.attemptId,
      sessionToken: dualToken,
      answers: jrRun.questions.map((q) => ({
        questionId: q.questionId,
        selectedOptionKey: "C",
      })),
    });

    // Verify Participant Directory -> Central Profile -> Senior & Junior Dashboards
    const dir = await listParticipantsDirectory({
      search: "Rohan",
      modeFilter: "both",
    });
    assert.equal(dir.total, 1);
    assert.deepEqual(dir.items[0].modesPlayed.sort(), ["junior", "senior"]);

    const central = await getParticipantCentralProfile(prof.playerId);
    assert.ok(central);
    assert.equal(central.summaryMetrics.totalModesPlayed, 2);

    const srDash = await getParticipantSeniorDashboard(prof.playerId);
    assert.ok(srDash);
    assert.equal(srDash.played, true);
    assert.equal(srDash.seventhDoorStatus.completed, true);
    assert.equal(srDash.hiddenLetterStatus.read, true);

    const jrDash = await getParticipantJuniorDashboard(prof.playerId);
    assert.ok(jrDash);
    assert.equal(jrDash.summaryCards.completedAttempts, 1);

    // Deterministic Senior archetype check
    const repA = evaluateReport(
      prof.sessionId,
      "Rohan Joshi",
      srDash.timeline,
      [],
      new Date().toISOString(),
      "HIM"
    );
    const repB = evaluateReport(
      prof.sessionId,
      "Rohan Joshi",
      srDash.timeline,
      [],
      new Date().toISOString(),
      "HIM"
    );
    assert.equal(repA.archetype, repB.archetype);

    // 17. Strict Admin Email Allowlist
    assert.equal(isEmailAllowed("anishpatil146@gmail.com"), true);
    assert.equal(isEmailAllowed("ANISHPATIL146@GMAIL.COM "), true);
    assert.equal(isEmailAllowed("intruder@gmail.com"), false);
    assert.equal(isEmailAllowed(""), false);
    assert.equal(isEmailAllowed(null), false);
  });

  it("18. Validates Solo Storyboard Campaign: 8 Illustrated Levels, In-Scene Puzzles, and 4 Endings", async () => {
    // 8 levels + Prologue = 9
    assert.equal(SOLO_CAMPAIGN_LEVELS.length, 9);
    assert.equal(SOLO_CAMPAIGN_LEVELS[0].id, "solo_prologue");
    assert.equal(SOLO_CAMPAIGN_LEVELS[1].id, "solo_l1");
    assert.equal(SOLO_CAMPAIGN_LEVELS[8].id, "solo_l8");

    // All levels must have non-empty backgrounds and valid dialogue steps
    for (const lvl of SOLO_CAMPAIGN_LEVELS) {
      assert.ok(lvl.backgroundUrl.startsWith("/art/backgrounds/"));
      assert.ok(lvl.steps.length >= 2);
      for (const step of lvl.steps) {
        assert.ok(step.speakerId);
        assert.ok(step.text.length > 0);
      }
    }

    // In-scene contextual puzzles
    const puzzleSteps = SOLO_CAMPAIGN_LEVELS.flatMap((l) =>
      l.steps.filter((s) => s.puzzleTrigger)
    );
    assert.ok(puzzleSteps.length >= 6);

    // 4 Endings
    assert.equal(SOLO_ENDINGS.length, 4);
    const endingIds = SOLO_ENDINGS.map((e) => e.id);
    assert.ok(endingIds.includes("ENDING_SURVIVOR"));
    assert.ok(endingIds.includes("ENDING_MASTERMIND"));
    assert.ok(endingIds.includes("ENDING_HUMANIST"));
    assert.ok(endingIds.includes("ENDING_UNPREDICTABLE"));
  });

  it("19. Validates Two-Pillar Product Architecture: Pure Senior Solo & Junior Academy", async () => {
    // Verify 8 Solo chambers are pristine and fully mapped
    assert.equal(SOLO_CAMPAIGN_LEVELS.length, 9); // prologue + 8 chambers
    assert.equal(SOLO_CAMPAIGN_LEVELS[0].id, "solo_prologue");
    assert.equal(SOLO_CAMPAIGN_LEVELS[1].id, "solo_l1");
    assert.equal(SOLO_CAMPAIGN_LEVELS[8].id, "solo_l8");

    // Concurrency engine isolates generic multi-session rooms independently
    const { room, hostId } = multiplayerStore.createRoom("Curator Test");
    assert.equal(room.players.length, 1);
    assert.equal(room.hostId, hostId);

    const joinRes = multiplayerStore.joinRoom(room.code, "Auditor");
    assert.equal(joinRes.success, true);
    assert.equal(joinRes.room?.players.length, 2);
  });
});

