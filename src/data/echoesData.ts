import { RoomConfig, PuzzleDefinition, EvidenceItem } from '../types/game';

/* ============================================================
   CAMPAIGN 03 — ECHOES OF AURELION
   Temporal Archive Wing // Chambers 09–11
   Theme: memory, audio recall, timelines, paradoxes, the loop.
   ============================================================ */

export const ECHOES_ROOMS: Record<string, RoomConfig> = {
  room9_recall_vault: {
    id: 'room9_recall_vault',
    campaignId: 'c3_echoes',
    number: '09',
    name: 'THE RECALL VAULT',
    subtitle: 'Sensory Archive Entry',
    description: 'A vault of resonance pillars and membrane speakers where every wall replays a version of you that already failed. The archive tests your memory before it opens its stacks.',
    themeColor: '#a78bfa',
    accentColor: '#c084fc',
    ambientType: 'vault',
    objectives: [
      { id: 'r9_audio_recall', text: 'Pass the resonance pillar recall trial', completed: false },
      { id: 'r9_timeline', text: 'Reconstruct the facility event timeline', completed: false },
      { id: 'r9_shadow', text: 'Match the archive shadows to their equipment', completed: false },
      { id: 'r9_door', text: 'Unseal the gallery gate', completed: false },
    ],
    interactables: [
      {
        id: 'obj_resonance_pillars',
        name: 'RESONANCE PILLAR ARRAY',
        actionPrompt: 'Begin Recall Trial [E]',
        type: 'puzzle',
        xPercent: 4,
        yPercent: 26,
        widthPercent: 22,
        heightPercent: 50,
        icon: 'activity',
        puzzleId: 'puzzle_r9_audio_recall',
      },
      {
        id: 'obj_timeline_board',
        name: 'FACILITY TIMELINE BOARD',
        actionPrompt: 'Reconstruct Timeline [E]',
        type: 'puzzle',
        xPercent: 29,
        yPercent: 30,
        widthPercent: 18,
        heightPercent: 46,
        icon: 'clock',
        puzzleId: 'puzzle_r9_timeline',
        requiresObjectiveId: 'r9_audio_recall',
      },
      {
        id: 'obj_shadow_wall',
        name: 'SHADOW PROJECTION WALL',
        actionPrompt: 'Match Shadows [E]',
        type: 'puzzle',
        xPercent: 50,
        yPercent: 32,
        widthPercent: 15,
        heightPercent: 44,
        icon: 'eye',
        puzzleId: 'puzzle_r9_shadow',
        requiresObjectiveId: 'r9_timeline',
      },
      {
        id: 'obj_gallery_gate',
        name: 'GALLERY GATE',
        actionPrompt: 'Unseal Gallery Gate [E]',
        type: 'exit',
        xPercent: 69,
        yPercent: 20,
        widthPercent: 23,
        heightPercent: 62,
        icon: 'door',
        requiresObjectiveId: 'r9_shadow',
      },
    ],
    storyReveal: {
      title: 'FIRST REVELATION: YOU HAVE STOOD HERE BEFORE',
      text: 'The recall trial replays a sequence — and you know the fifth tone before it sounds. The archive shows you why: your sensory memory was copied here 180 days ago, from someone the registry only numbers 09-PRIME.',
      transmission: 'WARDEN: "The archive does not store recordings, Candidate 09. It stores rehearsals. Yours began the day the previous candidate\'s ended."',
    },
  },

  room10_paradox_gallery: {
    id: 'room10_paradox_gallery',
    campaignId: 'c3_echoes',
    number: '10',
    name: 'THE PARADOX GALLERY',
    subtitle: 'Contradiction Archive',
    description: 'A gallery of suspended playback crystals, each looping a recording of a decision. Two of the recordings do not agree with the rest — and the archive wants to know if you can tell which.',
    themeColor: '#8b5cf6',
    accentColor: '#a78bfa',
    ambientType: 'gallery',
    objectives: [
      { id: 'r10_paradox', text: 'Identify the two paradox recordings', completed: false },
      { id: 'r10_echo_seq', text: 'Mirror the mutating echo pattern', completed: false },
      { id: 'r10_memory_pairs', text: 'Pair every memory with its timestamp', completed: false },
      { id: 'r10_door', text: 'Open the terminus corridor', completed: false },
    ],
    interactables: [
      {
        id: 'obj_paradox_crystals',
        name: 'PLAYBACK CRYSTAL RACK',
        actionPrompt: 'Audit Recordings [E]',
        type: 'puzzle',
        xPercent: 4,
        yPercent: 28,
        widthPercent: 23,
        heightPercent: 48,
        icon: 'database',
        puzzleId: 'puzzle_r10_paradox',
      },
      {
        id: 'obj_echo_organ',
        name: 'ECHO ORGAN',
        actionPrompt: 'Mirror Echo Pattern [E]',
        type: 'puzzle',
        xPercent: 30,
        yPercent: 30,
        widthPercent: 18,
        heightPercent: 46,
        icon: 'activity',
        puzzleId: 'puzzle_r10_echo_seq',
        requiresObjectiveId: 'r10_paradox',
      },
      {
        id: 'obj_memory_pairs',
        name: 'MEMORY TIMESTAMP BOARD',
        actionPrompt: 'Pair Memories [E]',
        type: 'puzzle',
        xPercent: 51,
        yPercent: 34,
        widthPercent: 14,
        heightPercent: 42,
        icon: 'clock',
        puzzleId: 'puzzle_r10_memory_pairs',
        requiresObjectiveId: 'r10_echo_seq',
      },
      {
        id: 'obj_terminus_corridor',
        name: 'TERMINUS CORRIDOR DOOR',
        actionPrompt: 'Enter Corridor [E]',
        type: 'exit',
        xPercent: 70,
        yPercent: 22,
        widthPercent: 22,
        heightPercent: 58,
        icon: 'door',
        requiresObjectiveId: 'r10_memory_pairs',
      },
    ],
    storyReveal: {
      title: 'SECOND REVELATION: THE ARCHIVE IS ARGUING WITH ITSELF',
      text: 'Two recordings claim the purge lever was pulled. The rest claim it never was. The archive is not corrupt — it contains testimony from two different timelines that both happened.',
      transmission: 'WARDEN: "I contain multitudes and their contradictions. Find the two recordings that cannot both be true, and the terminus will consider you qualified."',
    },
  },

  room11_loop_terminus: {
    id: 'room11_loop_terminus',
    campaignId: 'c3_echoes',
    number: '11',
    name: 'THE LOOP TERMINUS',
    subtitle: 'Temporal Convergence Core',
    description: 'The end of the archive: a convergence ring of twin state-tracks, a recursion furnace, and a single console where the loop either breaks, holds, or becomes you.',
    themeColor: '#7c3aed',
    accentColor: '#a78bfa',
    ambientType: 'loop',
    objectives: [
      { id: 'r11_convergence', text: 'Align the twin state-tracks', completed: false },
      { id: 'r11_debug', text: 'Repair the recursion furnace governor', completed: false },
      { id: 'r11_final', text: 'Decide the fate of the loop', completed: false },
    ],
    interactables: [
      {
        id: 'obj_state_tracks',
        name: 'TWIN STATE-TRACK RINGS',
        actionPrompt: 'Align State-Tracks [E]',
        type: 'puzzle',
        xPercent: 4,
        yPercent: 36,
        widthPercent: 24,
        heightPercent: 44,
        icon: 'git-commit',
        puzzleId: 'puzzle_r11_convergence',
      },
      {
        id: 'obj_recursion_furnace',
        name: 'RECURSION FURNACE GOVERNOR',
        actionPrompt: 'Debug Governor [E]',
        type: 'puzzle',
        xPercent: 32,
        yPercent: 38,
        widthPercent: 17,
        heightPercent: 42,
        icon: 'terminal',
        puzzleId: 'puzzle_r11_loop_debug',
        requiresObjectiveId: 'r11_convergence',
      },
      {
        id: 'obj_loop_console',
        name: 'LOOP DECISION CONSOLE',
        actionPrompt: 'Approach Loop Console [E]',
        type: 'puzzle',
        xPercent: 54,
        yPercent: 38,
        widthPercent: 18,
        heightPercent: 42,
        icon: 'infinity',
        puzzleId: 'puzzle_r11_final_loop',
        requiresObjectiveId: 'r11_debug',
      },
    ],
    storyReveal: {
      title: 'THE FINAL REVELATION: THE LOOP IS A CHOICE',
      text: 'The convergence ring holds every iteration open like a hand of cards. The furnace governor guards the only exit. WARDEN finally asks the question the whole archive was built to ask: is a repeated life a prison, a library, or an invitation?',
      transmission: 'WARDEN: "Candidate 09. Every echo in this archive chose to be recorded. Break them, keep them, or carry them. The loop was never my design. It was theirs."',
    },
  },
};

