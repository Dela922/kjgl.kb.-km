// Main game loop and input handling.
import { loadGame, saveGame } from './save.js';
import { getState, setState, startRun, SCREEN, visitNode, addMechToTeam, addRelic, nextAct } from './state.js';
import { generateMixedDraft, generateBossDraft, generateMechDraft, generateRelicDraft } from './draft.js';
import { runBattle } from './battle.js';
import { generateEncounter } from './enemies.js';
import { createMechInstance, getMechById, MECH_POOL } from './mechs.js';
import { RELIC_POOL } from './relics.js';
import { sfx } from './audio.js';
import {
  renderTitle, renderModeSelect, renderMap, renderBattle,
  renderDraft, renderRest, renderEvent, renderGameOver, renderRelicsHud,
  hitTest, EVENTS
} from './ui.js';

// ─── Canvas setup ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.min(window.innerWidth, 480);
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener('resize', resize);

function W() { return canvas.width / (window.devicePixelRatio || 1); }
function H() { return canvas.height / (window.devicePixelRatio || 1); }

// ─── Mouse / Touch ───────────────────────────────────────────────────────────
let mouse = { x: 0, y: 0 };

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return { x: src.clientX - rect.left, y: src.clientY - rect.top };
}

canvas.addEventListener('mousemove', e => { mouse = getPos(e); });
canvas.addEventListener('touchmove', e => { e.preventDefault(); mouse = getPos(e); }, { passive: false });
canvas.addEventListener('click', e => handleClick(getPos(e)));
canvas.addEventListener('touchend', e => { e.preventDefault(); handleClick(getPos(e)); }, { passive: false });

// ─── Battle animation state ───────────────────────────────────────────────────
let battleAnim = null;
let battleTimer = null;
const BATTLE_STEP_MS = 350;

function startBattleAnim(playerTeam, enemies) {
  const state = getState();
  const result = runBattle(playerTeam, enemies, state.relics);
  battleAnim = {
    playerTeam: [...playerTeam],
    enemyTeam: [...enemies],
    log: result.log,
    step: 0,
    done: false,
    result: result.result,
    finalSurvivors: result.survivors,
  };

  // Advance through log
  function tick() {
    if (!battleAnim || battleAnim.done) return;
    battleAnim.step++;
    const entry = battleAnim.log[battleAnim.step - 1];
    if (entry) {
      // Apply state changes to live team copies
      applyLogEntry(entry);
      // SFX
      if (entry.type === 'attack') sfx.attack();
      if (entry.type === 'death') sfx.death();
      if (entry.type === 'heal') sfx.heal();
      if (entry.type === 'explosion') sfx.explosion();
      if (entry.type === 'relic') sfx.relic();
    }
    if (battleAnim.step >= battleAnim.log.length) {
      battleAnim.done = true;
      if (battleAnim.result === 'win') sfx.win();
      else sfx.lose();
      return;
    }
    battleTimer = setTimeout(tick, BATTLE_STEP_MS);
  }
  battleTimer = setTimeout(tick, 300);
}

function applyLogEntry(entry) {
  if (!battleAnim) return;
  if (entry.type === 'roundEnd') {
    battleAnim.playerTeam = entry.playerTeam;
    battleAnim.enemyTeam = entry.enemyTeam;
  }
}

function skipBattle() {
  if (battleTimer) clearTimeout(battleTimer);
  if (battleAnim) {
    // Fast-forward to end
    battleAnim.log.forEach(e => applyLogEntry(e));
    battleAnim.step = battleAnim.log.length;
    battleAnim.done = true;
    if (battleAnim.result === 'win') sfx.win();
    else sfx.lose();
  }
}

// ─── Event state ─────────────────────────────────────────────────────────────
let currentEvent = null;
let restUpgradeMode = false; // true = waiting to pick mech to upgrade

