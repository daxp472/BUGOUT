import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GameState,
  RoomId,
  EndingId,
  InteractableObject,
  PlayerSettings
} from './types/game';
import {
  loadGameState,
  saveGameState,
  createInitialGameState,
  defaultSettings
} from './services/storageService';
import { audioEngine } from './services/audioEngine';
import { ROOMS_CONFIG, PUZZLES_DATA } from './data/roomsData';
import { EVIDENCE_ITEMS } from './data/evidenceData';

// HUD & Canvas
import { HUD } from './components/hud/HUD';
import { NotificationToast, ToastMessage } from './components/hud/NotificationToast';
import { AtmosphereCanvas } from './components/canvas/AtmosphereCanvas';

// Rooms
import { Room01Arrival } from './components/rooms/Room01Arrival';
import { Room02FrostLab } from './components/rooms/Room02FrostLab';
import { Room03ServerVault } from './components/rooms/Room03ServerVault';
import { Room04MirrorChamber } from './components/rooms/Room04MirrorChamber';
import { Room05LastProtocol } from './components/rooms/Room05LastProtocol';

// Overlays
import { InventoryModal } from './components/overlays/InventoryModal';
import { FacilityMapModal } from './components/overlays/FacilityMapModal';
import { HintTerminalModal } from './components/overlays/HintTerminalModal';
import { PauseModal } from './components/overlays/PauseModal';
import { SettingsModal } from './components/overlays/SettingsModal';

// Puzzles
import { KeypadPuzzle } from './components/puzzles/KeypadPuzzle';
import { PowerRoutingPuzzle } from './components/puzzles/PowerRoutingPuzzle';
import { CodeBugPuzzle } from './components/puzzles/CodeBugPuzzle';
import { FrostedSymbolsPuzzle } from './components/puzzles/FrostedSymbolsPuzzle';
import { CoolantValvePuzzle } from './components/puzzles/CoolantValvePuzzle';
import { CryoDebugPuzzle } from './components/puzzles/CryoDebugPuzzle';
import { ServerAnomalyPuzzle } from './components/puzzles/ServerAnomalyPuzzle';
import { ApiReconPuzzle } from './components/puzzles/ApiReconPuzzle';
import { JsonRepairPuzzle } from './components/puzzles/JsonRepairPuzzle';
import { MirrorDiscrepancyPuzzle } from './components/puzzles/MirrorDiscrepancyPuzzle';
import { MultiRoomSequencePuzzle } from './components/puzzles/MultiRoomSequencePuzzle';
import { LogicGatesPuzzle } from './components/puzzles/LogicGatesPuzzle';
import { GeneratorMatrixPuzzle } from './components/puzzles/GeneratorMatrixPuzzle';
import { MasterProtocolPuzzle } from './components/puzzles/MasterProtocolPuzzle';
import { FinalChoiceModal } from './components/puzzles/FinalChoiceModal';

// Cinematics & Menu
import { MainMenu } from './components/menu/MainMenu';
import { OpeningSequence } from './components/cinematics/OpeningSequence';
import { DoorTransition } from './components/cinematics/DoorTransition';
import { EndingCinematic } from './components/cinematics/EndingCinematic';
import './App.css';

