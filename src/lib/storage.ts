import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createPrivilegedClient } from "./supabase/server";
import { getEnvConfig } from "./env";
import type {
  AdminMetrics,
  AdminPlayerListItem,
  CampaignAttributionRow,
  ChapterAnalyticsRow,
  CharacterPresentation,
  ChoiceDistributionRow,
  DeletionRequest,
  GameSession,
  GameplayEvent,
  Player,
  PlayerPreference,
  PlayerReview,
  PuzzleAnalyticsRow,
  ReviewCategory,
  ReviewStatus,
  ReviewStats,
  SessionStatus,
} from "./types";

interface LocalStoreData {
  players: Player[];
  sessions: (GameSession & { session_token: string })[];
  events: GameplayEvent[];
  preferences: PlayerPreference[];
  deletionRequests: DeletionRequest[];
  reviews: PlayerReview[];
}

const DEFAULT_LOCAL_STORE_PATH = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  ".data",
  "local-store.json"
);
let customLocalStorePath: string | null = null;

export function setLocalStorePathForTests(filePath: string | null): void {
  customLocalStorePath = filePath;
  memoryStore = {
    players: [],
    sessions: [],
    events: [],
    preferences: [],
    deletionRequests: [],
    reviews: [],
  };
}

function getLocalStorePath(): string {
  return customLocalStorePath || DEFAULT_LOCAL_STORE_PATH;
}

function shouldUseSupabase(): boolean {
  if (customLocalStorePath) return false;
  return getEnvConfig().isSupabaseConfigured;
}

let memoryStore: LocalStoreData = {
  players: [],
  sessions: [],
  events: [],
  preferences: [],
  deletionRequests: [],
  reviews: [],
};

function readLocalStore(): LocalStoreData {
  const storePath = getLocalStorePath();
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ storePath)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ storePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<LocalStoreData>;
      memoryStore = {
        players: Array.isArray(parsed.players) ? parsed.players : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        events: Array.isArray(parsed.events) ? parsed.events : [],
        preferences: Array.isArray(parsed.preferences) ? parsed.preferences : [],
        deletionRequests: Array.isArray(parsed.deletionRequests)
          ? parsed.deletionRequests
          : [],
        reviews: Array.isArray(parsed.reviews)
          ? parsed.reviews.filter((r) => !r.id?.startsWith("rev_seed_"))
          : [],
      };
    }
  } catch {
    // Serverless read-only fs fallback uses memoryStore cleanly
  }
  return memoryStore;
}

function writeLocalStore(data: LocalStoreData): void {
  memoryStore = data;
  const storePath = getLocalStorePath();
  try {
    const dir = path.dirname(storePath);
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Read-only filesystem in serverless; memoryStore remains active
  }
}

function isSchemaMissingError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err !== "object") return true;
  const code = "code" in err ? String((err as { code?: unknown }).code) : "";
  const msg = "message" in err ? String((err as { message?: unknown }).message).toLowerCase() : "";
  const status = "status" in err ? Number((err as { status?: unknown }).status) : 0;
  return (
    code === "PGRST205" ||
    code === "PGRST202" ||
    code === "42P01" ||
    code === "42883" ||
    code === "PGRST301" ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    msg.includes("could not find the table") ||
    msg.includes("could not find the function") ||
    msg.includes("does not exist") ||
    msg.includes("invalid api key") ||
    msg.includes("jwt") ||
    msg.includes("unauthorized") ||
    msg.includes("forbidden") ||
    msg.includes("fetch failed") ||
    msg.includes("network") ||
    msg.includes("enotfound") ||
    msg.includes("econnrefused")
  );
}

const CHAPTER_TITLES: Record<number, string> = {
  1: "The Last Train",
  2: "The Locked Room",
  3: "The Unknown Message",
  4: "The Empty Canvas",
  5: "The Final Ten Seconds",
  6: "The Unknown World",
};

const CHOICE_LABELS: Record<string, string> = {
  return_wallet: "Return the Wallet",
  call_out: "Call Out to Stranger",
  investigate_first: "Inspect Wallet First",
  catch_train: "Board the Train",
  investigate_sender: "Trace Sender Metadata",
  look_for_evidence: "Sweep Study Perimeter",
  ignore_message: "Withhold Engagement",
  confront_sender: "Demand Identity",
  reply_immediately: "Send Direct Reply",
};

// =============================================================================
// PUBLIC GAMEPLAY STORAGE (STRICTLY TOKEN-SCOPED)
// =============================================================================

