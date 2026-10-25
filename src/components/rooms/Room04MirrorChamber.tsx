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

export const Room04MirrorChamber: React.FC<RoomSceneProps> = ({
  config,
  solvedPuzzles,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject
}) => {
  const isDiscrepancySolved = objectives['r4_discrepancies'];
  const isSequenceSolved = objectives['r4_sequence'];
  const isLogicSolved = objectives['r4_logic_gate'];
  const isDoorOpen = objectives['r4_door'];

  const getObject = (id: string) => config.interactables.find((o) => o.id === id);

  return (
    <div 
      className={`room-scene-environment room-photo-scene room-04 ${isDoorOpen ? 'mirror-shifted' : 'mirror-reflective'}`}
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}assets/rooms/room4_mirror.jpg')` }}
    >
      {/* Eerie Magenta Optical Shimmer Filter */}
      <div className={`scene-lighting-filter ${isLogicSolved ? 'filter-mirror-aligned' : 'filter-mirror-dissonant'}`} />

      {/* --- HOTSPOT 1: Reference Polaroid Inspection Stand (Left Desk) --- */}
      {(() => {
        const obj = getObject('obj_mirror_wall');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-mirror-stand ${isDiscrepancySolved ? 'solved' : 'active-task'} ${
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
              <span className={`beacon-dot ${isDiscrepancySolved ? 'dot-pink' : 'dot-pulse-pink'}`} />
              <span className="beacon-tag">{isDiscrepancySolved ? '3 ANOMALIES FOUND' : 'INSPECT POLAROID'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 2: Synthesis Token Altar Console (Center Altar) --- */}
      {(() => {
        const obj = getObject('obj_symbol_altar');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-synthesis-altar ${isSequenceSolved ? 'solved' : isDiscrepancySolved ? 'active-task' : 'locked'} ${
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
              <span className={`beacon-dot ${isSequenceSolved ? 'dot-green' : isDiscrepancySolved ? 'dot-cyan' : 'dot-dim'}`} />
              <span className="beacon-tag">{isSequenceSolved ? 'CHAMBERS SYNTHESIZED' : 'ALIGN TOKENS'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 3: Quantum Logic Circuit Board (Right Wall) --- */}
      {(() => {
        const obj = getObject('obj_logic_circuit');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-logic-circuit ${isLogicSolved ? 'solved' : isSequenceSolved ? 'active-task' : 'locked'} ${
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
              <span className={`beacon-dot ${isLogicSolved ? 'dot-green' : isSequenceSolved ? 'dot-cyan' : 'dot-dim'}`} />
              <span className="beacon-tag">{isLogicSolved ? 'PARITY 1-1-1 OK' : 'LOGIC GATES'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 4: Obsidian Mirror Bulkhead Exit Door (Far Right) --- */}
      {(() => {
        const obj = getObject('obj_mirror_exit');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-mirror-exit ${isDoorOpen ? 'door-open' : isLogicSolved ? 'ready-to-open' : 'locked'} ${
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
              <span className={`beacon-dot ${isDoorOpen ? 'dot-green' : isLogicSolved ? 'dot-yellow' : 'dot-red'}`} />
              <span className="beacon-tag">{isDoorOpen ? 'PASS BARRIER' : isLogicSolved ? 'CYCLE EXIT' : 'SEALED'}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
