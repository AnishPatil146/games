"use client";

import React, { useMemo } from "react";
import katex from "katex";

export interface FormulaRendererProps {
  expression?: string;
  latex?: string;
  content?: string;
  text?: string;
  inline?: boolean;
  displayMode?: boolean;
  className?: string;
  onError?: (err: Error) => void;
}

/**
 * Standardizes mathematical input strings by removing surrounding delimiters
 * and sanitizing common typesetting quirks.
 */
function cleanLatexExpression(raw: string): { cleanExpr: string; isDisplay: boolean } {
  let expr = raw.trim();
  let isDisplay = false;

  if (expr.startsWith("$$") && expr.endsWith("$$")) {
    expr = expr.slice(2, -2).trim();
    isDisplay = true;
  } else if (expr.startsWith("\\[") && expr.endsWith("\\]")) {
    expr = expr.slice(2, -2).trim();
    isDisplay = true;
  } else if (expr.startsWith("$") && expr.endsWith("$")) {
    expr = expr.slice(1, -1).trim();
    isDisplay = false;
  } else if (expr.startsWith("\\(") && expr.endsWith("\\)")) {
    expr = expr.slice(2, -2).trim();
    isDisplay = false;
  }

  // Common LaTeX cleanup for textbook formatting
  expr = expr
    .replace(/×/g, " \\times ")
    .replace(/·/g, " \\cdot ")
    .replace(/÷/g, " \\div ")
    .replace(/±/g, " \\pm ")
    .replace(/≠/g, " \\ne ")
    .replace(/≤/g, " \\le ")
    .replace(/≥/g, " \\ge ")
    .replace(/°C/g, "^{\\circ}\\text{C}")
    .replace(/°/g, "^\\circ")
    .replace(/∛\(([^)]+)\)/g, (_m, g) => `\\sqrt[3]{${g}}`)
    .replace(/∛([0-9a-zA-Z]+)/g, (_m, g) => `\\sqrt[3]{${g}}`)
    .replace(/√\(([^)]+)\)/g, (_m, g) => `\\sqrt{${g}}`)
    .replace(/√([0-9a-zA-Z]+)/g, (_m, g) => `\\sqrt{${g}}`)
    .replace(/\\iff/g, "\\Longleftrightarrow")
    .replace(/\\quad/g, " \\;\\; ")
    .replace(/\\qquad/g, " \\;\\;\\;\\; ");

  return { cleanExpr: expr, isDisplay };
}

/**
 * Reusable Central KaTeX Mathematical Formula Renderer
 * Standardized across Junior Academy, Formula Library, Formula Explorer,
 * Practice Arena, Test Centre, and Academic Reports.
 */
export function FormulaRenderer({
  expression,
  latex,
  content,
  text,
  inline = false,
  displayMode: explicitDisplayMode,
  className = "",
  onError,
}: FormulaRendererProps) {
  const rawInput = latex ?? expression ?? content ?? text ?? "";
  const isInline = explicitDisplayMode !== undefined ? !explicitDisplayMode : inline;

  const renderedHtml = useMemo(() => {
    if (!rawInput.trim()) return "";

    try {
      const { cleanExpr, isDisplay } = cleanLatexExpression(rawInput);
      const displayMode = !isInline && (explicitDisplayMode || isDisplay || rawInput.includes("$$") || rawInput.includes("\\[") || cleanExpr.includes("\\begin{") || cleanExpr.includes("\\frac{"));

      return katex.renderToString(cleanExpr, {
        displayMode,
        throwOnError: false,
        errorColor: "#F87171",
        strict: false,
        trust: false,
        output: "htmlAndMathml",
      });
    } catch (err) {
      if (onError && err instanceof Error) {
        onError(err);
      }
      return null;
    }
  }, [rawInput, inline, onError]);

  if (!rawInput.trim()) {
    return null;
  }

  // Graceful fallback if KaTeX rendering fails
  if (!renderedHtml) {
    return (
      <span className={`font-mono text-xs text-amber-200/90 ${className}`}>
        {rawInput.replace(/[$$\\]/g, "")}
      </span>
    );
  }

  return (
    <span
      className={`katex-math-render inline-block max-w-full overflow-x-auto align-middle scrollbar-thin scrollbar-thumb-zinc-700 py-0.5 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

export default FormulaRenderer;
