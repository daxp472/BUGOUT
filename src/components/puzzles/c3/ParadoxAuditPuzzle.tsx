import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

interface CrystalRecording {
  id: number;
  label: string;
  quote: string;
}

const CRYSTALS: CrystalRecording[] = [
  { id: 1, label: '01', quote: '"The lever was never pulled. The doors stayed sealed."' },
  { id: 2, label: '02', quote: '"I watched the console for hours. Nothing executed."' },
  { id: 3, label: '03', quote: '"I pulled it. The dark lasted four seconds."' },
  { id: 4, label: '04', quote: '"Consensus holds. Protocol purge never executed."' },
  { id: 5, label: '05', quote: '"I pulled it. The doors opened onto snow."' },
  { id: 6, label: '06', quote: '"The archive is clear. No final directive was given."' },
];

/** The two recordings from the pruned timeline. */
const PARADOX_PAIR = [3, 5];
const REQUIRED_SELECTIONS = 2;
const SUCCESS_MS = 1400;

type NoteKind = 'info' | 'fault' | 'good';
interface NoteState {
  text: string;
  kind: NoteKind;
}

/**
 * ECHOES OF AURELION — Paradox Recording Audit.
 * Six suspended crystals loop their testimony. Exactly two contradict the
 * archive consensus; select exactly two and flag them. Crystals 03 and 05
 * originate from the pruned timeline.
 */
export const ParadoxAuditPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [flagged, setFlagged] = useState<number[]>([]);
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

  const toggleCrystal = (id: number): void => {
    if (completed || flagged.includes(id)) return;
    audioEngine.playClick();
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= REQUIRED_SELECTIONS) return prev;
      return [...prev, id];
    });
    setNote(null);
  };

  const flagParadoxes = (): void => {
    if (completed || selected.length !== REQUIRED_SELECTIONS) return;
    const sorted = [...selected].sort((a, b) => a - b);
    if (sorted[0] === PARADOX_PAIR[0] && sorted[1] === PARADOX_PAIR[1]) {
      setFlagged(sorted);
      setCompleted(true);
      audioEngine.playSuccess();
      setNote({ text: 'TWO DIVERGENT TIMELINES QUARANTINED', kind: 'good' });
      addTimer(onSuccess, SUCCESS_MS);
    } else {
      audioEngine.playError();
      onFail?.();
      setNote({ text: 'CONSENSUS HOLDS ON THOSE CRYSTALS — AUDIT AGAIN', kind: 'fault' });
      setSelected([]);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <style>{`
        @keyframes c3-pa-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
      `}</style>
      <div className="puzzle-panel paradox-audit-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">ECHOES OF AURELION // PARADOX GALLERY</div>
          <h2 className="puzzle-title">PARADOX RECORDING AUDIT</h2>
          <p className="puzzle-subtitle">
            SIX CRYSTALS LOOP THEIR TESTIMONY — SELECT EXACTLY TWO, THEN FLAG THE RECORDINGS THAT CONTRADICT THE CONSENSUS.
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="paradox-body">
          <div
            className="paradox-brief"
            style={{ textAlign: 'center', fontSize: 11, letterSpacing: 1, color: 'rgba(196,181,253,0.85)', paddingBottom: 6 }}
          >
            EXACTLY TWO RECORDINGS CONTRADICT THE ARCHIVE CONSENSUS. — SELECTED: {selected.length}/{REQUIRED_SELECTIONS}
          </div>

          {/* Suspended playback crystals */}
          <div
            className="paradox-rack"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, justifyItems: 'center', padding: '10px 0 16px' }}
          >
            {CRYSTALS.map((cr, i) => {
              const isSelected = selected.includes(cr.id);
              const isFlagged = flagged.includes(cr.id);
              const floatDuration = 3.8 + (i % 3) * 0.6;
              return (
                <button
                  key={cr.id}
                  className={`paradox-crystal paradox-crystal-${cr.id}${isSelected ? ' selected' : ''}${isFlagged ? ' flagged' : ''}`}
                  onClick={() => toggleCrystal(cr.id)}
                  disabled={completed || isFlagged}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 6px',
                    cursor: completed || isFlagged ? 'default' : 'pointer',
                    animation: `c3-pa-float ${floatDuration}s ease-in-out ${i * 0.35}s infinite`,
                  }}
                >
                  {/* Rotated square = suspended diamond; inner content counter-rotated */}
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      transform: 'rotate(45deg)',
                      borderRadius: 10,
                      border: `2px solid ${
                        isFlagged ? 'rgba(248,113,113,0.95)' : isSelected ? '#e9d5ff' : 'rgba(167,139,250,0.55)'
                      }`,
                      background: isFlagged
                        ? 'repeating-linear-gradient(45deg, rgba(239,68,68,0.3) 0px, rgba(239,68,68,0.3) 7px, rgba(60,10,15,0.6) 7px, rgba(60,10,15,0.6) 14px)'
                        : isSelected
                          ? 'linear-gradient(135deg, rgba(216,180,254,0.55), rgba(139,92,246,0.4))'
                          : 'linear-gradient(135deg, rgba(88,68,140,0.45), rgba(30,22,58,0.78))',
                      boxShadow: isFlagged
                        ? '0 0 20px rgba(239,68,68,0.55)'
                        : isSelected
                          ? '0 0 0 3px rgba(192,132,252,0.35), 0 0 22px rgba(192,132,252,0.5)'
                          : '0 0 12px rgba(139,92,246,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        transform: 'rotate(-45deg)',
                        width: 112,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        textAlign: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 2,
                          color: isFlagged ? '#fca5a5' : isSelected ? '#f5f3ff' : '#c4b5fd',
                        }}
                      >
                        {cr.label}
                      </span>
                      <span
                        style={{
                          fontSize: 8.5,
                          lineHeight: 1.35,
                          color: isFlagged ? '#fecaca' : isSelected ? '#ede9fe' : 'rgba(196,181,253,0.78)',
                        }}
                      >
                        {cr.quote}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {note && (
            <div
              className={`paradox-note ${note.kind}`}
              style={{
                textAlign: 'center',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
                letterSpacing: 1,
                color: note.kind === 'fault' ? '#f87171' : '#4ade80',
                background: note.kind === 'fault' ? 'rgba(127,29,29,0.25)' : 'rgba(20,83,45,0.25)',
                border: `1px solid ${note.kind === 'fault' ? 'rgba(248,113,113,0.5)' : 'rgba(74,222,128,0.5)'}`,
              }}
            >
              {note.kind === 'fault' ? '✕ ' : '✓ '}
              {note.text}
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn primary" onClick={flagParadoxes} disabled={completed || selected.length !== REQUIRED_SELECTIONS}>
            {completed ? 'AUDIT COMPLETE' : 'FLAG PARADOXES'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
