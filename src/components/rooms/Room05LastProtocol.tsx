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

export const Room05LastProtocol: React.FC<RoomSceneProps> = ({
  config,
  solvedPuzzles,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject
}) => {
  const isPowerBalanced = objectives['r5_power_matrix'];
  const isMasterAuthed = objectives['r5_master_code'];
  const isChoiceMade = objectives['r5_final_choice'];

  const getObject = (id: string) => config.interactables.find((o) => o.id === id);

  return (
    <div 
      className={`room-scene-environment room-photo-scene room-05 ${isPowerBalanced ? 'reactor-ignited' : 'reactor-dormant'}`}
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}assets/rooms/room5_protocol.jpg')` }}
    >
      {/* Colossal Industrial Core Lighting Filter */}
      <div className={`scene-lighting-filter ${isPowerBalanced ? 'filter-core-ignited' : 'filter-core-amber'}`} />

      {/* Plasma Corona Pulsing Glint behind core */}
      <div className={`plasma-core-glow-layer ${isPowerBalanced ? 'intense' : 'low'}`} />

      {/* --- HOTSPOT 1: 3-Phase Generator Control Console (Foreground Left) --- */}
      {(() => {
        const obj = getObject('obj_generator_matrix');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-generator-matrix ${isPowerBalanced ? 'solved' : 'active-task'} ${
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
              <span className={`beacon-dot ${isPowerBalanced ? 'dot-gold' : 'dot-pulse-red'}`} />
              <span className="beacon-tag">{isPowerBalanced ? 'GRID: 100%' : 'BALANCE PHASES'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 2: Facility Master Terminal (Center Console) --- */}
      {(() => {
        const obj = getObject('obj_master_terminal');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-master-terminal ${isMasterAuthed ? 'solved' : isPowerBalanced ? 'active-task' : 'locked'} ${
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
              <span className={`beacon-dot ${isMasterAuthed ? 'dot-green' : isPowerBalanced ? 'dot-cyan' : 'dot-dim'}`} />
              <span className="beacon-tag">{isMasterAuthed ? 'PROTOCOL AUTHENTICATED' : 'AUTHORIZE TOKENS'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 3: WARDEN Directive Core Pedestal (Foreground Right) --- */}
      {(() => {
        const obj = getObject('obj_core_decision');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-core-decision ${isChoiceMade ? 'solved' : isMasterAuthed ? 'ready-directive' : 'locked'} ${
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
            <div className="physical-beacon beacon-directive">
              <span className={`beacon-dot ${isChoiceMade ? 'dot-gold' : isMasterAuthed ? 'dot-pulse-gold' : 'dot-dim'}`} />
              <span className="beacon-tag">{isChoiceMade ? 'PROTOCOL COMMITTED' : isMasterAuthed ? 'THE CROSSROADS [E]' : 'CORE ENCRYPTED'}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
