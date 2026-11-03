"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import {
  ArtifactVectorGlyph,
  WorldEnvironmentArtwork,
} from "@/components/artwork/SceneArtwork";
import { EventType } from "@/lib/types";

interface Chapter6Props {
  onTrackEvent: (
    eventType: EventType,
    data?: Record<string, unknown>
  ) => Promise<unknown>;
  onSavePreference: (category: string, value: string) => Promise<unknown>;
  onComplete: () => void;
}

const ENVIRONMENTS = [
  {
    id: "observatory",
    label: "High Altitude Observatory",
    description:
      "Clear cold air, brass meridian circles, and an unobstructed dome open to stellar drift.",
  },
  {
    id: "archives",
    label: "Subterranean Archives",
    description:
      "Miles of vaulted cedar shelving illuminated by warm pendant lamps and uncatalogued maps.",
  },
  {
    id: "coastal",
    label: "Sunlit Coastal Ruins",
    description:
      "Limestone colonnades above tidal water, salt wind, and open sea horizons.",
  },
  {
    id: "greenhouse",
    label: "Botanical Greenhouse",
    description:
      "Condensation on wrought-iron glass, rare night-blooming flora, and hushed stillness.",
  },
];

const RELICS = [
  {
    id: "unsent_letter",
    label: "Sealed Wax Letter",
    note: "Addressed in familiar handwriting",
  },
  {
    id: "crystal_prism",
    label: "Optical Glass Prism",
    note: "Splits white light into quiet spectra",
  },
  {
    id: "astrolabe",
    label: "Pocket Brass Astrolabe",
    note: "Calibrated for unfamiliar latitudes",
  },
  {
    id: "antique_key",
    label: "Unmarked Iron Key",
    note: "Warm to the touch, teeth worn smooth",
  },
];

const ACTIVITIES = [
  {
    id: "Document every detail quietly in a field journal",
    short: "Observation & Record",
  },
  {
    id: "Chart the perimeter and map every hidden passage",
    short: "Structure & Cartography",
  },
  {
    id: "Venture beyond the boundary wall toward the horizon",
    short: "Threshold & Discovery",
  },
  {
    id: "Sit in stillness and absorb the atmosphere first",
    short: "Presence & Resonance",
  },
];

