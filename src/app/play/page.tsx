"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Check, ArrowRight, Shield, AlertCircle } from "lucide-react";
import { useGameSession } from "@/lib/useGameSession";
import { CharacterPresentation } from "@/lib/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";

export default function PlayIntroPage() {
  const router = useRouter();
  const { session, submitProfile, setPresentation, trackEvent } =
    useGameSession();

  const [presentationChoice, setPresentationChoice] =
    useState<CharacterPresentation>("UNSPECIFIED");
  const [displayName, setDisplayName] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async (anonymous: boolean = false) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      if (!anonymous && displayName.trim()) {
        if (!consentGiven) {
          setErrorMsg(
            "Please confirm your consent to save your profile details."
          );
          setIsSubmitting(false);
          return;
        }

        await submitProfile(
          displayName.trim(),
          instagramUsername.trim() || undefined,
          true,
          presentationChoice
        );
      } else {
        // Anonymous gameplay
        setPresentation(presentationChoice);
        await trackEvent(0, "game_started", {
          anonymous: true,
          presentation: presentationChoice,
        });
      }

      router.push("/play/1");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start experience");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <Header />

      <main className="flex-1 max-w-xl mx-auto px-6 py-12 sm:py-16 w-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#78716C]">
              Before You Enter
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#1C1917] font-normal">
              Prologue & Presence
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] max-w-md mx-auto leading-relaxed pt-1">
              Select your presentation preference and choose how you wish to
              appear in the archives.
            </p>
          </div>

          {/* Section 1: Character Presentation */}
          <div className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7]/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-[0.16em] font-medium text-[#1C1917]">
                Visual Presentation
              </label>
              <span className="text-[10px] uppercase tracking-wider text-[#8C827A]">
                Aesthetic Only
              </span>
            </div>
            <p className="text-xs text-[#78716C] leading-relaxed">
              This choice is purely visual and does not alter narrative
              interpretation or puzzle difficulty.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { id: "HIM" as CharacterPresentation, label: "HIM" },
                { id: "HER" as CharacterPresentation, label: "HER" },
                {
                  id: "UNSPECIFIED" as CharacterPresentation,
                  label: "NEITHER / NEUTRAL",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPresentationChoice(opt.id)}
                  className={`py-3 px-3 text-xs uppercase tracking-wider border rounded transition-all text-center ${
                    presentationChoice === opt.id
                      ? "border-[#1C1917] bg-[#1C1917] text-[#FAF8F5] font-semibold"
                      : "border-[#D6D3D1] bg-[#FAF8F5] text-[#57534E] hover:border-[#8C827A]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Optional Player Profile */}
          <div className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7]/60 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-[0.16em] font-medium text-[#1C1917]">
                  Traveler Profile (Optional)
                </label>
                <span className="text-[10px] uppercase tracking-wider text-[#5B6356] bg-[#EDF0EB] px-2 py-0.5 rounded">
                  Voluntary
                </span>
              </div>
              <p className="text-xs text-[#78716C] leading-relaxed">
                If you wish, personalize your final gameplay report with your
                name or handle. You may also proceed entirely anonymously.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#57534E] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Julian or Traveler"
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#D6D3D1] rounded focus:outline-none focus:border-[#1C1917] transition-colors placeholder:text-[#A8A29E]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#57534E] mb-1">
                  Instagram Handle (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm text-[#A8A29E]">
                    @
                  </span>
                  <input
                    type="text"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="username"
                    maxLength={40}
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#D6D3D1] rounded focus:outline-none focus:border-[#1C1917] transition-colors placeholder:text-[#A8A29E]"
                  />
                </div>
              </div>

              {/* Consent Box */}
              {displayName.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-2"
                >
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded border border-[#E0D7CB] bg-[#FAF8F5]">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#8C827A] text-[#1C1917] focus:ring-0"
                    />
                    <span className="text-xs text-[#57534E] leading-relaxed">
                      I understand that voluntarily submitted profile details
                      and recorded gameplay choices are stored and viewable by
                      the experience administrator.
                    </span>
                  </label>
                </motion.div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded bg-[#F7EFEF] border border-[#D9B8B6] text-[#7D4F4F] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {displayName.trim().length > 0 ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleStart(false)}
                disabled={isSubmitting || !consentGiven}
                className="w-full"
              >
                {isSubmitting ? "BEGINNING..." : "BEGIN JOURNEY AS " + displayName.toUpperCase()}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleStart(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "BEGINNING..." : "BEGIN ANONYMOUSLY"}
              </Button>
            )}

            {displayName.trim().length > 0 && (
              <button
                type="button"
                onClick={() => handleStart(true)}
                className="w-full text-center text-xs text-[#78716C] hover:text-[#1C1917] py-2 transition-colors underline-offset-4 hover:underline"
              >
                Or skip profile and continue anonymously
              </button>
            )}
          </div>

          {/* Privacy Note */}
          <div className="flex items-center justify-center space-x-2 text-[11px] text-[#8C827A] pt-2">
            <Shield className="w-3.5 h-3.5 text-[#5B6356]" />
            <span>No automatic tracking. No covert fingerprinting.</span>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

