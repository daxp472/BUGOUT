import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

interface TimelineEvent {
  id: number;
  name: string;
  flavor: string;
  /** True chronological rank (1 = oldest). Never shown to the player. */
  rank: number;
}

/** Display order is deliberately NOT chronological. No dates on the cards. */
const EVENTS: TimelineEvent[] = [
  { id: 1, name: 'SUBJECT INTAKE PROGRAM BEGINS', flavor: 'The first candidates arrive under escort.', rank: 4 },
  { id: 2, name: 'COMPLEX COMMISSIONED', flavor: 'Survey branch breaks ground above the ridge.', rank: 1 },
  { id: 3, name: 'TEMPORAL ARCHIVE SEALED', flavor: 'The last door closes on what happened here.', rank: 6 },
  { id: 4, name: 'WARDEN ACTIVATED', flavor: 'The facility grows a mind of its own.', rank: 3 },
  { id: 5, name: '72 RECORDED ITERATIONS', flavor: 'The same days, recorded again and again.', rank: 5 },
  { id: 6, name: 'FULL STAFFING — 212 PERSONNEL', flavor: 'Every post filled; the corridors learn to hum.', rank: 2 },
];

const TOTAL_SLOTS = 6;
const SHAKE_MS = 480;
const SUCCESS_MS = 1400;

type NoteKind = 'info' | 'fault' | 'good';
interface NoteState {
  text: string;
  kind: NoteKind;
}

/**
 * ECHOES OF AURELION — Facility Timeline Reconstruction.
 * Six undated event cards must be re-sequenced chronologically. Cards are
 * clicked in order: a correct pick slides into the next numbered slot, a
 * wrong pick shakes and stays in the pool. Only correct picks ever move,
 * so a full board is by construction a correct chronology.
 */
