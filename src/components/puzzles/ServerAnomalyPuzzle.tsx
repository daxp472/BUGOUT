import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface ServerAnomalyPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const ServerAnomalyPuzzle: React.FC<ServerAnomalyPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');

  const nodes = [
    { id: 1, name: 'NODE-01', parity: '0xAA-SYNC', loss: '0.0%', ping: '1.8ms', firmware: 'v9.4.1', isAnomalous: false },
    { id: 2, name: 'NODE-02', parity: '0xAA-SYNC', loss: '0.0%', ping: '2.1ms', firmware: 'v9.4.1', isAnomalous: false },
    { id: 3, name: 'NODE-03', parity: '0xAA-SYNC', loss: '0.1%', ping: '1.9ms', firmware: 'v9.4.1', isAnomalous: false },
    { id: 4, name: 'NODE-04', parity: '0x55-DESYNC', loss: '44.8%', ping: '84.2ms', firmware: 'v8.1.0-LEGACY', isAnomalous: true },
    { id: 5, name: 'NODE-05', parity: '0xAA-SYNC', loss: '0.0%', ping: '2.0ms', firmware: 'v9.4.1', isAnomalous: false },
    { id: 6, name: 'NODE-06', parity: '0xAA-SYNC', loss: '0.0%', ping: '1.9ms', firmware: 'v9.4.1', isAnomalous: false },
  ];

  const handleIsolateNode = () => {
    if (selectedNode === null || status !== 'idle') return;
    audioEngine.playClick();
    setStatus('analyzing');

    setTimeout(() => {
      const target = nodes.find((n) => n.id === selectedNode);
      if (target?.isAnomalous) {
        audioEngine.playSuccess();
        setStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        audioEngine.playError();
        setStatus('error');
        if (onFail) onFail();
        setTimeout(() => {
          setStatus('idle');
        }, 1200);
      }
    }, 600);
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel server-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">DATA CORE // TELEMETRY PROFILER</div>
          <h2 className="puzzle-title">ROGUE SERVER NODE ISOLATION</h2>
          <p className="puzzle-subtitle">
            SCAN RACK TELEMETRY TO IDENTIFY THE NODE CONTRADICTING CHECKSUM & FIRMWARE PARITY
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="server-puzzle-body">
          <div className="nodes-grid">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`node-card ${selectedNode === node.id ? 'selected' : ''}`}
                onClick={() => {
                  if (status === 'idle') {
                    audioEngine.playClick();
                    setSelectedNode(node.id);
                  }
                }}
              >
                <div className="node-card-header">
                  <span className="node-led" />
                  <span className="node-name">{node.name}</span>
                </div>
                <div className="node-metrics">
                  <div className="metric-row">
                    <span className="m-label">PARITY:</span>
                    <span className={`m-val ${node.parity.includes('DESYNC') ? 'anomaly' : ''}`}>
                      {node.parity}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="m-label">PACKET LOSS:</span>
                    <span className={`m-val ${parseFloat(node.loss) > 10 ? 'anomaly' : ''}`}>
                      {node.loss}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="m-label">LATENCY:</span>
                    <span className="m-val">{node.ping}</span>
                  </div>
                  <div className="metric-row">
                    <span className="m-label">FIRMWARE:</span>
                    <span className={`m-val ${node.firmware.includes('LEGACY') ? 'anomaly' : ''}`}>
                      {node.firmware}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedNode && (
            <div className="selected-node-inspector">
              <span className="inspector-title">SELECTED TARGET: NODE-0{selectedNode}</span>
              <span className="inspector-desc">
                {selectedNode === 4
                  ? '⚠ ALERT: Parity mismatch (0x55 vs 0xAA) with 44.8% packet drop! Foreign trace detected.'
                  : 'STATUS: Standard hash parity matching cluster baseline.'}
              </span>
            </div>
          )}

          {status === 'success' && (
            <div className="status-box success">
              ✓ ROGUE NODE 04 ISOLATED // NETWORK TRACE ROUTED TO API CONSOLE
            </div>
          )}
          {status === 'error' && (
            <div className="status-box warning">
              ✕ CHECKSUM VERIFIED NOMINAL: THIS IS NOT THE ROGUE NODE
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn primary"
            onClick={handleIsolateNode}
            disabled={selectedNode === null || status !== 'idle'}
          >
            {status === 'analyzing' ? 'ISOLATING RACK BUS...' : 'ISOLATE SELECTED NODE [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
};
