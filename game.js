const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const heroHpEl = document.getElementById("heroHp");
const heroShieldEl = document.getElementById("heroShield");
const goldHudEl = document.getElementById("goldHud");
const enemyCountEl = document.getElementById("enemyCount");
const roomTitleEl = document.getElementById("roomTitle");
const messageEl = document.getElementById("message");

const upgradeOverlay = document.getElementById("upgradeOverlay");
const shopOverlay = document.getElementById("shopOverlay");
const powerLevelEl = document.getElementById("powerLevel");
const widthLevelEl = document.getElementById("widthLevel");
const speedLevelEl = document.getElementById("speedLevel");

const shieldOwnedEl = document.getElementById("shieldOwned");
const glueCountEl = document.getElementById("glueCount");
const healStatusEl = document.getElementById("healStatus");
const leaveShopBtn = document.getElementById("leaveShop");
const glueButton = document.getElementById("glueButton");
const glueButtonCount = document.getElementById("glueButtonCount");

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 1400;

let gameState = "waiting";
let lastTime = 0;
let keys = {};
let pointerActive = false;
let pointerX = WORLD_WIDTH / 2;
let roomNumber = 1;

let gold = 0;
let hasOvershield = false;
let shieldReady = false;
let shieldShatterTimer = 0;
let glueCharges = 0;
let glueArmed = false;
let ballStuck = false;
let stuckTimer = 0;

const player = {
  x: WORLD_WIDTH / 2,
  y: 1240,
  baseWidth: 220,
  width: 220,
  height: 44,
  baseSpeed: 620,
  speed: 620,
  velocityX: 0,
  hp: 5,
  maxHp: 5,
  invincibleTimer: 0,
  facing: 1,
  runTimer: 0
};

const ball = {
  x: player.x,
  y: player.y - 60,
  radius: 16,
  speed: 620,
  vx: 0,
  vy: 0,
  launched: false,
  damage: 1
};

let bricks = [];
let enemyProjectiles = [];
let particles = [];
let attackTimer = 0;

const roomLayouts = [
  [
    "BBBBB",
    "BMMMB",
    "BBMBB",
    "BBSBB"
  ],
  [
    "BMBMB",
    "BBMBB",
    "MBSBM",
    "BBBBB"
  ],
  [
    "BBMBB",
    "BHBHB",
    "MM SMM".replace(" ", ""),
    "BBBBB"
  ]
];

function buildRoom() {
  bricks = [];

  const layout = roomLayouts[(roomNumber - 1) % roomLayouts.length];
  const brickWidth = 125;
  const brickHeight = 65;
  const gap = 12;
  const cols = 5;
  const totalWidth = cols * brickWidth + (cols - 1) * gap;
  const startX = (WORLD_WIDTH - totalWidth) / 2;
  const startY = 210;

  layout.forEach((line, row) => {
    [...line].forEach((type, col) => {
      if (type === ".") return;

      let hp = 1;
      let isMob = false;
      let shooter = false;

      if (type === "B") hp = 2;
      if (type === "H") hp = 4;

      if (type === "M") {
        hp = 3;
        isMob = true;
      }

      if (type === "S") {
        hp = 5;
        isMob = true;
        shooter = true;
      }

      bricks.push({
        x: startX + col * (brickWidth + gap),
        y: startY + row * (brickHeight + gap),
        width: brickWidth,
        height: brickHeight,
        hp,
        maxHp: hp,
        alive: true,
        isMob,
        shooter,
        hitFlash: 0,
        type
      });
    });
  });

  roomTitleEl.textContent = `ROOM ${roomNumber} — GOBLIN OUTPOST`;
  updateHUD();
}

function resetRun() {
  roomNumber = 1;
  gold = 0;
  hasOvershield = false;
  shieldReady = false;
  shieldShatterTimer = 0;
  glueCharges = 0;
  glueArmed = false;
  ballStuck = false;
  stuckTimer = 0;

  player.width = player.baseWidth;
  player.speed = player.baseSpeed;
  player.hp = player.maxHp;
  player.x = WORLD_WIDTH / 2;

  ball.damage = 1;
  ball.launched = false;
  ball.vx = 0;
  ball.vy = 0;

  enemyProjectiles = [];
  particles = [];
  attackTimer = 0;

  upgradeOverlay.classList.add("hidden");
  shopOverlay.classList.add("hidden");

  startRoom();
}

function startRoom() {
  player.x = WORLD_WIDTH / 2;

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

  gameState = "waiting";

  buildRoom();
  updateUpgradeText();
  updateShopUI();

  messageEl.style.display = "block";
  messageEl.textContent = "TAP / CLICK TO LAUNCH";
}

