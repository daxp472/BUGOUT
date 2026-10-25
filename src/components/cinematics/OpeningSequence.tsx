import React, { useEffect, useState } from 'react';
import { CampaignDefinition } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';

interface OpeningSequenceProps {
  campaign: CampaignDefinition;
  onComplete: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ campaign, onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [subtitles, setSubtitles] = useState<string>('');

  useEffect(() => {
    // Step 0: Black screen, ambience begins
    const startRoom = campaign.roomIds[0];
    audioEngine.playAmbient('menu');
    const t0 = setTimeout(() => audioEngine.playAmbient('lab'), 400);

    const t1 = setTimeout(() => {
      setStep(1); // Emergency lights flicker
      audioEngine.playSwitch();
    }, 1200);

    const t2 = setTimeout(() => {
      setStep(2); // Terminal boots
      audioEngine.playWardenVoice();
      setSubtitles(`WARDEN: "${campaign.wardenIntro}"`);
    }, 2800);

    const t3 = setTimeout(() => {
      setStep(3); // Locks engage
      audioEngine.playPneumaticDoor();
      setSubtitles(`${campaign.title.toUpperCase()} // ${campaign.subtitle.toUpperCase()}`);
    }, 5200);

    const t4 = setTimeout(() => {
      onComplete();
    }, 7600);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, campaign]);

  const startRoomName = campaign.title;

  return (
    <div className={`cinematic-opening-container step-${step} campaign-opening-${campaign.index}`}>
      <div className="opening-scanlines" />
      <div className={`emergency-glow-sweep step-${step}`} />

      <div className="opening-visual-frame">
        <div className={`boot-terminal-text ${step >= 2 ? 'visible' : ''}`}>
          <span className="boot-line">&gt; AURELION RESEARCH FACILITY BOOT SEQUENCE</span>
          <span className="boot-line">&gt; CANDIDATE INTERFACE // {campaign.codename}: {campaign.title}</span>
          <span className="boot-line">&gt; {campaign.subtitle.toUpperCase()}</span>
          <span className="boot-line">&gt; {campaign.tagline}</span>
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
