"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GameSession, CharacterPresentation, EventType } from "./types";

const STORAGE_KEY = "the_unwritten_session_token";
const UTM_STORAGE_KEY = "the_unwritten_utm";

export function useGameSession() {
  const [sessionToken, setSessionToken] = useState<string>("");
  const [session, setSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasInitialized = useRef(false);

  // Initialize or resume session
  useEffect(() => {
    if (typeof window === "undefined" || hasInitialized.current) return;
    hasInitialized.current = true;

    let token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      token = "uw_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
      localStorage.setItem(STORAGE_KEY, token);
    }
    setSessionToken(token);

    // Extract UTM parameters
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get("utm_source") || undefined;
    const utmMedium = searchParams.get("utm_medium") || undefined;
    const utmCampaign = searchParams.get("utm_campaign") || undefined;

    if (utmSource || utmCampaign) {
      localStorage.setItem(
        UTM_STORAGE_KEY,
        JSON.stringify({ utmSource, utmMedium, utmCampaign })
      );
    }

    let savedUtm = {};
    try {
      const stored = localStorage.getItem(UTM_STORAGE_KEY);
      if (stored) savedUtm = JSON.parse(stored);
    } catch {
      // ignore
    }

    const payload = {
      sessionToken: token,
      isLandingView: window.location.pathname === "/",
      ...savedUtm,
    };

    fetch("/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.session) {
          setSession(data.session);
        }
      })
      .catch((err) => console.warn("Session init error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const trackEvent = useCallback(
    async (
      chapter: number,
      eventType: EventType,
      eventData: Record<string, unknown> = {}
    ) => {
      const currentToken =
        sessionToken || localStorage.getItem(STORAGE_KEY) || "";
      const currentSessionId = session?.id || currentToken;

      try {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSessionId,
            chapter,
            eventType,
            eventData,
          }),
        });
      } catch (err) {
        console.warn("Event tracking error:", err);
      }
    },
    [session?.id, sessionToken]
  );

  const savePreference = useCallback(
    async (category: string, selectedValue: string) => {
      const currentToken =
        sessionToken || localStorage.getItem(STORAGE_KEY) || "";
      const currentSessionId = session?.id || currentToken;

      try {
        await fetch("/api/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSessionId,
            category,
            selectedValue,
          }),
        });
      } catch (err) {
        console.warn("Save preference error:", err);
      }
    },
    [session?.id, sessionToken]
  );

  const submitProfile = useCallback(
    async (
      displayName: string,
      instagramUsername?: string,
      consent: boolean = true,
      characterPresentation: CharacterPresentation = "UNSPECIFIED"
    ) => {
      const currentToken =
        sessionToken || localStorage.getItem(STORAGE_KEY) || "";
      const currentSessionId = session?.id || currentToken;

      const res = await fetch("/api/session/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          displayName,
          instagramUsername,
          consent,
          characterPresentation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Profile submission failed");
      }

      if (data.session) {
        setSession(data.session);
      }
      return data;
    },
    [session?.id, sessionToken]
  );

  const setPresentation = useCallback(
    (presentation: CharacterPresentation) => {
      if (session) {
        setSession({ ...session, character_presentation: presentation });
      }
    },
    [session]
  );

  return {
    sessionToken,
    sessionId: session?.id || sessionToken,
    session,
    isLoading,
    trackEvent,
    savePreference,
    submitProfile,
    setPresentation,
  };
}

