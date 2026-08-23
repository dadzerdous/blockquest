function shuffleEnemyPlacements() {
  if (roomNumber === 5) return;

  const mobs = bricks.filter(brick => brick.alive && brick.isMob);
  const positions = mobs.map(brick => ({ x: brick.x, y: brick.y }));

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  mobs.forEach((brick, index) => {
    brick.x = positions[index].x;
    brick.y = positions[index].y;
  });
}

function applyHardEnemyMix() {
  if (roomNumber === 5 || currentRoomType !== "hard") return;

  const mobs = bricks.filter(brick => brick.isMob);

  // Hard rooms must contain an active threat, not only tougher Grey Grunts.
  // Room 4 specifically introduces the Stun Grunt.
  if (roomNumber >= 4 && mobs.length) {
    const target = mobs[Math.floor(Math.random() * mobs.length)];

    target.stunGoblin = true;
    target.shooter = true;
    target.shooterVariant = "stun";
    target.fireGoblin = false;
    target.darkFireGoblin = false;
    target.iceGoblin = false;
    target.greenGoblin = false;
    target.hp = Math.max(target.hp, 4);
    target.maxHp = Math.max(target.maxHp, 4);
  }
}

function applyRouteThreat() {
  if (roomNumber === 5 || currentRoomType !== "hard") return;

  // HARD = same authored room, empowered enemies.
  // Keep brick density/layout readable; difficulty comes from the mobs.
  const mobs = bricks.filter(brick => brick.isMob);

  mobs.forEach(brick => {
    brick.hp = Math.max(brick.hp + 1, Math.ceil(brick.hp * 1.30));
    brick.maxHp = brick.hp;
    brick.hardEmpowered = true;
  });
}

