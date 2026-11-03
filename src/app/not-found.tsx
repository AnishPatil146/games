import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-lg w-full text-center space-y-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8178]">
            404 — Unindexed Folio
          </p>
          <h1 className="font-serif text-4xl text-[#1C1917]">
            This corridor is unwritten.
          </h1>
          <p className="text-sm text-[#57524C] leading-relaxed max-w-md mx-auto">
            The address you followed does not correspond to an active chapter or
            session record.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button variant="primary" size="md">
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

