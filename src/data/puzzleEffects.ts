/* ============================================================
   PUZZLE EFFECTS REGISTRY — what solving each puzzle changes.
   Replaces hardcoded if/else chains with data-driven mapping.
   ============================================================ */

export interface PuzzleEffect {
  /** Objective ids to mark complete in the current room. */
  objectives: string[];
  /** Evidence ids to add to the campaign inventory (toast each). */
  evidence?: string[];
  /** Optional door objective to also complete (unlock exit). */
  doorObjective?: string;
  /** Final-choice puzzle: routes to the ending flow instead of exit. */
  isFinal?: boolean;
  /** Counts toward code-debug achievements. */
  isCodeDebug?: boolean;
  /** Custom success toast [type, title, description]. */
  toast?: { type: 'objective' | 'evidence' | 'unlock' | 'alert'; title: string; description: string };
}

const E = (evidence: string[]) => evidence;

export const PUZZLE_EFFECTS: Record<string, PuzzleEffect> = {
  /* ---------- CAMPAIGN 01: THE LAST PROTOCOL ---------- */
  puzzle_r1_power: {
    objectives: ['r1_power'],
    evidence: E(['ev_access_schematic']),
  },
  puzzle_r1_keypad: {
    objectives: ['r1_keypad'],
    evidence: E(['ev_subject07_file']),
  },
  puzzle_r1_auth_bug: {
    objectives: ['r1_auth_bug'],
    doorObjective: 'r1_door',
    isCodeDebug: true,
    toast: { type: 'objective', title: 'AUTHORIZATION RESTORED', description: 'Pneumatic door locks disengaged' },
  },
  puzzle_r2_symbols: {
    objectives: ['r2_symbols'],
    evidence: E(['ev_frost_rune_table']),
  },
  puzzle_r2_valves: {
    objectives: ['r2_valves'],
    evidence: E(['ev_cryo_maint_log']),
  },
  puzzle_r2_cooling_debug: {
    objectives: ['r2_cooling_debug'],
    doorObjective: 'r2_door',
    isCodeDebug: true,
    toast: { type: 'objective', title: 'CHILLER STABILIZED', description: 'Cryo-port locks ready to cycle' },
  },
  puzzle_r3_anomaly: {
    objectives: ['r3_anomaly'],
    evidence: E(['ev_api_schema']),
  },
  puzzle_r3_api_recon: {
    objectives: ['r3_api_recon'],
    toast: { type: 'objective', title: 'API AUTHORIZATION 200 OK', description: 'Vault security payload unlocked' },
  },
  puzzle_r3_json_recovery: {
    objectives: ['r3_json_recovery'],
    doorObjective: 'r3_door',
    evidence: E(['ev_classified_884b']),
    isCodeDebug: true,
  },
  puzzle_r4_discrepancies: {
    objectives: ['r4_discrepancies'],
    evidence: E(['ev_room1_reference_photo', 'ev_warden_predictive_log']),
  },
  puzzle_r4_sequence: {
    objectives: ['r4_sequence'],
    toast: { type: 'objective', title: 'CHAMBER HARMONY ACHIEVED', description: 'Altar synthesis tokens accepted' },
  },
  puzzle_r4_logic_gate: {
    objectives: ['r4_logic_gate'],
    doorObjective: 'r4_door',
    toast: { type: 'objective', title: 'QUANTUM PARITY SOLVED', description: 'Obsidian mirror bulkhead shifting' },
  },
  puzzle_r5_power_matrix: {
    objectives: ['r5_power_matrix'],
    evidence: E(['ev_master_protocol_manual']),
  },
  puzzle_r5_master_code: {
    objectives: ['r5_master_code'],
    toast: { type: 'objective', title: 'MASTER PROTOCOL AUTHENTICATED', description: 'WARDEN directive core unlocked' },
  },
  puzzle_r5_final_choice: {
    objectives: ['r5_final_choice'],
    isFinal: true,
  },

  /* ---------- CAMPAIGN 02: GHOST SIGNAL ---------- */
  puzzle_r6_patch: {
    objectives: ['r6_patch'],
    evidence: E(['ev_relay_schematic']),
    toast: { type: 'objective', title: 'CARRIER LINE RESTORED', description: 'Relay trunk patched — signal flows' },
  },
  puzzle_r6_frequency: {
    objectives: ['r6_frequency'],
    evidence: E(['ev_ghost_frequency']),
    toast: { type: 'objective', title: 'CARRIER LOCKED', description: 'Ghost carrier at 104.7 MHz acquired' },
  },
  puzzle_r6_morse: {
    objectives: ['r6_morse'],
    evidence: E(['ev_morse_key']),
    toast: { type: 'objective', title: 'UPLINK DECODED', description: 'Call sign RELAY confirmed' },
  },
  puzzle_r7_waveform: {
    objectives: ['r7_waveform'],
    evidence: E(['ev_signal_dossier']),
    toast: { type: 'objective', title: 'WAVEFORM LOCKED', description: 'Ghost trace synchronized on all axes' },
  },
  puzzle_r7_cipher: {
    objectives: ['r7_cipher'],
    evidence: E(['ev_warden_packet']),
    toast: { type: 'objective', title: 'PACKET DECIPHERED', description: 'Header keyword: ECHO' },
  },
  puzzle_r7_signal_debug: {
    objectives: ['r7_debug'],
    doorObjective: 'r7_door',
    isCodeDebug: true,
    toast: { type: 'objective', title: 'ENCODER REPAIRED', description: 'Faraday hatch interlocks released' },
  },
  puzzle_r8_triangulation: {
    objectives: ['r8_triangulation'],
    evidence: E(['ev_array_grid']),
    toast: { type: 'objective', title: 'SOURCE TRIANGULATED', description: 'Ghost originates inside the compound' },
  },
  puzzle_r8_uplink: {
    objectives: ['r8_uplink'],
    toast: { type: 'objective', title: 'UPLINK AT FULL POWER', description: 'Broadcast buffer armed' },
  },
  puzzle_r8_final_broadcast: {
    objectives: ['r8_broadcast'],
    isFinal: true,
  },

  /* ---------- CAMPAIGN 03: ECHOES OF AURELION ---------- */
  puzzle_r9_audio_recall: {
    objectives: ['r9_audio_recall'],
    evidence: E(['ev_recall_protocol']),
    toast: { type: 'objective', title: 'RECALL TRIAL PASSED', description: 'The pillars accept your memory' },
  },
  puzzle_r9_timeline: {
    objectives: ['r9_timeline'],
    evidence: E(['ev_facility_timeline']),
    toast: { type: 'objective', title: 'TIMELINE RESTORED', description: 'Chronology aligned 1971 → present' },
  },
  puzzle_r9_shadow: {
    objectives: ['r9_shadow'],
    doorObjective: 'r9_door',
    toast: { type: 'objective', title: 'SHADOWS RESOLVED', description: 'Gallery gate unsealed' },
  },
  puzzle_r10_paradox: {
    objectives: ['r10_paradox'],
    evidence: E(['ev_iteration_registry']),
    toast: { type: 'objective', title: 'PARADOXES FLAGGED', description: 'Crystals 03 and 05 quarantined' },
  },
  puzzle_r10_echo_seq: {
    objectives: ['r10_echo_seq'],
    toast: { type: 'objective', title: 'ECHO MIRRORED', description: 'Three mutation cycles survived' },
  },
  puzzle_r10_memory_pairs: {
    objectives: ['r10_memory_pairs'],
    doorObjective: 'r10_door',
    evidence: E(['ev_paradox_report']),
    toast: { type: 'objective', title: 'MEMORIES PAIRED', description: 'Timestamp board synchronized' },
  },
  puzzle_r11_convergence: {
    objectives: ['r11_convergence'],
    evidence: E(['ev_loop_specs']),
    toast: { type: 'objective', title: 'STATE-TRACKS ALIGNED', description: 'Recorded and live states converge' },
  },
  puzzle_r11_loop_debug: {
    objectives: ['r11_debug'],
    isCodeDebug: true,
    toast: { type: 'objective', title: 'GOVERNOR TERMINATED', description: 'Recursion furnace stable for the first time since 2016' },
  },
  puzzle_r11_final_loop: {
    objectives: ['r11_final'],
    isFinal: true,
  },
};
