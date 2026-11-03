"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AcademicSubjectConfig, StreamSlug } from "@/lib/platform-types";
import { Button } from "@/components/Button";

interface SubjectRow extends AcademicSubjectConfig {
  publishedQuestionCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export default function AdminSubjectsManagerPage() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newSlug, setNewSlug] = useState("");
  const [newStream, setNewStream] = useState<StreamSlug>("science");
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newElective, setNewElective] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/v1/admin/subjects");
      if (res.ok) {
        const json = (await res.json()) as { subjects: SubjectRow[] };
        setSubjects(json.subjects || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const res = await fetch("/api/v1/admin/subjects");
        if (res.ok) {
          const json = (await res.json()) as { subjects: SubjectRow[] };
          if (active) setSubjects(json.subjects || []);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void init();
    return () => {
      active = false;
    };
  }, []);

  const handleToggleSubject = async (
    subj: SubjectRow,
    patch: { active?: boolean; isElective?: boolean }
  ) => {
    setStatusMsg(null);
    const res = await fetch("/api/v1/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: subj.slug,
        stream: subj.stream,
        name: subj.name,
        code: subj.code,
        description: subj.description,
        isElective:
          patch.isElective !== undefined ? patch.isElective : subj.isElective,
        active: patch.active !== undefined ? patch.active : subj.active,
      }),
    });
    if (res.ok) {
      setStatusMsg(`Updated configuration for ${subj.name}.`);
      await fetchSubjects();
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const res = await fetch("/api/v1/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: newSlug.trim().toLowerCase(),
        stream: newStream,
        name: newName.trim(),
        code: newCode.trim(),
        description: newDesc.trim(),
        isElective: newElective,
        active: true,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setStatusMsg(data.error || "Unable to create subject.");
      return;
    }
    setStatusMsg(`Added configurable subject '${newName.trim()}'.`);
    setShowAddForm(false);
    setNewSlug("");
    setNewName("");
    setNewCode("");
    setNewDesc("");
    await fetchSubjects();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDD4C5] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#545E4E] font-semibold">
            Academic Catalogue Architecture
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] mt-1">
            Subjects &amp; Electives Configuration
          </h1>
          <p className="text-xs text-[#57524C] mt-1">
            Manage MSBSHSE Class 11 core subjects and optional electives without
            redeploying code.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setShowAddForm((v) => !v)}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Elective / Subject
        </Button>
      </header>

      {statusMsg && (
        <div className="p-3.5 bg-[#F3EDE2] border border-[#CFC5B4] rounded-sm text-xs text-[#1C1917]">
          {statusMsg}
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={(e) => void handleCreateSubject(e)}
          className="p-6 bg-[#FAF7F2] border border-[#CFC5B4] rounded-sm space-y-4 text-xs"
        >
          <h2 className="font-serif text-xl text-[#1C1917]">
            Register New Subject or Elective
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              required
              placeholder="Slug (e.g. sci-it)"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
            />
            <select
              value={newStream}
              onChange={(e) => setNewStream(e.target.value as StreamSlug)}
              className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
            >
              <option value="science">Science</option>
              <option value="commerce">Commerce</option>
              <option value="arts">Arts</option>
            </select>
            <input
              required
              placeholder="Subject Name (e.g. Information Technology)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
            />
            <input
              required
              placeholder="Board Code (e.g. 97)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
            />
          </div>
          <input
            required
            placeholder="Editorial syllabus description..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 bg-[#F6F3EC] border border-[#DDD4C5] rounded-sm"
          />
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newElective}
                onChange={(e) => setNewElective(e.target.checked)}
              />
              <span>Classify as Optional Elective</span>
            </label>
            <Button type="submit" size="sm">
              Save Subject
            </Button>
          </div>
        </form>
      )}

      <div className="bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm overflow-x-auto">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#8A8178]">
            Loading Academic Subjects...
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3EDE2] border-b border-[#DDD4C5] text-[10px] uppercase tracking-[0.2em] text-[#57524C]">
                <th className="py-3 px-4">Subject &amp; Code</th>
                <th className="py-3 px-4">Stream</th>
                <th className="py-3 px-4">Difficulty Split (E/M/H)</th>
                <th className="py-3 px-4">Elective</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]">
              {subjects.map((subj) => (
                <tr key={subj.slug} className="hover:bg-[#F3EDE2]/50">
                  <td className="py-3.5 px-4">
                    <span className="font-serif text-base text-[#1C1917] block">
                      {subj.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#8A8178]">
                      {subj.slug} · Code {subj.code} · {subj.chapters.length} ch.
                    </span>
                  </td>
                  <td className="py-3.5 px-4 capitalize">{subj.stream}</td>
                  <td className="py-3.5 px-4 font-mono">
                    {subj.publishedQuestionCount} pub ({subj.easyCount}E /{" "}
                    {subj.mediumCount}M / {subj.hardCount}H)
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() =>
                        void handleToggleSubject(subj, {
                          isElective: !subj.isElective,
                        })
                      }
                      className="px-2 py-0.5 border border-[#CFC5B4] rounded-sm text-[10px] uppercase tracking-[0.14em] cursor-pointer"
                    >
                      {subj.isElective ? "Elective" : "Core"}
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-[0.16em] ${
                        subj.active
                          ? "bg-[#545E4E]/15 text-[#545E4E]"
                          : "bg-[#9E6B68]/15 text-[#9E6B68]"
                      }`}
                    >
                      {subj.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        void handleToggleSubject(subj, { active: !subj.active })
                      }
                      className="px-2.5 py-1 bg-[#1C1917] text-[#FAF7F2] rounded-sm text-[10px] uppercase tracking-[0.16em] cursor-pointer"
                    >
                      {subj.active ? "Disable" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
