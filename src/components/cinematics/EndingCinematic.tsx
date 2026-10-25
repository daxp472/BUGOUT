import React, { useEffect, useState } from 'react';
import { CampaignId, EndingId, GameStats } from '../../types/game';
import { ENDINGS, getCampaign } from '../../data/campaignsData';
import { calculateScoreAndRank } from '../../services/storageService';
import { submitScore, fetchScorePercentile, isLeaderboardConfigured } from '../../services/leaderboardService';
import { loadProfile } from '../../services/storageService';
import { audioEngine } from '../../services/audioEngine';

interface EndingCinematicProps {
  campaignId: CampaignId;
  endingId: EndingId;
  stats: GameStats;
  totalPuzzles: number;
  totalEvidence: number;
  onRestartCampaign: () => void;
  onReturnToMenu: () => void;
}

export const EndingCinematic: React.FC<EndingCinematicProps> = ({
  campaignId,
  endingId,
  stats,
  totalPuzzles,
  totalEvidence,
  onRestartCampaign,
  onReturnToMenu
}) => {
  const campaign = getCampaign(campaignId);
  const ending = ENDINGS[endingId] ?? ENDINGS.purge;
  const { finalScore, rank } = calculateScoreAndRank({
    roomsCompleted: campaign.roomIds.length,
    puzzlesSolved: stats.puzzlesSolved,
    incorrectAttempts: stats.incorrectAttempts,
    hintsUsed: stats.hintsUsed,
    evidenceCollected: stats.evidenceCollected.length,
    elapsedSeconds: stats.elapsedSeconds,
    totalPuzzles,
    totalRooms: campaign.roomIds.length,
    totalEvidence,
  });

  const [submitState, setSubmitState] = useState<{ submitted: boolean; message: string; percentile: number | null }>({
    submitted: false,
    message: '',
    percentile: null,
  });

  // Submit to global leaderboard once (if configured)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isLeaderboardConfigured()) {
        setSubmitState({ submitted: false, message: '', percentile: null });
        return;
      }
      const profile = loadProfile();
      const result = await submitScore({
        callsign: profile?.callsign ?? 'OPERATOR',
        campaignId,
        score: finalScore,
        rank,
        timeSeconds: stats.elapsedSeconds,
        hintsUsed: stats.hintsUsed,
        incorrectAttempts: stats.incorrectAttempts,
        ending: endingId,
        createdAt: new Date().toISOString(),
      });
      if (cancelled) return;
      const percentile = result.ok ? await fetchScorePercentile(campaignId, finalScore) : null;
      if (cancelled) return;
      setSubmitState({ submitted: result.ok, message: result.message, percentile });
    })();
    return () => { cancelled = true; };
  }, [campaignId, endingId, finalScore, rank, stats.elapsedSeconds, stats.hintsUsed, stats.incorrectAttempts]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className={`ending-cinematic-screen ${ending.themeClass}`}>
      <div className="ending-scanlines" />

      <div className="ending-content-card">
        <div className="ending-badge-line">{ending.badge}</div>
        <div className="ending-campaign-tag">{campaign.codename}: {campaign.title} — COMPLETE</div>
        <h1 className="ending-title">{ending.title}</h1>

        <div className="ending-narrative-box">
          <p className="ending-narrative-text">{ending.narrative}</p>
        </div>

        {/* Campaign Score & Assessment Dossier */}
        <div className="score-summary-dossier">
          <div className="dossier-headline">CANDIDATE FINAL EVALUATION SUMMARY</div>

          <div className="dossier-metrics-grid">
            <div className="metric-box">
              <span className="m-label">FINAL SCORE:</span>
              <span className="m-val highlight">{finalScore.toLocaleString()} PTS</span>
            </div>
            <div className="metric-box">
              <span className="m-label">AGENT RANK:</span>
              <span className="m-val rank-pill">{rank.toUpperCase()}</span>
            </div>
            <div className="metric-box">
              <span className="m-label">TIME ELAPSED:</span>
              <span className="m-val">{formatTime(stats.elapsedSeconds)}</span>
            </div>
            <div className="metric-box">
              <span className="m-label">HINTS USED:</span>
              <span className="m-val">{stats.hintsUsed}</span>
            </div>
            <div className="metric-box">
              <span className="m-label">EVIDENCE LOGGED:</span>
              <span className="m-val">{stats.evidenceCollected.length} / {totalEvidence}</span>
            </div>
            <div className="metric-box">
              <span className="m-label">ERRORS / RETRIES:</span>
              <span className="m-val">{stats.incorrectAttempts}</span>
            </div>
          </div>

          {submitState.submitted && (
            <div className="leaderboard-submit-note">
              ▲ {submitState.message}
              {submitState.percentile != null && ` — TOP ${submitState.percentile}% GLOBALLY`}
            </div>
          )}
        </div>

        {/* Post-Credits Secret Lore Teaser */}
        <div className="post-credits-teaser">
          <span className="teaser-label">&gt; INCOMING ENCRYPTED TELEMETRY TRACE [POST-CREDIT]:</span>
          <p className="teaser-text">
            {campaignId === 'c1_last_protocol' &&
              '"Transmission intercepted from Satellite Relay 09: \'Subject 07 has completed the trial. Prepare Chambers 06 through 10 for Candidate 08.\' — TRANSMISSION TERMINATED."'}
            {campaignId === 'c2_ghost_signal' &&
              '"Packet fragment decoded: \'If Candidate 08 is reading this, the relays held. The Archive below still remembers all of us. — S-07\' — SIGNAL SOURCE: SUBLEVEL 7."'}
            {campaignId === 'c3_echoes' &&
              '"Registry anomaly appended: \'Candidate 09 recorded outside all predicted branches. Archive accepts new author.\' — END OF KNOWN RECORD."'}
          </p>
        </div>

        <div className="ending-actions-row">
          <button
            className="action-btn primary large"
            onClick={() => {
              audioEngine.playClick();
              onRestartCampaign();
            }}
          >
            REPLAY {campaign.title.toUpperCase()}
          </button>
          <button
            className="action-btn secondary large"
            onClick={() => {
              audioEngine.playClick();
              onReturnToMenu();
            }}
          >
            RETURN TO OPERATIONS
          </button>
        </div>
      </div>
    </div>
  );
};
