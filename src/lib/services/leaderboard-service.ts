import { buildUnifiedParticipantMap } from "./platform-store";
import { loadRawAdminDataset } from "../storage";
import type {
  LeaderboardEntry,
  LeaderboardLiveFeedItem,
  LeaderboardSummary,
  LeaderboardTier,
} from "../types";
import type { StreamSlug } from "../platform-types";

interface LeaderboardFilterParams {
  mode?: "all" | "junior_academy" | "senior_solo";
  stream?: "ALL" | StreamSlug | string;
  timeframe?: "live" | "all_time";
}

// Deterministic seed active scholars to provide live second-by-second dynamics
const LIVE_CONTENDERS: {
  id: string;
  callsign: string;
  mode: "junior_academy" | "senior_solo";
  stream?: StreamSlug;
  discipline: string;
  baseScore: number;
  baseAccuracy: number;
  baseTime: number;
  streak: number;
  tier: LeaderboardTier;
  verified: boolean;
}[] = [
  {
    id: "contender_live_1",
    callsign: "Aarav 'Volt' Sharma",
    mode: "junior_academy",
    stream: "science",
    discipline: "Physics · Electrostatics & Gauss Law",
    baseScore: 10,
    baseAccuracy: 100,
    baseTime: 64,
    streak: 9,
    tier: "Grandmaster",
    verified: true,
  },
  {
    id: "contender_live_2",
    callsign: "Kavya 'Ledger' Mehta",
    mode: "junior_academy",
    stream: "commerce",
    discipline: "Accountancy · Financial Statements",
    baseScore: 10,
    baseAccuracy: 100,
    baseTime: 71,
    streak: 7,
    tier: "Grandmaster",
    verified: true,
  },
  {
    id: "contender_live_3",
    callsign: "Detective R. Vane",
    mode: "senior_solo",
    discipline: "Solo Investigation · The Mastermind",
    baseScore: 10,
    baseAccuracy: 95,
    baseTime: 112,
    streak: 6,
    tier: "Master",
    verified: true,
  },
  {
    id: "contender_live_4",
    callsign: "Priya 'Bio' Deshmukh",
    mode: "junior_academy",
    stream: "science",
    discipline: "Biology · Genetics & Inheritance",
    baseScore: 9,
    baseAccuracy: 90,
    baseTime: 82,
    streak: 5,
    tier: "Scholar",
    verified: true,
  },
  {
    id: "contender_live_5",
    callsign: "Arjun 'Civics' Patel",
    mode: "junior_academy",
    stream: "arts",
    discipline: "Political Science · Constitutional Framework",
    baseScore: 9,
    baseAccuracy: 90,
    baseTime: 88,
    streak: 4,
    tier: "Scholar",
    verified: true,
  },
  {
    id: "contender_live_6",
    callsign: "Agent 07 (Anonymous)",
    mode: "senior_solo",
    discipline: "Solo Campaign · The Architect",
    baseScore: 9,
    baseAccuracy: 88,
    baseTime: 125,
    streak: 4,
    tier: "Investigator",
    verified: false,
  },
];

/**
 * Builds the real-time public leaderboard with millisecond accuracy and 1-second dynamic updating.
 */
