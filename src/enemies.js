// Enemy definitions scaled by floor depth.
export const ENEMY_TYPES = [
  // Basic
  { id: 'rust_bot', name: 'Rust Bot', shape: 'square', color: '#996633', atk: 3, hp: 10, armor: 0 },
  { id: 'spike_drone', name: 'Spike Drone', shape: 'triangle', color: '#cc3300', atk: 5, hp: 7, armor: 0 },
  { id: 'shield_unit', name: 'Shield Unit', shape: 'hexagon', color: '#6688aa', atk: 2, hp: 14, armor: 4 },
  { id: 'scrambler', name: 'Scrambler', shape: 'diamond', color: '#aa44aa', atk: 4, hp: 9, armor: 1 },
  // Advanced (floor 3+)
  { id: 'war_frame', name: 'War Frame', shape: 'octagon', color: '#ff4400', atk: 6, hp: 18, armor: 3, minFloor: 3 },
  { id: 'nano_swarm', name: 'Nano Swarm', shape: 'circle', color: '#44ff88', atk: 2, hp: 6, armor: 0, count: 3, minFloor: 2 },
  { id: 'pulse_cannon', name: 'Pulse Cannon', shape: 'square', color: '#0044ff', atk: 8, hp: 12, armor: 2, minFloor: 4 },
  // Elites
  { id: 'apex_hunter', name: 'Apex Hunter', shape: 'triangle', color: '#ff0066', atk: 9, hp: 20, armor: 2, elite: true },
  { id: 'siege_mech', name: 'Siege Mech', shape: 'hexagon', color: '#888844', atk: 5, hp: 35, armor: 6, elite: true },
  // Bosses
  { id: 'forge_lord', name: 'Forge Lord', shape: 'octagon', color: '#ff2200', atk: 10, hp: 60, armor: 8, boss: true },
  { id: 'null_core', name: 'Null Core', shape: 'circle', color: '#ffffff', atk: 12, hp: 50, armor: 4, boss: true },
  { id: 'infinity_engine', name: 'Infinity Engine', shape: 'hexagon', color: '#aa00ff', atk: 15, hp: 80, armor: 10, boss: true },
];

export function scaleEnemy(def, floor) {
  const scale = 1 + floor * 0.15;
  return {
    ...def,
    atk: Math.round(def.atk * scale),
    hp: Math.round(def.hp * scale),
    maxHp: Math.round(def.hp * scale),
    armor: Math.round(def.armor * scale),
    uid: Math.random().toString(36).slice(2),
  };
}

export function generateEncounter(floor, nodeType) {
  const basics = ENEMY_TYPES.filter(e => !e.elite && !e.boss && (e.minFloor === undefined || floor >= e.minFloor));
  const elites = ENEMY_TYPES.filter(e => e.elite);
  const bosses = ENEMY_TYPES.filter(e => e.boss);

  if (nodeType === 'boss') {
    const boss = bosses[Math.floor(floor / 5) % bosses.length] || bosses[0];
    return [scaleEnemy(boss, floor)];
  }
  if (nodeType === 'elite') {
    const count = floor < 3 ? 1 : 2;
    return Array.from({ length: count }, () => {
      const e = elites[Math.floor(Math.random() * elites.length)];
      return scaleEnemy(e, floor);
    });
  }
  // Normal battle: 1-3 enemies based on floor
  const count = Math.min(1 + Math.floor(floor / 2), 3);
  return Array.from({ length: count }, () => {
    const e = basics[Math.floor(Math.random() * basics.length)];
    return scaleEnemy(e, floor);
  });
}
