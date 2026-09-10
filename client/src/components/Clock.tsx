import React from 'react';
import { Timer } from 'lucide-react';

interface ClockProps {
  playerName: string;
  playerRating: number;
  remainingTimeMs: number;
  isActiveTurn: boolean;
  color: 'WHITE' | 'BLACK';
  capturedCount: number;
  orientation?: 'top' | 'bottom';
}

export const Clock: React.FC<ClockProps> = ({
  playerName,
  playerRating,
  remainingTimeMs,
  isActiveTurn,
  color,
  capturedCount,
}) => {
  const totalSeconds = Math.max(0, Math.floor(remainingTimeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isLowTime = totalSeconds <= 30;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
        isActiveTurn
          ? 'bg-slate-800 border-amber-500 shadow-md shadow-amber-500/10 scale-[1.01]'
          : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
      }`}
    >
      {/* Player info */}
      <div className="flex items-center space-x-3">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-inner ${
            color === 'WHITE'
              ? 'bg-amber-100 border-amber-300'
              : 'bg-stone-800 border-stone-600'
          }`}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{playerName}</span>
            <span className="text-xs text-amber-400 font-mono">({playerRating})</span>
          </div>
          {capturedCount > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-slate-400">Yutilgan:</span>
              <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.2 rounded">
                +{capturedCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Countdown display */}
      <div
        className={`flex items-center space-x-2 font-mono text-lg font-bold px-3 py-1 rounded-lg border transition ${
          isActiveTurn
            ? isLowTime
              ? 'bg-red-500/20 text-red-400 border-red-500 animate-pulse'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
            : 'bg-slate-900/60 text-slate-400 border-slate-700'
        }`}
      >
        <Timer className={`w-4 h-4 ${isActiveTurn ? 'text-amber-400' : 'text-slate-500'}`} />
        <span>{formattedTime}</span>
      </div>
    </div>
  );
};