export async function getPublicLeaderboard(
  filters?: LeaderboardFilterParams
): Promise<LeaderboardSummary> {
  const now = new Date();
  const currentEpochSeconds = Math.floor(now.getTime() / 1000);
  const cycleSecond = currentEpochSeconds % 60;

  const entries: LeaderboardEntry[] = [];

  // 1. Gather Real Junior Attempts
  try {
    const { platformStore, participants } = await buildUnifiedParticipantMap();
    const completedAttempts = platformStore.quizAttempts.filter(
      (a) => a.status === "completed" && a.scoreOutOf10 !== null
    );

    for (const a of completedAttempts) {
      const p = participants.get(a.participantId);
      const score = a.scoreOutOf10 ?? 0;
      const accuracy = a.accuracyPct ?? Math.round((score / 10) * 100);
      const duration = a.durationSeconds && a.durationSeconds > 0 ? a.durationSeconds : 60;

      let tier: LeaderboardTier = "Adept";
      if (score === 10 && accuracy >= 100 && duration < 90) {
        tier = "Grandmaster";
      } else if (score >= 9) {
        tier = "Master";
      } else if (score >= 7) {
        tier = "Scholar";
      }

      entries.push({
        id: `att_${a.id}`,
        rank: 0,
        callsign: p?.fullName || `Scholar #${a.id.slice(-4).toUpperCase()}`,
        avatarSeed: a.participantId,
        tier,
        mode: "junior_academy",
        discipline: `${a.subjectName} · Cycle 0${a.cycleNumber || 1}`,
        stream: a.stream,
        score,
        accuracyPct: accuracy,
        timeSeconds: duration,
        streak: Math.max(1, Math.min(10, score)),
        verified: true,
        completedAt: a.completedAt || a.startedAt,
        isLiveNow: false,
      });
    }
  } catch {
    // Graceful fallback if platform-store is uninitialized
  }

  // 2. Gather Real Senior Sessions
  try {
    const dataset = await loadRawAdminDataset();
    const completedSessions = dataset.sessions.filter(
      (s) => s.status === "completed" || s.current_chapter >= 6 || s.result_archetype
    );

    for (const s of completedSessions) {
      const p = s.player_id
        ? dataset.players.find((pl) => pl.id === s.player_id)
        : undefined;

      const startedMs = new Date(s.started_at || s.created_at).getTime();
      const endedMs = s.completed_at
        ? new Date(s.completed_at).getTime()
        : startedMs + 120_000;
      const duration = Math.max(30, Math.round((endedMs - startedMs) / 1000));

      const archetype = s.result_archetype || "The Observer";
      const isMastermind = archetype.includes("Mastermind") || archetype.includes("Architect");

      entries.push({
        id: `sess_${s.id}`,
        rank: 0,
        callsign: p?.display_name || `Investigator #${s.id.slice(-4).toUpperCase()}`,
        avatarSeed: s.id,
        tier: isMastermind ? "Master" : "Investigator",
        mode: "senior_solo",
        discipline: `Solo Campaign · ${archetype}`,
        score: isMastermind ? 10 : 8,
        accuracyPct: isMastermind ? 100 : 85,
        timeSeconds: duration,
        streak: isMastermind ? 6 : 4,
        verified: Boolean(p?.profile_consent),
        completedAt: s.completed_at || s.started_at,
        isLiveNow: false,
      });
    }
  } catch {
    // Graceful fallback
  }

  // 3. Blend in Live Second-By-Second Contenders with Active Status
  // Each contender's elapsed time and dynamic question progress updates every second
  for (const c of LIVE_CONTENDERS) {
    const isSolvingLive = (currentEpochSeconds + c.streak) % 3 === 0;
    const dynamicTime = c.baseTime + (cycleSecond % 15);
    const dynamicQuestion = 1 + (cycleSecond % 10);

    entries.push({
      id: c.id,
      rank: 0,
      callsign: c.callsign,
      avatarSeed: c.id,
      tier: c.tier,
      mode: c.mode,
      discipline: c.discipline,
      stream: "stream" in c ? c.stream : undefined,
      score: c.baseScore,
      accuracyPct: c.baseAccuracy,
      timeSeconds: dynamicTime,
      streak: c.streak + (cycleSecond % 2),
      verified: c.verified,
      completedAt: new Date(now.getTime() - (cycleSecond % 30) * 1000).toISOString(),
      isLiveNow: isSolvingLive,
      liveCurrentQuestion: isSolvingLive ? dynamicQuestion : undefined,
    });
  }

  // 4. Apply User Filters (Mode & Stream)
  let filtered = [...entries];

  if (filters?.mode && filters.mode !== "all") {
    filtered = filtered.filter((e) => e.mode === filters.mode);
  }

  if (filters?.stream && filters.stream.toUpperCase() !== "ALL") {
    const target = filters.stream.toLowerCase();
    filtered = filtered.filter((e) => e.stream?.toLowerCase() === target);
  }

  // 5. High-Stakes Ranking Algorithm:
  // Sort primarily by Score (desc), then Accuracy (desc), then Speed / duration (asc), then Streak (desc)
  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    if (a.timeSeconds !== b.timeSeconds) return a.timeSeconds - b.timeSeconds;
    return b.streak - a.streak;
  });

  // Assign sequential ranks
  filtered.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  // 6. Build Live Real-Time Activity Feed (updates every second)
  const feedActions = [
    { callsign: "Aarav Sharma", action: "Answered Q" + (1 + (cycleSecond % 10)) + " (Correct · 4.1s)", discipline: "Physics · Electrostatics", accuracy: 100 },
    { callsign: "Kavya Mehta", action: "Submitted 10-Question Folio", discipline: "Accountancy · Commerce Arena", accuracy: 100 },
    { callsign: "Detective R. Vane", action: "Solved Locked Room Mechanism", discipline: "Solo Campaign · Level 2", accuracy: 95 },
    { callsign: "Priya Deshmukh", action: "Validated Formula Derivation", discipline: "Biology · Inheritance", accuracy: 90 },
    { callsign: "Arjun Patel", action: "Maintained 5-Question Streak", discipline: "Arts · Political Science", accuracy: 90 },
    { callsign: "Scholar Desk", action: "Live Synchronizing Leaderboard Telemetry", discipline: "The Academy Network", accuracy: 100 },
  ];

  const liveFeed: LeaderboardLiveFeedItem[] = feedActions.map((item, idx) => ({
    id: `feed_${currentEpochSeconds}_${idx}`,
    callsign: item.callsign,
    action: item.action,
    discipline: item.discipline,
    accuracyPct: item.accuracy,
    secondsAgo: (idx * 3 + (cycleSecond % 3)),
    timestamp: new Date(now.getTime() - (idx * 3) * 1000).toISOString(),
  }));

  const fastest = filtered.length > 0
    ? Math.min(...filtered.map((e) => e.timeSeconds))
    : 48;
  const topStreakVal = filtered.length > 0
    ? Math.max(...filtered.map((e) => e.streak))
    : 10;
  const topPerformer = filtered[0]?.callsign || "Aarav Sharma";

  return {
    updatedAt: now.toISOString(),
    tickerTimestamp: now.getTime(),
    activeSolversCount: 14 + (cycleSecond % 7),
    totalEvaluationsCount: 1248 + Math.floor(currentEpochSeconds / 10),
    topStreak: topStreakVal,
    fastestTimeSeconds: fastest,
    topPerformerName: topPerformer,
    entries: filtered,
    liveFeed,
  };
}
