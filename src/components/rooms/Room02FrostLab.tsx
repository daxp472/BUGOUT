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

export const Room02FrostLab: React.FC<RoomSceneProps> = ({
  config,
  solvedPuzzles,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject
}) => {
  const isSymbolsSolved = objectives['r2_symbols'];
  const isValvesAligned = objectives['r2_valves'];
  const isCryoFixed = objectives['r2_cooling_debug'];
  const isDoorOpen = objectives['r2_door'];

  const getObject = (id: string) => config.interactables.find((o) => o.id === id);

  return (
    <div 
      className={`room-scene-environment room-photo-scene room-02 ${isCryoFixed ? 'cryo-stabilized' : 'cryo-overcooling'}`}
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}assets/rooms/room2_frost.jpg')` }}
    >
      {/* Cold Icy Atmosphere Lighting Filter */}
      <div className={`scene-lighting-filter ${isCryoFixed ? 'filter-cryo-stable' : 'filter-cryo-cold'}`} />

      {/* --- HOTSPOT 1: Frosted Observation Panels (Left Windows) --- */}
      {(() => {
        const obj = getObject('obj_frost_panels');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-frost-panels ${isSymbolsSolved ? 'solved' : 'active-task'} ${
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
              <span className={`beacon-dot ${isSymbolsSolved ? 'dot-cyan' : 'dot-pulse-cyan'}`} />
              <span className="beacon-tag">{isSymbolsSolved ? 'GLYPHS LOGGED' : 'INSPECT GLYPHS'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 2: Coolant Pipe Routing System (Pipes & Valves) --- */}
      {(() => {
        const obj = getObject('obj_coolant_valves');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-valves ${isValvesAligned ? 'solved' : isSymbolsSolved ? 'active-task' : 'locked'} ${
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
              <span className={`beacon-dot ${isValvesAligned ? 'dot-green' : isSymbolsSolved ? 'dot-cyan' : 'dot-dim'}`} />
              <span className="beacon-tag">{isValvesAligned ? 'PRESSURE: 58 PSI' : 'PRESSURE OVERLOAD'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 3: Chiller Controller Terminal (Center Console) --- */}
      {(() => {
        const obj = getObject('obj_cryo_controller');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-chiller ${isCryoFixed ? 'solved' : isValvesAligned ? 'active-task' : 'locked'} ${
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
              <span className={`beacon-dot ${isCryoFixed ? 'dot-green' : isValvesAligned ? 'dot-cyan' : 'dot-dim'}`} />
              <span className="beacon-tag">{isCryoFixed ? '-40°C NOMINAL' : 'CHILLER FAULT'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 4: Cryogenic Airlock Exit Door (Far Right) --- */}
      {(() => {
        const obj = getObject('obj_cryo_door');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-cryo-door ${isDoorOpen ? 'door-open' : isCryoFixed ? 'ready-to-open' : 'locked'} ${
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
              <span className={`beacon-dot ${isDoorOpen ? 'dot-green' : isCryoFixed ? 'dot-yellow' : 'dot-red'}`} />
              <span className="beacon-tag">{isDoorOpen ? 'CYCLE AIRLOCK' : isCryoFixed ? 'READY TO CYCLE' : 'FROZEN LOCK'}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
