import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Flag, MessageSquare, ArrowLeft, Send, Trophy, AlertCircle, Sparkles } from 'lucide-react';
import { Board } from './Board';
import { Clock } from './Clock';
import { PieceType, PieceColor } from '../engine/checkers';
import { getSocket } from '../services/socket';

interface GameRoomViewProps {
  room: any;
  user: any;
  onLeaveRoom: () => void;
  onRefreshUser: () => void;
}

export const GameRoomView: React.FC<GameRoomViewProps> = ({
  room: initialRoom,
  user,
  onLeaveRoom,
  onRefreshUser,
}) => {
  const socket = getSocket();
  const [room, setRoom] = useState<any>(initialRoom);
  const [board, setBoard] = useState<PieceType[]>(initialRoom.board);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>(initialRoom.turn || 'WHITE');
  const [forcedPieceIdx, setForcedPieceIdx] = useState<number | undefined>(initialRoom.forcedPieceIdx);
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | undefined>();
  const [whiteRemainingMs, setWhiteRemainingMs] = useState<number>(initialRoom.whitePlayer.remainingTimeMs);
  const [blackRemainingMs, setBlackRemainingMs] = useState<number>(initialRoom.blackPlayer?.remainingTimeMs ?? 0);
  const [pieceCounts, setPieceCounts] = useState<{ white: number; black: number }>(
    initialRoom.pieceCounts || { white: 12, black: 12 }
  );

  // Chat
  const [chatMessages, setChatMessages] = useState<Array<{ username: string; message: string; timestamp: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Game over modal
  const [gameOverData, setGameOverData] = useState<{
    winner: 'WHITE' | 'BLACK' | 'DRAW';
    reason: string;
    eloChanges?: { changeA: number; changeB: number; newRatingA: number; newRatingB: number };
  } | null>(null);

  // Determine user's role/color in this room
  const isWhite = room.whitePlayer.userId === user?.id;
  const isBlack = room.blackPlayer?.userId === user?.id;
  const userColor: PieceColor | null = isWhite ? 'WHITE' : isBlack ? 'BLACK' : null;
  const isSpectator = userColor === null;

  useEffect(() => {
    // Socket hodisalarini tinglash
    const handleGameStarted = (data: any) => {
      setRoom(data.room);
      setBoard(data.room.board);
      setCurrentTurn(data.room.turn);
      setWhiteRemainingMs(data.room.whitePlayer.remainingTimeMs);
      setBlackRemainingMs(data.room.blackPlayer.remainingTimeMs);
    };

    const handleGameUpdated = (data: any) => {
      setBoard(data.board);
      setCurrentTurn(data.turn);
      setForcedPieceIdx(data.forcedPieceIdx);
      setLastMove(data.lastMove);
      setWhiteRemainingMs(data.whiteRemainingMs);
      setBlackRemainingMs(data.blackRemainingMs);
      if (data.pieceCounts) {
        setPieceCounts(data.pieceCounts);
      }
    };

    const handleGameOver = (data: any) => {
      setGameOverData(data);
      if (data.board) setBoard(data.board);

      // Agar o'yinchi yutgan bo'lsa, bayramona konfetti otamiz!
      if (userColor && data.winner === userColor) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      onRefreshUser();
    };

    const handleChatReceived = (msg: any) => {
      setChatMessages((prev) => [...prev, msg]);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleMoveRejected = (data: any) => {
      alert(data.reason || 'Noto‘g‘ri harakat');
    };

    socket.on('game:started', handleGameStarted);
    socket.on('game:updated', handleGameUpdated);
    socket.on('game:over', handleGameOver);
    socket.on('chat:received', handleChatReceived);
    socket.on('move:rejected', handleMoveRejected);

    return () => {
      socket.off('game:started', handleGameStarted);
      socket.off('game:updated', handleGameUpdated);
      socket.off('game:over', handleGameOver);
      socket.off('chat:received', handleChatReceived);
      socket.off('move:rejected', handleMoveRejected);
    };
  }, [socket, userColor, onRefreshUser]);

  // Client-side timer countdown interpolation
  useEffect(() => {
    if (room.status !== 'PLAYING' || gameOverData) return;

    const interval = setInterval(() => {
      if (currentTurn === 'WHITE') {
        setWhiteRemainingMs((prev) => Math.max(0, prev - 1000));
      } else {
        setBlackRemainingMs((prev) => Math.max(0, prev - 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn, room.status, gameOverData]);

  const handleMove = (from: number, to: number) => {
    if (isSpectator) return;
    socket.emit('game:move', { roomId: room.id, from, to });
  };

  const handleResign = () => {
    if (confirm('Rostdan ham taslim bo‘lmoqchimisiz?')) {
      socket.emit('game:resign', { roomId: room.id });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    socket.emit('chat:send', {
      roomId: room.id,
      username: user?.fullName || 'Mehmon',
      message: inputMessage,
    });
    setInputMessage('');
  };

  const opponent = isWhite ? room.blackPlayer : room.whitePlayer;
  const myPlayer = isWhite ? room.whitePlayer : room.blackPlayer;

  // Tosh yo'qotishlar soni
  const whiteLostPieces = 12 - (pieceCounts.white ?? 12);
  const blackLostPieces = 12 - (pieceCounts.black ?? 12);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobbyga qaytish</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold text-white">{room.name}</h2>
          <span className="text-xs text-amber-400 font-medium">
            {room.status === 'WAITING' ? '⏳ Raqib kutilmoqda...' : '⚔️ Rus shashkasi'}
          </span>
        </div>

        {!isSpectator && room.status === 'PLAYING' && !gameOverData && (
          <button
            onClick={handleResign}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Taslim bo‘lish</span>
          </button>
        )}
      </div>

      {/* Main Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Board & Clocks */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Raqib Taymeri (Tepada) */}
          <div className="w-full max-w-[500px] mb-3">
            <Clock
              playerName={opponent ? opponent.fullName : 'Raqib kutilmoqda'}
              playerRating={opponent ? opponent.rating : 1200}
              remainingTimeMs={isWhite ? blackRemainingMs : whiteRemainingMs}
              isActiveTurn={opponent ? (isWhite ? currentTurn === 'BLACK' : currentTurn === 'WHITE') : false}
              color={isWhite ? 'BLACK' : 'WHITE'}
              capturedCount={isWhite ? whiteLostPieces : blackLostPieces}
            />
          </div>

          {/* Shashka Doskasi */}
          <div className="relative">
            <Board
              board={board}
              playerColor={userColor}
              currentTurn={currentTurn}
              forcedPieceIdx={forcedPieceIdx}
              lastMove={lastMove}
              onMove={handleMove}
              disabled={room.status !== 'PLAYING' || isSpectator || gameOverData !== null}
            />

            {/* Waiting Overlay */}
            {room.status === 'WAITING' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-lg font-bold text-white">Ikkinchi o‘yinchi kutilmoqda...</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs">
                  Sinfdoshingiz o‘yinga qo‘shilishi bilan shashka partiyasi avtomatik boshlanadi.
                </p>
              </div>
            )}
          </div>

          {/* Mening Taymerim (Pastda) */}
          <div className="w-full max-w-[500px] mt-3">
            <Clock
              playerName={myPlayer ? myPlayer.fullName : user.fullName}
              playerRating={myPlayer ? myPlayer.rating : user.currentRating}
              remainingTimeMs={isWhite ? whiteRemainingMs : blackRemainingMs}
              isActiveTurn={userColor ? currentTurn === userColor : false}
              color={isWhite ? 'WHITE' : 'BLACK'}
              capturedCount={isWhite ? blackLostPieces : whiteLostPieces}
            />
          </div>

          {/* Holat haqida xabar */}
          {room.status === 'PLAYING' && !gameOverData && (
            <div className="mt-4 text-center">
              {forcedPieceIdx !== undefined ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  Diqqat! Ketma-ket tosh urishni davom ettiring!
                </span>
              ) : currentTurn === userColor ? (
                <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  👉 Sizning navbatingiz — toshni tanlang va suring
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-medium">
                  ⏳ Raqib o‘ylamoqda...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side: Chat & Table Info */}
        <div className="lg:col-span-4 flex flex-col h-[560px] bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Xona Chati & Tomoshabinlar
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            <div className="text-[11px] text-slate-500 text-center py-1">
              Partiya boshlandi. Omad tilaymiz!
            </div>
            {chatMessages.map((msg, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-amber-300">{msg.username}:</span>
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>
                <div className="text-slate-200 mt-0.5 break-words bg-slate-900/50 px-2.5 py-1.5 rounded-lg inline-block">
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-2 bg-slate-900/80 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              placeholder="Xabar yozing..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
            />
            <button
              type="submit"
              className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOverData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-800 border-2 border-amber-500/50 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            {gameOverData.winner === 'DRAW' ? (
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-3xl mb-3">
                🤝
              </div>
            ) : gameOverData.winner === userColor ? (
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mb-3 animate-bounce">
                🏆
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-3xl mb-3">
                🎖
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {gameOverData.winner === 'DRAW'
                ? 'Durang!'
                : gameOverData.winner === userColor
                ? 'Tabriklaymiz, G‘alaba!'
                : 'Mag‘lubiyat!'}
            </h2>

            <p className="text-xs text-slate-400 mb-6">
              Sabab: {gameOverData.reason === 'TIMEOUT' ? 'Vaqt tugadi' : gameOverData.reason === 'RESIGNATION' ? 'Taslim bo‘ldi' : 'Barcha toshlar yutildi / Harakat qolmadi'}
            </p>

            {/* Elo changes info */}
            {gameOverData.eloChanges && userColor && (
              <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl mb-6">
                <div className="text-xs text-slate-400 mb-1">Reytingingizdagi o‘zgarish:</div>
                <div className="text-xl font-black font-mono flex items-center justify-center gap-2">
                  {userColor === 'WHITE' ? (
                    <span className={gameOverData.eloChanges.changeA >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {gameOverData.eloChanges.changeA >= 0 ? `+${gameOverData.eloChanges.changeA}` : gameOverData.eloChanges.changeA} Elo
                    </span>
                  ) : (
                    <span className={gameOverData.eloChanges.changeB >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {gameOverData.eloChanges.changeB >= 0 ? `+${gameOverData.eloChanges.changeB}` : gameOverData.eloChanges.changeB} Elo
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={onLeaveRoom}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/25 transition text-sm"
            >
              Lobbyga Qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
