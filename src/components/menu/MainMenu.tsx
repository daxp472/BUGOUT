import React, { useEffect, useState } from 'react';
import { CampaignId, PlayerProfile, PlayerRecords, SaveSlot } from '../../types/game';
import { CAMPAIGNS, getCampaign } from '../../data/campaignsData';
import { ALL_ROOMS } from '../../data/gameData';
import { getClearance, formatPlaytime, formatTimestamp } from '../../services/storageService';
import { ACHIEVEMENTS } from '../../services/achievements';
import { audioEngine } from '../../services/audioEngine';
import { SAVE_SLOT_COUNT, SAVE_SLOT_INFO } from './menuHelpers';

interface MainMenuProps {
  profile: PlayerProfile;
  records: PlayerRecords;
  continueSlot: { index: number; slot: SaveSlot } | null;
  onContinue: () => void;
  onStartCampaign: (campaignId: CampaignId, slotIndex: number) => void;
  onLoadSlot: (slotIndex: number) => void;
  onDeleteSlot: (slotIndex: number) => void;
  onOpenSettings: () => void;
}

type MenuTab = 'operations' | 'load' | 'records';

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  records,
  continueSlot,
  onContinue,
  onStartCampaign,
  onLoadSlot,
  onDeleteSlot,
  onOpenSettings,
}) => {
  const [tab, setTab] = useState<MenuTab>('operations');
  const [showCredits, setShowCredits] = useState(false);
  const [slotPickerFor, setSlotPickerFor] = useState<CampaignId | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [shakeLock, setShakeLock] = useState<CampaignId | null>(null);

  const clearance = getClearance(records.xp);

  const handleTab = (next: MenuTab) => {
    audioEngine.playClick();
    setTab(next);
  };

  const handleCampaignClick = (campaignId: CampaignId) => {
    const def = CAMPAIGNS.find((c) => c.id === campaignId)!;
    const locked = def.requiredCampaign ? !records.campaignsCompleted.includes(def.requiredCampaign) : false;
    if (locked) {
      audioEngine.playError();
      setShakeLock(campaignId);
      setTimeout(() => setShakeLock(null), 500);
      return;
    }
    audioEngine.playClick();
    setSlotPickerFor(campaignId);
  };

  return (
    <div className="menu-hub">
      <div className="menu-hub-ambient" />
      <div className="menu-hub-scanlines" />

      {/* ===== TOP BAR ===== */}
      <header className="hub-topbar">
        <div className="hub-branding">
          <span className="hub-logo">BUGOUT</span>
          <span className="hub-logo-sub">THE LAST PROTOCOL</span>
        </div>
        <div className="hub-operator-chip">
          <div className="operator-id">
            <span className="operator-label">OPERATOR</span>
            <span className="operator-callsign">{profile.callsign}</span>
          </div>
          <div className="operator-clearance">
            <span className="clearance-tag">{clearance.level}</span>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${Math.round(clearance.progress * 100)}%` }} />
            </div>
            <span className="xp-text">{records.xp.toLocaleString()} XP{clearance.nextAt ? ` / NEXT ${clearance.nextAt.toLocaleString()}` : ''}</span>
          </div>
        </div>
      </header>

      <div className="hub-body">
        {/* ===== LEFT NAV RAIL ===== */}
        <nav className="hub-rail" aria-label="Main menu">
          {([
            { id: 'operations', label: 'OPERATIONS', icon: '◎' },
            { id: 'load', label: 'LOAD GAME', icon: '▤' },
            { id: 'records', label: 'RECORDS', icon: '★' },
          ] as const).map((item) => (
            <button
              key={item.id}
              className={`rail-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => handleTab(item.id)}
            >
              <span className="rail-icon">{item.icon}</span>
              <span className="rail-label">{item.label}</span>
            </button>
          ))}
          <div className="rail-divider" />
          <button className="rail-item" onClick={() => { audioEngine.playClick(); onOpenSettings(); }}>
            <span className="rail-icon">⚙</span>
            <span className="rail-label">SETTINGS</span>
          </button>
          <button className="rail-item" onClick={() => { audioEngine.playClick(); setShowCredits(true); }}>
            <span className="rail-icon">✦</span>
            <span className="rail-label">CREDITS</span>
          </button>
          <div className="rail-spacer" />
          <div className="rail-footer">
            <div>AURELION RESEARCH FACILITY</div>
            <div>BUILD V2.0 // LOCAL+GLOBAL RECORDS</div>
          </div>
        </nav>

        {/* ===== CONTENT ===== */}
        <main className="hub-content">
          {tab === 'operations' && (
            <OperationsTab
              records={records}
              continueSlot={continueSlot}
              onContinue={onContinue}
              onCampaignClick={handleCampaignClick}
              shakeLock={shakeLock}
            />
          )}
          {tab === 'load' && (
            <LoadTab
              onLoadSlot={onLoadSlot}
              onDeleteSlot={(i) => (confirmDelete === i ? undefined : setConfirmDelete(i))}
              confirmDelete={confirmDelete}
              onConfirmDelete={(i) => {
                audioEngine.playError();
                onDeleteSlot(i);
                setConfirmDelete(null);
              }}
              onCancelDelete={() => setConfirmDelete(null)}
            />
          )}
          {tab === 'records' && <RecordsTab records={records} profile={profile} />}
        </main>
      </div>

      {/* ===== SLOT PICKER MODAL (new campaign) ===== */}
      {slotPickerFor && (
        <div className="puzzle-modal-backdrop" onClick={() => setSlotPickerFor(null)}>
          <div className="puzzle-panel slot-picker-panel" onClick={(e) => e.stopPropagation()}>
            <div className="puzzle-header">
              <div className="puzzle-badge">{getCampaign(slotPickerFor).codename}</div>
              <h2 className="puzzle-title">SELECT SAVE SLOT</h2>
              <p className="puzzle-subtitle">BEGIN {getCampaign(slotPickerFor).title} — CHOOSE A RECORD SLOT</p>
              <button className="puzzle-close-btn" onClick={() => setSlotPickerFor(null)} aria-label="Close">✕</button>
            </div>
            <div className="slot-picker-list">
              {Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => {
                const info = SAVE_SLOT_INFO(i);
                return (
                  <button
                    key={i}
                    className={`slot-row ${info ? 'occupied' : 'empty'}`}
                    onClick={() => {
                      audioEngine.playClick();
                      onStartCampaign(slotPickerFor, i);
                    }}
                  >
                    <span className="slot-row-num">SLOT {i + 1}</span>
                    {info ? (
                      <span className="slot-row-detail">
                        <strong>{info.callsign}</strong> — {info.summary}
                        <em className="slot-overwrite-note">STARTING A NEW RECORD HERE WILL OVERWRITE THIS SLOT</em>
                      </span>
                    ) : (
                      <span className="slot-row-detail empty-note">EMPTY — BEGIN NEW RECORD</span>
                    )}
                    <span className="slot-row-action">{info ? 'OVERWRITE ▸' : 'BEGIN ▸'}</span>
                  </button>
                );
              })}
            </div>
            <div className="puzzle-footer">
              <button className="action-btn secondary" onClick={() => setSlotPickerFor(null)}>CANCEL [ESC]</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREDITS MODAL ===== */}
      {showCredits && (
        <div className="puzzle-modal-backdrop" onClick={() => setShowCredits(false)}>
          <div className="puzzle-panel credits-panel" onClick={(e) => e.stopPropagation()}>
            <div className="puzzle-header">
              <div className="puzzle-badge">PERSONNEL DOSSIER</div>
              <h2 className="puzzle-title">BUGOUT: THE LAST PROTOCOL</h2>
              <button className="puzzle-close-btn" onClick={() => setShowCredits(false)} aria-label="Close">✕</button>
            </div>
            <div className="briefing-content credits-content">
              <h3>CREATIVE DIRECTION & SYSTEM ARCHITECTURE</h3>
              <p>Engineering Agent Pair — Built with ZCode</p>
              <h3>CAMPAIGNS</h3>
              <p>THE LAST PROTOCOL · GHOST SIGNAL · ECHOES OF AURELION</p>
              <h3>AUDIO SYNTHESIS</h3>
              <p>Procedural Web Audio Oscillator Matrix — zero audio files</p>
              <h3>TECHNOLOGY STACK</h3>
              <p>React 19 + TypeScript + Vite + Canvas 2D + Custom CSS Engine</p>
              <h3>SPECIAL THANKS</h3>
              <p>Every candidate who walked back into the dark.</p>
            </div>
            <div className="puzzle-footer">
              <button className="action-btn primary" onClick={() => setShowCredits(false)}>CLOSE CREDITS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   OPERATIONS TAB — continue banner + campaign cards
   ============================================================ */

const OperationsTab: React.FC<{
  records: PlayerRecords;
  continueSlot: { index: number; slot: SaveSlot } | null;
  onContinue: () => void;
  onCampaignClick: (id: CampaignId) => void;
  shakeLock: CampaignId | null;
}> = ({ records, continueSlot, onContinue, onCampaignClick, shakeLock }) => {
  const continueCampaign = continueSlot?.slot.activeCampaignId
    ? getCampaign(continueSlot.slot.activeCampaignId)
    : null;
  const continueRoom = continueSlot?.slot.activeCampaignId
    ? ALL_ROOMS[continueSlot.slot.campaigns[continueSlot.slot.activeCampaignId]?.currentRoomId]
    : null;

  return (
    <div className="operations-tab">
      {continueSlot && (
        <button className="continue-banner" onClick={() => { audioEngine.playClick(); onContinue(); }}>
          <div className="continue-left">
            <span className="continue-tag">RESUME LAST RECORD — SLOT {continueSlot.index + 1}</span>
            <span className="continue-title">
              {continueCampaign ? continueCampaign.title : 'CAMPAIGN'}{continueRoom ? ` // ${continueRoom.name}` : ''}
            </span>
          </div>
          <div className="continue-meta">
            <span>{formatPlaytime(
              Object.values(continueSlot.slot.campaigns).reduce((acc, c) => acc + (c?.stats?.elapsedSeconds ?? 0), 0)
            )} PLAYED</span>
            <span>{formatTimestamp(continueSlot.slot.savedAt)}</span>
          </div>
          <span className="continue-arrow">▸</span>
        </button>
      )}

      <div className="campaign-grid">
        {CAMPAIGNS.map((campaign) => {
          const locked = campaign.requiredCampaign
            ? !records.campaignsCompleted.includes(campaign.requiredCampaign)
            : false;
          const best = records.campaignBests[campaign.id];
          return (
            <button
              key={campaign.id}
              className={`campaign-card ${locked ? 'locked' : ''} ${shakeLock === campaign.id ? 'shake' : ''}`}
              onClick={() => onCampaignClick(campaign.id)}
              style={{ '--card-accent': campaign.accentColor } as React.CSSProperties}
            >
              <div className={`campaign-hero ${campaign.heroClass}`}>
                <span className="campaign-index">{String(campaign.index).padStart(2, '0')}</span>
                {locked && <span className="campaign-lock-overlay">🔒</span>}
                {best && <span className="campaign-cleared-tag">CLEARED</span>}
              </div>
              <div className="campaign-card-body">
                <div className="campaign-card-top">
                  <span className="campaign-codename">{campaign.codename}</span>
                  <span className={`difficulty-chip diff-${campaign.difficulty.toLowerCase()}`}>{campaign.difficulty}</span>
                </div>
                <h3 className="campaign-title">{campaign.title}</h3>
                <p className="campaign-subtitle">{campaign.subtitle}</p>
                <p className="campaign-tagline">{campaign.tagline}</p>
                <div className="campaign-meta-row">
                  <span>{campaign.roomCount} CHAMBERS</span>
                  <span>{campaign.puzzleCount} PUZZLES</span>
                  <span>{campaign.endingIds.length} ENDINGS</span>
                </div>
                {locked ? (
                  <div className="campaign-lock-note">
                    REQUIRES: {campaign.requiredCampaign ? getCampaign(campaign.requiredCampaign).title : ''}
                  </div>
                ) : (
                  <div className="campaign-best-row">
                    {best ? (
                      <>
                        <span>BEST {best.bestScore.toLocaleString()} · {best.bestRank.toUpperCase()}</span>
                        <span>{best.endingsSeen.length}/{campaign.endingIds.length} ENDINGS</span>
                      </>
                    ) : (
                      <span className="not-cleared">NO RECORD — UNPLAYED</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================
   LOAD TAB — 3 save slots
   ============================================================ */

const LoadTab: React.FC<{
  onLoadSlot: (i: number) => void;
  onDeleteSlot: (i: number) => void;
  confirmDelete: number | null;
  onConfirmDelete: (i: number) => void;
  onCancelDelete: () => void;
}> = ({ onLoadSlot, onDeleteSlot, confirmDelete, onConfirmDelete, onCancelDelete }) => (
  <div className="load-tab">
    <h2 className="tab-heading">LOAD GAME</h2>
    <p className="tab-subheading">THREE RECORD SLOTS. EACH SLOT HOLDS ALL CAMPAIGN PROGRESS.</p>
    <div className="slot-list">
      {Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => {
        const info = SAVE_SLOT_INFO(i);
        return (
          <div key={i} className={`load-slot-card ${info ? 'occupied' : 'empty'}`}>
            <div className="load-slot-head">
              <span className="load-slot-num">SLOT {i + 1}</span>
              {info ? (
                <span className="load-slot-time">{formatTimestamp(info.savedAt)}</span>
              ) : (
                <span className="load-slot-time">EMPTY</span>
              )}
            </div>
            {info ? (
              <>
                <div className="load-slot-body">
                  <div className="load-slot-line"><strong>{info.callsign}</strong></div>
                  <div className="load-slot-line">{info.summary}</div>
                  <div className="load-slot-line muted">{info.detail}</div>
                </div>
                <div className="load-slot-actions">
                  {confirmDelete === i ? (
                    <>
                      <span className="delete-confirm-text">DELETE THIS RECORD?</span>
                      <button className="action-btn danger small" onClick={() => onConfirmDelete(i)}>CONFIRM DELETE</button>
                      <button className="action-btn secondary small" onClick={onCancelDelete}>CANCEL</button>
                    </>
                  ) : (
                    <>
                      <button className="action-btn primary small" onClick={() => { audioEngine.playClick(); onLoadSlot(i); }}>
                        LOAD ▸
                      </button>
                      <button className="action-btn danger small" onClick={() => { audioEngine.playClick(); onDeleteSlot(i); }}>
                        DELETE
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="load-slot-body">
                <div className="load-slot-line muted">NO RECORD IN THIS SLOT.</div>
                <div className="load-slot-line muted">Start a new campaign from the OPERATIONS tab.</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/* ============================================================
   RECORDS TAB — profile, bests, achievements, leaderboard
   ============================================================ */

const achievementGlyph: Record<string, string> = {
  door: '🚪',
  terminal: '💻',
  folder: '🗂️',
  ghost: '👻',
  skull: '☠️',
  unlock: '🔓',
  brain: '🧠',
  star: '⭐',
  radio: '📡',
  waveform: '📈',
  key: '🗝️',
  antenna: '🗼',
  echo: '🔁',
  clock: '⏱️',
  infinity: '♾️',
  zap: '⚡',
  trophy: '🏆',
};

const RecordsTab: React.FC<{ records: PlayerRecords; profile: PlayerProfile }> = ({ records, profile }) => {
  const clearance = getClearance(records.xp);
  const [boardCampaign, setBoardCampaign] = useState<CampaignId>('c1_last_protocol');
  const [boardEntries, setBoardEntries] = useState<{ loading: boolean; entries: any[]; note: string }>({
    loading: false,
    entries: [],
    note: '',
  });
  const [boardConfigured, setBoardConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { isLeaderboardConfigured, fetchTopScores } = await import('../../services/leaderboardService');
      const configured = isLeaderboardConfigured();
      if (cancelled) return;
      setBoardConfigured(configured);
      if (!configured) return;
      setBoardEntries({ loading: true, entries: [], note: '' });
      const entries = await fetchTopScores(boardCampaign, 10);
      if (cancelled) return;
      setBoardEntries({
        loading: false,
        entries,
        note: entries.length === 0 ? 'NO GLOBAL ENTRIES YET — BE THE FIRST.' : '',
      });
    })();
    return () => { cancelled = true; };
  }, [boardCampaign]);

  return (
    <div className="records-tab">
      <h2 className="tab-heading">OPERATOR RECORDS</h2>

      <div className="records-profile-bar">
        <div className="records-profile-id">
          <span className="records-callsign">{profile.callsign}</span>
          <span className="records-clearance">{clearance.level}</span>
        </div>
        <div className="records-xp">
          <div className="xp-bar large">
            <div className="xp-fill" style={{ width: `${Math.round(clearance.progress * 100)}%` }} />
          </div>
          <span className="xp-text">{records.xp.toLocaleString()} XP{clearance.nextAt ? ` · ${Math.max(0, clearance.nextAt - records.xp).toLocaleString()} TO NEXT CLEARANCE` : ' · MAX CLEARANCE'}</span>
        </div>
        <div className="records-totals">
          <span>{records.totalPuzzlesSolved} PUZZLES</span>
          <span>{records.totalRoomsCompleted} CHAMBERS</span>
          <span>{records.totalEvidenceCollected} EVIDENCE</span>
          <span>{formatPlaytime(records.totalPlaySeconds)} PLAYED</span>
        </div>
      </div>

      <div className="records-columns">
        <div className="records-col">
          <h3 className="records-col-title">CAMPAIGN BESTS</h3>
          {CAMPAIGNS.map((campaign) => {
            const best = records.campaignBests[campaign.id];
            return (
              <div key={campaign.id} className="best-row" style={{ '--card-accent': campaign.accentColor } as React.CSSProperties}>
                <div className="best-row-head">
                  <span className="best-campaign">{campaign.title}</span>
                  <span className={`difficulty-chip diff-${campaign.difficulty.toLowerCase()}`}>{campaign.difficulty}</span>
                </div>
                {best ? (
                  <div className="best-row-grid">
                    <span><em>SCORE</em>{best.bestScore.toLocaleString()}</span>
                    <span><em>RANK</em>{best.bestRank.toUpperCase()}</span>
                    <span><em>BEST TIME</em>{formatPlaytime(best.bestTimeSeconds)}</span>
                    <span><em>RUNS</em>{best.completions}</span>
                    <span><em>ENDINGS</em>{best.endingsSeen.length}/{campaign.endingIds.length}</span>
                  </div>
                ) : (
                  <div className="best-row-grid none">NO COMPLETED RUNS</div>
                )}
              </div>
            );
          })}

          <h3 className="records-col-title">GLOBAL LEADERBOARD</h3>
          <div className="board-tabs">
            {CAMPAIGNS.map((c) => (
              <button
                key={c.id}
                className={`board-tab ${boardCampaign === c.id ? 'active' : ''}`}
                onClick={() => { audioEngine.playClick(); setBoardCampaign(c.id); }}
              >
                {String(c.index).padStart(2, '0')}
              </button>
            ))}
          </div>
          <div className="leaderboard-box">
            {boardConfigured === false ? (
              <div className="board-note">GLOBAL BOARD OFFLINE — CONFIGURE SUPABASE (SEE SUPABASE_SETUP.md). LOCAL RECORDS STILL TRACK EVERYTHING.</div>
            ) : boardEntries.loading ? (
              <div className="board-note">FETCHING GLOBAL BOARD...</div>
            ) : boardEntries.entries.length === 0 ? (
              <div className="board-note">{boardEntries.note || 'NO ENTRIES.'}</div>
            ) : (
              <ol className="board-list">
                {boardEntries.entries.map((e, i) => (
                  <li key={i} className="board-entry">
                    <span className="board-pos">#{i + 1}</span>
                    <span className="board-callsign">{e.callsign}</span>
                    <span className="board-score">{e.score.toLocaleString()}</span>
                    <span className="board-rank">{String(e.rank).toUpperCase()}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="records-col">
          <h3 className="records-col-title">ACHIEVEMENTS — {Object.keys(records.achievements).length}/{ACHIEVEMENTS.length}</h3>
          <div className="achievement-grid">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = !!records.achievements[a.id];
              return (
                <div key={a.id} className={`achievement-card ${unlocked ? 'unlocked' : 'locked'} ${a.secret && !unlocked ? 'secret' : ''}`}>
                  <span className="achievement-icon">{a.secret && !unlocked ? '???' : achievementGlyph[a.icon] ?? '◆'}</span>
                  <span className="achievement-name">{a.secret && !unlocked ? 'CLASSIFIED' : a.name}</span>
                  <span className="achievement-desc">{a.secret && !unlocked ? 'HIDDEN ACHIEVEMENT' : a.description}</span>
                  <span className="achievement-xp">+{a.xpReward} XP</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
