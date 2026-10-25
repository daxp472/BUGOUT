import React from 'react';
import { InteractableObject } from '../../../types/game';
import { ConstructedHotspot, hotspotState, dotFor, RoomSceneProps } from '../constructed';

interface Room08Props extends RoomSceneProps {}

export const Room08AntennaArray: React.FC<Room08Props> = ({
  config,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject,
}) => {
  const triangulated = objectives['r8_triangulation'];
  const uplinkLive = objectives['r8_uplink'];

  const getObject = (id: string) => config.interactables.find((o) => o.id === id);

  const renderHotspot = (
    id: string,
    isSolved: boolean,
    prereqMet: boolean,
    beaconText: string
  ) => {
    const obj = getObject(id);
    if (!obj) return null;
    return (
      <ConstructedHotspot
        obj={obj as InteractableObject}
        state={hotspotState(isSolved, prereqMet, false)}
        dotColor={dotFor(isSolved, prereqMet, false)}
        beaconText={beaconText}
        active={activeInteractableId === obj.id}
        onHover={onHoverObject}
        onSelect={onSelectObject}
      />
    );
  };

  return (
    <div className={`room-scene-environment constructed-room cr-room8 ${uplinkLive ? 'powered-env' : 'unpowered-env'}`}>
      <div className={`scene-lighting-filter ${uplinkLive ? 'filter-normal' : 'filter-emergency'}`} />

      {/* ---- CSS-CONSTRUCTED SCENE: open-air transmission deck ---- */}
      <div className="cr8-sky" />
      {/* Three lattice antenna masts */}
      <div className={`cr8-mast cr8-mast-1 ${uplinkLive ? 'live' : ''}`} />
      <div className={`cr8-mast cr8-mast-2 ${uplinkLive ? 'live' : ''}`} />
      <div className={`cr8-mast cr8-mast-3 ${uplinkLive ? 'live' : ''}`} />
      {/* Broadcast dish */}
      <div className={`cr8-broadcast-dish ${uplinkLive ? 'live' : ''}`} />
      {/* Deck floor */}
      <div className="cr-floor cr8-deck" />
      {/* Radar table glow */}
      <div className={`cr8-radar-table ${triangulated ? 'resolved' : ''}`} />

      {/* Hotspots */}
      {renderHotspot('obj_radar_table', triangulated, true, triangulated ? 'SOURCE PINNED' : 'SIGHT-LINES OPEN')}
      {renderHotspot('obj_uplink_console', uplinkLive, triangulated, uplinkLive ? 'UPLINK FULL POWER' : 'BREAKERS OPEN')}
      {renderHotspot('obj_broadcast_console', false, uplinkLive, uplinkLive ? 'BUFFER ARMED' : 'BUFFER IDLE')}
    </div>
  );
};
