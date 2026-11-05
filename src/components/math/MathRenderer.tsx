"use client";

import React, { useMemo } from "react";

interface MathRendererProps {
  content?: string;
  text?: string;
  inline?: boolean;
  className?: string;
}

// Map of common LaTeX commands to mathematical Unicode symbols
const MATH_SYMBOLS: Record<string, string> = {
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\Delta": "Δ",
  "\\epsilon": "ε",
  "\\theta": "θ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\pi": "π",
  "\\sigma": "σ",
  "\\omega": "ω",
  "\\Omega": "Ω",
  "\\phi": "φ",
  "\\infty": "∞",
  "\\pm": "±",
  "\\times": "×",
  "\\div": "÷",
  "\\cdot": "·",
  "\\le": "≤",
  "\\ge": "≥",
  "\\ne": "≠",
  "\\approx": "≈",
  "\\equiv": "≡",
  "\\to": "→",
  "\\leftarrow": "←",
  "\\rightarrow": "→",
  "\\leftrightarrow": "↔",
  "\\in": "∈",
  "\\notin": "∉",
  "\\subset": "⊂",
  "\\subseteq": "⊆",
  "\\cup": "∪",
  "\\cap": "∩",
  "\\partial": "∂",
  "\\nabla": "∇",
  "\\forall": "∀",
  "\\exists": "∃",
  "\\degree": "°",
};

/**
 * Tokenizes and formats mathematical strings into React elements with
 * proper fractions, superscripts, subscripts, radicals, and integrals.
 */
function renderMathSnippet(mathStr: string): React.ReactNode {
  let str = mathStr.trim();

  // Strip enclosing $ or $$ if present
  if (str.startsWith("$$") && str.endsWith("$$")) {
    str = str.slice(2, -2).trim();
  } else if (str.startsWith("$") && str.endsWith("$")) {
    str = str.slice(1, -1).trim();
  }

  // 1. Check for Fractions: \frac{numerator}{denominator}
  const fracRegex = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g;
  if (fracRegex.test(str)) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    fracRegex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = fracRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderSimpleMath(str.substring(lastIndex, match.index)));
      }
      const num = match[1];
      const den = match[2];
      parts.push(
        <span
          key={`frac-${match.index}`}
          className="inline-flex flex-col text-center align-middle mx-1.5 leading-none text-[0.9em]"
        >
          <span className="border-b border-current pb-0.5 px-1 font-serif italic">
            {renderMathSnippet(num)}
          </span>
          <span className="pt-0.5 px-1 font-serif italic">
            {renderMathSnippet(den)}
          </span>
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
      parts.push(renderSimpleMath(str.substring(lastIndex)));
    }
    return <span className="inline-flex items-center">{parts}</span>;
  }

  // 2. Check for Square Roots: \sqrt{radicand} or \sqrt[n]{radicand}
  const sqrtRegex = /\\sqrt(?:\[([^{}]+)\])?\{([^{}]+)\}/g;
  if (sqrtRegex.test(str)) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    sqrtRegex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = sqrtRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderSimpleMath(str.substring(lastIndex, match.index)));
      }
      const rootIndex = match[1];
      const radicand = match[2];
      parts.push(
        <span
          key={`sqrt-${match.index}`}
          className="inline-flex items-center align-middle mx-1"
        >
          {rootIndex && (
            <sup className="text-[0.65em] -mr-1 font-serif">{rootIndex}</sup>
          )}
          <span className="text-base sm:text-lg font-serif">√</span>
          <span className="border-t border-current px-1 font-serif italic">
            {renderMathSnippet(radicand)}
          </span>
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
      parts.push(renderSimpleMath(str.substring(lastIndex)));
    }
    return <span className="inline-flex items-center">{parts}</span>;
  }

  // 3. Check for Integrals: \int_{a}^{b} or \int f(x) dx
  const intRegex = /\\int(?:_\{?([^{}\s]+)\}?)?(?:\^\{?([^{}\s]+)\}?)?/g;
  if (intRegex.test(str)) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    intRegex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = intRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderSimpleMath(str.substring(lastIndex, match.index)));
      }
      const lower = match[1];
      const upper = match[2];
      parts.push(
        <span
          key={`int-${match.index}`}
          className="inline-flex items-center align-middle mx-1"
        >
          <span className="text-xl sm:text-2xl font-serif leading-none mr-0.5">
            ∫
          </span>
          {(lower || upper) && (
            <span className="inline-flex flex-col text-[0.65em] font-serif leading-tight mr-1">
              {upper && <span className="text-amber-300 font-bold">{upper}</span>}
              {lower && <span className="text-zinc-400">{lower}</span>}
            </span>
          )}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
      parts.push(renderSimpleMath(str.substring(lastIndex)));
    }
    return <span className="inline-flex items-center">{parts}</span>;
  }

  return renderSimpleMath(str);
}

