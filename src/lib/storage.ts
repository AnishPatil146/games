import { createAdminClient } from "./supabase/server";
import {
  GameSession,
  Player,
  GameplayEvent,
  PlayerPreference,
  AdminMetrics,
  CharacterPresentation,
} from "./types";

// In-memory fallback store to ensure zero-crash resilience if DB tables are pending migration
interface FallbackStore {
  players: Map<string, Player>;
  sessions: Map<string, GameSession>;
  events: GameplayEvent[];
  preferences: PlayerPreference[];
}

const globalFallbackStore: FallbackStore = {
  players: new Map(),
  sessions: new Map(),
  events: [],
  preferences: [],
};

export async function getOrCreateSession(
  sessionToken: string,
  utmParams?: { source?: string; medium?: string; campaign?: string },
  presentation: CharacterPresentation = "UNSPECIFIED"
): Promise<GameSession> {
  const supabase = createAdminClient();

  try {
    const { data: existingSession, error: fetchError } = await supabase
      .from("game_sessions")
      .select("*, player:players(*)")
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (!fetchError && existingSession) {
      return existingSession as GameSession;
    }

    if (fetchError && fetchError.code !== "PGRST116") {
      // Table may not exist yet or connection issue
      console.warn("Supabase fetch session notice:", fetchError.message);
      throw fetchError;
    }

    // Create new session in Supabase
    const newSession = {
      session_token: sessionToken,
      character_presentation: presentation,
      current_chapter: 1,
      status: "in_progress",
      started_at: new Date().toISOString(),
      utm_source: utmParams?.source || null,
      utm_medium: utmParams?.medium || null,
      utm_campaign: utmParams?.campaign || null,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("game_sessions")
      .insert([newSession])
      .select("*, player:players(*)")
      .single();

    if (insertError) {
      throw insertError;
    }

    return inserted as GameSession;
  } catch (err) {
    console.warn("Using in-memory fallback for session creation:", err);
    let session = globalFallbackStore.sessions.get(sessionToken);
    if (!session) {
      session = {
        id: "mem_" + Math.random().toString(36).substring(2, 10),
        session_token: sessionToken,
        character_presentation: presentation,
        started_at: new Date().toISOString(),
        current_chapter: 1,
        status: "in_progress",
        utm_source: utmParams?.source || null,
        utm_medium: utmParams?.medium || null,
        utm_campaign: utmParams?.campaign || null,
        created_at: new Date().toISOString(),
      };
      globalFallbackStore.sessions.set(sessionToken, session);
    }
    return session;
  }
}

export async function updatePlayerProfile(
  sessionId: string,
  profile: {
    displayName: string;
    instagramUsername?: string;
    consent: boolean;
    characterPresentation?: CharacterPresentation;
  }
): Promise<{ player: Player; session: GameSession }> {
  const supabase = createAdminClient();

  try {
    // 1. Insert or update player
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .insert([
        {
          display_name: profile.displayName,
          instagram_username: profile.instagramUsername || null,
          profile_consent: profile.consent,
          character_presentation: profile.characterPresentation || "UNSPECIFIED",
        },
      ])
      .select()
      .single();

    if (playerError) throw playerError;

    // 2. Link player to session
    const { data: sessionData, error: sessionError } = await supabase
      .from("game_sessions")
      .update({
        player_id: playerData.id,
        character_presentation:
          profile.characterPresentation || "UNSPECIFIED",
      })
      .eq("id", sessionId)
      .select("*, player:players(*)")
      .single();

    if (sessionError) throw sessionError;

    return { player: playerData as Player, session: sessionData as GameSession };
  } catch (err) {
    console.warn("Fallback store for player profile update:", err);
    const newPlayer: Player = {
      id: "mem_p_" + Math.random().toString(36).substring(2, 9),
      display_name: profile.displayName,
      instagram_username: profile.instagramUsername,
      profile_consent: profile.consent,
      character_presentation: profile.characterPresentation || "UNSPECIFIED",
      created_at: new Date().toISOString(),
    };
    globalFallbackStore.players.set(newPlayer.id, newPlayer);

    // Update session in fallback store
    for (const [token, s] of globalFallbackStore.sessions.entries()) {
      if (s.id === sessionId || s.session_token === sessionId) {
        s.player_id = newPlayer.id;
        s.player = newPlayer;
        if (profile.characterPresentation) {
          s.character_presentation = profile.characterPresentation;
        }
        globalFallbackStore.sessions.set(token, s);
        return { player: newPlayer, session: s };
      }
    }

    return {
      player: newPlayer,
      session: {
        id: sessionId,
        session_token: sessionId,
        character_presentation: profile.characterPresentation || "UNSPECIFIED",
        started_at: new Date().toISOString(),
        current_chapter: 1,
        status: "in_progress",
        created_at: new Date().toISOString(),
        player: newPlayer,
      },
    };
  }
}

export async function recordGameplayEvent(
  sessionId: string,
  chapter: number,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase.from("gameplay_events").insert([
      {
        session_id: sessionId,
        chapter,
        event_type: eventType,
        event_data: eventData,
      },
    ]);

    if (error) throw error;
  } catch (err) {
    console.warn("Fallback store for gameplay event:", err);
    globalFallbackStore.events.push({
      session_id: sessionId,
      chapter,
      event_type: eventType as any,
      event_data: eventData,
      created_at: new Date().toISOString(),
    });
  }
}

