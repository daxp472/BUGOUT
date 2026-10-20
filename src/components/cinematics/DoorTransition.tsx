import React, { useEffect, useState } from 'react';
import { audioEngine } from '../../services/audioEngine';
import { RoomId } from '../../types/game';
import { ROOMS_CONFIG } from '../../data/roomsData';

interface DoorTransitionProps {
  fromRoomId: RoomId;
  toRoomId: RoomId;
  onTransitionEnd: () => void;
}

export const DoorTransition: React.FC<DoorTransitionProps> = ({
  fromRoomId,
  toRoomId,
  onTransitionEnd
}) => {
  const [phase, setPhase] = useState<number>(1);
  const targetRoom = ROOMS_CONFIG[toRoomId];

  useEffect(() => {
    // Phase 1: Access accepted
    audioEngine.playSuccess();

    // Phase 2: Bolts retract
    const t1 = setTimeout(() => {
      setPhase(2);
      audioEngine.playSwitch();
    }, 600);

    // Phase 3: Pneumatic release and slide
    const t2 = setTimeout(() => {
      setPhase(3);
      audioEngine.playPneumaticDoor();
    }, 1200);

    // Phase 4: Light flood and enter next room
    const t3 = setTimeout(() => {
      setPhase(4);
      audioEngine.playAmbient(targetRoom.ambientType);
    }, 2400);

    // Complete transition
    const t4 = setTimeout(() => {
      onTransitionEnd();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onTransitionEnd, targetRoom.ambientType]);

  return (
    <div className={`door-transition-overlay phase-${phase}`}>
      <div className="transition-door-frame">
        {/* Left and Right sliding bulkhead doors */}
        <div className={`transition-door-panel left-panel phase-${phase}`} />
        <div className={`transition-door-panel right-panel phase-${phase}`} />

        {/* Central hydraulic lock apparatus */}
        <div className={`transition-locking-bolt phase-${phase}`}>
          <div className="bolt-indicator-light" />
          <span className="bolt-status-text">
            {phase === 1 && 'AUTHORIZING DISENGAGE...'}
            {phase === 2 && 'RETRACTING HYDRAULIC BOLTS...'}
            {phase === 3 && 'PNEUMATIC SEAL RELEASED...'}
            {phase >= 4 && `ENTERING ROOM ${targetRoom.number}: ${targetRoom.name}`}
          </span>
        </div>

        {/* Light flood from next chamber */}
        <div className={`next-room-light-flood phase-${phase}`} />
      </div>
    </div>
  );
};
