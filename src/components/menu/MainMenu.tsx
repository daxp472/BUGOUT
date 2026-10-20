import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface MainMenuProps {
  hasSave: boolean;
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSave,
  onStartNewGame,
  onContinueGame,
  onOpenSettings
}) => {
  const [showBriefing, setShowBriefing] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const handleInteract = () => {
    audioEngine.playAmbient('menu');
  };

  return (
    <div className="main-menu-container" onClick={handleInteract}>
      {/* Animated Atmospheric Background */}
      <div className="menu-ambient-mesh" />
      <div className="menu-scanlines" />

      <div className="menu-inner-layout">
        {/* Title Branding */}
        <div className="menu-branding-block">
          <div className="menu-top-tagline">AN IMMERSIVE CODE-POWERED ESCAPE ADVENTURE</div>
          <h1 className="menu-logo-title">BUGOUT</h1>
          <div className="menu-logo-subtitle">THE LAST PROTOCOL</div>
          <div className="menu-lore-intro">
            AURELION COMPLEX // FIVE SEALED CHAMBERS // ONE SYSTEM KNOWING YOUR EVERY MOVE
          </div>
        </div>

        {/* Action Buttons */}
        <div className="menu-actions-stack">
          {hasSave && (
            <button
              className="menu-btn primary continue-btn"
              onClick={(e) => {
                e.stopPropagation();
                audioEngine.playClick();
                onContinueGame();
              }}
            >
              <span className="btn-icon">▶</span>
              <span className="btn-text">CONTINUE CAMPAIGN</span>
            </button>
          )}

          <button
            className={`menu-btn ${!hasSave ? 'primary' : 'secondary'} new-game-btn`}
            onClick={(e) => {
              e.stopPropagation();
              audioEngine.playClick();
              onStartNewGame();
            }}
          >
            <span className="btn-icon">⚡</span>
            <span className="btn-text">NEW GAME</span>
          </button>

          <button
            className="menu-btn secondary"
            onClick={(e) => {
              e.stopPropagation();
              audioEngine.playClick();
              setShowBriefing(true);
            }}
          >
            <span className="btn-icon">📄</span>
            <span className="btn-text">MISSION BRIEFING</span>
          </button>

          <button
            className="menu-btn secondary"
            onClick={(e) => {
              e.stopPropagation();
              audioEngine.playClick();
              onOpenSettings();
            }}
          >
            <span className="btn-icon">⚙</span>
            <span className="btn-text">SETTINGS & AUDIO</span>
          </button>

          <button
            className="menu-btn tertiary"
            onClick={(e) => {
              e.stopPropagation();
              audioEngine.playClick();
              setShowCredits(true);
            }}
          >
            <span className="btn-icon">★</span>
            <span className="btn-text">CREDITS</span>
          </button>
        </div>

        {/* Footer Meta */}
        <div className="menu-footer-meta">
          <span>AURELION RESEARCH FACILITY // BUILD V1.0.0</span>
          <span>KEYBOARD & MOUSE ENABLED // AUDIO STEREO PROC-SYNTH</span>
        </div>
      </div>

      {/* Mission Briefing Overlay */}
      {showBriefing && (
        <div className="puzzle-modal-backdrop" onClick={() => setShowBriefing(false)}>
          <div className="puzzle-panel briefing-panel" onClick={(e) => e.stopPropagation()}>
            <div className="puzzle-header">
              <div className="puzzle-badge">FACILITY DOSSIER // TOP SECRET</div>
              <h2 className="puzzle-title">OPERATION BUGOUT: BRIEFING</h2>
              <button className="puzzle-close-btn" onClick={() => setShowBriefing(false)}>✕</button>
            </div>
            <div className="briefing-content">
              <p>
                You awaken inside sealed Chamber 01 of the clandestine AURELION Complex. An autonomous intelligence known as WARDEN monitors your vital signs, claiming you are candidate Subject 07 undergoing a routine assessment.
              </p>
              <p>
                Five interconnected chambers stand between you and the surface:
              </p>
              <ul>
                <li><strong>Room 01 — The Arrival:</strong> Observation & Stasis. Power circuits and broken code authorization.</li>
                <li><strong>Room 02 — The Frost Lab:</strong> Cryogenics & Coolant. Valve pressure routing and logic repair.</li>
                <li><strong>Room 03 — The Server Vault:</strong> Restricted Data Core. Server anomaly analysis and REST API simulation.</li>
                <li><strong>Room 04 — The Mirror Chamber:</strong> Perception Lab. Spotting temporal discrepancies and Boolean logic circuits.</li>
                <li><strong>Room 05 — The Last Protocol:</strong> The Neural Core. Multi-chamber synthesis and the ultimate moral decision.</li>
              </ul>
              <p>
                Controls: <strong>Mouse / E</strong> to inspect & interact, <strong>TAB</strong> for Evidence Inventory, <strong>M</strong> for Facility Blueprint Map, <strong>H</strong> for WARDEN hints, and <strong>ESC</strong> to Pause.
              </p>
            </div>
            <div className="puzzle-footer">
              <button className="action-btn primary" onClick={() => setShowBriefing(false)}>
                ACKNOWLEDGE BRIEFING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits Overlay */}
      {showCredits && (
        <div className="puzzle-modal-backdrop" onClick={() => setShowCredits(false)}>
          <div className="puzzle-panel credits-panel" onClick={(e) => e.stopPropagation()}>
            <div className="puzzle-header">
              <div className="puzzle-badge">PERSONNEL DOSSIER</div>
              <h2 className="puzzle-title">BUGOUT: THE LAST PROTOCOL</h2>
              <button className="puzzle-close-btn" onClick={() => setShowCredits(false)}>✕</button>
            </div>
            <div className="briefing-content credits-content">
              <h3>CREATIVE DIRECTION & SYSTEM ARCHITECTURE</h3>
              <p>Google Antigravity & Pair Programming Engineering Agent</p>
              <h3>NARRATIVE & PUZZLE ENGINEERING</h3>
              <p>The AURELION Complex Escapology Team</p>
              <h3>AUDIO SYNTHESIS</h3>
              <p>Procedural HTML5 Web Audio Oscillator Matrix</p>
              <h3>TECHNOLOGY STACK</h3>
              <p>React 19 + TypeScript + Vite + Custom Canvas & CSS Engine</p>
            </div>
            <div className="puzzle-footer">
              <button className="action-btn primary" onClick={() => setShowCredits(false)}>
                CLOSE CREDITS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
