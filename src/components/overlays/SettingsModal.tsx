import React, { useState } from 'react';
import { PlayerSettings } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';
import { clearSavedGame } from '../../services/storageService';

interface SettingsModalProps {
  settings: PlayerSettings;
  onUpdateSettings: (newSettings: PlayerSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleMasterChange = (val: number) => {
    const updated = { ...settings, masterVolume: val };
    onUpdateSettings(updated);
    audioEngine.setVolumes(val, updated.sfxVolume, updated.musicVolume, updated.muted);
  };

  const handleSfxChange = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    onUpdateSettings(updated);
    audioEngine.setVolumes(updated.masterVolume, val, updated.musicVolume, updated.muted);
    audioEngine.playClick();
  };

  const handleMusicChange = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    onUpdateSettings(updated);
    audioEngine.setVolumes(updated.masterVolume, updated.sfxVolume, val, updated.muted);
  };

  const toggleMute = () => {
    const nextMuted = !settings.muted;
    const updated = { ...settings, muted: nextMuted };
    onUpdateSettings(updated);
    audioEngine.setVolumes(updated.masterVolume, updated.sfxVolume, updated.musicVolume, nextMuted);
  };

  const toggleReducedMotion = () => {
    audioEngine.playClick();
    onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
  };

  const toggleHighContrast = () => {
    audioEngine.playClick();
    onUpdateSettings({ ...settings, highContrast: !settings.highContrast });
  };

  const handleResetData = () => {
    clearSavedGame();
    audioEngine.playAlarm();
    window.location.reload();
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">SYSTEM PREFERENCES // CONFIGURATION</div>
          <h2 className="puzzle-title">SETTINGS & ACCESSIBILITY</h2>
          <p className="puzzle-subtitle">CUSTOMIZE AUDIO, MOTION DYNAMICS, AND CAMPAIGN STATE</p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="settings-body">
          {/* Audio Section */}
          <div className="settings-section">
            <h3 className="section-label">AUDIO CHANNELS</h3>
            
            <div className="setting-row">
              <div className="setting-label">MASTER VOLUME: {Math.round(settings.masterVolume * 100)}%</div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => handleMasterChange(parseFloat(e.target.value))}
                className="sci-fi-range-slider"
              />
            </div>

            <div className="setting-row">
              <div className="setting-label">SOUND EFFECTS (SFX): {Math.round(settings.sfxVolume * 100)}%</div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
                className="sci-fi-range-slider"
              />
            </div>

            <div className="setting-row">
              <div className="setting-label">AMBIENT & MUSIC: {Math.round(settings.musicVolume * 100)}%</div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
                className="sci-fi-range-slider"
              />
            </div>

            <div className="setting-toggle-row">
              <button
                className={`toggle-btn ${settings.muted ? 'active' : ''}`}
                onClick={toggleMute}
              >
                {settings.muted ? '🔇 AUDIO MUTED' : '🔊 AUDIO ACTIVE'}
              </button>
            </div>
          </div>

          {/* Accessibility & Visuals */}
          <div className="settings-section">
            <h3 className="section-label">VISUAL & ACCESSIBILITY</h3>

            <div className="setting-toggle-row">
              <button
                className={`toggle-btn ${settings.reducedMotion ? 'active' : ''}`}
                onClick={toggleReducedMotion}
              >
                {settings.reducedMotion ? '✓ REDUCED MOTION ENABLED' : '○ REDUCED MOTION DISABLED'}
              </button>
              <button
                className={`toggle-btn ${settings.highContrast ? 'active' : ''}`}
                onClick={toggleHighContrast}
              >
                {settings.highContrast ? '✓ HIGH CONTRAST ENABLED' : '○ HIGH CONTRAST DISABLED'}
              </button>
            </div>
          </div>

          {/* Campaign Reset */}
          <div className="settings-section danger-section">
            <h3 className="section-label">CAMPAIGN PERSISTENCE</h3>
            {!confirmClear ? (
              <button
                className="action-btn danger small"
                onClick={() => setConfirmClear(true)}
              >
                ERASE LOCAL STORAGE PROGRESS
              </button>
            ) : (
              <div className="confirm-reset-box">
                <span>PERMANENTLY CLEAR ALL SAVED EVIDENCE & ROOMS?</span>
                <div className="confirm-buttons-row">
                  <button className="action-btn danger small" onClick={handleResetData}>
                    CONFIRM ERASE
                  </button>
                  <button className="action-btn secondary small" onClick={() => setConfirmClear(false)}>
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="puzzle-footer">
          <button className="action-btn primary" onClick={onClose}>
            SAVE & CLOSE [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