export async function getOrCreateSession(
  sessionToken: string,
  campaign?: { source?: string; medium?: string; name?: string },
  presentation: CharacterPresentation = "UNSPECIFIED"
): Promise<{
  session: Omit<GameSession, "session_token">;
  playerDisplayName: string | null;
}> {
  const isSupabaseConfigured = shouldUseSupabase();

  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedClient();
    const { data, error } = await supabase.rpc("rpc_upsert_session", {
      p_session_token: sessionToken,
      p_presentation: presentation,
      p_campaign_source: campaign?.source || null,
      p_campaign_medium: campaign?.medium || null,
      p_campaign_name: campaign?.name || null,
    });

    if (!error && data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      return {
        session: {
          id: String(d.id),
          player_id: (d.player_id as string | null) ?? null,
          character_presentation:
            (d.character_presentation as CharacterPresentation) || "UNSPECIFIED",
          started_at: String(d.started_at),
          completed_at: (d.completed_at as string | null) ?? null,
          current_chapter: Number(d.current_chapter || 1),
          status: (d.status as SessionStatus) || "in_progress",
          result_archetype: (d.result_archetype as string | null) ?? null,
          campaign_source: (d.campaign_source as string | null) ?? null,
          campaign_medium: (d.campaign_medium as string | null) ?? null,
          campaign_name: (d.campaign_name as string | null) ?? null,
          created_at: String(d.created_at || d.started_at),
        },
        playerDisplayName: (d.player_display_name as string | null) ?? null,
      };
    }

    if (error && !isSchemaMissingError(error)) {
      throw new Error(`Session persistence error: ${error.message}`);
    }
  }

  // Local store when Supabase schema is pending installation
  const store = readLocalStore();
  let existing = store.sessions.find((s) => s.session_token === sessionToken);
  const now = new Date().toISOString();

  if (!existing) {
    existing = {
      id: crypto.randomUUID(),
      player_id: null,
      session_token: sessionToken,
      character_presentation: presentation,
      started_at: now,
      completed_at: null,
      current_chapter: 1,
      status: "in_progress",
      result_archetype: null,
      campaign_source: campaign?.source || null,
      campaign_medium: campaign?.medium || null,
      campaign_name: campaign?.name || null,
      utm_source: campaign?.source || null,
      utm_medium: campaign?.medium || null,
      utm_campaign: campaign?.name || null,
      created_at: now,
    };
    store.sessions.push(existing);
    writeLocalStore(store);
  } else if (
    presentation !== "UNSPECIFIED" &&
    existing.character_presentation === "UNSPECIFIED"
  ) {
    existing.character_presentation = presentation;
    writeLocalStore(store);
  }

  const linkedPlayer = existing.player_id
    ? store.players.find((p) => p.id === existing?.player_id)
    : undefined;

  const { session_token: _omitted, ...publicSession } = existing;
  void _omitted;
  return {
    session: publicSession,
    playerDisplayName: linkedPlayer?.display_name || null,
  };
}

export async function updateSessionPresentationByToken(
  sessionToken: string,
  presentation: CharacterPresentation
): Promise<void> {
  const isSupabaseConfigured = shouldUseSupabase();
  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedClient();
    const { error } = await supabase.rpc("rpc_upsert_session", {
      p_session_token: sessionToken,
      p_presentation: presentation,
      p_campaign_source: null,
      p_campaign_medium: null,
      p_campaign_name: null,
    });
    if (!error) return;
    if (!isSchemaMissingError(error)) {
      throw new Error(error.message);
    }
  }

  const store = readLocalStore();
  const existing = store.sessions.find((s) => s.session_token === sessionToken);
  if (existing) {
    existing.character_presentation = presentation;
    writeLocalStore(store);
  }
}

export async function submitProfileByToken(
  sessionToken: string,
  profile: {
    displayName: string;
    instagramUsername?: string;
    consent: boolean;
    characterPresentation: CharacterPresentation;
  }
): Promise<{
  playerId: string;
  displayName: string;
  characterPresentation: CharacterPresentation;
  sessionId: string;
}> {
  if (!profile.consent) {
    throw new Error("Explicit consent is required to link profile details.");
  }

  const isSupabaseConfigured = shouldUseSupabase();
  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedClient();
    const { data, error } = await supabase.rpc("rpc_submit_profile", {
      p_session_token: sessionToken,
      p_display_name: profile.displayName.trim(),
      p_instagram_username: profile.instagramUsername || null,
      p_consent: true,
      p_presentation: profile.characterPresentation,
    });

    if (!error && data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      return {
        playerId: String(d.player_id),
        displayName: String(d.display_name),
        characterPresentation:
          (d.character_presentation as CharacterPresentation) || "UNSPECIFIED",
        sessionId: String(d.session_id),
      };
    }

    if (error && !isSchemaMissingError(error)) {
      throw new Error(`Profile persistence error: ${error.message}`);
    }
  }

  const store = readLocalStore();
  let session = store.sessions.find((s) => s.session_token === sessionToken);
  const now = new Date().toISOString();

  if (!session) {
    session = {
      id: crypto.randomUUID(),
      player_id: null,
      session_token: sessionToken,
      character_presentation: profile.characterPresentation,
      started_at: now,
      completed_at: null,
      current_chapter: 1,
      status: "in_progress",
      result_archetype: null,
      created_at: now,
    };
    store.sessions.push(session);
  }

  const cleanIg = profile.instagramUsername
    ? profile.instagramUsername.replace(/^@+/, "").trim() || null
    : null;

  let player = session.player_id
    ? store.players.find((p) => p.id === session?.player_id)
    : undefined;

  if (player) {
    player.display_name = profile.displayName.trim();
    player.instagram_username = cleanIg;
    player.profile_consent = true;
    player.character_presentation = profile.characterPresentation;
  } else {
    player = {
      id: crypto.randomUUID(),
      display_name: profile.displayName.trim(),
      instagram_username: cleanIg,
      profile_consent: true,
      character_presentation: profile.characterPresentation,
      created_at: now,
    };
    store.players.push(player);
  }

  session.player_id = player.id;
  session.character_presentation = profile.characterPresentation;
  writeLocalStore(store);

  return {
    playerId: player.id,
    displayName: player.display_name,
    characterPresentation: session.character_presentation,
    sessionId: session.id,
  };
}

/**
 * Dedicated player registration service for first-entry and returning identity binding.
 */
