import React from 'react';
import { RoomConfig, InteractableObject, PlayerSettings } from '../../types/game';

interface HUDProps {
  roomConfig: RoomConfig;
  campaignTitle: string;
  elapsedSeconds: number;
  evidenceCount: number;
  hoveredObject: InteractableObject | null;
  settings: PlayerSettings;
  activeObjectiveText: string;
  onToggleInventory: () => void;
  onToggleMap: () => void;
  onToggleHint: () => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  roomConfig,
  campaignTitle,
  elapsedSeconds,
  evidenceCount,
  hoveredObject,
  settings,
  activeObjectiveText,
  onToggleInventory,
  onToggleMap,
  onToggleHint,
  onTogglePause,
  onToggleMute
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="game-hud-layer">
      {/* Top Left: Facility Identity & Room */}
      <div className="hud-top-left">
        <div className="hud-campaign-title">
          <span className="brand-bugout">BUGOUT</span>
          <span className="brand-subtitle">{campaignTitle}</span>
        </div>
        <div className="hud-room-indicator">
          <span className="hud-room-badge">CHAMBER {roomConfig.number}</span>
          <span className="hud-room-name">{roomConfig.name}</span>
        </div>
      </div>

      {/* Top Right: Mission Timer & Active Objective */}
      <div className="hud-top-right">
        <div className="hud-timer-badge">
          <span className="timer-icon">⏱</span>
          <span className="timer-digits">{formatTime(elapsedSeconds)}</span>
        </div>

        <div className="hud-objective-pill">
          <span className="objective-label">PRIMARY OBJECTIVE:</span>
          <span className="objective-text">{activeObjectiveText}</span>
        </div>

        <button
          className={`hud-mute-quick-btn ${settings.muted ? 'muted' : ''}`}
          onClick={onToggleMute}
          title={settings.muted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label="Toggle Audio Mute"
        >
          {settings.muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Bottom Center: Contextual Interaction Prompt */}
      {hoveredObject && (
        <div className="hud-bottom-center">
          <div className="interaction-prompt-banner">
            <span className="prompt-action-icon">🎯</span>
            <span className="prompt-object-name">{hoveredObject.name}:</span>
            <span className="prompt-key-callout">{hoveredObject.actionPrompt}</span>
          </div>
        </div>
      )}

      {/* Bottom Right: Tactical Keyboard Shortcuts */}
      <div className="hud-bottom-right">
        <button className="hud-shortcut-btn" onClick={onToggleInventory}>
          <span className="key-cap">TAB</span>
          <span className="shortcut-label">EVIDENCE [{evidenceCount}]</span>
        </button>

        <button className="hud-shortcut-btn" onClick={onToggleMap}>
          <span className="key-cap">M</span>
          <span className="shortcut-label">MAP</span>
        </button>

        <button className="hud-shortcut-btn" onClick={onToggleHint}>
          <span className="key-cap">H</span>
          <span className="shortcut-label">HINT</span>
        </button>

        <button className="hud-shortcut-btn" onClick={onTogglePause}>
          <span className="key-cap">ESC</span>
          <span className="shortcut-label">PAUSE</span>
        </button>
      </div>
    </div>
  );
};