function launchBall() {
  if (gameState === "lost") {
    resetRun();
    return;
  }

  if (ballStuck) {
    ballStuck = false;
    stuckTimer = 0;
    const angle = -Math.PI / 3;
    ball.vx = Math.cos(angle) * ball.speed;
    ball.vy = Math.sin(angle) * ball.speed;
    ball.launched = true;
    gameState = "playing";
    messageEl.style.display = "none";
    return;
  }

  if (gameState !== "waiting" || ball.launched) return;

  ball.launched = true;

  const angle = -Math.PI / 3;
  ball.vx = Math.cos(angle) * ball.speed;
  ball.vy = Math.sin(angle) * ball.speed;

  gameState = "playing";
  messageEl.style.display = "none";
}

window.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    launchBall();
  }

  if (event.key.toLowerCase() === "g") {
    armGlue();
  }
});

window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener("pointerdown", event => {
  if (gameState === "upgrade" || gameState === "shop") return;

  pointerActive = true;
  setPointerPosition(event);

  if (gameState === "lost") {
    resetRun();
    return;
  }

  if (!ball.launched || ballStuck) launchBall();
});

canvas.addEventListener("pointermove", event => {
  if (!pointerActive) return;
  setPointerPosition(event);
});

window.addEventListener("pointerup", () => {
  pointerActive = false;
});

function setPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  pointerX = ((event.clientX - rect.left) / rect.width) * WORLD_WIDTH;
}

document.querySelectorAll(".upgradeCard[data-upgrade]").forEach(button => {
  button.addEventListener("click", () => chooseUpgrade(button.dataset.upgrade));
});

document.querySelectorAll(".shopCard").forEach(button => {
  button.addEventListener("click", () => buyShopItem(button.dataset.shop));
});

leaveShopBtn.addEventListener("click", leaveShop);
glueButton.addEventListener("click", armGlue);

function chooseUpgrade(type) {
  if (gameState !== "upgrade") return;

  if (type === "power") ball.damage += 1;
  if (type === "width") player.width = Math.min(400, player.width * 1.15);
  if (type === "speed") player.speed = Math.min(1100, player.speed * 1.15);

  upgradeOverlay.classList.add("hidden");
  updateUpgradeText();

  if (roomNumber % 3 === 0) {
    openShop();
  } else {
    roomNumber += 1;
    startRoom();
  }
}

function updateUpgradeText() {
  powerLevelEl.textContent = `Damage: ${ball.damage}`;
  widthLevelEl.textContent = `Width: ${Math.round(player.width)}`;
  speedLevelEl.textContent = `Speed: ${Math.round(player.speed)}`;
}

function openShop() {
  gameState = "shop";
  messageEl.style.display = "none";
  shopOverlay.classList.remove("hidden");
  updateShopUI();
}

function leaveShop() {
  if (gameState !== "shop") return;

  shopOverlay.classList.add("hidden");
  roomNumber += 1;
  startRoom();
}

function buyShopItem(type) {
  if (gameState !== "shop") return;

  if (type === "overshield") {
    if (hasOvershield || gold < 12) return;
    gold -= 12;
    hasOvershield = true;
    shieldReady = true;
  }

  if (type === "glue") {
    if (gold < 8) return;
    gold -= 8;
    glueCharges += 1;
  }

  if (type === "heal") {
    if (gold < 6 || player.hp >= player.maxHp) return;
    gold -= 6;
    player.hp = Math.min(player.maxHp, player.hp + 2);
  }

  updateHUD();
  updateShopUI();
}

function updateShopUI() {
  shieldOwnedEl.textContent = hasOvershield ? "OWNED — recharges each room" : "Not owned";
  glueCountEl.textContent = `Charges: ${glueCharges}`;
  healStatusEl.textContent = `HP: ${player.hp} / ${player.maxHp}`;

  const shieldBtn = document.querySelector('[data-shop="overshield"]');
  const glueBtn = document.querySelector('[data-shop="glue"]');
  const healBtn = document.querySelector('[data-shop="heal"]');

  if (shieldBtn) shieldBtn.disabled = hasOvershield || gold < 12;
  if (glueBtn) glueBtn.disabled = gold < 8;
  if (healBtn) healBtn.disabled = gold < 6 || player.hp >= player.maxHp;

  updateGlueButton();
}

function armGlue() {
  if (gameState !== "playing" || glueCharges <= 0 || glueArmed || ballStuck) return;

  glueCharges -= 1;
  glueArmed = true;
  updateGlueButton();
  updateShopUI();
}

