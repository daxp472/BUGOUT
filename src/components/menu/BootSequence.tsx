import React, { useEffect, useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  'AURELION FIRMWARE v9.4.1 // COLD BOOT',
  'MEMCHECK ..................... 640TB OK',
  'WARDEN KERNEL ............... LOADED',
  'TEMPORAL ARCHIVE ............ MOUNTED',
  'COMMS WING UPLINK ........... SILENT',
  'CANDIDATE REGISTRY .......... 09 RECORDS',
  'FACILITY INTEGRITY .......... 98.2%',
  '',
  'WARNING: PERIMETER BREECH DETECTED — SUBLEVEL 4',
  'INITIALIZING CANDIDATE INTERFACE...',
];

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [lineCount, setLineCount] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (lineCount >= BOOT_LINES.length) {
      const t = setTimeout(() => setFading(true), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLineCount((c) => c + 1);
      if (Math.random() > 0.4) audioEngine.playTone(220 + Math.random() * 400, 0.03, 'square');
    }, 140 + Math.random() * 160);
    return () => clearTimeout(t);
  }, [lineCount]);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(onComplete, 600);
    return () => clearTimeout(t);
  }, [fading, onComplete]);

  return (
    <div
      className={`boot-sequence ${fading ? 'boot-fade' : ''}`}
      onClick={() => setFading(true)}
      role="button"
      aria-label="Skip boot sequence"
    >
      <div className="boot-content">
        {BOOT_LINES.slice(0, lineCount).map((line, i) => (
          <div key={i} className={`boot-line ${line.startsWith('WARNING') ? 'boot-warn' : ''}`}>
            {line || '\u00A0'}
          </div>
        ))}
        <div className="boot-cursor">{lineCount < BOOT_LINES.length ? '█' : ''}</div>
      </div>
      <div className="boot-skip-hint">CLICK TO SKIP</div>
    </div>
  );
};
