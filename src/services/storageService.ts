import {
  CampaignId,
  CampaignProgress,
  CampaignBest,
  ClearanceLevel,
  PlayerProfile,
  PlayerRecords,
  PlayerSettings,
  PlayerRank,
  RoomId,
  SaveSlot
} from '../types/game';

/* ============================================================
   PERSISTENCE LAYER — SCHEMA v2
   - Global profile, records & settings (bugout_profile_v2)
   - 3 save slots, each holding all campaign progress
   - Automatic migration from legacy v1 single-save format
   ============================================================ */

const PROFILE_KEY = 'bugout_profile_v2';
const SLOT_KEY = (n: number) => `bugout_slot_${n}_v2`;
const LEGACY_KEY = 'bugout_the_last_protocol_v1_save';
export const SAVE_SLOT_COUNT = 3;

/* ---------- Defaults ---------- */

export const defaultSettings: PlayerSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.85,
  musicVolume: 0.6,
  muted: false,
  reducedMotion: false,
  highContrast: false,
};

export const createInitialCampaignProgress = (startRoom: RoomId): CampaignProgress => ({
  currentRoomId: startRoom,
  completedRooms: [],
  unlockedRooms: [startRoom],
  roomProgress: {},
  puzzleStates: {},
  inventory: [],
  stats: {
    roomsCompleted: 0,
    puzzlesSolved: 0,
    incorrectAttempts: 0,
    hintsUsed: 0,
    evidenceCollected: [],
    startTime: Date.now(),
    elapsedSeconds: 0,
    score: 0,
  },
  isCompleted: false,
});

export const createInitialRecords = (): PlayerRecords => ({
  achievements: {},
  campaignBests: {},
  xp: 0,
  totalPuzzlesSolved: 0,
  totalRoomsCompleted: 0,
  totalEvidenceCollected: 0,
  totalHintsUsed: 0,
  totalPlaySeconds: 0,
  campaignsCompleted: [],
});

