"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useGameSession } from "@/lib/useGameSession";
import { Chapter1LastTrain } from "@/components/chapters/Chapter1LastTrain";
import { Chapter2LockedRoom } from "@/components/chapters/Chapter2LockedRoom";
import { Chapter3UnknownMessage } from "@/components/chapters/Chapter3UnknownMessage";
import { Chapter4EmptyCanvas } from "@/components/chapters/Chapter4EmptyCanvas";
import { Chapter5FinalTenSeconds } from "@/components/chapters/Chapter5FinalTenSeconds";
import { Chapter6UnknownWorld } from "@/components/chapters/Chapter6UnknownWorld";
import { Chapter7SeventhDoor } from "@/components/chapters/Chapter7SeventhDoor";
import { EventType } from "@/lib/types";

interface PageProps {
  params: Promise<{ chapter: string }>;
}

export default function ChapterPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const chapterNum = parseInt(resolvedParams.chapter, 10);

  const { sessionId, isLoading, trackEvent, savePreference } = useGameSession();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const loggedChapterStart = useRef<number | null>(null);

  useEffect(() => {
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 7) {
      router.replace("/play");
      return;
    }

    if (!isLoading && loggedChapterStart.current !== chapterNum) {
      loggedChapterStart.current = chapterNum;
      void trackEvent(chapterNum, "chapter_started", {
        chapter: chapterNum,
      });
    }
  }, [chapterNum, isLoading, router, trackEvent]);

  const handleTrackEvent = async (
    eventType: EventType,
    data: Record<string, unknown> = {}
  ) => {
    return trackEvent(chapterNum, eventType, data);
  };

  const handleSavePreference = async (category: string, value: string) => {
    return savePreference(category, value);
  };

  const handleChapterComplete = async () => {
    setIsTransitioning(true);
    if (chapterNum < 6) {
      setTimeout(
        () => {
          router.push(`/play/${chapterNum + 1}`);
        },
        prefersReducedMotion ? 50 : 280
      );
    } else if (chapterNum === 6) {
      const res = await trackEvent(6, "game_completed", {
        finishedAllChapters: true,
      });
      const targetId = res.sessionId || sessionId || "current";
      router.push(`/result/${targetId}`);
    } else {
      const targetId = sessionId || "current";
      router.push(`/result/${targetId}`);
    }
  };

  if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 7) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] paper-grain">
      <Header
        currentChapter={Math.min(chapterNum, 6)}
        totalChapters={6}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {isLoading ? (
          <div
            className="py-28 flex flex-col items-center justify-center space-y-4"
            aria-live="polite"
          >
            <div className="w-6 h-6 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A8178]">
              Opening Chapter 0{chapterNum}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <motion.div
                key={chapterNum}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {chapterNum === 1 && (
                  <Chapter1LastTrain
                    onTrackEvent={handleTrackEvent}
                    onComplete={() => void handleChapterComplete()}
                  />
                )}
                {chapterNum === 2 && (
                  <Chapter2LockedRoom
                    onTrackEvent={handleTrackEvent}
                    onComplete={() => void handleChapterComplete()}
                  />
                )}
                {chapterNum === 3 && (
                  <Chapter3UnknownMessage
                    onTrackEvent={handleTrackEvent}
                    onComplete={() => void handleChapterComplete()}
                  />
                )}
                {chapterNum === 4 && (
                  <Chapter4EmptyCanvas
                    onTrackEvent={handleTrackEvent}
                    onSavePreference={handleSavePreference}
                    onComplete={() => void handleChapterComplete()}
                  />
                )}
                {chapterNum === 5 && (
                  <Chapter5FinalTenSeconds
                    onTrackEvent={handleTrackEvent}
                    onComplete={() => void handleChapterComplete()}
                  />
                )}
                {chapterNum === 6 && (
                  <Chapter6UnknownWorld
                    onTrackEvent={handleTrackEvent}
                    onSavePreference={handleSavePreference}
                    onComplete={() => void handleChapterComplete()}
                  />
                )}
                {chapterNum === 7 && (
                  <Chapter7SeventhDoor
                    onTrackEvent={handleTrackEvent}
                    onComplete={() => void handleChapterComplete()}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
}
