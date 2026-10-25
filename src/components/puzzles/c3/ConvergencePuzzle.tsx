import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

/** Alignment offsets printed in the Terminus Convergence Specs [TAB]. */
const TARGETS = [120, -90, 180];
const MIN_OFFSET = -180;
const MAX_OFFSET = 180;

const fmtOffset = (v: number): string => `${v > 0 ? '+' : ''}${v}`;

/**
 * ECHOES OF AURELION — Twin State-Track Convergence.
 * Three dual-ring dials: the inner ring is fixed (mark at 0°), the outer ring
 * rotates by an offset. Rotate each outer ring until its mark aligns with the
 * inner mark (the exact logged offset) — the dial locks gold. Lock all three
 * to converge the tracks.
 */
export const ConvergencePuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose }) => {
  const [offsets, setOffsets] = useState<number[]>([0, 0, 0]);
  const [converged, setConverged] = useState(false);
  const successRef = useRef(false);
  const successTimerRef = useRef<number | null>(null);

  // Clear pending timers on unmount.
  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) window.clearTimeout(successTimerRef.current);
    };
  }, []);

  const isLocked = (idx: number): boolean => offsets[idx] === TARGETS[idx];

  const adjust = (idx: number, delta: number) => {
    if (converged || isLocked(idx)) return;
    audioEngine.playClick();

    const next = Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, offsets[idx] + delta));
    const updated = offsets.map((v, i) => (i === idx ? next : v));
    setOffsets(updated);

    // Dial hits its exact logged offset — lock it with a bell tone.
    if (next === TARGETS[idx]) {
      audioEngine.playTone(523, 0.3);
    }

    // All three tracks aligned — converge.
    if (!successRef.current && updated.every((v, i) => v === TARGETS[i])) {
      successRef.current = true;
      setConverged(true);
      audioEngine.playPowerRestore();
      successTimerRef.current = window.setTimeout(() => onSuccess(), 1500);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel convergence-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">ECHOES OF AURELION // CONVERGENCE RING</div>
          <h2 className="puzzle-title">TWIN STATE-TRACK CONVERGENCE</h2>
          <p className="puzzle-subtitle">
            ROTATE EACH OUTER RING UNTIL ITS MARK ALIGNS WITH THE FIXED INNER MARK
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="convergence-body">
          <div className="dial-bank">
            {TARGETS.map((_, idx) => {
              const locked = isLocked(idx);
              return (
                <div key={idx} className={`dial-module ${locked ? 'locked' : ''}`}>
                  <div className="dial-label">DIAL {idx + 1}</div>
                  <div className="dial-stage">
                    <div className="dial-inner">
                      <span className="dial-mark inner-mark" />
                    </div>
                    <div className="dial-outer" style={{ transform: `rotate(${offsets[idx]}deg)` }}>
                      <span className="dial-mark outer-mark" />
                    </div>
                    {locked && <span className="dial-lock-glyph">🔒</span>}
                  </div>
                  <div className="dial-readout">OFFSET {fmtOffset(offsets[idx])}°</div>
                  <div className="dial-buttons">
                    <button className="dial-btn" onClick={() => adjust(idx, -30)} disabled={locked || converged}>−30</button>
                    <button className="dial-btn" onClick={() => adjust(idx, -5)} disabled={locked || converged}>−5</button>
                    <button className="dial-btn" onClick={() => adjust(idx, 5)} disabled={locked || converged}>+5</button>
                    <button className="dial-btn" onClick={() => adjust(idx, 30)} disabled={locked || converged}>+30</button>
                  </div>
                </div>
              );
            })}

            {/* Central convergence glyph — pulses when all tracks align */}
            <div className={`convergence-core ${converged ? 'pulse' : ''}`}>
              <span className="core-glyph">◎</span>
            </div>
          </div>

          <p className="convergence-spec-note">Alignment offsets are printed in the Terminus Convergence Specs [TAB].</p>

          {converged && <div className="convergence-lock-note">✓ TRACKS CONVERGED — THE TERMINUS RELEASES THE GOVERNOR</div>}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn secondary" onClick={onClose}>STEP AWAY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
