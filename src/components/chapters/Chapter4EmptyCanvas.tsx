"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, Check, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/Button";

interface Chapter4Props {
  onComplete: (data: {
    selectedObjects: string[];
    mood: string;
    compositionTitle: string;
  }) => void;
  onEvent: (eventType: string, data: Record<string, unknown>) => void;
  onPreference: (category: string, value: string) => void;
}

interface CanvasObject {
  id: string;
  name: string;
  subtitle: string;
  symbol: string;
  meaning: string;
}

const AVAILABLE_OBJECTS: CanvasObject[] = [
  {
    id: "astrolabe",
    name: "Celestial Astrolabe",
    subtitle: "Brass navigation circles",
    symbol: "✦",
    meaning: "Yearning for cosmic order and distant horizons",
  },
  {
    id: "wild_rose",
    name: "Pressed Wild Rose",
    subtitle: "Dried petals from an old garden",
    symbol: "⚘",
    meaning: "Quiet reverence for memory and the beauty of decay",
  },
  {
    id: "antique_key",
    name: "Unmarked Iron Key",
    subtitle: "Ornate antique warding",
    symbol: "🗝",
    meaning: "Belief in undisclosed doors and hidden possibilities",
  },
  {
    id: "crystal_prism",
    name: "Faceted Glass Prism",
    subtitle: "Splits white light into spectrums",
    symbol: "◇",
    meaning: "Appreciation for perspective and fractured truths",
  },
  {
    id: "unsent_letter",
    name: "Wax-Sealed Letter",
    subtitle: "Yellowed folded parchment",
    symbol: "✉",
    meaning: "Emotion withheld, conversations waiting for courage",
  },
  {
    id: "hourglass",
    name: "Obsidian Hourglass",
    subtitle: "Fine black sand in blown glass",
    symbol: "⌛",
    meaning: "Acute awareness of passing time and deliberate pacing",
  },
];

const MOODS = [
  {
    id: "nocturne",
    label: "Nocturne Solitude",
    bg: "bg-[#1E2022] text-[#F3EFE6]",
    canvasStyle: "border-[#4A4E53] bg-[#1A1C1E]",
    description: "Deep shadows, velvet dark, and quiet contemplation.",
  },
  {
    id: "gilded",
    label: "Gilded Memory",
    bg: "bg-[#EFE7D8] text-[#3D352E]",
    canvasStyle: "border-[#C9BAA3] bg-[#F7F2E8]",
    description: "Warm amber undertones, nostalgic morning glow.",
  },
  {
    id: "clarity",
    label: "Architectural Clarity",
    bg: "bg-[#FAF8F5] text-[#1C1917]",
    canvasStyle: "border-[#D6D3D1] bg-[#FFFFFF]",
    description: "Pure geometry, restrained lines, and disciplined light.",
  },
  {
    id: "botanical",
    label: "Quiet Overgrowth",
    bg: "bg-[#E7EBE4] text-[#2F392B]",
    canvasStyle: "border-[#B2BFA9] bg-[#EEF2EC]",
    description: "Subtle olive moss, earthy calm, and living air.",
  },
];

