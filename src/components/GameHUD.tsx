import React from 'react';
import { Player, GameMap, GameMode } from '../types/game';
import { Volume2, VolumeX, Pause, HelpCircle, Users, Bot, Orbit } from 'lucide-react';
import { isSoundMuted, toggleSoundMute } from '../audio/soundEngine';

interface GameHUDProps {
  player1: Player;
  player2: Player;
  currentMap: GameMap;
  roundNumber: number;
  maxRounds: number;
  mode: GameMode;
  showHpAndWeaponDetails: boolean;
  zeroGravityMode: boolean;
  onToggleZeroGravity: () => void;
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
  showHpAndWeaponDetails,
  zeroGravityMode,
  onToggleZeroGravity,
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
  const isZeroGActive = zeroGravityMode || !!currentMap.isZeroGravity;

  return (
    <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none select-none z-10 flex flex-col gap-2">
      {/* Top Bar Navigation & Controls */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Left: Map & Mode Badge */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-amber-400 font-bold">Карта:</span>
            <span className="text-white font-medium">{currentMap.nameRu}</span>
          </div>

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

          {/* Zero-G Mode Quick Toggle (Requirement 2) */}
          <button
            onClick={onToggleZeroGravity}
            title="Переключить режим невесомости"
            className={`backdrop-blur-md border px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
              isZeroGActive
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Orbit className={`w-3.5 h-3.5 ${isZeroGActive ? 'text-cyan-400 animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="hidden sm:inline">Невесомость:</span>
            <span>{isZeroGActive ? 'ВКЛ' : 'ВЫКЛ'}</span>
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

        {/* Right: Sound, Controls, Pause */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleMuteClick}
            title={muted ? 'Включить звук' : 'Выключить звук'}
            className="p-2 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>
          <button
            onClick={onOpenControls}
            title="Управление и клавиши"
            className="p-2 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
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

      {/* Players Health & Weapon Status Bars (Shown only during first 3 seconds of the round) */}
      {showHpAndWeaponDetails && (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-1 animate-in fade-in zoom-in-95 duration-200">
          {/* Player 1 (Blue) */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-blue-500/50 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-extrabold text-blue-400 tracking-wide">
                  {player1.name}
                </span>
              </div>
              <div className="font-black text-white tabular-nums">
                {Math.ceil(player1.hp)} <span className="text-[10px] text-slate-400 font-normal">HP</span>
              </div>
            </div>

            {/* HP Bar */}
            <div className="h-3 sm:h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${p1HpPercent}%` }}
              />
            </div>

            {/* Current Weapon Banner & Description */}
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-300">
                <span className="text-slate-400 font-medium">Оружие:</span>
                <span
                  className="font-black px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${player1.weapon.color}22`,
                    color: player1.weapon.color,
                    border: `1px solid ${player1.weapon.color}55`,
                  }}
                >
                  {player1.weapon.nameRu}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {player1.weapon.description}
              </p>
            </div>
          </div>

          {/* Player 2 (Red) */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-red-500/50 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="font-black text-white tabular-nums order-2 sm:order-1">
                {Math.ceil(player2.hp)} <span className="text-[10px] text-slate-400 font-normal">HP</span>
              </div>
              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <span className="font-extrabold text-red-400 tracking-wide">
                  {mode === 'ai' ? 'Бот (Красный)' : player2.name}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              </div>
            </div>

            {/* HP Bar */}
            <div className="h-3 sm:h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 rounded-full transition-all duration-150 ml-auto shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                style={{ width: `${p2HpPercent}%` }}
              />
            </div>

            {/* Current Weapon Banner & Description */}
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-300">
                <span
                  className="font-black px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${player2.weapon.color}22`,
                    color: player2.weapon.color,
                    border: `1px solid ${player2.weapon.color}55`,
                  }}
                >
                  {player2.weapon.nameRu}
                </span>
                <span className="text-slate-400 font-medium">Оружие:</span>
              </div>
              <p className="text-[10px] text-slate-400 text-right leading-tight">
                {player2.weapon.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
