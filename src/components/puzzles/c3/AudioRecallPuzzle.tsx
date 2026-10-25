import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

const PILLAR_TONES = [261.63, 329.63, 392.0, 523.25, 659.25];
const PILLAR_LABELS = ['C4', 'E4', 'G4', 'C5', 'E5'];
const TOTAL_ROUNDS = 5;

const TONE_SECONDS = 0.35;
const LIT_MS = 350;
const STEP_MS = 550;
const ACCEPT_PAUSE_MS = 950;
const FAIL_RESET_MS = 1000;
const SUCCESS_MS = 1400;

type Phase = 'idle' | 'showing' | 'input' | 'betweenRounds';
type NoteKind = 'info' | 'fault' | 'good';
interface NoteState {
  text: string;
  kind: NoteKind;
}

const randomPillar = (): number => Math.floor(Math.random() * PILLAR_TONES.length);

/**
 * ECHOES OF AURELION — Resonance Pillar Recall Trial (Simon-style, EXTREME).
 * The pillars play a tone sequence that grows by one appended tone each round;
 * the player must echo it back exactly. Five rounds to verify sensory memory.
 * State machine: idle → showing → input → betweenRounds.
 */
export const AudioRecallPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [litPillar, setLitPillar] = useState<number | null>(null);
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

  /** Play the whole sequence, then hand control back to the player. */
  const playSequence = (seq: number[]): void => {
    setPhase('showing');
    setInputIndex(0);
    setLitPillar(null);
    setNote({ text: 'LISTEN — THE PILLARS SPEAK', kind: 'info' });
    seq.forEach((pillar, i) => {
      addTimer(() => {
        audioEngine.playTone(PILLAR_TONES[pillar], TONE_SECONDS);
        setLitPillar(pillar);
      }, i * STEP_MS);
      addTimer(() => setLitPillar(null), i * STEP_MS + LIT_MS);
    });
    addTimer(() => {
      setPhase('input');
      setNote({ text: 'REPEAT THE SEQUENCE', kind: 'info' });
    }, seq.length * STEP_MS + 220);
  };

  /** BEGIN TRIAL — round 1 holds a single random pillar. */
  const startTrial = (): void => {
    const seq = [randomPillar()];
    setSequence(seq);
    setRound(1);
    setNote({ text: 'TRIAL INITIATED — ROUND 1', kind: 'info' });
    addTimer(() => playSequence(seq), 650);
  };

  /** Round survived: append one random tone and continue. */
  const advanceRound = (completedRound: number, seq: number[]): void => {
    setPhase('betweenRounds');
    setNote({ text: 'SEQUENCE ACCEPTED', kind: 'good' });
    addTimer(() => {
      const next = [...seq, randomPillar()];
      setSequence(next);
      setRound(completedRound + 1);
      setNote({ text: `ROUND ${completedRound + 1} — ONE MORE TONE APPENDED`, kind: 'info' });
      addTimer(() => playSequence(next), 750);
    }, ACCEPT_PAUSE_MS);
  };

  const completeTrial = (): void => {
    setPhase('betweenRounds');
    setLitPillar(null);
    audioEngine.playSuccess();
    setNote({ text: 'ARCHIVE TRIAL PASSED — SENSORY MEMORY VERIFIED', kind: 'good' });
    addTimer(onSuccess, SUCCESS_MS);
  };

  const failTrial = (): void => {
    audioEngine.playError();
    audioEngine.playStatic(0.4);
    onFail?.();
    setPhase('betweenRounds');
    setNote({ text: 'RECALL FAILURE — THE PILLARS RESET', kind: 'fault' });
    addTimer(() => {
      const seq = [randomPillar()];
      setSequence(seq);
      setRound(1);
      addTimer(() => playSequence(seq), 400);
    }, FAIL_RESET_MS);
  };

  const pressPillar = (pillar: number): void => {
    if (phase !== 'input') return;
    audioEngine.playTone(PILLAR_TONES[pillar], TONE_SECONDS);
    setLitPillar(pillar);
    addTimer(() => setLitPillar(null), 240);

    if (sequence[inputIndex] === pillar) {
      const nextIndex = inputIndex + 1;
      setInputIndex(nextIndex);
      if (nextIndex >= sequence.length) {
        if (round >= TOTAL_ROUNDS) completeTrial();
        else advanceRound(round, sequence);
      }
    } else {
      failTrial();
    }
  };

  /** 0..3 progress dots for a given round position. */
  const dotsFor = (r: number): number => {
    if (r < round) return 3;
    if (r > round || sequence.length === 0) return 0;
    if (phase === 'input') return Math.min(3, Math.max(0, Math.ceil((inputIndex / sequence.length) * 3)));
    if (phase === 'betweenRounds' && note?.kind === 'good') return 3;
    return 0;
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel recall-pillars-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">ECHOES OF AURELION // RECALL VAULT</div>
          <h2 className="puzzle-title">RESONANCE PILLAR RECALL TRIAL</h2>
          <p className="puzzle-subtitle">
            THE PILLARS PLAY A TONE SEQUENCE — ECHO IT BACK EXACTLY. FIVE ROUNDS, ONE APPENDED TONE EACH. A SINGLE MISTAKE RESETS THE PILLARS.
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="recall-body">
          {/* Round indicator with 3 progress dots per round position */}
          <div
            className="recall-status"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
          >
            <span className="recall-round-label" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: '#c084fc' }}>
              ROUND {round}/{TOTAL_ROUNDS}
            </span>
            <div className="recall-round-track" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: TOTAL_ROUNDS }, (_, r) => {
                const pos = r + 1;
                const dots = dotsFor(pos);
                return (
                  <div
                    key={pos}
                    className={`recall-round-cell${pos === round ? ' active' : ''}`}
                    style={{
                      display: 'flex',
                      gap: 4,
                      padding: '5px 9px',
                      borderRadius: 999,
                      border: `1px solid ${pos === round ? 'rgba(192,132,252,0.85)' : 'rgba(167,139,250,0.25)'}`,
                      background: pos === round ? 'rgba(139,92,246,0.18)' : 'transparent',
                    }}
                  >
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="recall-dot"
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: d < dots ? '#c084fc' : 'rgba(167,139,250,0.22)',
                          boxShadow: d < dots ? '0 0 6px rgba(192,132,252,0.9)' : 'none',
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resonance pillar array */}
          <div className="recall-pillar-array" style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '14px 0' }}>
            {PILLAR_TONES.map((freq, i) => {
              const lit = litPillar === i;
              return (
                <button
                  key={freq}
                  className={`recall-pillar recall-pillar-${i + 1}${lit ? ' lit' : ''}`}
                  onClick={() => pressPillar(i)}
                  disabled={phase !== 'input'}
                  style={{
                    width: 76,
                    height: 198,
                    borderRadius: '38px 38px 10px 10px',
                    border: `2px solid ${lit ? '#e9d5ff' : 'rgba(167,139,250,0.4)'}`,
                    background: lit
                      ? 'linear-gradient(180deg, #d8b4fe 0%, #a855f7 55%, #6d28d9 100%)'
                      : 'linear-gradient(180deg, rgba(88,68,140,0.55) 0%, rgba(40,30,72,0.9) 100%)',
                    boxShadow: lit
                      ? '0 0 30px rgba(192,132,252,0.9), inset 0 0 16px rgba(255,255,255,0.4)'
                      : 'inset 0 0 12px rgba(0,0,0,0.65)',
                    color: lit ? '#2a1245' : '#a78bfa',
                    cursor: phase === 'input' ? 'pointer' : 'default',
                    transition: 'background 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, color 0.12s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 6px 12px',
                  }}
                >
                  <span className="recall-pillar-glyph" style={{ fontSize: 22, lineHeight: 1 }}>◈</span>
                  <span className="recall-pillar-tone" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>
                    {PILLAR_LABELS[i]}
                  </span>
                </button>
              );
            })}
          </div>

          {note && (
            <div
              className={`recall-note ${note.kind}`}
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
          <button className="action-btn primary" onClick={startTrial} disabled={phase !== 'idle'}>
            {phase === 'idle' ? 'BEGIN TRIAL' : 'TRIAL IN PROGRESS…'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
