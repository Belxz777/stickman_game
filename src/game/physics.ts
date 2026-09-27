import {
  Player,
  GameMap,
  Platform,
  Projectile,
  Particle,
  BombEntity,
  BarrelEntity,
  MeteoriteEntity,
  Weapon,
} from '../types/game';
import {
  playHitSound,
  playExplosionSound,
  playPunchSound,
  playSwordSlashSound,
  playHeavySmashSound,
  playShotgunSound,
  playRocketLaunchSound,
  playLaserSound,
  playFireballSound,
  playBouncerSound,
  playJumpSound,
  playKOGongSound,
  playChainsawSound,
  playThunderSmashSound,
  playCrossbowSound,
} from '../audio/soundEngine';

export let GRAVITY = 0.55;
export function setGravity(value: number) {
  GRAVITY = value;
}
export const MAX_FALL_SPEED = 14;
export const MOVE_SPEED = 5.2;
export const JUMP_FORCE = -12.5;
export const BOUNCE_FORCE = -18.5;
export const FRICTION = 0.82;
export const AIR_DRAG = 0.94;

// Map ground curve calculation for the Royal Bridge
export function getPlatformTopY(platform: Platform, x: number): number {
  if (platform.type === 'curved' && platform.curveOffsetY) {
    // Smooth wavy bridge curve: dips in the center or waves
    const relX = (x - platform.x) / platform.width;
    if (relX < 0 || relX > 1) return platform.y;
    // Classic double wave like screenshot
    const wave = Math.sin(relX * Math.PI * 2);
    return platform.y + wave * platform.curveOffsetY;
  }
  return platform.y;
}

export function createDefaultPlayer(
  id: 'p1' | 'p2',
  weapon: Weapon,
  spawn: [number, number],
  maxHp: number = 100
): Player {
  const isP1 = id === 'p1';
  const color = isP1 ? '#2563EB' : '#DC2626'; // Vibrant Blue vs Crimson Red
  const glowColor = isP1 ? '#60A5FA' : '#F87171';
  const x = spawn[0];
  const y = spawn[1];

  return {
    id,
    name: isP1 ? 'Агент Синий' : 'Агент Красный',
    color,
    glowColor,
    x,
    y,
    vx: 0,
    vy: 0,
    width: 32,
    height: 64,
    facing: isP1 ? 1 : -1,
    hp: maxHp,
    maxHp,
    weapon,
    attackCooldown: 0,
    attacking: false,
    attackTimer: 0,
    isGrounded: false,
    jumpsLeft: 2,
    isDead: false,
    deathTime: 0,
    score: 0,
    kills: 0,
    damageDealt: 0,
    flailAngle: isP1 ? 0 : Math.PI,
    flailAngularVelocity: 0.1,
    ragdollActive: false,
    joints: {
      head: { x, y: y - 28, vx: 0, vy: 0 },
      chest: { x, y: y - 10, vx: 0, vy: 0 },
      pelvis: { x, y: y + 8, vx: 0, vy: 0 },
      leftHand: { x: x - 14, y: y - 8, vx: 0, vy: 0 },
      rightHand: { x: x + 14, y: y - 8, vx: 0, vy: 0 },
      leftFoot: { x: x - 12, y: y + 30, vx: 0, vy: 0 },
      rightFoot: { x: x + 12, y: y + 30, vx: 0, vy: 0 },
    },
    runCycle: 0,
    hitFlashTimer: 0,
    aimAngle: 0,
    aimCycle: isP1 ? 0 : Math.PI,
    jumpHoldTimer: 0,
    jumpSuperCharged: false,
  };
}

export function resetPlayerForRound(
  player: Player,
  weapon: Weapon,
  spawn: [number, number],
  maxHp: number = 100
): void {
  const isP1 = player.id === 'p1';
  player.x = spawn[0];
  player.y = spawn[1];
  player.vx = 0;
  player.vy = 0;
  player.hp = maxHp;
  player.maxHp = maxHp;
  player.weapon = weapon;
  player.attackCooldown = 0;
  player.attacking = false;
  player.attackTimer = 0;
  player.isGrounded = false;
  player.jumpsLeft = 2;
  player.isDead = false;
  player.deathTime = 0;
  player.facing = isP1 ? 1 : -1;
  player.flailAngle = isP1 ? 0 : Math.PI;
  player.flailAngularVelocity = 0.1;
  player.ragdollActive = false;
  player.runCycle = 0;
  player.hitFlashTimer = 0;
  player.aimAngle = 0;
  player.aimCycle = isP1 ? 0 : Math.PI;
  player.jumpHoldTimer = 0;
  player.jumpSuperCharged = false;

  // Reset joints
  const x = spawn[0];
  const y = spawn[1];
  player.joints = {
    head: { x, y: y - 28, vx: 0, vy: 0 },
    chest: { x, y: y - 10, vx: 0, vy: 0 },
    pelvis: { x, y: y + 8, vx: 0, vy: 0 },
    leftHand: { x: x - 14, y: y - 8, vx: 0, vy: 0 },
    rightHand: { x: x + 14, y: y - 8, vx: 0, vy: 0 },
    leftFoot: { x: x - 12, y: y + 30, vx: 0, vy: 0 },
    rightFoot: { x: x + 12, y: y + 30, vx: 0, vy: 0 },
  };
}

let nextId = 1;
export function getUniqueId(): number {
  return nextId++;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  attack: boolean;
}

