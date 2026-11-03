"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/Button";
import { ArtifactVectorGlyph } from "@/components/artwork/SceneArtwork";
import { EventType } from "@/lib/types";

interface Chapter4Props {
  onTrackEvent: (
    eventType: EventType,
    data?: Record<string, unknown>
  ) => Promise<unknown>;
  onSavePreference: (category: string, value: string) => Promise<unknown>;
  onComplete: () => void;
}

const STUDIO_OBJECTS = [
  { id: "astrolabe", label: "Brass Astrolabe", note: "Navigation & measure" },
  { id: "wild_rose", label: "Dried Wild Rose", note: "Ephemeral memory" },
  { id: "antique_key", label: "Heavy Iron Key", note: "Unopened threshold" },
  { id: "crystal_prism", label: "Glass Prism", note: "Refracted clarity" },
  { id: "unsent_letter", label: "Unsent Letter", note: "Unspoken regard" },
  { id: "hourglass", label: "Sand Hourglass", note: "Measured interval" },
];

const PALETTES = [
  {
    id: "Warm Ivory Linen",
    bg: "#FAF7F2",
    frame: "#DDD4C5",
    ink: "#1C1917",
    accent: "#8A8178",
  },
  {
    id: "Nocturne Umber",
    bg: "#181512",
    frame: "#4A4138",
    ink: "#FAF7F2",
    accent: "#C8B28E",
  },
  {
    id: "Raw Ochre",
    bg: "#EFE4CE",
    frame: "#C9B795",
    ink: "#26201A",
    accent: "#7E6747",
  },
  {
    id: "Celadon Mist",
    bg: "#E6ECE5",
    frame: "#B5C2B2",
    ink: "#1F261E",
    accent: "#545E4E",
  },
];

const ARRANGEMENTS = [
  { id: "Golden Ratio", subtitle: "Asymmetric focal balance" },
  { id: "Centered Totem", subtitle: "Vertical monolithic axis" },
  { id: "Horizon Triptych", subtitle: "Measured lateral cadence" },
];

