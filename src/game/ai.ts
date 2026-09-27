import { Player, GameMap, AIDifficulty, Projectile } from '../types/game';
import { InputState, getPlatformTopY } from './physics';

export function computeAIInput(
  bot: Player,
  opponent: Player,
  map: GameMap,
  projectiles: Projectile[],
  difficulty: AIDifficulty = 'medium'
): InputState {
  const input: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    attack: false,
  };

  if (bot.isDead) return input;

  const dx = opponent.x - bot.x;
  const dy = opponent.y - bot.y;
  const dist = Math.hypot(dx, dy);
  const isFacingOpponent = (dx > 0 && bot.facing === 1) || (dx < 0 && bot.facing === -1);

  // Reaction delays & accuracy based on difficulty
  const isRanged = bot.weapon.type === 'ranged';
  const idealMeleeDist = bot.weapon.range * 0.85;
  const idealRangedDist = 280;

  // 1. Hazard avoidance (Void & Lava)
  if (map.hasVoidBelow) {
    // Check if close to edge of platform
    let onEdge = true;
    for (const plat of map.platforms) {
      if (bot.x > plat.x + 15 && bot.x < plat.x + plat.width - 15) {
        onEdge = false;
        break;
      }
    }
    if (onEdge && bot.isGrounded) {
      // Jump back to center
      if (bot.x < 500) input.right = true;
      else input.left = true;
      input.up = true;
    }
  }

  // Lava hazard avoidance
  for (const hazard of map.hazards) {
    if (hazard.type === 'lava' && bot.y > hazard.y - 70) {
      input.up = true;
    }
  }

  // 2. Incoming projectile dodging
  for (const p of projectiles) {
    if (p.ownerId !== bot.id) {
      const pDist = Math.hypot(p.x - bot.x, p.y - bot.y);
      if (pDist < 160 && Math.abs(p.y - bot.y) < 40) {
        // Jump to dodge
        if (bot.isGrounded && Math.random() < (difficulty === 'hard' ? 0.85 : 0.5)) {
          input.up = true;
        }
      }
    }
  }

  // 3. Navigation & Positioning
  if (isRanged) {
    // Keep tactical range
    if (dist < idealRangedDist - 80) {
      // Too close, retreat backwards!
      if (dx > 0) input.left = true;
      else input.right = true;
    } else if (dist > idealRangedDist + 120) {
      // Move closer to shoot
      if (dx > 0) input.right = true;
      else input.left = true;
    } else {
      // In sweet spot, face opponent
      if (dx > 0) bot.facing = 1;
      else bot.facing = -1;
    }
  } else {
    // Melee: close in aggressively
    if (dist > idealMeleeDist) {
      if (dx > 0) input.right = true;
      else input.left = true;
    }
  }

  // Vertical navigation (jump if opponent is higher, or jump over obstacles)
  if (dy < -50 && (dist < 260 || Math.random() < 0.2)) {
    if (bot.isGrounded) input.up = true;
  }

  // Drop down if opponent is far below
  if (dy > 90 && Math.abs(dx) < 150) {
    input.down = true;
    if (Math.random() < 0.2) input.up = true;
  }

  // Unstuck jumping
  if (Math.abs(bot.vx) < 0.2 && (input.left || input.right) && bot.isGrounded && Math.random() < 0.3) {
    input.up = true;
  }

  // 4. Attack Decision
  if (bot.attackCooldown <= 0) {
    if (isRanged) {
      // Fire if roughly aligned on Y axis and facing
      const yAligned = Math.abs(dy) < 65;
      if (isFacingOpponent && yAligned && dist < bot.weapon.range) {
        input.attack = true;
      }
    } else {
      // Melee strike when within weapon reach
      if (dist <= bot.weapon.range + 18 && isFacingOpponent && Math.abs(dy) < 50) {
        input.attack = true;
      }
    }
  }

  return input;
}