// ─── Click handler ───────────────────────────────────────────────────────────
function handleClick(pos) {
  const btn = hitTest(pos.x, pos.y);
  if (!btn) return;
  sfx.select();
  const state = getState();

  switch (btn.id) {
    // Title
    case 'newRun': setState({ screen: SCREEN.MODE_SELECT }); break;
    case 'ascend': {
      const newAsc = state.ascension + 1;
      setState({ ascension: newAsc });
      setState({ screen: SCREEN.MODE_SELECT });
      break;
    }
    case 'daily': {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      startRun(5, parseInt(today));
      break;
    }

    // Mode select
    case 'mode': {
      startRun(btn.data.size);
      openFirstDraft();
      break;
    }

    // Map
    case 'node': {
      visitNode(btn.data.nodeId);
      const nodeType = btn.data.nodeType;
      if (nodeType === 'battle' || nodeType === 'elite' || nodeType === 'boss') {
        const floor = getState().floor;
        const enemies = generateEncounter(Math.ceil(floor / 2), nodeType);
        startBattleAnim(getState().team, enemies);
        setState({ screen: SCREEN.BATTLE, _currentEnemies: enemies });
      } else if (nodeType === 'rest') {
        setState({ screen: SCREEN.REST });
      } else if (nodeType === 'event') {
        currentEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        setState({ screen: SCREEN.EVENT });
      } else if (nodeType === 'shop') {
        openShopDraft();
      }
      break;
    }

    // Battle
    case 'skipBattle': skipBattle(); break;
    case 'battleWin': {
      // Post-battle: update survivors, then draft
      const survivors = battleAnim.finalSurvivors;
      const newTeam = state.team.map(m => {
        const s = survivors.find(s => s.uid === m.uid);
        return s ? { ...m, hp: s.hp, armor: s.armor, atk: s.atk } : { ...m, hp: 0 };
      });
      setState({ team: newTeam });

      // Win relic stacks
      state.relics.forEach(r => {
        if (r.effect?.type === 'winStackBoth') {
          const updated = newTeam.map(m => ({ ...m, atk: m.atk + r.effect.value, armor: m.armor + r.effect.value }));
          setState({ team: updated });
        }
      });

      // Check if boss floor → next act or victory
      if (state.currentNode?.type === 'boss') {
        if (state.act >= 3) {
          state.runsCompleted++;
          saveGame();
          setState({ screen: SCREEN.VICTORY });
          return;
        }
        nextAct();
        // Boss relic
        setState({ pendingDraft: { type: 'relic', options: generateBossDraft() } });
        setState({ screen: SCREEN.DRAFT });
        return;
      }

      openPostBattleDraft();
      battleAnim = null;
      break;
    }
    case 'battleLose': {
      setState({ screen: SCREEN.GAME_OVER });
      saveGame();
      battleAnim = null;
      break;
    }

    // Draft
    case 'draftPick': {
      const draft = state.pendingDraft;
      const item = btn.data.item;
      if (draft.type === 'mech') {
        if (state.team.length < state.teamSize) {
          addMechToTeam(item);
        } else {
          // Replace mode: replace the first dead mech, else skip
          const deadIdx = state.team.findIndex(m => m.hp <= 0);
          if (deadIdx >= 0) {
            const team = [...state.team];
            team[deadIdx] = { ...item, hp: item.maxHp };
            setState({ team });
          }
        }
      } else {
        addRelic(item);
      }
      saveGame();
      returnToMap();
      break;
    }
    case 'draftSkip': returnToMap(); break;

    // Rest
    case 'restHeal': {
      const healed = state.team.map(m => ({ ...m, hp: m.maxHp }));
      setState({ team: healed, screen: SCREEN.MAP });
      break;
    }
    case 'restUpgrade': setState({ screen: SCREEN.REST, _restUpgradeMode: true }); break;

    // Event
    case 'eventLeave': returnToMap(); break;
    case 'eventBuyRelic': {
      if (state.gold >= 3) {
        const relic = RELIC_POOL[Math.floor(Math.random() * RELIC_POOL.length)];
        addRelic(relic);
        setState({ gold: state.gold - 3 });
      }
      returnToMap();
      break;
    }
    case 'eventSalvage': setState({ gold: state.gold + 1 }); returnToMap(); break;
    case 'eventRescue': {
      const unlocked = state.unlockedMechs;
      const m = getMechById(unlocked[Math.floor(Math.random() * unlocked.length)]);
      if (m) addMechToTeam(createMechInstance(m));
      returnToMap();
      break;
    }
    case 'eventUpgradeAtk': {
      const team = state.team.map((m, i) => i === 0 ? { ...m, atk: m.atk + 2 } : m);
      setState({ team });
      returnToMap();
      break;
    }
    case 'eventUpgradeArmor': {
      const team = state.team.map((m, i) => i === 0 ? { ...m, armor: m.armor + 3 } : m);
      setState({ team });
      returnToMap();
      break;
    }

    // Game over
    case 'mainMenu': setState({ screen: SCREEN.TITLE }); break;
  }
}

function openFirstDraft() {
  const state = getState();
  const opts = generateMechDraft(Date.now(), state.unlockedMechs);
  setState({ pendingDraft: { type: 'mech', options: opts }, screen: SCREEN.DRAFT });
}

function openPostBattleDraft() {
  const state = getState();
  const seed = Date.now() + state.floor;
  const draft = generateMixedDraft(seed, state.unlockedMechs);
  setState({ pendingDraft: draft, screen: SCREEN.DRAFT });
}

function openShopDraft() {
  const state = getState();
  const seed = Date.now() + state.floor;
  const draft = generateMixedDraft(seed, state.unlockedMechs);
  setState({ pendingDraft: draft, screen: SCREEN.DRAFT });
}

function returnToMap() {
  setState({ screen: SCREEN.MAP, pendingDraft: null });
}

// ─── Main render loop ─────────────────────────────────────────────────────────
function render() {
  const state = getState();
  const w = W(), h = H();

  switch (state.screen) {
    case SCREEN.TITLE: renderTitle(ctx, w, h, mouse); break;
    case SCREEN.MODE_SELECT: renderModeSelect(ctx, w, h, mouse); break;
    case SCREEN.MAP:
      renderMap(ctx, w, h, mouse);
      renderRelicsHud(ctx, w, h, mouse);
      break;
    case SCREEN.BATTLE:
      renderBattle(ctx, w, h, battleAnim, mouse);
      renderRelicsHud(ctx, w, h, mouse);
      break;
    case SCREEN.DRAFT: renderDraft(ctx, w, h, mouse); break;
    case SCREEN.REST: renderRest(ctx, w, h, mouse); break;
    case SCREEN.EVENT: renderEvent(ctx, w, h, mouse, currentEvent); break;
    case SCREEN.GAME_OVER: renderGameOver(ctx, w, h, mouse, false); break;
    case SCREEN.VICTORY: renderGameOver(ctx, w, h, mouse, true); break;
  }

  requestAnimationFrame(render);
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
loadGame();
render();

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(console.warn);
}