export function updatePlayer(
  player: Player,
  input: InputState,
  map: GameMap,
  opponent: Player,
  projectiles: Projectile[],
  particles: Particle[],
  shakeRef: { value: number },
  dt: number,
  moveSpeedMult: number = 1.0,
  jumpForceMult: number = 1.0,
  damageMult: number = 1.0,
  cooldownMult: number = 1.0,
  autoFireCooldownMult: number = 1.3
): void {
  if (player.isDead) {
    updateRagdoll(player, map, dt);
    return;
  }

  if (player.hitFlashTimer > 0) {
    player.hitFlashTimer = Math.max(0, player.hitFlashTimer - dt * 1000);
  }

  // 1. Movement Inputs with configurable move speed multiplier
  const speed = MOVE_SPEED * (player.weapon.speedMultiplier || 1) * moveSpeedMult;
  if (input.left) {
    player.vx -= speed * 0.45;
    player.facing = -1;
    player.runCycle += 0.22 * moveSpeedMult;
  }
  if (input.right) {
    player.vx += speed * 0.45;
    player.facing = 1;
    player.runCycle += 0.22 * moveSpeedMult;
  }

  // Cap horizontal speed
  if (Math.abs(player.vx) > speed) {
    player.vx = Math.sign(player.vx) * speed;
  }

  // Jump
  if (input.up && player.jumpsLeft > 0) {
    player.vy = JUMP_FORCE * jumpForceMult;
    player.jumpsLeft--;
    player.isGrounded = false;
    playJumpSound();
    // Dust particles
    for (let i = 0; i < 4; i++) {
      particles.push({
        id: getUniqueId(),
        x: player.x + (Math.random() - 0.5) * 20,
        y: player.y + player.height / 2,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2,
        radius: 3 + Math.random() * 2,
        color: '#94A3B8',
        alpha: 0.8,
        decay: 0.05,
        type: 'smoke',
      });
    }
  }

  // Gravity & Friction (Adjustable non-zero gravity)
  player.vy += GRAVITY;
  if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;

  if (player.isGrounded) {
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
  } else {
    player.vx *= AIR_DRAG;
  }

  // Move
  player.x += player.vx;
  player.y += player.vy;

  // Screen horizontal boundaries
  if (player.x < 20) {
    player.x = 20;
    player.vx = 0;
  } else if (player.x > 980) {
    player.x = 980;
    player.vx = 0;
  }

  // 2. Platform Collisions
  player.isGrounded = false;
  const feetY = player.y + player.height / 2;
  const prevFeetY = feetY - player.vy;

  for (const plat of map.platforms) {
    // Check horizontal overlap
    if (player.x + player.width / 2 > plat.x && player.x - player.width / 2 < plat.x + plat.width) {
      const topY = getPlatformTopY(plat, player.x);

      // Dropping through oneway platform
      if (plat.type === 'oneway' && input.down && input.up) {
        continue;
      }

      // Spikes platform hazard! (Requirement: Spikes that quickly damage/kill)
      if (plat.type === 'spikes') {
        if (player.vy >= 0 && prevFeetY <= topY + 12 && feetY >= topY - 8) {
          player.y = topY - player.height / 2;
          player.vy = -6; // Bounce off spikes
          applyDamage(player, 40, 0, -8, opponent, shakeRef, particles, 'ШИПЫ!');
          playHeavySmashSound();
          shakeRef.value = Math.max(shakeRef.value, 10);
          continue;
        }
      }

      // Hazard block (damages and bounces player)
      if (plat.type === 'hazard_block') {
        if (feetY >= plat.y && player.y - player.height / 2 <= plat.y + plat.height) {
          applyDamage(player, 25, -player.facing * 8, -6, opponent, shakeRef, particles, 'ОПАСНОСТЬ!');
          player.vy = -8;
          player.vx = -player.facing * 6;
          continue;
        }
      }

      // Landing from above
      if (player.vy >= 0 && prevFeetY <= topY + 8 && feetY >= topY - 6) {
        player.y = topY - player.height / 2;
        player.vy = 0;
        player.isGrounded = true;
        player.jumpsLeft = 2;

        // Bouncer platform action!
        if (plat.type === 'bouncer') {
          player.vy = BOUNCE_FORCE;
          player.isGrounded = false;
          playBouncerSound();
          shakeRef.value = Math.max(shakeRef.value, 6);
          // Green energy ring
          particles.push({
            id: getUniqueId(),
            x: player.x,
            y: topY,
            vx: 0,
            vy: 0,
            radius: 20,
            color: '#22C55E',
            alpha: 1,
            decay: 0.08,
            type: 'ring',
          });
        }
      } else if (plat.type === 'solid') {
        // Solid wall collision
        const bottomY = plat.y + plat.height;
        if (player.y - player.height / 2 < bottomY && feetY > plat.y) {
          // Check if hitting head from below
          if (player.vy < 0 && player.y - player.height / 2 <= bottomY && prevFeetY > bottomY) {
            player.y = bottomY + player.height / 2;
            player.vy = 0;
          }
        }
      }
    }
  }

  // 3. Hazards Check (Lava / Void)
  for (const hazard of map.hazards) {
    if (hazard.type === 'void') {
      if (player.y > hazard.y) {
        killPlayer(player, 'void', opponent, shakeRef, particles);
        return;
      }
    } else if (hazard.type === 'lava') {
      if (feetY >= hazard.y) {
        // Lava damage
        const dmg = hazard.damagePerSec * dt;
        applyDamage(player, dmg, 0, -4, opponent, shakeRef, particles, 'ОГОНЬ!');
        // Fire particles
        for (let i = 0; i < 3; i++) {
          particles.push({
            id: getUniqueId(),
            x: player.x + (Math.random() - 0.5) * 20,
            y: hazard.y,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 5 - 2,
            radius: 4 + Math.random() * 4,
            color: '#F97316',
            alpha: 0.9,
            decay: 0.06,
            type: 'fire',
          });
        }
      }
    }
  }

  // Absolute Bottom bound for maps so players never fall through or disappear
  if (feetY > 560) {
    player.y = 560 - player.height / 2;
    player.vy = 0;
    player.isGrounded = true;
    player.jumpsLeft = 2;
  }

  // Top ceiling bound
  if (player.y - player.height / 2 < 10) {
    player.y = 10 + player.height / 2;
    player.vy = Math.max(0, player.vy);
  }

  // 4. Weapons & Flail mechanics
  if (player.attackCooldown > 0) {
    player.attackCooldown = Math.max(0, player.attackCooldown - dt * 1000);
  }

  // Smooth vertical aim oscillation (the barrel / weapon aims up and down smoothly)
  player.aimCycle += dt * 3.8; // Oscillation speed
  // Max vertical angle ~ +- 28 degrees (0.48 rad)
  player.aimAngle = Math.sin(player.aimCycle) * 0.48;

  if (player.attackTimer > 0) {
    player.attackTimer = Math.max(0, player.attackTimer - dt * 1000);
    if (player.attackTimer === 0) {
      player.attacking = false;
    }
  }

  // Flail dynamic rotation
  if (player.weapon.id === 'flail') {
    player.flailAngularVelocity += player.vx * 0.015 * player.facing;
    player.flailAngularVelocity *= 0.97;
    player.flailAngle += player.flailAngularVelocity + 0.08 * player.facing;

    // Check flail head collision with opponent
    const handX = player.x + player.facing * 14;
    const handY = player.y - 4;
    const flailHeadX = handX + Math.cos(player.flailAngle) * player.weapon.range;
    const flailHeadY = handY + Math.sin(player.flailAngle) * player.weapon.range;

    const distToOpp = Math.hypot(flailHeadX - opponent.x, flailHeadY - opponent.y);
    if (distToOpp < 32 && !opponent.isDead && player.attackCooldown <= 0) {
      const spd = Math.abs(player.flailAngularVelocity) + 0.6;
      const dmg = Math.min(58, Math.floor(player.weapon.damage * spd));
      const kx = Math.cos(player.flailAngle) * player.weapon.knockback;
      const ky = Math.sin(player.flailAngle) * player.weapon.knockback - 4;
      applyDamage(opponent, dmg, kx, ky, player, shakeRef, particles, 'УДАР КИСТЕНЕМ!');
      playHeavySmashSound();
      player.attackCooldown = player.weapon.cooldown;
    }
  }

  // 5. Automatic Attack System (Requirement: Melee on contact, Ranged auto-fire on move with configurable speed/delay)
  if (player.attackCooldown <= 0 && !player.attacking) {
    if (player.weapon.type === 'melee' || player.weapon.type === 'fists') {
      // Melee: auto-trigger on contact
      const dx = opponent.x - player.x;
      const dy = opponent.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (Math.sign(dx) === player.facing && dist <= player.weapon.range + 18) {
         executeAttack(player, opponent, projectiles, particles, shakeRef, damageMult, cooldownMult);
      }
    } else if (player.weapon.type === 'ranged') {
      // Ranged: auto-fire with configurable cooldown multiplier when moving
      if (input.left || input.right || input.up) {
        executeAttack(
          player,
          opponent,
          projectiles,
          particles,
          shakeRef,
          damageMult,
          cooldownMult * autoFireCooldownMult
        );
      }
    }
  }

  // Update animated joints with procedural physics-driven kinematics
  updateJointsFromPlayer(player);
}