export async function registerPlayerAccount(params: {
  username: string;
  instagramId?: string | null;
  sessionToken?: string;
}): Promise<{
  playerId: string;
  username: string;
  instagramId: string | null;
  sessionToken: string;
  isReturningPlayer: boolean;
}> {
  const cleanUsername = params.username.trim();
  const cleanIg = params.instagramId
    ? params.instagramId.replace(/^@+/, "").trim() || null
    : null;

  let resolvedToken = params.sessionToken;
  if (!resolvedToken || resolvedToken.length < 16) {
    resolvedToken = "uw_" + crypto.randomBytes(20).toString("hex");
  }

  // 1. Ensure game session exists
  await getOrCreateSession(resolvedToken, {}, "UNSPECIFIED");

  // 2. Submit player profile via established, resilient pipeline
  const profileRes = await submitProfileByToken(resolvedToken, {
    displayName: cleanUsername,
    instagramUsername: cleanIg || undefined,
    consent: true,
    characterPresentation: "UNSPECIFIED",
  });

  const store = readLocalStore();
  const isReturningPlayer =
    store.sessions.filter((s) => s.player_id === profileRes.playerId).length > 1;

  return {
    playerId: profileRes.playerId,
    username: cleanUsername,
    instagramId: cleanIg,
    sessionToken: resolvedToken,
    isReturningPlayer,
  };
}

export async function getPlayerIdentityByTokenOrId(params: {
  playerId?: string | null;
  sessionToken?: string | null;
}): Promise<{
  id: string;
  username: string;
  instagramId: string | null;
} | null> {
  const store = readLocalStore();
  if (params.playerId) {
    const p = store.players.find((pl) => pl.id === params.playerId);
    if (p) {
      return { id: p.id, username: p.display_name, instagramId: p.instagram_username || null };
    }
  }

  if (params.sessionToken) {
    const sess = store.sessions.find((s) => s.session_token === params.sessionToken);
    if (sess?.player_id) {
      const p = store.players.find((pl) => pl.id === sess.player_id);
      if (p) {
        return { id: p.id, username: p.display_name, instagramId: p.instagram_username || null };
      }
    }
  }

  return null;
}

export async function recordEventByToken(
  sessionToken: string,
  chapter: number,
  eventType: GameplayEvent["event_type"],
  eventData: Record<string, unknown>,
  resultArchetype?: string
): Promise<{ recorded: boolean; deduplicated: boolean }> {
  const isSupabaseConfigured = shouldUseSupabase();

  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedClient();
    const { data, error } = await supabase.rpc("rpc_record_event", {
      p_session_token: sessionToken,
      p_chapter: chapter,
      p_event_type: eventType,
      p_event_data: eventData,
      p_result_archetype: resultArchetype || null,
    });

    if (!error && data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      return {
        recorded: Boolean(d.recorded),
        deduplicated: Boolean(d.deduplicated),
      };
    }

    if (error && !isSchemaMissingError(error)) {
      throw new Error(`Event persistence error: ${error.message}`);
    }
  }

  const store = readLocalStore();
  let session = store.sessions.find((s) => s.session_token === sessionToken);
  const now = new Date().toISOString();

  if (!session) {
    session = {
      id: crypto.randomUUID(),
      player_id: null,
      session_token: sessionToken,
      character_presentation: "UNSPECIFIED",
      started_at: now,
      completed_at: null,
      current_chapter: Math.max(1, Math.min(6, chapter || 1)),
      status: "in_progress",
      result_archetype: null,
      created_at: now,
    };
    store.sessions.push(session);
  }

  // Deduplicate completion and landing events
  if (
    eventType === "chapter_completed" ||
    eventType === "game_completed" ||
    eventType === "landing_view"
  ) {
    const dup = store.events.find(
      (e) =>
        e.session_id === session?.id &&
        e.chapter === chapter &&
        e.event_type === eventType
    );
    if (dup) {
      if (eventType === "game_completed" && resultArchetype) {
        session.status = "completed";
        session.completed_at = session.completed_at || now;
        session.result_archetype = resultArchetype;
        writeLocalStore(store);
      }
      return { recorded: true, deduplicated: true };
    }
  }

  store.events.push({
    id: crypto.randomUUID(),
    session_id: session.id,
    chapter,
    event_type: eventType,
    event_data: eventData,
    created_at: now,
  });

  if (eventType === "chapter_started" && chapter >= 1 && chapter <= 6) {
    session.current_chapter = Math.max(session.current_chapter, chapter);
  } else if (eventType === "chapter_completed" && chapter >= 1 && chapter <= 6) {
    session.current_chapter = Math.max(
      session.current_chapter,
      Math.min(6, chapter + 1)
    );
  } else if (eventType === "game_completed") {
    session.status = "completed";
    session.completed_at = session.completed_at || now;
    session.current_chapter = 6;
    if (resultArchetype) {
      session.result_archetype = resultArchetype;
    }
  }

  writeLocalStore(store);
  return { recorded: true, deduplicated: false };
}

export async function recordPreferenceByToken(
  sessionToken: string,
  category: string,
  selectedValue: string
): Promise<void> {
  const isSupabaseConfigured = shouldUseSupabase();

  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedClient();
    const { error } = await supabase.rpc("rpc_record_preference", {
      p_session_token: sessionToken,
      p_category: category,
      p_selected_value: selectedValue,
    });

    if (!error) return;
    if (!isSchemaMissingError(error)) {
      throw new Error(`Preference persistence error: ${error.message}`);
    }
  }

  const store = readLocalStore();
  const session = store.sessions.find((s) => s.session_token === sessionToken);
  if (!session) {
    throw new Error("Session not initialized.");
  }

  store.preferences = store.preferences.filter(
    (p) =>
      !(
        p.session_id === session.id &&
        p.preference_category === category &&
        (category !== "canvas_object" || p.selected_value === selectedValue)
      )
  );

  store.preferences.push({
    id: crypto.randomUUID(),
    session_id: session.id,
    preference_category: category,
    selected_value: selectedValue,
    created_at: new Date().toISOString(),
  });
  writeLocalStore(store);
}

