import crypto from "crypto";
import {
  generateSudoku6x6,
  cloneGrid6x6,
  findGridConflicts6x6,
  isSudoku6x6Complete,
  getSudoku6x6Hint,
  Sudoku6x6Difficulty,
} from "@/lib/gameplay/sudoku-6x6-engine";
import {
  generateReconnectToken,
  validateReconnectToken,
  setSerializedRoom,
} from "./redis-state-store";

export interface MultiplayerPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatarId: "aarav" | "aanya" | "warden" | "mira";
  lastActiveAt: string;
  currentLevelSolved: boolean;
  betrayalDecision?: "COOPERATE" | "BETRAY";
  reconnectToken?: string;
  isOnline?: boolean;
  lastHeartbeatTimestamp?: number;
}

export interface PlayerContribution {
  playerName: string;
  avatarId: string;
  correctEntries: number;
  totalMoves: number;
  corrections: number;
  hintsRequested: number;
}

export interface SharedSudoku6x6State {
  puzzleId: string;
  difficulty: Sudoku6x6Difficulty;
  stateVersion: number; // Monotonic sequence version for optimistic concurrency
  initialGrid: number[][]; // 6x6 immutable given clues (0 = blank)
  currentGrid: number[][]; // 6x6 live shared board
  solution?: number[][]; // 6x6 server-authoritative solution (redacted until complete)
  cellMetadata: Record<
    string,
    {
      lastUpdatedBy: string;
      lastUpdatedByName: string;
      avatarId: string;
      timestamp: number;
    }
  >;
  playerCursors: Record<
    string,
    {
      row: number;
      col: number;
      playerName: string;
      avatarId: string;
      updatedAt: number;
    }
  >;
  hintsRemaining: number; // Maximum 5 shared hints per team
  hintsHistory: {
    hintIndex: number;
    requestedBy: string;
    requestedByName: string;
    row: number;
    col: number;
    value: number;
    explanation: string;
    timestamp: number;
  }[];
  conflictsCount: number;
  moveHistory: {
    playerId: string;
    playerName: string;
    row: number;
    col: number;
    value: number;
    isCorrect: boolean;
    timestamp: number;
  }[];
  contributions: Record<string, PlayerContribution>;
  isComplete: boolean;
  completedAt?: string;
  durationSeconds?: number;
}

export interface MultiplayerRoom {
  code: string;
  hostId: string;
  createdAt: string;
  status: "lobby" | "in_progress" | "level_completed" | "game_over" | "retry_pending";
  currentLevel: number;
  totalLevels: number;
  stateVersion: number;
  difficulty: Sudoku6x6Difficulty; // Selected in lobby: easy | medium | hard
  players: MultiplayerPlayer[];
  serverDeadlineTimestamp?: number | null;
  levelStartTime?: number | null;
  retriesCount: number;
  sudokuState?: SharedSudoku6x6State;
  outcomeHistory: Record<
    number,
    {
      solvedAt?: string;
      retries: number;
      difficulty?: string;
      hintsUsed?: number;
      durationSeconds?: number;
      betrayalSummary?: Record<string, string>;
    }
  >;
}

// Global in-memory room store (persists across requests within worker)
const activeRooms: Map<string, MultiplayerRoom> = new Map();

// Idempotency cache for transaction deduplication (TTL: 5 minutes)
const processedTransactions: Map<string, { result: unknown; timestamp: number }> = new Map();

function cleanStaleTransactions() {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [txId, entry] of processedTransactions.entries()) {
    if (entry.timestamp < cutoff) processedTransactions.delete(txId);
  }
}

