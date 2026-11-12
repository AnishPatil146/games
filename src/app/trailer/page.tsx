"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Check,
  Video,
} from "lucide-react";

export default function LaunchTrailerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const wardenImgRef = useRef<HTMLImageElement | null>(null);
  const emblemImgRef = useRef<HTMLImageElement | null>(null);

  // Audio Context and Synth References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const spokenFlagsRef = useRef<Record<string, boolean>>({});

  // Load Image Assets from public directory
  useEffect(() => {
    const wImg = new Image();
    wImg.src = "/art/characters/warden_official_launch.jpg";
    wardenImgRef.current = wImg;

    const eImg = new Image();
    eImg.src = "/brand/emblem-silence.png";
    emblemImgRef.current = eImg;
  }, []);

  // Web Audio Initializer
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.setValueAtTime(isMuted ? 0 : 0.85, ctx.currentTime);
        master.connect(ctx.destination);
        audioCtxRef.current = ctx;
        masterGainRef.current = master;
      }
    } else if (audioCtxRef.current.state === "suspended") {
      void audioCtxRef.current.resume();
    }
  }, [isMuted]);

  // Sound FX Triggers
  const playHeartbeat = useCallback(
    (timeOffset = 0) => {
      if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime + timeOffset;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.18);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.7, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(masterGainRef.current);
      osc.start(t);
      osc.stop(t + 0.25);
    },
    [isMuted]
  );

  const playDoorRumble = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    const duration = 3.5;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(65, t);
    filter.frequency.linearRampToValueAtTime(140, t + 1.8);
    filter.frequency.linearRampToValueAtTime(50, t + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.6);
    gain.gain.linearRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current);
    noise.start(t);
    noise.stop(t + duration);
  }, [isMuted]);

  const playImpactBoom = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(26, t + 1.2);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    osc.connect(gain);
    gain.connect(masterGainRef.current);
    osc.start(t);
    osc.stop(t + 2.3);

    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = "triangle";
    shimmer.frequency.setValueAtTime(440, t);
    shimmer.frequency.exponentialRampToValueAtTime(120, t + 0.8);
    shimmerGain.gain.setValueAtTime(0.2, t);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(masterGainRef.current);
    shimmer.start(t);
    shimmer.stop(t + 1.0);
  }, [isMuted]);

  const speakDialogue = useCallback(
    (text: string) => {
      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        isMuted
      )
        return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.88;
        u.pitch = 0.65;
        const voices = window.speechSynthesis.getVoices();
        const deepVoice =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.toLowerCase().includes("male") ||
                v.name.toLowerCase().includes("david") ||
                v.name.toLowerCase().includes("daniel") ||
                v.name.toLowerCase().includes("george"))
          ) || voices.find((v) => v.lang.startsWith("en"));
        if (deepVoice) u.voice = deepVoice;
        window.speechSynthesis.speak(u);
      } catch {
        // Ignore speech synthesis failures in restricted browsers
      }
    },
    [isMuted]
  );

  // Audio mute sync
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : 0.85,
        audioCtxRef.current.currentTime
      );
    }
    if (isMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted]);

  // Subtitle Renderer Helper
  const drawSubtitleBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    speaker: string,
    dialogue: string
  ) => {
    ctx.save();
    ctx.textAlign = "center";

    const boxW = 940;
    const boxH = 160;
    const boxX = x - boxW / 2;
    const boxY = y - boxH / 2;

    ctx.fillStyle = "rgba(14, 11, 9, 0.88)";
    ctx.strokeStyle = "rgba(143, 161, 132, 0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#34D399";
    ctx.font = "900 20px monospace";
    ctx.letterSpacing = "0.28em";
    ctx.fillText(speaker, x, boxY + 36);

    ctx.fillStyle = "#FAF7F2";
    ctx.font = "600 26px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    ctx.letterSpacing = "-0.01em";

    const words = dialogue.split(" ");
    let line1 = "";
    let line2 = "";
    for (const w of words) {
      if ((line1 + " " + w).length <= 48 && !line2) {
        line1 += (line1 ? " " : "") + w;
      } else {
        line2 += (line2 ? " " : "") + w;
      }
    }

    if (line2) {
      ctx.fillText(line1, x, boxY + 80);
      ctx.fillText(line2, x, boxY + 120);
    } else {
      ctx.fillText(line1, x, boxY + 98);
    }

    ctx.restore();
  };

  // Canvas Render Loop for 1080x1920 Frame
  const renderFrame = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = 1080;
      const h = 1920;
      const cx = w / 2;
      const cy = h / 2;

      // Clear background
      ctx.fillStyle = "#0A0807";
      ctx.fillRect(0, 0, w, h);

      // Audio Cue Dispatcher based on second thresholds
      if (t >= 0.5 && t < 0.6 && !spokenFlagsRef.current["hb1"]) {
        spokenFlagsRef.current["hb1"] = true;
        playHeartbeat();
      }
      if (t >= 1.5 && t < 1.6 && !spokenFlagsRef.current["hb2"]) {
        spokenFlagsRef.current["hb2"] = true;
        playHeartbeat();
      }
      if (t >= 2.5 && t < 2.6 && !spokenFlagsRef.current["hb3"]) {
        spokenFlagsRef.current["hb3"] = true;
        playHeartbeat();
      }
      if (t >= 3.5 && t < 3.6 && !spokenFlagsRef.current["hb4"]) {
        spokenFlagsRef.current["hb4"] = true;
        playHeartbeat();
      }
      if (t >= 6.0 && t < 6.2 && !spokenFlagsRef.current["s2_speech"]) {
        spokenFlagsRef.current["s2_speech"] = true;
        speakDialogue("Hello, everyone. My name is The Warden.");
      }
      if (t >= 11.2 && t < 11.4 && !spokenFlagsRef.current["door_rumble"]) {
        spokenFlagsRef.current["door_rumble"] = true;
        playDoorRumble();
      }
      if (t >= 12.0 && t < 12.2 && !spokenFlagsRef.current["s3_speech"]) {
        spokenFlagsRef.current["s3_speech"] = true;
        speakDialogue("Finally... the wait is over.");
      }
      if (t >= 17.0 && t < 17.2 && !spokenFlagsRef.current["impact"]) {
        spokenFlagsRef.current["impact"] = true;
        playImpactBoom();
      }
      if (t >= 17.8 && t < 18.0 && !spokenFlagsRef.current["s4_speech"]) {
        spokenFlagsRef.current["s4_speech"] = true;
        speakDialogue("THE UNWRITTEN is officially LIVE!");
      }
      if (t >= 23.5 && t < 23.7 && !spokenFlagsRef.current["s5_speech"]) {
        spokenFlagsRef.current["s5_speech"] = true;
        speakDialogue(
          "Go check it out, experience the game, and don't forget to leave your honest review. I want to know what you think. I'll see you inside."
        );
      }

      // ==========================================
      // SCENE 1: THE WAIT IS OVER (0.0s – 5.0s)
      // ==========================================
      if (t < 5.0) {
        const sceneProgress = t / 5.0;
        const fadeIn = Math.min(1, Math.max(0, (t - 0.4) / 1.6));

        ctx.save();
        ctx.globalAlpha = fadeIn;

        // Dark gothic corridor perspective
        const grad = ctx.createRadialGradient(cx, 850, 40, cx, 850, 900);
        grad.addColorStop(0, "rgba(35, 30, 26, 0.95)");
        grad.addColorStop(0.5, "rgba(18, 14, 12, 0.85)");
        grad.addColorStop(1, "#0A0807");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Floor cobblestone lines
        ctx.strokeStyle = "rgba(84, 70, 56, 0.25)";
        ctx.lineWidth = 2;
        for (let i = -6; i <= 6; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + i * 20, 850);
          ctx.lineTo(cx + i * 190, h);
          ctx.stroke();
        }

        // Overhead silver cone of light revealing Warden
        const lightGrad = ctx.createRadialGradient(cx, 400, 10, cx, 780, 520);
        lightGrad.addColorStop(0, "rgba(220, 230, 242, 0.35)");
        lightGrad.addColorStop(0.6, "rgba(140, 160, 180, 0.12)");
        lightGrad.addColorStop(1, "transparent");
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 120, 0);
        ctx.lineTo(cx + 120, 0);
        ctx.lineTo(cx + 420, 1200);
        ctx.lineTo(cx - 420, 1200);
        ctx.closePath();
        ctx.fill();

        // Distant Warden Silhouette moving forward
        if (wardenImgRef.current && wardenImgRef.current.complete) {
          const scale = 0.65 + sceneProgress * 0.16;
          const imgW = 720 * scale;
          const imgH = 1040 * scale;
          const imgX = cx - imgW / 2;
          const imgY = 820 - imgH / 2 + Math.sin(t * 1.5) * 4;

          ctx.save();
          ctx.filter = `brightness(${0.1 + sceneProgress * 0.35}) contrast(1.2)`;
          ctx.drawImage(wardenImgRef.current, imgX, imgY, imgW, imgH);
          ctx.restore();
        }

        // Floating fog motes
        ctx.fillStyle = "rgba(200, 210, 225, 0.12)";
        for (let i = 0; i < 40; i++) {
          const px = (Math.sin(i * 99 + t * 0.4) * 0.5 + 0.5) * w;
          const py = (Math.cos(i * 33 + t * 0.3) * 0.5 + 0.5) * h;
          const pr = 4 + (i % 6);
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Typography: THE WAIT IS OVER.
        if (t >= 1.2 && t <= 4.8) {
          const textAlpha = Math.sin(((t - 1.2) / 3.6) * Math.PI);
          ctx.save();
          ctx.globalAlpha = textAlpha;
          ctx.fillStyle = "#FAF7F2";
          ctx.font = "900 48px Newsreader, Georgia, serif";
          ctx.textAlign = "center";
          ctx.letterSpacing = "0.32em";
          ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
          ctx.shadowBlur = 18;
          ctx.fillText("THE WAIT IS OVER.", cx, 1520);
          ctx.restore();
        }

        ctx.restore();
      }

      // ==========================================
      // SCENE 2: THE INTRODUCTION (5.0s – 11.0s)
      // ==========================================
      else if (t >= 5.0 && t < 11.0) {
        const sceneProgress = (t - 5.0) / 6.0;
        const breathe = Math.sin(t * 1.8) * 6;

        ctx.save();

        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, "#0D0B0A");
        bg.addColorStop(0.5, "#1A1512");
        bg.addColorStop(1, "#080605");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Gothic iron gate backdrop
        ctx.strokeStyle = "rgba(110, 95, 78, 0.3)";
        ctx.lineWidth = 3;
        for (let x = 120; x < w; x += 90) {
          ctx.beginPath();
          ctx.moveTo(x, 150);
          ctx.lineTo(x, 1350);
          ctx.stroke();
        }

        // Medium Close-Up of The Warden
        if (wardenImgRef.current && wardenImgRef.current.complete) {
          const scale = 1.32 + sceneProgress * 0.08;
          const imgW = 720 * scale;
          const imgH = 1040 * scale;
          const imgX = cx - imgW / 2;
          const liftOffset = Math.max(0, 1 - (t - 5.0) / 1.4) * 25;
          const imgY = 480 - imgH / 2 + breathe + liftOffset;

          ctx.save();
          ctx.drawImage(wardenImgRef.current, imgX, imgY, imgW, imgH);
          ctx.restore();
        }

        // Cinematic Vignette
        const vig = ctx.createRadialGradient(cx, cy, 350, cx, cy, 950);
        vig.addColorStop(0, "transparent");
        vig.addColorStop(0.7, "rgba(10, 8, 7, 0.45)");
        vig.addColorStop(1, "rgba(10, 8, 7, 0.95)");
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        if (showSubtitles && t >= 5.8 && t <= 10.6) {
          drawSubtitleBox(
            ctx,
            cx,
            1620,
            "THE WARDEN",
            '"Hello, everyone. My name is The Warden."'
          );
        }

        ctx.restore();
      }

      // ==========================================
      // SCENE 3: THE ANNOUNCEMENT (11.0s – 17.0s)
      // ==========================================
      else if (t >= 11.0 && t < 17.0) {
        const sceneProgress = (t - 11.0) / 6.0;
        const doorOpenProgress = Math.min(1, Math.max(0, (t - 11.3) / 3.8));

        ctx.save();

        ctx.fillStyle = "#080605";
        ctx.fillRect(0, 0, w, h);

        // Light eruption from behind doors (Crimson & Silver)
        if (doorOpenProgress > 0) {
          const beamWidth = doorOpenProgress * 420;
          const beamGrad = ctx.createLinearGradient(cx, 200, cx, 1400);
          beamGrad.addColorStop(0, "rgba(235, 40, 40, 0.75)");
          beamGrad.addColorStop(0.35, "rgba(220, 235, 255, 0.65)");
          beamGrad.addColorStop(0.7, "rgba(180, 20, 20, 0.45)");
          beamGrad.addColorStop(1, "transparent");

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(cx - beamWidth * 0.2, 280);
          ctx.lineTo(cx + beamWidth * 0.2, 280);
          ctx.lineTo(cx + beamWidth, 1400);
          ctx.lineTo(cx - beamWidth, 1400);
          ctx.closePath();
          ctx.fill();
        }

        // Giant Stone / Iron Doors Splitting
        const doorW = 420;
        const doorH = 1100;
        const doorY = 320;

        ctx.fillStyle = "#191512";
        ctx.strokeStyle = "#3E3228";
        ctx.lineWidth = 4;
        const leftDoorX = cx - doorW - doorOpenProgress * 260;
        ctx.fillRect(leftDoorX, doorY, doorW, doorH);
        ctx.strokeRect(leftDoorX, doorY, doorW, doorH);

        const rightDoorX = cx + doorOpenProgress * 260;
        ctx.fillRect(rightDoorX, doorY, doorW, doorH);
        ctx.strokeRect(rightDoorX, doorY, doorW, doorH);

        // Warden Stepping Forward
        if (wardenImgRef.current && wardenImgRef.current.complete) {
          const scale = 1.15 + sceneProgress * 0.12;
          const imgW = 720 * scale;
          const imgH = 1040 * scale;
          const imgX = cx - imgW / 2;
          const imgY = 660 - imgH / 2;

          ctx.save();
          ctx.drawImage(wardenImgRef.current, imgX, imgY, imgW, imgH);
          ctx.restore();
        }

        if (showSubtitles && t >= 11.8 && t <= 16.5) {
          drawSubtitleBox(
            ctx,
            cx,
            1620,
            "THE WARDEN",
            '"Finally... the wait is over."'
          );
        }

        ctx.restore();
      }

      // ==========================================
      // SCENE 4: OFFICIAL LAUNCH REVEAL (17.0s – 23.0s)
      // ==========================================
      else if (t >= 17.0 && t < 23.0) {
        const sceneProgress = (t - 17.0) / 6.0;
        const flashAlpha = Math.max(0, 1 - (t - 17.0) / 0.45);

        ctx.save();

        const darkGrad = ctx.createRadialGradient(
          cx,
          cy - 80,
          50,
          cx,
          cy - 80,
          850
        );
        darkGrad.addColorStop(0, "#241410");
        darkGrad.addColorStop(0.5, "#140D0A");
        darkGrad.addColorStop(1, "#080605");
        ctx.fillStyle = darkGrad;
        ctx.fillRect(0, 0, w, h);

        // Floating Ember Particles
        ctx.fillStyle = "rgba(245, 158, 11, 0.75)";
        for (let i = 0; i < 60; i++) {
          const px = (Math.sin(i * 17 + t * 0.8) * 0.5 + 0.5) * w;
          const py = (i * 37 + (23 - t) * 110) % h;
          const size = (i % 4) + 2;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }

        // The Official Circular Emblem
        if (emblemImgRef.current && emblemImgRef.current.complete) {
          const emblemScale = 0.85 + Math.sin(sceneProgress * Math.PI) * 0.08;
          const embW = 460 * emblemScale;
          const embH = 460 * emblemScale;
          const embX = cx - embW / 2;
          const embY = 560 - embH / 2;

          ctx.save();
          ctx.shadowColor = "rgba(16, 185, 129, 0.6)";
          ctx.shadowBlur = 35;
          ctx.drawImage(emblemImgRef.current, embX, embY, embW, embH);
          ctx.restore();
        }

        // Light Sweep Beam across Logo
        const sweepX = (sceneProgress * 2.2 - 0.6) * w;
        const sweepGrad = ctx.createLinearGradient(
          sweepX - 80,
          0,
          sweepX + 80,
          0
        );
        sweepGrad.addColorStop(0, "transparent");
        sweepGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.55)");
        sweepGrad.addColorStop(1, "transparent");
        ctx.fillStyle = sweepGrad;
        ctx.fillRect(0, 320, w, 480);

        ctx.save();
        ctx.textAlign = "center";

        ctx.fillStyle = "#FAF7F2";
        ctx.font = "900 68px Newsreader, Georgia, serif";
        ctx.letterSpacing = "0.24em";
        ctx.shadowColor = "rgba(255, 255, 255, 0.65)";
        ctx.shadowBlur = 24;
        ctx.fillText("THE UNWRITTEN", cx, 960);

        ctx.font = "900 36px monospace";
        ctx.letterSpacing = "0.32em";
        ctx.fillStyle = "#34D399";
        ctx.shadowColor = "rgba(52, 211, 153, 0.8)";
        ctx.shadowBlur = 18;
        ctx.fillText("★ OFFICIALLY LIVE ★", cx, 1050);

        ctx.font = "700 24px monospace";
        ctx.fillStyle = "#DDD4C5";
        ctx.letterSpacing = "0.22em";
        ctx.fillText("PSYCHOLOGICAL MULTIPLAYER MYSTERY", cx, 1120);

        ctx.restore();

        if (showSubtitles && t >= 17.6 && t <= 22.4) {
          drawSubtitleBox(
            ctx,
            cx,
            1620,
            "THE WARDEN",
            '"THE UNWRITTEN is officially LIVE!"'
          );
        }

        if (flashAlpha > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.fillRect(0, 0, w, h);
        }

        ctx.restore();
      }

      // ==========================================
      // SCENE 5: THE INVITATION (23.0s – 30.0s)
      // ==========================================
      else if (t >= 23.0 && t <= 30.0) {
        const sceneProgress = (t - 23.0) / 7.0;
        const fadeToBlack = Math.max(0, (t - 28.2) / 1.6);

        ctx.save();

        ctx.fillStyle = "#0B0907";
        ctx.fillRect(0, 0, w, h);

        if (wardenImgRef.current && wardenImgRef.current.complete) {
          const scale = 1.35 + sceneProgress * 0.38;
          const imgW = 720 * scale;
          const imgH = 1040 * scale;
          const imgX = cx - imgW / 2;
          const imgY = 440 - imgH / 2;

          ctx.save();
          ctx.drawImage(wardenImgRef.current, imgX, imgY, imgW, imgH);
          ctx.restore();
        }

        if (showSubtitles && t >= 23.4 && t < 28.2) {
          drawSubtitleBox(
            ctx,
            cx,
            1620,
            "THE WARDEN",
            '"Go check it out, experience the game, and don\'t forget to leave your honest review. I want to know what you think. I\'ll see you inside."'
          );
        }

        if (fadeToBlack > 0) {
          ctx.fillStyle = `rgba(8, 6, 5, ${Math.min(1, fadeToBlack)})`;
          ctx.fillRect(0, 0, w, h);

          if (t >= 28.5) {
            const slateAlpha = Math.min(1, (t - 28.5) / 0.8);
            ctx.save();
            ctx.globalAlpha = slateAlpha;
            ctx.textAlign = "center";

            if (emblemImgRef.current && emblemImgRef.current.complete) {
              const embSize = 220;
              ctx.drawImage(
                emblemImgRef.current,
                cx - embSize / 2,
                620,
                embSize,
                embSize
              );
            }

            ctx.fillStyle = "#FAF7F2";
            ctx.font = "900 64px Newsreader, Georgia, serif";
            ctx.letterSpacing = "0.28em";
            ctx.fillText("THE UNWRITTEN", cx, 980);

            ctx.fillStyle = "#10B981";
            ctx.font = "900 36px monospace";
            ctx.letterSpacing = "0.36em";
            ctx.fillText("PLAY NOW", cx, 1060);

            ctx.fillStyle = "#DDD4C5";
            ctx.font = "italic 400 30px Newsreader, Georgia, serif";
            ctx.letterSpacing = "0.22em";
            ctx.fillText("WHERE SILENCE SPEAKS.", cx, 1140);

            ctx.font = "700 20px monospace";
            ctx.fillStyle = "#A89F93";
            ctx.letterSpacing = "0.18em";
            ctx.fillText("thegameunwritten.vercel.app", cx, 1220);

            ctx.restore();
          }
        }

        ctx.restore();
      }
    },
    [
      isMuted,
      showSubtitles,
      playHeartbeat,
      playDoorRumble,
      playImpactBoom,
      speakDialogue,
    ]
  );

  // Animation Loop Handler
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimestampRef.current = null;
      renderFrame(currentTime);
      return;
    }

    const loop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= 30.0) {
          setIsPlaying(false);
          return 30.0;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, renderFrame, currentTime]);

  useEffect(() => {
    renderFrame(currentTime);
  }, [currentTime, renderFrame]);

  const handleTogglePlay = () => {
    initAudio();
    if (currentTime >= 30.0) {
      spokenFlagsRef.current = {};
      setCurrentTime(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    spokenFlagsRef.current = {};
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleJumpToScene = (targetSecond: number) => {
    initAudio();
    spokenFlagsRef.current = {};
    setCurrentTime(targetSecond);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  // Video Export / MediaRecorder implementation
  const handleRecordVideo = async () => {
    initAudio();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRecording(true);
    setRecordProgress(0);
    setHasRecorded(false);
    handleReset();

    try {
      const stream = canvas.captureStream(30);

      if (audioCtxRef.current && masterGainRef.current) {
        const dest = audioCtxRef.current.createMediaStreamDestination();
        masterGainRef.current.connect(dest);
        const aTrack = dest.stream.getAudioTracks()[0];
        if (aTrack) stream.addTrack(aTrack);
      }

      const mimeType = MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus"
      )
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "THE_UNWRITTEN_OFFICIAL_LAUNCH_30S.webm";
        a.click();
        setIsRecording(false);
        setHasRecorded(true);
      };

      recorder.start();
      setIsPlaying(true);

      const interval = setInterval(() => {
        setCurrentTime((t) => {
          setRecordProgress(Math.min(100, Math.round((t / 30) * 100)));
          if (t >= 30) {
            clearInterval(interval);
            recorder.stop();
            setIsPlaying(false);
          }
          return t;
        });
      }, 100);
    } catch {
      setIsRecording(false);
      alert(
        "Recording format not supported in this browser. You can still watch and enjoy the trailer directly!"
      );
    }
  };

  const formatSec = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec % 1) * 10);
    return `00:${String(s).padStart(2, "0")}.${ms}`;
  };

  return (
    <div className="min-h-screen bg-[#0D0A08] text-[#FAF7F2] flex flex-col items-center justify-between p-3 sm:p-6 selection:bg-amber-400 selection:text-black font-sans">
      {/* Top Bar Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 border-b border-[#3E3228] mb-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-[#A89F93] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to The Unwritten</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
            Official 30s Launch Trailer
          </span>
        </div>
      </header>

      {/* Main Video Viewport & Controls Grid */}
      <main className="flex-1 w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-10 py-2">
        {/* Left Column: 9:16 Vertical Video Monitor Frame */}
        <div className="relative flex flex-col items-center shrink-0">
          <div className="relative rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.95)] border-4 border-[#544333] ring-2 ring-amber-500/20 bg-black aspect-[9/16] w-[290px] sm:w-[340px] md:w-[380px]">
            <canvas
              ref={canvasRef}
              width={1080}
              height={1920}
              className="w-full h-full object-contain cursor-pointer select-none"
              onClick={handleTogglePlay}
            />

            {/* Play Overlay if Paused */}
            {!isPlaying && (
              <div
                onClick={handleTogglePlay}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center cursor-pointer transition-opacity"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400/90 text-black flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)] transform hover:scale-105 active:scale-95 transition-transform">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-black" />
                </div>
              </div>
            )}

            {/* Recording Watermark / Indicator */}
            {isRecording && (
              <div className="absolute top-3 left-3 bg-rose-600/90 border border-white text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5 shadow animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>RECORDING ({recordProgress}%)</span>
              </div>
            )}

            {/* Top Right Aspect Badge */}
            <div className="absolute top-3 right-3 bg-black/60 border border-white/20 text-[#DDD4C5] px-2 py-0.5 rounded text-[10px] font-mono">
              9:16 VERTICAL
            </div>
          </div>
        </div>

        {/* Right Column: Master Studio Director Controls */}
        <div className="flex-1 w-full max-w-lg space-y-5 bg-[#171310] border-2 border-[#4E3F30] rounded-2xl p-5 sm:p-7 shadow-2xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400 font-bold">
                Official Video Control Deck
              </span>
              <span className="font-mono text-sm text-emerald-300 font-black">
                {formatSec(currentTime)} / 00:30.0
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-white mt-1">
              THE UNWRITTEN Launch
            </h1>
            <p className="text-xs text-[#DDD4C5] mt-1 leading-relaxed">
              Cinematic announcement starring The Warden. Built for Instagram Reels,
              YouTube Shorts, and TikTok.
            </p>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-[#A89F93]">
              <span>00:00</span>
              <span className="text-amber-300 font-bold">
                Scene{" "}
                {currentTime < 5
                  ? 1
                  : currentTime < 11
                  ? 2
                  : currentTime < 17
                  ? 3
                  : currentTime < 23
                  ? 4
                  : 5}
              </span>
              <span>00:30</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                spokenFlagsRef.current = {};
                setCurrentTime(parseFloat(e.target.value));
              }}
              className="w-full accent-amber-400 h-2 bg-[#28211A] rounded-lg cursor-pointer"
            />
          </div>

          {/* Scene Jump Buttons */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A89F93] block font-bold">
              Storyboard Scenes:
            </span>
            <div className="grid grid-cols-5 gap-1.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => handleJumpToScene(0)}
                className={`py-1.5 px-1 rounded border text-center transition-colors ${
                  currentTime < 5
                    ? "bg-amber-400 text-black font-black border-white shadow"
                    : "bg-[#241D17] text-[#DDD4C5] border-[#544333] hover:border-amber-400"
                }`}
              >
                1. Wait
              </button>
              <button
                type="button"
                onClick={() => handleJumpToScene(5)}
                className={`py-1.5 px-1 rounded border text-center transition-colors ${
                  currentTime >= 5 && currentTime < 11
                    ? "bg-amber-400 text-black font-black border-white shadow"
                    : "bg-[#241D17] text-[#DDD4C5] border-[#544333] hover:border-amber-400"
                }`}
              >
                2. Intro
              </button>
              <button
                type="button"
                onClick={() => handleJumpToScene(11)}
                className={`py-1.5 px-1 rounded border text-center transition-colors ${
                  currentTime >= 11 && currentTime < 17
                    ? "bg-amber-400 text-black font-black border-white shadow"
                    : "bg-[#241D17] text-[#DDD4C5] border-[#544333] hover:border-amber-400"
                }`}
              >
                3. Gate
              </button>
              <button
                type="button"
                onClick={() => handleJumpToScene(17)}
                className={`py-1.5 px-1 rounded border text-center transition-colors ${
                  currentTime >= 17 && currentTime < 23
                    ? "bg-amber-400 text-black font-black border-white shadow"
                    : "bg-[#241D17] text-[#DDD4C5] border-[#544333] hover:border-amber-400"
                }`}
              >
                4. Live!
              </button>
              <button
                type="button"
                onClick={() => handleJumpToScene(23)}
                className={`py-1.5 px-1 rounded border text-center transition-colors ${
                  currentTime >= 23
                    ? "bg-amber-400 text-black font-black border-white shadow"
                    : "bg-[#241D17] text-[#DDD4C5] border-[#544333] hover:border-amber-400"
                }`}
              >
                5. Outro
              </button>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider py-3 px-5 rounded-lg border-2 border-white shadow-[0_0_20px_rgba(251,191,36,0.5)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 fill-black" />
              )}
              <span>
                {isPlaying
                  ? "Pause Video"
                  : currentTime >= 30
                  ? "Replay Video"
                  : "Play Video"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="bg-[#2A231C] hover:bg-[#382E25] text-white border-2 border-[#544333] p-3 rounded-lg cursor-pointer transition-colors"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                isMuted
                  ? "bg-rose-950/60 border-rose-500 text-rose-300"
                  : "bg-[#2A231C] border-[#544333] text-emerald-300"
              }`}
              title={isMuted ? "Unmute Audio & Voice" : "Mute Audio"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Subtitles & Recording Suite */}
          <div className="pt-3 border-t border-[#382E25] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-mono text-[#DDD4C5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSubtitles}
                  onChange={(e) => setShowSubtitles(e.target.checked)}
                  className="accent-amber-400 rounded cursor-pointer"
                />
                <span>Burn-in Subtitles &amp; Captions</span>
              </label>

              <span className="text-[10px] font-mono text-[#A89F93]">
                24 FPS · 1080×1920
              </span>
            </div>

            {/* Direct Video Download Button */}
            <button
              type="button"
              disabled={isRecording}
              onClick={handleRecordVideo}
              className={`w-full py-3 px-4 rounded-lg font-black text-xs uppercase tracking-wider border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isRecording
                  ? "bg-rose-600 text-white border-white animate-pulse"
                  : hasRecorded
                  ? "bg-emerald-600 text-white border-white hover:bg-emerald-500"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-white shadow-lg"
              }`}
            >
              {isRecording ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Recording Video ({recordProgress}%)... Please Wait</span>
                </>
              ) : hasRecorded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Download Again (.webm 9:16)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Record &amp; Download Video (.webm)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-5xl py-2 border-t border-[#3E3228] flex items-center justify-between text-[11px] font-mono text-[#A89F93]">
        <span>THE UNWRITTEN · OFFICIAL LAUNCH CAMPAIGN</span>
        <span>WHERE SILENCE SPEAKS</span>
      </footer>
    </div>
  );
}
