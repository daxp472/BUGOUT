import React from 'react';
import { RoomConfig, InteractableObject } from '../../../types/game';
import { ConstructedHotspot, hotspotState, dotFor, RoomSceneProps } from '../constructed';

interface Room06Props extends RoomSceneProps {}

export const Room06DarkRelay: React.FC<Room06Props> = ({
  config,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject,
}) => {
  const patched = objectives['r6_patch'];
  const tuned = objectives['r6_frequency'];
  const decoded = objectives['r6_morse'];

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
    <div className={`room-scene-environment constructed-room cr-room6 ${patched ? 'powered-env' : 'unpowered-env'}`}>
      <div className={`scene-lighting-filter ${patched ? 'filter-normal' : 'filter-emergency'}`} />

      {/* ---- CSS-CONSTRUCTED SCENE: dead relay junction ---- */}
      {/* Back wall panels */}
      <div className="cr-backwall cr6-backwall" />
      {/* Ceiling cable trays with hanging cables */}
      <div className="cr6-cable-tray" />
      <div className="cr6-cable cr6-cable-1" />
      <div className="cr6-cable cr6-cable-2" />
      <div className="cr6-cable cr6-cable-3" />
      {/* Floor grating */}
      <div className="cr-floor" />
      {/* Status carrier light strip — lights up when patched */}
      <div className={`cr6-carrier-strip ${patched ? 'live' : ''}`}>
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className={`carrier-cell ${(patched && i % 3 !== 2) ? 'on' : ''}`} style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>

      {/* Hotspots */}
      {renderHotspot('obj_patch_panel', patched, true, patched ? 'TRUNK PATCHED' : 'LINES PULLED')}
      {renderHotspot('obj_tuning_rack', tuned, patched, tuned ? 'LOCKED 104.7' : 'NO CARRIER')}
      {renderHotspot('obj_morse_receiver', decoded, tuned, decoded ? 'CALL: RELAY' : 'INK IDLE')}
      {renderHotspot('obj_soundlock', false, decoded, decoded ? 'READY TO CYCLE' : 'SOUND-LOCKED', true)}
    </div>
  );
};
