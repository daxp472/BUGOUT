import React from 'react';
import { RoomConfig, InteractableObject } from '../../../types/game';
import { ConstructedHotspot, hotspotState, dotFor, RoomSceneProps } from '../constructed';

interface Room09Props extends RoomSceneProps {}

/**
 * ECHOES OF AURELION — Room 09: THE RECALL VAULT.
 * CSS-constructed scene: resonance pillar array, archive shelving, vault gate.
 */
export const Room09RecallVault: React.FC<Room09Props> = ({
  config,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject,
}) => {
  const first = objectives['r9_audio_recall'];
  const timeline = objectives['r9_timeline'];
  const shadow = objectives['r9_shadow'];

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
    <div className={`room-scene-environment constructed-room cr-room9 ${first ? 'powered-env' : 'unpowered-env'}`}>
      <div className={`scene-lighting-filter ${first ? 'filter-normal' : 'filter-emergency'}`} />

      {/* ---- CSS-CONSTRUCTED SCENE: recall vault ---- */}
      {/* Back wall */}
      <div className="cr-backwall cr9-backwall" />
      {/* Resonance pillar array — five glowing pillars with a subtle pulse */}
      <div className="cr9-pillars">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="cr9-pillar" style={{ animationDelay: `${i * 0.45}s` }} />
        ))}
      </div>
      {/* Archive shelving rows */}
      <div className="cr9-archive-shelf">
        {Array.from({ length: 3 }, (_, r) => (
          <div key={r} className="cr9-shelf-row">
            {Array.from({ length: 6 }, (_, c) => (
              <span key={c} className="cr9-shelf-slot" />
            ))}
          </div>
        ))}
      </div>
      {/* Vault gate frame */}
      <div className="cr9-vault-door">
        <div className="cr9-door-inner" />
      </div>
      {/* Floor */}
      <div className="cr-floor" />

      {/* Hotspots */}
      {renderHotspot('obj_resonance_pillars', first, true, first ? 'TRIAL PASSED' : 'PILLARS IDLE')}
      {renderHotspot('obj_timeline_board', timeline, first, timeline ? 'CHRONOLOGY ALIGNED' : 'SEQUENCE SCATTERED')}
      {renderHotspot('obj_shadow_wall', shadow, timeline, shadow ? 'SHADOWS RESOLVED' : 'SILHOUETTES LIVE')}
      {renderHotspot('obj_gallery_gate', false, shadow, shadow ? 'GATE RELEASED' : 'GALLERY SEALED', true)}
    </div>
  );
};
