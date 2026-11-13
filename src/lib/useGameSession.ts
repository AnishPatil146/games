"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  GameSession,
  CharacterPresentation,
  EventType,
  GameplayEvent,
  PlayerPreference,
} from "./types";

const UTM_STORAGE_KEY = "the_unwritten_utm_v2";
const SESSION_ID_CACHE_KEY = "the_unwritten_last_session_id";

interface UtmPayload {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function captureUtmParams(): UtmPayload {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source") || undefined;
  const utmMedium = params.get("utm_medium") || undefined;
  const utmCampaign = params.get("utm_campaign") || undefined;

  if (utmSource || utmMedium || utmCampaign) {
    const fresh: UtmPayload = { utmSource, utmMedium, utmCampaign };
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore storage errors in restricted webviews
    }
    return fresh;
  }

  try {
    const cached = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached) as UtmPayload;
    }
  } catch {
    // ignore
  }
  return {};
}

export function useGameSession(options?: { recordLandingOnInit?: boolean }) {
  const [session, setSession] = useState<Omit<GameSession, "session_token"> | null>(null);
  const [playerDisplayName, setPlayerDisplayName] = useState<string | null>(null);
  const [savedEvents, setSavedEvents] = useState<GameplayEvent[]>([]);
  const [savedPreferences, setSavedPreferences] = useState<PlayerPreference[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasInitialized = useRef(false);
  const recordLanding = Boolean(options?.recordLandingOnInit);

  const syncFullState = useCallback(async () => {
    try {
      const res = await fetch("/api/session/start", { method: "GET" });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        initialized?: boolean;
        session?: Omit<GameSession, "session_token"> | null;
        playerDisplayName?: string | null;
        events?: GameplayEvent[];
        preferences?: PlayerPreference[];
      };
      if (data.initialized && data.session) {
        setSession(data.session);
        setPlayerDisplayName(data.playerDisplayName ?? null);
        setSavedEvents(data.events ?? []);
        setSavedPreferences(data.preferences ?? []);
        try {
          localStorage.setItem(SESSION_ID_CACHE_KEY, data.session.id);
        } catch {
          // ignore
        }
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || hasInitialized.current) return;
    hasInitialized.current = true;

    const utm = captureUtmParams();

    const init = async () => {
      try {
        const res = await fetch("/api/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...utm,
            recordEvent: recordLanding ? "landing_view" : "none",
          }),
        });
        const data = (await res.json()) as {
          session?: Omit<GameSession, "session_token">;
          playerDisplayName?: string | null;
        };
        if (data.session) {
          setSession(data.session);
          setPlayerDisplayName(data.playerDisplayName ?? null);
          try {
            localStorage.setItem(SESSION_ID_CACHE_KEY, data.session.id);
          } catch {
            // ignore
          }
        }
        await syncFullState();
      } catch {
        // Handled gracefully by callers
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [recordLanding, syncFullState]);

  const startFreshSession = useCallback(
    async (presentation: CharacterPresentation = "UNSPECIFIED") => {
      const utm = captureUtmParams();
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...utm,
          presentation,
          recordEvent: "game_started",
          resetSession: true,
        }),
      });
      const data = (await res.json()) as {
        session?: Omit<GameSession, "session_token">;
        error?: string;
      };
      if (!res.ok || !data.session) {
        throw new Error(data.error || "Unable to start a new game session.");
      }
      setSession(data.session);
      setPlayerDisplayName(null);
      setSavedEvents([]);
      setSavedPreferences([]);
      try {
        localStorage.setItem(SESSION_ID_CACHE_KEY, data.session.id);
      } catch {
        // ignore
      }
      return data.session;
    },
    []
  );

  const beginAnonymousSession = useCallback(
    async (
      presentation: CharacterPresentation,
      resetIfCompleted: boolean = false
    ) => {
      const utm = captureUtmParams();
      const shouldReset = resetIfCompleted || session?.status === "completed";
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...utm,
          presentation,
          recordEvent: "game_started",
          resetSession: shouldReset,
        }),
      });
      const data = (await res.json()) as {
        session?: Omit<GameSession, "session_token">;
        error?: string;
      };
      if (!res.ok || !data.session) {
        throw new Error(data.error || "Unable to start game session.");
      }
      setSession(data.session);
      try {
        localStorage.setItem(SESSION_ID_CACHE_KEY, data.session.id);
      } catch {
        // ignore
      }
      return data.session;
    },
    [session?.status]
  );

  const submitProfile = useCallback(
    async (
      displayName: string,
      instagramUsername?: string,
      consent: boolean = true,
      characterPresentation: CharacterPresentation = "UNSPECIFIED"
    ) => {
      if (session?.status === "completed") {
        await startFreshSession(characterPresentation);
      }

      const res = await fetch("/api/session/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          instagramUsername,
          consent,
          characterPresentation,
        }),
      });

      const data = (await res.json()) as {
        sessionId?: string;
        displayName?: string;
        characterPresentation?: CharacterPresentation;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Profile submission failed.");
      }

      setPlayerDisplayName(data.displayName || displayName);
      if (data.sessionId) {
        try {
          localStorage.setItem(SESSION_ID_CACHE_KEY, data.sessionId);
        } catch {
          // ignore
        }
      }
      await syncFullState();
      return data;
    },
    [session?.status, startFreshSession, syncFullState]
  );

  const trackEvent = useCallback(
    async (
      chapter: number,
      eventType: EventType,
      eventData: Record<string, unknown> = {}
    ): Promise<{ sessionId?: string; archetype?: string }> => {
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapter,
            eventType,
            eventData,
          }),
        });
        if (!res.ok) return {};
        const data = (await res.json()) as {
          sessionId?: string;
          archetype?: string;
        };
        return data;
      } catch {
        return {};
      }
    },
    []
  );

  const savePreference = useCallback(
    async (
      category: string,
      selectedValue?: string,
      selectedValues?: string[]
    ) => {
      try {
        await fetch("/api/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            selectedValue,
            selectedValues,
            replace: true,
          }),
        });
      } catch {
        // non-blocking
      }
    },
    []
  );

  const resolvedSessionId =
    session?.id ||
    (typeof window !== "undefined"
      ? localStorage.getItem(SESSION_ID_CACHE_KEY) || "current"
      : "current");

  return {
    sessionId: resolvedSessionId,
    session,
    playerDisplayName,
    savedEvents,
    savedPreferences,
    isLoading,
    trackEvent,
    savePreference,
    submitProfile,
    beginAnonymousSession,
    startFreshSession,
    syncFullState,
  };
}
