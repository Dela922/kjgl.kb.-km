// Central game state — single source of truth.
import { generateAct, getReachableNodes } from './map.js';

export const SCREEN = {
  TITLE: 'title',
  MODE_SELECT: 'modeSelect',
  MAP: 'map',
  BATTLE: 'battle',
  DRAFT: 'draft',
  REST: 'rest',
  EVENT: 'event',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
  UNLOCK: 'unlock',
};

const DEFAULT_STATE = {
  screen: SCREEN.TITLE,
  teamSize: 5,
  team: [],          // array of mech instances
  relics: [],        // array of relic defs (with possible .used flag)
  gold: 0,
  floor: 0,
  act: 1,
  map: null,
  visitedNodes: [],
  currentNode: null,
  pendingDraft: null,  // { options: [], type: 'mech'|'relic', context }
  battleResult: null,
  runSeed: 0,
  // Persistence
  ascension: 0,
  dailySeed: null,
  bestFloor: 0,
  unlockedMechs: ['scout', 'tank', 'gunner', 'medic', 'shielder'],
  totalKills: 0,
  runsCompleted: 0,
};

let state = { ...DEFAULT_STATE };

export function getState() { return state; }

export function setState(partial) {
  state = { ...state, ...partial };
}

export function startRun(teamSize, seed = null) {
  const runSeed = seed || Date.now();
  const map = generateAct(1, runSeed);
  state = {
    ...DEFAULT_STATE,
    screen: SCREEN.MAP,
    teamSize,
    team: [],
    relics: [],
    gold: 3,
    floor: 0,
    act: 1,
    map,
    visitedNodes: [],
    currentNode: null,
    runSeed,
    // Carry over persistent data
    ascension: state.ascension,
    dailySeed: state.dailySeed,
    bestFloor: state.bestFloor,
    unlockedMechs: state.unlockedMechs,
    totalKills: state.totalKills,
    runsCompleted: state.runsCompleted,
  };
}

export function getReachable() {
  if (!state.map) return [];
  return getReachableNodes(state.map, state.visitedNodes);
}

export function visitNode(nodeId) {
  state.visitedNodes = [...state.visitedNodes, nodeId];
  // Find the node
  const node = state.map.nodes.flat().find(n => n.id === nodeId);
  state.currentNode = node;
  state.floor++;
  if (state.floor > state.bestFloor) state.bestFloor = state.floor;
}

export function addMechToTeam(mech) {
  if (state.team.length < state.teamSize) {
    state.team = [...state.team, mech];
    return true;
  }
  return false;
}

export function replaceMech(index, mech) {
  const team = [...state.team];
  team[index] = mech;
  state.team = team;
}

export function addRelic(relic) {
  state.relics = [...state.relics, { ...relic }];
}

export function addGold(amount) {
  state.gold = Math.max(0, state.gold + amount);
}

export function nextAct() {
  state.act++;
  const map = generateAct(state.act, state.runSeed);
  state.map = map;
  state.visitedNodes = [];
  state.currentNode = null;
}

// Unlocks
export function unlockMech(id) {
  if (!state.unlockedMechs.includes(id)) {
    state.unlockedMechs = [...state.unlockedMechs, id];
  }
}

export function incrementKills(count) {
  state.totalKills += count;
}

export function completeRun() {
  state.runsCompleted++;
  state.screen = SCREEN.VICTORY;
}

// Persistence helpers (called by save.js)
export function getPersistentData() {
  return {
    ascension: state.ascension,
    bestFloor: state.bestFloor,
    unlockedMechs: state.unlockedMechs,
    totalKills: state.totalKills,
    runsCompleted: state.runsCompleted,
  };
}

export function loadPersistentData(data) {
  if (!data) return;
  state.ascension = data.ascension ?? 0;
  state.bestFloor = data.bestFloor ?? 0;
  state.unlockedMechs = data.unlockedMechs ?? DEFAULT_STATE.unlockedMechs;
  state.totalKills = data.totalKills ?? 0;
  state.runsCompleted = data.runsCompleted ?? 0;
}
