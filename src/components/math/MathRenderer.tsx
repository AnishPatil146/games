"use client";

import React from "react";
import { FormulaRenderer, FormulaRendererProps } from "./FormulaRenderer";

/**
 * Backward-compatible MathRenderer component delegating to the central KaTeX FormulaRenderer.
 */
export function MathRenderer(props: FormulaRendererProps) {
  return <FormulaRenderer {...props} />;
}

export default MathRenderer;
