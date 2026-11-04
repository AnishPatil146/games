# THE UNWRITTEN — GAMEPLAY ENGINE ARCHITECTURE

**Standard:** NO GAMEPLAY = NO LEVEL COMPLETION. Every level requires genuine, verifiable interaction.  
**Version:** 2.0.0  
**Updated:** 2026-11-04

---

## 1. Architectural Philosophy

THE UNWRITTEN enforces a strict separation between **Narrative Presentation** (illustrated backgrounds, character dialogue, transitions) and **Authoritative Gameplay Verification** (puzzles, mazes, deductive challenges, chess, and Sudoku).

A scene cannot advance to `LEVEL_COMPLETED` through superficial DOM events, dialogue completion, timer timeouts, or simple continue clicks. The authoritative solver and state machine govern whether a transition is allowed.

```
       +---------------------------------------------+
       |               StoryboardStage               |
       |  (Cinematic Canvas, Dialogue, Hotspots)     |
       +---------------------------------------------+
                              |
                     [Reaches Step with]
                     [ Puzzle Trigger  ]
                              v
       +---------------------------------------------+
       |          ContextualPuzzleOverlay            |
       |   - Mounts Interactive Puzzle Component     |
       |   - Starts Client Timer / Clamping          |
       |   - Blocks Scene Progression (canAdvance=F) |
       +---------------------------------------------+
                              |
             [Player Interacts: Moves / Inputs]
                              |
            +-----------------+-----------------+
            |                                   |
            v                                   v
   [SudokuBoard / ChessBoard /       [Input Validation &]
    InteractiveMaze / DialLock]       [Rules Engine     ]
            |                                   |
       (Valid / Mate / Exit)              (Error / Trap / Blunder)
            v                                   v
     [onComplete Callback]             [Failure State Banner]
            |                             (Requires Explicit Retry)
            v
   [Server-Authoritative Validation]
    - Telemetry Event Logged
    - Next Scene Unlocked
```

---

## 2. Finite State Machine (FSM)

Every chamber/level transitions through the following explicit states:

1. `INTRO`: Initial cinematic backdrop fade-in, camera drift, opening narrator monologue.
2. `SCENE_ACTIVE`: Character dialog steps displayed. Player reads dialogue, observes environment.
3. `INVESTIGATION`: Interactive environmental hotspots enabled. Inspection modals provide clues.
4. `PUZZLE_ACTIVE`: The core gameplay challenge engages (9x9 Sudoku, 8x8 Chess, Navigable Maze, Dial Lock). `canAdvance` is locked to `false`.
5. `SUBMISSION_PENDING`: Solution submitted for mathematical/rules evaluation.
6. `FAILURE`: Invalid moves or incorrect inputs trigger an explicit failure state. Automatic progression is blocked; the player must click **Reset and Retry**.
7. `SUCCESS`: Valid solution verified. Lock disengages, victory banner renders.
8. `LEVEL_COMPLETED`: Transition token issued; state machine unmounts puzzle and transitions to next chamber.

---

## 3. Integration Interface

Each gameplay component implements the standard contract:

```typescript
export interface GameplayComponentProps<TStats> {
  onComplete: (stats: TStats) => void;
  onExit?: () => void;
  title?: string;
  subtitle?: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
}
```

Components never manipulate external global state directly; they communicate through strongly typed callbacks that feed into the session telemetry and server room state.