function buildRoom() {
  bricks = [];

  const layout =
    roomNumber <= roomLayouts.length
      ? roomLayouts[roomNumber - 1]
      : roomLayouts[3]; // temporary post-boss fallback: Room 4, never repeat boss

  const workingLayout = layout.map(row => row.split(""));

  if (roomNumber !== 5) {
    const availableBricks = [];

    workingLayout.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === "B") {
          availableBricks.push([r, c]);
        }
      });
    });

    // Standard rooms can naturally contain a little treasure.
    // Treasure routes intentionally contain a lot more.
    let treasureCount = 0;

    if (currentRoomType === "treasure") {
      treasureCount = Math.min(
        availableBricks.length,
        5 + Math.floor(Math.random() * 3) // 5–7
      );
    } else if (
      currentRoomType === "standard" ||
      currentRoomType === "battle"
    ) {
      // About a 45% chance of one treasure brick,
      // with a small chance for a second.
      if (Math.random() < 0.45) treasureCount = 1;
      if (treasureCount > 0 && Math.random() < 0.18) treasureCount += 1;
    } else if (currentRoomType === "hard") {
      // Hard is primarily about threat, but can still occasionally contain loot.
      if (Math.random() < 0.30) treasureCount = 1;
    }

    // Shuffle eligible environmental-brick positions.
    for (let i = availableBricks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableBricks[i], availableBricks[j]] =
        [availableBricks[j], availableBricks[i]];
    }

    for (let i = 0; i < treasureCount; i++) {
      const [r, c] = availableBricks[i];
      workingLayout[r][c] = "T";
    }
  }

  const rows = workingLayout.length;
  const cols = Math.max(...workingLayout.map(row => row.length));

  // Dynamically fit the board. Normal rooms keep the larger 5-column bricks.
  // Wider boss boards shrink their bricks enough to stay centered on mobile.
  const gap = cols >= 8 ? 8 : 12;
  const maxBoardWidth = WORLD_WIDTH - 90;
  const preferredBrickWidth = 125;
  const brickWidth = Math.min(
    preferredBrickWidth,
    (maxBoardWidth - gap * (cols - 1)) / cols
  );

  const brickHeight = cols >= 8
    ? Math.max(48, brickWidth * 0.52)
    : 65;

  const totalWidth =
    cols * brickWidth +
    (cols - 1) * gap;

  const startX =
    (WORLD_WIDTH - totalWidth) / 2;

  const startY = 210;

  workingLayout.forEach((line, row) => {
    line.forEach((type, col) => {
      if (type === ".") return;

      let hp = 2;
      let isMob = false;
      let shooter = false;
      let shooterVariant = null;
      let treasure = false;
      let iceGoblin = false;
      let greenGoblin = false;
      let fireGoblin = false;
      let darkFireGoblin = false;
      let stunGoblin = false;
      let raiderBoss = false;

      // Environment
      if (type === "B") hp = 2;
      if (type === "H") hp = 4;

      // Visible treasure is still a normal-looking brick with a yellow hue.
      if (type === "T") {
        hp = 2;
        treasure = true;
      }

      // Grey / neutral grunt
      if (type === "M") {
        hp = 5;
        isMob = true;
      }

      // Fire grunt
      if (type === "F") {
        hp = 4;
        isMob = true;
        shooter = true;
        shooterVariant = "basic";
        fireGoblin = true;
      }

      // Ice grunt
      if (type === "I") {
        hp = 4;
        isMob = true;
        iceGoblin = true;
      }

      // Green grunt — elemental behavior deliberately undefined for now.
      if (type === "G") {
        hp = 4;
        isMob = true;
        greenGoblin = true;
      }

      // Dark-red fire grunt
      if (type === "D") {
        hp = 5;
        isMob = true;
        shooter = true;
        shooterVariant = "spread";
        darkFireGoblin = true;
      }

      // Stun Grunt — stationary electric attacker.
      if (type === "Z") {
        hp = 4;
        isMob = true;
        shooter = true;
        shooterVariant = "stun";
        stunGoblin = true;
      }

      // Armored Raider mini-boss
      if (type === "R") {
        hp = 28;
        isMob = true;
        raiderBoss = true;
        shooter = true;
        shooterVariant = "raiderAim";
      }

      bricks.push({
        x: startX + col * (brickWidth + gap),
        y: startY + row * (brickHeight + gap),

        baseCellCol: col,
        baseCellRow: row,

        width: brickWidth,
        height: brickHeight,

        hp,
        maxHp: hp,

        alive: true,
        isMob,
        shooter,
        shooterVariant,
        telegraph: 0,

        treasure,
        iceGoblin,
        greenGoblin,
        fireGoblin,
        darkFireGoblin,
        stunGoblin,
        raiderBoss,
        hardEmpowered: false,

        armor: raiderBoss ? 12 : 0,
        maxArmor: raiderBoss ? 12 : 0,

        moveDir: 1,
        moveSpeed: raiderBoss ? 92 : 0,

        hitFlash: 0,
        type
      });
    });
  });

  roomTitleEl.textContent =
    roomNumber === 5
      ? "ROOM 5 — ARMORED RAIDER ARCHER"
      : currentRoomType === "treasure"
        ? `ROOM ${roomNumber} — TREASURE ROUTE`
        : currentRoomType === "hard"
          ? `ROOM ${roomNumber} — HARD ROUTE`
          : `ROOM ${roomNumber} — STANDARD ROUTE`;

  applyHardEnemyMix();
  applyRouteThreat();
  shuffleEnemyPlacements();
  updateHUD();

  const activeBoss =
    bricks.find(brick => brick.alive && brick.raiderBoss);

  updateBossHUD(activeBoss);
}


function applyEquipment() {
  ball.equipmentSpeedMultiplier = 1;
  ball.equipmentDamageMultiplier = 1;
  if (progression.equipment.gloves === "heavy") {
    ball.equipmentSpeedMultiplier = 0.85;
    ball.equipmentDamageMultiplier = 1.25;
  } else if (progression.equipment.gloves === "quick") {
    ball.equipmentSpeedMultiplier = 1.15;
    ball.equipmentDamageMultiplier = 0.90;
  }
}
let activePrepareSlot = "ball";

function equipmentStatsHtml(item) {
  return (item.stats || [])
    .map(stat => `<span>${stat}</span>`)
    .join("");
}

function updateLoadoutUI() {
  const gloves = equipmentCatalog.gloves[progression.equipment.gloves];
  const ballItem = equipmentCatalog.ball[progression.equipment.ball];

  if (glovesNameEl) glovesNameEl.textContent = gloves.name;
  if (ballNameEl) ballNameEl.textContent = ballItem.name;

  document.querySelectorAll(".prepareSlot[data-slot]").forEach(button => {
    button.classList.toggle("active", button.dataset.slot === activePrepareSlot);
  });

  renderPrepareSlot(activePrepareSlot);
}

