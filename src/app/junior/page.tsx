"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import {
  AcademicStreamConfig,
  AcademicSubjectConfig,
  DifficultyPreference,
  StreamSlug,
} from "@/lib/platform-types";

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

function JuniorStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const initialStreamParam = searchParams.get("stream");
  const initialSubjectParam = searchParams.get("subject");

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

  // Optional consented profile fields
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [consent, setConsent] = useState(false);
  const [existingDisplayName, setExistingDisplayName] = useState<string | null>(
    null
  );

  const [isLoadingStreams, setIsLoadingStreams] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [resettingSlug, setResettingSlug] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // Load streams + existing session display name
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [stRes, sessRes] = await Promise.all([
          fetch("/api/v1/public/academic/streams"),
          fetch("/api/v1/sessions"),
        ]);
        const stData = (await stRes.json()) as {
          streams?: AcademicStreamConfig[];
        };
        const sessData = (await sessRes.json()) as {
          playerDisplayName?: string | null;
        };
        if (active) {
          if (stData.streams) setStreams(stData.streams);
          if (sessData.playerDisplayName) {
            setExistingDisplayName(sessData.playerDisplayName);
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

  // Load subjects whenever selectedStream changes
  useEffect(() => {
    let active = true;
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setErrorMsg(null);
      try {
        const res = await fetch(
          `/api/v1/public/academic/subjects?stream=${selectedStream}`
        );
        const data = (await res.json()) as {
          subjects?: EnrichedSubject[];
          error?: string;
        };
        if (!res.ok || !data.subjects) {
          throw new Error(data.error || "Unable to load stream subjects.");
        }
        if (active) {
          setSubjects(data.subjects);
          const hasRequested = data.subjects.some(
            (s) => s.slug === initialSubjectParam
          );
          setSelectedSubjectSlug((prev) => {
            if (data.subjects!.some((s) => s.slug === prev)) return prev;
            if (hasRequested && initialSubjectParam) return initialSubjectParam;
            return data.subjects![0]?.slug || "";
          });
        }
      } catch (err: unknown) {
        if (active) {
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to load subjects."
          );
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
      const data = (await res.json()) as {
        cycleNumber?: number;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Could not reset question cycle.");
      }

      setSubjects((prev) =>
        prev.map((s) =>
          s.slug === subjectSlug
            ? {
              ...s,
              participantProgress: {
                ...s.participantProgress,
                completedQuestionsCount: 0,
                cycleNumber:
                  data.cycleNumber || s.participantProgress.cycleNumber + 1,
              },
            }
            : s
        )
      );
      setNoticeMsg(
        `Question cycle reset for ${subjectName}. All 100 questions are freshly eligible.`
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unable to reset cycle."
      );
    } finally {
      setResettingSlug(null);
    }
  };

  const handleStartAttempt = async () => {
    if (!selectedSubjectSlug || isStarting) return;
    if ((fullName.trim() || username.trim()) && !consent) {
      setErrorMsg(
        "Please check the consent box to link your name/username, or clear the fields to continue anonymously."
      );
      return;
    }

    setIsStarting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/junior/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream: selectedStream,
          subjectSlug: selectedSubjectSlug,
          difficultyPreference: difficulty,
          instantFeedbackEnabled: instantFeedback,
          optionalProfile:
            consent && (fullName.trim() || username.trim())
              ? {
                fullName: fullName.trim() || undefined,
                username: username.trim() || undefined,
                consent: true,
              }
              : undefined,
        }),
      });

      const data = (await res.json()) as {
        attemptId?: string;
        error?: string;
      };

      if (!res.ok || !data.attemptId) {
        throw new Error(
          data.error || "Unable to initialize 10-question challenge."
        );
      }

      try {
        sessionStorage.setItem(
          `junior_attempt_${data.attemptId}`,
          JSON.stringify(data)
        );
      } catch {
        // Ignore storage quota
      }

      router.push(`/junior/attempt/${data.attemptId}`);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to start attempt."
      );
      setIsStarting(false);
    }
  };

  const activeStreamConfig = streams.find((s) => s.slug === selectedStream);
  const selectedSubject = subjects.find((s) => s.slug === selectedSubjectSlug);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] paper-grain">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-12">
        {/* 1. STUDIO MASTHEAD & CLASS SELECTION */}
        <section className="border-b border-[#DDD4C5] pb-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.26em] text-[#545E4E] font-medium">
            <span>THE LEARNING ARENA — JUNIOR MODE</span>
            <span>Maharashtra State Board &amp; Competitive Entrance Tracks</span>
          </div>

          {/* Class 11 vs Class 12 Independent Toggle */}
          <div className="flex items-center gap-3 p-1.5 bg-[#F3EDE2] border border-[#DDD4C5] rounded-sm max-w-md">
            <button
              type="button"
              onClick={() => setSelectedClass(11)}
              className={`flex-1 py-2 px-4 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                selectedClass === 11
                  ? "bg-[#1C1917] text-[#FAF7F2] font-bold shadow-sm"
                  : "text-[#57524C] hover:text-[#1C1917]"
              }`}
            >
              Class 11 (FYJC) · Active
            </button>
            <button
              type="button"
              onClick={() => setSelectedClass(12)}
              className={`flex-1 py-2 px-4 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                selectedClass === 12
                  ? "bg-[#1C1917] text-[#FAF7F2] font-bold shadow-sm"
                  : "text-[#57524C] hover:text-[#1C1917]"
              }`}
            >
              Class 12 (HSC) · Preview
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] tracking-tight leading-[1.08]">
                {selectedClass === 11
                  ? "Class 11 Academic Reasoning Studio"
                  : "Class 12 Pre-Board & Entrance Arena"}
              </h1>
              <p className="text-sm sm:text-base text-[#57524C] leading-relaxed max-w-2xl">
                {selectedClass === 11
                  ? "Select your stream, subject, and challenge difficulty to enter a curated 10-question exploration. Completed questions never repeat within your 100-question cycle, with high-performance math typesetting and evidence-mapped skill synthesis."
                  : "Class 12 HSC Board curriculum and National Entrance mappings (JEE Main/Advanced, NEET UG, CUET, CLAT). Explore the complete Class 11 prerequisite question bank below while Class 12 syllabus modules are being indexed."}
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                type="button"
                onClick={() => setShowProfilePanel((v) => !v)}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 text-xs uppercase tracking-[0.18em] border border-[#CFC5B4] bg-[#F3EDE2] hover:bg-[#E7E0D3] text-[#1C1917] rounded-sm transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#545E4E]" />
                <span>
                  {existingDisplayName
                    ? `Signed: ${existingDisplayName}`
                    : "Optional Student Signature"}
                </span>
              </button>
            </div>
          </div>

          {/* Optional Voluntary Profile Panel */}
          {showProfilePanel && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-5 bg-[#F3EDE2] border border-[#CFC5B4] rounded-sm space-y-4"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-serif text-lg text-[#1C1917]">
                  Voluntary Participant Signature (Optional)
                </p>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                  Leave blank to play anonymously
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="jr-fullname"
                    className="block text-[11px] uppercase tracking-[0.18em] text-[#57524C]"
                  >
                    Student Name
                  </label>
                  <input
                    id="jr-fullname"
                    type="text"
                    maxLength={80}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Kulkarni"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="jr-username"
                    className="block text-[11px] uppercase tracking-[0.18em] text-[#57524C]"
                  >
                    Username or Handle (Optional)
                  </label>
                  <input
                    id="jr-username"
                    type="text"
                    maxLength={50}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. aarav_11sci"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-[#57524C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-[#1C1917]"
                />
                <span>
                  I voluntarily consent to attach my name/handle to my Junior
                  Mode session report. I understand I can request deletion at
                  any time via{" "}
                  <Link href="/privacy" className="underline text-[#1C1917]">
                    Privacy &amp; Data Governance
                  </Link>
                  .
                </span>
              </label>
            </motion.div>
          )}
        </section>

        {errorMsg && (
          <div
            role="alert"
            className="p-4 bg-[#9E6B68]/12 border border-[#9E6B68] text-xs sm:text-sm text-[#1C1917] rounded-sm"
          >
            {errorMsg}
          </div>
        )}

        {noticeMsg && (
          <div
            role="status"
            className="p-4 bg-[#545E4E]/12 border border-[#545E4E] text-xs sm:text-sm text-[#1C1917] rounded-sm"
          >
            {noticeMsg}
          </div>
        )}

        {/* 2. STREAM SELECTOR */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2 className="font-serif text-2xl text-[#1C1917]">
              I. Select Academic Stream
            </h2>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8178]">
              Stream-Specific Ability Model
            </span>
          </div>

          <div
            role="tablist"
            aria-label="Class 11 Academic Streams"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {(isLoadingStreams && streams.length === 0
              ? [
                {
                  slug: "science" as StreamSlug,
                  name: "Science",
                  subtitle: "Empirical inquiry & quantitative deduction",
                },
                {
                  slug: "commerce" as StreamSlug,
                  name: "Commerce",
                  subtitle: "Financial stewardship & enterprise strategy",
                },
                {
                  slug: "arts" as StreamSlug,
                  name: "Arts & Humanities",
                  subtitle: "Critical interpretation & human institutions",
                },
              ]
              : streams
            ).map((st) => {
              const isSelected = selectedStream === st.slug;
              return (
                <button
                  key={st.slug}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => setSelectedStream(st.slug)}
                  className={`p-5 rounded-sm border text-left transition-all cursor-pointer ${isSelected
                      ? "bg-[#141210] text-[#FAF7F2] border-[#141210] shadow-sm"
                      : "bg-[#F3EDE2]/70 hover:bg-[#F3EDE2] text-[#1C1917] border-[#DDD4C5]"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl">{st.name}</span>
                    <span
                      className={`text-[10px] uppercase tracking-[0.22em] ${isSelected ? "text-[#C8B28E]" : "text-[#8A8178]"
                        }`}
                    >
                      {isSelected ? "Selected" : "Choose"}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1.5 leading-relaxed ${isSelected ? "text-[#D6CEC0]" : "text-[#57524C]"
                      }`}
                  >
                    {st.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {activeStreamConfig && (
            <div className="p-4 bg-[#F3EDE2]/60 border border-[#DDD4C5] rounded-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#545E4E] font-semibold">
                {activeStreamConfig.name} Reasoning Dimensions:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {activeStreamConfig.abilityIndicators.map((ind) => (
                  <span
                    key={ind.key}
                    className="px-2.5 py-1 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-[11px] text-[#1C1917]"
                  >
                    {ind.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. SUBJECT SELECTION GRID */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2 className="font-serif text-2xl text-[#1C1917]">
              II. Select Subject Catalogue
            </h2>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8178]">
              100 Curated Questions Per Subject · Zero Repeats Per Cycle
            </span>
          </div>

          {isLoadingSubjects ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 border border-[#DDD4C5] rounded-sm bg-[#F3EDE2]/40">
              <div className="w-5 h-5 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#8A8178]">
                Loading Subject Banks
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((subj) => {
                const isSelected = selectedSubjectSlug === subj.slug;
                const prog = subj.participantProgress;
                const unseenCount = Math.max(
                  0,
                  subj.publishedQuestionCount - prog.completedQuestionsCount
                );

                return (
                  <div
                    key={subj.slug}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSubjectSlug(subj.slug)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedSubjectSlug(subj.slug);
                      }
                    }}
                    className={`p-6 rounded-sm border transition-all cursor-pointer flex flex-col justify-between space-y-5 ${isSelected
                        ? "bg-[#FAF7F2] border-[#1C1917] ring-1 ring-[#1C1917]"
                        : "bg-[#FAF7F2]/75 hover:bg-[#FAF7F2] border-[#DDD4C5]"
                      }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A8178]">
                          Code {subj.code} · {subj.chapters.length} Chapters
                          {subj.isElective ? " · Elective" : ""}
                        </span>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[#545E4E] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-[#8A8178]" />
                        )}
                      </div>

                      <h3 className="font-serif text-2xl text-[#1C1917]">
                        {subj.name}
                      </h3>
                      <p className="text-xs text-[#57524C] leading-relaxed">
                        {subj.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] uppercase tracking-[0.18em] text-[#8A8178]">
                          Cycle {prog.cycleNumber} · Unseen Pool
                        </span>
                        <span className="font-mono text-xs text-[#1C1917]">
                          {unseenCount}/{subj.publishedQuestionCount} Remaining
                          {prog.bestScoreOutOf10 !== null
                            ? ` · Best ${prog.bestScoreOutOf10}/10`
                            : ""}
                        </span>
                      </div>

                      {prog.completedQuestionsCount > 0 && (
                        <button
                          type="button"
                          disabled={resettingSlug === subj.slug}
                          onClick={(e) =>
                            void handleResetSubjectCycle(
                              e,
                              subj.slug,
                              subj.name
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] border border-[#CFC5B4] bg-[#F3EDE2] hover:bg-[#E7E0D3] text-[#1C1917] rounded-sm cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>
                            {resettingSlug === subj.slug
                              ? "Resetting..."
                              : "Reset Cycle"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. CHALLENGE CONFIGURATION & LAUNCH BAR */}
        <section className="p-6 sm:p-8 bg-[#141210] text-[#FAF7F2] border border-[#2E2924] rounded-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#FAF7F2]/12 pb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#C8B28E]">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>III. Challenge Parameters</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2]">
                {selectedSubject
                  ? `10-Question Run · ${selectedSubject.name}`
                  : "Select a Subject Above"}
              </h2>
            </div>

            {/* Difficulty Preference */}
            <div className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-[#A89F93]">
                Difficulty &amp; Target Calibration
              </span>
              <div className="inline-flex flex-wrap gap-2">
                {[
                  { key: "Mixed" as DifficultyPreference, label: "Mixed Diagnostic", desc: "Balanced" },
                  { key: "Easy" as DifficultyPreference, label: "EASY · Learn & Understand", desc: "Foundations & Formulas" },
                  { key: "Medium" as DifficultyPreference, label: "MEDIUM · Board Prep", desc: "State & CBSE Standard" },
                  { key: "Hard" as DifficultyPreference, label: "HARD · Competitive", desc: selectedStream === "science" ? "JEE / NEET" : selectedStream === "commerce" ? "CUET / CA" : "CUET / CLAT" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setDifficulty(item.key)}
                    className={`px-3 py-2 text-xs uppercase tracking-[0.14em] rounded-sm border text-left transition-all cursor-pointer ${difficulty === item.key
                        ? "bg-[#FAF7F2] text-[#141210] border-[#FAF7F2] font-bold shadow-md"
                        : "bg-transparent text-[#D6CEC0] border-[#FAF7F2]/25 hover:border-[#FAF7F2]/60"
                      }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] opacity-70 tracking-normal normal-case font-normal mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <label className="flex items-start sm:items-center gap-3 text-xs text-[#D6CEC0] cursor-pointer max-w-lg">
              <input
                type="checkbox"
                checked={instantFeedback}
                onChange={(e) => setInstantFeedback(e.target.checked)}
                className="mt-0.5 sm:mt-0 accent-[#C8B28E]"
              />
              <span>
                <strong className="text-[#FAF7F2] font-medium">
                  Guided Study Mode (Optional):
                </strong>{" "}
                Reveal explanation immediately after locking each option. Leave
                unchecked for standard end-of-attempt evaluation.
              </span>
            </label>

            <Button
              variant="ivory"
              size="lg"
              disabled={
                !selectedSubject ||
                selectedSubject.publishedQuestionCount < 10 ||
                isStarting
              }
              onClick={() => void handleStartAttempt()}
              className="group shrink-0 min-w-[260px]"
            >
              <span>
                {isStarting
                  ? "Preparing 10 Questions..."
                  : "Begin 10-Question Challenge"}
              </span>
              <ArrowRight className="w-4 h-4 ml-2.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function JuniorModePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#1C1917]">
          <span className="text-[11px] uppercase tracking-[0.26em] text-[#8A8178]">
            Opening Junior Mode Studio
          </span>
        </div>
      }
    >
      <JuniorStudioContent />
    </Suspense>
  );
}
