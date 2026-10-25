import React from 'react';
import { InteractableObject } from '../../../types/game';
import { ConstructedHotspot, hotspotState, dotFor, RoomSceneProps } from '../constructed';

interface Room07Props extends RoomSceneProps {}

export const Room07ListeningPost: React.FC<Room07Props> = ({
  config,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject,
}) => {
  const matched = objectives['r7_waveform'];
  const deciphered = objectives['r7_cipher'];
  const repaired = objectives['r7_debug'];

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
    <div className={`room-scene-environment constructed-room cr-room7 ${matched ? 'powered-env' : 'unpowered-env'}`}>
      <div className={`scene-lighting-filter ${matched ? 'filter-normal' : 'filter-emergency'}`} />

      {/* ---- CSS-CONSTRUCTED SCENE: signal interrogation suite ---- */}
      <div className="cr-backwall cr7-backwall" />
      {/* Copper mesh wall panel */}
      <div className="cr7-mesh-wall" />
      {/* Oscilloscope bank: three stacked screens with scanlines */}
      <div className="cr7-scope-bank">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={`cr7-scope-screen ${matched ? 'live' : ''}`} style={{ animationDelay: `${i * 0.5}s` }}>
            <span className="cr7-scope-trace" />
          </div>
        ))}
      </div>
      {/* Rotary cipher workstation silhouette */}
      <div className="cr7-rotary-desk" />
      {/* Floor */}
      <div className="cr-floor" />

      {/* Hotspots */}
      {renderHotspot('obj_oscilloscope', matched, true, matched ? 'TRACES COHERENT' : 'TRACE DIVERGENT')}
      {renderHotspot('obj_cipher_station', deciphered, matched, deciphered ? 'HEADER: ECHO' : 'PACKET ENCIPHERED')}
      {renderHotspot('obj_encoder_terminal', repaired, deciphered, repaired ? 'ENCODER CLEAN' : 'LINT FAULT')}
      {renderHotspot('obj_faraday_hatch', false, repaired, repaired ? 'READY TO DISCHARGE' : 'FARADAY SEALED', true)}
    </div>
  );
};
