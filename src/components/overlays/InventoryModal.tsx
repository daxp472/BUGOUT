import React, { useState } from 'react';
import { CampaignId, EvidenceItem } from '../../types/game';
import { ALL_EVIDENCE, countCampaignEvidence } from '../../data/gameData';
import { audioEngine } from '../../services/audioEngine';

interface InventoryModalProps {
  campaignId: CampaignId;
  collectedIds: string[];
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  campaignId,
  collectedIds,
  onClose
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    collectedIds.length > 0 ? collectedIds[0] : null
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const campaignTotal = countCampaignEvidence(campaignId);
  const allItems = collectedIds.map((id) => ALL_EVIDENCE[id]).filter(Boolean);
  const filteredItems = filterCategory === 'all'
    ? allItems
    : allItems.filter((i) => i.category === filterCategory);

  const activeItem: EvidenceItem | undefined = selectedId ? ALL_EVIDENCE[selectedId] : undefined;

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel inventory-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">DOSSIER DATABASE // SUBJECT 07 INVENTORY</div>
          <h2 className="puzzle-title">FACILITY EVIDENCE & RECOVERED TELEMETRY</h2>
          <p className="puzzle-subtitle">
            INSPECT COLLECTED EVIDENCE, BLUEPRINTS, AND ARTIFACTS [TAB / ESC TO CLOSE]
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        {/* Filter Categories */}
        <div className="inventory-category-tabs">
          {['all', 'document', 'technical', 'photo', 'recovered_data', 'signal', 'recording'].map((cat) => (
            <button
              key={cat}
              className={`cat-tab-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => {
                audioEngine.playClick();
                setFilterCategory(cat);
              }}
            >
              {cat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="inventory-body-split">
          {/* Items Grid */}
          <div className="evidence-grid-pane">
            {filteredItems.length === 0 ? (
              <div className="empty-inventory-prompt">
                NO EVIDENCE LOGGED IN THIS CATEGORY YET.
              </div>
            ) : (
              <div className="evidence-items-list">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`evidence-card-row ${selectedId === item.id ? 'selected' : ''}`}
                    onClick={() => {
                      audioEngine.playClick();
                      setSelectedId(item.id);
                    }}
                  >
                    <div className="evidence-card-meta">
                      <span className="card-cat-badge">{item.category.toUpperCase()}</span>
                      <h4 className="card-item-title">{item.title}</h4>
                      <p className="card-item-summary">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Item Dossier Inspector */}
          <div className="evidence-detail-pane">
            {activeItem ? (
              <div className="dossier-full-view">
                <div className="dossier-header-bar">
                  <span className="dossier-id">ID: {activeItem.id.toUpperCase()}</span>
                  <span className="dossier-room">ORIGIN: {activeItem.roomId.toUpperCase()}</span>
                </div>
                <h3 className="dossier-title">{activeItem.title}</h3>
                
                {activeItem.visualDetail && (
                  <div className="dossier-visual-callout">
                    <code>{activeItem.visualDetail}</code>
                  </div>
                )}

                <pre className="dossier-detailed-text">
                  {activeItem.detailedText}
                </pre>

                {activeItem.relatedClues.length > 0 && (
                  <div className="dossier-related-tags">
                    <span className="related-label">CORRELATED EVIDENCE:</span>
                    {activeItem.relatedClues.map((relId) => {
                      const relObj = ALL_EVIDENCE[relId];
                      const isFound = collectedIds.includes(relId);
                      return (
                        <span
                          key={relId}
                          className={`related-badge ${isFound ? 'found' : 'undiscovered'}`}
                          onClick={() => {
                            if (isFound) {
                              audioEngine.playClick();
                              setSelectedId(relId);
                            }
                          }}
                        >
                          {relObj ? relObj.title : relId} {isFound ? '✓' : '(LOCKED)'}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-item-selected">
                SELECT AN ITEM TO EXAMINE COMPLETE TELEMETRY.
              </div>
            )}
          </div>
        </div>

        <div className="puzzle-footer">
          <span className="inventory-counter-text">
            TOTAL EVIDENCE COLLECTED: <strong>{collectedIds.length} / {campaignTotal}</strong>
          </span>
          <button className="action-btn secondary" onClick={onClose}>
            RETURN TO CHAMBER [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
