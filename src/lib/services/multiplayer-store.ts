import crypto from "crypto";

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

export interface MultiplayerRoom {
  code: string;
  hostId: string;
  createdAt: string;
  status: "lobby" | "in_progress" | "level_completed" | "game_over" | "retry_pending";
  currentLevel: number;
  totalLevels: number;
  players: MultiplayerPlayer[];
  serverDeadlineTimestamp?: number | null;
  levelStartTime?: number | null;
  retriesCount: number;
  outcomeHistory: Record<
    number,
    {
      solvedAt?: string;
      retries: number;
      betrayalSummary?: Record<string, string>;
    }
  >;
}

// Global in-memory room store (preserved across requests in dev/serverless container)
const activeRooms: Map<string, MultiplayerRoom> = new Map();

export function createRoom(hostName: string): { room: MultiplayerRoom; hostId: string } {
  const code = "AL" + Math.floor(1000 + Math.random() * 9000).toString();
  const hostId = "usr_" + crypto.randomBytes(6).toString("hex");

  const room: MultiplayerRoom = {
    code,
    hostId,
    createdAt: new Date().toISOString(),
    status: "lobby",
    currentLevel: 1,
    totalLevels: 8,
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
  return { room, hostId };
}

export function getRoom(code: string): MultiplayerRoom | null {
  const normalized = code.trim().toUpperCase();
  return activeRooms.get(normalized) || null;
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
  return { success: true, playerId, room };
}

export function togglePlayerReady(code: string, playerId: string): MultiplayerRoom | null {
  const room = getRoom(code);
  if (!room) return null;
  const p = room.players.find((x) => x.id === playerId);
  if (p) {
    p.isReady = !p.isReady;
    p.lastActiveAt = new Date().toISOString();
  }
  return room;
}

export function startCampaign(code: string, hostId: string): { success: boolean; room?: MultiplayerRoom; error?: string } {
  const room = getRoom(code);
  if (!room) return { success: false, error: "Room not found." };
  if (room.hostId !== hostId) return { success: false, error: "Only the host can initiate the campaign." };

  const allReady = room.players.every((p) => p.isReady);
  if (!allReady && room.players.length > 1) {
    return { success: false, error: "All operatives must mark Ready before deployment." };
  }

  room.status = "in_progress";
  room.currentLevel = 1;
  room.levelStartTime = Date.now();
  // Server-authoritative deadline: 90 seconds for Level 1
  room.serverDeadlineTimestamp = Date.now() + 90 * 1000;
  room.players.forEach((p) => (p.currentLevelSolved = false));

  return { success: true, room };
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
    };

    if (room.currentLevel < room.totalLevels) {
      room.currentLevel += 1;
      room.levelStartTime = Date.now();
      room.serverDeadlineTimestamp = Date.now() + 90 * 1000;
      room.players.forEach((p) => (p.currentLevelSolved = false));
      levelAdvanced = true;
    } else {
      room.status = "game_over";
    }
  }

  return { success: true, room, allSolved, levelAdvanced };
}

export function triggerTeamRetry(code: string): MultiplayerRoom | null {
  const room = getRoom(code);
  if (!room) return null;
  room.retriesCount += 1;
  room.levelStartTime = Date.now();
  room.serverDeadlineTimestamp = Date.now() + 90 * 1000;
  room.players.forEach((p) => (p.currentLevelSolved = false));
  room.status = "in_progress";
  return room;
}

export const multiplayerStore = {
  createRoom,
  getRoom,
  joinRoom,
  togglePlayerReady,
  startCampaign,
  submitLevelSolution,
  triggerTeamRetry,
};
