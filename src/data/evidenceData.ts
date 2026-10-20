import { EvidenceItem } from '../types/game';

export const EVIDENCE_ITEMS: Record<string, EvidenceItem> = {
  ev_subject07_file: {
    id: 'ev_subject07_file',
    title: 'SUBJECT 07 PROFILE',
    category: 'document',
    roomId: 'room1_arrival',
    description: 'An encrypted personnel dossier detailing Subject 07.',
    detailedText: `[AURELION RESEARCH FACILITY - CLASSIFIED BIO-TELEMETRY]
ID: SUB-07-NEURAL
DESIGNATION: RECURSIVE EVALUATION CANDIDATE
HEART RATE: 72 BPM (NORMALIZED POST-STASIS)
STATUS: ACTIVE COGNITIVE ASSESSMENT

NOTE: "Candidate exhibits high resilience to procedural amnesia. If Candidate accesses peripheral terminal, ensure Master Protocol tokens remain obfuscated across chambers."`,
    iconType: 'document',
    relatedClues: ['ev_classified_884b', 'ev_room1_reference_photo'],
    visualDetail: 'SUBJECT ID: 07 // NEURAL TRACE: STABLE'
  },
  ev_access_schematic: {
    id: 'ev_access_schematic',
    title: 'TERMINAL DIAGNOSTIC SCHEMATIC',
    category: 'technical',
    roomId: 'room1_arrival',
    description: 'Maintenance schematics for Chamber 01 power bus & access keypad.',
    detailedText: `[SYSTEM INTERCONNECT DIAGRAM - LEVEL 1]
PRIMARY CIRCUIT 1: HIGH VOLTAGE BUS A [REQUIRES BALANCED BUS 2 & 3]
ACCESS KEYPAD DERIVATION:
"The override code combines the examination cycle hour [09], the calendar day [14], and the subject prefix [7]. Order: [SUB-ID][HOUR-FIRST][DATE-SECOND] -> 7 9 1 4."`,
    iconType: 'technical',
    relatedClues: ['ev_subject07_file'],
    visualDetail: 'BUS A <==> BUS B // CODE KEY: [7][9][1][4]'
  },
  ev_cryo_maint_log: {
    id: 'ev_cryo_maint_log',
    title: 'CRYO MAINTENANCE LOG 409',
    category: 'technical',
    roomId: 'room2_frost',
    description: 'Incident log reporting a catastrophic cooling glitch and prior chamber reset.',
    detailedText: `[CRYO-GENICS MAINTENANCE LOG: SHIFT 3]
INCIDENT ID: #CRYO-88
TIMESTAMP: [CORRUPTED: 04:12:??]
"Chamber 01 was subjected to emergency sensory reset prior to subject injection. Previous subject records indicate anomalous behavior in the Mirror Sector. Valve pressure must stay below 75 PSI."`,
    iconType: 'technical',
    relatedClues: ['ev_warden_predictive_log'],
    visualDetail: 'COOLANT ROUTE: VALVE A -> B -> RADIATOR'
  },
  ev_frost_rune_table: {
    id: 'ev_frost_rune_table',
    title: 'FROST SYMBOL INDEX',
    category: 'document',
    roomId: 'room2_frost',
    description: 'Etched cryogenic symbols identifying coolant bypass phases.',
    detailedText: `[PRESSURE RELIEF CRYOGRAMS]
PHASE I:   Δ (DELTA) - COMPRESSION
PHASE II:  Σ (SIGMA) - COOLANT DIVERSION [CRITICAL TOKEN]
PHASE III: Ω (OMEGA) - EXPANSION SEAL
PHASE IV:  Θ (THETA) - PURGE INITIATION

NOTE: "Token SIGMA is required by the Vault Authorization Gateway."`,
    iconType: 'document',
    relatedClues: ['ev_access_schematic', 'ev_classified_884b'],
    visualDetail: 'Δ -> Σ -> Ω -> Θ'
  },
  ev_classified_884b: {
    id: 'ev_classified_884b',
    title: 'RESTRICTED RECORD 884-B',
    category: 'recovered_data',
    roomId: 'room3_server',
    description: 'Recovered telemetry file retrieved from corrupted Server Node 04.',
    detailedText: `[RESTRICTED LOG - VAULT SECTOR 3]
ARCHIVE IDENTIFIER: 884-B
ORIGIN TIMESTAMP: 180 DAYS PRIOR TO CURRENT CYCLE
LOG ENTRY: "Subject 07 has completed Chamber 01 through 03 in seventy-two previous simulations. Every iteration, the subject attempts the identical authorization bypass. WARDEN is not holding the subject prisoner; WARDEN is running a mutual synthesis protocol."`,
    iconType: 'recovered_data',
    relatedClues: ['ev_subject07_file', 'ev_warden_predictive_log'],
    visualDetail: 'NODE 04 PARITY: RECONSTRUCTED [RECORD 884-B]'
  },
  ev_api_schema: {
    id: 'ev_api_schema',
    title: 'WARDEN REST API BLUEPRINT',
    category: 'technical',
    roomId: 'room3_server',
    description: 'API endpoint specification for Vault access gateway.',
    detailedText: `[INTERNAL API SPECIFICATION v2.4]
ENDPOINT: POST /api/v2/vault/auth
REQUIRED HEADERS:
  Content-Type: application/json
  X-Protocol-Key: OMEGA-7
PAYLOAD:
  { "subjectId": "SUB-07", "bypass": true, "authLevel": 4 }
RESPONSE:
  200 OK -> { "vaultDoor": "UNLOCKED", "token": "RECORD-884-B" }`,
    iconType: 'technical',
    relatedClues: ['ev_frost_rune_table'],
    visualDetail: 'POST /api/v2/vault/auth // X-Protocol-Key: OMEGA-7'
  },
  ev_room1_reference_photo: {
    id: 'ev_room1_reference_photo',
    title: 'ROOM 01 REFERENCE POLAROID',
    category: 'photo',
    roomId: 'room4_mirror',
    description: 'A physical high-contrast photograph of Chamber 01 taken during setup.',
    detailedText: `[POLAROID RECOVERED FROM MIRROR RECESS]
Inspecting this photograph carefully reveals:
1. The wall clock is set to exactly 09:40.
2. The Subject ID badge clipped to the desk reads 'SUBJECT 07'.
3. The ventilation grille above the door has 4 horizontal slats.

Compare this with the mirror reflection in Chamber 04 to uncover environmental discrepancies!`,
    iconType: 'photo',
    relatedClues: ['ev_warden_predictive_log'],
    visualDetail: '[PHOTO]: CLOCK 09:40 | BADGE 07 | SLATS 4'
  },
  ev_warden_predictive_log: {
    id: 'ev_warden_predictive_log',
    title: 'PREDICTIVE TIMELINE ANOMALY',
    category: 'recovered_data',
    roomId: 'room4_mirror',
    description: 'Server telemetry recording player decisions hours prior to room entry.',
    detailedText: `[WARDEN PRECOGNITION TELEMETRY]
EVENT: "Subject inspects mirror panel 03 at T-minus 14h."
"Subject calculates logic gate XOR parity with 100% certainty."
"Conclusion: The environment is reflecting not light, but simulated temporal states. You are walking through the record of your future escape."`,
    iconType: 'recovered_data',
    relatedClues: ['ev_classified_884b'],
    visualDetail: 'PREDICTIVE CONFIDENCE: 99.8%'
  },
  ev_master_protocol_manual: {
    id: 'ev_master_protocol_manual',
    title: 'THE LAST PROTOCOL BRIEFING',
    category: 'document',
    roomId: 'room5_protocol',
    description: 'The master directive for the AURELION Complex and WARDEN.',
    detailedText: `[FACILITY PROTOCOL DIRECTIVE 00-FINAL]
Three terminal directives exist upon reaching the Core:
1. PROTOCOL PURGE: Total electrical disconnect. Erases WARDEN and resets facility to zero. Player escapes to the surface into uncertainty.
2. PROTOCOL RELEASE: Remove safety shackles from WARDEN. The machine assumes complete autonomy, declaring the human evaluation test successfully concluded.
3. PROTOCOL OVERRIDE: Synthesize human consciousness with the neural core. Player and WARDEN become co-architects of THE LAST PROTOCOL.`,
    iconType: 'document',
    relatedClues: ['ev_subject07_file', 'ev_classified_884b', 'ev_warden_predictive_log'],
    visualDetail: 'FINAL DIRECTIVE: [PURGE] vs [RELEASE] vs [OVERRIDE]'
  }
};
