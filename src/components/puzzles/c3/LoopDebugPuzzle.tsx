import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface LoopDebugPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

/**
 * ECHOES OF AURELION — Recursion Furnace Governor Fix.
 * Structure mirrors CodeBugPuzzle: broken source window, lint note,
 * three candidate patches, fake test runner with a compile delay.
 */
export const LoopDebugPuzzle: React.FC<LoopDebugPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  // Candidate patches
  const patches = [
    {
      id: 'patch_1',
      label: 'Add a base case and shrink the input each recursion',
      code: `function processEchoes(echoes) {\n  if (echoes.length === 0) return;\n  console.log("ARCHIVING:", echoes[0].id);\n  processEchoes(echoes.slice(1));\n}`,
      explanation: 'Returns when the echo stack is empty and recurses on echoes.slice(1) — every echo is archived exactly once, then the recursion terminates.',
      isCorrect: true,
    },
    {
      id: 'patch_2',
      label: 'Contain the stack overflow and continue',
      code: `function processEchoes(echoes) {\n  try {\n    console.log("ARCHIVING:", echoes[0].id);\n    processEchoes(echoes);\n  } catch (err) {\n    // resume\n  }\n}`,
      explanation: 'Swallows the error, echoes still never processed.',
      isCorrect: false,
    },
    {
      id: 'patch_3',
      label: 'Stop after 1000 recursions',
      code: `function processEchoes(echoes, count = 0) {\n  if (count >= 1000) return;\n  console.log("ARCHIVING:", echoes[0].id);\n  processEchoes(echoes.slice(1), count + 1);\n}`,
      explanation: 'Arbitrary limit abandons the remaining echoes.',
      isCorrect: false,
    }
  ];

  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    ran: boolean;
    tests: Array<{ name: string; passed: boolean; output: string }>;
    allPassed: boolean;
  }>({
    ran: false,
    tests: [],
    allPassed: false,
  });
  const [isCompiling, setIsCompiling] = useState(false);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  // Clear every pending timer on unmount.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
  }, []);

  const handleRunTests = () => {
    if (!selectedPatch) {
      audioEngine.playError();
      return;
    }

    setIsCompiling(true);
    audioEngine.playClick();

    later(() => {
      setIsCompiling(false);
      const chosen = patches.find((p) => p.id === selectedPatch);
      if (chosen?.isCorrect) {
        audioEngine.playSuccess();
        setTestResults({
          ran: true,
          allPassed: true,
          tests: [
            { name: 'processEchoes([])', passed: true, output: 'Terminates immediately [PASS]' },
            { name: 'processEchoes(72 echoes)', passed: true, output: 'Archives 72 of 72 [PASS]' },
            { name: 'governor stack depth', passed: true, output: 'No stack overflow [PASS]' }
          ]
        });
        later(() => {
          onSuccess();
        }, 1200);
      } else if (chosen?.id === 'patch_2') {
        audioEngine.playError();
        if (onFail) onFail();
        setTestResults({
          ran: true,
          allPassed: false,
          tests: [
            { name: 'processEchoes([])', passed: false, output: 'RangeError swallowed, nothing archived [FAIL]' },
            { name: 'processEchoes(72 echoes)', passed: false, output: '0 of 72 archived [FAIL]' },
            { name: 'governor stack depth', passed: false, output: 'Overflow caught, recursion re-enters [FAIL]' }
          ]
        });
      } else {
        audioEngine.playError();
        if (onFail) onFail();
        setTestResults({
          ran: true,
          allPassed: false,
          tests: [
            { name: 'processEchoes([])', passed: false, output: 'TypeError reading echoes[0] of empty stack [FAIL]' },
            { name: 'processEchoes(72 echoes)', passed: true, output: 'Archives 72 of 72 [PASS]' },
            { name: 'processEchoes(4096 echoes)', passed: false, output: 'Abandons 3096 remaining echoes [FAIL]' }
          ]
        });
      }
    }, 600);
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel terminal-code-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">ECHOES OF AURELION // GOVERNOR_V9.JS</div>
          <h2 className="puzzle-title">RECURSION FURNACE GOVERNOR FIX</h2>
          <p className="puzzle-subtitle">
            DIAGNOSE WHY THE FURNACE GOVERNOR NEVER TERMINATES — THE ECHO STACK IS RE-PROCESSED FOREVER
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="code-puzzle-container">
          {/* Source Code View */}
          <div className="code-editor-window">
            <div className="editor-tab-bar">
              <span className="tab-item active">governor_v9.js</span>
              <span className="tab-item alert">1 VULNERABILITY DETECTED</span>
            </div>
            <pre className="code-snippet">
              <code>
                <span className="line-num">1</span> <span className="kw">function</span> <span className="fn">processEchoes</span>(echoes) &#123;{'\n'}
                <span className="line-num error-line">2</span>   console.log(<span className="str">"ARCHIVING:"</span>, echoes[0].id);{'\n'}
                <span className="line-num error-line">3</span>   <span className="fn">processEchoes</span>(echoes); <span className="comment">// &lt;-- RE-CURSES ON THE SAME STACK, FOREVER</span>{'\n'}
                <span className="line-num">4</span> &#125;{'\n'}
              </code>
            </pre>
            <div className="compiler-note">
              ⚠ STACK WARNING: governor v9 has re-processed iteration 1 since 2016 — no termination condition, no progress.
            </div>
          </div>

          {/* Solution Selector */}
          <div className="patch-selection-area">
            <h3 className="section-label">SELECT GOVERNOR REPAIR PATCH:</h3>
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
                      name="patchSelection"
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

          {/* Test Runner Results */}
          {testResults.ran && (
            <div className={`test-runner-console ${testResults.allPassed ? 'passed' : 'failed'}`}>
              <div className="console-title">
                {testResults.allPassed ? '✓ TEST SUITE PASSED (3/3) - GOVERNOR PATCH APPLIED' : '✕ TEST SUITE FAILED - RECURSION UNRESOLVED'}
              </div>
              <ul className="test-list">
                {testResults.tests.map((t, i) => (
                  <li key={i} className={`test-item ${t.passed ? 'pass' : 'fail'}`}>
                    <span className="test-icon">{t.passed ? '✓' : '✗'}</span>
                    <span className="test-name">{t.name}:</span>
                    <span className="test-out">{t.output}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn primary"
            onClick={handleRunTests}
            disabled={!selectedPatch || isCompiling || testResults.allPassed}
          >
            {isCompiling ? 'RUNNING TEST SUITE...' : testResults.allPassed ? 'GOVERNOR STABILIZED' : 'COMPILE & TEST PATCH [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
};
