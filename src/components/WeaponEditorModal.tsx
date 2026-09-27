import React, { useState } from 'react';
import { Weapon, WeaponType } from '../types/game';
import {
  getAllWeapons,
  saveCustomWeapons,
  resetWeaponsToDefault,
  exportWeaponsJson,
  importWeaponsJson,
} from '../game/weapons';
import {
  X,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Copy,
  Download,
  Upload,
  Sparkles,
  Swords,
  Zap,
  Sliders,
  Check,
  Flame,
  Target
} from 'lucide-react';

interface WeaponEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWeaponsUpdated: () => void;
}

export const WeaponEditorModal: React.FC<WeaponEditorModalProps> = ({
  isOpen,
  onClose,
  onWeaponsUpdated,
}) => {
  const [weapons, setWeapons] = useState<Weapon[]>(() => getAllWeapons());
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(weapons[0]?.id || 'laser_katana');
  const [jsonText, setJsonText] = useState<string>('');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [jsonStatus, setJsonStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentWeapon = weapons.find((w) => w.id === selectedWeaponId) || weapons[0];

  const handleUpdateCurrent = <K extends keyof Weapon>(key: K, value: Weapon[K]) => {
    if (!currentWeapon) return;
    const updated = weapons.map((w) => (w.id === currentWeapon.id ? { ...w, [key]: value } : w));
    setWeapons(updated);
  };

  const handleSaveAll = () => {
    saveCustomWeapons(weapons);
    onWeaponsUpdated();
    onClose();
  };

  const handleResetToDefaults = () => {
    if (confirm('Сбросить все оружия к стандартным параметрам?')) {
      const defs = resetWeaponsToDefault();
      setWeapons(defs);
      onWeaponsUpdated();
    }
  };

  const handleAddNewWeapon = () => {
    const newId = `custom_weapon_${Date.now()}`;
    const newW: Weapon = {
      id: newId,
      nameRu: 'Новое Оружие',
      nameEn: 'New Custom Weapon',
      type: 'melee',
      damage: 50,
      cooldown: 350,
      knockback: 12,
      range: 80,
      description: 'Уникальное кастомное оружие с настраиваемыми параметрами.',
      color: '#3B82F6',
      glowColor: '#60A5FA',
      speedMultiplier: 1.1,
      iconName: 'Zap',
    };
    const next = [...weapons, newW];
    setWeapons(next);
    setSelectedWeaponId(newId);
  };

  const handleDeleteWeapon = (id: string) => {
    if (weapons.length <= 1) {
      alert('Должно остаться как минимум одно оружие!');
      return;
    }
    const next = weapons.filter((w) => w.id !== id);
    setWeapons(next);
    setSelectedWeaponId(next[0].id);
  };

  const openJsonEditor = () => {
    setJsonText(JSON.stringify(weapons, null, 2));
    setJsonStatus(null);
    setIsJsonModalOpen(true);
  };

  const handleApplyJson = () => {
    try {
      const imported = importWeaponsJson(jsonText);
      setWeapons(imported);
      setSelectedWeaponId(imported[0]?.id || '');
      onWeaponsUpdated();
      setIsJsonModalOpen(false);
      setJsonStatus(null);
    } catch (e: any) {
      setJsonStatus(`Ошибка JSON: ${e.message}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 select-none font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
                Конфигуратор и Редактор Оружия
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                  {weapons.length} видов
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Настройка урона, кулдауна, отдачи, дальности и экспорт/импорт в JSON
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openJsonEditor}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5" /> JSON Конфиг
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden">
          {/* Left Column: Weapons List */}
          <div className="border-r border-slate-800 bg-slate-950/40 p-3 flex flex-col overflow-y-auto max-h-[480px] md:max-h-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Список арсенала:
              </span>
              <button
                onClick={handleAddNewWeapon}
                className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить
              </button>
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {weapons.map((w) => {
                const isSelected = w.id === selectedWeaponId;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWeaponId(w.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: w.color }}
                      />
                      <div className="truncate">
                        <div className="font-bold text-xs truncate">{w.nameRu}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{w.damage} DMG</span>
                          <span>•</span>
                          <span>{w.cooldown}ms</span>
                          <span>•</span>
                          <span className="capitalize">{w.type}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWeapon(w.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer ml-1"
                      title="Удалить оружие"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Weapon Parameters Editor */}
          {currentWeapon && (
            <div className="md:col-span-2 p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: currentWeapon.color }}
                  />
                  <h3 className="font-black text-white text-base">
                    Параметры: {currentWeapon.nameRu}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  ID: {currentWeapon.id}
                </span>
              </div>

              {/* Names & Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Название (RU):
                  </label>
                  <input
                    type="text"
                    value={currentWeapon.nameRu}
                    onChange={(e) => handleUpdateCurrent('nameRu', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Тип оружия:
                  </label>
                  <select
                    value={currentWeapon.type}
                    onChange={(e) => handleUpdateCurrent('type', e.target.value as WeaponType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="melee">Ближний бой (Мечи / Топоры / Молоты)</option>
                    <option value="ranged">Дальний бой (Огнестрел / Арбалеты / Лучи)</option>
                    <option value="flail">Кистень / Цеп</option>
                    <option value="fists">Кулаки / Кастеты</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Описание:
                </label>
                <input
                  type="text"
                  value={currentWeapon.description}
                  onChange={(e) => handleUpdateCurrent('description', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Sliders Grid: Damage, Cooldown, Knockback, Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Damage */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>Урон (Damage):</span>
                    <span className="text-red-400 font-mono font-black">{currentWeapon.damage} HP</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="150"
                    step="1"
                    value={currentWeapon.damage}
                    onChange={(e) => handleUpdateCurrent('damage', parseInt(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>

                {/* Cooldown (Fire rate / Delay) */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>Перезарядка (Cooldown):</span>
                    <span className="text-amber-400 font-mono font-black">{currentWeapon.cooldown} ms</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="1500"
                    step="20"
                    value={currentWeapon.cooldown}
                    onChange={(e) => handleUpdateCurrent('cooldown', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Knockback */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>Отбрасывание (Knockback):</span>
                    <span className="text-blue-400 font-mono font-black">{currentWeapon.knockback}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="35"
                    step="1"
                    value={currentWeapon.knockback}
                    onChange={(e) => handleUpdateCurrent('knockback', parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Range */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>Дистанция (Range):</span>
                    <span className="text-purple-400 font-mono font-black">{currentWeapon.range} px</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="1000"
                    step="10"
                    value={currentWeapon.range}
                    onChange={(e) => handleUpdateCurrent('range', parseInt(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Color Styling */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Основной цвет лезвия / ствола:
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={currentWeapon.color}
                      onChange={(e) => handleUpdateCurrent('color', e.target.value)}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-white uppercase">{currentWeapon.color}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Цвет свечения / искр:
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={currentWeapon.glowColor}
                      onChange={(e) => handleUpdateCurrent('glowColor', e.target.value)}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-white uppercase">{currentWeapon.glowColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Сбросить всё
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Сохранить арсенал
            </button>
          </div>
        </div>
      </div>

      {/* JSON Import/Export Modal */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-60 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-3xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">JSON Конфиг Арсенала Оружия</h3>
              </div>
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-2">
              Вы можете скопировать этот JSON для сохранения/дележа, либо вставить свой JSON конфиг и применить:
            </p>

            {jsonStatus && (
              <div className="p-2.5 mb-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold">
                {jsonStatus}
              </div>
            )}

            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full flex-1 min-h-[300px] font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Скопировано!' : 'Копировать JSON'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsJsonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Закрыть
                </button>
                <button
                  onClick={handleApplyJson}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Применить JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
