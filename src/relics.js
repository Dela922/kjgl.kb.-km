// Relics are passive bonuses kept for the entire run (like STR relics in Slay the Spire).
export const RELIC_POOL = [
  // ATK relics
  {
    id: 'power_core',
    name: 'Power Core',
    rarity: 'common',
    color: '#ff6b35',
    shape: 'square',
    desc: 'All mechs start battle with +2 ATK.',
    effect: { type: 'allAtk', value: 2 },
  },
  {
    id: 'overclock',
    name: 'Overclock',
    rarity: 'uncommon',
    color: '#ff9900',
    shape: 'triangle',
    desc: 'First mech to attack each battle deals double damage.',
    effect: { type: 'firstAttackDouble' },
  },
  {
    id: 'targeting_ai',
    name: 'Targeting AI',
    rarity: 'uncommon',
    color: '#ff3366',
    shape: 'diamond',
    desc: 'All mechs deal +1 damage per enemy killed this run.',
    effect: { type: 'killsStackAtk', value: 1 },
  },

  // DEF relics
  {
    id: 'alloy_plating',
    name: 'Alloy Plating',
    rarity: 'common',
    color: '#888',
    shape: 'hexagon',
    desc: 'All mechs start with +3 armor.',
    effect: { type: 'allArmor', value: 3 },
  },
  {
    id: 'repair_nanobots',
    name: 'Repair Nanobots',
    rarity: 'uncommon',
    color: '#00ff88',
    shape: 'circle',
    desc: 'All mechs regen 1 HP per round in battle.',
    effect: { type: 'allRegen', value: 1 },
  },
  {
    id: 'bulwark_protocol',
    name: 'Bulwark Protocol',
    rarity: 'rare',
    color: '#ffd700',
    shape: 'pentagon',
    desc: 'When any mech dies, all remaining allies gain +4 armor.',
    effect: { type: 'onAllyDeathArmor', value: 4 },
  },

  // HP relics
  {
    id: 'overcharge_cell',
    name: 'Overcharge Cell',
    rarity: 'common',
    color: '#44aaff',
    shape: 'circle',
    desc: 'All mechs start battle with +5 max HP.',
    effect: { type: 'allMaxHp', value: 5 },
  },
  {
    id: 'revival_chip',
    name: 'Revival Chip',
    rarity: 'rare',
    color: '#cc44ff',
    shape: 'octagon',
    desc: 'Once per battle, the first mech to die is revived with 3 HP.',
    effect: { type: 'oneRevive', value: 3 },
  },

  // Economy relics
  {
    id: 'salvage_protocol',
    name: 'Salvage Protocol',
    rarity: 'common',
    color: '#ffd700',
    shape: 'square',
    desc: 'Gain 1 extra gold at every shop.',
    effect: { type: 'extraGold', value: 1 },
  },

  // Special relics
  {
    id: 'clone_matrix',
    name: 'Clone Matrix',
    rarity: 'rare',
    color: '#00ffff',
    shape: 'hexagon',
    desc: 'At battle start, create a 1 HP copy of your highest ATK mech.',
    effect: { type: 'cloneTopAtk' },
  },
  {
    id: 'quantum_link',
    name: 'Quantum Link',
    rarity: 'rare',
    color: '#aa00ff',
    shape: 'diamond',
    desc: 'When any mech attacks, all other mechs deal 1 bonus damage.',
    effect: { type: 'echoDamage', value: 1 },
  },
  {
    id: 'fusion_reactor',
    name: 'Fusion Reactor',
    rarity: 'boss',
    color: '#ff0055',
    shape: 'octagon',
    desc: 'All mechs gain +1 ATK and +1 armor after each battle won.',
    effect: { type: 'winStackBoth', value: 1 },
  },
  {
    id: 'overclock_omega',
    name: 'Overclock Ω',
    rarity: 'boss',
    color: '#ffffff',
    shape: 'triangle',
    desc: 'All mechs attack twice per round.',
    effect: { type: 'allDoubleAttack' },
  },
];

export function getRelicById(id) {
  return RELIC_POOL.find(r => r.id === id);
}

export function getRelicsByRarity(rarity) {
  return RELIC_POOL.filter(r => r.rarity === rarity);
}
