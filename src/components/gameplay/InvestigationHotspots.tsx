"use client";

import React, { useState } from "react";
import { Search, FileText, Clock, DoorClosed, X, CheckCircle2 } from "lucide-react";
import { DialLockModal } from "./DialLockModal";

export interface Hotspot {
  id: string;
  name: string;
  icon: "desk" | "clock" | "door";
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  title: string;
  description: string;
  evidenceFound?: string;
}

interface InvestigationHotspotsProps {
  hotspots?: Hotspot[];
  onSolveDoor: () => void;
  onClueDiscovered?: (clue: string) => void;
}

const DEFAULT_L1_HOTSPOTS: Hotspot[] = [
  {
    id: "desk",
    name: "Steam Conduit Hatch",
    icon: "desk",
    x: 14,
    y: 54,
    title: "CONDUIT OBSERVATION LOG",
    description:
      "Tucked into the damp junction behind the high-pressure steam valve, you discover a charred maintenance clipboard. A single handwritten line survives:\n\n'Subject 09 calibration index locked at 07:45. Do not deviate.'",
    evidenceFound: "Torn Record: 'Index locked at 07:45'",
  },
  {
    id: "clock",
    name: "Frozen Brass Chronometer",
    icon: "clock",
    x: 35,
    y: 35,
    title: "VINTAGE STATION CLOCK",
    description:
      "A heavy brass-bezeled chronometer bolted to the reinforced masonry. The Roman numerals are sharp, and the hands are frozen immutably at VII and IX: precisely 07:45. A folded yellowed document is tucked behind the left rim.",
    evidenceFound: "Timepiece confirmed stopped at 07:45",
  },
  {
    id: "door",
    name: "Heavy Blast Door & Keypad",
    icon: "door",
    x: 82,
    y: 52,
    title: "ELECTRONIC COMBINATION BOLT",
    description:
      "A massive reinforced vault door secured by an illuminated 4-digit amber keypad and heavy steel locking wheel. Align the correct 4-digit sequence to disengage.",
  },
];

export function InvestigationHotspots({
  hotspots = DEFAULT_L1_HOTSPOTS,
  onSolveDoor,
  onClueDiscovered,
}: InvestigationHotspotsProps) {
  const [activeModal, setActiveModal] = useState<Hotspot | null>(null);
  const [showDialLock, setShowDialLock] = useState<boolean>(false);
  const [discoveredClues, setDiscoveredClues] = useState<string[]>([]);

  const handleInspect = (hotspot: Hotspot) => {
    if (hotspot.id === "door") {
      setShowDialLock(true);
      return;
    }
    setActiveModal(hotspot);
    if (hotspot.evidenceFound && !discoveredClues.includes(hotspot.evidenceFound)) {
      setDiscoveredClues((prev) => [...prev, hotspot.evidenceFound!]);
      if (onClueDiscovered) onClueDiscovered(hotspot.evidenceFound);
    }
  };

  return (
    <>
      {/* Interactive Hotspot Markers on the Stage */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {hotspots.map((h) => (
          <div
            key={h.id}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <button
              type="button"
              onClick={() => handleInspect(h)}
              className="group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
              aria-label={`Inspect ${h.name}`}
            >
              {/* Outer pulsing ping ring */}
              <span className="absolute w-10 h-10 rounded-full bg-amber-400/40 animate-ping opacity-75" />
              {/* Inner glowing pill */}
              <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-zinc-950/90 border-2 border-amber-400 shadow-lg shadow-amber-500/50 text-amber-300">
                {h.icon === "desk" && <FileText className="w-4 h-4" />}
                {h.icon === "clock" && <Clock className="w-4 h-4" />}
                {h.icon === "door" && <DoorClosed className="w-4 h-4" />}
              </span>

              {/* Tooltip on hover */}
              <span className="absolute bottom-full mb-2 hidden group-hover:flex items-center px-2 py-1 bg-zinc-950/95 border border-amber-500/60 rounded text-[11px] font-mono whitespace-nowrap text-amber-200 shadow-md">
                <Search className="w-3 h-3 mr-1 text-amber-400" />
                Inspect {h.name}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Clue inspection modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-amber-400 font-serif font-bold text-lg">
              <Search className="w-5 h-5" />
              <span>{activeModal.title}</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 whitespace-pre-line leading-relaxed mb-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 font-sans">
              {activeModal.description}
            </p>

            {activeModal.evidenceFound && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-lg mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Evidence Logged: {activeModal.evidenceFound}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              RETURN TO CELL
            </button>
          </div>
        </div>
      )}

      {/* 4-digit Combination Dial Lock */}
      {showDialLock && (
        <DialLockModal
          correctCode="0745"
          onClose={() => setShowDialLock(false)}
          onSuccess={() => {
            setShowDialLock(false);
            onSolveDoor();
          }}
        />
      )}
    </>
  );
}