export function createRoom(
  hostName: string,
  initialDifficulty: Sudoku6x6Difficulty = "medium"
): { room: MultiplayerRoom; hostId: string; reconnectToken: string } {
  let code = "AL" + Math.floor(1000 + Math.random() * 9000).toString();
  let attempts = 0;
  while (activeRooms.has(code) && attempts < 50) {
    code = "AL" + Math.floor(1000 + Math.random() * 9000).toString();
    attempts++;
  }
  if (activeRooms.has(code)) {
    code = "AL" + crypto.randomBytes(3).toString("hex").toUpperCase();
  }
  const hostId = "usr_" + crypto.randomBytes(6).toString("hex");
  const { token: reconnectToken } = generateReconnectToken(
    code,
    hostId,
    hostName || "Operative Alpha",
    "aarav"
  );

  const room: MultiplayerRoom = {
    code,
    hostId,
    createdAt: new Date().toISOString(),
    status: "lobby",
    currentLevel: 1,
    totalLevels: 8,
    stateVersion: 1,
    difficulty: initialDifficulty,
    retriesCount: 0,
    players: [
      {
        id: hostId,
        name: hostName || "Operative Alpha",
        isHost: true,
        isReady: true,
        avatarId: "aarav",
        lastActiveAt: new Date().toISOString(),
        currentLevelSolved: false,
        reconnectToken,
        isOnline: true,
        lastHeartbeatTimestamp: Date.now(),
      },
    ],
    outcomeHistory: {},
  };

  activeRooms.set(code, room);
  void setSerializedRoom(code, JSON.stringify(room));
  return { room: sanitizeRoomForClient(room), hostId, reconnectToken };
}

export function getRoom(code: string): MultiplayerRoom | null {
  const normalized = code.trim().toUpperCase();
  return activeRooms.get(normalized) || null;
}

export function getClientRoom(code: string): MultiplayerRoom | null {
  const r = getRoom(code);
  return r ? sanitizeRoomForClient(r) : null;
}

/**
 * Strips the full solution grid from client payloads until the round is verified complete.
 */
function sanitizeRoomForClient(room: MultiplayerRoom): MultiplayerRoom {
  const cloned = JSON.parse(JSON.stringify(room)) as MultiplayerRoom;
  if (cloned.sudokuState && !cloned.sudokuState.isComplete) {
    delete cloned.sudokuState.solution;
  }
  return cloned;
}

export function setRoomDifficulty(
  code: string,
  hostId: string,
  difficulty: Sudoku6x6Difficulty
): { success: boolean; room?: MultiplayerRoom; error?: string } {
  const room = getRoom(code);
  if (!room) return { success: false, error: "Session room not found." };
  if (room.hostId !== hostId) {
    return { success: false, error: "Only the host can modify the challenge difficulty." };
  }
  if (room.status !== "lobby") {
    return { success: false, error: "Difficulty cannot be altered once deployment begins." };
  }

  room.difficulty = difficulty;
  return { success: true, room: sanitizeRoomForClient(room) };
}

export function joinRoom(
  code: string,
  playerName: string
): { success: boolean; playerId?: string; room?: MultiplayerRoom; reconnectToken?: string; error?: string } {
  const room = getRoom(code);
  if (!room) {
    return { success: false, error: "Session room not found." };
  }
  if (room.players.length >= 4) {
    return { success: false, error: "Session room is full (maximum 4 participants)." };
  }
  if (room.status !== "lobby") {
    return { success: false, error: "Campaign is already in progress." };
  }

  const playerId = "usr_" + crypto.randomBytes(6).toString("hex");
  const avatars: ("aarav" | "aanya" | "warden" | "mira")[] = [
    "aanya",
    "aarav",
    "mira",
    "warden",
  ];
  const assignedAvatar = avatars[room.players.length % avatars.length];
  const operativeName = playerName || `Operative ${room.players.length + 1}`;

  const { token: reconnectToken } = generateReconnectToken(
    code,
    playerId,
    operativeName,
    assignedAvatar
  );

  const newPlayer: MultiplayerPlayer = {
    id: playerId,
    name: operativeName,
    isHost: false,
    isReady: false,
    avatarId: assignedAvatar,
    lastActiveAt: new Date().toISOString(),
    currentLevelSolved: false,
    reconnectToken,
    isOnline: true,
    lastHeartbeatTimestamp: Date.now(),
  };

  room.players.push(newPlayer);
  room.stateVersion = (room.stateVersion || 1) + 1;
  void setSerializedRoom(code, JSON.stringify(room));

  return { success: true, playerId, reconnectToken, room: sanitizeRoomForClient(room) };
}

export function togglePlayerReady(code: string, playerId: string): MultiplayerRoom | null {
  const room = getRoom(code);
  if (!room) return null;
  const p = room.players.find((x) => x.id === playerId);
  if (p) {
    p.isReady = !p.isReady;
    p.lastActiveAt = new Date().toISOString();
  }
  return sanitizeRoomForClient(room);
}

