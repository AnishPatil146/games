"use client";

import React, { useMemo } from "react";
import katex from "katex";

export interface MathRendererProps {
  content?: string;
  text?: string;
  expression?: string;
  latex?: string;
  inline?: boolean;
  className?: string;
  onError?: (err: Error) => void;
}

interface ParsedToken {
  type: "text" | "math";
  value: string;
  isBlock?: boolean;
}

/**
 * Transforms ad-hoc textbook and unicode notation into standard LaTeX for KaTeX.
 */
function normalizeMathToLatex(raw: string): { latex: string; trailingPunctuation: string } {
  let expr = raw.trim();

  // Strip trailing punctuation like comma, period, question mark, semicolon
  let trailingPunctuation = "";
  if (/[?,.:;]$/.test(expr)) {
    trailingPunctuation = expr.slice(-1);
    expr = expr.slice(0, -1).trim();
  }

  // Strip enclosing delimiters if present
  if (expr.startsWith("$$") && expr.endsWith("$$")) {
    expr = expr.slice(2, -2).trim();
  } else if (expr.startsWith("\\[") && expr.endsWith("\\]")) {
    expr = expr.slice(2, -2).trim();
  } else if (expr.startsWith("$") && expr.endsWith("$")) {
    expr = expr.slice(1, -1).trim();
  } else if (expr.startsWith("\\(") && expr.endsWith("\\)")) {
    expr = expr.slice(2, -2).trim();
  }

  let latex = expr
    .replace(/×/g, " \\times ")
    .replace(/·/g, " \\cdot ")
    .replace(/÷/g, " \\div ")
    .replace(/±/g, " \\pm ")
    .replace(/≠/g, " \\ne ")
    .replace(/≤/g, " \\le ")
    .replace(/≥/g, " \\ge ")
    .replace(/°/g, "^\\circ")
    .replace(/θ/g, "\\theta ")
    .replace(/π/g, "\\pi ")
    .replace(/μ/g, "\\mu ")
    .replace(/σ/g, "\\sigma ")
    .replace(/Ω/g, "\\Omega ")
    .replace(/λ/g, "\\lambda ")
    .replace(/α/g, "\\alpha ")
    .replace(/β/g, "\\beta ")
    .replace(/\\iff/g, "\\Longleftrightarrow")
    .replace(/\\quad/g, " \\;\\; ")
    .replace(/\\qquad/g, " \\;\\;\\;\\; ");

  // Transform √3 or √(expr) to \sqrt{...}
  latex = latex.replace(/√\(([^)]+)\)/g, (_m, g) => `\\sqrt{${g}}`);
  latex = latex.replace(/√([0-9a-zA-Z]+)/g, (_m, g) => `\\sqrt{${g}}`);

  // Transform ^19, ^-3, ^-19, etc. to ^{...}
  latex = latex.replace(/\^([0-9a-zA-Z\-+]+)/g, (_m, g) => `^{${g}}`);

  // Transform _i, _e, _h to _{...}
  latex = latex.replace(/_([0-9a-zA-Z]+)/g, (_m, g) => `_{${g}}`);

  return { latex, trailingPunctuation };
}

/**
 * Tokenizes strings into standard prose chunks and mathematical KaTeX chunks.
 * Prevents KaTeX math mode from collapsing English prose words into unspaced italic variables.
 */
