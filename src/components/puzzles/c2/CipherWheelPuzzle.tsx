import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

/** Enciphered with Caesar shift +7: "ECHO" / "THE SILENCE WAS A MESSAGE". */
const HEADER_ENC = 'LJOV';
const BODY_ENC = 'AOL ZPSLUJL DHZ H TLZZHNL';
const ANSWER = 'ECHO';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const STEP_DEG = 13.85; // 360 / 26
const RING_SIZE = 250;
const OUTER_RADIUS = 106;
const INNER_RADIUS = 72;

const caesarDecode = (text: string, shift: number): string =>
  text.replace(/[A-Z]/g, (c) =>
    String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65)
  );

const wheelButtonStyle = (enabled: boolean): React.CSSProperties => ({
  width: 46,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(30, 41, 59, 0.8)',
  border: '1px solid var(--border-metal, #334155)',
  borderRadius: 6,
  color: enabled ? 'var(--accent-cyan, #00e5ff)' : 'rgba(148, 163, 184, 0.4)',
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: 16,
  cursor: enabled ? 'pointer' : 'not-allowed',
  transition: 'all 0.2s',
  padding: 0,
});

/**
 * GHOST SIGNAL — Warden Packet Cipher Decipher (Room 07 Cipher Workstation).
 * Rotate the interlocked alphabet wheels: only one shift value turns the
 * enciphered header LJOV into the real keyword. Intercepted packet: dossier [TAB].
 */