export const TimelineOrderPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [placed, setPlaced] = useState<(number | null)[]>(() => Array<number | null>(TOTAL_SLOTS).fill(null));
  const [shakingId, setShakingId] = useState<number | null>(null);
  const [slideId, setSlideId] = useState<number | null>(null);
  const [glowingSlots, setGlowingSlots] = useState<number[]>([]);
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

  const placedCount = placed.filter((p) => p !== null).length;
  const pool = EVENTS.filter((e) => !placed.includes(e.id));

  const resetTimeline = (): void => {
    if (completed) return;
    audioEngine.playClick();
    setPlaced(Array<number | null>(TOTAL_SLOTS).fill(null));
    setGlowingSlots([]);
    setSlideId(null);
    setShakingId(null);
    setNote(null);
  };

  const runVictory = (): void => {
    setCompleted(true);
    setNote({ text: 'TIMELINE RECONSTRUCTED — CHRONOLOGY VERIFIED', kind: 'good' });
    // Cascade gold glow across the slots, then resolve.
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      addTimer(() => setGlowingSlots((g) => (g.includes(i) ? g : [...g, i])), i * 170);
    }
    addTimer(() => audioEngine.playSuccess(), 200);
    addTimer(onSuccess, SUCCESS_MS);
  };

  const pickCard = (ev: TimelineEvent): void => {
    if (completed || placed.includes(ev.id)) return;
    if (ev.rank === placedCount + 1) {
      audioEngine.playClick();
      const next = [...placed];
      next[ev.rank - 1] = ev.id;
      setPlaced(next);
      setSlideId(ev.id);
      addTimer(() => setSlideId(null), 520);
      setNote({ text: `RECORD ${ev.rank}/${TOTAL_SLOTS} SEQUENCED`, kind: 'info' });
      if (placedCount + 1 === TOTAL_SLOTS) runVictory();
    } else {
      audioEngine.playError();
      onFail?.();
      setShakingId(ev.id);
      addTimer(() => setShakingId(null), SHAKE_MS);
      setNote({ text: 'OUT OF ORDER — THAT EVENT DOES NOT COME NEXT', kind: 'fault' });
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <style>{`
        @keyframes c3-tl-slide {
          from { opacity: 0; transform: translateY(-18px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes c3-tl-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(7px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(3px); }
        }
        @keyframes c3-tl-gold {
          from { box-shadow: 0 0 6px rgba(251, 191, 36, 0.3); }
          to { box-shadow: 0 0 20px rgba(251, 191, 36, 0.85); }
        }
      `}</style>
      <div className="puzzle-panel timeline-board-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">ECHOES OF AURELION // RECALL VAULT</div>
          <h2 className="puzzle-title">FACILITY TIMELINE RECONSTRUCTION</h2>
          <p className="puzzle-subtitle">
            SIX UNDATED EVENT RECORDS HAVE FALLEN OUT OF ORDER — RE-SEQUENCE THEM CHRONOLOGICALLY BY CLICKING, OLDEST FIRST.
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="timeline-body">
          <div
            className="timeline-brief"
            style={{ textAlign: 'center', fontSize: 11, letterSpacing: 1, color: 'rgba(196,181,253,0.85)', paddingBottom: 10 }}
          >
            PLACED {placedCount}/{TOTAL_SLOTS} — THE REGISTRY REMEMBERS THE ERAS EVEN WHEN THE DATES ARE REDACTED.
          </div>

          {/* Event card pool */}
          <div
            className="timeline-pool"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', minHeight: 96, alignItems: 'stretch' }}
          >
            {pool.map((ev) => (
              <button
                key={ev.id}
                className={`timeline-card${shakingId === ev.id ? ' shake' : ''}`}
                onClick={() => pickCard(ev)}
                disabled={completed}
                style={{
                  width: 198,
                  textAlign: 'left',
                  padding: '9px 11px',
                  borderRadius: 8,
                  border: '1px solid rgba(167,139,250,0.45)',
                  background: 'rgba(46,32,84,0.55)',
                  cursor: completed ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  animation: shakingId === ev.id ? 'c3-tl-shake 0.45s ease' : undefined,
                }}
              >
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#e9d5ff', letterSpacing: 0.5 }}>{ev.name}</span>
                <span style={{ fontSize: 9, fontStyle: 'italic', color: 'rgba(196,181,253,0.7)', lineHeight: 1.3 }}>{ev.flavor}</span>
              </button>
            ))}
          </div>

          <div
            className="timeline-track-label"
            style={{ textAlign: 'center', fontSize: 10, letterSpacing: 3, color: '#a78bfa', padding: '12px 0 6px' }}
          >
            FACILITY CHRONOLOGY — OLDEST FIRST
          </div>

          {/* Numbered timeline slots */}
          <div className="timeline-track" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8 }}>
            {placed.map((evId, i) => {
              const ev = evId === null ? undefined : EVENTS.find((e) => e.id === evId);
              const glowing = glowingSlots.includes(i);
              return (
                <div
                  key={i}
                  className={`timeline-slot${ev ? ' filled' : ''}${glowing ? ' gold' : ''}`}
                  style={{
                    borderRadius: 8,
                    padding: '8px 6px',
                    minHeight: 112,
                    border: `1px solid ${glowing ? '#fbbf24' : ev ? 'rgba(74,222,128,0.55)' : 'rgba(167,139,250,0.3)'}`,
                    background: glowing ? 'rgba(120,53,15,0.35)' : ev ? 'rgba(20,83,45,0.22)' : 'rgba(24,18,46,0.6)',
                    boxShadow: glowing ? '0 0 16px rgba(251,191,36,0.55)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    animation: glowing ? 'c3-tl-gold 0.9s ease-in-out infinite alternate' : undefined,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: glowing ? '#fcd34d' : '#a78bfa', letterSpacing: 2 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {ev ? (
                    <>
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#e9d5ff', lineHeight: 1.25, animation: slideId === ev.id ? 'c3-tl-slide 0.4s ease' : undefined }}>
                        {ev.name}
                      </span>
                      <span style={{ fontSize: 8.5, fontStyle: 'italic', color: 'rgba(196,181,253,0.75)', lineHeight: 1.3 }}>{ev.flavor}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 9, color: 'rgba(167,139,250,0.5)', letterSpacing: 1 }}>AWAITING RECORD</span>
                  )}
                </div>
              );
            })}
          </div>

          {note && (
            <div
              className={`timeline-note ${note.kind}`}
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
          <button className="action-btn primary" onClick={resetTimeline} disabled={completed}>
            {completed ? 'CHRONOLOGY VERIFIED' : 'RESET TIMELINE'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