export function startCampaign(
  code: string,
  hostId: string
): { success: boolean; room?: MultiplayerRoom; error?: string } {
  const room = getRoom(code);
  if (!room) return { success: false, error: "Room not found." };
  if (room.hostId !== hostId) {
    return { success: false, error: "Only the host can initiate deployment." };
  }

  const allReady = room.players.every((p) => p.isReady);
  if (!allReady && room.players.length > 1) {
    return { success: false, error: "All operatives must mark Ready before deployment." };
  }

  room.status = "in_progress";
  room.currentLevel = 1;
  room.levelStartTime = Date.now();
  // Server-authoritative timer: 180 seconds for cooperative 6x6 Sudoku cipher
  room.serverDeadlineTimestamp = Date.now() + 180 * 1000;
  room.players.forEach((p) => (p.currentLevelSolved = false));

  // Initialize shared 6x6 Sudoku puzzle
  const puzzle = generateSudoku6x6(room.difficulty || "medium");
  const contributions: Record<string, PlayerContribution> = {};
  room.players.forEach((p) => {
    contributions[p.id] = {
      playerName: p.name,
      avatarId: p.avatarId,
      correctEntries: 0,
      totalMoves: 0,
      corrections: 0,
      hintsRequested: 0,
    };
  });

  room.sudokuState = {
    puzzleId: puzzle.id,
    difficulty: room.difficulty || "medium",
    stateVersion: 1,
    initialGrid: cloneGrid6x6(puzzle.initialGrid),
    currentGrid: cloneGrid6x6(puzzle.initialGrid),
    solution: cloneGrid6x6(puzzle.solution),
    cellMetadata: {},
    playerCursors: {},
    hintsRemaining: 5,
    hintsHistory: [],
    conflictsCount: 0,
    moveHistory: [],
    contributions,
    isComplete: false,
  };

  room.stateVersion = (room.stateVersion || 1) + 1;
  void setSerializedRoom(code, JSON.stringify(room));
  return { success: true, room: sanitizeRoomForClient(room) };
}

export function makeSudoku6x6Move(
  code: string,
  playerId: string,
  row: number,
  col: number,
  value: number,
  txId?: string,
  expectedVersion?: number
): { success: boolean; room?: MultiplayerRoom; error?: string; isComplete?: boolean } {
  cleanStaleTransactions();
  if (txId && processedTransactions.has(txId)) {
    return processedTransactions.get(txId)!.result as {
      success: boolean;
      room?: MultiplayerRoom;
      error?: string;
      isComplete?: boolean;
    };
  }

  const room = getRoom(code);
  if (!room) return { success: false, error: "Room not found" };
  if (room.status !== "in_progress") {
    return { success: false, error: "Round is not currently in progress" };
  }
  if (!room.sudokuState) {
    return { success: false, error: "Sudoku challenge not active in this chamber" };
  }

  const state = room.sudokuState;
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { success: false, error: "Operative not recognized" };

  // Optimistic concurrency check
  if (expectedVersion !== undefined && state.stateVersion !== expectedVersion) {
    return {
      success: false,
      error: "State conflict: Board updated by teammate. Synchronizing latest grid.",
      room: sanitizeRoomForClient(room),
    };
  }

  // Validate coordinates
  if (row < 0 || row > 5 || col < 0 || col > 5) {
    return { success: false, error: "Coordinates out of bounds (0–5)" };
  }
  if (value < 0 || value > 6) {
    return { success: false, error: "Value out of bounds (0–6)" };
  }

  // Clue immutability check: Given clues cannot be changed!
  if (state.initialGrid[row][col] !== 0) {
    return { success: false, error: "Given clues are locked and cannot be modified." };
  }

  const prevValue = state.currentGrid[row][col];
  state.currentGrid[row][col] = value;
  player.lastActiveAt = new Date().toISOString();

  // Track contribution
  if (!state.contributions[playerId]) {
    state.contributions[playerId] = {
      playerName: player.name,
      avatarId: player.avatarId,
      correctEntries: 0,
      totalMoves: 0,
      corrections: 0,
      hintsRequested: 0,
    };
  }
  const contrib = state.contributions[playerId];
  contrib.totalMoves += 1;

  if (prevValue !== 0 && value !== prevValue) {
    contrib.corrections += 1;
  }

  const isCorrect = state.solution ? value === state.solution[row][col] : false;
  if (isCorrect) {
    contrib.correctEntries += 1;
  }

  // Update cell metadata
  state.cellMetadata[`${row},${col}`] = {
    lastUpdatedBy: playerId,
    lastUpdatedByName: player.name,
    avatarId: player.avatarId,
    timestamp: Date.now(),
  };

  // Log move to history
  state.moveHistory.push({
    playerId,
    playerName: player.name,
    row,
    col,
    value,
    isCorrect,
    timestamp: Date.now(),
  });

  // Calculate conflicts
  const conflicts = findGridConflicts6x6(state.currentGrid);
  state.conflictsCount = conflicts.size;

  // Completion detection
  const isComplete = isSudoku6x6Complete(state.currentGrid, state.solution);
  if (isComplete) {
    state.isComplete = true;
    state.completedAt = new Date().toISOString();
    state.durationSeconds = Math.round(
      (Date.now() - (room.levelStartTime || Date.now())) / 1000
    );

    room.players.forEach((p) => (p.currentLevelSolved = true));
    room.outcomeHistory[room.currentLevel] = {
      solvedAt: state.completedAt,
      retries: room.retriesCount,
      difficulty: room.difficulty,
      hintsUsed: 5 - state.hintsRemaining,
      durationSeconds: state.durationSeconds,
    };
  }

  state.stateVersion = (state.stateVersion || 1) + 1;
  room.stateVersion = (room.stateVersion || 1) + 1;

  const result = { success: true, room: sanitizeRoomForClient(room), isComplete };
  if (txId) {
    processedTransactions.set(txId, { result, timestamp: Date.now() });
  }

  void setSerializedRoom(room.code, JSON.stringify(room));
  return result;
}

