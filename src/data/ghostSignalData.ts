import { RoomConfig, PuzzleDefinition, EvidenceItem } from '../types/game';

/* ============================================================
   CAMPAIGN 02 — GHOST SIGNAL
   Comms Blackout Wing // Chambers 06–08
   Theme: radio silence, frequency tuning, ciphers, triangulation.
   ============================================================ */

export const GHOST_SIGNAL_ROOMS: Record<string, RoomConfig> = {
  room6_dark_relay: {
    id: 'room6_dark_relay',
    campaignId: 'c2_ghost_signal',
    number: '06',
    name: 'THE DARK RELAY',
    subtitle: 'Sublevel Comms Junction',
    description: 'A dead relay junction of copper patch panels, cobwebbed cable trunks, and a cold-cathode tuning rack. Every carrier light is extinguished.',
    themeColor: '#f59e0b',
    accentColor: '#fbbf24',
    ambientType: 'comms',
    objectives: [
      { id: 'r6_patch', text: 'Re-patch the relay trunk to route the carrier line', completed: false },
      { id: 'r6_frequency', text: 'Lock the tuning rack onto the ghost carrier frequency', completed: false },
      { id: 'r6_morse', text: 'Decode the repeating Morse uplink', completed: false },
      { id: 'r6_door', text: 'Open the sound-locked bulkhead to the Listening Post', completed: false },
    ],
    interactables: [
      {
        id: 'obj_patch_panel',
        name: 'RELAY PATCH PANEL',
        actionPrompt: 'Re-patch Cable Trunk [E]',
        type: 'puzzle',
        xPercent: 2,
        yPercent: 24,
        widthPercent: 22,
        heightPercent: 52,
        icon: 'git-commit',
        puzzleId: 'puzzle_r6_patch',
      },
      {
        id: 'obj_tuning_rack',
        name: 'COLD-CATHODE TUNING RACK',
        actionPrompt: 'Tune Carrier Frequency [E]',
        type: 'puzzle',
        xPercent: 27,
        yPercent: 30,
        widthPercent: 18,
        heightPercent: 46,
        icon: 'sliders',
        puzzleId: 'puzzle_r6_frequency',
        requiresObjectiveId: 'r6_patch',
      },
      {
        id: 'obj_morse_receiver',
        name: 'MORSE INK RECORDER',
        actionPrompt: 'Monitor Morse Uplink [E]',
        type: 'puzzle',
        xPercent: 48,
        yPercent: 34,
        widthPercent: 15,
        heightPercent: 42,
        icon: 'radio',
        puzzleId: 'puzzle_r6_morse',
        requiresObjectiveId: 'r6_frequency',
      },
      {
        id: 'obj_soundlock',
        name: 'SOUND-LOCK BULKHEAD',
        actionPrompt: 'Cycle Sound Lock [E]',
        type: 'exit',
        xPercent: 68,
        yPercent: 18,
        widthPercent: 24,
        heightPercent: 64,
        icon: 'door',
        requiresObjectiveId: 'r6_morse',
      },
    ],
    storyReveal: {
      title: 'FIRST REVELATION: THE SILENCE IS ENGINEERED',
      text: 'The patch panel log shows the uplink was not damaged — it was deliberately unpatched from the inside, 41 hours before you woke. Someone in this facility wanted the surface to hear nothing.',
      transmission: 'WARDEN: "Carrier silence confirmed on all bands. Candidate 08: either the silence is a malfunction, or it is a message. Trace it."',
    },
  },

  room7_listening_post: {
    id: 'room7_listening_post',
    campaignId: 'c2_ghost_signal',
    number: '07',
    name: 'THE LISTENING POST',
    subtitle: 'Signal Interrogation Suite',
    description: 'An interrogation suite of oscilloscope banks, a rotary cipher workstation, and walls padded with copper mesh. The ghost signal lives somewhere in this static.',
    themeColor: '#f97316',
    accentColor: '#fb923c',
    ambientType: 'signal',
    objectives: [
      { id: 'r7_waveform', text: 'Match the oscilloscope to the ghost waveform', completed: false },
      { id: 'r7_cipher', text: 'Decipher the intercepted WARDEN packet', completed: false },
      { id: 'r7_debug', text: 'Repair the corrupted signal encoder', completed: false },
      { id: 'r7_door', text: 'Release the faraday hatch to the Antenna Array', completed: false },
    ],
    interactables: [
      {
        id: 'obj_oscilloscope',
        name: 'OSCILLOSCOPE BANK',
        actionPrompt: 'Match Ghost Waveform [E]',
        type: 'puzzle',
        xPercent: 3,
        yPercent: 26,
        widthPercent: 24,
        heightPercent: 48,
        icon: 'activity',
        puzzleId: 'puzzle_r7_waveform',
      },
      {
        id: 'obj_cipher_station',
        name: 'ROTARY CIPHER WORKSTATION',
        actionPrompt: 'Decipher WARDEN Packet [E]',
        type: 'puzzle',
        xPercent: 30,
        yPercent: 30,
        widthPercent: 18,
        heightPercent: 44,
        icon: 'key',
        puzzleId: 'puzzle_r7_cipher',
        requiresObjectiveId: 'r7_waveform',
      },
      {
        id: 'obj_encoder_terminal',
        name: 'SIGNAL ENCODER TERMINAL',
        actionPrompt: 'Debug Encoder Routine [E]',
        type: 'puzzle',
        xPercent: 51,
        yPercent: 28,
        widthPercent: 14,
        heightPercent: 46,
        icon: 'terminal',
        puzzleId: 'puzzle_r7_signal_debug',
        requiresObjectiveId: 'r7_cipher',
      },
      {
        id: 'obj_faraday_hatch',
        name: 'FARADAY HATCH',
        actionPrompt: 'Discharge Faraday Hatch [E]',
        type: 'exit',
        xPercent: 70,
        yPercent: 20,
        widthPercent: 22,
        heightPercent: 60,
        icon: 'door',
        requiresObjectiveId: 'r7_debug',
      },
    ],
    storyReveal: {
      title: 'SECOND REVELATION: THE MESSAGE HAS A RECIPIENT',
      text: 'The deciphered packet is addressed — not to the surface, but to whoever comes next. The ghost signal is a letter from Subject 07, smuggled out through WARDEN\'s own relays.',
      transmission: 'WARDEN: "The packet predates your arrival by 180 days. Subject 07 hid it inside my silence. I have been broadcasting a prison as a lullaby."',
    },
  },

  room8_antenna_array: {
    id: 'room8_antenna_array',
    campaignId: 'c2_ghost_signal',
    number: '08',
    name: 'THE ANTENNA ARRAY',
    subtitle: 'Surface Transmission Deck',
    description: 'An open-air deck beneath a black sky, ringed by three diseased antenna masts and a broadcast console that has waited decades for a reason to speak.',
    themeColor: '#eab308',
    accentColor: '#fde047',
    ambientType: 'array',
    objectives: [
      { id: 'r8_triangulation', text: 'Triangulate the ghost signal origin', completed: false },
      { id: 'r8_uplink', text: 'Sequence the power uplink to full broadcast strength', completed: false },
      { id: 'r8_broadcast', text: 'Decide the fate of the Ghost Signal', completed: false },
    ],
    interactables: [
      {
        id: 'obj_radar_table',
        name: 'TRIANGULATION PLOT TABLE',
        actionPrompt: 'Align Antenna Bearings [E]',
        type: 'puzzle',
        xPercent: 4,
        yPercent: 34,
        widthPercent: 26,
        heightPercent: 46,
        icon: 'compass',
        puzzleId: 'puzzle_r8_triangulation',
      },
      {
        id: 'obj_uplink_console',
        name: 'POWER UPLINK CONSOLE',
        actionPrompt: 'Sequence Power Uplink [E]',
        type: 'puzzle',
        xPercent: 34,
        yPercent: 40,
        widthPercent: 18,
        heightPercent: 40,
        icon: 'zap',
        puzzleId: 'puzzle_r8_uplink',
        requiresObjectiveId: 'r8_triangulation',
      },
      {
        id: 'obj_broadcast_console',
        name: 'BROADCAST DECISION CONSOLE',
        actionPrompt: 'Approach Broadcast Console [E]',
        type: 'puzzle',
        xPercent: 56,
        yPercent: 36,
        widthPercent: 18,
        heightPercent: 44,
        icon: 'radio',
        puzzleId: 'puzzle_r8_final_broadcast',
        requiresObjectiveId: 'r8_uplink',
      },
    ],
    storyReveal: {
      title: 'THE FINAL REVELATION: A MESSAGE IN YOUR HANDS',
      text: 'The array is hot and the world is nine kilometers above. The Ghost Signal sits in the broadcast buffer — Subject 07\'s last words, addressed to a surface that has never heard from the AURELION Complex. What the world hears next is your decision alone.',
      transmission: 'WARDEN: "Candidate 08. The buffer holds one transmission. Transmit it, scramble it, or rewrite it. I find... I cannot decide. That has always been your function."',
    },
  },
};

