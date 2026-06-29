# Mech Forge: Infinite

> Roguelike auto-battler with robot/mech units. Build a team of mechs, collect relics, descend 3 acts of procedural dungeon maps, and face increasingly powerful foes. Infinite replayability. No downloads. Offline PWA.

---

## Play

Open `index.html` in any modern browser, or host the folder on any static server. Install to your home screen for offline play.

```bash
# Local dev server (no install needed):
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## Complete Manual

### Overview

Mech Forge: Infinite is a **roguelike auto-battler**. Each run is unique:

- You navigate a **branching node map** (Slay the Spire style) across 3 acts.
- At battle nodes your mechs **auto-fight** enemies turn-by-turn (Super Auto Pets style).
- After battles you **draft 1 of 3** mechs or relics.
- **Relics** are permanent passive bonuses that stack and synergize.
- Reach the boss of Act 3 and win to complete a run.
- Die = run over; start fresh with what you've unlocked.

---

### Starting a Run

**1. Choose Team Size** at the mode select screen:

| Mode | Slots | Feel |
|---|---|---|
| 3 MECHS | 3 | Fast, punishing, high-skill |
| 5 MECHS | 5 | Balanced (recommended) |
| 7 MECHS | 7 | Grand army, complex synergies |

**2. First Draft** — immediately pick 1 of 3 mechs to start your team.

---

### The Map

Each act has **8 rows** of branching nodes. Tap a glowing node to visit it. You can only move to nodes connected to previously visited ones.

**Node Types:**

| Icon | Type | What Happens |
|---|---|---|
| ⚔ | Battle | Fight normal enemies. Pick mech or relic reward. |
| 💀 | Elite | Tougher enemies, better rewards. |
| 🔧 | Rest | Repair all mechs OR upgrade one mech. |
| ? | Event | Random encounter with choices (see Events). |
| 🏪 | Shop | Draft a mech or relic. |
| ☠ | Boss | Act boss. Win = advance to next act or victory. Boss drops a rare relic. |

---

### Battle System

Battles are **fully automatic** — you watch and cannot intervene (tap SKIP to fast-forward).

**Turn order:** Highest speed (SPD) attacks first. Ties: player mechs go before enemies.

**Each turn:**
1. Attacker targets the **frontmost** enemy (unless ability says otherwise).
2. Damage = attacker ATK − target Armor (armor absorbs up to its value).
3. Ability triggers fire (on attack, on hurt, on kill, on death, etc.).
4. Dead units are removed.

**Round end:** Regen, medic heals, per-round abilities fire.

Battle ends when one side has no mechs left.

**After winning:** Your mechs carry over their current HP (not full heal). Dead mechs stay dead until you visit a Rest node or replace them via draft.

---

### Mechs

Each mech is a **geometric shape** with stats and one passive ability.

| Stat | Meaning |
|---|---|
| ATK | Damage dealt per attack |
| HP | Hit points (reach 0 = destroyed) |
| Armor | Absorbs incoming damage before HP loss |
| SPD | Turn order (higher = attacks sooner) |

**Tier** indicates rarity and power. T1 mechs are unlocked from the start. T2 and T3 unlock as you complete runs.

#### Full Mech Roster

| Name | Tier | Shape | Ability |
|---|---|---|---|
| Scout | ★ | Triangle | Attacks first every round (highest SPD) |
| Tank | ★ | Hexagon | Taunt: enemies always target Tank if alive |
| Gunner | ★ | Square | On kill: immediately attacks again |
| Medic | ★ | Circle | End of each round: heals lowest-HP ally for 3 HP |
| Shielder | ★ | Pentagon | On hurt: gains +1 armor permanently |
| Hacker | ★★ | Diamond | On attack: reduces target armor by 2 |
| Bomber | ★★ | Octagon | On death: deals 6 damage to ALL enemies |
| Sniper | ★★ | Triangle | Always targets the lowest-HP enemy |
| Shield Drone | ★★ | Circle | Battle start: gives all allies +3 armor |
| Titan | ★★★ | Hexagon | End of each round survived: gains +2 ATK permanently |
| Phantom | ★★★ | Diamond | Attacks twice per turn; 30% dodge chance |
| Core | ★★★ | Octagon | Start of each round: copies the highest ATK among allies |

---

### Relics

Relics are **permanent passive bonuses** collected throughout the run. They appear as geometric shapes in the bottom-right HUD. Hover/tap a relic icon to see its effect.

**Rarity tiers:** Common → Uncommon → Rare → Boss (only from boss victories)

#### Full Relic List

| Name | Rarity | Effect |
|---|---|---|
| Power Core | Common | All mechs start battle with +2 ATK |
| Alloy Plating | Common | All mechs start with +3 armor |
| Overcharge Cell | Common | All mechs start battle with +5 max HP |
| Salvage Protocol | Common | Gain 1 extra gold at every shop |
| Overclock | Uncommon | First mech to attack each battle deals double damage |
| Targeting AI | Uncommon | All mechs deal +1 damage per enemy killed this run |
| Repair Nanobots | Uncommon | All mechs regen 1 HP per round in battle |
| Bulwark Protocol | Rare | When any mech dies, all remaining allies gain +4 armor |
| Revival Chip | Rare | Once per battle, first mech to die is revived with 3 HP |
| Clone Matrix | Rare | Battle start: spawn a 1 HP copy of your highest-ATK mech |
| Quantum Link | Rare | When any mech attacks, all other mechs deal 1 bonus damage |
| Fusion Reactor | Boss | All mechs gain +1 ATK and +1 armor after each battle won |
| Overclock Omega | Boss | All mechs attack twice per round |

---

### Draft (Pick 1 of 3)

After most nodes you are offered **3 choices**:

- If your team has empty slots, you'll often be offered **mechs**.
- If your team is full, you'll more often be offered **relics**.
- You can **skip** a relic offer (but never a mech offer if slots are open).

Draft options are **seeded by floor + run seed** — so re-running the same seed reproduces the same offers.

---

### Rest Nodes

At Rest nodes, choose one:

- **REPAIR ALL** — Restore all mechs to full HP.
- **OVERCLOCK** — Upgrade one mech: +2 ATK and +2 HP.

---

### Events

Random Event nodes present narrative scenarios with 2-3 choices.

| Event | Options |
|---|---|
| Scrap Merchant | Buy a random relic (3 gold) / Sell a mech for 2 gold / Leave |
| Ancient Forge | Upgrade a mech (+2 ATK) / Reinforce a mech (+3 armor) / Leave |
| Distress Signal | Rescue a mech (joins team) / Salvage for 1 gold / Ignore |

---

### Progression & Replayability

The game has **three replayability layers** that stack:

**1. Mech Unlocks**
Start with 5 tier-1 mechs. Complete runs to unlock tier-2 and tier-3 mechs, expanding the draft pool.

**2. Ascension System**
After completing a run, you can start the next on a higher **Ascension level** (0-20). Each ascension adds enemy HP/ATK multipliers and map modifiers.

**3. Seeds**
- **Random seed:** Every new run uses a different seed for infinite variety.
- **Daily Challenge:** Tap "DAILY CHALLENGE" to play a fixed seed shared globally that day.

---

### Synergy Tips

- **Bomber + Quantum Link:** Bomber death explosion + echo damage decimates groups.
- **Titan + Power Core:** Titan snowballs quickly; starting ATK bonus amplifies every round's growth.
- **Phantom + Overclock Omega:** Phantom already attacks twice; with Omega it attacks four times per round.
- **Tank + Bulwark Protocol:** Taunt concentrates damage on Tank; each death triggers +4 armor for all survivors.
- **Shield Drone + armor relics:** Stack armor high early; Hacker strips enemy armor to keep your damage consistent.

---

### Technical Notes

| Feature | Detail |
|---|---|
| No downloads | Pure browser, no install required |
| Offline | Full PWA — install to home screen, plays 100% offline |
| Save | localStorage — progress survives browser restarts |
| Mobile | Designed for portrait phone screens (max 480px wide) |
| Audio | Procedural SFX via Web Audio API — no audio files |
| Build | Zero build step — ES modules loaded directly by browser |

---

### Controls

| Input | Action |
|---|---|
| Tap / Click | Select node, pick draft option, press button |
| Hover (desktop) | Shows tooltips on relics and map nodes |

No keyboard shortcuts — designed for touch-first mobile play.

---

### File Structure

```
index.html          Entry point + PWA meta
manifest.json       PWA install config
sw.js               Service worker for offline caching
icon-192.png        PWA icon (192x192)
icon-512.png        PWA icon (512x512)
src/
  main.js           Game loop, input routing, screen manager
  state.js          Global game state + run/persistent data
  ui.js             Screen renderers + button hit registry
  canvas.js         Low-level drawing primitives
  mechs.js          Mech definitions + instance factory
  relics.js         Relic definitions
  enemies.js        Enemy types + encounter scaling
  map.js            Procedural branching map generator
  battle.js         Auto-battle engine (pure function returning log)
  draft.js          Draft option generators
  save.js           localStorage persistence
  audio.js          Procedural Web Audio SFX
SESSION.md          Developer session notes (read before coding)
```
