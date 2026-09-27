import React, { useState, useEffect } from 'react';
import { GameMode, AIDifficulty } from '../types/game';
import { X, Users, Bot, Keyboard, Zap, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-950 border border-slate-700 p-5 sm:p-6 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto font-sans text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-white">
              Клавиши Управления Игры
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="my-4">
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
                    {d === 'easy' ? 'Легко' : d === 'medium' ? 'Нормально' : 'Хардкор'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Players Control Schemes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
          {/* Player 1 (Blue) */}
          <div className="bg-slate-900/90 border border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-black text-white text-sm">Игрок 1 (Синий)</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Влево:</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono font-bold text-white">A</kbd>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Вправо:</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono font-bold text-white">D</kbd>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Прыжок:</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono font-bold text-white">W</kbd>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Вниз (платформа):</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono font-bold text-white">S</kbd>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-400 font-bold">Спец-клавиша удара:</span>
                <button
                  onClick={() => setListeningFor('p1')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition cursor-pointer ${
                    listeningFor === 'p1'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                      : 'bg-blue-600/30 text-blue-200 border-blue-500/50 hover:bg-blue-600/50'
                  }`}
                >
                  {listeningFor === 'p1' ? 'Нажми клавишу...' : formatKeyName(p1AttackKey)}
                </button>
              </div>
            </div>
          </div>

          {/* Player 2 (Red) */}
          <div className="bg-slate-900/90 border border-red-500/40 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <h3 className="font-black text-white text-sm">
                  {mode === 'ai' ? 'Бот (Красный)' : 'Игрок 2 (Красный)'}
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Влево:</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono font-bold text-white">←</kbd>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Вправо:</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono font-bold text-white">→</kbd>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Прыжок:</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono font-bold text-white">↑</kbd>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Вниз (платформа):</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono font-bold text-white">↓</kbd>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-400 font-bold">Спец-клавиша удара:</span>
                <button
                  onClick={() => setListeningFor('p2')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition cursor-pointer ${
                    listeningFor === 'p2'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                      : 'bg-red-600/30 text-red-200 border-red-500/50 hover:bg-red-600/50'
                  }`}
                >
                  {listeningFor === 'p2' ? 'Нажми клавишу...' : formatKeyName(p2AttackKey)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Close / Confirm Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition cursor-pointer shadow-lg active:scale-98"
        >
          Готово
        </button>
      </div>
    </div>
  );
};