// Procedural Animation System: Dynamically calculates joint angles and trajectories based on velocity & physics state
function updateJointsFromPlayer(player: Player): void {
  const x = player.x;
  const y = player.y;
  const vx = player.vx;
  const vy = player.vy;
  const facing = player.facing;
  const isGrounded = player.isGrounded;
  const time = Date.now() / 110;

  const hSpeed = Math.abs(vx);
  const speedRatio = Math.min(2.0, hSpeed / 4.8);
  const isMoving = hSpeed > 0.3;
  const isJumping = !isGrounded && vy < -0.8;
  const isFalling = !isGrounded && vy >= -0.8;

  // 1. Procedural Torso Lean and Aerodynamic Tilt
  // Running leans into motion; in air, body pitches along velocity vector
  const moveLean = isGrounded ? (vx / 6.0) * 8 : (vx / 8.0) * 12;
  const flightPitch = !isGrounded ? Math.max(-0.4, Math.min(0.4, (vy / 14.0) * 0.35 * facing)) : 0;

  player.joints.head.x = x + moveLean * 0.9 + Math.sin(flightPitch) * 4;
  player.joints.head.y = y - 26 + (isMoving && isGrounded ? Math.sin(player.runCycle * 2) * 1.5 : Math.sin(time) * 1.2);

  player.joints.chest.x = x + moveLean * 0.5;
  player.joints.chest.y = y - 10 + (isMoving && isGrounded ? Math.cos(player.runCycle * 2) * 1.2 : 0);

  player.joints.pelvis.x = x;
  player.joints.pelvis.y = y + 6 + (isGrounded && isMoving ? Math.abs(Math.sin(player.runCycle)) * 1.8 : 0);

  // 2. Procedural Leg & Foot Kinematics
  if (isJumping) {
    // JUMPING / RISING IN AIR:
    // Knees tuck up towards body; feet angle backwards dynamically with upward speed
    const tuckAmount = Math.min(12, Math.abs(vy) * 0.8);
    const airInertiaX = -(vx * 2.2);

    player.joints.leftFoot.x = x - facing * 8 + airInertiaX + Math.sin(time * 2.5) * 2;
    player.joints.leftFoot.y = y + 20 - tuckAmount;

    player.joints.rightFoot.x = x + facing * 6 + airInertiaX - Math.sin(time * 2.5) * 2;
    player.joints.rightFoot.y = y + 24 - tuckAmount * 0.7;
  } else if (isFalling) {
    // FALLING / FLIGHT:
    // Legs trail dynamically into the wind stream based on horizontal velocity vx and fall velocity vy
    const aeroDragX = -(vx * 3.4);
    const fallStream = Math.min(8, vy * 0.5);
    const flutter = Math.sin(time * 3.0) * (3.5 + Math.min(6, vy * 0.4));

    player.joints.leftFoot.x = x - facing * 10 + aeroDragX + flutter;
    player.joints.leftFoot.y = y + 32 - fallStream + Math.cos(time * 3.0) * 2.5;

    player.joints.rightFoot.x = x + facing * 8 + aeroDragX - flutter;
    player.joints.rightFoot.y = y + 32 - fallStream - Math.cos(time * 3.0) * 2.5;
  } else if (isMoving) {
    // GROUND RUNNING / WALKING:
    // Procedural cycloid foot stride curves with dynamic step length and foot lift
    const strideLength = 16 * Math.max(0.6, speedRatio);
    const strideHeight = 10 * Math.max(0.4, speedRatio);

    const leg1Cycle = player.runCycle;
    const leg2Cycle = player.runCycle + Math.PI;

    // Foot 1 (Left)
    player.joints.leftFoot.x = x - Math.sin(leg1Cycle) * strideLength * facing;
    player.joints.leftFoot.y = y + 29 - Math.max(0, Math.cos(leg1Cycle)) * strideHeight;

    // Foot 2 (Right)
    player.joints.rightFoot.x = x - Math.sin(leg2Cycle) * strideLength * facing;
    player.joints.rightFoot.y = y + 29 - Math.max(0, Math.cos(leg2Cycle)) * strideHeight;
  } else {
    // GROUND IDLE / STANDING:
    // Subtle breathing posture with stable planted boots
    const breath = Math.sin(time) * 1.0;
    player.joints.leftFoot.x = x - 8;
    player.joints.leftFoot.y = y + 30;
    player.joints.rightFoot.x = x + 8;
    player.joints.rightFoot.y = y + 30;
  }

  // 3. Procedural Arm & Hand Kinematics
  if (isJumping) {
    // Jump: Back arm reaches high for momentum, front arm balances
    player.joints.leftHand.x = x - facing * (16 + Math.abs(vx) * 1.5);
    player.joints.leftHand.y = y - 18 - Math.min(6, Math.abs(vy) * 0.5);

    player.joints.rightHand.x = x + facing * 20;
    player.joints.rightHand.y = y - 10 + (player.aimAngle || 0) * 10;
  } else if (isFalling) {
    // Flight / Falling: Arms flare outward as aerodynamic stabilizers
    const aeroWingX = -(vx * 2.5);
    const wingFlap = Math.sin(time * 3.0) * 3;

    player.joints.leftHand.x = x - facing * 22 + aeroWingX;
    player.joints.leftHand.y = y - 6 + wingFlap;

    player.joints.rightHand.x = x + facing * 22;
    player.joints.rightHand.y = y - 6 - wingFlap + (player.aimAngle || 0) * 12;
  } else if (isMoving) {
    // Running: Back arm swings in natural opposition to front foot
    const armSwing = Math.cos(player.runCycle) * 15 * speedRatio;

    player.joints.leftHand.x = x - facing * (12 + armSwing) - (vx * 0.6);
    player.joints.leftHand.y = y - 6 + Math.abs(Math.sin(player.runCycle)) * 4;

    player.joints.rightHand.x = x + facing * (18 - armSwing * 0.6);
    player.joints.rightHand.y = y - 6 + (player.aimAngle || 0) * 12;
  } else {
    // Idle: Gentle resting pose with natural breathing sway
    const breathHand = Math.sin(time) * 1.5;
    player.joints.leftHand.x = x - facing * 12;
    player.joints.leftHand.y = y - 6 + breathHand;

    player.joints.rightHand.x = x + facing * 16;
    player.joints.rightHand.y = y - 6 - breathHand + (player.aimAngle || 0) * 12;
  }
}