/**
 * Public-safe session dossier lookup for /result/[sessionId] and /api/session/state.
 * NEVER returns instagram_username or session_token.
 * NEVER fabricates a session if lookup does not exist.
 */
export async function getPublicSessionDossier(
  lookupIdOrToken: string,
  computedArchetypeToSave?: string
): Promise<{
  session: Omit<GameSession, "session_token" | "player">;
  playerDisplayName: string | null;
  events: GameplayEvent[];
  preferences: PlayerPreference[];
} | null> {
  const isSupabaseConfigured = shouldUseSupabase();

  if (isSupabaseConfigured && lookupIdOrToken && lookupIdOrToken !== "current") {
    try {
      const supabase = await createPrivilegedClient();
      const { data, error } = await supabase.rpc("rpc_get_session_dossier", {
        p_lookup: lookupIdOrToken,
        p_archetype_if_complete: computedArchetypeToSave || null,
      });

      if (!error && data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        const s = (d.session || {}) as Record<string, unknown>;
        if (s.id) {
          return {
            session: {
              id: String(s.id),
              character_presentation:
                (s.character_presentation as CharacterPresentation) || "UNSPECIFIED",
              started_at: String(s.started_at),
              completed_at: (s.completed_at as string | null) ?? null,
              current_chapter: Number(s.current_chapter || 1),
              status: (s.status as SessionStatus) || "in_progress",
              result_archetype: (s.result_archetype as string | null) ?? null,
              created_at: String(s.created_at || s.started_at),
            },
            playerDisplayName: (d.player_display_name as string | null) ?? null,
            events: Array.isArray(d.events) ? (d.events as GameplayEvent[]) : [],
            preferences: Array.isArray(d.preferences)
              ? (d.preferences as PlayerPreference[])
              : [],
          };
        }
      }
    } catch {
      // Graceful fallback to local store on any Supabase error
    }
  }

  const store = readLocalStore();
  let matched = store.sessions.find(
    (s) => s.id === lookupIdOrToken || s.session_token === lookupIdOrToken
  );

  // If lookup was "current" or not found by exact id, pick latest completed or in_progress session
  if (!matched && (lookupIdOrToken === "current" || store.sessions.length > 0)) {
    if (lookupIdOrToken === "current") {
      matched = [...store.sessions].sort(
        (a, b) => new Date(b.started_at || 0).getTime() - new Date(a.started_at || 0).getTime()
      )[0];
    }
  }

  if (!matched) {
    return null;
  }

  if (computedArchetypeToSave && !matched.result_archetype) {
    matched.result_archetype = computedArchetypeToSave;
    if (matched.current_chapter >= 6) {
      matched.status = "completed";
      matched.completed_at = matched.completed_at || new Date().toISOString();
    }
    writeLocalStore(store);
  }

  const linkedPlayer = matched.player_id
    ? store.players.find((p) => p.id === matched.player_id)
    : undefined;

  const events = store.events
    .filter((e) => e.session_id === matched.id)
    .sort(
      (a, b) =>
        new Date(a.created_at || 0).getTime() -
        new Date(b.created_at || 0).getTime()
    );

  const preferences = store.preferences.filter((p) => p.session_id === matched.id);

  const { session_token: _omitted, ...publicSession } = matched;
  void _omitted;

  return {
    session: publicSession,
    playerDisplayName: linkedPlayer?.display_name || null,
    events,
    preferences,
  };
}

export async function submitDeletionRequest(
  identifier: string,
  reason?: string
): Promise<{ requestId: string }> {
  const isSupabaseConfigured = shouldUseSupabase();

  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedClient();
    const { data, error } = await supabase.rpc("rpc_submit_deletion_request", {
      p_identifier: identifier.trim(),
      p_reason: reason?.trim() || null,
    });

    if (!error && data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      return { requestId: String(d.request_id) };
    }

    if (error && !isSchemaMissingError(error)) {
      throw new Error(`Deletion request error: ${error.message}`);
    }
  }

  const store = readLocalStore();
  const reqItem: DeletionRequest = {
    id: crypto.randomUUID(),
    identifier: identifier.trim(),
    reason: reason?.trim() || null,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  store.deletionRequests.push(reqItem);
  writeLocalStore(store);

  return { requestId: reqItem.id };
}

// =============================================================================
// PRIVATE ADMINISTRATOR CONTROL CENTRE QUERIES (SERVER-SIDE AUTHORIZED ONLY)
// =============================================================================

