"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route boundary error:", error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full border border-[#DDD4C5] bg-[#F3EDE2]/60 p-8 sm:p-10 text-center space-y-5 rounded-sm">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#9E6B68]">
            Interrupted Passage
          </p>
          <h1 className="font-serif text-3xl text-[#1C1917]">
            A page failed to render cleanly.
          </h1>
          <p className="text-sm text-[#57524C] leading-relaxed">
            Your recorded session choices remain intact. You may retry this
            scene or return to the opening threshold.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={reset} variant="primary" size="md">
              Retry Passage
            </Button>
            <Link href="/">
              <Button variant="secondary" size="md">
                Return to Threshold
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