export function executeAttack(
  player: Player,
  opponent: Player,
  projectiles: Projectile[],
  particles: Particle[],
  shakeRef: { value: number },
  damageMult: number = 1.0,
  cooldownMult: number = 1.0
): void {
  const w = player.weapon;
  player.attackCooldown = Math.max(80, Math.floor(w.cooldown * cooldownMult));
  player.attacking = true;
  player.attackTimer = 180; // visual duration

  const facing = player.facing;
  const handX = player.x + facing * 18;
  const handY = player.y - 6;

  // Dynamic weapon aim angle (weapon bobs up and down smoothly for ALL weapons)
  const aimAngle = player.aimAngle || 0;
  const baseDirX = facing * Math.cos(aimAngle);
  const baseDirY = Math.sin(aimAngle);

  // Melee attack hitcheck
  if (w.type === 'melee' || w.type === 'fists') {
    if (w.id === 'laser_katana') {
      playSwordSlashSound();
      // Dash forward slightly
      player.vx += facing * 4.5;
    } else if (w.id === 'sledgehammer') {
      playHeavySmashSound();
      shakeRef.value = Math.max(shakeRef.value, 8);
    } else if (w.id === 'thunder_hammer') {
      playThunderSmashSound();
      shakeRef.value = Math.max(shakeRef.value, 9);
      // Lightning sparks
      for (let i = 0; i < 7; i++) {
        particles.push({
          id: getUniqueId(),
          x: handX + facing * 20,
          y: handY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          radius: 3 + Math.random() * 3,
          color: '#38BDF8',
          alpha: 1,
          decay: 0.08,
          type: 'spark',
        });
      }
    } else if (w.id === 'chainsaw') {
      playChainsawSound();
      shakeRef.value = Math.max(shakeRef.value, 5);
      player.vx += facing * 3.2;
      // High speed saw sparks
      for (let i = 0; i < 6; i++) {
        particles.push({
          id: getUniqueId(),
          x: handX + facing * 26,
          y: handY,
          vx: facing * (4 + Math.random() * 6),
          vy: (Math.random() - 0.5) * 7,
          radius: 2 + Math.random() * 2,
          color: '#FB923C',
          alpha: 1,
          decay: 0.1,
          type: 'spark',
        });
      }
    } else if (w.id === 'power_fists') {
      playPunchSound();
      player.vx += facing * 2.5;
    } else {
      playSwordSlashSound();
    }

    // Dynamic strike arc calculation: vertical reach shifts with the swinging angle!
    const dx = opponent.x - player.x;
    const dy = opponent.y - player.y;
    const dist = Math.hypot(dx, dy);
    const strikeOffsetY = Math.sin(aimAngle) * 36;
    const effectiveDy = dy - strikeOffsetY;

    // Is opponent in front and within weapon dynamic arc
    if (Math.sign(dx) === facing && dist <= w.range + 18 && Math.abs(effectiveDy) < 58) {
      let dmg = w.damage;
      let knockX = facing * w.knockback;
      // Dynamic vertical knockback: an upward swing launches enemies up, downward slams them down!
      let knockY = -5 + Math.sin(aimAngle) * 12;

      if (w.id === 'power_fists') {
        knockY = -12; // Uppercut launch
      } else if (w.id === 'sledgehammer') {
        knockY = -9;
      } else if (w.id === 'thunder_hammer') {
        knockY = -10;
      }

      applyDamage(opponent, dmg, knockX, knockY, player, shakeRef, particles, 'УДАР!');
    }
  } else if (w.type === 'ranged') {
    // Recoil
    if (w.recoil) {
      player.vx -= facing * w.recoil;
    }

    if (w.id === 'shotgun') {
      playShotgunSound();
      shakeRef.value = Math.max(shakeRef.value, 6);
      // 4 pellets spread along current barrel angle
      for (let i = 0; i < 4; i++) {
        const spreadOffset = (Math.random() - 0.5) * 0.22;
        const pelletAngle = aimAngle + spreadOffset;
        const speed = 16 + Math.random() * 3;
        projectiles.push({
          id: getUniqueId(),
          ownerId: player.id,
          weaponId: w.id,
          x: handX,
          y: handY,
          vx: facing * Math.cos(pelletAngle) * speed,
          vy: Math.sin(pelletAngle) * speed,
          radius: 4,
          damage: w.damage,
          knockback: w.knockback,
          color: '#F97316',
          glowColor: '#FDBA74',
          type: 'pellet',
          lifetime: 0.35,
          maxLifetime: 0.35,
          trail: [],
        });
      }
    } else if (w.id === 'rocket_launcher') {
      playRocketLaunchSound();
      shakeRef.value = Math.max(shakeRef.value, 4);
      const speed = 11;
      projectiles.push({
        id: getUniqueId(),
        ownerId: player.id,
        weaponId: w.id,
        x: handX,
        y: handY,
        vx: baseDirX * speed,
        vy: baseDirY * speed,
        radius: 8,
        damage: w.damage,
        knockback: w.knockback,
        color: '#EF4444',
        glowColor: '#F87171',
        type: 'rocket',
        lifetime: 2.5,
        maxLifetime: 2.5,
        trail: [],
      });
    } else if (w.id === 'railgun') {
      playLaserSound();
      shakeRef.value = Math.max(shakeRef.value, 9);
      const speed = 34;
      projectiles.push({
        id: getUniqueId(),
        ownerId: player.id,
        weaponId: w.id,
        x: handX,
        y: handY,
        vx: baseDirX * speed,
        vy: baseDirY * speed,
        radius: 6,
        damage: w.damage,
        knockback: w.knockback,
        color: '#A855F7',
        glowColor: '#C084FC',
        type: 'laser_beam',
        lifetime: 0.4,
        maxLifetime: 0.4,
        piercing: true,
        trail: [],
      });
    } else if (w.id === 'fire_wand') {
      playFireballSound();
      const speed = 11;
      projectiles.push({
        id: getUniqueId(),
        ownerId: player.id,
        weaponId: w.id,
        x: handX,
        y: handY,
        vx: baseDirX * speed,
        vy: baseDirY * speed - 1.5,
        radius: 10,
        damage: w.damage,
        knockback: w.knockback,
        color: '#FB923C',
        glowColor: '#FED7AA',
        type: 'fireball',
        lifetime: 2.2,
        maxLifetime: 2.2,
        bouncesLeft: 2,
        trail: [],
      });
    } else if (w.id === 'grenade_launcher') {
      playRocketLaunchSound();
      shakeRef.value = Math.max(shakeRef.value, 5);
      const speed = 13;
      projectiles.push({
        id: getUniqueId(),
        ownerId: player.id,
        weaponId: w.id,
        x: handX,
        y: handY,
        vx: baseDirX * speed,
        vy: baseDirY * speed - 2.5,
        radius: 7,
        damage: w.damage,
        knockback: w.knockback,
        color: '#84CC16',
        glowColor: '#A3E635',
        type: 'grenade',
        lifetime: 1.5,
        maxLifetime: 1.5,
        bouncesLeft: 3,
        trail: [],
      });
    } else if (w.id === 'heavy_crossbow') {
      playCrossbowSound();
      shakeRef.value = Math.max(shakeRef.value, 6);
      const speed = 28;
      projectiles.push({
        id: getUniqueId(),
        ownerId: player.id,
        weaponId: w.id,
        x: handX,
        y: handY,
        vx: baseDirX * speed,
        vy: baseDirY * speed,
        radius: 4,
        damage: w.damage,
        knockback: w.knockback,
        color: '#FBBF24',
        glowColor: '#FDE68A',
        type: 'bolt',
        lifetime: 1.2,
        maxLifetime: 1.2,
        trail: [],
      });
    } else if (w.id === 'kunai_burst') {
      playSwordSlashSound();
      shakeRef.value = Math.max(shakeRef.value, 3);
      const spread = [-0.16, 0, 0.16];
      const speed = 21;
      for (const offset of spread) {
        const angle = aimAngle + offset;
        projectiles.push({
          id: getUniqueId(),
          ownerId: player.id,
          weaponId: w.id,
          x: handX,
          y: handY,
          vx: facing * Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 5,
          damage: w.damage,
          knockback: w.knockback,
          color: '#2DD4BF',
          glowColor: '#5EEAD4',
          type: 'kunai',
          lifetime: 0.85,
          maxLifetime: 0.85,
          trail: [],
        });
      }
    } else if (w.id === 'boomerang_blade') {
      playSwordSlashSound();
      shakeRef.value = Math.max(shakeRef.value, 4);
      const speed = 16;
      projectiles.push({
        id: getUniqueId(),
        ownerId: player.id,
        weaponId: w.id,
        x: handX,
        y: handY,
        vx: baseDirX * speed,
        vy: baseDirY * speed,
        radius: 9,
        damage: w.damage,
        knockback: w.knockback,
        color: '#38BDF8',
        glowColor: '#7DD3FC',
        type: 'axe_spin',
        lifetime: 1.6,
        maxLifetime: 1.6,
        piercing: true,
        trail: [],
      });
    }
  }
}

