import React from 'react';
import { CampaignId, RoomId } from '../../types/game';
import { getCampaign } from '../../data/campaignsData';
import { ALL_ROOMS } from '../../data/gameData';
import { audioEngine } from '../../services/audioEngine';

interface FacilityMapModalProps {
  campaignId: CampaignId;
  currentRoomId: RoomId;
  completedRooms: RoomId[];
  unlockedRooms: RoomId[];
  onSelectRoom: (roomId: RoomId) => void;
  onClose: () => void;
}

export const FacilityMapModal: React.FC<FacilityMapModalProps> = ({
  campaignId,
  currentRoomId,
  completedRooms,
  unlockedRooms,
  onSelectRoom,
  onClose
}) => {
  const campaign = getCampaign(campaignId);
  const roomsOrder: RoomId[] = campaign.roomIds;

  const getRoomState = (id: RoomId) => {
    if (id === currentRoomId) return 'current';
    if (completedRooms.includes(id)) return 'completed';
    if (unlockedRooms.includes(id)) return 'unlocked';
    return 'locked';
  };

  const handleTransit = (id: RoomId) => {
    if (id === currentRoomId) return;
    const state = getRoomState(id);
    if (state === 'completed' || state === 'unlocked') {
      audioEngine.playClick();
      onSelectRoom(id);
      onClose();
    } else {
      audioEngine.playError();
    }
  };

  // Dynamic node layout — spacing adapts to room count
  const nodeW = 120;
  const nodeH = 110;
  const gap = 40;
  const svgWidth = roomsOrder.length * (nodeW + gap) + gap;
  const nodeY = 60;
  const nodeX = (i: number) => gap + i * (nodeW + gap);
  const corridor = (i: number) => {
    const x1 = nodeX(i) + nodeW;
    const x2 = nodeX(i + 1);
    const midRoom = roomsOrder[i + 1];
    const active = unlockedRooms.includes(midRoom);
    return { x1, x2, active };
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel facility-map-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">FACILITY SCHEMATIC // {campaign.title}</div>
          <h2 className="puzzle-title">{campaign.subtitle.toUpperCase()}</h2>
          <p className="puzzle-subtitle">
            SECTOR BLUEPRINT & PASSAGE MATRIX [M / ESC TO CLOSE]
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="facility-map-body">
          {/* Blueprint SVG Schematic */}
          <div className="blueprint-schematic-wrapper">
            <svg viewBox={`0 0 ${svgWidth} ${nodeH + 120}`} className="blueprint-svg">
              <defs>
                <pattern id="blueprintGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={svgWidth} height={nodeH + 120} fill="url(#blueprintGrid)" />

              {/* Corridors */}
              {roomsOrder.slice(0, -1).map((roomId, i) => {
                const c = corridor(i);
                return (
                  <line
                    key={`corr-${i}`}
                    x1={c.x1} y1={nodeY + nodeH / 2} x2={c.x2} y2={nodeY + nodeH / 2}
                    stroke={c.active ? campaign.accentColor : '#334155'}
                    strokeWidth="6"
                    strokeDasharray={c.active ? 'none' : '4,4'}
                  />
                );
              })}

              {/* Room nodes */}
              {roomsOrder.map((roomId, i) => {
                const r = ALL_ROOMS[roomId];
                const state = getRoomState(roomId);
                const stroke =
                  state === 'current' ? campaign.themeColor
                  : state === 'completed' ? '#10b981'
                  : state === 'unlocked' ? campaign.accentColor
                  : '#334155';
                return (
                  <g key={roomId} transform={`translate(${nodeX(i)}, ${nodeY})`} style={{ cursor: state === 'locked' ? 'not-allowed' : 'pointer' }} onClick={() => handleTransit(roomId)}>
                    <rect width={nodeW} height={nodeH} rx="8" fill="#0f172a" stroke={stroke} strokeWidth="3" />
                    <text x={nodeW / 2} y="38" fill={campaign.accentColor} fontSize="13" fontWeight="bold" textAnchor="middle">ROOM {r.number}</text>
                    <text x={nodeW / 2} y="60" fill="#f8fafc" fontSize="11" textAnchor="middle">{r.name}</text>
                    <text x={nodeW / 2} y="84" fill="#94a3b8" fontSize="10" textAnchor="middle">{state.toUpperCase()}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Transit / Room Details */}
          <div className="map-rooms-nav-list">
            {roomsOrder.map((roomId) => {
              const rConfig = ALL_ROOMS[roomId];
              const rState = getRoomState(roomId);
              const isAccessible = rState === 'completed' || rState === 'unlocked' || rState === 'current';

              return (
                <div
                  key={roomId}
                  className={`map-room-row ${rState} ${currentRoomId === roomId ? 'active-room' : ''}`}
                  onClick={() => isAccessible && handleTransit(roomId)}
                >
                  <div className="map-row-meta">
                    <span className="row-room-num">ROOM {rConfig.number}</span>
                    <h4 className="row-room-name">{rConfig.name}</h4>
                    <span className={`row-state-pill pill-${rState}`}>{rState.toUpperCase()}</span>
                  </div>
                  {isAccessible && currentRoomId !== roomId && (
                    <button className="transit-btn">TRANSIT &rarr;</button>
                  )}
                  {currentRoomId === roomId && (
                    <span className="current-location-tag">YOU ARE HERE</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="puzzle-footer">
          <div className="hint-reminder">
            Click completed or unlocked chambers to fast-travel.
          </div>
          <button className="action-btn secondary" onClick={onClose}>
            RETURN TO CHAMBER [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
