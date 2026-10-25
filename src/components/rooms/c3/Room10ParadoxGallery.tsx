import React from 'react';
import { RoomConfig, InteractableObject } from '../../../types/game';
import { ConstructedHotspot, hotspotState, dotFor, RoomSceneProps } from '../constructed';

interface Room10Props extends RoomSceneProps {}

/**
 * ECHOES OF AURELION — Room 10: THE PARADOX GALLERY.
 * CSS-constructed scene: floating playback crystals, echo organ pipes,
 * gallery frames, terminus corridor door.
 */
export const Room10ParadoxGallery: React.FC<Room10Props> = ({
  config,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject,
}) => {
  const first = objectives['r10_paradox'];
  const echoSeq = objectives['r10_echo_seq'];
  const memory = objectives['r10_memory_pairs'];

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
    <div className={`room-scene-environment constructed-room cr-room10 ${first ? 'powered-env' : 'unpowered-env'}`}>
      <div className={`scene-lighting-filter ${first ? 'filter-normal' : 'filter-emergency'}`} />

      {/* ---- CSS-CONSTRUCTED SCENE: paradox gallery ---- */}
      {/* Back wall */}
      <div className="cr-backwall cr10-backwall" />
      {/* Floating playback crystals — rotated squares bobbing at different delays */}
      <div className="cr10-crystals">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`cr10-crystal cr10-crystal-${i + 1}`} style={{ animationDelay: `${i * 0.7}s` }} />
        ))}
      </div>
      {/* Echo organ pipes */}
      <div className="cr10-organ-pipes">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="cr10-pipe" style={{ height: `${38 + i * 11}%` }} />
        ))}
      </div>
      {/* Gallery frames on the back wall */}
      <div className="cr10-gallery-frames">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={`cr10-frame cr10-frame-${i + 1}`} />
        ))}
      </div>
      {/* Floor */}
      <div className="cr-floor" />

      {/* Hotspots */}
      {renderHotspot('obj_paradox_crystals', first, true, first ? 'PARADOX QUARANTINED' : 'CRYSTALS LOOPING')}
      {renderHotspot('obj_echo_organ', echoSeq, first, echoSeq ? 'ECHO MIRRORED' : 'ORGAN MUTATING')}
      {renderHotspot('obj_memory_pairs', memory, echoSeq, memory ? 'MEMORIES PAIRED' : 'BOARD SCATTERED')}
      {renderHotspot('obj_terminus_corridor', false, memory, memory ? 'CORRIDOR OPEN' : 'TERMINUS SEALED', true)}
    </div>
  );
};
