import React, { useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

const CORRECT_ORDER = [
  { id: 'interlocks', label: 'RELEASE INTERLOCKS', desc: 'Disengage safety chain on the breaker bank' },
  { id: 'generators', label: 'SPOOL GENERATORS', desc: 'Bring the three diesel units to sync speed' },
  { id: 'modulator', label: 'CHARGE MODULATOR', desc: 'Energize the carrier modulation stage' },
  { id: 'waveguide', label: 'PRESSURIZE WAVEGUIDE', desc: 'Purge and pressurize the feed conduit' },
  { id: 'antenna', label: 'ENERGIZE ANTENNA', desc: 'Apply full RF power to the array feed' },
];

const SHUFFLED_DISPLAY = [CORRECT_ORDER[2], CORRECT_ORDER[0], CORRECT_ORDER[4], CORRECT_ORDER[1], CORRECT_ORDER[3]];

/**
 * GHOST SIGNAL — Broadcast Power Uplink Sequence.
 * Slot the five boot steps into the correct order or trip the breaker bank.
 */
export const UplinkSequencePuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [chain, setChain] = useState<string[]>([]);
  const [trip, setTrip] = useState(false);
  const [cascading, setCascading] = useState(false);
  const [complete, setComplete] = useState(false);

  const remaining = SHUFFLED_DISPLAY.filter((s) => !chain.includes(s.id));

  const addStep = (id: string) => {
    if (chain.length >= 5 || trip || cascading || complete) return;
    audioEngine.playSwitch();
    setChain((prev) => [...prev, id]);
  };

  const removeStep = (id: string) => {
    if (trip || cascading || complete) return;
    audioEngine.playClick();
    setChain((prev) => prev.filter((c) => c !== id));
  };

  const attemptUplink = () => {
    if (chain.length !== 5 || cascading || complete) return;
    const correct = chain.every((id, idx) => id === CORRECT_ORDER[idx].id);
    if (correct) {
      setCascading(true);
      chain.forEach((_, i) => {
        setTimeout(() => audioEngine.playSwitch(), i * 120);
      });
      setTimeout(() => {
        audioEngine.playPowerRestore();
        setComplete(true);
      }, 700);
      setTimeout(() => onSuccess(), 1700);
    } else {
      audioEngine.playError();
      audioEngine.playStatic(0.5);
      onFail?.();
      setTrip(true);
      setTimeout(() => {
        setTrip(false);
        setChain([]);
      }, 1000);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel uplink-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">GHOST SIGNAL // UPLINK CONSOLE</div>
          <h2 className="puzzle-title">BROADCAST POWER UPLINK SEQUENCE</h2>
          <p className="puzzle-subtitle">SLOT THE FIVE BOOT STEPS IN THE CORRECT ORDER — A WRONG ORDER TRIPS THE BREAKERS</p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="uplink-body">
          {/* Boot chain slots */}
          <div className={`uplink-chain ${trip ? 'tripped' : ''} ${complete ? 'complete' : ''}`}>
            {CORRECT_ORDER.map((step, idx) => {
              const slottedId = chain[idx];
              const slotted = slottedId ? CORRECT_ORDER.find((s) => s.id === slottedId) : null;
              return (
                <div
                  key={idx}
                  className={`uplink-slot ${slotted ? 'filled' : ''} ${cascading ? 'cascaded' : ''} ${trip ? 'trip-flash' : ''}`}
                  style={{ animationDelay: `${idx * 0.12}s` }}
                  onClick={() => slotted && removeStep(slottedId!)}
                  role={slotted ? 'button' : undefined}
                >
                  <span className="slot-index">{idx + 1}</span>
                  {slotted ? (
                    <div className="slot-content">
                      <span className="slot-label">{slotted.label}</span>
                      <span className="slot-desc">{slotted.desc}</span>
                    </div>
                  ) : (
                    <span className="slot-empty">AWAITING STEP</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Available steps */}
          <div className="uplink-pool">
            <h3 className="section-label">AVAILABLE UPLINK STEPS — CLICK IN BOOT ORDER:</h3>
            <div className="uplink-steps">
              {remaining.map((step) => (
                <button key={step.id} className="uplink-step-card" onClick={() => addStep(step.id)} disabled={cascading || complete}>
                  <span className="step-label">{step.label}</span>
                  <span className="step-desc">{step.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {trip && <div className="tuning-fault-note">✕ BREAKER BANK TRIPPED — SEQUENCE INVALID, CHAIN CLEARED</div>}
          {complete && <div className="tuning-lock-note">✓ UPLINK AT FULL BROADCAST POWER — BUFFER ARMED</div>}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn primary" onClick={attemptUplink} disabled={chain.length !== 5 || cascading || complete || trip}>
            {complete ? 'UPLINK LIVE' : 'SEQUENCE UPLINK'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