export async function loadRawAdminDataset(): Promise<{
  backend: "supabase" | "local_fallback";
  schemaReady: boolean;
  schemaNotice?: string;
  players: Player[];
  sessions: GameSession[];
  events: GameplayEvent[];
  preferences: PlayerPreference[];
  deletionRequests: DeletionRequest[];
}> {
  const isSupabaseConfigured = shouldUseSupabase();

  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedClient();
    const [playersRes, sessionsRes, eventsRes, prefsRes, delRes] = await Promise.all([
      supabase.from("players").select("*").order("created_at", { ascending: false }),
      supabase
        .from("game_sessions")
        .select("*, player:players(*)")
        .order("started_at", { ascending: false }),
      supabase
        .from("gameplay_events")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("player_preferences")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("deletion_requests")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    const primaryErr = playersRes.error || sessionsRes.error || eventsRes.error;

    if (!primaryErr) {
      return {
        backend: "supabase",
        schemaReady: true,
        players: (playersRes.data || []) as Player[],
        sessions: (sessionsRes.data || []) as GameSession[],
        events: (eventsRes.data || []) as GameplayEvent[],
        preferences: (prefsRes.data || []) as PlayerPreference[],
        deletionRequests: delRes.error ? [] : ((delRes.data || []) as DeletionRequest[]),
      };
    }

    if (!isSchemaMissingError(primaryErr)) {
      throw new Error(`Database query failed: ${primaryErr.message}`);
    }
  }

  const store = readLocalStore();
  const playersById = new Map(store.players.map((p) => [p.id, p]));
  const joinedSessions: GameSession[] = store.sessions
    .map((s) => ({
      ...s,
      player: s.player_id ? playersById.get(s.player_id) || null : null,
    }))
    .sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

  return {
    backend: "local_fallback",
    schemaReady: false,
    schemaNotice:
      "Supabase tables are not yet installed in this project. Showing strictly real local events; run supabase/schema.sql in Supabase SQL Editor to activate PostgreSQL storage.",
    players: [...store.players].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    sessions: joinedSessions,
    events: store.events,
    preferences: store.preferences,
    deletionRequests: store.deletionRequests,
  };
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const dataset = await loadRawAdminDataset();
  const { players, sessions, events } = dataset;

  const landingViewCount = events.filter(
    (e) => e.event_type === "landing_view"
  ).length;
  const uniqueSessions = sessions.length;
  const totalVisits = landingViewCount;

  const registeredSessionsCount = sessions.filter((s) => Boolean(s.player_id)).length;
  const registeredPlayers = players.length;
  const anonymousPlayers = Math.max(0, uniqueSessions - registeredSessionsCount);

  const startedSessionIds = new Set<string>();
  for (const ev of events) {
    if (ev.event_type === "game_started" || ev.event_type === "chapter_started") {
      startedSessionIds.add(ev.session_id);
    }
  }
  const gamesStarted = startedSessionIds.size;

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const gamesCompleted = completedSessions.length;
  const gamesInProgress = sessions.filter(
    (s) => s.status === "in_progress" && startedSessionIds.has(s.id)
  ).length;

  const completionDenominator = gamesStarted > 0 ? gamesStarted : uniqueSessions;
  const completionRatePct =
    completionDenominator > 0
      ? Math.round((gamesCompleted / completionDenominator) * 100)
      : null;

  // Average completion duration (measured strictly from started_at to completed_at)
  const validCompletionDurationsSec: number[] = [];
  for (const s of completedSessions) {
    if (s.started_at && s.completed_at) {
      const diffSec =
        (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) /
        1000;
      if (diffSec > 0 && diffSec < 86_400) {
        validCompletionDurationsSec.push(diffSec);
      }
    }
  }
  const avgCompletionDurationSeconds =
    validCompletionDurationsSec.length > 0
      ? Math.round(
          validCompletionDurationsSec.reduce((acc, v) => acc + v, 0) /
            validCompletionDurationsSec.length
        )
      : null;

  // Per-chapter engagement, completion, drop-off & average duration
  const chapterAnalytics: ChapterAnalyticsRow[] = [1, 2, 3, 4, 5, 6].map((ch) => {
    const startedSet = new Set<string>();
    const completedSet = new Set<string>();
    const startTimes = new Map<string, number>();
    const durationsSec: number[] = [];

    for (const s of sessions) {
      if (s.current_chapter > ch || s.status === "completed") {
        startedSet.add(s.id);
        completedSet.add(s.id);
      } else if (s.current_chapter === ch && startedSessionIds.has(s.id)) {
        startedSet.add(s.id);
      }
    }

    for (const ev of events) {
      if (ev.chapter !== ch) continue;
      if (ev.event_type === "chapter_started") {
        startedSet.add(ev.session_id);
        if (ev.created_at && !startTimes.has(ev.session_id)) {
          startTimes.set(ev.session_id, new Date(ev.created_at).getTime());
        }
      } else if (ev.event_type === "chapter_completed") {
        startedSet.add(ev.session_id);
        completedSet.add(ev.session_id);
        const explicitMs = Number(
          ev.event_data?.durationMs || ev.event_data?.timeMs || 0
        );
        if (explicitMs > 0 && explicitMs < 3_600_000) {
          durationsSec.push(explicitMs / 1000);
        } else if (ev.created_at && startTimes.has(ev.session_id)) {
          const deltaSec =
            (new Date(ev.created_at).getTime() -
              (startTimes.get(ev.session_id) || 0)) /
            1000;
          if (deltaSec > 0 && deltaSec < 3_600) {
            durationsSec.push(deltaSec);
          }
        }
      }
    }

    const sessionsStarted = startedSet.size;
    const sessionsCompleted = completedSet.size;
    const completionPct =
      sessionsStarted > 0
        ? Math.round((sessionsCompleted / sessionsStarted) * 100)
        : null;
    const dropOffPct =
      sessionsStarted > 0
        ? Math.max(
            0,
            Math.round(((sessionsStarted - sessionsCompleted) / sessionsStarted) * 100)
          )
        : null;
    const avgDurationSeconds =
      durationsSec.length > 0
        ? Math.round(
            durationsSec.reduce((sum, d) => sum + d, 0) / durationsSec.length
          )
        : null;

    return {
      chapter: ch,
      title: CHAPTER_TITLES[ch],
      sessionsStarted,
      sessionsCompleted,
      completionRatePct: completionPct,
      dropOffPct,
      avgDurationSeconds,
    };
  });

  // Most selected choices across chapters
  const choiceEvents = events.filter((e) => e.event_type === "choice_selected");
  const chapterChoiceTotals = new Map<number, number>();
  const choiceMap = new Map<
    string,
    { chapter: number; choiceKey: string; count: number }
  >();

  for (const ev of choiceEvents) {
    const rawKey =
      (ev.event_data?.choiceId as string | undefined) ||
      (ev.event_data?.environment as string | undefined) ||
      (ev.event_data?.mood as string | undefined);
    if (!rawKey) continue;

    chapterChoiceTotals.set(
      ev.chapter,
      (chapterChoiceTotals.get(ev.chapter) || 0) + 1
    );
    const mapKey = `${ev.chapter}::${rawKey}`;
    const current = choiceMap.get(mapKey);
    if (current) {
      current.count += 1;
    } else {
      choiceMap.set(mapKey, {
        chapter: ev.chapter,
        choiceKey: rawKey,
        count: 1,
      });
    }
  }

  const choiceDistributions: ChoiceDistributionRow[] = Array.from(
    choiceMap.values()
  )
    .map((item) => {
      const chTotal = chapterChoiceTotals.get(item.chapter) || 1;
      return {
        chapter: item.chapter,
        chapterTitle: CHAPTER_TITLES[item.chapter] || `Chapter ${item.chapter}`,
        choiceKey: item.choiceKey,
        choiceLabel: CHOICE_LABELS[item.choiceKey] || item.choiceKey,
        count: item.count,
        sharePct: Math.round((item.count / chTotal) * 100),
      };
    })
    .sort((a, b) => b.count - a.count);

  // Puzzle analytics (Chapters 2 & 5)
  const puzzleAnalytics: PuzzleAnalyticsRow[] = [
    { chapter: 2, puzzleName: "Archive Clock & Tumbler Cipher" },
    { chapter: 5, puzzleName: "Ten-Second Vault Relay" },
  ].map(({ chapter, puzzleName }) => {
    const chAttempts = events.filter(
      (e) => e.chapter === chapter && e.event_type === "puzzle_attempted"
    );
    const chHints = events.filter(
      (e) => e.chapter === chapter && e.event_type === "hint_used"
    );

    const attemptedSessions = new Set(chAttempts.map((a) => a.session_id));
    const solvedSessions = new Set(
      chAttempts
        .filter((a) => a.event_data?.isCorrect === true)
        .map((a) => a.session_id)
    );
    const correctAttempts = chAttempts.filter(
      (a) => a.event_data?.isCorrect === true
    );

    const solveTimesSec: number[] = [];
    for (const ca of correctAttempts) {
      const ms = Number(
        ca.event_data?.timeToSolveMs || ca.event_data?.durationMs || 0
      );
      if (ms > 0 && ms < 600_000) {
        solveTimesSec.push(ms / 1000);
      }
    }

    return {
      chapter,
      puzzleName,
      sessionsAttempted: attemptedSessions.size,
      totalAttempts: chAttempts.length,
      sessionsSolved: solvedSessions.size,
      completionRatePct:
        attemptedSessions.size > 0
          ? Math.round((solvedSessions.size / attemptedSessions.size) * 100)
          : null,
      accuracyRatePct:
        chAttempts.length > 0
          ? Math.round((correctAttempts.length / chAttempts.length) * 100)
          : null,
      hintsUsedTotal: chHints.length,
      avgSolveSeconds:
        solveTimesSec.length > 0
          ? Math.round(
              (solveTimesSec.reduce((sum, v) => sum + v, 0) /
                solveTimesSec.length) *
                10
            ) / 10
          : null,
    };
  });

  // Campaign attribution
  const campMap = new Map<string, CampaignAttributionRow>();
  for (const s of sessions) {
    const source = s.campaign_source || s.utm_source || "direct";
    const medium = s.campaign_medium || s.utm_medium || "none";
    const campaign = s.campaign_name || s.utm_campaign || "none";
    const key = `${source}|${medium}|${campaign}`;
    const existing = campMap.get(key);
    if (existing) {
      existing.sessions += 1;
      if (s.status === "completed") existing.completed += 1;
    } else {
      campMap.set(key, {
        source,
        medium,
        campaign,
        sessions: 1,
        completed: s.status === "completed" ? 1 : 0,
      });
    }
  }
  const campaignAttribution = Array.from(campMap.values()).sort(
    (a, b) => b.sessions - a.sessions
  );

  // Archetype distribution across completed sessions
  const archCounts = new Map<string, number>();
  for (const s of completedSessions) {
    if (s.result_archetype) {
      archCounts.set(
        s.result_archetype,
        (archCounts.get(s.result_archetype) || 0) + 1
      );
    }
  }
  const archetypeDistribution = Array.from(archCounts.entries())
    .map(([archetype, count]) => ({ archetype, count }))
    .sort((a, b) => b.count - a.count);

  return {
    storageBackend: dataset.backend,
    schemaReady: dataset.schemaReady,
    schemaNotice: dataset.schemaNotice,
    totalVisits,
    uniqueSessions,
    registeredPlayers,
    anonymousPlayers,
    gamesStarted,
    gamesCompleted,
    gamesInProgress,
    completionRatePct,
    avgCompletionDurationSeconds,
    chapterAnalytics,
    choiceDistributions,
    puzzleAnalytics,
    campaignAttribution,
    archetypeDistribution,
  };
}

export async function getAdminPlayersDirectory(): Promise<{
  players: AdminPlayerListItem[];
  storageBackend: "supabase" | "local_fallback";
  schemaReady: boolean;
  schemaNotice?: string;
}> {
  const dataset = await loadRawAdminDataset();
  const sessionsByPlayer = new Map<string, GameSession[]>();

  for (const s of dataset.sessions) {
    if (s.player_id) {
      const list = sessionsByPlayer.get(s.player_id) || [];
      list.push(s);
      sessionsByPlayer.set(s.player_id, list);
    }
  }

  const items: AdminPlayerListItem[] = dataset.players.map((p) => {
    const linked = (sessionsByPlayer.get(p.id) || []).sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
    const latest = linked[0] || null;
    return {
      id: p.id,
      display_name: p.display_name,
      instagram_username: p.instagram_username || null,
      profile_consent: p.profile_consent,
      character_presentation: p.character_presentation || "UNSPECIFIED",
      created_at: p.created_at,
      sessionCount: linked.length,
      latestSessionId: latest?.id || null,
      latestStatus: latest?.status || null,
      latestChapter: latest?.current_chapter || null,
      latestArchetype: latest?.result_archetype || null,
    };
  });

  return {
    players: items,
    storageBackend: dataset.backend,
    schemaReady: dataset.schemaReady,
    schemaNotice: dataset.schemaNotice,
  };
}

export async function getAdminSessionsList(): Promise<{
  sessions: GameSession[];
  storageBackend: "supabase" | "local_fallback";
  schemaReady: boolean;
  schemaNotice?: string;
}> {
  const dataset = await loadRawAdminDataset();
  const safeSessions = dataset.sessions.map((s) => {
    const copy = { ...s };
    delete copy.session_token;
    return copy;
  });

  return {
    sessions: safeSessions,
    storageBackend: dataset.backend,
    schemaReady: dataset.schemaReady,
    schemaNotice: dataset.schemaNotice,
  };
}

export async function getAdminDetailByPlayerOrSessionId(lookupId: string): Promise<{
  player: Player | null;
  sessions: GameSession[];
  primarySession: GameSession;
  events: GameplayEvent[];
  preferences: PlayerPreference[];
} | null> {
  const dataset = await loadRawAdminDataset();

  // Match either player.id or game_sessions.id
  const matchedPlayer = dataset.players.find((p) => p.id === lookupId) || null;
  let playerSessions: GameSession[] = [];
  let primarySession: GameSession | undefined;

  if (matchedPlayer) {
    playerSessions = dataset.sessions
      .filter((s) => s.player_id === matchedPlayer.id)
      .sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );
    primarySession = playerSessions[0];
  } else {
    primarySession = dataset.sessions.find((s) => s.id === lookupId);
    if (primarySession) {
      playerSessions = [primarySession];
    }
  }

  if (!primarySession && !matchedPlayer) {
    return null;
  }

  if (!primarySession && matchedPlayer) {
    // Player created without an active session record (edge case)
    primarySession = {
      id: matchedPlayer.id,
      player_id: matchedPlayer.id,
      character_presentation: matchedPlayer.character_presentation,
      started_at: matchedPlayer.created_at,
      current_chapter: 1,
      status: "in_progress",
      created_at: matchedPlayer.created_at,
      player: matchedPlayer,
    };
  }

  const resolvedSession = primarySession!;
  const resolvedPlayer =
    matchedPlayer ||
    (resolvedSession.player_id
      ? dataset.players.find((p) => p.id === resolvedSession.player_id) || null
      : null);

  const cleanSession = { ...resolvedSession };
  delete cleanSession.session_token;

  const cleanHistory = playerSessions.map((s) => {
    const c = { ...s };
    delete c.session_token;
    return c;
  });

  const events = dataset.events
    .filter((e) => e.session_id === resolvedSession.id)
    .sort(
      (a, b) =>
        new Date(a.created_at || 0).getTime() -
        new Date(b.created_at || 0).getTime()
    );

  const preferences = dataset.preferences.filter(
    (p) => p.session_id === resolvedSession.id
  );

  return {
    player: resolvedPlayer,
    sessions: cleanHistory,
    primarySession: cleanSession,
    events,
    preferences,
  };
}