export function applyDamage(
  victim: Player,
  damage: number,
  knockX: number,
  knockY: number,
  attacker: Player,
  shakeRef: { value: number },
  particles: Particle[],
  label?: string
): void {
  if (victim.isDead) return;

  const actualDmg = Math.round(damage);
  victim.hp = Math.max(0, victim.hp - actualDmg);
  victim.vx += knockX;
  victim.vy += knockY;
  victim.hitFlashTimer = 180;
  attacker.damageDealt += actualDmg;

  shakeRef.value = Math.max(shakeRef.value, actualDmg > 30 ? 12 : 7);

  // Play impact sound
  playHitSound();

  // Floating text particle (damage number)
  particles.push({
    id: getUniqueId(),
    x: victim.x + (Math.random() - 0.5) * 8,
    y: victim.y - 36,
    vx: (Math.random() - 0.5) * 1.5,
    vy: -3.2,
    radius: 0,
    color: '#FF2E63',
    alpha: 1,
    decay: 0.024,
    type: 'text',
    text: `-${actualDmg}`,
    fontSize: actualDmg > 30 ? 24 : 18,
  });

  // Realistic crimson blood droplets with physics gravity and splattering
  const bloodHues = ['#991B1B', '#DC2626', '#B91C1C', '#7F1D1D', '#E11D48'];
  const bloodCount = actualDmg > 35 ? 16 : 10;
  for (let i = 0; i < bloodCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 2.5 + Math.random() * 7;
    particles.push({
      id: getUniqueId(),
      x: victim.x + (Math.random() - 0.5) * 12,
      y: victim.y + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * spd + Math.sign(knockX) * 2.5,
      vy: Math.sin(angle) * spd - 3,
      radius: 2 + Math.random() * 3.5,
      color: bloodHues[Math.floor(Math.random() * bloodHues.length)],
      alpha: 1,
      decay: 0.025,
      type: 'blood',
    });
  }

  // Check death
  if (victim.hp <= 0) {
    killPlayer(victim, 'damage', attacker, shakeRef, particles);
  }
}

