import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

const TARGET_MHZ = 104.7;
const TOLERANCE = 0.2;
const MIN_MHZ = 88;
const MAX_MHZ = 108;

/**
 * GHOST SIGNAL — Carrier Frequency Lock.
 * Rotate the coarse dial and fine trim until the receiver resonates
 * with the ghost carrier (resonance meter peaks, waveform steadies).
 */
export const FrequencyTuningPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [freq, setFreq] = useState(96.0);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<'scanning' | 'failed' | 'locked'>('scanning');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const freqRef = useRef(freq);
  freqRef.current = freq;

  const proximity = 1 - Math.min(1, Math.abs(freq - TARGET_MHZ) / 8); // 0..1
  const resonance = Math.round(proximity * 100);

  // Animated waveform whose coherence follows proximity
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // grid
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 24) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 24) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      const noise = (1 - proximity) * 26;
      const cycles = 2 + proximity * 3;
      ctx.beginPath();
      ctx.strokeStyle = proximity > 0.92 ? '#4ade80' : '#f59e0b';
      ctx.lineWidth = 2;
      for (let x = 0; x <= w; x += 2) {
        const ph = (x / w) * Math.PI * 2 * cycles + t;
        const clean = Math.sin(ph) * (h * 0.28);
        const staticNoise = (Math.random() - 0.5) * noise;
        const y = h / 2 + clean + staticNoise;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      t += 0.08 + proximity * 0.02;
      rafRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(rafRef.current);
  }, [proximity]);

  const adjust = (delta: number) => {
    if (locked) return;
    setFreq((f) => Math.max(MIN_MHZ, Math.min(MAX_MHZ, Math.round((f + delta) * 10) / 10)));
    audioEngine.playTuningSweep(400 + proximity * 600, 400 + proximity * 600 + delta * 30, 0.12);
  };

  const attemptLock = () => {
    if (locked) return;
    if (Math.abs(freq - TARGET_MHZ) <= TOLERANCE) {
      audioEngine.playTone(1046, 0.4);
      setTimeout(() => audioEngine.playSuccess(), 300);
      setStatus('locked');
      setLocked(true);
      setTimeout(() => onSuccess(), 1400);
    } else {
      audioEngine.playStatic(0.4);
      audioEngine.playError();
      setStatus('failed');
      onFail?.();
      setTimeout(() => setStatus('scanning'), 1200);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel tuning-rack-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">GHOST SIGNAL // COLD-CATHODE TUNING RACK</div>
          <h2 className="puzzle-title">CARRIER FREQUENCY LOCK</h2>
          <p className="puzzle-subtitle">
            ROTATE THE DIAL UNTIL THE RECEIVER RESONATES WITH THE GHOST CARRIER — LOCK WITHIN ±0.2 MHz
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="tuning-body">
          <div className="tuning-wave-window">
            <canvas ref={canvasRef} width={520} height={140} className="tuning-canvas" />
            <div className="tuning-readout">
              <span className="readout-freq">{freq.toFixed(1)} MHz</span>
              <span className={`readout-resonance ${resonance > 92 ? 'hot' : ''}`}>RESONANCE {resonance}%</span>
            </div>
          </div>

          {/* Resonance meter */}
          <div className="resonance-meter">
            <div className="resonance-fill" style={{ width: `${resonance}%`, background: resonance > 92 ? '#4ade80' : '#f59e0b' }} />
            <div className="resonance-target-zone" />
          </div>

          {/* Coarse + fine controls */}
          <div className="tuning-controls">
            <div className="dial-cluster">
              <span className="dial-label">COARSE TUNE</span>
              <div className="dial-buttons">
                <button className="dial-btn" onClick={() => adjust(-1)} disabled={locked}>−1.0</button>
                <button className="dial-btn" onClick={() => adjust(-0.5)} disabled={locked}>−0.5</button>
                <div className="dial-knob" style={{ transform: `rotate(${(freq - MIN_MHZ) * 18}deg)` }}>
                  <span className="dial-marker" />
                </div>
                <button className="dial-btn" onClick={() => adjust(0.5)} disabled={locked}>+0.5</button>
                <button className="dial-btn" onClick={() => adjust(1)} disabled={locked}>+1.0</button>
              </div>
            </div>
            <div className="dial-cluster">
              <span className="dial-label">FINE TRIM</span>
              <div className="dial-buttons">
                <button className="dial-btn small" onClick={() => adjust(-0.1)} disabled={locked}>−0.1</button>
                <button className="dial-btn small" onClick={() => adjust(0.1)} disabled={locked}>+0.1</button>
              </div>
            </div>
          </div>

          {status === 'failed' && (
            <div className="tuning-fault-note">✕ LOCK REJECTED — CARRIER NOT PRESENT AT {freq.toFixed(1)} MHz. LISTEN FOR THE RESONANCE PEAK.</div>
          )}
          {status === 'locked' && (
            <div className="tuning-lock-note">✓ CARRIER LOCKED — GHOST SIGNAL ACQUIRED AT {TARGET_MHZ} MHz</div>
          )}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn primary" onClick={attemptLock} disabled={locked}>
            {locked ? 'CARRIER LOCKED' : 'ATTEMPT LOCK [CHECK]'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
