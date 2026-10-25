import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

const SOURCES = ['TRUNK-A', 'TRUNK-B', 'TRUNK-C', 'TRUNK-D', 'TRUNK-E'] as const;
const DESTINATIONS = ['PREAMP-1', 'PREAMP-2', 'FILTER-1', 'MOD-3', 'PA-2'] as const;

type Source = (typeof SOURCES)[number];
type Destination = (typeof DESTINATIONS)[number];

const CORRECT_ROUTING: Record<Source, Destination> = {
  'TRUNK-A': 'PREAMP-2',
  'TRUNK-B': 'FILTER-1',
  'TRUNK-C': 'PREAMP-1',
  'TRUNK-D': 'MOD-3',
  'TRUNK-E': 'PA-2',
};

const CABLE_PALETTE = ['#22d3ee', '#f59e0b', '#4ade80', '#f472b6', '#a78bfa'];

interface Cable {
  id: string;
  source: Source;
  dest: Destination;
  color: string;
}

const FIELD_ROWS = SOURCES.length;
const FIELD_ROW_H = 58;
const FIELD_HEIGHT = FIELD_ROWS * FIELD_ROW_H; // 290
// SVG viewBox width (stretched horizontally to the field with preserveAspectRatio="none")
const FIELD_VB_W = 520;
const CABLE_X_LEFT = 132; // tucks under the source port buttons
const CABLE_X_RIGHT = FIELD_VB_W - 132;
const CABLE_MID_X = FIELD_VB_W / 2;

const portCenterY = (index: number) => index * FIELD_ROW_H + FIELD_ROW_H / 2;

const portButtonStyle = (selected: boolean, connected: boolean): React.CSSProperties => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  background: selected
    ? 'rgba(0, 229, 255, 0.18)'
    : connected
      ? 'rgba(74, 222, 128, 0.10)'
      : 'rgba(10, 15, 29, 0.9)',
  border: `1px solid ${selected ? 'var(--accent-cyan, #00e5ff)' : connected ? 'rgba(74, 222, 128, 0.55)' : 'var(--border-metal, #334155)'}`,
  borderRadius: 8,
  color: selected ? '#fff' : 'var(--text-main, #cbd5e1)',
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: 12,
  letterSpacing: 1.5,
  cursor: 'pointer',
  boxShadow: selected ? '0 0 14px rgba(0, 229, 255, 0.45)' : 'none',
  transition: 'all 0.18s',
  padding: '0 8px',
  textAlign: 'center',
});

/**
 * GHOST SIGNAL — Relay Patch Panel Re-Route.
 * Click a SOURCE trunk, then a DESTINATION port to run a patch cable.
 * Certified routing lives in the Relay Trunk Schematic [TAB].
 */