export function Chapter6UnknownWorld({
  onTrackEvent,
  onSavePreference,
  onComplete,
}: Chapter6Props) {
  const prefersReducedMotion = useReducedMotion();
  const mountTimeRef = useRef<number>(0);

  const [selectedEnvId, setSelectedEnvId] = useState<string>("observatory");
  const [confirmedEnv, setConfirmedEnv] = useState<boolean>(false);
  const [selectedRelicLabel, setSelectedRelicLabel] = useState<string | null>(
    null
  );
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  useEffect(() => {
    mountTimeRef.current = performance.now();
  }, []);

  const currentEnv =
    ENVIRONMENTS.find((e) => e.id === selectedEnvId) || ENVIRONMENTS[0];

  const canComplete =
    confirmedEnv && Boolean(selectedRelicLabel) && Boolean(selectedActivity);

  const handleFinalizeJourney = async () => {
    if (!canComplete || !selectedRelicLabel || !selectedActivity || isCompiling)
      return;
    setIsCompiling(true);

    await onSavePreference("world_environment", currentEnv.label);
    await onSavePreference("world_object", selectedRelicLabel);
    await onSavePreference("world_activity", selectedActivity);

    const durationMs = Math.max(
      120,
      Math.round(performance.now() - mountTimeRef.current)
    );

    await onTrackEvent("choice_selected", {
      choiceId: currentEnv.label,
      environment: currentEnv.label,
      relic: selectedRelicLabel,
      activity: selectedActivity,
      durationMs,
    });

    await onTrackEvent("chapter_completed", {
      environment: currentEnv.label,
      relic: selectedRelicLabel,
      activity: selectedActivity,
      durationMs,
    });

    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#DDD4C5] pb-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#8A8178]">
          <span>Chapter 06 · Final Threshold</span>
          <span className="font-mono text-[#545E4E]">Closing Folio</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917]">
          The Unknown World
        </h1>
      </div>

      <p className="font-serif text-lg leading-relaxed text-[#1C1917]">
        The locks and transmissions are behind you. Four distinct sanctuaries
        open beyond the terrace. Choose where you step, which relic you carry,
        and how you spend your first hour.
      </p>

      {/* Live Architectural Horizon Plate */}
      <figure className="border border-[#DDD4C5] rounded-sm overflow-hidden bg-[#181512]">
        <WorldEnvironmentArtwork environmentId={selectedEnvId} />
        <figcaption className="px-4 py-3 bg-[#141210] text-[#D6CEC0] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="font-serif text-sm text-[#FAF7F2]">
            {currentEnv.label}
          </span>
          <span className="text-[11px] text-[#A89F93]">
            {currentEnv.description}
          </span>
        </figcaption>
      </figure>

      {/* Step 1: Sanctuary Selection */}
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A8178]">
          01 · Choose Your Horizon
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ENVIRONMENTS.map((env) => {
            const active = selectedEnvId === env.id && confirmedEnv;
            const previewing = selectedEnvId === env.id;
            return (
              <button
                key={env.id}
                type="button"
                onClick={() => {
                  setSelectedEnvId(env.id);
                  setConfirmedEnv(true);
                }}
                aria-pressed={active}
                className={`p-4 text-left border rounded-sm transition-all cursor-pointer ${
                  active
                    ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                    : previewing
                    ? "bg-[#F3EDE2] text-[#1C1917] border-[#8A8178]"
                    : "bg-[#FAF7F2] text-[#1C1917] border-[#DDD4C5] hover:bg-[#F3EDE2]"
                }`}
              >
                <span className="block font-serif text-lg">{env.label}</span>
                <span
                  className={`block text-xs mt-1 leading-relaxed ${
                    active ? "text-[#D6CEC0]" : "text-[#57524C]"
                  }`}
                >
                  {env.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Claim Relic */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0.9 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A8178]">
          02 · Claim One Relic from the Parapet
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RELICS.map((relic) => {
            const selected = selectedRelicLabel === relic.label;
            return (
              <button
                key={relic.id}
                type="button"
                onClick={() => setSelectedRelicLabel(relic.label)}
                aria-pressed={selected}
                className={`p-4 text-left border rounded-sm transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  selected
                    ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                    : "bg-[#FAF7F2] text-[#1C1917] border-[#DDD4C5] hover:bg-[#F3EDE2]"
                }`}
              >
                <ArtifactVectorGlyph
                  artifactId={relic.id}
                  stroke={selected ? "#FAF7F2" : "#1C1917"}
                  className="w-7 h-7"
                />
                <div>
                  <span className="block text-xs font-medium">
                    {relic.label}
                  </span>
                  <span
                    className={`block text-[11px] mt-0.5 ${
                      selected ? "text-[#D6CEC0]" : "text-[#8A8178]"
                    }`}
                  >
                    {relic.note}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Step 3: First Deliberate Act */}
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A8178]">
          03 · Your First Hour Inside
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACTIVITIES.map((act) => {
            const selected = selectedActivity === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedActivity(act.id)}
                aria-pressed={selected}
                className={`p-4 text-left border rounded-sm transition-all cursor-pointer ${
                  selected
                    ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                    : "bg-[#FAF7F2] text-[#1C1917] border-[#DDD4C5] hover:bg-[#F3EDE2]"
                }`}
              >
                <span
                  className={`block text-[10px] uppercase tracking-[0.2em] ${
                    selected ? "text-[#D8CCB8]" : "text-[#8A8178]"
                  }`}
                >
                  {act.short}
                </span>
                <span className="block text-sm font-medium mt-1">{act.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#DDD4C5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-[#57524C]">
          {!confirmedEnv
            ? "Confirm your preferred horizon in Step 01 above to seal your journey."
            : "Your explicit selections will be preserved alongside your behavioral dossier."}
        </p>

        <Button
          type="button"
          size="lg"
          disabled={!canComplete || isCompiling}
          onClick={() => void handleFinalizeJourney()}
        >
          <span>
            {isCompiling ? "Compiling Monograph..." : "Reveal Your Report"}
          </span>
          <ArrowRight className="w-4 h-4 ml-2.5" />
        </Button>
      </div>
    </div>
  );
}
