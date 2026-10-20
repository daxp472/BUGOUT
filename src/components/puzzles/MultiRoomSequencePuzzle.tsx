import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface MultiRoomSequencePuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const MultiRoomSequencePuzzle: React.FC<MultiRoomSequencePuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  // Sockets for Chamber 1, 2, 3
  const [slot1, setSlot1] = useState<string | null>(null);
  const [slot2, setSlot2] = useState<string | null>(null);
  const [slot3, setSlot3] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const availableTokens = [
    { id: 'TOKEN_7914', label: '7914', source: 'ROOM 01 // DRAWER OVERRIDE PIN', correctSlot: 1 },
    { id: 'TOKEN_SIGMA', label: 'SIGMA (Σ)', source: 'ROOM 02 // CRYO DIVERSION GLYPH', correctSlot: 2 },
    { id: 'TOKEN_884B', label: '884-B', source: 'ROOM 03 // RESTRICTED ARCHIVE ID', correctSlot: 3 },
    { id: 'TOKEN_DECOY1', label: '04:12', source: 'CRYO MAINTENANCE TIMESTAMP', correctSlot: 0 },
    { id: 'TOKEN_DECOY2', label: 'DELTA (Δ)', source: 'PHASE I CRYO TOKEN', correctSlot: 0 },
  ];

  const handlePlaceToken = (tokenLabel: string, slotNum: 1 | 2 | 3) => {
    audioEngine.playClick();
    if (slotNum === 1) setSlot1(tokenLabel);
    if (slotNum === 2) setSlot2(tokenLabel);
    if (slotNum === 3) setSlot3(tokenLabel);
  };

  const handleClearSlots = () => {
    audioEngine.playClick();
    setSlot1(null);
    setSlot2(null);
    setSlot3(null);
    setStatus('idle');
  };

  const handleVerify = () => {
    if (!slot1 || !slot2 || !slot3) return;
    audioEngine.playClick();

    if (slot1 === '7914' && slot2.includes('SIGMA') && slot3 === '884-B') {
      audioEngine.playSuccess();
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } else {
      audioEngine.playError();
      setStatus('error');
      if (onFail) onFail();
      setTimeout(() => {
        setStatus('idle');
      }, 1200);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel multi-token-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">SYNTHESIS ALTAR // CHAMBER HARMONICS</div>
          <h2 className="puzzle-title">CROSS-CHAMBER TOKEN ALIGNMENT</h2>
          <p className="puzzle-subtitle">
            INSERT THE VERIFIED ARTIFACT TOKENS RECOVERED FROM CHAMBERS 01, 02, AND 03 IN ORDER
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="token-puzzle-body">
          {/* Chamber Sockets */}
          <div className="chamber-sockets-row">
            {/* Slot 1 */}
            <div className={`socket-card ${slot1 ? 'filled' : ''}`}>
              <div className="socket-title">CHAMBER 01 TOKEN</div>
              <div className="socket-box">
                {slot1 ? (
                  <div className="placed-token-badge">
                    <span className="token-text">{slot1}</span>
                    <button className="remove-token-x" onClick={() => setSlot1(null)}>✕</button>
                  </div>
                ) : (
                  <span className="socket-empty-prompt">[DROP TOKEN 1]</span>
                )}
              </div>
            </div>

            {/* Slot 2 */}
            <div className={`socket-card ${slot2 ? 'filled' : ''}`}>
              <div className="socket-title">CHAMBER 02 TOKEN</div>
              <div className="socket-box">
                {slot2 ? (
                  <div className="placed-token-badge">
                    <span className="token-text">{slot2}</span>
                    <button className="remove-token-x" onClick={() => setSlot2(null)}>✕</button>
                  </div>
                ) : (
                  <span className="socket-empty-prompt">[DROP TOKEN 2]</span>
                )}
              </div>
            </div>

            {/* Slot 3 */}
            <div className={`socket-card ${slot3 ? 'filled' : ''}`}>
              <div className="socket-title">CHAMBER 03 TOKEN</div>
              <div className="socket-box">
                {slot3 ? (
                  <div className="placed-token-badge">
                    <span className="token-text">{slot3}</span>
                    <button className="remove-token-x" onClick={() => setSlot3(null)}>✕</button>
                  </div>
                ) : (
                  <span className="socket-empty-prompt">[DROP TOKEN 3]</span>
                )}
              </div>
            </div>
          </div>

          {/* Token Inventory Rack */}
          <div className="tokens-available-rack">
            <h3 className="section-label">AVAILABLE FACILITY TOKENS (CLICK TARGET SLOT):</h3>
            <div className="tokens-list">
              {availableTokens.map((t) => (
                <div key={t.id} className="token-inventory-item">
                  <div className="token-main-info">
                    <span className="token-code">{t.label}</span>
                    <span className="token-provenance">{t.source}</span>
                  </div>
                  <div className="token-assign-actions">
                    <button
                      className="assign-btn"
                      onClick={() => handlePlaceToken(t.label, 1)}
                      disabled={slot1 === t.label}
                    >
                      &rarr; SLOT 1
                    </button>
                    <button
                      className="assign-btn"
                      onClick={() => handlePlaceToken(t.label, 2)}
                      disabled={slot2 === t.label}
                    >
                      &rarr; SLOT 2
                    </button>
                    <button
                      className="assign-btn"
                      onClick={() => handlePlaceToken(t.label, 3)}
                      disabled={slot3 === t.label}
                    >
                      &rarr; SLOT 3
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {status === 'success' && (
            <div className="status-box success">
              ✓ CROSS-CHAMBER HARMONY ACHIEVED: 7914 &bull; SIGMA &bull; 884-B // SYNTHESIS COMPLETE
            </div>
          )}
          {status === 'error' && (
            <div className="status-box warning">
              ✕ INCORRECT SEQUENCE: CHECK CHAMBER PROVENANCE AND EVIDENCE RECORDS
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn secondary"
            onClick={handleClearSlots}
            disabled={!slot1 && !slot2 && !slot3}
          >
            CLEAR SLOTS
          </button>
          <button
            className="action-btn primary"
            onClick={handleVerify}
            disabled={!slot1 || !slot2 || !slot3 || status === 'success'}
          >
            {status === 'success' ? 'CHAMBERS SYNTHESIZED' : 'VERIFY HARMONIC ALIGNMENT [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
};