export function killPlayer(
  victim: Player,
  cause: 'damage' | 'void' | 'bomb',
  attacker: Player,
  shakeRef: { value: number },
  particles: Particle[]
): void {
  if (victim.isDead) return;

  victim.isDead = true;
  victim.hp = 0;
  victim.deathTime = Date.now();
  victim.ragdollActive = true;
  attacker.kills++;

  shakeRef.value = 16;
  playKOGongSound();

  // Floating KO text
  particles.push({
    id: getUniqueId(),
    x: victim.x,
    y: victim.y - 45,
    vx: 0,
    vy: -1.5,
    radius: 0,
    color: '#EF4444',
    alpha: 1,
    decay: 0.015,
    type: 'text',
    text: 'НОКАУТ!',
    fontSize: 28,
  });

  // Launch ragdoll limbs
  const blastDirX = victim.x > attacker.x ? 1 : -1;
  const blastForce = cause === 'bomb' ? 14 : 9;

  victim.joints.head.vx = blastDirX * blastForce + (Math.random() - 0.5) * 6;
  victim.joints.head.vy = -blastForce - Math.random() * 4;

  victim.joints.chest.vx = blastDirX * (blastForce * 0.8);
  victim.joints.chest.vy = -blastForce * 0.8;

  victim.joints.pelvis.vx = blastDirX * (blastForce * 0.7);
  victim.joints.pelvis.vy = -blastForce * 0.6;

  victim.joints.leftHand.vx = blastDirX * blastForce * 1.2;
  victim.joints.leftHand.vy = -blastForce;

  victim.joints.rightHand.vx = blastDirX * blastForce * 1.2;
  victim.joints.rightHand.vy = -blastForce;
}

// Ragdoll joint physics
function updateRagdoll(player: Player, map: GameMap, dt: number): void {
  const joints = Object.values(player.joints);

  for (const joint of joints) {
    joint.vy += GRAVITY * 0.8;
    joint.vx *= 0.96;
    joint.vy *= 0.98;

    joint.x += joint.vx;
    joint.y += joint.vy;

    // Collide with platforms
    for (const plat of map.platforms) {
      if (joint.x > plat.x && joint.x < plat.x + plat.width) {
        const topY = getPlatformTopY(plat, joint.x);
        if (joint.y >= topY && joint.y <= topY + 20) {
          joint.y = topY;
          joint.vy = -joint.vy * 0.35; // bounce
          joint.vx *= 0.7; // friction
        }
      }
    }
  }

  // Update center position for camera tracking
  player.x = player.joints.chest.x;
  player.y = player.joints.chest.y;
}

