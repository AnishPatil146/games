# Junior Mode — Question Engine & Non-Repeating Integrity

## 1. Zero Repetition Guarantee
The Question Engine implements an exhaustive cycle algorithm:
- Every subject holds 100 verified questions mapped to syllabus chapters.
- When an attempt begins, the engine selects 10 questions strictly from the participant's **unseen pool** within the active cycle.
- Questions completed in previous attempts are excluded until all 100 questions have been solved.
- Upon completing 100 questions, the cycle increments (Cycle 1 -> Cycle 2) and the pool refreshes.
- Participants can also manually invoke "Reset Cycle" at any time from the subject card.

## 2. Evidence-Mapped Ability Scoring
Each question is tagged with primary and secondary cognitive dimensions:
- *Science*: Empirical Reasoning, Formal Proof & Deduction, Dimensional Analysis, Mechanistic Thinking.
- *Commerce*: Numerical Precision, Statutory & Contractual Acumen, Procedural & Regulatory Compliance, Financial Prudence.
- *Arts*: Historical Contextualization, Spatial & Ecological Reasoning, Institutional Analysis, Analytical Empathy, Sociological Scrutiny.

To prevent erratic profiling, a qualitative ability band ("Strong", "Consistent", "Developing") is computed only when at least 2 questions mapped to that dimension have been answered in the attempt. Otherwise, it gracefully displays "Insufficient Sample".
