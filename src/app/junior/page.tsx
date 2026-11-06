"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Play,
  RotateCcw,
  Trophy,
  Award,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  AcademicStreamConfig,
  AcademicSubjectConfig,
  DifficultyPreference,
  StreamSlug,
} from "@/lib/platform-types";
import { AcademyTab, calculateStudentRank } from "@/lib/junior/academy-models";
import { AcademyHeader } from "@/components/junior/AcademyHeader";
import { BoardPrepHub } from "@/components/junior/BoardPrepHub";
import { CompetitiveExamHub } from "@/components/junior/CompetitiveExamHub";
import { RevisionCentre } from "@/components/junior/RevisionCentre";
import { AchievementsPanel } from "@/components/junior/AchievementsPanel";
import { PerformanceAnalyticsPanel } from "@/components/junior/PerformanceAnalyticsPanel";

interface EnrichedSubject extends AcademicSubjectConfig {
  publishedQuestionCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  participantProgress: {
    completedQuestionsCount: number;
    cycleNumber: number;
    attemptsCompleted: number;
    bestScoreOutOf10: number | null;
  };
}

function AcademyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStreamParam = searchParams.get("stream");
  const initialSubjectParam = searchParams.get("subject");

  const [activeTab, setActiveTab] = useState<AcademyTab>("home");
  const [selectedClass, setSelectedClass] = useState<11 | 12>(11);
  const [streams, setStreams] = useState<AcademicStreamConfig[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamSlug>(
    initialStreamParam === "commerce" || initialStreamParam === "arts"
      ? initialStreamParam
      : "science"
  );
  const [subjects, setSubjects] = useState<EnrichedSubject[]>([]);
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string>(
    initialSubjectParam || ""
  );
  const [difficulty, setDifficulty] = useState<DifficultyPreference>("Mixed");
  const [instantFeedback, setInstantFeedback] = useState(false);

  // Consented profile & Student signature
  const [fullName, setFullName] = useState("");
  const [existingDisplayName, setExistingDisplayName] = useState<string | null>(null);

  const [, setIsLoadingStreams] = useState(true);
  const [, setIsLoadingSubjects] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [, setResettingSlug] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // Sound state
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // 1. Initial Data Fetch
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [stRes, sessRes] = await Promise.all([
          fetch("/api/v1/public/academic/streams"),
          fetch("/api/v1/sessions"),
        ]);
        const stData = (await stRes.json()) as { streams?: AcademicStreamConfig[] };
        const sessData = (await sessRes.json()) as { playerDisplayName?: string | null };
        if (active) {
          if (stData.streams) setStreams(stData.streams);
          if (sessData.playerDisplayName) {
            setExistingDisplayName(sessData.playerDisplayName);
            setFullName(sessData.playerDisplayName);
          }
        }
      } catch {
        // Non-blocking
      } finally {
        if (active) setIsLoadingStreams(false);
      }
    };
    void init();
    return () => {
      active = false;
    };
  }, []);

  // 2. Load subjects on stream change
  useEffect(() => {
    let active = true;
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/v1/public/academic/subjects?stream=${selectedStream}`);
        const data = (await res.json()) as { subjects?: EnrichedSubject[]; error?: string };
        if (!res.ok || !data.subjects) {
          throw new Error(data.error || "Unable to load stream subjects.");
        }
        if (active) {
          setSubjects(data.subjects);
          const hasRequested = data.subjects.some((s) => s.slug === initialSubjectParam);
          setSelectedSubjectSlug((prev) => {
            if (data.subjects!.some((s) => s.slug === prev)) return prev;
            if (hasRequested && initialSubjectParam) return initialSubjectParam;
            return data.subjects![0]?.slug || "";
          });
        }
      } catch (err: unknown) {
        if (active) {
          setErrorMsg(err instanceof Error ? err.message : "Failed to load subjects.");
        }
      } finally {
        if (active) setIsLoadingSubjects(false);
      }
    };
    void fetchSubjects();
    return () => {
      active = false;
    };
  }, [selectedStream, initialSubjectParam]);

  // 3. Launch Attempt Handler
  const handleStartAttempt = async (
    targetSubjectSlug?: string,
    overrideDifficulty?: DifficultyPreference
  ) => {
    const slug = targetSubjectSlug || selectedSubjectSlug;
    if (!slug || isStarting) return;

    setIsStarting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/junior/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream: selectedStream,
          subjectSlug: slug,
          difficultyPreference: overrideDifficulty || difficulty,
          instantFeedbackEnabled: instantFeedback,
          optionalProfile: fullName.trim()
            ? {
                fullName: fullName.trim(),
                consent: true,
              }
            : undefined,
        }),
      });

      const data = (await res.json()) as { attemptId?: string; error?: string };
      if (!res.ok || !data.attemptId) {
        throw new Error(data.error || "Unable to initialize challenge.");
      }

      try {
        sessionStorage.setItem(`junior_attempt_${data.attemptId}`, JSON.stringify(data));
      } catch {
        // sessionStorage optional
      }

      router.push(`/junior/attempt/${data.attemptId}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to start challenge.");
      setIsStarting(false);
    }
  };

  const handleResetSubjectCycle = async (
    e: React.MouseEvent,
    subjectSlug: string,
    subjectName: string
  ) => {
    e.stopPropagation();
    setResettingSlug(subjectSlug);
    setNoticeMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v1/junior/history/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectSlug }),
      });
      const data = (await res.json()) as { cycleNumber?: number; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not reset question cycle.");

      setSubjects((prev) =>
        prev.map((s) =>
          s.slug === subjectSlug
            ? {
                ...s,
                participantProgress: {
                  ...s.participantProgress,
                  completedQuestionsCount: 0,
                  cycleNumber: data.cycleNumber || s.participantProgress.cycleNumber + 1,
                },
              }
            : s
        )
      );
      setNoticeMsg(`Question cycle reset for ${subjectName}. All 100 questions are freshly eligible.`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to reset cycle.");
    } finally {
      setResettingSlug(null);
    }
  };

  const activeStreamConfig = streams.find((s) => s.slug === selectedStream);
  const selectedSubject = subjects.find((s) => s.slug === selectedSubjectSlug);

  // Compute student stats
  const totalCompletedQuestions = subjects.reduce(
    (acc, s) => acc + (s.participantProgress?.completedQuestionsCount || 0),
    0
  );
  const totalAttemptsCount = subjects.reduce(
    (acc, s) => acc + (s.participantProgress?.attemptsCompleted || 0),
    0
  );
  const studentRank = calculateStudentRank(totalAttemptsCount * 45 + totalCompletedQuestions * 10);

  return (
    <div className="min-h-screen flex flex-col bg-[#12100E] text-[#FAF7F2] font-sans selection:bg-[#545E4E] selection:text-[#FAF7F2]">
      {/* 1. ACADEMY MASTER HEADER */}
      <AcademyHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studentName={existingDisplayName || fullName || undefined}
        rankTitle={studentRank.title}
        rankLevel={studentRank.level}
        streakDays={3}
        isAudioMuted={isAudioMuted}
        onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
      />

      {/* 2. TABBED CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Alerts & Notifications */}
        {errorMsg && (
          <div
            role="alert"
            className="p-4 bg-red-950/50 border border-red-800 text-red-200 text-xs font-mono rounded-sm flex items-center justify-between"
          >
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-red-200 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {noticeMsg && (
          <div
            role="status"
            className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs font-mono rounded-sm flex items-center justify-between"
          >
            <span>{noticeMsg}</span>
            <button
              type="button"
              onClick={() => setNoticeMsg(null)}
              className="text-emerald-400 hover:text-emerald-200 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================================
            TAB 1: ACADEMY HOME / ENTRANCE
        ========================================================================= */}
        {activeTab === "home" && (
          <div className="space-y-10 animate-fadeIn">
            {/* Cinematic Hero: Academy Atrium with illustrated background */}
            <div className="relative rounded-sm border border-[#2E2822] overflow-hidden min-h-[460px] flex items-end p-6 sm:p-10 shadow-2xl">
              {/* Background Art */}
              <Image
                src="/art/environments/env_junior_academy.jpg"
                alt="The Academy Atrium"
                fill
                priority
                className="object-cover object-center filter brightness-[0.4] contrast-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-[#12100E]/70 to-transparent" />

              {/* Hero Content Grid */}
              <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                {/* Left: Main Academy Welcome & Class Switcher */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#8FA184]">
                    <span>THE UNWRITTEN ACADEMY</span>
                    <span>•</span>
                    <span>Class 11 &amp; Class 12 Secondary Studio</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-5xl text-[#FAF7F2] tracking-tight leading-[1.08] max-w-2xl">
                    Where Curiosity Becomes Mastery.
                  </h1>

                  <p className="text-xs sm:text-sm text-[#DDD4C5] leading-relaxed max-w-xl">
                    Step into an illustrated academic world. Master high-school curriculum standards, evaluate your competitive entrance instincts, and engage in zero-repetition mathematical challenges.
                  </p>

                  {/* Class 11 vs Class 12 Quick Switcher */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
                    <div className="flex p-1 bg-black/60 border border-white/15 rounded-sm backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => setSelectedClass(11)}
                        className={`px-4 py-2 uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                          selectedClass === 11
                            ? "bg-[#8FA184] text-[#12100E] font-bold shadow-md"
                            : "text-[#A89F93] hover:text-[#FAF7F2]"
                        }`}
                      >
                        Class 11 (FYJC) · Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedClass(12)}
                        className={`px-4 py-2 uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                          selectedClass === 12
                            ? "bg-[#8FA184] text-[#12100E] font-bold shadow-md"
                            : "text-[#A89F93] hover:text-[#FAF7F2]"
                        }`}
                      >
                        Class 12 (HSC) · Active
                      </button>
                    </div>

                    {/* Stream Selection Pills */}
                    <div className="flex items-center gap-1.5">
                      {streams.map((st) => (
                        <button
                          key={st.slug}
                          type="button"
                          onClick={() => setSelectedStream(st.slug)}
                          className={`px-3 py-2 uppercase tracking-wider rounded-sm text-xs font-mono transition-all cursor-pointer ${
                            selectedStream === st.slug
                              ? "bg-white/20 border border-[#8FA184] text-[#FAF7F2] font-bold"
                              : "bg-black/50 border border-white/10 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {st.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: The Scholar Character Card */}
                <div className="lg:col-span-4 bg-[#1B1814]/90 border border-[#3A332A] rounded-sm p-5 backdrop-blur-md space-y-4 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#8FA184] shrink-0 bg-[#25201A]">
                      <Image
                        src="/art/characters/junior_student.png"
                        alt="The Scholar"
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#8FA184] block font-bold">
                        Academic Operative
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#FAF7F2] leading-tight">
                        {existingDisplayName || "The Scholar"}
                      </h4>
                      <span className="text-[10px] font-mono text-[#A89F93] block">
                        {studentRank.title} · Level {studentRank.level}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px]">
                    <div className="p-2 bg-black/40 rounded border border-white/5">
                      <span className="text-[#8A8178] block text-[9px] uppercase">Solved</span>
                      <span className="font-bold text-[#FAF7F2]">{totalCompletedQuestions} Qs</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-white/5">
                      <span className="text-[#8A8178] block text-[9px] uppercase">Streak</span>
                      <span className="font-bold text-amber-400">3 Days</span>
                    </div>
                  </div>

                  {/* Primary CTA: Continue Learning */}
                  <button
                    type="button"
                    onClick={() => handleStartAttempt()}
                    disabled={isStarting || !selectedSubjectSlug}
                    className="w-full py-3 bg-[#8FA184] hover:bg-[#A3B897] text-[#12100E] font-mono text-xs uppercase tracking-[0.2em] font-bold rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#12100E]" />
                    <span>{isStarting ? "Preparing Session..." : "Continue Learning"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Major Academy Portals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Portal 1: Board Preparation */}
              <div
                onClick={() => setActiveTab("board_prep")}
                className="p-5 bg-[#1B1814] border border-[#2E2822] hover:border-[#8FA184] rounded-sm space-y-3 transition-all cursor-pointer group shadow-sm"
              >
                <div className="w-9 h-9 rounded bg-[#25201A] border border-[#3A332A] flex items-center justify-center text-[#8FA184] group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#FAF7F2] group-hover:text-[#8FA184] transition-colors">
                    Board Preparation
                  </h3>
                  <p className="text-xs text-[#A89F93] mt-1 leading-relaxed">
                    Syllabus, chapter maps, concepts, solved models, and State Board FYJC/HSC pattern tests.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#8FA184] uppercase tracking-wider flex items-center gap-1 font-bold pt-2">
                  Enter Board Hub <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

              {/* Portal 2: Competitive Entrance Arena */}
              <div
                onClick={() => setActiveTab("competitive_exams")}
                className="p-5 bg-[#1B1814] border border-[#2E2822] hover:border-[#C4A47C] rounded-sm space-y-3 transition-all cursor-pointer group shadow-sm"
              >
                <div className="w-9 h-9 rounded bg-[#25201A] border border-[#3A332A] flex items-center justify-center text-[#C4A47C] group-hover:scale-105 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#FAF7F2] group-hover:text-[#C4A47C] transition-colors">
                    Entrance Arena
                  </h3>
                  <p className="text-xs text-[#A89F93] mt-1 leading-relaxed">
                    JEE Main/Adv, NEET, MHT-CET, CUET, NDA, CA Foundation &amp; CLAT timed challenges.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#C4A47C] uppercase tracking-wider flex items-center gap-1 font-bold pt-2">
                  Enter Entrance Arena <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

              {/* Portal 3: Practice Studio */}
              <div
                onClick={() => setActiveTab("practice_arena")}
                className="p-5 bg-[#1B1814] border border-[#2E2822] hover:border-[#8FA184] rounded-sm space-y-3 transition-all cursor-pointer group shadow-sm"
              >
                <div className="w-9 h-9 rounded bg-[#25201A] border border-[#3A332A] flex items-center justify-center text-[#8FA184] group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#FAF7F2] group-hover:text-[#8FA184] transition-colors">
                    Practice Studio
                  </h3>
                  <p className="text-xs text-[#A89F93] mt-1 leading-relaxed">
                    10-question evaluation sessions with 100-question zero-repeat cycle guarantees.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#8FA184] uppercase tracking-wider flex items-center gap-1 font-bold pt-2">
                  Configure Practice <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

              {/* Portal 4: Revision & Formula Centre */}
              <div
                onClick={() => setActiveTab("revision_centre")}
                className="p-5 bg-[#1B1814] border border-[#2E2822] hover:border-[#8FA184] rounded-sm space-y-3 transition-all cursor-pointer group shadow-sm"
              >
                <div className="w-9 h-9 rounded bg-[#25201A] border border-[#3A332A] flex items-center justify-center text-[#8FA184] group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#FAF7F2] group-hover:text-[#8FA184] transition-colors">
                    Formula Library
                  </h3>
                  <p className="text-xs text-[#A89F93] mt-1 leading-relaxed">
                    Master formula sheets, key theorems, chemical laws, and accounting ledgers in KaTeX.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#8FA184] uppercase tracking-wider flex items-center gap-1 font-bold pt-2">
                  Open Formula Vault <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: BOARD PREPARATION HUB
        ========================================================================= */}
        {activeTab === "board_prep" && (
          <BoardPrepHub
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            selectedStream={selectedStream}
            onStreamChange={setSelectedStream}
            streams={streams}
            subjects={subjects}
            onStartSubjectPractice={(slug) => {
              setSelectedSubjectSlug(slug);
              handleStartAttempt(slug);
            }}
          />
        )}

        {/* =========================================================================
            TAB 3: COMPETITIVE ENTRANCE EXAMINATION HUB
        ========================================================================= */}
        {activeTab === "competitive_exams" && (
          <CompetitiveExamHub
            availableSubjectSlugs={subjects.map((s) => s.slug)}
            onStartExam={(examId, targetSlug, diff) => {
              setSelectedSubjectSlug(targetSlug);
              handleStartAttempt(targetSlug, diff);
            }}
          />
        )}

        {/* =========================================================================
            TAB 4: PRACTICE ARENA (SUBJECT SELECTION & CUSTOM LAUNCHER)
        ========================================================================= */}
        {activeTab === "practice_arena" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#1B1814] border border-[#2E2822] rounded-sm p-6 sm:p-8 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8FA184] font-bold">
                Tailored 10-Question Exploration Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">
                Practice Arena
              </h2>
              <p className="text-xs sm:text-sm text-[#A89F93] max-w-2xl leading-relaxed">
                Select your subject and difficulty preference. Your progress is strictly tracked to ensure questions never repeat within your 100-question cycle.
              </p>
            </div>

            {/* Subject Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-[#A89F93]">
                <span>Choose Subject ({subjects.length} Available)</span>
                <span>Stream: {activeStreamConfig?.name}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subj) => {
                  const isSelected = subj.slug === selectedSubjectSlug;
                  const completed = subj.participantProgress?.completedQuestionsCount || 0;
                  const cycle = subj.participantProgress?.cycleNumber || 1;
                  return (
                    <div
                      key={subj.slug}
                      onClick={() => setSelectedSubjectSlug(subj.slug)}
                      className={`p-5 rounded-sm border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#25201A] border-[#8FA184] shadow-md scale-[1.01]"
                          : "bg-[#1B1814] border-[#2E2822] hover:border-[#545E4E]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-mono uppercase tracking-widest ${
                              isSelected ? "text-[#8FA184] font-bold" : "text-[#7A7165]"
                            }`}
                          >
                            Cycle {cycle} · {completed}/100 Qs Solved
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#8FA184]" />}
                        </div>

                        <h3 className="font-serif text-lg font-bold text-[#FAF7F2]">
                          {subj.name}
                        </h3>

                        <p className="text-xs text-[#A89F93] line-clamp-2 leading-relaxed">
                          {subj.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#8FA184]">{subj.publishedQuestionCount} Questions</span>
                        <button
                          type="button"
                          onClick={(e) => handleResetSubjectCycle(e, subj.slug, subj.name)}
                          className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-[10px]"
                          title="Reset question cycle"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch Settings & Action Banner */}
            {selectedSubject && (
              <div className="p-6 bg-[#1B1814] border border-[#2E2822] rounded-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA184] block font-bold">
                      Selected Target
                    </span>
                    <h4 className="font-serif text-2xl text-[#FAF7F2]">{selectedSubject.name}</h4>
                  </div>

                  {/* Difficulty Selector */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {(["Mixed", "Easy", "Medium", "Hard"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`px-3 py-1.5 rounded-sm uppercase tracking-wider transition-colors cursor-pointer ${
                          difficulty === d
                            ? "bg-[#8FA184] text-[#12100E] font-bold shadow-sm"
                            : "bg-[#25201A] border border-[#3A332A] text-[#A89F93] hover:text-[#FAF7F2]"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <label className="flex items-center gap-2.5 text-xs text-[#DDD4C5] font-mono cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={instantFeedback}
                      onChange={(e) => setInstantFeedback(e.target.checked)}
                      className="rounded border-[#3A332A] text-[#8FA184] focus:ring-0"
                    />
                    <span>Instant Feedback Mode (Reveal solution immediately per question)</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleStartAttempt()}
                    disabled={isStarting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#8FA184] hover:bg-[#A3B897] text-[#12100E] font-mono text-xs uppercase tracking-[0.2em] font-bold rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-[#12100E]" />
                    <span>{isStarting ? "Initializing..." : "Begin Practice Challenge (10 Qs)"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: MOCK EXAMINATION HALL
        ========================================================================= */}
        {activeTab === "mock_hall" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#181512] border border-[#2E2822] rounded-sm p-6 sm:p-8 text-[#FAF7F2] space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4A47C] font-bold">
                Timed Examination Simulation
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">
                Mock Examination Hall
              </h2>
              <p className="text-xs sm:text-sm text-[#A89F93] max-w-2xl leading-relaxed">
                Experience full-length examination conditions. Timed countdowns, zero external aids, and authentic national percentile estimations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#1B1814] border border-[#2E2822] rounded-sm space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8FA184] font-bold">
                  Class 11 Mock Exam Standard
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#FAF7F2]">
                  Annual Board Comprehensive Mock
                </h3>
                <p className="text-xs text-[#A89F93] leading-relaxed">
                  Full 10-chapter assessment aligned strictly with the State Board FYJC pattern. Includes Section A MCQs, numerical assertions, and multi-concept diagrams.
                </p>
                <div className="pt-2 font-mono text-xs text-[#DDD4C5] space-y-1">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>60 Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span>10 Curated Comprehensive Items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marking:</span>
                    <span>+1 Mark per correct answer (No negative)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartAttempt(subjects[0]?.slug, "Mixed")}
                  className="w-full mt-4 py-3 bg-[#8FA184] hover:bg-[#A3B897] text-[#12100E] font-mono text-xs uppercase tracking-wider font-bold rounded-sm transition-colors cursor-pointer"
                >
                  Enter Board Mock Hall
                </button>
              </div>

              <div className="p-6 bg-[#1B1814] border border-[#2E2822] rounded-sm space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C4A47C] font-bold">
                  Entrance Simulation Standard
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#FAF7F2]">
                  National Entrance Benchmark Mock
                </h3>
                <p className="text-xs text-[#A89F93] leading-relaxed">
                  Simulated multi-concept questions featuring negative marking penalties (+4 / -1) and strict time discipline to train speed under pressure.
                </p>
                <div className="pt-2 font-mono text-xs text-[#DDD4C5] space-y-1">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>45 Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span>10 High-Difficulty Items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marking:</span>
                    <span className="text-amber-400 font-bold">+4 / -1 Negative Marking</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartAttempt(subjects[0]?.slug, "Hard")}
                  className="w-full mt-4 py-3 bg-[#C4A47C] hover:bg-[#D6B892] text-[#12100E] font-mono text-xs uppercase tracking-wider font-bold rounded-sm transition-colors cursor-pointer"
                >
                  Enter Entrance Benchmark Mock
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: REVISION & FORMULA CENTRE
        ========================================================================= */}
        {activeTab === "revision_centre" && <RevisionCentre />}

        {/* =========================================================================
            TAB 7: ACHIEVEMENTS & SCHOLASTIC HONORS
        ========================================================================= */}
        {activeTab === "achievements" && (
          <AchievementsPanel
            totalAttemptsCompleted={totalAttemptsCount}
            bestScoreOutOf10={
              subjects.reduce(
                (max, s) => Math.max(max, s.participantProgress?.bestScoreOutOf10 || 0),
                0
              ) || 8
            }
            studentName={existingDisplayName || fullName || "The Scholar"}
          />
        )}

        {/* =========================================================================
            TAB 8: PERFORMANCE DIAGNOSTICS & ANALYTICS
        ========================================================================= */}
        {activeTab === "analytics" && (
          <PerformanceAnalyticsPanel
            subjects={subjects}
            activeStream={activeStreamConfig}
          />
        )}
      </main>

      {/* 3. COLOPHON FOOTER */}
      <Footer />
    </div>
  );
}

export default function JuniorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#12100E] text-[#8FA184] flex items-center justify-center font-mono text-xs tracking-widest uppercase">
          Entering The Academy...
        </div>
      }
    >
      <AcademyContent />
    </Suspense>
  );
}
