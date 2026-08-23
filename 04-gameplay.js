const routeMinimapEl = document.getElementById("routeMinimap");
const routeGraphEl = document.getElementById("routeGraph");

// First authored five-stage graph prototype.
// Each node may have 1, 2, or 3 exits. A run still plays one room per stage.
const routeSectionOne = {
  start: "1A",
  nodes: {
    "1A": { stage:1, x:50, type:"standard", exits:["2A","2B"] },

    "2A": { stage:2, x:27, type:"hard", exits:["3A"] },
    "2B": { stage:2, x:73, type:"treasure", exits:["3B","3C"] },

    "3A": { stage:3, x:18, type:"standard", exits:["4A","4B","4C"] },
    "3B": { stage:3, x:52, type:"hard", exits:["4B"] },
    "3C": { stage:3, x:82, type:"standard", exits:["4B","4C"] },

    "4A": { stage:4, x:16, type:"hard", exits:["5A"] },
    "4B": { stage:4, x:50, type:"standard", exits:["5A"] },
    "4C": { stage:4, x:84, type:"treasure", exits:["5A"] },

    "5A": { stage:5, x:50, type:"boss", label:"HERMAN", exits:[] }
  }
};

let routeGraphState = {
  currentNodeId: "1A",
  visited: ["1A"]
};

function routeTypeLabel(type) {
  const labels = {
    standard:"STANDARD",
    battle:"STANDARD",
    hard:"HARD",
    treasure:"TREASURE",
    shop:"SHOP",
    boss:"BOSS"
  };
  return labels[type] || String(type || "?").toUpperCase();
}

function graphNodeY(stage) {
  // Stage 1 at bottom, Stage 5 at top.
  return 91 - ((stage - 1) * 20.5);
}

function createRouteEdge(from, to, active=false) {
  const x1=from.x, y1=graphNodeY(from.stage);
  const x2=to.x, y2=graphNodeY(to.stage);
  const graph=routeGraphEl;
  const w=graph.clientWidth || 320;
  const h=graph.clientHeight || 245;
  const ax=x1/100*w, ay=y1/100*h;
  const bx=x2/100*w, by=y2/100*h;
  const dx=bx-ax, dy=by-ay;
  const len=Math.sqrt(dx*dx+dy*dy);
  const angle=Math.atan2(dy,dx)*180/Math.PI;
  const edge=document.createElement("div");
  edge.className=`routeEdge${active ? " edge-active" : ""}`;
  edge.style.left=`${x1}%`;
  edge.style.top=`${y1}%`;
  edge.style.width=`${len}px`;
  edge.style.transform=`rotate(${angle}deg)`;
  graph.appendChild(edge);
}

function routeNodeState(id, node, current, choices) {
  if (id === current) return "state-current";
  if (choices.includes(id)) return "state-choice";
  if (routeGraphState.visited.includes(id)) return "state-past";
  if (node.stage > routeSectionOne.nodes[current].stage) return "state-future";
  return "state-locked";
}

function renderRouteGraph() {
  if (!routeGraphEl) return;
  routeGraphEl.innerHTML="";

  const nodes=routeSectionOne.nodes;
  const current=routeGraphState.currentNodeId;
  const currentNode=nodes[current] || nodes["1A"];
  const choices=currentNode.exits || [];

  // Draw all connections first.
  Object.entries(nodes).forEach(([id,node]) => {
    node.exits.forEach(nextId => {
      const next=nodes[nextId];
      if (!next) return;
      createRouteEdge(node,next,id===current && choices.includes(nextId));
    });
  });

  // Draw nodes.
  Object.entries(nodes).forEach(([id,node]) => {
    const el=document.createElement("div");
    const state=routeNodeState(id,node,current,choices);
    el.className=`graphNode type-${node.type} ${state}`;
    el.style.left=`${node.x}%`;
    el.style.top=`${graphNodeY(node.stage)}%`;
    el.dataset.nodeId=id;
    el.innerHTML=node.type==="boss"
      ? `5<small>${node.label || "BOSS"}</small>`
      : `${node.stage}<small>${routeTypeLabel(node.type)}</small>`;
    routeGraphEl.appendChild(el);

    if (choices.includes(id)) {
      const tag=document.createElement("div");
      tag.className="graphChoiceTag";
      tag.style.left=`${node.x}%`;
      tag.style.top=`${graphNodeY(node.stage)+8}%`;
      tag.textContent=routeTypeLabel(node.type);
      routeGraphEl.appendChild(tag);
    }
  });
}

function syncGraphChoicesToDoors() {
  const current=routeSectionOne.nodes[routeGraphState.currentNodeId];
  if (!current) return;

  const choices=current.exits || [];
  if (choices.length < 1) return;

  // Existing gameplay currently supports left/right physical doors.
  // For 3-way graph nodes, the center option is represented by a third
  // on-screen choice and is selectable by walking centrally; this prototype
  // preserves left/right compatibility while we test the graph structure.
  const leftNode=routeSectionOne.nodes[choices[0]];
  const rightNode=routeSectionOne.nodes[choices[choices.length-1]];

  if (leftNode) exitChoice.leftType=leftNode.type;
  if (rightNode) exitChoice.rightType=rightNode.type;

  exitChoice.graphChoices=choices.slice();
}

