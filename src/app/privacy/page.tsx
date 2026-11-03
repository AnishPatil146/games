import Link from "next/link";
import { ShieldCheck, EyeOff, Lock, FileText, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-12 sm:py-16 w-full space-y-10">
        {/* Header */}
        <div className="space-y-3 border-b border-[#E8E2D8] pb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs uppercase tracking-wider text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Return to Experience</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1C1917] font-normal">
            Privacy & Methodology
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] italic font-serif">
            Transparency regarding data collection, storage, and interpretive ethics.
          </p>
        </div>

        {/* Core Principles */}
        <div className="space-y-6 text-sm text-[#292524] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1917] flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-[#5B6356]" />
              <span>1. Zero Covert Tracking</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E]">
              THE UNWRITTEN does not employ browser canvas fingerprinting, biometric
              tracking, covert keystroke logging, or clandestine third-party
              marketing scripts. Arriving from an Instagram Story link does not and
              cannot automatically expose your identity or account credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1917] flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#5B6356]" />
              <span>2. Voluntary Profile Details</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E]">
              Before entering, travelers may choose to play entirely anonymously
              or optionally provide a display name and Instagram handle. If
              provided, this information is stored alongside your in-game choices
              and is solely accessible by the administrator to review participation
              and curate personal narrative reports.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1917] flex items-center space-x-2">
              <Lock className="w-4 h-4 text-[#5B6356]" />
              <span>3. Data Storage & Security</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E]">
              All persisted gameplay data is housed in a secure Supabase PostgreSQL
              database with strict server-side validation and Row Level Security
              (RLS) policies. Other players cannot query the database or access
              the records of fellow participants.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1917] flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#5B6356]" />
              <span>4. Interpretive Disclaimer</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E]">
              The narrative archetypes (The Observer, The Strategist, The Creative
              Soul, etc.) are deterministic game outcomes derived solely from your
              fictional choices within these six chapters. They do not claim to
              measure psychological health, clinical personality traits, or
              cognitive aptitude.
            </p>
          </section>
        </div>

        {/* Consent Summary Box */}
        <div className="p-5 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-2 text-xs text-[#57534E]">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-[#1C1917] block">
            Summary for Travelers
          </span>
          <p>
            You have full sovereignty. You may explore without registering, inspect
            every mystery, and receive your personal dossier without providing any
            personally identifiable information.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/play"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2F2B28] transition-colors rounded"
          >
            ENTER THE EXPERIENCE
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

