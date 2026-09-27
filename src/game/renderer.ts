import {
  Player,
  GameMap,
  Platform,
  Projectile,
  Particle,
  BombEntity,
  MeteoriteEntity,
  Weapon,
} from '../types/game';
import { getPlatformTopY } from './physics';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  map: GameMap,
  players: [Player, Player],
  projectiles: Projectile[],
  bombs: BombEntity[],
  particles: Particle[],
  cameraShake: number,
  showHpBar: boolean = false,
  meteorites: MeteoriteEntity[] = []
): void {
  ctx.save();

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Apply Camera Shake
  if (cameraShake > 0) {
    const shakeX = (Math.random() - 0.5) * cameraShake * 1.4;
    const shakeY = (Math.random() - 0.5) * cameraShake * 1.4;
    ctx.translate(shakeX, shakeY);
  }

  // 1. Draw Background
  drawBackground(ctx, width, height, map);

  // 2. Draw Platforms & Arenas
  drawPlatforms(ctx, map);

  // 3. Draw Hazards (Lava / Void glow)
  drawHazards(ctx, width, height, map);

  // 4. Draw Meteorites
  drawMeteorites(ctx, meteorites);

  // 5. Draw Bombs
  drawBombs(ctx, bombs);

  // 6. Draw Projectiles
  drawProjectiles(ctx, projectiles);

  // 7. Draw Players (Agents)
  for (const player of players) {
    drawAgent(ctx, player, showHpBar);
  }

  // 8. Draw Particles & Damage Numbers
  drawParticles(ctx, particles);

  ctx.restore();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  map: GameMap
): void {
  if (map.bgType === 'castle') {
    // Castle wall inspired by reference screenshot
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#362131');
    grad.addColorStop(1, '#1e101c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle stone brick pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let y = 40; y < height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Left and right stone battlements/pillars
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, 0, 140, 280);
    ctx.fillRect(width - 140, 0, 140, 280);

    // Brick texture on side pillars
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    for (let y = 0; y < 280; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(140, y);
      ctx.moveTo(width - 140, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (map.bgType === 'sky') {
    // Dusk sky with clouds
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.6, '#312e81');
    grad.addColorStop(1, '#db2777');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Distant mountain silhouette
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height - 160);
    ctx.lineTo(250, height - 260);
    ctx.lineTo(500, height - 180);
    ctx.lineTo(750, height - 290);
    ctx.lineTo(width, height - 150);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  } else if (map.bgType === 'lava') {
    // Volcanic dark cavern
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.7, '#451a03');
    grad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Hanging stalactites
    ctx.fillStyle = '#0c0a09';
    for (let x = 60; x < width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x - 25, 0);
      ctx.lineTo(x + 25, 0);
      ctx.lineTo(x, 70 + (x % 50));
      ctx.closePath();
      ctx.fill();
    }
  } else if (map.bgType === 'cyber') {
    // Cyberpunk night skyline
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#030712');
    grad.addColorStop(0.6, '#111827');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Neon grid in background
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  } else {
    // Bunker
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    // Hazard industrial stripes
    ctx.fillStyle = '#27272a';
    for (let x = 0; x < width; x += 80) {
      ctx.fillRect(x, 0, 40, height);
    }
  }
}

