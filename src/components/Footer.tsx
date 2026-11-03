import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#DDD4C5] bg-[#FAF7F2] py-10 mt-auto">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#57524C] gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
          <span className="font-serif italic text-sm text-[#1C1917]">
            The Unwritten
          </span>
          <span className="hidden sm:inline text-[#DDD4C5]">/</span>
          <span className="text-[11px] tracking-[0.06em] text-[#8A8178]">
            Interactive Narrative Monograph · Fictional Behavioral Exploration
          </span>
        </div>

        <div className="flex items-center space-x-6 text-[11px] uppercase tracking-[0.18em]">
          <Link
            href="/play"
            className="text-[#57524C] hover:text-[#1C1917] transition-colors"
          >
            Begin
          </Link>
          <Link
            href="/privacy"
            className="text-[#57524C] hover:text-[#1C1917] transition-colors"
          >
            Privacy &amp; Data Governance
          </Link>
        </div>
      </div>
    </footer>
  );
}