function tokenizeContent(rawContent: string): ParsedToken[] {
  if (!rawContent || !rawContent.trim()) return [];

  // 1. Explicit LaTeX Delimiters: $...$, $$...$$, \(...\), \[...\]
  if (
    rawContent.includes("$") ||
    rawContent.includes("\\(") ||
    rawContent.includes("\\[") ||
    rawContent.includes("\\frac") ||
    rawContent.includes("\\begin")
  ) {
    const tokens: ParsedToken[] = [];
    const delimRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let hasDelims = false;

    while ((m = delimRegex.exec(rawContent)) !== null) {
      hasDelims = true;
      if (m.index > last) {
        tokens.push({ type: "text", value: rawContent.substring(last, m.index) });
      }
      const math = m[1] || m[2] || m[3] || m[4];
      const isBlock = Boolean(m[1] || m[3]);
      tokens.push({ type: "math", value: math, isBlock });
      last = m.index + m[0].length;
    }

    if (hasDelims) {
      if (last < rawContent.length) {
        tokens.push({ type: "text", value: rawContent.substring(last) });
      }
      return tokens;
    }
  }

  // 2. Pure Math Check: If string contains <= 1 English prose words (options like "√(A^2 + B^2 + AB)" or "4.48 S/m")
  const englishWords = (rawContent.match(/[a-zA-Z]{3,}/g) || []).filter(
    (w) =>
      !["sin", "cos", "tan", "cot", "sec", "csc", "log", "lim", "exp", "det", "deg"].includes(
        w.toLowerCase()
      )
  );

  if (englishWords.length <= 1) {
    return [{ type: "math", value: rawContent }];
  }

  // 3. Mixed Text: Detect equations, piped vector expressions, powers, subscripts, and radicals
  const tokens: ParsedToken[] = [];
  const mathRegex =
    /(\|[^|]+\|\s*=\s*[^,;?]+?(?=\s*(?:,|\band\b|\bwhere\b|\bwith\b|\bfor\b|\btaking\b|(?:\.\s)|(?:\.$)|\?|$))|\|[^|]+\||[a-zA-Zα-ωΑ-Ω][a-zA-Z0-9α-ωΑ-Ω_]*\s*=\s*[^,;?]+?(?=\s*(?:,|\band\b|\bwhere\b|\bwith\b|\bfor\b|\btaking\b|(?:\.\s)|(?:\.$)|\?|$))|[a-zA-Z0-9α-ωΑ-Ω]+(?:[\^_][a-zA-Z0-9\-+{}]+)+|√\([^)]+\)|√[0-9a-zA-Z]+)/gi;

  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = mathRegex.exec(rawContent)) !== null) {
    if (m.index > last) {
      tokens.push({ type: "text", value: rawContent.substring(last, m.index) });
    }
    tokens.push({ type: "math", value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < rawContent.length) {
    tokens.push({ type: "text", value: rawContent.substring(last) });
  }

  return tokens;
}

/**
 * Standardized MathRenderer Component for Junior Academy, Questions,
 * Explanations, Options, and Academic Folios.
 */
export function MathRenderer({
  content,
  text,
  expression,
  latex: latexProp,
  inline = true,
  className = "",
  onError,
}: MathRendererProps) {
  const rawInput = latexProp ?? expression ?? content ?? text ?? "";

  const renderedElements = useMemo(() => {
    if (!rawInput.trim()) return null;

    const tokens = tokenizeContent(rawInput);

    return tokens.map((token, idx) => {
      if (token.type === "text") {
        return (
          <span key={`text-${idx}`} className="align-baseline">
            {token.value}
          </span>
        );
      }

      // Render math snippet with KaTeX
      try {
        const { latex, trailingPunctuation } = normalizeMathToLatex(token.value);
        const displayMode = !inline || Boolean(token.isBlock);

        const html = katex.renderToString(latex, {
          displayMode,
          throwOnError: false,
          errorColor: "#F87171",
          strict: false,
          trust: false,
          output: "htmlAndMathml",
        });

        return (
          <React.Fragment key={`math-${idx}`}>
            <span
              className={`katex-math-render inline-block max-w-full overflow-x-auto overflow-y-hidden align-middle scrollbar-thin scrollbar-thumb-zinc-700 mx-0.5`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {trailingPunctuation && (
              <span className="align-baseline">{trailingPunctuation}</span>
            )}
          </React.Fragment>
        );
      } catch (err) {
        if (onError && err instanceof Error) onError(err);
        return (
          <span key={`math-fallback-${idx}`} className="font-mono text-sm text-amber-200">
            {token.value}
          </span>
        );
      }
    });
  }, [rawInput, inline, onError]);

  if (!rawInput.trim()) return null;

  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={`math-rendered-block select-text ${className}`}>
      {renderedElements}
    </Wrapper>
  );
}

export default MathRenderer;
