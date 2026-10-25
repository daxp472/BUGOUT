import { CampaignId, LeaderboardEntry } from '../types/game';
import { getSupabaseConfig } from './supabaseConfig';

/* ============================================================
   LEADERBOARD SERVICE — Supabase REST with graceful fallback.
   Never throws; callers receive [] or { ok:false } on failure.
   The game remains fully playable with no backend configured.
   ============================================================ */

const TABLE = 'leaderboard';

export const isLeaderboardConfigured = (): boolean => getSupabaseConfig() !== null;

const headers = (key: string) => ({
  'Content-Type': 'application/json',
  apikey: key,
  Authorization: `Bearer ${key}`,
  Prefer: 'return=minimal',
});

export interface SubmitResult {
  ok: boolean;
  online: boolean;
  message: string;
}

export const submitScore = async (entry: LeaderboardEntry): Promise<SubmitResult> => {
  const config = getSupabaseConfig();
  if (!config) {
    return { ok: false, online: false, message: 'Leaderboard not configured — score kept locally.' };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${config.url}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: headers(config.key),
      body: JSON.stringify([entry]),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { ok: false, online: true, message: `Leaderboard rejected entry (${res.status}).` };
    }
    return { ok: true, online: true, message: 'Score transmitted to the global board.' };
  } catch {
    return { ok: false, online: true, message: 'Uplink unavailable — score kept locally.' };
  }
};

export const fetchTopScores = async (campaignId: CampaignId, limit: number = 10): Promise<LeaderboardEntry[]> => {
  const config = getSupabaseConfig();
  if (!config) return [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const url =
      `${config.url}/rest/v1/${TABLE}?campaign_id=eq.${campaignId}` +
      `&order=score.desc&limit=${limit}&select=*`;
    const res = await fetch(url, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const rows = await res.json();
    return (rows as any[]).map((row) => ({
      callsign: row.callsign ?? 'OPERATOR',
      campaignId: row.campaign_id ?? campaignId,
      score: row.score ?? 0,
      rank: row.rank ?? 'Rookie',
      timeSeconds: row.time_seconds ?? 0,
      hintsUsed: row.hints_used ?? 0,
      incorrectAttempts: row.incorrect_attempts ?? 0,
      ending: row.ending ?? '',
      createdAt: row.created_at ?? '',
    }));
  } catch {
    return [];
  }
};

/** Where would this score place on the global board? Returns null if offline. */
export const fetchScorePercentile = async (campaignId: CampaignId, score: number): Promise<number | null> => {
  const config = getSupabaseConfig();
  if (!config) return null;
  try {
    const url = `${config.url}/rest/v1/rpc/leaderboard_percentile?campaign_id=${campaignId}&p_score=${score}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(config.key),
      body: '{}',
    });
    if (!res.ok) return null;
    const value = await res.json();
    return typeof value === 'number' ? value : null;
  } catch {
    return null;
  }
};
