"use client";

import React from "react";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "emerald" | "amber" | "rose" | "blue" | "gold" | "default";
  showGlow?: boolean;
  className?: string;
  emptyLabel?: string;
  isLoading?: boolean;
}

const SIZE_CLASSES = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const VARIANT_GRADIENTS = {
  emerald: "from-emerald-600 via-emerald-500 to-teal-400 text-emerald-400",
  amber: "from-amber-600 via-amber-500 to-yellow-400 text-amber-400",
  rose: "from-rose-600 via-rose-500 to-pink-400 text-rose-400",
  blue: "from-blue-600 via-cyan-500 to-sky-400 text-cyan-400",
  gold: "from-amber-700 via-yellow-500 to-amber-300 text-amber-300",
  default: "from-[#8FA184] via-[#545E4E] to-[#7A8A6E] text-[#8FA184]",
};

const GLOW_CLASSES = {
  emerald: "shadow-[0_0_12px_rgba(16,185,129,0.45)]",
  amber: "shadow-[0_0_12px_rgba(245,158,11,0.45)]",
  rose: "shadow-[0_0_12px_rgba(244,63,94,0.45)]",
  blue: "shadow-[0_0_12px_rgba(6,182,212,0.45)]",
  gold: "shadow-[0_0_12px_rgba(251,191,36,0.45)]",
  default: "shadow-[0_0_10px_rgba(143,161,132,0.35)]",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = "md",
  variant = "emerald",
  showGlow = true,
  className = "",
  emptyLabel = "0%",
  isLoading = false,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const rawPct = (value / safeMax) * 100;
  const clampedPct = Math.min(100, Math.max(0, isNaN(rawPct) ? 0 : rawPct));
  const roundedPct = Math.round(clampedPct);

  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.emerald;
  const glow = showGlow ? GLOW_CLASSES[variant] || GLOW_CLASSES.emerald : "";

  return (
    <div className={`w-full space-y-1.5 select-none ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-mono">
          {label && (
            <span className="text-[#DDD4C5] font-medium tracking-wide">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={`font-bold font-mono text-[11px] ${gradient.split(" ").pop()}`}>
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : clampedPct === 0 && emptyLabel ? (
                emptyLabel
              ) : (
                `${roundedPct}%`
              )}
            </span>
          )}
        </div>
      )}

      {/* Accessible High-Contrast Progress Track */}
      <div
        role="progressbar"
        aria-valuenow={roundedPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress indicator"}
        className={`w-full ${SIZE_CLASSES[size]} rounded-full overflow-hidden bg-[#181411] border border-[#3A3027] p-0.5 relative shadow-inner`}
      >
        {/* Shimmer effect for active/loading states */}
        {isLoading ? (
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse rounded-full" />
        ) : (
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out relative ${
              clampedPct > 0 ? glow : ""
            }`}
            style={{
              width: `${clampedPct}%`,
              minWidth: clampedPct > 0 ? "6px" : "0px",
            }}
          >
            {/* Subtle highlight sheen */}
            {clampedPct > 5 && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/25 rounded-full pointer-events-none" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressBar;

