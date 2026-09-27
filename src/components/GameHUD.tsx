import React from 'react';
import { Player, GameMap, GameMode, GameSettings } from '../types/game';
import { Volume2, VolumeX, Pause, HelpCircle, Users, Bot, Sliders, Globe } from 'lucide-react';
import { isSoundMuted, toggleSoundMute } from '../audio/soundEngine';

interface GameHUDProps {
  player1: Player;
  player2: Player;
  currentMap: GameMap;
  roundNumber: number;
  maxRounds: number;
  mode: GameMode;
  settings: GameSettings;
  showHpAndWeaponDetails: boolean;
  onOpenSettings: () => void;
  onOpenControls: () => void;
  onTogglePause: () => void;
  onToggleMode: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player1,
  player2,
  currentMap,
  roundNumber,
  maxRounds,
  mode,
  settings,
  showHpAndWeaponDetails,
  onOpenSettings,
  onOpenControls,
  onTogglePause,
  onToggleMode,
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
      {/* Top Bar Navigation & Controls */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Left: Map & Mode Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            title="Выбрать карту / изменить параметры"
            className="bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 hover:border-amber-500/60 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs sm:text-sm cursor-pointer transition active:scale-95"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white font-medium">{currentMap.nameRu}</span>
            {settings.mapSelectionMode === 'locked' && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                🔒
              </span>
            )}
          </button>

          <button
            onClick={onToggleMode}
            title="Переключить режим (2 Игрока / Против Бота)"
            className="bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs sm:text-sm text-slate-200 transition active:scale-95 cursor-pointer"
          >
            {mode === 'pvp' ? (
              <>
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-blue-300 hidden sm:inline">2 Игрока</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-red-300 hidden sm:inline">vs Бот</span>
              </>
            )}
          </button>

          {/* Quick Gravity Status Badge */}
          <button
            onClick={onOpenSettings}
            title="Настройки гравитации и физики"
            className="bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs text-amber-300 transition active:scale-95 cursor-pointer font-mono font-bold"
          >
            <span>{settings.gravity.toFixed(2)}G</span>
          </button>
        </div>

        {/* Center: Match Round & Score */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/30 px-4 py-1.5 rounded-2xl shadow-xl flex items-center gap-3">
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

        {/* Right: Sound, Settings, Controls, Pause */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenSettings}
            title="Все параметры игры (Гравитация, Бомбы, Здоровье, Карта)"
            className="p-2 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-amber-400 hover:text-amber-300 transition shadow-lg cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={handleMuteClick}
            title={muted ? 'Включить звук' : 'Выключить звук'}
            className="p-2 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>
          <button
            onClick={onOpenControls}
            title="Клавиши управления"
            className="p-2 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={onTogglePause}
            title="Пауза"
            className="p-2 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
          >
            <Pause className="w-4 h-4 text-slate-200" />
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