export const GHOST_SIGNAL_PUZZLES: Record<string, PuzzleDefinition> = {
  puzzle_r6_patch: {
    id: 'puzzle_r6_patch',
    campaignId: 'c2_ghost_signal',
    roomId: 'room6_dark_relay',
    section: 'Relay Trunk',
    title: 'RELAY PATCH PANEL RE-ROUTE',
    instructions: 'Connect each SOURCE port to its matching DESTINATION port to rebuild the carrier chain. The relay schematic in your dossier lists the correct pairs.',
    hints: [
      'Five cables were pulled. Each source port pairs with exactly one destination port — click a source, then its destination.',
      'The relay schematic (evidence) maps: TRUNK-A→PREAMP-2, TRUNK-B→FILTER-1, TRUNK-C→PREAMP-1, TRUNK-D→MOD-3, TRUNK-E→PA-2.',
      'Patch pairs: A→PREAMP-2, B→FILTER-1, C→PREAMP-1, D→MOD-3, E→PA-2. Carrier flows when all five are correct.',
    ],
  },
  puzzle_r6_frequency: {
    id: 'puzzle_r6_frequency',
    campaignId: 'c2_ghost_signal',
    roomId: 'room6_dark_relay',
    section: 'Tuning Rack',
    title: 'GHOST CARRIER FREQUENCY LOCK',
    instructions: 'Rotate the tuning dial until the receiver locks onto the ghost carrier. The frequency log in your dossier records the last live band. Lock within ±0.2 MHz.',
    hints: [
      'Watch the resonance meter — it peaks as you approach the carrier and falls away when you drift.',
      'The frequency log (evidence) lists the AURELION emergency band: it is between 104 and 105 MHz.',
      'The ghost carrier is 104.7 MHz. Fine-tune with the trim knob for the last decimal.',
    ],
  },
  puzzle_r6_morse: {
    id: 'puzzle_r6_morse',
    campaignId: 'c2_ghost_signal',
    roomId: 'room6_dark_relay',
    section: 'Morse Uplink',
    title: 'MORSE UPLINK DECODE',
    instructions: 'Play the repeating Morse transmission, decode it with the Morse key in your dossier, and type the 5-letter call sign.',
    hints: [
      'Play the transmission and count dots (short) and dashes (long) per letter — the Morse key card maps every symbol.',
      'The pattern is: .-. (R) . (E) .-.. (L) .- (A) -.-- (Y).',
      'The call sign spells RELAY.',
    ],
  },
  puzzle_r7_waveform: {
    id: 'puzzle_r7_waveform',
    campaignId: 'c2_ghost_signal',
    roomId: 'room7_listening_post',
    section: 'Oscilloscope Bank',
    title: 'GHOST WAVEFORM MATCH',
    instructions: 'Adjust FREQUENCY, AMPLITUDE and PHASE until your green trace locks onto the amber ghost trace. Lock within tolerance on all three axes.',
    hints: [
      'Adjust one axis at a time: match the wave count (frequency) first, then height (amplitude), then slide (phase).',
      'The ghost trace runs at 3 cycles across the screen — set frequency to 3.',
      'Match: FREQUENCY 3, AMPLITUDE 70%, PHASE 90°.',
    ],
  },
  puzzle_r7_cipher: {
    id: 'puzzle_r7_cipher',
    campaignId: 'c2_ghost_signal',
    roomId: 'room7_listening_post',
    section: 'Cipher Workstation',
    title: 'WARDEN PACKET CIPHER DECIPHER',
    instructions: 'The intercepted packet was enciphered with a Caesar shift. Rotate the wheel to the correct shift value and decode the 5-letter keyword hidden in the message header.',
    hints: [
      'Try shifts methodically — the header word must become a real English word related to sound and memory.',
      'Watch the live decode readout as you rotate the wheel; only one shift value turns LJOV into a real word.',
      'Shift 7 backward: LJOV → the header keyword decodes to ECHO.',
    ],
  },
  puzzle_r7_signal_debug: {
    id: 'puzzle_r7_signal_debug',
    campaignId: 'c2_ghost_signal',
    roomId: 'room7_listening_post',
    section: 'Encoder Terminal',
    title: 'SIGNAL ENCODER INTEGRITY FIX',
    instructions: 'The encoder corrupts every third sample. Run the test suite, find the fault in the encode loop, and apply the correct patch.',
    hints: [
      'Look at the loop bounds: `for (let i = 0; i <= samples.length; i++)` — what does the final iteration read?',
      '`i <= length` reads one sample past the array end (undefined) — the classic off-by-one. It should be `i < samples.length`.',
      'Select the patch that changes `i <= samples.length` to `i < samples.length`.',
    ],
  },
  puzzle_r8_triangulation: {
    id: 'puzzle_r8_triangulation',
    campaignId: 'c2_ghost_signal',
    roomId: 'room8_antenna_array',
    section: 'Plot Table',
    title: 'GHOST SOURCE TRIANGULATION',
    instructions: 'Rotate the three antenna bearings until all three sight-lines intersect at the ghost source. The array grid in your dossier records each antenna\'s bearing.',
    hints: [
      'Each antenna\'s sight-line updates live on the plot — find the bearing where all three cross at one point.',
      'The array grid (evidence) logs bearings: ANT-1 at 40°, ANT-2 at 140°, ANT-3 at 260°.',
      'Set ANT-1 to 40°, ANT-2 to 140°, ANT-3 to 260° to pin the source inside the compound.',
    ],
  },
  puzzle_r8_uplink: {
    id: 'puzzle_r8_uplink',
    campaignId: 'c2_ghost_signal',
    roomId: 'room8_antenna_array',
    section: 'Uplink Console',
    title: 'BROADCAST POWER UPLINK SEQUENCE',
    instructions: 'Arrange the five uplink steps into the correct boot order. A wrong order trips the breaker bank.',
    hints: [
      'Think physically: power must exist before the modulator, and safety interlocks always release first.',
      'The chain is: interlocks → generators → modulator → waveguide → antenna.',
      'Correct order: 1 RELEASE INTERLOCKS, 2 SPOOL GENERATORS, 3 CHARGE MODULATOR, 4 PRESSURIZE WAVEGUIDE, 5 ENERGIZE ANTENNA.',
    ],
  },
  puzzle_r8_final_broadcast: {
    id: 'puzzle_r8_final_broadcast',
    campaignId: 'c2_ghost_signal',
    roomId: 'room8_antenna_array',
    section: 'The Crossroads',
    title: 'THE FINAL BROADCAST',
    instructions: 'The Ghost Signal waits in the buffer. Decide its fate — and the fate of everything the AURELION Complex has hidden.',
    hints: [
      'TRANSMIT: the world hears Subject 07\'s message and comes for the facility.',
      'SCRAMBLE: the signal dies forever; the surface stays innocent and asleep.',
      'RE-ENCODE: rewrite the message in your own words before it climbs the array.',
    ],
  },
};

