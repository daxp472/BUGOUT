import React, { useCallback, useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

const TONES = [
  { letter: 'A', freq: 440, cls: 'echo-key-1' },
  { letter: 'B', freq: 554.37, cls: 'echo-key-2' },
  { letter: 'C', freq: 659.25, cls: 'echo-key-3' },
  { letter: 'D', freq: 783.99, cls: 'echo-key-4' },
];

/** Each cycle: the mutation banner + the mutated pattern the player must mirror. */
const CYCLES: Array<{ banner: string; pattern: number[] }> = [
  { banner: 'MIRROR — REPEAT THE PATTERN', pattern: [0, 1, 2] },
  { banner: 'MUTATION: REVERSE', pattern: [2, 1, 0] },
  { banner: 'MUTATION: APPEND ONE TONE', pattern: [2, 1, 0, 3] },
];

const TONE_LEN_S = 0.3;
const TONE_GAP_MS = 500;

/**
 * ECHOES OF AURELION — Mutating Echo Mirror.
 * The echo organ plays a pattern; the player repeats it on the four organ keys.
 * Each cycle the pattern mutates (reverse, append one tone). A wrong press
 * diverges the echo and resets the trial to cycle 1.
 */
export const EchoSequencePuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'input' | 'diverged' | 'success'>('intro');
  const [cycle, setCycle] = useState(1);
  const [litKey, setLitKey] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  // Clear every pending timer on unmount.
  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  /** Play a cycle's pattern: light each key + tone, 500ms apart, then hand over to the player. */
  const playPattern = useCallback(
    (cycleIdx: number) => {
      const pattern = CYCLES[cycleIdx - 1].pattern;
      setPhase('playing');
      setInputIndex(0);
      setLitKey(null);
      pattern.forEach((toneIdx, i) => {
        later(() => {
          setLitKey(toneIdx);
          audioEngine.playTone(TONES[toneIdx].freq, TONE_LEN_S);
        }, i * TONE_GAP_MS);
        later(() => {
          setLitKey((cur) => (cur === toneIdx ? null : cur));
        }, i * TONE_GAP_MS + TONE_LEN_S * 1000);
      });
      later(() => {
        setLitKey(null);
        setPhase('input');
      }, pattern.length * TONE_GAP_MS + 250);
    },
    [later]
  );

  // Begin cycle 1 shortly after the panel opens.
  useEffect(() => {
    later(() => playPattern(1), 700);
  }, [later, playPattern]);

  const pressKey = (toneIdx: number) => {
    if (phase !== 'input') return;
    const pattern = CYCLES[cycle - 1].pattern;

    // Wrong press — the echo diverges and the trial resets to cycle 1.
    if (toneIdx !== pattern[inputIndex]) {
      audioEngine.playError();
      audioEngine.playStatic(0.35);
      onFail?.();
      setPhase('diverged');
      setNote('ECHO DIVERGED — RETURNING TO CYCLE 1');
      later(() => {
        setNote(null);
        setCycle(1);
        playPattern(1);
      }, 1000);
      return;
    }

    // Correct press — echo it back.
    audioEngine.playTone(TONES[toneIdx].freq, TONE_LEN_S);
    setLitKey(toneIdx);
    later(() => {
      setLitKey((cur) => (cur === toneIdx ? null : cur));
    }, TONE_LEN_S * 1000);

    const next = inputIndex + 1;
    if (next < pattern.length) {
      setInputIndex(next);
      return;
    }

    // Pattern completed.
    if (cycle < CYCLES.length) {
      const nextCycle = cycle + 1;
      setPhase('playing'); // hold input while the next mutation loads
      setInputIndex(0);
      later(() => {
        setCycle(nextCycle);
        playPattern(nextCycle);
      }, 900);
    } else {
      audioEngine.playSuccess();
      setNote('THREE MUTATIONS MIRRORED — THE GALLERY ACCEPTS YOU');
      setPhase('success');
      later(() => onSuccess(), 1400);
    }
  };

  const pattern = CYCLES[cycle - 1].pattern;

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel echo-mirror-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">ECHOES OF AURELION // ECHO ORGAN</div>
          <h2 className="puzzle-title">MUTATING ECHO MIRROR</h2>
          <p className="puzzle-subtitle">
            REPEAT WHAT THE ORGAN PLAYS — EACH CYCLE THE PATTERN MUTATES. SURVIVE THREE CYCLES.
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="echo-body">
          <div className="mutation-banner">{CYCLES[cycle - 1].banner}</div>

          <div className="cycle-indicator">
            <span className="cycle-count">CYCLE {cycle}/3</span>
            <span className="echo-trace">
              {pattern.map((_, i) => (
                <span key={i} className={`trace-dot ${phase === 'input' && i < inputIndex ? 'filled' : ''}`} />
              ))}
            </span>
          </div>

          <div className="echo-keys">
            {TONES.map((tone, i) => (
              <button
                key={tone.letter}
                className={`echo-key ${tone.cls} ${litKey === i ? 'lit' : ''}`}
                onClick={() => pressKey(i)}
                disabled={phase !== 'input'}
              >
                {tone.letter}
              </button>
            ))}
          </div>

          <div className="echo-status">
            {phase === 'intro' && 'CALIBRATING ORGAN PIPES...'}
            {phase === 'playing' && 'LISTEN — THE ORGAN SPEAKS...'}
            {phase === 'input' && 'YOUR TURN — MIRROR THE PATTERN'}
            {phase === 'diverged' && 'PATTERN LOST...'}
            {phase === 'success' && 'MIRROR HELD.'}
          </div>

          {phase === 'diverged' && note && <div className="echo-fault-note">✕ {note}</div>}
          {phase === 'success' && note && <div className="echo-lock-note">✓ {note}</div>}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn secondary" onClick={onClose}>STEP AWAY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
