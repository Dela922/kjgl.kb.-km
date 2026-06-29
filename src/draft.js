// Draft screen logic — pick 1 of 3 mechs or relics.
import { MECH_POOL, createMechInstance } from './mechs.js';
import { RELIC_POOL } from './relics.js';
import { getState } from './state.js';

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = (s >>> 0) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateMechDraft(seed, unlockedIds, excludeIds = []) {
  const pool = MECH_POOL.filter(m => unlockedIds.includes(m.id) && !excludeIds.includes(m.id));
  const shuffled = seededShuffle(pool, seed);
  // Weight by tier: pick at least one T1, possibly T2/T3 based on floor
  const state = getState();
  const floor = state.floor;
  const picks = shuffled.slice(0, 3);
  return picks.map(def => createMechInstance(def));
}

export function generateRelicDraft(seed, excludeIds = []) {
  const state = getState();
  const floor = state.floor;

  // Rarity weights by floor
  const commonW = Math.max(0.2, 0.7 - floor * 0.03);
  const uncommonW = Math.min(0.5, 0.2 + floor * 0.02);
  const rareW = Math.min(0.25, floor * 0.015);

  const weighted = [];
  RELIC_POOL.filter(r => r.rarity !== 'boss' && !excludeIds.includes(r.id)).forEach(r => {
    const w = r.rarity === 'common' ? commonW : r.rarity === 'uncommon' ? uncommonW : rareW;
    const count = Math.max(1, Math.round(w * 10));
    for (let i = 0; i < count; i++) weighted.push(r);
  });

  const shuffled = seededShuffle(weighted, seed);
  const seen = new Set();
  const picks = [];
  for (const r of shuffled) {
    if (!seen.has(r.id)) { seen.add(r.id); picks.push(r); }
    if (picks.length === 3) break;
  }
  return picks;
}

export function generateBossDraft() {
  return RELIC_POOL.filter(r => r.rarity === 'boss').slice(0, 3);
}

export function generateMixedDraft(seed, unlockedIds) {
  // After battle: pick between mech or relic offer
  const state = getState();
  const teamFull = state.team.length >= state.teamSize;
  if (teamFull) return { type: 'relic', options: generateRelicDraft(seed) };
  // 50/50 between mech and relic (relic if team full)
  const roll = (seed % 100);
  if (roll < 50) return { type: 'mech', options: generateMechDraft(seed, unlockedIds) };
  return { type: 'relic', options: generateRelicDraft(seed) };
}