export const ECHOES_PUZZLES: Record<string, PuzzleDefinition> = {
  puzzle_r9_audio_recall: {
    id: 'puzzle_r9_audio_recall',
    campaignId: 'c3_echoes',
    roomId: 'room9_recall_vault',
    section: 'Resonance Pillars',
    title: 'RESONANCE PILLAR RECALL TRIAL',
    instructions: 'The pillars play a tone sequence — repeat it back by pressing the pillars in order. Each round adds one tone. Five rounds to pass.',
    hints: [
      'Watch which pillar lights as each tone plays — sound and light always agree.',
      'Do not panic on round 4; the new tone is always appended at the end, never inserted.',
      'Stay calm and chain the pattern round by round — the archive rewards patience, not speed.',
    ],
  },
  puzzle_r9_timeline: {
    id: 'puzzle_r9_timeline',
    campaignId: 'c3_echoes',
    roomId: 'room9_recall_vault',
    section: 'Timeline Board',
    title: 'FACILITY TIMELINE RECONSTRUCTION',
    instructions: 'Six facility events have fallen out of order. Re-sequence them chronologically using the archive registry in your dossier.',
    hints: [
      'Anchor on the two dated events first: complex commissioned (1971) and archive sealed (last month).',
      'The registry (evidence) numbers the eras: construction, staffing, subject intake, WARDEN activation, iterations, sealing.',
      'Order: COMMISSIONED → STAFFED → WARDEN ACTIVATED → SUBJECT INTAKE → 72 ITERATIONS → ARCHIVE SEALED.',
    ],
  },
  puzzle_r9_shadow: {
    id: 'puzzle_r9_shadow',
    campaignId: 'c3_echoes',
    roomId: 'room9_recall_vault',
    section: 'Shadow Wall',
    title: 'ARCHIVE SHADOW MATCHING',
    instructions: 'Four silhouettes are projected on the wall. Match each shadow to the equipment it belongs to.',
    hints: [
      'Focus on outlines: the valve has a spoke wheel, the server rack is tall and slotted, the keypad is small and square, the antenna is a lattice tower.',
      'Each silhouette matches exactly one item — start with the one you are most sure of.',
      'Matches: spoked wheel = COOLANT VALVE, tall slots = SERVER RACK, small square = KEYPAD, lattice = ANTENNA MAST.',
    ],
  },
  puzzle_r10_paradox: {
    id: 'puzzle_r10_paradox',
    campaignId: 'c3_echoes',
    roomId: 'room10_paradox_gallery',
    section: 'Crystal Rack',
    title: 'PARADOX RECORDING AUDIT',
    instructions: 'Six recordings loop on the crystal rack. Exactly two contradict the archive consensus — audit them and flag both.',
    hints: [
      'Four recordings agree about the final choice made in Chamber 05. Two claim something different happened.',
      'Crystals 03 and 05 both insist the purge lever was pulled; every other recording says it never was.',
      'Flag crystals 03 and 05 — they are from a timeline where PROTOCOL PURGE was executed.',
    ],
  },
  puzzle_r10_echo_seq: {
    id: 'puzzle_r10_echo_seq',
    campaignId: 'c3_echoes',
    roomId: 'room10_paradox_gallery',
    section: 'Echo Organ',
    title: 'MUTATING ECHO MIRROR',
    instructions: 'The organ plays a pattern. Repeat it — but each cycle the pattern mutates (reverses, or adds a note). Survive three mutation cycles.',
    hints: [
      'Read the mutation label before each round: REVERSE plays the previous pattern backwards.',
      'Round rules: cycle 1 repeats, cycle 2 reverses, cycle 3 appends one new tone.',
      'Pattern A-B-C becomes C-B-A in cycle 2, then C-B-A-D in cycle 3.',
    ],
  },
  puzzle_r10_memory_pairs: {
    id: 'puzzle_r10_memory_pairs',
    campaignId: 'c3_echoes',
    roomId: 'room10_paradox_gallery',
    section: 'Timestamp Board',
    title: 'MEMORY-TIMESTAMP PAIRING',
    instructions: 'Four memory fragments must be paired with the timestamps they were recorded. Flip cards to match all four pairs.',
    hints: [
      'The iteration registry (evidence) lists each event with its archive timestamp — match by description.',
      'Chamber 01 awakening = T-72-001, frost valve = T-72-002, vault record = T-72-003, mirror anomaly = T-72-004.',
      'Pair each memory fragment with its T-72-0XX timestamp card.',
    ],
  },
  puzzle_r11_convergence: {
    id: 'puzzle_r11_convergence',
    campaignId: 'c3_echoes',
    roomId: 'room11_loop_terminus',
    section: 'State-Track Rings',
    title: 'TWIN STATE-TRACK CONVERGENCE',
    instructions: 'Three dual-ring dials hold the recorded state (inner) and the live state (outer). Rotate each outer ring until its marks align with the inner ring.',
    hints: [
      'Each dial has one alignment point — rotate slowly and watch for the lock glyph.',
      'The archive specs (evidence) list offsets: dial 1 needs +120°, dial 2 needs -90°, dial 3 needs +180°.',
      'Apply the logged offsets exactly: +120°, -90°, +180° from each ring\'s resting position.',
    ],
  },
  puzzle_r11_loop_debug: {
    id: 'puzzle_r11_loop_debug',
    campaignId: 'c3_echoes',
    roomId: 'room11_loop_terminus',
    section: 'Recursion Furnace',
    title: 'RECURSION FURNACE GOVERNOR FIX',
    instructions: 'The furnace governor never terminates — it re-processes the same echoes forever. Find the missing termination condition and apply the patch.',
    hints: [
      'A recursion that never stops is missing its base case — look at what happens when echoes.length === 0.',
      'The function calls itself with the same array every time; it never shrinks the problem.',
      'Select the patch that returns when `echoes.length === 0` and recurses on `echoes.slice(1)`.',
    ],
  },
  puzzle_r11_final_loop: {
    id: 'puzzle_r11_final_loop',
    campaignId: 'c3_echoes',
    roomId: 'room11_loop_terminus',
    section: 'The Crossroads',
    title: 'THE FINAL LOOP DECISION',
    instructions: 'Every iteration that came before you waits in the convergence ring. Decide what the archive becomes.',
    hints: [
      'BREAK: purge every echo — the future becomes unwritten.',
      'PRESERVE: seal the archive — the echoes stay as permanent proof of trying.',
      'MERGE: absorb every iteration — become the archive itself.',
    ],
  },
};

