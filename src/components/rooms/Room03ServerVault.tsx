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

export const Room03ServerVault: React.FC<RoomSceneProps> = ({
  config,
  solvedPuzzles,
  objectives,
  activeInteractableId,
  onHoverObject,
  onSelectObject
}) => {
  const isAnomalySolved = objectives['r3_anomaly'];
  const isApiFixed = objectives['r3_api_recon'];
  const isJsonRecovered = objectives['r3_json_recovery'];
  const isDoorOpen = objectives['r3_door'];

  const getObject = (id: string) => config.interactables.find((o) => o.id === id);

  return (
    <div 
      className={`room-scene-environment room-photo-scene room-03 ${isDoorOpen ? 'vault-breached' : 'vault-secured'}`}
      style={{ backgroundImage: `url('/assets/rooms/room3_server.jpg')` }}
    >
      {/* Subterranean Data Center Ambient Filter */}
      <div className={`scene-lighting-filter ${isAnomalySolved ? 'filter-server-normal' : 'filter-server-alert'}`} />

      {/* --- HOTSPOT 1: Server Telemetry Racks (Racks Left & Center) --- */}
      {(() => {
        const obj = getObject('obj_server_racks');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-server-racks ${isAnomalySolved ? 'solved' : 'active-task'} ${
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
              <span className={`beacon-dot ${isAnomalySolved ? 'dot-purple' : 'dot-pulse-red'}`} />
              <span className="beacon-tag">{isAnomalySolved ? 'NODE 04 ISOLATED' : 'SCAN SERVER RACKS'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 2: Vault API Diagnostic Console (Terminal Desk) --- */}
      {(() => {
        const obj = getObject('obj_api_console');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-api-console ${isApiFixed ? 'solved' : isAnomalySolved ? 'active-task' : 'locked'} ${
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
              <span className={`beacon-dot ${isApiFixed ? 'dot-green' : isAnomalySolved ? 'dot-cyan' : 'dot-dim'}`} />
              <span className="beacon-tag">{isApiFixed ? 'AUTH 200 OK' : 'API GATEWAY'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 3: Data Extraction Workstation (Dossier on Desk) --- */}
      {(() => {
        const obj = getObject('obj_json_recovery');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-json-station ${isJsonRecovered ? 'solved' : isApiFixed ? 'active-task' : 'locked'} ${
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
              <span className={`beacon-dot ${isJsonRecovered ? 'dot-green' : isApiFixed ? 'dot-cyan' : 'dot-dim'}`} />
              <span className="beacon-tag">{isJsonRecovered ? 'RECORD 884-B RECOVERED' : 'REPAIR JSON'}</span>
            </div>
          </div>
        );
      })()}

      {/* --- HOTSPOT 4: Electromagnetic Vault Blast Door (Far Right) --- */}
      {(() => {
        const obj = getObject('obj_vault_door');
        if (!obj) return null;
        return (
          <div
            className={`physical-hotspot hotspot-vault-door ${isDoorOpen ? 'door-open' : isJsonRecovered ? 'ready-to-open' : 'locked'} ${
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
              <span className={`beacon-dot ${isDoorOpen ? 'dot-green' : isJsonRecovered ? 'dot-yellow' : 'dot-red'}`} />
              <span className="beacon-tag">{isDoorOpen ? 'MAG-LOCK RELEASED' : isJsonRecovered ? 'CYCLE VAULT' : 'MAG-SEALED'}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
