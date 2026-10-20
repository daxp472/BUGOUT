import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface CoolantValvePuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const CoolantValvePuzzle: React.FC<CoolantValvePuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  // 4 Valve angles in degrees: [0, 90, 180, 270]
  // Target: [90, 90, 90, 90]
  const [valves, setValves] = useState<[number, number, number, number]>([0, 180, 0, 270]);
  const [status, setStatus] = useState<'routing' | 'stable' | 'blown'>('routing');

  const rotateValve = (idx: number) => {
    if (status === 'stable') return;
    audioEngine.playValve();
    const next: [number, number, number, number] = [...valves];
    next[idx] = (next[idx] + 90) % 360;
    setValves(next);

    // Calculate pressure and connection state
    const isV1Open = next[0] === 90;
    const isV2Open = next[1] === 90;
    const isV3Open = next[2] === 90;
    const isV4Open = next[3] === 90;

    if (isV1Open && isV2Open && isV3Open && isV4Open) {
      audioEngine.playPowerRestore();
      setStatus('stable');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }
  };

  // Calculate current PSI based on valve configuration
  const calculatePsi = () => {
    let base = 20;
    if (valves[0] === 90) base += 25; // intake open
    if (valves[1] === 0) base += 35; // blocked bypass causes backpressure
    if (valves[1] === 90) base += 10;
    if (valves[2] === 90) base -= 15; // pressure relief working
    if (valves[3] === 90) base += 15; // radiator receiving
    return Math.min(110, Math.max(15, base));
  };

  const currentPsi = calculatePsi();
  const isV1Open = valves[0] === 90;
  const isV2Open = valves[1] === 90;
  const isV3Open = valves[2] === 90;
  const isV4Open = valves[3] === 90;

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel valve-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">CRYO-PIPING // HYDRAULIC PRESSURE</div>
          <h2 className="puzzle-title">COOLANT CONDUIT BALANCING</h2>
          <p className="puzzle-subtitle">
            ROTATE VALVE MANIFOLDS TO ROUTE LIQUID NITROGEN TO RADIATOR CORE (MAINTAIN &lt; 75 PSI)
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="valve-puzzle-body">
          {/* Animated Pipe SVG Schematic */}
          <div className="pipe-schematic-wrapper">
            <svg viewBox="0 0 700 240" className="pipe-svg">
              <defs>
                <linearGradient id="coolantFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Main Background Conduit Pipes */}
              <path d="M 40 120 L 160 120 L 160 60 L 320 60 L 320 120 L 480 120 L 480 180 L 640 180" 
                stroke="#1e293b" strokeWidth="22" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 40 120 L 160 120 L 160 60 L 320 60 L 320 120 L 480 120 L 480 180 L 640 180" 
                stroke="#0f172a" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />

              {/* Active Flow Overlay when Valves are aligned */}
              {isV1Open && (
                <path d="M 40 120 L 160 120" stroke="url(#coolantFlow)" strokeWidth="12" fill="none" className="flowing-coolant" />
              )}
              {isV1Open && isV2Open && (
                <path d="M 160 120 L 160 60 L 320 60" stroke="url(#coolantFlow)" strokeWidth="12" fill="none" className="flowing-coolant" />
              )}
              {isV1Open && isV2Open && isV3Open && (
                <path d="M 320 60 L 320 120 L 480 120" stroke="url(#coolantFlow)" strokeWidth="12" fill="none" className="flowing-coolant" />
              )}
              {isV1Open && isV2Open && isV3Open && isV4Open && (
                <path d="M 480 120 L 480 180 L 640 180" stroke="url(#coolantFlow)" strokeWidth="12" fill="none" className="flowing-coolant" />
              )}

              {/* Terminal Nodes */}
              <circle cx="40" cy="120" r="16" fill="#0284c7" />
              <text x="40" y="155" fill="#94a3b8" fontSize="12" textAnchor="middle">TANK A</text>

              <circle cx="640" cy="180" r="16" fill={status === 'stable' ? '#10b981' : '#ef4444'} />
              <text x="640" y="215" fill="#94a3b8" fontSize="12" textAnchor="middle">CORE RADIATOR</text>
            </svg>
          </div>

          {/* 4 Interactive Valve Controls */}
          <div className="valves-controls-grid">
            {[
              { label: 'VALVE 01: INTAKE', angle: valves[0], isOpen: isV1Open },
              { label: 'VALVE 02: DIVERSION', angle: valves[1], isOpen: isV2Open },
              { label: 'VALVE 03: RELIEF', angle: valves[2], isOpen: isV3Open },
              { label: 'VALVE 04: CORE FEED', angle: valves[3], isOpen: isV4Open }
            ].map((v, idx) => (
              <div key={idx} className="valve-control-card">
                <div className="valve-label">{v.label}</div>
                <div className="valve-wheel-container" onClick={() => rotateValve(idx)}>
                  <div
                    className="valve-wheel"
                    style={{ transform: `rotate(${v.angle}deg)` }}
                  >
                    <div className="valve-spoke spoke-v" />
                    <div className="valve-spoke spoke-h" />
                    <div className="valve-hub" />
                  </div>
                </div>
                <div className={`valve-state-tag ${v.isOpen ? 'aligned' : 'blocked'}`}>
                  {v.isOpen ? 'FLOW OPEN (90°)' : `BLOCKED (${v.angle}°)`}
                </div>
              </div>
            ))}
          </div>

          {/* Pressure Gauge Metric */}
          <div className="pressure-gauge-card">
            <div className="gauge-header">
              <span>MANIFOLD PRESSURE:</span>
              <span className={`gauge-psi-val ${currentPsi <= 75 ? 'normal' : 'danger'}`}>
                {currentPsi} PSI {currentPsi > 75 ? '(OVERPRESSURE RISK!)' : '(STABLE RANGE)'}
              </span>
            </div>
            <div className="gauge-meter-track">
              <div
                className={`gauge-meter-fill ${currentPsi <= 75 ? 'normal' : 'danger'}`}
                style={{ width: `${(currentPsi / 120) * 100}%` }}
              />
              <div className="gauge-threshold-line" style={{ left: `${(75 / 120) * 100}%` }}>
                <span className="threshold-label">75 PSI MAX</span>
              </div>
            </div>
            {status === 'stable' && (
              <div className="status-box success">
                ✓ COOLANT CIRCULATION RESTORED // CHILLER SYSTEM NORMALIZED
              </div>
            )}
          </div>
        </div>

        <div className="puzzle-footer">
          <div className="hint-reminder">
            Click valves to rotate by 90°. All 4 valves must be aligned to 90° for full core circulation.
          </div>
        </div>
      </div>
    </div>
  );
};
