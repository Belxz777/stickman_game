import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Player,
  GameMap,
  GamePhase,
  GameMode,
  AIDifficulty,
  Projectile,
  Particle,
  BombEntity,
  BarrelEntity,
} from './types/game';
import { MAPS, getRandomMap, getNextMap } from './game/maps';
import { getRoundWeapons } from './game/weapons';
import {
  createDefaultPlayer,
  resetPlayerForRound,
  updatePlayer,
  updateProjectiles,
  updateBombs,
  updateParticles,
  InputState,
} from './game/physics';
import { computeAIInput } from './game/ai';
import { renderGame } from './game/renderer';
import { GameHUD } from './components/GameHUD';
import { RoundOverlay } from './components/RoundOverlay';
import { MatchWinnerModal } from './components/MatchWinnerModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { StartScreen } from './components/StartScreen';
import { MobileControls } from './components/MobileControls';
import { playCountdownBeep, playRoundWin, playVictoryFanfare } from './audio/soundEngine';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const MAX_ROUNDS_TO_WIN = 5;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game Settings & UI States
  const [phase, setPhase] = useState<GamePhase>('start_screen');
  const [mode, setMode] = useState<GameMode>('pvp');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [countdown, setCountdown] = useState<number>(3);
  const [roundWinner, setRoundWinner] = useState<Player | null>(null);
  const [matchWinner, setMatchWinner] = useState<Player | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [showHpAndWeaponDetails, setShowHpAndWeaponDetails] = useState<boolean>(true);

  // Zero-Gravity Mode & Attack Key Remapping (Requirement 2)
  const [zeroGravityMode, setZeroGravityMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('agent_battle_zero_g') === '1';
    } catch {
      return false;
    }
  });

  const [p1AttackKey, setP1AttackKey] = useState<string>(() => {
    try {
      return localStorage.getItem('agent_battle_p1_key') || 'KeyF';
    } catch {
      return 'KeyF';
    }
  });

  const [p2AttackKey, setP2AttackKey] = useState<string>(() => {
    try {
      return localStorage.getItem('agent_battle_p2_key') || 'Enter';
    } catch {
      return 'Enter';
    }
  });

  const toggleZeroGravity = useCallback(() => {
    setZeroGravityMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('agent_battle_zero_g', next ? '1' : '0');
      } catch {}
      return next;
    });
  }, []);

  const updateP1AttackKey = useCallback((key: string) => {
    setP1AttackKey(key);
    try {
      localStorage.setItem('agent_battle_p1_key', key);
    } catch {}
  }, []);

  const updateP2AttackKey = useCallback((key: string) => {
    setP2AttackKey(key);
    try {
      localStorage.setItem('agent_battle_p2_key', key);
    } catch {}
  }, []);

  // Active Map
  const [currentMap, setCurrentMap] = useState<GameMap>(MAPS.castle_bridge);

  // Game Engine Entities (Stored in refs for 60fps high performance loop)
  const initialWeapons = useRef(getRoundWeapons());
  const player1Ref = useRef<Player>(
    createDefaultPlayer('p1', initialWeapons.current[0], MAPS.castle_bridge.spawns[0])
  );
  const player2Ref = useRef<Player>(
    createDefaultPlayer('p2', initialWeapons.current[1], MAPS.castle_bridge.spawns[1])
  );

  const projectilesRef = useRef<Projectile[]>([]);
  const bombsRef = useRef<BombEntity[]>([]);
  const barrelsRef = useRef<BarrelEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cameraShakeRef = useRef<{ value: number }>({ value: 0 });

  // Key Inputs
  const keysPressed = useRef<Set<string>>(new Set());
  const p1TouchInput = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    attack: false,
  });
  const p2TouchInput = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    attack: false,
  });

  // UI trigger to force re-render HUD health/score
  const [, setTick] = useState<number>(0);

  // Initialize Map Bombs
  const setupMapEntities = useCallback((map: GameMap) => {
    bombsRef.current = (map.initialBombs || []).map((b, idx) => ({
      id: idx + 1,
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
    }));
    projectilesRef.current = [];
    particlesRef.current = [];
  }, []);

  // Start a new Round
  const startNewRound = useCallback(
    (nextMap?: GameMap) => {
      const map = nextMap || getRandomMap();
      setCurrentMap(map);
      setupMapEntities(map);

      // Random Weapons for each round
      const [w1, w2] = getRoundWeapons();
      resetPlayerForRound(player1Ref.current, w1, map.spawns[0]);
      resetPlayerForRound(player2Ref.current, w2, map.spawns[1]);

      setRoundWinner(null);
      setCountdown(3);
      setPhase('countdown');
      setShowHpAndWeaponDetails(true);
      playCountdownBeep(false);

      // Hide HP and Weapon description after exactly 3.2 seconds
      setTimeout(() => {
        setShowHpAndWeaponDetails(false);
      }, 3200);

      // 3-2-1 Countdown Sequence
      let count = 3;
      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
          playCountdownBeep(false);
        } else if (count === 0) {
          setCountdown(0);
          playCountdownBeep(true);
        } else {
          clearInterval(timer);
          setPhase('fighting');
        }
      }, 700);
    },
    [setupMapEntities]
  );

  // Full Match Reset
  const startMatch = useCallback(
    (selectedMode: GameMode) => {
      setMode(selectedMode);
      setRoundNumber(1);
      player1Ref.current.score = 0;
      player1Ref.current.kills = 0;
      player1Ref.current.damageDealt = 0;
      player2Ref.current.score = 0;
      player2Ref.current.kills = 0;
      player2Ref.current.damageDealt = 0;
      setMatchWinner(null);

      // First map: Castle Bridge as in the reference screenshot!
      startNewRound(MAPS.castle_bridge);
    },
    [startNewRound]
  );

  // Handle Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Prevent scrolling on arrow keys and space
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)
      ) {
        e.preventDefault();
      }

      keysPressed.current.add(e.code);

      // Quick next round advance with space
      if (phase === 'round_won' && (e.code === 'Space' || e.code === 'Enter')) {
        startNewRound(getNextMap(currentMap.id));
      }

      // Pause toggle
      if (e.code === 'Escape') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, currentMap, startNewRound]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let hudUpdateCounter = 0;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.045, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!isPaused && (phase === 'fighting' || phase === 'countdown' || phase === 'round_won')) {
        const p1 = player1Ref.current;
        const p2 = player2Ref.current;
        const keys = keysPressed.current;

        // Player 1 Input (Custom key or F / Space)
        const p1Input: InputState = {
          left: keys.has('KeyA') || p1TouchInput.current.left,
          right: keys.has('KeyD') || p1TouchInput.current.right,
          up: keys.has('KeyW') || p1TouchInput.current.up,
          down: keys.has('KeyS') || p1TouchInput.current.down,
          attack:
            keys.has(p1AttackKey) ||
            keys.has('KeyF') ||
            keys.has('Space') ||
            p1TouchInput.current.attack,
        };

        // Player 2 Input (Custom key or Enter / L, or AI Bot)
        let p2Input: InputState;
        if (mode === 'ai') {
          p2Input = computeAIInput(
            p2,
            p1,
            currentMap,
            projectilesRef.current,
            aiDifficulty
          );
        } else {
          p2Input = {
            left: keys.has('ArrowLeft') || p2TouchInput.current.left,
            right: keys.has('ArrowRight') || p2TouchInput.current.right,
            up: keys.has('ArrowUp') || p2TouchInput.current.up,
            down: keys.has('ArrowDown') || p2TouchInput.current.down,
            attack:
              keys.has(p2AttackKey) ||
              keys.has('Enter') ||
              keys.has('KeyL') ||
              p2TouchInput.current.attack,
          };
        }

        if (phase === 'fighting') {
          // Physics updates with Zero-G mode support
          updatePlayer(
            p1,
            p1Input,
            currentMap,
            p2,
            projectilesRef.current,
            particlesRef.current,
            cameraShakeRef.current,
            dt,
            zeroGravityMode
          );

          updatePlayer(
            p2,
            p2Input,
            currentMap,
            p1,
            projectilesRef.current,
            particlesRef.current,
            cameraShakeRef.current,
            dt,
            zeroGravityMode
          );

          updateBombs(
            bombsRef.current,
            [p1, p2],
            currentMap,
            particlesRef.current,
            cameraShakeRef.current,
            dt
          );

          updateProjectiles(
            projectilesRef.current,
            [p1, p2],
            bombsRef.current,
            barrelsRef.current,
            currentMap,
            particlesRef.current,
            cameraShakeRef.current,
            dt
          );

          // Check for Round Winner
          if ((p1.isDead || p2.isDead) && !roundWinner) {
            let winner: Player;
            if (p1.isDead && p2.isDead) {
              // Tie: whoever died last wins, or P2
              winner = p1.deathTime > p2.deathTime ? p1 : p2;
            } else if (p1.isDead) {
              winner = p2;
            } else {
              winner = p1;
            }

            winner.score++;
            setRoundWinner(winner);
            setPhase('round_won');
            playRoundWin();

            // Check if Match Won
            if (winner.score >= MAX_ROUNDS_TO_WIN) {
              setTimeout(() => {
                setMatchWinner(winner);
                setPhase('match_won');
                playVictoryFanfare();
              }, 1200);
            } else {
              // Schedule next round automatically after 2.5s
              setTimeout(() => {
                setRoundNumber((r) => r + 1);
                startNewRound(getNextMap(currentMap.id));
              }, 2500);
            }
          }
        } else if (phase === 'round_won') {
          // Keep updating ragdoll & particles during round won slow motion
          if (p1.isDead) updatePlayer(p1, p1Input, currentMap, p2, [], particlesRef.current, cameraShakeRef.current, dt, zeroGravityMode);
          if (p2.isDead) updatePlayer(p2, p2Input, currentMap, p1, [], particlesRef.current, cameraShakeRef.current, dt, zeroGravityMode);
        }

        updateParticles(particlesRef.current, dt);
        cameraShakeRef.current.value *= 0.88;

        // Periodic state synchronization for HUD (every ~3 frames)
        hudUpdateCounter++;
        if (hudUpdateCounter % 3 === 0) {
          setTick((t) => t + 1);
        }
      }

      // Render to Canvas (Requirement 3: ALWAYS show health and HP above agents in combat!)
      if (ctx) {
        renderGame(
          ctx,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
          currentMap,
          [player1Ref.current, player2Ref.current],
          projectilesRef.current,
          bombsRef.current,
          particlesRef.current,
          cameraShakeRef.current.value,
          true
        );
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    phase,
    isPaused,
    mode,
    aiDifficulty,
    currentMap,
    roundWinner,
    showHpAndWeaponDetails,
    zeroGravityMode,
    p1AttackKey,
    p2AttackKey,
    startNewRound,
  ]);

  return (
    <div className="relative w-full h-screen bg-slate-950 flex items-center justify-center overflow-hidden font-sans select-none">
      {/* Aspect Ratio Canvas Container */}
      <div className="relative w-full max-w-[1200px] aspect-[5/3] max-h-screen flex items-center justify-center p-1 sm:p-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-800 bg-slate-900"
        />

        {/* In-game HUD */}
        {phase !== 'start_screen' && (
          <GameHUD
            player1={player1Ref.current}
            player2={player2Ref.current}
            currentMap={currentMap}
            roundNumber={roundNumber}
            maxRounds={MAX_ROUNDS_TO_WIN}
            mode={mode}
            showHpAndWeaponDetails={showHpAndWeaponDetails}
            zeroGravityMode={zeroGravityMode}
            onToggleZeroGravity={toggleZeroGravity}
            onOpenControls={() => setIsControlsOpen(true)}
            onTogglePause={() => setIsPaused((p) => !p)}
            onToggleMode={() =>
              setMode((m) => {
                const next = m === 'pvp' ? 'ai' : 'pvp';
                return next;
              })
            }
          />
        )}

        {/* Round Countdown and Winner Announcement */}
        <RoundOverlay
          phase={phase}
          countdown={countdown}
          winner={roundWinner}
          currentMap={currentMap}
          onNextRoundNow={() => {
            setRoundNumber((r) => r + 1);
            startNewRound(getNextMap(currentMap.id));
          }}
        />

        {/* Mobile touch controls for phones / tablets */}
        {phase === 'fighting' && (
          <MobileControls
            p1Input={p1TouchInput.current}
            p2Input={p2TouchInput.current}
            isAiMode={mode === 'ai'}
          />
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-2 uppercase">Пауза</h2>
              <p className="text-xs text-slate-400 mb-6">Игра временно приостановлена</p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Продолжить бой
                </button>
                <button
                  onClick={() => {
                    setIsPaused(false);
                    setIsControlsOpen(true);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition cursor-pointer"
                >
                  Управление и настройки
                </button>
                <button
                  onClick={() => {
                    setIsPaused(false);
                    startMatch(mode);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition cursor-pointer"
                >
                  Начать матч заново
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Match Champion Modal */}
        {phase === 'match_won' && matchWinner && (
          <MatchWinnerModal
            winner={matchWinner}
            player1={player1Ref.current}
            player2={player2Ref.current}
            onRematch={() => startMatch(mode)}
          />
        )}

        {/* Start Game Welcome Screen */}
        {phase === 'start_screen' && (
          <StartScreen
            onStartGame={(selectedMode) => startMatch(selectedMode)}
            onOpenControls={() => setIsControlsOpen(true)}
            zeroGravityMode={zeroGravityMode}
            onToggleZeroGravity={toggleZeroGravity}
            p1AttackKey={p1AttackKey}
            p2AttackKey={p2AttackKey}
          />
        )}

        {/* Controls and Settings Modal */}
        <ControlsGuideModal
          isOpen={isControlsOpen}
          onClose={() => setIsControlsOpen(false)}
          mode={mode}
          onSetMode={(m) => setMode(m)}
          difficulty={aiDifficulty}
          onSetDifficulty={(d) => setAiDifficulty(d)}
          p1AttackKey={p1AttackKey}
          onSetP1AttackKey={updateP1AttackKey}
          p2AttackKey={p2AttackKey}
          onSetP2AttackKey={updateP2AttackKey}
          zeroGravityMode={zeroGravityMode}
          onToggleZeroGravity={toggleZeroGravity}
        />
      </div>
    </div>
  );
}
