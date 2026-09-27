import React from 'react';
import { Player, GameMap, GameMode, GameSettings } from '../types/game';
import { Volume2, VolumeX, Pause, HelpCircle, Users, Bot, Sliders, Globe } from 'lucide-react';
import { isSoundMuted, toggleSoundMute } from '../audio/soundEngine';

interface GameHUDProps {
  player1: Player;
  player2: Player;
  roundNumber: number;
  maxRounds: number;
  showHpAndWeaponDetails: boolean;
  onTogglePause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player1,
  player2,
  roundNumber,
  maxRounds,
  showHpAndWeaponDetails,
  onTogglePause,
}) => {
  const [muted, setMuted] = React.useState(isSoundMuted());

  const handleMuteClick = () => {
    const next = toggleSoundMute();
    setMuted(next);
  };

  const p1HpPercent = Math.max(0, (player1.hp / player1.maxHp) * 100);
  const p2HpPercent = Math.max(0, (player2.hp / player2.maxHp) * 100);

  return (
    <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none select-none z-10 flex flex-col gap-2 font-sans">
      {/* Top Bar: Only Sound (Left), Round Timer/Score (Center), and Pause (Right) */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Left: Sound Toggle Button */}
        <div className="flex items-center">
          <button
            onClick={handleMuteClick}
            title={muted ? 'Включить звук' : 'Выключить звук'}
            className="p-2.5 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-slate-700/80 rounded-2xl text-slate-300 hover:text-white transition shadow-lg cursor-pointer flex items-center justify-center"
          >
            {muted ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-green-400" />
            )}
          </button>
        </div>

        {/* Center: Match Round & Time / Score Indicator */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/40 px-5 py-2 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="text-blue-400 font-black text-xl sm:text-2xl tabular-nums">
            {player1.score}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-400 uppercase">
              Раунд {roundNumber}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">до {maxRounds} побед</span>
          </div>
          <div className="text-red-400 font-black text-xl sm:text-2xl tabular-nums">
            {player2.score}
          </div>
        </div>

        {/* Right: Pause Button */}
        <div className="flex items-center">
          <button
            onClick={onTogglePause}
            title="Пауза и меню"
            className="p-2.5 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-slate-700/80 rounded-2xl text-slate-200 hover:text-white transition shadow-lg cursor-pointer flex items-center justify-center"
          >
            <Pause className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Players Health & Weapon Status Bars (Shown during start of round) */}
      {showHpAndWeaponDetails && (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-1 animate-in fade-in zoom-in-95 duration-200">
          {/* Player 1 (Blue) */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-blue-500/50 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-black text-white">{player1.name}</span>
              </div>
              <span className="font-mono font-bold text-blue-400 text-xs">
                {Math.ceil(player1.hp)} / {player1.maxHp} HP
              </span>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-150"
                style={{ width: `${p1HpPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
              <span className="text-amber-300 font-bold">{player1.weapon.nameRu}</span>
              <span className="text-[10px] text-slate-400">{player1.weapon.description}</span>
            </div>
          </div>

          {/* Player 2 (Red) */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-red-500/50 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-black text-white">{player2.name}</span>
              </div>
              <span className="font-mono font-bold text-red-400 text-xs">
                {Math.ceil(player2.hp)} / {player2.maxHp} HP
              </span>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-orange-400 rounded-full transition-all duration-150"
                style={{ width: `${p2HpPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
              <span className="text-amber-300 font-bold">{player2.weapon.nameRu}</span>
              <span className="text-[10px] text-slate-400">{player2.weapon.description}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
