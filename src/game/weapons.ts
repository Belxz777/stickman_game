import { Weapon, WeaponId } from '../types/game';

export const DEFAULT_WEAPONS: Record<WeaponId, Weapon> = {
  laser_katana: {
    id: 'laser_katana',
    nameRu: 'Лазерная катана',
    nameEn: 'Laser Katana',
    type: 'melee',
    damage: 48,
    cooldown: 280,
    knockback: 10,
    range: 78,
    description: 'Быстрый рывок и смертоносный рассекающий удар энергией.',
    color: '#06B6D4', // Cyan
    glowColor: '#22D3EE',
    speedMultiplier: 1.15,
    iconName: 'Zap',
  },
  sledgehammer: {
    id: 'sledgehammer',
    nameRu: 'Золотая кувалда',
    nameEn: 'Golden Sledgehammer',
    type: 'melee',
    damage: 65,
    cooldown: 580,
    knockback: 18,
    range: 85,
    description: 'Тяжелый сокрушительный удар, отбрасывающий врага через всю арену.',
    color: '#FACC15', // Gold / Yellow
    glowColor: '#FEF08A',
    speedMultiplier: 1.05,
    iconName: 'Hammer',
  },
  battle_axe: {
    id: 'battle_axe',
    nameRu: 'Боевой топор',
    nameEn: 'Battle Axe',
    type: 'melee',
    damage: 55,
    cooldown: 420,
    knockback: 14,
    range: 82,
    description: 'Широкий рубящий взмах с вращением лезвия.',
    color: '#E11D48', // Crimson
    glowColor: '#FB7185',
    speedMultiplier: 1.1,
    iconName: 'Axe',
  },
  shotgun: {
    id: 'shotgun',
    nameRu: 'Обрез-дробовик',
    nameEn: 'Sawed-off Shotgun',
    type: 'ranged',
    damage: 6, // 4 pellets
    cooldown: 620,
    knockback: 9,
    range: 240,
    description: 'Веер из 4 картечин с отдачей. Ствол плавно ходит вверх-вниз при прицеливании.',
    color: '#F97316', // Orange
    glowColor: '#FDBA74',
    recoil: 5,
    iconName: 'Crosshair',
  },
  rocket_launcher: {
    id: 'rocket_launcher',
    nameRu: 'Ракетница РПГ',
    nameEn: 'Rocket Launcher',
    type: 'ranged',
    damage: 28,
    cooldown: 800,
    knockback: 15,
    range: 600,
    description: 'Запускает реактивную ракету со взрывной волной. Долгая перезарядка.',
    color: '#EF4444', // Red
    glowColor: '#F87171',
    recoil: 4,
    iconName: 'Flame',
  },
  railgun: {
    id: 'railgun',
    nameRu: 'Плазменный рельсотрон',
    nameEn: 'Plasma Railgun',
    type: 'ranged',
    damage: 26,
    cooldown: 720,
    knockback: 12,
    range: 750,
    description: 'Сверхточный мгновенный луч плазмы. Траектория зависит от угла качания ствола.',
    color: '#A855F7', // Purple
    glowColor: '#C084FC',
    iconName: 'Radio',
  },
  dual_sai: {
    id: 'dual_sai',
    nameRu: 'Парные клинки ниндзя',
    nameEn: 'Dual Ninja Sai',
    type: 'melee',
    damage: 32,
    cooldown: 190,
    knockback: 7,
    range: 65,
    description: 'Молниеносная серия быстрых колющих ударов парными трезубцами.',
    color: '#E2E8F0', // Steel
    glowColor: '#94A3B8',
    speedMultiplier: 1.25,
    iconName: 'Swords',
  },
  fire_wand: {
    id: 'fire_wand',
    nameRu: 'Магический посох огня',
    nameEn: 'Fire Wizard Wand',
    type: 'ranged',
    damage: 18,
    cooldown: 480,
    knockback: 8,
    range: 520,
    description: 'Выпускает сгустки пламени, оставляющие огненные искры.',
    color: '#F59E0B', // Amber
    glowColor: '#FCD34D',
    iconName: 'Sparkles',
  },
  power_fists: {
    id: 'power_fists',
    nameRu: 'Силовые кастеты',
    nameEn: 'Power Fists',
    type: 'fists',
    damage: 42,
    cooldown: 240,
    knockback: 16,
    range: 60,
    description: 'Сокрушительный апперкот, подбрасывающий врага высоко в воздух.',
    color: '#3B82F6', // Blue
    glowColor: '#93C5FD',
    speedMultiplier: 1.2,
    iconName: 'ShieldAlert',
  },
  flail: {
    id: 'flail',
    nameRu: 'Тяжелый шипастый кистень',
    nameEn: 'Spiked Battle Flail',
    type: 'flail',
    damage: 45,
    cooldown: 350,
    knockback: 14,
    range: 95,
    description: 'Вращающийся на цепи шар с шипами. Скорость вращения зависит от движения!',
    color: '#CBD5E1', // Silver
    glowColor: '#F1F5F9',
    iconName: 'RotateCcw',
  },
  energy_spear: {
    id: 'energy_spear',
    nameRu: 'Энергетическое копьё',
    nameEn: 'Energy Spear',
    type: 'melee',
    damage: 50,
    cooldown: 340,
    knockback: 13,
    range: 105,
    description: 'Длинный колющий выпад с огромной дистанцией поражения.',
    color: '#10B981', // Emerald
    glowColor: '#34D399',
    speedMultiplier: 1.08,
    iconName: 'Target',
  },
  plasma_scythe: {
    id: 'plasma_scythe',
    nameRu: 'Плазменная коса Жнеца',
    nameEn: 'Plasma Scythe',
    type: 'melee',
    damage: 58,
    cooldown: 460,
    knockback: 15,
    range: 90,
    description: 'Широкая смертоносная дуга плазменного лезвия с вихревым следом.',
    color: '#EC4899', // Pink / Magenta
    glowColor: '#F472B6',
    speedMultiplier: 1.06,
    iconName: 'Moon',
  },
  boomerang_blade: {
    id: 'boomerang_blade',
    nameRu: 'Летающий бумеранг-клинок',
    nameEn: 'Boomerang Blade',
    type: 'ranged',
    damage: 22,
    cooldown: 520,
    knockback: 9,
    range: 450,
    description: 'Вращающийся диск, который пронзает врагов насквозь и летит по траектории.',
    color: '#06B6D4', // Cyan
    glowColor: '#67E8F9',
    iconName: 'Disc',
  },
  chainsaw: {
    id: 'chainsaw',
    nameRu: 'Бензопила "Резня"',
    nameEn: 'Ripper Chainsaw',
    type: 'melee',
    damage: 58,
    cooldown: 220,
    knockback: 11,
    range: 76,
    description: 'Рычащая вибрирующая пила с искрами и брызгами. Угол атаки ходит вверх-вниз!',
    color: '#EA580C', // Deep Orange
    glowColor: '#FB923C',
    speedMultiplier: 1.12,
    iconName: 'Zap',
  },
  grenade_launcher: {
    id: 'grenade_launcher',
    nameRu: 'Гранатомёт MGL',
    nameEn: 'MGL Grenade Launcher',
    type: 'ranged',
    damage: 34,
    cooldown: 780,
    knockback: 15,
    range: 580,
    description: 'Выстреливает прыгучую гранату по дуге с взрывным радиусом при детонации.',
    color: '#84CC16', // Lime
    glowColor: '#A3E635',
    recoil: 4,
    iconName: 'Flame',
  },
  heavy_crossbow: {
    id: 'heavy_crossbow',
    nameRu: 'Бронебойный арбалет',
    nameEn: 'Heavy Armor Crossbow',
    type: 'ranged',
    damage: 38,
    cooldown: 680,
    knockback: 13,
    range: 720,
    description: 'Стреляет скоростным бронебойным стальным болтом по плавающему прицелу.',
    color: '#D97706', // Amber
    glowColor: '#FBBF24',
    recoil: 3,
    iconName: 'Crosshair',
  },
  thunder_hammer: {
    id: 'thunder_hammer',
    nameRu: 'Громовой молот Тесла',
    nameEn: 'Tesla Thunder Hammer',
    type: 'melee',
    damage: 68,
    cooldown: 540,
    knockback: 17,
    range: 86,
    description: 'Сокрушительный удар молнии с электрическим разрядом и звуковым ударом.',
    color: '#3B82F6', // Lightning Blue
    glowColor: '#60A5FA',
    speedMultiplier: 1.04,
    iconName: 'Hammer',
  },
  kunai_burst: {
    id: 'kunai_burst',
    nameRu: 'Веер кунаев шиноби',
    nameEn: 'Shinobi Kunai Fan',
    type: 'ranged',
    damage: 12,
    cooldown: 460,
    knockback: 8,
    range: 480,
    description: 'Веер из 3 скоростных бросковых кинжалов с изменяемым углом разброса.',
    color: '#14B8A6', // Teal
    glowColor: '#2DD4BF',
    speedMultiplier: 1.15,
    iconName: 'Swords',
  },
};

