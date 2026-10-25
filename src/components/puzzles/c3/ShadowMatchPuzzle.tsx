import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

type ShadowId = 'valve' | 'rack' | 'keypad' | 'antenna';

/** Shadow wall display order is deliberately misaligned with the manifest order. */
const SHADOW_DISPLAY_ORDER: ShadowId[] = ['keypad', 'antenna', 'valve', 'rack'];

const EQUIPMENT: { id: ShadowId; name: string; desc: string }[] = [
  { id: 'valve', name: 'COOLANT VALVE', desc: 'spoked manual wheel' },
  { id: 'rack', name: 'SERVER RACK', desc: 'forty-two blade slots' },
  { id: 'keypad', name: 'DOOR KEYPAD', desc: 'four-digit pin pad' },
  { id: 'antenna', name: 'ANTENNA MAST', desc: 'lattice broadcast tower' },
];

const TOTAL_PAIRS = 4;
const SHAKE_MS = 480;
const SUCCESS_MS = 1300;

type NoteKind = 'info' | 'fault' | 'good';
interface NoteState {
  text: string;
  kind: NoteKind;
}

/**
 * ECHOES OF AURELION — Archive Shadow Matching.
 * Four blurred silhouettes are projected on the archive wall; the player
 * selects a shadow, then the equipment card that cast it. Correct pairs lock
 * green; wrong pairs shake and count as a fault.
 */
