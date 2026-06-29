// Run with: node generate-icons.js
// Generates icon-192.png and icon-512.png using canvas
const { createCanvas } = require('canvas');
const fs = require('fs');

function makeIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, size, size);

  // Outer ring
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
  ctx.stroke();

  // Hexagon (mech body)
  const r = size * 0.28;
  ctx.fillStyle = '#ff6b35';
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = size * 0.025;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI / 3) - Math.PI / 6;
    if (i === 0) ctx.moveTo(size / 2 + r * Math.cos(angle), size / 2 + r * Math.sin(angle));
    else ctx.lineTo(size / 2 + r * Math.cos(angle), size / 2 + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Center dot
  ctx.fillStyle = '#00d4ff';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  return c.toBuffer('image/png');
}

try {
  fs.writeFileSync('icon-192.png', makeIcon(192));
  fs.writeFileSync('icon-512.png', makeIcon(512));
  console.log('Icons generated!');
} catch (e) {
  console.log('canvas package not available — create icons manually or skip for dev');
}
