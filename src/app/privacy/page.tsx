"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";

export default function PrivacyGovernancePage() {
  const [identifier, setIdentifier] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleDeletionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (identifier.trim().length < 2) {
      setFeedback({
        type: "error",
        message:
          "Please provide the display name, Instagram handle, or session ID you wish to erase.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/privacy/deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          reason: reason.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit deletion request.");
      }
      setFeedback({
        type: "success",
        message:
          data.message ||
          "Your deletion request has been logged for review and permanent removal.",
      });
      setIdentifier("");
      setReason("");
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong submitting your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] paper-grain">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-14 sm:py-20 space-y-12">
        <header className="space-y-3 border-b border-[#DDD4C5] pb-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8178]">
            Privacy, Ethics &amp; Data Governance
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#1C1917]">
            Transparent by design.
          </h1>
          <p className="text-sm sm:text-base text-[#57524C] leading-relaxed">
            THE UNWRITTEN collects only the minimum gameplay telemetry required
            to render your six-chapter narrative report, with voluntary identity
            and straightforward erasure.
          </p>
        </header>

        <div className="space-y-8 text-sm text-[#1C1917] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#1C1917]">
              1. Optional Personal Details
            </h2>
            <p className="text-[#57524C]">
              Providing a Display Name or Instagram handle before Chapter 01 is{" "}
              <strong>entirely optional</strong>, and requires checking an
              explicit consent box before submission. Visitors who choose{" "}
              <em>Continue Anonymously</em> experience the exact same story,
              puzzles, and personalized final report without submitting any name
              or social handle.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#1C1917]">
              2. Gameplay Events &amp; Session Cookies
            </h2>
            <p className="text-[#57524C]">
              During a playthrough, we record structured chapter events—such as
              chapter starts, selected story branches, clues inspected, puzzle
              attempt counts, hint usage, response timing, creative studio
              selections, and optional referral campaign tags (such as{" "}
              <code>utm_source</code>). An encrypted <code>httpOnly</code>{" "}
              session token cookie binds your in-progress chapters to your
              browser so refreshing a page preserves your place and prevents
              others from guessing your report URL. We do not log or persist raw
              IP addresses in our database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#1C1917]">
              3. Access Control &amp; Retention
            </h2>
            <p className="text-[#57524C]">
              Submitted player profiles and session records are never sold,
              shared with advertising networks, or listed publicly. Database
              Row-Level Security restricts administrative review exclusively to
              the single authenticated project curator. Records are retained
              solely to maintain report links and aggregate story analytics, and
              are permanently purged upon verified deletion request.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#1C1917]">
              4. Non-Clinical Fictional Scope
            </h2>
            <p className="text-[#57524C]">
              THE UNWRITTEN is an artistic work of interactive fiction. Its
              seven archetypes summarize stylistic choices inside fictional
              scenarios and must never be interpreted as clinical, medical,
              cognitive, IQ, or psychological assessments.
            </p>
          </section>
        </div>

        {/* Interactive Personal Data Deletion Request Form */}
        <section
          aria-labelledby="deletion-heading"
          className="p-6 sm:p-8 bg-[#F3EDE2]/80 border border-[#DDD4C5] rounded-sm space-y-5"
        >
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#9E6B68] font-semibold">
              Right to Erasure
            </p>
            <h2
              id="deletion-heading"
              className="font-serif text-2xl text-[#1C1917]"
            >
              Request Deletion of Personal Data
            </h2>
            <p className="text-xs text-[#57524C] leading-relaxed">
              Submitted a display name or Instagram handle and want your record
              removed? Submit your identifier below and the curator queue will
              permanently erase matching profile and session entries.
            </p>
          </div>

          <form
            onSubmit={(e) => void handleDeletionRequest(e)}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="erasure-identifier"
                className="block text-[11px] uppercase tracking-[0.18em] text-[#57524C] mb-1.5"
              >
                Display Name, @Instagram Handle, or Session ID
              </label>
              <input
                id="erasure-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. @username or session UUID"
                maxLength={120}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div>
              <label
                htmlFor="erasure-notes"
                className="block text-[11px] uppercase tracking-[0.18em] text-[#57524C] mb-1.5"
              >
                Additional Context{" "}
                <span className="text-[#8A8178] normal-case">(optional)</span>
              </label>
              <textarea
                id="erasure-notes"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                placeholder="Approximate date played or verification note"
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#DDD4C5] rounded-sm text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            {feedback && (
              <p
                role="status"
                className={`text-xs px-4 py-3 rounded-sm border ${
                  feedback.type === "success"
                    ? "bg-[#E9ECE6] text-[#545E4E] border-[#545E4E]/30"
                    : "bg-[#F5EBEA] text-[#9E6B68] border-[#9E6B68]/30"
                }`}
              >
                {feedback.message}
              </p>
            )}

            <Button type="submit" size="md" disabled={isSubmitting}>
              {isSubmitting
                ? "Logging Request..."
                : "Submit Deletion Request"}
            </Button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
