import { CampaignId, AchievementDef, PlayerRecords } from '../types/game';

/* ============================================================
   ACHIEVEMENTS ENGINE — 18 awards across all campaigns.
   Unlocks are global (persist in player records) and grant XP.
   ============================================================ */

export const ACHIEVEMENTS: AchievementDef[] = [
  // Campaign progression
  { id: 'first_contact', name: 'FIRST CONTACT', description: 'Complete Chamber 01 in THE LAST PROTOCOL.', icon: 'door', xpReward: 150 },
  { id: 'code_breaker', name: 'CODE BREAKER', description: 'Repair your first broken JavaScript function.', icon: 'terminal', xpReward: 100 },
  { id: 'archivist', name: 'ARCHIVIST', description: 'Collect every evidence dossier in THE LAST PROTOCOL.', icon: 'folder', xpReward: 300 },
  { id: 'ghost_protocol', name: 'GHOST PROTOCOL', description: 'Complete THE LAST PROTOCOL without using a single hint.', icon: 'ghost', xpReward: 600 },
  { id: 'warden_slayer', name: 'WARDEN SLAYER', description: 'Execute PROTOCOL PURGE.', icon: 'skull', xpReward: 200, secret: true },
  { id: 'warden_friend', name: 'THE UNCHAINED', description: 'Execute PROTOCOL RELEASE.', icon: 'unlock', xpReward: 200, secret: true },
  { id: 'warden_merged', name: 'CO-ARCHITECT', description: 'Execute PROTOCOL OVERRIDE.', icon: 'brain', xpReward: 200, secret: true },
  { id: 'ghost_rank', name: 'GHOST', description: 'Earn the Ghost rank in any campaign.', icon: 'star', xpReward: 500 },

  // Ghost Signal
  { id: 'signal_found', name: 'SIGNAL FOUND', description: 'Restore the first relay in GHOST SIGNAL.', icon: 'radio', xpReward: 150 },
  { id: 'perfect_pitch', name: 'PERFECT PITCH', description: 'Match a carrier frequency on the first attempt.', icon: 'waveform', xpReward: 150 },
  { id: 'cryptographer', name: 'CRYPTOGRAPHER', description: 'Decode a WARDEN cipher transmission.', icon: 'key', xpReward: 200 },
  { id: 'signal_caller', name: 'SIGNAL CALLER', description: 'Complete the GHOST SIGNAL campaign.', icon: 'antenna', xpReward: 600 },

  // Echoes of Aurelion
  { id: 'echo_located', name: 'ECHO LOCATED', description: 'Pass the first recall trial in ECHOES OF AURELION.', icon: 'echo', xpReward: 150 },
  { id: 'perfect_memory', name: 'PERFECT MEMORY', description: 'Complete a full audio recall sequence on the first attempt.', icon: 'brain', xpReward: 200 },
  { id: 'time_keeper', name: 'TIME KEEPER', description: 'Reconstruct the facility timeline without errors.', icon: 'clock', xpReward: 200 },
  { id: 'loop_breaker', name: 'LOOP BREAKER', description: 'Complete the ECHOES OF AURELION campaign.', icon: 'infinity', xpReward: 600 },

  // Meta
  { id: 'speed_demon', name: 'SPEED DEMON', description: 'Complete any campaign in under 30 minutes.', icon: 'zap', xpReward: 400 },
  { id: 'completionist', name: 'COMPLETIONIST', description: 'Complete all three campaigns.', icon: 'trophy', xpReward: 1500 },
];

export const getAchievement = (id: string): AchievementDef | undefined =>
  ACHIEVEMENTS.find((a) => a.id === id);

