import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E8E2D8] bg-[#FAF8F5] py-10 mt-auto">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
        <div>
          <span className="font-serif italic mr-2">The Unwritten</span>
          <span>© {new Date().getFullYear()} — An Interactive Narrative Experiment</span>
        </div>

        <div className="flex items-center space-x-6 text-[11px] uppercase tracking-wider">
          <Link
            href="/privacy"
            className="hover:text-[#1C1917] transition-colors underline-offset-4 hover:underline"
          >
            Privacy & Ethics
          </Link>
          <span className="text-[#D6D3D1]">•</span>
          <Link
            href="/admin/login"
            className="hover:text-[#1C1917] transition-colors underline-offset-4 hover:underline"
          >
            Admin Access
          </Link>
        </div>
      </div>
    </footer>
  );
}