export function Chapter4EmptyCanvas({
  onComplete,
  onEvent,
  onPreference,
}: Chapter4Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedMoodId, setSelectedMoodId] = useState<string>("clarity");
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    onEvent("chapter_started", { chapter: 4, title: "The Empty Canvas" });
  }, [onEvent]);

  const toggleObject = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleFinalize = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const chosenObjects = AVAILABLE_OBJECTS.filter((o) =>
      selectedIds.includes(o.id)
    );
    const chosenMood = MOODS.find((m) => m.id === selectedMoodId)!;

    // Save preferences
    chosenObjects.forEach((obj) => {
      onPreference("canvas_object", obj.name);
    });
    onPreference("canvas_mood", chosenMood.label);

    onEvent("choice_selected", {
      chapter: 4,
      selectedObjects: chosenObjects.map((o) => o.name),
      mood: chosenMood.label,
      durationMs: elapsed,
    });

    setIsFinalized(true);
  };

  const handleProceed = () => {
    const chosenObjects = AVAILABLE_OBJECTS.filter((o) =>
      selectedIds.includes(o.id)
    );
    const chosenMood = MOODS.find((m) => m.id === selectedMoodId)!;
    const title = `${chosenMood.label} with ${chosenObjects.map((o) => o.name).join(" & ")}`;

    onComplete({
      selectedObjects: chosenObjects.map((o) => o.name),
      mood: chosenMood.label,
      compositionTitle: title,
    });
  };

  const currentMood = MOODS.find((m) => m.id === selectedMoodId)!;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E8E2D8] pb-6">
        <div className="flex items-center space-x-2 text-[#78716C] text-xs uppercase tracking-[0.2em]">
          <Palette className="w-3.5 h-3.5" />
          <span>The Atelier • The Blank Canvas</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal">
          The Empty Canvas
        </h2>
        <p className="text-xs sm:text-sm text-[#78716C] italic font-serif">
          A linen canvas stretched upon an easel. Arrange up to three artifacts to compose your scene.
        </p>
      </div>

      {/* Canvas Area Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#78716C]">
          <span>Arrangement Preview ({selectedIds.length} of 3 selected)</span>
          <span>Atmosphere: {currentMood.label}</span>
        </div>

        <div
          className={`w-full min-h-[220px] sm:min-h-[260px] rounded border-2 border-dashed p-6 flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden shadow-inner ${currentMood.canvasStyle}`}
        >
          {selectedIds.length === 0 ? (
            <div className="text-center space-y-2">
              <Sparkles className="w-6 h-6 mx-auto text-[#8C827A] opacity-60" />
              <p className="text-xs uppercase tracking-widest text-[#8C827A]">
                The canvas is empty. Select objects below to begin.
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 z-10"
            >
              {selectedIds.map((id) => {
                const item = AVAILABLE_OBJECTS.find((o) => o.id === id)!;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center text-center p-3 rounded bg-white/70 backdrop-blur-sm border border-stone-200 shadow-sm max-w-[130px]"
                  >
                    <span className="text-2xl mb-1">{item.symbol}</span>
                    <span className="text-xs font-semibold text-[#1C1917] line-clamp-1">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[#78716C] italic line-clamp-1">
                      {item.subtitle}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mood Selector */}
      {!isFinalized && (
        <div className="space-y-3">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#78716C]">
            Select Tonal Atmosphere
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMoodId(m.id)}
                className={`p-3 text-left rounded border transition-all text-xs ${
                  selectedMoodId === m.id
                    ? "border-[#1C1917] bg-[#FAF8F5] shadow-sm font-semibold"
                    : "border-[#E0D7CB] bg-[#F4EFE7]/50 hover:border-[#8C827A]"
                }`}
              >
                <span className="block uppercase tracking-wider text-[11px] mb-0.5">
                  {m.label}
                </span>
                <span className="block text-[10px] text-[#78716C] line-clamp-1">
                  {m.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Object Palette */}
      {!isFinalized ? (
        <div className="space-y-3 pt-2">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#78716C]">
            Choose Up to 3 Relics
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_OBJECTS.map((obj) => {
              const isSelected = selectedIds.includes(obj.id);
              const isDisabled = !isSelected && selectedIds.length >= 3;

              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => toggleObject(obj.id)}
                  disabled={isDisabled}
                  className={`p-4 rounded border text-left transition-all ${
                    isSelected
                      ? "border-[#1C1917] bg-[#FAF8F5] shadow-sm"
                      : isDisabled
                      ? "border-[#E0D7CB] bg-[#F4EFE7]/30 opacity-40 cursor-not-allowed"
                      : "border-[#E0D7CB] bg-[#FAF8F5] hover:bg-[#F4EFE7] hover:border-[#8C827A]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{obj.symbol}</span>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-[#1C1917] text-[#FAF8F5]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
                    {obj.name}
                  </h4>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    {obj.meaning}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleFinalize}
              disabled={selectedIds.length === 0}
            >
              FINALIZE COMPOSITION
            </Button>
          </div>
        </div>
      ) : (
        /* Finalized Outcome & Interpretation */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded border border-[#E0D7CB] bg-[#F4EFE7] space-y-4"
        >
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#5B6356] font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>The Scene Speaks</span>
          </div>

          <div className="text-sm font-serif text-[#292524] leading-relaxed space-y-2">
            <p>
              Under the {currentMood.label.toLowerCase()} atmosphere, you placed{" "}
              {selectedIds
                .map((id) => AVAILABLE_OBJECTS.find((o) => o.id === id)?.name)
                .join(", ")}
              .
            </p>
            <p>
              Your composition suggests a player sensitive to narrative tension
              and atmospheric resonance. Rather than filling empty space with
              indiscriminate noise, you chose deliberate emotional anchors.
            </p>
          </div>

          <div className="pt-3 flex justify-end">
            <Button variant="primary" size="md" onClick={handleProceed}>
              <span>PROCEED TO CHAPTER 05</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

