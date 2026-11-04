"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { StoryboardCharacter } from "@/lib/storyboard/types";
import { getCharacterSprite } from "@/lib/storyboard/character-registry";

interface StageCharacterProps {
  character: StoryboardCharacter;
  isSpeaker?: boolean;
}

export function StageCharacter({
  character,
  isSpeaker = false,
}: StageCharacterProps) {
  const [imgError, setImgError] = useState(false);
  const spriteSrc =
    getCharacterSprite(character.id, character.expression) ||
    `/art/characters/${character.id}_neutral.png`;

  // Horizontal position mapping
  const positionClasses = {
    "far-left": "left-[5%] md:left-[8%]",
    left: "left-[15%] md:left-[22%]",
    center: "left-1/2 -translate-x-1/2",
    right: "right-[15%] md:right-[22%]",
    "far-right": "right-[5%] md:right-[8%]",
  }[character.position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isSpeaker ? 1.03 : 0.98,
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`absolute bottom-0 z-20 pointer-events-none select-none flex flex-col items-center ${positionClasses}`}
      style={{
        transform: character.flipped ? "scaleX(-1)" : "none",
      }}
    >
      {/* Subtle character ground contact shadow */}
      <div className="absolute -bottom-4 w-56 md:w-80 h-10 bg-black/40 rounded-full blur-xl" />

      {/* Main Character Sprite */}
      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.8,
          ease: "easeInOut",
        }}
        className={`relative w-[280px] sm:w-[360px] md:w-[480px] lg:w-[560px] h-[460px] sm:h-[580px] md:h-[720px] lg:h-[840px] transition-all duration-300 ${
          isSpeaker
            ? "filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] brightness-105"
            : "filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] brightness-85 contrast-95 opacity-90"
        }`}
      >
        {!imgError ? (
          <Image
            src={spriteSrc}
            alt={character.name}
            fill
            sizes="(max-width: 768px) 360px, 560px"
            className="object-contain object-bottom"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback silhouette if image failed to load */
          <div className="w-full h-full flex flex-col items-center justify-end pb-12">
            <div className="w-44 h-80 rounded-t-full bg-[#2A2420]/80 border border-[#8A8178]/40 flex items-center justify-center">
              <span className="text-xs uppercase font-mono tracking-widest text-[#DDD4C5]">
                {character.name}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
