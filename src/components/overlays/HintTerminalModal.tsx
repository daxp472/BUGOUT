import React, { useState } from 'react';
import { RoomId } from '../../types/game';
import { ROOMS_CONFIG, PUZZLES_DATA } from '../../data/roomsData';
import { audioEngine } from '../../services/audioEngine';

interface HintTerminalModalProps {
  currentRoomId: RoomId;
  activePuzzleId?: string | null;
  onUseHint: () => void;
  onClose: () => void;
}

export const HintTerminalModal: React.FC<HintTerminalModalProps> = ({
  currentRoomId,
  activePuzzleId,
  onUseHint,
  onClose
}) => {
  const roomConfig = ROOMS_CONFIG[currentRoomId];
  
  // Find relevant puzzle
  const puzzle = activePuzzleId
    ? PUZZLES_DATA[activePuzzleId]
    : Object.values(PUZZLES_DATA).find((p) => p.roomId === currentRoomId);

  const [hintTier, setHintTier] = useState<number>(1);

  const handleNextTier = () => {
    if (hintTier < 3) {
      audioEngine.playWardenVoice();
      setHintTier((prev) => prev + 1);
      onUseHint();
    }
  };

  const getHintText = (tier: number) => {
    if (!puzzle) return 'WARDEN: "Observe your surroundings closely. Environmental anomalies contain systematic patterns."';
    return puzzle.hints[tier - 1] || puzzle.hints[0];
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel warden-hint-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge alert">WARDEN AI REASONING CHANNEL // CONTEXT LEVEL {hintTier}</div>
          <h2 className="puzzle-title">COGNITIVE ASSISTANCE PROTOCOL</h2>
          <p className="puzzle-subtitle">
            DIAGNOSTIC GUIDANCE FOR {roomConfig.name.toUpperCase()} [H / ESC TO CLOSE]
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="warden-terminal-body">
          <div className="warden-ai-avatar">
            <div className="ai-waveform">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </div>
            <span className="warden-label">WARDEN DIRECTIVE INTELLIGENCE</span>
          </div>

          <div className="hint-teletype-box">
            <div className="teletype-meta">
              <span>TARGET PUZZLE: {puzzle ? puzzle.title : 'CHAMBER OBSERVATION'}</span>
              <span className="teletype-tier">PROGRESSIVE TIER: {hintTier} / 3</span>
            </div>

            <div className="teletype-content">
              <p className="hint-paragraph">
                &gt; {getHintText(hintTier)}
              </p>
            </div>
          </div>

          <div className="hint-tier-indicators">
            <div className={`tier-step ${hintTier >= 1 ? 'revealed' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">SUBTLE NUDGE</span>
            </div>
            <div className={`tier-step ${hintTier >= 2 ? 'revealed' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">LOGICAL CORRELATION</span>
            </div>
            <div className={`tier-step ${hintTier >= 3 ? 'revealed' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">DIRECT REASONING</span>
            </div>
          </div>
        </div>

        <div className="puzzle-footer">
          {hintTier < 3 ? (
            <button className="action-btn warning" onClick={handleNextTier}>
              REQUEST DEEPER HINT (TIER {hintTier + 1}) [-250 PTS]
            </button>
          ) : (
            <span className="max-hint-note">MAXIMUM HINT TIER REACHED</span>
          )}
          <button className="action-btn secondary" onClick={onClose}>
            RETURN TO CHAMBER [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
