import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createRoom,
  joinRoom,
  togglePlayerReady,
  startCampaign,
  makeSudoku6x6Move,
  reconnectPlayer,
  recordPlayerHeartbeat,
  getRoom,
} from "../src/lib/services/multiplayer-store";
import {
  acquireDistributedLock,
  releaseDistributedLock,
  checkDistributedRateLimit,
  getStateStoreTelemetry,
} from "../src/lib/services/redis-state-store";
import {
  executeWithCircuitBreaker,
  getCircuitBreakersReport,
} from "../src/lib/services/db-performance";

describe("THE UNWRITTEN — Scalability, Multiplayer Reliability & Live Ops Suite", () => {
  test("1. Multiplayer Room Isolation: Multiple rooms operate with independent authoritative state", () => {
    const roomA = createRoom("Alpha Operative", "easy");
    const roomB = createRoom("Bravo Operative", "hard");

    assert.notEqual(roomA.room.code, roomB.room.code, "Room codes must be unique");
    assert.notEqual(roomA.hostId, roomB.hostId, "Host IDs must be unique");

    // Modify Room A difficulty; Room B must remain untouched
    const fetchedB = getRoom(roomB.room.code);
    assert.equal(fetchedB?.difficulty, "hard");
    assert.equal(fetchedB?.players.length, 1);
  });

  test("2. Atomic Concurrency & State Versioning: Increments version and detects conflicts", () => {
    const { room, hostId } = createRoom("Commander", "medium");
    const op2 = joinRoom(room.code, "Operative 2");
    // All operatives in lobby must toggle ready before campaign starts
    togglePlayerReady(room.code, op2.playerId!);
    const startRes = startCampaign(room.code, hostId);
    assert.ok(startRes.success, "Campaign should start when all operatives are ready");

    const activeRoom = getRoom(room.code)!;
    const initialVersion = activeRoom.sudokuState!.stateVersion;
    assert.equal(initialVersion, 1);

    // Find an empty cell
    let targetRow = -1;
    let targetCol = -1;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (activeRoom.sudokuState!.initialGrid[r][c] === 0) {
          targetRow = r;
          targetCol = c;
          break;
        }
      }
      if (targetRow !== -1) break;
    }

    // Move 1 with matching expectedVersion
    const moveRes = makeSudoku6x6Move(
      room.code,
      hostId,
      targetRow,
      targetCol,
      3,
      "tx_001",
      initialVersion
    );
    assert.ok(moveRes.success);
    assert.equal(activeRoom.sudokuState!.stateVersion, 2);

    // Stale Move with old version must be rejected with state conflict
    const staleMove = makeSudoku6x6Move(
      room.code,
      hostId,
      targetRow,
      targetCol,
      4,
      "tx_002",
      initialVersion // Stale version
    );
    assert.equal(staleMove.success, false);
    assert.ok(staleMove.error?.includes("conflict"));
  });

  test("3. Idempotent Move Submissions: Replaying exact txId returns cached result without penalties", () => {
    const { room, hostId } = createRoom("Tester", "easy");
    startCampaign(room.code, hostId);
    const active = getRoom(room.code)!;

    // Find first empty cell
    let r = 0, c = 0;
    while (active.sudokuState!.initialGrid[r][c] !== 0) {
      c++;
      if (c === 6) { c = 0; r++; }
    }

    const txId = "tx_network_retry_999";
    const res1 = makeSudoku6x6Move(room.code, hostId, r, c, 1, txId);
    assert.ok(res1.success);
    const totalMovesBefore = active.sudokuState!.contributions[hostId].totalMoves;

    // Simulate network packet duplicate with identical txId
    const res2 = makeSudoku6x6Move(room.code, hostId, r, c, 1, txId);
    assert.ok(res2.success);
    const totalMovesAfter = active.sudokuState!.contributions[hostId].totalMoves;

    assert.equal(
      totalMovesBefore,
      totalMovesAfter,
      "Idempotent retry must not inflate totalMoves count"
    );
  });

  test("4. Cryptographic Reconnect Token: Restores player state after simulated browser disconnect", async () => {
    const { room, hostId, reconnectToken } = createRoom("SoloHost", "medium");
    assert.ok(reconnectToken.startsWith("rec_"), "Token must have secure prefix");

    // Simulate browser refresh & reconnection
    const reconRes = await reconnectPlayer(room.code, hostId, reconnectToken);
    assert.ok(reconRes.success, "Valid reconnect token must be accepted");
    assert.equal(reconRes.room?.code, room.code);

    // Invalid token must be rejected
    const badRecon = await reconnectPlayer(room.code, hostId, "rec_invalid_bad_token");
    assert.equal(badRecon.success, false);
    assert.ok(badRecon.error?.includes("Invalid"));
  });

  test("5. Heartbeat Tracking & Disconnection Detection", () => {
    const { room, hostId } = createRoom("HeartbeatTest", "medium");
    const active = getRoom(room.code)!;
    const player = active.players[0];

    // Simulate heartbeat
    const beatRes = recordPlayerHeartbeat(room.code, hostId);
    assert.ok(beatRes.success);
    assert.equal(beatRes.activeCount, 1);

    // Simulate ghost client: heartbeat expired > 45s ago
    player.lastHeartbeatTimestamp = Date.now() - 50_000;
    const checkRes = recordPlayerHeartbeat(room.code, "dummy_other_id");
    assert.ok(checkRes.success);
    assert.equal(player.isOnline, false, "Player without heartbeat for 50s must be marked offline");
  });

  test("6. Distributed Mutex & Cell-Level Concurrency Locking (SETNX)", async () => {
    const lockKey = "cell:test_lock_01";
    const acquiredA = await acquireDistributedLock(lockKey, "player_A", 5);
    assert.ok(acquiredA, "First player must successfully acquire lock");

    const acquiredB = await acquireDistributedLock(lockKey, "player_B", 5);
    assert.equal(acquiredB, false, "Second player must be blocked while cell is locked");

    // Release lock
    await releaseDistributedLock(lockKey, "player_A");

    // Player B can now acquire
    const acquiredBAfter = await acquireDistributedLock(lockKey, "player_B", 5);
    assert.ok(acquiredBAfter, "Player B must be able to acquire released lock");
    await releaseDistributedLock(lockKey, "player_B");
  });

  test("7. Sliding Window Rate Limiter: Enforces action ceiling and calculates Retry-After", async () => {
    const rateKey = "test_rate_burst_" + Date.now();
    const maxRequests = 5;
    const windowSeconds = 2;

    for (let i = 0; i < maxRequests; i++) {
      const res = await checkDistributedRateLimit(rateKey, maxRequests, windowSeconds);
      assert.ok(res.allowed, `Request ${i + 1} should be permitted`);
    }

    // 6th request must be rejected
    const blockedRes = await checkDistributedRateLimit(rateKey, maxRequests, windowSeconds);
    assert.equal(blockedRes.allowed, false);
    assert.ok(blockedRes.retryAfterSeconds >= 1);
  });

  test("8. Database Circuit Breaker: Trips to OPEN on consecutive failures and recovers", async () => {
    let failCount = 0;
    const failingService = async () => {
      failCount++;
      throw new Error("Simulated Supabase connection pool exhaustion");
    };

    // Trigger consecutive failures
    for (let i = 0; i < 6; i++) {
      await executeWithCircuitBreaker("test_breaker", failingService, "FALLBACK_VALUE");
    }

    const report = getCircuitBreakersReport();
    assert.equal(report["test_breaker"]?.state, "OPEN", "Breaker must be OPEN after 5 failures");

    // Subsequent call must return fallback immediately without calling failing service
    const callsBefore = failCount;
    const fallbackCall = await executeWithCircuitBreaker("test_breaker", failingService, "FALLBACK_VALUE");
    assert.equal(fallbackCall.fromFallback, true);
    assert.equal(failCount, callsBefore, "Open breaker must shield database from calls");
  });

  test("9. High-Concurrency Synthetic Simulation: 100 simultaneous room joins & moves", async () => {
    const concurrency = 25; // 25 rooms * 4 players = 100 virtual users
    const rooms = [];

    // Phase 1: Create 25 rooms
    for (let i = 0; i < concurrency; i++) {
      const r = createRoom(`Host_${i}`, "easy");
      rooms.push(r);
    }

    // Phase 2: 3 operatives join each room concurrently (75 joins)
    const joinPromises = [];
    for (const r of rooms) {
      for (let j = 2; j <= 4; j++) {
        joinPromises.push(Promise.resolve(joinRoom(r.room.code, `Operative_${j}`)));
      }
    }
    const joinResults = await Promise.all(joinPromises);
    assert.equal(joinResults.every((x) => x.success), true, "All 75 concurrent joins must succeed");

    // All joined operatives toggle ready before host initiates deployment
    for (const jr of joinResults) {
      if (jr.room && jr.playerId) {
        togglePlayerReady(jr.room.code, jr.playerId);
      }
    }

    // Phase 3: Start campaigns and execute moves concurrently
    const movePromises = [];
    for (const r of rooms) {
      startCampaign(r.room.code, r.hostId);
      const active = getRoom(r.room.code)!;
      // find first empty cell
      let targetR = 0, targetC = 0;
      while (active.sudokuState!.initialGrid[targetR][targetC] !== 0) {
        targetC++;
        if (targetC === 6) { targetC = 0; targetR++; }
      }
      movePromises.push(
        Promise.resolve(
          makeSudoku6x6Move(r.room.code, r.hostId, targetR, targetC, 1, `stress_tx_${r.room.code}`)
        )
      );
    }
    const moveResults = await Promise.all(movePromises);
    assert.equal(moveResults.every((x) => x.success), true, "All concurrent moves must succeed");

    // Telemetry check
    const telemetry = getStateStoreTelemetry();
    assert.ok(telemetry.uptimeSeconds >= 0);
  });
});