// Update Projectiles
export function updateProjectiles(
  projectiles: Projectile[],
  players: [Player, Player],
  bombs: BombEntity[],
  barrels: BarrelEntity[],
  map: GameMap,
  particles: Particle[],
  shakeRef: { value: number },
  dt: number
): void {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.lifetime -= dt;

    // Trail
    p.trail.unshift({ x: p.x, y: p.y, alpha: 0.8 });
    if (p.trail.length > 8) p.trail.pop();
    for (const pt of p.trail) pt.alpha -= 0.12;

    p.x += p.vx;
    p.y += p.vy;

    // Rocket acceleration & smoke
    if (p.type === 'rocket') {
      p.vx *= 1.04;
      particles.push({
        id: getUniqueId(),
        x: p.x - Math.sign(p.vx) * 10,
        y: p.y + (Math.random() - 0.5) * 4,
        vx: -Math.sign(p.vx) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 4 + Math.random() * 3,
        color: '#94A3B8',
        alpha: 0.7,
        decay: 0.06,
        type: 'smoke',
      });
    }

    // Fireball gravity
    if (p.type === 'fireball') {
      p.vy += 0.25;
      particles.push({
        id: getUniqueId(),
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 3 + Math.random() * 3,
        color: '#F97316',
        alpha: 0.8,
        decay: 0.08,
        type: 'fire',
      });
    }

    // Grenade bouncy gravity
    if (p.type === 'grenade') {
      p.vy += 0.35;
      if (Math.random() < 0.4) {
        particles.push({
          id: getUniqueId(),
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 2,
          vy: -1,
          radius: 2,
          color: '#84CC16',
          alpha: 0.8,
          decay: 0.08,
          type: 'spark',
        });
      }
    }

    // Kunai spark trail
    if (p.type === 'kunai') {
      if (Math.random() < 0.3) {
        particles.push({
          id: getUniqueId(),
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: 2,
          color: '#2DD4BF',
          alpha: 0.8,
          decay: 0.1,
          type: 'spark',
        });
      }
    }

    // Hit Players
    let projectileDestroyed = false;
    for (const target of players) {
      if (target.id !== p.ownerId && !target.isDead) {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        if (Math.hypot(dx, dy) < p.radius + 20) {
          const attacker = players.find((pl) => pl.id === p.ownerId)!;
          const kx = Math.sign(p.vx || 1) * p.knockback;
          const ky = -4;

          applyDamage(target, p.damage, kx, ky, attacker, shakeRef, particles);

          if (p.type === 'rocket') {
            detonateExplosion(p.x, p.y, 80, 40, players, bombs, barrels, shakeRef, particles);
          } else if (p.type === 'grenade') {
            detonateExplosion(p.x, p.y, 85, p.damage, players, bombs, barrels, shakeRef, particles);
          }

          if (!p.piercing) {
            projectileDestroyed = true;
            break;
          }
        }
      }
    }

    if (projectileDestroyed) {
      projectiles.splice(i, 1);
      continue;
    }

    // Hit Platforms
    for (const plat of map.platforms) {
      if (p.x > plat.x && p.x < plat.x + plat.width) {
        const topY = getPlatformTopY(plat, p.x);
        if (p.y >= topY && p.y <= topY + plat.height) {
          if (p.type === 'fireball' && (p.bouncesLeft || 0) > 0) {
            p.bouncesLeft!--;
            p.y = topY - 2;
            p.vy = -Math.abs(p.vy) * 0.7;
          } else if (p.type === 'grenade' && (p.bouncesLeft || 0) > 0) {
            p.bouncesLeft!--;
            p.y = topY - p.radius;
            p.vy = -Math.abs(p.vy) * 0.65;
            p.vx *= 0.85;
          } else {
            if (p.type === 'rocket') {
              detonateExplosion(p.x, p.y, 80, 40, players, bombs, barrels, shakeRef, particles);
            } else if (p.type === 'grenade') {
              detonateExplosion(p.x, p.y, 85, p.damage, players, bombs, barrels, shakeRef, particles);
            }
            projectiles.splice(i, 1);
            projectileDestroyed = true;
            break;
          }
        }
      }
    }

    if (projectileDestroyed) continue;

    // Timeout or out of screen
    if (p.lifetime <= 0 || p.x < -100 || p.x > 1100 || p.y > 700) {
      if (p.type === 'rocket') {
        detonateExplosion(p.x, p.y, 80, 40, players, bombs, barrels, shakeRef, particles);
      } else if (p.type === 'grenade') {
        detonateExplosion(p.x, p.y, 85, p.damage, players, bombs, barrels, shakeRef, particles);
      }
      projectiles.splice(i, 1);
    }
  }
}

// Big explosion physics (Rockets & Bombs)
export function detonateExplosion(
  x: number,
  y: number,
  radius: number,
  damage: number,
  players: [Player, Player],
  bombs: BombEntity[],
  barrels: BarrelEntity[],
  shakeRef: { value: number },
  particles: Particle[]
): void {
  playExplosionSound();
  shakeRef.value = Math.max(shakeRef.value, 15);

  // Shockwave
  particles.push({
    id: getUniqueId(),
    x,
    y,
    vx: 0,
    vy: 0,
    radius: 15,
    color: '#F97316',
    alpha: 1,
    decay: 0.05,
    type: 'shockwave',
  });

  // Smoke & Fireballs
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 2 + Math.random() * 8;
    particles.push({
      id: getUniqueId(),
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      radius: 6 + Math.random() * 8,
      color: Math.random() > 0.5 ? '#EF4444' : '#F59E0B',
      alpha: 1,
      decay: 0.04,
      type: 'fire',
    });
  }

  // Damage players in radius
  for (const pl of players) {
    if (pl.isDead) continue;
    const dist = Math.hypot(pl.x - x, pl.y - y);
    if (dist < radius) {
      const falloff = 1 - dist / radius;
      const actualDmg = Math.round(damage * falloff);
      const angle = Math.atan2(pl.y - y, pl.x - x);
      const kx = Math.cos(angle) * 16 * falloff;
      const ky = Math.sin(angle) * 16 * falloff - 6;
      applyDamage(pl, actualDmg, kx, ky, pl, shakeRef, particles, 'ВЗРЫВ!');
    }
  }

  // Detonate nearby bombs in chain reaction
  for (const b of bombs) {
    if (!b.exploded) {
      const dist = Math.hypot(b.x - x, b.y - y);
      if (dist < radius + b.radius) {
        b.timer = 0.01; // trigger instant explosion
      }
    }
  }
}

