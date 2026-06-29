import { getPersistentData, loadPersistentData } from './state.js';

const KEY = 'mechforge_save';

export function saveGame() {
  try {
    localStorage.setItem(KEY, JSON.stringify(getPersistentData()));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) loadPersistentData(JSON.parse(raw));
  } catch (e) {
    console.warn('Load failed:', e);
  }
}