export const CipherWheelPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [shift, setShift] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'idle' | 'failed' | 'success'>('idle');
  const faultNoteRef = useRef<HTMLDivElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  const rotate = (delta: number) => {
    if (status === 'success') return;
    audioEngine.playClick();
    setShift((s) => (s + delta + 26) % 26);
  };

  const decodedHeader = caesarDecode(HEADER_ENC, shift);
  const decodedBody = caesarDecode(BODY_ENC, shift);
  const solvedShift = decodedHeader === ANSWER;

  const submitKeyword = () => {
    if (status === 'success' || keyword.trim().length === 0) return;
    if (keyword.trim().toUpperCase() === ANSWER) {
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
      <div className="puzzle-panel cipher-wheel-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">GHOST SIGNAL // ROTARY CIPHER WORKSTATION</div>
          <h2 className="puzzle-title">WARDEN PACKET CIPHER DECIPHER</h2>
          <p className="puzzle-subtitle">
            THE PACKET IS CAESAR ROT-N, N CLASSIFIED — ROTATE THE WHEEL AND WATCH THE LIVE DECODE. SUBMIT THE DECODED HEADER KEYWORD.
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div
          style={{
            padding: '18px 24px',
            display: 'flex',
            gap: 22,
            flexWrap: 'wrap',
            justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          {/* Cipher wheel */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE }} className="cipher-wheel">
              {/* alignment pointer */}
              <div
                style={{
                  position: 'absolute',
                  top: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'var(--accent-gold, #fbbf24)',
                  fontSize: 13,
                  lineHeight: '12px',
                  zIndex: 3,
                  textShadow: '0 0 8px rgba(245, 158, 11, 0.8)',
                }}
              >
                ▼
              </div>

              {/* inner disc */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 118,
                  height: 118,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #101828 0%, #0a0f1d 100%)',
                  border: '1px solid var(--border-metal, #334155)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 9,
                    letterSpacing: 2,
                    color: 'var(--text-muted, #94a3b8)',
                  }}
                >
                  SHIFT
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 30,
                    fontWeight: 700,
                    color: solvedShift ? '#4ade80' : 'var(--accent-cyan, #00e5ff)',
                    textShadow: solvedShift ? '0 0 12px rgba(74, 222, 128, 0.7)' : '0 0 10px rgba(0, 229, 255, 0.5)',
                  }}
                >
                  {shift.toString().padStart(2, '0')}
                </span>
              </div>

              {/* outer ring — fixed ciphertext alphabet */}
              {ALPHABET.map((letter, i) => (
                <span
                  key={`outer-${letter}`}
                  className="cipher-wheel-letter outer"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * STEP_DEG}deg) translateY(-${OUTER_RADIUS}px) rotate(${-i * STEP_DEG}deg)`,
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--accent-gold, #fbbf24)',
                    width: 16,
                    textAlign: 'center',
                  }}
                >
                  {letter}
                </span>
              ))}

              {/* inner ring — plaintext alphabet, rotated by shift */}
              {ALPHABET.map((letter, i) => (
                <span
                  key={`inner-${letter}`}
                  className="cipher-wheel-letter inner"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * STEP_DEG + shift * STEP_DEG}deg) translateY(-${INNER_RADIUS}px) rotate(${-(i * STEP_DEG + shift * STEP_DEG)}deg)`,
                    transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 11,
                    color: solvedShift ? '#4ade80' : 'var(--accent-cyan, #00e5ff)',
                    width: 16,
                    textAlign: 'center',
                    zIndex: 2,
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>

            {/* shift controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="cipher-wheel-btn"
                style={wheelButtonStyle(status !== 'success')}
                onClick={() => rotate(-1)}
                disabled={status === 'success'}
                aria-label="Rotate wheel backward"
              >
                −
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 12,
                  letterSpacing: 2,
                  color: 'var(--text-muted, #94a3b8)',
                  minWidth: 74,
                  textAlign: 'center',
                }}
              >
                SHIFT {shift}/25
              </span>
              <button
                type="button"
                className="cipher-wheel-btn"
                style={wheelButtonStyle(status !== 'success')}
                onClick={() => rotate(1)}
                disabled={status === 'success'}
                aria-label="Rotate wheel forward"
              >
                +
              </button>
            </div>
          </div>

          {/* Packet readout */}
          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                border: '1px solid var(--border-metal, #334155)',
                borderRadius: 8,
                background: 'linear-gradient(180deg, #101828 0%, #0a0f1d 100%)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 10,
                  letterSpacing: 2,
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                INTERCEPTED PACKET // ENCIPHERED
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 30,
                  letterSpacing: 10,
                  color: 'var(--accent-gold, #fbbf24)',
                  textShadow: '0 0 10px rgba(245, 158, 11, 0.4)',
                }}
              >
                {HEADER_ENC}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 14,
                  letterSpacing: 3,
                  color: 'rgba(251, 191, 36, 0.75)',
                }}
              >
                {BODY_ENC}
              </div>
              <div style={{ borderTop: '1px dashed var(--border-metal, #334155)', paddingTop: 10 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 10,
                    letterSpacing: 2,
                    color: 'var(--text-muted, #94a3b8)',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  LIVE DECODE @ SHIFT {shift}
                </span>
                <div
                  className="cipher-decoded-header"
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 22,
                    letterSpacing: 8,
                    color: solvedShift ? '#4ade80' : 'var(--accent-cyan, #00e5ff)',
                    textShadow: solvedShift ? '0 0 12px rgba(74, 222, 128, 0.7)' : 'none',
                    transition: 'color 0.3s',
                  }}
                >
                  {decodedHeader}
                </div>
                <div
                  className="cipher-decoded-body"
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 13,
                    letterSpacing: 2,
                    color: solvedShift ? 'rgba(134, 239, 172, 0.9)' : 'rgba(0, 229, 255, 0.65)',
                    marginTop: 4,
                  }}
                >
                  {decodedBody}
                </div>
              </div>
            </div>

            {/* Keyword input */}
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
                htmlFor="cipher-keyword-input"
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 11,
                  letterSpacing: 2,
                  color: 'var(--accent-gold, #fbbf24)',
                  whiteSpace: 'nowrap',
                }}
              >
                KEYWORD:
              </label>
              <input
                id="cipher-keyword-input"
                type="text"
                value={keyword}
                maxLength={12}
                onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitKeyword();
                }}
                disabled={status === 'success'}
                placeholder="DECODED HEADER…"
                className="cipher-keyword-input"
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-metal, #334155)',
                  borderRadius: 6,
                  color: 'var(--accent-cyan, #00e5ff)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 16,
                  letterSpacing: 5,
                  padding: '8px 12px',
                  outline: 'none',
                  textTransform: 'uppercase',
                }}
              />
            </div>

            {/* Hint chip */}
            <div
              className="cipher-hint-chip"
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
              ⌗ HINT: THE INTERCEPTED PACKET IS IN YOUR EVIDENCE DOSSIER [TAB] — ONLY ONE SHIFT MAKES THE HEADER A REAL WORD
            </div>

            {status === 'failed' && (
              <div
                ref={faultNoteRef}
                className="cipher-fault-note"
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
                ✕ KEYWORD REJECTED — ROTATE THE WHEEL AND TRY AGAIN
              </div>
            )}
            {status === 'success' && (
              <div
                className="cipher-success-note"
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
                ✓ KEYWORD ACCEPTED — “ECHO” MATCHES THE PACKET HEADER. PACKET AUTHOR: S-07.
              </div>
            )}
          </div>
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn primary"
            onClick={submitKeyword}
            disabled={status === 'success' || keyword.trim().length === 0}
          >
            {status === 'success' ? 'KEYWORD ACCEPTED' : 'SUBMIT KEYWORD [ENTER]'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>STAND BY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
