// Turn-based auto-battle engine (Super Auto Pets style).
// Returns a battle log of steps for animation.

function deepClone(arr) {
  return arr.map(u => ({ ...u, ability: { ...u.ability } }));
}

function applyDamage(unit, rawDmg) {
  const absorbed = Math.min(unit.armor, rawDmg);
  unit.hp -= (rawDmg - absorbed);
  if (unit.hp < 0) unit.hp = 0;
}

function isDead(unit) { return unit.hp <= 0; }

function getTarget(attackers, enemies, ability) {
  if (ability?.effect === 'targetLowestHp') {
    return enemies.filter(e => !isDead(e)).sort((a, b) => a.hp - b.hp)[0];
  }
  return enemies.filter(e => !isDead(e))[0]; // front
}

export function runBattle(playerTeamRaw, enemyTeamRaw, relics) {
  const log = [];
  let players = deepClone(playerTeamRaw);
  let enemies = deepClone(enemyTeamRaw);

  // Apply relic pre-battle effects
  applyRelicsBattleStart(players, enemies, relics, log);

  const MAX_ROUNDS = 40;
  let round = 0;

  while (round < MAX_ROUNDS) {
    round++;
    log.push({ type: 'roundStart', round });

    // Round start abilities
    [...players, ...enemies].forEach(u => {
      if (!isDead(u) && u.ability?.trigger === 'onRoundStart') {
        handleAbility(u, players, enemies, relics, log, 'player');
      }
    });

    // Determine attack order by speed (highest first), then player first
    const allUnits = [
      ...players.filter(u => !isDead(u)).map(u => ({ u, side: 'player' })),
      ...enemies.filter(u => !isDead(u)).map(u => ({ u, side: 'enemy' })),
    ].sort((a, b) => (b.u.spd || 1) - (a.u.spd || 1));

    for (const { u, side } of allUnits) {
      if (isDead(u)) continue;
      const foes = side === 'player' ? enemies : players;
      const allies = side === 'player' ? players : enemies;
      const attacks = (relics.some(r => r.effect?.type === 'allDoubleAttack') || u.ability?.effect === 'doubleAttackDodge') ? 2 : 1;

      for (let i = 0; i < attacks; i++) {
        const target = getTarget(allies, foes, u.ability);
        if (!target) break;

        // Dodge check
        if (u.ability?.effect === 'doubleAttackDodge' && Math.random() < (u.ability.dodgeChance || 0.3)) {
          log.push({ type: 'dodge', uid: target.uid });
          continue;
        }

        let dmg = u.atk;
        // Overclock relic: first attack doubles
        if (relics.some(r => r.effect?.type === 'firstAttackDouble') && round === 1 && i === 0 && side === 'player') {
          dmg *= 2;
          log.push({ type: 'relic', relicId: 'overclock' });
        }

        applyDamage(target, dmg);
        log.push({ type: 'attack', attackerId: u.uid, targetId: target.uid, dmg, targetHp: target.hp });

        // Echo damage relic
        if (side === 'player' && relics.some(r => r.effect?.type === 'echoDamage')) {
          const echoVal = relics.find(r => r.effect?.type === 'echoDamage').effect.value;
          allies.filter(a => a.uid !== u.uid && !isDead(a)).forEach(ally => {
            const echoTarget = getTarget(allies, foes, null);
            if (echoTarget) {
              applyDamage(echoTarget, echoVal);
              log.push({ type: 'echo', sourceId: ally.uid, targetId: echoTarget.uid, dmg: echoVal });
            }
          });
        }

        // On attack: hacker ability
        if (u.ability?.trigger === 'onAttack' && u.ability?.effect === 'shredArmor') {
          target.armor = Math.max(0, target.armor - u.ability.value);
          log.push({ type: 'abilityFire', uid: u.uid, effect: 'shredArmor', targetId: target.uid });
        }

        // On hurt ability
        if (!isDead(target) && target.ability?.trigger === 'onHurt') {
          if (target.ability.effect === 'gainArmor') {
            target.armor += target.ability.value;
            log.push({ type: 'abilityFire', uid: target.uid, effect: 'gainArmor' });
          }
        }

        // Kill check
        if (isDead(target)) {
          log.push({ type: 'death', uid: target.uid, side: side === 'player' ? 'enemy' : 'player' });

          // On kill: gunner bonus attack
          if (u.ability?.trigger === 'onKill' && u.ability?.effect === 'bonusAttack') {
            const next = getTarget(allies, foes, null);
            if (next) {
              applyDamage(next, u.atk);
              log.push({ type: 'attack', attackerId: u.uid, targetId: next.uid, dmg: u.atk, targetHp: next.hp, bonus: true });
              if (isDead(next)) log.push({ type: 'death', uid: next.uid, side: side === 'player' ? 'enemy' : 'player' });
            }
          }

          // On death: bomber
          if (target.ability?.trigger === 'onDeath' && target.ability?.effect === 'explosion') {
            foes.filter(f => !isDead(f)).forEach(f => {
              applyDamage(f, target.ability.value);
              log.push({ type: 'explosion', sourceId: target.uid, targetId: f.uid, dmg: target.ability.value });
            });
          }

          // On ally death: bulwark relic
          if (side === 'enemy') {
            const bulwark = relics.find(r => r.effect?.type === 'onAllyDeathArmor');
            if (bulwark) {
              players.filter(p => !isDead(p)).forEach(p => { p.armor += bulwark.effect.value; });
              log.push({ type: 'relic', relicId: 'bulwark_protocol' });
            }
          }

          // Kill stacks ATK relic
          if (side === 'player') {
            const ksa = relics.find(r => r.effect?.type === 'killsStackAtk');
            if (ksa) {
              players.forEach(p => { p.atk += ksa.effect.value; });
            }
          }
        }
      }
    }

    // Round end
    // Regen
    const regen = relics.find(r => r.effect?.type === 'allRegen');
    if (regen) {
      players.filter(p => !isDead(p)).forEach(p => {
        p.hp = Math.min(p.maxHp, p.hp + regen.effect.value);
      });
    }

    // Medic
    players.filter(p => !isDead(p) && p.ability?.trigger === 'onRoundEnd' && p.ability?.effect === 'healLowest').forEach(med => {
      const lowest = players.filter(p => !isDead(p)).sort((a, b) => a.hp - b.hp)[0];
      if (lowest) {
        lowest.hp = Math.min(lowest.maxHp, lowest.hp + med.ability.value);
        log.push({ type: 'heal', targetId: lowest.uid, value: med.ability.value });
      }
    });

    // Titan gain atk
    players.filter(p => !isDead(p) && p.ability?.trigger === 'onRoundEnd' && p.ability?.effect === 'gainAtk').forEach(t => {
      t.atk += t.ability.value;
      log.push({ type: 'abilityFire', uid: t.uid, effect: 'gainAtk' });
    });

    log.push({ type: 'roundEnd', round, playerTeam: deepClone(players), enemyTeam: deepClone(enemies) });

    const playersAlive = players.some(p => !isDead(p));
    const enemiesAlive = enemies.some(e => !isDead(e));

    if (!playersAlive || !enemiesAlive) break;
  }

  const playersAlive = players.some(p => !isDead(p));
  const result = playersAlive ? 'win' : 'lose';
  log.push({ type: 'battleEnd', result, survivors: players.filter(p => !isDead(p)) });

  return { log, result, survivors: players.filter(p => !isDead(p)) };
}

