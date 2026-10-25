/* ============================================================
   BUGOUT: THE LAST PROTOCOL — CORE TYPE SYSTEM (SAVE SCHEMA v2)
   Multi-campaign architecture with persistent player records.
   ============================================================ */

/* ---------- Campaign & Room Identifiers ---------- */

export type CampaignId = 'c1_last_protocol' | 'c2_ghost_signal' | 'c3_echoes';

export type RoomId =
  // Campaign 01 — THE LAST PROTOCOL
  | 'room1_arrival'
  | 'room2_frost'
  | 'room3_server'
  | 'room4_mirror'
  | 'room5_protocol'
  // Campaign 02 — GHOST SIGNAL
  | 'room6_dark_relay'
  | 'room7_listening_post'
  | 'room8_antenna_array'
  // Campaign 03 — ECHOES OF AURELION
  | 'room9_recall_vault'
  | 'room10_paradox_gallery'
  | 'room11_loop_terminus';

export type RoomStatus = 'locked' | 'unlocked' | 'active' | 'completed';

/* ---------- Endings (per campaign) ---------- */

export type EndingId =
  // Campaign 01
  | 'purge' | 'release' | 'override'
  // Campaign 02
  | 'transmit' | 'scramble' | 'reencode'
  // Campaign 03
  | 'break_loop' | 'preserve_loop' | 'merge_echoes';

/* ---------- Ranks & Clearance ---------- */

export type PlayerRank = 'Rookie' | 'Investigator' | 'Systems Hacker' | 'Mastermind' | 'Ghost';

export type ClearanceLevel = 'RECRUIT' | 'OPERATIVE' | 'SPECIALIST' | 'VETERAN' | 'ELITE' | 'LEGEND';

/* ---------- Evidence ---------- */

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'document' | 'technical' | 'access' | 'photo' | 'recovered_data' | 'signal' | 'recording';
  roomId: RoomId;
  description: string;
  detailedText: string;
  iconType: string;
  discoveredAt?: number;
  relatedClues: string[];
  visualDetail?: string;
}

/* ---------- Puzzles ---------- */

export interface PuzzleDefinition {
  id: string;
  roomId: RoomId;
  campaignId: CampaignId;
  section: string;
  title: string;
  instructions: string;
  hints: [string, string, string];
}

/* ---------- Rooms ---------- */

export interface RoomObjective {
  id: string;
  text: string;
  completed: boolean;
}

export interface InteractableObject {
  id: string;
  name: string;
  actionPrompt: string;
  type: 'inspect' | 'puzzle' | 'evidence' | 'exit' | 'switch';
  xPercent: number;
  yPercent: number;
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
  campaignId: CampaignId;
  number: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  accentColor: string;
  ambientType: 'lab' | 'cryo' | 'server' | 'mirror' | 'core' | 'comms' | 'signal' | 'array' | 'vault' | 'gallery' | 'loop';
  objectives: RoomObjective[];
  interactables: InteractableObject[];
  storyReveal: {
    title: string;
    text: string;
    transmission: string;
  };
}

/* ---------- Campaign Registry ---------- */

export interface EndingDefinition {
  id: EndingId;
  title: string;
  badge: string;
  narrative: string;
  themeClass: string;
  choiceLabel: string;
  choiceDescription: string;
  choiceIcon: string;
}

export interface CampaignDefinition {
  id: CampaignId;
  index: number;
  codename: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  difficulty: 'STANDARD' | 'ADVANCED' | 'EXTREME';
  roomCount: number;
  puzzleCount: number;
  themeColor: string;
  accentColor: string;
  heroClass: string; // CSS class for menu hero art
  requiredCampaign: CampaignId | null; // unlock gate
  endingIds: EndingId[];
  roomIds: RoomId[];
  wardenIntro: string;
}

/* ---------- Progress (per campaign, per slot) ---------- */

export interface RoomProgress {
  objectives: Record<string, boolean>;
  solvedPuzzles: Record<string, boolean>;
  collectedEvidence: string[];
  visited: boolean;
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

export interface CampaignProgress {
  currentRoomId: RoomId;
  completedRooms: RoomId[];
  unlockedRooms: RoomId[];
  roomProgress: Record<string, RoomProgress>;
  puzzleStates: Record<string, any>;
  inventory: string[];
  stats: GameStats;
  activeEnding?: EndingId;
  isCompleted: boolean;
}

/* ---------- Persistent Profile & Records (global, not per-slot) ---------- */

export interface PlayerProfile {
  callsign: string;
  playerId: string;
  createdAt: number;
  onboarded: boolean;
}

export interface AchievementUnlock {
  unlockedAt: number;
}

export interface CampaignBest {
  bestScore: number;
  bestRank: PlayerRank;
  bestTimeSeconds: number;
  completions: number;
  lastCompletedAt: number;
  endingsSeen: EndingId[];
}

export interface PlayerRecords {
  achievements: Record<string, AchievementUnlock>;
  campaignBests: Partial<Record<CampaignId, CampaignBest>>;
  xp: number;
  totalPuzzlesSolved: number;
  totalRoomsCompleted: number;
  totalEvidenceCollected: number;
  totalHintsUsed: number;
  totalPlaySeconds: number;
  campaignsCompleted: CampaignId[];
}

/* ---------- Settings ---------- */

export interface PlayerSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

/* ---------- Save Slot ---------- */

export interface SaveSlot {
  version: 2;
  savedAt: number;
  callsign: string;
  activeCampaignId: CampaignId | null;
  campaigns: Record<CampaignId, CampaignProgress>;
}

/* ---------- Achievement Definitions ---------- */

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  secret?: boolean;
}

/* ---------- Leaderboard (Supabase, optional) ---------- */

export interface LeaderboardEntry {
  callsign: string;
  campaignId: CampaignId;
  score: number;
  rank: PlayerRank;
  timeSeconds: number;
  hintsUsed: number;
  incorrectAttempts: number;
  ending: EndingId;
  createdAt: string;
}
