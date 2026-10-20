import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface LogicGatesPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const LogicGatesPuzzle: React.FC<LogicGatesPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  const [inputA, setInputA] = useState<boolean>(false);
  const [inputB, setInputB] = useState<boolean>(false);
  const [inputC, setInputC] = useState<boolean>(true);
  const [status, setStatus] = useState<'calibrating' | 'success'>('calibrating');

  // Boolean Calculations
  const gate1And = inputA && inputB; // Gate 1: AND(A, B)
  const gate2Xor = (gate1And ? 1 : 0) ^ (inputC ? 1 : 0); // Gate 2: XOR(G1, C)
  const gate3Not = !inputC; // Gate 3: NOT(C)

  const isResolved = gate1And && gate2Xor === 1 && gate3Not;

  const toggleInput = (which: 'A' | 'B' | 'C') => {
    if (status === 'success') return;
    audioEngine.playSwitch();

    let nextA = inputA;
    let nextB = inputB;
    let nextC = inputC;

    if (which === 'A') {
      nextA = !inputA;
      setInputA(nextA);
    } else if (which === 'B') {
      nextB = !inputB;
      setInputB(nextB);
    } else if (which === 'C') {
      nextC = !inputC;
      setInputC(nextC);
    }

    const g1 = nextA && nextB;
    const g2 = (g1 ? 1 : 0) ^ (nextC ? 1 : 0);
    const g3 = !nextC;

    if (g1 && g2 === 1 && g3) {
      audioEngine.playPowerRestore();
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel logic-gate-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">QUANTUM PARITY // OBSIDIAN BULKHEAD</div>
          <h2 className="puzzle-title">3-GATE BOOLEAN LOGIC INTERCONNECT</h2>
          <p className="puzzle-subtitle">
            CONFIGURE BINARY INPUTS A, B, AND C TO DRIVE ALL THREE LOGIC GATES TO HIGH (1)
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="logic-puzzle-body">
          {/* Circuit Grid Diagram */}
          <div className="circuit-schematic-box">
            {/* Inputs Column */}
            <div className="circuit-inputs-col">
              <h3 className="section-label">INPUT SIGNALS</h3>

              <div className="input-toggle-row">
                <span className="input-name">SIGNAL A:</span>
                <button
                  className={`bit-toggle-btn ${inputA ? 'bit-1' : 'bit-0'}`}
                  onClick={() => toggleInput('A')}
                >
                  {inputA ? '1 (HIGH)' : '0 (LOW)'}
                </button>
              </div>

              <div className="input-toggle-row">
                <span className="input-name">SIGNAL B:</span>
                <button
                  className={`bit-toggle-btn ${inputB ? 'bit-1' : 'bit-0'}`}
                  onClick={() => toggleInput('B')}
                >
                  {inputB ? '1 (HIGH)' : '0 (LOW)'}
                </button>
              </div>

              <div className="input-toggle-row">
                <span className="input-name">SIGNAL C:</span>
                <button
                  className={`bit-toggle-btn ${inputC ? 'bit-1' : 'bit-0'}`}
                  onClick={() => toggleInput('C')}
                >
                  {inputC ? '1 (HIGH)' : '0 (LOW)'}
                </button>
              </div>
            </div>

            {/* Gates Interconnect Column */}
            <div className="circuit-gates-col">
              <h3 className="section-label">LOGIC GATES</h3>

              {/* Gate 1: AND */}
              <div className={`gate-display-card ${gate1And ? 'gate-true' : 'gate-false'}`}>
                <div className="gate-header">
                  <span className="gate-type">GATE 01: AND</span>
                  <span className="gate-formula">A ∧ B</span>
                </div>
                <div className="gate-output">
                  OUTPUT: <span className="bit-val">{gate1And ? '1 (TRUE)' : '0 (FALSE)'}</span>
                </div>
              </div>

              {/* Gate 2: XOR */}
              <div className={`gate-display-card ${gate2Xor === 1 ? 'gate-true' : 'gate-false'}`}>
                <div className="gate-header">
                  <span className="gate-type">GATE 02: XOR</span>
                  <span className="gate-formula">G1 ⊕ C</span>
                </div>
                <div className="gate-output">
                  OUTPUT: <span className="bit-val">{gate2Xor === 1 ? '1 (TRUE)' : '0 (FALSE)'}</span>
                </div>
              </div>

              {/* Gate 3: NOT */}
              <div className={`gate-display-card ${gate3Not ? 'gate-true' : 'gate-false'}`}>
                <div className="gate-header">
                  <span className="gate-type">GATE 03: NOT</span>
                  <span className="gate-formula">¬ C</span>
                </div>
                <div className="gate-output">
                  OUTPUT: <span className="bit-val">{gate3Not ? '1 (TRUE)' : '0 (FALSE)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Master Lock Parity Indicator */}
          <div className="parity-master-status">
            <div className="indicator-slots">
              <div className={`indicator-pill ${gate1And ? 'active' : ''}`}>G1 (AND): {gate1And ? 'PASS' : 'FAIL'}</div>
              <div className={`indicator-pill ${gate2Xor === 1 ? 'active' : ''}`}>G2 (XOR): {gate2Xor === 1 ? 'PASS' : 'FAIL'}</div>
              <div className={`indicator-pill ${gate3Not ? 'active' : ''}`}>G3 (NOT): {gate3Not ? 'PASS' : 'FAIL'}</div>
            </div>

            {isResolved ? (
              <div className="status-box success">
                ✓ QUANTUM PARITY REACHED // OBSIDIAN REFLECTIVE BARRIER PHASE-SHIFTING
              </div>
            ) : (
              <div className="status-box warning">
                ⚠ GATE MATRIX DISSATISFIED: ALL THREE GATES MUST SIMULTANEOUSLY OUTPUT 1
              </div>
            )}
          </div>
        </div>

        <div className="puzzle-footer">
          <div className="hint-reminder">
            Target: A=1 and B=1 satisfy Gate 1. If G1=1, then C=0 satisfies both Gate 2 (XOR) and Gate 3 (NOT)!
          </div>
        </div>
      </div>
    </div>
  );
};
