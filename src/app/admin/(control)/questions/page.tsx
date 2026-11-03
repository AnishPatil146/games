"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Button } from "@/components/Button";
import {
  AcademicSubjectConfig,
  OptionKey,
  PublicationStatus,
  QuestionBankRecord,
  QuestionDifficulty,
  StreamSlug,
} from "@/lib/platform-types";

function QuestionsBankManagerInner() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") || "";

  const [subjects, setSubjects] = useState<AcademicSubjectConfig[]>([]);
  const [items, setItems] = useState<QuestionBankRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [stream, setStream] = useState<string>("");
  const [subjectSlug, setSubjectSlug] = useState<string>(initialSubject);
  const [difficulty, setDifficulty] = useState<string>("");
  const [pubStatus, setPubStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create / Edit / Preview Drawer State
  const [editorMode, setEditorMode] = useState<"closed" | "create" | "edit">(
    "closed"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(true);

  const [formStream, setFormStream] = useState<StreamSlug>("science");
  const [formSubjectSlug, setFormSubjectSlug] = useState("sci-physics");
  const [formChapterNum, setFormChapterNum] = useState(1);
  const [formChapter, setFormChapter] = useState("Units and Measurements");
  const [formTopic, setFormTopic] = useState("Dimensional Analysis");
  const [formDifficulty, setFormDifficulty] =
    useState<QuestionDifficulty>("Medium");
  const [formStem, setFormStem] = useState("");
  const [formOptA, setFormOptA] = useState("");
  const [formOptB, setFormOptB] = useState("");
  const [formOptC, setFormOptC] = useState("");
  const [formOptD, setFormOptD] = useState("");
  const [formCorrectKey, setFormCorrectKey] = useState<OptionKey>("A");
  const [formExplanation, setFormExplanation] = useState("");
  const [formSyllabusRef, setFormSyllabusRef] = useState(
    "MSBSHSE Class 11 Textbook"
  );
  const [formAbilityTags, setFormAbilityTags] = useState(
    "logical_reasoning, analytical_thinking"
  );
  const [formReviewed, setFormReviewed] = useState(false);

  // Import Modal State
  const [showImportBox, setShowImportBox] = useState(false);
  const [importFormat, setImportFormat] = useState<"csv" | "json">("json");
  const [importContent, setImportContent] = useState("");

  useEffect(() => {
    void fetch("/api/v1/admin/subjects")
      .then((r) => r.json())
      .then((d: { subjects?: AcademicSubjectConfig[] }) => {
        if (d.subjects) setSubjects(d.subjects);
      })
      .catch(() => {});
  }, []);

  const [reloadTick, setReloadTick] = useState(0);
  const triggerReload = useCallback(() => {
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const qs = new URLSearchParams({
          page: String(page),
          pageSize: "20",
        });
        if (stream) qs.set("stream", stream);
        if (subjectSlug) qs.set("subjectSlug", subjectSlug);
        if (difficulty) qs.set("difficulty", difficulty);
        if (pubStatus) qs.set("publicationStatus", pubStatus);
        if (search.trim()) qs.set("search", search.trim());

        const res = await fetch(`/api/v1/admin/questions?${qs.toString()}`);
        const data = (await res.json()) as {
          items?: QuestionBankRecord[];
          total?: number;
          totalPages?: number;
        };
        if (active && data.items) {
          setItems(data.items);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [difficulty, page, pubStatus, reloadTick, search, stream, subjectSlug]);

  const openCreateForm = () => {
    setEditorMode("create");
    setEditingId(null);
    setFormStem("");
    setFormOptA("");
    setFormOptB("");
    setFormOptC("");
    setFormOptD("");
    setFormCorrectKey("A");
    setFormExplanation("");
    setFormReviewed(false);
    setErrorMsg(null);
  };

  const openEditForm = (q: QuestionBankRecord) => {
    setEditorMode("edit");
    setEditingId(q.id);
    setFormStream(q.stream);
    setFormSubjectSlug(q.subjectSlug);
    setFormChapterNum(q.chapterNumber);
    setFormChapter(q.chapter);
    setFormTopic(q.topic);
    setFormDifficulty(q.difficulty);
    setFormStem(q.questionText);
    const map = new Map(q.options.map((o) => [o.key, o.text]));
    setFormOptA(map.get("A") || "");
    setFormOptB(map.get("B") || "");
    setFormOptC(map.get("C") || "");
    setFormOptD(map.get("D") || "");
    setFormCorrectKey(q.correctKey);
    setFormExplanation(q.explanation);
    setFormSyllabusRef(q.syllabusReference);
    setFormAbilityTags(q.abilityTags.join(", "));
    setFormReviewed(q.reviewed);
    setErrorMsg(null);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNotice(null);

    const subjObj = subjects.find((s) => s.slug === formSubjectSlug);
    const options = [
      { key: "A" as OptionKey, text: formOptA.trim() },
      { key: "B" as OptionKey, text: formOptB.trim() },
      { key: "C" as OptionKey, text: formOptC.trim() },
      { key: "D" as OptionKey, text: formOptD.trim() },
    ];
    const abilityTags = formAbilityTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editorMode === "create") {
      const res = await fetch("/api/v1/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "single",
          stream: formStream,
          subjectSlug: formSubjectSlug,
          subjectName: subjObj?.name || formSubjectSlug,
          chapterNumber: formChapterNum,
          chapter: formChapter,
          topic: formTopic,
          difficulty: formDifficulty,
          questionText: formStem,
          options,
          correctKey: formCorrectKey,
          explanation: formExplanation,
          syllabusReference: formSyllabusRef,
          abilityTags:
            abilityTags.length > 0 ? abilityTags : ["analytical_thinking"],
          publicationStatus: formReviewed ? "published" : "draft",
          reviewed: formReviewed,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error || "Unable to create question.");
        return;
      }
      setNotice("Created question record.");
    } else if (editorMode === "edit" && editingId) {
      const res = await fetch(
        `/api/v1/admin/questions/${encodeURIComponent(editingId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterNumber: formChapterNum,
            chapter: formChapter,
            topic: formTopic,
            difficulty: formDifficulty,
            questionText: formStem,
            options,
            correctKey: formCorrectKey,
            explanation: formExplanation,
            syllabusReference: formSyllabusRef,
            abilityTags:
              abilityTags.length > 0 ? abilityTags : ["analytical_thinking"],
            reviewed: formReviewed,
          }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error || "Unable to update question.");
        return;
      }
      setNotice(`Updated question ${editingId} (incremented version).`);
    }

    setEditorMode("closed");
    triggerReload();
  };

  const handlePublicationAction = async (
    q: QuestionBankRecord,
    action: "publish" | "unpublish" | "archive",
    confirmReview: boolean = false
  ) => {
    setErrorMsg(null);
    setNotice(null);
    const res = await fetch(
      `/api/v1/admin/questions/${encodeURIComponent(q.id)}/publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewConfirmed: confirmReview,
        }),
      }
    );
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setErrorMsg(data.error || "Publication status change blocked.");
      return;
    }
    setNotice(`Question ${q.id} updated (${action}).`);
    triggerReload();
  };

  const handleBatchImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNotice(null);
    const res = await fetch("/api/v1/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "import",
        format: importFormat,
        content: importContent,
      }),
    });
    const data = (await res.json()) as {
      importedCount?: number;
      updatedCount?: number;
      skippedCount?: number;
      error?: string;
    };
    if (!res.ok) {
      setErrorMsg(data.error || "Batch import failed.");
      return;
    }
    setNotice(
      `Imported ${data.importedCount || 0} new, updated ${
        data.updatedCount || 0
      }, skipped ${data.skippedCount || 0} rows.`
    );
    setShowImportBox(false);
    setImportContent("");
    triggerReload();
  };

  const exportUrl = (fmt: "csv" | "json") => {
    const qs = new URLSearchParams({ export: fmt });
    if (stream) qs.set("stream", stream);
    if (subjectSlug) qs.set("subjectSlug", subjectSlug);
    if (difficulty) qs.set("difficulty", difficulty);
    if (pubStatus) qs.set("publicationStatus", pubStatus);
    return `/api/v1/admin/questions?${qs.toString()}`;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            MSBSHSE Class 11 Repository
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            Question Bank Management ({total})
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={openCreateForm}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Question
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowImportBox((v) => !v)}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import CSV/JSON
          </Button>
          <a
            href={exportUrl("csv")}
            className="inline-flex items-center px-3 py-2 text-xs uppercase tracking-[0.14em] border border-[#CFC5B4] bg-[#FAF7F2] rounded-sm hover:bg-[#F3EDE2]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            CSV
          </a>
          <a
            href={exportUrl("json")}
            className="inline-flex items-center px-3 py-2 text-xs uppercase tracking-[0.14em] border border-[#CFC5B4] bg-[#FAF7F2] rounded-sm hover:bg-[#F3EDE2]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            JSON
          </a>
        </div>
      </header>

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 bg-[#9E6B68]/15 border border-[#9E6B68] rounded-sm text-xs text-[#1C1917]"
        >
          {errorMsg}
        </div>
      )}
      {notice && (
        <div className="p-3.5 bg-[#545E4E]/15 border border-[#545E4E] rounded-sm text-xs text-[#1C1917]">
          {notice}
        </div>
      )}

      {/* Batch Import Panel */}
      {showImportBox && (
        <form
          onSubmit={(e) => void handleBatchImport(e)}
          className="p-6 bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm space-y-4 text-xs"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">
              Batch Import Questions (CSV or JSON)
            </h2>
            <select
              value={importFormat}
              onChange={(e) => setImportFormat(e.target.value as "csv" | "json")}
              className="px-3 py-1.5 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
            >
              <option value="json">JSON Array</option>
              <option value="csv">RFC-4180 CSV</option>
            </select>
          </div>
          <textarea
            required
            rows={6}
            value={importContent}
            onChange={(e) => setImportContent(e.target.value)}
            placeholder={
              importFormat === "json"
                ? '[{"stream":"science","subjectSlug":"sci-physics","chapterNumber":1,"chapter":"Units","topic":"SI","difficulty":"Easy","questionText":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"correctKey":"A","explanation":"...","syllabusReference":"...","abilityTags":["logical_reasoning"],"reviewed":true,"publicationStatus":"published"}]'
                : "id,board,academicYear,standard,stream,subjectSlug,subjectName,chapterNumber,chapter,topic,difficulty,questionText,optionA,optionB,optionC,optionD,correctKey,explanation,syllabusReference,abilityTags,publicationStatus,reviewed,version"
            }
            className="w-full p-3 font-mono text-xs bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowImportBox(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Validate &amp; Import
            </Button>
          </div>
        </form>
      )}

      {/* Question Editor + Live Student Preview */}
      {editorMode !== "closed" && (
        <section className="p-6 bg-[#FAF7F2] border border-[#1C1917] rounded-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-3">
            <h2 className="font-serif text-2xl">
              {editorMode === "create"
                ? "Create Syllabus Question"
                : `Edit Question (${editingId})`}
            </h2>
            <button
              type="button"
              onClick={() => setShowLivePreview((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#545E4E] cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showLivePreview ? "Hide Preview" : "Show Preview"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={(e) => void handleSaveQuestion(e)}
              className={`${
                showLivePreview ? "lg:col-span-7" : "lg:col-span-12"
              } space-y-3 text-xs`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <select
                  value={formStream}
                  disabled={editorMode === "edit"}
                  onChange={(e) => setFormStream(e.target.value as StreamSlug)}
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                >
                  <option value="science">Science</option>
                  <option value="commerce">Commerce</option>
                  <option value="arts">Arts</option>
                </select>

                <select
                  value={formSubjectSlug}
                  disabled={editorMode === "edit"}
                  onChange={(e) => setFormSubjectSlug(e.target.value)}
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                >
                  {subjects.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={formDifficulty}
                  onChange={(e) =>
                    setFormDifficulty(e.target.value as QuestionDifficulty)
                  }
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formChapterNum}
                  onChange={(e) => setFormChapterNum(Number(e.target.value))}
                  placeholder="Ch #"
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                />
                <input
                  required
                  value={formChapter}
                  onChange={(e) => setFormChapter(e.target.value)}
                  placeholder="Chapter Title"
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                />
                <input
                  required
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="Topic"
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                />
              </div>

              <textarea
                required
                rows={3}
                value={formStem}
                onChange={(e) => setFormStem(e.target.value)}
                placeholder="Question stem..."
                className="w-full p-3 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  required
                  value={formOptA}
                  onChange={(e) => setFormOptA(e.target.value)}
                  placeholder="Option A"
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                />
                <input
                  required
                  value={formOptB}
                  onChange={(e) => setFormOptB(e.target.value)}
                  placeholder="Option B"
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                />
                <input
                  required
                  value={formOptC}
                  onChange={(e) => setFormOptC(e.target.value)}
                  placeholder="Option C"
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                />
                <input
                  required
                  value={formOptD}
                  onChange={(e) => setFormOptD(e.target.value)}
                  placeholder="Option D"
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={formCorrectKey}
                  onChange={(e) =>
                    setFormCorrectKey(e.target.value as OptionKey)
                  }
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                >
                  <option value="A">Correct Key: A</option>
                  <option value="B">Correct Key: B</option>
                  <option value="C">Correct Key: C</option>
                  <option value="D">Correct Key: D</option>
                </select>

                <input
                  required
                  value={formSyllabusRef}
                  onChange={(e) => setFormSyllabusRef(e.target.value)}
                  placeholder="Syllabus Reference"
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                />

                <input
                  required
                  value={formAbilityTags}
                  onChange={(e) => setFormAbilityTags(e.target.value)}
                  placeholder="Ability tags (comma-separated)"
                  className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
                />
              </div>

              <textarea
                required
                rows={2}
                value={formExplanation}
                onChange={(e) => setFormExplanation(e.target.value)}
                placeholder="Academic explanation..."
                className="w-full p-3 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
              />

              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formReviewed}
                    onChange={(e) => setFormReviewed(e.target.checked)}
                  />
                  <span className="font-medium text-[#1C1917]">
                    Curator Reviewed (Required to Publish)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditorMode("closed")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Question
                  </Button>
                </div>
              </div>
            </form>

            {/* Live Student Layout Preview */}
            {showLivePreview && (
              <div className="lg:col-span-5 p-5 bg-[#F3EDE2] border border-[#CFC5B4] rounded-sm space-y-4">
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#545E4E] font-semibold block">
                  Live Student Layout Preview
                </span>
                <p className="text-[11px] font-mono text-[#8A8178]">
                  Ch.{formChapterNum}: {formChapter} · {formDifficulty}
                </p>
                <p className="font-serif text-lg text-[#1C1917]">
                  {formStem || "Question stem preview will appear here..."}
                </p>
                <div className="space-y-2 text-xs">
                  {(
                    [
                      ["A", formOptA],
                      ["B", formOptB],
                      ["C", formOptC],
                      ["D", formOptD],
                    ] as const
                  ).map(([k, txt]) => (
                    <div
                      key={k}
                      className={`p-2.5 rounded-sm border ${
                        formCorrectKey === k
                          ? "bg-[#545E4E]/15 border-[#545E4E]"
                          : "bg-[#FAF7F2] border-[#DDD4C5]"
                      }`}
                    >
                      <strong className="font-mono mr-2">{k}.</strong>
                      {txt || `Option ${k}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#FAF7F2] border border-[#DDD4C5] p-4 rounded-sm text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8A8178] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search stem, topic, ID..."
            className="w-full pl-8 pr-2.5 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
          />
        </div>

        <select
          value={stream}
          onChange={(e) => {
            setStream(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
        >
          <option value="">All Streams</option>
          <option value="science">Science</option>
          <option value="commerce">Commerce</option>
          <option value="arts">Arts</option>
        </select>

        <select
          value={subjectSlug}
          onChange={(e) => {
            setSubjectSlug(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={pubStatus}
          onChange={(e) => {
            setPubStatus(e.target.value as PublicationStatus | "");
            setPage(1);
          }}
          className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Question Bank Table */}
      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#8A8178]">
            Querying Question Bank...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8A8178]">
            No questions match the active filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                <th className="py-3 px-4">Question &amp; Chapter</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Diff / Key</th>
                <th className="py-3 px-4">Usage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]">
              {items.map((q) => (
                <tr key={q.id} className="hover:bg-[#F3EDE2]/45">
                  <td className="py-3.5 px-4 max-w-md">
                    <p className="font-serif text-sm text-[#1C1917] line-clamp-2">
                      {q.questionText}
                    </p>
                    <span className="font-mono text-[10px] text-[#8A8178]">
                      {q.id} (v{q.version}) · Ch.{q.chapterNumber}: {q.chapter}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{q.subjectName}</td>
                  <td className="py-3.5 px-4 font-mono">
                    {q.difficulty} · Key {q.correctKey}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{q.usageCount || 0}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-[0.14em] ${
                        q.publicationStatus === "published"
                          ? "bg-[#545E4E]/15 text-[#545E4E]"
                          : "bg-[#E7E0D3] text-[#57524C]"
                      }`}
                    >
                      {q.reviewed && <CheckCircle2 className="w-3 h-3" />}
                      {q.publicationStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEditForm(q)}
                      className="inline-flex items-center gap-1 px-2 py-1 border border-[#CFC5B4] rounded-sm text-[10px] uppercase cursor-pointer hover:bg-[#F3EDE2]"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    {q.publicationStatus === "published" ? (
                      <button
                        type="button"
                        onClick={() =>
                          void handlePublicationAction(q, "unpublish")
                        }
                        className="px-2 py-1 border border-[#9E6B68] text-[#9E6B68] rounded-sm text-[10px] uppercase cursor-pointer"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          void handlePublicationAction(q, "publish", true)
                        }
                        className="px-2 py-1 bg-[#545E4E] text-[#FAF7F2] rounded-sm text-[10px] uppercase cursor-pointer"
                      >
                        Review &amp; Publish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#DDD4C5] bg-[#F3EDE2]/50 flex items-center justify-between text-xs">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-[#8A8178]">
          Loading Question Bank...
        </div>
      }
    >
      <QuestionsBankManagerInner />
    </Suspense>
  );
}
