"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, AtSign, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export interface RegisteredPlayer {
  id: string;
  username: string;
  instagramId: string | null;
}

interface PlayerRegistrationModalProps {
  isOpen: boolean;
  onRegistered: (player: RegisteredPlayer) => void;
  onClose?: () => void;
  targetModeName?: string;
}

export function PlayerRegistrationModal({
  isOpen,
  onRegistered,
  onClose,
  targetModeName,
}: PlayerRegistrationModalProps) {
  const [username, setUsername] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [existingPlayer, setExistingPlayer] = useState<RegisteredPlayer | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    try {
      const stored = localStorage.getItem("the_unwritten_player");
      if (stored) {
        const parsed = JSON.parse(stored) as RegisteredPlayer;
        if (parsed.username) {
          setExistingPlayer(parsed);
          setUsername(parsed.username);
          if (parsed.instagramId) setInstagramId(parsed.instagramId);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanIg = instagramId.replace(/^@+/, "").trim();

    if (!cleanUser || cleanUser.length < 2) {
      setErrorMsg("Please enter a username of at least 2 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/player/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUser,
          instagramId: cleanIg || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register identity.");
      }

      const playerObj: RegisteredPlayer = {
        id: data.playerId,
        username: data.username,
        instagramId: data.instagramId || null,
      };

      try {
        localStorage.setItem("the_unwritten_player", JSON.stringify(playerObj));
        localStorage.setItem("the_unwritten_username", playerObj.username);
      } catch {
        // ignore
      }

      onRegistered(playerObj);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAsExisting = () => {
    if (existingPlayer) {
      onRegistered(existingPlayer);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-[#161310] border-2 border-[#8C735B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] ring-1 ring-amber-500/20 text-[#FAF7F2] relative overflow-hidden"
      >
        {/* Subtle Warm Glow Behind Emblem */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Emblem & Brand Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-amber-400 shadow-lg">
            <Image
              src="/brand/emblem-silence.png"
              alt="The Unwritten"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-300 font-bold block">
              Identity Protocol
            </span>
            <h2 id="reg-heading" className="font-serif text-2xl sm:text-3xl text-white font-black tracking-wider">
              THE UNWRITTEN
            </h2>
          </div>

          <div className="space-y-1">
            <p className="font-serif italic text-sm text-[#DDD4C5]">
              Before your story begins...
            </p>
            <p className="text-xs uppercase font-mono tracking-wider text-amber-200/90 font-bold">
              Choose your identity.
            </p>
          </div>
        </div>

        {/* Returning Player Quick Welcome Plate */}
        {existingPlayer && (
          <div className="bg-[#241D17] border border-[#6B5542] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">
                Returning Player Detected
              </span>
              <span className="font-serif text-white font-bold truncate block">
                {existingPlayer.username} {existingPlayer.instagramId ? `(@${existingPlayer.instagramId})` : ""}
              </span>
            </div>
            <button
              type="button"
              onClick={handleContinueAsExisting}
              className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs font-mono uppercase tracking-wider shrink-0 cursor-pointer shadow-md transition-all active:scale-95"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-username"
              className="block text-xs font-mono uppercase tracking-wider text-[#DDD4C5] font-bold"
            >
              Username <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C735B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="reg-username"
                type="text"
                required
                maxLength={50}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1C1713] border-2 border-[#5E4B3A] focus:border-amber-400 rounded-lg pl-10 pr-3.5 py-3 text-sm text-white placeholder-[#8A7969] outline-none font-sans font-medium transition-colors"
              />
            </div>
          </div>

          {/* Instagram ID Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="reg-instagram"
                className="block text-xs font-mono uppercase tracking-wider text-[#DDD4C5] font-bold"
              >
                Instagram ID
              </label>
              <span className="text-[10px] font-mono text-[#8A7969]">Optional</span>
            </div>
            <div className="relative">
              <AtSign className="w-4 h-4 text-[#8C735B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="reg-instagram"
                type="text"
                maxLength={50}
                placeholder="Enter your Instagram ID"
                value={instagramId}
                onChange={(e) => setInstagramId(e.target.value)}
                className="w-full bg-[#1C1713] border-2 border-[#5E4B3A] focus:border-amber-400 rounded-lg pl-10 pr-3.5 py-3 text-sm text-white placeholder-[#8A7969] outline-none font-mono font-medium transition-colors"
              />
            </div>
            <p className="text-[10px] text-[#A69480] font-mono">
              Used strictly for monograph attribution and community discovery.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase font-mono tracking-wider py-3.5 rounded-lg border-2 border-white shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Entering World...</span>
                </>
              ) : (
                <>
                  <span>ENTER THE WORLD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-[#3A2E23]">
          <p className="font-serif italic text-xs text-[#B5A593]">
            Your journey starts here.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
