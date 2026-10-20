import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface MasterProtocolPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const MasterProtocolPuzzle: React.FC<MasterProtocolPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const tokenChips = [
    { label: '7914', desc: 'RM01 KEYPAD' },
    { label: 'SIGMA', desc: 'RM02 CRYO' },
    { label: '884B', desc: 'RM03 ARCHIVE' },
    { label: '07', desc: 'RM04 SUBJECT' }
  ];

  const handleChipClick = (label: string) => {
    audioEngine.playKeypad(label);
    setInputVal((prev) => (prev ? `${prev}-${label}` : label));
  };

  const handleClear = () => {
    audioEngine.playClick();
    setInputVal('');
    setStatus('idle');
    setErrorMsg('');
  };

  const handleVerify = () => {
    if (!inputVal) return;
    audioEngine.playClick();

    // Clean comparison: 7914-SIGMA-884B-07 or 7914-SIGMA-884-B-07
    const normalized = inputVal.toUpperCase().replace(/\s+/g, '').replace(/884-B/g, '884B');

    if (normalized === '7914-SIGMA-884B-07' || normalized === '7914-SIGMA-884-B-07') {
      audioEngine.playSuccess();
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } else {
      audioEngine.playError();
      setStatus('error');
      setErrorMsg('PROTOCOL CHECKSUM REJECTED // INVALID CROSS-CHAMBER TOKEN STREAM');
      if (onFail) onFail();
      setTimeout(() => {
        setStatus('idle');
      }, 1500);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel master-protocol-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">FACILITY CORE // MASTER AUTH GATEWAY</div>
          <h2 className="puzzle-title">MASTER PROTOCOL VERIFICATION</h2>
          <p className="puzzle-subtitle">
            SUBMIT SYNTHESIZED MASTER TOKEN SEQUENCE FROM EVIDENCE COLLECTED ACROSS ALL FOUR CHAMBERS
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="master-puzzle-body">
          <div className="protocol-format-hint">
            REQUIRED SPECIFICATION FORMAT: <span className="format-code">[RM01-PIN]-[CRYO-TOKEN]-[VAULT-ID]-[SUB-ID]</span>
          </div>

          {/* Master Input Display */}
          <div className="master-input-container">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value.toUpperCase())}
              placeholder="e.g. 7914-SIGMA-884B-07"
              className={`master-protocol-input ${status}`}
              disabled={status === 'success'}
            />
            <button className="clear-input-btn" onClick={handleClear} disabled={status === 'success'}>
              CLEAR
            </button>
          </div>

          {errorMsg && <div className="keypad-error-msg">{errorMsg}</div>}
          {status === 'success' && (
            <div className="status-box success">
              ✓ MASTER PROTOCOL AUTHENTICATED // WARDEN DIRECTIVE CORE UNLOCKED
            </div>
          )}

          {/* Token Quick-Insert Chips */}
          <div className="token-chips-tray">
            <span className="tray-label">DISCOVERED DOSSIER TOKENS (CLICK TO APPEND):</span>
            <div className="chips-grid">
              {tokenChips.map((chip) => (
                <button
                  key={chip.label}
                  className="token-chip-btn"
                  onClick={() => handleChipClick(chip.label)}
                  disabled={status === 'success'}
                >
                  <span className="chip-code">{chip.label}</span>
                  <span className="chip-origin">{chip.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn primary"
            onClick={handleVerify}
            disabled={!inputVal || status === 'success'}
          >
            {status === 'success' ? 'DIRECTIVE UNLOCKED' : 'SUBMIT MASTER AUTHORIZATION [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
};
