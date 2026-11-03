"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Globe, Compass, Eye, Heart, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/Button";

interface Chapter6Props {
  onComplete: (data: {
    environment: string;
    object: string;
    activity: string;
  }) => void;
  onEvent: (eventType: string, data: Record<string, unknown>) => void;
  onPreference: (category: string, value: string) => void;
}

const ENVIRONMENTS = [
  {
    id: "observatory",
    title: "The Sunlit Observatory",
    subtitle: "High Altitude & Starlight",
    description:
      "A mountain aerie surrounded by golden cloud banks. Polished brass telescopes point toward silent constellations.",
    icon: "🔭",
  },
  {
    id: "archives",
    title: "The Whispering Archives",
    subtitle: "Vellum, Leather & Shadows",
    description:
      "A spiraling labyrinth of towering bookshelves with iron ladders, echoing footfalls, and forgotten folios.",
    icon: "📜",
  },
  {
    id: "coastal",
    title: "The Forgotten Coastal Ruins",
    subtitle: "Salt Spray & Ancient Marble",
    description:
      "Pillars rising out of the turquoise tide pools. The sound of crashing waves against weathered limestone.",
    icon: "🌊",
  },
  {
    id: "greenhouse",
    title: "The Secret Botanical Greenhouse",
    subtitle: "Verdant Glass & Living Earth",
    description:
      "A soaring Victorian glasshouse filled with overgrown ferns, damp gravel paths, and quiet stone pools.",
    icon: "🌿",
  },
];

const OBJECTS_OF_ATTENTION = [
  {
    id: "letter",
    title: "An Unsent Letter",
    tagline: "Unspoken longing",
    symbol: "✉",
  },
  {
    id: "prism",
    title: "A Fractured Prism",
    tagline: "Split spectral light",
    symbol: "◇",
  },
  {
    id: "astrolabe",
    title: "A Brass Astrolabe",
    tagline: "Lost celestial coordinates",
    symbol: "✦",
  },
  {
    id: "key",
    title: "An Unmarked Key",
    tagline: "A door not yet found",
    symbol: "🗝",
  },
];

const PREFERRED_ACTIVITIES = [
  {
    id: "document",
    title: "Document every nuance silently",
    description: "Record flora, inscriptions, and architectural anomalies in an archival journal.",
  },
  {
    id: "chart",
    title: "Chart the quickest route forward",
    description: "Map terrain elevation, assess perimeter risks, and establish strategic orientation.",
  },
  {
    id: "venture",
    title: "Venture down unmapped corridors",
    description: "Ignore posted directional markers and walk toward the unexplained glow in the distance.",
  },
  {
    id: "listen",
    title: "Sit quietly and absorb the atmosphere",
    description: "Rest on a stone ledge, listening to the ambient breeze and the passage of time.",
  },
];

export function Chapter6UnknownWorld({
  onComplete,
  onEvent,
  onPreference,
}: Chapter6Props) {
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [selectedObj, setSelectedObj] = useState<string | null>(null);
  const [selectedAct, setSelectedAct] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    onEvent("chapter_started", { chapter: 6, title: "The Unknown World" });
  }, [onEvent]);

  const handleFinish = () => {
    if (!selectedEnv || !selectedObj || !selectedAct) return;
    setIsFinishing(true);

    const envData = ENVIRONMENTS.find((e) => e.id === selectedEnv)!;
    const objData = OBJECTS_OF_ATTENTION.find((o) => o.id === selectedObj)!;
    const actData = PREFERRED_ACTIVITIES.find((a) => a.id === selectedAct)!;

    // Explicit preferences recorded
    onPreference("world_environment", envData.title);
    onPreference("world_object", objData.title);
    onPreference("world_activity", actData.title);

    const elapsed = Date.now() - startTimeRef.current;
    onEvent("choice_selected", {
      chapter: 6,
      environment: envData.title,
      object: objData.title,
      activity: actData.title,
      durationMs: elapsed,
    });

    onComplete({
      environment: envData.title,
      object: objData.title,
      activity: actData.title,
    });
  };

  const isFormComplete = selectedEnv && selectedObj && selectedAct;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E8E2D8] pb-6">
        <div className="flex items-center space-x-2 text-[#78716C] text-xs uppercase tracking-[0.2em]">
          <Globe className="w-3.5 h-3.5" />
          <span>The Horizon Threshold • Final Exploration</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal">
          The Unknown World
        </h2>
        <p className="text-xs sm:text-sm text-[#78716C] italic font-serif">
          The heavy library vault opens into an unmapped landscape. Where does your eye wander first?
        </p>
      </div>

      {/* Part 1: Choose Environment */}
      <div className="space-y-3">
        <label className="block text-[11px] uppercase tracking-[0.2em] text-[#78716C]">
          1. Select the Environment You Would Inhabit
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ENVIRONMENTS.map((env) => {
            const isSelected = selectedEnv === env.id;
            return (
              <button
                key={env.id}
                type="button"
                onClick={() => setSelectedEnv(env.id)}
                className={`p-4 rounded border text-left transition-all ${
                  isSelected
                    ? "border-[#1C1917] bg-[#FAF8F5] shadow-sm"
                    : "border-[#E0D7CB] bg-[#F4EFE7]/50 hover:bg-[#FAF8F5] hover:border-[#8C827A]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{env.icon}</span>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-[#1C1917] text-[#FAF8F5]">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
                  {env.title}
                </h4>
                <span className="text-[10px] text-[#5B6356] font-medium uppercase tracking-wider block mb-1">
                  {env.subtitle}
                </span>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  {env.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Part 2: Object of Attention */}
      <div className="space-y-3 pt-2">
        <label className="block text-[11px] uppercase tracking-[0.2em] text-[#78716C]">
          2. The Artifact That Compels Your Touch
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {OBJECTS_OF_ATTENTION.map((obj) => {
            const isSelected = selectedObj === obj.id;
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => setSelectedObj(obj.id)}
                className={`p-3 rounded border text-left transition-all ${
                  isSelected
                    ? "border-[#1C1917] bg-[#FAF8F5] shadow-sm"
                    : "border-[#E0D7CB] bg-[#F4EFE7]/50 hover:border-[#8C827A]"
                }`}
              >
                <div className="text-xl mb-1">{obj.symbol}</div>
                <h5 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917] line-clamp-1">
                  {obj.title}
                </h5>
                <p className="text-[10px] text-[#78716C] italic line-clamp-1">
                  {obj.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Part 3: Activity Preference */}
      <div className="space-y-3 pt-2">
        <label className="block text-[11px] uppercase tracking-[0.2em] text-[#78716C]">
          3. Your Instinctive Mode of Being
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PREFERRED_ACTIVITIES.map((act) => {
            const isSelected = selectedAct === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedAct(act.id)}
                className={`p-4 rounded border text-left transition-all ${
                  isSelected
                    ? "border-[#1C1917] bg-[#FAF8F5] shadow-sm"
                    : "border-[#E0D7CB] bg-[#F4EFE7]/50 hover:border-[#8C827A]"
                }`}
              >
                <h5 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1">
                  {act.title}
                </h5>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  {act.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complete Journey CTA */}
      <div className="pt-6 border-t border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#78716C]">
          <span>All six chapters complete. Ready to compile your personal report.</span>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleFinish}
          disabled={!isFormComplete || isFinishing}
          className="w-full sm:w-auto"
        >
          {isFinishing ? (
            "SYNTHESIZING REPORT..."
          ) : (
            <>
              <span>CONCLUDE & VIEW REPORT</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

