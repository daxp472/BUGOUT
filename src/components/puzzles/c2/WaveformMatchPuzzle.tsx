import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

const TARGET_FREQ = 3;
const TARGET_AMP = 70;
const TARGET_PHASE = 90;
const AMP_TOLERANCE = 5;
const PHASE_TOLERANCE = 5;

interface WaveValues {
  freq: number;
  amp: number;
  phase: number;
}

const phaseRad = (phaseDeg: number) => (phaseDeg * Math.PI) / 180;

/**
 * GHOST SIGNAL — Ghost Waveform Match (Room 07 Oscilloscope Bank).
 * Drive the green live trace onto the amber ghost trace:
 * match cycle count, height, then slide phase. Ghost reference lives
 * in the Signal Analysis Dossier [TAB]: 3 cycles / 70% / 90°.
 */
export const WaveformMatchPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [freq, setFreq] = useState(5);
  const [amp, setAmp] = useState(45);
  const [phase, setPhase] = useState(0);
  const [status, setStatus] = useState<'live' | 'failed' | 'locked'>('live');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);
  const lockedRef = useRef(false);
  const liveRef = useRef<WaveValues>({ freq, amp, phase });
  liveRef.current = { freq, amp, phase };
  const timeoutsRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  const drawTrace = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    values: WaveValues,
    t: number,
    color: string,
    lineWidth: number
  ) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    for (let x = 0; x <= w; x += 2) {
      const y =
        h / 2 +
        Math.sin((x / w) * Math.PI * 2 * values.freq + phaseRad(values.phase) + t) *
          (values.amp / 100) *
          h *
          0.35;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const drawScene = (live: WaveValues, t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.12)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 26) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 26) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }
    // center reference line
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

    // amber ghost reference trace (fixed target values)
    drawTrace(ctx, w, h, { freq: TARGET_FREQ, amp: TARGET_AMP, phase: TARGET_PHASE }, t, '#f59e0b', 2);
    // green live trace (current slider values)
    drawTrace(ctx, w, h, live, t, status === 'locked' ? '#4ade80' : '#34d399', 2);
  };

  // Animated dual-trace scope
  useEffect(() => {
    const render = () => {
      drawScene(liveRef.current, tRef.current);
      if (!lockedRef.current) {
        tRef.current += 0.055;
        rafRef.current = requestAnimationFrame(render);
      }
    };
    render();
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onSliderChange = (which: 'freq' | 'amp' | 'phase', value: number) => {
    if (status === 'locked') return;
    if (which === 'freq') {
      setFreq(value);
      audioEngine.playTone(180 * value, 0.06, 'triangle');
    } else if (which === 'amp') {
      setAmp(value);
      audioEngine.playTone(200 + value * 6, 0.05, 'sine');
    } else {
      setPhase(value);
      audioEngine.playTone(260 + value * 2, 0.05, 'sine');
    }
  };

  const attemptSyncLock = () => {
    if (status === 'locked') return;
    const coherent =
      freq === TARGET_FREQ &&
      Math.abs(amp - TARGET_AMP) <= AMP_TOLERANCE &&
      Math.abs(phase - TARGET_PHASE) <= PHASE_TOLERANCE;
    if (coherent) {
      lockedRef.current = true;
      setStatus('locked');
      cancelAnimationFrame(rafRef.current);
      // snap the live trace onto the ghost for a perfect overlap freeze-frame
      drawScene({ freq: TARGET_FREQ, amp: TARGET_AMP, phase: TARGET_PHASE }, tRef.current);
      audioEngine.playTone(880, 0.25);
      later(() => audioEngine.playSuccess(), 280);
      later(() => onSuccess(), 1400);
    } else {
      audioEngine.playStatic(0.2);
      audioEngine.playError();
      onFail?.();
      setStatus('failed');
      later(() => setStatus('live'), 1200);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel waveform-scope-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">GHOST SIGNAL // OSCILLOSCOPE BANK SUITE 2</div>
          <h2 className="puzzle-title">GHOST WAVEFORM MATCH</h2>
          <p className="puzzle-subtitle">
            DRIVE THE GREEN TRACE ONTO THE AMBER GHOST TRACE — CYCLES MUST BE EXACT; AMPLITUDE ±5; PHASE ±5°
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {/* Scope window */}
          <div style={{ position: 'relative' }} className="waveform-scope-window">
            <canvas
              ref={canvasRef}
              width={520}
              height={160}
              className="waveform-canvas"
              style={{
                width: '100%',
                height: 160,
                background: 'linear-gradient(180deg, #101828 0%, #0a0f1d 100%)',
                border: '1px solid var(--border-metal, #334155)',
                borderRadius: 8,
                display: 'block',
              }}
            />
            {status === 'locked' && (
              <div
                className="waveform-lock-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(74, 222, 128, 0.10)',
                  border: '1px solid rgba(74, 222, 128, 0.55)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 14,
                  letterSpacing: 2,
                  color: '#86efac',
                  textShadow: '0 0 12px rgba(74, 222, 128, 0.8)',
                }}
              >
                ✓ WAVEFORM LOCKED — TRACES COHERENT
              </div>
            )}
          </div>

          {/* Numeric readouts */}
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }} className="waveform-readouts">
            {(
              [
                { label: 'FREQUENCY', value: `${freq} CY`, target: `${TARGET_FREQ} CY` },
                { label: 'AMPLITUDE', value: `${amp}%`, target: `${TARGET_AMP}%` },
                { label: 'PHASE', value: `${phase}°`, target: `${TARGET_PHASE}°` },
              ] as const
            ).map((r) => (
              <span
                key={r.label}
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 12,
                  letterSpacing: 1.5,
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                {r.label}: <span style={{ color: status === 'locked' ? '#4ade80' : 'var(--accent-cyan, #00e5ff)' }}>{r.value}</span>
                <span style={{ color: 'rgba(148, 163, 184, 0.6)' }}> / GHOST {r.target}</span>
              </span>
            ))}
          </div>

          {/* Sliders rack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="waveform-slider-rack">
            <div className="waveform-slider-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-tech, sans-serif)', fontSize: 13 }}>
                <span style={{ letterSpacing: 1.5, color: 'var(--text-main, #cbd5e1)' }}>FREQUENCY</span>
                <span style={{ color: freq === TARGET_FREQ ? '#4ade80' : 'var(--accent-gold, #fbbf24)' }}>
                  {freq} CYCLE{freq === 1 ? '' : 'S'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={freq}
                onChange={(e) => onSliderChange('freq', parseInt(e.target.value, 10))}
                disabled={status === 'locked'}
                className="sci-fi-range-slider"
              />
            </div>
            <div className="waveform-slider-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-tech, sans-serif)', fontSize: 13 }}>
                <span style={{ letterSpacing: 1.5, color: 'var(--text-main, #cbd5e1)' }}>AMPLITUDE</span>
                <span style={{ color: Math.abs(amp - TARGET_AMP) <= AMP_TOLERANCE ? '#4ade80' : 'var(--accent-gold, #fbbf24)' }}>
                  {amp}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={amp}
                onChange={(e) => onSliderChange('amp', parseInt(e.target.value, 10))}
                disabled={status === 'locked'}
                className="sci-fi-range-slider"
              />
            </div>
            <div className="waveform-slider-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-tech, sans-serif)', fontSize: 13 }}>
                <span style={{ letterSpacing: 1.5, color: 'var(--text-main, #cbd5e1)' }}>PHASE</span>
                <span style={{ color: Math.abs(phase - TARGET_PHASE) <= PHASE_TOLERANCE ? '#4ade80' : 'var(--accent-gold, #fbbf24)' }}>
                  {phase}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={180}
                step={5}
                value={phase}
                onChange={(e) => onSliderChange('phase', parseInt(e.target.value, 10))}
                disabled={status === 'locked'}
                className="sci-fi-range-slider"
              />
            </div>
          </div>

          {status === 'failed' && (
            <div
              className="waveform-fault-note"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 12,
                letterSpacing: 1,
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: 6,
                padding: '10px 12px',
              }}
            >
              ✕ TRACES DIVERGENT — MATCH CYCLE COUNT, HEIGHT, THEN SLIDE
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn primary" onClick={attemptSyncLock} disabled={status === 'locked'}>
            {status === 'locked' ? 'WAVEFORM LOCKED' : 'SYNC LOCK [CHECK]'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
