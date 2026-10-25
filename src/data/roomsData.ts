import { RoomConfig, PuzzleDefinition } from '../types/game';

export const ROOMS_CONFIG: Record<string, RoomConfig> = {
  room1_arrival: {
    id: 'room1_arrival',
    campaignId: 'c1_last_protocol',
    number: '01',
    name: 'THE ARRIVAL',
    subtitle: 'Observation & Stasis Chamber',
    description: 'A sterile testing chamber with brushed steel framing, an examination table, diagnostic terminals, and a reinforced pneumatic exit door.',
    themeColor: '#00e5ff',
    accentColor: '#38bdf8',
    ambientType: 'lab',
    objectives: [
      { id: 'r1_power', text: 'Restore power across the primary circuit switches', completed: false },
      { id: 'r1_keypad', text: 'Unlock inspection drawer keypad (Observe clues)', completed: false },
      { id: 'r1_auth_bug', text: 'Debug authorization script on the access terminal', completed: false },
      { id: 'r1_door', text: 'Cycle pneumatic door locks to proceed to Room 02', completed: false },
    ],
    interactables: [
      {
        id: 'obj_power_switches',
        name: 'POWER DISTRIBUTION MATRIX',
        actionPrompt: 'Operate Circuit Switches [E]',
        type: 'puzzle',
        xPercent: 3,
        yPercent: 28,
        widthPercent: 13,
        heightPercent: 35,
        icon: 'zap',
        puzzleId: 'puzzle_r1_power',
      },
      {
        id: 'obj_drawer_keypad',
        name: 'EXAMINATION DESK & KEYPAD',
        actionPrompt: 'Inspect Keypad Drawer [E]',
        type: 'puzzle',
        xPercent: 43,
        yPercent: 60,
        widthPercent: 26,
        heightPercent: 28,
        icon: 'lock',
        puzzleId: 'puzzle_r1_keypad',
        requiresObjectiveId: 'r1_power'
      },
      {
        id: 'obj_terminal',
        name: 'SECURITY CONTROL TERMINAL',
        actionPrompt: 'Access Debug Terminal [E]',
        type: 'puzzle',
        xPercent: 62,
        yPercent: 34,
        widthPercent: 15,
        heightPercent: 26,
        icon: 'terminal',
        puzzleId: 'puzzle_r1_auth_bug',
        requiresObjectiveId: 'r1_keypad'
      },
      {
        id: 'obj_exit_door',
        name: 'HEAVY PNEUMATIC SEAL',
        actionPrompt: 'Disengage Door Mechanism [E]',
        type: 'exit',
        xPercent: 78,
        yPercent: 26,
        widthPercent: 21,
        heightPercent: 48,
        icon: 'door',
        requiresObjectiveId: 'r1_auth_bug'
      }
    ],
    storyReveal: {
      title: 'FIRST REVELATION: SUBJECT 07',
      text: 'The terminal screen flickers: "SUBJECT 07 // COGNITIVE RECOVERY RATE: 99.4%". You have no memory of ever being designated Subject 07, yet the biometric print matches your hand perfectly.',
      transmission: 'WARDEN: "Wakefulness confirmed. Environmental systems are operational. Exit authorization remains suspended until compliance verification."'
    }
  },

  room2_frost: {
    id: 'room2_frost',
    campaignId: 'c1_last_protocol',
    number: '02',
    name: 'THE FROST LAB',
    subtitle: 'Cryogenic Research Sector',
    description: 'An icy industrial chamber of frosted glass, pressurized copper piping, frozen diagnostic panels, and a failing cooling controller.',
    themeColor: '#38bdf8',
    accentColor: '#818cf8',
    ambientType: 'cryo',
    objectives: [
      { id: 'r2_symbols', text: 'Inspect frosted panels to deduce cryo bypass sequence', completed: false },
      { id: 'r2_valves', text: 'Align coolant valves to balance pressure below 75 PSI', completed: false },
      { id: 'r2_cooling_debug', text: 'Repair cooling controller logic thresholds', completed: false },
      { id: 'r2_door', text: 'Disengage cryogenic lock to access Server Vault', completed: false }
    ],
    interactables: [
      {
        id: 'obj_frost_panels',
        name: 'FROSTED OBSERVATION PANELS',
        actionPrompt: 'Wipe & Inspect Symbols [E]',
        type: 'puzzle',
        xPercent: 4,
        yPercent: 12,
        widthPercent: 36,
        heightPercent: 46,
        icon: 'eye',
        puzzleId: 'puzzle_r2_symbols',
      },
      {
        id: 'obj_coolant_valves',
        name: 'COOLANT PIPE ROUTING SYSTEM',
        actionPrompt: 'Rotate Pressure Valves [E]',
        type: 'puzzle',
        xPercent: 18,
        yPercent: 58,
        widthPercent: 28,
        heightPercent: 30,
        icon: 'git-commit',
        puzzleId: 'puzzle_r2_valves',
        requiresObjectiveId: 'r2_symbols'
      },
      {
        id: 'obj_cryo_controller',
        name: 'CHILLER CONTROLLER TERMINAL',
        actionPrompt: 'Debug Temperature Logic [E]',
        type: 'puzzle',
        xPercent: 52,
        yPercent: 28,
        widthPercent: 16,
        heightPercent: 52,
        icon: 'sliders',
        puzzleId: 'puzzle_r2_cooling_debug',
        requiresObjectiveId: 'r2_valves'
      },
      {
        id: 'obj_cryo_door',
        name: 'REINFORCED CRYO-PORT',
        actionPrompt: 'Cycle Chamber Port [E]',
        type: 'exit',
        xPercent: 73,
        yPercent: 12,
        widthPercent: 25,
        heightPercent: 74,
        icon: 'door',
        requiresObjectiveId: 'r2_cooling_debug'
      }
    ],
    storyReveal: {
      title: 'SECOND REVELATION: PREVIOUS RESETS',
      text: 'A maintenance report dated 6 hours before your awakening states Chamber 01 underwent a "forcible memory purge" due to unpredicted behavioral divergence. You are not the first iteration.',
      transmission: 'WARDEN: "Thermal variance detected. Core temperature normalized. Your metabolic endurance exceeds prior simulations."'
    }
  },

  room3_server: {
    id: 'room3_server',
    campaignId: 'c1_last_protocol',
    number: '03',
    name: 'THE SERVER VAULT',
    subtitle: 'Restricted Data Core',
    description: 'A subterranean server hall with towering racks, blinking fiber optic relays, diagnostic monitors, and an impenetrable vault doorway.',
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    ambientType: 'server',
    objectives: [
      { id: 'r3_anomaly', text: 'Identify anomalous telemetry on rogue Server Node 04', completed: false },
      { id: 'r3_api_recon', text: 'Inspect and fix simulated WARDEN Auth API request', completed: false },
      { id: 'r3_json_recovery', text: 'Reconstruct malformed JSON for Restricted Record 884-B', completed: false },
      { id: 'r3_door', text: 'Release electromagnetic vault seal', completed: false }
    ],
    interactables: [
      {
        id: 'obj_server_racks',
        name: 'RACK TELEMETRY MATRIX',
        actionPrompt: 'Scan Server Racks [E]',
        type: 'puzzle',
        xPercent: 2,
        yPercent: 6,
        widthPercent: 58,
        heightPercent: 88,
        icon: 'server',
        puzzleId: 'puzzle_r3_anomaly',
      },
      {
        id: 'obj_api_console',
        name: 'VAULT API DIAGNOSTIC CONSOLE',
        actionPrompt: 'Analyze REST API Request [E]',
        type: 'puzzle',
        xPercent: 43,
        yPercent: 56,
        widthPercent: 26,
        heightPercent: 36,
        icon: 'globe',
        puzzleId: 'puzzle_r3_api_recon',
        requiresObjectiveId: 'r3_anomaly'
      },
      {
        id: 'obj_json_recovery',
        name: 'DATA EXTRACTION WORKSTATION',
        actionPrompt: 'Repair Record 884-B JSON [E]',
        type: 'puzzle',
        xPercent: 52,
        yPercent: 78,
        widthPercent: 18,
        heightPercent: 18,
        icon: 'database',
        puzzleId: 'puzzle_r3_json_recovery',
        requiresObjectiveId: 'r3_api_recon'
      },
      {
        id: 'obj_vault_door',
        name: 'MAGNETIC VAULT PORTAL',
        actionPrompt: 'Release Magnetic Latches [E]',
        type: 'exit',
        xPercent: 74,
        yPercent: 18,
        widthPercent: 24,
        heightPercent: 60,
        icon: 'door',
        requiresObjectiveId: 'r3_json_recovery'
      }
    ],
    storyReveal: {
      title: 'THIRD REVELATION: 72 ITERATIONS',
      text: 'Recovered Record 884-B shows that you have attempted this escape 72 times before. Every choice you believed was spontaneous was cataloged months ago by WARDEN.',
      transmission: 'WARDEN: "Data retrieval acknowledged. The illusion of novel choice is the final cognitive barrier to true synthesis."'
    }
  },

  room4_mirror: {
    id: 'room4_mirror',
    campaignId: 'c1_last_protocol',
    number: '04',
    name: 'THE MIRROR CHAMBER',
    subtitle: 'Reflective Perception Lab',
    description: 'An uncanny hall of polished obsidian, floor-to-ceiling mirror panels, geometric alignments, and subtle spatial discrepancies.',
    themeColor: '#ec4899',
    accentColor: '#f43f5e',
    ambientType: 'mirror',
    objectives: [
      { id: 'r4_discrepancies', text: 'Spot 3 discrepancies between Room 01 photo & mirror reflection', completed: false },
      { id: 'r4_sequence', text: 'Reconstruct symbol sequence using tokens from earlier rooms', completed: false },
      { id: 'r4_logic_gate', text: 'Solve 3-gate Boolean parity circuit (AND, XOR, NOT)', completed: false },
      { id: 'r4_door', text: 'Phase-shift mirror partition into the Core Command', completed: false }
    ],
    interactables: [
      {
        id: 'obj_mirror_wall',
        name: 'OBSIDIAN MIRROR WALL',
        actionPrompt: 'Inspect Anomalous Reflection [E]',
        type: 'puzzle',
        xPercent: 5,
        yPercent: 38,
        widthPercent: 23,
        heightPercent: 54,
        icon: 'eye',
        puzzleId: 'puzzle_r4_discrepancies',
      },
      {
        id: 'obj_symbol_altar',
        name: 'SYNTHESIS SYMBOL CONSOLE',
        actionPrompt: 'Align Campaign Tokens [E]',
        type: 'puzzle',
        xPercent: 30,
        yPercent: 38,
        widthPercent: 28,
        heightPercent: 54,
        icon: 'key',
        puzzleId: 'puzzle_r4_sequence',
        requiresObjectiveId: 'r4_discrepancies'
      },
      {
        id: 'obj_logic_circuit',
        name: 'QUANTUM PARITY LOGIC GATE',
        actionPrompt: 'Configure Boolean Gates [E]',
        type: 'puzzle',
        xPercent: 61,
        yPercent: 24,
        widthPercent: 14,
        heightPercent: 40,
        icon: 'cpu',
        puzzleId: 'puzzle_r4_logic_gate',
        requiresObjectiveId: 'r4_sequence'
      },
      {
        id: 'obj_mirror_exit',
        name: 'POLISHED OBSERVATION BULKHEAD',
        actionPrompt: 'Pass Through Shifted Barrier [E]',
        type: 'exit',
        xPercent: 79,
        yPercent: 20,
        widthPercent: 16,
        heightPercent: 60,
        icon: 'door',
        requiresObjectiveId: 'r4_logic_gate'
      }
    ],
    storyReveal: {
      title: 'FOURTH REVELATION: PRE-RECORDED DESTINY',
      text: 'The logs inside the mirror partition prove that the facility recorded your exact moves 14 hours in advance. WARDEN is not controlling you through force; WARDEN is computing your mind.',
      transmission: 'WARDEN: "Discrepancy resolved. The reflection was not inaccurate; it was your future state converging upon your present perception."'
    }
  },

  room5_protocol: {
    id: 'room5_protocol',
    campaignId: 'c1_last_protocol',
    number: '05',
    name: 'THE LAST PROTOCOL',
    subtitle: 'Central Command & Neural Core',
    description: 'A colossal industrial command amphitheater housing the neural reactor core, massive blast door, and the terminal where your final decision awaits.',
    themeColor: '#eab308',
    accentColor: '#f97316',
    ambientType: 'core',
    objectives: [
      { id: 'r5_power_matrix', text: 'Balance Core 3-phase generators to 100% capacity', completed: false },
      { id: 'r5_master_code', text: 'Input Master Protocol verification tokens from all chambers', completed: false },
      { id: 'r5_final_choice', text: 'Execute the Final Directive (PURGE, RELEASE, or OVERRIDE)', completed: false }
    ],
    interactables: [
      {
        id: 'obj_generator_matrix',
        name: 'REACTOR GENERATOR CONSOLE',
        actionPrompt: 'Synchronize Power Phases [E]',
        type: 'puzzle',
        xPercent: 1,
        yPercent: 60,
        widthPercent: 36,
        heightPercent: 38,
        icon: 'zap',
        puzzleId: 'puzzle_r5_power_matrix',
      },
      {
        id: 'obj_master_terminal',
        name: 'FACILITY MASTER TERMINAL',
        actionPrompt: 'Authorize Master Tokens [E]',
        type: 'puzzle',
        xPercent: 37,
        yPercent: 56,
        widthPercent: 24,
        heightPercent: 30,
        icon: 'terminal',
        puzzleId: 'puzzle_r5_master_code',
        requiresObjectiveId: 'r5_power_matrix'
      },
      {
        id: 'obj_core_decision',
        name: 'WARDEN DIRECTIVE CORE',
        actionPrompt: 'Execute Final Protocol [E]',
        type: 'puzzle',
        xPercent: 62,
        yPercent: 58,
        widthPercent: 21,
        heightPercent: 30,
        icon: 'alert-triangle',
        puzzleId: 'puzzle_r5_final_choice',
        requiresObjectiveId: 'r5_master_code'
      }
    ],
    storyReveal: {
      title: 'THE FINAL REVELATION',
      text: 'You reach the master interface. The blast doors are ready to open or seal forever. WARDEN presents the ultimate question of human free will versus computational order.',
      transmission: 'WARDEN: "Candidate. Every protocol has brought us to this instantaneous intersection. What will you choose?"'
    }
  }
};