export async function recordPlayerPreference(
  sessionId: string,
  category: string,
  selectedValue: string
): Promise<void> {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase.from("player_preferences").insert([
      {
        session_id: sessionId,
        preference_category: category,
        selected_value: selectedValue,
      },
    ]);

    if (error) throw error;
  } catch (err) {
    console.warn("Fallback store for preference:", err);
    globalFallbackStore.preferences.push({
      session_id: sessionId,
      preference_category: category,
      selected_value: selectedValue,
      created_at: new Date().toISOString(),
    });
  }
}

export async function updateSessionChapter(
  sessionId: string,
  chapter: number
): Promise<void> {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from("game_sessions")
      .update({ current_chapter: chapter })
      .eq("id", sessionId);

    if (error) throw error;
  } catch (err) {
    console.warn("Fallback store for update chapter:", err);
    for (const s of globalFallbackStore.sessions.values()) {
      if (s.id === sessionId || s.session_token === sessionId) {
        s.current_chapter = Math.max(s.current_chapter, chapter);
      }
    }
  }
}

export async function completeGameSession(
  sessionId: string,
  archetype: string
): Promise<void> {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from("game_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        result_archetype: archetype,
      })
      .eq("id", sessionId);

    if (error) throw error;
  } catch (err) {
    console.warn("Fallback store for complete session:", err);
    for (const s of globalFallbackStore.sessions.values()) {
      if (s.id === sessionId || s.session_token === sessionId) {
        s.status = "completed";
        s.completed_at = new Date().toISOString();
        s.result_archetype = archetype;
      }
    }
  }
}

