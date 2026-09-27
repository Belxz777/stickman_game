import React from 'react';
import { Player } from '../types/game';
import { Crown, RotateCcw, Swords, Flame, Skull } from 'lucide-react';

interface MatchWinnerModalProps {
  winner: Player;
  player1: Player;
  player2: Player;
  onRematch: () => void;
}

export const MatchWinnerModal: React.FC<MatchWinnerModalProps> = ({
  winner,
  player1,
  player2,
  onRematch,
}) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-slate-950/95 border-2 border-amber-500/60 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col items-center">
        {/* Crown Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
          style={{
            backgroundColor: `${winner.color}25`,
            border: `3px solid ${winner.color}`,
            boxShadow: `0 0 30px ${winner.glowColor}88`,
          }}
        >
          <Crown className="w-10 h-10" style={{ color: winner.color }} />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
          Чемпион матча
        </span>

        <h1
          className="text-3xl sm:text-4xl font-black text-center mb-4 uppercase tracking-wider"
          style={{ color: winner.color }}
        >
          {winner.name} ПОБЕДИЛ!
        </h1>

        {/* Final Scoreboard */}
        <div className="w-full bg-slate-900/90 rounded-2xl p-4 border border-slate-800 mb-5">
          <div className="flex items-center justify-around text-center mb-3">
            <div>
              <div className="text-blue-400 font-bold text-sm">{player1.name}</div>
              <div className="text-3xl font-black text-white">{player1.score}</div>
            </div>
            <div className="text-slate-500 font-extrabold text-xl">:</div>
            <div>
              <div className="text-red-400 font-bold text-sm">{player2.name}</div>
              <div className="text-3xl font-black text-white">{player2.score}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between px-2 text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Skull className="w-3.5 h-3.5 text-rose-400" /> Нокауты:
              </span>
              <span className="font-bold">{player1.kills}</span>
            </div>
            <div className="flex items-center justify-between px-2 text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Skull className="w-3.5 h-3.5 text-rose-400" /> Нокауты:
              </span>
              <span className="font-bold">{player2.kills}</span>
            </div>
            <div className="flex items-center justify-between px-2 text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Всего урона:
              </span>
              <span className="font-bold">{player1.damageDealt}</span>
            </div>
            <div className="flex items-center justify-between px-2 text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Всего урона:
              </span>
              <span className="font-bold">{player2.damageDealt}</span>
            </div>
          </div>
        </div>

        {/* Rematch Button */}
        <button
          onClick={onRematch}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-base rounded-2xl transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" /> Сыграть матч заново
        </button>
      </div>
    </div>
  );
};
