import React from 'react';
import { InteractableObject } from '../../types/game';

/* ============================================================
   SHARED CONSTRUCTED-ROOM HELPERS
   The CSS-constructed campaign rooms (02 & 03) all render
   hotspots through this component for consistent behavior.
   ============================================================ */

export interface RoomSceneProps {
  config: import('../../types/game').RoomConfig;
  solvedPuzzles: Record<string, boolean>;
  objectives: Record<string, boolean>;
  activeInteractableId: string | null;
  onHoverObject: (obj: InteractableObject | null) => void;
  onSelectObject: (obj: InteractableObject) => void;
}

interface ConstructedHotspotProps {
  obj: InteractableObject;
  /** Visual state: solved (green) / active-task (cyan) / locked (dim) / ready (yellow) */
  state: 'solved' | 'active-task' | 'locked' | 'ready' | 'door-open';
  beaconText: string;
  dotColor: 'green' | 'cyan' | 'red' | 'yellow' | 'dim';
  active: boolean;
  onHover: (obj: InteractableObject | null) => void;
  onSelect: (obj: InteractableObject) => void;
  children?: React.ReactNode;
}

export const ConstructedHotspot: React.FC<ConstructedHotspotProps> = ({
  obj,
  state,
  beaconText,
  dotColor,
  active,
  onHover,
  onSelect,
  children,
}) => (
  <div
    className={`physical-hotspot constructed-hotspot ${state} ${active ? 'hovered' : ''}`}
    style={{
      left: `${obj.xPercent}%`,
      top: `${obj.yPercent}%`,
      width: `${obj.widthPercent}%`,
      height: `${obj.heightPercent}%`,
    }}
    onMouseEnter={() => onHover(obj)}
    onMouseLeave={() => onHover(null)}
    onClick={() => onSelect(obj)}
    role="button"
    aria-label={obj.name}
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(obj);
      }
    }}
  >
    {children}
    <div className="hotspot-contour" />
    <div className="physical-beacon">
      <span className={`beacon-dot dot-${dotColor}`} />
      <span className="beacon-tag">{beaconText}</span>
    </div>
  </div>
);

/** Resolve hotspot visual state from objectives. */
export const hotspotState = (
  isSolved: boolean,
  prereqMet: boolean,
  isExit: boolean = false
): ConstructedHotspotProps['state'] => {
  if (isSolved) return 'solved';
  if (!prereqMet) return 'locked';
  return isExit ? 'ready' : 'active-task';
};

export const dotFor = (
  isSolved: boolean,
  prereqMet: boolean,
  isExit: boolean = false
): ConstructedHotspotProps['dotColor'] => {
  if (isSolved) return 'green';
  if (!prereqMet) return 'dim';
  return isExit ? 'yellow' : 'cyan';
};
