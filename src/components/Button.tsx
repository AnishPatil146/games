"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "subtle" | "outline" | "danger";
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
    "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-sm";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs tracking-wider uppercase",
    md: "px-5 py-2.5 text-xs sm:text-sm tracking-[0.15em] uppercase",
    lg: "px-8 py-3.5 text-xs sm:text-sm tracking-[0.2em] uppercase font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-[#1C1917] text-[#FAF8F5] hover:bg-[#2C2825] shadow-sm hover:shadow",
    secondary:
      "bg-[#F4EFE7] text-[#1C1917] border border-[#E0D7CB] hover:bg-[#EAE3D6] hover:border-[#8C827A]",
    outline:
      "bg-transparent text-[#1C1917] border border-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF8F5]",
    subtle:
      "bg-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#F2ECE2]",
    danger:
      "bg-[#A37070] text-[#FAF8F5] hover:bg-[#8F5E5E]",
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

