// Generates a branching Slay the Spire-style map.
// Each act has ROWS rows, each row has 1-4 nodes.
// NODE TYPES: 'battle' | 'elite' | 'rest' | 'event' | 'shop' | 'boss'

const NODE_TYPES = ['battle', 'battle', 'battle', 'elite', 'rest', 'event', 'shop'];

function rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateAct(actNum, seed) {
  const rand = seededRand(seed + actNum * 999);
  const ROWS = 8;
  const nodes = [];

  // Row 0 = entry, Row ROWS-1 = boss
  for (let row = 0; row < ROWS; row++) {
    const count = row === 0 || row === ROWS - 1 ? 1 : Math.floor(rand() * 3) + 1;
    const rowNodes = [];
    for (let col = 0; col < count; col++) {
      let type;
      if (row === ROWS - 1) type = 'boss';
      else if (row === 0) type = 'battle';
      else if (row === Math.floor(ROWS / 2)) type = rnd(['rest', 'shop']);
      else type = rnd(NODE_TYPES);

      rowNodes.push({ row, col, type, id: `${actNum}-${row}-${col}`, visited: false, reachable: row === 0 });
    }
    nodes.push(rowNodes);
  }

  // Build connections: each node connects to 1-2 nodes in next row
  const edges = [];
  for (let row = 0; row < ROWS - 1; row++) {
    const curr = nodes[row];
    const next = nodes[row + 1];
    // Ensure every next-row node is reachable from at least one current node
    const connected = new Set();
    curr.forEach((n, ci) => {
      const targets = next.filter((_, ni) =>
        Math.abs(ni / (next.length - 1 || 1) - ci / (curr.length - 1 || 1)) <= 0.6
      );
      const pick = targets.length ? targets : [next[0]];
      const t = pick[Math.floor(rand() * pick.length)];
      edges.push({ from: n.id, to: t.id });
      connected.add(t.id);
      // Sometimes add a second edge
      if (rand() < 0.35 && pick.length > 1) {
        const t2 = pick.find(p => p.id !== t.id);
        if (t2) { edges.push({ from: n.id, to: t2.id }); connected.add(t2.id); }
      }
    });
    // Fill unreachable nodes
    next.forEach(n => {
      if (!connected.has(n.id)) {
        const src = curr[Math.floor(rand() * curr.length)];
        edges.push({ from: src.id, to: n.id });
      }
    });
  }

  return { nodes, edges, actNum };
}

export function getReachableNodes(map, visitedIds) {
  if (visitedIds.length === 0) return map.nodes[0].map(n => n.id);
  const reachable = new Set();
  visitedIds.forEach(vid => {
    map.edges.filter(e => e.from === vid).forEach(e => reachable.add(e.to));
  });
  return [...reachable];
}
