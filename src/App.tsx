import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  CampaignId,
  CampaignProgress,
  EndingId,
  InteractableObject,
  PlayerProfile,
  PlayerRecords,
  PlayerSettings,
  RoomId,
  RoomProgress,
  SaveSlot,
} from './types/game';
import {
  loadProfile,
  saveProfile,
  createOnboardedProfile,
  loadRecords,
  saveRecords,
  loadSettings,
  saveSettings,
  loadSlot,
  saveSlot,
  clearSlot,
  findMostRecentSlot,
  createNewSlot,
  createInitialCampaignProgress,
  attemptLegacyMigration,
  updateCampaignBest,
  calculateScoreAndRank,
} from './services/storageService';
import { audioEngine } from './services/audioEngine';
import { getCampaign, CAMPAIGNS } from './data/campaignsData';
import { ALL_ROOMS, ALL_EVIDENCE, getPuzzle, countCampaignPuzzles, countCampaignEvidence } from './data/gameData';
import { PUZZLE_EFFECTS } from './data/puzzleEffects';
import {
  evaluateArchivist,
  evaluateAchievements,
  evaluateCompletionAchievements,
  evaluateEndingAchievements,
  applyAchievementUnlocks,
  ACHIEVEMENTS,
} from './services/achievements';

// HUD & Canvas
import { HUD } from './components/hud/HUD';
import { NotificationToast, ToastMessage } from './components/hud/NotificationToast';
import { AtmosphereCanvas } from './components/canvas/AtmosphereCanvas';

// Rooms (Campaign 01)
import { Room01Arrival } from './components/rooms/Room01Arrival';
import { Room02FrostLab } from './components/rooms/Room02FrostLab';
import { Room03ServerVault } from './components/rooms/Room03ServerVault';
import { Room04MirrorChamber } from './components/rooms/Room04MirrorChamber';
import { Room05LastProtocol } from './components/rooms/Room05LastProtocol';
// Rooms (Campaign 02 — Ghost Signal)
import { Room06DarkRelay } from './components/rooms/c2/Room06DarkRelay';
import { Room07ListeningPost } from './components/rooms/c2/Room07ListeningPost';
import { Room08AntennaArray } from './components/rooms/c2/Room08AntennaArray';
// Rooms (Campaign 03 — Echoes)
import { Room09RecallVault } from './components/rooms/c3/Room09RecallVault';
import { Room10ParadoxGallery } from './components/rooms/c3/Room10ParadoxGallery';
import { Room11LoopTerminus } from './components/rooms/c3/Room11LoopTerminus';

// Overlays
import { InventoryModal } from './components/overlays/InventoryModal';
import { FacilityMapModal } from './components/overlays/FacilityMapModal';
import { HintTerminalModal } from './components/overlays/HintTerminalModal';
import { PauseModal } from './components/overlays/PauseModal';
import { SettingsModal } from './components/overlays/SettingsModal';

// Puzzles — Campaign 01
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
import { FinalDecisionModal } from './components/puzzles/FinalDecisionModal';
// Puzzles — Campaign 02 (Ghost Signal)
import { PatchPanelPuzzle } from './components/puzzles/c2/PatchPanelPuzzle';
import { FrequencyTuningPuzzle } from './components/puzzles/c2/FrequencyTuningPuzzle';
import { MorseDecodePuzzle } from './components/puzzles/c2/MorseDecodePuzzle';
import { WaveformMatchPuzzle } from './components/puzzles/c2/WaveformMatchPuzzle';
import { CipherWheelPuzzle } from './components/puzzles/c2/CipherWheelPuzzle';
import { SignalDebugPuzzle } from './components/puzzles/c2/SignalDebugPuzzle';
import { TriangulationPuzzle } from './components/puzzles/c2/TriangulationPuzzle';
import { UplinkSequencePuzzle } from './components/puzzles/c2/UplinkSequencePuzzle';
// Puzzles — Campaign 03 (Echoes)
import { AudioRecallPuzzle } from './components/puzzles/c3/AudioRecallPuzzle';
import { TimelineOrderPuzzle } from './components/puzzles/c3/TimelineOrderPuzzle';
import { ShadowMatchPuzzle } from './components/puzzles/c3/ShadowMatchPuzzle';
import { ParadoxAuditPuzzle } from './components/puzzles/c3/ParadoxAuditPuzzle';
import { EchoSequencePuzzle } from './components/puzzles/c3/EchoSequencePuzzle';
import { MemoryPairsPuzzle } from './components/puzzles/c3/MemoryPairsPuzzle';
import { ConvergencePuzzle } from './components/puzzles/c3/ConvergencePuzzle';
import { LoopDebugPuzzle } from './components/puzzles/c3/LoopDebugPuzzle';

// Cinematics & Menu
import { MainMenu } from './components/menu/MainMenu';
import { BootSequence } from './components/menu/BootSequence';
import { OnboardingScreen } from './components/menu/OnboardingScreen';
import { OpeningSequence } from './components/cinematics/OpeningSequence';
import { DoorTransition } from './components/cinematics/DoorTransition';
import { EndingCinematic } from './components/cinematics/EndingCinematic';
import './App.css';
import './styles/menu.css';
import './styles/constructed-rooms.css';
import './styles/puzzles2.css';

