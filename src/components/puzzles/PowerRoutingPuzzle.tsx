import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface PowerRoutingPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const PowerRoutingPuzzle: React.FC<PowerRoutingPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  // 4 Breakers: Default [false, true, false, false]
  const [switches, setSwitches] = useState<[boolean, boolean, boolean, boolean]>([false, true, false, false]);
  const [status, setStatus] = useState<'calibrating' | 'synchronized' | 'error'>('calibrating');

  // Calculate Bus Values based on switch state
  // Target: Aux 60%, Relay 60%, Main 75%
  const calculateBusLevels = (sw: [boolean, boolean, boolean, boolean]) => {
    let aux = 0;
    let relay = 0;
    let main = 0;

    if (sw[0]) {
      main += 35;
      aux += 20;
    }
    if (sw[1]) {
      aux += 25;
      relay -= 20;
    }
    if (sw[2]) {
      main += 40;
      relay += 30;
      aux += 15;
    }
    if (sw[3]) {
      relay += 30;
      aux += 25;
    }

    return {
      aux: Math.max(0, Math.min(100, aux)),
      relay: Math.max(0, Math.min(100, relay)),
      main: Math.max(0, Math.min(100, main)),
    };
  };

  const currentLevels = calculateBusLevels(switches);
  const isSynchronized = currentLevels.aux === 60 && currentLevels.relay === 60 && currentLevels.main === 75;

  const toggleSwitch = (index: number) => {
    if (status === 'synchronized') return;
    audioEngine.playSwitch();
    const next: [boolean, boolean, boolean, boolean] = [...switches];
    next[index] = !next[index];
    setSwitches(next);

    const nextLevels = calculateBusLevels(next);
    if (nextLevels.aux === 60 && nextLevels.relay === 60 && nextLevels.main === 75) {
      audioEngine.playPowerRestore();
      setStatus('synchronized');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel power-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">GRID MATRIX #01-POWER</div>
          <h2 className="puzzle-title">POWER BUS CIRCUIT SYNCHRONIZATION</h2>
          <p className="puzzle-subtitle">
            BALANCE AUXILIARY, RELAY, AND MAIN POWER BUSES TO TARGET THRESHOLDS
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="power-puzzle-body">
          {/* Circuit Breakers */}
          <div className="breakers-rack">
            <h3 className="section-label">CIRCUIT BREAKERS</h3>
            <div className="breakers-grid">
              {switches.map((isOn, idx) => (
                <div key={idx} className={`breaker-slot ${isOn ? 'active' : ''}`}>
                  <div className="breaker-label">BREAKER 0{idx + 1}</div>
                  <button
                    className={`breaker-switch ${isOn ? 'switched-on' : 'switched-off'}`}
                    onClick={() => toggleSwitch(idx)}
                    disabled={status === 'synchronized'}
                  >
                    <div className="switch-handle" />
                    <span className="switch-status-text">{isOn ? 'ONLINE' : 'BYPASS'}</span>
                  </button>
                  <div className="breaker-led" />
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Meters */}
          <div className="bus-meters-rack">
            <h3 className="section-label">BUS METRICS & RESONANCE</h3>
            
            {/* Aux Bus */}
            <div className="meter-item">
              <div className="meter-info">
                <span>AUXILIARY BUS</span>
                <span className={`meter-value ${currentLevels.aux === 60 ? 'target-met' : ''}`}>
                  {currentLevels.aux}% / 60%
                </span>
              </div>
              <div className="meter-bar-track">
                <div
                  className={`meter-bar-fill ${currentLevels.aux === 60 ? 'matched' : ''}`}
                  style={{ width: `${currentLevels.aux}%` }}
                />
                <div className="meter-target-marker" style={{ left: '60%' }} />
              </div>
            </div>

            {/* Relay Bus */}
            <div className="meter-item">
              <div className="meter-info">
                <span>RELAY BUS</span>
                <span className={`meter-value ${currentLevels.relay === 60 ? 'target-met' : ''}`}>
                  {currentLevels.relay}% / 60%
                </span>
              </div>
              <div className="meter-bar-track">
                <div
                  className={`meter-bar-fill ${currentLevels.relay === 60 ? 'matched' : ''}`}
                  style={{ width: `${currentLevels.relay}%` }}
                />
                <div className="meter-target-marker" style={{ left: '60%' }} />
              </div>
            </div>

            {/* Main Bus */}
            <div className="meter-item">
              <div className="meter-info">
                <span>PRIMARY MAIN BUS</span>
                <span className={`meter-value ${currentLevels.main === 75 ? 'target-met' : ''}`}>
                  {currentLevels.main}% / 75%
                </span>
              </div>
              <div className="meter-bar-track">
                <div
                  className={`meter-bar-fill ${currentLevels.main === 75 ? 'matched' : ''}`}
                  style={{ width: `${currentLevels.main}%` }}
                />
                <div className="meter-target-marker" style={{ left: '75%' }} />
              </div>
            </div>

            <div className="grid-status-alert">
              {isSynchronized ? (
                <div className="status-box success">
                  ⚡ POWER RESONANCE ACHIEVED // CHAMBER BUS ENERGIZED
                </div>
              ) : (
                <div className="status-box warning">
                  ⚠ CIRCUIT DISCORDANCE: POWER FLOW SUB-OPTIMAL
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="puzzle-footer">
          <div className="hint-reminder">
            TIP: Toggle breakers to match target indicators. Target requires Aux: 60%, Relay: 60%, Main: 75%.
          </div>
        </div>
      </div>
    </div>
  );
};
