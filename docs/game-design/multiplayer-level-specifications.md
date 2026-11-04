# THE UNWRITTEN — MULTIPLAYER LEVEL SPECIFICATIONS

**Campaign:** THE LAST ALLIANCE  
**Operatives:** 2–4 Players per Room  
**Version:** 2.0.0  
**Updated:** 2026-11-04

---

### Level 1: THE FIRST LOCK
- **Chamber:** The Great Glyph Vault
- **Atmosphere:** Towering obsidian circular vault door with embedded Latin square tiles.
- **Gameplay:**
  - Full playable **9x9 Sudoku Board** (`SudokuBoard.tsx`).
  - Each player in the room deciphers their assigned matrix.
  - Shared round deadline; all players must solve before time expires.
  - Team retries if any operative fails.

### Level 2: THE VAMPIRE'S OFFER
- **Chamber:** The Gothic Chess Hall
- **Atmosphere:** Black-and-ivory marble floor chessboard with Count Vesper perched on a dais.
- **Gameplay:**
  - Full playable **8x8 Chessboard** (`ChessBoard.tsx`) powered by `chess.js`.
  - Count Vesper's Gambit: Mate in 2 tactical sacrifice (`1. Nf6+ gxf6 2. Bxf7#`).
  - Interactive piece movement, legal destination highlights, checkmate victory condition.

### Level 3: MIND SNAP
- **Chamber:** The Bio-Synthetic Clone Labs
- **Atmosphere:** Glass incubation tanks with rapidly cycling genetic formulas.
- **Gameplay:**
  - 4x4 matrix pattern matcher.
  - Operatives identify matching clone specimens under time pressure.

### Level 4: THE IMPOSTER
- **Chamber:** The Declassified Briefing Room
- **Atmosphere:** Dimly lit interrogation round table.
- **Gameplay:**
  - Secret word distribution (Imposter receives an altered word).
  - Synchronized discussion, question exchange, and blind ballot voting.

### Level 5: THE MEMORY VAULT
- **Chamber:** The Dual-Terminal Archive
- **Atmosphere:** Iron cages separating Terminal Alpha and Terminal Beta.
- **Gameplay:**
  - Asymmetric clue sharing: Player 1 receives fragment A; Player 2 receives fragment B.
  - Operatives must verbally coordinate to enter the composite decryption key.

### Level 6: THE HUMAN CHOICE
- **Chamber:** Sub-Level 4 Decontamination Chamber
- **Atmosphere:** Toxic mist rising; decontamination air filters running out.
- **Gameplay:**
  - Collective moral resource allocation: Team consensus gauge determines survivor distribution.

### Level 7: THE BREAKING POINT
- **Chamber:** The High-Voltage Conduit
- **Atmosphere:** Arcing electrical currents, siren klaxons.
- **Gameplay:**
  - High-pressure simultaneous dual-switch hold: Both operatives must coordinate a 5-second synchronized button press.

### Level 8: THE FINAL BETRAYAL
- **Chamber:** The Rooftop Extraction Helipad
- **Atmosphere:** Torrential midnight rain, extraction helicopter searchlight overhead.
- **Gameplay:**
  - The briefcase rests on the pedestal.
  - Secret blind ballot: Cooperate vs. Betray.
  - Matrix calculation determines 1 of 4 team epilogues:
    - Shared Ascension (All Cooperate)
    - Solitary Betrayal (One Betrays)
    - Void of Greed (All Betray)

