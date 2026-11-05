"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StoryboardStage } from "@/components/storyboard/StoryboardStage";
import { SOLO_CAMPAIGN_SCENES } from "@/lib/campaign/solo-campaign-data";
import { useGameSession } from "@/lib/useGameSession";

export default function SoloCampaignPage() {
  const router = useRouter();
  const { sessionId, trackEvent } = useGameSession();
  const [currentSceneId, setCurrentSceneId] = useState("solo_prologue");
  const [gameEnded, setGameEnded] = useState(false);
  const [chosenEnding, setChosenEnding] = useState<string>("The Survivor");

  const currentScene = SOLO_CAMPAIGN_SCENES[currentSceneId] || SOLO_CAMPAIGN_SCENES.solo_prologue;

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
    } else if (nextId && SOLO_CAMPAIGN_SCENES[nextId]) {
      setCurrentSceneId(nextId);
    }
  };

  if (gameEnded) {
    return (
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
              onClick={() => router.push(`/result/${sessionId || "current"}`)}
              className="px-6 py-3 rounded-full bg-[#FAF7F2] text-[#1C1917] font-sans font-bold text-sm hover:bg-[#E7E0D3] transition-all shadow-md"
            >
              Inspect Personal Monograph →
            </button>
            <button
              onClick={() => {
                setGameEnded(false);
                setCurrentSceneId("solo_prologue");
              }}
              className="px-6 py-3 rounded-full bg-[#2A2420] text-[#FAF7F2] font-mono text-xs uppercase tracking-wider hover:bg-[#3E352F] transition-all border border-white/10"
            >
              Re-enter Chamber 01
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StoryboardStage
      key={currentScene.id}
      scene={currentScene}
      onSceneComplete={handleSceneComplete}
      onReturnToHub={() => router.push("/")}
      onFailAndRestart={() => setCurrentSceneId("solo_l1")}
      modeTitle="THE MIND EXPERIMENT (SOLO)"
    />
  );
}