function showRouteMinimap() {
  if (!routeMinimapEl) return;
  syncGraphChoicesToDoors();
  renderRouteGraph();
  routeMinimapEl.classList.remove("hidden");
}

function hideRouteMinimap() {
  if (routeMinimapEl) routeMinimapEl.classList.add("hidden");
}

function advanceRouteGraph(chosenType) {
  const current=routeSectionOne.nodes[routeGraphState.currentNodeId];
  if (!current) return;

  const choices=current.exits || [];
  let nextId=choices.find(id => routeSectionOne.nodes[id]?.type===chosenType);

  // If two exits share a type or route state is unusual, use side semantics.
  if (!nextId && choices.length) nextId=choices[0];
  if (!nextId) return;

  routeGraphState.currentNodeId=nextId;
  if (!routeGraphState.visited.includes(nextId)) {
    routeGraphState.visited.push(nextId);
  }
}

function beginExitChoice() {
  if (roomNumber === 4) {
    hideRouteMinimap();
    exitChoice.active=false; exitChoice.chosen="boss"; pathHintEl.classList.add("hidden");
    pendingRoomType="boss"; currentRoomType="boss"; roomNumber=5;
    startRoom(); return;
  }

  gameState = "exitChoice";
  exitChoice.active = true;
  player.x = WORLD_WIDTH / 2;
  exitChoice.heroX = WORLD_WIDTH / 2;
  exitChoice.heroY = 1110;
  exitChoice.facing = player.facing || 1;
  exitChoice.hopTimer = 0.45;
  exitChoice.chosen = null;

  const routeSets = [
    ["standard", "hard"],
    ["standard", "treasure"],
    ["hard", "treasure"]
  ];
  const pair = routeSets[Math.floor(Math.random() * routeSets.length)];
  exitChoice.leftType = pair[0];
  exitChoice.rightType = pair[1];
  showRouteMinimap();
  pathHintEl.classList.remove("hidden");
}

function updateExitChoice(dt) {
  if (gameState !== "exitChoice") return;
  let moveX = 0, moveY = 0;
  if (keys["arrowleft"] || keys["a"]) moveX -= 1;
  if (keys["arrowright"] || keys["d"]) moveX += 1;
  if (keys["arrowup"] || keys["w"]) moveY -= 1;
  if (keys["arrowdown"] || keys["s"]) moveY += 1;

  if (pointerActive) {
    const dx = pointerX - exitChoice.heroX;
    const dy = pointerY - exitChoice.heroY;
    if (Math.abs(dx) > 10) moveX = Math.max(-1, Math.min(1, dx / 100));
    if (Math.abs(dy) > 10) moveY = Math.max(-1, Math.min(1, dy / 100));
  }
  if (moveX !== 0) exitChoice.facing = moveX > 0 ? 1 : -1;
  if (exitChoice.hopTimer > 0) { exitChoice.hopTimer -= dt; return; }
  const len = Math.hypot(moveX, moveY);
  if (len > 1) { moveX /= len; moveY /= len; }
  exitChoice.heroX += moveX * exitChoice.speed * dt;
  exitChoice.heroY += moveY * exitChoice.speed * dt;
  exitChoice.heroX = Math.max(exitChoice.minX, Math.min(exitChoice.maxX, exitChoice.heroX));
  exitChoice.heroY = Math.max(exitChoice.minY, Math.min(exitChoice.maxY, exitChoice.heroY));

  const doorY = 810, doorW = 205, doorH = 300, r = 28;
  const lx = 35, rx = WORLD_WIDTH - 35 - doorW;
  const inDoor = (x,y) => exitChoice.heroX + r > x && exitChoice.heroX - r < x + doorW && exitChoice.heroY + r > y && exitChoice.heroY - r < y + doorH;
  if (inDoor(lx, doorY)) commitExitDoor("left");
  else if (inDoor(rx, doorY)) commitExitDoor("right");
}

function commitExitDoor(side) {
  if (gameState !== "exitChoice" || exitChoice.chosen) return;

  const type =
    side === "left"
      ? exitChoice.leftType
      : exitChoice.rightType;

  if (!type) {
    console.warn("Exit door had no assigned route type:", side);
    return;
  }

  chooseDungeonExit(type);
}

function chooseDungeonExit(type) {
  if (gameState !== "exitChoice" || exitChoice.chosen) return;

  const normalizedType =
    type === "battle"
      ? "standard"
      : type;

  exitChoice.chosen = normalizedType;
  advanceRouteGraph(normalizedType);
  exitChoice.active = false;
  hideRouteMinimap();
  pathHintEl.classList.add("hidden");

  if (normalizedType === "shop") {
    pendingRoomType = "standard";
    openShop();
    return;
  }

  pendingRoomType = normalizedType;
  currentRoomType = normalizedType;
  roomNumber += 1;

  console.log(
    `ENTERING ${normalizedType.toUpperCase()} ROUTE — ROOM ${roomNumber}`
  );

  startRoom();
}