export const ShadowMatchPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [selectedShadow, setSelectedShadow] = useState<ShadowId | null>(null);
  const [locked, setLocked] = useState<Partial<Record<ShadowId, boolean>>>({});
  const [shakeIds, setShakeIds] = useState<ShadowId[]>([]);
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState<NoteState | null>(null);

  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number): void => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const pairs = EQUIPMENT.filter((e) => locked[e.id]).length;

  const clickShadow = (id: ShadowId): void => {
    if (completed || locked[id]) return;
    audioEngine.playClick();
    if (selectedShadow === id) {
      setSelectedShadow(null);
    } else {
      setSelectedShadow(id);
      setNote({ text: 'SILHOUETTE SELECTED — NOW PICK THE EQUIPMENT THAT CAST IT', kind: 'info' });
    }
  };

  const clickEquipment = (id: ShadowId): void => {
    if (completed || locked[id] || !selectedShadow) return;
    if (id === selectedShadow) {
      audioEngine.playTone(660, 0.28);
      const nextLocked = { ...locked, [id]: true };
      setLocked(nextLocked);
      setSelectedShadow(null);
      const pairsNow = EQUIPMENT.filter((e) => nextLocked[e.id]).length;
      if (pairsNow >= TOTAL_PAIRS) {
        setCompleted(true);
        audioEngine.playSuccess();
        setNote({ text: 'ALL SHADOWS MATCHED — ARCHIVE INVENTORY VERIFIED', kind: 'good' });
        addTimer(onSuccess, SUCCESS_MS);
      } else {
        const eq = EQUIPMENT.find((e) => e.id === id);
        setNote({ text: `MATCH LOCKED — ${eq ? eq.name : id.toUpperCase()}`, kind: 'good' });
      }
    } else {
      audioEngine.playError();
      onFail?.();
      setShakeIds([selectedShadow, id]);
      addTimer(() => setShakeIds([]), SHAKE_MS);
      setSelectedShadow(null);
      setNote({ text: 'MISMATCH — THAT SHADOW DOES NOT BELONG TO THAT EQUIPMENT', kind: 'fault' });
    }
  };

  /** Pure-CSS silhouette shapes. */
  const renderShape = (id: ShadowId, c: string): React.ReactNode => {
    if (id === 'valve') {
      // Circle with 6 spokes.
      return (
        <div className="shadow-valve" style={{ position: 'relative', width: 84, height: 84 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `6px solid ${c}` }} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 5,
                height: 37,
                marginLeft: -2.5,
                marginTop: -37,
                background: c,
                borderRadius: 2,
                transformOrigin: '50% 100%',
                transform: `rotate(${i * 60}deg)`,
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 14,
              height: 14,
              marginLeft: -7,
              marginTop: -7,
              borderRadius: '50%',
              background: c,
            }}
          />
        </div>
      );
    }
    if (id === 'rack') {
      // Tall rectangle with horizontal slot stripes.
      return (
        <div
          className="shadow-rack"
          style={{
            width: 58,
            height: 104,
            borderRadius: 5,
            border: `5px solid ${c}`,
            background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, ${c} 6px, ${c} 10px)`,
          }}
        />
      );
    }
    if (id === 'keypad') {
      // Small rounded square with a pin-pad dot grid.
      return (
        <div
          className="shadow-keypad"
          style={{
            width: 62,
            height: 62,
            borderRadius: 11,
            border: `5px solid ${c}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            placeItems: 'center',
            padding: 8,
          }}
        >
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
          ))}
        </div>
      );
    }
    // Antenna: triangle lattice via repeating-linear-gradient.
    return (
      <div
        className="shadow-antenna"
        style={{
          width: 84,
          height: 112,
          clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
          background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.65) 0px, rgba(255,255,255,0.65) 3px, transparent 3px, transparent 10px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.65) 0px, rgba(255,255,255,0.65) 3px, transparent 3px, transparent 10px),
            ${c}`,
        }}
      />
    );
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <style>{`
        @keyframes c3-sh-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(7px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(3px); }
        }
      `}</style>
      <div className="puzzle-panel shadow-wall-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">ECHOES OF AURELION // SHADOW PROJECTION WALL</div>
          <h2 className="puzzle-title">ARCHIVE SHADOW MATCHING</h2>
          <p className="puzzle-subtitle">
            FOUR SILHOUETTES, FOUR PIECES OF EQUIPMENT — SELECT A SHADOW, THEN THE EQUIPMENT CARD THAT CAST IT.
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="shadow-body">
          <div
            className="shadow-counter"
            style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: 2, color: '#c084fc', paddingBottom: 10 }}
          >
            PAIRS: {pairs}/{TOTAL_PAIRS}
          </div>

          <div className="shadow-columns" style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
            {/* Left column — shadow silhouettes */}
            <div className="shadow-wall" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(167,139,250,0.6)', textAlign: 'center', paddingBottom: 6 }}>
                SHADOW WALL
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {SHADOW_DISPLAY_ORDER.map((id) => {
                  const isSelected = selectedShadow === id;
                  const isLocked = Boolean(locked[id]);
                  return (
                    <button
                      key={id}
                      className={`shadow-cell shadow-cell-${id}${isSelected ? ' selected' : ''}${isLocked ? ' locked' : ''}`}
                      onClick={() => clickShadow(id)}
                      disabled={isLocked || completed}
                      style={{
                        height: 132,
                        borderRadius: 10,
                        border: `2px solid ${
                          isLocked ? 'rgba(74,222,128,0.75)' : isSelected ? 'rgba(192,132,252,0.95)' : 'rgba(167,139,250,0.28)'
                        }`,
                        background: isLocked ? 'rgba(20,83,45,0.25)' : isSelected ? 'rgba(139,92,246,0.16)' : 'rgba(24,18,46,0.6)',
                        boxShadow: isSelected ? '0 0 0 3px rgba(192,132,252,0.35), 0 0 20px rgba(192,132,252,0.35)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isLocked || completed ? 'default' : 'pointer',
                      }}
                    >
                      <div
                        className="shadow-silhouette"
                        style={{
                          filter: isLocked
                            ? 'drop-shadow(0 0 8px rgba(74,222,128,0.8))'
                            : 'blur(2px) brightness(0.3)',
                        }}
                      >
                        {renderShape(id, isLocked ? '#4ade80' : '#cbd5e1')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right column — equipment manifest */}
            <div className="equipment-manifest" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(167,139,250,0.6)', textAlign: 'center', paddingBottom: 6 }}>
                EQUIPMENT MANIFEST
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {EQUIPMENT.map((eq) => {
                  const isLocked = Boolean(locked[eq.id]);
                  return (
                    <button
                      key={eq.id}
                      className={`equipment-card equipment-card-${eq.id}${isLocked ? ' locked' : ''}`}
                      onClick={() => clickEquipment(eq.id)}
                      disabled={isLocked || completed}
                      style={{
                        height: 132,
                        borderRadius: 10,
                        padding: '10px 8px',
                        border: `2px solid ${isLocked ? 'rgba(74,222,128,0.75)' : 'rgba(167,139,250,0.3)'}`,
                        background: isLocked ? 'rgba(20,83,45,0.25)' : 'rgba(30,22,58,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        cursor: isLocked || completed ? 'default' : 'pointer',
                        animation: shakeIds.includes(eq.id) ? 'c3-sh-shake 0.45s ease' : undefined,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: isLocked ? '#86efac' : '#e9d5ff', letterSpacing: 1, textAlign: 'center' }}>
                        {eq.name}
                      </span>
                      <span style={{ fontSize: 9.5, fontStyle: 'italic', color: 'rgba(196,181,253,0.7)', textAlign: 'center' }}>
                        {eq.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {note && (
            <div
              className={`shadow-note ${note.kind}`}
              style={{
                textAlign: 'center',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
                letterSpacing: 1,
                color: note.kind === 'fault' ? '#f87171' : note.kind === 'good' ? '#4ade80' : '#c4b5fd',
                background:
                  note.kind === 'fault'
                    ? 'rgba(127,29,29,0.25)'
                    : note.kind === 'good'
                      ? 'rgba(20,83,45,0.25)'
                      : 'rgba(76,29,149,0.2)',
                border: `1px solid ${
                  note.kind === 'fault'
                    ? 'rgba(248,113,113,0.5)'
                    : note.kind === 'good'
                      ? 'rgba(74,222,128,0.5)'
                      : 'rgba(167,139,250,0.4)'
                }`,
              }}
            >
              {note.kind === 'fault' ? '✕ ' : note.kind === 'good' ? '✓ ' : '▸ '}
              {note.text}
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn primary"
            onClick={() => {
              audioEngine.playClick();
              setSelectedShadow(null);
            }}
            disabled={!selectedShadow || completed}
          >
            {completed ? 'MATCH COMPLETE' : 'CLEAR SELECTION'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