function applyRelicsBattleStart(players, enemies, relics, log) {
  relics.forEach(r => {
    const e = r.effect;
    if (!e) return;
    if (e.type === 'allAtk') players.forEach(p => { p.atk += e.value; });
    if (e.type === 'allArmor') players.forEach(p => { p.armor += e.value; });
    if (e.type === 'allMaxHp') players.forEach(p => { p.maxHp += e.value; p.hp += e.value; });
    if (e.type === 'giveTeamArmor') players.forEach(p => { p.armor += e.value; });
    if (e.type === 'cloneTopAtk') {
      const top = [...players].sort((a, b) => b.atk - a.atk)[0];
      if (top) {
        players.push({ ...top, hp: 1, maxHp: 1, uid: 'clone-' + top.uid });
        log.push({ type: 'relic', relicId: 'clone_matrix' });
      }
    }
  });

  // Battle start abilities
  players.filter(p => p.ability?.trigger === 'onBattleStart').forEach(p => {
    if (p.ability.effect === 'giveTeamArmor') {
      players.forEach(ally => { ally.armor += p.ability.value; });
      log.push({ type: 'abilityFire', uid: p.uid, effect: 'giveTeamArmor' });
    }
  });

  // Revival chip — track usage
  const revival = relics.find(r => r.effect?.type === 'oneRevive');
  if (revival) revival.used = false;
}
