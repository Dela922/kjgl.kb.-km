// Procedural audio using Web Audio API — no files needed.
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep(freq, duration, type = 'square', vol = 0.1) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (e) { /* audio not available */ }
}

export const sfx = {
  attack: () => beep(220, 0.08, 'sawtooth', 0.08),
  hit: () => beep(150, 0.12, 'square', 0.06),
  death: () => { beep(100, 0.3, 'sawtooth', 0.1); beep(80, 0.4, 'sawtooth', 0.05); },
  heal: () => beep(440, 0.15, 'sine', 0.06),
  relic: () => beep(660, 0.2, 'sine', 0.08),
  win: () => { beep(523, 0.15, 'sine', 0.1); setTimeout(() => beep(659, 0.15, 'sine', 0.1), 150); setTimeout(() => beep(784, 0.3, 'sine', 0.1), 300); },
  lose: () => { beep(300, 0.3, 'sawtooth', 0.08); setTimeout(() => beep(200, 0.5, 'sawtooth', 0.08), 300); },
  select: () => beep(440, 0.05, 'sine', 0.05),
  explosion: () => { beep(60, 0.4, 'sawtooth', 0.15); },
};