function updatePlayer(dt) {
  if (gameState === "exitChoice" || gameState === "postRewardShake") {
    player.velocityX = 0;
    return;
  }

  let move = 0;

  if (player.stunTimer > 0) {
    player.stunTimer = Math.max(0, player.stunTimer - dt);
  }

  if (player.stunTimer <= 0) {
    if (keys["arrowleft"] || keys["a"]) move -= 1;
    if (keys["arrowright"] || keys["d"]) move += 1;

    if (
      pointerActive &&
      gameState !== "upgrade" &&
      gameState !== "shop"
    ) {
      const difference = pointerX - player.x;

      if (Math.abs(difference) > 10) {
        move = Math.max(-1, Math.min(1, difference / 120));
      }
    }
  }

  if (player.slowTimer > 0) {
    player.slowTimer -= dt;

    const slowByStack = [1, 0.70, 0.40, 0.10];

    player.slowMultiplier =
      slowByStack[
        Math.min(3, player.slowStacks || 0)
      ];

    if (player.slowTimer <= 0) {
      player.slowStacks = 0;
      player.slowMultiplier = 1;
    }
  } else {
    player.slowStacks = 0;
    player.slowMultiplier = 1;
  }

  player.velocityX =
    move *
    player.speed *
    player.runSpeedMultiplier *
    player.slowMultiplier;

  player.x += player.velocityX * dt;

  const halfWidth = player.width / 2;

  player.x =
    Math.max(
      halfWidth + 30,
      Math.min(
        WORLD_WIDTH - halfWidth - 30,
        player.x
      )
    );

  if (Math.abs(player.velocityX) > 5) {
    player.facing =
      player.velocityX > 0 ? 1 : -1;

    player.runTimer +=
      dt *
      Math.abs(player.velocityX) /
      80;
  }

  if (player.invincibleTimer > 0) {
    player.invincibleTimer -= dt;
  }

  if (shieldShatterTimer > 0) {
    shieldShatterTimer -= dt;
  }

  if (
    (!ball.launched && gameState === "waiting") ||
    ballStuck
  ) {
    ball.x = player.x;
    ball.y = player.y - 58;
  }

  if (ballStuck) {
    stuckTimer -= dt;

    if (stuckTimer <= 0) {
      launchBall();
    }
  }
}

function updateBall(dt) {
  if (!ball.launched || ballStuck || gameState !== "playing") return;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.radius < 25) {
    ball.x = 25 + ball.radius;
    ball.vx = Math.abs(ball.vx);
  }

  if (ball.x + ball.radius > WORLD_WIDTH - 25) {
    ball.x = WORLD_WIDTH - 25 - ball.radius;
    ball.vx = -Math.abs(ball.vx);
  }

  if (ball.y - ball.radius < 120) {
    ball.y = 120 + ball.radius;
    ball.vy = Math.abs(ball.vy);
  }

  if (ball.y > WORLD_HEIGHT + 50) {
    loseBall();
    return;
  }

  checkPaddleCollision();
  checkBrickCollisions();
}

function checkPaddleCollision() {
  if (ball.vy <= 0) return;

  const left = player.x - player.width / 2;
  const right = player.x + player.width / 2;
  const top = player.y - player.height / 2;
  const bottom = player.y + player.height / 2;

  if (
    ball.x + ball.radius > left &&
    ball.x - ball.radius < right &&
    ball.y + ball.radius > top &&
    ball.y - ball.radius < bottom
  ) {
    resetHitCombo();
    ball.pierceDamageRemaining = 0;
    ball.y = top - ball.radius;

    if (glueArmed) {
      glueArmed = false;
      ballStuck = true;
      ball.launched = false;
      ball.vx = 0;
      ball.vy = 0;
      stuckTimer = 3;
      messageEl.style.display = "block";
      messageEl.textContent = "BALL GLUED — TAP / SPACE TO LAUNCH";
      updateGlueButton();
      return;
    }

    const relativeHit = (ball.x - player.x) / (player.width / 2);
    const maxAngle = Math.PI * 0.38;
    const angle = relativeHit * maxAngle;

    ball.vx = Math.sin(angle) * ball.speed * ball.equipmentSpeedMultiplier * ball.runSpeedMultiplier;
    ball.vy = -Math.cos(angle) * ball.speed * ball.equipmentSpeedMultiplier * ball.runSpeedMultiplier;

    playHitSound();
    createParticles(ball.x, ball.y, 8, "#f7d98a");
  }
}