export const App: React.FC = () => {
  // Saved game detection
  const savedState = useMemo(() => loadGameState(), []);
  const [gameState, setGameState] = useState<GameState>(savedState || createInitialGameState());
  const [hasSave, setHasSave] = useState<boolean>(!!savedState);

  // High level UI view state: 'menu' | 'opening' | 'playing' | 'door_transition' | 'ending'
  const [currentView, setCurrentView] = useState<'menu' | 'opening' | 'playing' | 'door_transition' | 'ending'>(
    'menu'
  );

  // Active overlay: null | 'inventory' | 'map' | 'hint' | 'pause' | 'settings' | 'puzzle'
  const [activeModal, setActiveModal] = useState<
    null | 'inventory' | 'map' | 'hint' | 'pause' | 'settings' | 'puzzle'
  >(null);

  // Active interactive puzzle
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);

  // Hovered interactable object for HUD prompt
  const [hoveredObject, setHoveredObject] = useState<InteractableObject | null>(null);

  // Door transition destinations
  const [transitionFrom, setTransitionFrom] = useState<RoomId>('room1_arrival');
  const [transitionTo, setTransitionTo] = useState<RoomId>('room2_frost');

  // Chosen Ending
  const [chosenEnding, setChosenEnding] = useState<EndingId>('purge');

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, description: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      description
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Current room configuration
  const currentRoomConfig = ROOMS_CONFIG[gameState.currentRoomId];
  const currentRoomProg = gameState.roomProgress[gameState.currentRoomId];

  // Active primary objective string
  const activeObjectiveText = useMemo(() => {
    const uncompleted = currentRoomConfig.objectives.find(
      (obj) => !currentRoomProg.objectives[obj.id]
    );
    return uncompleted ? uncompleted.text : 'ALL OBJECTIVES COMPLETE // EXIT UNLOCKED';
  }, [currentRoomConfig, currentRoomProg]);

  // Sync Audio Volumes on Mount
  useEffect(() => {
    audioEngine.setVolumes(
      gameState.settings.masterVolume,
      gameState.settings.sfxVolume,
      gameState.settings.musicVolume,
      gameState.settings.muted
    );
  }, [gameState.settings]);

  // Auto-save whenever gameState changes
  useEffect(() => {
    if (currentView === 'playing' || currentView === 'door_transition') {
      saveGameState(gameState);
      setHasSave(true);
    }
  }, [gameState, currentView]);

  // Mission Timer (Pauses during modals, pause menu, and outside playing view)
  useEffect(() => {
    if (currentView !== 'playing' || activeModal !== null) return;

    const timer = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          elapsedSeconds: prev.stats.elapsedSeconds + 1
        }
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentView, activeModal]);

  // Global Keyboard Shortcuts & ESC Priority Contract
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // ESC KEY PRIORITY CONTRACT:
      // 1. If puzzle or overlay open, close it.
      // 2. If playing and no overlay, open pause menu.
      // 3. If pause menu open, resume.
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeModal === 'puzzle') {
          setActiveModal(null);
          setActivePuzzleId(null);
        } else if (
          activeModal === 'inventory' ||
          activeModal === 'map' ||
          activeModal === 'hint' ||
          activeModal === 'settings'
        ) {
          setActiveModal(null);
        } else if (activeModal === 'pause') {
          setActiveModal(null);
        } else if (currentView === 'playing') {
          setActiveModal('pause');
        }
        return;
      }

      if (currentView !== 'playing') return;

      // TAB: Toggle Evidence Inventory
      if (e.key === 'Tab') {
        e.preventDefault();
        audioEngine.playClick();
        setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'));
        return;
      }

      // M: Toggle Facility Blueprint Map
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        audioEngine.playClick();
        setActiveModal((prev) => (prev === 'map' ? null : 'map'));
        return;
      }

      // H: Toggle Progressive WARDEN Hint
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        audioEngine.playClick();
        setActiveModal((prev) => (prev === 'hint' ? null : 'hint'));
        return;
      }

      // E or Enter: Interact with hovered object
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        if (hoveredObject && activeModal === null) {
          e.preventDefault();
          handleSelectObject(hoveredObject);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, activeModal, hoveredObject]);

  // Object Interaction Handler
  const handleSelectObject = (obj: InteractableObject) => {
    // Check prerequisites
    if (obj.requiresObjectiveId && !currentRoomProg.objectives[obj.requiresObjectiveId]) {
      audioEngine.playError();
      const reqObj = currentRoomConfig.objectives.find((o) => o.id === obj.requiresObjectiveId);
      addToast(
        'alert',
        'SYSTEM LOCKED',
        `Prerequisite required: "${reqObj ? reqObj.text : 'Complete prior objective'}"`
      );
      return;
    }

    if (obj.type === 'puzzle' && obj.puzzleId) {
      audioEngine.playClick();
      setActivePuzzleId(obj.puzzleId);
      setActiveModal('puzzle');
    } else if (obj.type === 'exit') {
      handleAttemptExit();
    }
  };

  // Exit Door Progression
  const handleAttemptExit = () => {
    const room = gameState.currentRoomId;

    if (room === 'room1_arrival') {
      if (!currentRoomProg.objectives['r1_auth_bug']) {
        audioEngine.playError();
        addToast('alert', 'DOOR SEALED', 'Authorization script must be patched first!');
        return;
      }
      // Unlock Room 02
      proceedToNextRoom('room1_arrival', 'room2_frost');
    } else if (room === 'room2_frost') {
      if (!currentRoomProg.objectives['r2_cooling_debug']) {
        audioEngine.playError();
        addToast('alert', 'PORT FROZEN', 'Chiller controller must be stabilized first!');
        return;
      }
      proceedToNextRoom('room2_frost', 'room3_server');
    } else if (room === 'room3_server') {
      if (!currentRoomProg.objectives['r3_json_recovery']) {
        audioEngine.playError();
        addToast('alert', 'VAULT LOCKED', 'Record 884-B JSON must be recovered first!');
        return;
      }
      proceedToNextRoom('room3_server', 'room4_mirror');
    } else if (room === 'room4_mirror') {
      if (!currentRoomProg.objectives['r4_logic_gate']) {
        audioEngine.playError();
        addToast('alert', 'REFLECTION LOCKED', 'Quantum logic parity must be satisfied!');
        return;
      }
      proceedToNextRoom('room4_mirror', 'room5_protocol');
    }
  };

  const proceedToNextRoom = (from: RoomId, to: RoomId) => {
    setTransitionFrom(from);
    setTransitionTo(to);
    setCurrentView('door_transition');

    // Update state: complete current room, unlock next room
    setGameState((prev) => {
      const nextCompleted = prev.completedRooms.includes(from)
        ? prev.completedRooms
        : [...prev.completedRooms, from];
      const nextUnlocked = prev.unlockedRooms.includes(to)
        ? prev.unlockedRooms
        : [...prev.unlockedRooms, to];

      return {
        ...prev,
        completedRooms: nextCompleted,
        unlockedRooms: nextUnlocked,
        stats: {
          ...prev.stats,
          roomsCompleted: nextCompleted.length
        }
      };
    });
  };

  // Called when DoorTransition animation finishes
  const handleTransitionEnd = () => {
    setGameState((prev) => ({
      ...prev,
      currentRoomId: transitionTo,
      roomProgress: {
        ...prev.roomProgress,
        [transitionTo]: {
          ...prev.roomProgress[transitionTo],
          visited: true
        }
      }
    }));
    setCurrentView('playing');
    setActiveModal(null);
    audioEngine.playAmbient(ROOMS_CONFIG[transitionTo].ambientType);
    addToast('unlock', `ENTERED ${ROOMS_CONFIG[transitionTo].name}`, ROOMS_CONFIG[transitionTo].subtitle);
  };

  // Puzzle Solved Handler
  const handlePuzzleSuccess = (puzzleId: string) => {
    setActiveModal(null);
    setActivePuzzleId(null);

    setGameState((prev) => {
      const roomProg = { ...prev.roomProgress[prev.currentRoomId] };
      const solvedPuzzles = { ...roomProg.solvedPuzzles, [puzzleId]: true };
      const objectives = { ...roomProg.objectives };
      const nextInventory = [...prev.inventory];
      const stats = { ...prev.stats, puzzlesSolved: prev.stats.puzzlesSolved + 1 };

      // Room 01 Objectives & Evidence Mapping
      if (puzzleId === 'puzzle_r1_power') {
        objectives['r1_power'] = true;
        if (!nextInventory.includes('ev_access_schematic')) {
          nextInventory.push('ev_access_schematic');
          addToast('evidence', 'EVIDENCE LOGGED', 'Terminal Diagnostic Schematic added to Dossier');
        }
      } else if (puzzleId === 'puzzle_r1_keypad') {
        objectives['r1_keypad'] = true;
        if (!nextInventory.includes('ev_subject07_file')) {
          nextInventory.push('ev_subject07_file');
          addToast('evidence', 'SUBJECT 07 PROFILE', 'Biometric stasis file added to Dossier');
        }
      } else if (puzzleId === 'puzzle_r1_auth_bug') {
        objectives['r1_auth_bug'] = true;
        objectives['r1_door'] = true;
        addToast('objective', 'AUTHORIZATION RESTORED', 'Pneumatic door locks disengaged');
      }

      // Room 02 Objectives & Evidence Mapping
      else if (puzzleId === 'puzzle_r2_symbols') {
        objectives['r2_symbols'] = true;
        if (!nextInventory.includes('ev_frost_rune_table')) {
          nextInventory.push('ev_frost_rune_table');
          addToast('evidence', 'FROST SYMBOL INDEX', 'Cryogenic glyph sequence logged');
        }
      } else if (puzzleId === 'puzzle_r2_valves') {
        objectives['r2_valves'] = true;
        if (!nextInventory.includes('ev_cryo_maint_log')) {
          nextInventory.push('ev_cryo_maint_log');
          addToast('evidence', 'CRYO MAINTENANCE LOG 409', 'Chamber reset report recovered');
        }
      } else if (puzzleId === 'puzzle_r2_cooling_debug') {
        objectives['r2_cooling_debug'] = true;
        objectives['r2_door'] = true;
        addToast('objective', 'CHILLER STABILIZED', 'Cryo-port locks ready to cycle');
      }

      // Room 03 Objectives & Evidence Mapping
      else if (puzzleId === 'puzzle_r3_anomaly') {
        objectives['r3_anomaly'] = true;
        if (!nextInventory.includes('ev_api_schema')) {
          nextInventory.push('ev_api_schema');
          addToast('evidence', 'WARDEN REST API BLUEPRINT', 'Auth gateway specifications acquired');
        }
      } else if (puzzleId === 'puzzle_r3_api_recon') {
        objectives['r3_api_recon'] = true;
        addToast('objective', 'API AUTHORIZATION 200 OK', 'Vault security payload unlocked');
      } else if (puzzleId === 'puzzle_r3_json_recovery') {
        objectives['r3_json_recovery'] = true;
        objectives['r3_door'] = true;
        if (!nextInventory.includes('ev_classified_884b')) {
          nextInventory.push('ev_classified_884b');
          addToast('evidence', 'RESTRICTED RECORD 884-B', '72 prior iterations documented');
        }
      }

      // Room 04 Objectives & Evidence Mapping
      else if (puzzleId === 'puzzle_r4_discrepancies') {
        objectives['r4_discrepancies'] = true;
        if (!nextInventory.includes('ev_room1_reference_photo')) {
          nextInventory.push('ev_room1_reference_photo');
        }
        if (!nextInventory.includes('ev_warden_predictive_log')) {
          nextInventory.push('ev_warden_predictive_log');
          addToast('evidence', 'PREDICTIVE TIMELINE ANOMALY', 'WARDEN precognition trace revealed');
        }
      } else if (puzzleId === 'puzzle_r4_sequence') {
        objectives['r4_sequence'] = true;
        addToast('objective', 'CHAMBER HARMONY ACHIEVED', 'Altar synthesis tokens accepted');
      } else if (puzzleId === 'puzzle_r4_logic_gate') {
        objectives['r4_logic_gate'] = true;
        objectives['r4_door'] = true;
        addToast('objective', 'QUANTUM PARITY SOLVED', 'Obsidian mirror bulkhead shifting');
      }

      // Room 05 Objectives & Evidence Mapping
      else if (puzzleId === 'puzzle_r5_power_matrix') {
        objectives['r5_power_matrix'] = true;
        if (!nextInventory.includes('ev_master_protocol_manual')) {
          nextInventory.push('ev_master_protocol_manual');
          addToast('evidence', 'THE LAST PROTOCOL BRIEFING', 'Directive directives acquired');
        }
      } else if (puzzleId === 'puzzle_r5_master_code') {
        objectives['r5_master_code'] = true;
        addToast('objective', 'MASTER PROTOCOL AUTHENTICATED', 'WARDEN directive core unlocked');
      }

      stats.evidenceCollected = nextInventory;

      return {
        ...prev,
        inventory: nextInventory,
        roomProgress: {
          ...prev.roomProgress,
          [prev.currentRoomId]: {
            ...roomProg,
            solvedPuzzles,
            objectives
          }
        },
        stats
      };
    });
  };

  const handlePuzzleFail = () => {
    setGameState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        incorrectAttempts: prev.stats.incorrectAttempts + 1
      }
    }));
  };

  const handleUseHint = () => {
    setGameState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        hintsUsed: prev.stats.hintsUsed + 1
      }
    }));
  };

  // Execute Ending
  const handleExecuteEnding = (endingId: EndingId) => {
    setActiveModal(null);
    setChosenEnding(endingId);
    setGameState((prev) => ({
      ...prev,
      activeEnding: endingId,
      isCompleted: true,
      stats: {
        ...prev.stats,
        roomsCompleted: 5
      }
    }));
    setCurrentView('ending');
  };

  // Main Menu Actions
  const handleStartNewGame = () => {
    const fresh = createInitialGameState();
    setGameState(fresh);
    saveGameState(fresh);
    setCurrentView('opening');
  };

  const handleContinueGame = () => {
    if (savedState) {
      setGameState(savedState);
      setCurrentView('playing');
      audioEngine.playAmbient(ROOMS_CONFIG[savedState.currentRoomId].ambientType);
    }
  };

  const handleRestartRoom = () => {
    setGameState((prev) => {
      const room = prev.currentRoomId;
      return {
        ...prev,
        roomProgress: {
          ...prev.roomProgress,
          [room]: {
            objectives: {},
            solvedPuzzles: {},
            collectedEvidence: [],
            visited: true
          }
        }
      };
    });
    setActiveModal(null);
    audioEngine.playAmbient(currentRoomConfig.ambientType);
    addToast('alert', 'ROOM RESTARTED', 'Chamber objectives and systems reset');
  };

  const handleUpdateSettings = (newSettings: PlayerSettings) => {
    setGameState((prev) => ({ ...prev, settings: newSettings }));
  };

  const handleFastTransit = (targetRoomId: RoomId) => {
    setGameState((prev) => ({
      ...prev,
      currentRoomId: targetRoomId
    }));
    audioEngine.playAmbient(ROOMS_CONFIG[targetRoomId].ambientType);
    addToast('unlock', `TRANSITED TO ${ROOMS_CONFIG[targetRoomId].name}`, ROOMS_CONFIG[targetRoomId].subtitle);
  };

  // Render Room Scene
  const renderRoomScene = () => {
    const props = {
      config: currentRoomConfig,
      solvedPuzzles: currentRoomProg.solvedPuzzles,
      objectives: currentRoomProg.objectives,
      activeInteractableId: hoveredObject ? hoveredObject.id : null,
      onHoverObject: setHoveredObject,
      onSelectObject: handleSelectObject
    };

    switch (gameState.currentRoomId) {
      case 'room1_arrival':
        return <Room01Arrival {...props} />;
      case 'room2_frost':
        return <Room02FrostLab {...props} />;
      case 'room3_server':
        return <Room03ServerVault {...props} />;
      case 'room4_mirror':
        return <Room04MirrorChamber {...props} />;
      case 'room5_protocol':
        return <Room05LastProtocol {...props} />;
      default:
        return <Room01Arrival {...props} />;
    }
  };

  return (
    <div
      className={`bugout-app-root ${gameState.settings.reducedMotion ? 'reduced-motion' : ''} ${
        gameState.settings.highContrast ? 'high-contrast' : ''
      }`}
    >
      {/* 1. Main Menu View */}
      {currentView === 'menu' && (
        <MainMenu
          hasSave={hasSave}
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          onOpenSettings={() => setActiveModal('settings')}
        />
      )}

      {/* 2. Opening Cinematic Sequence */}
      {currentView === 'opening' && (
        <OpeningSequence
          onComplete={() => {
            setCurrentView('playing');
            audioEngine.playAmbient('lab');
            addToast('unlock', 'CHAMBER 01 ACTIVATED', 'Primary Objective: Restore Access Authorization');
          }}
        />
      )}

      {/* 3. Door Transition Cinematic */}
      {currentView === 'door_transition' && (
        <DoorTransition
          fromRoomId={transitionFrom}
          toRoomId={transitionTo}
          onTransitionEnd={handleTransitionEnd}
        />
      )}

      {/* 4. Final Campaign Ending View */}
      {currentView === 'ending' && (
        <EndingCinematic
          ending={chosenEnding}
          stats={gameState.stats}
          onRestartCampaign={handleStartNewGame}
        />
      )}

      {/* 5. Main Interactive Gameplay View */}
      {currentView === 'playing' && (
        <div className="gameplay-viewport">
          {/* Ambient Canvas Particles */}
          <AtmosphereCanvas
            roomId={gameState.currentRoomId}
            reducedMotion={gameState.settings.reducedMotion}
          />

          {/* Interactive 2.5D Room Scene */}
          {renderRoomScene()}

          {/* Cinematic Game HUD */}
          <HUD
            roomConfig={currentRoomConfig}
            elapsedSeconds={gameState.stats.elapsedSeconds}
            evidenceCount={gameState.inventory.length}
            hoveredObject={hoveredObject}
            settings={gameState.settings}
            activeObjectiveText={activeObjectiveText}
            onToggleInventory={() => setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'))}
            onToggleMap={() => setActiveModal((prev) => (prev === 'map' ? null : 'map'))}
            onToggleHint={() => setActiveModal((prev) => (prev === 'hint' ? null : 'hint'))}
            onTogglePause={() => setActiveModal('pause')}
            onToggleMute={() => {
              const nextMuted = !gameState.settings.muted;
              handleUpdateSettings({ ...gameState.settings, muted: nextMuted });
              audioEngine.setVolumes(
                gameState.settings.masterVolume,
                gameState.settings.sfxVolume,
                gameState.settings.musicVolume,
                nextMuted
              );
            }}
          />

          {/* Notification Toasts */}
          <NotificationToast toasts={toasts} onDismiss={removeToast} />

          {/* --- ACTIVE MODALS & OVERLAYS --- */}

          {/* Evidence Inventory Modal [TAB] */}
          {activeModal === 'inventory' && (
            <InventoryModal
              collectedIds={gameState.inventory}
              onClose={() => setActiveModal(null)}
            />
          )}

          {/* Facility Map Modal [M] */}
          {activeModal === 'map' && (
            <FacilityMapModal
              currentRoomId={gameState.currentRoomId}
              completedRooms={gameState.completedRooms}
              unlockedRooms={gameState.unlockedRooms}
              onSelectRoom={handleFastTransit}
              onClose={() => setActiveModal(null)}
            />
          )}

          {/* WARDEN Progressive Hint Modal [H] */}
          {activeModal === 'hint' && (
            <HintTerminalModal
              currentRoomId={gameState.currentRoomId}
              activePuzzleId={activePuzzleId}
              onUseHint={handleUseHint}
              onClose={() => setActiveModal(null)}
            />
          )}

          {/* Pause Menu Modal [ESC] */}
          {activeModal === 'pause' && (
            <PauseModal
              onResume={() => setActiveModal(null)}
              onRestartRoom={handleRestartRoom}
              onOpenSettings={() => setActiveModal('settings')}
              onQuitToMenu={() => {
                setActiveModal(null);
                setCurrentView('menu');
                audioEngine.stopAmbient();
              }}
            />
          )}

          {/* Settings Modal */}
          {activeModal === 'settings' && (
            <SettingsModal
              settings={gameState.settings}
              onUpdateSettings={handleUpdateSettings}
              onClose={() => setActiveModal(null)}
            />
          )}

          {/* --- ACTIVE PUZZLE PANELS --- */}
          {activeModal === 'puzzle' && activePuzzleId && (
            <>
              {/* Room 01 Puzzles */}
              {activePuzzleId === 'puzzle_r1_power' && (
                <PowerRoutingPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r1_power')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r1_keypad' && (
                <KeypadPuzzle
                  correctCode="7914"
                  title="EXAMINATION DESK OVERRIDE"
                  subtitle="ENTER 4-DIGIT PIN FROM ROOM CLUES (CLOCK 09:40 + SUB 07 + DAY 14)"
                  onSuccess={() => handlePuzzleSuccess('puzzle_r1_keypad')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r1_auth_bug' && (
                <CodeBugPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r1_auth_bug')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}

              {/* Room 02 Puzzles */}
              {activePuzzleId === 'puzzle_r2_symbols' && (
                <FrostedSymbolsPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r2_symbols')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r2_valves' && (
                <CoolantValvePuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r2_valves')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r2_cooling_debug' && (
                <CryoDebugPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r2_cooling_debug')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}

              {/* Room 03 Puzzles */}
              {activePuzzleId === 'puzzle_r3_anomaly' && (
                <ServerAnomalyPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r3_anomaly')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r3_api_recon' && (
                <ApiReconPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r3_api_recon')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r3_json_recovery' && (
                <JsonRepairPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r3_json_recovery')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}

              {/* Room 04 Puzzles */}
              {activePuzzleId === 'puzzle_r4_discrepancies' && (
                <MirrorDiscrepancyPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r4_discrepancies')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r4_sequence' && (
                <MultiRoomSequencePuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r4_sequence')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r4_logic_gate' && (
                <LogicGatesPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r4_logic_gate')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}

              {/* Room 05 Puzzles */}
              {activePuzzleId === 'puzzle_r5_power_matrix' && (
                <GeneratorMatrixPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r5_power_matrix')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r5_master_code' && (
                <MasterProtocolPuzzle
                  onSuccess={() => handlePuzzleSuccess('puzzle_r5_master_code')}
                  onClose={() => setActiveModal(null)}
                  onFail={handlePuzzleFail}
                />
              )}
              {activePuzzleId === 'puzzle_r5_final_choice' && (
                <FinalChoiceModal
                  onExecuteEnding={handleExecuteEnding}
                  onClose={() => setActiveModal(null)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
