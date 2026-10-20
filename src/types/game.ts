export type RoomId = 
  | 'room1_arrival' 
  | 'room2_frost' 
  | 'room3_server' 
  | 'room4_mirror' 
  | 'room5_protocol';

export type RoomStatus = 'locked' | 'unlocked' | 'active' | 'completed';

export type EndingId = 'purge' | 'release' | 'override';

export type PlayerRank = 'Rookie' | 'Investigator' | 'Systems Hacker' | 'Mastermind' | 'Ghost';

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'document' | 'technical' | 'access' | 'photo' | 'recovered_data';
  roomId: RoomId;
  description: string;
  detailedText: string;
  iconType: string;
  discoveredAt?: number;
  relatedClues: string[];
  visualDetail?: string; // SVG or ASCII or schematic notation
}

export interface PuzzleDefinition {
  id: string;
  roomId: RoomId;
  section: string;
  title: string;
  instructions: string;
  hints: [string, string, string]; // [subtle nudge, relationship/clue, direct reasoning]
}

export interface RoomObjective {
  id: string;
  text: string;
  completed: boolean;
}

export interface InteractableObject {
  id: string;
  name: string;
  actionPrompt: string; // e.g. "Inspect Keypad [E]"
  type: 'inspect' | 'puzzle' | 'evidence' | 'exit' | 'switch';
  xPercent: number; // 0-100 position in room scene
  yPercent: number; // 0-100 position in room scene
  widthPercent: number;
  heightPercent: number;
  icon: string;
  puzzleId?: string;
  evidenceId?: string;
  isCompleted?: boolean;
  requiresObjectiveId?: string;
}

export interface RoomConfig {
  id: RoomId;
  number: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  accentColor: string;
  ambientType: 'lab' | 'cryo' | 'server' | 'mirror' | 'core';
  objectives: RoomObjective[];
  interactables: InteractableObject[];
  storyReveal: {
    title: string;
    text: string;
    transmission: string;
  };
}

export interface PlayerSettings {
  masterVolume: number; // 0 to 1
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  mode: 'campaign' | 'challenge';
}

export interface GameStats {
  roomsCompleted: number;
  puzzlesSolved: number;
  incorrectAttempts: number;
  hintsUsed: number;
  evidenceCollected: string[];
  startTime: number;
  elapsedSeconds: number;
  score: number;
}

export interface GameState {
  version: number;
  currentRoomId: RoomId;
  completedRooms: RoomId[];
  unlockedRooms: RoomId[];
  roomProgress: Record<RoomId, {
    objectives: Record<string, boolean>;
    solvedPuzzles: Record<string, boolean>;
    collectedEvidence: string[];
    visited: boolean;
  }>;
  puzzleStates: Record<string, any>; // custom puzzle progress
  inventory: string[]; // evidence IDs
  stats: GameStats;
  settings: PlayerSettings;
  activeEnding?: EndingId;
  isCompleted: boolean;
}
