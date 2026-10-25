import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface OnboardingScreenProps {
  onComplete: (callsign: string) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [callsign, setCallsign] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = callsign.trim();
    if (trimmed.length < 2) {
      setError('CALLSIGN MUST BE AT LEAST 2 CHARACTERS');
      audioEngine.playError();
      return;
    }
    audioEngine.playSuccess();
    onComplete(trimmed);
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-scanlines" />
      <div className="onboarding-card">
        <div className="onboarding-badge">AURELION CANDIDATE REGISTRY // FIRST CONTACT</div>
        <h1 className="onboarding-title">IDENTIFY YOURSELF</h1>
        <p className="onboarding-text">
          The registry has no record of you. Before the facility opens its chambers, it requires a
          designation. Your callsign will be stamped on every record, rank, and transmission you leave behind.
        </p>

        <div className="onboarding-input-row">
          <span className="onboarding-prefix">&gt;</span>
          <input
            className="onboarding-input"
            placeholder="ENTER CALLSIGN"
            maxLength={16}
            value={callsign}
            autoFocus
            onChange={(e) => {
              setCallsign(e.target.value.toUpperCase());
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            aria-label="Callsign"
          />
        </div>
        {error && <div className="onboarding-error">{error}</div>}

        <button className="action-btn primary large onboarding-btn" onClick={handleSubmit}>
          REGISTER CALLSIGN [ENTER]
        </button>

        <div className="onboarding-footnote">
          REGISTRY NOTICE: CALLSIGN IS STORED LOCALLY. NO PERSONAL DATA IS COLLECTED.
        </div>
      </div>
    </div>
  );
};