function updateGlueButton() {
  glueButtonCount.textContent = glueCharges;
  glueButton.classList.toggle("armed", glueArmed);
  glueButton.classList.toggle("hidden", glueCharges <= 0 && !glueArmed);
  glueButton.disabled = gameState !== "playing" || glueCharges <= 0 || glueArmed;
}

function updatePlayer(dt) {
  let move = 0;

  if (keys["arrowleft"] || keys["a"]) move -= 1;
  if (keys["arrowright"] || keys["d"]) move += 1;

  if (pointerActive && gameState !== "upgrade" && gameState !== "shop") {
    const difference = pointerX - player.x;

    if (Math.abs(difference) > 10) {
      move = Math.max(-1, Math.min(1, difference / 120));
    }
  }

  player.velocityX = move * player.speed;
  player.x += player.velocityX * dt;

  const halfWidth = player.width / 2;
  player.x = Math.max(
    halfWidth + 30,
    Math.min(WORLD_WIDTH - halfWidth - 30, player.x)
  );

  if (Math.abs(player.velocityX) > 5) {
    player.facing = player.velocityX > 0 ? 1 : -1;
    player.runTimer += dt * Math.abs(player.velocityX) / 80;
  }

  if (player.invincibleTimer > 0) player.invincibleTimer -= dt;
  if (shieldShatterTimer > 0) shieldShatterTimer -= dt;

  if ((!ball.launched && gameState === "waiting") || ballStuck) {
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
    hurtPlayer();

    if (gameState !== "lost") {
      ball.launched = false;
      ball.vx = 0;
      ball.vy = 0;
      gameState = "waiting";
      messageEl.style.display = "block";
      messageEl.textContent = "BALL LOST — TAP TO LAUNCH";
    }

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

    ball.vx = Math.sin(angle) * ball.speed;
    ball.vy = -Math.cos(angle) * ball.speed;

    createParticles(ball.x, ball.y, 8, "#f7d98a");
  }
}

function checkBrickCollisions() {
  for (const brick of bricks) {
    if (!brick.alive) continue;

    if (
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    ) {
      damageBrick(brick);

      const overlapLeft = ball.x + ball.radius - brick.x;
      const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
      const overlapTop = ball.y + ball.radius - brick.y;
      const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapLeft || minOverlap === overlapRight) {
        ball.vx *= -1;
      } else {
        ball.vy *= -1;
      }

      break;
    }
  }
}

function damageBrick(brick) {
  brick.hp -= ball.damage;
  brick.hitFlash = 0.12;

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
      const reward = brick.shooter ? 5 : 3;
      gold += reward;
      createFloatingGold(brick.x + brick.width / 2, brick.y + brick.height / 2, reward);
    }

    createParticles(
      brick.x + brick.width / 2,
      brick.y + brick.height / 2,
      24,
      brick.isMob ? "#d8ff8a" : "#c2ad90"
    );

    checkVictory();
  }

  updateHUD();
}

function updateEnemyAttacks(dt) {
  if (gameState !== "playing") return;

  attackTimer -= dt;
  if (attackTimer > 0) return;

  attackTimer = 2.25;

  const shooters = bricks.filter(brick => brick.alive && brick.shooter);
  if (shooters.length === 0) return;

  const shooter = shooters[Math.floor(Math.random() * shooters.length)];

  enemyProjectiles.push({
    x: shooter.x + shooter.width / 2,
    y: shooter.y + shooter.height,
    radius: 13,
    vy: 380
  });
}

function updateProjectiles(dt) {
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const shot = enemyProjectiles[i];
    shot.y += shot.vy * dt;

    if (
      shot.x > player.x - player.width / 2 &&
      shot.x < player.x + player.width / 2 &&
      shot.y + shot.radius > player.y - player.height / 2 &&
      shot.y - shot.radius < player.y + player.height / 2
    ) {
      enemyProjectiles.splice(i, 1);
      hurtPlayer();
      continue;
    }

    if (shot.y > WORLD_HEIGHT + 50) {
      enemyProjectiles.splice(i, 1);
    }
  }
}

function hurtPlayer() {
  if (player.invincibleTimer > 0 || gameState === "lost") return;

  if (shieldReady) {
    shieldReady = false;
    shieldShatterTimer = 0.55;
    player.invincibleTimer = 0.45;
    createParticles(player.x, player.y, 34, "#76d5ff");
    updateHUD();
    return;
  }

  player.hp -= 1;
  player.invincibleTimer = 0.7;

  createParticles(player.x, player.y, 20, "#ff8b8b");
  updateHUD();

  if (player.hp <= 0) {
    player.hp = 0;
    gameState = "lost";
    ball.launched = false;
    messageEl.style.display = "block";
    messageEl.textContent = "DEFEATED — TAP TO START A NEW RUN";
  }
}

