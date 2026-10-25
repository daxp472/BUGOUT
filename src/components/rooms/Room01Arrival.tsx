import React from 'react';
import { RoomConfig, InteractableObject } from '../../types/game';

interface RoomSceneProps {
  config: RoomConfig;
  solvedPuzzles: Record<string, boolean>;
  objectives: Record<string, boolean>;
  activeInteractableId: string | null;
  onHoverObject: (obj: InteractableObject | null) => void;
  onSelectObject: (obj: InteractableObject) => void;
}

export const Room01Arrival: React.FC<RoomSceneProps> = ({
  config,
  solvedPuzzles,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject
}) => {
  const isPowerOn = objectives['r1_power'];
  const isKeypadUnlocked = objectives['r1_keypad'];
  const isAuthFixed = objectives['r1_auth_bug'];
  const isDoorOpen = objectives['r1_door'];

  const getObject = (id: string) => config.interactables.find((o) => o.id === id);

  return (
    <div 
      className={`room-scene-environment room-photo-scene room-01 ${isPowerOn ? 'powered-env' : 'unpowered-env'}`}
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}assets/rooms/room1_arrival.jpg')` }}
    >
      {/* Dynamic Lighting & Environmental Ambience */}
      <div className={`scene-lighting-filter ${isPowerOn ? 'filter-normal' : 'filter-emergency'}`} />
      
      {/* Environmental Power Surge Glint when powered */}
      {isPowerOn && <div className="scene-power-surge-sweep" />}

      {/* --- HOTSPOT 1: Power Distribution Switchboard (Far Left) --- */}
      {(() => {
        const obj = getObject('obj_power_switches');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-switches ${isPowerOn ? 'solved' : 'active-task'} ${
              activeInteractableId === obj.id ? 'hovered' : ''
            }`}
            style={{
              left: `${obj.xPercent}%`,
              top: `${obj.yPercent}%`,
              width: `${obj.widthPercent}%`,
              height: `${obj.heightPercent}%`
            }}
            onMouseEnter={() => onHoverObject(obj)}
            onMouseLeave={() => onHoverObject(null)}
            onClick={() => onSelectObject(obj)}
          >
            <div className="hotspot-contour" />
            <div className="physical-beacon">
              <span className={`beacon-dot ${isPowerOn ? 'dot-green' : 'dot-pulse-red'}`} />
              <span className="beacon-tag">{isPowerOn ? 'POWER: 100%' : 'BUS OFFLINE'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 2: Examination Desk & Keypad Drawer (Center Desk) --- */}
      {(() => {
        const obj = getObject('obj_drawer_keypad');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-desk ${isKeypadUnlocked ? 'solved' : isPowerOn ? 'active-task' : 'locked'} ${
              activeInteractableId === obj.id ? 'hovered' : ''
            }`}
            style={{
              left: `${obj.xPercent}%`,
              top: `${obj.yPercent}%`,
              width: `${obj.widthPercent}%`,
              height: `${obj.heightPercent}%`
            }}
            onMouseEnter={() => onHoverObject(obj)}
            onMouseLeave={() => onHoverObject(null)}
            onClick={() => onSelectObject(obj)}
          >
            <div className="hotspot-contour" />
            <div className="physical-beacon">
              <span className={`beacon-dot ${isKeypadUnlocked ? 'dot-green' : isPowerOn ? 'dot-cyan' : 'dot-dim'}`} />
              <span className="beacon-tag">{isKeypadUnlocked ? 'DRAWER UNLOCKED' : 'KEYPAD SECURED'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 3: Security Terminal Console (Right Console) --- */}
      {(() => {
        const obj = getObject('obj_terminal');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-terminal ${isAuthFixed ? 'solved' : isKeypadUnlocked ? 'active-task' : 'locked'} ${
              activeInteractableId === obj.id ? 'hovered' : ''
            }`}
            style={{
              left: `${obj.xPercent}%`,
              top: `${obj.yPercent}%`,
              width: `${obj.widthPercent}%`,
              height: `${obj.heightPercent}%`
            }}
            onMouseEnter={() => onHoverObject(obj)}
            onMouseLeave={() => onHoverObject(null)}
            onClick={() => onSelectObject(obj)}
          >
            <div className="hotspot-contour" />
            <div className="physical-beacon">
              <span className={`beacon-dot ${isAuthFixed ? 'dot-green' : isKeypadUnlocked ? 'dot-cyan' : 'dot-dim'}`} />
              <span className="beacon-tag">{isAuthFixed ? 'AUTH: VALID' : 'LINT FAULT'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 4: Pneumatic Blast Exit Door (Far Right) --- */}
      {(() => {
        const obj = getObject('obj_exit_door');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-door ${isDoorOpen ? 'door-open' : isAuthFixed ? 'ready-to-open' : 'locked'} ${
              activeInteractableId === obj.id ? 'hovered' : ''
            }`}
            style={{
              left: `${obj.xPercent}%`,
              top: `${obj.yPercent}%`,
              width: `${obj.widthPercent}%`,
              height: `${obj.heightPercent}%`
            }}
            onMouseEnter={() => onHoverObject(obj)}
            onMouseLeave={() => onHoverObject(null)}
            onClick={() => onSelectObject(obj)}
          >
            <div className="hotspot-contour" />
            <div className="physical-beacon beacon-door">
              <span className={`beacon-dot ${isDoorOpen ? 'dot-green' : isAuthFixed ? 'dot-yellow' : 'dot-red'}`} />
              <span className="beacon-tag">{isDoorOpen ? 'CYCLE PORT' : isAuthFixed ? 'READY TO CYCLE' : 'SEALED'}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