function checkBrickCollisions() {
  for (const brick of bricks) {
    if (!brick.alive) continue;

    // Art contains a small amount of transparent padding. Use an inset
    // collision face so the visible Ball actually reaches the visible block.
    const insetX = Math.max(3, brick.width * 0.045);
    const insetY = Math.max(2, brick.height * 0.055);

    const left = brick.x + insetX;
    const right = brick.x + brick.width - insetX;
    const top = brick.y + insetY;
    const bottom = brick.y + brick.height - insetY;

    if (
      ball.x + ball.radius > left &&
      ball.x - ball.radius < right &&
      ball.y + ball.radius > top &&
      ball.y - ball.radius < bottom
    ) {
      const equippedPiercing =
        progression.equipment.ball === "piercing";

      const baseHitDamage =
        ball.damage *
        ball.baseDamageMultiplier *
        ball.equipmentDamageMultiplier *
        ball.runDamageMultiplier;

      let damageToApply = baseHitDamage;

      if (equippedPiercing) {
        if (ball.pierceDamageRemaining <= 0) {
          ball.pierceDamageRemaining = baseHitDamage;
        }

        damageToApply = ball.pierceDamageRemaining;
      }

      const hpBefore =
        brick.hp +
        (brick.raiderBoss ? brick.armor : 0);

      damageBrick(
        brick,
        damageToApply,
        "ball"
      );

      if (equippedPiercing) {
        ball.pierceDamageRemaining =
          Math.max(
            0,
            damageToApply - hpBefore
          );

        if (
          !brick.alive &&
          ball.pierceDamageRemaining > 0
        ) {
          // Piercing only passes through a target that was actually destroyed.
          continue;
        }

        ball.pierceDamageRemaining = 0;
      }

      const overlapLeft =
        ball.x + ball.radius - left;
      const overlapRight =
        right - (ball.x - ball.radius);
      const overlapTop =
        ball.y + ball.radius - top;
      const overlapBottom =
        bottom - (ball.y - ball.radius);

      const minOverlap =
        Math.min(
          overlapLeft,
          overlapRight,
          overlapTop,
          overlapBottom
        );

      if (
        minOverlap === overlapLeft ||
        minOverlap === overlapRight
      ) {
        ball.vx *= -1;
      } else {
        ball.vy *= -1;
      }

      break;
    }
  }
}

function damageBrick(brick, overrideDamage = null, source = "ball") {
  if (!brick || !brick.alive) return;

  playHitSound();

  const isBallDamage = source === "ball";

  // Ball combo XP is separate from class weapon damage.
  if (isBallDamage) {
    registerComboHit();
  }

  let hitDamage =
    overrideDamage !== null
      ? overrideDamage
      : ball.damage *
        ball.baseDamageMultiplier *
        ball.equipmentDamageMultiplier *
        ball.runDamageMultiplier;

  const ballHasFire =
    isBallDamage &&
    (
      progression.equipment.ball === "cinder"
    );

  if (brick.iceGoblin && ballHasFire) {
    hitDamage *= 2;
  }

  // Armor is universal defense; both Ball and weapon damage can break it.
  if (brick.raiderBoss && brick.armor > 0) {
    const absorbed = Math.min(brick.armor, hitDamage);
    brick.armor -= absorbed;
    hitDamage -= absorbed;

    if (absorbed > 0) {
      const shownArmor =
        Number.isInteger(absorbed)
          ? absorbed
          : Math.round(absorbed * 10) / 10;

      createFloatingText(
        brick.x + brick.width / 2,
        brick.y - 18,
        `-${shownArmor} ARMOR`,
        "#c4c9cf"
      );
    }

    createFloatingText(
      brick.x + brick.width / 2,
      brick.y - 8,
      brick.armor > 0 ? "ARMOR" : "ARMOR BROKEN!",
      "#d7c8a8"
    );

    if (hitDamage <= 0) {
      brick.hitFlash = 0.12;
      updateBossHUD(brick);
      return;
    }
  }

  brick.hp -= hitDamage;
  brick.hitFlash = 0.12;

  if (brick.isMob && hitDamage > 0) {
    const shownDamage =
      Number.isInteger(hitDamage)
        ? hitDamage
        : Math.round(hitDamage * 10) / 10;

    createFloatingText(
      brick.x + brick.width / 2,
      brick.y + 6,
      `-${shownDamage}`,
      source === "weapon"
        ? "#f3e2a6"
        : source === "splash"
          ? "#ff9d62"
          : "#ffffff"
    );
  }

  // Ball-only elemental/equipment effects.
  if (ballHasFire) {
    fireExplosion(
      brick.x + brick.width / 2,
      brick.y + brick.height / 2,
      brick
    );
  }

  createParticles(
    brick.x + brick.width / 2,
    brick.y + brick.height / 2,
    10,
    brick.isMob ? "#c8f07a" : "#b9a991"
  );

  if (brick.hp <= 0) {
    brick.hp = 0;
    brick.alive = false;

    if (brick.isMob) {
      spawnMobXP(brick);
    }

    if (!brick.isMob) {
      trySpawnBrickReward(brick);
    }



    createParticles(
      brick.x + brick.width / 2,
      brick.y + brick.height / 2,
      24,
      brick.isMob ? "#d8ff8a" : "#c2ad90"
    );

    checkVictory();
  }

  if (brick.raiderBoss) updateBossHUD(brick);
  updateHUD();
}