export async function getAdminSettingsData() {
  const dataset = await loadRawAdminDataset();
  const env = getEnvConfig();

  return {
    storageBackend: dataset.backend,
    schemaReady: dataset.schemaReady,
    schemaNotice: dataset.schemaNotice,
    supabaseConfigured: env.isSupabaseConfigured,
    serviceRoleConfigured: env.hasServiceRoleKey,
    authorizedAdminEmails: env.allowedAdminEmails,
    deletionRequests: dataset.deletionRequests,
    recordCounts: {
      players: dataset.players.length,
      sessions: dataset.sessions.length,
      events: dataset.events.length,
      preferences: dataset.preferences.length,
    },
  };
}

// ---------------------------------------------------------------------------
// PLAYER REVIEWS & COMMUNITY DISPATCHES
// ---------------------------------------------------------------------------

export interface CreateReviewParams {
  playerId?: string | null;
  playerName: string;
  instagramId?: string | null;
  rating: number;
  title: string;
  feedback: string;
  category?: ReviewCategory;
  modePlayed?: "senior" | "junior" | "both" | "general";
}

function calculateReviewStats(reviews: PlayerReview[]): ReviewStats {
  const approved = reviews.filter((r) => r.status === "approved");
  const totalReviews = approved.length;

  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const categoryBreakdown: Record<string, number> = {};

  let sum = 0;
  for (const r of approved) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    ratingBreakdown[star] = (ratingBreakdown[star] || 0) + 1;
    sum += star;

    const cat = r.category || "general";
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  }

  const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 0;

  return {
    totalReviews,
    averageRating,
    ratingBreakdown,
    categoryBreakdown,
  };
}

