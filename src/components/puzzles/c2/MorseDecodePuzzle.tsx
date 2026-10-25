import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

/** RELAY, letter by letter. */
const MORSE_MESSAGE: Array<{ letter: string; code: string }> = [
  { letter: 'R', code: '.-.' },
  { letter: 'E', code: '.' },
  { letter: 'L', code: '.-..' },
  { letter: 'A', code: '.-' },
  { letter: 'Y', code: '-.--' },
];

const ANSWER = 'RELAY';
const TONE_FREQ = 620;
const DOT_MS = 80; // playTone 0.08s
const DASH_MS = 240; // playTone 0.24s
const INTRA_GAP_MS = 120;
const INTER_GAP_MS = 420;
const LEAD_IN_MS = 400;

const dotMarkStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 9,
  height: 9,
  borderRadius: '50%',
  background: 'var(--accent-cyan, #00e5ff)',
  boxShadow: '0 0 8px rgba(0, 229, 255, 0.7)',
  margin: '0 4px',
};

const dashMarkStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 26,
  height: 9,
  borderRadius: 3,
  background: 'var(--accent-cyan, #00e5ff)',
  boxShadow: '0 0 8px rgba(0, 229, 255, 0.7)',
  margin: '0 4px',
};

/**
 * GHOST SIGNAL — Morse Uplink Decode.
 * Play the hand-keyed transmission, read the ink recorder strip,
 * and type the 5-letter call sign (Morse key card: Evidence dossier [TAB]).
 */
