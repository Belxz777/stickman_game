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
  MeteoriteEntity,
  GameSettings,
  DEFAULT_GAME_SETTINGS,
} from './types/game';
import { MAPS, getRandomMap, getNextMap, saveCustomMap, getAllMaps } from './game/maps';
import { getRoundWeapons } from './game/weapons';
import {
  createDefaultPlayer,
  resetPlayerForRound,
  updatePlayer,
  updateProjectiles,
  updateBombs,
  updateParticles,
  updateMeteorites,
  setGravity,
  InputState,
} from './game/physics';
import { computeAIInput } from './game/ai';
import { renderGame } from './game/renderer';
import { GameHUD } from './components/GameHUD';
import { RoundOverlay } from './components/RoundOverlay';
import { MatchWinnerModal } from './components/MatchWinnerModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { StartScreen } from './components/StartScreen';
import { MobileControls } from './components/MobileControls';
import { MapEditor } from './components/MapEditor';
import { playCountdownBeep, playRoundWin, playVictoryFanfare } from './audio/soundEngine';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

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
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [showHpAndWeaponDetails, setShowHpAndWeaponDetails] = useState<boolean>(true);

  // Comprehensive Game Settings (Requirement 1: full configuration in separate menu)
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('agent_battle_custom_settings');
      if (saved) return { ...DEFAULT_GAME_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_GAME_SETTINGS;
  });

  const updateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('agent_battle_custom_settings', JSON.stringify(newSettings));
    } catch {}
  }, []);

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
  const [currentMap, setCurrentMap] = useState<GameMap>(() => {
    const all = getAllMaps();
    const locked = all.find((m) => m.id === settings.lockedMapId);
    return locked || MAPS.castle_bridge;
  });

  // Game Engine Entities (Stored in refs for 60fps high performance loop)
  const initialWeapons = useRef(getRoundWeapons());
  const player1Ref = useRef<Player>(
    createDefaultPlayer('p1', initialWeapons.current[0], MAPS.castle_bridge.spawns[0], settings.playerMaxHp)
  );
  const player2Ref = useRef<Player>(
    createDefaultPlayer('p2', initialWeapons.current[1], MAPS.castle_bridge.spawns[1], settings.playerMaxHp)
  );

  const projectilesRef = useRef<Projectile[]>([]);
  const bombsRef = useRef<BombEntity[]>([]);
  const barrelsRef = useRef<BarrelEntity[]>([]);
  const meteoritesRef = useRef<MeteoriteEntity[]>([]);
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

  // Initialize Map Bombs & Meteorites with custom settings
  const setupMapEntities = useCallback((map: GameMap) => {
    bombsRef.current = (map.initialBombs || []).map((b, idx) => ({
      id: idx + 1,
      x: b.x,
      y: b.y,
      vx: 0,
      vy: 0,
      radius: 20,
      timer: settings.bombTimer,
      maxTimer: settings.bombTimer,
      exploded: false,
      damage: settings.bombDamage,
      blastRadius: settings.bombBlastRadius,
    }));
    projectilesRef.current = [];
    particlesRef.current = [];
    meteoritesRef.current = [];
  }, [settings.bombTimer, settings.bombDamage, settings.bombBlastRadius]);

  // Start a new Round (Requirement: Play only on selected map if locked)
  const startNewRound = useCallback(
    (forcedMap?: GameMap) => {
      let map = forcedMap;
      if (!map) {
        if (settings.mapSelectionMode === 'locked') {
          const found = getAllMaps().find((m) => m.id === settings.lockedMapId);
          map = found || currentMap;
        } else if (settings.mapSelectionMode === 'sequential') {
          map = getNextMap(currentMap.id);
        } else {
          map = getRandomMap();
        }
      }

      setCurrentMap(map);
      setupMapEntities(map);

      // Random Weapons for each round
      const [w1, w2] = getRoundWeapons();
      resetPlayerForRound(player1Ref.current, w1, map.spawns[0], settings.playerMaxHp);
      resetPlayerForRound(player2Ref.current, w2, map.spawns[1], settings.playerMaxHp);

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
    [currentMap, setupMapEntities, settings.mapSelectionMode, settings.lockedMapId, settings.playerMaxHp]
  );

  // Start a full Match
  const startMatch = (chosenMode: GameMode) => {
    setMode(chosenMode);
    setRoundNumber(1);
    player1Ref.current.score = 0;
    player2Ref.current.score = 0;
    player1Ref.current.kills = 0;
    player2Ref.current.kills = 0;
    player1Ref.current.damageDealt = 0;
    player2Ref.current.damageDealt = 0;
    setMatchWinner(null);

    let initialMap = currentMap;
    if (settings.mapSelectionMode === 'locked') {
      const found = getAllMaps().find((m) => m.id === settings.lockedMapId);
      if (found) initialMap = found;
    }
    startNewRound(initialMap);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pause
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (phase === 'fighting') {
          setIsPaused((prev) => !prev);
          return;
        }
      }

      keysPressed.current.add(e.code);
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
  }, [phase]);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let hudUpdateCounter = 0;

    const gameLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // cap delta at 50ms
      lastTime = time;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!isPaused && (phase === 'fighting' || phase === 'countdown' || phase === 'round_won')) {
        const keys = keysPressed.current;
        const p1 = player1Ref.current;
        const p2 = player2Ref.current;

        // Player 1 Input
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

        // Player 2 Input (Human or AI)
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
          // Set customizable gravity (Requirement 1)
          setGravity(settings.gravity);

          // Physics updates with custom multipliers
          updatePlayer(
            p1,
            p1Input,
            currentMap,
            p2,
            projectilesRef.current,
            particlesRef.current,
            cameraShakeRef.current,
            dt,
            settings.moveSpeedMultiplier,
            settings.jumpForceMultiplier,
            settings.damageMultiplier,
            settings.cooldownMultiplier
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
            settings.moveSpeedMultiplier,
            settings.jumpForceMultiplier,
            settings.damageMultiplier,
            settings.cooldownMultiplier
          );

          updateMeteorites(
            meteoritesRef.current,
            [p1, p2],
            currentMap,
            particlesRef.current,
            cameraShakeRef.current,
            dt,
            settings.meteoritesFrequency
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

            // Check if Match Won (Configurable rounds to win)
            if (winner.score >= settings.roundsToWin) {
              setTimeout(() => {
                setMatchWinner(winner);
                setPhase('match_won');
                playVictoryFanfare();
              }, 1200);
            } else {
              // Schedule next round automatically after 2.5s
              setTimeout(() => {
                setRoundNumber((r) => r + 1);
                startNewRound();
              }, 2500);
            }
          }
        } else if (phase === 'round_won') {
          // Keep updating ragdoll & particles during round won slow motion
          if (p1.isDead) updatePlayer(p1, p1Input, currentMap, p2, [], particlesRef.current, cameraShakeRef.current, dt);
          if (p2.isDead) updatePlayer(p2, p2Input, currentMap, p1, [], particlesRef.current, cameraShakeRef.current, dt);
        }

        updateParticles(particlesRef.current, dt);
        cameraShakeRef.current.value *= 0.88;

        // Periodic state synchronization for HUD (every ~3 frames)
        hudUpdateCounter++;
        if (hudUpdateCounter % 3 === 0) {
          setTick((t) => t + 1);
        }
      }

      // Render to Canvas (ALWAYS show health and HP above agents in combat!)
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
          cameraShakeRef.current.value * settings.cameraShakeIntensity,
          true,
          meteoritesRef.current
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
    settings,
    p1AttackKey,
    p2AttackKey,
    startNewRound,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 select-none font-sans overflow-hidden">
      {/* Game Canvas Container */}
      <div className="relative w-full max-w-[1000px] aspect-[5/3] bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-800">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain"
        />

        {/* In-game HUD */}
        {phase !== 'start_screen' && (
          <GameHUD
            player1={player1Ref.current}
            player2={player2Ref.current}
            currentMap={currentMap}
            roundNumber={roundNumber}
            maxRounds={settings.roundsToWin}
            mode={mode}
            settings={settings}
            showHpAndWeaponDetails={showHpAndWeaponDetails}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenControls={() => setIsControlsOpen(true)}
            onTogglePause={() => setIsPaused((p) => !p)}
            onToggleMode={() =>
              setMode((m) => (m === 'pvp' ? 'ai' : 'pvp'))
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
            startNewRound();
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
                    setIsSettingsOpen(true);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  ⚙️ Настройки и Физика
                </button>
                <button
                  onClick={() => {
                    setIsPaused(false);
                    setIsControlsOpen(true);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition cursor-pointer"
                >
                  Клавиши управления
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
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenEditor={() => setIsEditorOpen(true)}
            settings={settings}
            currentMap={currentMap}
            p1AttackKey={p1AttackKey}
            p2AttackKey={p2AttackKey}
          />
        )}

        {/* Dedicated Game Settings Modal */}
        <GameSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={updateSettings}
          currentMap={currentMap}
          onSelectMap={(map) => {
            setCurrentMap(map);
            updateSettings({ ...settings, lockedMapId: map.id });
          }}
        />

        {/* Map Editor Modal */}
        {isEditorOpen && (
          <MapEditor
            onClose={() => setIsEditorOpen(false)}
            onSaveMap={(map) => {
              saveCustomMap(map);
              setCurrentMap(map);
              updateSettings({ ...settings, lockedMapId: map.id });
              setIsEditorOpen(false);
            }}
          />
        )}

        {/* Controls Modal */}
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
        />
      </div>
    </div>
  );
}
