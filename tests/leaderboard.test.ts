import { describe, test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getPublicLeaderboard } from "../src/lib/services/leaderboard-service";
import {
  setPlatformStorePathForTests,
  startJuniorAttempt,
  submitJuniorAttempt,
} from "../src/lib/services/platform-store";
import {
  setLocalStorePathForTests,
  getOrCreateSession,
  recordEventByToken,
} from "../src/lib/storage";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "unwritten-leaderboard-test-"));
const tmpPlatformPath = path.join(tmpDir, "platform-store.json");
const tmpLocalPath = path.join(tmpDir, "local-store.json");

describe("THE UNWRITTEN — Public Live Leaderboard Telemetry Suite (Strict Zero-Fake Doctrine)", () => {
  before(() => {
    setPlatformStorePathForTests(tmpPlatformPath);
    setLocalStorePathForTests(tmpLocalPath);
  });

  after(() => {
    setPlatformStorePathForTests(null);
    setLocalStorePathForTests(null);
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  test("1. Leaderboard handles authentic empty state gracefully without fabricated seed contenders", async () => {
    const summary = await getPublicLeaderboard();

    assert.ok(summary, "Leaderboard summary must be defined");
    assert.ok(typeof summary.updatedAt === "string", "updatedAt must be an ISO string");
    assert.ok(typeof summary.tickerTimestamp === "number", "tickerTimestamp must be a number");
    assert.equal(summary.activeSolversCount, 0, "activeSolversCount must be 0 when no solvers active");
    assert.equal(summary.totalEvaluationsCount, 0, "totalEvaluationsCount must be 0 before runs");
    assert.equal(summary.entries.length, 0, "Must contain 0 fake contenders");
    assert.equal(summary.liveFeed.length, 0, "Must contain 0 fabricated feed actions");
  });

  test("2. Dynamically populates and ranks genuine Junior and Senior submissions", async () => {
    // 1. Create a genuine Junior attempt
    const juniorSessionToken = "test_token_scholar_1";
    const started = await startJuniorAttempt({
      sessionToken: juniorSessionToken,
      stream: "science",
      subjectSlug: "sci-physics",
      difficultyPreference: "Easy",
      instantFeedbackEnabled: false,
    });

    // Submit all 10 answers
    const answers = started.questions.map((q) => ({
      questionId: q.questionId,
      selectedOptionKey: "A" as const,
      responseTimeMs: 3500,
    }));

    await submitJuniorAttempt({
      attemptId: started.attemptId,
      sessionToken: juniorSessionToken,
      answers,
    });

    // 2. Create a genuine completed Senior session
    const seniorToken = "test_token_senior_1";
    const seniorSession = await getOrCreateSession(seniorToken, { name: "investigator_run" }, "UNSPECIFIED");
    await recordEventByToken(
      seniorToken,
      6,
      "game_completed",
      { finishedAllChapters: true },
      "The Mastermind"
    );

    // Fetch leaderboard
    const summary = await getPublicLeaderboard();

    assert.ok(summary.totalEvaluationsCount >= 2, "Must count genuine completed evaluations");
    assert.ok(summary.entries.length >= 2, "Must contain genuine player entries");
    assert.ok(summary.liveFeed.length >= 1, "Must contain genuine activity dispatches");

    // Entries must be 1-based and sorted by performance
    for (let i = 0; i < summary.entries.length - 1; i++) {
      const curr = summary.entries[i];
      const next = summary.entries[i + 1];

      assert.equal(curr.rank, i + 1, "Rank must equal index + 1");
      if (curr.score !== next.score) {
        assert.ok(curr.score >= next.score, "Higher score must rank higher");
      }
    }
  });

  test("3. Mode filtering correctly isolates Junior Academy vs Senior Solo entries", async () => {
    const juniorSummary = await getPublicLeaderboard({ mode: "junior_academy" });
    assert.ok(juniorSummary.entries.length > 0, "Must contain junior entries");
    for (const e of juniorSummary.entries) {
      assert.equal(e.mode, "junior_academy", "Filtered entries must be junior_academy");
    }

    const seniorSummary = await getPublicLeaderboard({ mode: "senior_solo" });
    assert.ok(seniorSummary.entries.length > 0, "Must contain senior entries");
    for (const e of seniorSummary.entries) {
      assert.equal(e.mode, "senior_solo", "Filtered entries must be senior_solo");
    }
  });

  test("4. Stream filtering isolates specific academic disciplines", async () => {
    const scienceSummary = await getPublicLeaderboard({ stream: "science" });
    assert.ok(scienceSummary.entries.length > 0, "Must contain science entries");
    for (const e of scienceSummary.entries) {
      if (e.stream) {
        assert.equal(e.stream.toLowerCase(), "science", "Stream must be science");
      }
    }
  });

  test("5. Real-time live feed produces authentic timestamped dispatches", async () => {
    const summary = await getPublicLeaderboard();
    assert.ok(summary.liveFeed.length > 0, "Live feed items must be present");

    for (const item of summary.liveFeed) {
      assert.ok(item.id, "Live feed item must have an id");
      assert.ok(item.callsign, "Live feed item must have a callsign");
      assert.ok(item.action, "Live feed item must have an action description");
      assert.ok(item.secondsAgo >= 0, "secondsAgo must be non-negative");
    }
  });

  test("6. Ticker timestamp reflects current real-time clock within 2 seconds", async () => {
    const before = Date.now();
    const summary = await getPublicLeaderboard();
    const after = Date.now();

    assert.ok(
      summary.tickerTimestamp >= before - 1000 && summary.tickerTimestamp <= after + 1000,
      "Ticker timestamp must reflect real time"
    );
  });
});
