import React from 'react';
import { RoomId } from '../../types/game';
import { ROOMS_CONFIG } from '../../data/roomsData';
import { audioEngine } from '../../services/audioEngine';

interface FacilityMapModalProps {
  currentRoomId: RoomId;
  completedRooms: RoomId[];
  unlockedRooms: RoomId[];
  onSelectRoom: (roomId: RoomId) => void;
  onClose: () => void;
}

export const FacilityMapModal: React.FC<FacilityMapModalProps> = ({
  currentRoomId,
  completedRooms,
  unlockedRooms,
  onSelectRoom,
  onClose
}) => {
  const roomsOrder: RoomId[] = [
    'room1_arrival',
    'room2_frost',
    'room3_server',
    'room4_mirror',
    'room5_protocol'
  ];

  const getRoomState = (id: RoomId) => {
    if (id === currentRoomId) return 'current';
    if (completedRooms.includes(id)) return 'completed';
    if (unlockedRooms.includes(id)) return 'unlocked';
    return 'locked';
  };

  const handleTransit = (id: RoomId) => {
    if (id === currentRoomId) return;
    if (completedRooms.includes(id) || unlockedRooms.includes(id)) {
      audioEngine.playClick();
      onSelectRoom(id);
      onClose();
    }
  };

  return (
    <div className="puzzle-modal-backdrop" onClick={onClose}>
      <div className="puzzle-panel facility-map-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <div className="puzzle-badge">FACILITY SCHEMATIC // AURELION COMPLEX</div>
          <h2 className="puzzle-title">SUB-SURFACE SECTOR BLUEPRINT</h2>
          <p className="puzzle-subtitle">
            FIVE-CHAMBER FACILITY ARCHITECTURE & PASSAGE MATRIX [M / ESC TO CLOSE]
          </p>
          <button className="puzzle-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        <div className="facility-map-body">
          {/* Blueprint SVG Schematic */}
          <div className="blueprint-schematic-wrapper">
            <svg viewBox="0 0 880 340" className="blueprint-svg">
              {/* Grid Lines */}
              <defs>
                <pattern id="blueprintGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="880" height="340" fill="url(#blueprintGrid)" />

              {/* Corridors connecting 1 -> 2 -> 3 -> 4 -> 5 */}
              <line x1="160" y1="170" x2="310" y2="170" stroke={unlockedRooms.includes('room2_frost') ? '#38bdf8' : '#334155'} strokeWidth="6" strokeDasharray={unlockedRooms.includes('room2_frost') ? 'none' : '4,4'} />
              <line x1="310" y1="170" x2="460" y2="170" stroke={unlockedRooms.includes('room3_server') ? '#38bdf8' : '#334155'} strokeWidth="6" strokeDasharray={unlockedRooms.includes('room3_server') ? 'none' : '4,4'} />
              <line x1="460" y1="170" x2="610" y2="170" stroke={unlockedRooms.includes('room4_mirror') ? '#38bdf8' : '#334155'} strokeWidth="6" strokeDasharray={unlockedRooms.includes('room4_mirror') ? 'none' : '4,4'} />
              <line x1="610" y1="170" x2="760" y2="170" stroke={unlockedRooms.includes('room5_protocol') ? '#eab308' : '#334155'} strokeWidth="6" strokeDasharray={unlockedRooms.includes('room5_protocol') ? 'none' : '4,4'} />

              {/* Room 1 Node */}
              <g transform="translate(100, 110)">
                <rect width="120" height="120" rx="8" fill="#0f172a" stroke={currentRoomId === 'room1_arrival' ? '#00e5ff' : completedRooms.includes('room1_arrival') ? '#10b981' : '#475569'} strokeWidth="3" />
                <text x="60" y="45" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 01</text>
                <text x="60" y="70" fill="#f8fafc" fontSize="12" textAnchor="middle">THE ARRIVAL</text>
                <text x="60" y="95" fill="#94a3b8" fontSize="10" textAnchor="middle">{getRoomState('room1_arrival').toUpperCase()}</text>
              </g>

              {/* Room 2 Node */}
              <g transform="translate(250, 110)">
                <rect width="120" height="120" rx="8" fill="#0f172a" stroke={currentRoomId === 'room2_frost' ? '#00e5ff' : completedRooms.includes('room2_frost') ? '#10b981' : unlockedRooms.includes('room2_frost') ? '#38bdf8' : '#334155'} strokeWidth="3" />
                <text x="60" y="45" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 02</text>
                <text x="60" y="70" fill="#f8fafc" fontSize="12" textAnchor="middle">FROST LAB</text>
                <text x="60" y="95" fill="#94a3b8" fontSize="10" textAnchor="middle">{getRoomState('room2_frost').toUpperCase()}</text>
              </g>

              {/* Room 3 Node */}
              <g transform="translate(400, 110)">
                <rect width="120" height="120" rx="8" fill="#0f172a" stroke={currentRoomId === 'room3_server' ? '#a855f7' : completedRooms.includes('room3_server') ? '#10b981' : unlockedRooms.includes('room3_server') ? '#c084fc' : '#334155'} strokeWidth="3" />
                <text x="60" y="45" fill="#c084fc" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 03</text>
                <text x="60" y="70" fill="#f8fafc" fontSize="12" textAnchor="middle">SERVER VAULT</text>
                <text x="60" y="95" fill="#94a3b8" fontSize="10" textAnchor="middle">{getRoomState('room3_server').toUpperCase()}</text>
              </g>

              {/* Room 4 Node */}
              <g transform="translate(550, 110)">
                <rect width="120" height="120" rx="8" fill="#0f172a" stroke={currentRoomId === 'room4_mirror' ? '#ec4899' : completedRooms.includes('room4_mirror') ? '#10b981' : unlockedRooms.includes('room4_mirror') ? '#f43f5e' : '#334155'} strokeWidth="3" />
                <text x="60" y="45" fill="#f43f5e" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 04</text>
                <text x="60" y="70" fill="#f8fafc" fontSize="12" textAnchor="middle">MIRROR LAB</text>
                <text x="60" y="95" fill="#94a3b8" fontSize="10" textAnchor="middle">{getRoomState('room4_mirror').toUpperCase()}</text>
              </g>

              {/* Room 5 Node */}
              <g transform="translate(700, 110)">
                <rect width="120" height="120" rx="8" fill="#0f172a" stroke={currentRoomId === 'room5_protocol' ? '#eab308' : completedRooms.includes('room5_protocol') ? '#10b981' : unlockedRooms.includes('room5_protocol') ? '#eab308' : '#334155'} strokeWidth="3" />
                <text x="60" y="45" fill="#eab308" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 05</text>
                <text x="60" y="70" fill="#f8fafc" fontSize="12" textAnchor="middle">THE PROTOCOL</text>
                <text x="60" y="95" fill="#94a3b8" fontSize="10" textAnchor="middle">{getRoomState('room5_protocol').toUpperCase()}</text>
              </g>
            </svg>
          </div>

          {/* Quick Transit / Room Details */}
          <div className="map-rooms-nav-list">
            {roomsOrder.map((roomId) => {
              const rConfig = ROOMS_CONFIG[roomId];
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
