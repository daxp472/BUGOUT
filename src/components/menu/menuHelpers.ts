import { loadSlot, SAVE_SLOT_COUNT as SLOT_COUNT } from '../../services/storageService';
import { getCampaign } from '../../data/campaignsData';
import { ALL_ROOMS } from '../../data/gameData';
import { formatPlaytime } from '../../services/storageService';

export const SAVE_SLOT_COUNT = SLOT_COUNT;

export interface SlotInfo {
  savedAt: number;
  callsign: string;
  summary: string;
  detail: string;
}

/** Loads a slot and produces menu-friendly summary text, or null if empty. */
export const SAVE_SLOT_INFO = (index: number): SlotInfo | null => {
  const slot = loadSlot(index);
  if (!slot) return null;

  const active = slot.activeCampaignId ? getCampaign(slot.activeCampaignId) : null;
  const activeProgress = slot.activeCampaignId ? slot.campaigns[slot.activeCampaignId] : null;
  const room = activeProgress ? ALL_ROOMS[activeProgress.currentRoomId] : null;

  const completedCampaigns = Object.entries(slot.campaigns)
    .filter(([, p]) => p?.isCompleted)
    .map(([id]) => getCampaign(id as any).index);

  const playSeconds = Object.values(slot.campaigns).reduce((acc, c) => acc + (c?.stats?.elapsedSeconds ?? 0), 0);

  return {
    savedAt: slot.savedAt,
    callsign: slot.callsign,
    summary: active
      ? `${active.title}${room ? ` — ${room.name}` : ''}${activeProgress?.isCompleted ? ' (COMPLETED)' : ''}`
      : 'NO ACTIVE CAMPAIGN',
    detail:
      `${completedCampaigns.length > 0 ? `CLEARED: C${completedCampaigns.join(', C')}` : 'IN PROGRESS'}` +
      ` · ${formatPlaytime(playSeconds)} PLAYED`,
  };
};
