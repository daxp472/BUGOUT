import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface GeneratorMatrixPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const GeneratorMatrixPuzzle: React.FC<GeneratorMatrixPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  const [alpha, setAlpha] = useState<number>(20);
  const [beta, setBeta] = useState<number>(50);
  const [gamma, setGamma] = useState<number>(10);
  const [status, setStatus] = useState<'calibrating' | 'synchronized'>('calibrating');

  const totalLoad = alpha + beta + gamma;
  const isPerfect = alpha === 35 && beta === 40 && gamma === 25 && totalLoad === 100;

  const handleSliderChange = (which: 'alpha' | 'beta' | 'gamma', val: number) => {
    if (status === 'synchronized') return;
    audioEngine.playSwitch();

    let nextA = alpha;
    let nextB = beta;
    let nextG = gamma;

    if (which === 'alpha') {
      nextA = val;
      setAlpha(val);
    } else if (which === 'beta') {
      nextB = val;
      setBeta(val);
    } else if (which === 'gamma') {
      nextG = val;
      setGamma(val);
    }

    if (nextA === 35 && nextB === 40 && nextG === 25 && (nextA + nextB + nextG) === 100) {
      audioEngine.playPowerRestore();
      setStatus('synchronized');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel core-matrix-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">REACTOR CORE // PHASE EQUILIBRIUM</div>
          <h2 className="puzzle-title">CORE 3-PHASE GENERATOR SYNCHRONIZATION</h2>
          <p className="puzzle-subtitle">
            CALIBRATE GENERATORS ALPHA (35%), BETA (40%), AND GAMMA (25%) TO TOTAL 100% GRID CAPACITY
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="core-puzzle-body">
          {/* Total Capacity Display */}
          <div className="total-capacity-card">
            <div className="capacity-header">
              <span>REACTOR TOTAL GRID LOAD:</span>
              <span className={`capacity-metric ${totalLoad === 100 ? 'nominal' : 'imbalanced'}`}>
                {totalLoad}% / 100%
              </span>
            </div>
            <div className="capacity-bar-track">
              <div
                className={`capacity-bar-fill ${totalLoad === 100 ? 'nominal' : 'imbalanced'}`}
                style={{ width: `${Math.min(100, totalLoad)}%` }}
              />
            </div>
          </div>

          {/* 3 Generator Sliders */}
          <div className="generator-sliders-rack">
            {/* Alpha */}
            <div className="generator-slider-item">
              <div className="slider-meta">
                <span className="gen-name">PHASE ALPHA:</span>
                <span className={`gen-val ${alpha === 35 ? 'target-met' : ''}`}>{alpha}% (TARGET: 35%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={alpha}
                onChange={(e) => handleSliderChange('alpha', parseInt(e.target.value, 10))}
                disabled={status === 'synchronized'}
                className="sci-fi-range-slider"
              />
            </div>

            {/* Beta */}
            <div className="generator-slider-item">
              <div className="slider-meta">
                <span className="gen-name">PHASE BETA:</span>
                <span className={`gen-val ${beta === 40 ? 'target-met' : ''}`}>{beta}% (TARGET: 40%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={beta}
                onChange={(e) => handleSliderChange('beta', parseInt(e.target.value, 10))}
                disabled={status === 'synchronized'}
                className="sci-fi-range-slider"
              />
            </div>

            {/* Gamma */}
            <div className="generator-slider-item">
              <div className="slider-meta">
                <span className="gen-name">PHASE GAMMA:</span>
                <span className={`gen-val ${gamma === 25 ? 'target-met' : ''}`}>{gamma}% (TARGET: 25%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={gamma}
                onChange={(e) => handleSliderChange('gamma', parseInt(e.target.value, 10))}
                disabled={status === 'synchronized'}
                className="sci-fi-range-slider"
              />
            </div>
          </div>

          {isPerfect ? (
            <div className="status-box success">
              ⚡ 3-PHASE EQUILIBRIUM ACHIEVED (35% + 40% + 25% = 100%) // CORE POWER MATRIX ONLINE
            </div>
          ) : (
            <div className="status-box warning">
              ⚠ PHASE IMBALANCE: HARMONIZE ALPHA, BETA, AND GAMMA TO TARGET THRESHOLDS
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <div className="hint-reminder">
            Slide Alpha to 35%, Beta to 40%, and Gamma to 25% to reach 100% capacity.
          </div>
        </div>
      </div>
    </div>
  );
};
