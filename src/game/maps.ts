import { GameMap, MapId } from '../types/game';

export const MAPS: Record<MapId, GameMap> = {
  castle_bridge: {
    id: 'castle_bridge',
    nameRu: 'Королевский мост',
    nameEn: 'Royal Castle Bridge',
    descriptionRu: 'Волнообразный арочный мост замка с тикающей бомбой!',
    bgType: 'castle',
    hasVoidBelow: false,
    spawns: [
      [280, 360],
      [720, 360],
    ],
    initialBombs: [
      { x: 140, y: 390, timer: 15 },
    ],
    hazards: [],
    platforms: [
      // Curved wavy main bridge
      {
        x: 40,
        y: 420,
        width: 920,
        height: 120,
        type: 'curved',
        curveOffsetY: 35,
        color: '#8B1E1E',
        label: 'bridge',
      },
      // Left castle turret tower ledge
      {
        x: 0,
        y: 280,
        width: 150,
        height: 260,
        type: 'solid',
        color: '#475569',
      },
      // Right castle turret tower ledge
      {
        x: 850,
        y: 280,
        width: 150,
        height: 260,
        type: 'solid',
        color: '#475569',
      },
    ],
  },

  sky_platforms: {
    id: 'sky_platforms',
    nameRu: 'Парящие острова',
    nameEn: 'Sky Floating Islands',
    descriptionRu: 'Высокогорные парящие платформы с силовым полем по краям арены!',
    bgType: 'sky',
    hasVoidBelow: false,
    spawns: [
      [280, 320],
      [720, 320],
    ],
    initialBombs: [
      { x: 500, y: 340, timer: 16 },
    ],
    hazards: [],
    platforms: [
      // Main central floating island
      {
        x: 280,
        y: 390,
        width: 440,
        height: 45,
        type: 'solid',
        color: '#334155',
      },
      // Left floating rock
      {
        x: 50,
        y: 320,
        width: 200,
        height: 35,
        type: 'solid',
        color: '#475569',
      },
      // Right floating rock
      {
        x: 750,
        y: 320,
        width: 200,
        height: 35,
        type: 'solid',
        color: '#475569',
      },
      // High center jump bridge
      {
        x: 380,
        y: 210,
        width: 240,
        height: 20,
        type: 'oneway',
        color: '#64748B',
      },
      // Solid bottom safety energy field floor so nobody falls into void
      {
        x: 0,
        y: 540,
        width: 1000,
        height: 60,
        type: 'solid',
        color: '#1E293B',
      },
    ],
  },

  lava_cavern: {
    id: 'lava_cavern',
    nameRu: 'Лавовый разлом',
    nameEn: 'Lava Cavern',
    descriptionRu: 'Пещера с магмой. Падение вниз обжигает, но арена имеет надежные стены!',
    bgType: 'lava',
    hasVoidBelow: false,
    spawns: [
      [260, 260],
      [740, 260],
    ],
    initialBombs: [
      { x: 500, y: 280, timer: 14 },
    ],
    hazards: [
      {
        type: 'lava',
        y: 520,
        damagePerSec: 35, // Balanced lava damage
      },
    ],
    platforms: [
      // Left basalt rock
      {
        x: 60,
        y: 360,
        width: 240,
        height: 160,
        type: 'solid',
        color: '#292524',
      },
      // Center basalt pillar
      {
        x: 400,
        y: 330,
        width: 200,
        height: 190,
        type: 'solid',
        color: '#1C1917',
      },
      // Right basalt rock
      {
        x: 700,
        y: 360,
        width: 240,
        height: 160,
        type: 'solid',
        color: '#292524',
      },
      // High iron suspension platform
      {
        x: 290,
        y: 190,
        width: 420,
        height: 20,
        type: 'oneway',
        color: '#78350F',
      },
    ],
  },

  cyber_roof: {
    id: 'cyber_roof',
    nameRu: 'Неоновые крыши',
    nameEn: 'Cyber Rooftops',
    descriptionRu: 'Неоновый мегаполис с пружинными трамплинами и одной тикающей бомбой!',
    bgType: 'cyber',
    hasVoidBelow: false,
    spawns: [
      [240, 360],
      [760, 360],
    ],
    initialBombs: [
      { x: 500, y: 400, timer: 15 },
    ],
    hazards: [],
    platforms: [
      // Bottom street level roof
      {
        x: 40,
        y: 440,
        width: 920,
        height: 80,
        type: 'solid',
        color: '#0F172A',
      },
      // Left high billboard ledge
      {
        x: 120,
        y: 280,
        width: 220,
        height: 25,
        type: 'oneway',
        color: '#0284C7',
      },
      // Right high billboard ledge
      {
        x: 660,
        y: 280,
        width: 220,
        height: 25,
        type: 'oneway',
        color: '#9333EA',
      },
      // Left trampoline bouncer
      {
        x: 170,
        y: 420,
        width: 70,
        height: 20,
        type: 'bouncer',
        color: '#22C55E',
        label: 'BOUNCE',
      },
      // Right trampoline bouncer
      {
        x: 760,
        y: 420,
        width: 70,
        height: 20,
        type: 'bouncer',
        color: '#22C55E',
        label: 'BOUNCE',
      },
    ],
  },

  bomb_depot: {
    id: 'bomb_depot',
    nameRu: 'Склад взрывчатки',
    nameEn: 'Bomb Depot',
    descriptionRu: 'Арсенал с одной центральной бомбой — используй её взрыв против врага!',
    bgType: 'bunker',
    hasVoidBelow: false,
    spawns: [
      [220, 380],
      [780, 380],
    ],
    initialBombs: [
      { x: 500, y: 400, timer: 15 }, // exactly 1 bomb
    ],
    initialBarrels: [],
    hazards: [],
    platforms: [
      // Solid bunker ground
      {
        x: 40,
        y: 440,
        width: 920,
        height: 80,
        type: 'solid',
        color: '#374151',
      },
      // Left steel girder
      {
        x: 160,
        y: 290,
        width: 240,
        height: 22,
        type: 'oneway',
        color: '#6B7280',
      },
      // Right steel girder
      {
        x: 600,
        y: 290,
        width: 240,
        height: 22,
        type: 'oneway',
        color: '#6B7280',
      },
      // Upper hanging crate platform
      {
        x: 420,
        y: 190,
        width: 160,
        height: 20,
        type: 'oneway',
        color: '#B45309',
      },
    ],
  },

  orbital_station: {
    id: 'orbital_station',
    nameRu: 'Орбитальная станция (Невесомость)',
    nameEn: 'Orbital Station (Zero-G)',
    descriptionRu: 'Космический отсек без гравитации! Зажми прыжок на 2 сек для супер-взлета вверх!',
    bgType: 'space',
    hasVoidBelow: false,
    isZeroGravity: true,
    spawns: [
      [220, 300],
      [780, 300],
    ],
    initialBombs: [
      { x: 500, y: 300, timer: 15 },
    ],
    hazards: [],
    platforms: [
      // Central floating core
      {
        x: 410,
        y: 280,
        width: 180,
        height: 35,
        type: 'solid',
        color: '#0284C7',
      },
      // Left solar dock
      {
        x: 100,
        y: 380,
        width: 220,
        height: 28,
        type: 'solid',
        color: '#38BDF8',
      },
      // Right solar dock
      {
        x: 680,
        y: 380,
        width: 220,
        height: 28,
        type: 'solid',
        color: '#38BDF8',
      },
      // Upper energy rail
      {
        x: 280,
        y: 150,
        width: 440,
        height: 18,
        type: 'oneway',
        color: '#818CF8',
      },
      // Bottom containment field
      {
        x: 40,
        y: 520,
        width: 920,
        height: 40,
        type: 'solid',
        color: '#1E1B4B',
      },
    ],
  },

  deep_space_void: {
    id: 'deep_space_void',
    nameRu: 'Глубокий космос (Невесомость)',
    nameEn: 'Deep Space Zero-G',
    descriptionRu: 'Открытый космос среди метеоритов. Полная невесомость и свободный полёт!',
    bgType: 'space',
    hasVoidBelow: false,
    isZeroGravity: true,
    spawns: [
      [240, 260],
      [760, 260],
    ],
    initialBombs: [
      { x: 500, y: 260, timer: 16 },
    ],
    hazards: [],
    platforms: [
      // Center asteroid
      {
        x: 360,
        y: 350,
        width: 280,
        height: 40,
        type: 'solid',
        color: '#475569',
      },
      // Upper left asteroid
      {
        x: 120,
        y: 210,
        width: 200,
        height: 30,
        type: 'solid',
        color: '#64748B',
      },
      // Upper right asteroid
      {
        x: 680,
        y: 210,
        width: 200,
        height: 30,
        type: 'solid',
        color: '#64748B',
      },
      // Bottom containment
      {
        x: 60,
        y: 510,
        width: 880,
        height: 45,
        type: 'solid',
        color: '#0F172A',
      },
    ],
  },

  moon_base: {
    id: 'moon_base',
    nameRu: 'Лунная база (Невесомость)',
    nameEn: 'Moon Research Base (Zero-G)',
    descriptionRu: 'Лунная лаборатория в невесомости! Зажми прыжок на 2 секунды для реактивного взлета!',
    bgType: 'space',
    hasVoidBelow: false,
    isZeroGravity: true,
    spawns: [
      [220, 290],
      [780, 290],
    ],
    initialBombs: [
      { x: 500, y: 310, timer: 15 },
    ],
    hazards: [],
    platforms: [
      // Main central lunar platform
      {
        x: 320,
        y: 360,
        width: 360,
        height: 40,
        type: 'solid',
        color: '#64748B',
      },
      // Left scientific outpost
      {
        x: 80,
        y: 240,
        width: 200,
        height: 30,
        type: 'solid',
        color: '#0284C7',
      },
      // Right scientific outpost
      {
        x: 720,
        y: 240,
        width: 200,
        height: 30,
        type: 'solid',
        color: '#0284C7',
      },
      // High lunar scanner truss
      {
        x: 260,
        y: 130,
        width: 480,
        height: 20,
        type: 'oneway',
        color: '#38BDF8',
      },
      // Enclosed bottom containment
      {
        x: 40,
        y: 530,
        width: 920,
        height: 50,
        type: 'solid',
        color: '#1E293B',
      },
    ],
  },

  asteroid_belt: {
    id: 'asteroid_belt',
    nameRu: 'Пояс астероидов (Невесомость)',
    nameEn: 'Asteroid Belt (Zero-G)',
    descriptionRu: 'Парящие космические валуны без гравитации. Свободный полёт и прыжки на 2 сек!',
    bgType: 'space',
    hasVoidBelow: false,
    isZeroGravity: true,
    spawns: [
      [200, 270],
      [800, 270],
    ],
    initialBombs: [
      { x: 500, y: 220, timer: 15 },
    ],
    hazards: [],
    platforms: [
      // Central floating asteroid
      {
        x: 390,
        y: 270,
        width: 220,
        height: 35,
        type: 'solid',
        color: '#52525B',
      },
      // Lower left asteroid
      {
        x: 120,
        y: 390,
        width: 240,
        height: 35,
        type: 'solid',
        color: '#71717A',
      },
      // Lower right asteroid
      {
        x: 640,
        y: 390,
        width: 240,
        height: 35,
        type: 'solid',
        color: '#71717A',
      },
      // Top central perch
      {
        x: 340,
        y: 120,
        width: 320,
        height: 22,
        type: 'oneway',
        color: '#A1A1AA',
      },
      // Bottom containment field
      {
        x: 40,
        y: 530,
        width: 920,
        height: 50,
        type: 'solid',
        color: '#09090B',
      },
    ],
  },
};

export const MAP_LIST = Object.values(MAPS);

export function getSavedCustomMaps(): GameMap[] {
  try {
    const raw = localStorage.getItem('agent_battle_custom_maps');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomMap(map: GameMap): void {
  try {
    const existing = getSavedCustomMaps();
    const idx = existing.findIndex((m) => m.id === map.id);
    if (idx >= 0) {
      existing[idx] = map;
    } else {
      existing.push(map);
    }
    localStorage.setItem('agent_battle_custom_maps', JSON.stringify(existing));
  } catch {}
}

export function getAllMaps(): GameMap[] {
  const custom = getSavedCustomMaps();
  return [...MAP_LIST, ...custom];
}

export function getNextMap(currentMapId: MapId): GameMap {
  const all = getAllMaps();
  const currentIndex = all.findIndex((m) => m.id === currentMapId);
  const nextIndex = (currentIndex + 1) % all.length;
  return all[nextIndex];
}

export function getRandomMap(excludeId?: MapId): GameMap {
  const all = getAllMaps();
  const available = excludeId ? all.filter((m) => m.id !== excludeId) : all;
  return available[Math.floor(Math.random() * available.length)];
}
