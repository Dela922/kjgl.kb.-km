// All mech definitions. Shape = geometry drawn on canvas.
export const MECH_POOL = [
  // TIER 1 — Common
  {
    id: 'scout',
    name: 'Scout',
    tier: 1,
    shape: 'triangle',
    color: '#00d4ff',
    baseAtk: 3, baseHp: 8, baseArmor: 0, baseSpd: 2,
    desc: 'Fast attacker. Attacks first each round.',
    ability: { trigger: 'onRoundStart', effect: 'attackFirst' },
    unlocked: true,
  },
  {
    id: 'tank',
    name: 'Tank',
    tier: 1,
    shape: 'hexagon',
    color: '#888',
    baseAtk: 2, baseHp: 18, baseArmor: 3, baseSpd: 1,
    desc: 'Absorbs damage for allies. Taunts enemies.',
    ability: { trigger: 'passive', effect: 'taunt' },
    unlocked: true,
  },
  {
    id: 'gunner',
    name: 'Gunner',
    tier: 1,
    shape: 'square',
    color: '#ff6b35',
    baseAtk: 5, baseHp: 10, baseArmor: 0, baseSpd: 1,
    desc: 'High damage. On kill, attacks again immediately.',
    ability: { trigger: 'onKill', effect: 'bonusAttack' },
    unlocked: true,
  },
  {
    id: 'medic',
    name: 'Medic',
    tier: 1,
    shape: 'circle',
    color: '#00ff88',
    baseAtk: 1, baseHp: 12, baseArmor: 1, baseSpd: 1,
    desc: 'Heals the lowest-HP ally for 3 HP each round.',
    ability: { trigger: 'onRoundEnd', effect: 'healLowest', value: 3 },
    unlocked: true,
  },
  {
    id: 'shielder',
    name: 'Shielder',
    tier: 1,
    shape: 'pentagon',
    color: '#ffd700',
    baseAtk: 2, baseHp: 14, baseArmor: 5, baseSpd: 1,
    desc: 'On hurt, gains +1 armor permanently.',
    ability: { trigger: 'onHurt', effect: 'gainArmor', value: 1 },
    unlocked: true,
  },

  // TIER 2 — Uncommon
  {
    id: 'hacker',
    name: 'Hacker',
    tier: 2,
    shape: 'diamond',
    color: '#cc44ff',
    baseAtk: 3, baseHp: 11, baseArmor: 0, baseSpd: 1,
    desc: 'On attack, reduces enemy armor by 2.',
    ability: { trigger: 'onAttack', effect: 'shredArmor', value: 2 },
    unlocked: false,
  },
  {
    id: 'bomber',
    name: 'Bomber',
    tier: 2,
    shape: 'octagon',
    color: '#ff3366',
    baseAtk: 4, baseHp: 9, baseArmor: 0, baseSpd: 1,
    desc: 'On death, deals 6 damage to all enemies.',
    ability: { trigger: 'onDeath', effect: 'explosion', value: 6 },
    unlocked: false,
  },
  {
    id: 'sniper',
    name: 'Sniper',
    tier: 2,
    shape: 'triangle',
    color: '#ff9900',
    baseAtk: 8, baseHp: 8, baseArmor: 0, baseSpd: 1,
    desc: 'Attacks the lowest-HP enemy instead of front.',
    ability: { trigger: 'passive', effect: 'targetLowestHp' },
    unlocked: false,
  },
  {
    id: 'shield_drone',
    name: 'Shield Drone',
    tier: 2,
    shape: 'circle',
    color: '#44aaff',
    baseAtk: 1, baseHp: 6, baseArmor: 0, baseSpd: 1,
    desc: 'At start of battle, grants all allies +3 armor.',
    ability: { trigger: 'onBattleStart', effect: 'giveTeamArmor', value: 3 },
    unlocked: false,
  },

  // TIER 3 — Rare
  {
    id: 'titan',
    name: 'Titan',
    tier: 3,
    shape: 'hexagon',
    color: '#ff2200',
    baseAtk: 8, baseHp: 30, baseArmor: 6, baseSpd: 1,
    desc: 'Immovable. Gains +2 ATK each round it survives.',
    ability: { trigger: 'onRoundEnd', effect: 'gainAtk', value: 2 },
    unlocked: false,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    tier: 3,
    shape: 'diamond',
    color: '#aa00ff',
    baseAtk: 6, baseHp: 10, baseArmor: 0, baseSpd: 3,
    desc: 'Attacks twice. 30% chance to dodge each hit.',
    ability: { trigger: 'passive', effect: 'doubleAttackDodge', dodgeChance: 0.3 },
    unlocked: false,
  },
  {
    id: 'core',
    name: 'Core',
    tier: 3,
    shape: 'octagon',
    color: '#00ffff',
    baseAtk: 4, baseHp: 20, baseArmor: 4, baseSpd: 1,
    desc: 'Each turn, copies the highest ATK among allies to itself.',
    ability: { trigger: 'onRoundStart', effect: 'copyHighestAtk' },
    unlocked: false,
  },
];

export function getMechById(id) {
  return MECH_POOL.find(m => m.id === id);
}

export function getUnlockedMechs() {
  return MECH_POOL.filter(m => m.unlocked);
}

export function createMechInstance(mechDef, level = 1) {
  return {
    id: mechDef.id,
    name: mechDef.name,
    tier: mechDef.tier,
    shape: mechDef.shape,
    color: mechDef.color,
    atk: mechDef.baseAtk,
    maxHp: mechDef.baseHp,
    hp: mechDef.baseHp,
    armor: mechDef.baseArmor,
    spd: mechDef.baseSpd,
    desc: mechDef.desc,
    ability: { ...mechDef.ability },
    level,
    uid: Math.random().toString(36).slice(2),
  };
}
