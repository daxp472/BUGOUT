import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface KeypadPuzzleProps {
  onSuccess: () => void;
  onFail?: () => void;
  onClose: () => void;
  correctCode?: string;
  title?: string;
  subtitle?: string;
}

export const KeypadPuzzle: React.FC<KeypadPuzzleProps> = ({
  onSuccess,
  onFail,
  onClose,
  correctCode = '7914',
  title = 'SECURITY KEYPAD OVERRIDE',
  subtitle = 'ENTER 4-DIGIT AUTHORIZATION PIN'
}) => {
  const [input, setInput] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDigit = (digit: string) => {
    if (status !== 'idle' || input.length >= 4) return;
    audioEngine.playKeypad(digit);
    setInput((prev) => prev + digit);
  };

  const handleClear = () => {
    audioEngine.playClick();
    setInput('');
    setStatus('idle');
    setErrorMessage('');
  };

  const handleBackspace = () => {
    audioEngine.playClick();
    setInput((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (input.length !== 4) {
      audioEngine.playError();
      setStatus('error');
      setErrorMessage('PIN MUST BE EXACTLY 4 DIGITS');
      setTimeout(() => setStatus('idle'), 1200);
      return;
    }

    if (input === correctCode) {
      audioEngine.playSuccess();
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      audioEngine.playError();
      setStatus('error');
      setErrorMessage('ACCESS DENIED // INVALID CHECKSUM');
      if (onFail) onFail();
      setTimeout(() => {
        setInput('');
        setStatus('idle');
        setErrorMessage('');
      }, 1200);
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel keypad-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">TERMINAL LOCK #01-A</div>
          <h2 className="puzzle-title">{title}</h2>
          <p className="puzzle-subtitle">{subtitle}</p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="keypad-screen-container">
          <div className={`keypad-display ${status}`}>
            <div className="keypad-dots">
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className={`keypad-digit-slot ${input.length > idx ? 'filled' : ''} ${status}`}
                >
                  {input[idx] ? input[idx] : '•'}
                </span>
              ))}
            </div>
            {errorMessage && <div className="keypad-error-msg">{errorMessage}</div>}
            {status === 'success' && <div className="keypad-success-msg">ACCESS GRANTED // UNLOCKED</div>}
          </div>
        </div>

        <div className="keypad-grid">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              className="keypad-key"
              onClick={() => handleDigit(num)}
              disabled={status !== 'idle'}
            >
              <span className="keypad-num">{num}</span>
            </button>
          ))}
          <button className="keypad-key keypad-fn" onClick={handleClear} disabled={status !== 'idle'}>
            CLR
          </button>
          <button className="keypad-key" onClick={() => handleDigit('0')} disabled={status !== 'idle'}>
            <span className="keypad-num">0</span>
          </button>
          <button className="keypad-key keypad-fn" onClick={handleBackspace} disabled={status !== 'idle'}>
            ⌫
          </button>
        </div>

        <div className="keypad-footer">
          <button
            className="action-btn primary full-width"
            onClick={handleSubmit}
            disabled={status !== 'idle' || input.length === 0}
          >
            AUTHORIZE CODE [ENTER]
          </button>
        </div>
      </div>
    </div>
  );
};
