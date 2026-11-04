"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { StoryboardCharacter, StagePosition } from "@/lib/storyboard/types";
import { getCharacterSprite, CHARACTER_META } from "@/lib/storyboard/character-registry";

interface StageCharacterProps {
  character: StoryboardCharacter;
  isSpeaker?: boolean;
}

const POSITION_STYLES: Record<StagePosition, React.CSSProperties> = {
  "far-left": { left: "4%" },
  left: { left: "14%" },
  center: { left: "50%", transform: "translateX(-50%)" },
  right: { right: "14%" },
  "far-right": { right: "4%" },
};

export function StageCharacter({
  character,
  isSpeaker = false,
}: StageCharacterProps) {
  const [imgError, setImgError] = useState(false);
  const spriteSrc =
    getCharacterSprite(character.id, character.expression) ||
    `/art/characters/${character.id}_neutral.png`;

  const meta = CHARACTER_META[character.id] || CHARACTER_META.narrator;
  const basePosStyle = POSITION_STYLES[character.position] || POSITION_STYLES.center;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isSpeaker ? 1.04 : 0.97,
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute bottom-0 z-20 pointer-events-none select-none flex flex-col items-center"
      style={{
        ...basePosStyle,
        transform: character.flipped
          ? `${basePosStyle.transform || ""} scaleX(-1)`.trim()
          : basePosStyle.transform,
      }}
    >
      {/* Dynamic Ground Shadow */}
      <div className="absolute -bottom-3 w-48 sm:w-64 md:w-80 h-8 bg-black/50 rounded-full blur-xl" />

      {/* Main Character Sprite Box */}
      <motion.div
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        className={`relative transition-all duration-300 ${
          isSpeaker
            ? "filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.7)] brightness-105"
            : "filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] brightness-90 contrast-95 opacity-90"
        }`}
        style={{
          height: "min(68vh, 580px)",
          maxHeight: "580px",
          width: "min(46vw, 420px)",
          maxWidth: "420px",
        }}
      >
        {!imgError ? (
          <Image
            src={spriteSrc}
            alt={character.name}
            fill
            unoptimized
            priority
            sizes="(max-width: 768px) 320px, 440px"
            className="object-contain object-bottom"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Graceful Character Card Fallback */
          <div className="w-full h-full flex flex-col items-center justify-end pb-8">
            <div
              style={{
                borderColor: meta.themeColor,
                backgroundColor: meta.badgeBg,
              }}
              className="w-48 sm:w-56 h-72 sm:h-80 rounded-2xl border-2 shadow-2xl p-5 flex flex-col justify-between items-center text-center backdrop-blur-md"
            >
              <div
                style={{ backgroundColor: meta.themeColor }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-2xl shadow-lg mt-4"
              >
                {character.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-mono tracking-widest text-[#FAF7F2] font-bold block">
                  {character.name}
                </span>
                <span className="text-[10px] font-serif italic text-[#DDD4C5] block">
                  {meta.role}
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[#DDD4C5] font-mono">
                {character.expression}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

