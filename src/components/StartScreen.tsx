import React from 'react';
import { GameMode, GameMap, GameSettings } from '../types/game';
import {
  Users,
  Bot,
  Swords,
  Zap,
  HelpCircle,
  Sliders,
  Sparkles,
  Layers,
  Globe,
  Bomb,
  Orbit
} from 'lucide-react';
import { WEAPON_LIST } from '../game/weapons';
import { getAllMaps } from '../game/maps';
import { formatKeyName } from './ControlsGuideModal';

interface StartScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenControls: () => void;
  onOpenSettings: () => void;
  onOpenEditor: () => void;
  onOpenWeapons?: () => void;
  settings: GameSettings;
  currentMap: GameMap;
  p1AttackKey: string;
  p2AttackKey: string;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenControls,
  onOpenSettings,
  onOpenEditor,
  onOpenWeapons,
  settings,
  currentMap,
  p1AttackKey,
  p2AttackKey,
}) => {
  const allMaps = getAllMaps();

  return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-4 z-40 overflow-y-auto font-sans select-none">
      <div className="max-w-xl w-full flex flex-col items-center text-center my-auto py-2">
        {/* Game Title Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2.5">
          <Sparkles className="w-3.5 h-3.5" /> Физический файтинг дуэлей
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 uppercase drop-shadow-xl">
          <span className="text-blue-500">Синий</span> vs{' '}
          <span className="text-red-500">Красный</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400">
            Битва Агентов
          </span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm max-w-md mb-4 font-medium">
          Играйте на одной клавиатуре! Анимированные движения рук и ног, честные взрывы бомб и настраиваемая физика!
        </p>

        {/* Active Map & Game Parameters Quick Status Card */}
        <div
          onClick={onOpenSettings}
          className="w-full bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3 mb-4 flex items-center justify-between cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Карта: <span className="text-amber-400 font-black">{currentMap.nameRu}</span>
                {settings.mapSelectionMode === 'locked' && (
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    🔒 Только она
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2.5 mt-0.5">
                <span>Гравитация: <b className="text-white font-mono">{settings.gravity.toFixed(2)}G</b></span>
                <span>•</span>
                <span>Бомба: <b className="text-white font-mono">{settings.bombDamage}HP</b></span>
                <span>•</span>
                <span>Побед: <b className="text-white font-mono">{settings.roundsToWin}</b></span>
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 text-xs font-bold transition flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Настроить
          </div>
        </div>

        {/* Start Game Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-3.5">
          <button
            onClick={() => onStartGame('pvp')}
            className="py-3.5 px-5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-base sm:text-lg rounded-2xl transition shadow-[0_0_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Users className="w-5 h-5" /> 2 Игрока (1 Клавиатура)
          </button>

          <button
            onClick={() => onStartGame('ai')}
            className="py-3.5 px-5 bg-gradient-to-r from-red-600 via-rose-500 to-orange-600 hover:from-red-500 hover:to-orange-500 active:scale-95 text-white font-black text-base sm:text-lg rounded-2xl transition shadow-[0_0_25px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Bot className="w-5 h-5" /> 1 Игрок против Бота
          </button>
        </div>

        {/* Action Buttons: Map Editor, Weapon Configurator & Full Settings */}
        <div className="grid grid-cols-3 gap-2 w-full mb-4">
          <button
            onClick={onOpenEditor}
            className="py-2.5 px-2 bg-slate-900 border border-slate-800 hover:border-amber-500/50 active:scale-95 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center"
          >
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Редактор Карт</span>
          </button>

          <button
            onClick={onOpenWeapons}
            className="py-2.5 px-2 bg-slate-900 border border-slate-800 hover:border-blue-500/50 active:scale-95 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center"
          >
            <Swords className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Конфиги Оружия</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="py-2.5 px-2 bg-slate-900 border border-slate-800 hover:border-amber-500/50 active:scale-95 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center"
          >
            <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Параметры</span>
          </button>
        </div>

        {/* Quick Controls Info Preview */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 mb-3 text-xs text-slate-300 grid grid-cols-2 gap-4">
          <div className="border-r border-slate-800 pr-2 text-left">
            <span className="font-bold text-blue-400 block mb-1">Игрок 1 (Синий):</span>
            <div className="font-mono text-slate-300 text-[11px]">Движение / Стрельба: A / D, W (Прыжок)</div>
            <div className="text-[10px] text-slate-400 mt-1">Авто-удар при касании противника!</div>
          </div>
          <div className="text-left">
            <span className="font-bold text-red-400 block mb-1">Игрок 2 (Красный):</span>
            <div className="font-mono text-slate-300 text-[11px]">Движение / Стрельба: ← / →, ↑ (Прыжок)</div>
            <div className="text-[10px] text-slate-400 mt-1">Авто-удар при касании противника!</div>
          </div>
        </div>

        {/* Armory & Maps Showcase */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
          <span>Оружий: <b className="text-white">{WEAPON_LIST.length} видов</b></span>
          <button
            onClick={onOpenControls}
            className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Назначение клавиш
          </button>
          <span>Карт: <b className="text-white">{allMaps.length} арен</b></span>
        </div>
      </div>
    </div>
  );
};
