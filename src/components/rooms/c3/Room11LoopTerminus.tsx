import React from 'react';
import { RoomConfig, InteractableObject } from '../../../types/game';
import { ConstructedHotspot, hotspotState, dotFor, RoomSceneProps } from '../constructed';

interface Room11Props extends RoomSceneProps {}

/**
 * ECHOES OF AURELION — Room 11: THE LOOP TERMINUS (final room, no exit).
 * CSS-constructed scene: convergence ring, recursion furnace, timeline stacks,
 * loop decision console.
 */
export const Room11LoopTerminus: React.FC<Room11Props> = ({
  config,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject,
}) => {
  const first = objectives['r11_convergence'];
  const debug = objectives['r11_debug'];

  const getObject = (id: string) => config.interactables.find((o) => o.id === id);

  const renderHotspot = (
    id: string,
    isSolved: boolean,
    prereqMet: boolean,
    beaconText: string,
    isExit: boolean = false
  ) => {
    const obj = getObject(id);
    if (!obj) return null;
    return (
      <ConstructedHotspot
        obj={obj as InteractableObject}
        state={hotspotState(isSolved, prereqMet, isExit)}
        dotColor={dotFor(isSolved, prereqMet, isExit)}
        beaconText={beaconText}
        active={activeInteractableId === obj.id}
        onHover={onHoverObject}
        onSelect={onSelectObject}
      />
    );
  };

  return (
    <div className={`room-scene-environment constructed-room cr-room11 ${first ? 'powered-env' : 'unpowered-env'}`}>
      <div className={`scene-lighting-filter ${first ? 'filter-normal' : 'filter-emergency'}`} />

      {/* ---- CSS-CONSTRUCTED SCENE: loop terminus ---- */}
      {/* Back wall */}
      <div className="cr-backwall cr11-backwall" />
      {/* Convergence ring — large double-ring circle, slow spin */}
      <div className="cr11-convergence-ring">
        <span className="cr11-ring cr11-ring-outer" />
        <span className="cr11-ring cr11-ring-inner" />
      </div>
      {/* Recursion furnace — vent grill intensifies once the governor is fixed */}
      <div className={`cr11-furnace ${debug ? 'intensified' : ''}`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="cr11-vent" />
        ))}
      </div>
      {/* Timeline stack columns */}
      <div className="cr11-timeline-stack">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="cr11-stack-col">
            {Array.from({ length: 7 }, (_, j) => (
              <span key={j} className="cr11-stack-cell" />
            ))}
          </div>
        ))}
      </div>
      {/* Floor */}
      <div className="cr-floor" />

      {/* Hotspots (final room — no exit) */}
      {renderHotspot('obj_state_tracks', first, true, first ? 'LOOP CONVERGED' : 'TRACKS DRIFTING')}
      {renderHotspot('obj_recursion_furnace', debug, first, debug ? 'GOVERNOR TERMINATED' : 'RECURSION ACTIVE')}
      {renderHotspot('obj_loop_console', false, debug, debug ? 'DECISION READY' : 'CONSOLE DORMANT')}
    </div>
  );
};
