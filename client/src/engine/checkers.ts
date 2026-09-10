export type PieceColor = 'WHITE' | 'BLACK';

export enum PieceType {
  EMPTY = 0,
  WHITE_MAN = 1,
  WHITE_KING = 2,
  BLACK_MAN = 3,
  BLACK_KING = 4,
}

export interface Move {
  from: number;
  to: number;
  captured?: number;
}

export interface MoveResult {
  isValid: boolean;
  errorReason?: string;
  capturedPositions: number[];
  hasMoreJumps: boolean;
  promotedToKing?: boolean;
}

export class CheckersEngine {
  private board: PieceType[] = [];

  constructor(initialBoard?: PieceType[]) {
    if (initialBoard && initialBoard.length === 64) {
      this.board = [...initialBoard];
    } else {
      this.resetBoard();
    }
  }

  public resetBoard(): void {
    this.board = new Array(64).fill(PieceType.EMPTY);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          const index = row * 8 + col;
          if (row < 3) {
            this.board[index] = PieceType.BLACK_MAN;
          } else if (row > 4) {
            this.board[index] = PieceType.WHITE_MAN;
          }
        }
      }
    }
  }

  public getBoard(): PieceType[] {
    return [...this.board];
  }

  public setBoard(newBoard: PieceType[]): void {
    if (newBoard.length === 64) {
      this.board = [...newBoard];
    }
  }

  public isWhite(p: PieceType): boolean {
    return p === PieceType.WHITE_MAN || p === PieceType.WHITE_KING;
  }

  public isBlack(p: PieceType): boolean {
    return p === PieceType.BLACK_MAN || p === PieceType.BLACK_KING;
  }

  public isKing(p: PieceType): boolean {
    return p === PieceType.WHITE_KING || p === PieceType.BLACK_KING;
  }

  public getAvailableCaptures(color: PieceColor, fromIndex?: number): Move[] {
    const captures: Move[] = [];
    const indices = fromIndex !== undefined ? [fromIndex] : Array.from({ length: 64 }, (_, i) => i);

    const directions = [
      [-1, -1], [-1, 1],
      [1, -1], [1, 1]
    ];

    for (const idx of indices) {
      const piece = this.board[idx];
      if (piece === PieceType.EMPTY) continue;
      if (color === 'WHITE' && !this.isWhite(piece)) continue;
      if (color === 'BLACK' && !this.isBlack(piece)) continue;

      const r = Math.floor(idx / 8);
      const c = idx % 8;
      const isKing = this.isKing(piece);

      if (!isKing) {
        for (const [dr, dc] of directions) {
          const midR = r + dr;
          const midC = c + dc;
          const targetR = r + dr * 2;
          const targetC = c + dc * 2;

          if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
            const midIdx = midR * 8 + midC;
            const targetIdx = targetR * 8 + targetC;
            const midPiece = this.board[midIdx];

            const isOpponent = color === 'WHITE' ? this.isBlack(midPiece) : this.isWhite(midPiece);
            if (isOpponent && this.board[targetIdx] === PieceType.EMPTY) {
              captures.push({ from: idx, to: targetIdx, captured: midIdx });
            }
          }
        }
      } else {
        // Flying King
        for (const [dr, dc] of directions) {
          let step = 1;
          let enemyFound = -1;

          while (true) {
            const currR = r + dr * step;
            const currC = c + dc * step;
            if (currR < 0 || currR >= 8 || currC < 0 || currC >= 8) break;

            const currIdx = currR * 8 + currC;
            const currPiece = this.board[currIdx];

            if (currPiece !== PieceType.EMPTY) {
              const isOpponent = color === 'WHITE' ? this.isBlack(currPiece) : this.isWhite(currPiece);
              if (isOpponent && enemyFound === -1) {
                enemyFound = currIdx;
              } else {
                break;
              }
            } else if (enemyFound !== -1) {
              captures.push({ from: idx, to: currIdx, captured: enemyFound });
            }
            step++;
          }
        }
      }
    }

    return captures;
  }

  public getAvailableSimpleMoves(color: PieceColor): Move[] {
    const moves: Move[] = [];

    for (let idx = 0; idx < 64; idx++) {
      const piece = this.board[idx];
      if (piece === PieceType.EMPTY) continue;
      if (color === 'WHITE' && !this.isWhite(piece)) continue;
      if (color === 'BLACK' && !this.isBlack(piece)) continue;

      const r = Math.floor(idx / 8);
      const c = idx % 8;
      const isKing = this.isKing(piece);

      if (!isKing) {
        const forward = color === 'WHITE' ? -1 : 1;
        for (const dc of [-1, 1]) {
          const targetR = r + forward;
          const targetC = c + dc;
          if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
            const targetIdx = targetR * 8 + targetC;
            if (this.board[targetIdx] === PieceType.EMPTY) {
              moves.push({ from: idx, to: targetIdx });
            }
          }
        }
      } else {
        for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
          let step = 1;
          while (true) {
            const targetR = r + dr * step;
            const targetC = c + dc * step;
            if (targetR < 0 || targetR >= 8 || targetC < 0 || targetC >= 8) break;

            const targetIdx = targetR * 8 + targetC;
            if (this.board[targetIdx] === PieceType.EMPTY) {
              moves.push({ from: idx, to: targetIdx });
            } else {
              break;
            }
            step++;
          }
        }
      }
    }

    return moves;
  }

  public getLegalMovesForPiece(idx: number, color: PieceColor, forcedPieceIdx?: number): number[] {
    if (forcedPieceIdx !== undefined && forcedPieceIdx !== idx) {
      return [];
    }

    const captures = this.getAvailableCaptures(color, forcedPieceIdx);
    if (captures.length > 0) {
      return captures.filter(m => m.from === idx).map(m => m.to);
    }

    if (forcedPieceIdx !== undefined) {
      return [];
    }

    const simpleMoves = this.getAvailableSimpleMoves(color);
    return simpleMoves.filter(m => m.from === idx).map(m => m.to);
  }

  public getPiecesThatCanCapture(color: PieceColor, forcedPieceIdx?: number): number[] {
    const captures = this.getAvailableCaptures(color, forcedPieceIdx);
    return Array.from(new Set(captures.map(m => m.from)));
  }

  public getPieceCounts(): { white: number; black: number; whiteKings: number; blackKings: number } {
    let white = 0;
    let black = 0;
    let whiteKings = 0;
    let blackKings = 0;

    for (const p of this.board) {
      if (p === PieceType.WHITE_MAN) white++;
      else if (p === PieceType.WHITE_KING) { white++; whiteKings++; }
      else if (p === PieceType.BLACK_MAN) black++;
      else if (p === PieceType.BLACK_KING) { black++; blackKings++; }
    }

    return { white, black, whiteKings, blackKings };
  }
}
