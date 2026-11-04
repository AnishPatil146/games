# THE UNWRITTEN — AUTONOMOUS GAMEPLAY & VISUAL IMPLEMENTATION PLAN

**Standard:** 5 Hints Per Round • One Final Submission with Failure Explanation • Pervasive Exit Confirmation  
**Version:** 2.1.0  
**Updated:** 2026-11-04

---

## 1. Five Hints Architecture (`src/lib/gameplay/hints-data.ts`)

Every round in Solo (8 rounds) and Multiplayer (8 rounds) provides exactly **5 progressive hints**:
- `HINTS AVAILABLE: 5 / 5`
- Clicking "Use Hint" reveals the next progressive tier and decrements the remaining count:
  - **Tier 1 (Orientation):** Broad environmental or strategic framing.
  - **Tier 2 (Observation):** Key clue highlighted from the room or board.
  - **Tier 3 (Reasoning):** The logical constraint or candidate elimination deduction.
  - **Tier 4 (Strong Clue):** Tactical candidate square, sector, or contradiction pinpointed.
  - **Tier 5 (Specific Guidance):** Step-by-step resolution walkthrough without auto-filling the final answer.

---

## 2. One Final Submission with Comprehensive Failure Rationale

Per-round submission policy:
1. Unlimited exploration/interaction before final submission (e.g. moving chess pieces, trying draft numbers in Sudoku, navigating corridors in the maze).
2. Submitting the final answer:
   - If **Valid**:
     - Locks in victory.
     - Displays success breakdown explaining why the answer succeeded.
     - Persists completion telemetry.
     - Advances to the next chamber.
   - If **Invalid**:
     - Final submission is locked.
     - Status marked as `FAILED`.
     - Displays comprehensive failure debrief:
       - **Your Submission:** What was entered or played.
       - **The Correct Solution:** What was required.
       - **Why Your Answer Failed:** Direct explanation of the logical, mechanical, or tactical error.
       - **Why The Correct Solution Works:** Complete deductive or mathematical proof.
     - Provides an explicit "Return to Starting Screen" CTA:
       - Solo returns to Chamber 01 (`/solo`).
       - Multiplayer returns the squad to the war room lobby (`/alliance`).
     - A new run requires explicit player initiation.

---

## 3. Pervasive Exit Confirmation Modal (`src/components/gameplay/ExitConfirmationModal.tsx`)

A prominent **EXIT** button on the top HUD of every screen:
- On click, triggers an in-game modal:
  - **Title:** "ABANDON INVESTIGATION?"
  - **Prompt:** "Are you sure you want to exit? Your eligible progress will be saved."
  - **Buttons:**
    - `Continue Playing` (resumes current position immediately).
    - `Exit to Starting Screen` (gracefully exits without recording an incomplete challenge as a failed submission).

---

## 4. Implementation Steps

1. Create `src/lib/gameplay/hints-data.ts` containing the complete 5-tier hint catalogue for all 16 chambers.
2. Create `src/components/gameplay/ExitConfirmationModal.tsx` and integrate it into `StoryboardStage.tsx`.
3. Create `src/components/gameplay/FailureDebriefModal.tsx` and wire it into `ContextualPuzzleOverlay.tsx`.
4. Update `SudokuBoard.tsx` and `ChessBoard.tsx` with the 5-hint counter and one final submission review.
5. Create `docs/implementation-progress.md` tracking all verified features.
6. Run `npm test`, `npm run lint`, and `npm run build`.
7. Push to GitHub `origin/master` and verify production deployment on Vercel.
