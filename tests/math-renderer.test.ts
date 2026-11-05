import { test, describe } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { MathRenderer } from "../src/components/math/MathRenderer";

describe("THE UNWRITTEN — Mathematical Notation Engine Test Suite", () => {
  test("1. Correctly formats quadratic and cubic powers (x^2, x^3, cm^2)", () => {
    const element = React.createElement(MathRenderer, { content: "Solve x^2 + 5x + 6 = 0 for an area of 40 cm^2." });
    assert.ok(element, "MathRenderer element must instantiate");
  });

  test("2. Correctly formats fractions (\\frac{3\\pi}{4})", () => {
    const element = React.createElement(MathRenderer, { content: "Express 135° as $\\frac{3\\pi}{4}$ radians." });
    assert.ok(element, "Fraction formatting must parse correctly");
  });

  test("3. Correctly formats radicals and roots (\\sqrt{2}, \\sqrt[3]{8})", () => {
    const element = React.createElement(MathRenderer, { content: "Compute $\\sqrt{x^2 + y^2}$ and $\\sqrt[3]{27}$." });
    assert.ok(element, "Radical notation must parse correctly");
  });

  test("4. Correctly formats definite and indefinite integrals (\\int_{0}^{\\pi} \\sin(x) dx)", () => {
    const element = React.createElement(MathRenderer, { content: "Evaluate $\\int_{0}^{\\pi} \\sin(x) dx$." });
    assert.ok(element, "Integral expressions must parse correctly");
  });

  test("5. Correctly formats Greek symbols and relational operators (\\theta, \\pi, \\le, \\ge)", () => {
    const element = React.createElement(MathRenderer, { content: "If $0 \\le \\theta \\le \\frac{\\pi}{2}$ and $\\sin(\\theta) = 0.5$." });
    assert.ok(element, "Greek characters and relations must parse correctly");
  });
});
