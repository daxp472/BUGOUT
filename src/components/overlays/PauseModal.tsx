import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface PauseModalProps {
  onResume: () => void;
  onRestartRoom: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestartRoom,
  onOpenSettings,
  onQuitToMenu
}) => {
  const [confirmRestart, setConfirmRestart] = useState(false);

  return (
    <div className="puzzle-modal-backdrop pause-backdrop" onClick={onResume}>
      <div className="puzzle-panel pause-menu-panel" onClick={(e) => e.stopPropagation()}>
        <div className="pause-header">
          <div className="puzzle-badge">MISSION SUSPENDED</div>
          <h2 className="puzzle-title">PAUSE SIMULATION</h2>
          <p className="puzzle-subtitle">TIMERS PAUSED // SENSORY FEED STANDBY</p>
        </div>

        <div className="pause-menu-buttons">
          <button
            className="action-btn primary large"
            onClick={() => {
              audioEngine.playClick();
              onResume();
            }}
          >
            RESUME SIMULATION [ESC]
          </button>

          {!confirmRestart ? (
            <button
              className="action-btn secondary"
              onClick={() => {
                audioEngine.playClick();
                setConfirmRestart(true);
              }}
            >
              RESTART CURRENT ROOM
            </button>
          ) : (
            <div className="confirm-restart-box">
              <span>CONFIRM RESET ROOM PROGRESS?</span>
              <div className="confirm-buttons-row">
                <button
                  className="action-btn danger small"
                  onClick={() => {
                    audioEngine.playClick();
                    onRestartRoom();
                  }}
                >
                  YES, RESTART
                </button>
                <button
                  className="action-btn secondary small"
                  onClick={() => {
                    audioEngine.playClick();
                    setConfirmRestart(false);
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          <button
            className="action-btn secondary"
            onClick={() => {
              audioEngine.playClick();
              onOpenSettings();
            }}
          >
            SETTINGS & AUDIO
          </button>

          <button
            className="action-btn danger"
            onClick={() => {
              audioEngine.playClick();
              onQuitToMenu();
            }}
          >
            ABORT TO MAIN MENU
          </button>
        </div>

        <div className="pause-footer-hint">
          Press ESC to resume gameplay immediately.
        </div>
      </div>
    </div>
  );
};