type AppView = 'boot' | 'onboard' | 'menu' | 'opening' | 'playing' | 'door_transition' | 'ending';

type ActiveModal = null | 'inventory' | 'map' | 'hint' | 'pause' | 'settings' | 'puzzle';

const EMPTY_ROOM_PROGRESS: RoomProgress = {
  objectives: {},
  solvedPuzzles: {},
  collectedEvidence: [],
  visited: false,
};

export const App: React.FC = () => {
  /* ---------- Boot: restore global state + legacy migration ---------- */
  const initial = useMemo(() => {
    const migrated = attemptLegacyMigration();
    return {
      profile: loadProfile(),
      records: loadRecords(),
      settings: loadSettings(),
      continueSlot: migrated ? { index: 0, slot: migrated } : findMostRecentSlot(),
    };
  }, []);

  const [view, setView] = useState<AppView>('boot');
  const [profile, setProfile] = useState<PlayerProfile | null>(initial.profile);
  const [records, setRecords] = useState<PlayerRecords>(initial.records);
  const [settings, setSettings] = useState<PlayerSettings>(initial.settings);

  /* ---------- Save slot (active campaign container) ---------- */
  const [slotIndex, setSlotIndex] = useState<number | null>(null);
  const [slot, setSlot] = useState<SaveSlot | null>(null);
  const [activeCampaignId, setActiveCampaignId] = useState<CampaignId | null>(null);

  /* ---------- Runtime UI state ---------- */
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);
  const [hoveredObject, setHoveredObject] = useState<InteractableObject | null>(null);
  const [transitionFrom, setTransitionFrom] = useState<RoomId>('room1_arrival');
  const [transitionTo, setTransitionTo] = useState<RoomId>('room2_frost');
  const [chosenEnding, setChosenEnding] = useState<EndingId>('purge');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const puzzleFailCounts = useRef<Record<string, number>>({});

  const addToast = useCallback((type: ToastMessage['type'], title: string, description: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  /* ---------- Derived campaign state ---------- */
  const campaignDef = activeCampaignId ? getCampaign(activeCampaignId) : null;
  const campaignProg: CampaignProgress | null =
    slot && activeCampaignId ? slot.campaigns[activeCampaignId] ?? null : null;
  const currentRoomId: RoomId | null = campaignProg?.currentRoomId ?? null;
  const currentRoomConfig = currentRoomId ? ALL_ROOMS[currentRoomId] : null;
  const currentRoomProg: RoomProgress =
    (currentRoomId && campaignProg?.roomProgress[currentRoomId]) || EMPTY_ROOM_PROGRESS;

  const activeObjectiveText = useMemo(() => {
    if (!currentRoomConfig) return '';
    const uncompleted = currentRoomConfig.objectives.find((obj) => !currentRoomProg.objectives[obj.id]);
    return uncompleted ? uncompleted.text : 'ALL OBJECTIVES COMPLETE // EXIT UNLOCKED';
  }, [currentRoomConfig, currentRoomProg]);

  /* ---------- Persistence helpers ---------- */
  const persistSlot = useCallback(
    (nextSlot: SaveSlot, index: number) => {
      saveSlot(index, nextSlot);
    },
    []
  );

  const persistRecords = useCallback((next: PlayerRecords) => {
    setRecords(next);
    saveRecords(next);
  }, []);

  /* ---------- Settings sync ---------- */
  useEffect(() => {
    audioEngine.setVolumes(settings.masterVolume, settings.sfxVolume, settings.musicVolume, settings.muted);
    saveSettings(settings);
  }, [settings]);

  /* ---------- Auto-save (throttled to slot on meaningful changes) ---------- */
  useEffect(() => {
    if (slot && slotIndex !== null && (view === 'playing' || view === 'door_transition')) {
      persistSlot(slot, slotIndex);
    }
  }, [slot, slotIndex, view, persistSlot]);

  /* ---------- Mission Timer — timestamp-based (fix: no interval drift) ---------- */
  const lastTickRef = useRef<number>(Date.now());
  useEffect(() => {
    if (view !== 'playing' || activeModal !== null || !campaignProg) return;
    lastTickRef.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      lastTickRef.current = now;
      if (delta <= 0) return;
      setSlot((prev) => {
        if (!prev || !activeCampaignId) return prev;
        const camp = prev.campaigns[activeCampaignId];
        if (!camp) return prev;
        return {
          ...prev,
          campaigns: {
            ...prev.campaigns,
            [activeCampaignId]: {
              ...camp,
              stats: { ...camp.stats, elapsedSeconds: camp.stats.elapsedSeconds + delta },
            },
          },
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [view, activeModal, campaignProg, activeCampaignId]);

  /* ---------- Records playtime sync (on slot changes + when returning to menu) ---------- */
  useEffect(() => {
    if (!slot) return;
    const totalPlay = Object.values(slot.campaigns).reduce((acc, c) => acc + (c?.stats?.elapsedSeconds ?? 0), 0);
    const totalPuzzles = Object.values(slot.campaigns).reduce((acc, c) => acc + (c?.stats?.puzzlesSolved ?? 0), 0);
    const totalRooms = Object.values(slot.campaigns).reduce((acc, c) => acc + (c?.stats?.roomsCompleted ?? 0), 0);
    const totalEvidence = Object.values(slot.campaigns).reduce((acc, c) => acc + (c?.inventory?.length ?? 0), 0);
    const totalHints = Object.values(slot.campaigns).reduce((acc, c) => acc + (c?.stats?.hintsUsed ?? 0), 0);
    if (
      totalPlay !== records.totalPlaySeconds ||
      totalPuzzles !== records.totalPuzzlesSolved ||
      totalRooms !== records.totalRoomsCompleted ||
      totalEvidence !== records.totalEvidenceCollected ||
      totalHints !== records.totalHintsUsed
    ) {
      const next = {
        ...records,
        totalPlaySeconds: totalPlay,
        totalPuzzlesSolved: totalPuzzles,
        totalRoomsCompleted: totalRooms,
        totalEvidenceCollected: totalEvidence,
        totalHintsUsed: totalHints,
      };
      setRecords(next);
      saveRecords(next);
    }
  }, [slot, view]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Records-based achievement checks (archivist) ---------- */
  useEffect(() => {
    if (!campaignProg || !activeCampaignId) return;
    const totalEvidence = countCampaignEvidence(activeCampaignId);
    const unlocked = evaluateArchivist(records, activeCampaignId, campaignProg.inventory.length, totalEvidence);
    if (unlocked.length > 0) {
      const { records: nextRecords, xpGained } = applyAchievementUnlocks(records, unlocked);
      persistRecords(nextRecords);
      audioEngine.playAchievement();
      unlocked.forEach((id) => {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (def) addToast('unlock', `ACHIEVEMENT: ${def.name}`, `${def.description} (+${xpGained} XP)`);
      });
    }
  }, [campaignProg?.inventory.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Boot / onboarding flows ---------- */
  const handleBootComplete = () => {
    if (!profile) {
      setView('onboard');
    } else {
      setView('menu');
      audioEngine.playAmbient('menu');
    }
  };

  const handleOnboardComplete = (callsign: string) => {
    const nextProfile = createOnboardedProfile(callsign);
    setProfile(nextProfile);
    setView('menu');
    audioEngine.playAmbient('menu');
  };

  /* ---------- Menu: continue / new campaign / slots ---------- */
  const handleContinueGame = () => {
    // FIX: always re-read from storage (stale-state bug)
    const recent = findMostRecentSlot();
    if (!recent) return;
    const fresh = loadSlot(recent.index) || recent.slot;
    const firstActive =
      fresh.activeCampaignId ||
      (Object.entries(fresh.campaigns).find(([, p]) => p && !p.isCompleted)?.[0] as CampaignId | undefined) ||
      'c1_last_protocol';
    setSlotIndex(recent.index);
    setSlot(fresh);
    setActiveCampaignId(firstActive);
    lastTickRef.current = Date.now();
    setView('playing');
    const room = fresh.campaigns[firstActive]?.currentRoomId;
    if (room) audioEngine.playAmbient(ALL_ROOMS[room].ambientType);
    addToast('unlock', 'RECORD LOADED', `Slot ${recent.index + 1} — welcome back, ${fresh.callsign}`);
  };

  const handleLoadSlot = (index: number) => {
    const fresh = loadSlot(index);
    if (!fresh) return;
    const firstActive =
      fresh.activeCampaignId ||
      (Object.entries(fresh.campaigns).find(([, p]) => p && !p.isCompleted)?.[0] as CampaignId | undefined) ||
      'c1_last_protocol';
    setSlotIndex(index);
    setSlot(fresh);
    setActiveCampaignId(firstActive);
    lastTickRef.current = Date.now();
    setView('playing');
    const room = fresh.campaigns[firstActive]?.currentRoomId;
    if (room) audioEngine.playAmbient(ALL_ROOMS[room].ambientType);
    addToast('unlock', 'RECORD LOADED', `Slot ${index + 1} — welcome back, ${fresh.callsign}`);
  };

  const handleDeleteSlot = (index: number) => {
    clearSlot(index);
    setSlot((prev) => (slotIndex === index ? null : prev));
    if (slotIndex === index) {
      setSlotIndex(null);
      setActiveCampaignId(null);
    }
    addToast('alert', 'SLOT DELETED', `Slot ${index + 1} erased from the registry`);
  };

  const handleStartCampaign = (campaignId: CampaignId, targetSlotIndex: number) => {
    const def = getCampaign(campaignId);
    // Load existing slot or create fresh
    const existing = loadSlot(targetSlotIndex);
    const callsign = profile?.callsign ?? 'OPERATOR';
    const freshCampaign = createInitialCampaignProgress(def.roomIds[0]);
    let nextSlot: SaveSlot;
    if (existing) {
      nextSlot = { ...existing, campaigns: { ...existing.campaigns, [campaignId]: freshCampaign }, activeCampaignId: campaignId };
    } else {
      const campaigns: any = {};
      for (const c of CAMPAIGNS) campaigns[c.id] = null;
      campaigns[campaignId] = freshCampaign;
      nextSlot = createNewSlot(callsign, campaigns);
      nextSlot.activeCampaignId = campaignId;
    }
    saveSlot(targetSlotIndex, nextSlot);
    setSlotIndex(targetSlotIndex);
    setSlot(nextSlot);
    setActiveCampaignId(campaignId);
    setView('opening');
    audioEngine.stopAmbient();
  };

  /* ---------- Quit to menu ---------- */
  const handleQuitToMenu = () => {
    setActiveModal(null);
    setView('menu');
    audioEngine.stopAmbient();
    audioEngine.playAmbient('menu');
  };

  /* ---------- Restart room ---------- */
  const handleRestartRoom = () => {
    if (!slot || !activeCampaignId || !currentRoomId) return;
    setSlot((prev) => {
      if (!prev || !activeCampaignId || !currentRoomId) return prev;
      const camp = prev.campaigns[activeCampaignId];
      return {
        ...prev,
        campaigns: {
          ...prev.campaigns,
          [activeCampaignId]: {
            ...camp,
            roomProgress: {
              ...camp.roomProgress,
              [currentRoomId]: { objectives: {}, solvedPuzzles: {}, collectedEvidence: [], visited: true },
            },
          },
        },
      };
    });
    setActiveModal(null);
    audioEngine.playAmbient(currentRoomConfig?.ambientType ?? 'lab');
    addToast('alert', 'ROOM RESTARTED', 'Chamber objectives and systems reset');
  };

  /* ---------- Object interaction ---------- */
  const handleSelectObject = (obj: InteractableObject) => {
    if (!currentRoomConfig) return;
    if (obj.requiresObjectiveId && !currentRoomProg.objectives[obj.requiresObjectiveId]) {
      audioEngine.playError();
      const reqObj = currentRoomConfig.objectives.find((o) => o.id === obj.requiresObjectiveId);
      addToast('alert', 'SYSTEM LOCKED', `Prerequisite required: "${reqObj ? reqObj.text : 'Complete prior objective'}"`);
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

  /* ---------- Exit gate: all non-door objectives complete ---------- */
  const roomObjectivesComplete = useCallback((): boolean => {
    if (!currentRoomConfig) return false;
    const mandatory = currentRoomConfig.objectives.filter((o) => !o.id.endsWith('_door'));
    return mandatory.every((o) => currentRoomProg.objectives[o.id]);
  }, [currentRoomConfig, currentRoomProg]);

  const handleAttemptExit = () => {
    if (!campaignDef || !currentRoomId || !currentRoomConfig) return;
    if (!roomObjectivesComplete()) {
      audioEngine.playError();
      const missing = currentRoomConfig.objectives.find((o) => !o.id.endsWith('_door') && !currentRoomProg.objectives[o.id]);
      addToast('alert', `${currentRoomConfig.name} — EXIT SEALED`, `Outstanding objective: ${missing ? missing.text : 'verify all systems'}`);
      return;
    }
    const roomOrder = campaignDef.roomIds;
    const idx = roomOrder.indexOf(currentRoomId);
    const nextRoom = roomOrder[idx + 1];
    if (!nextRoom) return;
    setTransitionFrom(currentRoomId);
    setTransitionTo(nextRoom);
    setView('door_transition');
    audioEngine.playPneumaticDoor();

    setSlot((prev) => {
      if (!prev || !activeCampaignId) return prev;
      const camp = prev.campaigns[activeCampaignId];
      const completedRooms = camp.completedRooms.includes(currentRoomId)
        ? camp.completedRooms
        : [...camp.completedRooms, currentRoomId];
      const doorObj = currentRoomConfig.objectives.find((o) => o.id.endsWith('_door'));
      const roomProg = camp.roomProgress[currentRoomId] ?? EMPTY_ROOM_PROGRESS;
      return {
        ...prev,
        campaigns: {
          ...prev.campaigns,
          [activeCampaignId]: {
            ...camp,
            completedRooms,
            unlockedRooms: camp.unlockedRooms.includes(nextRoom) ? camp.unlockedRooms : [...camp.unlockedRooms, nextRoom],
            stats: { ...camp.stats, roomsCompleted: completedRooms.length },
            roomProgress: {
              ...camp.roomProgress,
              [currentRoomId]: {
                ...roomProg,
                objectives: doorObj ? { ...roomProg.objectives, [doorObj.id]: true } : roomProg.objectives,
              },
            },
          },
        },
      };
    });
  };

  const handleTransitionEnd = () => {
    if (!activeCampaignId || !slot) return;
    setSlot((prev) => {
      if (!prev || !activeCampaignId) return prev;
      const camp = prev.campaigns[activeCampaignId];
      const roomProg = camp.roomProgress[transitionTo] ?? EMPTY_ROOM_PROGRESS;
      return {
        ...prev,
        campaigns: {
          ...prev.campaigns,
          [activeCampaignId]: {
            ...camp,
            currentRoomId: transitionTo,
            roomProgress: { ...camp.roomProgress, [transitionTo]: { ...roomProg, visited: true } },
          },
        },
      };
    });
    setView('playing');
    setActiveModal(null);
    audioEngine.playAmbient(ALL_ROOMS[transitionTo].ambientType);
    addToast('unlock', `ENTERED ${ALL_ROOMS[transitionTo].name}`, ALL_ROOMS[transitionTo].subtitle);
  };

  /* ---------- Puzzle resolution ---------- */
  const handlePuzzleSuccess = (puzzleId: string) => {
    if (!activeCampaignId || !slot || !currentRoomId) return;
    const effect = PUZZLE_EFFECTS[puzzleId];
    if (!effect) return;

    setActiveModal(null);
    setActivePuzzleId(null);
    audioEngine.playSuccess();

    const wasFirstAttempt = (puzzleFailCounts.current[puzzleId] ?? 0) === 0;

    // XP for solving
    let nextRecords: PlayerRecords = { ...records, xp: records.xp + 50 };

    setSlot((prev) => {
      if (!prev || !activeCampaignId || !currentRoomId) return prev;
      const camp = prev.campaigns[activeCampaignId];
      const roomProg = camp.roomProgress[currentRoomId] ?? EMPTY_ROOM_PROGRESS;
      const objectives = { ...roomProg.objectives };
      effect.objectives.forEach((o) => (objectives[o] = true));
      if (effect.doorObjective) objectives[effect.doorObjective] = true;

      const nextInventory = [...camp.inventory];
      for (const evId of effect.evidence ?? []) {
        if (!nextInventory.includes(evId)) {
          nextInventory.push(evId);
        }
      }

      return {
        ...prev,
        campaigns: {
          ...prev.campaigns,
          [activeCampaignId]: {
            ...camp,
            inventory: nextInventory,
            roomProgress: {
              ...camp.roomProgress,
              [currentRoomId]: {
                ...roomProg,
                objectives,
                solvedPuzzles: { ...roomProg.solvedPuzzles, [puzzleId]: true },
                collectedEvidence: effect.evidence,
              },
            },
            stats: {
              ...camp.stats,
              puzzlesSolved: camp.stats.puzzlesSolved + 1,
              evidenceCollected: nextInventory,
            },
          },
        },
      };
    });

    // Evidence toasts
    const currentInventory = campaignProg?.inventory ?? [];
    for (const evId of effect.evidence ?? []) {
      if (!currentInventory.includes(evId)) {
        const ev = ALL_EVIDENCE[evId];
        audioEngine.playEvidencePickup();
        addToast('evidence', 'EVIDENCE LOGGED', `${ev ? ev.title : evId} added to Dossier`);
      }
    }
    if (effect.toast) {
      addToast(effect.toast.type, effect.toast.title, effect.toast.description);
    }

    // Achievement evaluation
    const achievementUnlocks = evaluateAchievements(nextRecords, {
      campaignId: activeCampaignId,
      currentRoomId: currentRoomId,
      puzzleId: puzzleId,
      lastPuzzleWasCodeDebug: effect.isCodeDebug,
      firstAttemptPuzzle: wasFirstAttempt,
    });
    if (achievementUnlocks.length > 0) {
      const applied = applyAchievementUnlocks(nextRecords, achievementUnlocks);
      nextRecords = applied.records;
      audioEngine.playAchievement();
      achievementUnlocks.forEach((id) => {
        const meta = ACHIEVEMENTS.find((a) => a.id === id);
        if (meta) addToast('unlock', `ACHIEVEMENT: ${meta.name}`, `${meta.description} (+${applied.xpGained} XP)`);
      });
    }
    persistRecords(nextRecords);
    puzzleFailCounts.current[puzzleId] = 0;
  };

  const handlePuzzleFail = (puzzleId?: string) => {
    if (puzzleId) {
      puzzleFailCounts.current[puzzleId] = (puzzleFailCounts.current[puzzleId] ?? 0) + 1;
    }
    if (!activeCampaignId || !slot) return;
    setSlot((prev) => {
      if (!prev || !activeCampaignId) return prev;
      const camp = prev.campaigns[activeCampaignId];
      return {
        ...prev,
        campaigns: {
          ...prev.campaigns,
          [activeCampaignId]: {
            ...camp,
            stats: { ...camp.stats, incorrectAttempts: camp.stats.incorrectAttempts + 1 },
          },
        },
      };
    });
  };

  const handleUseHint = () => {
    if (!activeCampaignId || !slot) return;
    setSlot((prev) => {
      if (!prev || !activeCampaignId) return prev;
      const camp = prev.campaigns[activeCampaignId];
      return {
        ...prev,
        campaigns: {
          ...prev.campaigns,
          [activeCampaignId]: {
            ...camp,
            stats: { ...camp.stats, hintsUsed: camp.stats.hintsUsed + 1 },
          },
        },
      };
    });
  };

  /* ---------- Final decision → ending ---------- */
  const handleExecuteEnding = (endingId: EndingId) => {
    if (!activeCampaignId || !slot || !campaignProg) return;
    setActiveModal(null);
    setChosenEnding(endingId);

    const { finalScore, rank } = calculateScoreAndRank({
      roomsCompleted: campaignDef!.roomIds.length,
      puzzlesSolved: campaignProg.stats.puzzlesSolved,
      incorrectAttempts: campaignProg.stats.incorrectAttempts,
      hintsUsed: campaignProg.stats.hintsUsed,
      evidenceCollected: campaignProg.inventory.length,
      elapsedSeconds: campaignProg.stats.elapsedSeconds,
      totalPuzzles: countCampaignPuzzles(activeCampaignId),
      totalRooms: campaignDef!.roomIds.length,
      totalEvidence: countCampaignEvidence(activeCampaignId),
    });

    // Records: best + achievements + XP
    let nextRecords = updateCampaignBest(records, activeCampaignId, finalScore, rank, campaignProg.stats.elapsedSeconds, endingId);
    nextRecords = {
      ...nextRecords,
      campaignsCompleted: nextRecords.campaignsCompleted.includes(activeCampaignId)
        ? nextRecords.campaignsCompleted
        : [...nextRecords.campaignsCompleted, activeCampaignId],
      xp: nextRecords.xp + 2500,
    };
    const completionUnlocks = evaluateCompletionAchievements(nextRecords, activeCampaignId, {
      hintsUsed: campaignProg.stats.hintsUsed,
      elapsedSeconds: campaignProg.stats.elapsedSeconds,
      rank,
    });
    const endingUnlocks = evaluateEndingAchievements(nextRecords, endingId);
    const allUnlocks = [...new Set([...completionUnlocks, ...endingUnlocks])];
    const applied = applyAchievementUnlocks(nextRecords, allUnlocks);
    nextRecords = applied.records;
    persistRecords(nextRecords);

    if (allUnlocks.length > 0) audioEngine.playAchievement();

    setSlot((prev) => {
      if (!prev || !activeCampaignId) return prev;
      const camp = prev.campaigns[activeCampaignId];
      const roomProg = camp.roomProgress[camp.currentRoomId] ?? EMPTY_ROOM_PROGRESS;
      const finalRoom = ALL_ROOMS[camp.currentRoomId];
      const finalObj = finalRoom?.objectives.find((o) => o.id.endsWith('_final') || o.id === 'r5_final_choice' || o.id === 'r8_broadcast' || o.id === 'r11_final');
      return {
        ...prev,
        campaigns: {
          ...prev.campaigns,
          [activeCampaignId]: {
            ...camp,
            activeEnding: endingId,
            isCompleted: true,
            stats: {
              ...camp.stats,
              roomsCompleted: campaignDef!.roomIds.length,
              score: finalScore,
            },
            roomProgress: {
              ...camp.roomProgress,
              [camp.currentRoomId]: finalObj
                ? { ...roomProg, objectives: { ...roomProg.objectives, [finalObj.id]: true } }
                : roomProg,
            },
          },
        },
      };
    });

    setView('ending');
    audioEngine.stopAmbient();
  };

  /* ---------- Global keyboard contract ---------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') target.blur();
        return;
      }

      // ESC priority contract
      if (e.key === 'Escape') {
        e.preventDefault();
        if (view === 'playing') {
          if (activeModal === 'pause') {
            setActiveModal(null);
          } else if (activeModal) {
            setActiveModal(null);
            if (activeModal === 'puzzle') setActivePuzzleId(null);
          } else {
            setActiveModal('pause');
          }
        } else if (view === 'boot') {
          // boot handles its own skip
        }
        return;
      }

      if (view !== 'playing') return;

      if (e.key === 'Tab') {
        e.preventDefault();
        audioEngine.playClick();
        setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'));
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        audioEngine.playClick();
        setActiveModal((prev) => (prev === 'map' ? null : 'map'));
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        audioEngine.playClick();
        setActiveModal((prev) => (prev === 'hint' ? null : 'hint'));
        return;
      }
      if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter') && activeModal === null && hoveredObject) {
        e.preventDefault();
        handleSelectObject(hoveredObject);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, activeModal, hoveredObject, currentRoomConfig, currentRoomProg]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Fast transit ---------- */
  const handleFastTransit = (targetRoomId: RoomId) => {
    if (!activeCampaignId || !slot) return;
    const camp = slot.campaigns[activeCampaignId];
    if (!camp.unlockedRooms.includes(targetRoomId)) {
      audioEngine.playError();
      addToast('alert', 'TRANSIT DENIED', 'That chamber has not been unlocked yet');
      return;
    }
    setSlot((prev) => {
      if (!prev || !activeCampaignId) return prev;
      const c = prev.campaigns[activeCampaignId];
      const roomProg = c.roomProgress[targetRoomId] ?? EMPTY_ROOM_PROGRESS;
      return {
        ...prev,
        campaigns: {
          ...prev.campaigns,
          [activeCampaignId]: {
            ...c,
            currentRoomId: targetRoomId,
            roomProgress: { ...c.roomProgress, [targetRoomId]: { ...roomProg, visited: true } },
          },
        },
      };
    });
    audioEngine.playAmbient(ALL_ROOMS[targetRoomId].ambientType);
    addToast('unlock', `TRANSITED TO ${ALL_ROOMS[targetRoomId].name}`, ALL_ROOMS[targetRoomId].subtitle);
  };

  /* ---------- Hint targeting: the puzzle the player is actually blocked on ---------- */
  const currentBlockedPuzzleId = useMemo(() => {
    if (!currentRoomConfig) return null;
    if (activePuzzleId) return activePuzzleId;
    for (const obj of currentRoomConfig.interactables) {
      if (!obj.puzzleId || obj.type !== 'puzzle') continue;
      if (currentRoomProg.solvedPuzzles[obj.puzzleId]) continue;
      if (obj.requiresObjectiveId && !currentRoomProg.objectives[obj.requiresObjectiveId]) continue;
      return obj.puzzleId;
    }
    return null;
  }, [currentRoomConfig, currentRoomProg, activePuzzleId]);

  /* ---------- Room scene renderer ---------- */
  const renderRoomScene = () => {
    const props = {
      config: currentRoomConfig!,
      solvedPuzzles: currentRoomProg.solvedPuzzles,
      objectives: currentRoomProg.objectives,
      activeInteractableId: hoveredObject ? hoveredObject.id : null,
      onHoverObject: setHoveredObject,
      onSelectObject: handleSelectObject,
    };

    switch (currentRoomId) {
      case 'room1_arrival': return <Room01Arrival {...props} />;
      case 'room2_frost': return <Room02FrostLab {...props} />;
      case 'room3_server': return <Room03ServerVault {...props} />;
      case 'room4_mirror': return <Room04MirrorChamber {...props} />;
      case 'room5_protocol': return <Room05LastProtocol {...props} />;
      case 'room6_dark_relay': return <Room06DarkRelay {...props} />;
      case 'room7_listening_post': return <Room07ListeningPost {...props} />;
      case 'room8_antenna_array': return <Room08AntennaArray {...props} />;
      case 'room9_recall_vault': return <Room09RecallVault {...props} />;
      case 'room10_paradox_gallery': return <Room10ParadoxGallery {...props} />;
      case 'room11_loop_terminus': return <Room11LoopTerminus {...props} />;
      default: return <Room01Arrival {...props} />;
    }
  };

  /* ---------- Puzzle panel registry ---------- */
  const puzzleProps = (id: string) => ({
    onSuccess: () => handlePuzzleSuccess(id),
    onClose: () => {
      setActiveModal(null);
      setActivePuzzleId(null);
    },
    onFail: () => handlePuzzleFail(id),
  });

  const renderPuzzlePanel = () => {
    if (activeModal !== 'puzzle' || !activePuzzleId) return null;
    // Final-decision consoles route to the ending flow
    if (
      activePuzzleId === 'puzzle_r5_final_choice' ||
      activePuzzleId === 'puzzle_r8_final_broadcast' ||
      activePuzzleId === 'puzzle_r11_final_loop'
    ) {
      return (
        <FinalDecisionModal
          campaignId={activeCampaignId!}
          onExecuteEnding={handleExecuteEnding}
          onClose={() => {
            setActiveModal(null);
            setActivePuzzleId(null);
          }}
        />
      );
    }
    switch (activePuzzleId) {
      // Campaign 01
      case 'puzzle_r1_power': return <PowerRoutingPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r1_keypad': return <KeypadPuzzle correctCode="7914" title="EXAMINATION DESK OVERRIDE" subtitle="ENTER 4-DIGIT PIN // DERIVED FROM CHAMBER CLUES" {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r1_auth_bug': return <CodeBugPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r2_symbols': return <FrostedSymbolsPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r2_valves': return <CoolantValvePuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r2_cooling_debug': return <CryoDebugPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r3_anomaly': return <ServerAnomalyPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r3_api_recon': return <ApiReconPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r3_json_recovery': return <JsonRepairPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r4_discrepancies': return <MirrorDiscrepancyPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r4_sequence': return <MultiRoomSequencePuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r4_logic_gate': return <LogicGatesPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r5_power_matrix': return <GeneratorMatrixPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r5_master_code': return <MasterProtocolPuzzle {...puzzleProps(activePuzzleId)} />;
      // Campaign 02
      case 'puzzle_r6_patch': return <PatchPanelPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r6_frequency': return <FrequencyTuningPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r6_morse': return <MorseDecodePuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r7_waveform': return <WaveformMatchPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r7_cipher': return <CipherWheelPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r7_signal_debug': return <SignalDebugPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r8_triangulation': return <TriangulationPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r8_uplink': return <UplinkSequencePuzzle {...puzzleProps(activePuzzleId)} />;
      // Campaign 03
      case 'puzzle_r9_audio_recall': return <AudioRecallPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r9_timeline': return <TimelineOrderPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r9_shadow': return <ShadowMatchPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r10_paradox': return <ParadoxAuditPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r10_echo_seq': return <EchoSequencePuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r10_memory_pairs': return <MemoryPairsPuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r11_convergence': return <ConvergencePuzzle {...puzzleProps(activePuzzleId)} />;
      case 'puzzle_r11_loop_debug': return <LoopDebugPuzzle {...puzzleProps(activePuzzleId)} />;
      default:
        return null;
    }
  };

  return (
    <div className={`bugout-app-root ${settings.reducedMotion ? 'reduced-motion' : ''} ${settings.highContrast ? 'high-contrast' : ''}`}>
      {/* ===== BOOT ===== */}
      {view === 'boot' && <BootSequence onComplete={handleBootComplete} />}

      {/* ===== ONBOARDING ===== */}
      {view === 'onboard' && <OnboardingScreen onComplete={handleOnboardComplete} />}

      {/* ===== MAIN MENU HUB ===== */}
      {view === 'menu' && profile && (
        <MainMenu
          profile={profile}
          records={records}
          continueSlot={initial.continueSlot}
          onContinue={handleContinueGame}
          onStartCampaign={handleStartCampaign}
          onLoadSlot={handleLoadSlot}
          onDeleteSlot={handleDeleteSlot}
          onOpenSettings={() => setActiveModal('settings')}
        />
      )}

      {/* ===== OPENING ===== */}
      {view === 'opening' && campaignDef && (
        <OpeningSequence
          campaign={campaignDef}
          onComplete={() => {
            setView('playing');
            const startRoom = campaignDef.roomIds[0];
            audioEngine.playAmbient(ALL_ROOMS[startRoom].ambientType);
            addToast('unlock', `CHAMBER ${ALL_ROOMS[startRoom].number} ACTIVATED`, `Primary Objective: ${currentRoomConfig?.objectives[0]?.text ?? 'Begin'}`);
          }}
        />
      )}

      {/* ===== DOOR TRANSITION ===== */}
      {view === 'door_transition' && (
        <DoorTransition fromRoomId={transitionFrom} toRoomId={transitionTo} onTransitionEnd={handleTransitionEnd} />
      )}

      {/* ===== ENDING ===== */}
      {view === 'ending' && campaignDef && campaignProg && (
        <EndingCinematic
          campaignId={campaignDef.id}
          endingId={chosenEnding}
          stats={campaignProg.stats}
          totalPuzzles={countCampaignPuzzles(campaignDef.id)}
          totalEvidence={countCampaignEvidence(campaignDef.id)}
          onRestartCampaign={() => {
            if (activeCampaignId && slotIndex !== null) handleStartCampaign(activeCampaignId, slotIndex);
          }}
          onReturnToMenu={handleQuitToMenu}
        />
      )}

      {/* ===== GAMEPLAY ===== */}
      {view === 'playing' && currentRoomConfig && campaignDef && campaignProg && (
        <div className="gameplay-viewport">
          <AtmosphereCanvas roomId={currentRoomId as any} reducedMotion={settings.reducedMotion} />
          {renderRoomScene()}
          <HUD
            roomConfig={currentRoomConfig}
            campaignTitle={campaignDef.title}
            elapsedSeconds={campaignProg.stats.elapsedSeconds}
            evidenceCount={campaignProg.inventory.length}
            hoveredObject={hoveredObject}
            settings={settings}
            activeObjectiveText={activeObjectiveText}
            onToggleInventory={() => setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'))}
            onToggleMap={() => setActiveModal((prev) => (prev === 'map' ? null : 'map'))}
            onToggleHint={() => setActiveModal((prev) => (prev === 'hint' ? null : 'hint'))}
            onTogglePause={() => setActiveModal('pause')}
            onToggleMute={() => setSettings((prev) => ({ ...prev, muted: !prev.muted }))}
          />
          <NotificationToast toasts={toasts} onDismiss={removeToast} />

          {activeModal === 'inventory' && (
            <InventoryModal campaignId={campaignDef.id} collectedIds={campaignProg.inventory} onClose={() => setActiveModal(null)} />
          )}
          {activeModal === 'map' && (
            <FacilityMapModal
              campaignId={campaignDef.id}
              currentRoomId={currentRoomId!}
              completedRooms={campaignProg.completedRooms}
              unlockedRooms={campaignProg.unlockedRooms}
              onSelectRoom={handleFastTransit}
              onClose={() => setActiveModal(null)}
            />
          )}
          {activeModal === 'hint' && (
            <HintTerminalModal
              currentRoomId={currentRoomId!}
              activePuzzleId={currentBlockedPuzzleId}
              onUseHint={handleUseHint}
              onClose={() => setActiveModal(null)}
            />
          )}
          {activeModal === 'pause' && (
            <PauseModal
              onResume={() => setActiveModal(null)}
              onRestartRoom={handleRestartRoom}
              onOpenSettings={() => setActiveModal('settings')}
              onQuitToMenu={handleQuitToMenu}
            />
          )}

          {renderPuzzlePanel()}
        </div>
      )}

      {/* ===== GLOBAL MODALS (available from menu too — bug fix) ===== */}
      {activeModal === 'settings' && (
        <SettingsModal settings={settings} onUpdateSettings={setSettings} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default App;