export const PatchPanelPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [cables, setCables] = useState<Cable[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [status, setStatus] = useState<'open' | 'flashing' | 'success'>('open');
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const timeoutsRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  };

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  const cableForSource = (src: Source) => cables.find((c) => c.source === src);
  const cableForDest = (dest: Destination) => cables.find((c) => c.dest === dest);

  const removeCable = (id: string) => {
    setCables((prev) => prev.filter((c) => c.id !== id));
    setWrongIds((prev) => prev.filter((wid) => wid !== id));
    setSelectedSource(null);
    audioEngine.playValve();
  };

  const handleSourceClick = (src: Source) => {
    if (status === 'success') return;
    const existing = cableForSource(src);
    if (existing) {
      removeCable(existing.id);
      return;
    }
    audioEngine.playClick();
    setSelectedSource((cur) => (cur === src ? null : src));
  };

  const handleDestClick = (dest: Destination) => {
    if (status === 'success') return;
    const existing = cableForDest(dest);
    if (existing) {
      removeCable(existing.id);
      return;
    }
    if (!selectedSource) {
      audioEngine.playClick();
      return;
    }
    audioEngine.playSwitch();
    setCables((prev) => [
      ...prev,
      {
        id: `${selectedSource}-${dest}`,
        source: selectedSource,
        dest,
        color: CABLE_PALETTE[prev.length % CABLE_PALETTE.length],
      },
    ]);
    setWrongIds((prev) => prev.filter((wid) => wid !== `${selectedSource}-${dest}`));
    setSelectedSource(null);
  };

  const allPatched = cables.length === SOURCES.length;

  const handleValidate = () => {
    if (status === 'success' || !allPatched) return;
    const bad = cables.filter((c) => CORRECT_ROUTING[c.source] !== c.dest);
    if (bad.length === 0) {
      setStatus('success');
      setSelectedSource(null);
      cables.forEach((_, i) => {
        later(() => audioEngine.playSwitch(), i * 140);
      });
      later(() => audioEngine.playPowerRestore(), 5 * 140 + 120);
      later(() => onSuccess(), 1500);
    } else {
      audioEngine.playError();
      onFail?.();
      setWrongIds(bad.map((c) => c.id));
      setStatus('flashing');
      later(() => setStatus('open'), 1200);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel patch-bay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">GHOST SIGNAL // RELAY TRUNK PATCH BAY</div>
          <h2 className="puzzle-title">RELAY PATCH PANEL RE-ROUTE</h2>
          <p className="puzzle-subtitle">
            CLICK A SOURCE TRUNK, THEN A DESTINATION PORT — RUN ALL FIVE CARRIER PATCHES. CLICK A CONNECTED PORT TO PULL ITS CABLE.
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {/* Patch field: source column | cable SVG | destination column */}
          <div
            style={{
              position: 'relative',
              height: FIELD_HEIGHT,
              background:
                'repeating-linear-gradient(0deg, rgba(245, 158, 11, 0.05) 0px, rgba(245, 158, 11, 0.05) 1px, transparent 1px, transparent 29px)',
              border: '1px solid var(--border-metal, #334155)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            {/* Cable layer */}
            <svg
              viewBox={`0 0 ${FIELD_VB_W} ${FIELD_HEIGHT}`}
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              aria-hidden="true"
            >
              {cables.map((cable) => {
                const srcIdx = SOURCES.indexOf(cable.source);
                const dstIdx = DESTINATIONS.indexOf(cable.dest);
                const y1 = portCenterY(srcIdx);
                const y2 = portCenterY(dstIdx);
                const isWrong = wrongIds.includes(cable.id);
                const stroke = status === 'flashing' && isWrong ? '#ef4444' : cable.color;
                const path = `M ${CABLE_X_LEFT} ${y1} C ${CABLE_MID_X} ${y1}, ${CABLE_MID_X} ${y2}, ${CABLE_X_RIGHT} ${y2}`;
                return (
                  <path
                    key={cable.id}
                    d={path}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={status === 'flashing' && isWrong ? 5 : 3}
                    strokeDasharray={isWrong && status === 'open' ? '7 5' : undefined}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    opacity={0.95}
                  >
                    {status === 'flashing' && isWrong && (
                      <animate attributeName="opacity" values="1;0.25;1" dur="0.4s" repeatCount="indefinite" />
                    )}
                  </path>
                );
              })}
            </svg>

            {/* SOURCE column */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '28%',
                display: 'flex',
                flexDirection: 'column',
                padding: 6,
                gap: 4,
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 9,
                  letterSpacing: 2,
                  color: 'var(--accent-gold, #fbbf24)',
                  textAlign: 'center',
                  lineHeight: '14px',
                }}
              >
                SOURCE
              </span>
              {SOURCES.map((src) => {
                const connected = !!cableForSource(src);
                const flagged =
                  status !== 'success' &&
                  wrongIds.some((wid) => cables.find((c) => c.id === wid)?.source === src);
                const base = portButtonStyle(selectedSource === src, connected);
                return (
                  <div key={src} style={{ flex: 1, display: 'flex', padding: 2 }}>
                    <button
                      type="button"
                      className="patch-port"
                      style={flagged ? { ...base, border: '1px solid rgba(239, 68, 68, 0.7)' } : base}
                      onClick={() => handleSourceClick(src)}
                      disabled={status === 'success'}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: connected ? '#4ade80' : selectedSource === src ? '#00e5ff' : '#475569',
                          boxShadow: connected ? '0 0 6px #4ade80' : 'none',
                          flexShrink: 0,
                        }}
                      />
                      {src}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* DESTINATION column */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '28%',
                display: 'flex',
                flexDirection: 'column',
                padding: 6,
                gap: 4,
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 9,
                  letterSpacing: 2,
                  color: 'var(--accent-gold, #fbbf24)',
                  textAlign: 'center',
                  lineHeight: '14px',
                }}
              >
                DEST
              </span>
              {DESTINATIONS.map((dest) => {
                const connected = !!cableForDest(dest);
                return (
                  <div key={dest} style={{ flex: 1, display: 'flex', padding: 2 }}>
                    <button
                      type="button"
                      className="patch-port"
                      style={portButtonStyle(false, connected)}
                      onClick={() => handleDestClick(dest)}
                      disabled={status === 'success'}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: connected ? '#4ade80' : '#475569',
                          boxShadow: connected ? '0 0 6px #4ade80' : 'none',
                          flexShrink: 0,
                        }}
                      />
                      {dest}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status readout row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              letterSpacing: 1.5,
              color: 'var(--text-muted, #94a3b8)',
            }}
          >
            <span>
              PATCHES: <span style={{ color: allPatched ? '#4ade80' : 'var(--accent-cyan, #00e5ff)' }}>{cables.length}/5</span>
            </span>
            <span style={{ color: selectedSource ? 'var(--accent-cyan, #00e5ff)' : 'var(--text-muted, #94a3b8)' }}>
              {selectedSource ? `SELECTED: ${selectedSource} — PICK A DEST PORT` : 'SELECT A SOURCE TRUNK'}
            </span>
          </div>

          {/* Hint chip */}
          <div
            className="patch-hint-chip"
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              letterSpacing: 1,
              color: 'var(--accent-gold, #fbbf24)',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px dashed rgba(245, 158, 11, 0.45)',
              borderRadius: 6,
              padding: '8px 12px',
            }}
          >
            ⌗ HINT: CERTIFIED ROUTING IS PRINTED IN THE RELAY TRUNK SCHEMATIC [TAB]
          </div>

          {status === 'flashing' && (
            <div
              className="patch-fault-note"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 12,
                letterSpacing: 1,
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: 6,
                padding: '10px 12px',
              }}
            >
              ✕ ROUTING FAULT — {wrongIds.length} OF 5 PAIRS INCORRECT. BAD PATCHES FLASHING RED: PULL THEM AND RE-PATCH.
            </div>
          )}
          {status === 'success' && (
            <div
              className="patch-success-note"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 12,
                letterSpacing: 1,
                color: '#86efac',
                background: 'rgba(74, 222, 128, 0.10)',
                border: '1px solid rgba(74, 222, 128, 0.5)',
                borderRadius: 6,
                padding: '10px 12px',
              }}
            >
              ✓ CARRIER CHAIN RESTORED — ALL 5 PAIRS CERTIFIED. SIGNAL FLOWS TO THE TUNING RACK.
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn primary" onClick={handleValidate} disabled={!allPatched || status === 'success'}>
            {status === 'success' ? 'ROUTING CERTIFIED' : 'VALIDATE ROUTING [CHECK]'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
