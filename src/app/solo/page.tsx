"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { StoryboardStage } from "@/components/storyboard/StoryboardStage";
import { SOLO_CAMPAIGN_SCENES } from "@/lib/campaign/solo-campaign-data";
import { useGameSession } from "@/lib/useGameSession";
import { WardenCinematicIntro } from "@/components/warden/WardenCinematicIntro";
import { WardenCinematicOutro } from "@/components/warden/WardenCinematicOutro";
import { Play } from "lucide-react";

export default function SoloCampaignPage() {
  const router = useRouter();
  const { sessionId, trackEvent } = useGameSession();
  const [currentSceneId, setCurrentSceneId] = useState("solo_prologue");
  const [gameEnded, setGameEnded] = useState(false);
  const [chosenEnding, setChosenEnding] = useState<string>("The Survivor");

  // Warden Cinematics State (Exclusive to World of Investigator)
  const [showWardenIntro, setShowWardenIntro] = useState<boolean>(false);
  const [showWardenOutro, setShowWardenOutro] = useState<boolean>(false);

  // Check if Warden Intro should play upon entering World of Investigator
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const force = params.get("intro") === "1" || params.get("replay") === "1";
      if (force) {
        setShowWardenIntro(true);
        return;
      }
      const seen = sessionStorage.getItem("unwritten_investigator_intro_seen");
      if (seen !== "true") {
        setShowWardenIntro(true);
      }
    } catch {
      setShowWardenIntro(false);
    }
  }, []);

  const currentScene =
    SOLO_CAMPAIGN_SCENES[currentSceneId] || SOLO_CAMPAIGN_SCENES.solo_prologue;

  const handleSceneComplete = async (results?: Record<string, unknown>) => {
    // Record telemetry event in background
    if (results) {
      void trackEvent(currentScene.levelNumber || 1, "choice_selected", {
        sceneId: currentSceneId,
        ...results,
      });
    }

    const nextId = currentScene.onCompleteNextSceneId;
    if (nextId === "finish") {
      setGameEnded(true);
      const endingId = results?.solo_l8 as string;
      const endingTitle =
        endingId === "ENDING_MASTERMIND"
          ? "The Mastermind"
          : endingId === "ENDING_HUMANIST"
            ? "The Humanist"
            : endingId === "ENDING_UNPREDICTABLE"
              ? "The Unpredictable"
              : "The Survivor";
      setChosenEnding(endingTitle);

      // Persist completion telemetry to storage immediately
      void trackEvent(8, "game_completed", {
        sceneId: currentSceneId,
        endingId,
        chosenEnding: endingTitle,
        completed: true,
        ...results,
      });

      if (sessionId) {
        try {
          localStorage.setItem("the_unwritten_last_session_id", sessionId);
        } catch {
          // ignore
        }
      }

      // Trigger Warden Cinematic Outro at actual Investigator completion
      setShowWardenOutro(true);
    } else if (nextId && SOLO_CAMPAIGN_SCENES[nextId]) {
      setCurrentSceneId(nextId);
    }
  };

  const handleInspectMonograph = () => {
    router.push("/result/current");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#12100E] text-[#FAF7F2] select-none">
      {/* 1. WARDEN CINEMATIC INTRO (Plays exclusively at Investigator entry) */}
      <AnimatePresence>
        {showWardenIntro && (
          <WardenCinematicIntro
            key="warden-investigator-intro"
            onComplete={() => {
              setShowWardenIntro(false);
              try {
                sessionStorage.setItem("unwritten_investigator_intro_seen", "true");
              } catch {
                // ignore
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* 2. WARDEN CINEMATIC OUTRO (Plays exclusively at Investigator final completion) */}
      <AnimatePresence>
        {showWardenOutro && (
          <WardenCinematicOutro
            key="warden-investigator-outro"
            onComplete={() => setShowWardenOutro(false)}
            onRequestReview={() => {
              setShowWardenOutro(false);
              router.push("/result/current");
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. INVESTIGATOR GAMEPLAY OR COMPLETION SCREEN */}
      {gameEnded ? (
        <div className="min-h-screen bg-[#12100E] text-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-xl bg-[#1C1917] p-8 md:p-12 rounded-3xl border border-[#453D35] shadow-2xl">
            <div className="relative w-20 h-20 mx-auto mb-4 rounded-full border border-zinc-600 overflow-hidden shadow-lg">
              <Image
                src="/brand/logo-results.png"
                alt="THE UNWRITTEN"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#9E6B68]">
              The Mind Experiment • Concluded
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mt-3 mb-4 text-[#FAF7F2]">
              {chosenEnding}
            </h1>
            <p className="font-serif text-base text-[#DDD4C5] leading-relaxed mb-8">
              Your decisions across the eight chambers have been etched into the
              Institute&apos;s permanent chronicle. Every sacrifice, deduction, and
              instinctual choice formed an unrepeatable signature.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={handleInspectMonograph}
                className="px-6 py-3 rounded-full bg-[#FAF7F2] text-[#1C1917] font-sans font-bold text-sm hover:bg-[#E7E0D3] transition-all shadow-md cursor-pointer"
              >
                Inspect Personal Monograph →
              </button>
              <button
                type="button"
                onClick={() => setShowWardenOutro(true)}
                className="px-6 py-3 rounded-full bg-red-950/80 hover:bg-red-900 text-white font-mono text-xs uppercase tracking-wider transition-all border border-red-700/60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current text-red-400" />
                <span>Replay Warden Outro</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setGameEnded(false);
                  setCurrentSceneId("solo_prologue");
                }}
                className="px-6 py-3 rounded-full bg-[#2A2420] text-[#FAF7F2] font-mono text-xs uppercase tracking-wider hover:bg-[#3E352F] transition-all border border-white/10 cursor-pointer"
              >
                Re-enter Chamber 01
              </button>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
              <span>Created by Anish Patil</span>
              <span className="mx-2">•</span>
              <span>Human Vision × AI-Assisted Worldbuilding</span>
            </div>
          </div>
        </div>
      ) : (
        <StoryboardStage
          key={currentScene.id}
          scene={currentScene}
          onSceneComplete={handleSceneComplete}
          onReturnToHub={() => router.push("/")}
          onFailAndRestart={() => setCurrentSceneId("solo_l1")}
          modeTitle="THE MIND EXPERIMENT (SOLO)"
        />
      )}
    </div>
  );
}
