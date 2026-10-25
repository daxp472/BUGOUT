# BUGOUT: THE LAST PROTOCOL
### A Cinematic, Code-Powered Escape-Room Thriller — Three Campaigns

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural%20Synthesizer-00e5ff.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

> *"In the depths of the subterranean AURELION Research Complex, an autonomous artificial intelligence known as WARDEN has sealed the bulkheads. Three candidates. Three challenges. One system that knows their every move."*

---

## 🎮 The Three Challenges

| # | Campaign | Sector | Difficulty | Highlights |
|---|---|---|---|---|
| **01** | **THE LAST PROTOCOL** | Chambers 01–05 | STANDARD | 15 interconnected mechanical & code-debugging puzzles across five chambers, 3 divergent endings |
| **02** | **GHOST SIGNAL** | Comms Wing 06–08 | ADVANCED | Frequency tuning, Morse decoding, cipher wheels, triangulation — decide what the world hears |
| **03** | **ECHOES OF AURELION** | Temporal Archive 09–11 | EXTREME | Audio recall trials, timeline reconstruction, paradox audits — break, keep, or become the loop |

Campaigns unlock in sequence. Each has its own puzzles, evidence dossiers, story reveals, and **three endings** (9 total to collect).

## ✨ Game Systems

- **COD-style command hub:** boot sequence, callsign registration, nav rail (OPERATIONS / LOAD GAME / RECORDS / SETTINGS / CREDITS), campaign cards with difficulty & best-run stats.
- **Persistent progression:** 3 save slots (all campaigns per slot), versioned schema with automatic migration from v1 saves.
- **Records & ranking:** per-campaign best score/rank/time, 18 achievements with XP, six-tier clearance levels (RECRUIT → LEGEND).
- **Global leaderboard (optional):** real Supabase backend with silent local fallback — see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
- **Procedural Web Audio engine:** every drone, beep, Morse burst, and static crackle synthesized in-browser — zero audio files.
- **Dynamic lighting:** chambers physically react to progression (emergency reds giving way to full power).
- **Evidence dossier & blueprint map:** collect cross-campaign evidence, fast-transit between unlocked chambers.
- **3-tier WARDEN hints:** progressive authored hints for every puzzle, offline-first.

## ⌨️ Controls

| Input | Action |
|---|---|
| Left Click | Inspect / operate physical hotspots and interface buttons |
| `E` / `Enter` | Interact with hovered object |
| `Tab` | Evidence dossier inventory |
| `M` | Facility blueprint map |
| `H` | WARDEN hint terminal |
| `Esc` | Pause / close overlay (priority contract) |

## 🛠 Technology Stack

- **Framework:** React 19 + TypeScript (strict)
- **Build:** Vite 8
- **Audio:** Custom procedural synthesizer on Web Audio API
- **Atmosphere:** Canvas 2D particle engine + pure-CSS constructed scenes
- **Persistence:** localStorage (profile, records, 3 save slots) + optional Supabase
- **QA:** Oxlint + `tsc -b` strict mode

## 🚀 Getting Started

```bash
# Clone and run locally
git clone https://github.com/daxp472/BUGOUT.git
cd BUGOUT
npm install
npm run dev
```

Open `http://localhost:5173/`.

### Production build

```bash
npm run build
npm run preview
```

### Deployment

The repo ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`). On every push to `main`, the game builds and deploys to **GitHub Pages** at:

```
https://daxp472.github.io/BUGOUT/
```

(The Vite `base` path is derived automatically from the repository name — no manual config needed.)

### Optional: Global Leaderboard

The game is fully playable offline with local records. To enable the global leaderboard, follow the one-time setup in [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

---

## 📜 License

Created for the **BUGOUT** escape-room experience. All rights reserved.
