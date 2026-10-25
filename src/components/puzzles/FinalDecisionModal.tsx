import React, { useState } from 'react';
import { CampaignId, EndingId } from '../../types/game';
import { ENDINGS, getCampaign } from '../../data/campaignsData';
import { audioEngine } from '../../services/audioEngine';

interface FinalDecisionModalProps {
  campaignId: CampaignId;
  onExecuteEnding: (endingId: EndingId) => void;
  onClose: () => void;
}

const choiceGlyph: Record<string, string> = {
  radio: '📡',
  'zap-off': '⚡',
  edit: '✒️',
  skull: '☠️',
  unlock: '🔓',
  brain: '🧠',
  scissors: '✂️',
  shield: '🛡️',
  users: '👥',
};

/**
 * Generic final-decision console for every campaign. Choices are derived
 * from the campaign's ending definitions — three divergent outcomes each.
 */
export const FinalDecisionModal: React.FC<FinalDecisionModalProps> = ({
  campaignId,
  onExecuteEnding,
  onClose
}) => {
  const campaign = getCampaign(campaignId);
  const [selected, setSelected] = useState<EndingId | null>(null);
  const [confirming, setConfirming] = useState(false);

  const choices = campaign.endingIds.map((id) => ENDINGS[id]).filter(Boolean);

  const handleExecute = () => {
    if (!selected) return;
    audioEngine.playAlarm();
    setTimeout(() => onExecuteEnding(selected), 400);
  };

  return (
    <div className="puzzle-modal-backdrop final-decision-backdrop" onClick={onClose}>
      <div className={`puzzle-panel final-decision-panel campaign-${campaign.index}`} onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge alert">FINAL DIRECTIVE // IRREVERSIBLE</div>
          <h2 className="puzzle-title">EXECUTE THE LAST PROTOCOL</h2>
          <p className="puzzle-subtitle">
            {campaign.title.toUpperCase()} — THIS DECISION DETERMINES THE ENDING
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="final-choice-stack">
          {choices.map((ending) => (
            <button
              key={ending.id}
              className={`final-choice-card ${selected === ending.id ? 'selected' : ''}`}
              onClick={() => {
                audioEngine.playClick();
                setSelected(ending.id);
                setConfirming(false);
              }}
            >
              <span className="final-choice-icon">{choiceGlyph[ending.choiceIcon] ?? '◈'}</span>
              <span className="final-choice-body">
                <span className="final-choice-label">{ending.choiceLabel}</span>
                <span className="final-choice-desc">{ending.choiceDescription}</span>
              </span>
              <span className="final-choice-radio">{selected === ending.id ? '◉' : '○'}</span>
            </button>
          ))}
        </div>

        {confirming && selected && (
          <div className="final-confirm-strip">
            <span>⚠ CONFIRM: {ENDINGS[selected].choiceLabel} CANNOT BE UNDONE.</span>
            <button className="action-btn danger" onClick={handleExecute}>CONFIRM EXECUTION</button>
            <button className="action-btn secondary" onClick={() => setConfirming(false)}>STAND DOWN</button>
          </div>
        )}

        <div className="puzzle-footer">
          <button
            className="action-btn warning large"
            disabled={!selected || confirming}
            onClick={() => {
              audioEngine.playWardenVoice();
              setConfirming(true);
            }}
          >
            {selected ? `ARM ${ENDINGS[selected].choiceLabel}` : 'SELECT A DIRECTIVE'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>
            STAND DOWN [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
