// All canvas drawing primitives and shape renderers.

export function drawShape(ctx, shape, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = lighten(color, 40);
  ctx.lineWidth = 2;
  ctx.beginPath();

  switch (shape) {
    case 'circle':
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(x - size / 2, y - size / 2, size, size);
      break;
    case 'triangle':
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x + size / 2, y + size / 2);
      ctx.lineTo(x - size / 2, y + size / 2);
      ctx.closePath();
      break;
    case 'diamond':
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x + size / 2, y);
      ctx.lineTo(x, y + size / 2);
      ctx.lineTo(x - size / 2, y);
      ctx.closePath();
      break;
    case 'hexagon':
      polygon(ctx, x, y, size / 2, 6);
      break;
    case 'pentagon':
      polygon(ctx, x, y, size / 2, 5);
      break;
    case 'octagon':
      polygon(ctx, x, y, size / 2, 8);
      break;
    default:
      ctx.rect(x - size / 2, y - size / 2, size, size);
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function polygon(ctx, cx, cy, r, sides) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    else ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
}

export function drawHpBar(ctx, x, y, w, h, current, max, color = '#00ff88') {
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, w, h);
  const pct = Math.max(0, current / max);
  ctx.fillStyle = pct > 0.5 ? color : pct > 0.25 ? '#ffaa00' : '#ff3333';
  ctx.fillRect(x, y, w * pct, h);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

export function drawArmorBar(ctx, x, y, w, h, armor) {
  if (armor <= 0) return;
  ctx.fillStyle = '#4488aa';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#00aaff';
  ctx.font = `${h}px monospace`;
  ctx.fillText(`🛡${armor}`, x + 2, y + h - 1);
}

export function drawText(ctx, text, x, y, opts = {}) {
  const { size = 14, color = '#fff', align = 'left', font = 'monospace', alpha = 1 } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawButton(ctx, x, y, w, h, label, hovered = false, opts = {}) {
  const { color = '#00d4ff', textColor = '#0a0a0f', size = 13 } = opts;
  ctx.fillStyle = hovered ? lighten(color, 30) : color;
  ctx.strokeStyle = lighten(color, 60);
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 5);
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function drawPanel(ctx, x, y, w, h, opts = {}) {
  const { bg = '#111118', border = '#334', radius = 8 } = opts;
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.stroke();
}

export function lighten(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

export function drawGlow(ctx, x, y, r, color) {
  const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
  grd.addColorStop(0, color + 'aa');
  grd.addColorStop(1, color + '00');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Draw a mech card (for draft/team display)
export function drawMechCard(ctx, mech, x, y, w, h, selected = false, hovered = false) {
  const bg = selected ? '#1a2a3a' : hovered ? '#161622' : '#111118';
  const border = selected ? '#00d4ff' : hovered ? '#334' : '#223';
  drawPanel(ctx, x, y, w, h, { bg, border });

  // Shape
  drawShape(ctx, mech.shape, x + w / 2, y + 40, 44, mech.color);

  // Tier stars
  const stars = '★'.repeat(mech.tier) + '☆'.repeat(3 - mech.tier);
  drawText(ctx, stars, x + w / 2, y + 16, { size: 11, color: '#ffd700', align: 'center' });

  // Name
  drawText(ctx, mech.name, x + w / 2, y + 78, { size: 12, color: '#fff', align: 'center' });

  // Stats
  const statY = y + 96;
  drawText(ctx, `⚔${mech.atk}`, x + 8, statY, { size: 11, color: '#ff6b35' });
  drawText(ctx, `❤${mech.maxHp || mech.hp}`, x + w / 2, statY, { size: 11, color: '#00ff88', align: 'center' });
  drawText(ctx, `🛡${mech.armor}`, x + w - 8, statY, { size: 11, color: '#44aaff', align: 'right' });

  // Description (wrap)
  const words = mech.desc.split(' ');
  let line = '';
  let lineY = y + 115;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    ctx.font = '10px monospace';
    if (ctx.measureText(test).width > w - 12 && line) {
      drawText(ctx, line, x + w / 2, lineY, { size: 10, color: '#aaa', align: 'center' });
      line = word;
      lineY += 13;
    } else {
      line = test;
    }
  }
  if (line) drawText(ctx, line, x + w / 2, lineY, { size: 10, color: '#aaa', align: 'center' });
}

// Draw a relic card
export function drawRelicCard(ctx, relic, x, y, w, h, selected = false, hovered = false) {
  const rarityColor = { common: '#888', uncommon: '#00ff88', rare: '#cc44ff', boss: '#ffd700' }[relic.rarity] || '#888';
  const bg = selected ? '#1a2040' : hovered ? '#161630' : '#111118';
  drawPanel(ctx, x, y, w, h, { bg, border: rarityColor });

  drawShape(ctx, relic.shape, x + w / 2, y + 38, 40, relic.color);
  drawText(ctx, relic.rarity.toUpperCase(), x + w / 2, y + 16, { size: 9, color: rarityColor, align: 'center' });
  drawText(ctx, relic.name, x + w / 2, y + 72, { size: 11, color: '#fff', align: 'center' });

  const words = relic.desc.split(' ');
  let line = '';
  let lineY = y + 90;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    ctx.font = '10px monospace';
    if (ctx.measureText(test).width > w - 12 && line) {
      drawText(ctx, line, x + w / 2, lineY, { size: 10, color: '#aaa', align: 'center' });
      line = word;
      lineY += 13;
    } else {
      line = test;
    }
  }
  if (line) drawText(ctx, line, x + w / 2, lineY, { size: 10, color: '#aaa', align: 'center' });
}