function renderPrepareSlot(slot) {
  activePrepareSlot = slot;

  const selectedId = progression.equipment[slot];
  const selected = equipmentCatalog[slot]?.[selectedId];
  if (!selected) return;

  if (prepareSlotLabelEl) prepareSlotLabelEl.textContent = slot.toUpperCase();
  if (prepareItemNameEl) prepareItemNameEl.textContent = selected.name;
  if (prepareItemEffectEl) prepareItemEffectEl.textContent = selected.effect;
  if (prepareStatsEl) prepareStatsEl.innerHTML = equipmentStatsHtml(selected);

  openEquipmentPicker(slot);
}

function openEquipmentPicker(slot) {
  activePrepareSlot = slot;
  equipmentPicker.innerHTML = "";

  for (const id of progression.equipment.unlocked[slot] || []) {
    const item = equipmentCatalog[slot][id];
    const button = document.createElement("button");

    button.className = "equipmentChoice prepareChoice";
    if (progression.equipment[slot] === id) button.classList.add("equipped");

    button.innerHTML = `
      <span class="prepareChoiceName">${item.name}</span>
      <span class="prepareChoiceEffect">${item.effect}</span>
      <span class="prepareChoiceStats">${(item.stats || []).join(" • ")}</span>
    `;

    button.onclick = () => {
      progression.equipment[slot] = id;
      applyEquipment();
      saveProgression();
      updateLoadoutUI();
    };

    equipmentPicker.appendChild(button);
  }

  equipmentPicker.classList.remove("hidden");
}
function resetRun() {
  if (typeof routeGraphState !== "undefined") {
    routeGraphState.currentNodeId = "1A";
    routeGraphState.visited = ["1A"];
  }

  hunterDodge.timer = 0;

  roomNumber = 1;
  currentRoomType = "battle";
  pendingRoomType = "battle";
  gold = 0;
  ballsLeft = maxBalls;
  resetHitCombo();
  runes = {
    power: 0,
    tempo: 0,
    drag: 0,
    agility: 0,
    expansion: 0,
    vitality: 0,
    cooldown: 0,
    ballSize: 0,
    elemental: 0
  };
  hasOvershield = false;
  shieldReady = false;
  shieldShatterTimer = 0;
  glueCharges = 0;
  glueArmed = false;
  ballStuck = false;
  stuckTimer = 0;

  player.speed = player.baseSpeed;
  ball.damage = 1;
  applyPermanentStats();
  applyEquipment();
  applyRunModifiers();
  player.hp = player.maxHp;
  player.x = WORLD_WIDTH / 2;
  player.slowTimer = 0;
  player.slowMultiplier = 1;
  player.slowStacks = 0;

  ball.launched = false;
  ball.vx = 0;
  ball.vy = 0;

  enemyProjectiles = [];
  particles = [];
  attackTimer = 0;

  upgradeOverlay.classList.add("hidden");
  shopOverlay.classList.add("hidden");
  statsOverlay.classList.add("hidden");

  updateHUD();
  updateStatsUI();
  updateLobbyUI();
}

function startRoom() {
  fallingPickups = [];
  roomPills.wide = false;
  roomPills.wideMultiplier = 1;

  playerProjectiles = [];
  rangerSkill.timer = 0;
  resetHitCombo();
  exitChoice.active = false;
  exitChoice.chosen = null;
  pathHintEl.classList.add("hidden");
  player.x = WORLD_WIDTH / 2;
  player.slowTimer = 0;
  player.slowMultiplier = 1;
  player.slowStacks = 0;

  ball.launched = false;
  ballStuck = false;
  glueArmed = false;
  ball.vx = 0;
  ball.vy = 0;
  ball.x = player.x;
  ball.y = player.y - 58;

  enemyProjectiles = [];
  attackTimer = 0;
  shieldReady = hasOvershield;
  armorPoints = progression.stats.defense;

  gameState = "waiting";

  applyRunModifiers();
  recalculatePaddleSize("room start");
  buildRoom();
  updateRuneText();
  updateShopUI();

  messageEl.style.display = "block";
  messageEl.textContent = "TAP / CLICK TO LAUNCH";
}

