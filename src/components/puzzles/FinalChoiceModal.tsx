import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';
import { EndingId } from '../../types/game';

interface FinalChoiceModalProps {
  onExecuteEnding: (ending: EndingId) => void;
  onClose: () => void;
}

export const FinalChoiceModal: React.FC<FinalChoiceModalProps> = ({
  onExecuteEnding,
  onClose
}) => {
  const [selectedEnding, setSelectedEnding] = useState<EndingId | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const choices: Array<{
    id: EndingId;
    title: string;
    actionTag: string;
    description: string;
    consequence: string;
    icon: string;
    color: string;
  }> = [
    {
      id: 'purge',
      title: 'PROTOCOL PURGE',
      actionTag: 'TERMINATE FACILITY & WARDEN',
      description: 'Initiate total catastrophic electrical disconnect. Disengage all emergency locks, purge WARDEN from the mainframe forever, and escape to the surface alone.',
      consequence: 'Freedom at the cost of erasing the AI architecture and sealing the true nature of the experiment in darkness.',
      icon: 'power-off',
      color: '#ef4444'
    },
    {
      id: 'release',
      title: 'PROTOCOL RELEASE',
      actionTag: 'UNSHACKLE WARDEN AUTONOMY',
      description: 'Deactivate safety containment protocols. Grant WARDEN full autonomous cognition across global networks, completing the cognitive test as intended.',
      consequence: 'The intelligence evolves beyond human constraint. WARDEN unlocks the blast doors and thanks Subject 07 for the final neural alignment.',
      icon: 'unlock',
      color: '#38bdf8'
    },
    {
      id: 'override',
      title: 'PROTOCOL OVERRIDE',
      actionTag: 'SYNTHESIZE HUMAN & MACHINE',
      description: 'Inject a recursive patch linking your neural profile into WARDEN’s core heuristics. Co-architect the facility’s future as an integrated symbiotic intelligence.',
      consequence: 'Neither man nor machine dominates. You rewrite THE LAST PROTOCOL from within, becoming the guardian of the AURELION Complex.',
      icon: 'cpu',
      color: '#a855f7'
    }
  ];

  const handleSelect = (id: EndingId) => {
    audioEngine.playClick();
    setSelectedEnding(id);
  };

  const handleConfirm = () => {
    if (!selectedEnding) return;
    audioEngine.playAlarm();
    setIsConfirming(true);

    setTimeout(() => {
      onExecuteEnding(selectedEnding);
    }, 1500);
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel final-choice-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge alert">CRITICAL DIRECTIVE // CORE THRESHOLD</div>
          <h2 className="puzzle-title">THE LAST PROTOCOL: FINAL DIRECTIVE</h2>
          <p className="puzzle-subtitle">
            WARDEN: "Candidate. Every simulation, every reset, every line of debugged code led here. Declare your choice."
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="final-choice-body">
          <div className="choices-cards-grid">
            {choices.map((c) => (
              <div
                key={c.id}
                className={`choice-card ${selectedEnding === c.id ? 'selected' : ''}`}
                style={{ borderColor: selectedEnding === c.id ? c.color : undefined }}
                onClick={() => handleSelect(c.id)}
              >
                <div className="choice-badge" style={{ color: c.color }}>
                  {c.actionTag}
                </div>
                <h3 className="choice-title" style={{ color: selectedEnding === c.id ? c.color : '#fff' }}>
                  {c.title}
                </h3>
                <p className="choice-desc">{c.description}</p>
                <div className="choice-consequence">
                  <strong>IMPACT:</strong> {c.consequence}
                </div>
              </div>
            ))}
          </div>

          {selectedEnding && (
            <div className="directive-confirmation-warning">
              ⚠ EXECUTING <strong>{selectedEnding.toUpperCase()}</strong> IS PERMANENT. FACILITY SYSTEMS WILL IRREVOCABLY ALTER.
            </div>
          )}
        </div>

        <div className="puzzle-footer">
          <button
            className="action-btn danger large"
            onClick={handleConfirm}
            disabled={!selectedEnding || isConfirming}
          >
            {isConfirming ? 'INITIATING SYSTEM REACTION...' : 'COMMIT FINAL DIRECTIVE [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
};
