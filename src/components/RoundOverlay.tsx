import React from 'react';
import { GamePhase, Player, GameMap } from '../types/game';
import { Swords, Trophy, Zap } from 'lucide-react';

interface RoundOverlayProps {
  phase: GamePhase;
  countdown: number;
  winner: Player | null;
  currentMap: GameMap;
  onNextRoundNow?: () => void;
}

export const RoundOverlay: React.FC<RoundOverlayProps> = ({
  phase,
  countdown,
  winner,
  currentMap,
  onNextRoundNow,
}) => {
  if (phase === 'fighting' || phase === 'start_screen' || phase === 'match_won') {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      {/* Countdown 3, 2, 1, БОЙ */}
      {phase === 'countdown' && (
        <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-200">
          <div className="text-center">
            {countdown > 0 ? (
              <div className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_10px_20px_rgba(245,158,11,0.6)] animate-pulse">
                {countdown}
              </div>
            ) : (
              <div className="text-6xl sm:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-orange-500 drop-shadow-[0_10px_25px_rgba(239,68,68,0.8)] animate-bounce uppercase">
                БОЙ!
              </div>
            )}
            <p className="mt-2 text-sm sm:text-base font-bold text-slate-200 bg-slate-950/80 px-4 py-1 rounded-full border border-slate-700 shadow-md">
              Локация: {currentMap.nameRu}
            </p>
          </div>
        </div>
      )}

      {/* Round Won Screen */}
      {phase === 'round_won' && winner && (
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-xl border border-amber-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm sm:max-w-md mx-4 animate-in zoom-in-90 duration-300">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
            style={{
              backgroundColor: `${winner.color}22`,
              border: `2px solid ${winner.color}`,
              boxShadow: `0 0 25px ${winner.glowColor}66`,
            }}
          >
            <Trophy className="w-8 h-8" style={{ color: winner.color }} />
          </div>

          <h2
            className="text-2xl sm:text-3xl font-black text-center mb-1 uppercase tracking-wider"
            style={{ color: winner.color }}
          >
            {winner.name} победил!
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 text-center mb-4">
            Победное оружие: <span className="font-bold text-white">{winner.weapon.nameRu}</span>
          </p>

          <div className="w-full bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs text-slate-300 mb-5">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Урон за раунд:
            </span>
            <span className="font-bold text-white tabular-nums">{winner.damageDealt} HP</span>
          </div>

          <button
            onClick={onNextRoundNow}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4" /> Следующий раунд (или Пробел)
          </button>
        </div>
      )}
    </div>
  );
};