function createSplashEffect(x,y,element="fire",scale=1){
  const filters={fire:"hue-rotate(0deg) saturate(1.7) brightness(1.2)",ice:"hue-rotate(155deg) saturate(1.5) brightness(1.2)",poison:"hue-rotate(75deg) saturate(1.8)",arcane:"hue-rotate(245deg) saturate(1.7)"};
  splashEffects.push({x,y,age:0,duration:.28,scale,filter:filters[element]||filters.fire});
}
function updateSplashEffects(dt){
  for(let i=splashEffects.length-1;i>=0;i--){splashEffects[i].age+=dt;if(splashEffects[i].age>=splashEffects[i].duration)splashEffects.splice(i,1);}
}
function drawSplashEffects(){
  if(!splashImage.complete||!splashImage.naturalWidth)return;
  for(const fx of splashEffects){
    const t=fx.age/fx.duration,size=(50+105*(1-Math.pow(1-t,3)))*fx.scale;
    ctx.save();ctx.globalAlpha=Math.max(0,1-t);ctx.filter=fx.filter;ctx.translate(fx.x,fx.y);ctx.rotate(t*.3);
    ctx.drawImage(splashImage,-size/2,-size/2,size,size);ctx.restore();
  }
}
function fireExplosion(x, y, sourceBrick) {
  createSplashEffect(x,y,"fire",1);

  const elementMult = elementalStrengthMultiplier();
  const radius = 155 * Math.min(1.5, elementMult);
  const splashDamage = 0.75 * elementMult;

  createParticles(x, y, 28, "#ff7a35");

  for (const target of bricks) {
    if (!target.alive || target === sourceBrick) continue;

    const tx = target.x + target.width / 2;
    const ty = target.y + target.height / 2;
    const dist = Math.hypot(tx - x, ty - y);

    if (dist <= radius) {
      target.hp -= splashDamage;
      target.hitFlash = 0.16;

      createParticles(tx, ty, 7, "#ffb24a");

      if (target.hp <= 0) {
        target.hp = 0;
        target.alive = false;

        if (target.isMob) {
          const xpReward = target.shooter ? 10 : 5;
          addXP(xpReward);
          createFloatingText(tx, ty, `+${xpReward} XP`, "#d8c8ff");
        }

        if (target.treasure) {
          const baseGold = 8;
          const fortuneBonus = 1 + progression.stats.fortune * 0.05;
          const reward = Math.max(1, Math.round(baseGold * fortuneBonus));
          gold += reward;
          createFloatingGold(tx, ty, reward);
        }
      }
    }
  }

  updateHUD();
  checkVictory();
}

function updateBossMovement(dt) {
  if (gameState !== "playing" || roomNumber !== 5) return;

  const boss =
    bricks.find(brick => brick.alive && brick.raiderBoss);

  if (!boss) return;

  const sideWalls =
    bricks.filter(
      brick =>
        brick.alive &&
        !brick.isMob &&
        brick.baseCellRow === 2
    );

  // Start with the inner arena lane. As side blocks disappear later,
  // this can be expanded further into the "destroy the cage" mechanic.
  const leftWall = sideWalls
    .filter(b => b.x < WORLD_WIDTH / 2)
    .sort((a,b) => b.x - a.x)[0];

  const rightWall = sideWalls
    .filter(b => b.x > WORLD_WIDTH / 2)
    .sort((a,b) => a.x - b.x)[0];

  const leftLimit =
    leftWall
      ? leftWall.x + leftWall.width + 6
      : 55;

  const rightLimit =
    rightWall
      ? rightWall.x - boss.width - 6
      : WORLD_WIDTH - 55 - boss.width;

  const exposed = boss.armor <= 0;
  const speed =
    exposed
      ? boss.moveSpeed * 1.65
      : boss.moveSpeed;

  boss.x +=
    boss.moveDir *
    speed *
    dt;

  if (boss.x <= leftLimit) {
    boss.x = leftLimit;
    boss.moveDir = 1;
  } else if (boss.x >= rightLimit) {
    boss.x = rightLimit;
    boss.moveDir = -1;
  }

  updateBossHUD(boss);
}

function updateBossHUD(boss) {
  if (!boss || !boss.alive || roomNumber !== 5 || gameState !== "playing") {
    bossHudEl.classList.add("hidden");
    return;
  }

  bossHudEl.classList.remove("hidden");
  const hpPct = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
  bossBarFillEl.style.width = `${hpPct * 100}%`;

  if (boss.armor > 0) {
    bossPhaseEl.textContent = `ARMOR ${Math.ceil(boss.armor)} / ${boss.maxArmor}`;
  } else {
    bossPhaseEl.textContent = "ARMOR BROKEN — RAIDER ENRAGED";
  }
}

