import { CampaignId, RoomConfig, PuzzleDefinition, EvidenceItem, RoomId } from '../types/game';
import { ROOMS_CONFIG as C1_ROOMS, PUZZLES_DATA as C1_PUZZLES } from './roomsData';
import { EVIDENCE_ITEMS as C1_EVIDENCE } from './evidenceData';
import { GHOST_SIGNAL_ROOMS, GHOST_SIGNAL_PUZZLES, GHOST_SIGNAL_EVIDENCE } from './ghostSignalData';
import { ECHOES_ROOMS, ECHOES_PUZZLES, ECHOES_EVIDENCE } from './echoesData';

/* ============================================================
   UNIFIED GAME DATA — single lookup across all campaigns.
   ============================================================ */

export const ALL_ROOMS: Record<string, RoomConfig> = {
  ...C1_ROOMS,
  ...GHOST_SIGNAL_ROOMS,
  ...ECHOES_ROOMS,
} as Record<string, RoomConfig>;

export const ALL_PUZZLES: Record<string, PuzzleDefinition> = {
  ...C1_PUZZLES,
  ...GHOST_SIGNAL_PUZZLES,
  ...ECHOES_PUZZLES,
};

export const ALL_EVIDENCE: Record<string, EvidenceItem> = {
  ...C1_EVIDENCE,
  ...GHOST_SIGNAL_EVIDENCE,
  ...ECHOES_EVIDENCE,
};

export const getRoomsForCampaign = (campaignId: CampaignId): RoomConfig[] =>
  Object.values(ALL_ROOMS).filter((r) => r.campaignId === campaignId);

export const getRoom = (roomId: RoomId): RoomConfig => ALL_ROOMS[roomId];

export const getPuzzle = (puzzleId: string): PuzzleDefinition | undefined => ALL_PUZZLES[puzzleId];

export const countCampaignPuzzles = (campaignId: CampaignId): number =>
  Object.values(ALL_PUZZLES).filter((p) => p.campaignId === campaignId).length;

export const countCampaignEvidence = (campaignId: CampaignId): number =>
  Object.values(ALL_EVIDENCE).filter((e) => ALL_ROOMS[e.roomId]?.campaignId === campaignId).length;