export function updatePlayerCursor(
  code: string,
  playerId: string,
  row: number,
  col: number
): { success: boolean; room?: MultiplayerRoom } {
  const room = getRoom(code);
  if (!room || !room.sudokuState) return { success: false };
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { success: false };

  room.sudokuState.playerCursors[playerId] = {
    row,
    col,
    playerName: player.name,
    avatarId: player.avatarId,
    updatedAt: Date.now(),
  };
  player.lastActiveAt = new Date().toISOString();

  return { success: true, room: sanitizeRoomForClient(room) };
}

export function requestSharedSudokuHint(
  code: string,
  playerId: string
): { success: boolean; hint?: unknown; error?: string; room?: MultiplayerRoom } {
  const room = getRoom(code);
  if (!room || !room.sudokuState) {
    return { success: false, error: "Active Sudoku puzzle not found" };
  }
  const state = room.sudokuState;
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { success: false, error: "Operative not recognized" };

  if (state.hintsRemaining <= 0) {
    return { success: false, error: "All 5 shared tactical hints have been exhausted." };
  }
  if (!state.solution) {
    return { success: false, error: "Server solution unavailable" };
  }

  const hint = getSudoku6x6Hint(state.currentGrid, state.solution, state.initialGrid);
  if (!hint) {
    return { success: false, error: "No further logical deductions available." };
  }

  state.hintsRemaining -= 1;
  const hintRecord = {
    hintIndex: 5 - state.hintsRemaining,
    requestedBy: playerId,
    requestedByName: player.name,
    row: hint.row,
    col: hint.col,
    value: hint.value,
    explanation: hint.explanation,
    timestamp: Date.now(),
  };
  state.hintsHistory.push(hintRecord);

  if (state.contributions[playerId]) {
    state.contributions[playerId].hintsRequested += 1;
  }

  return {
    success: true,
    hint: hintRecord,
    room: sanitizeRoomForClient(room),
  };
}

