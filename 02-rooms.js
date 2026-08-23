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
let inspectedPrepareItem = null;

const prepareCatalog = {
  ball: {
    iron:{name:"Iron Ball",effect:"Reliable standard rebound. No special properties.",stats:["Rebound: Standard","Element: None"],available:true},
    piercing:{name:"Piercing Ball",effect:"Excess damage carries through a target when the hit destroys it.",stats:["Trait: Damage Carry","Element: None"],available:true},
    cinder:{name:"Cinder Ball",effect:"Fire hits splash nearby targets and deal bonus damage against Ice enemies.",stats:["Trait: Fire Splash","Element: Fire"],available:true}
  },
  paddle: {
    trolley:{name:"Standard Trolley",effect:"Your dependable dungeon trolley. Balanced size and movement.",stats:["Paddle: Standard","Handling: Balanced"],available:true}
  },
  gear: {
    hunter:{name:"Hunter Gear",effect:"Hunter equipment built for mobility and ranged attacks.",stats:["Ability: Arrow","Skill: Dodge"],available:true},
    paladin:{name:"Paladin Gear",effect:"A heavily armored class set focused on defense and protection.",stats:["COMING SOON"],available:false},
    mystic:{name:"Mystic Gear",effect:"A magical class set built around supernatural control of the battlefield.",stats:["COMING SOON"],available:false}
  }
};

const prepareEquipped = {paddle:"trolley",gear:"hunter"};

function equipmentStatsHtml(item){return(item.stats||[]).map(stat=>`<span>${stat}</span>`).join("");}
function getPrepareEquipped(slot){return slot==="ball"?progression.equipment.ball:prepareEquipped[slot];}
function getPrepareIds(slot){return slot==="ball"?(progression.equipment.unlocked.ball||[]):Object.keys(prepareCatalog[slot]||{});}

function prepareItemVisual(slot,id){
  if(slot==="ball"){
    const visualClass={iron:"ballIron",piercing:"ballPiercing",cinder:"ballCinder"}[id]||"ballIron";
    return `<div class="prepareTileArt ${visualClass}"><div class="prepareBallCore"></div></div>`;
  }
  if(slot==="paddle")return `<div class="prepareTileArt paddleTileArt"><div class="miniTrolley"><span class="miniTrolleyRail"></span><span class="miniTrolleyBody"></span><span class="miniTrolleyWheel wheelLeft"></span><span class="miniTrolleyWheel wheelRight"></span></div></div>`;
  const icon={hunter:"🏹",paladin:"🛡️",mystic:"🔮"}[id]||"⚔️";
  return `<div class="prepareTileArt gearTileArt"><span>${icon}</span></div>`;
}

function updateLoadoutUI(){
  const ballItem=prepareCatalog.ball[progression.equipment.ball];
  const ballName=document.getElementById("ballName");
  const paddleName=document.getElementById("paddleName");
  const gearName=document.getElementById("gearName");
  if(ballName&&ballItem)ballName.textContent=ballItem.name;
  if(paddleName)paddleName.textContent=prepareCatalog.paddle[prepareEquipped.paddle].name;
  if(gearName)gearName.textContent=prepareCatalog.gear[prepareEquipped.gear].name;
  document.querySelectorAll(".prepareSlot[data-slot]").forEach(b=>b.classList.toggle("active",b.dataset.slot===activePrepareSlot));
  const ids=getPrepareIds(activePrepareSlot);
  if(!inspectedPrepareItem||!ids.includes(inspectedPrepareItem))inspectedPrepareItem=getPrepareEquipped(activePrepareSlot)||ids[0];
  renderPrepareSlot(activePrepareSlot);
}

function renderPrepareSlot(slot){
  activePrepareSlot=slot;
  const ids=getPrepareIds(slot);
  if(!ids.length)return;
  if(!inspectedPrepareItem||!ids.includes(inspectedPrepareItem))inspectedPrepareItem=getPrepareEquipped(slot)||ids[0];
  const selected=prepareCatalog[slot]?.[inspectedPrepareItem];
  if(!selected)return;
  const labelEl=document.getElementById("prepareSlotLabel");
  const titleEl=document.getElementById("prepareCategoryTitle");
  const nameEl=document.getElementById("prepareItemName");
  const effectEl=document.getElementById("prepareItemEffect");
  const statsEl=document.getElementById("prepareStats");
  const badgeEl=document.getElementById("prepareEquippedBadge");
  const equipButton=document.getElementById("prepareEquipButton");
  if(labelEl)labelEl.textContent=slot.toUpperCase();
  if(titleEl)titleEl.textContent={ball:"Choose a Ball",paddle:"Choose a Paddle",gear:"Choose Gear"}[slot];
  if(nameEl)nameEl.textContent=selected.name;
  if(effectEl)effectEl.textContent=selected.effect;
  if(statsEl)statsEl.innerHTML=equipmentStatsHtml(selected);
  const equipped=getPrepareEquipped(slot)===inspectedPrepareItem;
  if(badgeEl){
    badgeEl.textContent=!selected.available?"COMING SOON":equipped?"EQUIPPED":"NOT EQUIPPED";
    badgeEl.classList.toggle("notEquipped",!equipped||!selected.available);
  }
  if(equipButton){
    equipButton.disabled=!selected.available||equipped;
    equipButton.textContent=!selected.available?"COMING SOON":equipped?"EQUIPPED":"EQUIP";
    equipButton.onclick=()=>{
      if(!selected.available)return;
      if(slot==="ball"){progression.equipment.ball=inspectedPrepareItem;applyEquipment();saveProgression();}
      else prepareEquipped[slot]=inspectedPrepareItem;
      updateLoadoutUI();
    };
  }
  renderEquipmentTiles(slot);
}

function renderEquipmentTiles(slot){
  equipmentPicker.innerHTML="";
  const equippedId=getPrepareEquipped(slot);
  for(const id of getPrepareIds(slot)){
    const item=prepareCatalog[slot][id];
    const b=document.createElement("button");
    b.className="prepareTile";
    if(id===inspectedPrepareItem)b.classList.add("selected");
    if(equippedId===id)b.classList.add("equipped");
    if(!item.available)b.classList.add("comingSoonTile");
    b.innerHTML=`${prepareItemVisual(slot,id)}<span class="prepareTileName">${item.name}</span>${!item.available?'<span class="prepareTileComingSoon">COMING SOON</span>':equippedId===id?'<span class="prepareTileEquipped">EQUIPPED</span>':""}`;
    b.onclick=()=>{inspectedPrepareItem=id;renderPrepareSlot(slot);};
    equipmentPicker.appendChild(b);
  }
  equipmentPicker.classList.remove("hidden");
}

function openEquipmentPicker(slot){inspectedPrepareItem=getPrepareEquipped(slot);renderPrepareSlot(slot);}
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

