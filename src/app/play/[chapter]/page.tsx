"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSession } from "@/lib/useGameSession";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chapter1LastTrain } from "@/components/chapters/Chapter1LastTrain";
import { Chapter2LockedRoom } from "@/components/chapters/Chapter2LockedRoom";
import { Chapter3UnknownMessage } from "@/components/chapters/Chapter3UnknownMessage";
import { Chapter4EmptyCanvas } from "@/components/chapters/Chapter4EmptyCanvas";
import { Chapter5FinalTenSeconds } from "@/components/chapters/Chapter5FinalTenSeconds";
import { Chapter6UnknownWorld } from "@/components/chapters/Chapter6UnknownWorld";

export default function ChapterPage() {
  const params = useParams();
  const chapterNumber = parseInt((params?.chapter as string) || "1", 10);
  const router = useRouter();
  const { sessionId, trackEvent, savePreference } = useGameSession();

  // Validate chapter bounds
  useEffect(() => {
    if (isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > 6) {
      router.replace("/play/1");
    }
  }, [chapterNumber, router]);

  // Generic event forwarder
  const handleEvent = (eventType: string, data: Record<string, unknown>) => {
    trackEvent(chapterNumber, eventType as any, data);
  };

  // Chapter 1 Complete
  const handleChapter1Complete = async (
    choiceId: string,
    durationMs: number,
    history: string[]
  ) => {
    await trackEvent(1, "chapter_completed", {
      choiceId,
      durationMs,
      history,
    });
    router.push("/play/2");
  };

  // Chapter 2 Complete
  const handleChapter2Complete = async (data: {
    cluesInspected: string[];
    attempts: number;
    hintsUsed: number;
    timeMs: number;
  }) => {
    await trackEvent(2, "chapter_completed", data);
    router.push("/play/3");
  };

  // Chapter 3 Complete
  const handleChapter3Complete = async (
    choiceId: string,
    durationMs: number,
    pathTaken: string[]
  ) => {
    await trackEvent(3, "chapter_completed", {
      choiceId,
      durationMs,
      pathTaken,
    });
    router.push("/play/4");
  };

  // Chapter 4 Complete
  const handleChapter4Complete = async (data: {
    selectedObjects: string[];
    mood: string;
    compositionTitle: string;
  }) => {
    await trackEvent(4, "chapter_completed", data);
    router.push("/play/5");
  };

  // Chapter 5 Complete
  const handleChapter5Complete = async (data: {
    isCorrect: boolean;
    durationMs: number;
    attempts: number;
    hintsUsed: number;
  }) => {
    await trackEvent(5, "chapter_completed", data);
    router.push("/play/6");
  };

  // Chapter 6 Complete (Finalizes Experience)
  const handleChapter6Complete = async (data: {
    environment: string;
    object: string;
    activity: string;
  }) => {
    await trackEvent(6, "chapter_completed", data);
    await trackEvent(6, "game_completed", {
      finishedAt: new Date().toISOString(),
      ...data,
    });

    // Navigate to personal report
    const targetSession = sessionId || localStorage.getItem("the_unwritten_session_token") || "current";
    router.push(`/result/${targetSession}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <Header currentChapter={chapterNumber} totalChapters={6} />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 sm:py-14 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={chapterNumber}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {chapterNumber === 1 && (
              <Chapter1LastTrain
                onComplete={handleChapter1Complete}
                onEvent={handleEvent}
              />
            )}
            {chapterNumber === 2 && (
              <Chapter2LockedRoom
                onComplete={handleChapter2Complete}
                onEvent={handleEvent}
              />
            )}
            {chapterNumber === 3 && (
              <Chapter3UnknownMessage
                onComplete={handleChapter3Complete}
                onEvent={handleEvent}
              />
            )}
            {chapterNumber === 4 && (
              <Chapter4EmptyCanvas
                onComplete={handleChapter4Complete}
                onEvent={handleEvent}
                onPreference={savePreference}
              />
            )}
            {chapterNumber === 5 && (
              <Chapter5FinalTenSeconds
                onComplete={handleChapter5Complete}
                onEvent={handleEvent}
              />
            )}
            {chapterNumber === 6 && (
              <Chapter6UnknownWorld
                onComplete={handleChapter6Complete}
                onEvent={handleEvent}
                onPreference={savePreference}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
