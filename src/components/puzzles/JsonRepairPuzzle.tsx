import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface JsonRepairPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const JsonRepairPuzzle: React.FC<JsonRepairPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  // 3 Fixes that need to be applied
  const [fixQuotes, setFixQuotes] = useState<boolean>(false);
  const [fixComma, setFixComma] = useState<boolean>(false);
  const [fixBrace, setFixBrace] = useState<boolean>(false);
  const [status, setStatus] = useState<'editing' | 'success' | 'error'>('editing');
  const [parseError, setParseError] = useState<string | null>(null);

  const getJsonString = () => {
    const archiveVal = fixQuotes ? '"884-B"' : '884-B';
    const commaVal = fixComma ? ',' : '';
    const braceVal = fixBrace ? '}' : '';

    return `{\n  "subject": "SUB-07",\n  "archiveId": ${archiveVal},\n  "iterations": 72${commaVal}\n  "status": "RECURSIVE"\n${braceVal}`;
  };

  const handleValidate = () => {
    audioEngine.playClick();
    const currentJson = getJsonString();

    try {
      JSON.parse(currentJson);
      audioEngine.playSuccess();
      setStatus('success');
      setParseError(null);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      audioEngine.playError();
      setStatus('error');
      setParseError(err.message || 'JSON Parse SyntaxError: Unexpected token');
      if (onFail) onFail();
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel terminal-code-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">DATA RECOVERY // RECORD_884_B.JSON</div>
          <h2 className="puzzle-title">CORRUPTED JSON RECORD EXTRACTION</h2>
          <p className="puzzle-subtitle">
            RESOLVE PARSER SYNTAX ERRORS (STRINGS, COMMAS, CLOSING DELIMITERS) TO PARSE THE DOSSIER
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="json-puzzle-body">
          {/* Editor Display */}
          <div className="code-editor-window">
            <div className="editor-tab-bar">
              <span className="tab-item alert">classified_record_884b.json</span>
              <span className="tab-item status-tag">{status.toUpperCase()}</span>
            </div>
            <pre className="code-snippet">
              <code>
                <span className="line-num">1</span> &#123;{'\n'}
                <span className="line-num">2</span>   <span className="str">"subject"</span>: <span className="str">"SUB-07"</span>,{'\n'}
                <span className={`line-num ${!fixQuotes ? 'error-line' : ''}`}>3</span>   <span className="str">"archiveId"</span>: <span className={fixQuotes ? "str" : "syntax-error"}>{fixQuotes ? '"884-B"' : '884-B'}</span>,{'\n'}
                <span className={`line-num ${!fixComma ? 'error-line' : ''}`}>4</span>   <span className="str">"iterations"</span>: <span className="num">72</span><span className={fixComma ? '' : 'syntax-error'}>{fixComma ? ',' : ' '}</span>{'\n'}
                <span className="line-num">5</span>   <span className="str">"status"</span>: <span className="str">"RECURSIVE"</span>{'\n'}
                <span className={`line-num ${!fixBrace ? 'error-line' : ''}`}>6</span> {fixBrace ? '}' : '<MISSING EOF>'}
              </code>
            </pre>
            {parseError && (
              <div className="json-error-banner">
                ⚠ {parseError}
              </div>
            )}
          </div>

          {/* Fix Action Toggles */}
          <div className="json-fixes-rack">
            <h3 className="section-label">SYNTAX REPAIR MODULES</h3>
            <div className="fix-toggle-list">
              <button
                className={`fix-toggle-btn ${fixQuotes ? 'applied' : ''}`}
                onClick={() => {
                  audioEngine.playSwitch();
                  setFixQuotes(!fixQuotes);
                  setStatus('editing');
                }}
              >
                <span className="fix-checkbox">{fixQuotes ? '✓' : '○'}</span>
                <span className="fix-title">FIX #1: Wrap `884-B` in string quotes (`"884-B"`)</span>
              </button>

              <button
                className={`fix-toggle-btn ${fixComma ? 'applied' : ''}`}
                onClick={() => {
                  audioEngine.playSwitch();
                  setFixComma(!fixComma);
                  setStatus('editing');
                }}
              >
                <span className="fix-checkbox">{fixComma ? '✓' : '○'}</span>
                <span className="fix-title">FIX #2: Insert comma after `"iterations": 72`</span>
              </button>

              <button
                className={`fix-toggle-btn ${fixBrace ? 'applied' : ''}`}
                onClick={() => {
                  audioEngine.playSwitch();
                  setFixBrace(!fixBrace);
                  setStatus('editing');
                }}
              >
                <span className="fix-checkbox">{fixBrace ? '✓' : '○'}</span>
                <span className="fix-title">FIX #3: Add closing brace `&#125;` at EOF</span>
              </button>
            </div>

            {status === 'success' && (
              <div className="status-box success">
                ✓ JSON PARSED SUCCESSFULLY // RESTRICTED RECORD 884-B EXTRACTED
              </div>
            )}
          </div>
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn primary"
            onClick={handleValidate}
            disabled={status === 'success'}
          >
            {status === 'success' ? 'RECORD DECRYPTED' : 'VALIDATE & PARSE JSON [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
};