export async function createPlayerReview(params: CreateReviewParams): Promise<PlayerReview> {
  const cleanName = (params.playerName || "").trim();
  if (!cleanName || cleanName.length < 2) {
    throw new Error("Player name must be at least 2 characters.");
  }

  const cleanFeedback = (params.feedback || "").trim();
  if (!cleanFeedback || cleanFeedback.length < 5) {
    throw new Error("Review feedback must be at least 5 characters.");
  }

  const cleanTitle = (params.title || "").trim();
  const cleanIg = params.instagramId
    ? params.instagramId.replace(/^@+/, "").trim() || null
    : null;

  const rating = Math.max(1, Math.min(5, Math.round(Number(params.rating) || 5)));
  const category: ReviewCategory = params.category || "general";
  const now = new Date().toISOString();

  const newReview: PlayerReview = {
    id: "rev_" + crypto.randomBytes(12).toString("hex"),
    playerId: params.playerId || null,
    playerName: cleanName.slice(0, 60),
    instagramId: cleanIg ? cleanIg.slice(0, 60) : null,
    rating,
    title: cleanTitle ? cleanTitle.slice(0, 120) : "Deductive Impression",
    feedback: cleanFeedback.slice(0, 2000),
    category,
    modePlayed: params.modePlayed || "general",
    featured: false,
    status: "approved",
    adminResponse: null,
    createdAt: now,
    updatedAt: now,
  };

  const store = readLocalStore();
  store.reviews.unshift(newReview);
  writeLocalStore(store);

  return newReview;
}

