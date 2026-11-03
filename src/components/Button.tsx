"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "subtle" | "outline" | "danger" | "ivory";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-45 disabled:pointer-events-none disabled:active:scale-100 rounded-sm focus-visible:outline-2 focus-visible:outline-[#545E4E] focus-visible:outline-offset-2";

  const sizeStyles = {
    sm: "px-3.5 py-2 text-[11px] tracking-[0.16em] uppercase",
    md: "px-5 py-2.5 text-xs tracking-[0.18em] uppercase",
    lg: "px-8 py-4 text-xs sm:text-[13px] tracking-[0.22em] uppercase font-medium",
  };

  const variantStyles = {
    primary:
      "bg-[#1C1917] text-[#FAF7F2] hover:bg-[#2E2925] border border-[#1C1917]",
    ivory:
      "bg-[#FAF7F2] text-[#12100E] hover:bg-[#EDE6DA] border border-[#FAF7F2]",
    secondary:
      "bg-[#F3EDE2] text-[#1C1917] border border-[#DDD4C5] hover:bg-[#E7E0D3] hover:border-[#8A8178]",
    outline:
      "bg-transparent text-[#1C1917] border border-[#1C1917]/80 hover:bg-[#1C1917] hover:text-[#FAF7F2]",
    subtle:
      "bg-transparent text-[#57524C] hover:text-[#1C1917] hover:bg-[#F3EDE2]",
    danger:
      "bg-[#9E6B68] text-[#FAF7F2] border border-[#9E6B68] hover:bg-[#875855]",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