function spawnPickup(type, x, y, amount = 1) {
  fallingPickups.push({
    type,
    x,
    y,
    vy: 175,
    radius: type === "pill" ? 16 : 13,
    amount,
    bob: Math.random() * Math.PI * 2
  });
}

function trySpawnBrickReward(brick) {
  // One reward result per brick:
  // rare Pill replaces the normal money drop.
  const hardRewardBonus = currentRoomType === "hard";

  const pillChance =
    brick.treasure
      ? (hardRewardBonus ? 0.45 : 0.35)
      : (hardRewardBonus ? 0.18 : 0.12);

  if (Math.random() < pillChance && !roomPills.wide) {
    spawnPickup(
      "pill",
      brick.x + brick.width / 2,
      brick.y + brick.height / 2,
      1
    );
    return;
  }

  const moneyAmount =
    brick.treasure
      ? 4 + Math.floor(Math.random() * 4) + (hardRewardBonus ? 2 : 0)
      : 1 +
        (Math.random() < (hardRewardBonus ? 0.35 : 0.18) ? 1 : 0);

  spawnPickup(
    "money",
    brick.x + brick.width / 2,
    brick.y + brick.height / 2,
    moneyAmount
  );
}

function spawnMobXP(brick) {
  const xpAmount =
    brick.raiderBoss
      ? 20
      : brick.shooter
        ? 8
        : 4;

  spawnPickup(
    "xp",
    brick.x + brick.width / 2,
    brick.y + brick.height / 2,
    xpAmount
  );
}

function applyPickup(pickup) {
  if (pickup.type === "money") {
    gold += pickup.amount;
    createFloatingText(
      player.x,
      player.y - 65,
      `+${pickup.amount} GOLD`,
      "#ffd867"
    );
  }

  if (pickup.type === "xp") {
    addXP(pickup.amount);
    createFloatingText(
      player.x,
      player.y - 65,
      `+${pickup.amount} XP`,
      "#c9b5ff"
    );
  }

  if (pickup.type === "pill") {
    roomPills.wide = true;
    roomPills.wideMultiplier = 1.35;

    // Width only. Height never changes.
    // ApplyRunModifiers will respect this room-only multiplier.
    applyRunModifiers();

    createFloatingText(
      player.x,
      player.y - 70,
      "WIDE PADDLE!",
      "#bff7ff"
    );

    createParticles(
      player.x,
      player.y - 20,
      28,
      "#bff7ff"
    );
  }

  updateHUD();
}

function updateFallingPickups(dt) {
  for (let i = fallingPickups.length - 1; i >= 0; i--) {
    const pickup = fallingPickups[i];

    pickup.y += pickup.vy * dt;
    pickup.bob += dt * 5;

    const catchLeft =
      player.x - player.width / 2 - 8;

    const catchRight =
      player.x + player.width / 2 + 8;

    const catchTop =
      player.y - player.height / 2 - 18;

    const catchBottom =
      player.y + player.height / 2 + 18;

    if (
      pickup.x + pickup.radius > catchLeft &&
      pickup.x - pickup.radius < catchRight &&
      pickup.y + pickup.radius > catchTop &&
      pickup.y - pickup.radius < catchBottom
    ) {
      applyPickup(pickup);
      fallingPickups.splice(i, 1);
      continue;
    }

    if (pickup.y > WORLD_HEIGHT + 35) {
      fallingPickups.splice(i, 1);
    }
  }
}

function drawFallingPickups() {
  for (const pickup of fallingPickups) {
    ctx.save();

    const bobX =
      Math.sin(pickup.bob) * 2;

    ctx.translate(
      pickup.x + bobX,
      pickup.y
    );

    if (pickup.type === "money") {
      ctx.save();
      ctx.rotate(Math.PI / 4);
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffd867";
      ctx.fillStyle = "#e0b640";
      ctx.fillRect(-10, -10, 20, 20);
      ctx.strokeStyle = "#fff0a8";
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -10, 20, 20);
      ctx.restore();

      ctx.fillStyle = "#5c4713";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 1);
    }

    if (pickup.type === "xp") {
      ctx.rotate(Math.PI / 4);
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#bfa8ff";
      ctx.fillStyle = "#a889ff";
      ctx.fillRect(
        -pickup.radius * 0.72,
        -pickup.radius * 0.72,
        pickup.radius * 1.44,
        pickup.radius * 1.44
      );
    }

    if (pickup.type === "pill") {
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#d9fbff";

      ctx.fillStyle = "#eefcff";
      ctx.fillRect(-15, -7, 30, 14);

      ctx.fillStyle = "#82d9ef";
      ctx.fillRect(0, -7, 15, 14);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -7, 30, 14);
    }

    ctx.restore();
  }
}

function updateRangerSkill(dt) {
  rangerSkill.timer = Math.max(0, rangerSkill.timer - dt);
  hunterDodge.timer = Math.max(0, hunterDodge.timer - dt);
}

