# Mech Forge: Infinite — Session File

> Update this file at the end of every work session. Read it at the start of every new session before touching any code.

---

## Project Identity

**Name:** Mech Forge: Infinite  
**Branch:** `claude/browser-game-setup-ep4p8b`  
**Repo:** `dela922/kjgl.kb.-km`  
**Type:** Browser game — Canvas API + Vanilla JS — PWA (offline-first)

---

## Design Decisions (locked — do not re-ask)

| Topic | Decision |
|---|---|
| Genre | Roguelike + Auto-Battler + Relic/Passive system |
| Theme | Robot / Mech units (geometric shapes) |
| Visual | Minimalist Geometric on HTML5 Canvas |
| Tech | Canvas API + Vanilla JS ES Modules — no build step |
| Offline | Full PWA with Service Worker |
| Battle | Turn-based auto-battle (Super Auto Pets style) |
| Team Size | Mode select: 3 / 5 / 7 mechs |
| Map | Slay the Spire branching node map |
| Cards | Replaced by Relics (permanent passive bonuses) |
| Draft | Pick 1 of 3 after each node |
| Replayability | Unlock roster + Ascension levels + Daily/Random seeds |

---

## File Map

```
index.html          — Entry point, PWA meta, canvas mount
manifest.json       — PWA manifest
sw.js               — Service worker (cache all assets offline)
icon-192.png        — PWA icon
icon-512.png        — PWA icon
generate-icons.js   — Icon generator script (node canvas)
src/
  main.js           — Game loop, input, screen routing
  state.js          — Central game state + helpers
  ui.js             — All screen renderers + button registry
  canvas.js         — Drawing primitives (shapes, bars, cards, text)
  mechs.js          — All mech definitions + factory
  relics.js         — All relic definitions
  enemies.js        — Enemy types + encounter generator
  map.js            — Branching node map generator
  battle.js         — Auto-battle engine (returns log for animation)
  draft.js          — Draft option generators (mech / relic)
  save.js           — localStorage save/load
  audio.js          — Procedural SFX via Web Audio API
```

---

## Screen Flow

```
TITLE → MODE_SELECT → MAP ──→ BATTLE → DRAFT → MAP
                        ├──→ REST → MAP
                        ├──→ EVENT → MAP
                        └──→ (boss win) DRAFT → next ACT or VICTORY
                                         ↓ (lose) GAME_OVER → TITLE
```

---

## Mech Roster (12 total)

| ID | Name | Tier | Shape | Ability |
|---|---|---|---|---|
| scout | Scout | 1 | triangle | Attacks first |
| tank | Tank | 1 | hexagon | Taunt |
| gunner | Gunner | 1 | square | On kill → bonus attack |
| medic | Medic | 1 | circle | Heal lowest HP ally/round |
| shielder | Shielder | 1 | pentagon | On hurt → +1 armor |
| hacker | Hacker | 2 | diamond | On attack → shred 2 armor |
| bomber | Bomber | 2 | octagon | On death → 6 AOE |
| sniper | Sniper | 2 | triangle | Targets lowest HP enemy |
| shield_drone | Shield Drone | 2 | circle | Battle start → +3 armor all |
| titan | Titan | 3 | hexagon | +2 ATK each round survived |
| phantom | Phantom | 3 | diamond | Double attack + 30% dodge |
| core | Core | 3 | octagon | Copies highest ATK ally |

Tier 1 = unlocked by default. Tier 2/3 = unlocked via run completions.

---

## Relic Pool (14 total)

Common: Power Core, Alloy Plating, Overcharge Cell, Salvage Protocol  
Uncommon: Overclock, Targeting AI, Repair Nanobots  
Rare: Bulwark Protocol, Revival Chip, Clone Matrix, Quantum Link  
Boss: Fusion Reactor, Overclock Ω  

---

## Current Status (Session 1)

- [x] Project structure created
- [x] All game data files (mechs, relics, enemies, map)
- [x] Battle engine (battle.js)
- [x] All UI screens (title, mode select, map, battle, draft, rest, event, game over)
- [x] PWA setup (manifest, sw, icons)
- [x] Save/load (localStorage)
- [x] Procedural audio (Web Audio API)
- [ ] Mech unlock system (after run completions)
- [ ] Ascension modifiers (difficulty scaling per ascension level)
- [ ] Rest screen upgrade mech picker (restUpgrade button needs mech selector)
- [ ] Icon generation (need canvas npm pkg or manual icons)
- [ ] Playtest and balance pass
- [ ] Deploy to GitHub Pages

---

## Known TODOs / Next Steps

1. **Rest upgrade picker** — `restUpgrade` in main.js sets `_restUpgradeMode` but no mech selector UI exists yet. Implement a mech selection overlay in `ui.js`.
2. **Unlock system** — After completing a run, unlock T2 mechs. After 3 runs, unlock T3. Wire into `state.unlockMech()`.
3. **Ascension modifiers** — Define 20 ascension levels in `state.js` and apply them in `battle.js` (enemy HP/ATK multiplier, etc.).
4. **Daily seed** — Already works via date-based seed. Add a UI indicator showing today's seed.
5. **Balance pass** — Play 5 full runs, tweak mech ATK/HP values.
6. **GitHub Pages deploy** — Push branch, enable Pages, add CNAME if desired.

---

## How to Run Locally

```bash
# Any static file server works:
npx serve .
# or
python3 -m http.server 8080
# Then open http://localhost:8080
```

No build step — pure ES modules loaded directly by the browser.

---

## Questions Still Open (ask user before implementing)

- Should the **REST screen upgrade picker** let you pick ANY mech from your team, or always upgrade the weakest?
- Should **T2/T3 mechs** appear in draft options from floor 1 (low chance) or only after a certain floor threshold?
- Should there be a **mech replacement mechanic** when your team is full and you pick a mech in draft? Currently: replaces first dead mech, or skips.
- Should **ascension** increase enemy stats only, or also modify map structure (more elites, fewer rests)?