// Update Bombs (from screenshot, e.g. the rolling bomb on the bridge)
export function updateBombs(
  bombs: BombEntity[],
  players: [Player, Player],
  map: GameMap,
  particles: Particle[],
  shakeRef: { value: number },
  dt: number
): void {
  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];
    if (bomb.exploded) {
      bombs.splice(i, 1);
      continue;
    }

    bomb.timer -= dt;

    // Sparks from fuse
    if (Math.random() < 0.3) {
      particles.push({
        id: getUniqueId(),
        x: bomb.x,
        y: bomb.y - bomb.radius - 8,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3,
        radius: 2,
        color: '#F59E0B',
        alpha: 1,
        decay: 0.08,
        type: 'spark',
      });
    }

    // Roll physics on bridge curve
    bomb.vy += GRAVITY * 0.7;
    bomb.x += bomb.vx;
    bomb.y += bomb.vy;

    for (const plat of map.platforms) {
      if (bomb.x > plat.x && bomb.x < plat.x + plat.width) {
        const topY = getPlatformTopY(plat, bomb.x);
        if (bomb.y + bomb.radius >= topY && bomb.y - bomb.radius <= topY + 20) {
          bomb.y = topY - bomb.radius;
          bomb.vy = 0;

          // Slope roll on curved bridge
          if (plat.type === 'curved' && plat.curveOffsetY) {
            const relX = (bomb.x - plat.x) / plat.width;
            const slope = Math.cos(relX * Math.PI * 2) * (plat.curveOffsetY / 100);
            bomb.vx -= slope * 0.4;
          }
          bomb.vx *= 0.95;
        }
      }
    }

    // Screen boundaries for bomb so it cannot fall out of the map
    if (bomb.x < bomb.radius + 15) {
      bomb.x = bomb.radius + 15;
      bomb.vx = Math.abs(bomb.vx) * 0.7; // Bounce off left wall
    } else if (bomb.x > 1000 - bomb.radius - 15) {
      bomb.x = 1000 - bomb.radius - 15;
      bomb.vx = -Math.abs(bomb.vx) * 0.7; // Bounce off right wall
    }

    if (bomb.y > 550 - bomb.radius) {
      bomb.y = 550 - bomb.radius;
      bomb.vy = 0;
      bomb.vx *= 0.95;
    }

    // Collision with players - players can kick or hit the bomb!
    for (const pl of players) {
      if (pl.isDead) continue;
      const dist = Math.hypot(pl.x - bomb.x, pl.y - bomb.y);
      if (dist < bomb.radius + 18) {
        // Transfer impulse
        bomb.vx += pl.vx * 0.8 + Math.sign(pl.facing) * 3;
        bomb.vy -= 2;
      }
    }

    // Check timer detonation
    if (bomb.timer <= 0) {
      bomb.exploded = true;
      detonateExplosion(bomb.x, bomb.y, bomb.blastRadius, bomb.damage, players, bombs, [], shakeRef, particles);
      bombs.splice(i, 1);
    }
  }
}

// Update Particles
export function updateParticles(particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.alpha -= pt.decay;
    if (pt.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    pt.x += pt.vx;
    pt.y += pt.vy;

    if (pt.type === 'blood' || pt.type === 'debris') {
      pt.vy += GRAVITY * 0.5;
    } else if (pt.type === 'smoke' || pt.type === 'fire') {
      pt.vy -= 0.15; // Float upwards
      pt.radius += 0.2;
    } else if (pt.type === 'shockwave' || pt.type === 'ring') {
      pt.radius += 4.5;
    }
  }
}

// Update Dynamic Meteorites
export function updateMeteorites(
  meteorites: MeteoriteEntity[],
  players: Player[],
  map: GameMap,
  particles: Particle[],
  shakeRef: { value: number },
  dt: number,
  frequencyMultiplier: number = 1.0
): void {
  // Spawn new meteorites periodically if enabled globally or by map
  if (frequencyMultiplier > 0 && (map.meteoritesEnabled || frequencyMultiplier > 1.0)) {
    if (Math.random() < dt * 0.45 * frequencyMultiplier) {
      const mapWidth = map.customWidth || 1000;
      meteorites.push({
        id: getUniqueId(),
        x: Math.random() * (mapWidth - 100) + 50,
        y: -40,
        vx: (Math.random() - 0.5) * 3,
        vy: 4 + Math.random() * 5,
        radius: 18 + Math.random() * 12,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        damage: 45,
        active: true,
      });
    }
  }

  for (let i = meteorites.length - 1; i >= 0; i--) {
    const met = meteorites[i];
    if (!met.active) {
      meteorites.splice(i, 1);
      continue;
    }

    met.x += met.vx;
    met.y += met.vy;
    met.rotation += met.rotationSpeed;

    // Fiery tail particles
    if (Math.random() < 0.6) {
      particles.push({
        id: getUniqueId(),
        x: met.x + (Math.random() - 0.5) * met.radius,
        y: met.y - met.radius * 0.5,
        vx: (Math.random() - 0.5) * 2,
        vy: -met.vy * 0.3,
        radius: 3 + Math.random() * 4,
        color: '#F97316',
        alpha: 0.9,
        decay: 0.08,
        type: 'fire',
      });
    }

    // Check hit players
    for (const player of players) {
      if (player.isDead) continue;
      const dist = Math.hypot(met.x - player.x, met.y - player.y);
      if (dist < met.radius + 18) {
        met.active = false;
        applyDamage(player, met.damage, Math.sign(player.x - met.x) * 10, -8, player, shakeRef, particles, 'МЕТЕОРИТ!');
        playExplosionSound();
        shakeRef.value = Math.max(shakeRef.value, 12);
        break;
      }
    }

    // Check hit platforms or out of bounds
    if (met.active) {
      for (const plat of map.platforms) {
        if (
          met.x + met.radius > plat.x &&
          met.x - met.radius < plat.x + plat.width &&
          met.y + met.radius > plat.y &&
          met.y - met.radius < plat.y + plat.height
        ) {
          met.active = false;
          playExplosionSound();
          shakeRef.value = Math.max(shakeRef.value, 8);

          // Impact debris particles
          for (let k = 0; k < 8; k++) {
            particles.push({
              id: getUniqueId(),
              x: met.x,
              y: met.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              radius: 4 + Math.random() * 4,
              color: '#EA580C',
              alpha: 1,
              decay: 0.07,
              type: 'debris',
            });
          }
          break;
        }
      }
    }

    if (met.y > (map.customHeight || 600) + 50) {
      met.active = false;
    }
  }
}