function enemyAtWorldPoint(x, y) {
  for (let i = bricks.length - 1; i >= 0; i--) {
    const enemy = bricks[i];
    if (
      enemy.alive &&
      enemy.isMob &&
      x >= enemy.x &&
      x <= enemy.x + enemy.width &&
      y >= enemy.y &&
      y <= enemy.y + enemy.height
    ) {
      return enemy;
    }
  }
  return null;
}

function useRangerSkill(target) {
  if (
    gameState !== "playing" ||
    rangerSkill.timer > 0 ||
    !target ||
    !target.alive ||
    !target.isMob
  ) return false;

  const x = player.x;
  const y = player.y - 55;
  const targetX = target.x + target.width / 2;
  const targetY = target.y + target.height / 2;
  const dx = targetX - x;
  const dy = targetY - y;
  const length = Math.hypot(dx, dy) || 1;

  playerProjectiles.push({
    x,
    y,
    vx: dx / length * rangerSkill.speed,
    vy: dy / length * rangerSkill.speed,
    radius: 8,
    damage: rangerSkill.damage,
    target
  });

  rangerSkill.timer = rangerSkill.effectiveCooldown || rangerSkill.cooldown;
  return true;
}

function updatePlayerProjectiles(dt) {
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    const shot = playerProjectiles[i];
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;

    const target = shot.target;
    if (
      target &&
      target.alive &&
      shot.x + shot.radius > target.x &&
      shot.x - shot.radius < target.x + target.width &&
      shot.y + shot.radius > target.y &&
      shot.y - shot.radius < target.y + target.height
    ) {
      damageBrick(target, shot.damage, "weapon");
      playerProjectiles.splice(i, 1);
      continue;
    }

    if (
      shot.x < -40 || shot.x > WORLD_WIDTH + 40 ||
      shot.y < -40 || shot.y > WORLD_HEIGHT + 40
    ) {
      playerProjectiles.splice(i, 1);
    }
  }
}

function drawPlayerProjectiles() {
  for (const shot of playerProjectiles) {
    ctx.save();
    ctx.translate(shot.x, shot.y);
    ctx.rotate(Math.atan2(shot.vy, shot.vx));
    ctx.strokeStyle = "#f2d7a0";
    ctx.fillStyle = "#f2d7a0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(13, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(6, -6);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function updateEnemyAttacks(dt) {
  if (gameState !== "playing") return;

  for (const enemy of bricks) {
    if (!enemy.alive || !(enemy.shooter || enemy.iceGoblin || enemy.raiderBoss)) continue;

    enemy.fireCooldown = (enemy.fireCooldown || 0) - dt;

    if (enemy.fireCharge > 0) {
      enemy.fireCharge -= dt;
      enemy.telegraph = enemy.fireCharge;

      if (enemy.fireCharge <= 0) {
        enemy.telegraph = 0;
        fireEnemyShot(enemy);

        if (enemy.raiderBoss) {
          enemy.fireCooldown = enemy.armor > 0 ? 1.65 : 1.10;
        } else if (enemy.shooterVariant === "stun") {
          enemy.fireCooldown = 3.0 * (currentRoomType === "hard" ? 0.80 : 1);
        } else if (enemy.shooterVariant === "spread") {
          enemy.fireCooldown = 1.35 * (currentRoomType === "hard" ? 0.80 : 1);
        } else if (enemy.iceGoblin) {
          enemy.fireCooldown = 2.6 * (currentRoomType === "hard" ? 0.80 : 1);
        } else {
          enemy.fireCooldown = 2.2 * (currentRoomType === "hard" ? 0.80 : 1);
        }
      }

      continue;
    }

    if (enemy.fireCooldown <= 0) {
      if (enemy.raiderBoss) {
        enemy.fireCharge = 0.58;
      } else if (enemy.shooterVariant === "stun") {
        enemy.fireCharge = 0.8 * (currentRoomType === "hard" ? 0.80 : 1);
      } else if (enemy.shooterVariant === "spread") {
        enemy.fireCharge = 0.42 * (currentRoomType === "hard" ? 0.80 : 1);
      } else {
        enemy.fireCharge = 0.65 * (currentRoomType === "hard" ? 0.80 : 1);
      }
      enemy.telegraph = enemy.fireCharge;
    }
  }
}

function hardProjectileSpeed(speed) {
  return currentRoomType === "hard" ? speed * 1.20 : speed;
}

function fireEnemyShot(shooter) {
  const x = shooter.x + shooter.width / 2;
  const y = shooter.y + shooter.height;

  if (shooter.raiderBoss) {
    const targetX = player.x;
    const targetY = player.y - 20;
    const dx = targetX - x;
    const dy = targetY - y;
    const length = Math.hypot(dx, dy) || 1;
    const speed = shooter.armor > 0 ? 455 : 535;
    const vx = dx / length * speed;
    const vy = dy / length * speed;

    enemyProjectiles.push({
      x, y, radius: 11, vx, vy,
      type: "arrow",
      angle: Math.atan2(vy, vx)
    });
    return;
  }

  if (shooter.iceGoblin) {
    enemyProjectiles.push({x,y,radius:15,vx:0,vy:hardProjectileSpeed(320),type:"ice"});
    return;
  }

  if (shooter.shooterVariant === "stun") {
    enemyProjectiles.push({
      x,
      y,
      radius: 14,
      vx: 0,
      vy: hardProjectileSpeed(355),
      type: "stun"
    });
    return;
  }

  if (shooter.shooterVariant === "spread") {
    for (const baseVx of [-150, 0, 150]) {
      const speedMult = currentRoomType === "hard" ? 1.20 : 1;
      enemyProjectiles.push({x,y,radius:12,vx:baseVx * speedMult,vy:350 * speedMult,type:"damage"});
    }
    return;
  }

  enemyProjectiles.push({x,y,radius:13,vx:0,vy:hardProjectileSpeed(380),type:"damage"});
}

function updateProjectiles(dt) {
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const shot = enemyProjectiles[i];
    shot.x += (shot.vx || 0) * dt;
    shot.y += shot.vy * dt;

    if (
      shot.x > player.x - player.width / 2 &&
      shot.x < player.x + player.width / 2 &&
      shot.y + shot.radius > player.y - player.height / 2 &&
      shot.y - shot.radius < player.y + player.height / 2
    ) {
      enemyProjectiles.splice(i, 1);
      if (hunterDodge.timer <= 0) {
        hunterDodge.timer = hunterDodge.cooldown;
        createFloatingText(player.x, player.y - 65, "DODGE!", "#fff6b0");
        createParticles(player.x, player.y - 25, 18, "#fff6b0");
      } else if (shot.type === "ice") {
        applyIceSlow();
      } else if (shot.type === "stun") {
        applyStun();
      } else {
        hurtPlayer();
      }
      continue;
    }

    if (shot.y > WORLD_HEIGHT + 50) {
      enemyProjectiles.splice(i, 1);
    }
  }
}

