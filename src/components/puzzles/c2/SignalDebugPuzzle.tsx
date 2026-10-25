import React, { useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

const BROKEN_CODE = [
  { n: 1, parts: [<span key="k" className="kw">function</span>, ' ', <span key="f" className="fn">encodeSignal</span>, '(samples) {'] },
  { n: 2, parts: ['  ', <span key="k" className="kw">const</span>, ' out = [];'] },
  { n: 3, parts: ['  ', <span key="k" className="kw">for</span>, ' (', <span key="l" className="kw">let</span>, ' i = 0; i <= samples.length; i++) { ', <span key="c" className="comment">// {'<--'} VULNERABLE BOUND</span>] },
  { n: 4, parts: ['    out.push(samples[i] * 2);'] },
  { n: 5, parts: ['  }'] },
  { n: 6, parts: ['  ', <span key="k" className="kw">return</span>, ' out;'] },
  { n: 7, parts: ['}'] },
];

/**
 * GHOST SIGNAL — Signal Encoder Integrity Fix.
 * Off-by-one loop bound corrupts every buffer with NaN.
 */
export const SignalDebugPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const patches = [
    {
      id: 'patch_1',
      label: 'Tighten the loop bound to `i < samples.length`',
      code: `for (let i = 0; i < samples.length; i++) {\n  out.push(samples[i] * 2);\n}`,
      explanation: 'Stops reading one sample past the array end — no more undefined * 2 = NaN.',
      isCorrect: true,
    },
    {
      id: 'patch_2',
      label: 'Coerce undefined samples to zero: `(samples[i] || 0) * 2`',
      code: `for (let i = 0; i <= samples.length; i++) {\n  out.push((samples[i] || 0) * 2);\n}`,
      explanation: 'Hides the NaN but still emits an extra phantom sample every buffer.',
      isCorrect: false,
    },
    {
      id: 'patch_3',
      label: 'Skip ahead: process every other sample with `i += 2`',
      code: `for (let i = 0; i < samples.length; i += 2) {\n  out.push(samples[i] * 2);\n}`,
      explanation: 'Halves the output length — decimation destroys the carrier entirely.',
      isCorrect: false,
    },
  ];

  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [results, setResults] = useState<{ ran: boolean; allPassed: boolean; tests: { name: string; passed: boolean; out: string }[] }>({
    ran: false,
    allPassed: false,
    tests: [],
  });

  const handleRunTests = () => {
    if (!selectedPatch || isCompiling || results.allPassed) return;
    setIsCompiling(true);
    audioEngine.playClick();

    setTimeout(() => {
      setIsCompiling(false);
      const chosen = patches.find((p) => p.id === selectedPatch);
      if (chosen?.isCorrect) {
        audioEngine.playSuccess();
        setResults({
          ran: true,
          allPassed: true,
          tests: [
            { name: 'encodeSignal([1, 2, 3])', passed: true, out: '→ [2, 4, 6] [PASS]' },
            { name: 'encodeSignal([])', passed: true, out: '→ [] [PASS]' },
            { name: 'NaN corruption scan (1000 buffers)', passed: true, out: '→ 0 defects [PASS]' },
          ],
        });
        setTimeout(() => onSuccess(), 1400);
      } else {
        audioEngine.playError();
        onFail?.();
        setResults({
          ran: true,
          allPassed: false,
          tests: [
            { name: 'encodeSignal([1, 2, 3])', passed: false, out: 'Expected [2, 4, 6] — output length mismatch [FAIL]' },
            { name: 'NaN corruption scan (1000 buffers)', passed: false, out: '→ phantom sample detected [FAIL]' },
          ],
        });
      }
    }, 600);
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel terminal-code-panel signal-debug-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">GHOST SIGNAL // ENCODER_REV4.JS</div>
          <h2 className="puzzle-title">SIGNAL ENCODER INTEGRITY FIX</h2>
          <p className="puzzle-subtitle">THE ENCODER CORRUPTS EVERY BUFFER — FIND THE FAULT IN THE LOOP</p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="code-puzzle-container">
          <div className="code-editor-window">
            <div className="editor-tab-bar">
              <span className="tab-item active">encodeSignal.js</span>
              <span className="tab-item alert">1 VULNERABILITY DETECTED</span>
            </div>
            <pre className="code-snippet">
              <code>
                {BROKEN_CODE.map((line) => (
                  <React.Fragment key={line.n}>
                    <span className={`line-num ${line.n === 3 ? 'error-line' : ''}`}>{line.n}</span>{' '}
                    {line.parts}
                    {'\n'}
                  </React.Fragment>
                ))}
              </code>
            </pre>
            <div className="compiler-note">
              ⚠ LINT WARNING: loop bound reads one sample past the array end — every third buffer is corrupted with NaN.
            </div>
          </div>

          <div className="patch-selection-area">
            <h3 className="section-label">SELECT ENCODER REPAIR PATCH:</h3>
            <div className="patches-list">
              {patches.map((patch) => (
                <div
                  key={patch.id}
                  className={`patch-card ${selectedPatch === patch.id ? 'selected' : ''}`}
                  onClick={() => {
                    audioEngine.playClick();
                    setSelectedPatch(patch.id);
                  }}
                >
                  <div className="patch-card-header">
                    <input
                      type="radio"
                      name="signalPatch"
                      checked={selectedPatch === patch.id}
                      onChange={() => setSelectedPatch(patch.id)}
                    />
                    <span className="patch-label">{patch.label}</span>
                  </div>
                  <pre className="patch-code-preview">
                    <code>{patch.code}</code>
                  </pre>
                  <p className="patch-desc">{patch.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {results.ran && (
            <div className={`test-runner-console ${results.allPassed ? 'passed' : 'failed'}`}>
              <div className="console-title">
                {results.allPassed ? '✓ TEST SUITE PASSED (3/3) — ENCODER CLEAN' : '✕ TEST SUITE FAILED — SIGNAL STILL CORRUPT'}
              </div>
              <ul className="test-list">
                {results.tests.map((t, i) => (
                  <li key={i} className={`test-item ${t.passed ? 'pass' : 'fail'}`}>
                    <span className="test-icon">{t.passed ? '✓' : '✗'}</span>
                    <span className="test-name">{t.name}:</span>
                    <span className="test-out">{t.out}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn primary" onClick={handleRunTests} disabled={!selectedPatch || isCompiling || results.allPassed}>
            {isCompiling ? 'RUNNING TEST SUITE...' : results.allPassed ? 'ENCODER VERIFIED' : 'COMPILE & TEST PATCH'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
