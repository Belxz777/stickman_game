import React from 'react';
import { GameMode } from '../types/game';
import { Users, Bot, Swords, Zap, HelpCircle, Shield, Sparkles, Orbit, Rocket } from 'lucide-react';
import { WEAPON_LIST } from '../game/weapons';
import { MAP_LIST } from '../game/maps';
import { formatKeyName } from './ControlsGuideModal';

interface StartScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenControls: () => void;
  zeroGravityMode: boolean;
  onToggleZeroGravity: () => void;
  p1AttackKey: string;
  p2AttackKey: string;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenControls,
  zeroGravityMode,
  onToggleZeroGravity,
  p1AttackKey,
  p2AttackKey,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 z-40 overflow-y-auto">
      <div className="max-w-xl w-full flex flex-col items-center text-center my-auto">
        {/* Game Title Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Физический файтинг для двоих
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2 uppercase drop-shadow-xl">
          <span className="text-blue-500">Синий</span> vs{' '}
          <span className="text-red-500">Красный</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400">
            Битва Агентов
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-md mb-5 font-medium">
          Игра для двоих на одной клавиатуре! Случайное оружие каждый раунд, покачивающиеся прицелы и честные радиусы взрыва!
        </p>

        {/* Zero Gravity Mode Quick Switcher (Requirement 2) */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-left">
            <Orbit className={`w-5 h-5 ${zeroGravityMode ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '6s' }} />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Режим Невесомости (Zero-G)
                {zeroGravityMode && (
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    ВКЛЮЧЕН
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Зажми прыжок на 2 сек для супер-взлета вверх
              </div>
            </div>
          </div>

          <button
            onClick={onToggleZeroGravity}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              zeroGravityMode
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {zeroGravityMode ? 'ВКЛ' : 'ВЫКЛ'}
          </button>
        </div>

        {/* Start Game Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-5">
          <button
            onClick={() => onStartGame('pvp')}
            className="py-4 px-6 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-lg rounded-2xl transition shadow-[0_0_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Users className="w-6 h-6" /> 2 Игрока (1 Клавиатура)
          </button>

          <button
            onClick={() => onStartGame('ai')}
            className="py-4 px-6 bg-gradient-to-r from-red-600 via-rose-500 to-orange-600 hover:from-red-500 hover:to-orange-500 active:scale-95 text-white font-black text-lg rounded-2xl transition shadow-[0_0_25px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Bot className="w-6 h-6" /> 1 Игрок против Бота
          </button>
        </div>

        {/* Quick Controls Info Preview with Remapped Keys */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-4 text-xs text-slate-300 grid grid-cols-2 gap-4">
          <div className="border-r border-slate-800 pr-2 text-left">
            <span className="font-bold text-blue-400 block mb-1">Игрок 1 (Синий):</span>
            <div className="font-mono text-slate-300">Движение: A / D, W (Прыжок)</div>
            <div className="font-mono text-blue-300 font-bold mt-1 flex items-center gap-1">
              Удар: <span className="px-1.5 py-0.5 rounded bg-blue-600/40 text-blue-200 border border-blue-500/50">{formatKeyName(p1AttackKey)}</span>
            </div>
          </div>
          <div className="text-left">
            <span className="font-bold text-red-400 block mb-1">Игрок 2 (Красный):</span>
            <div className="font-mono text-slate-300">Движение: ← / →, ↑ (Прыжок)</div>
            <div className="font-mono text-red-300 font-bold mt-1 flex items-center gap-1">
              Удар: <span className="px-1.5 py-0.5 rounded bg-red-600/40 text-red-200 border border-red-500/50">{formatKeyName(p2AttackKey)}</span>
            </div>
          </div>
        </div>

        {/* Armory & Maps Showcase */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
          <span>Оружий: <b className="text-white">{WEAPON_LIST.length} видов</b></span>
          <button
            onClick={onOpenControls}
            className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Настройки клавиш и режим Zero-G
          </button>
          <span>Карт: <b className="text-white">{MAP_LIST.length} арены</b></span>
        </div>
      </div>
    </div>
  );
};