function loseBall() {
  if (gameState === "lost") return;

  resetHitCombo();
  ball.pierceDamageRemaining = 0;

  ballsLeft = Math.max(0, ballsLeft - 1);
  ball.launched = false;
  ball.vx = 0;
  ball.vy = 0;
  updateHUD();

  if (ballsLeft <= 0) {
    gameState = "lost";
    messageEl.style.display = "block";
    messageEl.textContent = "OUT OF BALLS — TAP TO END RUN";
    return;
  }

  gameState = "waiting";
  ball.x = player.x;
  ball.y = player.y - 58;
  messageEl.style.display = "block";
  messageEl.textContent = `BALL LOST — ${ballsLeft} LEFT — TAP TO LAUNCH`;
}

function applyIceSlow() {
  // Stack Ice up to three times; each hit refreshes the duration.
  player.slowStacks = Math.min(3, (player.slowStacks || 0) + 1);
  player.slowTimer = 3;

  const slowByStack = [1, 0.70, 0.40, 0.10];
  player.slowMultiplier = slowByStack[player.slowStacks];

  createParticles(player.x, player.y, 28, "#9de7ff");
  createFloatingText(
    player.x,
    player.y - 45,
    player.slowStacks > 1 ? `FROZEN x${player.slowStacks}!` : "SLOWED!",
    "#bceeff"
  );
}

function applyStun() {
  // Briefly removes trolley control while the ball keeps moving.
  player.stunTimer = Math.max(player.stunTimer || 0, 1.15);

  createParticles(
    player.x,
    player.y - 20,
    30,
    "#ffe66d"
  );

  createFloatingText(
    player.x,
    player.y - 55,
    "STUNNED!",
    "#fff08a"
  );
}

function hurtPlayer() {
  if (player.invincibleTimer > 0 || gameState !== "playing") return;

  if (shieldReady) {
    shieldReady = false;
    shieldShatterTimer = 0.55;
    createParticles(player.x, player.y - 30, 26, "#73d8ff");
    createFloatingText(player.x, player.y - 70, "SHIELD!", "#9fe8ff");
    return;
  }

  player.hp -= 1;
  player.invincibleTimer = 0.8;
  createParticles(player.x, player.y - 25, 18, "#ff725f");
  updateHUD();

  if (player.hp <= 0) {
    loseBallFromHP();
  }
}

function loseBallFromHP() {
  ballsLeft = Math.max(0, ballsLeft - 1);
  resetHitCombo();

  if (ballsLeft <= 0) {
    player.hp = 0;
    gameState = "lost";
    ball.launched = false;
    messageEl.style.display = "block";
    messageEl.textContent = "OUT OF BALLS — TAP TO END RUN";
    updateHUD();
    return;
  }

  player.hp = player.maxHp;
  player.invincibleTimer = 1.4;
  ball.launched = false;
  ball.vx = 0;
  ball.vy = 0;
  ball.x = player.x;
  ball.y = player.y - 58;
  gameState = "waiting";
  messageEl.style.display = "block";
  messageEl.textContent = `KNOCKED OUT — ${ballsLeft} BALLS LEFT — TAP TO RELAUNCH`;
  updateHUD();
}

