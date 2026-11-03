"use client";

import Link from "next/link";
import { useState } from "react";
import { Volume2, VolumeX, ShieldCheck } from "lucide-react";

interface HeaderProps {
  currentChapter?: number;
  totalChapters?: number;
  hideNav?: boolean;
}

export function Header({
  currentChapter,
  totalChapters = 6,
  hideNav = false,
}: HeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className="w-full border-b border-[#E8E2D8] bg-[#FAF8F5]/90 backdrop-blur-sm sticky top-0 z-40 transition-colors">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center space-x-2 text-[#1C1917] transition-opacity hover:opacity-75"
        >
          <span className="text-xs uppercase tracking-[0.25em] font-medium text-[#78716C] group-hover:text-[#1C1917] transition-colors">
            THE UNWRITTEN
          </span>
        </Link>

        {/* Chapter Progress */}
        {currentChapter !== undefined && currentChapter > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C]">
              Chapter 0{currentChapter}
            </span>
            <div className="hidden sm:flex items-center space-x-1">
              {Array.from({ length: totalChapters }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 w-4 rounded-full transition-all duration-300 ${
                    idx + 1 === currentChapter
                      ? "bg-[#1C1917] w-6"
                      : idx + 1 < currentChapter
                      ? "bg-[#5B6356]"
                      : "bg-[#E0D7CB]"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        {!hideNav && (
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute audio" : "Enable atmospheric audio"}
              className="p-2 text-[#78716C] hover:text-[#1C1917] transition-colors rounded-full hover:bg-[#F2ECE2]"
              aria-label="Toggle ambient atmosphere"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#5B6356]" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <Link
              href="/privacy"
              title="Privacy & Methodology"
              className="p-2 text-[#78716C] hover:text-[#1C1917] transition-colors rounded-full hover:bg-[#F2ECE2]"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

