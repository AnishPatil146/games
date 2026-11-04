"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, CornerDownRight, Sparkles } from "lucide-react";
import { CharacterId, StoryboardChoice } from "@/lib/storyboard/types";
import { CHARACTER_META } from "@/lib/storyboard/character-registry";

interface SpeechBubbleProps {
  speakerId: CharacterId;
  speakerName: string;
  text: string;
  position?: "left" | "center" | "right";
  choices?: StoryboardChoice[];
  onSelectChoice?: (choice: StoryboardChoice) => void;
  onAdvance?: () => void;
  canAdvance?: boolean;
}

export function SpeechBubble({
  speakerId,
  speakerName,
  text,
  position = "center",
  choices,
  onSelectChoice,
  onAdvance,
  canAdvance = true,
}: SpeechBubbleProps) {
  const [displayedText, setDisplayedText] = useState(text.slice(0, 2));
  const isNarrator = speakerId === "narrator" || speakerId === "system";
  const meta = CHARACTER_META[speakerId] || CHARACTER_META.narrator;

  // Typewriter text reveal effect
  useEffect(() => {
    let currentIdx = 0;
    const startTimer = setTimeout(() => {
      setDisplayedText("");
    }, 0);
    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx <= text.length) {
        setDisplayedText(text.slice(0, currentIdx));
      } else {
        clearInterval(interval);
      }
    }, 16);

    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
    };
  }, [text]);

  const handleContainerClick = () => {
    if (displayedText.length < text.length) {
      // Instant reveal on click
      setDisplayedText(text);
      return;
    }
    if ((!choices || choices.length === 0) && onAdvance && canAdvance) {
      onAdvance();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="w-full select-none cursor-pointer transition-all duration-300"
    >
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative"
      >
        {/* Tail pointing toward the speaker */}
        {!isNarrator && (
          <div
            className={`absolute -top-3 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-[#FAF7F2] filter drop-shadow-[0_-2px_4px_rgba(0,0,0,0.15)] ${
              position === "left"
                ? "left-20"
                : position === "right"
                ? "right-20"
                : "left-1/2 -translate-x-1/2"
            }`}
          />
        )}

        {/* Speech Balloon Body */}
        <div
          className={`relative rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.55)] border-2 ${
            isNarrator
              ? "bg-[#181614]/95 text-[#FAF7F2] border-[#574E45] backdrop-blur-md"
              : "bg-[#FAF7F2]/98 text-[#1C1917] border-[#C8B8A6] backdrop-blur-md"
          }`}
        >
          {/* Speaker Name Tag / Comic Badge */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: meta.themeColor }}
                className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
              />
              <span
                className={`text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase font-mono px-2.5 py-0.5 rounded-full ${
                  isNarrator
                    ? "bg-[#28221D] text-[#DDD4C5]"
                    : "bg-[#E7E0D3] text-[#2D2825]"
                }`}
              >
                {speakerName}
              </span>
              <span
                className={`text-[10px] hidden sm:inline tracking-wider opacity-60 font-serif italic ${
                  isNarrator ? "text-[#C4BCB3]" : "text-[#736B63]"
                }`}
              >
                {meta.role}
              </span>
            </div>

            {(!choices || choices.length === 0) && (
              <span
                className={`text-[10px] uppercase font-mono tracking-widest flex items-center gap-1 opacity-70 ${
                  isNarrator ? "text-[#A8A199]" : "text-[#8A8178]"
                }`}
              >
                <span>Click to continue</span>
                <ChevronRight className="w-3 h-3 animate-pulse" />
              </span>
            )}
          </div>

          {/* Dialogue Text Content */}
          <p
            className={`font-serif text-base md:text-lg leading-relaxed tracking-normal ${
              isNarrator ? "italic text-[#EFEBE4]" : "text-[#1C1917]"
            }`}
          >
            {displayedText}
            {displayedText.length < text.length && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-[#545E4E] animate-ping" />
            )}
          </p>

          {/* Interactive Comic Choice Branches */}
          {choices && choices.length > 0 && displayedText.length >= text.length && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-5 pt-4 border-t border-[#DDD4C5]/60 flex flex-col gap-2.5"
            >
              <div className="text-[10px] uppercase tracking-widest font-mono text-[#8A8178] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#9E6B68]" />
                <span>Choose your response</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {choices.map((choice, i) => (
                  <button
                    key={choice.id || i}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectChoice) onSelectChoice(choice);
                    }}
                    className="group relative flex items-start text-left px-4 py-3 rounded-xl border border-[#DDD4C5] bg-white/80 hover:bg-[#F3EDE2] hover:border-[#8A8178] hover:shadow-md transition-all duration-200"
                  >
                    <CornerDownRight className="w-4 h-4 mt-0.5 mr-2.5 text-[#545E4E] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-sans font-semibold text-[#1C1917] group-hover:text-[#12100E]">
                        {choice.label}
                      </div>
                      {choice.description && (
                        <div className="text-xs font-serif text-[#736B63] mt-0.5">
                          {choice.description}
                        </div>
                      )}
                    </div>
                    {choice.badge && (
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-[#E7E0D3] text-[#545E4E] px-2 py-0.5 rounded ml-2">
                        {choice.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
