import React, { useState, useRef, useEffect } from 'react';
import { GameMap, Platform } from '../types/game';
import {
  X,
  Save,
  Trash2,
  Grid,
  Sliders,
  ShieldAlert,
  Flame,
  Zap,
  Layers,
  Sparkles,
  Copy,
  Download,
  Upload,
  FileCode,
  Check,
  Maximize2,
  Orbit,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { renderGame } from '../game/renderer';
import { createDefaultPlayer } from '../game/physics';
import { WEAPON_LIST } from '../game/weapons';
import { exportSingleMapJson } from '../game/maps';

interface MapEditorProps {
  onClose: () => void;
  onSaveMap: (map: GameMap) => void;
  existingMap?: GameMap;
}

type ToolType =
  | 'solid'
  | 'oneway'
  | 'curved'
  | 'bouncer'
  | 'spikes'
  | 'hazard_block'
  | 'spawn_p1'
  | 'spawn_p2'
  | 'bomb';

export const MapEditor: React.FC<MapEditorProps> = ({
  onClose,
  onSaveMap,
  existingMap,
}) => {
  const [map, setMap] = useState<GameMap>(() => {
    if (existingMap) {
      return {
        ...existingMap,
        customWidth: existingMap.customWidth || 1000,
        customHeight: existingMap.customHeight || 600,
        defaultGravity: existingMap.defaultGravity || 0.55,
      };
    }
    return {
      id: `custom_${Date.now()}`,
      nameRu: 'Моя Кастомная Арена',
      nameEn: 'Custom Arena',
      descriptionRu: 'Создано в Редакторе Карт',
      bgType: 'castle',
      platforms: [
        { x: 100, y: 500, width: 800, height: 28, type: 'solid', color: '#334155' },
        { x: 300, y: 360, width: 400, height: 20, type: 'oneway', color: '#475569' },
        { x: 400, y: 470, width: 200, height: 28, type: 'spikes' },
      ],
      hazards: [{ type: 'void', y: 580, damagePerSec: 999 }],
      spawns: [
        [200, 440],
        [800, 440],
      ],
      hasVoidBelow: true,
      customWidth: 1000,
      customHeight: 600,
      defaultGravity: 0.55,
      meteoritesEnabled: true,
      isZeroGravity: false,
      isCustom: true,
    };
  });

  const [activeTool, setActiveTool] = useState<ToolType>('solid');
  const [selectedPlatIndex, setSelectedPlatIndex] = useState<number | null>(0);
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [jsonInputText, setJsonInputText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const mapWidth = map.customWidth || 1000;
  const mapHeight = map.customHeight || 600;

  // Handle canvas clicks to place or select items
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = mapWidth / rect.width;
    const scaleY = mapHeight / rect.height;

    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;

    // Snap to 20px grid
    const x = gridSnap ? Math.round(rawX / 20) * 20 : Math.round(rawX);
    const y = gridSnap ? Math.round(rawY / 20) * 20 : Math.round(rawY);

    if (activeTool === 'spawn_p1') {
      setMap((prev) => ({
        ...prev,
        spawns: [[x, y], prev.spawns[1]],
      }));
      return;
    }

    if (activeTool === 'spawn_p2') {
      setMap((prev) => ({
        ...prev,
        spawns: [prev.spawns[0], [x, y]],
      }));
      return;
    }

    if (activeTool === 'bomb') {
      setMap((prev) => ({
        ...prev,
        initialBombs: [...(prev.initialBombs || []), { x, y, timer: 12 }],
      }));
      return;
    }

    // Default dimensions for new platform element
    let w = 180;
    let h = 24;
    let color = '#334155';

    if (activeTool === 'curved') {
      w = 340;
      h = 32;
    } else if (activeTool === 'bouncer') {
      w = 120;
      h = 20;
    } else if (activeTool === 'spikes') {
      w = 160;
      h = 24;
    } else if (activeTool === 'hazard_block') {
      w = 100;
      h = 40;
    }

    const newPlat: Platform = {
      x,
      y,
      width: w,
      height: h,
      type: activeTool as any,
      color,
      curveOffsetY: activeTool === 'curved' ? 18 : undefined,
    };

    setMap((prev) => {
      const nextPlats = [...prev.platforms, newPlat];
      setSelectedPlatIndex(nextPlats.length - 1);
      return { ...prev, platforms: nextPlats };
    });
  };

  // Render Preview on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create dummy players for editor preview
    const p1 = createDefaultPlayer('p1', WEAPON_LIST[0], map.spawns[0]);
    const p2 = createDefaultPlayer('p2', WEAPON_LIST[1], map.spawns[1]);

    renderGame(
      ctx,
      mapWidth,
      mapHeight,
      map,
      [p1, p2],
      [],
      (map.initialBombs || []).map((b, i) => ({
        id: i + 1,
        x: b.x,
        y: b.y,
        vx: 0,
        vy: 0,
        radius: 20,
        timer: b.timer,
        maxTimer: b.timer,
        exploded: false,
        damage: 65,
        blastRadius: 130,
      })),
      [],
      0,
      true,
      []
    );

    // Draw Grid Overlay
    if (gridSnap) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < mapWidth; gx += 20) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, mapHeight);
        ctx.stroke();
      }
      for (let gy = 0; gy < mapHeight; gy += 20) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(mapWidth, gy);
        ctx.stroke();
      }
    }

    // Draw Spawn Point Highlights
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(map.spawns[0][0], map.spawns[0][1], 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('P1', map.spawns[0][0] - 8, map.spawns[0][1] + 4);

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(map.spawns[1][0], map.spawns[1][1], 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('P2', map.spawns[1][0] - 8, map.spawns[1][1] + 4);

    // Highlight selected platform
    if (selectedPlatIndex !== null && map.platforms[selectedPlatIndex]) {
      const selected = map.platforms[selectedPlatIndex];
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.strokeRect(selected.x - 2, selected.y - 2, selected.width + 4, selected.height + 4);
    }
  }, [map, selectedPlatIndex, gridSnap, mapWidth, mapHeight]);

  const selectedPlat = selectedPlatIndex !== null ? map.platforms[selectedPlatIndex] : null;

  const handleOpenJsonModal = () => {
    setJsonInputText(exportSingleMapJson(map));
    setJsonError(null);
    setIsJsonModalOpen(true);
  };

  const handleApplyJsonMap = () => {
    try {
      const parsed = JSON.parse(jsonInputText);
      if (!parsed.platforms || !Array.isArray(parsed.platforms)) {
        throw new Error('Карта должна содержать массив platforms');
      }
      const newMap: GameMap = {
        ...parsed,
        id: parsed.id || `custom_${Date.now()}`,
        nameRu: parsed.nameRu || 'Импортированная Карта',
        nameEn: parsed.nameEn || 'Imported Map',
        descriptionRu: parsed.descriptionRu || 'Загружено из JSON',
        bgType: parsed.bgType || 'castle',
        platforms: parsed.platforms,
        hazards: parsed.hazards || [],
        spawns: parsed.spawns || [[200, 440], [800, 440]],
        hasVoidBelow: parsed.hasVoidBelow ?? true,
        customWidth: parsed.customWidth || 1000,
        customHeight: parsed.customHeight || 600,
        defaultGravity: parsed.defaultGravity || 0.55,
        meteoritesEnabled: parsed.meteoritesEnabled ?? true,
        isCustom: true,
      };
      setMap(newMap);
      setIsJsonModalOpen(false);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(`Ошибка валидации JSON: ${e.message}`);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportSingleMapJson(map)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${map.nameEn.toLowerCase().replace(/\s+/g, '_')}_map.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInputText(content);
    };
    reader.readAsText(file);
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonInputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-50 p-3 sm:p-5 flex flex-col font-sans select-none overflow-hidden text-slate-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              Редактор Карт и Арен
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {mapWidth}x{mapHeight}px
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Создавай огромные карты (до 3200px), настраивай дефолтную гравитацию, шипы, метеориты и JSON конфиги
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenJsonModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs sm:text-sm rounded-xl transition border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <FileCode className="w-4 h-4" /> JSON Конфиг
          </button>

          <button
            onClick={() => onSaveMap(map)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" /> Сохранить карту
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 mt-3 overflow-hidden">
        {/* Left Toolbar / Element Palette */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" /> Элементы для размещения:
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTool('solid')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                activeTool === 'solid'
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-8 h-3 bg-slate-500 rounded-sm" />
              <span>Твердый Блок</span>
            </button>

            <button
              onClick={() => setActiveTool('oneway')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                activeTool === 'oneway'
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-8 h-2 border-t-2 border-dashed border-slate-300" />
              <span>Сквозная Платформа</span>
            </button>

            <button
              onClick={() => setActiveTool('spikes')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                activeTool === 'spikes'
                  ? 'bg-red-600/30 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>Опасные Шипы</span>
            </button>

            <button
              onClick={() => setActiveTool('hazard_block')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                activeTool === 'hazard_block'
                  ? 'bg-orange-600/30 border-orange-500 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-5 h-5 text-orange-400" />
              <span>Огненная Зона</span>
            </button>

            <button
              onClick={() => setActiveTool('bouncer')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                activeTool === 'bouncer'
                  ? 'bg-green-600/30 border-green-500 text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-5 h-5 text-green-400" />
              <span>Батут Ускоритель</span>
            </button>

            <button
              onClick={() => setActiveTool('curved')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                activeTool === 'curved'
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-8 h-2 rounded-full border-b-2 border-purple-400" />
              <span>Изогнутый Мост</span>
            </button>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Спавны и Предметы:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                onClick={() => setActiveTool('spawn_p1')}
                className={`py-2 px-1 rounded-xl border transition cursor-pointer text-center ${
                  activeTool === 'spawn_p1'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                    : 'bg-slate-950 border-slate-800 text-blue-400 hover:bg-slate-800'
                }`}
              >
                Спавн P1
              </button>
              <button
                onClick={() => setActiveTool('spawn_p2')}
                className={`py-2 px-1 rounded-xl border transition cursor-pointer text-center ${
                  activeTool === 'spawn_p2'
                    ? 'bg-red-600 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    : 'bg-slate-950 border-slate-800 text-red-400 hover:bg-slate-800'
                }`}
              >
                Спавн P2
              </button>
              <button
                onClick={() => setActiveTool('bomb')}
                className={`py-2 px-1 rounded-xl border transition cursor-pointer text-center ${
                  activeTool === 'bomb'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-800'
                }`}
              >
                Бомба
              </button>
            </div>
          </div>

          {/* Canvas Snap Grid Toggle */}
          <div className="mt-auto border-t border-slate-800 pt-3 flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-cyan-400" /> Сетка 20px
            </span>
            <button
              onClick={() => setGridSnap((g) => !g)}
              className={`px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                gridSnap ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {gridSnap ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
          </div>
        </div>

        {/* Center Canvas Preview Workspace */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-between relative overflow-hidden">
          {/* Zoom Control Bar */}
          <div className="w-full flex items-center justify-between pb-2 text-xs text-slate-400 font-bold border-b border-slate-800/80">
            <span className="flex items-center gap-1 text-slate-300">
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              Холст: {mapWidth} x {mapHeight} px
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Уменьшить масштаб"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-amber-300 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.25))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Увеличить масштаб"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
              >
                100%
              </button>
            </div>
          </div>

          <div className="relative w-full flex-1 flex items-center justify-center bg-slate-950 rounded-xl overflow-auto shadow-2xl border border-slate-800 my-2 p-2">
            <canvas
              ref={canvasRef}
              width={mapWidth}
              height={mapHeight}
              onClick={handleCanvasClick}
              style={{
                width: `${mapWidth * (mapWidth > 1600 ? 0.5 : 0.8) * zoomLevel}px`,
                height: `${mapHeight * (mapWidth > 1600 ? 0.5 : 0.8) * zoomLevel}px`,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
              className="object-contain cursor-crosshair border border-slate-700 rounded-lg shadow-inner"
            />
          </div>

          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Нажмите на холст, чтобы разместить блок или спавн</span>
            <span className="text-amber-400 font-bold">
              Всего платформ: {map.platforms.length}
            </span>
          </div>
        </div>

        {/* Right Map Settings & Selected Element Properties Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3.5 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" /> Параметры и Размер Карты:
          </div>

          {/* Map Title Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Название карты:
            </label>
            <input
              type="text"
              value={map.nameRu}
              onChange={(e) => setMap((p) => ({ ...p, nameRu: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Map Size Selector (Requirement: Make maps even bigger) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 block">
              Размер карты (Ширина x Высота):
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
              <button
                onClick={() => setMap((p) => ({ ...p, customWidth: 1000, customHeight: 600 }))}
                className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                  mapWidth === 1000 && mapHeight === 600
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1000x600 (Стандарт)
              </button>
              <button
                onClick={() => setMap((p) => ({ ...p, customWidth: 1600, customHeight: 900 }))}
                className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                  mapWidth === 1600 && mapHeight === 900
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1600x900 (Большая)
              </button>
              <button
                onClick={() => setMap((p) => ({ ...p, customWidth: 2400, customHeight: 1200 }))}
                className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                  mapWidth === 2400 && mapHeight === 1200
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                2400x1200 (Огромная)
              </button>
              <button
                onClick={() => setMap((p) => ({ ...p, customWidth: 3200, customHeight: 1600 }))}
                className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                  mapWidth === 3200 && mapHeight === 1600
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                3200x1600 (Колосс)
              </button>
            </div>

            {/* Custom Width & Height Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Ширина (px):</span>
                <input
                  type="number"
                  min="800"
                  max="3600"
                  step="100"
                  value={mapWidth}
                  onChange={(e) =>
                    setMap((p) => ({ ...p, customWidth: Number(e.target.value) || 1000 }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Высота (px):</span>
                <input
                  type="number"
                  min="500"
                  max="2200"
                  step="50"
                  value={mapHeight}
                  onChange={(e) =>
                    setMap((p) => ({ ...p, customHeight: Number(e.target.value) || 600 }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Map Default Gravity (Requirement: Default gravity for maps) */}
          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Orbit className="w-4 h-4 text-cyan-400" /> Дефолтная гравитация:
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {(map.defaultGravity || 0.55).toFixed(2)}G
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
              <button
                onClick={() => setMap((p) => ({ ...p, defaultGravity: 0.15 }))}
                className={`py-1 rounded border text-center transition cursor-pointer ${
                  map.defaultGravity === 0.15
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                0.15G Космос
              </button>
              <button
                onClick={() => setMap((p) => ({ ...p, defaultGravity: 0.55 }))}
                className={`py-1 rounded border text-center transition cursor-pointer ${
                  map.defaultGravity === 0.55
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                0.55G Земля
              </button>
              <button
                onClick={() => setMap((p) => ({ ...p, defaultGravity: 0.85 }))}
                className={`py-1 rounded border text-center transition cursor-pointer ${
                  map.defaultGravity === 0.85
                    ? 'bg-orange-500/20 border-orange-400 text-orange-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                0.85G Тяжесть
              </button>
            </div>

            <input
              type="range"
              min="0.10"
              max="1.50"
              step="0.05"
              value={map.defaultGravity || 0.55}
              onChange={(e) =>
                setMap((p) => ({ ...p, defaultGravity: Number(e.target.value) }))
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Background Theme Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Фон арены:
            </label>
            <select
              value={map.bgType}
              onChange={(e) => setMap((p) => ({ ...p, bgType: e.target.value as any }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="castle">Замок и крепость</option>
              <option value="space">Глубокий космос</option>
              <option value="lava">Лавовая пещера</option>
              <option value="cyber">Киберпанк город</option>
              <option value="sky">Парящие облака</option>
              <option value="bunker">Военный бункер</option>
            </select>
          </div>

          {/* Dynamic Meteorites Toggle */}
          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Падающие Метеориты</span>
              <span className="text-[10px] text-slate-400">Опасные падающие астероиды</span>
            </div>
            <button
              onClick={() =>
                setMap((p) => ({ ...p, meteoritesEnabled: !p.meteoritesEnabled }))
              }
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                map.meteoritesEnabled
                  ? 'bg-orange-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {map.meteoritesEnabled ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
          </div>

          {/* Selected Platform Properties */}
          {selectedPlat && (
            <div className="border-t border-slate-800 pt-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Выбранный блок (#{selectedPlatIndex! + 1}):</span>
                <button
                  onClick={() => {
                    setMap((prev) => {
                      const nextPlats = [...prev.platforms];
                      nextPlats.splice(selectedPlatIndex!, 1);
                      return { ...prev, platforms: nextPlats };
                    });
                    setSelectedPlatIndex(null);
                  }}
                  className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                  title="Удалить платформу"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Width Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-bold mb-1">
                  <span>Ширина:</span>
                  <span>{selectedPlat.width}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="1200"
                  step="10"
                  value={selectedPlat.width}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMap((prev) => {
                      const nextPlats = [...prev.platforms];
                      nextPlats[selectedPlatIndex!] = {
                        ...nextPlats[selectedPlatIndex!],
                        width: val,
                      };
                      return { ...prev, platforms: nextPlats };
                    });
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Height Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-bold mb-1">
                  <span>Высота:</span>
                  <span>{selectedPlat.height}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="160"
                  step="4"
                  value={selectedPlat.height}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMap((prev) => {
                      const nextPlats = [...prev.platforms];
                      nextPlats[selectedPlatIndex!] = {
                        ...nextPlats[selectedPlatIndex!],
                        height: val,
                      };
                      return { ...prev, platforms: nextPlats };
                    });
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* List of Platforms */}
          <div className="border-t border-slate-800 pt-3 flex-1 flex flex-col min-h-[120px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Все платформы ({map.platforms.length}):
            </span>
            <div className="flex-1 space-y-1 overflow-y-auto max-h-[160px] pr-1">
              {map.platforms.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPlatIndex(idx)}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                    selectedPlatIndex === idx
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="capitalize">
                    #{idx + 1} {p.type === 'spikes' ? '⚠️ Шипы' : p.type} ({p.width}x{p.height})
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMap((prev) => {
                        const next = [...prev.platforms];
                        next.splice(idx, 1);
                        return { ...prev, platforms: next };
                      });
                      if (selectedPlatIndex === idx) setSelectedPlatIndex(null);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Modal for Maps */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">JSON Конфигурация Карты</h3>
              </div>
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 my-3">
              <button
                onClick={copyJsonToClipboard}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Скопировано!' : 'Копировать JSON'}
              </button>
              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" /> Скачать .json
              </button>
              <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer">
                <Upload className="w-4 h-4" /> Загрузить файл
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {jsonError && (
              <div className="mb-2 p-2 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-bold">
                {jsonError}
              </div>
            )}

            <textarea
              value={jsonInputText}
              onChange={(e) => setJsonInputText(e.target.value)}
              rows={14}
              className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-cyan-500 select-text"
              placeholder="Вставьте JSON конфигурацию карты здесь..."
            />

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Отмена
              </button>
              <button
                onClick={handleApplyJsonMap}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black rounded-xl shadow-lg"
              >
                Применить JSON к Карте
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
