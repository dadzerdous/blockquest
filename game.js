const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const heroHpEl = document.getElementById("heroHp");
const enemyCountEl = document.getElementById("enemyCount");
const roomTitleEl = document.getElementById("roomTitle");
const messageEl = document.getElementById("message");
const upgradeOverlay = document.getElementById("upgradeOverlay");
const powerLevelEl = document.getElementById("powerLevel");
const widthLevelEl = document.getElementById("widthLevel");
const speedLevelEl = document.getElementById("speedLevel");

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 1400;

let gameState = "waiting";
let lastTime = 0;
let keys = {};
let pointerActive = false;
let pointerX = WORLD_WIDTH / 2;
let roomNumber = 1;

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
  runTimer: 0,

  // The player directly controls the runner on top of the trolley.
  // His position relative to the center pushes the trolley.
  driverOffset: 0,
  driverSpeed: 360,
  trolleyVelocity: 0,
  trolleyAcceleration: 1150,
  trolleyDrag: 3.2,
  trolleyMaxSpeed: 620
};

const ball = {
  x: player.x,
  y: player.y - 60,
  radius: 16,
  speed: 470,
  vx: 0,
  vy: 0,
  launched: false,
  damage: 1
};

let bricks = [];
let enemyProjectiles = [];
let particles = [];
let attackTimer = 0;

function buildRoom() {
  bricks = [];

  const startX = 120;
  const startY = 210;
  const brickWidth = 125;
  const brickHeight = 65;
  const gap = 12;
  const rows = 4;
  const cols = 5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let hp = 1;

      if (row === 1) hp = 2;
      if (row === 2 && col === 2) hp = 4;

      // Later rooms get a little tougher, but the layout stays familiar
      // so the effect of your chosen upgrade is easy to feel.
      if (roomNumber >= 3 && row === 3) hp += 1;

      bricks.push({
        x: startX + col * (brickWidth + gap),
        y: startY + row * (brickHeight + gap),
        width: brickWidth,
        height: brickHeight,
        hp,
        maxHp: hp,
        alive: true,
        shooter: row === 2 && col === 2,
        hitFlash: 0
      });
    }
  }

  roomTitleEl.textContent = `ROOM ${roomNumber} — GOBLIN OUTPOST`;
  updateHUD();
}

function resetRun() {
  roomNumber = 1;

  player.width = player.baseWidth;
  player.speed = player.baseSpeed;
  player.hp = player.maxHp;
  player.x = WORLD_WIDTH / 2;
  player.driverOffset = 0;
  player.trolleyVelocity = 0;

  ball.damage = 1;
  ball.launched = false;
  ball.vx = 0;
  ball.vy = 0;

  enemyProjectiles = [];
  particles = [];
  attackTimer = 0;

  upgradeOverlay.classList.add("hidden");

  startRoom();
}

function startRoom() {
  player.x = WORLD_WIDTH / 2;

  ball.launched = false;
  ball.vx = 0;
  ball.vy = 0;
  ball.x = player.x;
  ball.y = player.y - 58;

  enemyProjectiles = [];
  attackTimer = 0;

  gameState = "waiting";

  buildRoom();
  updateUpgradeText();

  messageEl.style.display = "block";
  messageEl.textContent = "TAP / CLICK TO LAUNCH";
}

function launchBall() {
  if (gameState === "lost") {
    resetRun();
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
});