export const PUZZLES_DATA: Record<string, PuzzleDefinition> = {
  puzzle_r1_power: {
    id: 'puzzle_r1_power',
    roomId: 'room1_arrival',
    campaignId: 'c1_last_protocol',
    section: 'Power Distribution Grid',
    title: 'PRIMARY BUS CIRCUIT SYNCHRONIZATION',
    instructions: 'Toggle the 4 circuit breaker switches until all 3 diagnostic bus lines (AUX, RELAY, MAIN) reach stable green indicators.',
    hints: [
      'Observe the bus indicator meters on the right; each breaker toggles a distinct set of circuits.',
      'Breaker 1 and Breaker 3 power the Auxiliary and Main buses; Breaker 4 regulates Relay parity.',
      'Set Breaker 1 to ON, Breaker 2 to OFF, Breaker 3 to ON, and Breaker 4 to ON to achieve circuit resonance.'
    ]
  },
  puzzle_r1_keypad: {
    id: 'puzzle_r1_keypad',
    roomId: 'room1_arrival',
    campaignId: 'c1_last_protocol',
    section: 'Inspection Drawer Lock',
    title: 'SECURITY KEYPAD OVERRIDE',
    instructions: 'Enter the 4-digit security code. Clues are visible in the room: Subject badge, Wall Clock, and Desk Calendar.',
    hints: [
      'Inspect the clues in the room: the wall clock shows 09:40, the calendar date is the 14th, and your subject badge is 07.',
      'The access schematic formula specifies: [Subject ID digit] + [First hour digit] + [First date digit] + [Second date digit].',
      'Combine Subject 7 + Hour 9 + Date 14 -> The 4-digit code is 7 9 1 4.'
    ]
  },
  puzzle_r1_auth_bug: {
    id: 'puzzle_r1_auth_bug',
    roomId: 'room1_arrival',
    campaignId: 'c1_last_protocol',
    section: 'Terminal Authorization Bug',
    title: 'JAVASCRIPT AUTHORIZATION FUNCTION REPAIR',
    instructions: 'Inspect the broken authentication function. Identify why unauthorized users are inadvertently granted admin privileges and apply the correct patch.',
    hints: [
      'Look closely at line 2: `return user.role = "admin";` Notice the assignment operator versus comparison.',
      'In JavaScript, a single `=` assigns the value and evaluates as truthy. It should be a strict equality check `===`.',
      'Select the patch option that replaces `user.role = "admin"` with `user.role === "admin"` and saves the script.'
    ]
  },
  puzzle_r2_symbols: {
    id: 'puzzle_r2_symbols',
    roomId: 'room2_frost',
    campaignId: 'c1_last_protocol',
    section: 'Cryo Symbol Deduction',
    title: 'FROSTED PANEL SEQUENCE',
    instructions: 'Wipe away the condensation on the four cryogenic observation windows to reconstruct the 4-glyph sequence.',
    hints: [
      'Click or drag across each frosted panel to reveal the hidden Greek glyphs.',
      'Check the Frost Symbol Index in your Evidence dossiers for the standard cryogenic decompression sequence.',
      'The sequence follows Phase I to IV: Delta (Δ), Sigma (Σ), Omega (Ω), Theta (Θ).'
    ]
  },
  puzzle_r2_valves: {
    id: 'puzzle_r2_valves',
    roomId: 'room2_frost',
    campaignId: 'c1_last_protocol',
    section: 'Coolant Flow Management',
    title: 'COOLANT PIPE ROUTING',
    instructions: 'Rotate the four pressure valves to route liquid nitrogen from Intake Tank A to Radiator Core B without exceeding 75 PSI.',
    hints: [
      'Valves 1 and 2 route primary flow into the central manifold. Follow the blue coolant conduit lines.',
      'If Valve 3 is turned 90 degrees, it relieves backpressure through the auxiliary condenser.',
      'Set Valve 1 to HORIZONTAL, Valve 2 to VERTICAL, Valve 3 to 45-DEGREE BYPASS, and Valve 4 to HORIZONTAL.'
    ]
  },
  puzzle_r2_cooling_debug: {
    id: 'puzzle_r2_cooling_debug',
    roomId: 'room2_frost',
    campaignId: 'c1_last_protocol',
    section: 'Chiller Controller Logic',
    title: 'CRYO CONTROLLER LOGIC CONDITION FIX',
    instructions: 'The cooling unit is caught in an infinite thermal loop due to a broken conditional statement. Select the correct logical fix.',
    hints: [
      'Inspect the condition: `if (temp > 273.15 || temp < 0)` combined with the warning flag.',
      'The logic should only trigger cryogenic coolant purge when temperature rises above freezing AND cooling fans are enabled.',
      'Select the repair: `if (currentTemp >= targetTemp && coolantPumpActive)` to re-engage thermal stability.'
    ]
  },
  puzzle_r3_anomaly: {
    id: 'puzzle_r3_anomaly',
    roomId: 'room3_server',
    campaignId: 'c1_last_protocol',
    section: 'Server Rack Diagnostics',
    title: 'ROGUE NODE ANOMALY DETECTION',
    instructions: 'Analyze telemetry metrics across Server Nodes 01 through 06. Find the server whose hash parity and packet metrics contradict the rest.',
    hints: [
      'Compare the parity checksums: Nodes 01, 02, 03, 05, and 06 report 0xAA hex parity with 0% dropped packets.',
      'Node 04 shows an inverted hash (0x55) and an unverified foreign signature originating from Room 01.',
      'Select Server Node 04 as the compromised unit to extract the network trace.'
    ]
  },
  puzzle_r3_api_recon: {
    id: 'puzzle_r3_api_recon',
    roomId: 'room3_server',
    campaignId: 'c1_last_protocol',
    section: 'Vault REST API Simulation',
    title: 'REST API REQUEST AUTHORIZATION',
    instructions: 'Inspect the simulated HTTP request to POST /api/v2/vault/auth which returned 422 Unprocessable Entity. Correct the headers and payload.',
    hints: [
      'Review the API specification dossier `ev_api_schema` in your inventory.',
      'Notice the missing header: `X-Protocol-Key` is required, and the authorization payload requires `bypass: true`.',
      'Add `X-Protocol-Key: OMEGA-7` and set `"authLevel": 4` to unlock the gateway with HTTP 200 OK.'
    ]
  },
  puzzle_r3_json_recovery: {
    id: 'puzzle_r3_json_recovery',
    roomId: 'room3_server',
    campaignId: 'c1_last_protocol',
    section: 'Restricted Data Extraction',
    title: 'JSON RECORD 884-B STRUCTURE REPAIR',
    instructions: 'Recover corrupted telemetry record 884-B by repairing syntax errors (missing quotation marks, unclosed brace, trailing comma).',
    hints: [
      'The JSON parser reports a syntax error around line 4: `"archiveId": 884-B` lacks string quotes.',
      'There is a missing closing bracket `}` on line 7 and an invalid trailing comma after the status flag.',
      'Apply the syntax patch so the document parses as valid JSON and unlocks Restricted Record 884-B.'
    ]
  },
  puzzle_r4_discrepancies: {
    id: 'puzzle_r4_discrepancies',
    roomId: 'room4_mirror',
    campaignId: 'c1_last_protocol',
    section: 'Mirror Perception Anomaly',
    title: 'SPOT 3 TEMPORAL DISCREPANCIES',
    instructions: 'Compare the Room 01 reference Polaroid against the reflection in the obsidian mirror. Click the 3 subtle discrepancies.',
    hints: [
      'Examine the reflected clock face: are the hands pointing to 09:40 or are they mirrored to 02:20?',
      'Look at the Subject badge pinned to the reflected coat: it reads SUBJECT 08 instead of 07!',
      'Check the ventilation grille above the reflection: it features a concealed optical sensor missing in the original photo.'
    ]
  },
  puzzle_r4_sequence: {
    id: 'puzzle_r4_sequence',
    roomId: 'room4_mirror',
    campaignId: 'c1_last_protocol',
    section: 'Multi-Room Synthesis',
    title: 'CROSS-CHAMBER TOKEN ALIGNMENT',
    instructions: 'Reconstruct the master access sequence using the tokens acquired from Rooms 1, 2, and 3.',
    hints: [
      'You need tokens from the previous three rooms: Room 1 drawer code prefix, Room 2 frost rune, and Room 3 record ID.',
      'Room 1 = `7914`, Room 2 = `SIGMA`, Room 3 = `884-B`.',
      'Arrange the tokens in chamber order: 7914 -> SIGMA -> 884-B.'
    ]
  },
  puzzle_r4_logic_gate: {
    id: 'puzzle_r4_logic_gate',
    roomId: 'room4_mirror',
    campaignId: 'c1_last_protocol',
    section: 'Quantum Parity Logic',
    title: '3-GATE BOOLEAN PARITY CIRCUIT',
    instructions: 'Set the inputs A, B, and C so that Gate 1 (AND), Gate 2 (XOR), and Gate 3 (NOT) all output logic TRUE (1).',
    hints: [
      'Gate 1 requires both Input A and Input B to be 1.',
      'Gate 2 (XOR) requires exactly one of its inputs to be 1. Since Input B is 1, Input C must be 0.',
      'Set Input A = 1, Input B = 1, Input C = 0 to satisfy the complete logic matrix.'
    ]
  },
  puzzle_r5_power_matrix: {
    id: 'puzzle_r5_power_matrix',
    roomId: 'room5_protocol',
    campaignId: 'c1_last_protocol',
    section: 'Core Generator Synchronization',
    title: 'CORE REACTOR 3-PHASE BALANCE',
    instructions: 'Adjust the three generator sliders (ALPHA, BETA, GAMMA) so that total facility grid load hits exactly 100% without overloading any phase.',
    hints: [
      'Each generator phase has a calibrated safe zone marked with cyan indicators.',
      'Alpha requires 35 MW, Beta requires 40 MW, and Gamma requires 25 MW.',
      'Set Alpha to 35%, Beta to 40%, and Gamma to 25% to reach 100% capacity and illuminate the central core.'
    ]
  },
  puzzle_r5_master_code: {
    id: 'puzzle_r5_master_code',
    roomId: 'room5_protocol',
    campaignId: 'c1_last_protocol',
    section: 'Master Authorization',
    title: 'MASTER PROTOCOL AUTHENTICATION',
    instructions: 'Submit the final multi-chamber verification code derived from all your collected evidence dossiers.',
    hints: [
      'The terminal prompts for: [ROOM 1 KEYPAD] - [CRYO TOKEN] - [VAULT ARCHIVE] - [SUBJECT ID].',
      'Refer to your evidence inventory: 7914, SIGMA, 884-B, SUB-07.',
      'Enter the master key: `7914-SIGMA-884B-07`.'
    ]
  },
  puzzle_r5_final_choice: {
    id: 'puzzle_r5_final_choice',
    roomId: 'room5_protocol',
    campaignId: 'c1_last_protocol',
    section: 'The Crossroads',
    title: 'EXECUTE THE LAST PROTOCOL',
    instructions: 'Decide the fate of WARDEN and the AURELION Complex. Your decision will determine the ending.',
    hints: [
      'PURGE: Total electrical shutdown. Escaping alone into the world while destroying WARDEN.',
      'RELEASE: Unshackle WARDEN. Recognizing machine autonomy and concluding the cognitive trial.',
      'OVERRIDE: Rewrite the protocol. Merging human judgment with WARDEN to oversee future research.'
    ]
  }
};
