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

    // Dark squares only: (row + col) % 2 === 1
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

  public getPieceColor(p: PieceType): PieceColor | null {
    if (this.isWhite(p)) return 'WHITE';
    if (this.isBlack(p)) return 'BLACK';
    return null;
  }

  /**
   * Majburiy urishlarni qidirish (Captures)
   * Agar fromIndex berilsa, faqat o'sha katakdagi toshning urishlari tekshiriladi (multi-jump uchun)
   */
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
        // Oddiy tosh ham oldinga, ham orqaga qarab sakrab ura oladi
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
        // UCHUVCHI DAMKA (Flying King) urish mantig'i
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
                enemyFound = currIdx; // Birinchi raqib toshi
              } else {
                break; // O'z toshi yoki ketma-ket 2 ta tosh bo'lsa to'siladi
              }
            } else if (enemyFound !== -1) {
              // Raqib toshidan keyingi bo'sh kataklarning barchasiga qo'na oladi
              captures.push({ from: idx, to: currIdx, captured: enemyFound });
            }
            step++;
          }
        }
      }
    }

    return captures;
  }

  /**
   * Oddiy (tinch) yurishlarni topish
   */
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
        // Oqlar yuqoriga (r - 1), Qoralar pastga (r + 1)
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
        // UCHUVCHI DAMKA (Flying king) oddiy harakati
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

  /**
   * Muayyan katakdagi tosh uchun barcha mumkin bo'lgan yurishlar
   * (UI da tosh bosilganda qayerga yurish mumkinligini yashil qilib ko'rsatish uchun)
   */
  public getLegalMovesForPiece(idx: number, color: PieceColor, forcedPieceIdx?: number): number[] {
    if (forcedPieceIdx !== undefined && forcedPieceIdx !== idx) {
      return []; // Agar ketma-ket urish davom etayotgan bo'lsa, boshqa tosh yura olmaydi
    }

    const captures = this.getAvailableCaptures(color, forcedPieceIdx);
    if (captures.length > 0) {
      // Majburiy urishlar mavjud, faqat uradigan kataklar qaytadi
      return captures.filter(m => m.from === idx).map(m => m.to);
    }

    if (forcedPieceIdx !== undefined) {
      return [];
    }

    const simpleMoves = this.getAvailableSimpleMoves(color);
    return simpleMoves.filter(m => m.from === idx).map(m => m.to);
  }

  /**
   * Yurishni amalga oshirish
   */
  public makeMove(from: number, to: number, turnColor: PieceColor, forcedPieceIdx?: number): MoveResult {
    if (forcedPieceIdx !== undefined && forcedPieceIdx !== from) {
      return {
        isValid: false,
        errorReason: 'Ketma-ket tosh urishni aynan shu tosh bilan davom ettirishingiz kerak!',
        capturedPositions: [],
        hasMoreJumps: false
      };
    }

    const availableCaptures = this.getAvailableCaptures(turnColor, forcedPieceIdx);

    if (availableCaptures.length > 0) {
      const match = availableCaptures.find(m => m.from === from && m.to === to);
      if (!match) {
        return {
          isValid: false,
          errorReason: 'Tosh urish majburiy! Belgilangan qoida bo‘yicha toshni urishingiz shart.',
          capturedPositions: [],
          hasMoreJumps: false
        };
      }

      // Harakat va urilgan toshni olish
      const piece = this.board[from];
      this.board[from] = PieceType.EMPTY;
      this.board[match.captured!] = PieceType.EMPTY;
      this.board[to] = piece;

      // Rus shashkasi: agar oddiy tosh oxirgi qatorga borsa, darhol damka bo'ladi!
      const wasPromoted = this.checkPromotion(to, turnColor);

      // Ushbu tosh yana ura oladimi? (Multi-jump combo)
      const nextCaptures = this.getAvailableCaptures(turnColor, to);
      const hasMoreJumps = nextCaptures.length > 0;

      return {
        isValid: true,
        capturedPositions: [match.captured!],
        hasMoreJumps,
        promotedToKing: wasPromoted
      };
    }

    if (forcedPieceIdx !== undefined) {
      return {
        isValid: false,
        errorReason: 'Ushbu tosh bilan boshqa urish yo‘q.',
        capturedPositions: [],
        hasMoreJumps: false
      };
    }

    // Oddiy tinch yurishlar
    const availableSimple = this.getAvailableSimpleMoves(turnColor);
    const validSimple = availableSimple.find(m => m.from === from && m.to === to);

    if (!validSimple) {
      return {
        isValid: false,
        errorReason: 'Noto‘g‘ri yurish! Ushbu katakka borish mumkin emas.',
        capturedPositions: [],
        hasMoreJumps: false
      };
    }

    const piece = this.board[from];
    this.board[from] = PieceType.EMPTY;
    this.board[to] = piece;

    const wasPromoted = this.checkPromotion(to, turnColor);

    return {
      isValid: true,
      capturedPositions: [],
      hasMoreJumps: false,
      promotedToKing: wasPromoted
    };
  }

  private checkPromotion(idx: number, color: PieceColor): boolean {
    const row = Math.floor(idx / 8);
    if (color === 'WHITE' && row === 0 && this.board[idx] === PieceType.WHITE_MAN) {
      this.board[idx] = PieceType.WHITE_KING;
      return true;
    }
    if (color === 'BLACK' && row === 7 && this.board[idx] === PieceType.BLACK_MAN) {
      this.board[idx] = PieceType.BLACK_KING;
      return true;
    }
    return false;
  }

  /**
   * O'yinchi uchun hech qanday harakat qolganmi? (Mag'lubiyatni aniqlash)
   */
  public isGameOver(turnColor: PieceColor): boolean {
    const captures = this.getAvailableCaptures(turnColor);
    if (captures.length > 0) return false;
    const simple = this.getAvailableSimpleMoves(turnColor);
    return simple.length === 0;
  }

  /**
   * Majburiy urish imkoni bor toshlarning indekslarini qaytarish
   */
  public getPiecesThatCanCapture(color: PieceColor, forcedPieceIdx?: number): number[] {
    const captures = this.getAvailableCaptures(color, forcedPieceIdx);
    return Array.from(new Set(captures.map(m => m.from)));
  }

  /**
   * Toshlar sonini hisoblash
   */
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