export function submitLevelSolution(
  code: string,
  playerId: string,
  solutionPayload: Record<string, unknown>
): { success: boolean; room: MultiplayerRoom; allSolved: boolean; levelAdvanced: boolean } {
  const room = getRoom(code);
  if (!room) throw new Error("Room not found");

  const player = room.players.find((p) => p.id === playerId);
  if (player) {
    player.currentLevelSolved = true;
    player.lastActiveAt = new Date().toISOString();
    if (solutionPayload.betrayalDecision) {
      player.betrayalDecision = solutionPayload.betrayalDecision as "COOPERATE" | "BETRAY";
    }
  }

  const allSolved = room.players.every((p) => p.currentLevelSolved);
  let levelAdvanced = false;

  if (allSolved) {
    room.outcomeHistory[room.currentLevel] = {
      solvedAt: new Date().toISOString(),
      retries: room.retriesCount,
      difficulty: room.difficulty,
    };

    if (room.currentLevel < room.totalLevels) {
      room.currentLevel += 1;
      room.levelStartTime = Date.now();
      room.serverDeadlineTimestamp = Date.now() + 180 * 1000;
      room.players.forEach((p) => (p.currentLevelSolved = false));
      levelAdvanced = true;
    } else {
      room.status = "game_over";
    }
  }

  return {
    success: true,
    room: sanitizeRoomForClient(room),
    allSolved,
    levelAdvanced,
  };
}

export function triggerTeamRetry(code: string): MultiplayerRoom | null {
  const room = getRoom(code);
  if (!room) return null;
  room.retriesCount += 1;
  room.levelStartTime = Date.now();
  room.serverDeadlineTimestamp = Date.now() + 180 * 1000;
  room.players.forEach((p) => (p.currentLevelSolved = false));

  // Reset Sudoku board to initial state if chamber 1
  if (room.sudokuState) {
    room.sudokuState.currentGrid = cloneGrid6x6(room.sudokuState.initialGrid);
    room.sudokuState.isComplete = false;
    room.sudokuState.conflictsCount = 0;
    room.sudokuState.cellMetadata = {};
  }

  room.status = "in_progress";
  return sanitizeRoomForClient(room);
}

export async function reconnectPlayer(
  code: string,
  playerId: string,
  candidateToken: string
): Promise<{ success: boolean; room?: MultiplayerRoom; error?: string }> {
  const room = getRoom(code);
  if (!room) {
    return { success: false, error: "Session room not found or expired." };
  }
  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return { success: false, error: "Player identity does not belong to this squad." };
  }

  // Validate reconnect token
  const tokenPayload = await validateReconnectToken(candidateToken);
  const tokenMatches =
    (tokenPayload && tokenPayload.roomCode === code.toUpperCase() && tokenPayload.playerId === playerId) ||
    player.reconnectToken === candidateToken;

  if (!tokenMatches) {
    return { success: false, error: "Invalid or expired reconnection token." };
  }

  player.isOnline = true;
  player.lastHeartbeatTimestamp = Date.now();
  player.lastActiveAt = new Date().toISOString();

  return { success: true, room: sanitizeRoomForClient(room) };
}

export function recordPlayerHeartbeat(
  code: string,
  playerId: string
): { success: boolean; activeCount: number } {
  const room = getRoom(code);
  if (!room) return { success: false, activeCount: 0 };
  const now = Date.now();
  const player = room.players.find((p) => p.id === playerId);
  if (player) {
    player.lastHeartbeatTimestamp = now;
    player.isOnline = true;
  }

  // Check all players' heartbeat status (45s window)
  room.players.forEach((p) => {
    if (p.lastHeartbeatTimestamp && now - p.lastHeartbeatTimestamp > 45_000) {
      p.isOnline = false;
    }
  });

  const activeCount = room.players.filter((p) => p.isOnline !== false).length;
  return { success: true, activeCount };
}

export function getMultiplayerStoreMetrics(): {
  activeRoomsCount: number;
  totalPlayersCount: number;
  inProgressRoomsCount: number;
} {
  let totalPlayers = 0;
  let inProgress = 0;
  for (const r of activeRooms.values()) {
    totalPlayers += r.players.length;
    if (r.status === "in_progress") inProgress++;
  }
  return {
    activeRoomsCount: activeRooms.size,
    totalPlayersCount: totalPlayers,
    inProgressRoomsCount: inProgress,
  };
}

export const multiplayerStore = {
  createRoom,
  getRoom,
  getClientRoom,
  setRoomDifficulty,
  joinRoom,
  togglePlayerReady,
  startCampaign,
  makeSudoku6x6Move,
  updatePlayerCursor,
  requestSharedSudokuHint,
  submitLevelSolution,
  triggerTeamRetry,
  reconnectPlayer,
  recordPlayerHeartbeat,
  getMultiplayerStoreMetrics,
};
