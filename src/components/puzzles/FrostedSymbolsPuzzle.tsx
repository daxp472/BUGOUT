import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface FrostedSymbolsPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const FrostedSymbolsPuzzle: React.FC<FrostedSymbolsPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  // Frost wipe coverage for each of the 4 panels (0 to 100%)
  const [wiped, setWiped] = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false]);
  
  // Selection sequence
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const symbols = [
    { id: 'DELTA', glyph: 'Δ', label: 'PHASE I: DELTA (COMPRESSION)', order: 0 },
    { id: 'SIGMA', glyph: 'Σ', label: 'PHASE II: SIGMA (DIVERSION)', order: 1 },
    { id: 'OMEGA', glyph: 'Ω', label: 'PHASE III: OMEGA (SEAL)', order: 2 },
    { id: 'THETA', glyph: 'Θ', label: 'PHASE IV: THETA (PURGE)', order: 3 },
  ];

  const wipePanel = (idx: number) => {
    if (!wiped[idx]) {
      audioEngine.playValve();
      const next: [boolean, boolean, boolean, boolean] = [...wiped];
      next[idx] = true;
      setWiped(next);
    }
  };

  const handleSelectGlyph = (id: string) => {
    if (status !== 'idle' || selectedSequence.includes(id)) return;
    audioEngine.playKeypad(id);
    const nextSeq = [...selectedSequence, id];
    setSelectedSequence(nextSeq);

    if (nextSeq.length === 4) {
      // Validate sequence: DELTA, SIGMA, OMEGA, THETA
      if (nextSeq[0] === 'DELTA' && nextSeq[1] === 'SIGMA' && nextSeq[2] === 'OMEGA' && nextSeq[3] === 'THETA') {
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
          setSelectedSequence([]);
          setStatus('idle');
        }, 1200);
      }
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel frosted-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">CRYO-METRICS // OBSERVATION GLASS</div>
          <h2 className="puzzle-title">FROSTED CHAMBER GLYPH RECONSTRUCTION</h2>
          <p className="puzzle-subtitle">
            WIPE FROSTED PANELS TO REVEAL CRYOGRAMS, THEN ENTER THEM IN CHRONOLOGICAL PHASE ORDER
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="frost-puzzle-body">
          {/* 4 Frosted Windows */}
          <div className="frosted-windows-grid">
            {symbols.map((sym, idx) => (
              <div
                key={sym.id}
                className={`frosted-window-box ${wiped[idx] ? 'defrosted' : 'frost-covered'}`}
                onClick={() => wipePanel(idx)}
              >
                {!wiped[idx] ? (
                  <div className="frost-overlay">
                    <span className="frost-icon">❄</span>
                    <span className="wipe-prompt">[CLICK TO DEFROST]</span>
                  </div>
                ) : (
                  <div className="revealed-symbol-card">
                    <span className="glyph-large">{sym.glyph}</span>
                    <span className="glyph-name">{sym.id}</span>
                    <button
                      className={`select-glyph-btn ${selectedSequence.includes(sym.id) ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectGlyph(sym.id);
                      }}
                      disabled={selectedSequence.includes(sym.id) || status !== 'idle'}
                    >
                      {selectedSequence.includes(sym.id) ? 'LOGGED' : 'SELECT GLYPH'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sequence Tracker */}
          <div className="sequence-tray">
            <h3 className="section-label">INPUTTED SEQUENCE:</h3>
            <div className="sequence-slots">
              {[0, 1, 2, 3].map((slotIdx) => {
                const symId = selectedSequence[slotIdx];
                const symObj = symbols.find((s) => s.id === symId);
                return (
                  <div key={slotIdx} className={`seq-slot ${symObj ? 'filled' : ''} ${status}`}>
                    {symObj ? (
                      <div className="slot-content">
                        <span className="slot-glyph">{symObj.glyph}</span>
                        <span className="slot-id">{symObj.id}</span>
                      </div>
                    ) : (
                      <span className="slot-empty">PHASE {slotIdx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {status === 'success' && (
              <div className="status-box success">
                ✓ CRYOGENIC SEQUENCE CONFIRMED: Δ → Σ → Ω → Θ // BYPASS TOKEN GRANTED
              </div>
            )}
            {status === 'error' && (
              <div className="status-box warning">
                ⚠ INVALID SEQUENCE DETECTED // RESETTING INPUTS
              </div>
            )}
          </div>
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn secondary"
            onClick={() => {
              audioEngine.playClick();
              setSelectedSequence([]);
            }}
            disabled={status !== 'idle' || selectedSequence.length === 0}
          >
            CLEAR SELECTIONS
          </button>
        </div>
      </div>
    </div>
  );
};