function checkVictory() {
  const mobsLeft = bricks.filter(brick => brick.alive && brick.isMob).length;

  if (mobsLeft === 0) {
    gameState = "upgrade";
    ball.launched = false;
    ballStuck = false;
    enemyProjectiles = [];
    messageEl.style.display = "none";
    updateUpgradeText();

    setTimeout(() => {
      if (gameState === "upgrade") {
        upgradeOverlay.classList.remove("hidden");
      }
    }, 350);
  }
}

function createParticles(x, y, count, color = "#f7d98a") {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 360,
      vy: (Math.random() - 0.5) * 360,
      life: 0.4 + Math.random() * 0.4,
      size: 4 + Math.random() * 7,
      color,
      text: null
    });
  }
}

function createFloatingGold(x, y, amount) {
  particles.push({
    x,
    y,
    vx: 0,
    vy: -70,
    life: 1.1,
    size: 22,
    color: "#f4d26f",
    text: `+${amount} 💰`
  });
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (!p.text) p.vy += 400 * dt;

    p.life -= dt;

    if (p.life <= 0) particles.splice(i, 1);
  }
}

function updateHUD() {
  heroHpEl.textContent = `❤️ ${player.hp} / ${player.maxHp}`;
  heroShieldEl.textContent = hasOvershield ? (shieldReady ? " 💙" : " ♡") : "";
  goldHudEl.textContent = `💰 ${gold}`;

  const mobsLeft = bricks.filter(brick => brick.alive && brick.isMob).length;
  enemyCountEl.textContent = mobsLeft;

  updateGlueButton();
}

