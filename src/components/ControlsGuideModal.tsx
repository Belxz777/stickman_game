import React, { useState, useEffect } from 'react';
import { GameMode, AIDifficulty } from '../types/game';
import { X, Users, Bot, Keyboard, Zap, ShieldAlert, Sparkles, Orbit, Rocket } from 'lucide-react';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: GameMode;
  onSetMode: (mode: GameMode) => void;
  difficulty: AIDifficulty;
  onSetDifficulty: (diff: AIDifficulty) => void;
  p1AttackKey: string;
  onSetP1AttackKey: (key: string) => void;
  p2AttackKey: string;
  onSetP2AttackKey: (key: string) => void;
  zeroGravityMode: boolean;
  onToggleZeroGravity: () => void;
}

export function formatKeyName(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'Space') return 'Пробел';
  if (code === 'Enter') return 'Enter';
  if (code === 'Numpad0') return 'Num 0';
  if (code === 'Slash') return '/';
  if (code === 'ControlLeft' || code === 'ControlRight') return 'Ctrl';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
  if (code === 'AltLeft' || code === 'AltRight') return 'Alt';
  return code;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSetMode,
  difficulty,
  onSetDifficulty,
  p1AttackKey,
  onSetP1AttackKey,
  p2AttackKey,
  onSetP2AttackKey,
  zeroGravityMode,
  onToggleZeroGravity,
}) => {
  const [listeningFor, setListeningFor] = useState<'p1' | 'p2' | null>(null);

  // Key capture listener when in remapping mode
  useEffect(() => {
    if (!listeningFor) return;

    const handleRemapKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Don't bind Escape
      if (e.code === 'Escape') {
        setListeningFor(null);
        return;
      }

      if (listeningFor === 'p1') {
        onSetP1AttackKey(e.code);
      } else if (listeningFor === 'p2') {
        onSetP2AttackKey(e.code);
      }
      setListeningFor(null);
    };

    window.addEventListener('keydown', handleRemapKey, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleRemapKey, { capture: true });
    };
  }, [listeningFor, onSetP1AttackKey, onSetP2AttackKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-700 p-5 sm:p-6 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-white">
              Управление и настройки боя
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero Gravity Mode Switcher (Requirement 2) */}
        <div className="my-3.5 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Orbit className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                Режим Невесомости (Zero-G)
                {zeroGravityMode && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Активен
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Зажми прыжок на 2 секунды для супер-взлета вверх!
              </div>
            </div>
          </div>
          <button
            onClick={onToggleZeroGravity}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              zeroGravityMode
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {zeroGravityMode ? 'ВКЛЮЧЕН' : 'ВЫКЛ'}
          </button>
        </div>

        {/* Mode Selector */}
        <div className="mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Режим игры:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSetMode('pvp')}
              className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition cursor-pointer ${
                mode === 'pvp'
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" /> 2 Игрока (1 Клавиатура)
            </button>
            <button
              onClick={() => onSetMode('ai')}
              className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition cursor-pointer ${
                mode === 'ai'
                  ? 'bg-red-600/30 border-red-500 text-red-300 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Bot className="w-4 h-4 text-red-400" /> 1 Игрок против Бота
            </button>
          </div>

          {/* AI Difficulty Selector */}
          {mode === 'ai' && (
            <div className="mt-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Сложность бота:</span>
              <div className="flex gap-1.5">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => onSetDifficulty(d)}
                    className={`px-2.5 py-1 rounded-md font-semibold capitalize transition cursor-pointer ${
                      difficulty === d
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d === 'easy' ? 'Легкий' : d === 'medium' ? 'Средний' : 'Сложный'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dual Keyboard Layout Guide & Key Remapper (Requirement 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Player 1 (Blue) */}
          <div className="bg-slate-900/80 border border-blue-500/40 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-blue-400 font-extrabold text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Игрок 1 (Синий)
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Движение:</span>
                <span className="bg-slate-800 font-mono px-2 py-0.5 rounded border border-slate-700 text-white">
                  A / D
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Прыжок (зажми 2с):</span>
                <span className="bg-slate-800 font-mono px-2 py-0.5 rounded border border-slate-700 text-white">
                  W
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Спуск вниз:</span>
                <span className="bg-slate-800 font-mono px-2 py-0.5 rounded border border-slate-700 text-white">
                  S
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-slate-400 font-medium">Кнопка атаки:</span>
                <button
                  onClick={() => setListeningFor('p1')}
                  className={`font-mono px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer border ${
                    listeningFor === 'p1'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                      : 'bg-blue-600/30 border-blue-500 text-blue-200 hover:bg-blue-600/50'
                  }`}
                >
                  {listeningFor === 'p1' ? 'Нажмите клавишу...' : formatKeyName(p1AttackKey)}
                </button>
              </div>
            </div>
          </div>

          {/* Player 2 (Red) */}
          <div className="bg-slate-900/80 border border-red-500/40 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-red-400 font-extrabold text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Игрок 2 (Красный)
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Движение:</span>
                <span className="bg-slate-800 font-mono px-2 py-0.5 rounded border border-slate-700 text-white">
                  ← / →
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Прыжок (зажми 2с):</span>
                <span className="bg-slate-800 font-mono px-2 py-0.5 rounded border border-slate-700 text-white">
                  ↑
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Спуск вниз:</span>
                <span className="bg-slate-800 font-mono px-2 py-0.5 rounded border border-slate-700 text-white">
                  ↓
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-slate-400 font-medium">Кнопка атаки:</span>
                <button
                  onClick={() => setListeningFor('p2')}
                  className={`font-mono px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer border ${
                    listeningFor === 'p2'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                      : 'bg-red-600/30 border-red-500 text-red-200 hover:bg-red-600/50'
                  }`}
                >
                  {listeningFor === 'p2' ? 'Нажмите клавишу...' : formatKeyName(p2AttackKey)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Explanations */}
        <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-start gap-2">
            <Rocket className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-cyan-300">Супер-взлёт в невесомости:</b> зажмите клавишу прыжка на <b>2 секунды</b> (над головой появится полоса заряда) — ваш агент резко взлетит ввысь с ударной волной!
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-amber-300">Динамический угол ударов:</b> все оружия теперь плавно покачиваются вверх-вниз! Удары под углом вверх подбрасывают оппонента в воздух, а под углом вниз вбивают в платформу.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-rose-300">Зона поражения бомбы:</b> вокруг тикающей бомбы видна пунктирная опасная окружность. При взрыве каждый видит честный радиус детонации!
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm transition cursor-pointer"
          >
            Готово, в бой!
          </button>
        </div>
      </div>
    </div>
  );
};
