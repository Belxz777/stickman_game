import React from 'react';
import { GameMap, GameMode, GameSettings, AIDifficulty } from '../types/game';
import {
  Play,
  RotateCcw,
  Sliders,
  HelpCircle,
  Map as MapIcon,
  Sparkles,
  Users,
  Bot,
  Globe,
  Gauge,
  Flame,
  Bomb,
  Home,
  Shield,
} from 'lucide-react';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onRestartMatch: () => void;
  onExitToMenu: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
  onOpenMapEditor: () => void;
  onOpenWeaponEditor: () => void;
  currentMap: GameMap;
  mode: GameMode;
  onToggleMode: () => void;
  aiDifficulty: AIDifficulty;
  onChangeAiDifficulty: (diff: AIDifficulty) => void;
  settings: GameSettings;
  onUpdateGravity: (g: number) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  onRestartMatch,
  onExitToMenu,
  onOpenSettings,
  onOpenControls,
  onOpenMapEditor,
  onOpenWeaponEditor,
  currentMap,
  mode,
  onToggleMode,
  aiDifficulty,
  onChangeAiDifficulty,
  settings,
  onUpdateGravity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-white overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              ⏸️
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide uppercase">Пауза</h2>
              <p className="text-[11px] text-slate-400">Матч приостановлен</p>
            </div>
          </div>
          <button
            onClick={onResume}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Продолжить</span>
          </button>
        </div>

        {/* Current Map & Mode Info Card (Moved from HUD into Pause Menu) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Текущая Арена:
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 font-mono text-slate-300">
              {currentMap.customWidth || 1000} × {currentMap.customHeight || 600} px
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-1.5">
                {currentMap.nameRu}
              </h3>
              <p className="text-xs text-slate-400">{currentMap.descriptionRu}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Платформы</span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {currentMap.platforms.length} шт.
              </span>
            </div>
          </div>

          {/* Map Hazards & Features */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-900">
            {currentMap.hazards?.some((h) => h.type === 'lava') && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> Лава
              </span>
            )}
            {currentMap.initialBombs && currentMap.initialBombs.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                <Bomb className="w-3 h-3 text-red-400" /> {currentMap.initialBombs.length} Бомб
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" /> Гравитация: {settings.gravity.toFixed(2)}G
            </span>
          </div>
        </div>

        {/* Current Game Mode Info & Quick Toggle */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> Режим игры:
            </span>
            <button
              onClick={onToggleMode}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              {mode === 'pvp' ? (
                <>
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-blue-300">2 Игрока (PvP)</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-bold text-red-300">Против Бота (AI)</span>
                </>
              )}
              <span className="text-[10px] text-slate-400 underline ml-1">сменить</span>
            </button>
          </div>

          {mode === 'ai' && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400">Сложность AI:</span>
              <div className="flex gap-1">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => onChangeAiDifficulty(d)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      aiDifficulty === d
                        ? 'bg-red-600 text-white shadow'
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

        {/* Action Menu Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onResume();
              onOpenSettings();
            }}
            className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-amber-300 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Параметры и Физика</span>
          </button>

          <button
            onClick={() => {
              onResume();
              onOpenMapEditor();
            }}
            className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-blue-300 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <MapIcon className="w-4 h-4 text-blue-400" />
            <span>Редактор Карт</span>
          </button>

          <button
            onClick={() => {
              onResume();
              onOpenWeaponEditor();
            }}
            className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-orange-300 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Конфиги Оружия</span>
          </button>

          <button
            onClick={() => {
              onResume();
              onOpenControls();
            }}
            className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
            <span>Клавиши</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              onResume();
              onRestartMatch();
            }}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
            <span>Заново</span>
          </button>

          <button
            onClick={() => {
              onResume();
              onExitToMenu();
            }}
            className="flex-1 py-2.5 bg-red-950/60 hover:bg-red-900/80 border border-red-900/60 text-red-200 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4 text-red-300" />
            <span>Главное меню</span>
          </button>
        </div>
      </div>
    </div>
  );
};
