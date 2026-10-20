import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface MirrorDiscrepancyPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
  onFail?: () => void;
}

export const MirrorDiscrepancyPuzzle: React.FC<MirrorDiscrepancyPuzzleProps> = ({
  onSuccess,
  onClose,
  onFail
}) => {
  // 3 Discrepancies to discover
  const [foundClock, setFoundClock] = useState<boolean>(false);
  const [foundBadge, setFoundBadge] = useState<boolean>(false);
  const [foundGrille, setFoundGrille] = useState<boolean>(false);
  const [status, setStatus] = useState<'searching' | 'success'>('searching');

  const count = (foundClock ? 1 : 0) + (foundBadge ? 1 : 0) + (foundGrille ? 1 : 0);

  const checkCompletion = (c: boolean, b: boolean, g: boolean) => {
    if (c && b && g) {
      audioEngine.playSuccess();
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }
  };

  const handleSpot = (type: 'clock' | 'badge' | 'grille') => {
    if (status === 'success') return;
    audioEngine.playEvidencePickup();

    let nextC = foundClock;
    let nextB = foundBadge;
    let nextG = foundGrille;

    if (type === 'clock') {
      nextC = true;
      setFoundClock(true);
    } else if (type === 'badge') {
      nextB = true;
      setFoundBadge(true);
    } else if (type === 'grille') {
      nextG = true;
      setFoundGrille(true);
    }

    checkCompletion(nextC, nextB, nextG);
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel mirror-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">OPTICAL ANOMALY // MIRROR CHAMBER</div>
          <h2 className="puzzle-title">TEMPORAL REFLECTION DISCREPANCY DETECTOR</h2>
          <p className="puzzle-subtitle">
            COMPARE ROOM 01 REFERENCE POLAROID AGAINST THE ACTIVE OBSIDIAN REFLECTION. CLICK ALL 3 ANOMALIES.
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="mirror-puzzle-body">
          <div className="anomaly-counter-banner">
            ANOMALIES IDENTIFIED: <span className="counter-accent">{count} / 3</span>
          </div>

          <div className="comparison-views-container">
            {/* Reference Image (Chamber 01) */}
            <div className="photo-frame reference-frame">
              <div className="frame-tag">REFERENCE POLAROID (CHAMBER 01 ARCHIVE)</div>
              <div className="photo-canvas">
                {/* Simulated Polaroid Graphics */}
                <div className="polaroid-clock-ref">
                  <span className="element-label">WALL CLOCK: 09:40</span>
                  <div className="mini-clock-face">09:40</div>
                </div>

                <div className="polaroid-coat-ref">
                  <span className="element-label">BADGE: [SUB-07]</span>
                  <div className="mini-badge-ref">SUBJECT 07</div>
                </div>

                <div className="polaroid-vent-ref">
                  <span className="element-label">VENTILATION: PASSIVE SLATS</span>
                  <div className="mini-vent-ref">||||||||</div>
                </div>
              </div>
            </div>

            {/* Obsidian Mirror Interactive View */}
            <div className="photo-frame mirror-frame">
              <div className="frame-tag alert">OBSIDIAN MIRROR (CLICK ANOMALIES IN REFLECTION)</div>
              <div className="mirror-canvas">
                {/* Hotzone 1: Mirrored Clock */}
                <div
                  className={`hotzone hotzone-clock ${foundClock ? 'found' : ''}`}
                  onClick={() => handleSpot('clock')}
                >
                  <div className="hotzone-indicator">
                    {foundClock ? '✓ REVERSED TIMELINE: 02:20' : 'CLICK: REFLECTED CLOCK'}
                  </div>
                  <div className="mini-clock-mirror">02:20</div>
                </div>

                {/* Hotzone 2: Badge reads SUBJECT 08 */}
                <div
                  className={`hotzone hotzone-badge ${foundBadge ? 'found' : ''}`}
                  onClick={() => handleSpot('badge')}
                >
                  <div className="hotzone-indicator">
                    {foundBadge ? '✓ IDENTITY SHIFT: SUBJECT 08' : 'CLICK: LAB COAT BADGE'}
                  </div>
                  <div className="mini-badge-mirror">SUBJECT 08</div>
                </div>

                {/* Hotzone 3: Optical Sensor in Vent */}
                <div
                  className={`hotzone hotzone-vent ${foundGrille ? 'found' : ''}`}
                  onClick={() => handleSpot('grille')}
                >
                  <div className="hotzone-indicator">
                    {foundGrille ? '✓ TEMPORAL SCANNER IN GRILLE' : 'CLICK: CEILING VENT'}
                  </div>
                  <div className="mini-vent-sensor">◉ LASER SENSOR ACTIVE</div>
                </div>
              </div>
            </div>
          </div>

          {status === 'success' && (
            <div className="status-box success">
              ✓ ALL 3 TEMPORAL DISCREPANCIES LOGGED // WARDEN PRECOGNITION TIMELINE REVEALED
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <div className="hint-reminder">
            Tip: Compare the Clock, the Subject Badge on the coat, and the Vent grille above.
          </div>
        </div>
      </div>
    </div>
  );
};
