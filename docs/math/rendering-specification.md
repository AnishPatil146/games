# Mathematical & Scientific Notation Rendering Specification

## 1. Problem Statement & Defect Resolution
Raw plaintext questions previously contained unformatted formulas such as `x^2`, `\sqrt{x}`, `3\pi/4`, and `\frac{a}{b}`. This compromised readability, particularly in advanced physics, chemistry, and mathematics challenges.

## 2. High-Performance MathRenderer Engine
The platform includes a zero-dependency, network-independent typesetting engine (`src/components/math/MathRenderer.tsx`):
- **Inline Delimiters**: Parses `$ ... $` syntax.
- **Display Delimiters**: Parses `$$ ... $$` syntax with centered layout and generous vertical clearance.
- **Syntactic Features**:
  1. *Fractions*: Translates `\frac{num}{den}` into HTML fraction structures with numerator, fraction line, and denominator.
  2. *Radicals*: Formats `\sqrt{expr}` and `\sqrt[n]{expr}` with SVG radical glyphs and vinculum overbars.
  3. *Powers & Indices*: Elevated superscripts (`x^2`, `cm^2`, `e^{-x^2}`) and lowered subscripts (`a_1`, `H_2O`).
  4. *Calculus & Operators*: Integrals (`\int_a^b`), limits (`\lim_{x \to 0}`), summations (`\sum`), products (`\prod`).
  5. *Greek Glyphs*: Renders $\alpha, \beta, \gamma, \theta, \lambda, \pi, \mu, \sigma, \omega, \Delta, \Omega$.
  6. *Mathematical Relations*: $\le, \ge, \ne, \approx, \pm, \mp, \times, \div, \in, \subset, \rightarrow, \iff$.
  7. *Matrix Expressions*: 2x2 and 3x3 array layout.

## 3. Automated Test Verification
Verified by automated test suite `tests/math-renderer.test.ts`:
- Tokenization of mixed text and math.
- Complex nested fractions and square roots.
- Proper fallback for plain prose.
- Superscript and Greek character substitution.