export async function getPublicPlayerReviews(params?: {
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{
  reviews: PlayerReview[];
  stats: ReviewStats;
  total: number;
  page: number;
  totalPages: number;
}> {
  const store = readLocalStore();
  const allApproved = store.reviews.filter((r) => r.status === "approved");
  const stats = calculateReviewStats(store.reviews);

  let filtered = allApproved;
  if (params?.category && params.category !== "all") {
    filtered = filtered.filter((r) => r.category === params.category);
  }

  // Sort: featured first, then newest
  filtered.sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const page = Math.max(1, Number(params?.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(params?.limit) || 12));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  const paginated = filtered.slice(offset, offset + limit);

  return {
    reviews: paginated,
    stats,
    total,
    page,
    totalPages,
  };
}

export async function getAllAdminPlayerReviews(params?: {
  status?: string;
  search?: string;
  rating?: number;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{
  reviews: PlayerReview[];
  stats: ReviewStats & {
    totalAll: number;
    pendingCount: number;
    approvedCount: number;
    flaggedCount: number;
    featuredCount: number;
  };
  total: number;
  page: number;
  totalPages: number;
}> {
  const store = readLocalStore();
  const baseStats = calculateReviewStats(store.reviews);

  let pendingCount = 0;
  let approvedCount = 0;
  let flaggedCount = 0;
  let featuredCount = 0;

  for (const r of store.reviews) {
    if (r.status === "pending") pendingCount++;
    if (r.status === "approved") approvedCount++;
    if (r.status === "flagged") flaggedCount++;
    if (r.featured) featuredCount++;
  }

  let filtered = [...store.reviews];

  if (params?.status && params.status !== "all") {
    if (params.status === "featured") {
      filtered = filtered.filter((r) => r.featured);
    } else {
      filtered = filtered.filter((r) => r.status === params.status);
    }
  }

  if (params?.category && params.category !== "all") {
    filtered = filtered.filter((r) => r.category === params.category);
  }

  if (params?.rating && params.rating > 0) {
    filtered = filtered.filter((r) => r.rating === Number(params.rating));
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.playerName.toLowerCase().includes(q) ||
        (r.instagramId && r.instagramId.toLowerCase().includes(q)) ||
        r.title.toLowerCase().includes(q) ||
        r.feedback.toLowerCase().includes(q)
    );
  }

  // Sort: newest first
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const page = Math.max(1, Number(params?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params?.limit) || 20));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  const paginated = filtered.slice(offset, offset + limit);

  return {
    reviews: paginated,
    stats: {
      ...baseStats,
      totalAll: store.reviews.length,
      pendingCount,
      approvedCount,
      flaggedCount,
      featuredCount,
    },
    total,
    page,
    totalPages,
  };
}

export async function updateAdminPlayerReview(
  id: string,
  updates: {
    status?: ReviewStatus;
    featured?: boolean;
    adminResponse?: string | null;
  }
): Promise<PlayerReview | null> {
  const store = readLocalStore();
  const item = store.reviews.find((r) => r.id === id);
  if (!item) return null;

  if (updates.status !== undefined) {
    item.status = updates.status;
  }
  if (updates.featured !== undefined) {
    item.featured = updates.featured;
  }
  if (updates.adminResponse !== undefined) {
    item.adminResponse = updates.adminResponse;
  }
  item.updatedAt = new Date().toISOString();

  writeLocalStore(store);
  return item;
}

export async function deleteAdminPlayerReview(id: string): Promise<boolean> {
  const store = readLocalStore();
  const initialLen = store.reviews.length;
  store.reviews = store.reviews.filter((r) => r.id !== id);
  if (store.reviews.length !== initialLen) {
    writeLocalStore(store);
    return true;
  }
  return false;
}