export const MorseDecodePuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [revealed, setRevealed] = useState<string[][]>([[]]);
  const [playing, setPlaying] = useState(false);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'failed' | 'success'>('idle');
  const timeoutsRef = useRef<number[]>([]);
  const faultNoteRef = useRef<HTMLDivElement | null>(null);

  const clearScheduled = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => clearScheduled, []);

  const revealSymbol = (letterIndex: number, symbol: string) => {
    setRevealed((prev) => {
      const next = prev.map((group) => [...group]);
      while (next.length <= letterIndex) next.push([]);
      next[letterIndex].push(symbol);
      return next;
    });
  };

  const playTransmission = () => {
    if (playing) return;
    clearScheduled();
    setRevealed([[]]);
    setPlaying(true);
    audioEngine.playStatic(0.35);

    let t = LEAD_IN_MS;
    MORSE_MESSAGE.forEach((entry, letterIndex) => {
      entry.code.split('').forEach((symbol) => {
        const at = t;
        timeoutsRef.current.push(
          window.setTimeout(() => {
            audioEngine.playTone(TONE_FREQ, symbol === '.' ? 0.08 : 0.24);
            revealSymbol(letterIndex, symbol);
          }, at)
        );
        t += (symbol === '.' ? DOT_MS : DASH_MS) + INTRA_GAP_MS;
      });
      // top up the trailing intra-letter gap to the full inter-letter gap
      t += INTER_GAP_MS - INTRA_GAP_MS;
    });

    timeoutsRef.current.push(window.setTimeout(() => setPlaying(false), t + 250));
  };

  const submitDecode = () => {
    if (status === 'success' || answer.trim().length === 0) return;
    if (answer.trim().toUpperCase() === ANSWER) {
      clearScheduled();
      setPlaying(false);
      audioEngine.playSuccess();
      setStatus('success');
      timeoutsRef.current.push(window.setTimeout(() => onSuccess(), 1400));
    } else {
      audioEngine.playError();
      onFail?.();
      setStatus('failed');
      faultNoteRef.current?.animate(
        [
          { transform: 'translateX(0px)' },
          { transform: 'translateX(-7px)' },
          { transform: 'translateX(7px)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(0px)' },
        ],
        { duration: 420 }
      );
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel morse-uplink-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">GHOST SIGNAL // MORSE INK RECORDER</div>
          <h2 className="puzzle-title">MORSE UPLINK DECODE</h2>
          <p className="puzzle-subtitle">
            PLAY THE REPEATING TRANSMISSION — COUNT DOTS AND DASHES PER LETTER — TYPE THE 5-LETTER CALL SIGN
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {/* Ink recorder strip */}
          <div
            className="morse-recorder-strip"
            style={{
              border: '1px solid var(--border-metal, #334155)',
              borderRadius: 8,
              background: 'linear-gradient(180deg, #101828 0%, #0a0f1d 100%)',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10,
                letterSpacing: 2,
                color: 'var(--text-muted, #94a3b8)',
                marginBottom: 10,
              }}
            >
              <span>INK RECORDER // 104.7 MHz</span>
              <span style={{ color: playing ? '#f87171' : 'var(--text-muted, #94a3b8)' }}>
                {playing ? '● RECEIVING' : '○ IDLE'}
              </span>
            </div>
            <div
              className="morse-tape"
              style={{
                minHeight: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 18,
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: 6,
                padding: '10px 12px',
              }}
            >
              {revealed.map((group, gi) => (
                <span
                  key={gi}
                  className="morse-letter-group"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: 12,
                    minWidth: group.length > 0 ? 0 : 10,
                    borderBottom: gi < revealed.length - 1 ? '1px solid rgba(148, 163, 184, 0.25)' : 'none',
                    paddingBottom: 6,
                    paddingRight: gi < revealed.length - 1 ? 10 : 0,
                  }}
                >
                  {group.map((symbol, si) =>
                    symbol === '.' ? (
                      <span key={si} className="morse-tick" style={dotMarkStyle} />
                    ) : (
                      <span key={si} className="morse-dash-mark" style={dashMarkStyle} />
                    )
                  )}
                </span>
              ))}
              {revealed.every((g) => g.length === 0) && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 11,
                    letterSpacing: 2,
                    color: 'rgba(148, 163, 184, 0.5)',
                  }}
                >
                  — NO SYMBOLS ON TAPE — PRESS PLAY TRANSMISSION —
                </span>
              )}
            </div>
          </div>

          {/* Playback controls */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="action-btn primary"
              onClick={playTransmission}
              disabled={playing}
              style={{ padding: '8px 16px', fontSize: 12 }}
            >
              {playing ? 'RECEIVING…' : '▶ PLAY TRANSMISSION'}
            </button>
            <button
              className="action-btn secondary"
              onClick={playTransmission}
              disabled={playing}
              style={{ padding: '8px 16px', fontSize: 12 }}
            >
              ↺ REPLAY
            </button>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10,
                letterSpacing: 1.5,
                color: 'var(--text-muted, #94a3b8)',
              }}
            >
              {MORSE_MESSAGE.length} LETTERS DETECTED IN LOOP
            </span>
          </div>

          {/* Decode input */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              border: '1px solid var(--border-metal, #334155)',
              borderRadius: 8,
              background: 'rgba(10, 15, 29, 0.7)',
              padding: '12px 14px',
            }}
          >
            <label
              htmlFor="morse-answer-input"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 11,
                letterSpacing: 2,
                color: 'var(--accent-gold, #fbbf24)',
                whiteSpace: 'nowrap',
              }}
            >
              CALL SIGN:
            </label>
            <input
              id="morse-answer-input"
              type="text"
              value={answer}
              maxLength={8}
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitDecode();
              }}
              disabled={status === 'success'}
              placeholder="_ _ _ _ _"
              className="morse-answer-input"
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-metal, #334155)',
                borderRadius: 6,
                color: 'var(--accent-cyan, #00e5ff)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 18,
                letterSpacing: 6,
                padding: '8px 12px',
                outline: 'none',
                textTransform: 'uppercase',
              }}
            />
          </div>

          {/* Hint chip */}
          <div
            className="morse-hint-chip"
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
            ⌗ HINT: MORSE KEY CARD IS IN YOUR EVIDENCE DOSSIER [TAB]
          </div>

          {status === 'failed' && (
            <div
              ref={faultNoteRef}
              className="morse-fault-note morse-note-shake"
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
              ✕ REGISTRY MISMATCH — RE-COUNT THE SYMBOLS
            </div>
          )}
          {status === 'success' && (
            <div
              className="morse-success-note"
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
              ✓ CALL SIGN CONFIRMED: RELAY — UPLINK REGISTRY ACCEPTED
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn primary"
            onClick={submitDecode}
            disabled={status === 'success' || answer.trim().length === 0}
          >
            {status === 'success' ? 'CALL SIGN CONFIRMED' : 'TRANSMIT DECODE [ENTER]'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
