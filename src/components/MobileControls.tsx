import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap } from 'lucide-react';
import { InputState } from '../game/physics';

interface MobileControlsProps {
  p1Input: InputState;
  p2Input: InputState;
  isAiMode: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  p1Input,
  p2Input,
  isAiMode,
}) => {
  const setKey = (player: 'p1' | 'p2', key: keyof InputState, value: boolean) => {
    const target = player === 'p1' ? p1Input : p2Input;
    target[key] = value;
  };

  return (
    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end pointer-events-none z-10 sm:hidden">
      {/* P1 Controls (Left Side) */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <div className="flex gap-2">
          <button
            onTouchStart={() => setKey('p1', 'left', true)}
            onTouchEnd={() => setKey('p1', 'left', false)}
            onMouseDown={() => setKey('p1', 'left', true)}
            onMouseUp={() => setKey('p1', 'left', false)}
            className="w-12 h-12 rounded-xl bg-blue-600/70 active:bg-blue-500 border border-blue-400 flex items-center justify-center text-white shadow-lg active:scale-90 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onTouchStart={() => setKey('p1', 'right', true)}
            onTouchEnd={() => setKey('p1', 'right', false)}
            onMouseDown={() => setKey('p1', 'right', true)}
            onMouseUp={() => setKey('p1', 'right', false)}
            className="w-12 h-12 rounded-xl bg-blue-600/70 active:bg-blue-500 border border-blue-400 flex items-center justify-center text-white shadow-lg active:scale-90 transition"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onTouchStart={() => setKey('p1', 'up', true)}
            onTouchEnd={() => setKey('p1', 'up', false)}
            onMouseDown={() => setKey('p1', 'up', true)}
            onMouseUp={() => setKey('p1', 'up', false)}
            className="w-12 h-12 rounded-xl bg-blue-700/80 active:bg-blue-600 border border-blue-400 flex items-center justify-center text-white shadow-lg active:scale-90 transition"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <button
            onTouchStart={() => setKey('p1', 'attack', true)}
            onTouchEnd={() => setKey('p1', 'attack', false)}
            onMouseDown={() => setKey('p1', 'attack', true)}
            onMouseUp={() => setKey('p1', 'attack', false)}
            className="w-12 h-12 rounded-xl bg-amber-500/90 active:bg-amber-400 border border-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg active:scale-90 transition"
          >
            <Zap className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

      {/* P2 Controls (Right Side, only if 2P mode) */}
      {!isAiMode && (
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex gap-2 justify-end">
            <button
              onTouchStart={() => setKey('p2', 'left', true)}
              onTouchEnd={() => setKey('p2', 'left', false)}
              onMouseDown={() => setKey('p2', 'left', true)}
              onMouseUp={() => setKey('p2', 'left', false)}
              className="w-12 h-12 rounded-xl bg-red-600/70 active:bg-red-500 border border-red-400 flex items-center justify-center text-white shadow-lg active:scale-90 transition"
            >
              <ArrowLeft className="w-6 h-6" />ну
            </button>
            <button
              onTouchStart={() => setKey('p2', 'right', true)}
              onTouchEnd={() => setKey('p2', 'right', false)}
              onMouseDown={() => setKey('p2', 'right', true)}
              onMouseUp={() => setKey('p2', 'right', false)}
              className="w-12 h-12 rounded-xl bg-red-600/70 active:bg-red-500 border border-red-400 flex items-center justify-center text-white shadow-lg active:scale-90 transition"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onTouchStart={() => setKey('p2', 'up', true)}
              onTouchEnd={() => setKey('p2', 'up', false)}
              onMouseDown={() => setKey('p2', 'up', true)}
              onMouseUp={() => setKey('p2', 'up', false)}
              className="w-12 h-12 rounded-xl bg-red-700/80 active:bg-red-600 border border-red-400 flex items-center justify-center text-white shadow-lg active:scale-90 transition"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            <button
              onTouchStart={() => setKey('p2', 'attack', true)}
              onTouchEnd={() => setKey('p2', 'attack', false)}
              onMouseDown={() => setKey('p2', 'attack', true)}
              onMouseUp={() => setKey('p2', 'attack', false)}
              className="w-12 h-12 rounded-xl bg-amber-500/90 active:bg-amber-400 border border-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg active:scale-90 transition"
            >
              <Zap className="w-6 h-6 fill-current" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
