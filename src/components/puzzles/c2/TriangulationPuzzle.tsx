import React, { useMemo, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

const TARGETS = { ant1: 40, ant2: 140, ant3: 260 };
const TOLERANCE = 2;

interface Antenna {
  id: 'ant1' | 'ant2' | 'ant3';
  label: string;
  x: number;
  y: number;
}

const ANTENNAS: Antenna[] = [
  { id: 'ant1', label: 'ANT-1 · NORTH MAST', x: 260, y: 60 },
  { id: 'ant2', label: 'ANT-2 · EAST MAST', x: 430, y: 330 },
  { id: 'ant3', label: 'ANT-3 · WEST MAST', x: 90, y: 330 },
];

/**
 * GHOST SIGNAL — Triangulation Plot Table.
 * Rotate three antenna bearings until the sight-lines converge on the source.
 */
export const TriangulationPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [bearings, setBearings] = useState<{ ant1: number; ant2: number; ant3: number }>({ ant1: 0, ant2: 0, ant3: 0 });
  const [locked, setLocked] = useState(false);
  const [failFlash, setFailFlash] = useState(false);

  const isClose = (id: 'ant1' | 'ant2' | 'ant3') => {
    const distance = Math.abs(((bearings[id] - TARGETS[id]) % 360 + 540) % 360 - 180);
    return distance <= TOLERANCE;
  };

  const sightLine = (ant: Antenna, bearing: number) => {
    const rad = ((bearing - 90) * Math.PI) / 180; // 0° = up (north), clockwise
    const len = 320;
    return {
      x2: ant.x + Math.cos(rad) * len,
      y2: ant.y + Math.sin(rad) * len,
    };
  };

  const adjust = (id: 'ant1' | 'ant2' | 'ant3', delta: number) => {
    if (locked) return;
    audioEngine.playClick();
    setBearings((prev) => ({ ...prev, [id]: (prev[id] + delta + 360) % 360 }));
  };

  const attemptCompute = () => {
    if (locked) return;
    const allClose = (['ant1', 'ant2', 'ant3'] as const).every(isClose);
    if (allClose) {
      audioEngine.playTone(523.25, 0.35);
      setTimeout(() => audioEngine.playSuccess(), 350);
      setLocked(true);
      setTimeout(() => onSuccess(), 1500);
    } else {
      audioEngine.playError();
      onFail?.();
      setFailFlash(true);
      setTimeout(() => setFailFlash(false), 1200);
    }
  };

  const centroid = useMemo(
    () => ({
      x: (ANTENNAS[0].x + ANTENNAS[1].x + ANTENNAS[2].x) / 3,
      y: (ANTENNAS[0].y + ANTENNAS[1].y + ANTENNAS[2].y) / 3,
    }),
    []
  );

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel triangulation-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">GHOST SIGNAL // PLOT TABLE</div>
          <h2 className="puzzle-title">GHOST SOURCE TRIANGULATION</h2>
          <p className="puzzle-subtitle">ROTATE ALL THREE ANTENNA BEARINGS UNTIL THE SIGHT-LINES CONVERGE</p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="triangulation-body">
          <div className={`radar-plot-window ${failFlash ? 'fail-flash' : ''} ${locked ? 'locked' : ''}`}>
            <svg viewBox="0 0 520 420" className="radar-svg">
              <defs>
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(234, 179, 8, 0.07)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="520" height="420" fill="url(#radarGrid)" />

              {/* Range rings + compass ticks */}
              {[70, 130, 190, 250].map((r) => (
                <circle key={r} cx="260" cy="210" r={r} fill="none" stroke="rgba(234, 179, 8, 0.16)" strokeWidth="1" strokeDasharray="3,5" />
              ))}
              {Array.from({ length: 36 }, (_, i) => {
                const a = (i * 10 * Math.PI) / 180;
                const inner = i % 3 === 0 ? 246 : 252;
                return (
                  <line
                    key={i}
                    x1={260 + Math.cos(a) * inner}
                    y1={210 + Math.sin(a) * inner}
                    x2={260 + Math.cos(a) * 258}
                    y2={210 + Math.sin(a) * 258}
                    stroke="rgba(234, 179, 8, 0.35)"
                    strokeWidth="1"
                  />
                );
              })}
              <text x="260" y="18" fill="rgba(234, 179, 8, 0.6)" fontSize="10" textAnchor="middle">N 000°</text>

              {/* Compound marker at centroid */}
              <rect x={centroid.x - 9} y={centroid.y - 9} width="18" height="18" fill="none" stroke="rgba(234, 179, 8, 0.4)" strokeWidth="1.5" />
              <text x={centroid.x} y={centroid.y + 28} fill="rgba(234, 179, 8, 0.55)" fontSize="9" textAnchor="middle">AURELION COMPOUND</text>

              {/* Sight lines — drawn both directions so convergence is visible */}
              {ANTENNAS.map((ant) => {
                const { x2, y2 } = sightLine(ant, bearings[ant.id]);
                const { x2: bx2, y2: by2 } = sightLine(ant, (bearings[ant.id] + 180) % 360);
                const close = isClose(ant.id);
                const stroke = close ? '#fde047' : 'rgba(253, 224, 71, 0.45)';
                const width = close ? 2.5 : 1.5;
                return (
                  <g key={ant.id}>
                    <line x1={ant.x} y1={ant.y} x2={x2} y2={y2} stroke={stroke} strokeWidth={width} strokeDasharray={close ? 'none' : '6,6'} />
                    <line x1={ant.x} y1={ant.y} x2={bx2} y2={by2} stroke={stroke} strokeWidth={width} strokeDasharray={close ? 'none' : '6,6'} opacity={0.85} />
                  </g>
                );
              })}

              {/* Antennas */}
              {ANTENNAS.map((ant) => (
                <g key={ant.id}>
                  <polygon
                    points={`${ant.x},${ant.y - 9} ${ant.x - 8},${ant.y + 6} ${ant.x + 8},${ant.y + 6}`}
                    fill="#0f172a"
                    stroke="#eab308"
                    strokeWidth="2"
                  />
                  <text x={ant.x} y={ant.y + 22} fill="#94a3b8" fontSize="9" textAnchor="middle">{ant.id.toUpperCase()}</text>
                </g>
              ))}

              {/* Locked source pulse */}
              {locked && (
                <circle cx={centroid.x} cy={centroid.y} r="14" fill="rgba(253, 224, 71, 0.35)" className="source-pulse">
                  <animate attributeName="r" values="10;26;10" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}
            </svg>
          </div>

          <div className="bearing-controls">
            {ANTENNAS.map((ant) => (
              <div key={ant.id} className={`bearing-cluster ${isClose(ant.id) ? 'near-lock' : ''}`}>
                <span className="bearing-label">{ant.label}</span>
                <div className="bearing-row">
                  <button className="dial-btn small" onClick={() => adjust(ant.id, -10)} disabled={locked}>−10</button>
                  <button className="dial-btn small" onClick={() => adjust(ant.id, -2)} disabled={locked}>−2</button>
                  <span className="bearing-readout">{String(bearings[ant.id]).padStart(3, '0')}°</span>
                  <button className="dial-btn small" onClick={() => adjust(ant.id, 2)} disabled={locked}>+2</button>
                  <button className="dial-btn small" onClick={() => adjust(ant.id, 10)} disabled={locked}>+10</button>
                </div>
              </div>
            ))}
          </div>

          {failFlash && (
            <div className="tuning-fault-note">✕ SIGHT-LINES DO NOT CONVERGE — CHECK THE ARRAY GRID BEARINGS [TAB]</div>
          )}
          {locked && <div className="tuning-lock-note">✓ SOURCE TRIANGULATED — GHOST ORIGINATES INSIDE THE COMPOUND</div>}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn primary" onClick={attemptCompute} disabled={locked}>
            {locked ? 'SOURCE PINNED' : 'COMPUTE INTERSECTION'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
