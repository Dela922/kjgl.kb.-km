// All screen renderers and input handlers.
import {
  drawShape, drawText, drawButton, drawPanel, drawHpBar,
  drawMechCard, drawRelicCard, drawGlow, drawText as txt, lighten
} from './canvas.js';
import { getState, setState, SCREEN } from './state.js';
import { sfx } from './audio.js';

// ─── Hit-test registry ───────────────────────────────────────────────────────
let _buttons = []; // { x, y, w, h, id, data }
export function clearButtons() { _buttons = []; }
export function registerButton(x, y, w, h, id, data = {}) {
  _buttons.push({ x, y, w, h, id, data });
}
export function hitTest(mx, my) {
  return _buttons.find(b => mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) || null;
}

// ─── Title Screen ─────────────────────────────────────────────────────────────
export function renderTitle(ctx, W, H, mouse) {
  clearButtons();
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  // Grid background
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Title
  drawText(ctx, 'MECH FORGE', W / 2, H * 0.22, { size: 36, color: '#00d4ff', align: 'center' });
  drawText(ctx, 'INFINITE', W / 2, H * 0.31, { size: 20, color: '#ff6b35', align: 'center' });
  drawText(ctx, '— ROGUELIKE AUTO-BATTLER —', W / 2, H * 0.38, { size: 11, color: '#555', align: 'center' });

  // Floating shapes decoration
  const t = Date.now() / 1000;
  const shapes = [['triangle', '#00d4ff', 0.15, 0.5], ['hexagon', '#ff6b35', 0.85, 0.48], ['diamond', '#cc44ff', 0.5, 0.6]];
  shapes.forEach(([s, c, rx, ry]) => {
    const y = H * ry + Math.sin(t + rx * 10) * 8;
    drawGlow(ctx, W * rx, y, 30, c);
    drawShape(ctx, s, W * rx, y, 28, c, 0.7);
  });

  const state = getState();
  const btnW = 200, btnH = 44;
  const cx = W / 2 - btnW / 2;

  const newHov = mouse && mouse.x >= cx && mouse.x <= cx + btnW && mouse.y >= H * 0.5 - btnH / 2 && mouse.y <= H * 0.5 + btnH / 2;
  drawButton(ctx, cx, H * 0.5 - btnH / 2, btnW, btnH, 'NEW RUN', newHov);
  registerButton(cx, H * 0.5 - btnH / 2, btnW, btnH, 'newRun');

  if (state.runsCompleted > 0) {
    const cont = H * 0.5 + 56;
    const cHov = mouse && mouse.x >= cx && mouse.x <= cx + btnW && mouse.y >= cont - btnH / 2 && mouse.y <= cont + btnH / 2;
    drawButton(ctx, cx, cont - btnH / 2, btnW, btnH, `ASCEND (${state.ascension})`, cHov, { color: '#ff6b35' });
    registerButton(cx, cont - btnH / 2, btnW, btnH, 'ascend');
  }

  const dailyY = H * 0.5 + (state.runsCompleted > 0 ? 116 : 56);
  const dHov = mouse && mouse.x >= cx && mouse.x <= cx + btnW && mouse.y >= dailyY - btnH / 2 && mouse.y <= dailyY + btnH / 2;
  drawButton(ctx, cx, dailyY - btnH / 2, btnW, btnH, 'DAILY CHALLENGE', dHov, { color: '#cc44ff' });
  registerButton(cx, dailyY - btnH / 2, btnW, btnH, 'daily');

  // Stats
  if (state.bestFloor > 0) {
    drawText(ctx, `Best: Floor ${state.bestFloor}  |  Runs: ${state.runsCompleted}  |  Kills: ${state.totalKills}`, W / 2, H * 0.88, { size: 11, color: '#444', align: 'center' });
  }
  drawText(ctx, 'PWA — Play Offline', W / 2, H * 0.94, { size: 10, color: '#333', align: 'center' });
}

