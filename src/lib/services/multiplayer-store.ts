import crypto from "crypto";
import {
  generateSudoku6x6,
  cloneGrid6x6,
  findGridConflicts6x6,
  isSudoku6x6Complete,
  getSudoku6x6Hint,
  Sudoku6x6Difficulty,
} from "@/lib/gameplay/sudoku-6x6-engine";

export interface MultiplayerPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatarId: "aarav" | "aanya" | "warden" | "mira";
  lastActiveAt: string;
  currentLevelSolved: boolean;
  betrayalDecision?: "COOPERATE" | "BETRAY";
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

// Global in-memory room store (persists across requests)
const activeRooms: Map<string, MultiplayerRoom> = new Map();

export function createRoom(
  hostName: string,
  initialDifficulty: Sudoku6x6Difficulty = "medium"
): { room: MultiplayerRoom; hostId: string } {
  const code = "AL" + Math.floor(1000 + Math.random() * 9000).toString();
  const hostId = "usr_" + crypto.randomBytes(6).toString("hex");

  const room: MultiplayerRoom = {
    code,
    hostId,
    createdAt: new Date().toISOString(),
    status: "lobby",
    currentLevel: 1,
    totalLevels: 8,
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
      },
    ],
    outcomeHistory: {},
  };

  activeRooms.set(code, room);
  return { room: sanitizeRoomForClient(room), hostId };
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
  if (!room) return { success: false, error: "Alliance room not found." };
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
): { success: boolean; playerId?: string; room?: MultiplayerRoom; error?: string } {
  const room = getRoom(code);
  if (!room) {
    return { success: false, error: "Alliance room not found." };
  }
  if (room.players.length >= 4) {
    return { success: false, error: "Alliance is full (maximum 4 operatives)." };
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

  const newPlayer: MultiplayerPlayer = {
    id: playerId,
    name: playerName || `Operative ${room.players.length + 1}`,
    isHost: false,
    isReady: false,
    avatarId: assignedAvatar,
    lastActiveAt: new Date().toISOString(),
    currentLevelSolved: false,
  };

  room.players.push(newPlayer);
  return { success: true, playerId, room: sanitizeRoomForClient(room) };
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

  return { success: true, room: sanitizeRoomForClient(room) };
}

export function makeSudoku6x6Move(
  code: string,
  playerId: string,
  row: number,
  col: number,
  value: number
): { success: boolean; room?: MultiplayerRoom; error?: string; isComplete?: boolean } {
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

  return { success: true, room: sanitizeRoomForClient(room), isComplete };
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
};