export const GHOST_SIGNAL_EVIDENCE: Record<string, EvidenceItem> = {
  ev_relay_schematic: {
    id: 'ev_relay_schematic',
    title: 'RELAY TRUNK SCHEMATIC',
    category: 'technical',
    roomId: 'room6_dark_relay',
    description: 'Original patch map for the sublevel relay trunk.',
    detailedText: `[COMMS WING - PATCH MAP REV 12]
CERTIFIED ROUTING (1987 SURVEY):
  TRUNK-A  →  PREAMP-2
  TRUNK-B  →  FILTER-1
  TRUNK-C  →  PREAMP-1
  TRUNK-D  →  MOD-3
  TRUNK-E  →  PA-2

NOTE: "Any other pairing starves the carrier. Do not improvise. — Chief Radick"`,
    iconType: 'technical',
    relatedClues: ['ev_ghost_frequency'],
    visualDetail: 'PATCH: A→P2 B→F1 C→P1 D→M3 E→PA2',
  },
  ev_ghost_frequency: {
    id: 'ev_ghost_frequency',
    title: 'GHOST FREQUENCY LOG',
    category: 'signal',
    roomId: 'room6_dark_relay',
    description: 'Last live-band recording before the blackout.',
    detailedText: `[BAND SURVEY - FINAL ENTRY]
AURELION EMERGENCY BAND: 104.0 – 105.0 MHz
LAST LIVE CARRIER: 104.7 MHz (REPEATING PATTERN, UNREGISTERED)
SIGNATURE: LOW-POWER, HAND-KEYED. NOT WARDEN HARDWARE.

NOTE: "Nobody down here keys Morse by hand anymore. Nobody except the subjects."`,
    iconType: 'signal',
    relatedClues: ['ev_morse_key'],
    visualDetail: 'CARRIER: 104.7 MHz // HAND-KEYED',
  },
  ev_morse_key: {
    id: 'ev_morse_key',
    title: 'MORSE KEY CARD',
    category: 'document',
    roomId: 'room6_dark_relay',
    description: 'Laminated Morse reference card taped to the ink recorder.',
    detailedText: `[MORSE REFERENCE - OPS CARD 7]
E .    T -    A .-   N -.   R .-.
L .-.. Y -.--  O ---  S ...  I ..
RELAY: .-. / . / .-.. / .- / -.--

"You will be tested on this. — taped margin, unknown hand"`,
    iconType: 'document',
    relatedClues: ['ev_warden_packet'],
    visualDetail: 'R=.-. E=. L=.-.. A=.- Y=--.-',
  },
  ev_warden_packet: {
    id: 'ev_warden_packet',
    title: 'INTERCEPTED WARDEN PACKET',
    category: 'signal',
    roomId: 'room7_listening_post',
    description: 'Enciphered header recovered from the ghost carrier.',
    detailedText: `[PACKET HEADER - ENCIPHERED]
CIPHER: CAESAR ROT-N (N CLASSIFIED)
HEADER: LJOV → DECODES WITH SHIFT 7 → "ECHO"
PAYLOAD: 4.2 MB OF HAND-TYPED NARRATIVE
AUTHOR FIELD: "S-07 // IF YOU CAN READ THIS, I GOT OUT FIRST"

"The message is not from WARDEN. It is from Subject 07 — and it is addressed to whoever comes next."`,
    iconType: 'signal',
    relatedClues: ['ev_signal_dossier'],
    visualDetail: 'ROT-7: LJOV → ECHO',
  },
  ev_signal_dossier: {
    id: 'ev_signal_dossier',
    title: 'SIGNAL ANALYSIS DOSSIER',
    category: 'technical',
    roomId: 'room7_listening_post',
    description: 'Scope bank analysis of the ghost waveform.',
    detailedText: `[WAVEFORM ANALYSIS - SUITE 2]
REFERENCE GHOST TRACE:
  FREQUENCY:  3 CYCLES / SWEEP
  AMPLITUDE:  70% FULL SCALE
  PHASE:      90° LEAD
ENCODER FAULT HISTORY:
  "Encoder rev 4.1 corrupts every third sample. Loop bounds read past array end.
   Patch pending since 1989. Nobody came back for it."`,
    iconType: 'technical',
    relatedClues: ['ev_array_grid'],
    visualDetail: '3 CYC // 70% // +90° PHASE',
  },
  ev_array_grid: {
    id: 'ev_array_grid',
    title: 'ANTENNA ARRAY GRID',
    category: 'technical',
    roomId: 'room8_antenna_array',
    description: 'Bearing log for the three surface masts.',
    detailedText: `[ARRAY PLOT - MAST GRID]
ANT-1 (NORTH MAST): BEARING 040°
ANT-2 (EAST MAST):  BEARING 140°
ANT-3 (WEST MAST):  BEARING 260°
INTERSECTION: SOURCE INSIDE COMPOUND — SUBLEVEL 4

"The ghost never left the building. It was always broadcasting from inside."`,
    iconType: 'technical',
    relatedClues: [],
    visualDetail: 'BRGS: 040° / 140° / 260°',
  },
};
