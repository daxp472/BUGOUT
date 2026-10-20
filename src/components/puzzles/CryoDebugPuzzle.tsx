import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface CryoDebugPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const CryoDebugPuzzle: React.FC<CryoDebugPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tempState, setTempState] = useState<number>(45); // Current high temp in Celsius
  const [isFixed, setIsFixed] = useState(false);

  const options = [
    {
      id: 1,
      title: 'TARGET THRESHOLD WITH PUMP VERIFICATION',
      code: 'if (currentTemp >= targetTemp && coolantPumpActive) {\n  engageCompressorCycle();\n  purgeThermalSpike();\n}',
      explanation: 'Ensures the compressor engages only when temp is elevated and the coolant pump is safely operational.',
      isCorrect: true,
    },
    {
      id: 2,
      title: 'OR INVERTED LOGIC',
      code: 'if (currentTemp === targetTemp || !coolantPumpActive) {\n  engageCompressorCycle();\n}',
      explanation: 'Triggers compression when pumps are off, causing immediate thermal blowout.',
      isCorrect: false,
    },
    {
      id: 3,
      title: 'NEGATIVE ONLY THRESHOLD',
      code: 'if (currentTemp < 0) {\n  engageCompressorCycle();\n}',
      explanation: 'Only cools when already below zero, failing to cool down overheating systems.',
      isCorrect: false,
    }
  ];

  const handleApplyFix = () => {
    if (selectedOption === null) return;
    audioEngine.playClick();
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const chosen = options.find((o) => o.id === selectedOption);
      if (chosen?.isCorrect) {
        audioEngine.playSuccess();
        setIsFixed(true);
        // Animate temperature cooling down
        let t = 45;
        const interval = setInterval(() => {
          t -= 5;
          setTempState(t);
          if (t <= -40) {
            clearInterval(interval);
            setTimeout(() => {
              onSuccess();
            }, 1000);
          }
        }, 80);
      } else {
        audioEngine.playError();
        if (onFail) onFail();
      }
    }, 700);
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel terminal-code-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">FIRMWARE V4.2 // CRYO_CHILLER.LOGIC</div>
          <h2 className="puzzle-title">COOLING CONTROLLER LOGIC DEADLOCK</h2>
          <p className="puzzle-subtitle">
            REPAIR THE CHILLER ACTIVATION CONDITIONAL TO STABILIZE CHAMBER TEMPERATURE
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="cryo-debug-body">
          {/* Temperature HUD */}
          <div className="temp-telemetry-box">
            <div className="telemetry-label">CORE TEMPERATURE:</div>
            <div className={`telemetry-temp ${tempState > 0 ? 'overheating' : 'chilled'}`}>
              {tempState > 0 ? `+${tempState}°C` : `${tempState}°C`}
              <span className="temp-target-indicator">
                {tempState <= -40 ? ' (NOMINAL CRYO STABLE)' : ' (CRITICAL ELEVATION)'}
              </span>
            </div>
          </div>

          {/* Faulty Code View */}
          <div className="code-editor-window">
            <div className="editor-tab-bar">
              <span className="tab-item alert">CRITICAL_CHILLER_FAULT.SYS</span>
            </div>
            <pre className="code-snippet">
              <code>
                <span className="comment">// CURRENT BROKEN LOGIC:</span>{'\n'}
                <span className="kw">if</span> (currentTemp &gt; 273.15 || currentTemp &lt; 0) &#123;{'\n'}
                {'  '}<span className="comment">// Logical deadlock: OR operator creates infinite oscillation!</span>{'\n'}
                &#125;
              </code>
            </pre>
          </div>

          {/* Choices */}
          <div className="patch-selection-area">
            <h3 className="section-label">SELECT LOGIC CONDITION PATCH:</h3>
            <div className="patches-list">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className={`patch-card ${selectedOption === opt.id ? 'selected' : ''}`}
                  onClick={() => {
                    if (!isFixed) {
                      audioEngine.playClick();
                      setSelectedOption(opt.id);
                    }
                  }}
                >
                  <div className="patch-card-header">
                    <input
                      type="radio"
                      name="cryoOpt"
                      checked={selectedOption === opt.id}
                      onChange={() => setSelectedOption(opt.id)}
                      disabled={isFixed}
                    />
                    <span className="patch-label">{opt.title}</span>
                  </div>
                  <pre className="patch-code-preview">
                    <code>{opt.code}</code>
                  </pre>
                  <p className="patch-desc">{opt.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {isFixed && (
            <div className="status-box success">
              ✓ THERMAL CONTROLLER RESTORED // CHILLER PUMP RUNNING AT -40°C
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn primary"
            onClick={handleApplyFix}
            disabled={selectedOption === null || isVerifying || isFixed}
          >
            {isVerifying ? 'DEPLOYING FIRMWARE...' : isFixed ? 'SYSTEM STABILIZED' : 'APPLY FIRMWARE FIX [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
};