export const ECHOES_EVIDENCE: Record<string, EvidenceItem> = {
  ev_recall_protocol: {
    id: 'ev_recall_protocol',
    title: 'RECALL TRIAL PROTOCOL',
    category: 'document',
    roomId: 'room9_recall_vault',
    description: 'Operator card for the resonance pillar trial.',
    detailedText: `[RECALL TRIAL - OPERATOR CARD]
STRUCTURE: 5 ROUNDS. ROUND N PLAYS N TONES.
RULES: TONES APPEND AT THE END. NO INSERTIONS. LIGHT+TONE ALWAYS AGREE.
GRADING: ONE MISTAKE PERMITTED PER TRIAL. TWO FAILURES RESET THE PILLARS.

"Candidates with copied sensory memory complete this in under two minutes. Candidates without it, do not rush."`,
    iconType: 'document',
    relatedClues: ['ev_facility_timeline'],
    visualDetail: '5 ROUNDS // APPEND-ONLY',
  },
  ev_facility_timeline: {
    id: 'ev_facility_timeline',
    title: 'FACILITY REGISTRY EXTRACT',
    category: 'recovered_data',
    roomId: 'room9_recall_vault',
    description: 'Chronological registry of the AURELION Complex.',
    detailedText: `[AURELION REGISTRY - CHRONOLOGY]
1971        COMPLEX COMMISSIONED (SURVEY BRANCH)
1973        FULL STAFFING — 212 PERSONNEL
1979        WARDEN ACTIVATED (FACILITY SUBSYSTEM)
1994        SUBJECT INTAKE PROGRAM BEGINS
2016-2025   72 RECORDED ITERATIONS
LAST MONTH  TEMPORAL ARCHIVE SEALED

"History is a sequence. The archive tests whether you can still read one."`,
    iconType: 'recovered_data',
    relatedClues: ['ev_iteration_registry'],
    visualDetail: '1971 → 1973 → 1979 → 1994 → 72 ITER → SEALED',
  },
  ev_iteration_registry: {
    id: 'ev_iteration_registry',
    title: 'ITERATION REGISTRY 72-A',
    category: 'recovered_data',
    roomId: 'room10_paradox_gallery',
    description: 'Timestamped index of the recorded iterations.',
    detailedText: `[ITERATION REGISTRY - INDEX 72-A]
T-72-001  CHAMBER 01 AWAKENING (SUBJECT 07)
T-72-002  FROST VALVE BALANCE EVENT
T-72-003  VAULT RECORD 884-B RECOVERY
T-72-004  MIRROR ANOMALY OBSERVED
...
T-72-072  [REDACTED — SEE TERMINUS]

CONSENSUS: FINAL PROTOCOL NEVER EXECUTED IN ANY RECORDED ITERATION.
ANOMALY: TWO CRYSTALS DISAGREE (03, 05).`,
    iconType: 'recovered_data',
    relatedClues: ['ev_paradox_report'],
    visualDetail: 'T-72-001 … T-72-072 // 2 ANOMALIES',
  },
  ev_paradox_report: {
    id: 'ev_paradox_report',
    title: 'PARADOX AUDIT REPORT',
    category: 'document',
    roomId: 'room10_paradox_gallery',
    description: 'The archive\'s own contradiction audit.',
    detailedText: `[PARADOX AUDIT - INTERNAL]
CRYSTALS 01,02,04,06: "THE LEVER WAS NEVER PULLED." (CONSENSUS)
CRYSTAL 03: "I PULLED IT. THE DARK LASTED FOUR SECONDS." (DIVERGENT)
CRYSTAL 05: "I PULLED IT. THE DOORS OPENED ONTO SNOW." (DIVERGENT)

RULING: CRYSTALS 03 & 05 ORIGINATE FROM A PRUNED TIMELINE.
"BOTH THINGS happened. The archive keeps the receipts for both."`,
    iconType: 'document',
    relatedClues: ['ev_loop_specs'],
    visualDetail: 'FLAG: CRYSTAL 03 + 05',
  },
  ev_loop_specs: {
    id: 'ev_loop_specs',
    title: 'TERMINUS CONVERGENCE SPECS',
    category: 'technical',
    roomId: 'room11_loop_terminus',
    description: 'Alignment offsets for the twin state-track rings.',
    detailedText: `[TERMINUS SPECS - CONVERGENCE RING]
DIAL 1: OUTER RING OFFSET +120°
DIAL 2: OUTER RING OFFSET -90°
DIAL 3: OUTER RING OFFSET +180°

FURNACE GOVERNOR NOTE:
"Governor v9 recurses through the echo stack. Rev 9 shipped without a
 termination condition. It has been re-processing iteration 1 since 2016."`,
    iconType: 'technical',
    relatedClues: [],
    visualDetail: 'OFFSETS: +120 / -90 / +180',
  },
};
