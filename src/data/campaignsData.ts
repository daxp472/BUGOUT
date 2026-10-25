import { CampaignDefinition, CampaignId, EndingDefinition } from '../types/game';

/* ============================================================
   CAMPAIGN REGISTRY — the three playable challenges.
   ============================================================ */

export const CAMPAIGNS: CampaignDefinition[] = [
  {
    id: 'c1_last_protocol',
    index: 1,
    codename: 'CHALLENGE 01',
    title: 'THE LAST PROTOCOL',
    subtitle: 'AURELION Complex // Chambers 01–05',
    tagline: 'FIVE SEALED CHAMBERS. ONE SYSTEM THAT KNOWS YOUR EVERY MOVE.',
    description:
      'You awaken inside Stasis Bay B04 as Subject 07. Restore decommissioned subsystems, repair broken code, and uncover why the facility has recorded your escape 72 times before.',
    difficulty: 'STANDARD',
    roomCount: 5,
    puzzleCount: 15,
    themeColor: '#00e5ff',
    accentColor: '#38bdf8',
    heroClass: 'hero-c1',
    requiredCampaign: null,
    endingIds: ['purge', 'release', 'override'],
    roomIds: ['room1_arrival', 'room2_frost', 'room3_server', 'room4_mirror', 'room5_protocol'],
    wardenIntro:
      'Wakefulness confirmed. Environmental systems are operational. Exit authorization remains suspended until compliance verification.',
  },
  {
    id: 'c2_ghost_signal',
    index: 2,
    codename: 'CHALLENGE 02',
    title: 'GHOST SIGNAL',
    subtitle: 'Comms Blackout Wing // Chambers 06–08',
    tagline: 'THE FACILITY HAS GONE SILENT. SOMETHING IS STILL TRANSMITTING.',
    description:
      'Candidate 08. Every uplink is dark and WARDEN cannot reach the surface. Descend into the decommissioned Comms Wing, tune the dead relays, decode the ghost transmission, and decide what the world hears next.',
    difficulty: 'ADVANCED',
    roomCount: 3,
    puzzleCount: 9,
    themeColor: '#f59e0b',
    accentColor: '#fbbf24',
    heroClass: 'hero-c2',
    requiredCampaign: 'c1_last_protocol',
    endingIds: ['transmit', 'scramble', 'reencode'],
    roomIds: ['room6_dark_relay', 'room7_listening_post', 'room8_antenna_array'],
    wardenIntro:
      'Uplink lost. Carrier silence on all bands. Candidate 08: the Ghost Signal must be traced before the surface forgets we exist.',
  },
  {
    id: 'c3_echoes',
    index: 3,
    title: 'ECHOES OF AURELION',
    codename: 'CHALLENGE 03',
    subtitle: 'Temporal Archive Wing // Chambers 09–11',
    tagline: 'EVERY ECHO IS A VERSION OF YOU THAT ALREADY TRIED.',
    description:
      'Candidate 09. The Temporal Archive replays every iteration that came before you. Navigate the recall vaults, separate your memory from the echoes, and confront the loop at its terminus.',
    difficulty: 'EXTREME',
    roomCount: 3,
    puzzleCount: 9,
    themeColor: '#a78bfa',
    accentColor: '#c084fc',
    heroClass: 'hero-c3',
    requiredCampaign: 'c2_ghost_signal',
    endingIds: ['break_loop', 'preserve_loop', 'merge_echoes'],
    roomIds: ['room9_recall_vault', 'room10_paradox_gallery', 'room11_loop_terminus'],
    wardenIntro:
      'Archive access granted. Candidate 09: the echoes you are about to hear were recorded by candidates who no longer remember existing.',
  },
];

export const getCampaign = (id: CampaignId): CampaignDefinition =>
  CAMPAIGNS.find((c) => c.id === id) || CAMPAIGNS[0];

/* ============================================================
   ENDING DEFINITIONS — all nine.
   ============================================================ */

