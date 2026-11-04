/**
 * Chess Service for THE UNWRITTEN
 * Powers Count Vesper's Gambit and chess challenges with full FEN parsing,
 * legal move generation, check/checkmate detection via chess.js, and external Stockfish integration.
 */

import { Chess, type Square, type PieceSymbol, type Color } from "chess.js";

export interface ChessBoardSquare {
  square: Square;
  piece: {
    type: PieceSymbol;
    color: Color;
  } | null;
}

export interface TacticalPuzzle {
  id: string;
  title: string;
  opponent: string;
  description: string;
  initialFen: string;
  playerColor: "w" | "b";
  // Sequence of SAN moves representing player move -> opponent response -> player move -> ...
  solutionMoves: string[];
  explanation: string;
}

export const COUNT_VESPER_PUZZLES: TacticalPuzzle[] = [
  {
    id: "vesper_immortal_mate",
    title: "Count Vesper's Gambit: Mate in 2",
    opponent: "Count Vesper",
    description:
      "Vesper smiles as he takes your Queen on d1. 'Checkmate is an illusion, mortal,' he sneers. Prove him wrong: White to move and mate in 2.",
    initialFen: "r2qkb1r/pp2nppp/3p4/2pNN3/2B1P3/8/PPPP1PPP/R1BbK2R w KQkq - 0 1",
    playerColor: "w",
    solutionMoves: ["Nf6+", "gxf6", "Bxf7#"],
    explanation:
      "Sacrificing the knight with 1. Nf6+ forces Black's pawn to capture (1... gxf6), unblocking the light-squared bishop to deliver 2. Bxf7# checkmate!",
  },
  {
    id: "opera_mate_puzzle",
    title: "The Phantom's Defense: Defeat the Duke",
    opponent: "The Grand Inquisitor",
    description:
      "A classic back-rank breakthrough. White has sacrificed heavily to corner the Black King. Deliver the killing blow.",
    initialFen: "4kb1r/p2rqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
    playerColor: "w",
    solutionMoves: ["Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"],
    explanation:
      "Demolishing the pinned rook on d7 forces a catastrophic pin collapse, ending in a magnificent back-rank mate.",
  },
];

export class ChessService {
  private game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  public getFen(): string {
    return this.game.fen();
  }

  public getTurn(): Color {
    return this.game.turn();
  }

  public isCheck(): boolean {
    return this.game.inCheck();
  }

  public isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  public isDraw(): boolean {
    return this.game.isDraw();
  }

  public isStalemate(): boolean {
    return this.game.isStalemate();
  }

  public isGameOver(): boolean {
    return this.game.isGameOver();
  }

  public getHistory(): string[] {
    return this.game.history();
  }

  /**
   * Returns an 8x8 matrix representing the board from rank 8 to 1, file a to h
   */
  public getBoard(): ChessBoardSquare[][] {
    const rawBoard = this.game.board();
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    return rawBoard.map((row, rIdx) => {
      const rank = 8 - rIdx;
      return row.map((cell, cIdx) => {
        const sq = `${files[cIdx]}${rank}` as Square;
        return {
          square: sq,
          piece: cell ? { type: cell.type, color: cell.color } : null,
        };
      });
    });
  }

  /**
   * Returns legal target squares for a selected piece
   */
  public getLegalMovesForSquare(square: Square): Square[] {
    const moves = this.game.moves({ square, verbose: true });
    return moves.map((m) => m.to as Square);
  }

  /**
   * Executes a move
   */
  public makeMove(
    from: Square,
    to: Square,
    promotion: PieceSymbol = "q"
  ): { success: boolean; san?: string; captured?: PieceSymbol } {
    try {
      const move = this.game.move({ from, to, promotion });
      if (move) {
        return {
          success: true,
          san: move.san,
          captured: move.captured,
        };
      }
    } catch {
      // Invalid move
    }
    return { success: false };
  }

  /**
   * Executes a SAN move (e.g. 'Nf6+')
   */
  public makeSanMove(san: string): boolean {
    try {
      const move = this.game.move(san);
      return !!move;
    } catch {
      return false;
    }
  }

  public undo(): boolean {
    const undone = this.game.undo();
    return !!undone;
  }

  public reset(fen?: string): void {
    if (fen) {
      this.game.load(fen);
    } else {
      this.game.reset();
    }
  }

  /**
   * Queries chess-api.com for Stockfish engine best move recommendations
   */
  public async getEngineMove(): Promise<{ bestMove: string; eval: number | null } | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: this.game.fen(),
          depth: 10,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.san || data.from) {
          return {
            bestMove: data.san || `${data.from}${data.to}`,
            eval: typeof data.eval === "number" ? data.eval : null,
          };
        }
      }
    } catch {
      // API timeout or network block; fallback to first legal move
    }

    // Local fallback: pick a legal move
    const legalMoves = this.game.moves();
    if (legalMoves.length > 0) {
      return {
        bestMove: legalMoves[0],
        eval: null,
      };
    }

    return null;
  }
}

