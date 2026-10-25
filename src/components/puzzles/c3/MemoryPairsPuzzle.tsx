import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../../services/audioEngine';

interface PuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

interface CardDef {
  key: string;
  pairId: string;
  kind: 'memory' | 'stamp';
  label: string;
}

/** Correct pairings: AWAKENING→001, FROST VALVE→002, VAULT RECORD→003, MIRROR ANOMALY→004. */
const PAIR_DEFS: Array<{ id: string; memory: string; stamp: string }> = [
  { id: 'pair_1', memory: 'CHAMBER 01 AWAKENING', stamp: 'T-72-001' },
  { id: 'pair_2', memory: 'FROST VALVE EVENT', stamp: 'T-72-002' },
  { id: 'pair_3', memory: 'VAULT RECORD RECOVERY', stamp: 'T-72-003' },
  { id: 'pair_4', memory: 'MIRROR ANOMALY', stamp: 'T-72-004' },
];

/** Fixed interleaved 4x2 layout so pairs never sit adjacent in the grid. */
const DECK: CardDef[] = [
  { key: 'c1', pairId: 'pair_2', kind: 'stamp', label: 'T-72-002' },
  { key: 'c2', pairId: 'pair_1', kind: 'memory', label: 'CHAMBER 01 AWAKENING' },
  { key: 'c3', pairId: 'pair_4', kind: 'stamp', label: 'T-72-004' },
  { key: 'c4', pairId: 'pair_3', kind: 'memory', label: 'VAULT RECORD RECOVERY' },
  { key: 'c5', pairId: 'pair_1', kind: 'stamp', label: 'T-72-001' },
  { key: 'c6', pairId: 'pair_2', kind: 'memory', label: 'FROST VALVE EVENT' },
  { key: 'c7', pairId: 'pair_4', kind: 'memory', label: 'MIRROR ANOMALY' },
  { key: 'c8', pairId: 'pair_3', kind: 'stamp', label: 'T-72-003' },
];

const CARD_BY_KEY: Map<string, CardDef> = new Map(DECK.map((c) => [c.key, c]));

/**
 * ECHOES OF AURELION — Memory-Timestamp Pairing.
 * Eight face-down cards: four memory fragments, four archive timestamps.
 * Flip two at a time; a memory and its timestamp stay face-up, a mismatch
 * flips back and flags a fail.
 */
export const MemoryPairsPuzzle: React.FC<PuzzleProps> = ({ onSuccess, onClose, onFail }) => {
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const resolveTimerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);

  // Clear pending timers on unmount.
  useEffect(() => {
    return () => {
      if (resolveTimerRef.current !== null) window.clearTimeout(resolveTimerRef.current);
      if (successTimerRef.current !== null) window.clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleFlip = (key: string) => {
    // Ignore clicks while a mismatch is resolving or the board is solved.
    if (resolveTimerRef.current !== null || successTimerRef.current !== null) return;
    if (flipped.includes(key) || matched.includes(key)) return;

    audioEngine.playClick();
    const nextFlipped = [...flipped, key];
    setFlipped(nextFlipped);
    if (nextFlipped.length < 2) return;

    const a = CARD_BY_KEY.get(nextFlipped[0]);
    const b = CARD_BY_KEY.get(nextFlipped[1]);
    if (!a || !b) return;

    const isMatch = a.pairId === b.pairId && a.kind !== b.kind;

    if (isMatch) {
      audioEngine.playTone(660);
      const nextMatched = [...matched, ...nextFlipped];
      setMatched(nextMatched);
      setFlipped([]);
      if (nextMatched.length === DECK.length) {
        audioEngine.playSuccess();
        successTimerRef.current = window.setTimeout(() => onSuccess(), 1300);
      }
    } else {
      // Show the mismatch for 800ms, then flip back and flag the fail.
      resolveTimerRef.current = window.setTimeout(() => {
        resolveTimerRef.current = null;
        audioEngine.playError();
        onFail?.();
        setFlipped([]);
      }, 800);
    }
  };

  const solved = matched.length === DECK.length;

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel memory-pairs-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">ECHOES OF AURELION // TIMESTAMP BOARD</div>
          <h2 className="puzzle-title">MEMORY-TIMESTAMP PAIRING</h2>
          <p className="puzzle-subtitle">
            FLIP CARDS TO PAIR EACH MEMORY FRAGMENT WITH THE TIMESTAMP IT WAS RECORDED
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="memory-body">
          <div className="pairs-counter">PAIRS: {matched.length / 2}/4</div>

          <div className="memory-grid">
            {DECK.map((card) => {
              const isFlipped = flipped.includes(card.key) || matched.includes(card.key);
              const isMatched = matched.includes(card.key);
              return (
                <div
                  key={card.key}
                  className={`memory-card ${card.kind === 'stamp' ? 'stamp' : 'frag'} ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                  onClick={() => handleFlip(card.key)}
                  role="button"
                  aria-label="Archive card"
                >
                  <div className="flip-inner">
                    <div className="flip-front">
                      <span className="card-glyph">?</span>
                    </div>
                    <div className="flip-back">
                      <span className="card-kind">{card.kind === 'memory' ? 'MEMORY' : 'TIMESTAMP'}</span>
                      <span className="card-label">{card.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {solved && <div className="pairs-success-note">✓ ALL PAIRS MATCHED — ARCHIVE INDEX RESTORED</div>}
        </div>

        <div className="puzzle-footer">
          <button className="action-btn secondary" onClick={onClose}>STEP AWAY [ESC]</button>
        </div>
      </div>
    </div>
  );
};
