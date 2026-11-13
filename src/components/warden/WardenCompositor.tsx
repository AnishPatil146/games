"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TimelineCue } from "@/lib/cinematicTimelineEngine";

interface WardenCompositorProps {
  cue: TimelineCue;
  isPlaying: boolean;
  reducedMotion?: boolean;
  className?: string;
}

export function WardenCompositor({
  cue,
  isPlaying,
  reducedMotion = false,
  className = "",
}: WardenCompositorProps) {
  // Deterministic floating embers & dust motes passing both in front and behind character
  const particles = useMemo(() => {
    return [
      { id: 1, x: "15%", y: "25%", size: 2.5, duration: 7.2, delay: 0.2, front: false },
      { id: 2, x: "82%", y: "45%", size: 3.5, duration: 6.5, delay: 0.8, front: true },
      { id: 3, x: "42%", y: "15%", size: 2.0, duration: 8.0, delay: 1.5, front: false },
      { id: 4, x: "70%", y: "65%", size: 4.0, duration: 5.8, delay: 0.4, front: true },
      { id: 5, x: "28%", y: "78%", size: 3.0, duration: 7.0, delay: 1.1, front: true },
      { id: 6, x: "88%", y: "20%", size: 2.2, duration: 9.1, delay: 2.0, front: false },
      { id: 7, x: "55%", y: "82%", size: 3.8, duration: 6.2, delay: 0.6, front: true },
    ];
  }, []);

  const envImage =
    cue.environment === "gate_opening"
      ? "/art/environments/warden_gate_opening.jpg"
      : "/art/environments/warden_gate_wide.jpg";

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none bg-[#070608] ${className}`}
    >
      {/* ============================================================ */}
      {/* LAYER 1: BACKGROUND ENVIRONMENT (Slow cinematic push/drift)  */}
      {/* ============================================================ */}
      <motion.div
        key={`env-${cue.environment}`}
        initial={{ opacity: 0.8, scale: 1.0 }}
        animate={{
          opacity: 1,
          scale: isPlaying && !reducedMotion ? [1.0, 1.05] : 1.0,
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: {
            duration: 14.0,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          },
        }}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      >
        <Image
          src={envImage}
          alt="The Warden's Gate"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.82] contrast-[1.12]"
        />
      </motion.div>

      {/* ============================================================ */}
      {/* LAYER 2: MIDGROUND ATMOSPHERIC DEPTH & SHADOW GRADIENTS     */}
      {/* ============================================================ */}
      {/* Dark gothic floor horizon gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#070608] via-black/45 to-black/70 pointer-events-none" />

      {/* Cinematic radial vignette */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,4,6,0.92)_100%)] pointer-events-none" />

      {/* Dynamic environmental lighting tint matched to active cue */}
      <motion.div
        animate={{
          backgroundColor: cue.lightingColor.replace(/[\d.]+\)$/, "0.14)"),
        }}
        transition={{ duration: 1.0 }}
        className="absolute inset-0 z-10 pointer-events-none mix-blend-color-dodge"
      />

      {/* Back-layer floating dust motes (behind character) */}
      {!reducedMotion && (
        <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
          {particles
            .filter((p) => !p.front)
            .map((p) => (
              <motion.div
                key={p.id}
                initial={{ y: 0, opacity: 0.3 }}
                animate={{
                  y: [-12, 14, -12],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  left: p.x,
                  top: p.y,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                }}
                className="absolute rounded-full bg-[#C8B28E]/40 blur-[0.5px]"
              />
            ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* LAYER 3: CHARACTER STAGE (100% Grounded, Multi-Tier Shadow)  */}
      {/* ============================================================ */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-end pb-8 sm:pb-12 pointer-events-none">
        {/* Character Proportional Stage Box */}
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg h-[75%] sm:h-[82%] flex items-end justify-center">
          {/* Ground Contact Shadow Stack */}
          {/* 1. Soft wide ambient floor shadow */}
          <div className="absolute -bottom-2 w-[72%] h-10 rounded-full bg-black/70 blur-2xl pointer-events-none" />
          {/* 2. Direct contact occlusion shadow */}
          <div className="absolute -bottom-1 w-[46%] h-5 rounded-full bg-black/95 blur-md pointer-events-none" />
          {/* 3. Boot heel micro-shadow */}
          <div className="absolute bottom-0 w-[28%] h-2.5 rounded-full bg-black blur-xs pointer-events-none" />

          {/* Transparent RGBA Character Stance with Smooth Cross-Fade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={cue.poseId}
              initial={{
                opacity: 0,
                y: reducedMotion ? 0 : 8,
                scale: reducedMotion ? 1 : 0.985,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: reducedMotion ? 0 : -4,
                scale: 0.99,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative w-full h-full flex items-end justify-center"
            >
              <Image
                src={cue.poseImage}
                alt={cue.speaker}
                fill
                priority
                unoptimized
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 420px, 540px"
                className="object-contain object-bottom filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] brightness-[0.96] contrast-[1.04]"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LAYER 4: FOREGROUND PARTICLES & ATMOSPHERIC LIGHTING         */}
      {/* ============================================================ */}
      {!reducedMotion && (
        <div className="absolute inset-0 z-25 pointer-events-none overflow-hidden">
          {particles
            .filter((p) => p.front)
            .map((p) => (
              <motion.div
                key={p.id}
                initial={{ y: 0, opacity: 0.4 }}
                animate={{
                  y: [-16, 18, -16],
                  opacity: [0.3, 0.85, 0.3],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  left: p.x,
                  top: p.y,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                }}
                className="absolute rounded-full bg-red-400/50 blur-[0.7px] shadow-[0_0_8px_rgba(239,68,68,0.7)]"
              />
            ))}
        </div>
      )}

      {/* Edge volumetric ambient glow */}
      <div
        className="absolute inset-0 z-25 pointer-events-none transition-all duration-1000"
        style={{
          boxShadow: `inset 0 0 100px ${cue.lightingColor.replace(/[\d.]+\)$/, "0.35)")}`,
        }}
      />
    </div>
  );
}

