import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface CodeBugPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const CodeBugPuzzle: React.FC<CodeBugPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  // Candidate patches
  const patches = [
    {
      id: 'patch_1',
      label: 'Replace `=` with `===` (Strict equality comparison)',
      code: `function canAccess(user) {\n  return user.role === "admin";\n}`,
      explanation: 'Replaces assignment operator with strict comparison so guests are not mutated into admins.',
      isCorrect: true,
    },
    {
      id: 'patch_2',
      label: 'Force truthy with `!` inversion',
      code: `function canAccess(user) {\n  return !user.role;\n}`,
      explanation: 'Inverts truthiness, which breaks when user has any valid role string.',
      isCorrect: false,
    },
    {
      id: 'patch_3',
      label: 'Bypass role check and check ID length',
      code: `function canAccess(user) {\n  return user.id.length > 0;\n}`,
      explanation: 'Grants access to any entity with an ID, violating the security protocol.',
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

  const handleRunTests = () => {
    if (!selectedPatch) {
      audioEngine.playError();
      return;
    }

    setIsCompiling(true);
    audioEngine.playClick();

    setTimeout(() => {
      setIsCompiling(false);
      const chosen = patches.find((p) => p.id === selectedPatch);
      if (chosen?.isCorrect) {
        audioEngine.playSuccess();
        setTestResults({
          ran: true,
          allPassed: true,
          tests: [
            { name: 'verifyAdminAccess({ role: "admin" })', passed: true, output: 'Returns true [PASS]' },
            { name: 'rejectGuestUser({ role: "guest" })', passed: true, output: 'Returns false [PASS]' },
            { name: 'rejectSubject({ role: "subject_07" })', passed: true, output: 'Returns false [PASS]' }
          ]
        });
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        audioEngine.playError();
        if (onFail) onFail();
        setTestResults({
          ran: true,
          allPassed: false,
          tests: [
            { name: 'verifyAdminAccess({ role: "admin" })', passed: true, output: 'Returns true [PASS]' },
            { name: 'rejectGuestUser({ role: "guest" })', passed: false, output: 'Expected false, got true [FAIL]' },
            { name: 'rejectSubject({ role: "subject_07" })', passed: false, output: 'Security violation [FAIL]' }
          ]
        });
      }
    }, 600);
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel terminal-code-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">SECURITY KERNEL // AUTH_GATEWAY.JS</div>
          <h2 className="puzzle-title">JAVASCRIPT AUTHORIZATION BUG DETECTED</h2>
          <p className="puzzle-subtitle">
            DIAGNOSE WHY GUEST USERS ILLEGITIMATELY PASS AUTHENTICATION CHECKS
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="code-puzzle-container">
          {/* Source Code View */}
          <div className="code-editor-window">
            <div className="editor-tab-bar">
              <span className="tab-item active">authGateway.js</span>
              <span className="tab-item alert">1 VULNERABILITY DETECTED</span>
            </div>
            <pre className="code-snippet">
              <code>
                <span className="line-num">1</span> <span className="kw">function</span> <span className="fn">canAccess</span>(user) &#123;{'\n'}
                <span className="line-num error-line">2</span>   <span className="kw">return</span> user.role = <span className="str">"admin"</span>; <span className="comment">// &lt;-- VULNERABLE ASSIGNMENT</span>{'\n'}
                <span className="line-num">3</span> &#125;{'\n'}
              </code>
            </pre>
            <div className="compiler-note">
              ⚠ LINT WARNING: Assignment inside return statement assigns "admin" to user.role and always evaluates to truthy!
            </div>
          </div>

          {/* Solution Selector */}
          <div className="patch-selection-area">
            <h3 className="section-label">SELECT SECURITY REPAIR PATCH:</h3>
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
                {testResults.allPassed ? '✓ TEST SUITE PASSED (3/3) - PATCH APPLIED' : '✕ TEST SUITE FAILED - SECURITY COMPROMISED'}
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
            {isCompiling ? 'RUNNING TEST SUITE...' : testResults.allPassed ? 'AUTHORIZATION VERIFIED' : 'COMPILE & TEST PATCH [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
};
