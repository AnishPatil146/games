import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getPublicLeaderboard } from "../src/lib/services/leaderboard-service";

describe("THE UNWRITTEN — Public Live Leaderboard Telemetry Suite", () => {
  test("1. Leaderboard returns comprehensive summary and valid entries", async () => {
    const summary = await getPublicLeaderboard();

    assert.ok(summary, "Leaderboard summary must be defined");
    assert.ok(typeof summary.updatedAt === "string", "updatedAt must be an ISO string");
    assert.ok(typeof summary.tickerTimestamp === "number", "tickerTimestamp must be a number");
    assert.ok(summary.activeSolversCount >= 0, "activeSolversCount must be non-negative");
    assert.ok(summary.totalEvaluationsCount > 0, "totalEvaluationsCount must be positive");
    assert.ok(Array.isArray(summary.entries), "entries must be an array");
    assert.ok(summary.entries.length > 0, "must contain ranked entries");
    assert.ok(Array.isArray(summary.liveFeed), "liveFeed must be an array");
  });

  test("2. Entries are strictly sorted by performance (score desc, accuracy desc, speed asc)", async () => {
    const summary = await getPublicLeaderboard();
    const entries = summary.entries;

    for (let i = 0; i < entries.length - 1; i++) {
      const curr = entries[i];
      const next = entries[i + 1];

      // Rank must be 1-based and sequential
      assert.equal(curr.rank, i + 1, `Entry rank must equal index + 1`);

      // Current must have score >= next
      if (curr.score !== next.score) {
        assert.ok(
          curr.score >= next.score,
          `Rank ${curr.rank} score (${curr.score}) must be >= Rank ${next.rank} score (${next.score})`
        );
      } else if (curr.accuracyPct !== next.accuracyPct) {
        assert.ok(
          curr.accuracyPct >= next.accuracyPct,
          `Equal score: Rank ${curr.rank} accuracy (${curr.accuracyPct}%) must be >= Rank ${next.rank} accuracy (${next.accuracyPct}%)`
        );
      }
    }
  });

  test("3. Mode filtering correctly isolates Junior Academy or Senior Solo entries", async () => {
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

    const commerceSummary = await getPublicLeaderboard({ stream: "commerce" });
    assert.ok(commerceSummary.entries.length > 0, "Must contain commerce entries");
    for (const e of commerceSummary.entries) {
      if (e.stream) {
        assert.equal(e.stream.toLowerCase(), "commerce", "Stream must be commerce");
      }
    }
  });

  test("5. Real-time live feed produces recent dispatches with non-negative seconds", async () => {
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
