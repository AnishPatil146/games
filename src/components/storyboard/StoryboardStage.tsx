"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Home } from "lucide-react";
import Link from "next/link";
import {
  StoryboardScene,
  StoryboardDialogueStep,
  StoryboardChoice,
  CharacterId,
} from "@/lib/storyboard/types";
import { StageCharacter } from "./StageCharacter";
import { SpeechBubble } from "./SpeechBubble";
import { ContextualPuzzleOverlay } from "./ContextualPuzzleOverlay";

interface StoryboardStageProps {
  scene: StoryboardScene;
  onSceneComplete?: (results?: Record<string, unknown>) => void;
  onReturnToHub?: () => void;
  modeTitle?: string;
}

export function StoryboardStage({
  scene,
  onSceneComplete,
  onReturnToHub,
  modeTitle = "THE MIND EXPERIMENT",
}: StoryboardStageProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dismissedPuzzles, setDismissedPuzzles] = useState<Record<number, boolean>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [accumulatedDecisions, setAccumulatedDecisions] = useState<
    Record<string, unknown>
  >({});
  const [prevSceneId, setPrevSceneId] = useState(scene.id);

  // Synchronously reset step index when scene changes
  if (scene.id !== prevSceneId) {
    setPrevSceneId(scene.id);
    setCurrentStepIndex(0);
    setDismissedPuzzles({});
  }

  const safeStepIndex = Math.min(
    Math.max(0, currentStepIndex),
    Math.max(0, scene.steps.length - 1)
  );
  const currentStep: StoryboardDialogueStep | undefined =
    scene.steps[safeStepIndex];

  const activePuzzle =
    !dismissedPuzzles[safeStepIndex] && currentStep?.puzzleTrigger
      ? currentStep.puzzleTrigger
      : null;

  const handleAdvance = useCallback(() => {
    if (!currentStep) return;
    if (currentStep.choices && currentStep.choices.length > 0) {
      // Must pick a choice
      return;
    }
    if (safeStepIndex < scene.steps.length - 1) {
      setCurrentStepIndex(safeStepIndex + 1);
    } else {
      // Completed all steps in this scene
      if (onSceneComplete) {
        onSceneComplete(accumulatedDecisions);
      }
    }
  }, [currentStep, safeStepIndex, scene.steps.length, onSceneComplete, accumulatedDecisions]);

  // Keyboard navigation: Space/Enter/ArrowRight to advance dialogue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePuzzle) return; // Don't intercept when puzzle is active
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePuzzle, handleAdvance]);

  const handleSelectChoice = (choice: StoryboardChoice) => {
    setAccumulatedDecisions((prev) => ({
      ...prev,
      [scene.id]: choice.id,
      ...choice.statImpact,
    }));

    if (choice.targetStep !== undefined) {
      setCurrentStepIndex(choice.targetStep);
    } else if (safeStepIndex < scene.steps.length - 1) {
      setCurrentStepIndex(safeStepIndex + 1);
    } else {
      if (onSceneComplete) {
        onSceneComplete({
          ...accumulatedDecisions,
          [scene.id]: choice.id,
        });
      }
    }
  };

  const handlePuzzleSolve = (
    success: boolean,
    resultData: Record<string, unknown>
  ) => {
    setAccumulatedDecisions((prev) => ({
      ...prev,
      [`puzzle_${scene.id}`]: { success, ...resultData },
    }));
    setDismissedPuzzles((prev) => ({ ...prev, [safeStepIndex]: true }));
    if (safeStepIndex < scene.steps.length - 1) {
      setCurrentStepIndex(safeStepIndex + 1);
    } else {
      if (onSceneComplete) {
        onSceneComplete({
          ...accumulatedDecisions,
          [`puzzle_${scene.id}`]: { success, ...resultData },
        });
      }
    }
  };

  // Resolve which character is currently the speaker
  const currentSpeakerId: CharacterId = currentStep?.speakerId || "narrator";

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#0E0C0A] select-none flex flex-col justify-between">
      {/* Large Custom Illustrated Background with Ambient Drift */}
      <motion.div
        key={scene.backgroundUrl}
        initial={{ scale: 1.04, opacity: 0.9 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      >
        <Image
          src={scene.backgroundUrl}
          alt={scene.sceneTitle}
          fill
          unoptimized
          priority
          sizes="100vw"
          className="object-cover object-center select-none"
        />
        {/* Subtle Graphic Novel Tone Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50 pointer-events-none" />
      </motion.div>

      {/* Top HUD Bar (Pinned) */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/85 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          {onReturnToHub ? (
            <button
              onClick={onReturnToHub}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/70 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider backdrop-blur-md border border-white/15 transition-all shadow-md"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub</span>
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/70 text-[#FAF7F2] font-mono text-xs uppercase tracking-wider backdrop-blur-md border border-white/15 transition-all shadow-md"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub</span>
            </Link>
          )}

          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.25em] text-[#C8B28E] uppercase">
              {modeTitle} • LEVEL {scene.levelNumber}
            </span>
            <h2 className="text-sm md:text-base font-serif font-bold tracking-wide text-[#FAF7F2]">
              {scene.levelTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Step Progression Bar */}
          <div className="hidden md:flex items-center gap-1.5 bg-black/60 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md shadow-md">
            {scene.steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === safeStepIndex
                    ? "w-6 bg-[#FAF7F2]"
                    : idx < safeStepIndex
                    ? "w-2 bg-[#52B788]"
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-[#FAF7F2] backdrop-blur-md border border-white/15 transition-all shadow-md"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#52B788]" />
            )}
          </button>
        </div>
      </header>

      {/* Stage Characters Layer */}
      <div className="fixed inset-x-0 bottom-0 top-16 pointer-events-none z-10 overflow-hidden flex items-end justify-center">
        {scene.characters.map((char) => {
          const isSpeaker = char.id === currentSpeakerId;
          const activeExpression =
            isSpeaker && currentStep?.expression
              ? currentStep.expression
              : char.expression;

          return (
            <StageCharacter
              key={char.id}
              character={{
                ...char,
                expression: activeExpression,
              }}
              isSpeaker={isSpeaker}
            />
          );
        })}
      </div>

      {/* Dynamic Character-Anchored Speech Bubble (Pinned to Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 md:p-8 flex justify-center pointer-events-none">
        <div className="w-full max-w-4xl pointer-events-auto">
          {currentStep && (
            <SpeechBubble
              key={`${scene.id}-${safeStepIndex}`}
              speakerId={currentStep.speakerId}
              speakerName={currentStep.speakerName}
              text={currentStep.text}
              position={
                currentStep.bubblePosition ||
                (currentSpeakerId === "aarav"
                  ? "left"
                  : currentSpeakerId === "aanya" || currentSpeakerId === "mira"
                  ? "right"
                  : "center")
              }
              choices={currentStep.choices}
              onSelectChoice={handleSelectChoice}
              onAdvance={handleAdvance}
              canAdvance={!activePuzzle}
            />
          )}
        </div>
      </div>

      {/* In-Scene Contextual Interactive Puzzle Overlay */}
      <AnimatePresence>
        {activePuzzle && (
          <div className="fixed inset-0 z-50 pointer-events-auto">
            <ContextualPuzzleOverlay
              key={activePuzzle.id}
              config={activePuzzle}
              onSolve={handlePuzzleSolve}
              onCancel={() =>
                setDismissedPuzzles((prev) => ({
                  ...prev,
                  [safeStepIndex]: true,
                }))
              }
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