export const generatePlayerId = (): string =>
  `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* ---------- Profile / Records / Settings (global) ---------- */

export const loadProfile = (): PlayerProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.callsign !== 'string') return null;
    return parsed as PlayerProfile;
  } catch {
    return null;
  }
};

export const saveProfile = (profile: PlayerProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
};

export const createOnboardedProfile = (callsign: string): PlayerProfile => {
  const existing = loadProfile();
  const profile: PlayerProfile = {
    callsign: callsign.trim().slice(0, 16).toUpperCase() || 'OPERATOR',
    playerId: existing?.playerId || generatePlayerId(),
    createdAt: existing?.createdAt || Date.now(),
    onboarded: true,
  };
  saveProfile(profile);
  return profile;
};

export const loadRecords = (): PlayerRecords => {
  try {
    const raw = localStorage.getItem(`${PROFILE_KEY}_records`);
    if (!raw) return createInitialRecords();
    const parsed = JSON.parse(raw);
    return { ...createInitialRecords(), ...parsed };
  } catch {
    return createInitialRecords();
  }
};

export const saveRecords = (records: PlayerRecords): void => {
  try {
    localStorage.setItem(`${PROFILE_KEY}_records`, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records:', err);
  }
};

export const loadSettings = (): PlayerSettings => {
  try {
    const raw = localStorage.getItem(`${PROFILE_KEY}_settings`);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: PlayerSettings): void => {
  try {
    localStorage.setItem(`${PROFILE_KEY}_settings`, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
};

/* ---------- Save Slots ---------- */

export const loadSlot = (slotIndex: number): SaveSlot | null => {
  try {
    const raw = localStorage.getItem(SLOT_KEY(slotIndex));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 2 || !parsed.campaigns) return null;
    return parsed as SaveSlot;
  } catch {
    return null;
  }
};

export const saveSlot = (slotIndex: number, slot: SaveSlot): boolean => {
  try {
    localStorage.setItem(SLOT_KEY(slotIndex), JSON.stringify({ ...slot, savedAt: Date.now() }));
    return true;
  } catch (err) {
    console.error('Failed to save slot:', err);
    return false;
  }
};

export const clearSlot = (slotIndex: number): void => {
  try {
    localStorage.removeItem(SLOT_KEY(slotIndex));
  } catch (err) {
    console.error('Failed to clear slot:', err);
  }
};

/** Full wipe: profile, records, settings and every save slot. */
export const wipeAllData = (): void => {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(`${PROFILE_KEY}_records`);
    localStorage.removeItem(`${PROFILE_KEY}_settings`);
    localStorage.removeItem(LEGACY_KEY);
    for (let i = 0; i < SAVE_SLOT_COUNT; i++) {
      localStorage.removeItem(SLOT_KEY(i));
    }
  } catch (err) {
    console.error('Failed to wipe data:', err);
  }
};

export const findMostRecentSlot = (): { index: number; slot: SaveSlot } | null => {
  let best: { index: number; slot: SaveSlot } | null = null;
  for (let i = 0; i < SAVE_SLOT_COUNT; i++) {
    const slot = loadSlot(i);
    if (slot && (!best || slot.savedAt > best.slot.savedAt)) {
      best = { index: i, slot };
    }
  }
  return best;
};

export const createNewSlot = (callsign: string, freshCampaigns: Record<CampaignId, CampaignProgress>): SaveSlot => ({
  version: 2,
  savedAt: Date.now(),
  callsign,
  activeCampaignId: null,
  campaigns: freshCampaigns,
});

/* ---------- Legacy v1 Migration ---------- */

interface LegacyV1State {
  version: number;
  currentRoomId: RoomId;
  completedRooms: RoomId[];
  unlockedRooms: RoomId[];
  roomProgress: Record<string, any>;
  inventory: string[];
  stats: any;
  activeEnding?: string;
  isCompleted: boolean;
}

const migrateLegacyV1 = (): SaveSlot | null => {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as LegacyV1State;
    if (!legacy || legacy.version !== 1) return null;

    const c1Progress: CampaignProgress = {
      currentRoomId: legacy.currentRoomId || 'room1_arrival',
      completedRooms: legacy.completedRooms || [],
      unlockedRooms: legacy.unlockedRooms || ['room1_arrival'],
      roomProgress: legacy.roomProgress || {},
      puzzleStates: {},
      inventory: legacy.inventory || [],
      stats: {
        roomsCompleted: legacy.stats?.roomsCompleted ?? 0,
        puzzlesSolved: legacy.stats?.puzzlesSolved ?? 0,
        incorrectAttempts: legacy.stats?.incorrectAttempts ?? 0,
        hintsUsed: legacy.stats?.hintsUsed ?? 0,
        evidenceCollected: legacy.stats?.evidenceCollected ?? [],
        startTime: legacy.stats?.startTime ?? Date.now(),
        elapsedSeconds: legacy.stats?.elapsedSeconds ?? 0,
        score: legacy.stats?.score ?? 0,
      },
      activeEnding: (legacy.activeEnding as any) || undefined,
      isCompleted: !!legacy.isCompleted,
    };

    const slot = createNewSlot('OPERATOR', { c1_last_protocol: c1Progress } as any);
    // Fill missing campaigns
    slot.campaigns = {
      c1_last_protocol: c1Progress,
      c2_ghost_signal: null as any,
      c3_echoes: null as any,
    } as any;
    saveSlot(0, slot);
    localStorage.removeItem(LEGACY_KEY);
    console.info('Migrated legacy v1 save into slot 0');
    return slot;
  } catch (err) {
    console.warn('Legacy migration failed:', err);
    return null;
  }
};

/** Attempt migration once at boot. Returns migrated slot if it existed. */
export const attemptLegacyMigration = (): SaveSlot | null => {
  if (!localStorage.getItem(LEGACY_KEY)) return null;
  return migrateLegacyV1();
};

/* ---------- Scoring & Ranks ---------- */

export const calculateScoreAndRank = (stats: {
  roomsCompleted: number;
  puzzlesSolved: number;
  incorrectAttempts: number;
  hintsUsed: number;
  evidenceCollected: string[] | number;
  elapsedSeconds: number;
  totalPuzzles?: number;
  totalRooms?: number;
  totalEvidence?: number;
}): { finalScore: number; rank: PlayerRank } => {
  const evidenceCount =
    typeof stats.evidenceCollected === 'number' ? stats.evidenceCollected : stats.evidenceCollected.length;

  const totalRooms = stats.totalRooms ?? 5;
  const totalPuzzles = stats.totalPuzzles ?? 15;
  const totalEvidence = stats.totalEvidence ?? 9;

  const timePenalty = Math.max(0, Math.floor((stats.elapsedSeconds - 300) * 1.5));
  const hintPenalty = stats.hintsUsed * 250;
  const errorPenalty = stats.incorrectAttempts * 150;

  const basePoints = 5000;
  const roomPoints = stats.roomsCompleted * Math.round(10000 / totalRooms);
  const puzzlePoints = stats.puzzlesSolved * Math.round(5000 / totalPuzzles);
  const evidencePoints = evidenceCount * Math.round(3000 / totalEvidence);

  const finalScore = Math.max(
    500,
    Math.round(basePoints + roomPoints + puzzlePoints + evidencePoints - timePenalty - hintPenalty - errorPenalty)
  );

  let rank: PlayerRank = 'Rookie';
  const perfectish = stats.hintsUsed <= 2 && stats.incorrectAttempts <= 3;
  if (finalScore >= 16000 && perfectish) {
    rank = 'Ghost';
  } else if (finalScore >= 14000) {
    rank = 'Mastermind';
  } else if (finalScore >= 11000) {
    rank = 'Systems Hacker';
  } else if (finalScore >= 8000) {
    rank = 'Investigator';
  }

  return { finalScore, rank };
};

export const updateCampaignBest = (
  records: PlayerRecords,
  campaignId: CampaignId,
  score: number,
  rank: PlayerRank,
  timeSeconds: number,
  ending: string
): PlayerRecords => {
  const existing = records.campaignBests[campaignId];
  const endingsSeen = existing ? [...new Set([...existing.endingsSeen, ending as any])] : [ending as any];

  const best: CampaignBest = {
    bestScore: Math.max(existing?.bestScore ?? 0, score),
    bestRank: rankOrder(rank) > rankOrder(existing?.bestRank ?? 'Rookie') ? rank : existing?.bestRank ?? rank,
    bestTimeSeconds:
      existing?.bestTimeSeconds != null ? Math.min(existing.bestTimeSeconds, timeSeconds) : timeSeconds,
    completions: (existing?.completions ?? 0) + 1,
    lastCompletedAt: Date.now(),
    endingsSeen,
  };

  return {
    ...records,
    campaignBests: { ...records.campaignBests, [campaignId]: best },
  };
};

const rankOrder = (rank: PlayerRank): number =>
  ['Rookie', 'Investigator', 'Systems Hacker', 'Mastermind', 'Ghost'].indexOf(rank);

/* ---------- Clearance Level (XP) ---------- */

export const CLEARANCE_TIERS: { level: ClearanceLevel; xp: number }[] = [
  { level: 'RECRUIT', xp: 0 },
  { level: 'OPERATIVE', xp: 1500 },
  { level: 'SPECIALIST', xp: 4000 },
  { level: 'VETERAN', xp: 8000 },
  { level: 'ELITE', xp: 14000 },
  { level: 'LEGEND', xp: 22000 },
];

export const getClearance = (xp: number): { level: ClearanceLevel; index: number; nextAt: number | null; progress: number } => {
  let index = 0;
  for (let i = 0; i < CLEARANCE_TIERS.length; i++) {
    if (xp >= CLEARANCE_TIERS[i].xp) index = i;
  }
  const next = CLEARANCE_TIERS[index + 1];
  const current = CLEARANCE_TIERS[index];
  const progress = next ? (xp - current.xp) / (next.xp - current.xp) : 1;
  return { level: current.level, index, nextAt: next ? next.xp : null, progress };
};

/* ---------- Utility ---------- */

export const formatPlaytime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const formatTimestamp = (ts: number): string => {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};