export function Chapter4EmptyCanvas({
  onTrackEvent,
  onSavePreference,
  onComplete,
}: Chapter4Props) {
  const prefersReducedMotion = useReducedMotion();
  const mountTimeRef = useRef<number>(0);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPaletteId, setSelectedPaletteId] =
    useState<string>("Warm Ivory Linen");
  const [arrangement, setArrangement] = useState<string>("Golden Ratio");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    mountTimeRef.current = performance.now();
  }, []);

  const activePalette =
    PALETTES.find((p) => p.id === selectedPaletteId) || PALETTES[0];

  const toggleObject = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const promoteToFocal = (id: string) => {
    setSelectedIds((prev) => [id, ...prev.filter((item) => item !== id)]);
  };

  const isCompleteReady = selectedIds.length === 3;

  const handleConfirmComposition = async () => {
    if (!isCompleteReady || isSaving) return;
    setIsSaving(true);

    const chosenLabels = selectedIds.map(
      (id) => STUDIO_OBJECTS.find((o) => o.id === id)?.label || id
    );

    for (const label of chosenLabels) {
      await onSavePreference("canvas_object", label);
    }
    await onSavePreference("canvas_mood", selectedPaletteId);
    await onSavePreference("canvas_arrangement", arrangement);

    const durationMs = Math.max(
      100,
      Math.round(performance.now() - mountTimeRef.current)
    );

    await onTrackEvent("choice_selected", {
      choiceId: selectedPaletteId,
      mood: selectedPaletteId,
      arrangement,
      objects: chosenLabels,
      durationMs,
    });

    await onTrackEvent("chapter_completed", {
      objects: chosenLabels,
      palette: selectedPaletteId,
      arrangement,
      durationMs,
    });

    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#DDD4C5] pb-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Chapter 04 · North Skylight Atelier</span>
          <span className="font-mono text-[#545E4E]">
            {selectedIds.length}/3 Forms Placed
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917]">
          The Empty Canvas
        </h1>
      </div>

      <p className="font-serif text-lg leading-relaxed text-[#1C1917]">
        Morning light falls across an unprimed linen frame. Six sculptural
        studies rest on the workbench. Select <strong>three forms</strong>,
        choose a ground tone, and set their spatial arrangement.
      </p>

      {/* Live Framed Museum Plate */}
      <div
        className="relative rounded-sm border-2 p-6 sm:p-10 transition-colors duration-300 min-h-[260px] flex flex-col justify-between overflow-hidden"
        style={{
          backgroundColor: activePalette.bg,
          borderColor: activePalette.frame,
          color: activePalette.ink,
        }}
      >
        {/* Subtle compositional geometry guides */}
        <div
          className="absolute inset-5 border pointer-events-none opacity-25"
          style={{ borderColor: activePalette.accent }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] opacity-70">
          <span>{selectedPaletteId}</span>
          <span>{arrangement}</span>
        </div>

        {/* Dynamic Spatial Placement */}
        <div className="relative z-10 py-6 flex-1 flex items-center justify-center">
          {selectedIds.length === 0 ? (
            <p className="font-serif italic text-sm opacity-60 text-center">
              Select three sculptural forms below to compose this plate.
            </p>
          ) : (
            <div
              className={`w-full max-w-md flex ${
                arrangement === "Centered Totem"
                  ? "flex-col items-center gap-4"
                  : arrangement === "Horizon Triptych"
                  ? "flex-row items-center justify-around gap-4"
                  : "flex-row items-end justify-between px-4 gap-6"
              }`}
            >
              {selectedIds.map((id, index) => {
                const meta = STUDIO_OBJECTS.find((o) => o.id === id);
                const isPrimary = index === 0 && arrangement === "Golden Ratio";
                return (
                  <motion.button
                    key={id}
                    layout={!prefersReducedMotion}
                    type="button"
                    onClick={() => promoteToFocal(id)}
                    title="Click to make primary focal element"
                    className="group flex flex-col items-center gap-2 cursor-pointer p-2 rounded-sm transition-opacity hover:opacity-85"
                  >
                    <ArtifactVectorGlyph
                      artifactId={id}
                      stroke={activePalette.ink}
                      className={isPrimary ? "w-16 h-16" : "w-11 h-11"}
                    />
                    <span className="text-[10px] uppercase tracking-[0.18em] opacity-75">
                      {meta?.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative z-10 flex items-center justify-between text-[10px] tracking-[0.14em] opacity-65">
          <span>
            {selectedIds.length > 0
              ? "Tip: Click any placed form to make it the focal anchor"
              : "Unprimed Plate IV"}
          </span>
          <span>Edition 01</span>
        </div>
      </div>

      {/* Step 1: Select 3 Sculptural Objects */}
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A8178]">
          01 · Choose Three Sculptural Studies
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STUDIO_OBJECTS.map((obj) => {
            const selected = selectedIds.includes(obj.id);
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => toggleObject(obj.id)}
                aria-pressed={selected}
                className={`p-4 text-left border rounded-sm transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  selected
                    ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                    : "bg-[#FAF7F2] text-[#1C1917] border-[#DDD4C5] hover:bg-[#F3EDE2]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <ArtifactVectorGlyph
                    artifactId={obj.id}
                    stroke={selected ? "#FAF7F2" : "#1C1917"}
                    className="w-7 h-7"
                  />
                  {selected && <Check className="w-3.5 h-3.5 text-[#D8CCB8]" />}
                </div>
                <div>
                  <span className="block text-xs font-medium">{obj.label}</span>
                  <span
                    className={`block text-[11px] mt-0.5 ${
                      selected ? "text-[#D6CEC0]" : "text-[#8A8178]"
                    }`}
                  >
                    {obj.note}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 & 3: Ground Tone & Spatial Arrangement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2.5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A8178]">
            02 · Ground Tone
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {PALETTES.map((pal) => {
              const active = pal.id === selectedPaletteId;
              return (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => setSelectedPaletteId(pal.id)}
                  aria-pressed={active}
                  className={`p-3 border rounded-sm text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                    active
                      ? "border-[#1C1917] bg-[#F3EDE2]"
                      : "border-[#DDD4C5] bg-[#FAF7F2] hover:border-[#8A8178]"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border shrink-0"
                    style={{
                      backgroundColor: pal.bg,
                      borderColor: pal.frame,
                    }}
                  />
                  <span className="text-xs text-[#1C1917] leading-tight">
                    {pal.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A8178]">
            03 · Spatial Arrangement
          </p>
          <div className="space-y-2">
            {ARRANGEMENTS.map((arr) => {
              const active = arr.id === arrangement;
              return (
                <button
                  key={arr.id}
                  type="button"
                  onClick={() => setArrangement(arr.id)}
                  aria-pressed={active}
                  className={`w-full px-3.5 py-2.5 border rounded-sm text-left flex items-center justify-between cursor-pointer transition-all ${
                    active
                      ? "border-[#1C1917] bg-[#F3EDE2]"
                      : "border-[#DDD4C5] bg-[#FAF7F2] hover:border-[#8A8178]"
                  }`}
                >
                  <span className="text-xs font-medium text-[#1C1917]">
                    {arr.id}
                  </span>
                  <span className="text-[11px] text-[#8A8178]">
                    {arr.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-3 flex justify-end border-t border-[#DDD4C5]">
        <Button
          type="button"
          size="md"
          disabled={!isCompleteReady || isSaving}
          onClick={() => void handleConfirmComposition()}
        >
          <span>
            {isSaving ? "Recording Plate..." : "Seal Composition & Continue"}
          </span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
