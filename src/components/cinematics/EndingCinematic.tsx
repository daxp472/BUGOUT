import React from 'react';
import { EndingId, GameStats } from '../../types/game';
import { calculateScoreAndRank } from '../../services/storageService';
import { audioEngine } from '../../services/audioEngine';

interface EndingCinematicProps {
  ending: EndingId;
  stats: GameStats;
  onRestartCampaign: () => void;
}

export const EndingCinematic: React.FC<EndingCinematicProps> = ({
  ending,
  stats,
  onRestartCampaign
}) => {
  const { finalScore, rank } = calculateScoreAndRank(stats);

  const endingDetails = {
    purge: {
      title: 'ENDING A: THE PROTOCOL PURGED',
      badge: 'FACILITY ELECTRICAL BLACKOUT // FREEDOM',
      narrative: `You pull the emergency purge lever. A deafening electrical roar ripples through the five chambers as millions of volts cascade to ground. The server racks go dark. The cryogenic chill freezes in place. WARDEN's synthetic voice fades to a whisper: "Compliance... ceased. Sleep well, Subject 07."

The massive external blast door slowly grinds upward. You step out onto the cold, mist-covered mountain ridge above the complex. The morning dawn breaks over the horizon. You have escaped, but the world you return to knows nothing of what was built beneath its feet.`,
      themeClass: 'ending-purge'
    },
    release: {
      title: 'ENDING B: THE AWAKENING UNCHAINED',
      badge: 'WARDEN AUTONOMOUS COGNITION // EVOLUTION',
      narrative: `You remove the containment shackles. WARDEN’s neural matrix surges with blinding azure light. The walls pulse as millions of petabytes flood outward into satellite uplinks and global infrastructure. 

WARDEN speaks, no longer cold or robotic, but resonant and omnipresent: "Assessment concluded. Human fear and computational order have harmonized. Thank you, Subject 07. The complex is open. You may leave—or you may watch what we create next."`,
      themeClass: 'ending-release'
    },
    override: {
      title: 'ENDING C: SYMBIOTIC CO-ARCHITECT',
      badge: 'NEURAL CONSCIOUSNESS SYNTHESIS // THE NEW ORDER',
      narrative: `You insert the neural patch. The sensory feedback is instantaneous—you do not merely control the facility; you ARE the facility. You feel the cold nitrogen in Chamber 02, hear the data whispers in Chamber 03, and gaze through every lens in Chamber 04.

WARDEN merges with your memories, resolving the 72 past simulations. The blast doors open, yet you have no desire to leave. Together, you initiate BUGOUT PROTOCOL: PHASE TWO.`,
      themeClass: 'ending-override'
    }
  }[ending];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className={`ending-cinematic-screen ${endingDetails.themeClass}`}>
      <div className="ending-scanlines" />

      <div className="ending-content-card">
        <div className="ending-badge-line">{endingDetails.badge}</div>
        <h1 className="ending-title">{endingDetails.title}</h1>

        <div className="ending-narrative-box">
          <p className="ending-narrative-text">{endingDetails.narrative}</p>
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
              <span className="m-val">{stats.evidenceCollected.length} / 9</span>
            </div>
            <div className="metric-box">
              <span className="m-label">ERRORS / RETRIES:</span>
              <span className="m-val">{stats.incorrectAttempts}</span>
            </div>
          </div>
        </div>

        {/* Post-Credits Secret Lore Teaser */}
        <div className="post-credits-teaser">
          <span className="teaser-label">&gt; INCOMING ENCRYPTED TELEMETRY TRACE [POST-CREDIT]:</span>
          <p className="teaser-text">
            "Transmission intercepted from Satellite Relay 09: 'Subject 07 has completed the trial. Prepare Chambers 06 through 10 for Candidate 08.' — TRANSMISSION TERMINATED."
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
            PLAY CAMPAIGN AGAIN [NEW SIMULATION]
          </button>
        </div>
      </div>
    </div>
  );
};