function drawPlatforms(ctx: CanvasRenderingContext2D, map: GameMap): void {
  for (const plat of map.platforms) {
    if (plat.type === 'curved') {
      // Royal Bridge curved architecture like the user screenshot!
      drawCurvedBridge(ctx, plat);
    } else if (plat.type === 'spikes') {
      // Deadly Spikes (Requirement: Spikes that quickly damage/kill)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(plat.x, plat.y + 10, plat.width, plat.height - 10);
      
      const spikeCount = Math.floor(plat.width / 14);
      const spikeW = plat.width / spikeCount;
      for (let i = 0; i < spikeCount; i++) {
        const sx = plat.x + i * spikeW;
        ctx.beginPath();
        ctx.moveTo(sx, plat.y + 10);
        ctx.lineTo(sx + spikeW / 2, plat.y);
        ctx.lineTo(sx + spikeW, plat.y + 10);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (plat.type === 'hazard_block') {
      // Hazardous Block
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

      // Warning hazard diagonal stripes
      ctx.fillStyle = '#eab308';
      for (let sx = -plat.height; sx < plat.width; sx += 16) {
        ctx.beginPath();
        ctx.moveTo(plat.x + sx, plat.y);
        ctx.lineTo(plat.x + sx + 8, plat.y);
        ctx.lineTo(plat.x + sx + 8 + plat.height, plat.y + plat.height);
        ctx.lineTo(plat.x + sx + plat.height, plat.y + plat.height);
        ctx.closePath();
        ctx.fill();
      }

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
    } else if (plat.type === 'bouncer') {
      // Neon trampoline
      ctx.fillStyle = '#15803d';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      // Glowing green top pad
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(plat.x, plat.y - 4, plat.width, 6);
      // Spring coils underneath
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(plat.x + 15, plat.y + 4);
      ctx.lineTo(plat.x + 25, plat.y + plat.height - 2);
      ctx.lineTo(plat.x + 35, plat.y + 4);
      ctx.lineTo(plat.x + 45, plat.y + plat.height - 2);
      ctx.lineTo(plat.x + 55, plat.y + 4);
      ctx.stroke();
    } else {
      // Standard solid or one-way platform
      ctx.fillStyle = plat.color || '#334155';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

      // Top highlight rim
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(plat.x, plat.y, plat.width, 4);

      // Border outline
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
    }
  }
}

function drawMeteorites(ctx: CanvasRenderingContext2D, meteorites: MeteoriteEntity[]): void {
  for (const met of meteorites) {
    if (!met.active) continue;

    ctx.save();
    ctx.translate(met.x, met.y);
    ctx.rotate(met.rotation);

    // Fiery glow aura
    const grad = ctx.createRadialGradient(0, 0, met.radius * 0.4, 0, 0, met.radius * 1.5);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.5, '#dc2626');
    grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, met.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Asteroid Body
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    const sides = 7;
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const r = met.radius * (0.8 + Math.sin(i * 3) * 0.2);
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

function drawCurvedBridge(ctx: CanvasRenderingContext2D, plat: Platform): void {
  const steps = 60;
  const dx = plat.width / steps;

  // 1. Draw Arch Stone Foundation Underneath
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(plat.x, plat.y + plat.height);

  for (let i = 0; i <= steps; i++) {
    const x = plat.x + i * dx;
    const y = getPlatformTopY(plat, x);
    ctx.lineTo(x, y + 16);
  }
  ctx.lineTo(plat.x + plat.width, plat.y + plat.height);
  ctx.closePath();
  ctx.fillStyle = '#78350f'; // Stone foundation
  ctx.fill();

  // Foundation stones segments
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2;
  for (let i = 0; i <= steps; i += 4) {
    const x = plat.x + i * dx;
    const topY = getPlatformTopY(plat, x);
    ctx.beginPath();
    ctx.moveTo(x, topY + 16);
    ctx.lineTo(x, plat.y + plat.height);
    ctx.stroke();
  }

  // 2. Draw Golden Wave Trim (like in screenshot)
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = plat.x + i * dx;
    const y = getPlatformTopY(plat, x);
    if (i === 0) ctx.moveTo(x, y + 14);
    else ctx.lineTo(x, y + 14);
  }
  for (let i = steps; i >= 0; i--) {
    const x = plat.x + i * dx;
    const y = getPlatformTopY(plat, x);
    ctx.lineTo(x, y + 4);
  }
  ctx.closePath();
  ctx.fillStyle = '#eab308'; // Rich Gold
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3. Draw Red Carpet Surface
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = plat.x + i * dx;
    const y = getPlatformTopY(plat, x);
    if (i === 0) ctx.moveTo(x, y + 4);
    else ctx.lineTo(x, y + 4);
  }
  for (let i = steps; i >= 0; i--) {
    const x = plat.x + i * dx;
    const y = getPlatformTopY(plat, x);
    ctx.lineTo(x, y - 6);
  }
  ctx.closePath();
  ctx.fillStyle = '#991b1b'; // Deep royal crimson carpet
  ctx.fill();

  // Carpet surface top line
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = plat.x + i * dx;
    const y = getPlatformTopY(plat, x) - 6;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

function drawHazards(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  map: GameMap
): void {
  for (const hazard of map.hazards) {
    if (hazard.type === 'lava') {
      const lavaY = hazard.y;
      // Boiling lava body
      const grad = ctx.createLinearGradient(0, lavaY, 0, height);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.4, '#ef4444');
      grad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, lavaY, width, height - lavaY);

      // Lava wave crust
      ctx.beginPath();
      ctx.moveTo(0, lavaY);
      const time = Date.now() * 0.003;
      for (let x = 0; x <= width; x += 20) {
        const y = lavaY + Math.sin(x * 0.03 + time) * 4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = '#fdba74';
      ctx.fill();
    }
  }
}

function drawBombs(ctx: CanvasRenderingContext2D, bombs: BombEntity[]): void {
  for (const bomb of bombs) {
    ctx.save();

    // 1. Draw Blast Radius Danger Zone (Requirement 1: show explosion radius so everyone knows how far to stay!)
    const blastR = bomb.blastRadius || 135;
    const isCritical = bomb.timer <= 3.0;
    const pulseSpeed = isCritical ? 0.018 : 0.005;
    const pulse = Math.sin(Date.now() * pulseSpeed) * 0.5 + 0.5;

    // Translucent filled danger zone area
    const bgAlpha = isCritical ? 0.08 + pulse * 0.1 : 0.04 + pulse * 0.04;
    ctx.beginPath();
    ctx.arc(bomb.x, bomb.y, blastR, 0, Math.PI * 2);
    ctx.fillStyle = isCritical ? `rgba(239, 68, 68, ${bgAlpha})` : `rgba(245, 158, 11, ${bgAlpha})`;
    ctx.fill();

    // Animated dashed perimeter ring
    ctx.beginPath();
    ctx.arc(bomb.x, bomb.y, blastR, 0, Math.PI * 2);
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -Date.now() * 0.02;
    ctx.lineWidth = isCritical ? 2.5 : 1.8;
    ctx.strokeStyle = isCritical
      ? `rgba(239, 68, 68, ${0.65 + pulse * 0.35})`
      : `rgba(245, 158, 11, ${0.45 + pulse * 0.3})`;
    ctx.stroke();
    ctx.setLineDash([]);

    // Clear danger label on top of blast zone perimeter
    ctx.save();
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = isCritical ? '#ef4444' : '#f59e0b';
    ctx.fillText('⚠️ ЗОНА ВЗРЫВА БОМБЫ', bomb.x, bomb.y - blastR - 3);
    ctx.restore();

    // 2. Bomb body (black iron sphere)
    ctx.beginPath();
    ctx.arc(bomb.x, bomb.y, bomb.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#171717';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#404040';
    ctx.stroke();

    // Sphere highlight
    ctx.beginPath();
    ctx.arc(bomb.x - bomb.radius * 0.35, bomb.y - bomb.radius * 0.35, bomb.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();

    // Fuse cap & burning wick
    ctx.fillStyle = '#737373';
    ctx.fillRect(bomb.x - 4, bomb.y - bomb.radius - 4, 8, 4);

    // Burning spark
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(bomb.x, bomb.y - bomb.radius - 6, 4, 0, Math.PI * 2);
    ctx.fill();

    // Large white countdown digits matching user's screenshot!
    const secondsLeft = Math.max(0, Math.ceil(bomb.timer));
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${secondsLeft}`, bomb.x, bomb.y);

    ctx.restore();
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const p of projectiles) {
    ctx.save();

    // Draw trail
    for (const pt of p.trail) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p.radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = p.glowColor;
      ctx.globalAlpha = pt.alpha * 0.5;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (p.type === 'laser_beam') {
      // High-power laser line
      ctx.strokeStyle = p.glowColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * 1.5, p.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // White inner core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (p.type === 'rocket') {
      // Rocket body
      ctx.translate(p.x, p.y);
      const angle = Math.atan2(p.vy, p.vx);
      ctx.rotate(angle);

      // Rocket cylinder
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-12, -4, 16, 8);
      // Cone head
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(4, -4);
      ctx.lineTo(12, 0);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      // Tail fins
      ctx.fillStyle = '#374151';
      ctx.fillRect(-14, -6, 4, 12);
    } else if (p.type === 'fireball') {
      // Glowing orb
      const grad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#f59e0b');
      grad.addColorStop(1, '#ef4444');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'grenade') {
      // Bouncy grenade with ribbing
      ctx.translate(p.x, p.y);
      ctx.rotate(p.x * 0.1);
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Pin cap
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-2, -p.radius - 2, 4, 3);
    } else if (p.type === 'bolt') {
      // Crossbow armor bolt
      ctx.translate(p.x, p.y);
      const angle = Math.atan2(p.vy, p.vx);
      ctx.rotate(angle);
      // Shaft
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(8, -3);
      ctx.lineTo(14, 0);
      ctx.lineTo(8, 3);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'kunai') {
      // Kunai throwing knife
      ctx.translate(p.x, p.y);
      const angle = Math.atan2(p.vy, p.vx);
      ctx.rotate(angle);
      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(0, -3);
      ctx.lineTo(-6, 0);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Standard bullet/pellet
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }
}

function drawAgent(
  ctx: CanvasRenderingContext2D,
  player: Player,
  showHpBar: boolean = false
): void {
  ctx.save();

  const isFlashing = player.hitFlashTimer > 0;
  const agentColor = isFlashing ? '#ffffff' : player.color;
  const outlineColor = '#000000';

  if (player.ragdollActive) {
    // Draw ragdoll skeleton when dead or launched
    drawRagdoll(ctx, player, agentColor);
    ctx.restore();
    return;
  }

  // Head
  const headX = player.x;
  const headY = player.y - 24;
  const headRadius = 14;

  // Head circle with thick black outline (classic Supreme Duelist style!)
  ctx.beginPath();
  ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
  ctx.fillStyle = agentColor;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();

  // Cool Agent Glasses / Visor
  const facing = player.facing;
  ctx.fillStyle = '#000000';
  ctx.fillRect(headX + (facing === 1 ? 2 : -12), headY - 4, 10, 5);
  // Visor reflection
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(headX + (facing === 1 ? 5 : -9), headY - 3, 4, 2);

  // Torso / Spine
  const spineTopY = headY + headRadius - 2;
  const spineBottomY = player.y + 12;

  ctx.lineWidth = 5;
  ctx.strokeStyle = outlineColor;
  ctx.beginPath();
  ctx.moveTo(headX, spineTopY);
  ctx.lineTo(headX, spineBottomY);
  ctx.stroke();

  ctx.lineWidth = 3.5;
  ctx.strokeStyle = agentColor;
  ctx.beginPath();
  ctx.moveTo(headX, spineTopY);
  ctx.lineTo(headX, spineBottomY);
  ctx.stroke();

  // Legs with running / jumping physics and articulated joints
  const hipY = spineBottomY;
  const leftFoot = player.joints.leftFoot;
  const rightFoot = player.joints.rightFoot;

  drawArticulatedLeg(ctx, headX - 4, hipY, leftFoot.x, leftFoot.y, facing, agentColor, true);
  drawArticulatedLeg(ctx, headX + 4, hipY, rightFoot.x, rightFoot.y, facing, agentColor, false);

  // Arm & Weapon with articulated shoulder-elbow-hand motion
  drawArticulatedArmsAndWeapon(ctx, player, headX, spineTopY + 6, agentColor);

  // Signs of damage on the agent (blood cuts, scratches, critical warning pulse)
  if (player.hp < 75) {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headX - 4, headY - 8);
    ctx.lineTo(headX - 1, headY - 4);
    ctx.moveTo(headX + 2, headY - 9);
    ctx.lineTo(headX + 5, headY - 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(headX - 3, spineTopY + 8);
    ctx.lineTo(headX + 3, spineTopY + 12);
    ctx.stroke();
  }

  if (player.hp < 30) {
    // Critical danger heartbeat aura
    const pulse = Math.sin(Date.now() * 0.012) * 0.5 + 0.5;
    ctx.save();
    ctx.beginPath();
    ctx.arc(player.x, player.y - 6, 26 + pulse * 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Health bar & numeric HP above head (Requirement 3: ALWAYS show health and HP above agents in combat!)
  const barWidth = 46;
  const barHeight = 6;
  const barX = player.x - barWidth / 2;
  const barY = player.y - 48;

  // Background frame
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

  // Red underlay / damage track
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Current HP Fill
  const hpPercent = Math.max(0, player.hp / player.maxHp);
  ctx.fillStyle = player.id === 'p1' ? '#3b82f6' : '#ef4444';
  ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

  // Numeric HP Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  const hpText = `${Math.ceil(player.hp)} HP`;
  ctx.strokeText(hpText, player.x, barY - 2);
  ctx.fillText(hpText, player.x, barY - 2);

  // Rocket Launch Charge Indicator (in Zero Gravity when holding jump)
  if (player.jumpHoldTimer > 0) {
    const chargeProgress = Math.min(1, player.jumpHoldTimer / 2.0);
    const chargeWidth = 46;
    const chargeY = barY - 18;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(barX - 2, chargeY - 2, chargeWidth + 4, 6);

    ctx.fillStyle = chargeProgress >= 1 ? '#38BDF8' : '#F59E0B';
    ctx.fillRect(barX, chargeY, chargeWidth * chargeProgress, 4);

    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillStyle = chargeProgress >= 1 ? '#38BDF8' : '#FBBF24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      chargeProgress >= 1 ? '🚀 ГОТОВ!' : `🚀 ${(chargeProgress * 100).toFixed(0)}%`,
      player.x,
      chargeY - 2
    );
  }

  ctx.restore();
}

function drawArticulatedLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  targetFootX: number,
  targetFootY: number,
  facing: number,
  color: string,
  isLeft: boolean
): void {
  const dx = targetFootX - hipX;
  const dy = targetFootY - hipY;
  const dist = Math.hypot(dx, dy);

  const thigh = 15;
  const shin = 16;
  const maxLen = thigh + shin - 1;
  const clampedDist = Math.min(dist, maxLen);

  // Law of cosines for knee bend angle
  const angle = Math.atan2(dy, dx);
  const cosKnee = (thigh * thigh + clampedDist * clampedDist - shin * shin) / (2 * thigh * clampedDist);
  const clampedCosKnee = Math.max(-1, Math.min(1, isNaN(cosKnee) ? 0 : cosKnee));
  const kneeBendOffset = Math.acos(clampedCosKnee);

  // Knee naturally bends towards facing direction
  const bendSign = facing;
  const thighAngle = angle + bendSign * kneeBendOffset;

  const kneeX = hipX + Math.cos(thighAngle) * thigh;
  const kneeY = hipY + Math.sin(thighAngle) * thigh;

  // Outline
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5.5;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(kneeX, kneeY);
  ctx.lineTo(targetFootX, targetFootY);
  ctx.stroke();

  // Primary Color
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(kneeX, kneeY);
  ctx.lineTo(targetFootX, targetFootY);
  ctx.stroke();

  // Foot / Boot
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(targetFootX, targetFootY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawArticulatedArmsAndWeapon(
  ctx: CanvasRenderingContext2D,
  player: Player,
  shoulderX: number,
  shoulderY: number,
  agentColor: string
): void {
  const facing = player.facing;
  const w = player.weapon;
  const isAttacking = player.attacking;

  // 1. Draw Back Arm (swings opposite to front or holds guard)
  const backHand = player.joints.leftHand;
  const backElbowX = (shoulderX + backHand.x) / 2 - facing * 3;
  const backElbowY = (shoulderY + backHand.y) / 2 + 4;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4.8;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(backElbowX, backElbowY);
  ctx.lineTo(backHand.x, backHand.y);
  ctx.stroke();

  ctx.lineWidth = 3.2;
  ctx.strokeStyle = agentColor;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(backElbowX, backElbowY);
  ctx.lineTo(backHand.x, backHand.y);
  ctx.stroke();

  // Hand fist
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(backHand.x, backHand.y, 3, 0, Math.PI * 2);
  ctx.fill();

  // 2. Draw Front Arm (holding weapon, points with aim angle)
  const aim = player.aimAngle || 0;
  const armReach = isAttacking ? 22 : 18;
  const frontHandX = shoulderX + facing * Math.cos(aim) * armReach;
  const frontHandY = shoulderY + Math.sin(aim) * armReach + (isAttacking ? -4 : 2);

  const frontElbowX = (shoulderX + frontHandX) / 2 + facing * 2;
  const frontElbowY = (shoulderY + frontHandY) / 2 + 3;

  ctx.lineWidth = 5.5;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(frontElbowX, frontElbowY);
  ctx.lineTo(frontHandX, frontHandY);
  ctx.stroke();

  ctx.lineWidth = 3.8;
  ctx.strokeStyle = agentColor;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(frontElbowX, frontElbowY);
  ctx.lineTo(frontHandX, frontHandY);
  ctx.stroke();

  // Front Hand Fist
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(frontHandX, frontHandY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Draw Weapon in Front Hand
  drawWeaponInHand(ctx, w, frontHandX, frontHandY, facing, player, isAttacking);
}

function drawWeaponInHand(
  ctx: CanvasRenderingContext2D,
  w: Weapon,
  handX: number,
  handY: number,
  facing: number,
  player: Player,
  isAttacking: boolean
): void {
  ctx.save();
  ctx.translate(handX, handY);
  if (facing === -1) {
    ctx.scale(-1, 1);
  }

  // Include dynamic aim angle (vertical bobbing / oscillation) for ALL weapons
  const dynamicAim = (player.aimAngle || 0) * (facing === 1 ? 1 : -1);
  const swingAngle = isAttacking ? 0.45 + dynamicAim * 0.4 : -0.15 + dynamicAim;
  ctx.rotate(swingAngle);

  if (w.id === 'sledgehammer') {
    // Golden sledgehammer like the user screenshot!
    // Handle
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(26, -14);
    ctx.stroke();

    // Large Golden Hammer Block
    ctx.fillStyle = '#facc15';
    ctx.fillRect(22, -26, 26, 24);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(22, -26, 26, 24);

    // Inner detail line
    ctx.strokeStyle = '#854d0e';
    ctx.beginPath();
    ctx.moveTo(35, -26);
    ctx.lineTo(35, -2);
    ctx.stroke();
  } else if (w.id === 'laser_katana') {
    // Hilt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, -2, 8, 4);
    // Glowing cyan blade
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(36, -6);
    ctx.stroke();
    // Inner white core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (w.id === 'battle_axe') {
    // Handle
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(24, -16);
    ctx.stroke();
    // Axe curved head
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(20, -14);
    ctx.lineTo(34, -24);
    ctx.lineTo(36, -6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (w.id === 'shotgun') {
    // Sawed off double barrel
    ctx.fillStyle = '#78350f'; // Stock
    ctx.fillRect(-6, -2, 10, 5);
    ctx.fillStyle = '#334155'; // Barrels
    ctx.fillRect(4, -3, 20, 5);
  } else if (w.id === 'rocket_launcher') {
    // RPG tube
    ctx.fillStyle = '#374151';
    ctx.fillRect(-10, -6, 32, 10);
    // Sight
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(8, -9, 4, 3);
  } else if (w.id === 'railgun') {
    // Futuristic sniper
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-8, -4, 36, 7);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(6, -5, 14, 3);
  } else if (w.id === 'dual_sai') {
    // Sai daggers
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(22, 0);
    ctx.moveTo(6, -4);
    ctx.lineTo(6, 4);
    ctx.stroke();
  } else if (w.id === 'fire_wand') {
    // Golden staff with floating fiery gem
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, 4);
    ctx.lineTo(22, -10);
    ctx.stroke();
    // Glowing orb
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(26, -12, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (w.id === 'power_fists') {
    // Giant boxing glove
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(8, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (w.id === 'flail') {
    ctx.restore(); // Exit local weapon transform to draw dynamic physics chain
    ctx.save();

    // Spiked iron ball on physics chain
    const chainLen = w.range;
    const ballX = handX + Math.cos(player.flailAngle) * chainLen;
    const ballY = handY + Math.sin(player.flailAngle) * chainLen;

    // Chain links
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(ballX, ballY);
    ctx.stroke();

    // Spiked iron ball
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Spikes around ball
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      const sx = ballX + Math.cos(a) * 16;
      const sy = ballY + Math.sin(a) * 16;
      ctx.beginPath();
      ctx.moveTo(ballX + Math.cos(a) * 10, ballY + Math.sin(a) * 10);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();
    return;
  } else if (w.id === 'chainsaw') {
    // Motor block
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-6, -6, 16, 12);
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-6, -6, 16, 12);
    // Guide bar & saw teeth with vibration jitter
    const jitter = (Math.random() - 0.5) * 1.5;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(10, -4 + jitter, 24, 8);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, -4 + jitter, 24, 8);
    // Chain blade tip
    ctx.beginPath();
    ctx.arc(34, jitter, 4, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();
    ctx.stroke();
  } else if (w.id === 'thunder_hammer') {
    // Metal shaft
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, -14);
    ctx.stroke();
    // High-tech electric head
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, -26, 24, 22);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(20, -26, 24, 22);
    // Glowing electric core
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(25, -22, 14, 14);
  } else if (w.id === 'heavy_crossbow') {
    // Stock
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6, -3, 26, 6);
    // Curved prod bow arms
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(18, -14);
    ctx.quadraticCurveTo(24, 0, 18, 14);
    ctx.stroke();
    // Steel bolt
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(28, 0);
    ctx.stroke();
  } else if (w.id === 'grenade_launcher') {
    // MGL revolver cylinder
    ctx.fillStyle = '#3f6212';
    ctx.beginPath();
    ctx.arc(4, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Barrel
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(10, -5, 18, 10);
  } else if (w.id === 'kunai_burst') {
    // Triple kunai blades in hand
    const angles = [-0.22, 0, 0.22];
    for (const a of angles) {
      ctx.save();
      ctx.rotate(a);
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18, 0);
      ctx.stroke();
      // Diamond head
      ctx.fillStyle = '#5eead4';
      ctx.beginPath();
      ctx.moveTo(12, -3);
      ctx.lineTo(20, 0);
      ctx.lineTo(12, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  } else if (w.id === 'energy_spear') {
    // Long spear shaft
    ctx.strokeStyle = '#065f46';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.lineTo(36, -8);
    ctx.stroke();
    // Glowing emerald spearhead
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(34, -13);
    ctx.lineTo(46, -10);
    ctx.lineTo(36, -3);
    ctx.closePath();
    ctx.fill();
  } else if (w.id === 'plasma_scythe') {
    // Long curved scythe haft
    ctx.strokeStyle = '#4c1d95';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-8, 12);
    ctx.lineTo(26, -16);
    ctx.stroke();
    // Giant violet crescent blade
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(26, -16, 22, -Math.PI * 0.4, Math.PI * 0.3);
    ctx.stroke();
  } else if (w.id === 'boomerang_blade') {
    // Cyan aerofoil boomerang
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(18, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

function drawRagdoll(ctx: CanvasRenderingContext2D, player: Player, color: string): void {
  const j = player.joints;

  // Head
  ctx.beginPath();
  ctx.arc(j.head.x, j.head.y, 13, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000000';
  ctx.stroke();

  // Torso
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(j.head.x, j.head.y + 10);
  ctx.lineTo(j.chest.x, j.chest.y);
  ctx.lineTo(j.pelvis.x, j.pelvis.y);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(j.chest.x, j.chest.y);
  ctx.lineTo(j.leftHand.x, j.leftHand.y);
  ctx.moveTo(j.chest.x, j.chest.y);
  ctx.lineTo(j.rightHand.x, j.rightHand.y);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(j.pelvis.x, j.pelvis.y);
  ctx.lineTo(j.leftFoot.x, j.leftFoot.y);
  ctx.moveTo(j.pelvis.x, j.pelvis.y);
  ctx.lineTo(j.rightFoot.x, j.rightFoot.y);
  ctx.stroke();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const pt of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.alpha);

    if (pt.type === 'text' && pt.text) {
      ctx.fillStyle = pt.color;
      ctx.font = `900 ${pt.fontSize || 18}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Outline for readability
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(pt.text, pt.x, pt.y);
      ctx.fillText(pt.text, pt.x, pt.y);
    } else if (pt.type === 'shockwave' || pt.type === 'ring') {
      ctx.strokeStyle = pt.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