export const WEAPON_LIST = Object.values(DEFAULT_WEAPONS);

export function getSavedCustomWeapons(): Weapon[] {
  try {
    const raw = localStorage.getItem('agent_battle_custom_weapons');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomWeapons(weapons: Weapon[]): void {
  try {
    localStorage.setItem('agent_battle_custom_weapons', JSON.stringify(weapons));
  } catch {}
}

export function getAllWeapons(): Weapon[] {
  const custom = getSavedCustomWeapons();
  if (custom && custom.length > 0) {
    return custom;
  }
  return WEAPON_LIST;
}

export function exportWeaponsJson(): string {
  return JSON.stringify(getAllWeapons(), null, 2);
}

export function importWeaponsJson(jsonStr: string): Weapon[] {
  const parsed = JSON.parse(jsonStr);
  if (Array.isArray(parsed) && parsed.length > 0) {
    saveCustomWeapons(parsed);
    return parsed;
  }
  throw new Error('Некорректный JSON массив оружия');
}

export function resetWeaponsToDefault(): Weapon[] {
  try {
    localStorage.removeItem('agent_battle_custom_weapons');
  } catch {}
  return WEAPON_LIST;
}

export function getRandomWeapon(excludeId?: WeaponId): Weapon {
  const availableList = getAllWeapons();
  const available = excludeId ? availableList.filter((w) => w.id !== excludeId) : availableList;
  if (available.length === 0) return availableList[0] || WEAPON_LIST[0];
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

// Generate two different random weapons for each round
export function getRoundWeapons(): [Weapon, Weapon] {
  const w1 = getRandomWeapon();
  const w2 = getRandomWeapon(w1.id);
  return [w1, w2];
}
