import { GameState, RoomId, PlayerSettings } from '../types/game';

const STORAGE_KEY = 'bugout_the_last_protocol_v1_save';
const CURRENT_VERSION = 1;

export const defaultSettings: PlayerSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.85,
  musicVolume: 0.6,
  muted: false,
  reducedMotion: false,
  highContrast: false,
  mode: 'campaign'
};

export const createInitialGameState = (): GameState => ({
  version: CURRENT_VERSION,
  currentRoomId: 'room1_arrival',
  completedRooms: [],
  unlockedRooms: ['room1_arrival'],
  roomProgress: {
    room1_arrival: { objectives: {}, solvedPuzzles: {}, collectedEvidence: [], visited: true },
    room2_frost: { objectives: {}, solvedPuzzles: {}, collectedEvidence: [], visited: false },
    room3_server: { objectives: {}, solvedPuzzles: {}, collectedEvidence: [], visited: false },
    room4_mirror: { objectives: {}, solvedPuzzles: {}, collectedEvidence: [], visited: false },
    room5_protocol: { objectives: {}, solvedPuzzles: {}, collectedEvidence: [], visited: false },
  },
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
    score: 10000,
  },
  settings: defaultSettings,
  isCompleted: false,
});

export const saveGameState = (state: GameState): boolean => {
  try {
    const data = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, data);
    return true;
  } catch (err) {
    console.error('Failed to save game state to localStorage:', err);
    return false;
  }
};

export const loadGameState = (): GameState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;

    if (!parsed || typeof parsed !== 'object' || parsed.version !== CURRENT_VERSION) {
      console.warn('Incompatible save version or invalid data, creating fresh state');
      return null;
    }

    // Sanity checks on required structures
    if (!parsed.currentRoomId || !parsed.roomProgress || !parsed.inventory) {
      return null;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to parse save game state:', err);
    return null;
  }
};

export const clearSavedGame = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear saved game:', e);
  }
};

export const calculateScoreAndRank = (stats: GameState['stats']) => {
  // Base 10,000 pts
  // + 2000 per room completed (up to 10,000)
  // + 500 per puzzle solved
  // + 300 per evidence collected
  // - 150 per incorrect attempt
  // - 250 per hint tier used
  // - 2 pts per elapsed second beyond 5 minutes
  const timePenalty = Math.max(0, Math.floor((stats.elapsedSeconds - 300) * 1.5));
  const hintPenalty = stats.hintsUsed * 250;
  const errorPenalty = stats.incorrectAttempts * 150;

  const basePoints = 5000;
  const roomPoints = stats.roomsCompleted * 2000;
  const puzzlePoints = stats.puzzlesSolved * 500;
  const evidencePoints = stats.evidenceCollected.length * 350;

  const finalScore = Math.max(500, basePoints + roomPoints + puzzlePoints + evidencePoints - timePenalty - hintPenalty - errorPenalty);

  let rank: 'Ghost' | 'Mastermind' | 'Systems Hacker' | 'Investigator' | 'Rookie' = 'Rookie';
  if (finalScore >= 16000 && stats.hintsUsed <= 2 && stats.incorrectAttempts <= 3) {
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