// ─── Mode Select ──────────────────────────────────────────────────────────────
export function renderModeSelect(ctx, W, H, mouse) {
  clearButtons();
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  drawText(ctx, 'SELECT TEAM SIZE', W / 2, 60, { size: 20, color: '#00d4ff', align: 'center' });
  drawText(ctx, 'Choose how many mechs you can field in battle', W / 2, 85, { size: 11, color: '#555', align: 'center' });

  const modes = [
    { size: 3, label: '3 MECHS', sub: 'Fast & Focused', color: '#00ff88' },
    { size: 5, label: '5 MECHS', sub: 'Balanced', color: '#00d4ff' },
    { size: 7, label: '7 MECHS', sub: 'Grand Army', color: '#cc44ff' },
  ];

  const cardW = Math.min(160, (W - 60) / 3);
  const cardH = 180;
  const totalW = modes.length * cardW + (modes.length - 1) * 16;
  let sx = W / 2 - totalW / 2;
  const sy = H / 2 - cardH / 2;

  modes.forEach(m => {
    const hov = mouse && mouse.x >= sx && mouse.x <= sx + cardW && mouse.y >= sy && mouse.y <= sy + cardH;
    drawPanel(ctx, sx, sy, cardW, cardH, { bg: hov ? '#161622' : '#111118', border: hov ? m.color : '#334' });
    drawText(ctx, m.label, sx + cardW / 2, sy + 35, { size: 18, color: m.color, align: 'center' });
    const shapes = ['triangle', 'square', 'hexagon', 'diamond', 'octagon', 'circle', 'pentagon'];
    for (let i = 0; i < m.size; i++) {
      drawShape(ctx, shapes[i % shapes.length], sx + 20 + (i % Math.ceil(m.size / 2)) * 36, sy + 75 + Math.floor(i / Math.ceil(m.size / 2)) * 36, 26, m.color, 0.7);
    }
    drawText(ctx, m.sub, sx + cardW / 2, sy + cardH - 20, { size: 11, color: '#888', align: 'center' });
    registerButton(sx, sy, cardW, cardH, 'mode', { size: m.size });
    sx += cardW + 16;
  });

  drawText(ctx, 'Tap a mode to begin your run', W / 2, H - 40, { size: 11, color: '#444', align: 'center' });
}

// ─── Map Screen ───────────────────────────────────────────────────────────────
const NODE_ICONS = { battle: '⚔', elite: '💀', rest: '🔧', event: '?', shop: '🏪', boss: '☠' };
const NODE_COLORS = { battle: '#00d4ff', elite: '#ff6b35', rest: '#00ff88', event: '#cc44ff', shop: '#ffd700', boss: '#ff0055' };

