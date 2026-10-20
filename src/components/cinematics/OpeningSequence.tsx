import React, { useEffect, useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface OpeningSequenceProps {
  onComplete: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [subtitles, setSubtitles] = useState<string>('');

  useEffect(() => {
    // Step 0: Black screen, hum begins
    audioEngine.playAmbient('lab');
    const t1 = setTimeout(() => {
      setStep(1); // Emergency lights flicker
      audioEngine.playSwitch();
    }, 1200);

    const t2 = setTimeout(() => {
      setStep(2); // Terminal boots
      audioEngine.playWardenVoice();
      setSubtitles('WARDEN: "Wakefulness confirmed. Stasis stasis chamber 01 bio-telemetry normalized."');
    }, 2600);

    const t3 = setTimeout(() => {
      setStep(3); // Locks engage
      audioEngine.playPneumaticDoor();
      setSubtitles('WARDEN: "Exit authorization remains suspended. Cognitive assessment protocol active."');
    }, 4800);

    const t4 = setTimeout(() => {
      onComplete();
    }, 7200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className={`cinematic-opening-container step-${step}`}>
      <div className="opening-scanlines" />
      <div className={`emergency-glow-sweep step-${step}`} />
      
      <div className="opening-visual-frame">
        <div className={`boot-terminal-text ${step >= 2 ? 'visible' : ''}`}>
          <span className="boot-line">&gt; AURELION RESEARCH FACILITY BOOT SEQUENCE</span>
          <span className="boot-line">&gt; SUBJECT 07 // NEURAL METRICS: ONLINE</span>
          <span className="boot-line">&gt; RESTRICTED TESTING FACILITY: FIVE CHAMBERS SEALED</span>
        </div>
      </div>

      {subtitles && (
        <div className="cinematic-subtitles-bar">
          <p className="subtitle-text">{subtitles}</p>
        </div>
      )}

      <button className="skip-cinematic-btn" onClick={onComplete}>
        SKIP INTRO [SPACE] &rarr;
      </button>
    </div>
  );
};