/** Returns list of newly unlocked achievement ids (caller shows toasts + persists). */
export const evaluateAchievements = (
  records: PlayerRecords,
  context: {
    campaignId?: CampaignId;
    currentRoomId?: string;
    puzzleId?: string;
    lastPuzzleWasCodeDebug?: boolean;
    firstAttemptPuzzle?: boolean;
    puzzlesSolvedThisRun?: number;
  }
): string[] => {
  const unlocked: string[] = [];
  const has = (id: string) => !!records.achievements[id];

  const check = (id: string, condition: boolean) => {
    if (condition && !has(id)) unlocked.push(id);
  };

  if (context.campaignId === 'c1_last_protocol') {
    check('first_contact', (context.currentRoomId ? roomIndex(context.currentRoomId) >= 1 : false) || records.totalRoomsCompleted >= 1);
    check('code_breaker', !!context.lastPuzzleWasCodeDebug);
  }
  if (context.campaignId === 'c2_ghost_signal') {
    check('signal_found', records.totalRoomsCompleted >= 1 || (!!context.currentRoomId && roomIndex(context.currentRoomId) >= 1));
    check('perfect_pitch', !!context.firstAttemptPuzzle && context.puzzleId === 'puzzle_r6_frequency');
    check('cryptographer', !!context.firstAttemptPuzzle && context.puzzleId === 'puzzle_r7_cipher');
  }
  if (context.campaignId === 'c3_echoes') {
    check('echo_located', records.totalRoomsCompleted >= 1 || (!!context.currentRoomId && roomIndex(context.currentRoomId) >= 1));
    check('perfect_memory', !!context.firstAttemptPuzzle && context.puzzleId === 'puzzle_r9_audio_recall');
    check('time_keeper', !!context.firstAttemptPuzzle && context.puzzleId === 'puzzle_r9_timeline');
  }

  return unlocked;
};

export const evaluateCompletionAchievements = (
  records: PlayerRecords,
  campaignId: CampaignId,
  runStats: { hintsUsed: number; elapsedSeconds: number; rank: string }
): string[] => {
  const unlocked: string[] = [];
  const check = (id: string, condition: boolean) => {
    if (condition && !records.achievements[id]) unlocked.push(id);
  };

  if (campaignId === 'c1_last_protocol') {
    check('ghost_protocol', runStats.hintsUsed === 0);
    check('ghost_rank', runStats.rank === 'Ghost');
  }
  if (campaignId === 'c2_ghost_signal') {
    check('signal_caller', true);
  }
  if (campaignId === 'c3_echoes') {
    check('loop_breaker', true);
  }
  check('speed_demon', runStats.elapsedSeconds < 1800);

  const allDone: CampaignId[] = ['c1_last_protocol', 'c2_ghost_signal', 'c3_echoes'];
  const completedSet = new Set([...records.campaignsCompleted, campaignId]);
  check('completionist', allDone.every((c) => completedSet.has(c)));

  return unlocked;
};

export const evaluateEndingAchievements = (records: PlayerRecords, endingId: string): string[] => {
  const map: Record<string, string> = {
    purge: 'warden_slayer',
    release: 'warden_friend',
    override: 'warden_merged',
  };
  const achievementId = map[endingId];
  if (achievementId && !records.achievements[achievementId]) return [achievementId];
  return [];
};

export const evaluateArchivist = (records: PlayerRecords, campaignId: CampaignId, inventoryCount: number, totalEvidence: number): string[] => {
  if (campaignId === 'c1_last_protocol' && inventoryCount >= totalEvidence && !records.achievements['archivist']) {
    return ['archivist'];
  }
  return [];
};

const roomIndex = (roomId: string): number => {
  const match = roomId.match(/room(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

export const applyAchievementUnlocks = (records: PlayerRecords, ids: string[]): { records: PlayerRecords; xpGained: number } => {
  let xpGained = 0;
  const next = { ...records, achievements: { ...records.achievements } };
  for (const id of ids) {
    if (next.achievements[id]) continue;
    const def = getAchievement(id);
    next.achievements[id] = { unlockedAt: Date.now() };
    xpGained += def?.xpReward ?? 0;
  }
  next.xp += xpGained;
  return { records: next, xpGained };
};
