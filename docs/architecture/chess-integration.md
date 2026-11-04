# THE UNWRITTEN — CHESS & TACTICAL PUZZLE INTEGRATION

**Standard:** FIDE Legal Compliance via `chess.js`, Tactical Verification & Optional Stockfish Analysis  
**Version:** 2.0.0  
**Updated:** 2026-11-04

---

## 1. Engine Stack

1. **Rules Authority (`chess.js` v1.x):**
   - Full legal move generation for King, Queen, Rook, Bishop, Knight, and Pawn.
   - Castling (kingside/queenside), en passant captures, pawn promotions.
   - In-check, checkmate, stalemate, and three-fold repetition detection.
   - Authoritative FEN representation and SAN generation.

2. **Analysis Provider Integration (`https://chess-api.com/v1`):**
   - Integrated as an optional tactical evaluator.
   - Throttled POST requests with a 4-second AbortController timeout.
   - Graceful local fallback to legal move heuristics when offline or rate-limited.
   - Never responsible for rules legality; only used for hints or opponent evaluations.

---

## 2. Count Vesper's Tactical Challenge

In Alliance Level 2 (**The Vampire's Offer**), Count Vesper challenges operatives on an 8x8 illustrated chessboard:

- **Position FEN:**  
  `r2qkb1r/pp2nppp/3p4/2pNN3/2B1P3/8/PPPP1PPP/R1BbK2R w KQkq - 0 1`
- **Context:**  
  Count Vesper took White's Queen on d1. He believes White is ruined.
- **Winning Sequence (Mate in 2):**
  1. `1. Nf6+` (Knight sacrifice check, forcing `1... gxf6`)
  2. `2. Bxf7#` (Light-squared Bishop strikes delivering forced checkmate!)
- **Player Interaction:**
  - Interactive click-to-select and click-to-move piece controls.
  - Legal move dots rendered in green glow.
  - In puzzle mode, playing `Nf6+` automatically triggers Vesper's forced response (`gxf6`) after 700ms.
  - Delivering `Bxf7#` brings up the victory modal and unlocks the next chamber.
  - Any blunder triggers Vesper's mocking feedback and resets the puzzle position.