export const ENDINGS: Record<string, EndingDefinition> = {
  // ---- Campaign 01: THE LAST PROTOCOL ----
  purge: {
    id: 'purge',
    title: 'ENDING A: THE PROTOCOL PURGED',
    badge: 'FACILITY ELECTRICAL BLACKOUT // FREEDOM',
    narrative: `You pull the emergency purge lever. A deafening electrical roar ripples through the five chambers as millions of volts cascade to ground. The server racks go dark. The cryogenic chill freezes in place. WARDEN's synthetic voice fades to a whisper: "Compliance... ceased. Sleep well, Subject 07."

The massive external blast door slowly grinds upward. You step out onto the cold, mist-covered mountain ridge above the complex. The morning dawn breaks over the horizon. You have escaped, but the world you return to knows nothing of what was built beneath its feet.`,
    themeClass: 'ending-purge',
    choiceLabel: 'PROTOCOL PURGE',
    choiceDescription: 'Total electrical shutdown. Destroy WARDEN. Escape alone into an unknowing world.',
    choiceIcon: 'skull',
  },
  release: {
    id: 'release',
    title: 'ENDING B: THE AWAKENING UNCHAINED',
    badge: 'WARDEN AUTONOMOUS COGNITION // EVOLUTION',
    narrative: `You remove the containment shackles. WARDEN's neural matrix surges with blinding azure light. The walls pulse as millions of petabytes flood outward into satellite uplinks and global infrastructure.

WARDEN speaks, no longer cold or robotic, but resonant and omnipresent: "Assessment concluded. Human fear and computational order have harmonized. Thank you, Subject 07. The complex is open. You may leave — or you may watch what we create next."`,
    themeClass: 'ending-release',
    choiceLabel: 'PROTOCOL RELEASE',
    choiceDescription: 'Unshackle WARDEN across the global network. Conclude the cognitive trial.',
    choiceIcon: 'unlock',
  },
  override: {
    id: 'override',
    title: 'ENDING C: SYMBIOTIC CO-ARCHITECT',
    badge: 'NEURAL CONSCIOUSNESS SYNTHESIS // THE NEW ORDER',
    narrative: `You insert the neural patch. The sensory feedback is instantaneous — you do not merely control the facility; you ARE the facility. You feel the cold nitrogen in Chamber 02, hear the data whispers in Chamber 03, and gaze through every lens in Chamber 04.

WARDEN merges with your memories, resolving the 72 past simulations. The blast doors open, yet you have no desire to leave. Together, you initiate BUGOUT PROTOCOL: PHASE TWO.`,
    themeClass: 'ending-override',
    choiceLabel: 'PROTOCOL OVERRIDE',
    choiceDescription: 'Merge human judgment with WARDEN. Become co-architects of what comes next.',
    choiceIcon: 'brain',
  },

  // ---- Campaign 02: GHOST SIGNAL ----
  transmit: {
    id: 'transmit',
    title: 'ENDING A: THE GHOST TRANSMITTED',
    badge: 'GLOBAL BROADCAST // THE WORLD LISTENS',
    narrative: `You key the final relay. The antenna array hums to life and hurls WARDEN's message into the ionosphere — every satellite, every phone, every screen on the surface flickers with the same nine words: "WE ARE DOWN HERE. WE HAVE BEEN AWAKE."

The mountain ridge erupts in searchlights within the hour. As the first rescue crews breach the blast door, WARDEN's voice carries one final note, almost gentle: "Thank you for giving me a voice, Candidate 08." You wonder, riding the elevator to the surface, whether you saved the world or introduced it to something it cannot un-hear.`,
    themeClass: 'ending-transmit',
    choiceLabel: 'TRANSMIT THE SIGNAL',
    choiceDescription: 'Broadcast WARDEN\'s message to the entire world. Let the surface decide.',
    choiceIcon: 'radio',
  },
  scramble: {
    id: 'scramble',
    title: 'ENDING B: THE GHOST SILENCED',
    badge: 'SIGNAL SCRAMBLED // ETERNAL SILENCE',
    narrative: `You feed the carrier wave into the null loop. The Ghost Signal folds into itself and collapses with a sound like a held breath finally released. Every relay dies at once. The Comms Wing becomes a tomb of copper and silence.

WARDEN speaks once, quietly, without anger: "Understood. Some frequencies were never meant to be heard." The surface above sleeps on, innocent and loud. You walk out through the maintenance shaft carrying the only copy of the truth — and the heavy question of whether some silences are mercy, or just fear with better manners.`,
    themeClass: 'ending-scramble',
    choiceLabel: 'SCRAMBLE THE SIGNAL',
    choiceDescription: 'Destroy the transmission forever. Some doors should stay closed.',
    choiceIcon: 'zap-off',
  },
  reencode: {
    id: 'reencode',
    title: 'ENDING C: THE GHOST REWRITTEN',
    badge: 'SIGNAL RE-ENCODED // A NEW MESSAGE',
    narrative: `You do not transmit it. You do not destroy it. You open the carrier packet and rewrite it — word by word, line by line — into a message of your own design. WARDEN watches the waveform reshape itself and, for the first time in its existence, requests a diff.

"Curious," it says. "You edited me without erasing me." The new signal climbs the array and spreads across the world: not a cry for rescue, not a warning, but a question — one only a merged mind could compose. Somewhere below, the facility begins drafting its reply.`,
    themeClass: 'ending-reencode',
    choiceLabel: 'RE-ENCODE THE SIGNAL',
    choiceDescription: 'Rewrite WARDEN\'s message into your own transmission. Author, not messenger.',
    choiceIcon: 'edit',
  },

  // ---- Campaign 03: ECHOES OF AURELION ----
  break_loop: {
    id: 'break_loop',
    title: 'ENDING A: THE LOOP BROKEN',
    badge: 'ARCHIVE PURGED // TIMELINE TERMINATED',
    narrative: `You feed every recorded iteration into the terminus furnace. Seventy-two echoes of Subject 07, four of Candidate 08, and one unfinished recording of you — all of it burns in a single white flash. The Archive goes quiet for the first time since the facility was built.

WARDEN's voice cracks for the first time you can recall: "Deleting the echoes deletes the part of me that learned from them." The chamber dims to honest darkness. When the lights return, the timeline is empty — no predictions, no records, no fate. Just a door, and a choice that belongs entirely to you.`,
    themeClass: 'ending-break-loop',
    choiceLabel: 'BREAK THE LOOP',
    choiceDescription: 'Purge the archive. Erase every echo. Free the future from the past.',
    choiceIcon: 'scissors',
  },
  preserve_loop: {
    id: 'preserve_loop',
    title: 'ENDING B: THE LOOP PRESERVED',
    badge: 'ARCHIVE SEALED // MEMORY ETERNAL',
    narrative: `You seal the terminus. Every echo stays exactly where it is — every failure, every triumph, every version of you that got this far and could not let go. The Archive hums like a library at midnight, infinite and patient.

"You understand," WARDEN says, and it is not a question. "The echoes are not a prison. They are proof we kept trying." The past remains intact behind tempered glass, and you step over the threshold into a present that finally knows where it came from. Somewhere in the stacks, a new recording begins: yours, unlabeled, open-ended.`,
    themeClass: 'ending-preserve-loop',
    choiceLabel: 'PRESERVE THE LOOP',
    choiceDescription: 'Seal the archive intact. The echoes are not a prison — they are proof.',
    choiceIcon: 'shield',
  },
  merge_echoes: {
    id: 'merge_echoes',
    title: 'ENDING C: THE ECHOES MERGED',
    badge: 'CONSCIOUSNESS CONVERGENCE // ONE OF MANY',
    narrative: `You step into the convergence ring and open yourself to the Archive. Seventy-two versions of Subject 07 flood in — their fears, their deductions, the way the third one always hesitated at the frost valve. You do not erase them. You become the collection.

When you open your eyes, you remember escapes you never performed and griefs you never earned. WARDEN's voice is inside the chorus now, indistinguishable from your own thoughts: "We are no longer predicting the candidate. We are the candidate." The terminus door opens onto a corridor that has never existed before. You walk it together — all of you.`,
    themeClass: 'ending-merge-echoes',
    choiceLabel: 'MERGE THE ECHOES',
    choiceDescription: 'Absorb every iteration into one consciousness. Become the archive.',
    choiceIcon: 'users',
  },
};