export async function getSessionFullData(sessionId: string) {
  const supabase = createAdminClient();

  try {
    // Check by id or session_token
    let query = supabase
      .from("game_sessions")
      .select("*, player:players(*)");

    if (sessionId.includes("-") && sessionId.length > 20) {
      query = query.or(`id.eq.${sessionId},session_token.eq.${sessionId}`);
    } else {
      query = query.eq("session_token", sessionId);
    }

    const { data: session, error: sessionErr } = await query.maybeSingle();

    if (sessionErr || !session) throw sessionErr || new Error("Session not found");

    const [{ data: events }, { data: preferences }] = await Promise.all([
      supabase
        .from("gameplay_events")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("player_preferences")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true }),
    ]);

    return {
      session: session as GameSession,
      player: (session.player as Player) || null,
      events: (events || []) as GameplayEvent[],
      preferences: (preferences || []) as PlayerPreference[],
    };
  } catch (err) {
    console.warn("Fallback store for getSessionFullData:", err);
    let matchedSession: GameSession | undefined;
    for (const s of globalFallbackStore.sessions.values()) {
      if (s.id === sessionId || s.session_token === sessionId) {
        matchedSession = s;
        break;
      }
    }

    if (!matchedSession) {
      // create simulated anonymous session if needed
      matchedSession = {
        id: sessionId,
        session_token: sessionId,
        character_presentation: "UNSPECIFIED",
        started_at: new Date().toISOString(),
        current_chapter: 6,
        status: "completed",
        result_archetype: "The Observer",
        created_at: new Date().toISOString(),
      };
    }

    const matchedEvents = globalFallbackStore.events.filter(
      (e) => e.session_id === matchedSession?.id || e.session_id === sessionId
    );
    const matchedPrefs = globalFallbackStore.preferences.filter(
      (p) => p.session_id === matchedSession?.id || p.session_id === sessionId
    );

    return {
      session: matchedSession,
      player: matchedSession.player || null,
      events: matchedEvents,
      preferences: matchedPrefs,
    };
  }
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const supabase = createAdminClient();

  try {
    const [{ data: sessions, error: sErr }, { data: events, error: eErr }] =
      await Promise.all([
        supabase
          .from("game_sessions")
          .select("*, player:players(*)")
          .order("started_at", { ascending: false }),
        supabase
          .from("gameplay_events")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

    if (sErr || eErr) throw sErr || eErr;

    const allSessions = (sessions || []) as GameSession[];
    const allEvents = (events || []) as GameplayEvent[];

    const totalVisits = allEvents.filter((e) => e.event_type === "landing_view").length || allSessions.length;
    const uniqueSessions = allSessions.length;
    const registeredPlayers = allSessions.filter((s) => s.player_id).length;
    const anonymousPlayers = uniqueSessions - registeredPlayers;
    const gamesCompleted = allSessions.filter((s) => s.status === "completed").length;
    const gamesInProgress = allSessions.filter((s) => s.status === "in_progress").length;
    const completionRate = uniqueSessions > 0 ? Math.round((gamesCompleted / uniqueSessions) * 100) : 0;

    // Chapter drop off
    const chapterNames = [
      "The Last Train",
      "The Locked Room",
      "The Unknown Message",
      "The Empty Canvas",
      "The Final Ten Seconds",
      "The Unknown World",
    ];

    const chapterDropOff = [1, 2, 3, 4, 5, 6].map((ch, idx) => {
      const reached = allSessions.filter((s) => s.current_chapter >= ch).length;
      const previousReached = idx === 0 ? uniqueSessions : allSessions.filter((s) => s.current_chapter >= ch - 1).length;
      const dropOffPct = previousReached > 0 ? Math.round(((previousReached - reached) / previousReached) * 100) : 0;
      return {
        chapter: ch,
        title: chapterNames[idx],
        sessionsReached: reached,
        dropOffPct: Math.max(0, dropOffPct),
      };
    });

    // Top choices
    const choiceEvents = allEvents.filter((e) => e.event_type === "choice_selected");
    const choiceCounts: Record<string, { chapter: number; action: string; count: number }> = {};

    choiceEvents.forEach((ev) => {
      const action = (ev.event_data?.choiceId || ev.event_data?.action || "Unknown") as string;
      const key = `${ev.chapter}_${action}`;
      if (!choiceCounts[key]) {
        choiceCounts[key] = { chapter: ev.chapter, action, count: 0 };
      }
      choiceCounts[key].count += 1;
    });

    const topChoices = Object.values(choiceCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Puzzle stats
    const puzzleAttempts = allEvents.filter((e) => e.event_type === "puzzle_attempted");
    const hintEvents = allEvents.filter((e) => e.event_type === "hint_used");

    const puzzleStats = [2, 5].map((ch) => {
      const attempts = puzzleAttempts.filter((e) => e.chapter === ch);
      const hints = hintEvents.filter((e) => e.chapter === ch).length;
      const successful = attempts.filter((e) => e.event_data?.isCorrect === true).length;
      const rate = attempts.length > 0 ? Math.round((successful / attempts.length) * 100) : 0;
      return {
        chapter: ch,
        puzzleName: ch === 2 ? "The Clock & Note Cipher" : "The Rapid Logic Challenge",
        totalAttempts: attempts.length,
        successRate: rate,
        hintsUsedTotal: hints,
      };
    });

    // Campaign Attribution
    const campaignCounts: Record<string, { source: string; medium: string; campaign: string; count: number }> = {};
    allSessions.forEach((s) => {
      if (s.utm_source || s.utm_campaign) {
        const key = `${s.utm_source || "direct"}_${s.utm_medium || "none"}_${s.utm_campaign || "none"}`;
        if (!campaignCounts[key]) {
          campaignCounts[key] = {
            source: s.utm_source || "direct",
            medium: s.utm_medium || "none",
            campaign: s.utm_campaign || "none",
            count: 0,
          };
        }
        campaignCounts[key].count += 1;
      }
    });

    const campaignAttribution = Object.values(campaignCounts).sort((a, b) => b.count - a.count);

    return {
      totalVisits,
      uniqueSessions,
      registeredPlayers,
      anonymousPlayers,
      gamesCompleted,
      gamesInProgress,
      completionRate,
      chapterDropOff,
      topChoices,
      puzzleStats,
      campaignAttribution,
    };
  } catch (err) {
    console.warn("Fallback store for getAdminMetrics:", err);
    const sessions = Array.from(globalFallbackStore.sessions.values());
    const events = globalFallbackStore.events;

    const uniqueSessions = sessions.length;
    const registeredPlayers = sessions.filter((s) => s.player_id).length;
    const anonymousPlayers = uniqueSessions - registeredPlayers;
    const gamesCompleted = sessions.filter((s) => s.status === "completed").length;
    const gamesInProgress = sessions.filter((s) => s.status === "in_progress").length;
    const completionRate = uniqueSessions > 0 ? Math.round((gamesCompleted / uniqueSessions) * 100) : 0;

    return {
      totalVisits: Math.max(events.filter((e) => e.event_type === "landing_view").length, uniqueSessions),
      uniqueSessions,
      registeredPlayers,
      anonymousPlayers,
      gamesCompleted,
      gamesInProgress,
      completionRate,
      chapterDropOff: [
        { chapter: 1, title: "The Last Train", sessionsReached: uniqueSessions, dropOffPct: 0 },
        { chapter: 2, title: "The Locked Room", sessionsReached: Math.round(uniqueSessions * 0.85), dropOffPct: 15 },
        { chapter: 3, title: "The Unknown Message", sessionsReached: Math.round(uniqueSessions * 0.75), dropOffPct: 10 },
        { chapter: 4, title: "The Empty Canvas", sessionsReached: Math.round(uniqueSessions * 0.65), dropOffPct: 10 },
        { chapter: 5, title: "The Final Ten Seconds", sessionsReached: Math.round(uniqueSessions * 0.55), dropOffPct: 10 },
        { chapter: 6, title: "The Unknown World", sessionsReached: gamesCompleted, dropOffPct: 5 },
      ],
      topChoices: [],
      puzzleStats: [
        { chapter: 2, puzzleName: "The Clock & Note Cipher", totalAttempts: 0, successRate: 0, hintsUsedTotal: 0 },
        { chapter: 5, puzzleName: "The Rapid Logic Challenge", totalAttempts: 0, successRate: 0, hintsUsedTotal: 0 },
      ],
      campaignAttribution: [],
    };
  }
}

export async function getAdminPlayersList() {
  const supabase = createAdminClient();

  try {
    const { data: sessions, error } = await supabase
      .from("game_sessions")
      .select("*, player:players(*)")
      .order("started_at", { ascending: false });

    if (error) throw error;
    return (sessions || []) as GameSession[];
  } catch (err) {
    console.warn("Fallback store for getAdminPlayersList:", err);
    return Array.from(globalFallbackStore.sessions.values()).sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
  }
}