function drawBackground() {
  // Simple atmospheric cave placeholder. Art pass comes later.
  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  gradient.addColorStop(0, "#161321");
  gradient.addColorStop(0.6, "#262031");
  gradient.addColorStop(1, "#121017");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // distant stone arches
  ctx.strokeStyle = "rgba(135, 116, 151, .12)";
  ctx.lineWidth = 18;
  for (let x = 120; x < WORLD_WIDTH; x += 220) {
    ctx.beginPath();
    ctx.arc(x, 540, 110, Math.PI, 0);
    ctx.lineTo(x + 110, 1000);
    ctx.stroke();
  }

  // torches
  for (const x of [70, WORLD_WIDTH - 70]) {
    ctx.fillStyle = "#5c4634";
    ctx.fillRect(x - 6, 360, 12, 90);

    ctx.fillStyle = "rgba(255, 166, 68, .12)";
    ctx.beginPath();
    ctx.arc(x, 345, 95, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff9f43";
    ctx.beginPath();
    ctx.arc(x, 345, 13, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#292532";
  ctx.fillRect(0, 110, 28, WORLD_HEIGHT);
  ctx.fillRect(WORLD_WIDTH - 28, 110, 28, WORLD_HEIGHT);
}

function drawRail() {
  const railY = player.y + 62;

  ctx.fillStyle = "#57515e";
  ctx.fillRect(35, railY, WORLD_WIDTH - 70, 16);

  ctx.fillStyle = "#8c8792";

  for (let x = 35; x < WORLD_WIDTH - 35; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, railY + 16);
    ctx.lineTo(x + 18, railY + 50);
    ctx.lineTo(x + 36, railY + 16);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPlayer() {
  ctx.save();

  if (
    player.invincibleTimer > 0 &&
    Math.floor(player.invincibleTimer * 15) % 2 === 0
  ) {
    ctx.globalAlpha = 0.45;
  }

  const x = player.x;
  const y = player.y;
  const wheelOffset = Math.max(55, player.width * 0.32);

  // Overshield bubble
  if (shieldReady || shieldShatterTimer > 0) {
    const alpha = shieldReady ? 0.85 : Math.max(0, shieldShatterTimer / 0.55);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#69d0ff";
    ctx.lineWidth = shieldReady ? 9 : 4;
    ctx.beginPath();
    ctx.ellipse(x, y - 20, player.width / 2 + 38, 95, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.12;
    ctx.fillStyle = "#69d0ff";
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#17151c";

  ctx.beginPath();
  ctx.arc(x - wheelOffset, y + 30, 23, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + wheelOffset, y + 30, 23, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#81798a";

  ctx.beginPath();
  ctx.arc(x - wheelOffset, y + 30, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + wheelOffset, y + 30, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#76523c";
  ctx.fillRect(x - player.width / 2, y - player.height / 2, player.width, player.height);

  ctx.fillStyle = "#b5814f";
  ctx.fillRect(x - player.width / 2, y - player.height / 2, player.width, 9);

  ctx.strokeStyle = "#c3b8a4";
  ctx.lineWidth = 6;
  ctx.strokeRect(x - player.width / 2, y - player.height / 2, player.width, player.height);

  drawDriver(x, y - 28);
  ctx.restore();
}

function drawDriver(x, y) {
  const runAmount = Math.sin(player.runTimer) * 12;
  const bodyY = y - 32;

  ctx.fillStyle = "#e1b58d";
  ctx.beginPath();
  ctx.arc(x, bodyY - 32, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#d7d9df";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(x, bodyY - 16);
  ctx.lineTo(x, bodyY + 18);
  ctx.stroke();

  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x, bodyY - 5);
  ctx.lineTo(x + 25 * player.facing, bodyY + 3);
  ctx.stroke();

  ctx.strokeStyle = "#6e86ad";
  ctx.lineWidth = 8;

  ctx.beginPath();
  ctx.moveTo(x, bodyY + 15);
  ctx.lineTo(x - runAmount, bodyY + 43);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, bodyY + 15);
  ctx.lineTo(x + runAmount, bodyY + 43);
  ctx.stroke();
}

function drawBall() {
  ctx.fillStyle = ballStuck ? "#ffe892" : "#f4e9c8";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = ballStuck ? "#f2c85c" : "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawBricks(dt) {
  for (const brick of bricks) {
    if (!brick.alive) continue;

    if (brick.hitFlash > 0) brick.hitFlash -= dt;

    const ratio = brick.hp / brick.maxHp;

    if (brick.hitFlash > 0) {
      ctx.fillStyle = "#ffffff";
    } else if (brick.isMob && brick.shooter) {
      ctx.fillStyle = "#9c453e";
    } else if (brick.isMob) {
      ctx.fillStyle = "#496447";
    } else if (brick.type === "H") {
      ctx.fillStyle = "#514b58";
    } else {
      ctx.fillStyle = "#5e5664";
    }

    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

    ctx.strokeStyle = brick.isMob ? "#a8c98d" : "#8e8495";
    ctx.lineWidth = 4;
    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

    if (brick.isMob) {
      // goblin face
      ctx.fillStyle = "#f2d46f";
      ctx.fillRect(brick.x + brick.width * 0.27, brick.y + 23, 10, 8);
      ctx.fillRect(brick.x + brick.width * 0.65, brick.y + 23, 10, 8);

      ctx.fillStyle = "#26311f";
      ctx.fillRect(brick.x + brick.width * 0.42, brick.y + 40, 20, 5);
    } else {
      // stone seams distinguish environment from mobs
      ctx.strokeStyle = "rgba(255,255,255,.12)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(brick.x + 12, brick.y + 18);
      ctx.lineTo(brick.x + brick.width - 12, brick.y + 18);
      ctx.moveTo(brick.x + brick.width / 2, brick.y + 18);
      ctx.lineTo(brick.x + brick.width / 2, brick.y + brick.height - 10);
      ctx.stroke();
    }

    if (brick.maxHp > 1) {
      ctx.fillStyle = "#251d26";
      ctx.fillRect(brick.x + 10, brick.y + brick.height - 14, brick.width - 20, 7);

      ctx.fillStyle = brick.isMob ? "#e45757" : "#bcae9b";
      ctx.fillRect(
        brick.x + 10,
        brick.y + brick.height - 14,
        (brick.width - 20) * ratio,
        7
      );
    }

    if (brick.shooter) {
      ctx.fillStyle = "#ffb56c";
      ctx.beginPath();
      ctx.arc(brick.x + brick.width / 2, brick.y + 12, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawProjectiles() {
  for (const shot of enemyProjectiles) {
    ctx.fillStyle = "#ff704d";
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd56d";
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, shot.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);

    if (p.text) {
      ctx.fillStyle = p.color;
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = "start";
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;

  updatePlayer(dt);

  if (gameState === "playing") {
    updateBall(dt);
    updateEnemyAttacks(dt);
    updateProjectiles(dt);
  }

  updateParticles(dt);

  drawBackground();
  drawBricks(dt);
  drawProjectiles();
  drawRail();
  drawPlayer();
  drawBall();
  drawParticles();

  requestAnimationFrame(gameLoop);
}

resetRun();
requestAnimationFrame(gameLoop);