window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener("pointerdown", event => {
  if (gameState === "upgrade") return;

  pointerActive = true;
  setPointerPosition(event);

  if (gameState === "lost") {
    resetRun();
    return;
  }

  if (!ball.launched) launchBall();
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
  const normalized = (event.clientX - rect.left) / rect.width;
  pointerX = normalized * WORLD_WIDTH;
}

document.querySelectorAll(".upgradeCard").forEach(button => {
  button.addEventListener("click", () => {
    chooseUpgrade(button.dataset.upgrade);
  });
});

function chooseUpgrade(type) {
  if (gameState !== "upgrade") return;

  if (type === "power") {
    ball.damage += 1;
  }

  if (type === "width") {
    player.width = Math.min(400, player.width * 1.15);
  }

  if (type === "speed") {
    player.speed = Math.min(1100, player.speed * 1.15);
    player.trolleyMaxSpeed = Math.min(1100, player.trolleyMaxSpeed * 1.15);
    player.driverSpeed = Math.min(700, player.driverSpeed * 1.08);
  }

  roomNumber += 1;
  upgradeOverlay.classList.add("hidden");
  updateUpgradeText();
  startRoom();
}

function updateUpgradeText() {
  powerLevelEl.textContent = `Damage: ${ball.damage}`;
  widthLevelEl.textContent = `Width: ${Math.round(player.width)}`;
  speedLevelEl.textContent = `Speed: ${Math.round(player.speed)}`;
}

function updatePlayer(dt) {
  let move = 0;

  if (keys["arrowleft"] || keys["a"]) move -= 1;
  if (keys["arrowright"] || keys["d"]) move += 1;

  // Touch/mouse dragging controls where the runner tries to stand
  // on the trolley, not the trolley directly.
  if (pointerActive && gameState !== "upgrade") {
    const desiredOffset = pointerX - player.x;
    const maxDriverOffset = Math.max(28, player.width / 2 - 24);
    const clampedDesired = Math.max(
      -maxDriverOffset,
      Math.min(maxDriverOffset, desiredOffset)
    );

    const diff = clampedDesired - player.driverOffset;

    if (Math.abs(diff) > 5) {
      move = Math.max(-1, Math.min(1, diff / 45));
    }
  }

  const maxDriverOffset = Math.max(28, player.width / 2 - 24);

  player.driverOffset += move * player.driverSpeed * dt;
  player.driverOffset = Math.max(
    -maxDriverOffset,
    Math.min(maxDriverOffset, player.driverOffset)
  );

  // The farther the runner is from center, the harder he pushes the trolley.
  const push = maxDriverOffset > 0
    ? player.driverOffset / maxDriverOffset
    : 0;

  player.trolleyVelocity += push * player.trolleyAcceleration * dt;

  // Natural rolling resistance keeps the trolley controllable.
  player.trolleyVelocity *= Math.exp(-player.trolleyDrag * dt);

  const effectiveMaxSpeed = Math.min(
    player.trolleyMaxSpeed,
    player.speed
  );

  player.trolleyVelocity = Math.max(
    -effectiveMaxSpeed,
    Math.min(effectiveMaxSpeed, player.trolleyVelocity)
  );

  player.velocityX = player.trolleyVelocity;
  player.x += player.trolleyVelocity * dt;

  const halfWidth = player.width / 2;
  const minX = halfWidth + 30;
  const maxX = WORLD_WIDTH - halfWidth - 30;

  if (player.x < minX) {
    player.x = minX;
    if (player.trolleyVelocity < 0) player.trolleyVelocity = 0;
  }

  if (player.x > maxX) {
    player.x = maxX;
    if (player.trolleyVelocity > 0) player.trolleyVelocity = 0;
  }

  if (Math.abs(move) > 0.02) {
    player.facing = move > 0 ? 1 : -1;
    player.runTimer += dt * (5 + Math.abs(move) * 8);
  }

  if (player.invincibleTimer > 0) {
    player.invincibleTimer -= dt;
  }

  if (!ball.launched && gameState === "waiting") {
    ball.x = player.x;
    ball.y = player.y - 58;
  }
}

function updateBall(dt) {
  if (!ball.launched || gameState !== "playing") return;

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

    const relativeHit = (ball.x - player.x) / (player.width / 2);
    const maxAngle = Math.PI * 0.38;
    const angle = relativeHit * maxAngle;

    ball.vx = Math.sin(angle) * ball.speed;
    ball.vy = -Math.cos(angle) * ball.speed;

    createParticles(ball.x, ball.y, 8);
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

      const minOverlap = Math.min(
        overlapLeft,
        overlapRight,
        overlapTop,
        overlapBottom
      );

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
    10
  );

  if (brick.hp <= 0) {
    brick.hp = 0;
    brick.alive = false;

    createParticles(
      brick.x + brick.width / 2,
      brick.y + brick.height / 2,
      24
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

  player.hp -= 1;
  player.invincibleTimer = 0.7;

  createParticles(player.x, player.y, 20);
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
  const enemiesLeft = bricks.filter(brick => brick.alive).length;

  if (enemiesLeft === 0) {
    gameState = "upgrade";
    ball.launched = false;
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

function createParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 360,
      vy: (Math.random() - 0.5) * 360,
      life: 0.4 + Math.random() * 0.4,
      size: 4 + Math.random() * 7
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 400 * dt;
    p.life -= dt;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function updateHUD() {
  heroHpEl.textContent = `❤️ ${player.hp} / ${player.maxHp}`;
  enemyCountEl.textContent = bricks.filter(brick => brick.alive).length;
}

function drawBackground() {
  ctx.fillStyle = "#1c1926";
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 3;

  for (let y = 150; y < 1150; y += 90) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_WIDTH, y);
    ctx.stroke();
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
    ctx.globalAlpha = 0.35;
  }

  const x = player.x;
  const y = player.y;
  const wheelOffset = Math.max(55, player.width * 0.32);

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
  ctx.fillRect(
    x - player.width / 2,
    y - player.height / 2,
    player.width,
    player.height
  );

  ctx.fillStyle = "#b5814f";
  ctx.fillRect(
    x - player.width / 2,
    y - player.height / 2,
    player.width,
    9
  );

  ctx.strokeStyle = "#c3b8a4";
  ctx.lineWidth = 6;
  ctx.strokeRect(
    x - player.width / 2,
    y - player.height / 2,
    player.width,
    player.height
  );

  drawDriver(x + player.driverOffset, y - 28);
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
  ctx.fillStyle = "#f4e9c8";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawBricks(dt) {
  for (const brick of bricks) {
    if (!brick.alive) continue;

    if (brick.hitFlash > 0) brick.hitFlash -= dt;

    const ratio = brick.hp / brick.maxHp;

    if (brick.shooter) {
      ctx.fillStyle = brick.hitFlash > 0 ? "#ffffff" : "#9c453e";
    } else if (brick.maxHp >= 2) {
      ctx.fillStyle = brick.hitFlash > 0 ? "#ffffff" : "#66506e";
    } else {
      ctx.fillStyle = brick.hitFlash > 0 ? "#ffffff" : "#496447";
    }

    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

    ctx.strokeStyle = "#bcb3c0";
    ctx.lineWidth = 4;
    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

    ctx.fillStyle = "#f2d46f";
    ctx.fillRect(brick.x + brick.width * 0.27, brick.y + 23, 10, 8);
    ctx.fillRect(brick.x + brick.width * 0.65, brick.y + 23, 10, 8);

    if (brick.maxHp > 1) {
      ctx.fillStyle = "#251d26";
      ctx.fillRect(
        brick.x + 10,
        brick.y + brick.height - 14,
        brick.width - 20,
        7
      );

      ctx.fillStyle = "#e45757";
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
      ctx.arc(
        brick.x + brick.width / 2,
        brick.y + 12,
        7,
        0,
        Math.PI * 2
      );
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
  ctx.fillStyle = "#f7d98a";

  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  ctx.globalAlpha = 1;
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