export function renderMap(ctx, W, H, mouse) {
  clearButtons();
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  const state = getState();
  const { map, visitedNodes, floor, act, relics, gold } = state;
  if (!map) return;

  // Header
  drawPanel(ctx, 0, 0, W, 50, { bg: '#0a0a10', border: '#222' });
  drawText(ctx, `ACT ${act}`, 12, 30, { size: 14, color: '#00d4ff' });
  drawText(ctx, `FLOOR ${floor}`, W / 2, 30, { size: 14, color: '#888', align: 'center' });
  drawText(ctx, `RELICS: ${relics.length}`, W - 12, 30, { size: 12, color: '#cc44ff', align: 'right' });

  const ROWS = map.nodes.length;
  const mapTop = 60, mapBot = H - 80;
  const rowH = (mapBot - mapTop) / ROWS;

  // Compute reachable
  const reachable = state.visitedNodes.length === 0
    ? map.nodes[0].map(n => n.id)
    : map.edges.filter(e => visitedNodes.includes(e.from)).map(e => e.to);
  const reachableSet = new Set(reachable);

  // Draw edges
  map.edges.forEach(({ from, to }) => {
    const fn = map.nodes.flat().find(n => n.id === from);
    const tn = map.nodes.flat().find(n => n.id === to);
    if (!fn || !tn) return;
    const fx = nodeX(fn, map.nodes[fn.row].length, W);
    const fy = mapBot - fn.row * rowH - rowH / 2;
    const tx = nodeX(tn, map.nodes[tn.row].length, W);
    const ty = mapBot - tn.row * rowH - rowH / 2;
    ctx.strokeStyle = visitedNodes.includes(fn.id) ? '#334' : '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  });

  // Draw nodes
  map.nodes.flat().forEach(node => {
    const nx = nodeX(node, map.nodes[node.row].length, W);
    const ny = mapBot - node.row * rowH - rowH / 2;
    const r = 18;
    const visited = visitedNodes.includes(node.id);
    const reach = reachableSet.has(node.id);
    const color = NODE_COLORS[node.type] || '#888';

    if (reach) drawGlow(ctx, nx, ny, 28, color);

    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    ctx.fillStyle = visited ? '#0a0a0f' : reach ? color + '33' : '#111';
    ctx.fill();
    ctx.strokeStyle = visited ? '#333' : reach ? color : '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawText(ctx, NODE_ICONS[node.type] || '?', nx, ny + 6, { size: 14, color: visited ? '#333' : reach ? color : '#444', align: 'center' });

    if (reach) {
      const hov = mouse && Math.hypot(mouse.x - nx, mouse.y - ny) < r + 4;
      if (hov) drawText(ctx, node.type.toUpperCase(), nx, ny + r + 14, { size: 9, color, align: 'center' });
      registerButton(nx - r, ny - r, r * 2, r * 2, 'node', { nodeId: node.id, nodeType: node.type });
    }
  });

  // Team preview bar at bottom
  drawPanel(ctx, 0, H - 72, W, 72, { bg: '#0a0a10', border: '#222' });
  drawText(ctx, 'TEAM:', 10, H - 50, { size: 10, color: '#555' });
  state.team.forEach((m, i) => {
    const tx = 55 + i * 44;
    drawShape(ctx, m.shape, tx, H - 38, 28, m.color, 0.9);
    drawHpBar(ctx, tx - 14, H - 22, 28, 5, m.hp, m.maxHp);
  });
  for (let i = state.team.length; i < state.teamSize; i++) {
    const tx = 55 + i * 44;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx - 14, H - 52, 28, 28);
    drawText(ctx, '+', tx, H - 34, { size: 14, color: '#333', align: 'center' });
  }
}

function nodeX(node, rowCount, W) {
  if (rowCount === 1) return W / 2;
  const pad = 40;
  return pad + (node.col / (rowCount - 1)) * (W - pad * 2);
}

// ─── Battle Screen ────────────────────────────────────────────────────────────
export function renderBattle(ctx, W, H, battleAnim, mouse) {
  clearButtons();
  ctx.fillStyle = '#08080e';
  ctx.fillRect(0, 0, W, H);

  if (!battleAnim) return;
  const { playerTeam, enemyTeam, log, step, done, result } = battleAnim;

  // Header
  const nodeType = getState().currentNode?.type || 'battle';
  drawText(ctx, nodeType.toUpperCase(), W / 2, 24, { size: 13, color: NODE_COLORS[nodeType] || '#fff', align: 'center' });

  const midY = H / 2;

  // Enemy side (top)
  drawText(ctx, 'ENEMIES', W / 2, midY - 130, { size: 10, color: '#ff6b35', align: 'center' });
  drawTeamRow(ctx, enemyTeam, W, midY - 90, 'enemy', battleAnim);

  // Divider
  ctx.strokeStyle = '#223';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(20, midY); ctx.lineTo(W - 20, midY); ctx.stroke();
  ctx.setLineDash([]);

  // Player side (bottom)
  drawText(ctx, 'YOUR MECHS', W / 2, midY + 20, { size: 10, color: '#00d4ff', align: 'center' });
  drawTeamRow(ctx, playerTeam, W, midY + 60, 'player', battleAnim);

  // Battle log line
  const lastLog = log.slice(0, step).reverse().find(l => ['attack', 'death', 'heal', 'explosion', 'roundStart'].includes(l.type));
  if (lastLog) {
    let msg = '';
    if (lastLog.type === 'attack') msg = `Dealt ${lastLog.dmg} damage`;
    if (lastLog.type === 'death') msg = `Unit destroyed!`;
    if (lastLog.type === 'heal') msg = `Repaired ${lastLog.value} HP`;
    if (lastLog.type === 'explosion') msg = `Explosion: ${lastLog.dmg} dmg`;
    if (lastLog.type === 'roundStart') msg = `Round ${lastLog.round}`;
    drawText(ctx, msg, W / 2, H - 90, { size: 12, color: '#888', align: 'center' });
  }

  // Result overlay
  if (done) {
    ctx.fillStyle = result === 'win' ? '#00ff8833' : '#ff000022';
    ctx.fillRect(0, 0, W, H);
    drawText(ctx, result === 'win' ? 'VICTORY' : 'DEFEAT', W / 2, H / 2, { size: 32, color: result === 'win' ? '#00ff88' : '#ff3333', align: 'center' });

    const btnW = 180, btnH = 44;
    const bx = W / 2 - btnW / 2;
    const by = H / 2 + 50;
    const hov = mouse && mouse.x >= bx && mouse.x <= bx + btnW && mouse.y >= by && mouse.y <= by + btnH;
    drawButton(ctx, bx, by, btnW, btnH, result === 'win' ? 'CONTINUE' : 'RETURN TO MAP', hov, { color: result === 'win' ? '#00ff88' : '#ff3333' });
    registerButton(bx, by, btnW, btnH, result === 'win' ? 'battleWin' : 'battleLose');
  } else {
    // Speed controls
    drawText(ctx, '▶ AUTO-BATTLE', W / 2, H - 50, { size: 11, color: '#444', align: 'center' });
    const sbW = 100, sbH = 32, sbX = W / 2 - sbW / 2, sbY = H - 40;
    const hov = mouse && mouse.x >= sbX && mouse.x <= sbX + sbW && mouse.y >= sbY && mouse.y <= sbY + sbH;
    drawButton(ctx, sbX, sbY, sbW, sbH, 'SKIP', hov, { color: '#334', textColor: '#aaa' });
    registerButton(sbX, sbY, sbW, sbH, 'skipBattle');
  }
}

function drawTeamRow(ctx, team, W, centerY, side, battleAnim) {
  const count = team.length;
  if (!count) return;
  const unitW = 56, unitH = 80;
  const gap = 12;
  const totalW = count * unitW + (count - 1) * gap;
  let sx = W / 2 - totalW / 2;

  team.forEach((u, i) => {
    const dead = u.hp <= 0;
    const alpha = dead ? 0.2 : 1;
    const ux = sx + i * (unitW + gap) + unitW / 2;

    if (!dead) {
      // Flash on attack/hit
      const lastAttack = battleAnim?.log?.slice(0, battleAnim?.step).reverse()
        .find(l => (l.attackerId === u.uid || l.targetId === u.uid) && l.type === 'attack');
      if (lastAttack && battleAnim.step - battleAnim.log.indexOf(lastAttack) < 3) {
        drawGlow(ctx, ux, centerY, 30, lastAttack.attackerId === u.uid ? '#ff6b35' : '#ff0000');
      }
    }

    drawShape(ctx, u.shape, ux, centerY - 10, 40, u.color, alpha);
    drawHpBar(ctx, sx + i * (unitW + gap), centerY + 22, unitW, 6, u.hp, u.maxHp);
    drawText(ctx, `${u.hp}/${u.maxHp}`, ux, centerY + 38, { size: 9, color: dead ? '#333' : '#888', align: 'center' });
    if (!dead && u.armor > 0) {
      drawText(ctx, `🛡${u.armor}`, ux, centerY + 14, { size: 9, color: '#44aaff', align: 'center' });
    }
    drawText(ctx, u.name, ux, centerY + 50, { size: 8, color: dead ? '#333' : '#555', align: 'center' });
  });
}

// ─── Draft Screen ─────────────────────────────────────────────────────────────
export function renderDraft(ctx, W, H, mouse) {
  clearButtons();
  const state = getState();
  const draft = state.pendingDraft;
  if (!draft) return;

  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  const title = draft.type === 'mech' ? 'DRAFT A MECH' : 'ACQUIRE RELIC';
  const color = draft.type === 'mech' ? '#00d4ff' : '#cc44ff';
  drawText(ctx, title, W / 2, 50, { size: 18, color, align: 'center' });
  drawText(ctx, 'Pick 1 of 3', W / 2, 72, { size: 11, color: '#555', align: 'center' });

  const cardW = Math.min(160, (W - 60) / 3);
  const cardH = draft.type === 'mech' ? 170 : 140;
  const totalW = 3 * cardW + 2 * 16;
  let sx = W / 2 - totalW / 2;
  const sy = H / 2 - cardH / 2;

  draft.options.forEach((opt, i) => {
    const hov = mouse && mouse.x >= sx && mouse.x <= sx + cardW && mouse.y >= sy && mouse.y <= sy + cardH;
    if (draft.type === 'mech') drawMechCard(ctx, opt, sx, sy, cardW, cardH, false, hov);
    else drawRelicCard(ctx, opt, sx, sy, cardW, cardH, false, hov);
    registerButton(sx, sy, cardW, cardH, 'draftPick', { index: i, item: opt });
    sx += cardW + 16;
  });

  // Team sidebar
  if (state.team.length > 0) {
    drawText(ctx, 'CURRENT TEAM', W / 2, sy + cardH + 30, { size: 10, color: '#444', align: 'center' });
    state.team.forEach((m, i) => {
      const tx = W / 2 - (state.team.length * 40) / 2 + i * 40 + 20;
      drawShape(ctx, m.shape, tx, sy + cardH + 55, 28, m.color, 0.8);
    });
  }

  // Skip option for relics
  if (draft.type === 'relic') {
    const skipW = 120, skipH = 36;
    const skipX = W / 2 - skipW / 2, skipY = H - 60;
    const hov = mouse && mouse.x >= skipX && mouse.x <= skipX + skipW && mouse.y >= skipY && mouse.y <= skipY + skipH;
    drawButton(ctx, skipX, skipY, skipW, skipH, 'SKIP', hov, { color: '#333', textColor: '#888' });
    registerButton(skipX, skipY, skipW, skipH, 'draftSkip');
  }
}

// ─── Rest Screen ──────────────────────────────────────────────────────────────
export function renderRest(ctx, W, H, mouse) {
  clearButtons();
  const state = getState();
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  drawGlow(ctx, W / 2, H * 0.3, 60, '#00ff88');
  drawShape(ctx, 'circle', W / 2, H * 0.3, 60, '#00ff88', 0.5);
  drawText(ctx, '🔧 REPAIR BAY', W / 2, H * 0.18, { size: 18, color: '#00ff88', align: 'center' });
  drawText(ctx, 'Choose one action:', W / 2, H * 0.44, { size: 12, color: '#888', align: 'center' });

  const opts = [
    { id: 'restHeal', label: 'REPAIR ALL', sub: 'Restore all mechs to full HP', color: '#00ff88' },
    { id: 'restUpgrade', label: 'OVERCLOCK', sub: 'Upgrade one mech: +2 ATK +2 HP', color: '#ff9900' },
  ];

  const btnW = 220, btnH = 60, gap = 16;
  opts.forEach((o, i) => {
    const bx = W / 2 - btnW / 2;
    const by = H * 0.52 + i * (btnH + gap);
    const hov = mouse && mouse.x >= bx && mouse.x <= bx + btnW && mouse.y >= by && mouse.y <= by + btnH;
    drawPanel(ctx, bx, by, btnW, btnH, { bg: hov ? '#161622' : '#111118', border: o.color });
    drawText(ctx, o.label, bx + btnW / 2, by + 22, { size: 14, color: o.color, align: 'center' });
    drawText(ctx, o.sub, bx + btnW / 2, by + 42, { size: 10, color: '#666', align: 'center' });
    registerButton(bx, by, btnW, btnH, o.id);
  });
}

// ─── Event Screen ─────────────────────────────────────────────────────────────
const EVENTS = [
  {
    id: 'scrap_merchant',
    title: 'SCRAP MERCHANT',
    desc: 'A wandering trader offers you ancient tech salvage.',
    options: [
      { label: 'BUY RANDOM RELIC (3G)', id: 'eventBuyRelic', cost: 3 },
      { label: 'SELL MECH (+2G)', id: 'eventSellMech' },
      { label: 'LEAVE', id: 'eventLeave' },
    ]
  },
  {
    id: 'ancient_forge',
    title: 'ANCIENT FORGE',
    desc: 'An ancient factory hums with power.',
    options: [
      { label: 'UPGRADE MECH (+2ATK)', id: 'eventUpgradeAtk' },
      { label: 'REINFORCE (+3 ARMOR)', id: 'eventUpgradeArmor' },
      { label: 'LEAVE', id: 'eventLeave' },
    ]
  },
  {
    id: 'distress_signal',
    title: 'DISTRESS SIGNAL',
    desc: 'A damaged mech unit calls for rescue.',
    options: [
      { label: 'RESCUE (join team)', id: 'eventRescue' },
      { label: 'SALVAGE (+1G)', id: 'eventSalvage' },
      { label: 'IGNORE', id: 'eventLeave' },
    ]
  },
];

export function renderEvent(ctx, W, H, mouse, eventData) {
  clearButtons();
  const ev = eventData || EVENTS[0];
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  drawGlow(ctx, W / 2, H * 0.25, 50, '#cc44ff');
  drawShape(ctx, 'diamond', W / 2, H * 0.25, 50, '#cc44ff', 0.6);
  drawText(ctx, ev.title, W / 2, H * 0.14, { size: 16, color: '#cc44ff', align: 'center' });
  drawText(ctx, ev.desc, W / 2, H * 0.4, { size: 12, color: '#888', align: 'center' });

  ev.options.forEach((o, i) => {
    const bx = W / 2 - 130, by = H * 0.5 + i * 56, bw = 260, bh = 44;
    const hov = mouse && mouse.x >= bx && mouse.x <= bx + bw && mouse.y >= by && mouse.y <= by + bh;
    drawButton(ctx, bx, by, bw, bh, o.label, hov, { color: '#cc44ff', textColor: '#fff' });
    registerButton(bx, by, bw, bh, o.id, { ev, opt: o });
  });
}

// ─── Game Over / Victory ──────────────────────────────────────────────────────
export function renderGameOver(ctx, W, H, mouse, won) {
  clearButtons();
  const state = getState();
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  const col = won ? '#ffd700' : '#ff3333';
  drawGlow(ctx, W / 2, H * 0.35, 80, col);
  drawShape(ctx, won ? 'octagon' : 'triangle', W / 2, H * 0.35, 70, col, 0.7);
  drawText(ctx, won ? '☆ VICTORY ☆' : '✕ DEFEAT', W / 2, H * 0.18, { size: 24, color: col, align: 'center' });
  drawText(ctx, `Survived ${state.floor} floors`, W / 2, H * 0.54, { size: 14, color: '#888', align: 'center' });
  drawText(ctx, `Relics collected: ${state.relics.length}`, W / 2, H * 0.62, { size: 12, color: '#666', align: 'center' });

  const bx = W / 2 - 100, by = H * 0.72, bw = 200, bh = 44;
  const hov = mouse && mouse.x >= bx && mouse.x <= bx + bw && mouse.y >= by && mouse.y <= by + bh;
  drawButton(ctx, bx, by, bw, bh, 'MAIN MENU', hov, { color: col });
  registerButton(bx, by, bw, bh, 'mainMenu');
}

// ─── Relics HUD ───────────────────────────────────────────────────────────────
export function renderRelicsHud(ctx, W, H, mouse) {
  const state = getState();
  if (!state.relics.length) return;
  const size = 24, gap = 4, sx = W - 8;
  state.relics.forEach((r, i) => {
    const rx = sx - (i + 1) * (size + gap);
    const ry = H - size - 4;
    drawShape(ctx, r.shape, rx + size / 2, ry + size / 2, size, r.color, 0.9);
    const hov = mouse && mouse.x >= rx && mouse.x <= rx + size && mouse.y >= ry && mouse.y <= ry + size;
    if (hov) {
      drawPanel(ctx, rx - 80, ry - 50, 180, 44, { bg: '#111', border: '#555' });
      drawText(ctx, r.name, rx - 80 + 90, ry - 34, { size: 11, color: '#fff', align: 'center' });
      drawText(ctx, r.desc.slice(0, 30) + '…', rx - 80 + 90, ry - 18, { size: 9, color: '#aaa', align: 'center' });
    }
  });
}