/**
 * Handles superscripts, subscripts, Greek characters, and arithmetic operators
 */
function renderSimpleMath(raw: string): React.ReactNode {
  let text = raw;

  // Replace LaTeX symbol commands
  Object.entries(MATH_SYMBOLS).forEach(([cmd, sym]) => {
    text = text.replaceAll(cmd, sym);
  });

  // Normalize common units: cm^2 -> cm², m/s^2 -> m/s², x^2 -> x², etc.
  text = text.replaceAll(/\^2/g, "²");
  text = text.replaceAll(/\^3/g, "³");
  text = text.replaceAll(/\^0/g, "⁰");
  text = text.replaceAll(/\^1/g, "¹");
  text = text.replaceAll(/\^4/g, "⁴");
  text = text.replaceAll(/\^n/g, "ⁿ");

  // Regex to split on general superscripts x^{y} or subscripts x_{y}
  const subSuperRegex = /([a-zA-Z0-9α-ωΑ-Ω])(?:\^\{?([^{}\s]+)\}?|_\{?([^{}\s]+)\}?)/g;
  if (!subSuperRegex.test(text)) {
    return <span className="font-serif italic tracking-wide">{text}</span>;
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  subSuperRegex.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = subSuperRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }
    const base = match[1];
    const isSuper = match[0].includes("^");
    const val = match[2] || match[3];

    elements.push(
      <span key={`subsuper-${match.index}`} className="inline-flex items-baseline">
        <span className="font-serif italic">{base}</span>
        {isSuper ? (
          <sup className="text-[0.72em] font-serif text-amber-300 font-bold ml-0.5">
            {val}
          </sup>
        ) : (
          <sub className="text-[0.72em] font-serif text-zinc-400 font-bold ml-0.5">
            {val}
          </sub>
        )}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return <span>{elements}</span>;
}

export function MathRenderer({
  content,
  text,
  inline = true,
  className = "",
}: MathRendererProps) {
  const rawContent = content ?? text ?? "";

  const renderedContent = useMemo(() => {
    if (!rawContent) return null;

    // Check if the content has inline LaTeX delimiters ($...$)
    if (rawContent.includes("$")) {
      const parts: React.ReactNode[] = [];
      const regex = /\$\$([^\$]+)\$\$|\$([^\$]+)\$/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(rawContent)) !== null) {
        if (match.index > lastIndex) {
          parts.push(rawContent.substring(lastIndex, match.index));
        }
        const mathPayload = match[1] || match[2];
        const isBlock = !!match[1];

        parts.push(
          <span
            key={`math-${match.index}`}
            className={`${
              isBlock
                ? "block my-2 text-center text-amber-200"
                : "inline-block text-amber-100 font-serif"
            }`}
          >
            {renderMathSnippet(mathPayload)}
          </span>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < rawContent.length) {
        parts.push(rawContent.substring(lastIndex));
      }

      return parts;
    }

    // If no explicit '$', check if the string contains math indicators: ^, _, \sqrt, \int, \frac, °, etc.
    const hasMathIndicators =
      /(\^|_|\\frac|\\sqrt|\\int|\\pi|\\theta|\\alpha|\\beta|°|²|³|√|∫|±|×|≤|≥|≠)/.test(
        rawContent
      );

    if (hasMathIndicators) {
      return renderMathSnippet(rawContent);
    }

    return rawContent;
  }, [rawContent]);

  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={`math-rendered-container select-text ${className}`}>
      {renderedContent}
    </Wrapper>
  );
}
