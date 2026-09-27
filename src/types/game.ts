export type WeaponId =
  | 'laser_katana'
  | 'sledgehammer'
  | 'battle_axe'
  | 'shotgun'
  | 'rocket_launcher'
  | 'railgun'
  | 'dual_sai'
  | 'fire_wand'
  | 'power_fists'
  | 'flail'
  | 'energy_spear'
  | 'plasma_scythe'
  | 'boomerang_blade'
  | 'chainsaw'
  | 'grenade_launcher'
  | 'heavy_crossbow'
  | 'thunder_hammer'
  | 'kunai_burst';

export type WeaponType = 'melee' | 'ranged' | 'flail' | 'fists';

export interface Weapon {
  id: WeaponId;
  nameRu: string;
  nameEn: string;
  type: WeaponType;
  damage: number;
  cooldown: number; // in milliseconds
  knockback: number;
  range: number;
  description: string;
  color: string;
  glowColor: string;
  speedMultiplier?: number;
  recoil?: number;
  iconName: string;
}

export type MapId =
  | 'castle_bridge'
  | 'sky_platforms'
  | 'lava_cavern'
  | 'cyber_roof'
  | 'bomb_depot'
  | 'orbital_station'
  | 'deep_space_void'
  | 'moon_base'
  | 'asteroid_belt'
  | string; // Allows custom map IDs e.g. custom_16938282

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'oneway' | 'curved' | 'bouncer' | 'spikes' | 'hazard_block';
  curveOffsetY?: number; // for wavy royal bridge
  color?: string;
  label?: string;
}

export interface Hazard {
  type: 'lava' | 'void' | 'laser' | 'spikes';
  y: number;
  damagePerSec: number;
}

export interface BombEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  timer: number; // in seconds, counts down
  maxTimer: number;
  exploded: boolean;
  damage: number;
  blastRadius: number;
}

export interface BarrelEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  exploded: boolean;
}

export interface MeteoriteEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  damage: number;
  active: boolean;
}

export interface GameMap {
  id: MapId;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  bgType: 'castle' | 'sky' | 'lava' | 'cyber' | 'bunker' | 'space' | 'custom';
  platforms: Platform[];
  hazards: Hazard[];
  spawns: [ [number, number], [number, number] ]; // p1, p2 [x, y]
  hasVoidBelow: boolean;
  isZeroGravity?: boolean;
  initialBombs?: Array<{ x: number; y: number; timer: number }>;
  initialBarrels?: Array<{ x: number; y: number }>;
  customWidth?: number;
  customHeight?: number;
  meteoritesEnabled?: boolean;
  meteoriteSpawnInterval?: number; // in seconds
  isCustom?: boolean;
}

export interface RagdollJoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Player {
  id: 'p1' | 'p2';
  name: string;
  color: string;
  glowColor: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1; // 1 = right, -1 = left
  hp: number;
  maxHp: number;
  weapon: Weapon;
  attackCooldown: number;
  attacking: boolean;
  attackTimer: number; // duration of current strike
  isGrounded: boolean;
  jumpsLeft: number;
  isDead: boolean;
  deathTime: number;
  score: number;
  kills: number;
  damageDealt: number;

  // Flail physics
  flailAngle: number;
  flailAngularVelocity: number;

  // Ragdoll on death or heavy hit
  ragdollActive: boolean;
  joints: {
    head: RagdollJoint;
    chest: RagdollJoint;
    pelvis: RagdollJoint;
    leftHand: RagdollJoint;
    rightHand: RagdollJoint;
    leftFoot: RagdollJoint;
    rightFoot: RagdollJoint;
  };

  // Run cycle animation
  runCycle: number;
  hitFlashTimer: number;

  // Dynamic weapon aiming (bobbing up and down)
  aimAngle: number;
  aimCycle: number;

  // Jump charge & rocket launch
  jumpHoldTimer: number; // in seconds
  jumpSuperCharged: boolean;
}

export interface Projectile {
  id: number;
  ownerId: 'p1' | 'p2';
  weaponId: WeaponId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  knockback: number;
  color: string;
  glowColor: string;
  type: 'bullet' | 'rocket' | 'laser_beam' | 'fireball' | 'axe_spin' | 'pellet' | 'grenade' | 'bolt' | 'kunai';
  lifetime: number;
  maxLifetime: number;
  bouncesLeft?: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
  piercing?: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'blood' | 'smoke' | 'fire' | 'shockwave' | 'debris' | 'text' | 'ring';
  text?: string;
  fontSize?: number;
}

export type GamePhase =
  | 'start_screen'
  | 'countdown'
  | 'fighting'
  | 'round_won'
  | 'match_won'
  | 'editor'
  | 'settings';

export type GameMode = 'pvp' | 'ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type GravityPreset = 'moon' | 'low' | 'standard' | 'heavy' | 'jupiter' | 'custom';

export interface GameSettings {
  // Gravity
  gravity: number;
  gravityPreset: GravityPreset;

  // Bombs
  bombDamage: number;
  bombBlastRadius: number;
  bombTimer: number;
  extraBombsCount: number;

  // Combat Stats
  playerMaxHp: number;
  damageMultiplier: number;
  knockbackMultiplier: number;
  cooldownMultiplier: number;

  // Movement & Physics
  moveSpeedMultiplier: number;
  jumpForceMultiplier: number;
  projectileSpeedMultiplier: number;

  // Match Rules
  roundsToWin: number;
  meteoritesFrequency: number;
  mapSelectionMode: 'locked' | 'random' | 'sequential';
  lockedMapId: string;

  // Attack System
  autoRangedShootOnMove: boolean;
  autoMeleeOnContact: boolean;
  cameraShakeIntensity: number;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  gravity: 0.55,
  gravityPreset: 'standard',
  bombDamage: 65,
  bombBlastRadius: 130,
  bombTimer: 14,
  extraBombsCount: 0,
  playerMaxHp: 100,
  damageMultiplier: 1.0,
  knockbackMultiplier: 1.0,
  cooldownMultiplier: 1.0,
  moveSpeedMultiplier: 1.0,
  jumpForceMultiplier: 1.0,
  projectileSpeedMultiplier: 1.0,
  roundsToWin: 5,
  meteoritesFrequency: 1.0,
  mapSelectionMode: 'random',
  lockedMapId: 'castle_bridge',
  autoRangedShootOnMove: true,
  autoMeleeOnContact: true,
  cameraShakeIntensity: 1.0,
};
