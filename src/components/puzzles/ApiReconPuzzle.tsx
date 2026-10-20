import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface ApiReconPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const ApiReconPuzzle: React.FC<ApiReconPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  const [headerChoice, setHeaderChoice] = useState<string>('none');
  const [bypassFlag, setBypassFlag] = useState<boolean>(false);
  const [authLevel, setAuthLevel] = useState<number>(1);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [httpResponse, setHttpResponse] = useState<{
    status: number;
    statusText: string;
    body: string;
  } | null>(null);

  const handleSendRequest = () => {
    audioEngine.playClick();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      const isHeaderOk = headerChoice === 'OMEGA-7';
      const isBypassOk = bypassFlag === true;
      const isLevelOk = authLevel === 4;

      if (isHeaderOk && isBypassOk && isLevelOk) {
        audioEngine.playSuccess();
        setHttpResponse({
          status: 200,
          statusText: 'OK',
          body: JSON.stringify({
            status: "SUCCESS",
            access: "GRANTED",
            vaultProtocol: "UNLOCKED",
            payload: "RECORD_884_B_AUTHORIZED"
          }, null, 2)
        });
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        audioEngine.playError();
        if (onFail) onFail();
        let reason = '';
        if (!isHeaderOk) {
          reason = 'MISSING OR INVALID X-Protocol-Key HEADER (REQUIRED: OMEGA-7)';
        } else if (!isBypassOk) {
          reason = 'BYPASS POLICY DENIED (Expected bypass: true)';
        } else {
          reason = 'INSUFFICIENT AUTH LEVEL (Expected authLevel: 4)';
        }

        setHttpResponse({
          status: 422,
          statusText: 'Unprocessable Entity',
          body: JSON.stringify({
            error: "UNAUTHORIZED_REQUEST",
            code: 422,
            reason: reason
          }, null, 2)
        });
      }
    }, 500);
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel api-console-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">REST API SIMULATOR // VAULT_GATEWAY</div>
          <h2 className="puzzle-title">AUTHENTICATION API RECONSTRUCTION</h2>
          <p className="puzzle-subtitle">
            CONFIGURE HEADERS AND REQUEST PAYLOAD TO BYPASS RESTRICTED VAULT GATEWAY
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="api-puzzle-body">
          {/* Request Header Bar */}
          <div className="api-request-bar">
            <span className="http-method">POST</span>
            <span className="http-url">/api/v2/vault/auth</span>
          </div>

          <div className="api-split-container">
            {/* Request Builder */}
            <div className="api-builder-pane">
              <h3 className="section-label">REQUEST CONFIGURATION</h3>

              {/* Header Selector */}
              <div className="config-group">
                <label className="config-label">PROTOCOL SECURITY HEADER:</label>
                <select
                  className="sci-fi-select"
                  value={headerChoice}
                  onChange={(e) => {
                    audioEngine.playClick();
                    setHeaderChoice(e.target.value);
                  }}
                >
                  <option value="none">[NO SECURITY HEADER]</option>
                  <option value="ALPHA-1">X-Protocol-Key: ALPHA-1</option>
                  <option value="OMEGA-7">X-Protocol-Key: OMEGA-7 (FROM CRYO TOKEN)</option>
                  <option value="BETA-9">X-Protocol-Key: BETA-9</option>
                </select>
              </div>

              {/* Payload Options */}
              <div className="config-group">
                <label className="config-label">SUBJECT BYPASS FLAG:</label>
                <div className="radio-toggle-group">
                  <button
                    className={`toggle-btn ${!bypassFlag ? 'active' : ''}`}
                    onClick={() => {
                      audioEngine.playClick();
                      setBypassFlag(false);
                    }}
                  >
                    bypass: false
                  </button>
                  <button
                    className={`toggle-btn ${bypassFlag ? 'active' : ''}`}
                    onClick={() => {
                      audioEngine.playClick();
                      setBypassFlag(true);
                    }}
                  >
                    bypass: true
                  </button>
                </div>
              </div>

              <div className="config-group">
                <label className="config-label">REQUIRED AUTH LEVEL:</label>
                <div className="level-buttons-row">
                  {[1, 2, 3, 4].map((lvl) => (
                    <button
                      key={lvl}
                      className={`level-btn ${authLevel === lvl ? 'active' : ''}`}
                      onClick={() => {
                        audioEngine.playClick();
                        setAuthLevel(lvl);
                      }}
                    >
                      LEVEL {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Payload Preview */}
              <div className="payload-preview">
                <div className="preview-label">LIVE JSON PAYLOAD:</div>
                <pre>
                  <code>
                    {`{\n  "subjectId": "SUB-07",\n  "bypass": ${bypassFlag},\n  "authLevel": ${authLevel}\n}`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Response Viewer */}
            <div className="api-response-pane">
              <h3 className="section-label">GATEWAY HTTP RESPONSE</h3>
              {httpResponse ? (
                <div className={`response-box status-${httpResponse.status}`}>
                  <div className="response-status-line">
                    <span className="status-code">{httpResponse.status}</span>
                    <span className="status-text">{httpResponse.statusText}</span>
                  </div>
                  <pre className="response-body">
                    <code>{httpResponse.body}</code>
                  </pre>
                </div>
              ) : (
                <div className="response-placeholder">
                  [AWAITING HTTP DISPATCH...]
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn primary"
            onClick={handleSendRequest}
            disabled={isSending || httpResponse?.status === 200}
          >
            {isSending ? 'TRANSMITTING REQUEST...' : httpResponse?.status === 200 ? 'ACCESS AUTHORIZED' : 'SEND HTTP REQUEST [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
};
