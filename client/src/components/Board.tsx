import React, { useState, useMemo } from 'react';
import { Crown } from 'lucide-react';
import { CheckersEngine, PieceType, PieceColor } from '../engine/checkers';

interface BoardProps {
  board: PieceType[];
  playerColor: PieceColor | null; // NULL bo'lsa kuzatuvchi
  currentTurn: PieceColor;
  forcedPieceIdx?: number;
  lastMove?: { from: number; to: number };
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  board,
  playerColor,
  currentTurn,
  forcedPieceIdx,
  lastMove,
  onMove,
  disabled = false,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const engine = useMemo(() => new CheckersEngine(board), [board]);

  // Urish imkoni bor toshlarni aniqlash (Majburiy urish datchigi)
  const capturingPieces = useMemo(() => {
    return engine.getPiecesThatCanCapture(currentTurn, forcedPieceIdx);
  }, [engine, currentTurn, forcedPieceIdx]);

  // Tanlangan tosh uchun mumkin bo'lgan kataklar
  const legalMoves = useMemo(() => {
    if (selectedIdx === null) return [];
    return engine.getLegalMovesForPiece(selectedIdx, currentTurn, forcedPieceIdx);
  }, [engine, selectedIdx, currentTurn, forcedPieceIdx]);

  // Doska yo'nalishi (agar o'yinchi Qoralar bo'lsa, doskani 180 daraja burib ko'rsatamiz)
  const isFlipped = playerColor === 'BLACK';

  const handleSquareClick = (index: number) => {
    if (disabled) return;

    // Agar o'yinchi o'z navbati bo'lmasa harakat qila olmaydi
    if (playerColor && playerColor !== currentTurn) return;

    const piece = board[index];
    const isPlayerPiece =
      currentTurn === 'WHITE' ? engine.isWhite(piece) : engine.isBlack(piece);

    // 1. Agar allaqachon tosh tanlangan bo'lsa va bosilgan katak mumkin bo'lgan manzil bo'lsa
    if (selectedIdx !== null && legalMoves.includes(index)) {
      onMove(selectedIdx, index);
      setSelectedIdx(null);
      return;
    }

    // 2. Agar o'z toshini tanlagan bo'lsa
    if (isPlayerPiece) {
      // Agar majburiy tosh bo'lsa (yoki majburiy combo davom etayotgan bo'lsa)
      if (forcedPieceIdx !== undefined && forcedPieceIdx !== index) {
        return; // Faqat shu tosh bilan harakatlanish mumkin
      }

      if (capturingPieces.length > 0 && !capturingPieces.includes(index)) {
        // Boshqa toshni urish kerak
        return;
      }

      setSelectedIdx(index);
    } else {
      setSelectedIdx(null);
    }
  };

  // 8x8 qator va ustunlarni render qilish
  const renderSquares = () => {
    const squares = [];
    const rows = [0, 1, 2, 3, 4, 5, 6, 7];
    const cols = [0, 1, 2, 3, 4, 5, 6, 7];

    if (isFlipped) {
      rows.reverse();
      cols.reverse();
    }

    for (const r of rows) {
      for (const c of cols) {
        const index = r * 8 + c;
        const isDark = (r + c) % 2 === 1;
        const piece = board[index];
        const isSelected = selectedIdx === index;
        const isLegalTarget = legalMoves.includes(index);
        const isMustCapturePiece = capturingPieces.includes(index);
        const isLastMoveSquare = lastMove && (lastMove.from === index || lastMove.to === index);

        squares.push(
          <div
            key={index}
            onClick={() => handleSquareClick(index)}
            className={`relative flex items-center justify-center select-none transition-colors duration-150 ${
              isDark ? 'bg-[#5c3a21]' : 'bg-[#e2cbb2]'
            } ${isLastMoveSquare ? 'ring-2 ring-amber-400/60 ring-inset' : ''} ${
              isDark ? 'cursor-pointer' : 'cursor-default'
            }`}
            style={{ width: '12.5%', height: '12.5%' }}
          >
            {/* Koordinatalar yozuvi (faqat chekkadagi kataklarda) */}
            {(c === (isFlipped ? 7 : 0)) && (
              <span
                className={`absolute top-0.5 left-1 text-[9px] font-bold pointer-events-none ${
                  isDark ? 'text-amber-200/40' : 'text-stone-700/40'
                }`}
              >
                {8 - r}
              </span>
            )}
            {(r === (isFlipped ? 0 : 7)) && (
              <span
                className={`absolute bottom-0.5 right-1 text-[9px] font-bold pointer-events-none ${
                  isDark ? 'text-amber-200/40' : 'text-stone-700/40'
                }`}
              >
                {String.fromCharCode(65 + c)}
              </span>
            )}

            {/* Toshni render qilish */}
            {piece !== PieceType.EMPTY && (
              <div
                className={`relative w-[82%] h-[82%] rounded-full flex items-center justify-center transition-transform duration-200 ${
                  isSelected ? 'scale-105 ring-4 ring-amber-400 shadow-xl' : 'hover:scale-[1.02]'
                } ${
                  isMustCapturePiece && !isSelected
                    ? 'ring-2 ring-red-500 animate-pulse'
                    : ''
                }`}
              >
                {/* 3D Tosh Dizayni */}
                {engine.isWhite(piece) ? (
                  // Oq Tosh
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300 shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center">
                    <div className="w-[70%] h-[70%] rounded-full border border-amber-300/80 shadow-inner flex items-center justify-center">
                      {engine.isKing(piece) && (
                        <Crown className="w-5 h-5 text-amber-600 drop-shadow fill-amber-500 animate-bounce" />
                      )}
                    </div>
                  </div>
                ) : (
                  // Qora Tosh
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-stone-800 via-stone-900 to-black border-2 border-stone-700 shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.15)] flex items-center justify-center">
                    <div className="w-[70%] h-[70%] rounded-full border border-stone-700/80 shadow-inner flex items-center justify-center">
                      {engine.isKing(piece) && (
                        <Crown className="w-5 h-5 text-amber-400 drop-shadow fill-amber-400 animate-bounce" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mumkin bo'lgan yurish manzili (Highlight Dot) */}
            {isLegalTarget && (
              <div className="absolute z-10 w-5 h-5 rounded-full bg-emerald-400/80 shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-400/20 animate-pulse pointer-events-none" />
            )}
          </div>
        );
      }
    }
    return squares;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Shashka doskasi yog'och ramkasi */}
      <div className="p-3 bg-[#3d2314] rounded-2xl shadow-2xl border-4 border-[#2c180c] board-container">
        <div className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[500px] md:h-[500px] flex flex-wrap border-2 border-[#241309] rounded-lg overflow-hidden relative">
          {renderSquares()}
        </div>
      </div>
    </div>
  );
};
