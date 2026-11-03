import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#DDD4C5] bg-[#FAF7F2] py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-[#57524C] gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-serif italic text-base text-[#1C1917]">
              THE UNWRITTEN
            </span>
            <span className="text-[#DDD4C5]">/</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#8A8178]">
              An experiment in human curiosity.
            </span>
          </div>
          <p className="text-[11px] text-[#8A8178] leading-relaxed max-w-xl">
            Senior Narrative Monograph &amp; Junior Class 11 Reasoning Studio.
            All reflections and profiles are game-generated interpretations — not
            clinical, psychological, or board-endorsed assessments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.18em]">
          <Link
            href="/play"
            className="text-[#57524C] hover:text-[#1C1917] transition-colors"
          >
            Senior Mode
          </Link>
          <Link
            href="/junior"
            className="text-[#57524C] hover:text-[#1C1917] transition-colors"
          >
            Junior Mode
          </Link>
          <Link
            href="/privacy"
            className="text-[#57524C] hover:text-[#1C1917] transition-colors"
          >
            Privacy &amp; Deletion
          </Link>
          <a
            href="mailto:anishpatil146@gmail.com"
            className="text-[#8A8178] hover:text-[#1C1917] transition-colors lowercase tracking-normal font-mono text-[11px]"
          >
            anishpatil146@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
