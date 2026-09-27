import React, { useState } from 'react';
import { GameSettings, DEFAULT_GAME_SETTINGS, GameMap, GravityPreset } from '../types/game';
import {
  X,
  Sliders,
  Bomb,
  Globe,
  Heart,
  Zap,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Flame,
  Check,
  Orbit
} from 'lucide-react';
import { getAllMaps } from '../game/maps';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  currentMap: GameMap;
  onSelectMap: (map: GameMap) => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentMap,
  onSelectMap,
}) => {
  const [activeTab, setActiveTab] = useState<'gravity' | 'bombs' | 'maps' | 'combat' | 'movement'>('gravity');
  const allMaps = getAllMaps();

  if (!isOpen) return null;

  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleGravityPreset = (preset: GravityPreset, val: number) => {
    onUpdateSettings({
      ...settings,
      gravity: val,
      gravityPreset: preset,
    });
  };

  const resetDefaults = () => {
    onUpdateSettings({ ...DEFAULT_GAME_SETTINGS });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                Параметры и Настройки Игры
              </h2>
              <p className="text-xs text-slate-400">
                Полная кастомизация физики, бомб, здоровья и выбор карты для игры
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('gravity')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'gravity'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Orbit className="w-4 h-4" /> Гравитация
          </button>

          <button
            onClick={() => setActiveTab('bombs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'bombs'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bomb className="w-4 h-4" /> Бомбы и Взрывы
          </button>

          <button
            onClick={() => setActiveTab('maps')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'maps'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4" /> Выбор Карты ({allMaps.length})
          </button>

          <button
            onClick={() => setActiveTab('combat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'combat'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Heart className="w-4 h-4" /> Бой и HP
          </button>

          <button
            onClick={() => setActiveTab('movement')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'movement'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" /> Физика и Скорость
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* 1. GRAVITY TAB */}
          {activeTab === 'gravity' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Режимы и Пресеты Гравитации (Не нулевая):
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleGravityPreset('moon', 0.15)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      settings.gravity === 0.15
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-black">🌙 Лунная</div>
                    <div className="text-[10px] text-slate-400">0.15G (Легкая)</div>
                  </button>

                  <button
                    onClick={() => handleGravityPreset('low', 0.35)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      settings.gravity === 0.35
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-black">🚀 Низкая</div>
                    <div className="text-[10px] text-slate-400">0.35G (Плавная)</div>
                  </button>

                  <button
                    onClick={() => handleGravityPreset('standard', 0.55)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      settings.gravity === 0.55
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-black">🌍 Земная</div>
                    <div className="text-[10px] text-slate-400">0.55G (Стандарт)</div>
                  </button>

                  <button
                    onClick={() => handleGravityPreset('heavy', 0.85)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      settings.gravity === 0.85
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-black">⚓ Тяжелая</div>
                    <div className="text-[10px] text-slate-400">0.85G (Быстрая)</div>
                  </button>

                  <button
                    onClick={() => handleGravityPreset('jupiter', 1.20)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      settings.gravity === 1.20
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-black">🪐 Юпитер</div>
                    <div className="text-[10px] text-slate-400">1.20G (Экстрим)</div>
                  </button>

                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-center items-center">
                    <div className="text-[11px] text-slate-400">Текущее значение:</div>
                    <div className="text-sm font-black text-amber-400 font-mono">{settings.gravity.toFixed(2)}G</div>
                  </div>
                </div>

                {/* Fine tuning slider */}
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1">
                    <span>Точная настройка гравитации:</span>
                    <span className="font-mono text-amber-400 font-bold">{settings.gravity.toFixed(2)}G</span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="1.50"
                    step="0.05"
                    value={settings.gravity}
                    onChange={(e) => {
                      handleChange('gravity', parseFloat(e.target.value));
                      handleChange('gravityPreset', 'custom');
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0.10G (Супер-легкая)</span>
                    <span>0.55G (Обычная)</span>
                    <span>1.50G (Сверхтяжелая)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. BOMBS TAB */}
          {activeTab === 'bombs' && (
            <div className="space-y-4">
              {/* Bomb Damage */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-red-400">
                    <Flame className="w-4 h-4" /> Урон от взрыва бомбы:
                  </span>
                  <span className="font-mono text-red-400 font-black">{settings.bombDamage} HP</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={settings.bombDamage}
                  onChange={(e) => handleChange('bombDamage', parseInt(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>20 HP (Слабый)</span>
                  <span>65 HP (Стандарт)</span>
                  <span>150 HP (Ваншот)</span>
                </div>
              </div>

              {/* Bomb Blast Radius */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-orange-400">
                    <ShieldAlert className="w-4 h-4" /> Радиус и площадь поражения взрыва:
                  </span>
                  <span className="font-mono text-orange-400 font-black">{settings.bombBlastRadius} px</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="300"
                  step="10"
                  value={settings.bombBlastRadius}
                  onChange={(e) => handleChange('bombBlastRadius', parseInt(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>60px (Компактный)</span>
                  <span>130px (Стандарт)</span>
                  <span>300px (Огромный)</span>
                </div>
              </div>

              {/* Bomb Timer Countdown */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Bomb className="w-4 h-4" /> Таймер детонации бомбы:
                  </span>
                  <span className="font-mono text-amber-400 font-black">{settings.bombTimer} сек</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={settings.bombTimer}
                  onChange={(e) => handleChange('bombTimer', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>3 сек (Мгновенно)</span>
                  <span>14 сек (Стандарт)</span>
                  <span>30 сек (Долго)</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. MAP SELECTION TAB (Play only on selected map) */}
          {activeTab === 'maps' && (
            <div className="space-y-4">
              {/* Map Rotation Mode Selector */}
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Режим выбора карт:
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    onClick={() => handleChange('mapSelectionMode', 'locked')}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                      settings.mapSelectionMode === 'locked'
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    🔒 Только выбранная карта
                  </button>

                  <button
                    onClick={() => handleChange('mapSelectionMode', 'random')}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                      settings.mapSelectionMode === 'random'
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    🎲 Случайная ротация
                  </button>

                  <button
                    onClick={() => handleChange('mapSelectionMode', 'sequential')}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                      settings.mapSelectionMode === 'sequential'
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    🔄 По очереди
                  </button>
                </div>
              </div>

              {/* All Maps List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Выберите карту для игры:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allMaps.map((m) => {
                    const isSelected = currentMap.id === m.id || settings.lockedMapId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelectMap(m);
                          handleChange('lockedMapId', m.id);
                        }}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500 text-white shadow-lg'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            {m.nameRu}
                            {m.isCustom && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-500/40 uppercase">
                                Кастомная
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{m.descriptionRu}</div>
                        </div>

                        {isSelected ? (
                          <div className="p-1 rounded-full bg-amber-500 text-slate-950">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 font-semibold">Выбрать</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. COMBAT & HEALTH TAB */}
          {activeTab === 'combat' && (
            <div className="space-y-4">
              {/* Max HP */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Heart className="w-4 h-4" /> Здоровье игроков (Max HP):
                  </span>
                  <span className="font-mono text-blue-400 font-black">{settings.playerMaxHp} HP</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={settings.playerMaxHp}
                  onChange={(e) => handleChange('playerMaxHp', parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>50 HP (Быстрые дуэли)</span>
                  <span>100 HP (Стандарт)</span>
                  <span>300 HP (Длинный бой)</span>
                </div>
              </div>

              {/* Weapon Damage Multiplier */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <Sparkles className="w-4 h-4" /> Множитель урона от оружия:
                  </span>
                  <span className="font-mono text-purple-400 font-black">{settings.damageMultiplier.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={settings.damageMultiplier}
                  onChange={(e) => handleChange('damageMultiplier', parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.5x (Малый урон)</span>
                  <span>1.0x (Стандарт)</span>
                  <span>3.0x (Смертельный)</span>
                </div>
              </div>

              {/* Auto-fire Speed / Delay when holding movement keys (e.g. A / D) */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Zap className="w-4 h-4" /> Задержка авто-выстрелов при зажатии клавиш (A / D):
                  </span>
                  <span className="font-mono text-amber-400 font-black">
                    {settings.autoFireCooldownMultiplier <= 0.8
                      ? '⚡ Быстрая'
                      : settings.autoFireCooldownMultiplier <= 1.4
                      ? '🎯 Умеренная'
                      : '⏳ Замедленная'}{' '}
                    ({settings.autoFireCooldownMultiplier.toFixed(1)}x пауза)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="3.0"
                  step="0.1"
                  value={settings.autoFireCooldownMultiplier}
                  onChange={(e) =>
                    handleChange('autoFireCooldownMultiplier', parseFloat(e.target.value))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.6x (Быстрая очередь)</span>
                  <span>1.3x (Стандартная с паузой)</span>
                  <span>3.0x (Редкие выстрелы)</span>
                </div>
              </div>

              {/* Rounds to Win Match */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-4 h-4" /> Побед до завершения матча:
                  </span>
                  <span className="font-mono text-emerald-400 font-black">{settings.roundsToWin} раундов</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.roundsToWin}
                  onChange={(e) => handleChange('roundsToWin', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 раунд</span>
                  <span>5 раундов</span>
                  <span>10 раундов</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. MOVEMENT & PHYSICS TAB */}
          {activeTab === 'movement' && (
            <div className="space-y-4">
              {/* Move Speed Multiplier */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <Zap className="w-4 h-4" /> Скорость передвижения:
                  </span>
                  <span className="font-mono text-yellow-400 font-black">{settings.moveSpeedMultiplier.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.moveSpeedMultiplier}
                  onChange={(e) => handleChange('moveSpeedMultiplier', parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
              </div>

              {/* Meteorites Frequency */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-orange-400">
                    <Flame className="w-4 h-4" /> Частота падающих метеоритов:
                  </span>
                  <span className="font-mono text-orange-400 font-black">
                    {settings.meteoritesFrequency === 0 ? 'Выключены' : `${settings.meteoritesFrequency.toFixed(1)}x`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.5"
                  value={settings.meteoritesFrequency}
                  onChange={(e) => handleChange('meteoritesFrequency', parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Выключены</span>
                  <span>1.0x (Стандарт)</span>
                  <span>3.0x (Метеоритный дождь)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={resetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Сбросить по умолчанию
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            Применить и Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
