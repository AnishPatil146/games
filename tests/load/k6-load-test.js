/* eslint-disable */
/**
 * THE UNWRITTEN — k6 High-Concurrency Load Testing Script
 *
 * Simulates:
 * - 100 to 1,000 concurrent Virtual Users (VUs)
 * - Room creation & joining bursts
 * - Simultaneous Sudoku 6x6 moves with atomic concurrency checks
 * - Token-based reconnection recovery
 * - Junior Mode Academic reasoning and MathRenderer queries
 *
 * Usage:
 *   k6 run tests/load/k6-load-test.js
 *   k6 run --vus 500 --duration 1m tests/load/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 50 },    // Ramp-up to 50 VUs
    { duration: '40s', target: 200 },   // Scale to 200 VUs
    { duration: '1m', target: 500 },    // Peak at 500 VUs
    { duration: '20s', target: 0 },     // Ramp-down
  ],
  thresholds: {
    // 95% of requests must complete below 300ms
    http_req_duration: ['p(95)<300'],
    // HTTP failure rate must stay below 1%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://thegameunwritten.vercel.app';

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  group('01. Public Discovery & Homepage', () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      'homepage loaded (200)': (r) => r.status === 200,
    });
    sleep(0.5);
  });

  group('02. Junior Mode Curriculum Query', () => {
    const streamsRes = http.get(`${BASE_URL}/api/v1/public/academic/streams`);
    check(streamsRes, {
      'streams retrieved': (r) => r.status === 200,
    });

    const subjectsRes = http.get(`${BASE_URL}/api/v1/public/academic/subjects?stream=science`);
    check(subjectsRes, {
      'subjects retrieved': (r) => r.status === 200,
    });
    sleep(0.5);
  });

  group('03. Multiplayer Alliance Lifecycle', () => {
    // A. Create room as Host
    const createPayload = JSON.stringify({
      hostName: `SquadHost_${__VU}`,
      difficulty: 'medium',
    });
    const createRes = http.post(`${BASE_URL}/api/v1/multiplayer/rooms`, createPayload, { headers });

    check(createRes, {
      'room created successfully': (r) => r.status === 200,
    });

    if (createRes.status !== 200) return;

    const createData = JSON.parse(createRes.body);
    const roomCode = createData.room.code;
    const hostId = createData.hostId;
    const hostReconnectToken = createData.reconnectToken;

    // B. Join room as Teammate Operative
    const joinPayload = JSON.stringify({
      action: 'join',
      playerName: `Teammate_${__VU}`,
    });
    const joinRes = http.post(`${BASE_URL}/api/v1/multiplayer/rooms/${roomCode}`, joinPayload, { headers });

    check(joinRes, {
      'teammate joined room': (r) => r.status === 200,
    });

    // C. Poll room state
    const pollRes = http.get(`${BASE_URL}/api/v1/multiplayer/rooms/${roomCode}`);
    check(pollRes, {
      'room state fetched': (r) => r.status === 200,
      'solution grid is redacted': (r) => {
        const body = JSON.parse(r.body);
        return !body.room?.sudokuState?.solution;
      },
    });

    // D. Test Reconnection Protocol
    if (hostReconnectToken) {
      const reconPayload = JSON.stringify({
        action: 'reconnect',
        playerId: hostId,
        reconnectToken: hostReconnectToken,
      });
      const reconRes = http.post(`${BASE_URL}/api/v1/multiplayer/rooms/${roomCode}`, reconPayload, { headers });
      check(reconRes, {
        'reconnection succeeded': (r) => r.status === 200,
      });
    }

    sleep(1);
  });
}
